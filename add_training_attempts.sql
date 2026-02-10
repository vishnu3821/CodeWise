CREATE TABLE IF NOT EXISTS training_exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2) DEFAULT 0,
    total_marks INT DEFAULT 0,
    attempt_data JSON, -- Stores details like { "q1": { "correct": true, "userAnswer": "..." } }
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES training_exams(id) ON DELETE CASCADE
);
