const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    const tables = ['questions', 'notes', 'languages', 'exams'];

    for (const table of tables) {
        console.log(`\n--- ${table} ---`);
        const [rows] = await connection.query(`DESCRIBE ${table}`);
        rows.forEach(row => {
            console.log(`${row.Field} (${row.Type})`);
        });
    }

    await connection.end();
}

checkSchema().catch(console.error);
