-- Add status and review columns to questions
ALTER TABLE questions
ADD COLUMN status ENUM('draft', 'pending_review', 'approved', 'rejected', 'published', 'disabled') DEFAULT 'draft',
ADD COLUMN submitted_at TIMESTAMP NULL,
ADD COLUMN reviewed_by INT NULL,
ADD COLUMN reviewed_at TIMESTAMP NULL,
ADD COLUMN review_comment TEXT NULL,
ADD CONSTRAINT fk_questions_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add status and review columns to notes
ALTER TABLE notes
ADD COLUMN status ENUM('draft', 'pending_review', 'approved', 'rejected', 'published', 'disabled') DEFAULT 'draft',
ADD COLUMN submitted_at TIMESTAMP NULL,
ADD COLUMN reviewed_by INT NULL,
ADD COLUMN reviewed_at TIMESTAMP NULL,
ADD COLUMN review_comment TEXT NULL,
ADD CONSTRAINT fk_notes_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Update exams table (modify existing status enum and add review columns)
ALTER TABLE exams
MODIFY COLUMN status ENUM('draft', 'pending_review', 'approved', 'rejected', 'published', 'archived', 'disabled') DEFAULT 'draft',
ADD COLUMN submitted_at TIMESTAMP NULL,
ADD COLUMN reviewed_by INT NULL,
ADD COLUMN reviewed_at TIMESTAMP NULL,
ADD COLUMN review_comment TEXT NULL,
ADD CONSTRAINT fk_exams_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Ensure there is at least one admin for testing
INSERT IGNORE INTO users (name, email, password_hash, role, email_verified)
VALUES ('Admin User', 'admin@codewise.com', '$2a$10$YourHashedPasswordHere', 'admin', 1);
