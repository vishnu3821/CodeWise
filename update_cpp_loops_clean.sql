USE codewise;

-- -----------------------------------------------------
-- Loops -> Do While Loop
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_loops = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'loops' LIMIT 1);
SET @sub_dowhile = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'Do While Loop' LIMIT 1);

UPDATE questions SET explanation = 'Do while loop executes once before checking the condition, ensuring the code block runs at least one time.' WHERE subtopic_id = @sub_dowhile AND title = 'Print Number Once';
UPDATE questions SET explanation = 'Do while is commonly used for menu-driven programs where the menu must be displayed initially.' WHERE subtopic_id = @sub_dowhile AND title = 'Menu Repetition';

-- -----------------------------------------------------
-- Loops -> For Loop
-- -----------------------------------------------------
SET @sub_for = (SELECT id FROM subtopics WHERE topic_id = @topic_loops AND name = 'For Loop' LIMIT 1);

UPDATE questions SET explanation = 'For loop initializes the variable, checks the condition, and increments the counter in a single line.' WHERE subtopic_id = @sub_for AND title = 'Print First n Numbers';
UPDATE questions SET explanation = 'The loop checks divisibility from 2 to n-1 to determine if the number has any factors.' WHERE subtopic_id = @sub_for AND title = 'Prime Number Check';
