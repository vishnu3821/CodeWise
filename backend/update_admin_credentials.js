const bcrypt = require('bcryptjs');
const db = require('./config/db');

const updateAdmin = async () => {
    const email = 'vishnu@codewise.in';
    const password = 'vishnu1720';
    const name = 'Vishnu User (Admin)';

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            console.log('User exists, updating role and password...');
            await db.query('UPDATE users SET password_hash = ?, role = "admin", name = ? WHERE email = ?', [hashedPassword, name, email]);
        } else {
            console.log('Creating new admin user...');
            await db.query('INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, "admin", 1)', [name, email, hashedPassword]);
        }

        // Also cleanup old temp admin if exists and different
        await db.query('DELETE FROM users WHERE email = "admin@codewise.com" AND email != ?', [email]);

        console.log('Admin credentials updated successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error updating admin:', err);
        process.exit(1);
    }
};

updateAdmin();
