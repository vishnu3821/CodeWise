USE codewise;

-- Get ID for C++ language
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);

-- Verify that we found the C++ language ID (optional check, but good for safety)
-- If @cpp_id IS NULL, strictly speaking subsequent inserts might fail or look for null, so we assume it exists.

-- Delete existing topics for C++
-- Note: ON DELETE CASCADE in questions table should handle question cleanup, 
-- but if we want to be explicit or if CASCADE isn't set on sub-dependencies properly, we might need to delete usage first.
-- The schema shown in topics_setup.sql had FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE.
-- But we are deleting from topics. 'questions' table references TOPICS.
-- 'questions_setup.sql' shows FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE.
-- So deleting from topics should automatically delete questions associated with those topics.
-- This effectively resets C++ content, which seems to be what is implied by "This list must appear only inside the C++ section."

DELETE FROM topics WHERE language_id = @cpp_id;

-- Insert new C++ Modules
INSERT INTO topics (language_id, name, slug, order_index) VALUES
(@cpp_id, 'Input and Output', 'input-and-output', 1),
(@cpp_id, 'Variables', 'variables', 2),
(@cpp_id, 'Data Types', 'data-types', 3),
(@cpp_id, 'Operators', 'operators', 4),
(@cpp_id, 'Conditions', 'conditions', 5),
(@cpp_id, 'Loops', 'loops', 6),
(@cpp_id, 'Arrays', 'arrays', 7),
(@cpp_id, 'Strings', 'strings', 8),
(@cpp_id, 'Math', 'math', 9),
(@cpp_id, 'Functions', 'functions', 10),
(@cpp_id, 'References', 'references', 11),
(@cpp_id, 'Pointers', 'pointers', 12),
(@cpp_id, 'Structures', 'structures', 13),
(@cpp_id, 'Enumerations', 'enumerations', 14),
(@cpp_id, 'Object Oriented Programming', 'object-oriented-programming', 15),
(@cpp_id, 'Files', 'files', 16),
(@cpp_id, 'Exceptions', 'exceptions', 17),
(@cpp_id, 'Date and Time', 'date-and-time', 18),
(@cpp_id, 'Templates', 'templates', 19),
(@cpp_id, 'STL', 'stl', 20),
(@cpp_id, 'Namespaces', 'namespaces', 21),
(@cpp_id, 'Type Casting', 'type-casting', 22),
(@cpp_id, 'Memory Management', 'memory-management', 23),
(@cpp_id, 'Lambda Expressions', 'lambda-expressions', 24),
(@cpp_id, 'Multithreading', 'multithreading', 25),
(@cpp_id, 'Preprocessor Directives', 'preprocessor-directives', 26),
(@cpp_id, 'Header Files', 'header-files', 27);
