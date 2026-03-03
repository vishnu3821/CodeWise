const db = require('./config/db');

async function addMemoryManagementQuestions() {
    try {
        console.log('Adding C++ Memory Management Questions to Existing Subtopics...');

        const topicId = 47;
        const subtopicNewId = 133;
        const subtopicDeleteId = 134;
        const languageId = 2; // C++

        const questionsNew = [
            {
                title: 'Allocate one integer with new, modify, and print',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read a 32-bit integer v. Dynamically allocate a single int on the heap using new. Store v in that location, then multiply the stored value by 2 (via pointer dereference) and print the final value. Finally, release the memory with delete to avoid leaks. This exercise confirms you can allocate a scalar object with new, access it through a pointer, and free it correctly.`,
                constraints: `−1e9 ≤ v ≤ 1e9
Use 32-bit int for storage
Print using normal integer formatting`,
                sample_input: '12',
                sample_output: '24',
                explanation: 'Allocate an int, write 12, multiply through *p to 24, print 24, then delete p.'
            },
            {
                title: 'Allocate an array with new[] and compute the sum',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read an integer N, then read N 32-bit integers. Allocate an array of N ints with new[]. Copy the N numbers into the array and compute their sum using 64-bit accumulation. Print the sum, then free the array with delete[]. This reinforces using new[] for arrays and remembering to free arrays with delete[].`,
                constraints: `1 ≤ N ≤ 200000
Each integer fits 32-bit: −1e9 ≤ ai ≤ 1e9
Use 64-bit (long long) for the sum`,
                sample_input: `5
1 2 3 4 5`,
                sample_output: '15',
                explanation: 'new int[N] creates storage for 5 ints; compute 1+2+3+4+5, print 15, then delete[] arr.'
            },
            {
                title: 'Allocate a 2D matrix (int** + row arrays) and sum the main diagonal',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read integers R and C, then read R×C integers for a matrix in row-major order. Allocate an int** of size R (each entry points to a row), then allocate each row with new int[C]. Fill the matrix from input. Compute the sum of the main diagonal (positions (i,i) for i from 0 to min(R,C)−1) using 64-bit accumulation. Print the diagonal sum. Finally, free the matrix in the correct order: delete[] each row, then delete[] the array of row pointers.`,
                constraints: `1 ≤ R, C ≤ 2000
Elements fit in 32-bit int
Use 64-bit for the diagonal sum`,
                sample_input: `3 3
1 2 3
4 5 6
7 8 9`,
                sample_output: '15',
                explanation: 'Diagonal: 1 + 5 + 9 = 15. Allocate int** rows and int[C] per row, fill, sum, then free rows and the pointer array.'
            },
            {
                title: 'Allocate with nothrow and handle allocation failure',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read an integer N, then attempt to allocate a long long array of size N using new (nothrow). If allocation fails (i.e., the returned pointer is nullptr), print “FAILED” and do not attempt to read further numbers. Otherwise, read N values (each fits 64-bit), compute their sum (64-bit), print the sum, and free the array with delete[].`,
                constraints: `0 ≤ N ≤ 200000 (but students should still write code that handles failure)
Values fit in signed 64-bit`,
                sample_input: `4
1 2 3 4`,
                sample_output: '10',
                explanation: 'Allocation succeeds; sum is 10. After summing, delete[] arr.'
            },
            {
                title: 'Placement new: construct objects in a raw buffer and aggregate fields',
                difficulty: 'Hard',
                description: `**Problem statement:**
Define a trivial struct Point { long long x, y; }; You will read an integer M then M pairs (x, y). Allocate a raw byte buffer of size M*sizeof(Point) using new (std::nothrow) char[]. If allocation fails, print “FAILED”. Otherwise, construct each Point in-place using placement new at the correct byte offset within the buffer. Traverse the constructed objects to compute sumX = Σx and sumY = Σy (64-bit). Print “sumX sumY”. Finally, explicitly call the destructors (trivial here, but required in general) and free the raw buffer with delete[].`,
                constraints: `0 ≤ M ≤ 200000
|x|, |y| ≤ 10^12
Use 64-bit sums`,
                sample_input: `3
1 2
-1 4
5 -6`,
                sample_output: '5 0',
                explanation: 'Construct three Points in-place. Sums: x: 1 + (−1) + 5 = 5; y: 2 + 4 + (−6) = 0.'
            }
        ];

        const questionsDelete = [
            {
                title: 'Safe deletion of nullptr and clearing dangling pointers',
                difficulty: 'Easy',
                description: `**Problem statement:**
Demonstrate that deleting a nullptr is safe and that setting a pointer to nullptr after deletion avoids dangling references. Read a flag f (0 or 1) and optionally a value v (only used if f=1). If f==1, allocate a new int, store v, then delete it. If f==0, keep the pointer as nullptr. In both cases, set the pointer to nullptr after deletion (or if it was already null). Finally, print “OK” if the pointer is nullptr (it should be), otherwise print “ERR”.`,
                constraints: `f ∈ {0, 1}
If f=1: −1e9 ≤ v ≤ 1e9`,
                sample_input: '0',
                sample_output: 'OK',
                explanation: 'Pointer starts as nullptr; delete on nullptr is safe (a no-op). Setting to nullptr again keeps it null; print OK.'
            },
            {
                title: 'Allocate with new[], compute sum, then delete[] in delete submodule',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N and then N integers. Allocate an array of N ints with new[]. Copy the values, compute their sum in 64-bit, print the sum, and free the memory using delete[]. This exercise underlines correct pairing: arrays allocated with new[] must be released with delete[].`,
                constraints: `1 ≤ N ≤ 200000
−1e9 ≤ ai ≤ 1e9
Use 64-bit for the sum`,
                sample_input: `4
10 20 30 40`,
                sample_output: '100',
                explanation: 'Sum is 100; free the array with delete[].'
            },
            {
                title: 'Multiple testcases: allocate, process, delete each time',
                difficulty: 'Medium',
                description: `**Problem statement:**
Process T testcases. For each testcase, read N, then read N 64-bit integers. Dynamically allocate a long long array of size N with new[], compute the sum of squares (Σ ai^2) in 128-bit intermediate or long double (but print as 64-bit if it fits the constraints), print the per-test sum of squares, and free the array with delete[] before moving to the next testcase.`,
                constraints: `1 ≤ T ≤ 200000 (but the total sum of all N across tests ≤ 200000)
|ai| ≤ 10^9`,
                sample_input: `2
3
1 2 3
2
-1 2`,
                sample_output: `14
5`,
                explanation: 'Test1: 1^2 + 2^2 + 3^2 = 14. Test2: (−1)^2 + 2^2 = 5. Arrays are freed after each test.'
            },
            {
                title: 'Allocate and delete a 2D matrix properly, compute border sum',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read R and C, then read an R×C matrix. Allocate an int** (size R) and for each row allocate int[C] with new[]. Compute the sum of border elements (every element in the first and last rows, and the first/last element of each middle row; no double counting). Print the sum as a 64-bit integer. Then delete[] every row and finally delete[] the array of pointers.`,
                constraints: `1 ≤ R, C ≤ 2000
|a[i][j]| ≤ 1e9
Use 64-bit for the sum`,
                sample_input: `2 3
1 2 3
4 5 6`,
                sample_output: '21',
                explanation: 'With two rows, all cells are border: sum is 21.'
            },
            {
                title: 'Delete selected nodes from a singly linked list (freeing removed nodes)',
                difficulty: 'Hard',
                description: `**Problem statement:**
Build a singly linked list on the heap. Read N and then N integers in order; create Node structs with fields val and next using new, linking them to form the list. Then read a pivot P. Remove every node whose value is strictly less than P, ensuring you call delete on each removed node to avoid leaks. Maintain the relative order of nodes you keep. Finally, print the remaining list’s values on one line (space-separated); if the list becomes empty, print EMPTY.`,
                constraints: `0 ≤ N ≤ 200000
−1e9 ≤ val, P ≤ 1e9
O(N) time; O(1) extra heap besides the list itself`,
                sample_input: `5
1 5 2 7 3
3`,
                sample_output: '5 7 3',
                explanation: 'Remove nodes with val < 3 → remove 1 and 2. Delete those nodes; remaining order is 5, 7, 3.'
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

        await insertQuestions(questionsNew, { name: 'New', id: subtopicNewId });
        await insertQuestions(questionsDelete, { name: 'Delete', id: subtopicDeleteId });

        console.log('C++ Memory Management Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addMemoryManagementQuestions();
