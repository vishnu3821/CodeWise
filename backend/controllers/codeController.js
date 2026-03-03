const codeExecutionService = require('../services/codeExecutionService');
const db = require('../config/db');

exports.runCode = async (req, res) => {
    const { code, input, language } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Code is required' });
    }

    let result;
    if (language === 'cpp') {
        result = await codeExecutionService.executeCpp(code, input);
    } else {
        result = await codeExecutionService.executeC(code, input);
    }
    res.json(result);
};

exports.submitCode = async (req, res) => {
    const { code, question_id, user_id, language } = req.body;

    if (!code || !question_id) {
        return res.status(400).json({ message: 'Code and Question ID are required' });
    }

    try {
        // SQL Special Handling
        if (language === 'sql') {
            const [questions] = await db.query('SELECT solution_code FROM questions WHERE id = ?', [question_id]);
            if (!questions.length || !questions[0].solution_code) {
                return res.status(404).json({ message: 'Question or solution not found' });
            }
            const expectedQuery = questions[0].solution_code;

            const result = await codeExecutionService.executeSql(code, expectedQuery);

            let finalStatus = 'Passed';
            let message = null;

            if (!result.success) {
                finalStatus = 'Error';
                message = result.error.message;
            } else if (!result.passed) {
                finalStatus = 'Failed';
                message = "Your query result does not match the expected output.";
            }

            // Save submission
            await db.query(
                'INSERT INTO submissions (question_id, user_id, language, code, status) VALUES (?, ?, ?, ?, ?)',
                [question_id, user_id || null, language || 'sql', code, finalStatus]
            );

            // Update Progress if Passed
            if (finalStatus === 'Passed' && user_id) {
                try {
                    await db.query(
                        'INSERT IGNORE INTO user_question_status (user_id, question_id, status) VALUES (?, ?, ?)',
                        [user_id, question_id, 'Passed']
                    );
                    const progressController = require('../controllers/progressController');
                    await progressController.checkProgressCascade(user_id, question_id);
                } catch (err) {
                    console.error('Error updating progress:', err);
                }
            }

            return res.json({
                status: finalStatus,
                message: message,
                failed_test_case_index: finalStatus === 'Failed' ? 0 : undefined
            });
        }

        // Standard Language Handling
        // Fetch ALL test cases (Hidden + Sample)
        const [testCases] = await db.query(
            'SELECT input, expected_output FROM test_cases WHERE question_id = ?',
            [question_id]
        );

        if (testCases.length === 0) {
            return res.status(404).json({ message: 'No test cases found for this question' });
        }

        const inputs = testCases.map(tc => tc.input);

        // Execute Batch
        const batchResult = await codeExecutionService.executeBatch(code, inputs, req.body.language || 'c');

        // Handle Global Errors (Compilation, Input Check)
        if (!batchResult.success) {
            // Check if it's our specific input validation error
            if (batchResult.error && batchResult.error.type === 'Wrong Answer') {
                return res.json({
                    status: 'Wrong Answer',
                    message: batchResult.error.message,
                    failed_test_case_index: 0 // Fail on the first one conceptually
                });
            }
            // Compilation or Runtime Error during setup
            return res.json({
                status: batchResult.error.type, // 'Compilation Error'
                message: batchResult.error.message
            });
        }

        let failedIndex = -1;
        let finalStatus = 'Passed';

        // Check results per test case
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = batchResult.results[i];

            if (!result.success) {
                finalStatus = result.error.type; // 'Runtime Error'
                failedIndex = i;
                break;
            }

            // Exact match trimmed
            if (result.output !== testCase.expected_output.trim()) {
                finalStatus = 'Failed';
                failedIndex = i;
                break;
            }
        }

        // Save submission
        await db.query(
            'INSERT INTO submissions (question_id, user_id, language, code, status) VALUES (?, ?, ?, ?, ?)',
            [question_id, user_id || null, req.body.language || 'c', code, finalStatus]
        );

        // If passed and user_id is provided, mark as completed
        if (finalStatus === 'Passed' && user_id) {
            try {
                await db.query(
                    'INSERT IGNORE INTO user_question_status (user_id, question_id, status) VALUES (?, ?, ?)',
                    [user_id, question_id, 'Passed']
                );

                const progressController = require('../controllers/progressController');
                await progressController.checkProgressCascade(user_id, question_id);

            } catch (err) {
                console.error('Error updating progress:', err);
            }
        }

        res.json({
            status: finalStatus,
            failed_test_case_index: failedIndex !== -1 ? failedIndex : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.runTestCases = async (req, res) => {
    const { code, question_id, language } = req.body;

    if (!code || !question_id) {
        return res.status(400).json({ message: 'Code and Question ID are required' });
    }

    try {
        // SQL Special Handling
        if (language === 'sql') {
            // Fetch Expected Query
            const [questions] = await db.query('SELECT solution_code FROM questions WHERE id = ?', [question_id]);
            if (!questions.length || !questions[0].solution_code) {
                return res.status(404).json({ message: 'Question or solution not found' });
            }
            const expectedQuery = questions[0].solution_code;

            const result = await codeExecutionService.executeSql(code, expectedQuery);

            if (!result.success) {
                return res.json({
                    status: 'Error',
                    message: result.error.message,
                    error_type: result.error.type
                });
            }

            // Return in format compatible with frontend "Run Results"
            // For SQL, we just show the output of the user's query as a single "test case" result
            return res.json({
                status: 'Accepted',
                results: [{
                    id: 1,
                    input: 'Execute Query',
                    expectedOutput: result.expectedOutput, // Show what was expected (table)
                    userOutput: result.userOutput, // Show what user got (table)
                    status: result.passed ? 'Passed' : 'Failed', // Strict match? 
                    // For "Run", we usually just want to see output, but we can hint if it matches
                }]
            });
        }

        // Standard Language Handling (C, C++, Java, Python)
        // Fetch PUBLIC test cases (is_hidden = 0) for "Run"
        const [testCases] = await db.query(
            'SELECT input, expected_output FROM test_cases WHERE question_id = ? AND (is_hidden = 0 OR is_sample = 1)',
            [question_id]
        );
        // ... existing logic ...

        if (testCases.length === 0) {
            return res.status(404).json({ message: 'No sample test cases found' });
        }

        const inputs = testCases.map(tc => tc.input);

        // Execute Batch
        const batchResult = await codeExecutionService.executeBatch(code, inputs, language || 'c');

        // Handle Compilation or Input Verification Error
        if (!batchResult.success) {
            return res.json({
                status: 'Error',
                message: batchResult.error.message,
                compilation_error: batchResult.error.type === 'Compilation Error' ? batchResult.error.message : null,
                runtime_error: batchResult.error.type === 'Runtime Error' ? batchResult.error.message : null,
                // Specifically for input check failure
                error_type: batchResult.error.type
            });
        }

        const results = [];
        let overallStatus = 'Accepted';

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const result = batchResult.results[i]; // Result corresponds to inputs[i]

            const caseResult = {
                id: i + 1,
                input: testCase.input,
                expectedOutput: testCase.expected_output,
                userOutput: result.success ? result.output : null,
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

        res.json({
            status: overallStatus,
            results: results
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
