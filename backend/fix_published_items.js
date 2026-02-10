const db = require('./config/db');

async function fixPublishedItems() {
    try {
        console.log('Fixing Questions...');
        const [qResult] = await db.query("UPDATE questions SET is_active = 1 WHERE status = 'published'");
        console.log(`Updated ${qResult.changedRows} questions.`);

        console.log('Fixing Notes...');
        const [nResult] = await db.query("UPDATE notes SET is_active = 1 WHERE status = 'published'");
        console.log(`Updated ${nResult.changedRows} notes.`);

        console.log('Fixing Exams...');
        const [eResult] = await db.query("UPDATE exams SET is_active = 1 WHERE status = 'published'");
        console.log(`Updated ${eResult.changedRows} exams.`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixPublishedItems();
