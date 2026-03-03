CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS placement_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  type ENUM('technical', 'hr') NOT NULL,
  question_title VARCHAR(255) NOT NULL,
  detailed_answer TEXT,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_question_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  bullet_text TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES placement_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS placement_question_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (question_id) REFERENCES placement_questions(id) ON DELETE CASCADE
);
