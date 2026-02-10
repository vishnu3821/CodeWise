const db = require('./config/db');

async function migrate() {
    try {
        console.log("Adding user_id column to submissions table...");

        // Check if column exists first to avoid error? Or just try/catch.
        try {
            await db.query(`ALTER TABLE submissions ADD COLUMN user_id INT;`);
            console.log("Column user_id added.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("Column user_id already exists.");
            } else {
                throw e;
            }
        }

        // Add FK
        try {
            await db.query(`ALTER TABLE submissions ADD CONSTRAINT fk_submission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
            console.log("Foreign key added.");
        } catch (e) {
            console.log("FK might already exist or error:", e.message);
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
