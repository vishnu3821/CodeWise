USE codewise;

CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    UNIQUE(language_id, slug)
);

-- Get ID for C language (assuming it exists from previous step)
SET @c_id = (SELECT id FROM languages WHERE slug = 'c' LIMIT 1);

INSERT INTO topics (language_id, name, slug, order_index) VALUES
(@c_id, 'Input and Output', 'input-and-output', 1),
(@c_id, 'Data Types and Variables', 'data-types-and-variables', 2),
(@c_id, 'Operators', 'operators', 3),
(@c_id, 'Conditional Statements', 'conditional-statements', 4),
(@c_id, 'Loops', 'loops', 5),
(@c_id, 'Jump Statements', 'jump-statements', 6),
(@c_id, 'Functions', 'functions', 7),
(@c_id, 'Storage Classes', 'storage-classes', 8),
(@c_id, 'Arrays', 'arrays', 9),
(@c_id, 'Strings', 'strings', 10),
(@c_id, 'Pointers', 'pointers', 11),
(@c_id, 'Dynamic Memory Allocation', 'dynamic-memory-allocation', 12),
(@c_id, 'Structures', 'structures', 13),
(@c_id, 'Unions', 'unions', 14),
(@c_id, 'Enumeration', 'enumeration', 15),
(@c_id, 'Typedef', 'typedef', 16),
(@c_id, 'File Handling', 'file-handling', 17),
(@c_id, 'Preprocessor Directives', 'preprocessor-directives', 18),
(@c_id, 'Command Line Arguments', 'command-line-arguments', 19),
(@c_id, 'Error Handling', 'error-handling', 20),
(@c_id, 'Bit Manipulation', 'bit-manipulation', 21),
(@c_id, 'Advanced C Concepts', 'advanced-c-concepts', 22),
(@c_id, 'Data Structures in C', 'data-structures-in-c', 23);
