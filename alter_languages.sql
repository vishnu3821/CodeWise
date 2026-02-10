ALTER TABLE languages 
ADD COLUMN difficulty_levels JSON DEFAULT NULL,
ADD COLUMN created_by INT DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Optional: Update existing languages with defaults
UPDATE languages SET difficulty_levels = '["Easy", "Medium", "Hard"]' WHERE difficulty_levels IS NULL;
