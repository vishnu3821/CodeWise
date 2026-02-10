ALTER TABLE exam_questions
ADD COLUMN module ENUM('english', 'maths', 'coding') NOT NULL DEFAULT 'coding';
