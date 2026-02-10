const db = require('./config/db');

async function checkData() {
    try {
        const [langNotes] = await db.query('SELECT * FROM notes WHERE language_id IN (6, 7, 8)');
        console.log('--- NOTES FOR SQL(6), DSA(7), DC(8) ---');
        console.table(langNotes);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
