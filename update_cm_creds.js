const db = require('./backend/config/db');
const bcrypt = require('bcryptjs');

async function updateContentManager() {
    try {
        console.log('Updating Content Manager Credentials...');

        const newEmail = 'cmvai@codewise.com';
        const newPassword = 'vishnu';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Check if old user exists
        const [oldUser] = await db.query("SELECT * FROM users WHERE email = 'cm@codewise.com'");

        if (oldUser.length > 0) {
            console.log('Found old CM user. Updating email and password...');
            await db.query(
                'UPDATE users SET email = ?, password_hash = ? WHERE id = ?',
                [newEmail, hashedPassword, oldUser[0].id]
            );
        } else {
            console.log('Old user not found. Checking if target email exists...');
            const [targetUser] = await db.query("SELECT * FROM users WHERE email = ?", [newEmail]);

            if (targetUser.length > 0) {
                console.log('Target email already exists. Updating password and role...');
                await db.query(
                    'UPDATE users SET password_hash = ?, role = ? WHERE id = ?',
                    [hashedPassword, 'content_manager', targetUser[0].id]
                );
            } else {
                console.log('Creating new Content Manager...');
                await db.query(
                    "INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?)",
                    ['Content Manager', newEmail, hashedPassword, 'content_manager', true]
                );
            }
        }

        console.log(`Content Manager updated: ${newEmail} / ${newPassword}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateContentManager();
