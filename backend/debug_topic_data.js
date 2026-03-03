const db = require('./config/db');

async function checkQuestionTopics() {
    try {
        console.log("Checking questions with missing topic_id...");

        // 1. Check questions with NULL topic_id
        const [noTopicQuestions] = await db.query(`
            SELECT id, title, subtopic_id, topic_id 
            FROM questions 
            WHERE topic_id IS NULL
        `);

        if (noTopicQuestions.length > 0) {
            console.log(`Found ${noTopicQuestions.length} questions with NULL topic_id:`);
            noTopicQuestions.forEach(q => {
                console.log(`- QID: ${q.id}, Title: ${q.title}, SubtopicID: ${q.subtopic_id}`);
            });

            // Check if we can derive topic from subtopic
            console.log("\nChecking if we can resolve topic via subtopic...");
            for (const q of noTopicQuestions) {
                if (q.subtopic_id) {
                    const [sub] = await db.query('SELECT topic_id FROM subtopics WHERE id = ?', [q.subtopic_id]);
                    if (sub.length > 0) {
                        console.log(`  -> QID ${q.id} belongs to Subtopic ${q.subtopic_id} which belongs to Topic ${sub[0].topic_id}`);
                    } else {
                        console.log(`  -> QID ${q.id} has invalid Subtopic ${q.subtopic_id}`);
                    }
                } else {
                    console.log(`  -> QID ${q.id} is truly orphaned (No Topic, No Subtopic)`);
                }
            }
        } else {
            console.log("All questions have a valid topic_id.");
        }

        // 2. Run the query from dashboardController to see what it returns for the user
        console.log("\nSimulating Dashboard Query for User 1...");
        const userId = 1;
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
        console.log("Recently Solved Results:", JSON.stringify(rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkQuestionTopics();
