const db = require('./config/db');

async function debugConstraints() {
    try {
        const dbName = process.env.DB_NAME || 'codewise';
        console.log(`Checking constraints for database: ${dbName}`);

        const [rows] = await db.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = 'users'
        `, [dbName]);

        console.log('Tables referencing "users":');
        console.table(rows);

        // Also check CREATE TABLE for audit_logs to see ON DELETE rules
        console.log('\n--- audit_logs Structure ---');
        const [auditRes] = await db.query('SHOW CREATE TABLE audit_logs');
        if (auditRes.length) console.log(auditRes[0]['Create Table']);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

debugConstraints();
