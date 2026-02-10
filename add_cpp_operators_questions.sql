USE codewise;

-- 1. Identify IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_ops = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'operators' LIMIT 1);

SET @sub_arith = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Arithmetic Operators' LIMIT 1);
SET @sub_assign = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Assignment Operators' LIMIT 1);
SET @sub_cmp = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Comparison Operators' LIMIT 1);
SET @sub_logic = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Logical Operators' LIMIT 1);
SET @sub_bit = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Bitwise Operators' LIMIT 1);

-- -----------------------------------------------------
-- Arithmetic Operators
-- -----------------------------------------------------

-- Q1: Add Two Integers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_arith, 'Add Two Integers', 'Read two integers and print their sum.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '3 4', '7', TRUE);

-- Q2: Multiply Two Numbers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_arith, 'Multiply Two Numbers', 'Read two integers and print their product.', 'Easy', '-10^6 ≤ a, b ≤ 10^6');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '5 6', '30', TRUE);

-- Q3: Simple Calculator
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_arith, 'Simple Calculator', 'Read two integers and print sum, difference, product, and quotient (space separated).', 'Medium', 'b ≠ 0');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '10 2', '12 8 20 5', TRUE);

-- Q4: Area and Perimeter of Rectangle
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_arith, 'Area and Perimeter of Rectangle', 'Calculate area and perimeter of a rectangle. Print area then perimeter.', 'Medium', '1 ≤ l, w ≤ 10^4');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '5 3', '15 16', TRUE);

-- Q5: Evaluate Arithmetic Expression
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_arith, 'Evaluate Arithmetic Expression', 'Evaluate the expression a + b * c - d / e.', 'Hard', 'e ≠ 0');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '5 2 3 8 4', '9', TRUE);


-- -----------------------------------------------------
-- Assignment Operators
-- -----------------------------------------------------

-- Q1: Assign and Print Value
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_assign, 'Assign and Print Value', 'Assign a value to a variable and print it.', 'Easy', 'No constraints');
SET @qa1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa1, '10', '10', TRUE);

-- Q2: Add Using Assignment Operator
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_assign, 'Add Using Assignment Operator', 'Use += operator to add b to a (a += b) and print result.', 'Easy', 'No constraints');
SET @qa2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa2, '5 3', '8', TRUE);

-- Q3: Multiply Using Assignment Operator
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_assign, 'Multiply Using Assignment Operator', 'Use *= operator to update a variable (a *= b) and print result.', 'Medium', 'No constraints');
SET @qa3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa3, '4 5', '20', TRUE);

-- Q4: Chain Assignment
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_assign, 'Chain Assignment', 'Assign the same value to three variables and print them (space separated).', 'Medium', 'No constraints');
SET @qa4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa4, '7', '7 7 7', TRUE);

-- Q5: Compound Assignment Expression
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_assign, 'Compound Assignment Expression', 'Apply multiple assignment operators on a variable and print final value. (Assume start=10, then +=5, then *=2, or specific logic from problem statement: "Apply multiple...") For test case: 10 -> 25 implies e.g +15 or similar. Example: x=10; x+=5; x+=10 -> 25. Or specific problem logic. Using generalized description.', 'Hard', 'No constraints');
-- Adjusting description to be more specific for user to solve: "Read n. n+=15. Print n." as simplest interpretation of 10->25.
-- Or better: "Read n. n+=5. n+=10. Print n."
UPDATE questions SET description = 'Read n. update n += 5, then n += 10. Print final value.' WHERE id = @qa5; -- Placeholder fix during insert
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_assign, 'Compound Assignment Expression', 'Read n. Add 5 to it, then add 10 to it using compound assignments. Print final value.', 'Hard', 'No constraints');
SET @qa5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa5, '10', '25', TRUE);


-- -----------------------------------------------------
-- Comparison Operators
-- -----------------------------------------------------

-- Q1: Greater Than Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_cmp, 'Greater Than Check', 'Check whether the first number is greater than the second. Print 1 or 0.', 'Easy', 'No constraints');
SET @qc1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc1, '5 3', '1', TRUE);

-- Q2: Equality Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_cmp, 'Equality Check', 'Check whether two numbers are equal. Print 1 or 0.', 'Easy', 'No constraints');
SET @qc2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc2, '4 4', '1', TRUE);

-- Q3: Largest of Two Numbers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_cmp, 'Largest of Two Numbers', 'Find and print the larger of two numbers.', 'Medium', 'No constraints');
SET @qc3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc3, '6 9', '9', TRUE);

-- Q4: Number Range Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_cmp, 'Number Range Check', 'Check whether a number lies between 10 and 50 (inclusive). Print "Yes" or "No".', 'Medium', 'No constraints');
SET @qc4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc4, '25', 'Yes', TRUE);

-- Q5: Largest of Three Numbers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_cmp, 'Largest of Three Numbers', 'Find the largest of three numbers using comparison operators only.', 'Hard', 'No constraints');
SET @qc5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc5, '3 7 5', '7', TRUE);


-- -----------------------------------------------------
-- Logical Operators
-- -----------------------------------------------------

-- Q1: Logical AND Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_logic, 'Logical AND Check', 'Check if both numbers are positive (>0) using &&. Print 1 or 0.', 'Easy', 'No constraints');
SET @ql1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql1, '5 10', '1', TRUE);

-- Q2: Logical OR Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_logic, 'Logical OR Check', 'Check if at least one number is positive (>0) using ||. Print 1 or 0.', 'Easy', 'No constraints');
SET @ql2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql2, '-3 4', '1', TRUE);

-- Q3: Logical NOT
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_logic, 'Logical NOT', 'Invert a boolean value using ! operator. Print 0 or 1. (Input 1 -> Output 0; Input 0 -> Output 1)', 'Medium', 'Boolean value');
SET @ql3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql3, '1', '0', TRUE); -- 'true' as 1 for input

-- Q4: Divisibility Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_logic, 'Divisibility Check', 'Check if a number is divisible by both 3 and 5. Print "Yes" or "No".', 'Medium', 'No constraints');
SET @ql4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql4, '15', 'Yes', TRUE);

-- Q5: Complex Logical Condition
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_logic, 'Complex Logical Condition', 'Check if a number is between 1 and 100 AND not divisible by 10. Print "Yes" or "No".', 'Hard', 'No constraints');
SET @ql5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql5, '45', 'Yes', TRUE);


-- -----------------------------------------------------
-- Bitwise Operators
-- -----------------------------------------------------

-- Q1: Bitwise AND
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_bit, 'Bitwise AND', 'Perform bitwise AND of two integers and print result.', 'Easy', 'No constraints');
SET @qbit1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qbit1, '5 3', '1', TRUE);

-- Q2: Bitwise OR
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_bit, 'Bitwise OR', 'Perform bitwise OR of two integers and print result.', 'Easy', 'No constraints');
SET @qbit2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qbit2, '5 3', '7', TRUE);

-- Q3: Bitwise XOR
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_bit, 'Bitwise XOR', 'Perform bitwise XOR of two integers and print result.', 'Medium', 'No constraints');
SET @qbit3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qbit3, '5 3', '6', TRUE);

-- Q4: Left Shift Operation
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_bit, 'Left Shift Operation', 'Left shift a number by one position and print result.', 'Medium', 'No constraints');
SET @qbit4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qbit4, '4', '8', TRUE);

-- Q5: Check Power of Two
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_ops, @sub_bit, 'Check Power of Two', 'Check whether a number is a power of two using bitwise operators. Print "Yes" or "No".', 'Hard', 'No constraints');
SET @qbit5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qbit5, '8', 'Yes', TRUE);
