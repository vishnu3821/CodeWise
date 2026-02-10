const db = require('./config/db');

async function debugDelete() {
    const connection = await db.getConnection();
    try {
        console.log('Creating dummy user...');
        const [u] = await connection.query("INSERT INTO users (name, email, password_hash, role, is_active) VALUES ('DeleteTest', 'del@test.com', 'hash', 'student', 1)");
        const userId = u.insertId;
        console.log(`Created user ${userId}`);

        // Insert related data to simulate complex state
        await connection.query("INSERT INTO notes (title, file_url, created_by) VALUES ('Test Note', '/tmp/test.pdf', ?)", [userId]);
        // await connection.query("INSERT INTO questions (title, description, created_by) VALUES ('Test Q', 'Desc', ?)", [userId]); // Might fail if strict text fields

        console.log('Starting Deletion Transaction...');
        await connection.beginTransaction();

        console.log('1. Cleaning dependencies...');
        await connection.query('UPDATE notes SET created_by = NULL WHERE created_by = ?', [userId]);
        await connection.query('UPDATE reported_issues SET reported_by = NULL WHERE reported_by = ?', [userId]);
        // await connection.query('UPDATE audit_logs SET admin_id = NULL WHERE admin_id = ?', [userId]); 
        await connection.query('UPDATE languages SET disabled_by = NULL WHERE disabled_by = ?', [userId]);
        await connection.query('UPDATE notes SET disabled_by = NULL WHERE disabled_by = ?', [userId]);
        await connection.query('UPDATE questions SET disabled_by = NULL WHERE disabled_by = ?', [userId]);
        await connection.query('UPDATE exams SET disabled_by = NULL WHERE disabled_by = ?', [userId]);
        await connection.query('UPDATE questions SET reviewed_by = NULL WHERE reviewed_by = ?', [userId]);
        await connection.query('UPDATE notes SET reviewed_by = NULL WHERE reviewed_by = ?', [userId]);
        await connection.query('UPDATE exams SET reviewed_by = NULL WHERE reviewed_by = ?', [userId]);
        await connection.query('DELETE FROM user_question_status WHERE user_id = ?', [userId]);

        console.log('2. Deleting user...');
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        console.log('SUCCESS: User deleted.');

    } catch (err) {
        await connection.rollback();
        console.error('FAILURE:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

debugDelete();
