USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_loops = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'loops' LIMIT 1);

-- -----------------------------------------------------
-- Loops -> While Loop
-- -----------------------------------------------------
SET @sub_while = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'While Loop' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_while, 'Print Numbers from 1 to n', 'print numbers from 1 to n using while loop.', 'Easy', '1 ≤ n ≤ 10^5', 'The while loop starts at 1 and runs until the value reaches n, printing each number.');
SET @qi1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi1, '5', '1 2 3 4 5', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_while, 'Print Even Numbers', 'print all even numbers up to n using while loop.', 'Easy', '1 ≤ n ≤ 10^5', 'The loop increments the counter and prints numbers divisible by 2.');
SET @qi2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi2, '6', '2 4 6', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_while, 'Sum of First n Numbers', 'calculate the sum of first n natural numbers using while loop.', 'Medium', '1 ≤ n ≤ 10^5', 'The loop adds each number from 1 to n into a sum variable.');
SET @qi3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi3, '5', '15', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_while, 'Reverse a Number', 'reverse a given number using while loop.', 'Medium', '0 ≤ n ≤ 10^9', 'Digits are extracted using modulo and reversed using arithmetic inside the loop.');
SET @qi4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi4, '123', '321', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_while, 'Count Digits', 'count the number of digits in a number using while loop.', 'Hard', '0 ≤ n ≤ 10^9', 'The loop runs until the number becomes zero, counting each iteration.');
SET @qi5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi5, '90876', '5', TRUE);


-- -----------------------------------------------------
-- Loops -> Do While Loop
-- -----------------------------------------------------
SET @sub_dowhile = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'Do While Loop' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_dowhile, 'Print Number Once', 'print a number at least once using do while loop.', 'Easy', 'any integer', 'Do while loop executes once before checking the condition, as shown in W3Schools.');
SET @qdw1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qdw1, '0', '0', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_dowhile, 'Print Numbers from 1 to n', 'print numbers from 1 to n using do while loop.', 'Easy', '1 ≤ n ≤ 10^5', 'The loop prints the number and increments it until the condition fails.');
SET @qdw2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qdw2, '3', '1 2 3', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_dowhile, 'Sum Until Zero', 'read numbers until zero is entered and print their sum.', 'Medium', 'input ends with 0', 'The do while loop ensures input is processed before checking for zero.');
SET @qdw3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qdw3, '2 4 6 0', '12', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_dowhile, 'Menu Repetition', 'repeat a menu until user enters 0.', 'Medium', 'valid integers', 'Do while is used for menu-driven programs in GeeksforGeeks examples.');
SET @qdw4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qdw4, '1 2 0', 'menu shown', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_dowhile, 'Factorial Using Do While', 'calculate factorial of a number using do while loop.', 'Hard', '0 ≤ n ≤ 12', 'The loop multiplies values from n down to 1 before condition check.');
SET @qdw5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qdw5, '5', '120', TRUE);


-- -----------------------------------------------------
-- Loops -> For Loop
-- -----------------------------------------------------
SET @sub_for = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'For Loop' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_for, 'Print First n Numbers', 'print numbers from 1 to n using for loop.', 'Easy', '1 ≤ n ≤ 10^5', 'For loop initializes, checks condition, and increments in one line as shown in W3Schools.');
SET @qf1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf1, '4', '1 2 3 4', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_for, 'Print Table of a Number', 'print multiplication table of a number.', 'Easy', '1 ≤ n ≤ 100', 'Loop runs from 1 to 10 and multiplies each value with n.');
SET @qf2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf2, '3', '3 6 9 12 15 18 21 24 27 30', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_for, 'Sum of Even Numbers', 'find sum of even numbers from 1 to n.', 'Medium', '1 ≤ n ≤ 10^5', 'The loop checks even condition and adds only even values.');
SET @qf3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf3, '6', '12', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_for, 'Count Vowels in String', 'count vowels in a string using for loop.', 'Medium', 'string length ≤ 100', 'The loop checks each character against vowel conditions.');
SET @qf4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf4, 'hello', '2', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_for, 'Prime Number Check', 'check whether a number is prime using for loop.', 'Hard', '2 ≤ n ≤ 10^5', 'The loop checks divisibility from 2 to n-1, as shown in GeeksforGeeks examples.');
SET @qf5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf5, '7', 'Prime', TRUE);


-- -----------------------------------------------------
-- Loops -> Break
-- -----------------------------------------------------
SET @sub_break = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'Break' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_break, 'Stop at Number', 'print numbers from 1 to n and stop when value equals 5.', 'Easy', 'n ≥ 5', 'Break terminates the loop immediately when condition is met.');
SET @qb1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qb1, '10', '1 2 3 4 5', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_break, 'Search Element', 'search an element in array and stop when found.', 'Medium', 'array size ≤ 100', 'Break exits loop once element is matched.');
SET @qb2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qb2, '1 3 5 7\n5', 'Found', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_break, 'First Multiple', 'find first multiple of 7 between 1 and n.', 'Hard', 'n ≥ 7', 'Loop stops at the first valid multiple using break.');
SET @qb3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qb3, '20', '7', TRUE);


-- -----------------------------------------------------
-- Loops -> Continue
-- -----------------------------------------------------
SET @sub_cont = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'Continue' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_cont, 'Skip Number', 'print numbers from 1 to n except 5.', 'Easy', 'n ≥ 5', 'Continue skips the iteration when value equals 5.');
SET @qc1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc1, '7', '1 2 3 4 6 7', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_cont, 'Skip Even Numbers', 'print only odd numbers using continue.', 'Medium', '1 ≤ n ≤ 10^5', 'Continue skips even numbers and prints only odd ones.');
SET @qc2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc2, '6', '1 3 5', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_loops, @sub_cont, 'Skip Vowels', 'print consonants from a string using continue.', 'Hard', 'string length ≤ 100', 'Continue skips characters when a vowel is encountered.');
SET @qc3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc3, 'apple', 'ppl', TRUE);
