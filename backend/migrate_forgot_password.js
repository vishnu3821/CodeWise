const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const dbConfig = {
    host: '127.0.0.1', // Force IPv4 to avoid localhost resolution issues
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'codewise'
};

async function migrate() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const sql = `
            ALTER TABLE users
            ADD COLUMN reset_token VARCHAR(255) NULL,
            ADD COLUMN reset_token_expiry DATETIME NULL;
        `;

        console.log('Executing migration...');
        await connection.query(sql);
        console.log('Migration successful!');

    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist. Skipping migration.');
        } else {
            console.error('Migration failed:', err);
            process.exit(1);
        }
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
