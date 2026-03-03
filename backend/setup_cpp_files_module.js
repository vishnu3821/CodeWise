const db = require('./config/db');

async function setupCppFilesModule() {
    try {
        console.log('Starting C++ Files Module Setup...');

        // 1. Get C++ Language ID
        const [langRows] = await db.query("SELECT id FROM languages WHERE slug = 'cpp'");
        if (langRows.length === 0) {
            console.error('C++ Language not found!');
            process.exit(1);
        }
        const languageId = langRows[0].id; // Should be 2 usually
        console.log(`C++ Language ID: ${languageId}`);

        // 2. Add "Files" Topic
        console.log('Adding "Files" Topic...');
        await db.query(`
            INSERT IGNORE INTO topics (language_id, name, slug, order_index, is_active)
            VALUES (?, 'Files', 'files', 20, 1)
        `, [languageId]);

        const [topicRows] = await db.query("SELECT id FROM topics WHERE slug = 'files' AND language_id = ?", [languageId]);
        const topicId = topicRows[0].id;
        console.log(`Topic ID: ${topicId}`);

        // 3. Define Subtopics
        const subtopics = [
            { name: 'Create and Write Files', slug: 'create-write-files', order: 1 },
            { name: 'Read Files', slug: 'read-files', order: 2 }
        ];

        // 4. Define Questions
        const questions1 = [
            {
                title: 'Write K greeting lines to a file',
                difficulty: 'Easy',
                description: `**Problem statement:**
You will be given a name and a non-negative integer K. Create (or overwrite) a text file named \`greet.txt\` in the current working directory. Write exactly K lines to the file. The i-th line (1-indexed) must be:
\`i: Hello, NAME!\`
The file must contain exactly K lines, with each line ending in a single '\\n'. After writing, print a single status line to stdout:
\`WROTE K LINES\`
This exercise focuses on using \`std::ofstream\`, choosing the proper open mode (\`std::ios::out\` truncates by default), and being careful about line formatting and newlines. If K = 0, create \`greet.txt\` and leave it empty (0 lines), then still print "WROTE 0 LINES".`,
                constraints: `0 ≤ K ≤ 200000
NAME is a printable ASCII string without newlines; length 1..100 (if K>0)
Total output size ≤ 2 × 10^6 characters`,
                sample_input: 'Ravi 3',
                sample_output: 'WROTE 3 LINES',
                explanation: `greet.txt is overwritten with:
1: Hello, Ravi!
2: Hello, Ravi!
3: Hello, Ravi!
Each line ends with exactly one '\\n'. The status line confirms the exact number of lines written.`
            },
            {
                title: 'Save integers to nums.txt and report sum/min/max',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read an integer N, then read N 32-bit integers. Create or overwrite a text file \`nums.txt\`. Write the N integers to the file, one per line, with each line terminated by '\\n'. While writing, compute the sum, minimum, and maximum of the numbers. After closing the file, print to stdout:
\`SUM s MIN m MAX M\`
Use 64-bit (long long) for the sum to prevent overflow. This task covers correct line formatting, handling negative numbers, and basic aggregation during output.`,
                constraints: `1 ≤ N ≤ 200000
Each integer fits in 32-bit: −1e9 ≤ ai ≤ 1e9
Use 64-bit sum; total written text ≤ 3 × 10^6 characters`,
                sample_input: `5
1 2 3 4 5`,
                sample_output: 'SUM 15 MIN 1 MAX 5',
                explanation: `nums.txt contains:
1
2
3
4
5
While writing, accumulate sum=15, min=1, max=5. The printed summary reflects these aggregates.`
            },
            {
                title: 'Write a JSON Lines (JSONL) cart and print grand total',
                difficulty: 'Medium',
                description: `**Problem statement:**
You will read an integer N, then N lines of cart items. Each item has a product name p, a non-negative integer quantity q, and a non-negative price per unit pr with at most two decimals. Create (or overwrite) a file \`cart.jsonl\` where each cart item is written as a single-line JSON object:
\`{"product":"p","qty":q,"price":pr,"total":q*pr}\`

product contains only letters/digits/underscores (no quoting complications beyond enclosing in quotes).
price and total should be printed with exactly two decimals.
After writing all N lines, print to stdout:
\`WROTE N LINES TOTAL G\`
where G is the grand total sum of q*pr across all items, shown with exactly two decimals. This exercises structured text writing, numerical formatting, and accumulation while streaming to a file.`,
                constraints: `0 ≤ N ≤ 200000
product: [A-Za-z0-9_]{1,64}
0 ≤ q ≤ 10^9
0 ≤ pr ≤ 10^9 with at most two decimals
Use 64-bit or long double for intermediate totals; print with fixed two decimals
File size ≤ ~5 × 10^6 characters for tests`,
                sample_input: `2
apple 2 3.50
banana 1 1.25`,
                sample_output: 'WROTE 2 LINES TOTAL 8.25',
                explanation: `cart.jsonl contains:
{"product":"apple","qty":2,"price":3.50,"total":7.00}
{"product":"banana","qty":1,"price":1.25,"total":1.25}
Grand total G = 7.00 + 1.25 = 8.25. Fixed formatting ensures two decimals.`
            },
            {
                title: 'Append to app.log with counters and support RESET',
                difficulty: 'Medium',
                description: `**Problem statement:**
Maintain a log file \`app.log\`. You will process Q commands:

\`MSG text...\`
Append "[k] text" followed by '\\n' to app.log, where k is the 1-based message counter since the most recent RESET. Increment k after appending.
\`RESET\`
Truncate (clear) app.log and reset the message counter k back to 0.
Open the file in append mode for MSG so previous content is preserved (unless RESET was used), and in truncation mode for RESET. After all commands, print:
\`WROTE M\`
where M is the total number of MSG commands processed (including those before/after resets). This problem tests correct handling of open modes (std::ios::app vs std::ios::trunc), consistent numbering, and robust line parsing for messages that may include spaces.`,
                constraints: `1 ≤ Q ≤ 200000
"text" may include spaces; no embedded newlines
Total bytes written ≤ 2 × 10^6
File operations should be flushed/closed before exit`,
                sample_input: `4
MSG hello
MSG world
RESET
MSG again`,
                sample_output: 'WROTE 3',
                explanation: `Steps:
MSG hello → k=1, write "[1] hello\\n"
MSG world → k=2, write "[2] world\\n"
RESET → truncate file, set k=0
MSG again → k=1 again, write "[1] again\\n"
There were 3 MSG commands total.`
            },
            {
                title: 'Write a binary ledger file and report final balance',
                difficulty: 'Hard',
                description: `**Problem statement:**
Create a binary file \`ledger.bin\` with the exact format below (all numeric fields little-endian):

Header: 4 ASCII bytes 'L' 'E' 'D' '1'
Initial balance: 64-bit signed integer (int64)
Operation count N: 32-bit unsigned integer (uint32)
N operation records, each:
op: 1 byte, either 'D' (deposit) or 'W' (withdraw)
amount: 64-bit unsigned integer (uint64), the absolute amount
You are given the initial balance B0, an integer N, then N lines of operations with op and amount. Write the file exactly in this sequence using ofstream::write and reinterpret_cast<const char*>(&value). After writing all bytes, compute and print to stdout:
\`BYTES X FINAL Y\`
where X = 4 + 8 + 4 + N*(1 + 8) = 16 + 9N (total bytes written), and Y is the final balance after applying the operations in order:
'D' adds amount
'W' subtracts amount
Use 128-bit intermediate math if needed during accumulation, but Y fits in signed 64-bit for tests.`,
                constraints: `|B0| ≤ 10^15 (fits in 64-bit)
0 ≤ N ≤ 200000
0 ≤ amount ≤ 10^12
Final balance fits in signed 64-bit
Total bytes ≤ about 2 MB`,
                sample_input: `100 3
D 50
W 20
D 5`,
                sample_output: 'BYTES 43 FINAL 135',
                explanation: `X = 16 + 9*3 = 43. Starting at 100: +50 → 150; −20 → 130; +5 → 135. The file begins with 'L''E''D''1', then B0, then N, then 3 records.`
            }
        ];

        const questions2 = [
            {
                title: 'Count lines in notes.txt',
                difficulty: 'Easy',
                description: `**Problem statement:**
A text file \`notes.txt\` exists in the current directory. Count how many lines it contains. A line is counted each time std::getline extracts a line, even if the line is empty. The last line counts whether or not it ends with '\\n' (getline handles this). Do not read any stdin values for this task; only read the file and print the count.`,
                constraints: `File size ≤ 2 × 10^6 bytes
Lines may be empty
File may be empty`,
                sample_input: `(notes.txt content):
hello
world`,
                sample_output: '2',
                explanation: `Two lines present, each terminated by '\\n'. The program prints 2.`
            },
            {
                title: 'Sum comma-separated integers in data.csv',
                difficulty: 'Easy',
                description: `**Problem statement:**
A file \`data.csv\` exists with exactly one line that contains zero or more 32-bit integers separated by commas, with no spaces (e.g., "1,2,3" or empty string for zero numbers). Parse the line, sum the integers in 64-bit, count how many numbers there are, and print:
\`COUNT c SUM s\`
This problem exercises reading a whole line, splitting on commas, and robustly handling the empty-line case.`,
                constraints: `Line length ≤ 2 × 10^6 characters
Each integer fits in 32-bit: −1e9 ≤ x ≤ 1e9
0 ≤ count ≤ 200000`,
                sample_input: `(data.csv content):
1,2,3`,
                sample_output: 'COUNT 3 SUM 6',
                explanation: `Three values sum to 6.`
            },
            {
                title: 'Read a matrix and find max-sum row and column',
                difficulty: 'Medium',
                description: `**Problem statement:**
A file \`matrix.txt\` is present with the following format:

First line: two integers R C (1 ≤ R, C ≤ 2000)
Next R lines: each line has exactly C integers (32-bit) separated by single spaces
Read the matrix safely and compute:
rMax: the 0-based index of the row with the maximum row sum (break ties by choosing the smallest index)
cMax: the 0-based index of the column with the maximum column sum (break ties by choosing the smallest index)
Print both indices and the corresponding sums in one line:
\`ROW rMax SUM rs COL cMax SUM cs\`
Use 64-bit accumulation to avoid overflow. This problem emphasizes structured file parsing, handling large but bounded input, and performing two passes (or one combined pass) efficiently.`,
                constraints: `1 ≤ R, C ≤ 2000
|a[i][j]| ≤ 1e9
Use 64-bit for partial and final sums
Total numbers ≤ 4 × 10^6 (fits in memory/time with careful code)`,
                sample_input: `(matrix.txt content):
3 3
1 2 3
4 5 6
7 8 9`,
                sample_output: 'ROW 2 SUM 24 COL 2 SUM 18',
                explanation: `Row sums: [6, 15, 24] → rMax=2, rs=24. Column sums: [12, 15, 18] → cMax=2, cs=18.`
            },
            {
                title: 'Count INFO/WARN/ERROR lines in app.log',
                difficulty: 'Medium',
                description: `**Problem statement:**
A logfile \`app.log\` exists where each line may start with one of these exact, case-sensitive prefixes (each followed by a space):

"[INFO] "
"[WARN] "
"[ERROR] "
Read the file line by line and count how many lines belong to each category. Lines that do not start with one of the three exact prefixes are ignored. Print the counts on a single line:
\`INFO x WARN y ERROR z\`
This problem reinforces robust prefix checking and text scanning.`,
                constraints: `File size ≤ 5 × 10^6 bytes
Lines may be empty
Only these three prefixes count`,
                sample_input: `(app.log content):
[INFO] Starting
[WARN] Low disk
[INFO] Running
[ERROR] Crash`,
                sample_output: 'INFO 2 WARN 1 ERROR 1',
                explanation: `Exactly two INFO lines, one WARN, one ERROR. Any other lines (not present here) would be ignored.`
            },
            {
                title: 'Read a binary ledger file and compute final balance and counts',
                difficulty: 'Hard',
                description: `**Problem statement:**
A binary ledger file \`ledger.bin\` exists with this exact layout (little-endian), matching the writer from the "create and write files" hard problem:

4-byte ASCII header: 'L' 'E' 'D' '1'
int64 initial balance B0
uint32 N (number of records)
N records, each:
op: 1 byte, 'D' for deposit or 'W' for withdraw
amount: uint64 absolute amount
Your program must:
Open ledger.bin in binary mode, read and validate the 'LED1' header.
Read B0 and N, then read exactly N records.
Compute:
final balance: start at B0; for each record, add amount for 'D', subtract amount for 'W' (use 128-bit intermediate if you like; final fits 64-bit).
dCount = number of deposits
wCount = number of withdrawals
Print a single line:
\`FINAL Y DEPOSITS dCount WITHDRAWALS wCount\`
If the header is incorrect or the file is too short to read the claimed data, the robust approach is to treat it as invalid input; for this problem's tests, the file is valid.`,
                constraints: `0 ≤ N ≤ 200000
|B0| ≤ 10^15
0 ≤ amount ≤ 10^12
Final balance fits signed 64-bit
File size ≤ ~2 MB`,
                sample_input: `(ledger.bin content):
Header + B0=100 + N=3
Records: ('D', 50), ('W', 20), ('D', 5)`,
                sample_output: 'FINAL 135 DEPOSITS 2 WITHDRAWALS 1',
                explanation: `100 + 50 − 20 + 5 = 135. There are two deposits and one withdrawal.`
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
        await insertQuestions(questions1, subtopics[0]);
        await insertQuestions(questions2, subtopics[1]);

        console.log('C++ Files Module Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

setupCppFilesModule();
