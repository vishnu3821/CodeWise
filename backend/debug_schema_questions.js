const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkQuestionsSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    try {
        const [rows] = await connection.query(`DESCRIBE questions`);
        console.log('Column | Type | Null | Default');
        console.log('-------|------|------|--------');
        rows.forEach(row => {
            console.log(`${row.Field} | ${row.Type} | ${row.Null} | ${row.Default}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkQuestionsSchema();
