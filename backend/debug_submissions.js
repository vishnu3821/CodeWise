const db = require('./config/db');

async function debugSubmissions() {
    try {
        console.log('--- Debugging Submissions ---');

        // Get all submissions
        const [rows] = await db.query('SELECT id, user_id, question_id, status, created_at FROM submissions ORDER BY created_at DESC LIMIT 10');
        console.table(rows);

        // Check if question 41 exists
        const [question] = await db.query('SELECT id, title FROM questions WHERE id = 41');
        console.log('Question 41:', question);

        // Check user 9
        const [user] = await db.query('SELECT id, name, email FROM users WHERE id = 9');
        console.log('User 9:', user);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

debugSubmissions();
