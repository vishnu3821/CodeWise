USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_ref = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'references' LIMIT 1);

-- -----------------------------------------------------
-- References -> References
-- -----------------------------------------------------
SET @sub_ref = (SELECT id FROM subtopics WHERE topic_id = @topic_ref AND name = 'References' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_ref, 'Basic Reference Variable', 'You are given an integer variable.\nCreate a reference variable that refers to the same integer.\nPrint the value using the reference variable.', 'Easy', '-10^6 ≤ value ≤ 10^6', 'A reference variable acts as an alternative name for an existing variable.\nWhen the reference is created, it does not store a new value.\nIt simply points to the same memory location as the original variable.\nPrinting the reference prints the same value as the original variable.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '10', '10', TRUE),
(@q1, '-5', '-5', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_ref, 'Modify Value Using Reference', 'You are given an integer variable and a reference to it.\nUpdate the value using the reference variable and print the updated value.', 'Easy', '-10^6 ≤ value ≤ 10^6', 'When a value is modified through a reference,\nthe original variable is also modified because both share the same memory.\nThe update is reflected everywhere the variable is accessed.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '5', '15', TRUE),
(@q2, '0', '10', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_ref, 'Swap Values Using References', 'You are given two integers.\nUse references inside a function to swap their values.\nPrint the swapped values.', 'Medium', '-10^6 ≤ values ≤ 10^6', 'References allow direct access to the original variables passed to a function.\nWhen the function swaps values using references,\nthe changes persist outside the function scope.\nNo additional memory is required for copying values.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '3 7', '7 3', TRUE),
(@q3, '-1 4', '4 -1', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_ref, 'Reference with Array Element', 'You are given an array and an index.\nCreate a reference to the array element at the given index.\nModify the element using the reference and print the updated array.', 'Medium', '1 ≤ array size ≤ 10^5', 'Array elements occupy memory locations just like variables.\nA reference can be created to a specific array element.\nUpdating the reference updates the array element directly.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '1 2 3\n1', '1 10 3', TRUE),
(@q4, '5 6 7\n0', '20 6 7', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_ref, 'Reference Lifetime Behavior', 'You are given a variable inside a function.\nCreate a reference to that variable and modify it multiple times.\nExplain how reference lifetime behaves within the function scope\nand print the final value.', 'Hard', '-10^6 ≤ value ≤ 10^6', 'A reference must always be initialized at the time of declaration.\nIt cannot exist independently of the variable it refers to.\nAs long as the variable is alive, the reference remains valid.\nEach modification through the reference updates the same memory location.\nWhen the function ends, both the variable and its reference go out of scope.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '10', '30', TRUE),
(@q5, '2', '22', TRUE);


-- -----------------------------------------------------
-- References -> Memory Address
-- -----------------------------------------------------
SET @sub_mem = (SELECT id FROM subtopics WHERE topic_id = @topic_ref AND name = 'Memory Address' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_mem, 'Print Memory Address', 'You are given an integer variable.\nPrint the memory address of the variable.', 'Easy', '-10^6 ≤ value ≤ 10^6', 'Every variable is stored at a unique memory location.\nThe address operator retrieves the memory address of the variable.\nThe actual address value depends on the system and runtime.');
SET @qm1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm1, '10', 'address', TRUE),
(@qm1, '-5', 'address', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_mem, 'Same Address for Variable and Reference', 'Create a reference to a variable.\nPrint the memory address of both the variable and the reference.', 'Easy', '-10^6 ≤ value ≤ 10^6', 'A reference is just another name for the same variable.\nIt does not occupy a separate memory location.\nTherefore, both addresses are identical.');
SET @qm2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm2, '7', 'same address', TRUE),
(@qm2, '0', 'same address', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_mem, 'Address of Array Elements', 'You are given an array of integers.\nPrint the memory address of each element.', 'Medium', '1 ≤ array size ≤ 10^5', 'Array elements are stored in contiguous memory locations.\nEach element has its own address.\nAddresses increase sequentially based on data size.');
SET @qm3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm3, '1 2 3', 'address1 address2 address3', TRUE),
(@qm3, '5 10', 'address1 address2', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_mem, 'Compare Addresses of Variables', 'You are given two separate variables with the same value.\nPrint their memory addresses and compare them.', 'Medium', '-10^6 ≤ value ≤ 10^6', 'Even if two variables store the same value,\nthey are stored in different memory locations.\nEach variable has its own independent address.');
SET @qm4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm4, '5 5', 'different addresses', TRUE),
(@qm4, '0 0', 'different addresses', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ref, @sub_mem, 'Reference and Pointer Memory Relation', 'You are given a variable, a reference to it, and a pointer to it.\nPrint the memory address using all three and explain the relationship.', 'Hard', '-10^6 ≤ value ≤ 10^6', 'The variable has a memory address.\nThe reference refers to the same memory location.\nThe pointer stores the same memory address as its value.\nAll three ultimately represent access to the same memory.\nThis shows how references and pointers relate to memory addressing.');
SET @qm5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm5, '10', 'same address', TRUE),
(@qm5, '-3', 'same address', TRUE);
