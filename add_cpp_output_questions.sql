USE codewise;

-- 1. Identify IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output' LIMIT 1);
SET @sub_output = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Output' LIMIT 1);

-- 2. Insert Questions

-- Q1: Print Hello World
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_output, 'Print Hello World', 'Print the message "Hello World" using output statements.', 'Easy', 'No constraints');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '', 'Hello World', TRUE);

-- Q2: Print an Integer
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_output, 'Print an Integer', 'Print an integer value using output.', 'Easy', '-10^9 ≤ n ≤ 10^9');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '10', '10', TRUE),
(@q2, '-25', '-25', TRUE);

-- Q3: Print Two Integers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_output, 'Print Two Integers', 'Print two integers on the same line separated by a space.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '4 8', '4 8', TRUE),
(@q3, '-1 5', '-1 5', TRUE);

-- Q4: Print Floating Point Number with Precision
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_output, 'Print Floating Point Number with Precision', 'Print a floating point number with exactly two decimal places.', 'Easy', '0 ≤ n ≤ 10^6');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '5.5', '5.50', TRUE),
(@q4, '3.14159', '3.14', TRUE);

-- Q5: Print String and Integer
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_io, @sub_output, 'Print String and Integer', 'Print a string along with an integer.', 'Easy', 'String length ≤ 100\n-10^6 ≤ n ≤ 10^6');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, 'Code 100', 'Code 100', TRUE),
(@q5, 'Cplusplus 50', 'Cplusplus 50', TRUE);
