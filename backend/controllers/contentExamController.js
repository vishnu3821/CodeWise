const db = require('../config/db');

// List Exams
exports.getExams = async (req, res) => {
    try {
        const { language_id, type, status } = req.query;
        let query = `
            SELECT e.*, l.name as language_name, u.name as created_by_name, u_d.name as disabled_by_name,
            (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id) as question_count
            FROM exams e
            LEFT JOIN languages l ON e.language_id = l.id
            LEFT JOIN users u ON e.created_by = u.id
            LEFT JOIN users u_d ON e.disabled_by = u_d.id
            WHERE 1=1
        `;
        const params = [];

        if (language_id) {
            query += ' AND e.language_id = ?';
            params.push(language_id);
        }
        if (type) {
            query += ' AND e.type = ?';
            params.push(type);
        }
        if (status) {
            query += ' AND e.status = ?';
            params.push(status);
        }

        query += ' ORDER BY e.created_at DESC';

        const [exams] = await db.query(query, params);
        res.json(exams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching exams' });
    }
};

// Get Single Exam
exports.getExamById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Exam Details
        const [exams] = await db.query(`
            SELECT e.*, l.name as language_name 
            FROM exams e 
            LEFT JOIN languages l ON e.language_id = l.id 
            WHERE e.id = ?
        `, [id]);

        if (exams.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        const exam = exams[0];

        // 2. Fetch Questions
        const [questions] = await db.query(`
            SELECT eq.id as link_id, eq.marks, eq.order_index, eq.module,
                   q.id as question_id, q.title, q.difficulty, q.type as question_type,
                   t.name as topic_name
            FROM exam_questions eq
            JOIN questions q ON eq.question_id = q.id
            LEFT JOIN topics t ON q.topic_id = t.id
            WHERE eq.exam_id = ?
            ORDER BY eq.order_index ASC
        `, [id]);

        res.json({ ...exam, questions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching exam details' });
    }
};

// Create Exam
exports.createExam = async (req, res) => {
    try {
        const { title, exam_code, language_id, duration_minutes, pass_percentage, type, description, start_time, end_time, status } = req.body;

        console.log("--- CREATE EXAM DEBUG ---");
        console.log("User:", req.user);
        console.log("Body:", req.body);

        const userRole = req.user.role;

        // Check for duplicate code
        const [existing] = await db.query('SELECT id FROM exams WHERE exam_code = ?', [exam_code]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Exam Code already exists' });
        }

        // Enforce Status
        let initialStatus = 'draft';
        if (userRole === 'admin' && status) {
            initialStatus = status;
        } else if (status === 'pending_review') {
            initialStatus = 'pending_review';
        }
        const submittedAt = initialStatus === 'pending_review' ? new Date() : null;

        const [result] = await db.query(`
            INSERT INTO exams (title, exam_code, language_id, duration_minutes, pass_percentage, type, description, start_time, end_time, created_by, status, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, exam_code, language_id || null, duration_minutes, pass_percentage, type || 'TRAINING', description, start_time || null, end_time || null, req.user.id, initialStatus, submittedAt]);

        res.status(201).json({ message: 'Exam created successfully', id: result.insertId });
    } catch (error) {
        console.error("CREATE EXAM ERROR:", error);
        res.status(500).json({ message: 'Server error creating exam', error: error.message, sql: error.sql });
    }
};

// Update Exam
exports.updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, exam_code, language_id, duration_minutes, pass_percentage, type, description, start_time, end_time, status } = req.body;
        const userRole = req.user.role;

        // Check overlapping code if changed
        if (exam_code) {
            const [existing] = await db.query('SELECT id FROM exams WHERE exam_code = ? AND id != ?', [exam_code, id]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Exam Code already exists' });
            }
        }

        // Status Update Logic inside general update
        let newStatus = undefined;
        let submittedAt = undefined;
        if (status) {
            if (userRole === 'admin') {
                newStatus = status;
            } else if (['draft', 'pending_review'].includes(status)) {
                newStatus = status;
                if (status === 'pending_review') submittedAt = new Date();
                else submittedAt = null;
            }
        }

        let sql = `UPDATE exams SET title=?, exam_code=?, language_id=?, duration_minutes=?, pass_percentage=?, type=?, description=?, start_time=?, end_time=?`;
        let params = [
            title,
            exam_code,
            language_id || null,
            duration_minutes,
            pass_percentage,
            type,
            description,
            start_time || null,
            end_time || null
        ];

        if (newStatus) {
            sql += `, status=?, submitted_at=?`;
            params.push(newStatus);
            params.push(submittedAt);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({ message: 'Exam updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating exam' });
    }
};

// Update Status
exports.updateExamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userRole = req.user.role;

        // Normalize status to lowercase
        const normalizedStatus = status.toLowerCase();

        // Role Check
        if (userRole !== 'admin') {
            if (!['draft', 'pending_review', 'disabled'].includes(normalizedStatus)) {
                return res.status(403).json({ message: 'Unauthorized status change' });
            }
        }

        if (normalizedStatus === 'published') {
            const [questions] = await db.query('SELECT COUNT(*) as count FROM exam_questions WHERE exam_id = ?', [id]);
            if (questions[0].count === 0) {
                return res.status(400).json({ message: 'Cannot publish an exam with no questions' });
            }
        }

        const submittedAt = normalizedStatus === 'pending_review' ? new Date() : null;

        let sql = 'UPDATE exams SET status = ?';
        let params = [normalizedStatus];

        if (normalizedStatus === 'pending_review') {
            sql += ', submitted_at = ?';
            params.push(submittedAt);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await db.query(sql, params);
        res.json({ message: `Exam status updated to ${normalizedStatus}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

// Add Question to Exam
exports.addQuestionToExam = async (req, res) => {
    try {
        const { id } = req.params; // Exam ID
        const { question_id, marks, module } = req.body;

        // Verify Question exists and active
        const [qCheck] = await db.query('SELECT id FROM questions WHERE id = ? AND is_active = TRUE', [question_id]);
        if (qCheck.length === 0) {
            return res.status(400).json({ message: 'Question not found or inactive' });
        }

        // Get current max order index
        const [max] = await db.query('SELECT MAX(order_index) as max_idx FROM exam_questions WHERE exam_id = ?', [id]);
        const nextIdx = (max[0].max_idx || 0) + 1;

        await db.query(`
            INSERT INTO exam_questions (exam_id, question_id, marks, order_index, module)
            VALUES (?, ?, ?, ?, ?)
        `, [id, question_id, marks || 10, nextIdx, module || 'coding']);

        // Recalculate Total Marks
        await recalculateTotalMarks(id);

        res.json({ message: 'Question added to exam' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding question' });
    }
};

// Remove Question from Exam
exports.removeQuestionFromExam = async (req, res) => {
    try {
        const { id, questionId } = req.params; // id=ExamID, questionId=QuestionID

        // Remove the link
        await db.query('DELETE FROM exam_questions WHERE exam_id = ? AND question_id = ?', [id, questionId]);

        // Recalculate Total Marks
        await recalculateTotalMarks(id);

        res.json({ message: 'Question removed from exam' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error removing question' });
    }
};

// Reorder Questions
exports.reorderQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const { questions } = req.body; // Array of { question_id, order_index }

        // Use transaction if possible, or simple loop
        for (const q of questions) {
            await db.query('UPDATE exam_questions SET order_index = ? WHERE exam_id = ? AND question_id = ?', [q.order_index, id, q.question_id]);
        }
        res.json({ message: 'Questions reordered' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error reordering questions' });
    }
};

// Helper: Recalculate Total Marks
async function recalculateTotalMarks(examId) {
    const [rows] = await db.query('SELECT SUM(marks) as total FROM exam_questions WHERE exam_id = ?', [examId]);
    const total = rows[0].total || 0;
    await db.query('UPDATE exams SET total_marks = ? WHERE id = ?', [total, examId]);
}
