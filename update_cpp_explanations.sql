USE codewise;

-- -----------------------------------------------------
-- Input and Output -> Input
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output' LIMIT 1);
SET @sub_input = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Input' LIMIT 1);

UPDATE questions SET explanation = 'cin >> n reads input into n; cout << n prints it.' WHERE subtopic_id = @sub_input AND title = 'Read an Integer';
UPDATE questions SET explanation = 'Read two integers using cin >> a >> b and print sum using a + b.' WHERE subtopic_id = @sub_input AND title = 'Sum of Two Integers';
UPDATE questions SET explanation = 'Read char c using cin >> c; prints the character.' WHERE subtopic_id = @sub_input AND title = 'Read a Character';
UPDATE questions SET explanation = 'Use fixed << setprecision(2) to print 2 decimal places.' WHERE subtopic_id = @sub_input AND title = 'Print Floating Value';
UPDATE questions SET explanation = 'Read string using cin >> s; prints the string.' WHERE subtopic_id = @sub_input AND title = 'Read a String';

-- -----------------------------------------------------
-- Input and Output -> Output
-- -----------------------------------------------------
SET @sub_output = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Output' LIMIT 1);

UPDATE questions SET explanation = 'cout << "Hello World" prints the message.' WHERE subtopic_id = @sub_output AND title = 'Print Hello World';
UPDATE questions SET explanation = 'cout << n prints the integer value.' WHERE subtopic_id = @sub_output AND title = 'Print an Integer';
UPDATE questions SET explanation = 'cout << a << " " << b prints two values separated by space.' WHERE subtopic_id = @sub_output AND title = 'Print Two Integers';
UPDATE questions SET explanation = 'Use fixed and setprecision(2) from <iomanip>.' WHERE subtopic_id = @sub_output AND title = 'Print Floating Point Number with Precision';
UPDATE questions SET explanation = 'cout << s << " " << n prints string and integer.' WHERE subtopic_id = @sub_output AND title = 'Print String and Integer';

-- -----------------------------------------------------
-- Variables -> Variables
-- -----------------------------------------------------
SET @topic_vars = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'variables' LIMIT 1);
SET @sub_vars = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Variables' LIMIT 1);

UPDATE questions SET explanation = 'int n declare integer; cin reads it; cout prints.' WHERE subtopic_id = @sub_vars AND title = 'Declare and Print a Variable';
UPDATE questions SET explanation = 'Declare int a, b; read them; print a + b.' WHERE subtopic_id = @sub_vars AND title = 'Add Two Variables';
UPDATE questions SET explanation = 'int n; float f; cin >> n >> f; cout << n << " " << f;' WHERE subtopic_id = @sub_vars AND title = 'Store and Print Different Data Types';
UPDATE questions SET explanation = 'Use temp variable: t=a; a=b; b=t; to swap.' WHERE subtopic_id = @sub_vars AND title = 'Swap Two Variables';
UPDATE questions SET explanation = 'n = n + 10 updates value; print new n.' WHERE subtopic_id = @sub_vars AND title = 'Update Variable Value';

-- -----------------------------------------------------
-- Variables -> Identifiers
-- -----------------------------------------------------
SET @sub_ident = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Identifiers' LIMIT 1);

UPDATE questions SET explanation = 'Valid identifier printed successfully.' WHERE subtopic_id = @sub_ident AND title = 'Valid Identifier Name';
UPDATE questions SET explanation = 'Check rules: starts with letter/underscore, no special chars.' WHERE subtopic_id = @sub_ident AND title = 'Invalid Identifier Check';
UPDATE questions SET explanation = 'C++ is case sensitive; Val and val are different.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Case Sensitivity';
UPDATE questions SET explanation = 'Underscores are allowed in identifiers.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Using Underscore';
UPDATE questions SET explanation = 'Identifiers must start with a letter or underscore.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Starting With Letter';

-- -----------------------------------------------------
-- Variables -> Constants
-- -----------------------------------------------------
SET @sub_const = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Constants' LIMIT 1);

UPDATE questions SET explanation = 'const int n declares a constant.' WHERE subtopic_id = @sub_const AND title = 'Declare Constant Variable';
UPDATE questions SET explanation = 'Sum constants normally; result is printed.' WHERE subtopic_id = @sub_const AND title = 'Constant Addition';
UPDATE questions SET explanation = 'const float f; print using setprecision.' WHERE subtopic_id = @sub_const AND title = 'Constant Float Value';
UPDATE questions SET explanation = 'Modifying const causes compilation error.' WHERE subtopic_id = @sub_const AND title = 'Modify Constant Value';
UPDATE questions SET explanation = 'Area = length * width using constant values.' WHERE subtopic_id = @sub_const AND title = 'Constant Expression';

-- -----------------------------------------------------
-- Data Types (All Submodules)
-- -----------------------------------------------------
SET @topic_dt = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'data-types' LIMIT 1);
SET @sub_num = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Numeric Data Types' LIMIT 1);
UPDATE questions SET explanation = 'int stores integers; cin/cout handles I/O.' WHERE subtopic_id = @sub_num AND title = 'Print Integer Value';
UPDATE questions SET explanation = 'Sum of two integers displayed.' WHERE subtopic_id = @sub_num AND title = 'Add Two Integers';
UPDATE questions SET explanation = 'float stores decimal numbers.' WHERE subtopic_id = @sub_num AND title = 'Print Floating Point Number';
UPDATE questions SET explanation = 'Print int then float separated by space.' WHERE subtopic_id = @sub_num AND title = 'Integer and Float Output';
UPDATE questions SET explanation = 'sizeof(type) returns size in bytes.' WHERE subtopic_id = @sub_num AND title = 'Type Size Check';

SET @sub_bool = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Boolean Data Type' LIMIT 1);
UPDATE questions SET explanation = 'bool stores true(1)/false(0).' WHERE subtopic_id = @sub_bool AND title = 'Print Boolean Value';
UPDATE questions SET explanation = 'Result of a > b stored in boolean.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Comparison';
UPDATE questions SET explanation = 'Equality check (==) returns boolean.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Equality Check';
UPDATE questions SET explanation = 'Logical AND (&&) returns true if both true.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Logical AND';
UPDATE questions SET explanation = 'If true print Yes, else No.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Condition Output';

SET @sub_char = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Character Data Type' LIMIT 1);
UPDATE questions SET explanation = 'char stores single character.' WHERE subtopic_id = @sub_char AND title = 'Print Character';
UPDATE questions SET explanation = 'Casting char to int prints ASCII value.' WHERE subtopic_id = @sub_char AND title = 'Character to ASCII';
UPDATE questions SET explanation = 'isupper() or range check used.' WHERE subtopic_id = @sub_char AND title = 'Uppercase or Lowercase';
UPDATE questions SET explanation = 'c + 1 gives next ASCII character.' WHERE subtopic_id = @sub_char AND title = 'Next Character';
UPDATE questions SET explanation = 'Check against a,e,i,o,u.' WHERE subtopic_id = @sub_char AND title = 'Vowel or Consonant';

SET @sub_str = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'String Data Type' LIMIT 1);
UPDATE questions SET explanation = 'string class stores text.' WHERE subtopic_id = @sub_str AND title = 'Print String';
UPDATE questions SET explanation = 's.length() or s.size() returns length.' WHERE subtopic_id = @sub_str AND title = 'String Length';
UPDATE questions SET explanation = 'Operator + concatenates strings.' WHERE subtopic_id = @sub_str AND title = 'String Concatenation';
UPDATE questions SET explanation = 'Access s[0] for first character.' WHERE subtopic_id = @sub_str AND title = 'First Character of String';
UPDATE questions SET explanation = 's1 == s2 checks equality.' WHERE subtopic_id = @sub_str AND title = 'Compare Two Strings';

-- -----------------------------------------------------
-- Operators (All Submodules)
-- -----------------------------------------------------
SET @topic_ops = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'operators' LIMIT 1);
SET @sub_ops_arith = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Arithmetic Operators' LIMIT 1);
UPDATE questions SET explanation = 'Operator + adds two numbers.' WHERE subtopic_id = @sub_ops_arith AND title = 'Add Two Integers';
UPDATE questions SET explanation = 'Operator * multiplies numbers.' WHERE subtopic_id = @sub_ops_arith AND title = 'Multiply Two Numbers';
UPDATE questions SET explanation = 'Compute +, -, *, / separately.' WHERE subtopic_id = @sub_ops_arith AND title = 'Simple Calculator';
UPDATE questions SET explanation = 'Area = l*w; Perimeter = 2*(l+w).' WHERE subtopic_id = @sub_ops_arith AND title = 'Area and Perimeter of Rectangle';
UPDATE questions SET explanation = 'Follows operator precedence (* / before + -).' WHERE subtopic_id = @sub_ops_arith AND title = 'Evaluate Arithmetic Expression';

SET @sub_ops_assign = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Assignment Operators' LIMIT 1);
UPDATE questions SET explanation = '= assigns value to variable.' WHERE subtopic_id = @sub_ops_assign AND title = 'Assign and Print Value';
UPDATE questions SET explanation = '+= adds right operand to left.' WHERE subtopic_id = @sub_ops_assign AND title = 'Add Using Assignment Operator';
UPDATE questions SET explanation = '*= multiplies and updates variable.' WHERE subtopic_id = @sub_ops_assign AND title = 'Multiply Using Assignment Operator';
UPDATE questions SET explanation = 'x = y = z = 7 assigns 7 to all.' WHERE subtopic_id = @sub_ops_assign AND title = 'Chain Assignment';
UPDATE questions SET explanation = 'Sequential updates using assignment operators.' WHERE subtopic_id = @sub_ops_assign AND title = 'Compound Assignment Expression';

SET @sub_ops_cmp = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Comparison Operators' LIMIT 1);
UPDATE questions SET explanation = '> operator checks greater than.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Greater Than Check';
UPDATE questions SET explanation = '== checks equality.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Equality Check';
UPDATE questions SET explanation = 'Use if(a>b) or max function.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Largest of Two Numbers';
UPDATE questions SET explanation = 'Check range: n >= 10 && n <= 50.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Number Range Check';
UPDATE questions SET explanation = 'Compare a, b, c to find max.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Largest of Three Numbers';

SET @sub_ops_logic = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Logical Operators' LIMIT 1);
UPDATE questions SET explanation = '&& returns true only if both true.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical AND Check';
UPDATE questions SET explanation = '|| returns true if at least one true.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical OR Check';
UPDATE questions SET explanation = '! inverts boolean value.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical NOT';
UPDATE questions SET explanation = 'Use (n%3==0) && (n%5==0).' WHERE subtopic_id = @sub_ops_logic AND title = 'Divisibility Check';
UPDATE questions SET explanation = 'Range check AND modulo check combined.' WHERE subtopic_id = @sub_ops_logic AND title = 'Complex Logical Condition';

SET @sub_ops_bit = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Bitwise Operators' LIMIT 1);
UPDATE questions SET explanation = '& performs bitwise AND.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise AND';
UPDATE questions SET explanation = '| performs bitwise OR.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise OR';
UPDATE questions SET explanation = '^ performs bitwise XOR.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise XOR';
UPDATE questions SET explanation = '<< shifts bits to the left.' WHERE subtopic_id = @sub_ops_bit AND title = 'Left Shift Operation';
UPDATE questions SET explanation = '(n & (n-1)) == 0 detects power of two.' WHERE subtopic_id = @sub_ops_bit AND title = 'Check Power of Two';
