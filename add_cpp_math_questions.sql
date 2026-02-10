USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_math = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'math' LIMIT 1);

-- -----------------------------------------------------
-- Math -> Math Functions
-- -----------------------------------------------------
SET @sub_math_funcs = (SELECT id FROM subtopics WHERE topic_id = @topic_math AND name = 'Math Functions' LIMIT 1);

-- Q1: Absolute Value
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Absolute Value', 'read an integer and print its absolute value.', 'Easy', '-10^6 ≤ n ≤ 10^6', 'The absolute value of a number represents its distance from zero on the number line.\nIf the number is negative, its sign is removed.\nIf the number is already positive or zero, it remains unchanged.\nThe math function converts negative input into its positive equivalent.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '-25', '25', TRUE);

-- Q2: Square Root of a Number
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Square Root of a Number', 'read a number and print its square root.', 'Easy', '0 ≤ n ≤ 10^12', 'The square root of a number is a value which, when multiplied by itself, gives the original number.\nThe math function computes this directly using floating-point precision.\nOnly non-negative values are valid inputs for square root.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '144', '12', TRUE);

-- Q3: Power Calculation
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Power Calculation', 'calculate a raised to the power b.', 'Medium', '1 ≤ a ≤ 10^6\n1 ≤ b ≤ 10^3', 'Power calculation repeatedly multiplies a by itself b times.\nFor medium input sizes, the math function efficiently handles exponentiation.\nThe result can grow large, so data type selection is important to avoid overflow.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '2 10', '1024', TRUE);

-- Q4: Round Floating Point Value
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Round Floating Point Value', 'round a floating point number to the nearest integer.', 'Medium', '0 ≤ n ≤ 10^12', 'Rounding checks the decimal part of the number.\nIf the decimal part is 0.5 or greater, the value is rounded up.\nIf it is less than 0.5, the value is rounded down.\nThe math function perform this operation accurately for medium-sized values.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '12.6', '13', TRUE);

-- Q5: Distance Between Two Points
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Distance Between Two Points', 'calculate the distance between two points in 2D space.', 'Hard', '-10^9 ≤ x1, y1, x2, y2 ≤ 10^9', 'Distance between two points is calculated using the formula\nsqrt((x2 − x1)² + (y2 − y1)²).\n\nFor large coordinate values, the squared differences become very large numbers.\nThese values must be handled carefully to avoid overflow during calculation.\nThe math functions square the differences, add them, and compute the square root of the sum.\nThis produces the straight-line distance between the two points.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '0 0 300000000 400000000', '500000000', TRUE);

-- Q6: Hypotenuse of Right Triangle
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Hypotenuse of Right Triangle', 'find the hypotenuse of a right-angled triangle given base and height.', 'Hard', '1 ≤ base, height ≤ 10^9', 'The hypotenuse is calculated using the Pythagorean formula\nsqrt(base² + height²).\n\nWith large input values, squaring base and height produces very large numbers.\nThe math function handles these values using floating-point arithmetic.\nAfter summing the squares, the square root gives the final hypotenuse length.\nThis approach ensures accuracy even for very large triangles.');
SET @q6 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q6, '300000000 400000000', '500000000', TRUE);

-- Q7: Maximum and Minimum Using Math
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_math, @sub_math_funcs, 'Maximum and Minimum Using Math', 'find the maximum and minimum of two large numbers.', 'Hard', '-10^18 ≤ a, b ≤ 10^18', 'The maximum value is the larger of the two inputs, and the minimum is the smaller.\nFor very large integers, direct comparison is still efficient.\nThe math functions internally compare the values and return the correct result.\nThis avoids writing manual comparison logic and ensures clarity and correctness.');
SET @q7 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q7, '987654321012345678 -123456789098765432', '987654321012345678 -123456789098765432', TRUE);
