const db = require('./config/db');

async function simulateProgress() {
    try {
        const userId = 1; // Assuming user ID 1 exists
        const languageSlug = 'cpp';
        const topicSlug = 'input-and-output';

        // 1. Get Topic ID
        const [topics] = await db.query('SELECT id FROM topics WHERE slug = ?', [topicSlug]);
        if (topics.length === 0) {
            console.log('Topic not found');
            process.exit(1);
        }
        const topicId = topics[0].id;
        console.log(`Topic ID: ${topicId}`);

        // 2. Clear existing progress for this topic's questions
        // Get all questions for this topic (direct or via subtopics)
        const [questions] = await db.query(`
            SELECT id FROM questions 
            WHERE topic_id = ? OR subtopic_id IN (SELECT id FROM subtopics WHERE topic_id = ?)
        `, [topicId, topicId]);

        if (questions.length === 0) {
            console.log('No questions found for this topic.');
            process.exit(0);
        }

        const questionIds = questions.map(q => q.id);
        if (questionIds.length > 0) {
            await db.query(`DELETE FROM user_question_status WHERE user_id = ? AND question_id IN (?)`, [userId, questionIds]);
            console.log('Cleared existing progress.');
        }

        // 3. Mark all as PASSED
        for (const qId of questionIds) {
            await db.query(`
                INSERT INTO user_question_status (user_id, question_id, status)
                VALUES (?, ?, 'Passed')
            `, [userId, qId]);
        }

        console.log(`Marked ${questionIds.length} questions as Passed for User ${userId}.`);
        console.log('Now check the UI for "Completed" badge.');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

simulateProgress();
