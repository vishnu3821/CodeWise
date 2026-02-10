const db = require('./config/db');

async function fixSchema() {
    try {
        console.log("Fixing Foreign Key on training_exam_attempts...");

        // 1. Drop incorrect FK
        try {
            await db.query(`ALTER TABLE training_exam_attempts DROP FOREIGN KEY training_exam_attempts_ibfk_2`);
            console.log("Dropped incorrect FK 'training_exam_attempts_ibfk_2'");
        } catch (e) {
            console.log("FK might not exist or already dropped:", e.message);
        }

        // 2. Add correct FK referencing 'exams' table
        try {
            await db.query(`
                ALTER TABLE training_exam_attempts 
                ADD CONSTRAINT fk_training_attempts_exams 
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
            `);
            console.log("Added correct FK 'fk_training_attempts_exams' -> exams(id)");
        } catch (e) {
            console.error("Failed to add new FK:", e.message);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixSchema();
