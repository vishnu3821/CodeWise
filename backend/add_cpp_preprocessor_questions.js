const db = require('./config/db');

async function addPreprocessorQuestions() {
    try {
        console.log('Adding C++ Preprocessor Questions to Existing Subtopics...');

        const topicId = 50;
        const subtopicIncludeId = 137;
        const subtopicDefineId = 138;
        const languageId = 2; // C++

        const questionsInclude = [
            {
                title: 'Precise floating-point printing with iomanip',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read one real number x and print it with exactly two digits after the decimal point. Use the formatting utilities from the standard library (\`fixed\` and \`setprecision\`) instead of manual rounding code. This exercise emphasizes bringing the correct headers: \`<iostream>\` for I/O and \`<iomanip>\` for formatting. Without \`<iomanip>\`, setprecision won’t compile; without fixed, you’d get total-significant-digits formatting.`,
                constraints: `−1e12 ≤ x ≤ 1e12
Double precision is sufficient`,
                sample_input: '3.5',
                sample_output: '3.50',
                explanation: 'Using std::fixed and std::setprecision(2) forces two digits after the decimal.'
            },
            {
                title: 'Uppercase a full line using algorithm and cctype',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read an entire line (including spaces) and convert all alphabetic characters to uppercase, leaving all other characters unchanged. Use \`std::transform\` from \`<algorithm>\` with \`std::toupper\` from \`<cctype>\`, and remember to cast to unsigned char when calling toupper to avoid UB on negative char values. This highlights correct header usage: \`<iostream>\`, \`<string>\`, \`<algorithm>\`, and \`<cctype>\`.`,
                constraints: `Line length ≤ 2 × 10^6 characters
ASCII input`,
                sample_input: 'Hello_World! 123',
                sample_output: 'HELLO_WORLD! 123',
                explanation: 'Letters become uppercase; digits and punctuation remain unchanged.'
            },
            {
                title: 'Word frequency with unordered_map',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read N words (tokens with no spaces), then Q queries. For each query word, print how many times it appeared among the N words. Use \`std::unordered_map<std::string,int>\` from \`<unordered_map>\` for O(1) average-time counting. This validates bringing the right headers: \`<unordered_map>\` for the hash map, \`<string>\` for text, and standard I/O headers.`,
                constraints: `1 ≤ N, Q ≤ 200000
Each word length: 1..50 (ASCII letters/digits/underscore)
Total input size ≤ 2 × 10^6 characters`,
                sample_input: `6
apple banana apple pear pear pear
3
banana
pear
mango`,
                sample_output: `1
3
0`,
                explanation: 'Counts: apple=2, banana=1, pear=3. mango is absent → 0.'
            },
            {
                title: 'GCD of all numbers and total sum with <numeric>',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read N positive integers (64-bit). Compute:

G: the greatest common divisor of all N values using \`std::gcd\` from \`<numeric>\` (C++17)
S: the sum of all values using \`std::accumulate\` (also \`<numeric>\`), with 128-bit or 64-bit as appropriate
Print G and S. This exercise emphasizes using \`<numeric>\` facilities instead of hand-rolled loops.`,
                constraints: `1 ≤ N ≤ 200000
1 ≤ ai ≤ 10^12
Use 64-bit for G and S`,
                sample_input: `5
12 18 24 30 6`,
                sample_output: '6 90',
                explanation: 'GCD(12,18,24,30,6) = 6; sum is 90.'
            },
            {
                title: 'Evaluate a Reverse Polish Notation (RPN) expression with stack and sstream',
                difficulty: 'Hard',
                description: `**Problem statement:**
You are given a single line containing a valid RPN expression consisting of 64-bit integers and operators +, −, ×, ÷ (use integer division that truncates toward zero). Tokens are separated by spaces. Evaluate the expression and print the final integer result. Use:

\`std::stack<long long>\` from \`<stack>\`
\`std::istringstream\` from \`<sstream>\` to tokenize
\`<string>\` and \`<iostream>\` for I/O
This underscores including the correct headers for tokenization and stack evaluation.`,
                constraints: `The expression is valid and non-empty
All intermediate results fit in 64-bit signed
Operators: + - * /`,
                sample_input: '2 3 + 4 *',
                sample_output: '20',
                explanation: 'Push 2, 3 → apply + → 5; push 4 → apply * → 20.'
            }
        ];

        const questionsDefine = [
            {
                title: 'Use a macro constant PI to compute circle area',
                difficulty: 'Easy',
                description: `**Problem statement:**
Define a macro constant for PI (e.g., \`#define PI 3.14159265358979323846\`). Read a circle radius r (double), compute the area A = PI * r * r, and print it with exactly two decimals. This exercise reinforces constant-style macros and the habit of wrapping numeric constants in macros or constexprs.`,
                constraints: `0 ≤ r ≤ 1e9
Use double; print with fixed and two decimals`,
                sample_input: '1',
                sample_output: '3.14',
                explanation: 'A = πr² = 3.14159…, printed as 3.14.'
            },
            {
                title: 'Parenthesized SQR(x) macro',
                difficulty: 'Easy',
                description: `**Problem statement:**
Define a macro \`SQR(x)\` that expands to \`((x) * (x))\`. Read two 64-bit integers a and b. Print two values:

s1 = SQR(a + b)
s2 = SQR(a) + SQR(b)
The goal is to demonstrate why macro bodies and parameters must be parenthesized: SQR(a + b) must expand safely to ((a + b) * (a + b)), not a + b * a + b.`,
                constraints: `−10^9 ≤ a, b ≤ 10^9
Use 64-bit accumulation`,
                sample_input: '1 2',
                sample_output: '9 5',
                explanation: '(1+2)² = 9; 1² + 2² = 5.'
            },
            {
                title: 'CLAMP(x, lo, hi) macro to cap values into a range',
                difficulty: 'Medium',
                description: `**Problem statement:**
Define a macro \`CLAMP(x, lo, hi)\` that evaluates to:

(lo) if (x) < (lo)
(hi) if (x) > (hi)
otherwise (x)
Read N integers and bounds L and H (L ≤ H). Replace every value with CLAMP(value, L, H) and print the adjusted sequence. Parenthesize macro parameters and the whole expression. Warning: macros can evaluate arguments multiple times; avoid arguments with side effects.`,
                constraints: `0 ≤ N ≤ 200000
−1e9 ≤ values, L, H ≤ 1e9
L ≤ H`,
                sample_input: `5
-1 0 5 9 10
2 8`,
                sample_output: '2 2 5 8 8',
                explanation: 'Values below 2 become 2; above 8 become 8; in-range are unchanged.'
            },
            {
                title: 'Bit operations via macros: SET, CLEAR, TOGGLE, CHECK',
                difficulty: 'Medium',
                description: `**Problem statement:**
Manage a 64-bit bitset represented by an unsigned long long mask, initially 0. Define macros:

\`SET(m, b)\`: set bit b (0 ≤ b < 64) → m |= (1ULL << (b))
\`CLEAR(m, b)\`: clear bit b → m &= ~(1ULL << (b))
\`TOGGLE(m, b)\`: flip bit b → m ^= (1ULL << (b))
\`CHECK(m, b)\`: expression yielding 1 if bit b is set, else 0
Process Q commands of four forms and print output only for CHECK.`,
                constraints: `1 ≤ Q ≤ 200000
0 ≤ b < 64`,
                sample_input: `6
SET 1
CHECK 1
TOGGLE 1
CHECK 1
SET 63
CHECK 63`,
                sample_output: `1
0
1`,
                explanation: 'After SET 1 → bit 1 is 1. TOGGLE 1 clears it. SET 63 marks the top bit.'
            },
            {
                title: 'X-macro command table for arithmetic dispatch',
                difficulty: 'Hard',
                description: `**Problem statement:**
Use the X-macro technique to define a single macro containing all supported operations, and generate both an enum and a dispatcher from it. Supported operations on 64-bit integers:

ADD(a, b) → a + b
SUB(a, b) → a − b
MUL(a, b) → a * b
DIV(a, b) → a / b (truncate toward zero; input guarantees b ≠ 0)
MAX(a, b) → maximum
Steps (design sketch):
Define the table:
\`#define OP_TABLE(X)\`
\`X(ADD, +)\`
...
Generate an enum Op { OP_TABLE(DEFINE_ENUM) };
Create a runtime dispatcher that, given an op string and two numbers, calls the correct implementation.
Read Q lines, each: op a b. For each, print the result.`,
                constraints: `1 ≤ Q ≤ 200000
−10^12 ≤ a, b ≤ 10^12
For DIV, b ≠ 0`,
                sample_input: `4
ADD 3 5
SUB 10 7
MUL 2 9
MAX 7 4`,
                sample_output: `8
3
18
7`,
                explanation: 'Each command uses the matching operation from the macro-generated table.'
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

        await insertQuestions(questionsInclude, { name: 'Include', id: subtopicIncludeId });
        await insertQuestions(questionsDefine, { name: 'Define', id: subtopicDefineId });

        console.log('C++ Preprocessor Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addPreprocessorQuestions();
