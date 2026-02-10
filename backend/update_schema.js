const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    const tables = ['questions', 'notes', 'languages', 'exams'];
    const columns = [
        'ADD COLUMN disabled_by INT NULL',
        'ADD COLUMN disabled_at DATETIME NULL',
        'ADD COLUMN disabled_reason TEXT NULL'
    ];

    for (const table of tables) {
        console.log(`Checking ${table}...`);
        const [existingColumns] = await connection.query(`DESCRIBE ${table}`);
        const columnNames = existingColumns.map(c => c.Field);

        let alterQuery = `ALTER TABLE ${table} `;
        let modifications = [];

        if (!columnNames.includes('disabled_by')) modifications.push(columns[0]);
        if (!columnNames.includes('disabled_at')) modifications.push(columns[1]);
        if (!columnNames.includes('disabled_reason')) modifications.push(columns[2]);

        if (modifications.length > 0) {
            alterQuery += modifications.join(', ');
            console.log(`Updating ${table}: ${alterQuery}`);
            await connection.query(alterQuery);
        } else {
            console.log(`${table} already has required columns.`);
        }
    }

    console.log('Schema update complete.');
    await connection.end();
}

updateSchema().catch(console.error);
