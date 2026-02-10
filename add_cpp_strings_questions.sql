USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_str = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'strings' LIMIT 1);

-- -----------------------------------------------------
-- Strings -> String Length
-- -----------------------------------------------------
SET @sub_len = (SELECT id FROM subtopics WHERE topic_id = @topic_str AND name = 'String Length' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_len, 'Calculate Length of String', 'You are given a string containing only uppercase and lowercase English letters.\nYour task is to determine how many characters are present in the string.\nEach character, regardless of whether it is uppercase or lowercase, must be counted.', 'Easy', '1 ≤ length ≤ 10^5', 'The string contains the characters h, e, l, l, o.\nEach character contributes exactly one count.\nSince there are five characters, the length is 5.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, 'hello', '5', TRUE),
(@q1, 'Code', '4', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_len, 'Length of Single Character String', 'You are given a string that contains exactly one character.\nDetermine and print the length of the string.', 'Easy', 'length = 1', 'There is only one character present in the string.\nA string with one character always has length 1.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, 'A', '1', TRUE),
(@q2, 'z', '1', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_len, 'Length Without Counting Spaces', 'You are given a string that may contain spaces between words.\nYour task is to calculate the length of the string after excluding all space characters.\nOnly visible characters such as letters and digits should be counted.', 'Medium', '1 ≤ length ≤ 2×10^5', 'The string contains five characters including two spaces.\nSpaces are ignored, leaving three visible characters.\nSo the final length is 3.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, 'a b c', '3', TRUE),
(@q3, 'hi there', '7', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_len, 'Compare Lengths of Two Strings', 'You are given two strings.\nCompare their lengths and determine which string is longer.\nIf both strings have the same length, print Equal.', 'Medium', '1 ≤ length ≤ 10^5', 'The first string has five characters.\nThe second string has two characters.\nSince the first string is longer, output is First.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, 'hello\nhi', 'First', TRUE),
(@q4, 'abc\nxyz', 'Equal', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_len, 'Length of Longest Word', 'You are given a sentence containing multiple words separated by spaces.\nYour task is to find the length of the longest word in the sentence.\nOnly alphabetic characters belong to words.', 'Hard', '1 ≤ length ≤ 5×10^5', 'The words are I, love, programming.\nTheir lengths are 1, 4, and 11.\nThe longest word is programming, so the answer is 11.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, 'I love programming', '11', TRUE),
(@q5, 'one two three', '5', TRUE);


-- -----------------------------------------------------
-- Strings -> Access Strings
-- -----------------------------------------------------
SET @sub_acc = (SELECT id FROM subtopics WHERE topic_id = @topic_str AND name = 'Access Strings' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_acc, 'Access First Character', 'Given a non-empty string, print its first character.', 'Easy', 'length ≥ 1', 'Strings are indexed from the beginning.\nThe first character is accessed directly from the start of the string.');
SET @qa1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa1, 'code', 'c', TRUE),
(@qa1, 'A', 'A', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_acc, 'Access Last Character', 'Given a string, print the last character.', 'Easy', 'length ≥ 1', 'The last character is located at the end of the string.\nAccessing it gives the final character.');
SET @qa2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa2, 'hello', 'o', TRUE),
(@qa2, 'Z', 'Z', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_acc, 'Access Middle Character', 'Given a string, print its middle character.\nIf the string length is even, print the left middle character.', 'Medium', '1 ≤ length ≤ 10^5', 'The length is 6, which is even.\nThe two middle characters are at positions 2 and 3.\nThe left middle character is selected.');
SET @qa3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa3, 'coding', 'd', TRUE),
(@qa3, 'abc', 'b', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_acc, 'Count Vowels', 'Count the number of vowels in a string by accessing each character one by one.\nVowels include a, e, i, o, u in both uppercase and lowercase.', 'Medium', '1 ≤ length ≤ 2×10^5', 'The vowels present are e and o.\nEach character is checked and counted.');
SET @qa4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa4, 'hello', '2', TRUE),
(@qa4, 'AEIOU', '5', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_acc, 'Palindrome Verification', 'Determine whether a string is a palindrome.\nA palindrome reads the same forward and backward.\nYou must compare characters from both ends moving toward the center.', 'Hard', '1 ≤ length ≤ 5×10^5', 'Characters from start and end match at every step.\nThe string is symmetric.');
SET @qa5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa5, 'madam', 'Yes', TRUE),
(@qa5, 'hello', 'No', TRUE);


-- -----------------------------------------------------
-- Strings -> Special Characters
-- -----------------------------------------------------
SET @sub_spec = (SELECT id FROM subtopics WHERE topic_id = @topic_str AND name = 'Special Characters' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_spec, 'Print String with Symbols', 'Print a string that may contain special characters exactly as it is.', 'Easy', 'length ≤ 100', 'Special characters are treated as normal characters when printing.');
SET @qs1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs1, 'hi!', 'hi!', TRUE),
(@qs1, '@#', '@#', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_spec, 'Count Special Characters', 'Count how many special characters are present in a string.\nSpecial characters are those that are not letters or digits.', 'Easy', 'length ≤ 10^5', '@ and # are neither letters nor digits.\nSo both are counted.');
SET @qs2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs2, 'a@b#', '2', TRUE),
(@qs2, 'abc', '0', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_spec, 'Remove Special Characters', 'Remove all special characters from the string and print the cleaned result.\nOnly letters and digits should remain.', 'Medium', 'length ≤ 2×10^5', 'Special characters are skipped during processing.\nOnly valid characters are appended.');
SET @qs3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs3, 'a@b#c', 'abc', TRUE),
(@qs3, '123!@', '123', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_spec, 'Replace Special Characters', 'Replace every special character in the string with an underscore.', 'Medium', 'length ≤ 2×10^5', 'The special character is replaced with _.\nOther characters remain unchanged.');
SET @qs4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs4, 'a@b', 'a_b', TRUE),
(@qs4, 'hi!', 'hi_', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_spec, 'Password Validation', 'Check whether a password is valid.\nA valid password must contain at least one letter, one digit, and one special character.', 'Hard', 'length ≤ 10^5', 'The string contains letters, digits, and a special character.\nAll conditions are satisfied.');
SET @qs5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs5, 'Abc@123', 'Valid', TRUE),
(@qs5, 'abc123', 'Invalid', TRUE);


-- -----------------------------------------------------
-- Strings -> String Concatenation
-- -----------------------------------------------------
SET @sub_concat = (SELECT id FROM subtopics WHERE topic_id = @topic_str AND name = 'String Concatenation' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_concat, 'Concatenate Two Strings', 'Join two strings and print the result.', 'Easy', 'length ≤ 10^5', 'The second string is appended to the first.');
SET @qc1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc1, 'hi\nthere', 'hithere', TRUE),
(@qc1, 'A\nB', 'AB', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_concat, 'Concatenate with Space', 'Concatenate two strings with a space in between.', 'Easy', 'length ≤ 10^5', 'A space is manually inserted between the strings.');
SET @qc2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc2, 'hello\nworld', 'hello world', TRUE),
(@qc2, 'hi\nall', 'hi all', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_concat, 'Concatenate Multiple Strings', 'Given n strings, concatenate them in the order provided.', 'Medium', '1 ≤ n ≤ 10^5', 'Each string is appended sequentially.');
SET @qc3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc3, '3\na b c', 'abc', TRUE),
(@qc3, '2\nhi bye', 'hibye', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_concat, 'Reverse Concatenation', 'Concatenate two strings such that the second string comes before the first.', 'Medium', 'length ≤ 10^5', 'The order of joining is reversed.');
SET @qc4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc4, 'one\ntwo', 'twoone', TRUE),
(@qc4, 'A\nB', 'BA', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_concat, 'Large Concatenation Length', 'You are given many strings.\nConcatenate all of them and print the length of the final string.', 'Hard', '1 ≤ n ≤ 5×10^5', 'All characters across all strings are counted.');
SET @qc5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc5, '3\nabc def ghi', '9', TRUE),
(@qc5, '2\nhello world', '10', TRUE);


-- -----------------------------------------------------
-- Strings -> Numbers and Strings
-- -----------------------------------------------------
SET @sub_num = (SELECT id FROM subtopics WHERE topic_id = @topic_str AND name = 'Numbers and Strings' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_num, 'String to Number', 'Convert a numeric string into an integer.', 'Easy', 'value ≤ 10^9', 'Each digit is interpreted numerically.');
SET @qn1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qn1, '123', '123', TRUE),
(@qn1, '0', '0', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_num, 'Number to String', 'Convert an integer into its string form.', 'Easy', 'value ≤ 10^9', 'The number is converted to characters.');
SET @qn2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qn2, '45', '45', TRUE),
(@qn2, '7', '7', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_num, 'Sum of Digits', 'Given a string containing digits only, calculate the sum of all digits.', 'Medium', 'length ≤ 2×10^5', 'Each digit is converted and added.');
SET @qn3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qn3, '123', '6', TRUE),
(@qn3, '909', '18', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_num, 'Extract Digits', 'Extract all digits from a mixed string and form a number.', 'Medium', 'length ≤ 2×10^5', 'Only digit characters are collected.');
SET @qn4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qn4, 'a1b2c3', '123', TRUE),
(@qn4, '9x8', '98', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_str, @sub_num, 'Largest Number from String Digits', 'Extract digits from a string and rearrange them to form the largest possible number.\nIf no digits exist, output 0.', 'Hard', 'length ≤ 5×10^5', 'Digits are sorted in descending order.');
SET @qn5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qn5, 'a3b1c9', '931', TRUE),
(@qn5, 'abc', '0', TRUE);
