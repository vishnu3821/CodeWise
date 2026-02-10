const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    try {
        console.log('Connected to database.');

        // Make topic_id Nullable
        await connection.query(`ALTER TABLE questions MODIFY COLUMN topic_id INT NULL`);
        console.log('Modified questions.topic_id to be NULLABLE.');

    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await connection.end();
    }
}

updateSchema();
