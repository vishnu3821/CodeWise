require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');

async function checkUsers() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await db.execute('SELECT id, name, email, role FROM users');
    console.log(JSON.stringify(rows, null, 2));
    await db.end();
}

checkUsers().catch(console.error);
