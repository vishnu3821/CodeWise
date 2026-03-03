const db = require('./config/db');

async function setupSqlModule() {
    try {
        console.log('Starting SQL Module Setup...');

        // 1. Add SQL Language
        console.log('Adding "SQL" Language...');
        const [langRes] = await db.query(`
            INSERT IGNORE INTO languages (name, slug, description, has_practice, has_notes)
            VALUES ('SQL', 'sql', 'Structured Query Language for database management.', 1, 1)
        `);

        // Get Language ID (whether inserted or existing)
        const [langRows] = await db.query("SELECT id FROM languages WHERE slug = 'sql'");
        const languageId = langRows[0].id;
        console.log(`SQL Language ID: ${languageId}`);

        // 2. Add "Basic Queries Practice" Topic
        console.log('Adding "Basic Queries Practice" Topic...');
        await db.query(`
            INSERT IGNORE INTO topics (language_id, name, slug, order_index, is_active)
            VALUES (?, 'Basic Queries Practice', 'basic-queries-practice', 1, 1)
        `, [languageId]);

        // Get Topic ID
        const [topicRows] = await db.query("SELECT id FROM topics WHERE slug = 'basic-queries-practice' AND language_id = ?", [languageId]);
        const topicId = topicRows[0].id;
        console.log(`Topic ID: ${topicId}`);

        // 3. Add Questions
        console.log('Adding Questions...');

        const questions = [
            {
                title: 'Retrieve All Employees',
                description: 'Write a query to display all columns from the `employees` table.',
                difficulty: 'Easy',
                sample_output: '1 | Arjun Rao | Engineering | 75000.00 | 2022-01-15\n...',
                expected_query: 'SELECT * FROM employees'
            },
            {
                title: 'Employees from Engineering',
                description: 'Write a query to display employees who belong to the "Engineering" department.',
                difficulty: 'Easy',
                sample_output: '1 | Arjun Rao | Engineering | 75000.00 | 2022-01-15\n5 | Rahul Verma | Engineering | 82000.00 | 2019-11-25...',
                expected_query: "SELECT * FROM employees WHERE department = 'Engineering'"
            },
            {
                title: 'High Salary Employees',
                description: 'Display employees whose salary is greater than 70000.',
                difficulty: 'Medium',
                sample_output: '1 | Arjun Rao | ... | 75000.00 | ...',
                expected_query: 'SELECT * FROM employees WHERE salary > 70000'
            },
            {
                title: 'Sort by Salary',
                description: 'Display all employees ordered by salary in descending order.',
                difficulty: 'Medium',
                sample_output: '5 | Rahul Verma | ... | 82000.00 | ...\n9 | Aman Gupta | ... | 79000.00 | ...',
                expected_query: 'SELECT * FROM employees ORDER BY salary DESC'
            },
            {
                title: 'Count Employees per Department',
                description: 'Display department name and total number of employees in each department. Alias the count as `total_employees`.',
                difficulty: 'Medium',
                sample_output: 'Engineering | 3\nFinance | 2\n...',
                expected_query: 'SELECT department, COUNT(*) as total_employees FROM employees GROUP BY department'
            }
        ];

        // Seed Data for validation (stored in hidden test case for simple validation logic if we were using diffs, 
        // but for SQL we might just store the expected query result or the query itself as the 'model answer')
        // For now, inserting them.

        for (const [index, q] of questions.entries()) {
            // Check if question exists to avoid duplicates
            const [qRows] = await db.query("SELECT id FROM questions WHERE title = ? AND topic_id = ?", [q.title, topicId]);

            if (qRows.length === 0) {
                await db.query(`
                    INSERT INTO questions 
                    (topic_id, title, description, difficulty, order_index, type, solution_code, default_code)
                    VALUES (?, ?, ?, ?, ?, 'coding', ?, 'SELECT ...')
                `, [topicId, q.title, q.description, q.difficulty, index + 1, q.expected_query]);

                // Get the new question ID
                const [newQ] = await db.query("SELECT id FROM questions WHERE title = ? AND topic_id = ?", [q.title, topicId]);
                const qId = newQ[0].id;

                // Insert a dummy test case (since real validation happens via execution against DB, but frontend might expect one)
                await db.query(`
                    INSERT INTO test_cases (question_id, input, expected_output, is_hidden, is_sample)
                    VALUES (?, '', ?, 0, 1)
                `, [qId, q.sample_output]);

                console.log(`Inserted question: ${q.title}`);
            } else {
                console.log(`Question already exists: ${q.title}`);
            }
        }

        console.log('SQL Module Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

setupSqlModule();
