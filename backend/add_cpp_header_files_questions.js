const db = require('./config/db');

async function addHeaderQuestions() {
    try {
        console.log('Adding C++ Header Files Questions to Existing Subtopics...');

        const topicId = 51;
        const subtopicStandardId = 139;
        const subtopicUserId = 140;
        const languageId = 2; // C++

        const questionsStandard = [
            {
                title: 'Hypotenuse with <cmath> and fixed formatting',
                difficulty: 'Easy',
                description: `**Problem statement:**
You are given two real numbers x and y representing the legs of a right triangle. Compute the hypotenuse length h = sqrt(x^2 + y^2). Print h with exactly six digits after the decimal point. The point of the exercise is to rely on standard headers properly:

\`<cmath>\` for std::hypot (preferred) or std::sqrt
\`<iomanip>\` for std::fixed and std::setprecision
\`<iostream>\` for I/O
Using std::hypot(x, y) is numerically stable and clearer than manual sqrt(xx + yy).`,
                constraints: `|x|, |y| ≤ 1e12 (double is enough for this task)
Output must have exactly 6 decimals`,
                sample_input: '3 4',
                sample_output: '5.000000',
                explanation: 'hypotenuse(3,4) = 5. std::hypot handles the computation; formatting with <iomanip> fixes the decimal width.'
            },
            {
                title: '32-bit binary string using <bitset>',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read a non-negative 32-bit unsigned integer u and print its 32-bit binary representation using \`std::bitset<32>\` from \`<bitset>\`. This demonstrates bringing the correct header (\`<bitset>\`) and outputting the fixed-width binary string without manual loops.`,
                constraints: `0 ≤ u ≤ 2^32 − 1 (read as 64-bit and static_cast to uint32_t if needed)
Exactly 32 characters of 0/1 must be printed`,
                sample_input: '5',
                sample_output: '00000000000000000000000000000101',
                explanation: '5 in binary is 101; std::bitset pads to 32 bits on the left with zeros.'
            },
            {
                title: 'Sum integers from a “comma-or-space” line using <sstream> and <algorithm>',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given a single line that contains signed 32-bit integers, separated by either spaces or commas (or any mixture of both), for example:

"1, 2,3 -4,5"
Normalize the line by replacing every comma with a space (\`std::replace\` from \`<algorithm>\`), then feed it into a \`std::istringstream\` (from \`<sstream>\`) and extract integers in a loop. Compute the 64-bit sum and print it. Required headers include \`<string>\`, \`<sstream>\`, \`<algorithm>\`, \`<iostream>\`.`,
                constraints: `Line length ≤ 2 × 10^6 characters
Each number fits 32-bit signed`,
                sample_input: '1, 2,3 -4,5',
                sample_output: '7',
                explanation: 'After replacing commas with spaces: "1 2 3 -4 5". Summation: 1+2+3−4+5 = 7.'
            },
            {
                title: 'Keep the K smallest numbers using <queue> (priority_queue)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Given N integers and an integer K (1 ≤ K ≤ N), print the K smallest numbers in ascending order. Use a max-heap of size at most K built with \`std::priority_queue<int>\` from \`<queue>\`; push items and pop when size exceeds K so the heap retains the smallest K overall. Then extract elements into a vector and \`std::sort\` (from \`<algorithm>\`) them ascending before printing.`,
                constraints: `1 ≤ N ≤ 200000
1 ≤ K ≤ N
Each a[i] fits 32-bit signed`,
                sample_input: `6 3
7 1 5 2 9 0`,
                sample_output: '0 1 2',
                explanation: 'The three smallest are 0, 1, 2. Max-heap keeps the current K smallest; sorting final contents prints ascending.'
            },
            {
                title: 'Dijkstra’s shortest paths with <vector>, <queue>, <limits>, and <tuple>',
                difficulty: 'Hard',
                description: `**Problem statement:**
You are given a directed weighted graph with V vertices labeled 0..V−1 and E edges (u, v, w) with non-negative weights w. Compute single-source shortest path distances from source S to all vertices using Dijkstra’s algorithm with a min-heap. Use:

\`<vector>\` for adjacency lists
\`<queue>\` with std::priority_queue and std::greater for the min-heap
\`<limits>\` for initializing distances to “infinity”
\`<tuple>\` if you prefer structured heap elements
Print V distances on one line; for unreachable vertices print -1.`,
                constraints: `1 ≤ V ≤ 200000
0 ≤ E ≤ 200000
0 ≤ S < V
0 ≤ w ≤ 10^9`,
                sample_input: `4 5 0
0 1 1
0 2 4
1 2 2
1 3 6
2 3 3`,
                sample_output: '0 1 3 6',
                explanation: 'Shortest 0→0 is 0, 0→1 is 1, 0→2 is 1+2=3 (via 1), 0→3 is 3+3=6 (via 2).'
            }
        ];

        const questionsUser = [
            {
                title: 'math_utils.hpp: add and mul, then dispatch by op',
                difficulty: 'Easy',
                description: `**Problem statement:**
Create a user-defined header "math_utils.hpp" that declares (and defines) two functions operating on 64-bit integers:

\`long long add(long long a, long long b);\`
\`long long mul(long long a, long long b);\`
In main, \`#include "math_utils.hpp"\`, read an operation string op ∈ {"add","mul"} and two integers a, b, and print either add(a,b) or mul(a,b). The header must be protected by an include guard (#ifndef/#define/#endif) or #pragma once.`,
                constraints: `op ∈ {"add","mul"}
−10^12 ≤ a, b ≤ 10^12`,
                sample_input: 'add 7 5',
                sample_output: '12',
                explanation: 'math_utils::add returns 12. A header guard avoids duplicate definitions.'
            },
            {
                title: 'point.hpp: squared distance between two points',
                difficulty: 'Easy',
                description: `**Problem statement:**
Create a header "point.hpp" that defines:

\`struct Point { long long x, y; };\`
\`long long dist2(const Point& a, const Point& b)\`: returns (a.x − b.x)^2 + (a.y − b.y)^2 in 64-bit to avoid overflow.
In main, \`#include "point.hpp"\`, read two points (x1,y1) and (x2,y2), construct Points, call dist2, and print the result. Protect the header with an include guard or #pragma once.`,
                constraints: `|xi|, |yi| ≤ 10^9`,
                sample_input: `0 0
3 4`,
                sample_output: '25',
                explanation: '(3−0)^2 + (4−0)^2 = 9 + 16 = 25.'
            },
            {
                title: 'rational.hpp: a normalized Rational class with add',
                difficulty: 'Medium',
                description: `**Problem statement:**
Write a header "rational.hpp" that defines a class Rational representing a fraction num/den with:

Private 64-bit fields: long long num_, den_
Invariants: den_ > 0; gcd(|num_|, den_) == 1 (always kept normalized)
Constructors: Rational(long long n=0, long long d=1) that normalizes and throws if d==0
Accessors: long long num() const, long long den() const
Method: Rational add(const Rational& other) const
In main, \`#include "rational.hpp"\`, read two fractions n1 d1 and n2 d2, construct two Rational values, compute the sum r = a.add(b), and print r as "num/den".`,
                constraints: `d1, d2 ≠ 0
|n1|, |n2|, |d1|, |d2| ≤ 10^12`,
                sample_input: `1 2
1 3`,
                sample_output: '5/6',
                explanation: '1/2 + 1/3 = (3+2)/6 = 5/6 after normalization.'
            },
            {
                title: 'prefix_sum.hpp: function templates defined in the header',
                difficulty: 'Medium',
                description: `**Problem statement:**
Create a header "prefix_sum.hpp" that provides two function templates defined inline:

\`template<class T> std::vector<long long> build_prefix(const std::vector<T>& a)\`
Builds a prefix array P of size a.size()+1 with P[0]=0 and P[i+1]=P[i]+a[i].
\`template<class T> long long range_sum(const std::vector<long long>& P, size_t L, size_t R)\`
Returns sum over [L..R] inclusive as P[R+1]−P[L].
In main, \`#include "prefix_sum.hpp"\`, read N and N integers, build P, then read Q and answer Q queries [L,R] printing each sum.`,
                constraints: `1 ≤ N ≤ 200000
−1e9 ≤ a[i] ≤ 1e9
1 ≤ Q ≤ 200000
0 ≤ L ≤ R < N`,
                sample_input: `5
1 2 3 4 5
3
0 2
1 3
2 4`,
                sample_output: `6
9
12`,
                explanation: 'P = [0,1,3,6,10,15]; queries compute via P[R+1]−P[L].'
            },
            {
                title: 'polynomial.hpp: a class template Polynomial<T> (header-only)',
                difficulty: 'Hard',
                description: `**Problem statement:**
Design a header "polynomial.hpp" that defines a class template \`Polynomial<T>\` representing a sparse polynomial in x with coefficients of type T stored as a \`map<int, T>\`. Provide methods to add terms, add two polynomials, and evaluate the polynomial at x. All template definitions must be in the header (header-only library pattern).
In main, \`#include "polynomial.hpp"\`, read two polynomials, build canonical forms, compute S = P.add(Q), then read x and print S(x).`,
                constraints: `0 ≤ MP, MQ ≤ 200000
Exponents: 0 ≤ exp ≤ 10^9
Coefficients: |coef| ≤ 10^12`,
                sample_input: `3
2 2
-1 2
3 0
2
5 1
1 0
2`,
                sample_output: '18',
                explanation: 'P: x^2 + 3. Q: 5x + 1. S = x^2 + 5x + 4. At x=2: 4 + 10 + 4 = 18.'
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

        await insertQuestions(questionsStandard, { name: 'Standard Header Files', id: subtopicStandardId });
        await insertQuestions(questionsUser, { name: 'User Defined Header Files', id: subtopicUserId });

        console.log('C++ Header Files Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addHeaderQuestions();
