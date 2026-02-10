const db = require('../config/db');

exports.getQuestions = async (req, res) => {
    try {
        const { language_id, topic_id, subtopic_id, status } = req.query;
        let query = `
            SELECT q.*, l.name as language_name, t.name as topic_name, st.name as subtopic_name, u_d.name as disabled_by_name
            FROM questions q
            LEFT JOIN languages l ON q.language_id = l.id
            LEFT JOIN topics t ON q.topic_id = t.id
            LEFT JOIN subtopics st ON q.subtopic_id = st.id
            LEFT JOIN users u_d ON q.disabled_by = u_d.id
            WHERE 1=1
        `;
        const params = [];

        if (language_id) { query += ' AND q.language_id = ?'; params.push(language_id); }
        if (topic_id) { query += ' AND q.topic_id = ?'; params.push(topic_id); }
        if (subtopic_id) { query += ' AND q.subtopic_id = ?'; params.push(subtopic_id); }
        if (status) { query += ' AND q.is_active = ?'; params.push(status === 'active' ? 1 : 0); }

        query += ' ORDER BY q.created_at DESC';

        const [questions] = await db.query(query, params);
        res.json(questions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching questions' });
    }
};

exports.getQuestionById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Question not found' });

        const question = rows[0];

        // Fetch Test Cases
        const [testCases] = await db.query('SELECT * FROM test_cases WHERE question_id = ?', [id]);
        question.test_cases = testCases;

        res.json(question);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching question' });
    }
};

exports.createQuestion = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        console.log("--- CREATE QUESTION DEBUG ---");
        console.log("User:", req.user);
        console.log("Body:", req.body);

        const {
            language_id, topic_id, subtopic_id, title, description, difficulty,
            input_format, output_format, constraints, sample_input, sample_output, explanation,
            default_code, solution_code, is_active, order_index, test_cases, status,
            type, options, correct_option, model_answer
        } = req.body;
        const createdBy = req.user.id; // From middleware
        const userRole = req.user.role;

        // Enforce Status: Non-admins can only create DRAFT or PENDING_REVIEW
        let initialStatus = 'draft';
        if (userRole === 'admin' && status) {
            initialStatus = status;
        } else if (status === 'pending_review') {
            initialStatus = 'pending_review';
        }

        const submittedAt = initialStatus === 'pending_review' ? new Date() : null;

        // Insert Question
        const [result] = await conn.query(
            `INSERT INTO questions 
            (language_id, topic_id, subtopic_id, title, description, difficulty, input_format, output_format, constraints, sample_input, sample_output, explanation, default_code, solution_code, is_active, order_index, created_by, status, submitted_at, type, options, correct_option, model_answer)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                language_id || null,
                topic_id || null,
                subtopic_id || null,
                title,
                description || '',
                difficulty || 'Medium',
                input_format || null,
                output_format || null,
                constraints || null,
                sample_input || null,
                sample_output || null,
                explanation || null,
                default_code || null,
                solution_code || null,
                is_active ? 1 : 0,
                order_index || 0,
                createdBy,
                initialStatus,
                submittedAt,
                type || 'coding',
                options || null,
                correct_option || null,
                model_answer || null
            ]
        );
        const questionId = result.insertId;

        // Insert Test Cases
        if (test_cases && test_cases.length > 0) {
            const values = test_cases.map(tc => [questionId, tc.input, tc.expected_output, tc.is_hidden ? 1 : 0]);
            await conn.query('INSERT INTO test_cases (question_id, input, expected_output, is_hidden) VALUES ?', [values]);
        }

        await conn.commit();
        res.status(201).json({ message: 'Question created successfully', id: questionId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error creating question', error: err.message, code: err.code, sql: err.sql });
    } finally {
        conn.release();
    }
};

exports.updateQuestion = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { id } = req.params;
        const {
            language_id, topic_id, subtopic_id, title, description, difficulty,
            input_format, output_format, constraints, sample_input, sample_output, explanation,
            default_code, solution_code, is_active, order_index, test_cases, status,
            type, options, correct_option, model_answer
        } = req.body;
        const userRole = req.user.role;

        // Determine Status Update
        let statusUpdateSql = "";
        let statusParams = [];
        let newStatus = null;

        if (status) {
            if (userRole === 'admin') {
                newStatus = status;
            } else {
                // CM can only move to draft or pending_review
                if (['draft', 'pending_review'].includes(status)) {
                    newStatus = status;
                }
            }
        }

        if (newStatus) {
            statusUpdateSql = ", status = ?, submitted_at = ?";
            statusParams = [newStatus, newStatus === 'pending_review' ? new Date() : null];
            // If admin approves, we might want to keep submitted_at? 
            // Actually simpler: if pending_review, set submitted_at. 
            // user prompt: "Click Submit for Review -> Status becomes Pending Review"
        }

        // Prepare Query
        // Note: We append status params at the end of the main list logic if we were dynamic, 
        // but here we are inline. Let's rebuild the update query cleanly.

        const updateFields = [
            language_id || null,
            topic_id || null,
            subtopic_id || null,
            title,
            description || '',
            difficulty,
            input_format || null,
            output_format || null,
            constraints || null,
            sample_input || null,
            sample_output || null,
            explanation || null,
            default_code || null,
            solution_code || null,
            is_active ? 1 : 0,
            order_index || 0,
            type || 'coding',
            options || null,
            correct_option || null,
            model_answer || null
        ];

        let sql = `UPDATE questions SET 
            language_id=?, topic_id=?, subtopic_id=?, title=?, description=?, difficulty=?, 
            input_format=?, output_format=?, constraints=?, sample_input=?, sample_output=?, explanation=?, 
            default_code=?, solution_code=?, is_active=?, order_index=?, type=?, options=?, correct_option=?, model_answer=?`;

        if (newStatus) {
            sql += `, status=?, submitted_at=?`;
            updateFields.push(newStatus);
            updateFields.push(newStatus === 'pending_review' ? new Date() : null);
        }

        sql += ` WHERE id=?`;
        updateFields.push(id);

        await conn.query(sql, updateFields);

        await conn.commit();
        res.json({ message: 'Question updated successfully' });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error updating question' });
    } finally {
        conn.release();
    }
};

exports.toggleQuestionStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        await db.query('UPDATE questions SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ message: 'Question status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating status' });
    }
};
