require('dotenv').config();
const db = require('./config/db');

const testConnection = async () => {
    try {
        console.log('Testing database connection...');
        const [rows] = await db.query('SELECT 1');
        console.log('Connection successful:', rows);

        console.log('Testing reported_issues table...');
        const [issues] = await db.query('SELECT COUNT(*) as count FROM reported_issues');
        console.log('Issues count:', issues[0].count);

        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err);
        process.exit(1);
    }
};

testConnection();
