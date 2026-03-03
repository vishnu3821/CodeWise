const db = require('./config/db');

async function addTypeCastingQuestions() {
    try {
        console.log('Adding C++ Type Casting Questions to Existing Subtopics...');

        const topicId = 46;
        const subtopicImplicitId = 131;
        const subtopicExplicitId = 132;
        const languageId = 2; // C++

        const questionsImplicit = [
            {
                title: 'Mean of two integers as a double (triggering promotion with a double literal)',
                difficulty: 'Easy',
                description: `**Problem statement:**
You are given two 32-bit integers a and b. Compute their arithmetic mean as a floating-point number and print it with exactly two decimals. Do not use any explicit cast; instead, rely on implicit type promotion by introducing a double literal in the expression so that integer division doesn’t occur (e.g., divide by 2.0 or multiply by 0.5). This tests your understanding that mixing an int with a double in an arithmetic expression promotes the result to double automatically.`,
                constraints: `−1e9 ≤ a, b ≤ 1e9
Use double for the result and print with fixed two decimals.`,
                sample_input: '3 5',
                sample_output: '4.00',
                explanation: '(3 + 5) / 2.0 promotes the division to double, yielding 4.0 → printed as 4.00.'
            },
            {
                title: 'Percentage using implicit promotion',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read two non-negative integers part and total (total > 0). Compute the percentage P = (100.0 * part) / total and print it with two decimals. Don’t cast explicitly; the presence of 100.0 (a double literal) ensures part is promoted to double and the whole computation is done in floating point.`,
                constraints: `0 ≤ part ≤ total ≤ 10^12
total > 0
Print with fixed two decimals`,
                sample_input: '1 4',
                sample_output: '25.00',
                explanation: '100.0 makes the expression floating-point, giving 25.0.'
            },
            {
                title: 'Mixed arithmetic: int × long long ÷ double',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given three numbers: an int a, a long long b, and a double c (c ≠ 0). Compute the value v = (a * b) / c as a double and print it with six decimals. Rely on implicit promotions: a*b is computed as long long, then dividing by c promotes the numerator to double. This checks your understanding of the usual arithmetic conversions across integer and floating types.`,
                constraints: `−1e6 ≤ a ≤ 1e6
−10^12 ≤ b ≤ 10^12
1e−9 ≤ |c| ≤ 1e9
The product a*b fits in signed 64-bit`,
                sample_input: '2 1000000000 4.0',
                sample_output: '500000000.000000',
                explanation: 'a*b = 2e9 fits in 64-bit, then divided by 4.0 in double → 5e8.'
            },
            {
                title: 'Signed vs unsigned comparison semantics',
                difficulty: 'Medium',
                description: `**Problem statement:**
In C++, comparing a signed int x with an unsigned int y promotes x to unsigned if unsigned can represent all values of the signed type, which can lead to surprising results when x is negative. Read a 32-bit signed integer x and a 32-bit unsigned integer y, then evaluate the expression (x < y) exactly as C++ would with implicit conversions. Print true or false (lowercase). Do not use explicit casts; rely on the language’s implicit comparison rules.`,
                constraints: `−2^31 ≤ x ≤ 2^31−1
0 ≤ y ≤ 2^32−1 (given as a non-negative 64-bit number in input; store in unsigned)`,
                sample_input: '-1 1',
                sample_output: 'false',
                explanation: 'x (-1) is converted to a very large unsigned (wraparound), so (huge < 1) is false.'
            },
            {
                title: 'Evaluate a mixed-type expression with integer division inside',
                difficulty: 'Hard',
                description: `**Problem statement:**
Given three values i (long long), j (long long), and k (double), compute the expression E = i / j + k using C++’s implicit rules and print the result with six decimals. Note that i / j is integer division (truncates toward zero) because both operands are integers; only after that do we add the double k, promoting the integer quotient to double at that final addition step. This problem highlights the exact point at which promotions happen.`,
                constraints: `−10^12 ≤ i, j ≤ 10^12
j ≠ 0
−10^9 ≤ k ≤ 10^9`,
                sample_input: '7 2 0.1',
                sample_output: '3.100000',
                explanation: '7/2 is 3 (integer division), then 3 + 0.1 → 3.1.'
            }
        ];

        const questionsExplicit = [
            {
                title: 'Truncate a double to an integer using static_cast',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read a double x representing a real number (may be negative). Convert it to a 32-bit integer using explicit cast (\`static_cast<int>(x)\`) and print the truncated result (toward zero, per C++). Then also print x rounded to the nearest integer using \`std::llround\` (or an equivalent calculation) to show the difference. Output both on one line as “TRUNC t ROUND r”. This underlines the difference between explicit truncation and rounding.`,
                constraints: `|x| ≤ 1e12
Truncated value fits 32-bit signed; rounded value fits 64-bit`,
                sample_input: '3.8',
                sample_output: 'TRUNC 3 ROUND 4',
                explanation: 'static_cast<int>(3.8) = 3; rounding to nearest yields 4.'
            },
            {
                title: 'ASCII code and digit value via explicit casts',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read a single visible ASCII character c. Print its ASCII code as an integer, and if c is a decimal digit ('0'..'9'), also print its numeric value (0..9); otherwise print -1. Use explicit casts where needed (e.g., \`static_cast<int>(c)\`) to avoid implicit char→int surprises on exotic platforms.`,
                constraints: `c is a single byte in the printable ASCII range (32..126)`,
                sample_input: '7',
                sample_output: 'CODE 55 DIGIT 7',
                explanation: "'7' has ASCII 55; numeric value is 7."
            },
            {
                title: 'Saturating narrow cast to uint8_t (0..255)',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given a signed 64-bit integer x. You must convert it to an 8-bit unsigned integer with saturation: values below 0 map to 0, values above 255 map to 255, and in-range values keep their value. Print the resulting integer (0..255). Use explicit casts after clamping so that the conversion is intentional and self-documenting, e.g., \`static_cast<uint8_t>(clamped)\`.`,
                constraints: `−10^18 ≤ x ≤ 10^18`,
                sample_input: '300',
                sample_output: '255',
                explanation: '300 saturates to 255, then is cast to uint8_t → 255.'
            },
            {
                title: 'Convert seconds (double) to milliseconds (int64) with rounding',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read a non-negative real number s representing seconds (double). Convert it to whole milliseconds as a 64-bit integer by rounding to the nearest millisecond (0.5 ms rounds up). Print the integer number of milliseconds. Use an explicit cast for the final conversion to integer (e.g., \`static_cast<long long>(s * 1000.0 + 0.5)\`). This tests explicit narrowing with a defined rounding rule.`,
                constraints: `0 ≤ s ≤ 1e12
Result fits in signed 64-bit`,
                sample_input: '1.234',
                sample_output: '1234',
                explanation: '1.234 s × 1000 = 1234.0 → rounds to 1234.'
            },
            {
                title: 'Print IEEE-754 representation of a double as 16-digit hex',
                difficulty: 'Hard',
                description: `**Problem statement:**
Read a double x and print its raw IEEE-754 binary64 bit pattern as an uppercase hexadecimal number with exactly 16 hex digits (no leading “0x”, no spaces). To do this safely in portable C++, bit-cast x into a uint64_t and then print the integer in hex with leading zeros (e.g., std::bitset is not required; prefer \`std::bit_cast<uint64_t>(x)\` in C++20, or \`std::memcpy\` into a uint64_t if older). This problem emphasizes explicit, intentional conversions between representations, not value conversions.`,
                constraints: `x is any finite or special double (NaN/Inf allowed)
Output must be exactly 16 uppercase hex digits`,
                sample_input: '0.0',
                sample_output: '0000000000000000',
                explanation: 'The all-zero bit pattern represents +0.0.'
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

        await insertQuestions(questionsImplicit, { name: 'Implicit Type Casting', id: subtopicImplicitId });
        await insertQuestions(questionsExplicit, { name: 'Explicit Type Casting', id: subtopicExplicitId });

        console.log('C++ Type Casting Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addTypeCastingQuestions();
