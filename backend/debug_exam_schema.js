const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    try {
        console.log("--- Users Schema ---");
        const [users] = await connection.query(`DESCRIBE users`);
        users.forEach(r => console.log(`${r.Field} | ${r.Type}`));

        console.log("\n--- Training Exam Attempts Schema ---");
        // Check if table exists first, might be named differently
        const [tables] = await connection.query("SHOW TABLES LIKE '%exam%'");
        console.log("Exam related tables:", tables.map(t => Object.values(t)[0]));

        const [attempts] = await connection.query(`DESCRIBE training_exam_attempts`); // Try this name first
        attempts.forEach(r => console.log(`${r.Field} | ${r.Type}`));

    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSchema();
