-- Ensure SQL and DSA exist as languages (pseudo-languages)
INSERT IGNORE INTO languages (name, slug) VALUES ('SQL', 'sql'), ('Data Structures', 'dsa');

-- Insert Notes
-- Mapping: C=1, C++=2, Java=3, Python=4. Need IDs for SQL and DSA.
-- Using subqueries to get IDs dynamically.

INSERT INTO notes (title, description, language_id, file_url, is_active, created_by)
SELECT 'C Language', 'Complete C Language Notes', id, '/uploads/notes/c.pdf', 1, 1 FROM languages WHERE slug = 'c'
UNION ALL
SELECT 'C++ Language', 'Complete C++ Language Notes', id, '/uploads/notes/cpp.pdf', 1, 1 FROM languages WHERE slug = 'cpp'
UNION ALL
SELECT 'Java Language', 'Complete Java Language Notes', id, '/uploads/notes/java.pdf', 1, 1 FROM languages WHERE slug = 'java'
UNION ALL
SELECT 'Python Language', 'Complete Python Language Notes', id, '/uploads/notes/python.pdf', 1, 1 FROM languages WHERE slug = 'python'
UNION ALL
SELECT 'SQL Database', 'Handwritten SQL Notes', id, '/uploads/notes/SQL Handwritten Notes.pdf', 1, 1 FROM languages WHERE slug = 'sql'
UNION ALL
SELECT 'Data Structures', 'Complete DSA Notes', id, '/uploads/notes/DSA.pdf', 1, 1 FROM languages WHERE slug = 'dsa';
