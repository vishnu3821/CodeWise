const db = require('./config/db');

async function checkSchema() {
    try {
        const tables = ['notes', 'questions', 'exams', 'languages', 'reported_issues', 'audit_logs', 'user_question_status', 'exam_results'];

        for (const table of tables) {
            console.log(`\n--- Schema for ${table} ---`);
            const [rows] = await db.query(`DESCRIBE ${table}`);
            rows.forEach(row => {
                if (['created_by', 'reviewed_by', 'disabled_by', 'reported_by', 'admin_id'].includes(row.Field)) {
                    console.log(`${row.Field}: Type=${row.Type}, Null=${row.Null}, Default=${row.Default}`);
                }
            });
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
