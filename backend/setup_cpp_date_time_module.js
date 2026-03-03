const db = require('./config/db');

async function setupCppDateTimeModule() {
    try {
        console.log('Starting C++ Date and Time Module Setup...');

        // 1. Get C++ Language ID
        const [langRows] = await db.query("SELECT id FROM languages WHERE slug = 'cpp'");
        if (langRows.length === 0) {
            console.error('C++ Language not found!');
            process.exit(1);
        }
        const languageId = langRows[0].id;
        console.log(`C++ Language ID: ${languageId}`);

        // 2. Add "Date and Time" Topic
        console.log('Adding "Date and Time" Topic...');
        // Order index 22 (after Exceptions which was 21)
        await db.query(`
            INSERT IGNORE INTO topics (language_id, name, slug, order_index, is_active)
            VALUES (?, 'Date and Time', 'date-and-time', 22, 1)
        `, [languageId]);

        const [topicRows] = await db.query("SELECT id FROM topics WHERE slug = 'date-and-time' AND language_id = ?", [languageId]);
        const topicId = topicRows[0].id;
        console.log(`Topic ID: ${topicId}`);

        // 3. Define Subtopics
        const subtopics = [
            { name: 'Date', slug: 'date', order: 1 },
            { name: 'Time', slug: 'time', order: 2 }
        ];

        // 4. Define Questions - Subtopic: Date
        const questionsDate = [
            {
                title: 'Day of year (1..365/366)',
                difficulty: 'Easy',
                description: `**Problem statement:**
You are given a Gregorian calendar date in the format YYYY-MM-DD. Compute its day-of-year (DOY), where January 1 is 1, and December 31 is 365 in common years or 366 in leap years. A leap year is defined as: year divisible by 400, or divisible by 4 but not by 100. Print the DOY as an integer. This problem focuses on robust month-length handling and correct leap-year logic.`,
                constraints: `Year range: 1900 ≤ YYYY ≤ 9999
Date is guaranteed valid
Use 64-bit only if you like; int is sufficient`,
                sample_input: '2024-03-01',
                sample_output: '61',
                explanation: '2024 is a leap year. Days before March: Jan 31 + Feb 29 = 60. March 1 is the 61st day.'
            },
            {
                title: 'Absolute days between two dates',
                difficulty: 'Easy',
                description: `**Problem statement:**
You are given two valid Gregorian dates d1 and d2 in the format YYYY-MM-DD. Compute the absolute difference in whole days between them, i.e., |toDays(d2) − toDays(d1)|, where toDays maps a date to a day count from a fixed epoch (any consistent algorithm is fine). Do not "+1" for inclusivity; if both dates are the same, the answer is 0.`,
                constraints: `1900 ≤ years ≤ 9999
Dates are valid`,
                sample_input: `2023-01-01
2023-01-02`,
                sample_output: '1',
                explanation: 'The dates are one day apart.'
            },
            {
                title: 'Add K days to a date (K may be negative)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Given a valid date D = YYYY-MM-DD and an integer K (which may be negative), add K days to D and print the resulting date in the same format. Correctly handle month/year rollovers and leap years. This problem tests a well-structured conversion between date and an absolute day count, arithmetic on days, and conversion back.`,
                constraints: `1900 ≤ YYYY ≤ 9999 (input date)
-1e6 ≤ K ≤ 1e6
Result date will still be within 0001-01-01 to 9999-12-31`,
                sample_input: '2023-12-31 1',
                sample_output: '2024-01-01',
                explanation: 'Adding 1 day crosses into the next year.'
            },
            {
                title: 'Count periodic occurrences in a date range',
                difficulty: 'Medium',
                description: `**Problem statement:**
You are given:

A base date B (YYYY-MM-DD) when a recurring event first occurs.
A positive integer step K (in days).
A closed date range [S, E] (YYYY-MM-DD inclusive).
The event occurs on dates B, B+K, B+2K, … Count how many occurrences fall within [S, E]. The task reduces to counting how many integers t ≥ 0 satisfy S ≤ B + tK ≤ E, which you can solve via day-number arithmetic and integer division.`,
                constraints: `Dates valid; 1900 ≤ years ≤ 9999
1 ≤ K ≤ 10^9
S ≤ E`,
                sample_input: `2024-01-01
2024-01-01
2024-01-31
7`,
                sample_output: '5',
                explanation: 'Occurs on 1st, 8th, 15th, 22nd, 29th (five times). Dates 36th etc. are outside January.'
            },
            {
                title: 'Count business days between two dates with holidays',
                difficulty: 'Hard',
                description: `**Problem statement:**
Count the number of business days between dates S and E inclusive, where business days are Monday through Friday excluding a provided set of holiday dates. A holiday removes a business day only if it lands on a weekday within [S, E]; holidays on weekends do not change the count further (weekends are already excluded). Input provides H holiday dates; duplicates should be ignored. Print the business-day count.`,
                constraints: `All dates valid; 1900 ≤ years ≤ 9999
0 ≤ H ≤ 2000
0 ≤ (E − S) in days ≤ 200000
Treat Saturday/Sunday as weekends
Use a fast day-of-week computation (e.g., via days-from-epoch mod 7)`,
                sample_input: `2024-05-01
2024-05-07
1
2024-05-03`,
                sample_output: '4',
                explanation: 'Range covers Wed 1 to Tue 7 (2024 calendar). Weekdays within range: Wed(1), Thu(2), Fri(3), Mon(6), Tue(7) → 5 weekdays. Holiday 2024-05-03 is a Friday in-range, so subtract 1 → 4.'
            }
        ];

        // 4. Define Questions - Subtopic: Time
        const questionsTime = [
            {
                title: 'Total seconds since midnight',
                difficulty: 'Easy',
                description: `**Problem statement:**
Given a time of day in 24-hour format HH:MM:SS (00 ≤ HH ≤ 23, 00 ≤ MM,SS ≤ 59), compute the total number of seconds since midnight. Print the integer in [0, 86399]. This reinforces basic parsing and unit conversion.`,
                constraints: `Time is valid
00 ≤ HH ≤ 23; 00 ≤ MM, SS ≤ 59`,
                sample_input: '00:00:00',
                sample_output: '0',
                explanation: 'Midnight is zero seconds from midnight.'
            },
            {
                title: 'Add K seconds to a time (wrap within 24h)',
                difficulty: 'Easy',
                description: `**Problem statement:**
Read a valid time HH:MM:SS and an integer K (seconds; may be negative). Add K seconds to the time and wrap around within a 24-hour day. Output the resulting time in HH:MM:SS with two digits per field. This problem stresses modular arithmetic and careful normalization for negative results.`,
                constraints: `Valid time input
-10^12 ≤ K ≤ 10^12
Wrap modulo 86400 seconds`,
                sample_input: `23:59:50
15`,
                sample_output: '00:00:05',
                explanation: '10 seconds to midnight plus 5 more wraps to 5 seconds past midnight.'
            },
            {
                title: 'Forward elapsed time between two times (crossing midnight allowed)',
                difficulty: 'Medium',
                description: `**Problem statement:**
Given two valid times t1 and t2 (HH:MM:SS), compute the forward elapsed time from t1 to t2. If t2 ≥ t1 on the same day, the duration is t2 − t1. Otherwise, the duration wraps to the next day: (24h − t1) + t2. Print the duration in HH:MM:SS with two digits per field. This addresses wrap-around logic precisely.`,
                constraints: `Valid times
Duration fits within [00:00:00, 23:59:59]`,
                sample_input: `12:00:00
13:30:00`,
                sample_output: '01:30:00',
                explanation: 'Same-day forward difference: 1 hour 30 minutes.'
            },
            {
                title: 'Total covered time from possibly overlapping intervals',
                difficulty: 'Medium',
                description: `**Problem statement:**
You will read N intervals within a single day. Each interval is given as start and end times in HH:MM:SS, representing a half-open interval [start, end), and is guaranteed to satisfy start < end and both within 00:00:00..23:59:59. Intervals may overlap. Compute the total number of seconds covered by the union of intervals. This requires parsing times to seconds, sorting by start, merging overlaps, and summing lengths.`,
                constraints: `1 ≤ N ≤ 200000
All times valid; intervals do not wrap across midnight
Use 64-bit to sum seconds`,
                sample_input: `2
09:00:00 10:00:00
09:30:00 11:00:00`,
                sample_output: '7200',
                explanation: 'Union is [09:00,11:00) with length 2 hours = 7200 sec.'
            },
            {
                title: 'Circular average time-of-day (mean on a 24h clock)',
                difficulty: 'Hard',
                description: `**Problem statement:**
You are given M time-of-day values in 24-hour format HH:MM:SS. Compute their circular average (mean on the clock), which properly accounts for wrap-around (e.g., the average of 23:50 and 00:10 is 00:00, not 12:00). Map each time to an angle θ = 2π * seconds/86400, convert to a unit vector (cos θ, sin θ), average the vectors, and take the angle of the result via atan2. Convert this mean angle back to time-of-day (round to the nearest second) and print HH:MM:SS. If the average vector has near-zero magnitude (values evenly cancel out), you may define a tie-breaking rule: print 00:00:00.`,
                constraints: `1 ≤ M ≤ 200000
All times valid HH:MM:SS
Use double or long double for trig and averaging
Rounding to nearest second; wrap result modulo 86400`,
                sample_input: `2
23:50:00
00:10:00`,
                sample_output: '00:00:00',
                explanation: 'The times straddle midnight symmetrically; the circular mean lies at midnight.'
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
        await insertQuestions(questionsDate, subtopics[0]);
        await insertQuestions(questionsTime, subtopics[1]);

        console.log('C++ Date and Time Module Setup Complete!');

    } catch (err) {
        console.error('Setup failed:', err);
    } finally {
        process.exit();
    }
}

setupCppDateTimeModule();
