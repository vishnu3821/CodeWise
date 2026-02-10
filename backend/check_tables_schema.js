const db = require('./config/db');

async function checkTables() {
    try {
        const tables = ['questions', 'user_question_status'];
        for (const t of tables) {
            const [res] = await db.query(`SHOW CREATE TABLE ${t}`);
            console.log(`\n--- ${t} ---`);
            console.log(res[0]['Create Table']);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkTables();
