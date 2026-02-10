const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Restored
const { OAuth2Client } = require('google-auth-library'); // Restored
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



// ... (existing imports)

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (email_verified defaults to FALSE)
        await db.query(
            'INSERT INTO users (name, email, password_hash, email_verified) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, false]
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // If user has no password hash (e.g. Google Auth only), they cannot login with password
        if (!user.password_hash) {
            return res.status(400).json({ message: 'Invalid credentials. Try logging in with Google.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Login success
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'codewise_secret_key_123', { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_picture: user.profile_picture,
                email_verified: user.email_verified,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // New User - Auto verify Google email
            const [result] = await db.query(
                'INSERT INTO users (name, email, google_id, auth_provider, profile_picture, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, googleId, 'google', picture, true]
            );
            user = { id: result.insertId, name, email, profile_picture: picture, email_verified: true };
        } else {
            user = users[0];
            if (!user.google_id) {
                await db.query('UPDATE users SET google_id = ?, auth_provider = ?, profile_picture = ?, email_verified = ? WHERE id = ?',
                    [googleId, 'google', picture, true, user.id] // Auto verify on Google link
                );
            }
            user.email_verified = true; // Ensure returned user has verified status
        }

        const jwtToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'codewise_secret_key_123', { expiresIn: '1d' });
        res.status(200).json({
            message: 'Login successful',
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile_picture: user.profile_picture || picture,
                email_verified: true,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        console.error('GOOGLE_CLIENT_ID configured:', !!process.env.GOOGLE_CLIENT_ID);
        res.status(500).json({ message: 'Google Sign-In failed', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.json({ message: 'If this email exists, a reset link has been sent.' });
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
            [resetToken, resetTokenExpiry, user.id]
        );

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"CodeWise Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset your CodeWise password',
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested a password reset. Please click the link below to verify your email and set a new password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        });

        console.log(`[INFO] Reset email sent to ${email}`);
        res.json({ message: 'If this email exists, a reset link has been sent.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const [users] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: 'Reset link expired or invalid.' });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
        );

        res.json({ message: 'Password updated successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const sendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = users[0];

        if (user.email_verified) return res.status(400).json({ message: 'Email already verified' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.query('UPDATE users SET email_verification_token = ?, email_verification_expiry = ? WHERE id = ?', [token, expiry, user.id]);

        const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"CodeWise Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your CodeWise email',
            html: `
                <h3>Welcome to CodeWise!</h3>
                <p>Click the link below to verify your email address:</p>
                <p><a href="${verificationLink}">Verify Email</a></p>
                <p>This link expires in 24 hours.</p>
            `
        });

        res.json({ message: 'Verification email sent' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expiry > NOW()', [token]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid or expired token' });

        const user = users[0];
        await db.query('UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expiry = NULL WHERE id = ?', [user.id]);

        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    signup: exports.signup,
    login,
    googleLogin: exports.googleLogin,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail
};
