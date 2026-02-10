USE codewise;

-- Get Language ID for 'C'
SET @lang_c = (SELECT id FROM languages WHERE slug = 'c' LIMIT 1);

-- =================================================================================================
-- TOPIC 1: STRUCTURES
-- =================================================================================================
-- Ensure Topic Exists
INSERT INTO topics (language_id, name, slug, order_index) 
SELECT @lang_c, 'Structures', 'structures', 9 
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE slug = 'structures');

SET @topic_struct = (SELECT id FROM topics WHERE slug = 'structures' LIMIT 1);

-- Subtopics
INSERT INTO subtopics (topic_id, name, order_index) VALUES 
(@topic_struct, 'Structure', 1),
(@topic_struct, 'Array of Structures', 2),
(@topic_struct, 'Pointer to Structure', 3);

SET @st_struct = (SELECT id FROM subtopics WHERE name = 'Structure' AND topic_id = @topic_struct LIMIT 1);
SET @st_arr_struct = (SELECT id FROM subtopics WHERE name = 'Array of Structures' AND topic_id = @topic_struct LIMIT 1);
SET @st_ptr_struct = (SELECT id FROM subtopics WHERE name = 'Pointer to Structure' AND topic_id = @topic_struct LIMIT 1);

-- Questions (Structure)
DELETE FROM questions WHERE subtopic_id = @st_struct;
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_struct, @st_struct, 'Define a structure for a student with name and age. Read and print details.', 'Define a structure for a student with name and age. Read and print details.', 'Easy', 'Name length <= 50, 0 <= Age <= 120'),
(@topic_struct, @st_struct, 'Define a structure for a book with title and price. Print details.', 'Define a structure for a book with title and price. Print details.', 'Easy', 'Price >= 0'),
(@topic_struct, @st_struct, 'Create a structure for employee and calculate annual salary.', 'Create a structure for employee and calculate annual salary.', 'Medium', 'Salary >= 0'),
(@topic_struct, @st_struct, 'Compare two structures of type Point and find distance from origin.', 'Compare two structures of type Point and find distance from origin.', 'Medium', '-1000 <= x, y <= 1000'),
(@topic_struct, @st_struct, 'Create a structure for student marks and find topper among N students.', 'Create a structure for student marks and find topper among N students.', 'Hard', '1 <= N <= 10^5, 0 <= Marks <= 100');

-- Test Cases (Structure)
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES 
((SELECT id FROM questions WHERE title = 'Define a structure for a student with name and age. Read and print details.' AND subtopic_id = @st_struct LIMIT 1), 'Ravi\n20', 'Ravi 20', TRUE),
((SELECT id FROM questions WHERE title = 'Define a structure for a book with title and price. Print details.' AND subtopic_id = @st_struct LIMIT 1), 'CProgramming\n450', 'CProgramming 450', TRUE),
((SELECT id FROM questions WHERE title = 'Create a structure for employee and calculate annual salary.' AND subtopic_id = @st_struct LIMIT 1), 'Anil\n10000', '120000', TRUE),
((SELECT id FROM questions WHERE title = 'Compare two structures of type Point and find distance from origin.' AND subtopic_id = @st_struct LIMIT 1), '3 4', '5', TRUE),
((SELECT id FROM questions WHERE title = 'Create a structure for student marks and find topper among N students.' AND subtopic_id = @st_struct LIMIT 1), '3\nA 80\nB 95\nC 70', 'B', TRUE);

-- Questions (Array of Structures)
DELETE FROM questions WHERE subtopic_id = @st_arr_struct;
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_struct, @st_arr_struct, 'Store and print details of N students using array of structures.', 'Store and print details of N students using array of structures.', 'Easy', '1 <= N <= 100'),
(@topic_struct, @st_arr_struct, 'Store N products and print their prices.', 'Store N products and print their prices.', 'Easy', '1 <= N <= 100'),
(@topic_struct, @st_arr_struct, 'Find student with highest marks using array of structures.', 'Find student with highest marks using array of structures.', 'Medium', '1 <= N <= 10^5'),
(@topic_struct, @st_arr_struct, 'Search an employee by ID in array of structures.', 'Search an employee by ID in array of structures.', 'Medium', '1 <= N <= 10^5'),
(@topic_struct, @st_arr_struct, 'Sort students by marks using array of structures.', 'Sort students by marks using array of structures.', 'Hard', '1 <= N <= 10^5');

-- Test Cases (Array of Structures)
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES 
((SELECT id FROM questions WHERE title = 'Store and print details of N students using array of structures.' AND subtopic_id = @st_arr_struct LIMIT 1), '2\nRam 18\nSita 19', 'Ram 18\nSita 19', TRUE),
((SELECT id FROM questions WHERE title = 'Store N products and print their prices.' AND subtopic_id = @st_arr_struct LIMIT 1), '2\nPen 10\nBook 50', '10 50', TRUE),
((SELECT id FROM questions WHERE title = 'Find student with highest marks using array of structures.' AND subtopic_id = @st_arr_struct LIMIT 1), '3\nA 60\nB 85\nC 75', '85', TRUE),
((SELECT id FROM questions WHERE title = 'Search an employee by ID in array of structures.' AND subtopic_id = @st_arr_struct LIMIT 1), '3\n101 Ram\n102 Sam\n103 Tom\n102', 'Sam', TRUE),
((SELECT id FROM questions WHERE title = 'Sort students by marks using array of structures.' AND subtopic_id = @st_arr_struct LIMIT 1), '3\nA 70\nB 90\nC 80', 'B 90\nC 80\nA 70', TRUE);

-- Questions (Pointer to Structure)
DELETE FROM questions WHERE subtopic_id = @st_ptr_struct;
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_struct, @st_ptr_struct, 'Access structure members using pointer.', 'Access structure members using pointer.', 'Easy', 'Name length <= 50'),
(@topic_struct, @st_ptr_struct, 'Update structure value using pointer.', 'Update structure value using pointer.', 'Easy', '-10^9 <= Value <= 10^9'),
(@topic_struct, @st_ptr_struct, 'Pass structure to function using pointer and print details.', 'Pass structure to function using pointer and print details.', 'Medium', 'Salary >= 0'),
(@topic_struct, @st_ptr_struct, 'Calculate total marks using pointer to structure.', 'Calculate total marks using pointer to structure.', 'Medium', '0 <= Marks <= 100'),
(@topic_struct, @st_ptr_struct, 'Dynamically allocate structure using pointer and store student details.', 'Dynamically allocate structure using pointer and store student details.', 'Hard', 'Name length <= 50');

-- Test Cases (Pointer to Structure)
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES 
((SELECT id FROM questions WHERE title = 'Access structure members using pointer.' AND subtopic_id = @st_ptr_struct LIMIT 1), 'Kiran\n22', 'Kiran 22', TRUE),
((SELECT id FROM questions WHERE title = 'Update structure value using pointer.' AND subtopic_id = @st_ptr_struct LIMIT 1), '10\n20', '20', TRUE),
((SELECT id FROM questions WHERE title = 'Pass structure to function using pointer and print details.' AND subtopic_id = @st_ptr_struct LIMIT 1), 'Raju\n15000', 'Raju 15000', TRUE),
((SELECT id FROM questions WHERE title = 'Calculate total marks using pointer to structure.' AND subtopic_id = @st_ptr_struct LIMIT 1), '60 70 80 90 50', '350', TRUE),
((SELECT id FROM questions WHERE title = 'Dynamically allocate structure using pointer and store student details.' AND subtopic_id = @st_ptr_struct LIMIT 1), 'Neha\n21', 'Neha 21', TRUE);


-- =================================================================================================
-- TOPIC 2: UNIONS
-- =================================================================================================
INSERT INTO topics (language_id, name, slug, order_index) 
SELECT @lang_c, 'Unions', 'unions', 10 
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE slug = 'unions');

SET @topic_unions = (SELECT id FROM topics WHERE slug = 'unions' LIMIT 1);

-- Subtopics
INSERT INTO subtopics (topic_id, name, order_index) VALUES (@topic_unions, 'Union', 1);
SET @st_union = (SELECT id FROM subtopics WHERE name = 'Union' AND topic_id = @topic_unions LIMIT 1);

-- Questions (Union)
DELETE FROM questions WHERE subtopic_id = @st_union;
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_unions, @st_union, 'Define a union and print integer value.', 'Define a union and print integer value.', 'Easy', '-10^9 <= N <= 10^9'),
(@topic_unions, @st_union, 'Store a float value in union and print it.', 'Store a float value in union and print it.', 'Easy', 'Valid float'),
(@topic_unions, @st_union, 'Show memory size of union with int and float.', 'Show memory size of union with int and float.', 'Medium', 'System dependent'),
(@topic_unions, @st_union, 'Store int then char in union and print char.', 'Store int then char in union and print char.', 'Medium', 'Single character'),
(@topic_unions, @st_union, 'Use union to store either student ID or marks based on choice.', 'Use union to store either student ID or marks based on choice.', 'Hard', 'Choice is 1 or 2');

-- Test Cases (Union)
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES 
((SELECT id FROM questions WHERE title = 'Define a union and print integer value.' AND subtopic_id = @st_union LIMIT 1), '10', '10', TRUE),
((SELECT id FROM questions WHERE title = 'Store a float value in union and print it.' AND subtopic_id = @st_union LIMIT 1), '3.5', '3.5', TRUE),
((SELECT id FROM questions WHERE title = 'Show memory size of union with int and float.' AND subtopic_id = @st_union LIMIT 1), '', '4', TRUE),
((SELECT id FROM questions WHERE title = 'Store int then char in union and print char.' AND subtopic_id = @st_union LIMIT 1), 'A', 'A', TRUE),
((SELECT id FROM questions WHERE title = 'Use union to store either student ID or marks based on choice.' AND subtopic_id = @st_union LIMIT 1), '1\n101', '101', TRUE);


-- =================================================================================================
-- TOPIC 3: ENUMERATION
-- =================================================================================================
INSERT INTO topics (language_id, name, slug, order_index) 
SELECT @lang_c, 'Enumeration', 'enumeration', 11 
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE slug = 'enumeration');

SET @topic_enum = (SELECT id FROM topics WHERE slug = 'enumeration' LIMIT 1);

-- Subtopics
INSERT INTO subtopics (topic_id, name, order_index) VALUES (@topic_enum, 'Enumeration', 1);
SET @st_enum = (SELECT id FROM subtopics WHERE name = 'Enumeration' AND topic_id = @topic_enum LIMIT 1);

-- Questions (Enumeration)
DELETE FROM questions WHERE subtopic_id = @st_enum;
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_enum, @st_enum, 'Define enum for days and print value of Monday.', 'Define enum for days and print value of Monday.', 'Easy', 'None'),
(@topic_enum, @st_enum, 'Print enum value of selected color.', 'Print enum value of selected color.', 'Easy', 'Valid color'),
(@topic_enum, @st_enum, 'Use enum in switch to print day name.', 'Use enum in switch to print day name.', 'Medium', '0 <= Value <= 6'),
(@topic_enum, @st_enum, 'Check weekday or weekend using enum.', 'Check weekday or weekend using enum.', 'Medium', '0 <= Value <= 6'),
(@topic_enum, @st_enum, 'Create menu-driven program using enum.', 'Create menu-driven program using enum.', 'Hard', 'Valid choice');

-- Test Cases (Enumeration)
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES 
((SELECT id FROM questions WHERE title = 'Define enum for days and print value of Monday.' AND subtopic_id = @st_enum LIMIT 1), '', '0', TRUE),
((SELECT id FROM questions WHERE title = 'Print enum value of selected color.' AND subtopic_id = @st_enum LIMIT 1), 'RED', '0', TRUE),
((SELECT id FROM questions WHERE title = 'Use enum in switch to print day name.' AND subtopic_id = @st_enum LIMIT 1), '2', 'Wednesday', TRUE),
((SELECT id FROM questions WHERE title = 'Check weekday or weekend using enum.' AND subtopic_id = @st_enum LIMIT 1), '6', 'Weekend', TRUE),
((SELECT id FROM questions WHERE title = 'Create menu-driven program using enum.' AND subtopic_id = @st_enum LIMIT 1), '1', 'Option Selected', TRUE);


-- =================================================================================================
-- TOPIC 4: TYPEDEF
-- =================================================================================================
INSERT INTO topics (language_id, name, slug, order_index) 
SELECT @lang_c, 'Typedef', 'typedef', 12 
WHERE NOT EXISTS (SELECT 1 FROM topics WHERE slug = 'typedef');

SET @topic_typedef = (SELECT id FROM topics WHERE slug = 'typedef' LIMIT 1);

-- Subtopics
INSERT INTO subtopics (topic_id, name, order_index) VALUES (@topic_typedef, 'typedef', 1);
SET @st_typedef = (SELECT id FROM subtopics WHERE name = 'typedef' AND topic_id = @topic_typedef LIMIT 1);

-- Questions (Typedef)
DELETE FROM questions WHERE subtopic_id = @st_typedef;
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints) VALUES
(@topic_typedef, @st_typedef, 'Use typedef to rename int and print a value.', 'Use typedef to rename int and print a value.', 'Easy', '-10^9 <= N <= 10^9'),
(@topic_typedef, @st_typedef, 'Use typedef for structure and print details.', 'Use typedef for structure and print details.', 'Easy', 'Name length <= 50'),
(@topic_typedef, @st_typedef, 'Use typedef for array and print elements.', 'Use typedef for array and print elements.', 'Medium', '1 <= N <= 100'),
(@topic_typedef, @st_typedef, 'Use typedef for pointer and modify variable.', 'Use typedef for pointer and modify variable.', 'Medium', '-10^9 <= N <= 10^9'),
(@topic_typedef, @st_typedef, 'Use typedef to simplify function pointer and call function.', 'Use typedef to simplify function pointer and call function.', 'Hard', '-10^9 <= A, B <= 10^9');

-- Test Cases (Typedef)
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES 
((SELECT id FROM questions WHERE title = 'Use typedef to rename int and print a value.' AND subtopic_id = @st_typedef LIMIT 1), '15', '15', TRUE),
((SELECT id FROM questions WHERE title = 'Use typedef for structure and print details.' AND subtopic_id = @st_typedef LIMIT 1), 'Amit\n23', 'Amit 23', TRUE),
((SELECT id FROM questions WHERE title = 'Use typedef for array and print elements.' AND subtopic_id = @st_typedef LIMIT 1), '3\n1 2 3', '1 2 3', TRUE),
((SELECT id FROM questions WHERE title = 'Use typedef for pointer and modify variable.' AND subtopic_id = @st_typedef LIMIT 1), '5', '10', TRUE),
((SELECT id FROM questions WHERE title = 'Use typedef to simplify function pointer and call function.' AND subtopic_id = @st_typedef LIMIT 1), '4 6', '10', TRUE);
