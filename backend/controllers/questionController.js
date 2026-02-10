const db = require('../config/db');

exports.getQuestionsBySubtopic = async (req, res) => {
    try {
        const { subtopicId } = req.params;

        // Verify subtopic exists
        const [subtopics] = await db.query('SELECT id, name FROM subtopics WHERE id = ?', [subtopicId]);
        if (subtopics.length === 0) {
            return res.status(404).json({ message: 'Subtopic not found' });
        }
        const subtopic = subtopics[0];

        // Fetch questions
        const [questions] = await db.query(
            'SELECT id, title, description, difficulty FROM questions WHERE subtopic_id = ? ORDER BY id ASC',
            [subtopicId]
        );

        res.json({
            subtopic: subtopic.name,
            questions: questions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getQuestionsByTopic = async (req, res) => {
    try {
        const { topicSlug } = req.params;
        const { language } = req.query;

        let query = 'SELECT t.id, t.name FROM topics t';
        let params = [];

        if (language) {
            query += ' JOIN languages l ON t.language_id = l.id WHERE t.slug = ? AND l.slug = ?';
            params = [topicSlug, language];
        } else {
            query += ' WHERE t.slug = ?';
            params = [topicSlug];
        }

        const [topic] = await db.query(query, params);

        if (topic.length === 0) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        const topicId = topic[0].id;
        const topicName = topic[0].name;

        const [questions] = await db.query(
            'SELECT id, title, difficulty FROM questions WHERE topic_id = ? AND is_active = TRUE',
            [topicId]
        );

        res.status(200).json({
            topic: topicName,
            questions: questions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const [questions] = await db.query(
            'SELECT * FROM questions WHERE id = ? AND is_active = TRUE',
            [id]
        );

        if (questions.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const question = questions[0];

        // Fetch PUBLIC test cases (is_hidden = 0) or legacy Sample cases
        const [testCases] = await db.query(
            'SELECT input, expected_output FROM test_cases WHERE question_id = ? AND (is_hidden = 0 OR is_sample = 1)',
            [id]
        );

        res.status(200).json({
            ...question,
            testCases: testCases
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.saveCodeDraft = async (req, res) => {
    try {
        const { id: questionId } = req.params;
        const { userId, language, code } = req.body;

        if (!userId || !language) {
            return res.status(400).json({ message: 'Missing user ID or language' });
        }

        await db.query(
            `INSERT INTO code_drafts (user_id, question_id, language, code)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE code = ?, updated_at = NOW()`,
            [userId, questionId, language, code, code]
        );

        res.status(200).json({ message: 'Draft saved successfully', updatedAt: new Date() });
    } catch (error) {
        console.error('Error saving draft:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCodeDraft = async (req, res) => {
    try {
        const { id: questionId } = req.params;
        const { userId, language } = req.query;

        if (!userId || !language) {
            return res.status(400).json({ message: 'Missing user ID or language' });
        }

        const [drafts] = await db.query(
            'SELECT code FROM code_drafts WHERE user_id = ? AND question_id = ? AND language = ?',
            [userId, questionId, language]
        );

        if (drafts.length > 0) {
            res.status(200).json({ code: drafts[0].code });
        } else {
            res.status(200).json({ code: null });
        }
    } catch (error) {
        console.error('Error fetching draft:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

