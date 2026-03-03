const db = require('./config/db');

async function addThreadsQuestions() {
    try {
        console.log('Adding C++ Threads Questions to Existing Subtopic...');

        const topicId = 49;
        const subtopicId = 136;
        const languageId = 2; // C++

        const questionsThreads = [
            {
                title: 'Hello from N threads (deterministic order)',
                difficulty: 'Easy',
                description: `**Problem statement:**
You are given an integer T (number of threads). Launch exactly T std::thread workers. Each worker should prepare a string of the form:
Hello from thread i
where i is the worker’s 0-based index.
To keep the output deterministic (since thread execution order is unspecified), do not print from worker threads. Instead, give each thread its index i, have it write its message into a shared vector<string> at position i, and then join all the threads in main. After joining, print the T lines from i=0 to T-1 in ascending index order. This exercise focuses on launching threads, passing arguments, writing into a pre-sized shared container in a race-free way (each thread writes to a unique slot), and joining all threads.`,
                constraints: `1 ≤ T ≤ 64
Use std::thread (not std::jthread).
Do not call detach(); always join all threads.
Avoid data races by assigning each thread a unique write position.`,
                sample_input: '3',
                sample_output: `Hello from thread 0
Hello from thread 1
Hello from thread 2`,
                explanation: 'Three workers write into slots 0,1,2 of a shared vector. Main prints in index order, guaranteeing deterministic output regardless of scheduling.'
            },
            {
                title: 'Parallel sum with T threads over disjoint chunks',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N (number of integers) and T (number of threads), followed by N 32-bit integers. Compute the 64-bit sum of all numbers using exactly T threads. Partition the array into T nearly equal contiguous chunks: for thread k in [0..T-1], assign indices [start_k, end_k) such that chunks differ in size by at most 1 and cover the whole array without overlap. Each thread computes a 64-bit partial sum of its chunk and writes it to partial[k]. After joining all threads, main adds partial[0..T-1] and prints the grand sum. This emphasizes chunking, race-free writes (each thread owns its slot), and join.`,
                constraints: `1 ≤ N ≤ 200000
1 ≤ T ≤ 64 (T can be greater than N; some threads will have empty chunks)
Each value fits in 32-bit int (−1e9 ≤ ai ≤ 1e9)
Use 64-bit (long long) for partial and final sums`,
                sample_input: `5 2
1 2 3 4 5`,
                sample_output: '15',
                explanation: 'Thread 0: indices [0..2) → {1,2} → sum=3. Thread 1: indices [2..5) → {3,4,5} → sum=12. Total = 3 + 12 = 15.'
            },
            {
                title: 'Parallel first index of a target using an atomic minimum',
                difficulty: 'Medium',
                description: `**Problem statement:**
Given N integers, T threads, and a target K, find the smallest index i such that a[i] == K using multiple threads scanning in parallel. Partition the array into T contiguous chunks as in Q2. Use an atomic<int> best initialized to a large sentinel (e.g., INT_MAX). Each thread scans its chunk from left to right; when it finds a match at index i, it tries to reduce best to i using an atomic compare-and-exchange (or fetch_min if available). At the end, if best was updated from INT_MAX, print best; otherwise print -1. This demonstrates safe, lock-free “publish the smallest index” behavior and avoiding data races on shared state.`,
                constraints: `1 ≤ N ≤ 200000
1 ≤ T ≤ 64
−1e9 ≤ a[i], K ≤ 1e9
Use 0-based indices in output`,
                sample_input: `7 3
5 1 9 3 3 2 9
3`,
                sample_output: '3',
                explanation: 'Matches occur at indices 3 and 4. The atomic best ends at 3 (the smaller).'
            },
            {
                title: 'Multi-consumer pipeline with a thread-safe queue (producer/consumers)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Implement a simple parallel pipeline. You will be given two integers N and C. One producer thread must enqueue each integer x from 1 to N into a thread-safe queue (FIFO). Then spawn C consumer threads. Each consumer repeatedly pops a value x, computes f(x) = x*x (64-bit), and stores it into result[x-1]. When the producer is done, it pushes exactly C sentinel values (e.g., 0) to signal termination; upon receiving the sentinel, a consumer stops. After all consumers join, print the result array from index 0 to N-1 on one line (space-separated). You must implement the queue using std::mutex + std::condition_variable to ensure correctness and avoid busy-waiting. This problem highlights basic producer/consumer coordination, sentinels for shutdown, and writing results deterministically by index.`,
                constraints: `0 ≤ N ≤ 200000
1 ≤ C ≤ 64
Use 64-bit (long long) to store squares
The queue must be safe for 1 producer + C consumers
Sentinel must not be confused with a real work item (use 0 as sentinel since x ranges 1..N)`,
                sample_input: '5 2',
                sample_output: '1 4 9 16 25',
                explanation: 'Producer enqueues 1..5, then two sentinels 0. Consumers compute squares and store in result[x-1].'
            },
            {
                title: 'Parallel matrix multiplication (R×C) · (C×K) with row-striping across T threads',
                difficulty: 'Hard',
                description: `**Problem statement:**
Compute the product of two integer matrices A (R×C) and B (C×K) into matrix P (R×K) using exactly T worker threads. Partition the output rows [0..R-1] into T contiguous stripes as evenly as possible: thread k computes rows [start_k, end_k) of P. For each output cell P[r][c], compute the 64-bit dot product of A’s row r and B’s column c:
P[r][c] = Σ (A[r][j] * B[j][c]) for j in 0..C-1.
Store results in a shared P (vector<vector<long long>> or flat vector). To keep it deterministic and race-free, ensure each thread writes only to its assigned rows and never touches others. After joining, print P as R lines with K numbers per line, space-separated.`,
                constraints: `1 ≤ R, C, K ≤ 600
1 ≤ T ≤ 64
|A[r][j]|, |B[j][c]| ≤ 1e6
Use 64-bit (long long) for P entries (accumulator and stored result)
To keep runtime reasonable, test data will satisfy RCK ≤ 5×10^6`,
                sample_input: `2 3 2 2
1 2 3
4 5 6
7 8
9 10
11 12`,
                sample_output: `58 64
139 154`,
                explanation: 'P[0][0] = 58, P[0][1] = 64, P[1][0] = 139, P[1][1] = 154. Two threads split rows {0} and {1}.'
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

        await insertQuestions(questionsThreads, { name: 'Threads', id: subtopicId });

        console.log('C++ Threads Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addThreadsQuestions();
