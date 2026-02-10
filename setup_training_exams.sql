-- Drop tables if they exist to ensure fresh start
DROP TABLE IF EXISTS training_test_cases;
DROP TABLE IF EXISTS training_questions;
DROP TABLE IF EXISTS training_sections;
DROP TABLE IF EXISTS training_exams;

-- 1. Exams Table
CREATE TABLE training_exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 30,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Sections Table
CREATE TABLE training_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT,
    name VARCHAR(50) NOT NULL, -- 'Maths', 'English', 'Coding'
    type ENUM('mcq', 'coding') NOT NULL,
    order_index INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES training_exams(id) ON DELETE CASCADE
);

-- 3. Questions Table
CREATE TABLE training_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT,
    question_text TEXT NOT NULL,
    options JSON, -- Array of strings for MCQ ["A", "B", "C", "D"]
    correct_option_index INT, -- 0-3 for MCQ
    solution_text TEXT, -- Explanation
    marks INT DEFAULT 1,
    negative_marks DECIMAL(3,2) DEFAULT 0,
    FOREIGN KEY (section_id) REFERENCES training_sections(id) ON DELETE CASCADE
);

-- 4. Coding Test Cases Table
CREATE TABLE training_test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    input TEXT NOT NULL,
    output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES training_questions(id) ON DELETE CASCADE
);

-- SEED DATA

-- Insert Exam
INSERT INTO training_exams (title, duration_minutes, description) VALUES 
('Test_1', 30, 'Training Exam covering Maths, English, and Coding skills.');

SET @exam_id = LAST_INSERT_ID();

-- Insert Sections
INSERT INTO training_sections (exam_id, name, type, order_index) VALUES 
(@exam_id, 'Maths', 'mcq', 1);
SET @math_id = LAST_INSERT_ID();

INSERT INTO training_sections (exam_id, name, type, order_index) VALUES 
(@exam_id, 'English', 'mcq', 2);
SET @eng_id = LAST_INSERT_ID();

INSERT INTO training_sections (exam_id, name, type, order_index) VALUES 
(@exam_id, 'Coding', 'coding', 3);
SET @coding_id = LAST_INSERT_ID();

-- Insert Maths Questions
-- 1
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@math_id, 
'An amount of Rs. 5,600 is divided among A, B and C. The sum of the shares of ‘B’ and ‘C’ is equal to thrice the share of ‘A’ the sum of the shares of ‘A’ and ‘C’ is equal to Nine – Fifths the share of B. What is the share of ‘C’?', 
'["Rs. 1,400", "Rs. 2,400", "Rs. 2,200", "Rs. 2,000"]', 
2, 1);

-- 2
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@math_id, 
'In two hours A can walk two kilometers less than what B can walk in three hours. In one hour A can walk one kilometer more than B. How many kilometers can A walk in Three hours', 
'["15", "16", "20", "12"]', 
0, 1);

-- 3
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@math_id, 
'A boy was asked to multiply a number by 25. He instead multiplied the number by 52 and got the answer 324 plus the correct answer. What was the number he was initially asked to multiply?', 
'["12", "15", "25", "32"]', 
0, 1);

-- 4
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@math_id, 
'Find the next number in the series: 63, 100, 141, 184, 231, __', 
'["281", "292", "284", "294"]', 
2, 1);

-- 5
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@math_id, 
'When 75% of a number is added to 75, the result is the number again. The number is ?', 
'["150", "300", "100", "450"]', 
1, 1);


-- Insert English Questions
-- 1
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@eng_id, 
'Rearrange the sentences:\nA) Teamwork helps individuals achieve common goals.\nB) It encourages sharing of ideas and responsibilities.\nC) This leads to higher productivity and efficiency.\nD) Organizations value employees who collaborate well.', 
'["A → B → C → D", "A → C → B → D", "B → A → D → C", "D → A → B → C"]', 
0, 1);

-- 2
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@eng_id, 
'Rearrange the sentences:\nA) Time management is a critical workplace skill.\nB) It helps employees prioritize tasks effectively.\nC) As a result, deadlines are met without stress.\nD) Poor time management affects performance.', 
'["A → B → C → D", "A → D → B → C", "B → A → D → C", "D → A → B → C"]', 
0, 1);

-- 3
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@eng_id, 
'Rearrange the sentences:\nA) Technology is transforming modern education.\nB) Online platforms enable flexible learning.\nC) Students can access global resources easily.\nD) This shift requires self-discipline.', 
'["A → B → C → D", "B → A → C → D", "A → C → B → D", "D → A → B → C"]', 
0, 1);

-- 4
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@eng_id, 
'Rearrange the sentences:\nA) Communication skills are essential in corporate life.\nB) Clear communication prevents misunderstandings.\nC) It builds trust among team members.\nD) Employers value strong communicators.', 
'["A → B → C → D", "A → C → B → D", "B → A → D → C", "D → A → B → C"]', 
0, 1);

-- 5
INSERT INTO training_questions (section_id, question_text, options, correct_option_index, marks) VALUES 
(@eng_id, 
'Rearrange the sentences:\nA) Adaptability is crucial in today’s workplace.\nB) Technology changes rapidly.\nC) Employees must continuously learn.\nD) This ensures career growth.', 
'["A → B → C → D", "B → A → D → C", "A → C → B → D", "D → A → B → C"]', 
0, 1);


-- Insert Coding Question
INSERT INTO training_questions (section_id, question_text, options, marks) VALUES 
(@coding_id, 
'## Problem\nCount number of even elements in an array.\n\n## Constraints\n1 ≤ n ≤ 100\n\n## Explanation\nThe loop checks each element using modulo operator and increments count.', 
NULL, 5);

SET @q_code_id = LAST_INSERT_ID();

-- Test Cases for Coding
-- Sample
INSERT INTO training_test_cases (question_id, input, output, is_hidden) VALUES 
(@q_code_id, '5\n1 2 3 4 5', '2', FALSE);

-- Hidden
INSERT INTO training_test_cases (question_id, input, output, is_hidden) VALUES 
(@q_code_id, '6\n10 20 30 40 50 60', '6', TRUE);

INSERT INTO training_test_cases (question_id, input, output, is_hidden) VALUES 
(@q_code_id, '5\n1 3 5 7 9', '0', TRUE);
