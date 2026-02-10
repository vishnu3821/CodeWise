USE codewise;

-- 1. Identify IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_cond = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'conditions' LIMIT 1);

SET @sub_if = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'If' LIMIT 1);
SET @sub_else = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Else' LIMIT 1);
SET @sub_elseif = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Else If' LIMIT 1);
SET @sub_switch = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Switch' LIMIT 1);

-- -----------------------------------------------------
-- If
-- -----------------------------------------------------

-- Q1: Check Positive Number
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_if, 'Check Positive Number', 'Check whether a number is positive using if statement. Print "Positive" if true.', 'Easy', '-10^6 ≤ n ≤ 10^6', 'Using if condition n > 0 as shown in W3Schools examples.');
SET @qi1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi1, '7', 'Positive', TRUE);

-- Q2: Check Greater Than 10
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_if, 'Check Greater Than 10', 'Check whether a number is greater than 10. Print "Greater than 10".', 'Easy', 'No constraints', 'If condition checks n > 10.');
SET @qi2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi2, '15', 'Greater than 10', TRUE);

-- Q3: Check Divisible by 2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_if, 'Check Divisible by 2', 'Check whether a number is divisible by 2. Print "Divisible".', 'Medium', 'No constraints', 'Using modulo operator inside if, as shown in GeeksforGeeks.');
SET @qi3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi3, '8', 'Divisible', TRUE);

-- Q4: Check Age Eligibility
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_if, 'Check Age Eligibility', 'Check if age is 18 or above. Print "Eligible".', 'Medium', 'No constraints', 'If condition checks age >= 18.');
SET @qi4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi4, '18', 'Eligible', TRUE);

-- Q5: Check Non Zero Number
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_if, 'Check Non Zero Number', 'Check whether a number is non zero. Print "Non Zero".', 'Hard', 'No constraints', 'Any non-zero value evaluates to true in C++ if condition.');
SET @qi5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi5, '-3', 'Non Zero', TRUE);


-- -----------------------------------------------------
-- Else
-- -----------------------------------------------------

-- Q1: Positive or Negative
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_else, 'Positive or Negative', 'Check whether a number is positive or negative using if else rules (assuming 0 is positive for simplicity or handled separately, typical easy problem implies >0 vs else). Print "Positive" or "Negative".', 'Easy', 'No constraints', 'If fails, else executes.');
SET @qe1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe1, '-5', 'Negative', TRUE);

-- Q2: Pass or Fail
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_else, 'Pass or Fail', 'Check whether a student passed or failed. Print "Pass" or "Fail".', 'Easy', 'No constraints', 'Marks >= 35 results in Pass.');
SET @qe2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe2, '40', 'Pass', TRUE);

-- Q3: Even or Odd
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_else, 'Even or Odd', 'Check whether a number is even or odd. Print "Even" or "Odd".', 'Medium', 'No constraints', 'Modulo operator used with if else.');
SET @qe3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe3, '9', 'Odd', TRUE);

-- Q4: Largest of Two Numbers
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_else, 'Largest of Two Numbers', 'Find the largest of two numbers.', 'Medium', 'No constraints', 'First condition a > b is true.');
SET @qe4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe4, '6 2', '6', TRUE);

-- Q5: Check Leap Year (Basic)
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_else, 'Check Leap Year (Basic)', 'Check whether a year is a leap year using basic if else logic. Print "Leap Year" or "Not Leap Year".', 'Hard', 'No constraints', 'Divisible by 4 rule from GeeksforGeeks.');
SET @qe5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe5, '2020', 'Leap Year', TRUE);


-- -----------------------------------------------------
-- Else If
-- -----------------------------------------------------

-- Q1: Grade System
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_elseif, 'Grade System', 'Print grade based on marks using else if. (e.g. >=90 A, etc). Test case 90 -> A.', 'Easy', 'No constraints', 'Highest range matched first.');
SET @qei1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qei1, '90', 'A', TRUE);

-- Q2: Number Sign Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_elseif, 'Number Sign Check', 'Check whether number is positive, negative, or zero. Print "Positive", "Negative", or "Zero".', 'Easy', 'No constraints', 'Else if condition for zero executes.');
SET @qei2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qei2, '0', 'Zero', TRUE);

-- Q3: Temperature Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_elseif, 'Temperature Check', 'Classify temperature using else if. Print "Cold", "Warm", or "Hot". (Assume 35 is Hot).', 'Medium', 'No constraints', 'Temperature exceeds warm range.');
SET @qei3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qei3, '35', 'Hot', TRUE);

-- Q4: Day Type
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_elseif, 'Day Type', 'Determine weekday or weekend. (1-5 Weekday, 6-7 Weekend). Print "Weekday" or "Weekend".', 'Medium', 'No constraints', 'Day value matches weekend condition.');
SET @qei4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qei4, '7', 'Weekend', TRUE);

-- Q5: Salary Category
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_elseif, 'Salary Category', 'Classify salary into Low, Medium, or High. Test case 800000 -> High.', 'Hard', 'No constraints', 'Salary exceeds medium range.');
SET @qei5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qei5, '800000', 'High', TRUE);


-- -----------------------------------------------------
-- Switch
-- -----------------------------------------------------

-- Q1: Day Name
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_switch, 'Day Name', 'Print day name using switch (1=Monday ...).', 'Easy', '1-7', 'Case 3 matched.');
SET @qs1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs1, '3', 'Wednesday', TRUE);

-- Q2: Basic Calculator
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_switch, 'Basic Calculator', 'Perform arithmetic operation (+, -, *, /) using switch. Input: a b operator.', 'Easy', 'No constraints', 'Division case executed.');
SET @qs2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs2, '8 4 /', '2', TRUE);

-- Q3: Vowel Check
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_switch, 'Vowel Check', 'Check vowel using switch case. Print "Vowel" or "Consonant".', 'Medium', 'Alphabet char', 'Matches vowel cases.');
SET @qs3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs3, 'e', 'Vowel', TRUE);

-- Q4: Month Number
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_switch, 'Month Number', 'Print month name using switch. Input 1-12.', 'Medium', '1-12', 'Case 12 executed.');
SET @qs4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs4, '12', 'December', TRUE);

-- Q5: Menu Driven Arithmetic
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_cond, @sub_switch, 'Menu Driven Arithmetic', 'Implement menu driven arithmetic using switch. Input: choice a b. 1:Add, 2:Sub, 3:Mul, 4:Div.', 'Hard', 'No constraints', 'Choice 2 maps to subtraction.');
SET @qs5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs5, '2 6 3', '3', TRUE);
