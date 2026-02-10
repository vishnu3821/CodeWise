USE codewise;

-- 1. Identify IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_vars = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'variables' LIMIT 1);
SET @sub_ident = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Identifiers' LIMIT 1);
SET @sub_const = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Constants' LIMIT 1);

-- 2. Insert Questions for Identifiers

-- Q1: Valid Identifier Name
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_ident, 'Valid Identifier Name', 'Declare a variable using a valid identifier and print its value.', 'Easy', '-10^6 ≤ n ≤ 10^6');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '10', '10', TRUE),
(@q1, '-5', '-5', TRUE);

-- Q2: Invalid Identifier Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_ident, 'Invalid Identifier Check', 'Check whether a given name is a valid identifier in C++. Print "Valid" or "Invalid".', 'Easy', 'String length ≤ 50');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, 'count', 'Valid', TRUE),
(@q2, '2sum', 'Invalid', TRUE);

-- Q3: Identifier Case Sensitivity
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_ident, 'Identifier Case Sensitivity', 'Declare two variables with the same name but different cases (e.g. "val" and "Val") and print both values.', 'Easy', '-100 ≤ a, b ≤ 100');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '5 7', '5 7', TRUE),
(@q3, '-1 3', '-1 3', TRUE);

-- Q4: Identifier Using Underscore
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_ident, 'Identifier Using Underscore', 'Declare a variable using an underscore in its identifier and print its value.', 'Easy', '-10^6 ≤ n ≤ 10^6');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '20', '20', TRUE),
(@q4, '0', '0', TRUE);

-- Q5: Identifier Starting With Letter
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_ident, 'Identifier Starting With Letter', 'Declare a variable whose identifier starts with a letter and print its value.', 'Easy', '-10^6 ≤ n ≤ 10^6');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '99', '99', TRUE),
(@q5, '-100', '-100', TRUE);


-- 3. Insert Questions for Constants

-- Q1: Declare Constant Variable
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_const, 'Declare Constant Variable', 'Declare a constant integer and print its value.', 'Easy', '-10^6 ≤ n ≤ 10^6');
SET @qc1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc1, '15', '15', TRUE),
(@qc1, '-8', '-8', TRUE);

-- Q2: Constant Addition
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_const, 'Constant Addition', 'Declare two constant integers and print their sum.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @qc2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc2, '3 4', '7', TRUE),
(@qc2, '-2 5', '3', TRUE);

-- Q3: Constant Float Value
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_const, 'Constant Float Value', 'Declare a constant float and print it with two decimal places.', 'Easy', '0 ≤ f ≤ 10^6');
SET @qc3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc3, '3.5', '3.50', TRUE),
(@qc3, '2', '2.00', TRUE);

-- Q4: Modify Constant Value
-- Note: This is an educational question. In a real compiler, this fails. 
-- Here we assume the user might print 'error' to simulate, or we just provide it as requested.
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_const, 'Modify Constant Value', 'Attempt to modify a constant variable and observe the result (Expected: Compilation error).', 'Easy', 'No constraints');
SET @qc4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc4, '', 'error', TRUE);

-- Q5: Constant Expression
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_const, 'Constant Expression', 'Use constant variables to calculate and print the area of a rectangle.', 'Easy', '1 ≤ length, width ≤ 10^4');
SET @qc5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc5, '5 4', '20', TRUE),
(@qc5, '10 3', '30', TRUE);
