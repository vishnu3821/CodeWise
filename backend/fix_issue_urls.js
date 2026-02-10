require('dotenv').config();
const db = require('./config/db');

const fixUrls = async () => {
    try {
        console.log('Fixing broken screenshot URLs...');

        // Update all URLs that start with /uploads/profile- but not /uploads/profiles/
        const [result] = await db.query(
            `UPDATE reported_issues 
             SET screenshot_url = REPLACE(screenshot_url, '/uploads/', '/uploads/profiles/') 
             WHERE screenshot_url LIKE '/uploads/profile-%' 
             AND screenshot_url NOT LIKE '/uploads/profiles/%'`
        );

        console.log('Fixed rows:', result.changedRows);
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
};

fixUrls();
