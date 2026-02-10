const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token') || (req.header('Authorization') && req.header('Authorization').replace('Bearer ', ''));

    // Check if not token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token (using the secret from authController or env)
        const secret = process.env.JWT_SECRET || 'codewise_secret_key_123';
        const decoded = jwt.verify(token, secret);

        // Optional: Check if user is still active in DB (more secure but slower)
        // For now, let's assume if they have a valid token, they are okay, 
        // BUT if we just suspended them, their old token might still work until expiry.
        // To strictly enforce suspension, we should check DB or include is_active in token.
        // Better: Fetch minimal user info to check status.

        req.user = decoded;

        // We can do a quick DB check here if performance allows, 
        // OR rely on the frontend to handle 'Suspended' state based on an API response.
        // Given the requirement "block suspended", let's do a DB check for critical actions 
        // or just let a specific middleware handle it. 
        // For simplicity and immediate effect, let's check DB here.

        const db = require('../config/db');
        const [users] = await db.query('SELECT is_active, role FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        if (users[0].is_active === 0) {
            return res.status(403).json({ message: 'Account suspended' });
        }

        // Update role in request in case it changed
        req.user.role = users[0].role;

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
