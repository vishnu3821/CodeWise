const db = require('../config/db');

// Helper to update subtopic status
const updateSubtopicStatus = async (user_id, subtopic_id) => {
    // Check if all questions in subtopic are passed
    const [questions] = await db.query('SELECT id FROM questions WHERE subtopic_id = ?', [subtopic_id]);
    const [passedQuestions] = await db.query(
        'SELECT question_id FROM user_question_status WHERE user_id = ? AND status = "Passed" AND question_id IN (SELECT id FROM questions WHERE subtopic_id = ?)',
        [user_id, subtopic_id]
    );

    if (questions.length > 0 && questions.length === passedQuestions.length) {
        await db.query(
            'INSERT IGNORE INTO user_subtopic_status (user_id, subtopic_id, status) VALUES (?, ?, "Completed")',
            [user_id, subtopic_id]
        );
        return true; // Status changed to completed (or already was)
    }
    return false;
};

// Helper to update topic status
const updateTopicStatus = async (user_id, topic_id) => {
    // Check if all subtopics in topic are completed
    const [subtopics] = await db.query('SELECT id FROM subtopics WHERE topic_id = ?', [topic_id]);

    // If topic has no subtopics (direct questions), we might need different logic, 
    // but current schema assumes subtopics exist or questions are linked to subtopics.
    // Based on previous restructuring, all topics now have subtopics (even if 1).

    const [completedSubtopics] = await db.query(
        'SELECT subtopic_id FROM user_subtopic_status WHERE user_id = ? AND status = "Completed" AND subtopic_id IN (SELECT id FROM subtopics WHERE topic_id = ?)',
        [user_id, topic_id]
    );

    if (subtopics.length > 0 && subtopics.length === completedSubtopics.length) {
        await db.query(
            'INSERT IGNORE INTO user_topic_status (user_id, topic_id, status) VALUES (?, ?, "Completed")',
            [user_id, topic_id]
        );
    }
};

exports.checkProgressCascade = async (user_id, question_id) => {
    try {
        // 1. Get subtopic and topic for the question
        const [rows] = await db.query(
            `SELECT s.id as subtopic_id, t.id as topic_id 
             FROM questions q 
             JOIN subtopics s ON q.subtopic_id = s.id 
             JOIN topics t ON s.topic_id = t.id 
             WHERE q.id = ?`,
            [question_id]
        );

        if (rows.length === 0) return;

        const { subtopic_id, topic_id } = rows[0];

        // 2. Check and update subtopic status
        const subtopicCompleted = await updateSubtopicStatus(user_id, subtopic_id);

        // 3. If subtopic completed (or check anyway), check and update topic status
        if (subtopicCompleted) {
            await updateTopicStatus(user_id, topic_id);
        }

    } catch (error) {
        console.error('Error in progress cascade:', error);
    }
};

exports.getUserProfile = async (req, res) => {
    const user_id = req.user.id; // Assumes simple auth middleware sets req.user

    try {
        // User Details
        const [userRows] = await db.query('SELECT id, name, email, created_at, last_active FROM users WHERE id = ?', [user_id]);
        if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = userRows[0];

        // Stats
        const [solvedRows] = await db.query('SELECT COUNT(*) as count FROM user_question_status WHERE user_id = ? AND status = "Passed"', [user_id]);
        const solved_count = solvedRows[0].count;

        const [topicsCompletedRows] = await db.query('SELECT COUNT(*) as count FROM user_topic_status WHERE user_id = ? AND status = "Completed"', [user_id]);
        const topics_completed = topicsCompletedRows[0].count;

        // Overall C Completion % (approximation based on questions)
        // Total C Questions
        const [totalQuestionsRows] = await db.query(
            `SELECT COUNT(*) as count FROM questions q 
             JOIN subtopics s ON q.subtopic_id = s.id 
             JOIN topics t ON s.topic_id = t.id 
             JOIN languages l ON t.language_id = l.id 
             WHERE l.slug = 'c'`
        );
        const total_questions = totalQuestionsRows[0].count;

        // Passed C Questions
        const [passedCQuestionsRows] = await db.query(
            `SELECT COUNT(*) as count FROM user_question_status uqs
             JOIN questions q ON uqs.question_id = q.id
             JOIN subtopics s ON q.subtopic_id = s.id 
             JOIN topics t ON s.topic_id = t.id 
             JOIN languages l ON t.language_id = l.id 
             WHERE uqs.user_id = ? AND uqs.status = 'Passed' AND l.slug = 'c'`,
            [user_id]
        );
        const passed_c_questions = passedCQuestionsRows[0].count;

        const c_completion_percentage = total_questions > 0 ? Math.round((passed_c_questions / total_questions) * 100) : 0;

        res.json({
            user,
            stats: {
                solved_questions: solved_count,
                completed_topics: topics_completed,
                c_completion_percentage
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProgressSummary = async (req, res) => {
    // Lightweight version for dashboard widgets
    const user_id = req.user.id;
    try {
        const [solvedRows] = await db.query('SELECT COUNT(*) as count FROM user_question_status WHERE user_id = ? AND status = "Passed"', [user_id]);
        const [topicsRows] = await db.query('SELECT COUNT(*) as count FROM user_topic_status WHERE user_id = ? AND status = "Completed"', [user_id]);

        res.json({
            solved_count: solvedRows[0].count,
            topics_completed: topicsRows[0].count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
