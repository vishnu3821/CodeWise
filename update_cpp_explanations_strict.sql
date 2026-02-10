USE codewise;

-- -----------------------------------------------------
-- Input and Output -> Input
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output' LIMIT 1);
SET @sub_input = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Input' LIMIT 1);

UPDATE questions SET explanation = 'Using standard input `cin` as shown in W3Schools C++ User Input. The program reads an integer into `n` and prints it.' WHERE subtopic_id = @sub_input AND title = 'Read an Integer';
UPDATE questions SET explanation = 'Using `cin` for multiple inputs as shown in GeeksforGeeks Basic Input/Output. The `+` operator computes the sum.' WHERE subtopic_id = @sub_input AND title = 'Sum of Two Integers';
UPDATE questions SET explanation = 'Using `cin` to read a character as described in W3Schools C++ Variables. The character stored in `c` is displayed.' WHERE subtopic_id = @sub_input AND title = 'Read a Character';
UPDATE questions SET explanation = 'Using `fixed` and `setprecision` from `<iomanip>` as shown in GeeksforGeeks Floating Point Precision. This formats the output to 2 decimal places.' WHERE subtopic_id = @sub_input AND title = 'Print Floating Value';
UPDATE questions SET explanation = 'Using `cin` to read a string without spaces as shown in W3Schools C++ Strings. The string is then printed.' WHERE subtopic_id = @sub_input AND title = 'Read a String';

-- -----------------------------------------------------
-- Input and Output -> Output
-- -----------------------------------------------------
SET @sub_output = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Output' LIMIT 1);

UPDATE questions SET explanation = 'Using `cout` for output as shown in W3Schools C++ Output. The text "Hello World" is printed to the console.' WHERE subtopic_id = @sub_output AND title = 'Print Hello World';
UPDATE questions SET explanation = 'Using `cout` to display variable values as shown in GeeksforGeeks Output in C++. The integer `n` is printed.' WHERE subtopic_id = @sub_output AND title = 'Print an Integer';
UPDATE questions SET explanation = 'Using `cout` with multiple insertion operators `<<` as shown in W3Schools C++ Output. Two integers are printed separated by a space.' WHERE subtopic_id = @sub_output AND title = 'Print Two Integers';
UPDATE questions SET explanation = 'Using `setprecision` for formatting as shown in GeeksforGeeks C++ Manipulators. The value is displayed with exactly two decimals.' WHERE subtopic_id = @sub_output AND title = 'Print Floating Point Number with Precision';
UPDATE questions SET explanation = 'Using `cout` to chain outputs as shown in W3Schools C++ Syntax. Both string and integer are printed in sequence.' WHERE subtopic_id = @sub_output AND title = 'Print String and Integer';

-- -----------------------------------------------------
-- Variables -> Variables
-- -----------------------------------------------------
SET @topic_vars = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'variables' LIMIT 1);
SET @sub_vars = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Variables' LIMIT 1);

UPDATE questions SET explanation = 'Declaring variables as shown in W3Schools C++ Variables. The integer is assigned a value and printed.' WHERE subtopic_id = @sub_vars AND title = 'Declare and Print a Variable';
UPDATE questions SET explanation = 'Using arithmetic operators on variables as shown in GeeksforGeeks C++ Operators. The sum of `a` and `b` is calculated.' WHERE subtopic_id = @sub_vars AND title = 'Add Two Variables';
UPDATE questions SET explanation = 'Using different data types (int, float) as shown in W3Schools C++ Data Types. Both values are stored and printed.' WHERE subtopic_id = @sub_vars AND title = 'Store and Print Different Data Types';
UPDATE questions SET explanation = 'Swapping logic using a temporary variable as shown in GeeksforGeeks C++ Swap. The values of `a` and `b` are exchanged.' WHERE subtopic_id = @sub_vars AND title = 'Swap Two Variables';
UPDATE questions SET explanation = 'Updating variable values as shown in W3Schools C++ Variables. The variable `n` is incremented by 10.' WHERE subtopic_id = @sub_vars AND title = 'Update Variable Value';

-- -----------------------------------------------------
-- Variables -> Identifiers
-- -----------------------------------------------------
SET @sub_ident = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Identifiers' LIMIT 1);

UPDATE questions SET explanation = 'Using valid naming conventions as shown in W3Schools C++ Identifiers. The identifier follows all rules and is accepted.' WHERE subtopic_id = @sub_ident AND title = 'Valid Identifier Name';
UPDATE questions SET explanation = 'Checking identifier verification rules as shown in GeeksforGeeks Keywords and Identifiers. Identifiers cannot start with a digit.' WHERE subtopic_id = @sub_ident AND title = 'Invalid Identifier Check';
UPDATE questions SET explanation = 'Demonstrating case sensitivity as shown in W3Schools C++ Identifiers. "val" and "Val" are treated as distinct variables.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Case Sensitivity';
UPDATE questions SET explanation = 'Using underscores in names as shown in GeeksforGeeks Identifiers. Underscores are valid characters in variable names.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Using Underscore';
UPDATE questions SET explanation = 'Starting identifiers with letters as shown in W3Schools C++ Syntax. This is a standard requirement for variable names.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Starting With Letter';

-- -----------------------------------------------------
-- Variables -> Constants
-- -----------------------------------------------------
SET @sub_const = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Constants' LIMIT 1);

UPDATE questions SET explanation = 'Using `const` keyword as shown in W3Schools C++ Constants. The variable `n` cannot be modified after declaration.' WHERE subtopic_id = @sub_const AND title = 'Declare Constant Variable';
UPDATE questions SET explanation = 'Arithmetic with constants as shown in GeeksforGeeks Const Keyword. Constants behave like read-only variables in calculations.' WHERE subtopic_id = @sub_const AND title = 'Constant Addition';
UPDATE questions SET explanation = 'Declaring floating point constants as shown in W3Schools C++ Constants. The value `f` remains fixed.' WHERE subtopic_id = @sub_const AND title = 'Constant Float Value';
UPDATE questions SET explanation = 'Attempting to modify `const` results in error as shown in GeeksforGeeks C++ Const. Constants are immutable.' WHERE subtopic_id = @sub_const AND title = 'Modify Constant Value';
UPDATE questions SET explanation = 'Using constants in expressions as shown in W3Schools C++ Constants. The area is calculated using fixed dimensions.' WHERE subtopic_id = @sub_const AND title = 'Constant Expression';

-- -----------------------------------------------------
-- Data Types (All Submodules)
-- -----------------------------------------------------
SET @topic_dt = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'data-types' LIMIT 1);
SET @sub_num = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Numeric Data Types' LIMIT 1);
UPDATE questions SET explanation = 'Using `int` type as shown in W3Schools C++ Data Types. It stores whole numbers without decimals.' WHERE subtopic_id = @sub_num AND title = 'Print Integer Value';
UPDATE questions SET explanation = 'Adding integers as shown in GeeksforGeeks C++ Arithmetic. The result preserves the integer type.' WHERE subtopic_id = @sub_num AND title = 'Add Two Integers';
UPDATE questions SET explanation = 'Using `float` type as shown in W3Schools C++ Data Types. It is used for storing fractional numbers.' WHERE subtopic_id = @sub_num AND title = 'Print Floating Point Number';
UPDATE questions SET explanation = 'Mixing types in output as shown in GeeksforGeeks C++ Data Types. Both integer and floating point values are displayed.' WHERE subtopic_id = @sub_num AND title = 'Integer and Float Output';
UPDATE questions SET explanation = 'Using `sizeof` operator as shown in W3Schools C++ Data Types. It returns the storage size of the type in bytes.' WHERE subtopic_id = @sub_num AND title = 'Type Size Check';

SET @sub_bool = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Boolean Data Type' LIMIT 1);
UPDATE questions SET explanation = 'Using `bool` type as shown in W3Schools C++ Booleans. It stores `true` (1) or `false` (0).' WHERE subtopic_id = @sub_bool AND title = 'Print Boolean Value';
UPDATE questions SET explanation = 'Using comparison operators as shown in GeeksforGeeks Relational Operators. The result of `a > b` is a boolean.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Comparison';
UPDATE questions SET explanation = 'Using equality operator `==` as shown in W3Schools C++ Operators. It evaluates to true if operands are equal.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Equality Check';
UPDATE questions SET explanation = 'Using Logical AND `&&` as shown in GeeksforGeeks Logical Operators. Returns true only if both operands are true.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Logical AND';
UPDATE questions SET explanation = 'Using boolean values in conditions as shown in W3Schools C++ Booleans. Simple true/false check determines output.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Condition Output';

SET @sub_char = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Character Data Type' LIMIT 1);
UPDATE questions SET explanation = 'Using `char` type as shown in W3Schools C++ Data Types. It stores a single character enclosed in quotes.' WHERE subtopic_id = @sub_char AND title = 'Print Character';
UPDATE questions SET explanation = 'Implicit casting to `int` as shown in GeeksforGeeks ASCII Value. Printing a char as an int reveals its ASCII code.' WHERE subtopic_id = @sub_char AND title = 'Character to ASCII';
UPDATE questions SET explanation = 'Character comparison as shown in W3Schools C++ Conditions. Checks if the character falls within uppercase ranges.' WHERE subtopic_id = @sub_char AND title = 'Uppercase or Lowercase';
UPDATE questions SET explanation = 'Character arithmetic as shown in GeeksforGeeks Character Arithmetic. Adding 1 to a char moves to the next ASCII value.' WHERE subtopic_id = @sub_char AND title = 'Next Character';
UPDATE questions SET explanation = 'Checking vowels as shown in W3Schools C++ Switch. The character is compared against vowel literals.' WHERE subtopic_id = @sub_char AND title = 'Vowel or Consonant';

SET @sub_str = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'String Data Type' LIMIT 1);
UPDATE questions SET explanation = 'Using `string` type as shown in W3Schools C++ Strings. It stores a sequence of characters.' WHERE subtopic_id = @sub_str AND title = 'Print String';
UPDATE questions SET explanation = 'Using `length()` method as shown in GeeksforGeeks String Class. It returns the number of characters in the string.' WHERE subtopic_id = @sub_str AND title = 'String Length';
UPDATE questions SET explanation = 'Using `+` for concatenation as shown in W3Schools C++ Strings. Two strings are joined into one.' WHERE subtopic_id = @sub_str AND title = 'String Concatenation';
UPDATE questions SET explanation = 'Accessing characters via index as shown in GeeksforGeeks String Access. Index 0 corresponds to the first character.' WHERE subtopic_id = @sub_str AND title = 'First Character of String';
UPDATE questions SET explanation = 'String comparison as shown in W3Schools C++ Booleans. The `==` operator checks if content is identical.' WHERE subtopic_id = @sub_str AND title = 'Compare Two Strings';

-- -----------------------------------------------------
-- Operators (All Submodules)
-- -----------------------------------------------------
SET @topic_ops = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'operators' LIMIT 1);
SET @sub_ops_arith = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Arithmetic Operators' LIMIT 1);
UPDATE questions SET explanation = 'Using addition operator `+` as shown in W3Schools C++ Operators. Calculates the sum of two operands.' WHERE subtopic_id = @sub_ops_arith AND title = 'Add Two Integers';
UPDATE questions SET explanation = 'Using multiplication operator `*` as shown in GeeksforGeeks Arithmetic Operators. Computes product of operands.' WHERE subtopic_id = @sub_ops_arith AND title = 'Multiply Two Numbers';
UPDATE questions SET explanation = 'Using basic arithmetic operators as shown in W3Schools C++ Operators.' WHERE subtopic_id = @sub_ops_arith AND title = 'Simple Calculator';
UPDATE questions SET explanation = 'Using arithmetic formulas as shown in GeeksforGeeks Basic Math. Area is length*width.' WHERE subtopic_id = @sub_ops_arith AND title = 'Area and Perimeter of Rectangle';
UPDATE questions SET explanation = 'Applying operator precedence as shown in W3Schools C++ Operators. Multiplication/Division occur before Addition/Subtraction.' WHERE subtopic_id = @sub_ops_arith AND title = 'Evaluate Arithmetic Expression';

SET @sub_ops_assign = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Assignment Operators' LIMIT 1);
UPDATE questions SET explanation = 'Using `=` operator as shown in W3Schools C++ Assignment. Stores value in variable.' WHERE subtopic_id = @sub_ops_assign AND title = 'Assign and Print Value';
UPDATE questions SET explanation = 'Using `+=` operator as shown in GeeksforGeeks Compound Assignment. Adds right operand to the variable.' WHERE subtopic_id = @sub_ops_assign AND title = 'Add Using Assignment Operator';
UPDATE questions SET explanation = 'Using `*=` operator as shown in W3Schools C++ Assignment. Multiplies variable by operand and updates it.' WHERE subtopic_id = @sub_ops_assign AND title = 'Multiply Using Assignment Operator';
UPDATE questions SET explanation = 'Chained assignment value as shown in GeeksforGeeks Assignment. Each variable gets the same value.' WHERE subtopic_id = @sub_ops_assign AND title = 'Chain Assignment';
UPDATE questions SET explanation = 'Sequential assignment updates as shown in W3Schools C++ Operators.' WHERE subtopic_id = @sub_ops_assign AND title = 'Compound Assignment Expression';

SET @sub_ops_cmp = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Comparison Operators' LIMIT 1);
UPDATE questions SET explanation = 'Using `>` comparison as shown in W3Schools C++ Comparisons. Returns true if left operand is greater.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Greater Than Check';
UPDATE questions SET explanation = 'Using `==` operator as shown in GeeksforGeeks Relational Operators. Checks equality of values.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Equality Check';
UPDATE questions SET explanation = 'Using comparisons to find max as shown in W3Schools C++ Conditions.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Largest of Two Numbers';
UPDATE questions SET explanation = 'Using range check logic as shown in GeeksforGeeks Operators.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Number Range Check';
UPDATE questions SET explanation = 'Comparison logic for three values as shown in W3Schools C++ Examples.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Largest of Three Numbers';

SET @sub_ops_logic = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Logical Operators' LIMIT 1);
UPDATE questions SET explanation = 'Using `&&` (AND) as shown in W3Schools C++ Logical Operators. True only if both inputs are valid.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical AND Check';
UPDATE questions SET explanation = 'Using `||` (OR) as shown in GeeksforGeeks Logical Operators. True if at least one input is valid.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical OR Check';
UPDATE questions SET explanation = 'Using `!` (NOT) as shown in W3Schools C++ Logical Operators. Inverts true to false and vice-versa.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical NOT';
UPDATE questions SET explanation = 'Combining conditions with `&&` as shown in GeeksforGeeks Divisibility Logic.' WHERE subtopic_id = @sub_ops_logic AND title = 'Divisibility Check';
UPDATE questions SET explanation = 'Complex logic with multiple operators as shown in W3Schools C++ Examples.' WHERE subtopic_id = @sub_ops_logic AND title = 'Complex Logical Condition';

SET @sub_ops_bit = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Bitwise Operators' LIMIT 1);
UPDATE questions SET explanation = 'Using bitwise AND `&` as shown in GeeksforGeeks Bitwise Operators. Bits are set only if both match.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise AND';
UPDATE questions SET explanation = 'Using bitwise OR `|` as shown in W3Schools C++ Bitwise. Bits are set if either match.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise OR';
UPDATE questions SET explanation = 'Using bitwise XOR `^` as shown in GeeksforGeeks Bitwise Operators. Bits set if operands differ.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise XOR';
UPDATE questions SET explanation = 'Using Left Shift `<<` as shown in W3Schools C++ Operators. Moves bits to the left, effectively multiplying by 2.' WHERE subtopic_id = @sub_ops_bit AND title = 'Left Shift Operation';
UPDATE questions SET explanation = 'Power of two logic using bitwise AND as shown in GeeksforGeeks Bit Tricks.' WHERE subtopic_id = @sub_ops_bit AND title = 'Check Power of Two';

-- -----------------------------------------------------
-- Conditions (All Submodules)
-- -----------------------------------------------------
SET @topic_cond = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'conditions' LIMIT 1);
SET @sub_if = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'If' LIMIT 1);
UPDATE questions SET explanation = 'Using `if` statement as shown in W3Schools C++ If...Else. Condition executes if `n > 0`.' WHERE subtopic_id = @sub_if AND title = 'Check Positive Number';
UPDATE questions SET explanation = 'Using simple if condition as shown in GeeksforGeeks Decision Making. Checks if value exceeds 10.' WHERE subtopic_id = @sub_if AND title = 'Check Greater Than 10';
UPDATE questions SET explanation = 'Using modulo operator `%` in if condition as shown in W3Schools C++ Conditions.' WHERE subtopic_id = @sub_if AND title = 'Check Divisible by 2';
UPDATE questions SET explanation = 'Using comparison in if as shown in GeeksforGeeks C++ If. Checks age threshold.' WHERE subtopic_id = @sub_if AND title = 'Check Age Eligibility';
UPDATE questions SET explanation = 'Non-zero check logic as shown in W3Schools C++ Booleans. Any non-zero integer is treated as true.' WHERE subtopic_id = @sub_if AND title = 'Check Non Zero Number';

SET @sub_else = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Else' LIMIT 1);
UPDATE questions SET explanation = 'Using `if...else` as shown in W3Schools C++ If...Else. Handles both positive and negative cases.' WHERE subtopic_id = @sub_else AND title = 'Positive or Negative';
UPDATE questions SET explanation = 'Fail/Pass logic using else as shown in GeeksforGeeks Decision Trees.' WHERE subtopic_id = @sub_else AND title = 'Pass or Fail';
UPDATE questions SET explanation = 'Even/Odd check using `%` and else as shown in W3Schools C++ Conditions.' WHERE subtopic_id = @sub_else AND title = 'Even or Odd';
UPDATE questions SET explanation = 'Comparing two values with else as shown in GeeksforGeeks Max logic.' WHERE subtopic_id = @sub_else AND title = 'Largest of Two Numbers';
UPDATE questions SET explanation = 'Leap year logic with if/else as shown in W3Schools C++ Examples.' WHERE subtopic_id = @sub_else AND title = 'Check Leap Year (Basic)';

SET @sub_elseif = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Else If' LIMIT 1);
UPDATE questions SET explanation = 'Using `else if` ladder as shown in W3Schools C++ If...Else. Checks multiple grade ranges.' WHERE subtopic_id = @sub_elseif AND title = 'Grade System';
UPDATE questions SET explanation = 'Sign check using else if as shown in GeeksforGeeks C++ Conditions.' WHERE subtopic_id = @sub_elseif AND title = 'Number Sign Check';
UPDATE questions SET explanation = 'Temperature classification using multiple conditions as shown in W3Schools C++ Examples.' WHERE subtopic_id = @sub_elseif AND title = 'Temperature Check';
UPDATE questions SET explanation = 'Day checking with else if as shown in GeeksforGeeks Conditions.' WHERE subtopic_id = @sub_elseif AND title = 'Day Type';
UPDATE questions SET explanation = 'Salary categorization logic as shown in W3Schools C++ Logic.' WHERE subtopic_id = @sub_elseif AND title = 'Salary Category';

SET @sub_switch = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Switch' LIMIT 1);
UPDATE questions SET explanation = 'Using `switch` statement as shown in W3Schools C++ Switch. Matches integer to day name.' WHERE subtopic_id = @sub_switch AND title = 'Day Name';
UPDATE questions SET explanation = 'Calculator using switch cases as shown in GeeksforGeeks Switch Statement. Selects operation based on character.' WHERE subtopic_id = @sub_switch AND title = 'Basic Calculator';
UPDATE questions SET explanation = 'Vowel check with fall-through logic as shown in W3Schools C++ Switch.' WHERE subtopic_id = @sub_switch AND title = 'Vowel Check';
UPDATE questions SET explanation = 'Month conversion using switch as shown in GeeksforGeeks C++ Examples.' WHERE subtopic_id = @sub_switch AND title = 'Month Number';
UPDATE questions SET explanation = 'Menu driven logic using switch as shown in W3Schools C++ Switch.' WHERE subtopic_id = @sub_switch AND title = 'Menu Driven Arithmetic';
