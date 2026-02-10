USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_enum = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'enumerations' LIMIT 1);

-- -----------------------------------------------------
-- Enumerations -> Enum
-- -----------------------------------------------------
SET @sub_enum = (SELECT id FROM subtopics WHERE topic_id = @topic_enum AND name = 'Enum' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_enum, @sub_enum, 'Rotate a compass direction by a sequence of left/right turns', 'Define an enum Direction { North = 0, East = 1, South = 2, West = 3 }. You are given a starting compass direction and a sequence of left/right turns. Turning right rotates 90 degrees clockwise (North→East→South→West→North). Turning left rotates 90 degrees counterclockwise (North→West→South→East→North). Starting from the given direction, apply each turn in order and print the final direction as a single uppercase letter: N, E, S, or W.\n\nYou should map the input letter to the enum value, update an integer index modulo 4 as you process the turns, and then map back from the enum to the output letter. Using an enum avoids “magic numbers” and makes the rotation logic clearer: a right turn is +1 mod 4, a left turn is -1 mod 4 (or +3 mod 4).', 'Easy', 'The turn string consists only of ‘L’ and ‘R’.\n0 ≤ length(turns) ≤ 200000\nInput direction is exactly one of N, E, S, W.', 'Map N→0. Apply turns:\n- R: 0→1 (E)\n- R: 1→2 (S)\n- L: 2→1 (E)\n- L: 1→0 (N)\n- R: 0→1 (E)\nFinal index 1 maps to E. Using enum constants clarifies the 0..3 cycle.\nStarting at West (3), four left turns move 3→2→1→0→3 (mod 4). You return to West. The modulo arithmetic with enum values makes the wraparound behavior explicit.');
SET @qe1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe1, 'N\nRRLLR', 'E', TRUE),
(@qe1, 'W\nLLLL', 'W', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_enum, @sub_enum, 'Classify exam scores into letter grades and count each grade', 'Define an enum Grade { A, B, C, D, F }. You will read N integer scores in [0,100]. For each score, compute its letter grade:\n- A: 90–100\n- B: 80–89\n- C: 70–79\n- D: 60–69\n- F: 0–59\nUse the enum in your gradeOf(int) function to clearly express which grade each score maps to. Count how many of each enum value you produce and print the counts in the fixed order A B C D F. This demonstrates using enums as a clean, type-safe domain for categorical results.', 'Easy', '1 ≤ N ≤ 200000\nEach score is an integer in [0, 100].', '90→A, 80→B, 70→C, 60→D, 59→F. Each bucket gets exactly one. Using an enum return type prevents accidental use of raw integers for grade labels.\n100 and 100 both map to A; 0 maps to F. Counts are A=2, B=0, C=0, D=0, F=1.');
SET @qe2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe2, '5\n90 80 70 60 59', '1 1 1 1 1', TRUE),
(@qe2, '3\n100 100 0', '2 0 0 0 1', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_enum, @sub_enum, 'Map month numbers to seasons using a scoped enum', 'Define a scoped enum (enum class) Season { Winter, Spring, Summer, Autumn }. For each query, you receive a month number m in [1,12]. Map months to seasons using this conventional grouping:\n- Winter: December, January, February → months {12, 1, 2}\n- Spring: March, April, May → months {3, 4, 5}\n- Summer: June, July, August → months {6, 7, 8}\n- Autumn: September, October, November → months {9, 10, 11}\nRead Q queries and print the corresponding season name for each. Use a switch or if/else chain that returns a Season, and print the chosen name. A scoped enum (enum class) avoids polluting the global namespace and prevents implicit conversion to int, which makes your code safer and clearer.', 'Medium', '1 ≤ Q ≤ 200000\nEach m is an integer with 1 ≤ m ≤ 12.', '12→Winter (December), 1→Winter (January), 5→Spring (May), 8→Summer (August). Using Season as a scoped enum makes it explicit that only those four values are valid results.\nAll three months are in {9,10,11}, mapping to Autumn.');
SET @qe3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe3, '4\n12\n1\n5\n8', 'Winter\nWinter\nSpring\nSummer', TRUE),
(@qe3, '3\n9\n10\n11', 'Autumn\nAutumn\nAutumn', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_enum, @sub_enum, 'Categorize HTTP status codes with an enum class and a switch', 'Define a scoped enum Category : int { Unknown = 0, Informational = 1, Success = 2, Redirection = 3, ClientError = 4, ServerError = 5 }. For each integer HTTP status code c, determine its category:\n- 100–199 → Informational\n- 200–299 → Success\n- 300–399 → Redirection\n- 400–499 → ClientError\n- 500–599 → ServerError\n- Any other integer → Unknown\nRead Q codes, convert each to a Category using a helper function (e.g., categorize(int c) -> Category) with a clear switch/if logic, and print the category name per line. This problem shows how enums provide a small, named set of outcomes that are easy to reason about and exhaustively handle.', 'Medium', '1 ≤ Q ≤ 200000\nEach code c is a 32-bit signed integer (it may be outside 100–599).', 'Each code falls within the standard ranges: 1xx, 2xx, 3xx, 4xx, and 5xx map to their matching categories.\n99 is below 100, 600 is above 599, and -1 is negative; all are out of known ranges and therefore map to Unknown.');
SET @qe4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe4, '5\n100\n204\n302\n404\n503', 'Informational\nSuccess\nRedirection\nClientError\nServerError', TRUE),
(@qe4, '3\n99\n600\n-1', 'Unknown\nUnknown\nUnknown', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_enum, @sub_enum, 'Manage a set of file permissions using a strongly-typed enum bitmask', 'Implement a small permission system using a strongly-typed bitmask enum. Define:\n- enum class Perm : unsigned int { Read = 1u<<0, Write = 1u<<1, Execute = 1u<<2, Share = 1u<<3, Delete = 1u<<4 };\nYou will manage a set of granted permissions over time. The initial set is given as a string consisting of zero or more of the letters R, W, X, S, D (or the literal “NONE” for no permissions). Then you will process Q operations that modify or query this set:\n- GRANT L — add permission L\n- REVOKE L — remove permission L\n- TOGGLE L — flip permission L\n- CHECK L — print YES if L is currently granted, else NO\nWhere L ∈ {R, W, X, S, D} maps to the corresponding Perm bit.\n\nRepresent the set as a bitmask of Perm values. Because enum class does not allow implicit bitwise operators, in a full implementation you would provide operator overloads (|, &, ^, ~ and their compound forms) or cast to the underlying type (unsigned int) when combining flags. After processing all operations, print one final summary line: the numeric mask value (as an unsigned integer) and the granted letters concatenated with no separators in the canonical order RWXSD (print “NONE” if no permissions are set).\n\nThis problem tests enum design (scoped, with an explicit underlying type), mapping from characters to enum flags, safe bitwise manipulation, and consistent output formatting for both per-query checks and the final state.', 'Hard', 'Initial string is either “NONE” or a subset of letters from {R, W, X, S, D} (letters may be repeated; treat duplicates as a single grant).\n1 ≤ Q ≤ 200000\nAll operations are valid (letter is always one of R/W/X/S/D).\nUse 64-bit or unsigned arithmetic for the mask calculations if desired, but the enum’s underlying type here is unsigned int.', '- Initial “RW” sets Read (1) and Write (2) → mask = 3.\n- CHECK R: Read is set → YES.\n- GRANT X: add Execute (4) → mask becomes 3 | 4 = 7.\n- TOGGLE W: flip Write (2) → mask becomes 7 ^ 2 = 5.\n- CHECK W: Write is now off → NO.\nFinal summary: mask=5, granted letters in RWXSD order are R and X → “RX”. We print “5 RX”. Using a scoped enum with explicit bit values keeps the mapping unambiguous.\n- Start with mask=0 (NONE).\n- GRANT D: add Delete (16) → mask=16.\n- CHECK X: Execute (4) not set → NO.\n- TOGGLE X: flip Execute → mask=16 ^ 4 = 20.\nFinal set has Execute and Delete. In RWXSD order, the letters present are X and D, so we print “20 XD”.\n- Start with R (1) and X (4) → mask=5.\n- REVOKE R: remove Read (1) → mask=5 & ~1 = 4.\n- CHECK R: Read is not set → NO.\n- CHECK X: Execute is set → YES.\n- TOGGLE S: flip Share (8) → mask=4 ^ 8 = 12.\n- CHECK S: S is now set → YES.\nFinal mask is 12 (8+4). Letters present in RWXSD order are X (4) and S (8) → “XS”. We print “12 XS”.');
SET @qe5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe5, 'RW\n4\nCHECK R\nGRANT X\nTOGGLE W\nCHECK W', 'YES\nNO\n5 RX', TRUE),
(@qe5, 'NONE\n3\nGRANT D\nCHECK X\nTOGGLE X', 'NO\n20 XD', TRUE),
(@qe5, 'RX\n5\nREVOKE R\nCHECK R\nCHECK X\nTOGGLE S\nCHECK S', 'NO\nYES\n12 XS', TRUE);
