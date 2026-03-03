const db = require('../config/db');

exports.getAllLanguages = async (req, res) => {
    try {
        const [languages] = await db.query('SELECT id, name, slug, description, has_practice, has_notes FROM languages WHERE is_active = TRUE');
        res.status(200).json(languages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTopicsByLanguage = async (req, res) => {
    try {
        const { slug } = req.params;

        // First verify language exists
        const [lang] = await db.query('SELECT id, name FROM languages WHERE slug = ? AND is_active = TRUE', [slug]);

        if (lang.length === 0) {
            return res.status(404).json({ message: 'Language not found' });
        }

        const languageId = lang[0].id;
        const languageName = lang[0].name;

        // Fetch topics
        const [topics] = await db.query(
            'SELECT id, name, slug, order_index FROM topics WHERE language_id = ? AND is_active = TRUE ORDER BY order_index ASC',
            [languageId]
        );

        const userId = req.user.id;

        // Fetch user progress for all topics
        // We need to know if a topic is "completed".
        // Topic is completed if:
        // 1. It has subtopics -> All subtopics are completed (100% questions passed)
        // 2. It has NO subtopics -> All direct questions are passed.

        const topicsWithProgress = await Promise.all(topics.map(async (topic) => {
            // Count total and completed questions for this topic (direct + subtopic)
            // But requirement is: module (topic) completed if submodules (subtopics) are 100%

            // 1. Get Subtopics
            const [subtopics] = await db.query(`
                SELECT id 
                FROM subtopics 
                WHERE topic_id = ? 
                ORDER BY order_index
            `, [topic.id]);

            let isCompleted = false;
            let totalQuestions = 0;
            let completedQuestions = 0;

            if (subtopics.length > 0) {
                // Topic has subtopics. Check if ALL subtopics are 100% complete.
                let allSubtopicsComplete = true;

                for (const sub of subtopics) {
                    // Check subtopic progress
                    const [qStats] = await db.query(`
                        SELECT 
                            COUNT(*) as total,
                            (SELECT COUNT(*) 
                             FROM questions q2 
                             JOIN user_question_status uqs ON q2.id = uqs.question_id 
                             WHERE q2.subtopic_id = ? 
                               AND uqs.user_id = ? 
                               AND uqs.status = 'Passed'
                            ) as completed
                        FROM questions q 
                        WHERE q.subtopic_id = ? AND q.is_active = TRUE
                    `, [sub.id, userId, sub.id]);

                    const stTotal = qStats[0].total;
                    const stCompleted = qStats[0].completed;

                    totalQuestions += stTotal;
                    completedQuestions += stCompleted;

                    if (stTotal === 0 || stCompleted < stTotal) {
                        allSubtopicsComplete = false;
                    }
                }
                isCompleted = allSubtopicsComplete;
            } else {
                // Topic has NO subtopics (Direct questions)
                const [qStats] = await db.query(`
                    SELECT 
                        COUNT(*) as total,
                        (SELECT COUNT(*) 
                         FROM questions q2 
                         JOIN user_question_status uqs ON q2.id = uqs.question_id 
                         WHERE q2.topic_id = ? 
                           AND uqs.user_id = ? 
                           AND uqs.status = 'Passed'
                        ) as completed
                    FROM questions q 
                    WHERE q.topic_id = ? AND q.is_active = TRUE
                `, [topic.id, userId, topic.id]);

                totalQuestions = qStats[0].total;
                completedQuestions = qStats[0].completed;

                isCompleted = (totalQuestions > 0 && completedQuestions === totalQuestions);
            }

            return {
                ...topic,
                is_completed: isCompleted,
                progress: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0
            };
        }));

        res.status(200).json({
            language: languageName,
            topics: topicsWithProgress
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
