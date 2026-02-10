USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_arrays = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'arrays' LIMIT 1);

-- -----------------------------------------------------
-- Arrays -> Single Dimensional Arrays
-- -----------------------------------------------------
SET @sub_single = (SELECT id FROM subtopics WHERE topic_id = @topic_arrays AND name = 'Single Dimensional Arrays' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_single, 'Print Array Elements', 'read n integers into an array and print them.', 'Easy', '1 ≤ n ≤ 100', 'The array stores input values and a loop prints each element.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '5\n1 2 3 4 5', '1 2 3 4 5', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_single, 'Access Specific Element', 'print the first and last element of an array.', 'Easy', '1 ≤ n ≤ 100', 'Arrays use index starting from 0. First element is at index 0 and last at n-1.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '4\n10 20 30 40', '10 40', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_single, 'Sum of Array Elements', 'find the sum of all elements in an array.', 'Medium', '1 ≤ n ≤ 100\n-10^6 ≤ element ≤ 10^6', 'A loop iterates through the array and adds each value to a sum variable.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '3\n5 10 15', '30', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_single, 'Find Largest Element', 'find the largest element in an array.', 'Medium', '1 ≤ n ≤ 100', 'The first element is assumed as maximum and compared with remaining elements.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '5\n2 9 1 7 4', '9', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_single, 'Reverse Array', 'reverse the elements of an array.', 'Hard', '1 ≤ n ≤ 100', 'Elements are swapped from start and end indices until the middle is reached.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '4\n1 2 3 4', '4 3 2 1', TRUE);


-- -----------------------------------------------------
-- Arrays -> Arrays and Loops
-- -----------------------------------------------------
SET @sub_loops = (SELECT id FROM subtopics WHERE topic_id = @topic_arrays AND name = 'Arrays and Loops' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_loops, 'Print Using For Loop', 'print array elements using a for loop.', 'Easy', '1 ≤ n ≤ 100', 'A for loop is used to traverse arrays sequentially.');
SET @ql1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql1, '3\n7 8 9', '7 8 9', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_loops, 'Count Even Elements', 'count number of even elements in an array.', 'Medium', '1 ≤ n ≤ 100', 'The loop checks each element using modulo operator and increments count.');
SET @ql2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql2, '5\n1 2 3 4 5', '2', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_loops, 'Search Element', 'search an element in an array using loop.', 'Hard', '1 ≤ n ≤ 100', 'Each element is compared with the key. Loop stops when match is found.');
SET @ql3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@ql3, '5\n10 20 30 40 50\n30', 'Found', TRUE);


-- -----------------------------------------------------
-- Arrays -> Omit Array Size
-- -----------------------------------------------------
SET @sub_omit = (SELECT id FROM subtopics WHERE topic_id = @topic_arrays AND name = 'Omit Array Size' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_omit, 'Array Without Size', 'declare and print an array without specifying its size.', 'Easy', 'array size ≤ 10', 'The array size can be inferred from the initializer list.');
SET @qo1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qo1, '3 6 9', '3 6 9', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_omit, 'Sum Without Size', 'find sum of array elements when size is not specified.', 'Medium', 'array size ≤ 10', 'The compiler determines array size automatically from initializer values.');
SET @qo2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qo2, '1 2 3 4', '10', TRUE);


-- -----------------------------------------------------
-- Arrays -> Get Array Size
-- -----------------------------------------------------
SET @sub_size = (SELECT id FROM subtopics WHERE topic_id = @topic_arrays AND name = 'Get Array Size' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_size, 'Find Array Length', 'find the number of elements in an array.', 'Easy', 'array size ≤ 100', 'The size is calculated using sizeof(array) / sizeof(array[0]).');
SET @qs1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs1, '5 10 15', '3', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_size, 'Print Using Size', 'print array elements using calculated array size.', 'Medium', 'array size ≤ 100', 'Loop runs from 0 to size-1 using calculated array length.');
SET @qs2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs2, '4 8 12', '4 8 12', TRUE);


-- -----------------------------------------------------
-- Arrays -> Multi Dimensional Arrays
-- -----------------------------------------------------
SET @sub_multi = (SELECT id FROM subtopics WHERE topic_id = @topic_arrays AND name = 'Multi Dimensional Arrays' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_multi, 'Print 2D Array', 'read and print a 2x2 matrix.', 'Easy', 'elements ≤ 100', 'Nested loops are used to access rows and columns of a 2D array.');
SET @qm1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm1, '1 2\n3 4', '1 2\n3 4', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_multi, 'Sum of Matrix Elements', 'find sum of all elements in a 2D array.', 'Medium', 'rows, cols ≤ 10', 'Each element is accessed using two loops and added to sum.');
SET @qm2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm2, '1 1\n2 2', '6', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_arrays, @sub_multi, 'Matrix Addition', 'add two 2x2 matrices.', 'Hard', 'elements ≤ 100', 'Corresponding elements of both matrices are added using nested loops.');
SET @qm3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm3, '1 2\n3 4\n5 6\n7 8', '6 8\n10 12', TRUE);
