const db = require('../config/db');

exports.getSubtopicsByTopic = async (req, res) => {
    try {
        const { slug } = req.params;
        const { language } = req.query;

        let query = 'SELECT t.id, t.name FROM topics t';
        let params = [];

        if (language) {
            query += ' JOIN languages l ON t.language_id = l.id WHERE t.slug = ? AND l.slug = ?';
            params = [slug, language];
        } else {
            query += ' WHERE t.slug = ?';
            params = [slug];
        }

        const [topics] = await db.query(query, params);

        if (topics.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const topic = topics[0];
        const userId = req.user ? req.user.id : null;

        // Fetch subtopics with question counts and user progress
        const [subtopics] = await db.query(
            `SELECT 
                s.id, 
                s.name,
                s.order_index,
                (SELECT COUNT(*) FROM questions q WHERE q.subtopic_id = s.id AND q.is_active = TRUE) as total_questions,
                (SELECT COUNT(*) 
                 FROM questions q 
                 JOIN user_question_status uqs ON q.id = uqs.question_id 
                 WHERE q.subtopic_id = s.id 
                   AND uqs.user_id = ? 
                   AND uqs.status = 'Passed'
                ) as completed_questions
            FROM subtopics s 
            WHERE s.topic_id = ? 
            ORDER BY s.order_index ASC`,
            [userId || 0, topic.id]
        );

        res.json({
            topic: topic.name,
            subtopics: subtopics
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
