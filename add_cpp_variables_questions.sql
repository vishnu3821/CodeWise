USE codewise;

-- 1. Identify IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_vars = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'variables' LIMIT 1);
SET @sub_vars = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Variables' LIMIT 1);

-- 2. Insert Questions

-- Q1: Declare and Print a Variable
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_vars, 'Declare and Print a Variable', 'Declare an integer variable, assign a value to it, and print the value.', 'Easy', '-10^9 ≤ n ≤ 10^9');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '7', '7', TRUE),
(@q1, '-15', '-15', TRUE);

-- Q2: Add Two Variables
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_vars, 'Add Two Variables', 'Declare two integer variables, store input values, and print their sum.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '3 5', '8', TRUE),
(@q2, '-4 10', '6', TRUE);

-- Q3: Store and Print Different Data Types
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_vars, 'Store and Print Different Data Types', 'Declare an integer and a floating point variable, store input values, and print both.', 'Easy', '-10^6 ≤ n ≤ 10^6\n0 ≤ f ≤ 10^6');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '5 2.5', '5 2.5', TRUE),
(@q3, '10 3.14', '10 3.14', TRUE);

-- Q4: Swap Two Variables
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_vars, 'Swap Two Variables', 'Declare two integer variables and swap their values using a third variable.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '2 4', '4 2', TRUE),
(@q4, '-1 5', '5 -1', TRUE);

-- Q5: Update Variable Value
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_vars, @sub_vars, 'Update Variable Value', 'Declare an integer variable, increase its value by 10, and print the updated value.', 'Easy', '-10^6 ≤ n ≤ 10^6');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '5', '15', TRUE),
(@q5, '-3', '7', TRUE);
