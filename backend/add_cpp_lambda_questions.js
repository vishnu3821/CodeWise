const db = require('./config/db');

async function addLambdaQuestions() {
    try {
        console.log('Adding C++ Lambda Syntax Questions to Existing Subtopic...');

        const topicId = 48;
        const subtopicId = 135;
        const languageId = 2; // C++

        const questionsLambda = [
            {
                title: 'Filter numbers greater than K using a lambda predicate',
                difficulty: 'Easy',
                description: `**Problem statement:**
You are given N integers and a threshold K. Using \`std::copy_if\` with a lambda predicate, filter the sequence to keep only the elements strictly greater than K, preserving their original order. Print the kept elements on one line separated by single spaces. If no elements qualify, print the word EMPTY. The goal is to practice basic lambda syntax as a predicate with captures. Your lambda should capture K by value and accept an int parameter, returning true if the element should be kept.`,
                constraints: `0 ≤ N ≤ 200000
−1e9 ≤ ai, K ≤ 1e9
O(N) time; O(N) extra space allowed for the output buffer`,
                sample_input: `7
3 7 1 9 9 2 5
5`,
                sample_output: '7 9 9',
                explanation: 'The lambda [K](int x){ return x > K; } returns true for 7, 9, 9.'
            },
            {
                title: 'Sort strings by length then lexicographic using a lambda comparator',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N strings (tokens without spaces). Sort them in ascending order by length. If two strings have the same length, break ties by lexicographic order (std::string’s operator<). Use \`std::sort\` with a lambda comparator that takes \`const std::string& a\` and \`const std::string& b\` and returns true if a should come before b. The lambda does not need to capture anything.`,
                constraints: `1 ≤ N ≤ 200000
Each string length: 1..100 (ASCII)
Sorting time O(N log N)`,
                sample_input: `5
aaaa b aa ccc bb`,
                sample_output: `b
aa
bb
ccc
aaaa`,
                explanation: 'Lengths: b(1), (aa,bb)(2), ccc(3), aaaa(4). Among length-2, "aa"<"bb".'
            },
            {
                title: 'Curve scores with a captured constant and a reference counter',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given N exam scores s[i] in [0, 100] and a bonus integer B that should be added to every score. The adjusted score is clamp(s[i] + B, 0, 100). Using \`std::for_each\` and a stateful lambda:

Capture B by value,
Capture a reference to an integer changed that counts how many scores actually changed (i.e., adjusted != original),
Capture the vector by reference to edit scores in place.
After applying the transformation, print the adjusted scores on one line, then print “CHANGED c” on a new line, where c is the number of changed scores.`,
                constraints: `0 ≤ N ≤ 200000
0 ≤ s[i] ≤ 100
−1000 ≤ B ≤ 1000`,
                sample_input: `5
50 60 70 80 90
10`,
                sample_output: `60 70 80 90 100
CHANGED 5`,
                explanation: 'Add 10 to each, clamp to 100. All scores changed; changed=5.'
            },
            {
                title: 'Generic lambda to compute a dot product for ints or doubles',
                difficulty: 'Medium',
                description: `**Problem statement:**
Compute the dot product Σ ai·bi for two vectors A and B of the same length N. The input begins with a type tag t ∈ {int, double}. For int, print the result as a 64-bit integer. For double, print the result with exactly two decimals. Implement the multiply-and-accumulate using a C++14 generic lambda:
\`auto mul_add = [](auto acc, auto a, auto b) { return acc + a * b; };\`
Then fold over the pairs to produce the final result.`,
                constraints: `t ∈ {int, double}
1 ≤ N ≤ 200000`,
                sample_input: `int 3
1 2 3
4 5 6`,
                sample_output: '32',
                explanation: '1·4 + 2·5 + 3·6 = 4 + 10 + 18 = 32.'
            },
            {
                title: 'Count islands (connected components) with a recursive lambda DFS',
                difficulty: 'Hard',
                description: `**Problem statement:**
You are given a binary grid of R rows and C columns containing characters ‘0’ (water) and ‘1’ (land). Two land cells belong to the same island if they are connected 4-directionally. Count the number of islands. Implement DFS as a recursive lambda using the generic self-parameter trick (\`auto dfs = [&](auto&& self, ...)\`). The lambda should capture the grid by reference and mark visited cells.`,
                constraints: `1 ≤ R, C ≤ 2000
Total cells R·C ≤ 2×10^6`,
                sample_input: `3 4
1100
0110
0011`,
                sample_output: '3',
                explanation: 'Islands are the top-left block, middle block, and bottom-right block.'
            }
        ];

        const insertQuestions = async (list, subtopicInfo) => {
            const subName = subtopicInfo.name;
            const subId = subtopicInfo.id;
            console.log(`Processing subtopic: ${subName} (ID: ${subId})`);

            for (const [index, q] of list.entries()) {
                const [qRows] = await db.query("SELECT id FROM questions WHERE title = ? AND topic_id = ?", [q.title, topicId]);

                if (qRows.length === 0) {
                    await db.query(`
                        INSERT INTO questions 
                        (language_id, topic_id, subtopic_id, title, description, difficulty, constraints, order_index, type, 
                         sample_input, sample_output, explanation)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'coding', ?, ?, ?)
                    `, [languageId, topicId, subId, q.title, q.description, q.difficulty, q.constraints, index + 1,
                        q.sample_input, q.sample_output, q.explanation]);

                    // Get ID
                    const [newQ] = await db.query("SELECT id FROM questions WHERE title = ? AND topic_id = ?", [q.title, topicId]);
                    const qId = newQ[0].id;

                    // Insert Test Case
                    await db.query(`
                        INSERT INTO test_cases (question_id, input, expected_output, is_hidden, is_sample)
                        VALUES (?, ?, ?, 0, 1)
                    `, [qId, q.sample_input, q.sample_output]);

                    console.log(`Inserted question: ${q.title}`);
                } else {
                    console.log(`Question already exists: ${q.title}`);
                }
            }
        };

        await insertQuestions(questionsLambda, { name: 'Lambda Syntax', id: subtopicId });

        console.log('C++ Lambda Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addLambdaQuestions();
