USE codewise;

-- 1. Identify IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output' LIMIT 1);
SET @sub_input = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Input' LIMIT 1);

-- 2. Insert Questions

-- Q1: Read integer
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_input, 'Question 1', 'Read an integer from input and print it.', 'Easy', '-10^9 ≤ n ≤ 10^9');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '5', '5', TRUE),
(@q1, '-12', '-12', TRUE);

-- Q2: Sum of two integers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_input, 'Question 2', 'Read two integers from input and print their sum.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '3 7', '10', TRUE),
(@q2, '-4 9', '5', TRUE);

-- Q3: Read character
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_input, 'Question 3', 'Read a character from input and print it.', 'Easy', 'Input is a single lowercase or uppercase character');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, 'A', 'A', TRUE),
(@q3, 'z', 'z', TRUE);

-- Q4: Read float
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_input, 'Question 4', 'Read a floating point number and print it with two decimal places.', 'Easy', '0 ≤ n ≤ 10^6');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '3.14159', '3.14', TRUE),
(@q4, '2', '2.00', TRUE);

-- Q5: Read string
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_input, 'Question 5', 'Read a string without spaces and print it.', 'Easy', 'String length ≤ 100');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, 'hello', 'hello', TRUE),
(@q5, 'Cplusplus', 'Cplusplus', TRUE);
