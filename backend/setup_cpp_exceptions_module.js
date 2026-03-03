const db = require('./config/db');

async function setupCppExceptionsModule() {
    try {
        console.log('Starting C++ Exceptions Module Setup...');

        // 1. Get C++ Language ID
        const [langRows] = await db.query("SELECT id FROM languages WHERE slug = 'cpp'");
        if (langRows.length === 0) {
            console.error('C++ Language not found!');
            process.exit(1);
        }
        const languageId = langRows[0].id;
        console.log(`C++ Language ID: ${languageId}`);

        // 2. Add "Exceptions" Topic
        console.log('Adding "Exceptions" Topic...');
        // Order index 21 (after Files which was 20)
        await db.query(`
            INSERT IGNORE INTO topics (language_id, name, slug, order_index, is_active)
            VALUES (?, 'Exceptions', 'exceptions', 21, 1)
        `, [languageId]);

        const [topicRows] = await db.query("SELECT id FROM topics WHERE slug = 'exceptions' AND language_id = ?", [languageId]);
        const topicId = topicRows[0].id;
        console.log(`Topic ID: ${topicId}`);

        // 3. Define Subtopics
        const subtopics = [
            { name: 'try', slug: 'try', order: 1 },
            { name: 'catch', slug: 'catch', order: 2 }
        ];

        // 4. Define Questions - Subtopic: try
        const questionsTry = [
            {
                title: 'Integer division with safe parsing inside a single try',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read two tokens that should represent 64-bit signed integers a and b. Convert them using \`std::stoll\` and then compute a / b using C++ integer-division semantics (truncates toward zero). Perform the entire sequence (parse a, parse b, validate b ≠ 0, compute quotient) inside a single \`try\` block. If any step fails (invalid number format, out-of-range during parsing, or division by zero), catch the exception and print "ERROR". Otherwise, print the integer quotient.
This reinforces wrapping multiple risky operations in one try, so any failure is handled uniformly.`,
                constraints: `Tokens are ASCII strings with no spaces.
Convert using std::stoll (can throw std::invalid_argument or std::out_of_range).
Division by zero must be detected (throw or guard) and handled as ERROR.
If everything succeeds, the quotient fits in 64-bit signed.`,
                sample_input: '10 3',
                sample_output: '3',
                explanation: '"10" and "3" parse successfully to 64-bit integers. 10 / 3 truncates to 3. No exception occurs, so the program prints 3.'
            },
            {
                title: 'Safe POP from a stack with try guarding each risky operation',
                difficulty: 'Easy',
                description: `**Problem statement:**
Implement a basic integer stack. Read Q commands:

\`PUSH x\` → push x (32-bit) onto the stack
\`POP\` → pop the top element and print it
For each POP, attempt the operation inside a \`try\` block. If the stack is empty, throw (e.g., \`std::underflow_error\`) and print "EMPTY". Otherwise, print the popped value. Keep the risky part (the POP) inside a small try block so only underflow is handled by exceptions.`,
                constraints: `1 ≤ Q ≤ 200000
All pushed values fit in 32-bit int`,
                sample_input: `5
POP
PUSH 3
PUSH 4
POP
POP`,
                sample_output: `EMPTY
4
3`,
                explanation: `The first POP on an empty stack throws and is caught → EMPTY. Next POPs return 4 then 3.`
            },
            {
                title: 'Fibonacci with an overflow pre-check inside try',
                difficulty: 'Medium',
                description: `**Problem statement:**
Compute F(N), N-th Fibonacci number with F(0)=0 and F(1)=1, using 64-bit signed integers. If N is too large to fit in signed 64-bit (F(93) > 2^63−1), throw \`std::overflow_error\` inside a \`try\` before computing, catch it, and print "OVERFLOW". Otherwise, compute F(N) iteratively and print it. This focuses on validation plus computation within one try block.`,
                constraints: `0 ≤ N ≤ 10^18 as input (but throw if N > 92)
Use 64-bit signed long long for results`,
                sample_input: '10',
                sample_output: '55',
                explanation: '10 ≤ 92, so compute iteratively. Result is 55.'
            },
            {
                title: 'Safe random-access with vector::at inside try',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read N and then N integers into a \`vector<int>\`. Then read Q queries, each a 0-based index i. For each query, attempt to print \`arr.at(i)\` inside a \`try\` block. \`vector::at\` throws \`std::out_of_range\` if i is invalid. If any exception occurs, catch it and print "OUT_OF_RANGE". This emphasizes using library methods that throw and wrapping each risky access in a small try.`,
                constraints: `1 ≤ N ≤ 200000
−1e9 ≤ arr[i] ≤ 1e9
1 ≤ Q ≤ 200000
Indices i may be negative or ≥ N`,
                sample_input: `3
10 20 30
4
0
2
3
-1`,
                sample_output: `10
30
OUT_OF_RANGE
OUT_OF_RANGE`,
                explanation: 'at(0) and at(2) succeed; at(3) and at(-1) throw and are caught.'
            },
            {
                title: 'Transaction pipeline with one top-level try and first-error reporting',
                difficulty: 'Hard',
                description: `**Problem statement:**
You are given an initial balance B and M operations in order:

\`DEPOSIT x\`: x ≥ 0; adds x
\`WITHDRAW x\`: x ≥ 0 and x ≤ balance; subtracts x
\`FEE x\`: x ≥ 0 and x ≤ balance; subtracts x
Wrap the entire processing loop in one \`try\` block. On the first invalid operation (negative x, or x > balance for WITHDRAW/FEE), throw a \`std::runtime_error\` that encodes the 1-based operation index. Catch it once at the top, stop processing, and print:
\`ERROR k b\`
where k is the index of the failing operation and b is the balance immediately before applying that failing operation. If all operations succeed, print:
\`OK b\`
This models transactional early-failure handling with a single try/catch guarding the whole pipeline.`,
                constraints: `0 ≤ B ≤ 10^12
0 ≤ M ≤ 200000
Amounts x are given as 64-bit; negatives are considered invalid input
Use 64-bit long long for arithmetic`,
                sample_input: `10 4
DEPOSIT 5
WITHDRAW 3
FEE 4
WITHDRAW 20`,
                sample_output: 'ERROR 4 8',
                explanation: 'Start 10 → +5 = 15 → −3 = 12 → −4 = 8. The 4th op tries to withdraw 20 > 8, so you throw with k=4, b=8.'
            }
        ];

        // 4. Define Questions - Subtopic: catch
        const questionsCatch = [
            {
                title: 'Distinguish std::stoll parse errors with multiple catch blocks',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read a single token s and parse it with \`std::stoll\`. Use distinct \`catch\` blocks to report:

\`std::invalid_argument\` → print "INVALID"
\`std::out_of_range\` → print "OUT_OF_RANGE"
If parsing succeeds, print the parsed 64-bit integer. This ensures proper ordering and specificity of exception handlers.`,
                constraints: `Token has no spaces
If s is a valid 64-bit signed integer, parsing succeeds`,
                sample_input: '12345',
                sample_output: '12345',
                explanation: 'stoll succeeds; no exception is caught.'
            },
            {
                title: 'Separate parsing errors from container access errors',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N and N integers into a \`vector<int>\`. Then read a token t that should be a 0-based index i. First, parse t using \`std::stoll\` with dedicated catches:

INVALID for \`std::invalid_argument\`
OUT_OF_RANGE for \`std::out_of_range\` (during parsing)
If parsing succeeds, convert to 0-based integer i and attempt \`arr.at(i)\` inside a separate try/catch that prints OUT_OF_RANGE for \`std::out_of_range\` (from \`vector::at\`). If both parsing and access succeed, print arr[i]. This distinguishes parsing failures from bounds failures cleanly.`,
                constraints: `1 ≤ N ≤ 200000
−1e9 ≤ arr[i] ≤ 1e9`,
                sample_input: `3
10 20 30
2`,
                sample_output: '30',
                explanation: 'Parsing "2" to 64-bit works; at(2) returns 30.'
            },
            {
                title: 'Add context and rethrow as std::runtime_error',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read L lines; each has two tokens a and b intended as 64-bit integers. For each line k (1-based), compute a / b using integer division. Implement a helper \`computeLine(aTok, bTok, k)\` that:

Parses both numbers with \`std::stoll\`
Checks b ≠ 0
On any failure, catches the specific exception and rethrows a new \`std::runtime_error\` with message:
"line K: invalid" for \`invalid_argument\`
"line K: out_of_range" for \`out_of_range\`
"line K: div_by_zero" if b == 0
In main, call \`computeLine\` in a \`try\`; if it throws, catch \`std::runtime_error\`, print its message, and stop processing more lines. If all lines succeed, print the quotients (one per line). This demonstrates catching, contextualizing, and rethrowing.`,
                constraints: `1 ≤ L ≤ 200000
Tokens have no spaces
64-bit integer division semantics`,
                sample_input: `3
10 2
5 0
7 1`,
                sample_output: 'line 2: div_by_zero',
                explanation: 'First line prints 5, but on line 2 b==0 → rethrow with reason “div_by_zero”. Main catches and stops.'
            },
            {
                title: 'Catch derived exceptions in the correct order',
                difficulty: 'Medium',
                description: `**Problem statement:**
Define two exception types deriving from \`std::runtime_error\`:

\`struct NegativeAmount : std::runtime_error { using std::runtime_error::runtime_error; };\`
\`struct InsufficientFunds : std::runtime_error { using std::runtime_error::runtime_error; };\`
Simulate a bank balance B and process Q commands:
DEPOSIT x → if x < 0 throw NegativeAmount; else add x
WITHDRAW x → if x < 0 throw NegativeAmount; else if x > balance throw InsufficientFunds; else subtract x
For each command, wrap in \`try\` and \`catch\` in this order:
\`catch (const NegativeAmount&)\`
\`catch (const InsufficientFunds&)\`
\`catch (const std::exception&)\`
On success print OK; on NegativeAmount print NEGATIVE; on InsufficientFunds print INSUFFICIENT; on any other std::exception print ERROR. After all commands, print \`FINAL b\`. This ensures most-derived types are caught first.`,
                constraints: `0 ≤ B ≤ 10^12
1 ≤ Q ≤ 200000
x is 64-bit signed; negatives are invalid`,
                sample_input: `5
4
DEPOSIT 1
WITHDRAW 10
DEPOSIT -2
WITHDRAW 6`,
                sample_output: `OK
INSUFFICIENT
NEGATIVE
OK
FINAL 0`,
                explanation: '+1 → 6 (OK). WITHDRAW 10 exceeds balance → INSUFFICIENT. DEPOSIT −2 invalid → NEGATIVE. WITHDRAW 6 succeeds → 0. Final balance 0.'
            },
            {
                title: 'Factorials with specific catches and a catch-all',
                difficulty: 'Hard',
                description: `**Problem statement:**
You will read T tokens separated by whitespace. For each token s:

Try parsing n = \`std::stoll(s)\`. Use catches to print:
INVALID for \`std::invalid_argument\`
OUT_OF_RANGE for \`std::out_of_range\`
If parsing succeeded, require 0 ≤ n ≤ 20 (since 21! won’t fit in 64-bit). If not, throw \`std::overflow_error\`.
Compute n! in 64-bit and print it.
Use a final \`catch(...)\` to print UNKNOWN for any unexpected exception. This tests targeted catches and a catch-all safety net.`,
                constraints: `1 ≤ T ≤ 200000
Tokens have no spaces
Valid factorial range is 0..20 inclusive`,
                sample_input: `5
0 5 20 21 -3`,
                sample_output: `1
120
2432902008176640000
OVERFLOW
OVERFLOW`,
                explanation: '0! = 1, 5! = 120, 20! fits. 21 and −3 violate bounds → OVERFLOW via overflow_error.'
            }
        ];

        const insertQuestions = async (list, subtopicInfo) => {
            console.log(`Processing subtopic: ${subtopicInfo.name}`);

            // Insert/Get Subtopic
            await db.query(`
                INSERT IGNORE INTO subtopics (topic_id, name, slug, order_index)
                VALUES (?, ?, ?, ?)
            `, [topicId, subtopicInfo.name, subtopicInfo.slug, subtopicInfo.order]);

            const [stRows] = await db.query("SELECT id FROM subtopics WHERE slug = ? AND topic_id = ?", [subtopicInfo.slug, topicId]);
            const subtopicId = stRows[0].id;
            console.log(`Subtopic ID: ${subtopicId}`);

            for (const [index, q] of list.entries()) {
                const [qRows] = await db.query("SELECT id FROM questions WHERE title = ? AND topic_id = ?", [q.title, topicId]);

                if (qRows.length === 0) {
                    await db.query(`
                        INSERT INTO questions 
                        (topic_id, subtopic_id, title, description, difficulty, constraints, order_index, type, 
                         sample_input, sample_output, explanation)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'coding', ?, ?, ?)
                    `, [topicId, subtopicId, q.title, q.description, q.difficulty, q.constraints, index + 1,
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

        // 5. Insert Subtopics & Questions
        await insertQuestions(questionsTry, subtopics[0]);
        await insertQuestions(questionsCatch, subtopics[1]);

        console.log('C++ Exceptions Module Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

setupCppExceptionsModule();
