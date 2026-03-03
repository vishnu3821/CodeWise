const db = require('../config/db');

exports.getRecentlySolved = async (req, res) => {
    try {
        const userId = req.user.id;

        // Query last 5 successful submissions
        // We join with questions table to get title and difficulty
        const query = `
            SELECT 
                s.id as submission_id, 
                q.id as problem_id, 
                q.title, 
                s.language, 
                q.difficulty, 
                s.created_at as solved_at, 
                s.code,
                t.slug as topic_slug,
                q.subtopic_id
            FROM submissions s
            JOIN questions q ON s.question_id = q.id
            JOIN topics t ON q.topic_id = t.id
            WHERE s.user_id = ? AND s.status = 'Passed'
            ORDER BY s.created_at DESC
            LIMIT 5
        `;

        const [rows] = await db.query(query, [userId]);

        res.json(rows);

    } catch (error) {
        console.error('Error fetching recently solved:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                action, 
                target_type, 
                target_id, 
                details, 
                created_at
            FROM audit_logs
            WHERE admin_id = ?
            ORDER BY created_at DESC
            LIMIT 5
        `;

        const [rows] = await db.query(query, [userId]);
        res.json(rows);

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
