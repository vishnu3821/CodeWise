require('dotenv').config();
const db = require('./config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS reported_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT NOT NULL,
    screenshot_url VARCHAR(255) NOT NULL,
    reported_by_user_id INT NOT NULL,
    reported_by_name VARCHAR(255) NOT NULL,
    reported_by_email VARCHAR(255) NOT NULL,
    reported_by_role VARCHAR(50) NOT NULL,
    page_url VARCHAR(500),
    status ENUM('NEW', 'IN_REVIEW', 'RESOLVED') DEFAULT 'NEW',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

const run = async () => {
    try {
        console.log('Creating reported_issues table...');
        await db.query(createTableQuery);
        console.log('Table reported_issues created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
};

run();
