-- Topics
ALTER TABLE topics
ADD COLUMN created_by INT DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Subtopics
ALTER TABLE subtopics
ADD COLUMN slug varchar(255) DEFAULT NULL,
ADD COLUMN is_active TINYINT(1) DEFAULT 1,
ADD COLUMN created_by INT DEFAULT NULL,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fill slugs for existing subtopics (simple unique fill)
UPDATE subtopics SET slug = REPLACE(LOWER(name), ' ', '-') WHERE slug IS NULL;
ALTER TABLE subtopics MODIFY slug varchar(255) NOT NULL;
ALTER TABLE subtopics ADD UNIQUE KEY unique_slug (slug);
