require('dotenv').config(); // Load .env from current dir since we run from backend
const mysql = require('mysql2/promise');

async function checkUsers() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await db.execute('SELECT id, name, email, role FROM users');
        console.log('--- USERS IN DB ---');
        console.log(JSON.stringify(rows, null, 2));
        await db.end();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

checkUsers();
