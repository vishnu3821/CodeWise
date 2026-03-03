const db = require('./config/db');

async function setupCppTemplatesModule() {
    try {
        console.log('Starting C++ Templates Module Setup...');

        // 1. Get C++ Language ID
        const [langRows] = await db.query("SELECT id FROM languages WHERE slug = 'cpp'");
        if (langRows.length === 0) {
            console.error('C++ Language not found!');
            process.exit(1);
        }
        const languageId = langRows[0].id;
        console.log(`C++ Language ID: ${languageId}`);

        // 2. Add "Templates" Topic
        console.log('Adding "Templates" Topic...');
        // Order index 23 (after Date and Time which was 22)
        await db.query(`
            INSERT IGNORE INTO topics (language_id, name, slug, order_index, is_active)
            VALUES (?, 'Templates', 'templates', 23, 1)
        `, [languageId]);

        const [topicRows] = await db.query("SELECT id FROM topics WHERE slug = 'templates' AND language_id = ?", [languageId]);
        const topicId = topicRows[0].id;
        console.log(`Topic ID: ${topicId}`);

        // 3. Define Subtopics
        const subtopics = [
            { name: 'Function Templates', slug: 'function-templates', order: 1 },
            { name: 'Class Templates', slug: 'class-templates', order: 2 }
        ];

        // 4. Define Questions - Subtopic: Function Templates
        const questionsFunction = [
            {
                title: 'Generic max of two values',
                difficulty: 'Easy',
                description: `**Problem statement:**
Implement a function template \`T myMax(const T& a, const T& b)\` that returns the larger of the two arguments using operator<. The program should read a type tag and two values, call the template with the correct type, and print the result. For strings, use lexicographic comparison (the usual std::string order). For doubles, print with exactly two decimals to avoid formatting ambiguity. This exercises writing and calling a basic function template, plus dispatching based on an input type tag.`,
                constraints: `Type tag is one of: int, double, string.
For int: 32-bit signed range.
For double: magnitude ≤ 1e12; print with fixed and two decimals.
For string: no spaces (tokens).
Comparison uses operator<; if equal, returning either is acceptable.`,
                sample_input: 'int 3 5',
                sample_output: '5',
                explanation: 'myMax<int>(3, 5) returns 5.'
            },
            {
                title: 'Generic swap using references',
                difficulty: 'Easy',
                description: `**Problem statement:**
Write a function template \`void mySwap(T& a, T& b)\` that swaps two values in place using a temporary (don’t use std::swap). Read a type tag and two values, swap them using your template, then print the swapped values. This reinforces reference semantics with templates.`,
                constraints: `Type tag: int, char, or string.
Values are single tokens; char is a single visible character.
32-bit int range.`,
                sample_input: 'char A Z',
                sample_output: 'Z A',
                explanation: 'mySwap<char>(A, Z) swaps the two characters.'
            },
            {
                title: 'Templated stats: min, max, sum for numeric types',
                difficulty: 'Medium',
                description: `**Problem statement:**
Implement a function template \`updateStats(const T& x, T& mn, T& mx, long double& sum)\` that updates running minimum, maximum, and sum for a numeric stream. Read a type tag and N, then N values of that type. Initialize mn and mx with the first value, and process the rest with updateStats. Print mn, mx, and sum. For type double, print all three with exactly two decimals; for int, print mn/mx as ints and sum as a 64-bit integer (no decimals). This tests type-agnostic accumulation with an appropriate wide sum type.`,
                constraints: `Type tag: int or double.
1 ≤ N ≤ 200000.
For int values: −1e9 ≤ x ≤ 1e9; use 64-bit sum.
For double values: |x| ≤ 1e12; use long double sum; print with two decimals.`,
                sample_input: `int 5
3 1 9 -2 8`,
                sample_output: '-2 9 19',
                explanation: 'mn=-2, mx=9, sum=19 via 64-bit accumulation.'
            },
            {
                title: 'Count elements greater than a pivot (generic comparison)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Write a function template \`size_t countGreater(const vector<T>& a, const T& pivot)\` that returns how many elements are strictly greater than pivot using operator>. Read a type tag, N, then N elements, and finally pivot. Support ints and strings (lexicographic). Print the count. This reinforces generic algorithms over different comparable types.`,
                constraints: `Type tag: int or string.
1 ≤ N ≤ 200000.
int range: −1e9..1e9; string tokens without spaces.
O(N) time.`,
                sample_input: `int 5
1 5 7 5 8
5`,
                sample_output: '2',
                explanation: 'Only 7 and 8 are strictly greater than 5.'
            },
            {
                title: 'Generic matrix multiplication with arithmetic-only constraint',
                difficulty: 'Hard',
                description: `**Problem statement:**
Implement a function template \`multiply<T>(const vector<vector<T>>& A, const vector<vector<T>>& B) -> vector<vector<T>>\` that multiplies an R×C matrix A by a C×K matrix B to produce an R×K result. Constrain T to arithmetic types (e.g., \`static_assert(std::is_arithmetic_v<T>)\`). Read a type tag (int or double), the dimensions R C K, then the matrices A and B. Print the result. For doubles, print each entry with two decimals; for ints, print raw integers. This problem tests writing nontrivial generic numeric code with templates and basic type traits.`,
                constraints: `Type tag: int or double.
1 ≤ R, C, K ≤ 500 (RCK up to about 1.25e8 multiplications is too big; to keep runtime reasonable, use RCK ≤ 5e6 for tests).
For int: values |x| ≤ 1e6; for double: |x| ≤ 1e6.
Use 64-bit intermediate for int to avoid overflow; double uses double.`,
                sample_input: `int 2 3 2
1 2 3
4 5 6
7 8
9 10
11 12`,
                sample_output: `58 64
139 154`,
                explanation: 'Row1·Col1 = 1*7 + 2*9 + 3*11 = 58; Row1·Col2 = 1*8 + 2*10 + 3*12 = 64; Row2 similarly gives 139 and 154.'
            }
        ];

        // 4. Define Questions - Subtopic: Class Templates
        const questionsClass = [
            {
                title: 'Box<T>: compute volume',
                difficulty: 'Easy',
                description: `**Problem statement:**
Design a class template \`Box<T>\` with fields T l, w, h and a method \`auto volume() const\` that returns l*w*h using a widened intermediate (e.g., long double for floating types, 128-bit if using builtins for integers). Read a type tag and three dimensions, construct \`Box<T>\`, and print volume. For double, print with exactly two decimals; for int, print as an integer. This introduces a simple value-holding class template with a type-agnostic computation.`,
                constraints: `Type tag: int or double.
For int: 0 ≤ l,w,h ≤ 1e6; compute in 64-bit to avoid overflow.
For double: 0 ≤ l,w,h ≤ 1e6; print with fixed two decimals.`,
                sample_input: 'int 3 4 5',
                sample_output: '60',
                explanation: 'Volume = 3*4*5 = 60.'
            },
            {
                title: 'Range<T>: membership test in a closed interval',
                difficulty: 'Easy',
                description: `**Problem statement:**
Create a class template \`Range<T>\` representing a closed interval [L, R] with L ≤ R and a method \`bool contains(const T& x) const\` that returns true if L ≤ x ≤ R using operator<=. Read a type tag, the bounds L and R, then Q queries x; print YES or NO for each. Support ints and strings (lexicographic). This practices a simple policy-free class template using only comparisons.`,
                constraints: `Type tag: int or string.
For int: |L|,|R|,|x| ≤ 1e9; ensure L ≤ R.
For string: tokens without spaces; lexicographic order.
1 ≤ Q ≤ 200000.`,
                sample_input: `int 3 7
4
2
3
7
8`,
                sample_output: `NO
YES
YES
NO`,
                explanation: 'Membership is inclusive at both ends.'
            },
            {
                title: 'Stack<T>: generic stack with push/pop/top/size',
                difficulty: 'Medium',
                description: `**Problem statement:**
Implement a class template \`Stack<T>\` backed by \`std::vector<T>\` supporting:

\`void push(const T& x)\`
\`bool pop(T& out)\` — returns false if empty; on success writes the popped value to out
\`bool top(T& out) const\` — returns false if empty; otherwise writes top to out without removing
\`size_t size() const\`
Read a type tag (int or string) and Q commands:
PUSH x — push x
POP — pop and print popped value or EMPTY
TOP — print top value or EMPTY
This problem reinforces templated containers, reference outputs, and I/O handling for multiple types.`,
                constraints: `Type tag: int or string.
1 ≤ Q ≤ 200000.
For int: 32-bit; for string: no spaces.`,
                sample_input: `int
5
PUSH 1
POP
POP
PUSH 10
TOP`,
                sample_output: `1
EMPTY
10`,
                explanation: 'First POP returns 1. Second POP on empty prints EMPTY. TOP shows current top 10.'
            },
            {
                title: 'Matrix<T>: addition of two matrices',
                difficulty: 'Medium',
                description: `**Problem statement:**
Create a class template \`Matrix<T>\` that stores rows, cols, and a flat \`std::vector<T>\` data (row-major). Provide:

constructor Matrix(rows, cols, fill=T{})
\`T& at(r,c)\` and \`const T& at(r,c) const\`
\`Matrix add(const Matrix& other) const\` — same size required
Read a type tag (int or double), dimensions R C, and two matrices A and B. Compute C = A.add(B) and print it in R lines with C entries each. For doubles, print with two decimals. This problem leans on class templates with simple elementwise operations.`,
                constraints: `Type tag: int or double.
1 ≤ R,C ≤ 1000 (R*C ≤ 2e6 total elements across both matrices for tests).
For int: values |x| ≤ 1e9; for double: |x| ≤ 1e9.`,
                sample_input: `int 2 3
1 2 3
4 5 6
-1 0 1
1 1 1`,
                sample_output: `0 2 4
5 6 7`,
                explanation: 'Elementwise addition.'
            },
            {
                title: 'Fenwick<T> (Binary Indexed Tree) for prefix sums',
                difficulty: 'Hard',
                description: `**Problem statement:**
Implement a class template \`Fenwick<T>\` that supports:

\`Fenwick(int n)\`: constructs a 1-based tree of size n with all zeros.
\`void add(int idx, T delta)\`: adds delta to a[idx].
\`T sum(int idx) const\`: returns sum_{i=1..idx} a[i].
Optionally: build from an initial vector in O(n) if you like, but not required.
Restrict T to arithmetic via \`static_assert(std::is_arithmetic_v<T>)\`. Read:
N and an initial array of N values (1-based in the description, but you can load from 0-based and adjust).
Q operations:
ADD i x: a[i] += x
SUM r: print sum_{1..r}
Use 64-bit (long long) for int tests and double for floating tests if provided; for this task we’ll use integral data. This problem tests a nontrivial data structure as a class template.`,
                constraints: `1 ≤ N, Q ≤ 200000
1 ≤ i, r ≤ N
Values and deltas fit 64-bit signed
O(log N) per add/sum`,
                sample_input: `5
1 2 3 4 5
3
SUM 3
ADD 2 -2
SUM 5`,
                sample_output: `6
13`,
                explanation: 'Initial prefix(3) = 1+2+3 = 6. After ADD 2 -2, array is [1,0,3,4,5], so prefix(5) = 13.'
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
        await insertQuestions(questionsFunction, subtopics[0]);
        await insertQuestions(questionsClass, subtopics[1]);

        console.log('C++ Templates Module Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

setupCppTemplatesModule();
