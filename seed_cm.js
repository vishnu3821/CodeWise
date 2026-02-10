const db = require('./backend/config/db');
const bcrypt = require('./backend/node_modules/bcryptjs');

async function seedContentManager() {
    try {
        console.log('Seeding Content Manager...');

        // Check if exists
        const [existing] = await db.query("SELECT * FROM users WHERE email = 'cm@codewise.com'");
        if (existing.length > 0) {
            console.log('Content Manager already exists. Updating role and password...');
            const password = 'ContentManager@123';
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await db.query("UPDATE users SET role = 'content_manager', password_hash = ? WHERE email = 'cm@codewise.com'", [hash]);
            console.log('Role and Password updated.');
            process.exit();
        }

        const password = 'ContentManager@123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query(
            "INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, ?)",
            ['Content Manager', 'cm@codewise.com', hash, 'content_manager', true]
        );

        console.log('Content Manager created: cm@codewise.com / ContentManager@123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedContentManager();
