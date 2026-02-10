USE codewise;

-- -----------------------------------------------------
-- Input and Output -> Input
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_io = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'input-and-output' LIMIT 1);
SET @sub_input = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Input' LIMIT 1);

UPDATE questions SET explanation = 'The program uses `cin` to read an integer from standard input and stores it in variable `n`, then prints it.' WHERE subtopic_id = @sub_input AND title = 'Read an Integer';
UPDATE questions SET explanation = 'Two integers are read using `cin` and their sum is calculated using the `+` operator.' WHERE subtopic_id = @sub_input AND title = 'Sum of Two Integers';
UPDATE questions SET explanation = 'The `cin` object is used to read a single character input into the variable `c`.' WHERE subtopic_id = @sub_input AND title = 'Read a Character';
UPDATE questions SET explanation = 'The `fixed` and `setprecision` manipulators format the floating point output to exactly two decimal places.' WHERE subtopic_id = @sub_input AND title = 'Print Floating Value';
UPDATE questions SET explanation = 'The `cin` object reads a sequence of characters (string) until whitespace is encountered.' WHERE subtopic_id = @sub_input AND title = 'Read a String';

-- -----------------------------------------------------
-- Input and Output -> Output
-- -----------------------------------------------------
SET @sub_output = (SELECT id FROM subtopics WHERE topic_id = @topic_io AND name = 'Output' LIMIT 1);

UPDATE questions SET explanation = 'The `cout` object is used to print the string literal "Hello World" to the standard output.' WHERE subtopic_id = @sub_output AND title = 'Print Hello World';
UPDATE questions SET explanation = 'The `cout` object displays the value stored in the integer variable `n`.' WHERE subtopic_id = @sub_output AND title = 'Print an Integer';
UPDATE questions SET explanation = 'Multiple values are printed by chaining the `<<` operator, inserting a space between the two integers.' WHERE subtopic_id = @sub_output AND title = 'Print Two Integers';
UPDATE questions SET explanation = 'Using `setprecision(2)` with `fixed` ensures the number is displayed with two decimal digits.' WHERE subtopic_id = @sub_output AND title = 'Print Floating Point Number with Precision';
UPDATE questions SET explanation = 'The string and integer are printed sequentially using `cout` with proper spacing.' WHERE subtopic_id = @sub_output AND title = 'Print String and Integer';

-- -----------------------------------------------------
-- Variables -> Variables
-- -----------------------------------------------------
SET @topic_vars = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'variables' LIMIT 1);
SET @sub_vars = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Variables' LIMIT 1);

UPDATE questions SET explanation = 'The variable `n` is declared as an integer, assigned a value, and then displayed.' WHERE subtopic_id = @sub_vars AND title = 'Declare and Print a Variable';
UPDATE questions SET explanation = 'Two integer variables hold the input values, and their sum is computed and printed.' WHERE subtopic_id = @sub_vars AND title = 'Add Two Variables';
UPDATE questions SET explanation = 'Variables of type `int` and `float` are used to store and print integer and decimal values respectively.' WHERE subtopic_id = @sub_vars AND title = 'Store and Print Different Data Types';
UPDATE questions SET explanation = 'A temporary variable is used to hold one value while the values of `a` and `b` are swapped.' WHERE subtopic_id = @sub_vars AND title = 'Swap Two Variables';
UPDATE questions SET explanation = 'The value of the variable is updated by adding 10 to its current value.' WHERE subtopic_id = @sub_vars AND title = 'Update Variable Value';

-- -----------------------------------------------------
-- Variables -> Identifiers
-- -----------------------------------------------------
SET @sub_ident = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Identifiers' LIMIT 1);

UPDATE questions SET explanation = 'The identifier follows standard naming rules (starting with a letter, no illegal characters) and is valid.' WHERE subtopic_id = @sub_ident AND title = 'Valid Identifier Name';
UPDATE questions SET explanation = 'Identifiers cannot start with a digit, which is why names like `2sum` are invalid.' WHERE subtopic_id = @sub_ident AND title = 'Invalid Identifier Check';
UPDATE questions SET explanation = 'C++ identifiers are case-sensitive, so `Val` and `val` are treated as two different variables.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Case Sensitivity';
UPDATE questions SET explanation = 'Underscores are valid characters in identifiers and can be used within the name.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Using Underscore';
UPDATE questions SET explanation = 'A valid identifier must begin with a letter (a-z, A-Z) or an underscore.' WHERE subtopic_id = @sub_ident AND title = 'Identifier Starting With Letter';

-- -----------------------------------------------------
-- Variables -> Constants
-- -----------------------------------------------------
SET @sub_const = (SELECT id FROM subtopics WHERE topic_id = @topic_vars AND name = 'Constants' LIMIT 1);

UPDATE questions SET explanation = 'The `const` keyword declares a read-only variable whose value cannot be changed after initialization.' WHERE subtopic_id = @sub_const AND title = 'Declare Constant Variable';
UPDATE questions SET explanation = 'Constants can be used in arithmetic operations just like regular variables, but their own value remains fixed.' WHERE subtopic_id = @sub_const AND title = 'Constant Addition';
UPDATE questions SET explanation = 'A `float` declared with `const` maintains its precise decimal value throughout the program.' WHERE subtopic_id = @sub_const AND title = 'Constant Float Value';
UPDATE questions SET explanation = 'Any attempt to assign a new value to a `const` variable results in a compilation error.' WHERE subtopic_id = @sub_const AND title = 'Modify Constant Value';
UPDATE questions SET explanation = 'Constants provide fixed values (like length and width) for reliable calculations in expressions.' WHERE subtopic_id = @sub_const AND title = 'Constant Expression';

-- -----------------------------------------------------
-- Data Types (All Submodules)
-- -----------------------------------------------------
SET @topic_dt = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'data-types' LIMIT 1);
SET @sub_num = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Numeric Data Types' LIMIT 1);
UPDATE questions SET explanation = 'The `int` data type is used to store whole numbers without any fractional part.' WHERE subtopic_id = @sub_num AND title = 'Print Integer Value';
UPDATE questions SET explanation = 'When adding two `int` values, the result is also an integer.' WHERE subtopic_id = @sub_num AND title = 'Add Two Integers';
UPDATE questions SET explanation = 'The `float` data type allows storage of numbers with decimal points.' WHERE subtopic_id = @sub_num AND title = 'Print Floating Point Number';
UPDATE questions SET explanation = 'Different data types like `int` and `float` can be printed in the same output stream.' WHERE subtopic_id = @sub_num AND title = 'Integer and Float Output';
UPDATE questions SET explanation = 'The `sizeof` operator returns the memory size (in bytes) occupied by a data type.' WHERE subtopic_id = @sub_num AND title = 'Type Size Check';

SET @sub_bool = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Boolean Data Type' LIMIT 1);
UPDATE questions SET explanation = 'The `bool` data type stores logical values: `1` representing true and `0` representing false.' WHERE subtopic_id = @sub_bool AND title = 'Print Boolean Value';
UPDATE questions SET explanation = 'A comparison operation like `>` evaluates to a boolean result (1 or 0).' WHERE subtopic_id = @sub_bool AND title = 'Boolean Comparison';
UPDATE questions SET explanation = 'The equality operator `==` returns true (1) if operands are equal, and false (0) otherwise.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Equality Check';
UPDATE questions SET explanation = 'The Logical AND `&&` operator returns true only if both operands are non-zero (true).' WHERE subtopic_id = @sub_bool AND title = 'Boolean Logical AND';
UPDATE questions SET explanation = 'A boolean value determines which branch of a conditional statement executes.' WHERE subtopic_id = @sub_bool AND title = 'Boolean Condition Output';

SET @sub_char = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'Character Data Type' LIMIT 1);
UPDATE questions SET explanation = 'The `char` data type stores a single ASCII character.' WHERE subtopic_id = @sub_char AND title = 'Print Character';
UPDATE questions SET explanation = 'Characters are stored as integer ASCII codes internally; casting to `int` displays this code.' WHERE subtopic_id = @sub_char AND title = 'Character to ASCII';
UPDATE questions SET explanation = 'Character functions or range checks can determine if a letter is uppercase or lowercase.' WHERE subtopic_id = @sub_char AND title = 'Uppercase or Lowercase';
UPDATE questions SET explanation = 'Incrementing a `char` variable moves to the next character in the ASCII sequence.' WHERE subtopic_id = @sub_char AND title = 'Next Character';
UPDATE questions SET explanation = 'The character is compared against standard vowels to classify it.' WHERE subtopic_id = @sub_char AND title = 'Vowel or Consonant';

SET @sub_str = (SELECT id FROM subtopics WHERE topic_id = @topic_dt AND name = 'String Data Type' LIMIT 1);
UPDATE questions SET explanation = 'The `string` class is used to store and manipulate sequences of text characters.' WHERE subtopic_id = @sub_str AND title = 'Print String';
UPDATE questions SET explanation = 'The `.length()` method returns the count of characters in the string.' WHERE subtopic_id = @sub_str AND title = 'String Length';
UPDATE questions SET explanation = 'The `+` operator appends one string to the end of another (concatenation).' WHERE subtopic_id = @sub_str AND title = 'String Concatenation';
UPDATE questions SET explanation = 'String characters can be accessed by index, where index 0 is the start.' WHERE subtopic_id = @sub_str AND title = 'First Character of String';
UPDATE questions SET explanation = 'The `==` operator compares the content of two strings for equality.' WHERE subtopic_id = @sub_str AND title = 'Compare Two Strings';

-- -----------------------------------------------------
-- Operators (All Submodules)
-- -----------------------------------------------------
SET @topic_ops = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'operators' LIMIT 1);
SET @sub_ops_arith = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Arithmetic Operators' LIMIT 1);
UPDATE questions SET explanation = 'The `+` operator calculates the sum of the two operands.' WHERE subtopic_id = @sub_ops_arith AND title = 'Add Two Integers';
UPDATE questions SET explanation = 'The `*` operator computes the product of the two operands.' WHERE subtopic_id = @sub_ops_arith AND title = 'Multiply Two Numbers';
UPDATE questions SET explanation = 'Standard arithmetic operators (+, -, *, /) perform the respective calculations.' WHERE subtopic_id = @sub_ops_arith AND title = 'Simple Calculator';
UPDATE questions SET explanation = 'The area is result of multiplication, and perimeter is the sum of sides multiplied by 2.' WHERE subtopic_id = @sub_ops_arith AND title = 'Area and Perimeter of Rectangle';
UPDATE questions SET explanation = 'Operator precedence dictates that multiplication and division happen before addition and subtraction.' WHERE subtopic_id = @sub_ops_arith AND title = 'Evaluate Arithmetic Expression';

SET @sub_ops_assign = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Assignment Operators' LIMIT 1);
UPDATE questions SET explanation = 'The assignment operator `=` stores the value on the right into the variable on the left.' WHERE subtopic_id = @sub_ops_assign AND title = 'Assign and Print Value';
UPDATE questions SET explanation = 'The `+=` operator adds the right-hand value to the variable and updates it.' WHERE subtopic_id = @sub_ops_assign AND title = 'Add Using Assignment Operator';
UPDATE questions SET explanation = 'The `*=` operator multiplies the variable by the right-hand value and updates it.' WHERE subtopic_id = @sub_ops_assign AND title = 'Multiply Using Assignment Operator';
UPDATE questions SET explanation = 'Chained assignments set multiple variables to the same value in a single statement.' WHERE subtopic_id = @sub_ops_assign AND title = 'Chain Assignment';
UPDATE questions SET explanation = 'Compound assignment operators perform an operation and an assignment in one step.' WHERE subtopic_id = @sub_ops_assign AND title = 'Compound Assignment Expression';

SET @sub_ops_cmp = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Comparison Operators' LIMIT 1);
UPDATE questions SET explanation = 'The `>` operator returns true if the first text value is numerically larger than the second.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Greater Than Check';
UPDATE questions SET explanation = 'The `==` operator checks if two values are identical.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Equality Check';
UPDATE questions SET explanation = 'Comparison logic determines which of the two values exceeds the other.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Largest of Two Numbers';
UPDATE questions SET explanation = 'Range checking uses comparison operators to ensure a value falls within bounded limits.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Number Range Check';
UPDATE questions SET explanation = 'Comparing multiple values sequentially identifies the maximum.' WHERE subtopic_id = @sub_ops_cmp AND title = 'Largest of Three Numbers';

SET @sub_ops_logic = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Logical Operators' LIMIT 1);
UPDATE questions SET explanation = 'The Logical AND `&&` requires both conditions to be true for the result to be true.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical AND Check';
UPDATE questions SET explanation = 'The Logical OR `||` requires only one of the conditions to be true.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical OR Check';
UPDATE questions SET explanation = 'The Logical NOT `!` reverses the truth value of the operand.' WHERE subtopic_id = @sub_ops_logic AND title = 'Logical NOT';
UPDATE questions SET explanation = 'Combining conditions with `&&` ensures the number satisfies multiple divisibility rules.' WHERE subtopic_id = @sub_ops_logic AND title = 'Divisibility Check';
UPDATE questions SET explanation = 'Complex logic combines multiple boolean checks into a single decision.' WHERE subtopic_id = @sub_ops_logic AND title = 'Complex Logical Condition';

SET @sub_ops_bit = (SELECT id FROM subtopics WHERE topic_id = @topic_ops AND name = 'Bitwise Operators' LIMIT 1);
UPDATE questions SET explanation = 'Bitwise AND `&` compares bits and sets the result to 1 only if both corresponding bits are 1.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise AND';
UPDATE questions SET explanation = 'Bitwise OR `|` sets the result bit to 1 if at least one of the corresponding bits is 1.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise OR';
UPDATE questions SET explanation = 'Bitwise XOR `^` sets the result bit to 1 only if the corresponding bits are different.' WHERE subtopic_id = @sub_ops_bit AND title = 'Bitwise XOR';
UPDATE questions SET explanation = 'Left Shift `<<` moves bits to the left, filling with zeros, equivalent to multiplying by powers of 2.' WHERE subtopic_id = @sub_ops_bit AND title = 'Left Shift Operation';
UPDATE questions SET explanation = 'Bitwise logic can efficiently detect if a number has only one bit set (is a power of two).' WHERE subtopic_id = @sub_ops_bit AND title = 'Check Power of Two';

-- -----------------------------------------------------
-- Conditions (All Submodules)
-- -----------------------------------------------------
SET @topic_cond = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'conditions' LIMIT 1);
SET @sub_if = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'If' LIMIT 1);
UPDATE questions SET explanation = 'The `if` statement executes the code block only when the condition evaluates to true.' WHERE subtopic_id = @sub_if AND title = 'Check Positive Number';
UPDATE questions SET explanation = 'A conditional check determines if the number exceeds the specified threshold.' WHERE subtopic_id = @sub_if AND title = 'Check Greater Than 10';
UPDATE questions SET explanation = 'The modulo operator `%` checks for a remainder of 0 to determine divisibility.' WHERE subtopic_id = @sub_if AND title = 'Check Divisible by 2';
UPDATE questions SET explanation = 'The condition compares the age against the legal limit.' WHERE subtopic_id = @sub_if AND title = 'Check Age Eligibility';
UPDATE questions SET explanation = 'In C++, any non-zero value is treated as true in a conditional context.' WHERE subtopic_id = @sub_if AND title = 'Check Non Zero Number';

SET @sub_else = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Else' LIMIT 1);
UPDATE questions SET explanation = 'The `else` block executes when the `if` condition is false, handling the alternative case.' WHERE subtopic_id = @sub_else AND title = 'Positive or Negative';
UPDATE questions SET explanation = 'A threshold comparison determines the Pass or Fail outcome.' WHERE subtopic_id = @sub_else AND title = 'Pass or Fail';
UPDATE questions SET explanation = 'If a number is not even (remainder 0), the `else` block identifies it as odd.' WHERE subtopic_id = @sub_else AND title = 'Even or Odd';
UPDATE questions SET explanation = 'The condition identifies the larger number, falling back to the other via `else`.' WHERE subtopic_id = @sub_else AND title = 'Largest of Two Numbers';
UPDATE questions SET explanation = 'Leap year logic requires checking divisibility rules within if/else blocks.' WHERE subtopic_id = @sub_else AND title = 'Check Leap Year (Basic)';

SET @sub_elseif = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Else If' LIMIT 1);
UPDATE questions SET explanation = 'The `else if` structure allows checking multiple mutually exclusive conditions in sequence.' WHERE subtopic_id = @sub_elseif AND title = 'Grade System';
UPDATE questions SET explanation = 'Multiple conditions classify the number as positive, negative, or zero.' WHERE subtopic_id = @sub_elseif AND title = 'Number Sign Check';
UPDATE questions SET explanation = 'Sequential checks categorize the temperature into defined ranges.' WHERE subtopic_id = @sub_elseif AND title = 'Temperature Check';
UPDATE questions SET explanation = 'The logic distinguishes between weekday and weekend based on the day number.' WHERE subtopic_id = @sub_elseif AND title = 'Day Type';
UPDATE questions SET explanation = 'Salary ranges are checked in order to determine the correct category.' WHERE subtopic_id = @sub_elseif AND title = 'Salary Category';

SET @sub_switch = (SELECT id FROM subtopics WHERE topic_id = @topic_cond AND name = 'Switch' LIMIT 1);
UPDATE questions SET explanation = 'The `switch` statement selects a code block to execute based on the value of the variable.' WHERE subtopic_id = @sub_switch AND title = 'Day Name';
UPDATE questions SET explanation = 'Each arithmetic operation is handled by a separate `case` within the switch statement.' WHERE subtopic_id = @sub_switch AND title = 'Basic Calculator';
UPDATE questions SET explanation = 'Multiple cases can fall through to handle all vowels with the same logic.' WHERE subtopic_id = @sub_switch AND title = 'Vowel Check';
UPDATE questions SET explanation = 'The input number is matched against cases to print the corresponding month name.' WHERE subtopic_id = @sub_switch AND title = 'Month Number';
UPDATE questions SET explanation = 'A menu selection is implemented by matching the user choice to a switch case.' WHERE subtopic_id = @sub_switch AND title = 'Menu Driven Arithmetic';
