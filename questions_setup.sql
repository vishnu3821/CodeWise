USE codewise;

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
    constraints TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    input TEXT,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Helper to get topic ID
SET @topic_io = (SELECT id FROM topics WHERE slug = 'input-and-output' LIMIT 1);
SET @topic_dt = (SELECT id FROM topics WHERE slug = 'data-types-and-variables' LIMIT 1);

-- Questions for Input and Output
INSERT INTO questions (topic_id, title, description, difficulty, constraints) VALUES
(@topic_io, 'Print Hello World', 'Write a program to print "Hello World" to the output.', 'Easy', 'None'),
(@topic_io, 'Print Integer', 'Write a program that takes an integer as input and prints it.', 'Easy', '-10^9 <= N <= 10^9'),
(@topic_io, 'Sum of Two Numbers', 'Write a program to take two integers as input and print their sum.', 'Easy', '-10^9 <= A, B <= 10^9');

-- Test Cases for Input and Output
SET @q_hello = (SELECT id FROM questions WHERE title = 'Print Hello World' LIMIT 1);
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q_hello, '', 'Hello World', TRUE),
(@q_hello, '', 'Hello World', FALSE);

SET @q_int = (SELECT id FROM questions WHERE title = 'Print Integer' LIMIT 1);
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q_int, '10', '10', TRUE),
(@q_int, '-5', '-5', FALSE);

SET @q_sum = (SELECT id FROM questions WHERE title = 'Sum of Two Numbers' LIMIT 1);
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q_sum, '5 10', '15', TRUE),
(@q_sum, '-5 5', '0', FALSE);

-- Questions for Data Types
INSERT INTO questions (topic_id, title, description, difficulty, constraints) VALUES
(@topic_dt, 'Size of Data Types', 'Write a program to print the size of int, float, double and char.', 'Medium', 'None'),
(@topic_dt, 'Swap Two Numbers', 'Write a program to swap two numbers without using a temporary variable.', 'Medium', '-10^9 <= A, B <= 10^9');

-- Test Cases for Data Types
SET @q_size = (SELECT id FROM questions WHERE title = 'Size of Data Types' LIMIT 1);
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q_size, '', '4 4 8 1', TRUE); -- Approximate sizes

SET @q_swap = (SELECT id FROM questions WHERE title = 'Swap Two Numbers' LIMIT 1);
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q_swap, '10 20', '20 10', TRUE),
(@q_swap, '5 5', '5 5', FALSE);
