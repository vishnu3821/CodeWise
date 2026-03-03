const db = require('./config/db');

async function addCppNamespaceQuestions() {
    try {
        console.log('Adding C++ Namespace Questions to Existing Subtopic...');

        const topicId = 45;
        const subtopicId = 130;
        const languageId = 2; // C++

        const questionsNamespace = [
            {
                title: 'Basic math library inside a namespace and qualified calls',
                difficulty: 'Easy',
                description: `**Problem statement:**
Create a small math "library" implemented inside a custom namespace \`calc\`. Inside calc, define two functions operating on 64-bit integers:

\`long long add(long long a, long long b)\`: returns a + b
\`long long mul(long long a, long long b)\`: returns a * b (use 128-bit intermediate if you’re worried about overflow in implementation; for this problem the final result fits in signed 64-bit)
Your program reads an operation name op and two integers a and b. If op is "add", compute \`calc::add(a, b)\`. If op is "mul", compute \`calc::mul(a, b)\`. Print the result. This exercise reinforces declaring functions inside a namespace, qualifying them with \`calc::\` when calling, and keeping symbol names tidy.`,
                constraints: `op ∈ {"add", "mul"}
−10^12 ≤ a, b ≤ 10^12
The final result fits in signed 64-bit for all tests.`,
                sample_input: 'add 3 5',
                sample_output: '8',
                explanation: 'The program calls calc::add(3, 5) and prints 8. Using a qualified name (calc::add) makes it unambiguous which add you’re calling.'
            },
            {
                title: 'Nested namespaces and an alias for convenience',
                difficulty: 'Easy',
                description: `**Problem statement:**
Define a nested namespace \`company::util\` that provides a function to clamp an integer into a closed interval:

\`int clamp(int x, int lo, int hi)\`: if x < lo return lo; else if x > hi return hi; else return x.
In main, create a namespace alias \`cu\` for \`company::util\` (i.e., \`namespace cu = company::util;\`). Read three integers x, lo, hi (with lo ≤ hi). Use the alias to call the function (\`cu::clamp\`) and print the clamped result. This exercise emphasizes nested namespaces for logical organization (\`company::util\`) and the convenience of namespace aliases.`,
                constraints: `−1e9 ≤ x, lo, hi ≤ 1e9
lo ≤ hi`,
                sample_input: '10 0 5',
                sample_output: '5',
                explanation: '10 is above the upper bound 5, so clamp returns 5. The program calls cu::clamp, where cu is an alias for company::util.'
            },
            {
                title: 'Resolve same-named functions in different namespaces',
                difficulty: 'Medium',
                description: `**Problem statement:**
You maintain two language packs, each in its own namespace, that expose the same function name but with different behavior:

\`namespace en { std::string greet(const std::string& name); }\` // returns "Hello, NAME!"
\`namespace es { std::string greet(const std::string& name); }\` // returns "¡Hola, NAME!"
You will read an integer N (number of people), then a language code lang ∈ {"en","es"}, then N names (tokens, no spaces). For each name, call the correct greet from the correct namespace and print the greeting on its own line. This exercise highlights how namespaces allow separate modules to reuse the same function name without collisions; you select the intended one with explicit qualification (en::greet or es::greet).`,
                constraints: `1 ≤ N ≤ 200000
Each name is a single token (no spaces), ASCII, length 1..64
lang is exactly "en" or "es"
Output N lines`,
                sample_input: `3
en
Alice Bob Eve`,
                sample_output: `Hello, Alice!
Hello, Bob!
Hello, Eve!`,
                explanation: 'Language "en" selects en::greet, so each name is prefixed by "Hello, ...".'
            },
            {
                title: 'Put operators in the same namespace to leverage ADL (Argument-Dependent Lookup)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Define a 2D point type inside a custom namespace \`geom\`:

\`namespace geom { struct Point { long long x, y; }; }\`
Provide:
\`geom::Point operator+(const geom::Point& a, const geom::Point& b)\`: returns {a.x + b.x, a.y + b.y}
\`std::ostream& operator<<(std::ostream& os, const geom::Point& p)\`: prints "x y" (two integers separated by a single space)
Important: Place \`operator<<\` in the same namespace \`geom\` as Point (not in the global namespace). Thanks to ADL (Argument-Dependent Lookup), the compiler will find \`geom::operator<<\` when you write \`std::cout << p\` without any extra using directives, because p’s type lives in \`geom\`.
Input gives N followed by N points (xi, yi). Sum all points using the \`operator+\` defined in \`geom\` and print the final sum with \`std::cout << result\`, relying on ADL to find the \`operator<<\`.`,
                constraints: `1 ≤ N ≤ 200000
−10^12 ≤ xi, yi ≤ 10^12
Use 128-bit intermediate if you fear overflow while adding; final x,y fit in 64-bit in tests`,
                sample_input: `3
1 2
3 4
-1 0`,
                sample_output: '3 6',
                explanation: 'Sum = (1,2) + (3,4) + (-1,0) = (3,6). Because operator<< is inside geom, std::cout << sum finds it via ADL.'
            },
            {
                title: 'Versioned APIs with inline namespaces (default to latest, allow explicit older version)',
                difficulty: 'Hard',
                description: `**Problem statement:**
You’re shipping a financial API with two versions that compute a final price in cents (integer arithmetic) given a base price in cents. Both versions expose the same function name inside a top-level namespace \`api\`:

\`api::v1::final_cents(long long base)\`: applies 5% tax (floor the tax to cents), returns base + floor(base*0.05)
\`api::v2::final_cents(long long base)\`: applies 8% tax (round the tax to nearest cent; 0.5 rounds up), returns base + round(base*0.08)
Make v2 the default version by marking it as an \`inline namespace\` so that unqualified \`api::final_cents\` resolves to \`api::v2::final_cents\`. The program should read a version tag ver and a base price in cents base. If ver is "1", call \`api::v1::final_cents\` explicitly. If ver is "2" or "default", call \`api::final_cents\` (which resolves to v2 because it’s inline). Print the resulting integer number of cents.`,
                constraints: `ver ∈ {"1","2","default"}
0 ≤ base ≤ 10^12 (fits 64-bit)
Use integer math; for v2 rounding, implement round-to-nearest with .5 up`,
                sample_input: 'default 10000',
                sample_output: '10800',
                explanation: '“default” binds to v2 (inline). 8% of 10000 is 800; rounded is 800; final is 10800.'
            }
        ];

        const insertQuestions = async (list) => {
            console.log(`Processing subtopic ID: ${subtopicId}`);

            for (const [index, q] of list.entries()) {
                const [qRows] = await db.query("SELECT id FROM questions WHERE title = ? AND topic_id = ?", [q.title, topicId]);

                if (qRows.length === 0) {
                    await db.query(`
                        INSERT INTO questions 
                        (language_id, topic_id, subtopic_id, title, description, difficulty, constraints, order_index, type, 
                         sample_input, sample_output, explanation)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'coding', ?, ?, ?)
                    `, [languageId, topicId, subtopicId, q.title, q.description, q.difficulty, q.constraints, index + 1,
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

        await insertQuestions(questionsNamespace);
        console.log('C++ Namespace Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addCppNamespaceQuestions();
