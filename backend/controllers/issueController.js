const db = require('../config/db');

// Create new issue
exports.createIssue = async (req, res) => {
    try {
        const { description, screenshot_url, page_url } = req.body;
        const userId = req.user.id; // From token

        if (!description || !screenshot_url) {
            return res.status(400).json({ message: 'Description and Screenshot are required' });
        }

        // Fetch user name since it might not be in the token
        const [users] = await db.query('SELECT name FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const userName = user.name;
        const userEmail = req.user.email;
        const userRole = req.user.role;

        const [result] = await db.query(
            `INSERT INTO reported_issues 
            (description, screenshot_url, reported_by_user_id, reported_by_name, reported_by_email, reported_by_role, page_url, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW')`,
            [description, screenshot_url, userId, userName, userEmail, userRole, page_url || '']
        );

        res.status(201).json({ message: 'Issue reported successfully', issueId: result.insertId });
    } catch (err) {
        console.error('Create Issue Error:', err);
        res.status(500).json({ message: 'Failed to report issue' });
    }
};

// Get issues (Admin sees all, others see own)
exports.getIssues = async (req, res) => {
    try {
        const user = req.user;
        let query = 'SELECT * FROM reported_issues ORDER BY created_at DESC';
        let params = [];

        if (user.role !== 'admin') {
            query = 'SELECT * FROM reported_issues WHERE reported_by_user_id = ? ORDER BY created_at DESC';
            params = [user.id];
        }

        const [issues] = await db.query(query, params);
        res.json(issues);
    } catch (err) {
        console.error('Get Issues Error:', err);
        res.status(500).json({ message: 'Failed to fetch issues' });
    }
};

// Get single issue
exports.getIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const [issues] = await db.query('SELECT * FROM reported_issues WHERE id = ?', [id]);
        if (issues.length === 0) return res.status(404).json({ message: 'Issue not found' });

        const issue = issues[0];

        // Access Check
        if (user.role !== 'admin' && issue.reported_by_user_id !== user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(issue);
    } catch (err) {
        console.error('Get Issue Error:', err);
        res.status(500).json({ message: 'Failed to fetch issue' });
    }
};

// Update status (Admin only)
exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['NEW', 'IN_REVIEW', 'RESOLVED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.query('UPDATE reported_issues SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        console.error('Update Status Error:', err);
        res.status(500).json({ message: 'Failed to update status' });
    }
};
