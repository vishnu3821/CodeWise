const db = require('./config/db');

async function addStlQuestions() {
    try {
        console.log('Adding STL Questions to Existing Subtopics...');

        // Hardcoded IDs from previous check to be safe, but can also query dynamically
        // Topic: STL (44)
        // Subtopics: Containers (127), Iterators (128), Algorithms (129)
        const topicId = 44;
        const subtopicMap = {
            'containers': 127,
            'iterators': 128,
            'algorithms': 129
        };

        // Questions Data
        const questionsContainers = [
            {
                title: 'Count unique words and print frequencies sorted by word',
                difficulty: 'Easy',
                description: `**Problem statement:**
You will read an integer N and then N words (tokens without spaces). Count how many times each distinct word appears. Print the number of distinct words D on the first line, and then print D lines with "word count" sorted by word in lexicographic ascending order. This problem emphasizes using STL containers for counting and ordering: an \`unordered_map\` (fast counting) combined with a \`vector\` of pairs + sort, or just a \`map\` directly (already ordered).`,
                constraints: `1 ≤ N ≤ 200000
Each word length: 1..50, ASCII letters/digits/underscore only
Total input size ≤ 2 × 10^6 characters
O(N log U) where U is number of unique words`,
                sample_input: `6
apple banana apple pear pear pear`,
                sample_output: `3
apple 2
banana 1
pear 3`,
                explanation: 'Distinct words are apple, banana, pear. Counts: 2, 1, 3. Sorted by word.'
            },
            {
                title: 'Deque command processor',
                difficulty: 'Easy',
                description: `**Problem statement:**
Maintain a double-ended queue (\`std::deque<int>\`). You will process Q commands:

\`PUSH_FRONT x\`
\`PUSH_BACK x\`
\`POP_FRONT\`
\`POP_BACK\`
\`FRONT\`
\`BACK\`
\`SIZE\`
\`EMPTY\`
For commands that need to print a value (POP_, FRONT, BACK), print the integer or "EMPTY" if the deque is empty at that moment. POP_ removes the element only if present. This practices the standard deque interface.`,
                constraints: `1 ≤ Q ≤ 200000
|x| ≤ 1e9
Total prints ≤ Q`,
                sample_input: `6
PUSH_BACK 1
PUSH_FRONT 2
FRONT
BACK
POP_BACK
POP_FRONT`,
                sample_output: `2
1
1
2`,
                explanation: 'Deque evolves: [1] → [2,1]; FRONT=2, BACK=1; POP_BACK removes 1; POP_FRONT removes 2.'
            },
            {
                title: 'Merge K sorted arrays using a min-heap',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given K sorted arrays of integers. Merge them into a single sorted sequence. Use a min-heap (\`std::priority_queue\` with \`std::greater\`) of (value, which-array, index-in-array) to always extract the next smallest and push the successor from that array. Print the merged sequence on one line, space-separated. This tests a priority_queue plus vectors.`,
                constraints: `1 ≤ K ≤ 100000
Let Ni be the length of the i-th array; 0 ≤ Ni; total N = ΣNi satisfies 1 ≤ N ≤ 200000
Elements fit 32-bit signed
O(N log K)`,
                sample_input: `3
3 1 4 9
2 2 2
4 -1 0 3 10`,
                sample_output: '-1 0 1 2 2 3 4 9 10',
                explanation: 'Three arrays are merged in ascending order using a heap keyed on the current heads.'
            },
            {
                title: 'Dynamic multiset with MIN, MAX, and MEDIAN',
                difficulty: 'Medium',
                description: `**Problem statement:**
Maintain a multiset S of integers with Q operations:

\`ADD x\`: insert x
\`REMOVE x\`: remove exactly one occurrence of x if present (ignore if absent)
\`MIN\`: print the smallest element in S, or EMPTY if S is empty
\`MAX\`: print the largest element in S, or EMPTY if S is empty
\`MEDIAN\`: print the median where:
For size n, the index is floor((n-1)/2) when elements are sorted (i.e., lower median for even n)
If S is empty, MEDIAN prints EMPTY. This problem highlights multiset for duplicates and retrieving boundary elements. Efficient medians can be done with two multisets or tracking an iterator to the median, but any correct O(log N) per op solution is fine.`,
                constraints: `1 ≤ Q ≤ 200000
|x| ≤ 1e9
Total operations bounded to keep O(Q log Q) feasible`,
                sample_input: `8
ADD 5
ADD 2
ADD 9
MEDIAN
REMOVE 2
MIN
MAX
MEDIAN`,
                sample_output: `5
5
9
5`,
                explanation: 'Matches the lower-median rule for even size.'
            },
            {
                title: 'LRU Cache with GET/PUT using list + unordered_map',
                difficulty: 'Hard',
                description: `**Problem statement:**
Implement a Least Recently Used (LRU) cache of fixed capacity C for integer keys and values. Process Q operations:

\`GET k\`: If key k exists, print its value and mark it as most recently used; otherwise print -1.
\`PUT k v\`: Insert or update key k with value v and mark it most recently used; if the cache is at capacity and k is new, evict the least recently used item.
Use an \`std::list\` of (k,v) to represent recency (front = most recent, back = least), and an \`unordered_map<int, list<pair<int,int>>::iterator>\` to map keys to list nodes. After all operations, print a final line with the remaining keys from most recent to least as space-separated integers; if empty, print EMPTY.`,
                constraints: `1 ≤ C ≤ 200000
1 ≤ Q ≤ 200000
|k|, |v| ≤ 1e9
Each GET prints one line; PUT prints nothing
O(1) amortized per operation`,
                sample_input: `2 6
PUT 1 10
PUT 2 20
GET 1
PUT 3 30
GET 2
GET 3`,
                sample_output: `10
-1
30
3 1`,
                explanation: 'After GET 1, key 1 becomes most recent. PUT 3 evicts least recent (key 2). Final order: most→least is 3,1.'
            }
        ];

        const questionsIterators = [
            {
                title: 'Sum vector elements using iterators (no indexing)',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N and then N integers into a \`vector<int>\`. Compute the sum using only iterators (e.g., \`for (auto it = v.begin(); it != v.end(); ++it) sum += *it;\`). Do not use indexing v[i]. Print the sum as a 64-bit integer. This reinforces basic iterator traversal.`,
                constraints: `1 ≤ N ≤ 200000
Each value fits in 32-bit; use 64-bit (long long) for sum`,
                sample_input: `4
1 2 3 4`,
                sample_output: '10',
                explanation: '1+2+3+4 = 10.'
            },
            {
                title: 'Print a sequence in reverse using reverse iterators',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N and then N integers. Print them in reverse order using reverse iterators (rbegin/rend). Do not use indexing or \`std::reverse\`; iterate and print. This highlights \`reverse_iterator\` usage.`,
                constraints: `1 ≤ N ≤ 200000
32-bit integers`,
                sample_input: `5
1 2 3 4 5`,
                sample_output: '5 4 3 2 1',
                explanation: 'rbegin starts at the last element; iterate to rend.'
            },
            {
                title: 'Remove duplicates from a sorted forward_list',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given a sorted sequence of N integers. Store them in \`std::forward_list<int>\` (singly linked) and remove all duplicate consecutive values so that only one occurrence remains for each distinct value. Use only \`forward_list\` operations/iterators (no indexing). Print the resulting values in order, one line, space-separated. This exercises careful iterator stepping and erase-after on a singly linked list.`,
                constraints: `0 ≤ N ≤ 200000
Input sequence is non-decreasing`,
                sample_input: `8
1 1 2 2 2 5 5 7`,
                sample_output: '1 2 5 7',
                explanation: 'Consecutive duplicates collapsed to one each.'
            },
            {
                title: 'Iterator cursor on a vector with NEXT/PREV/ERASE/VALUE',
                difficulty: 'Medium',
                description: `**Problem statement:**
Start with a \`vector<int>\` built from N integers. Maintain a cursor iterator it, initially pointing to v.begin() (if N=0, treat it as "invalid/end"). Process Q commands:

\`NEXT k\`: advance it by k steps (it = std::next(it, k)) but do not go past v.end(); if k steps would pass end, set it = v.end()
\`PREV k\`: move backward by k steps; if that would move before v.begin(), set it = v.begin()
\`VALUE\`: if it != v.end(), print *it; else print INVALID
\`ERASE\`: if it != v.end(), erase the element at it (it = v.erase(it), which returns the next position). If it was end, print INVALID and do nothing. ERASE prints nothing on success.
At the end, print the final contents of the vector on one line (space-separated), or an empty line if empty. This problem emphasizes iterator arithmetic, \`std::next\`/\`std::prev\`, and how erase returns a new valid iterator.`,
                constraints: `0 ≤ N ≤ 200000
1 ≤ Q ≤ 200000
|values| ≤ 1e9`,
                sample_input: `5
10 20 30 40 50
5
VALUE
NEXT 2
VALUE
ERASE
VALUE`,
                sample_output: `10
30
40
10 20 40 50`,
                explanation: 'Start it at 10. After NEXT 2, it points to 30; VALUE prints 30. ERASE removes 30 and returns iterator to 40; VALUE prints 40. Final vector printed.'
            },
            {
                title: 'Tiny text editor with a bidirectional list cursor',
                difficulty: 'Hard',
                description: `**Problem statement:**
Build a tiny editor over \`std::list<char>\`. The cursor is an iterator pointing to a position between characters, represented as "before the element that the iterator refers to," like \`list::insert\` semantics. Start with an initial string S loaded into the list; set cursor to end() (i.e., after the last character). Process Q commands:

\`L\`: move cursor one position left (if not at begin)
\`R\`: move cursor one position right (if not at end)
\`INS c\`: insert character c at cursor (\`list.insert(cursor, c)\`) — cursor remains after the inserted char (advance once)
\`DEL\`: delete the character to the left of the cursor (like backspace). If there is no character to the left (cursor at begin), do nothing.
At the end, print the final text as a single line. This problem highlights stable iterators on list, constant-time insert/erase at the cursor, and careful cursor semantics.`,
                constraints: `|S| ≤ 200000
1 ≤ Q ≤ 200000
All characters are visible ASCII (no spaces in commands)
Total operations O(Q) with list operations O(1) average`,
                sample_input: `abc
5
L
L
INS X
R
DEL`,
                sample_output: 'aXc',
                explanation: 'Start "abc|". L → "ab|c"; L → "a|bc"; INS X → insert before cursor → "aX|bc" (cursor after X); R moves to "aXb|c"; DEL deletes left char "b" → "aX|c".'
            }
        ];

        const questionsAlgorithms = [
            {
                title: 'Sort numbers and remove duplicates',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N and then N integers. Sort the sequence in non-decreasing order and remove duplicates so each distinct value appears once. Print the de-duplicated sorted sequence on one line, space-separated. Use \`std::sort\` followed by \`std::unique\` and erase. This is the canonical "sort+unique" pattern.`,
                constraints: `0 ≤ N ≤ 200000
32-bit signed integers`,
                sample_input: `7
5 1 5 2 2 9 1`,
                sample_output: '1 2 5 9',
                explanation: 'Sorting then erasing duplicates leaves distinct ascending values.'
            },
            {
                title: 'Count numbers strictly greater than K using binary search',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read N, then N integers, and finally an integer K. Count how many numbers are strictly greater than K. Achieve O(N log N) or better by sorting and then using \`std::upper_bound\` to find the first element > K; answer is N - index. Print the count.`,
                constraints: `1 ≤ N ≤ 200000
32-bit signed integers; K fits 32-bit`,
                sample_input: `5
1 5 7 5 8
5`,
                sample_output: '2',
                explanation: 'After sorting, values > 5 start at first index where element > 5; only 7 and 8 qualify.'
            },
            {
                title: 'Stable sort students by score then name',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given N students: name (no spaces) and integer score. Sort them in descending score; for ties, sort by name ascending. Use \`std::stable_sort\` with a comparator (or sort with a comparator that enforces both keys; stable_sort is educational here). Print names in final order, one per line.`,
                constraints: `1 ≤ N ≤ 200000
name length ≤ 50 (ASCII, no spaces)
score fits 32-bit`,
                sample_input: `4
amy 90
bob 100
cara 90
dan 90`,
                sample_output: `bob
amy
cara
dan`,
                explanation: 'Score 100 first. Among (90,90,90), sorted by name: amy, cara, dan.'
            },
            {
                title: 'Stable partition: evens first, odds later (keep relative order)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Read N and then N integers. Reorder the sequence so that all even numbers come before all odd numbers while preserving the original relative order within the evens and within the odds. Use \`std::stable_partition\` with a lambda predicate "is even." Print the resulting sequence.`,
                constraints: `0 ≤ N ≤ 200000
32-bit signed integers
O(N log N) worst-case for stable_partition, practical performance acceptable`,
                sample_input: `7
3 2 4 1 6 5 8`,
                sample_output: '2 4 6 8 3 1 5',
                explanation: 'Evens (2,4,6,8) keep their original order; odds (3,1,5) keep theirs.'
            },
            {
                title: 'Median via nth_element and sum of absolute deviations',
                difficulty: 'Hard',
                description: `**Problem statement:**
Read N and then N integers. Compute the median m defined as the lower median:

For odd N, m is the element at index N/2 in the 0-based sorted order.
For even N, m is the element at index (N-1)/2 (the lower of the two middles).
Use \`std::nth_element\` to place m in its correct position in average linear time. Then compute S = Σ |ai − m| using 64-bit arithmetic and print m and S. This demonstrates \`nth_element\` to find an order statistic efficiently plus a follow-up pass to compute the L1 deviation.`,
                constraints: `1 ≤ N ≤ 200000
32-bit signed integers
Use 64-bit (long long) for S`,
                sample_input: `5
1 2 3 4 5`,
                sample_output: '3 6',
                explanation: 'm=3. Deviations: |1−3|+|2−3|+|3−3|+|4−3|+|5−3|=2+1+0+1+2=6.'
            }
        ];

        const insertQuestions = async (list, subtopicInfo) => {
            const subName = subtopicInfo; // Just string name/key
            const subtopicId = subtopicMap[subName];
            console.log(`Processing subtopic: ${subName} (ID: ${subtopicId})`);

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

        await insertQuestions(questionsContainers, 'containers');
        await insertQuestions(questionsIterators, 'iterators');
        await insertQuestions(questionsAlgorithms, 'algorithms');

        console.log('STL Questions Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

addStlQuestions();
