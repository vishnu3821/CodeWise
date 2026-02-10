USE codewise;

-- Get ID for C++ language
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);

-- Function to help insert (conceptually) - we will do it inline

-- 1. Input and Output
SET @t_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_io, 'Input', 1),
(@t_io, 'Output', 2);

-- 2. Variables
SET @t_var = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'variables');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_var, 'Variables', 1),
(@t_var, 'Identifiers', 2),
(@t_var, 'Constants', 3);

-- 3. Data Types
SET @t_dt = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'data-types');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_dt, 'Numeric Data Types', 1),
(@t_dt, 'Boolean Data Type', 2),
(@t_dt, 'Character Data Type', 3),
(@t_dt, 'String Data Type', 4);

-- 4. Operators
SET @t_op = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'operators');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_op, 'Arithmetic Operators', 1),
(@t_op, 'Assignment Operators', 2),
(@t_op, 'Comparison Operators', 3),
(@t_op, 'Logical Operators', 4),
(@t_op, 'Bitwise Operators', 5);

-- 5. Conditions
SET @t_cond = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'conditions');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_cond, 'If', 1),
(@t_cond, 'Else', 2),
(@t_cond, 'Else If', 3),
(@t_cond, 'Switch', 4);

-- 6. Loops
SET @t_loop = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'loops');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_loop, 'While Loop', 1),
(@t_loop, 'Do While Loop', 2),
(@t_loop, 'For Loop', 3),
(@t_loop, 'Break', 4),
(@t_loop, 'Continue', 5);

-- 7. Arrays
SET @t_arr = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'arrays');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_arr, 'Single Dimensional Arrays', 1),
(@t_arr, 'Arrays and Loops', 2),
(@t_arr, 'Omit Array Size', 3),
(@t_arr, 'Get Array Size', 4),
(@t_arr, 'Multi Dimensional Arrays', 5);

-- 8. Strings
SET @t_str = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'strings');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_str, 'String Length', 1),
(@t_str, 'Access Strings', 2),
(@t_str, 'Special Characters', 3),
(@t_str, 'String Concatenation', 4),
(@t_str, 'Numbers and Strings', 5);

-- 9. Math
SET @t_math = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'math');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_math, 'Math Functions', 1);

-- 10. Functions
SET @t_func = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'functions');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_func, 'Function Definition', 1),
(@t_func, 'Function Parameters', 2),
(@t_func, 'Default Parameters', 3),
(@t_func, 'Return Values', 4),
(@t_func, 'Function Overloading', 5),
(@t_func, 'Recursion', 6);

-- 11. References
SET @t_ref = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'references');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_ref, 'References', 1),
(@t_ref, 'Memory Address', 2);

-- 12. Pointers
SET @t_ptr = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'pointers');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_ptr, 'Pointer Declaration', 1),
(@t_ptr, 'Dereferencing', 2),
(@t_ptr, 'Pointer Arithmetic', 3);

-- 13. Structures
SET @t_struct = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'structures');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_struct, 'Structures', 1),
(@t_struct, 'Structures and Functions', 2),
(@t_struct, 'Structures and Pointers', 3);

-- 14. Enumerations
SET @t_enum = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'enumerations');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_enum, 'Enum', 1);

-- 15. Object Oriented Programming
SET @t_oop = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'object-oriented-programming');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_oop, 'Classes and Objects', 1),
(@t_oop, 'Class Methods', 2),
(@t_oop, 'Constructors', 3),
(@t_oop, 'Access Specifiers', 4),
(@t_oop, 'Encapsulation', 5),
(@t_oop, 'Inheritance', 6),
(@t_oop, 'Polymorphism', 7);

-- 16. Files
SET @t_files = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'files');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_files, 'Create and Write Files', 1),
(@t_files, 'Read Files', 2);

-- 17. Exceptions
SET @t_ex = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'exceptions');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_ex, 'Try', 1),
(@t_ex, 'Catch', 2);

-- 18. Date and Time
SET @t_time = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'date-and-time');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_time, 'Date', 1),
(@t_time, 'Time', 2);

-- 19. Templates
SET @t_temp = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'templates');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_temp, 'Function Templates', 1),
(@t_temp, 'Class Templates', 2);

-- 20. STL
SET @t_stl = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'stl');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_stl, 'Containers', 1),
(@t_stl, 'Iterators', 2),
(@t_stl, 'Algorithms', 3);

-- 21. Namespaces
SET @t_ns = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'namespaces');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_ns, 'Namespace', 1);

-- 22. Type Casting
SET @t_cast = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'type-casting');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_cast, 'Implicit Type Casting', 1),
(@t_cast, 'Explicit Type Casting', 2);

-- 23. Memory Management
SET @t_mem = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'memory-management');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_mem, 'New', 1),
(@t_mem, 'Delete', 2);

-- 24. Lambda Expressions
SET @t_lam = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'lambda-expressions');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_lam, 'Lambda Syntax', 1);

-- 25. Multithreading
SET @t_thread = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'multithreading');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_thread, 'Threads', 1);

-- 26. Preprocessor Directives
SET @t_prep = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'preprocessor-directives');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_prep, 'Include', 1),
(@t_prep, 'Define', 2);

-- 27. Header Files
SET @t_head = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'header-files');
INSERT INTO subtopics (topic_id, name, order_index) VALUES
(@t_head, 'Standard Header Files', 1),
(@t_head, 'User Defined Header Files', 2);
