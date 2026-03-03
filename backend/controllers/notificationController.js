const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Server error marking notification' });
    }
};

exports.markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    try {
        await db.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [userId]
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createPushNotification = async (req, res) => {
    const { title, message, target_role } = req.body;
    const adminRole = req.user.role;

    if (adminRole !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized. Only admins can send push notifications.' });
    }

    if (!title || !message || !target_role) {
        return res.status(400).json({ message: 'Title, message, and target audience are required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let userQuery = 'SELECT id, role FROM users WHERE is_active = TRUE';
        let queryParams = [];

        if (target_role !== 'all') {
            userQuery += ' AND role = ?';
            queryParams.push(target_role); // 'student' or 'content_manager'
        } else {
            userQuery += ' AND role IN ("student", "content_manager")';
        }

        const [users] = await connection.query(userQuery, queryParams);

        if (users.length > 0) {
            // Prepare batch insert values: (title, message, sender_role, target_role, user_id, is_broadcast)
            const values = users.map(u => [
                title,
                message,
                'admin',
                target_role,
                u.id,
                1 // is_broadcast
            ]);

            await connection.query(
                'INSERT INTO notifications (title, message, sender_role, target_role, user_id, is_broadcast) VALUES ?',
                [values]
            );

            // Log admin action
            await connection.query(
                'INSERT INTO audit_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, 'send_push_notification', 'notification', null, JSON.stringify({ title, target_role, userCount: users.length })]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: `Notification sent to ${users.length} users.` });
    } catch (err) {
        await connection.rollback();
        console.error('Error creating push notification:', err);
        res.status(500).json({ message: 'Server error creating push notification' });
    } finally {
        connection.release();
    }
};
