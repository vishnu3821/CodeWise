const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugInsert() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'codewise'
    });

    try {
        console.log('Connected to database.');

        // Mimic the payload from ExamEditor
        const payload = {
            title: "Test Descriptive Question",
            type: "descriptive",
            description: "print test 10 times",
            difficulty: "Medium",
            is_active: true,
            status: "published",
            explanation: null,
            model_answer: "print test 10 times",
            options: null,
            correct_option: null,
            // Undefined fields in the controller
            language_id: undefined,
            topic_id: undefined,
            subtopic_id: undefined,
            input_format: undefined,
            output_format: undefined,
            constraints: undefined,
            sample_input: undefined,
            sample_output: undefined,
            default_code: undefined,
            solution_code: undefined,
            order_index: undefined,
            test_cases: undefined,
        };

        const createdBy = 1; // Assuming admin user id 1
        const initialStatus = payload.status;
        const submittedAt = null;

        const params = [
            payload.language_id,
            payload.topic_id,
            payload.subtopic_id,
            payload.title,
            payload.description,
            payload.difficulty,
            payload.input_format,
            payload.output_format,
            payload.constraints,
            payload.sample_input,
            payload.sample_output,
            payload.explanation,
            payload.default_code,
            payload.solution_code,
            payload.is_active ? 1 : 0,
            payload.order_index || 0,
            createdBy,
            initialStatus,
            submittedAt,
            payload.type || 'coding',
            payload.options,
            payload.correct_option,
            payload.model_answer
        ];

        console.log('Params:', params);

        await connection.query(
            `INSERT INTO questions 
            (language_id, topic_id, subtopic_id, title, description, difficulty, input_format, output_format, constraints, sample_input, sample_output, explanation, default_code, solution_code, is_active, order_index, created_by, status, submitted_at, type, options, correct_option, model_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params
        );

        console.log('Insert successful!');

    } catch (err) {
        console.error('Insert failed:', err);
    } finally {
        await connection.end();
    }
}

debugInsert();
