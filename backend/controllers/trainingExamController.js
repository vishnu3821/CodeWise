const db = require('../config/db');
const codeExecutionService = require('../services/codeExecutionService');
const bcrypt = require('bcrypt');

// Run Code
exports.runCode = async (req, res) => {
    try {
        const { code, language, testCases } = req.body;
        // executeBatch expectation: (language, code, testCases) where testCases is array of {input}
        // or array of inputs. The service signature is: executeBatch(language, code, testCases)
        // Check service definition to be sure.

        // Correct arg order: executeBatch(code, testCases, language)
        const results = await codeExecutionService.executeBatch(code, testCases, language);
        res.json(results);
    } catch (err) {
        console.error("Run Code Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Execute Code inside Exam IDE
exports.executeExamCode = async (req, res) => {
    try {
        const { questionId, code, language, action } = req.body; // action: 'run' or 'submit'

        if (!code || !questionId) return res.status(400).json({ message: 'Missing parameters' });

        if (language === 'sql') {
            const [qRes] = await db.query('SELECT solution_code FROM questions WHERE id = ?', [questionId]);
            const expectedQuery = qRes[0]?.solution_code || '';
            const execRes = await codeExecutionService.executeSql(code, expectedQuery);

            if (!execRes.success) {
                return res.json({
                    status: 'Error',
                    message: execRes.error.message,
                    compilation_error: execRes.error.type === 'Compilation Error' ? execRes.error.message : null,
                    runtime_error: execRes.error.type === 'Runtime Error' ? execRes.error.message : null,
                    error_type: execRes.error.type
                });
            }

            return res.json({
                status: execRes.passed ? 'Accepted' : 'Failed',
                results: [{
                    id: 1,
                    input: 'Execute Query',
                    expectedOutput: execRes.expectedOutput,
                    userOutput: execRes.userOutput,
                    status: execRes.passed ? 'Passed' : 'Failed',
                    error: null
                }]
            });
        }

        let query = 'SELECT input, expected_output FROM test_cases WHERE question_id = ?';
        if (action === 'run') {
            query += ' AND (is_hidden = 0 OR is_sample = 1)';
        }

        const [testCases] = await db.query(query, [questionId]);
        if (testCases.length === 0) return res.status(404).json({ message: 'No test cases found' });

        const inputs = testCases.map(tc => tc.input);
        const batchResult = await codeExecutionService.executeBatch(code, inputs, language || 'c');

        if (!batchResult.success) {
            return res.json({
                status: 'Error',
                message: batchResult.error.message,
                compilation_error: batchResult.error.type === 'Compilation Error' ? batchResult.error.message : null,
                runtime_error: batchResult.error.type === 'Runtime Error' ? batchResult.error.message : null,
                error_type: batchResult.error.type
            });
        }

        const results = [];
        let overallStatus = 'Accepted';

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = batchResult.results[i];

            const caseResult = {
                id: i + 1,
                input: action === 'run' ? testCase.input : 'Hidden',
                expectedOutput: action === 'run' ? testCase.expected_output : 'Hidden',
                userOutput: action === 'run' ? (result.success ? result.output : null) : 'Hidden',
                status: 'Pending',
                error: result.success ? null : result.error
            };

            if (!result.success) {
                caseResult.status = 'Error';
                overallStatus = 'Failed';
            } else if (result.output !== testCase.expected_output.trim()) {
                caseResult.status = 'Failed';
                overallStatus = 'Failed';
            } else {
                caseResult.status = 'Passed';
            }
            results.push(caseResult);
        }

        res.json({ status: overallStatus, results });
    } catch (err) {
        console.error("Execute Exam Code Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/* --- NEW ADMIN EXAM MANAGEMENT --- */

// Set Pre-Exam Message
exports.setPreExamMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body, is_required } = req.body;

        if (!title || !body) return res.status(400).json({ message: 'Title and body are required' });

        await db.query(
            'UPDATE exams SET pre_exam_message_title = ?, pre_exam_message_body = ?, is_message_required = ? WHERE id = ?',
            [title, body, is_required ? 1 : 0, id]
        );

        res.json({ success: true, message: 'Pre-exam message saved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Accept Pre-Exam Message (Student)
exports.acceptPreExamMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await db.query(
            'INSERT IGNORE INTO exam_message_acceptance (exam_id, user_id) VALUES (?, ?)',
            [id, userId]
        );

        res.json({ success: true, message: 'Message accepted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error check' });
    }
};


// Set Exam Password
exports.setExamPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const hash = await bcrypt.hash(password, 10);
        await db.query('UPDATE exams SET exam_password_hash = ?, is_password_protected = 1 WHERE id = ?', [hash, id]);

        res.json({ success: true, message: 'Password set successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify Password (Student)
exports.verifyPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        const [exams] = await db.query(
            'SELECT exam_password_hash, pre_exam_message_title, pre_exam_message_body, is_message_required FROM exams WHERE id = ?',
            [id]
        );
        if (exams.length === 0) return res.status(404).json({ message: 'Exam not found' });

        const exam = exams[0];
        const messageData = {
            title: exam.pre_exam_message_title,
            body: exam.pre_exam_message_body,
            is_required: exam.is_message_required
        };

        if (!exam.exam_password_hash) {
            return res.json({ success: true, messageData }); // No password set = auto pass
        }

        const match = await bcrypt.compare(password, exam.exam_password_hash);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid password' });

        res.json({ success: true, messageData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error check' });
    }
};

// Publish Exam (With Password Check)
exports.publishExam = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const [exams] = await db.query('SELECT exam_password_hash FROM exams WHERE id = ?', [id]);
        if (exams.length === 0) return res.status(404).json({ message: 'Exam not found' });

        if (!exams[0].exam_password_hash) {
            return res.status(400).json({ message: 'Cannot publish exam without a password set.' });
        }

        // Update status in exams
        await db.query(`
            UPDATE exams 
            SET status = 'published', approved_by = ?, approved_at = NOW() 
            WHERE id = ?
        `, [adminId, id]);

        res.json({ success: true, message: 'Exam published successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin List Exams
exports.getAdminExams = async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT e.id, e.title, e.pass_percentage, e.duration_minutes, e.is_password_protected, e.type, e.status, e.pre_exam_message_title, e.pre_exam_message_body, e.is_message_required,
                   COUNT(a.id) as total_attempts,
                   SUM(CASE WHEN a.passed = 1 THEN 1 ELSE 0 END) as passed_count,
                   SUM(CASE WHEN a.passed = 0 THEN 1 ELSE 0 END) as failed_count
            FROM exams e
            LEFT JOIN training_exam_attempts a ON e.id = a.exam_id
            WHERE e.status IN ('published', 'archived')
            GROUP BY e.id
            ORDER BY e.created_at DESC
        `);
        res.json(exams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin Delete Exam (Soft delete)
exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;

        // Perform soft delete by setting status to 'archived'
        await db.query(`
            UPDATE exams 
            SET status = 'archived', disabled_by = ?, disabled_at = NOW(), disabled_reason = 'Deleted by admin' 
            WHERE id = ?
        `, [req.user?.id || null, id]);

        res.json({ success: true, message: 'Exam archived successfully' });
    } catch (err) {
        console.error("Delete Exam Error:", err);
        res.status(500).json({ message: 'Failed to delete exam' });
    }
};

// Edit Pass Percentage
exports.editPassPercentage = async (req, res) => {
    try {
        const { id } = req.params;
        const { percentage } = req.body;
        await db.query('UPDATE exams SET pass_percentage = ? WHERE id = ?', [percentage, id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

/* ----------------------------- */


// Start of existing exports...
// Get All Exams (List)
exports.getAllExams = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch published exams of type 'TRAINING'
        const [exams] = await db.query(`
            SELECT e.* 
            FROM exams e 
            WHERE e.status = 'published' AND e.type = 'TRAINING'
            ORDER BY e.created_at DESC
        `);

        // Check attempts for each
        const examsWithMeta = await Promise.all(exams.map(async (exam) => {
            const [attempts] = await db.query('SELECT status, score FROM training_exam_attempts WHERE user_id = ? AND exam_id = ? ORDER BY completed_at DESC LIMIT 1', [userId, exam.id]);

            return {
                ...exam,
                sections: ['English', 'Mathematics', 'Coding'], // Fixed modules for Training Exam
                status: attempts.length > 0 ? 'completed' : 'new',
                key: exam.id,
                is_password_protected: exam.is_password_protected // Pass to frontend
            };
        }));

        res.json(examsWithMeta);
    } catch (err) {
        console.error("getAllExams Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Exam Details (Questions nested in Sections by Module)
exports.getExam = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check previous attempts
        const [existing] = await db.query('SELECT id FROM training_exam_attempts WHERE user_id = ? AND exam_id = ?', [userId, id]);
        if (existing.length > 0) {
            return res.status(403).json({ message: 'You have already attempted this exam.', attemptId: existing[0].id });
        }

        // 1. Fetch Exam
        const [exams] = await db.query('SELECT * FROM exams WHERE id = ?', [id]);
        if (exams.length === 0) return res.status(404).json({ message: 'Exam not found' });
        const exam = exams[0];

        // Password Verification
        if (exam.is_password_protected) {
            const providedPassword = req.headers['x-exam-password'];
            if (!providedPassword) {
                // Return limited metadata if no password provided
                return res.status(403).json({
                    message: 'Password required',
                    is_password_protected: true,
                    title: exam.title,
                    duration_minutes: exam.duration_minutes,
                    pass_percentage: exam.pass_percentage
                });
            }

            const match = await bcrypt.compare(providedPassword, exam.exam_password_hash);
            if (!match) {
                return res.status(403).json({
                    message: 'Invalid password',
                    is_password_protected: true,
                    title: exam.title
                });
            }
        }

        // 2. Fetch Questions with Module info from exam_questions
        const [questions] = await db.query(`
            SELECT eq.module, eq.marks, eq.order_index, 
                   q.id, q.title, q.description, q.type, q.options, q.input_format, q.output_format, q.constraints, q.sample_input, q.sample_output,
                   q.explanation, q.time_limit, q.memory_limit, q.default_code, q.difficulty,
                   (SELECT COUNT(*) FROM test_cases tc WHERE tc.question_id = q.id AND tc.is_hidden = 1) AS hidden_test_cases_count
            FROM exam_questions eq
            JOIN questions q ON eq.question_id = q.id
            WHERE eq.exam_id = ?
            ORDER BY eq.order_index
        `, [id]);

        // 3. Group by Module to create Sections
        const modules = ['maths', 'english', 'coding'];
        const sections = modules.map(mod => {
            const modQuestions = questions.filter(q => q.module === mod).map(q => {
                // Formatting for frontend
                let opts = [];
                if (q.type === 'mcq' && q.options) {
                    try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch (e) { }
                }

                return {
                    id: q.id,
                    title: q.title,
                    description: q.description,
                    type: q.type,
                    options: opts,
                    marks: q.marks,
                    input_format: q.input_format,
                    output_format: q.output_format,
                    constraints: q.constraints,
                    sample_input: q.sample_input,
                    sample_output: q.sample_output,
                    explanation: q.explanation,
                    time_limit: q.time_limit,
                    memory_limit: q.memory_limit,
                    default_code: q.default_code,
                    difficulty: q.difficulty,
                    hidden_test_cases_count: q.hidden_test_cases_count
                };
            });

            return {
                id: mod, // Section ID as module name
                name: mod.charAt(0).toUpperCase() + mod.slice(1),
                type: mod === 'coding' ? 'coding' : 'mcq', // Simplify: English/Maths displayed like MCQ/Text
                questions: modQuestions
            };
        }).filter(s => s.questions.length > 0);

        // Remove password hash before sending
        delete exam.exam_password_hash;
        // Check if student has accepted message
        const [acceptedRes] = await db.query('SELECT id FROM exam_message_acceptance WHERE exam_id = ? AND user_id = ?', [id, userId]);
        exam.has_accepted_message = acceptedRes.length > 0;


        res.json({ ...exam, sections });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit Exam (Calculate Score & Save Attempt)
exports.submitExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, tabSwitchCount = 0, autoSubmitted = false, terminationReason = null } = req.body; // { questionId: { value: ... } }
        const userId = req.user.id;

        // Double check attempt
        const [existing] = await db.query('SELECT id FROM training_exam_attempts WHERE user_id = ? AND exam_id = ?', [userId, id]);
        if (existing.length > 0) {
            return res.status(403).json({ message: 'Already submitted.' });
        }

        let score = 0;
        let totalMarks = 0;
        let results = [];

        // Fetch verification data (Correct Answers)
        // Need to join exam_questions to check if Q is in this exam
        const [questions] = await db.query(`
            SELECT q.*, eq.marks, eq.module 
            FROM questions q 
            JOIN exam_questions eq ON q.id = eq.question_id 
            WHERE eq.exam_id = ?
        `, [id]);

        for (const q of questions) {
            totalMarks += q.marks;
            const userAnswer = answers[q.id];

            if (!userAnswer) {
                results.push({ questionId: q.id, correct: false, status: 'unattempted' });
                continue;
            }

            const userLang = userAnswer.language || 'c';

            if (q.type === 'mcq') {
                const userVal = String(userAnswer.value).trim();
                const correctVal = String(q.correct_option).trim();

                // If userVal is a number like '0', '1' but correctVal might be 'Option A'
                // the frontend submits the *index* of the option, but the backend stores the *actual string* value
                // Or maybe the frontend sends index but correct_option is also storing index?
                // Let's check how the frontend renders and backend expects options.
                // The frontend handles answers as `idx` (index of option).

                // Fetch the options array for this question
                let parsedOptions = [];
                try {
                    parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                } catch (e) { }

                // If user submitted an index, get the string value of that option to compare
                let finalUserVal = userVal;
                if (!isNaN(userVal) && parsedOptions[userVal] !== undefined) {
                    finalUserVal = String(parsedOptions[userVal]).trim();
                }

                if (finalUserVal === correctVal) {
                    score += q.marks;
                    results.push({ questionId: q.id, correct: true });
                } else {
                    results.push({ questionId: q.id, correct: false });
                }
            } else if (q.type === 'descriptive') {
                if (userAnswer.value && userAnswer.value.trim().toLowerCase() === (q.model_answer || '').trim().toLowerCase()) {
                    score += q.marks;
                    results.push({ questionId: q.id, correct: true });
                } else {
                    results.push({ questionId: q.id, correct: false, status: 'submitted' });
                }
            } else if (q.type === 'coding') {
                if (!userAnswer.value) {
                    results.push({ questionId: q.id, correct: false });
                    continue;
                }

                try {
                    if (userLang === 'sql') {
                        // For SQL, compare real DB outputs rather than string matching against truncated sample tests
                        const expectedQuery = q.solution_code || '';
                        if (!expectedQuery) {
                            results.push({ questionId: q.id, correct: true }); // Fallback
                            score += q.marks;
                            continue;
                        }

                        const execRes = await codeExecutionService.executeSql(userAnswer.value, expectedQuery);
                        if (execRes.success && execRes.passed) {
                            score += q.marks;
                            results.push({ questionId: q.id, correct: true });
                        } else {
                            results.push({ questionId: q.id, correct: false });
                        }
                    } else {
                        const [testCases] = await db.query('SELECT input, expected_output FROM test_cases WHERE question_id = ?', [q.id]);
                        if (testCases.length === 0) {
                            results.push({ questionId: q.id, correct: true }); // Graceful fallback if no TCs
                            score += q.marks;
                            continue;
                        }

                        const inputs = testCases.map(tc => tc.input);
                        const batchResult = await codeExecutionService.executeBatch(userAnswer.value, inputs, userLang);

                        let passedAll = true;
                        if (batchResult.success) {
                            for (let i = 0; i < testCases.length; i++) {
                                const res = batchResult.results[i];
                                if (!res.success || !res.output || res.output.trim() !== testCases[i].expected_output.trim()) {
                                    passedAll = false;
                                    break;
                                }
                            }
                        } else {
                            passedAll = false;
                        }

                        if (passedAll) {
                            score += q.marks;
                            results.push({ questionId: q.id, correct: true });
                        } else {
                            results.push({ questionId: q.id, correct: false });
                        }
                    }
                } catch (execErr) {
                    console.error("Exam Code Execution Error:", execErr);
                    results.push({ questionId: q.id, correct: false });
                }
            }
        }

        // Determine Pass/Fail based on exam pass_percentage
        const [examInfo] = await db.query('SELECT pass_percentage FROM exams WHERE id = ?', [id]);
        const passPercent = examInfo[0]?.pass_percentage || 40;
        const obtainedPercent = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
        const passed = obtainedPercent >= passPercent ? 1 : 0;

        // Save Attempt
        const [result] = await db.query(`
            INSERT INTO training_exam_attempts (user_id, exam_id, score, total_marks, passed, attempt_data, completed_at, status, tab_switch_count, auto_submitted, termination_reason)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), 'completed', ?, ?, ?)
        `, [userId, id, score, totalMarks, passed, JSON.stringify(results), tabSwitchCount, autoSubmitted, terminationReason]);

        res.json({ success: true, score, totalMarks, passed, results, attemptId: result.insertId });

    } catch (err) {
        console.error("SUBMIT EXAM ERROR:", err);
        const fs = require('fs');
        fs.appendFileSync('backend_errors.log', `${new Date().toISOString()} - Submit Error: ${err.message}\n${err.stack}\n\n`);
        res.status(500).json({ message: `Submission failed: ${err.message}` });
    }
};

// Get Attempt Result
exports.getAttemptResult = async (req, res) => {
    try {
        const { id } = req.params; // Exam ID
        const userId = req.user.id;

        const [attempts] = await db.query(`
            SELECT * FROM training_exam_attempts WHERE user_id = ? AND exam_id = ?
        `, [userId, id]);

        if (attempts.length === 0) return res.status(404).json({ message: "No attempt found" });

        res.json(attempts[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Inspect Exam Stats (Admin only)
exports.getExamInspectionStats = async (req, res) => {
    try {
        const examId = req.params.id;

        // 1. Fetch Exam Details
        const [exams] = await db.query('SELECT title, pass_percentage FROM exams WHERE id = ?', [examId]);
        if (exams.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        const exam = exams[0];

        // 2. Fetch All Students (Potential Assignees)
        const [students] = await db.query(`
            SELECT id, name, email 
            FROM users 
            WHERE role = 'student' AND is_active = TRUE
        `);

        // 3. Fetch Attempts
        const [attempts] = await db.query(`
            SELECT 
                tea.user_id,
                tea.score,
                tea.passed,
                tea.completed_at,
                tea.tab_switch_count,
                u.name as username,
                u.email
            FROM training_exam_attempts tea
            JOIN users u ON tea.user_id = u.id
            WHERE tea.exam_id = ?
            ORDER BY tea.score DESC
        `, [examId]);

        // 4. Process Data
        const attemptMap = new Map();
        attempts.forEach(attempt => {
            if (!attemptMap.has(attempt.user_id)) {
                attemptMap.set(attempt.user_id, attempt);
            } else {
                const existing = attemptMap.get(attempt.user_id);
                if (attempt.passed && !existing.passed) {
                    attemptMap.set(attempt.user_id, attempt);
                }
                else if (attempt.passed === existing.passed && attempt.score > existing.score) {
                    attemptMap.set(attempt.user_id, attempt);
                }
            }
        });

        const attemptedUsers = Array.from(attemptMap.values()).map(a => ({
            user_id: a.user_id,
            username: a.username,
            email: a.email,
            marks: a.score,
            result: a.passed ? 'Pass' : 'Fail',
            attempted_at: a.completed_at,
            tab_switches: a.tab_switch_count || 0
        }));

        const attemptedEmails = new Set(attemptedUsers.map(a => a.email));

        const notAttemptedUsers = students
            .filter(s => !attemptedEmails.has(s.email))
            .map(s => ({
                username: s.name,
                email: s.email
            }));

        const stats = {
            total_users: students.length,
            attempted_count: attemptedUsers.length,
            passed_count: attemptedUsers.filter(u => u.result === 'Pass').length,
            failed_count: attemptedUsers.filter(u => u.result === 'Fail').length,
            not_attempted_count: notAttemptedUsers.length,
            attempted_users: attemptedUsers,
            not_attempted_users: notAttemptedUsers,
            exam_title: exam.title
        };

        res.json(stats);

    } catch (error) {
        console.error('Error fetching inspection stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Exam Attempt (Admin Only)
exports.resetExamAttempt = async (req, res) => {
    try {
        const { id, userId } = req.params;

        // Perform hard delete for both the attempt and the message acceptance
        await db.query('DELETE FROM training_exam_attempts WHERE exam_id = ? AND user_id = ?', [id, userId]);
        await db.query('DELETE FROM exam_message_acceptance WHERE exam_id = ? AND user_id = ?', [id, userId]);

        res.json({ success: true, message: 'Student exam attempt reset successfully' });
    } catch (err) {
        console.error("Reset Attempt Error:", err);
        res.status(500).json({ message: 'Failed to reset exam attempt' });
    }
};
