const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    try {
        console.log('Connected to database at ' + process.env.DB_HOST);

        // 1. Update EXAMS table
        console.log('Updating exams table...');
        try {
            // Add 'type' column
            await connection.query(`
                ALTER TABLE exams 
                ADD COLUMN type ENUM('coding', 'mcq', 'descriptive', 'training', 'assessment') DEFAULT 'coding';
            `);
            console.log('Added type column to exams.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('type column already exists in exams.');
            else console.error('Error adding type to exams:', e.message);
        }

        // 2. Update QUESTIONS table
        console.log('Updating questions table...');
        const questionColumns = [
            { name: 'type', def: "ENUM('coding', 'mcq', 'descriptive') DEFAULT 'coding'" },
            { name: 'options', def: "JSON DEFAULT NULL" }, // For MCQ options [A, B, C, D]
            { name: 'correct_option', def: "VARCHAR(50) DEFAULT NULL" }, // For MCQ answer
            { name: 'model_answer', def: "TEXT DEFAULT NULL" } // For Descriptive answer
        ];

        for (const col of questionColumns) {
            try {
                await connection.query(`ALTER TABLE questions ADD COLUMN ${col.name} ${col.def}`);
                console.log(`Added ${col.name} column to questions.`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') console.log(`${col.name} column already exists in questions.`);
                else console.error(`Error adding ${col.name} to questions:`, e.message);
            }
        }

        console.log('Schema update complete.');
    } catch (err) {
        console.error('Schema update failed:', err);
    } finally {
        await connection.end();
    }
}

updateSchema();
