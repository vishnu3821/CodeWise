const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'codewise_db'
};

async function checkSchema() {
    const connection = await mysql.createConnection(dbConfig);
    try {
        console.log("Checking training_exam_attempts schema...");
        const [rows] = await connection.query("DESCRIBE training_exam_attempts");
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

checkSchema();
