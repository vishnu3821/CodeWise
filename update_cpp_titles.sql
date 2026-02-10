USE codewise;

-- Get IDs
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output' LIMIT 1);
SET @sub_input = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Input' LIMIT 1);

-- Update Titles
UPDATE questions SET title = 'Read an Integer' WHERE subtopic_id = @sub_input AND title = 'Question 1';
UPDATE questions SET title = 'Sum of Two Integers' WHERE subtopic_id = @sub_input AND title = 'Question 2';
UPDATE questions SET title = 'Read a Character' WHERE subtopic_id = @sub_input AND title = 'Question 3';
UPDATE questions SET title = 'Print Floating Value' WHERE subtopic_id = @sub_input AND title = 'Question 4';
UPDATE questions SET title = 'Read a String' WHERE subtopic_id = @sub_input AND title = 'Question 5';
