const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getCompletedQuestions = async (req, res) => {
    try {
        const { userId } = req.params;

        const [results] = await db.query(
            'SELECT question_id FROM user_question_status WHERE user_id = ? AND status = "Passed"',
            [userId]
        );

        const questionIds = results.map(row => row.question_id);

        res.status(200).json(questionIds);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware
        const { name } = req.body;
        let profilePictureUrl = null;

        if (req.file) {
            // Assuming server runs on localhost:5001 - In prod, use env var for BASE_URL
            const protocol = req.protocol;
            const host = req.get('host');
            profilePictureUrl = `${protocol}://${host}/uploads/profiles/${req.file.filename}`;
        }

        // Build query dynamically
        let query = 'UPDATE users SET name = ?';
        let params = [name];

        if (profilePictureUrl) {
            query += ', profile_picture = ?';
            params.push(profilePictureUrl);
        }

        query += ' WHERE id = ?';
        params.push(userId);

        await db.query(query, params);

        // Fetch updated user
        const [users] = await db.query('SELECT id, name, email, profile_picture, email_verified FROM users WHERE id = ?', [userId]);

        res.json({
            message: 'Profile updated successfully',
            user: users[0]
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        // Get user and password hash
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Verify current password
        // Note: Google auth users might not have a password. 
        // Logic: If user has no password, they should use 'Forgot Password' or we allow setting it if null?
        // Requirement says "Current Password" input, implying they must know it.
        // If current password matches hash: ok.

        if (!user.password) {
            return res.status(400).json({ message: 'You logged in via a third party. Please set a password first via Reset Password.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT 
                u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.last_active, u.profile_picture,
                (SELECT COUNT(*) FROM user_question_status WHERE user_id = u.id AND status = 'Passed') as solved_count
            FROM users u
            WHERE u.role = 'student'
            ORDER BY u.created_at DESC
        `);
        res.status(200).json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.query('SELECT id, name, email, role, is_active, created_at, last_active, profile_picture FROM users WHERE id = ?', [id]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Toggle user status (Suspend/Activate)
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Get current status
        const [users] = await db.query('SELECT is_active FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const currentStatus = users[0].is_active;
        const newStatus = !currentStatus;

        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

        res.status(200).json({
            message: `User ${newStatus ? 'activated' : 'suspended'} successfully`,
            is_active: newStatus
        });
    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
