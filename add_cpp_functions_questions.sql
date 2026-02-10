USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_funcs = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'functions' LIMIT 1);

-- -----------------------------------------------------
-- Functions -> Function Definition
-- -----------------------------------------------------
SET @sub_def = (SELECT id FROM subtopics WHERE topic_id = @topic_funcs AND name = 'Function Definition' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_def, 'Print Message', 'write a function that prints Hello.', 'Easy', 'no constraints', 'The function contains only output logic.\nWhen called, it executes the print statement once and finishes.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, 'no input', 'Hello', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_def, 'Print Number', 'write a function that prints a given integer.', 'Easy', '-10^6 ≤ n ≤ 10^6', 'The function receives one parameter.\nThe parameter value is printed directly inside the function.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '5', '5', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_def, 'Square of Number', 'write a function that prints the square of a number.', 'Medium', '-10^6 ≤ n ≤ 10^6', 'The function multiplies the input value by itself.\nThe result is printed from inside the function.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '4', '16', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_def, 'Print Array Elements', 'write a function that prints all elements of an array.', 'Medium', '1 ≤ n ≤ 10^5', 'The function receives the array and its size.\nA loop iterates through all indices and prints values.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '3\n1 2 3', '1 2 3', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_def, 'Print Large Range', 'write a function that prints numbers from 1 to n.', 'Hard', '1 ≤ n ≤ 10^7', 'The function uses a loop that runs n times.\nFor large n, the function must be efficient and avoid extra operations.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '5', '1 2 3 4 5', TRUE);


-- -----------------------------------------------------
-- Functions -> Function Parameters
-- -----------------------------------------------------
SET @sub_params = (SELECT id FROM subtopics WHERE topic_id = @topic_funcs AND name = 'Function Parameters' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_params, 'Sum of Two Numbers', 'write a function that takes two integers and prints their sum.', 'Easy', '-10^6 ≤ a, b ≤ 10^6', 'Both values are passed as parameters.\nThe function adds them and prints the result.');
SET @qp1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp1, '3 7', '10', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_params, 'Multiply Three Numbers', 'write a function that multiplies three integers.', 'Easy', '-10^4 ≤ a, b, c ≤ 10^4', 'Multiple parameters are passed to the function.\nAll values are multiplied inside the function.');
SET @qp2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp2, '2 3 4', '24', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_params, 'Minimum of Two Numbers', 'write a function that prints the smaller of two numbers.', 'Medium', '-10^9 ≤ a, b ≤ 10^9', 'The function compares both parameters.\nThe smaller value is selected and printed.');
SET @qp3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp3, '8 3', '3', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_params, 'Count Even Numbers', 'write a function that counts even numbers in an array.', 'Medium', '1 ≤ n ≤ 10^5', 'Each element is checked using modulo.\nA counter tracks how many even values exist.');
SET @qp4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp4, '5\n1 2 3 4 6', '3', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_params, 'Sum of Large Array', 'write a function that returns the sum of n numbers.', 'Hard', '1 ≤ n ≤ 10^6\n-10^9 ≤ element ≤ 10^9', 'The function processes large input efficiently in one loop.\nA 64-bit variable is required to store the result safely.');
SET @qp5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp5, '3\n1000000000 1000000000 1000000000', '3000000000', TRUE);


-- -----------------------------------------------------
-- Functions -> Return Values
-- -----------------------------------------------------
SET @sub_ret = (SELECT id FROM subtopics WHERE topic_id = @topic_funcs AND name = 'Return Values' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_ret, 'Return Sum', 'write a function that returns the sum of two numbers.', 'Easy', '-10^6 ≤ a, b ≤ 10^6', 'The function computes the sum and returns it.\nThe returned value is printed in main.');
SET @qr1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qr1, '4 6', '10', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_ret, 'Return Square', 'write a function that returns the square of a number.', 'Easy', '-10^6 ≤ n ≤ 10^6', 'The function calculates n × n and returns the value.');
SET @qr2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qr2, '5', '25', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_ret, 'Maximum of Three', 'write a function that returns the maximum of three numbers.', 'Medium', '-10^9 ≤ a, b, c ≤ 10^9', 'The function compares all three values step by step.\nThe largest value is returned.');
SET @qr3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qr3, '3 9 7', '9', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_ret, 'Array Sum Return', 'write a function that returns the sum of array elements.', 'Medium', '1 ≤ n ≤ 10^5', 'The function loops through the array.\nEach value is added to a sum variable and returned.');
SET @qr4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qr4, '4\n2 4 6 8', '20', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_ret, 'Return GCD', 'write a function that returns the greatest common divisor of two numbers.', 'Hard', '1 ≤ a, b ≤ 10^18', 'The function repeatedly reduces values using remainder.\nThis continues until one value becomes zero.\nThe remaining value is the final result.');
SET @qr5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qr5, '48 18', '6', TRUE);


-- -----------------------------------------------------
-- Functions -> Recursion
-- -----------------------------------------------------
SET @sub_rec = (SELECT id FROM subtopics WHERE topic_id = @topic_funcs AND name = 'Recursion' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_rec, 'Print Numbers', 'print numbers from 1 to n using recursion.', 'Easy', '1 ≤ n ≤ 1000', 'The function calls itself with smaller value.\nPrinting happens while returning from recursion.');
SET @qrec1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qrec1, '3', '1 2 3', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_rec, 'Factorial', 'find factorial of a number using recursion.', 'Easy', '0 ≤ n ≤ 12', 'Each call multiplies n with factorial of n−1.\nThe base case stops recursion at 0.');
SET @qrec2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qrec2, '4', '24', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_rec, 'Sum of Digits', 'find sum of digits of a number using recursion.', 'Medium', '0 ≤ n ≤ 10^9', 'The last digit is extracted and added recursively.\nThe number is reduced each call.');
SET @qrec3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qrec3, '123', '6', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_rec, 'Reverse Number', 'reverse a number using recursion.', 'Medium', '0 ≤ n ≤ 10^9', 'Digits are processed one by one.\nRecursive calls rebuild the number in reverse order.');
SET @qrec4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qrec4, '120', '21', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_rec, 'Fibonacci Large n', 'find nth fibonacci number using recursion with optimization.', 'Hard', '1 ≤ n ≤ 10^5', 'Simple recursion is inefficient for large n.\nOptimized recursion avoids repeated calculations.\nThis ensures performance remains acceptable.');
SET @qrec5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qrec5, '10', '55', TRUE);


-- -----------------------------------------------------
-- Functions -> Function Overloading
-- -----------------------------------------------------
SET @sub_over = (SELECT id FROM subtopics WHERE topic_id = @topic_funcs AND name = 'Function Overloading' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_over, 'Add Integers', 'create overloaded functions to add two integers.', 'Easy', '-10^6 ≤ a, b ≤ 10^6', 'Both functions share the same name.\nDifferent parameter types decide which function runs.');
SET @qov1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qov1, '2 3', '5', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_over, 'Add Floats', 'create overloaded functions to add two floating values.', 'Easy', '0 ≤ a, b ≤ 10^6', 'The compiler selects the float version automatically.');
SET @qov2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qov2, '2.5 1.5', '4', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_over, 'Area Calculation', 'use function overloading to calculate area of square and rectangle.', 'Medium', '1 ≤ values ≤ 10^6', 'Different parameter counts trigger different functions.\nEach function applies its own formula.');
SET @qov3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qov3, '4\n3 5', '16\n15', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_over, 'Print Values', 'overload function to print integer and string.', 'Medium', 'string length ≤ 100', 'Function name is same.\nParameter type decides which version is executed.');
SET @qov4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qov4, '10\nhello', '10\nhello', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_funcs, @sub_over, 'Max Value Overloading', 'use function overloading to find maximum of two integers and two long values.', 'Hard', '-10^18 ≤ values ≤ 10^18', 'Overloaded functions handle different data sizes.\nCorrect function is selected based on argument type.\nThis avoids writing separate function names.');
SET @qov5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qov5, '5 9\n100000000000 90000000000', '9\n100000000000', TRUE);
