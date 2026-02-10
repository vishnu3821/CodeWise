const db = require('./config/db');

async function debug() {
    try {
        // 1. Check if training_exams table exists
        const [tables] = await db.query("SHOW TABLES LIKE 'training_exams'");
        console.log("Does training_exams exist?", tables.length > 0);

        // 2. Check if exams table has id 6
        const [exam] = await db.query("SELECT * FROM exams WHERE id = 6");
        console.log("Exam with ID 6 in 'exams' table:", exam.length > 0 ? "Found" : "Not Found");

        // 3. Check constraints on training_exam_attempts
        const [constraints] = await db.query(`
            SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'training_exam_attempts' AND TABLE_SCHEMA = 'codewise';
        `);
        console.log("Constraints on training_exam_attempts:");
        console.table(constraints);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
