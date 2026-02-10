require('dotenv').config();
const db = require('./config/db');

const testInsert = async () => {
    try {
        console.log('Testing reported_issues insertion...');

        const dummyUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'student'
        };

        const description = 'Test description';
        const screenshot_url = '/uploads/test.png';
        const page_url = 'http://localhost:3000/test';

        const [result] = await db.query(
            `INSERT INTO reported_issues 
            (description, screenshot_url, reported_by_user_id, reported_by_name, reported_by_email, reported_by_role, page_url, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW')`,
            [description, screenshot_url, dummyUser.id, dummyUser.name, dummyUser.email, dummyUser.role, page_url]
        );

        console.log('Insertion successful, ID:', result.insertId);
        process.exit(0);
    } catch (err) {
        console.error('Insertion failed:', err);
        process.exit(1);
    }
};

testInsert();
