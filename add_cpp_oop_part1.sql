USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);

-- -----------------------------------------------------
-- Topic: Object-Oriented Programming
-- -----------------------------------------------------
-- Assign an order_index (e.g., 7, assuming others are 1-6)
INSERT IGNORE INTO topics (language_id, name, slug, order_index) VALUES
(@cpp_id, 'Object-Oriented Programming', 'object-oriented-programming', 7);

SET @topic_oop = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'object-oriented-programming' LIMIT 1);

-- -----------------------------------------------------
-- Subtopics
-- -----------------------------------------------------
-- No slug in subtopics table. Use order_index.
INSERT IGNORE INTO subtopics (topic_id, name, order_index) VALUES
(@topic_oop, 'Classes and Objects', 1),
(@topic_oop, 'Class Methods', 2),
(@topic_oop, 'Constructors', 3);

-- -----------------------------------------------------
-- Classes and Objects
-- -----------------------------------------------------
SET @sub_classes = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Classes and Objects' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_classes, 'Box class: compute volume', 'Define a class Box that represents a rectangular solid with integer dimensions length, width, and height. You will be given three non-negative integers L, W, H. Create a Box object storing these three dimensions and compute its volume as L × W × H. Because the product can exceed 32-bit range when dimensions are large, store and print the volume using 64-bit arithmetic. The focus is on designing a simple class to group related fields and using an instance to perform a calculation that belongs to that “thing.”', 'Easy', '0 ≤ L, W, H ≤ 10^9\nVolume must be computed in 64-bit (long long).', 'The volume is 3 × 4 × 5 = 60. A Box object holding length=3, width=4, height=5 makes the computation straightforward.\nEven when a dimension is 1e9, using 64-bit avoids overflow: 1e9 × 1 × 1 = 1e9.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '3 4 5', '60', TRUE),
(@q1, '1000000000 1 1', '1000000000', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_classes, 'Student class: compute average of five subjects', 'Create a class Student with fields name (no spaces) and five integer marks m1..m5. You are given name and the five marks. Construct a Student object and compute the average as a floating-point number with two decimal places. Print the name and the average. This shows how a class can keep associated data together and makes derived metrics (like averages) easy to compute per object.', 'Easy', 'Name has no spaces.\n0 ≤ mi ≤ 100 for i=1..5.\nPrint average rounded to two decimals (typical i/o formatting).', 'Average = (90+80+70+60+50)/5 = 350/5 = 70.00. Encapsulating marks in Student makes the logic tidy.\nSum = 499; avg = 499/5 = 99.8 → printed as 99.80.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, 'alice 90 80 70 60 50', 'alice 70.00', TRUE),
(@q2, 'bob 100 100 100 100 99', 'bob 99.80', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_classes, 'Top student by average with tie-break', 'Define a class Student with fields: string name and three integer marks m1, m2, m3. Read N students, construct a Student object for each, and compute each student’s average (as a double). Print the name and average of the top student. If multiple students share the highest average (within exact arithmetic—no rounding during comparison), choose the lexicographically smallest name among them. Print the chosen average with two decimal places. This shows how to create many objects, store them in a vector, and perform a selection based on fields combined with tie-breaking.', 'Medium', '1 ≤ N ≤ 200000\nName has no spaces.\n0 ≤ mi ≤ 100\nUse double to compute averages; for comparing, compare the exact double values you compute from sums.', 'All three have average 90.00. Tie-break by lexicographically smallest name: “amy”.\nzed’s average = 70.00; ada’s average = (99+99+98)/3 = 98.666..., printed as 98.67. The object holds the three marks together for clean computation.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '3\namy 90 90 90\nbob 100 80 90\ncara 80 100 90', 'amy 90.00', TRUE),
(@q3, '2\nzed 70 70 70\nada 99 99 98', 'ada 98.67', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_classes, 'Points and bounding rectangle area', 'Create a class Point with integer fields x and y. Read N points, create N Point objects, and compute the area of the axis-aligned bounding rectangle that covers all points. The bounding rectangle has corners at (min_x, min_y) and (max_x, max_y). Its area is (max_x − min_x) × (max_y − min_y). If N=1, the area is 0. Use 64-bit for the area to avoid overflow. This shows leveraging many small objects and performing a reduction across fields.', 'Medium', '1 ≤ N ≤ 200000\n-1e9 ≤ x, y ≤ 1e9\nUse 64-bit for area.', 'min_x=-1, max_x=2 → width=3. min_y=0, max_y=3 → height=3. Area=3×3=9.\nA single point’s bounding rectangle degenerates to a point → area 0.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '3\n0 0\n2 1\n-1 3', '9', TRUE),
(@q4, '1\n5 5', '0', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_classes, 'Polyline length from a list of points', 'Define a class Point { double x; double y; } and a class Polyline that stores a sequence of Points representing a path in the plane. You will read M points (x1, y1), (x2, y2), …, (xM, yM). Construct a Polyline from them and compute the total Euclidean length: sum over i from 1 to M−1 of distance between point i and i+1, where distance = sqrt((dx)^2 + (dy)^2). Print the length with fixed precision (for example, 6 decimals). Use double throughout. This highlights how a class can hold a vector of objects and own the method that computes an aggregate property.', 'Hard', '1 ≤ M ≤ 200000\n|x|, |y| ≤ 1e9\nUse double and careful accumulation to reduce floating error.', 'Segments: (0,0)→(3,0) length 3; (3,0)→(3,4) length 4; total 7.\nWith only one point, there are no segments, so the path length is 0.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, '3\n0 0\n3 0\n3 4', '7.000000', TRUE),
(@q5, '1\n10 10', '0.000000', TRUE);


-- -----------------------------------------------------
-- Class Methods
-- -----------------------------------------------------
SET @sub_methods = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Class Methods' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_methods, 'Counter with increment, decrement, and value access', 'Design a class Counter with a 64-bit integer value initialized to 0. Provide methods:\n\nvoid inc(): increase by 1\nvoid dec(): decrease by 1\nlong long get() const: return current value\nYou will receive a sequence of commands: INC, DEC, or GET. For each GET, print the counter’s value. This demonstrates basic instance methods and a const accessor.', 'Easy', '1 ≤ Q ≤ 200000\nOperations are valid strings among {INC, DEC, GET}\nUse 64-bit integer to avoid overflow.', 'Start at 0. GET prints 0. After two INCs, value=2; GET prints 2. A DEC follows but no GET after it.\nThe counter increments to 1, then decrements back to 0; GET prints 0.');
SET @qm1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm1, '5\nGET\nINC\nINC\nGET\nDEC', '0\n2', TRUE),
(@qm1, '3\nINC\nDEC\nGET', '0', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_methods, 'Static math utilities: GCD and LCM', 'Create a class MathUtil exposing two static methods:\n\nstatic long long gcd(long long a, long long b): computes greatest common divisor\nstatic long long lcm(long long a, long long b): computes least common multiple as a/gcd(a,b)*b using 128-bit intermediate if needed to avoid overflow in practice\nRead pairs (a, b) and for each pair print “gcd lcm”. This highlights class methods that do not depend on an instance.', 'Easy', '1 ≤ T ≤ 200000\n0 ≤ a, b ≤ 10^12 (define gcd(0,0)=0)\nUse 128-bit intermediate (if implementing) for a/gcd*a to avoid overflow; final result fits in unsigned 128 or handle via builtins. For problem purposes, assume it fits 64-bit when inputs are within constraints.', 'gcd(6,8)=2, lcm=6/2*8=24. For (0,5), gcd=5 and lcm=0 by definition.\ngcd(0,0) is defined as 0; lcm is also 0.');
SET @qm2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm2, '2\n6 8\n0 5', '2 24\n5 0', TRUE),
(@qm2, '1\n0 0', '0 0', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_methods, 'StringBuilder: append and length as class methods', 'Implement a class StringBuilder that holds a single std::string buffer. Provide:\n\nvoid append(const std::string& s): appends s to the end of the buffer\nsize_t length() const: returns current length\nstd::string str() const: returns the current contents\nYou will process Q operations of two forms:\nAPPEND s\nLENGTH\nFor each LENGTH, print the length. After all operations, print the final string on a new line. This demonstrates mutating and const methods cooperating around an internal buffer.', 'Medium', '1 ≤ Q ≤ 200000\nSum of lengths of all appended strings ≤ 2×10^6\nStrings s contain no spaces', 'Initial length 0; after appending “abc” length 3; after appending “xyz” length 6. Final buffer “abcxyz”.\nTwo appends build a 10-character string; LENGTH prints 10; final buffer is printed afterward.');
SET @qm3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm3, '5\nLENGTH\nAPPEND abc\nLENGTH\nAPPEND xyz\nLENGTH', '0\n3\n6\nabcxyz', TRUE),
(@qm3, '3\nAPPEND hello\nAPPEND world\nLENGTH', '10\nhelloworld', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_methods, '2×2 matrix multiply as a class method', 'Define a class Mat2 with fields long long a, b, c, d representing the matrix [[a, b], [c, d]]. Implement a member method Mat2 mul(const Mat2& other) const that returns this × other using 64-bit arithmetic. Read two matrices A and B and print their product’s four entries in row-major order. This demonstrates a class method that returns a new object derived from two inputs.', 'Medium', '|entries| ≤ 10^9\nUse 64-bit for multiplications and sums; assume results fit 64-bit for given inputs.', 'Product:\nc11=15+27=19, c12=16+28=22, c21=35+47=43, c22=36+48=50.\nMultiplying the swap matrix [[0,1],[1,0]] by B swaps the rows: result has first row (4,5) and second row (2,3).');
SET @qm4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm4, '1 2 3 4\n5 6 7 8', '19 22 43 50', TRUE),
(@qm4, '0 1 1 0\n2 3 4 5', '4 5 2 3', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_methods, 'Polynomial class with add and evaluate methods', 'Create a class Polynomial that stores terms as vector<pair<long long,int>> where each pair is (coefficient, exponent), with no duplicate exponents and strictly decreasing exponent order. Provide methods:\n\nvoid normalize(): combine like exponents and remove zero coefficients; keep terms sorted by descending exponent\nPolynomial add(const Polynomial& other) const: returns the sum, normalized\nlong long eval(long long x) const: evaluates the polynomial at x using 64-bit with safe multiplication order (watch overflow in actual code)\nInput provides two polynomials P and Q (possibly unsorted, with duplicate exponents), followed by a value x. You must build both polynomials, normalize them, compute S = P.add(Q), and print S(x). This showcases non-trivial class behavior (combining, ordering, evaluation) expressed as methods.', 'Hard', '0 ≤ MP, MQ ≤ 200000 terms each\n|coef| ≤ 10^12, 0 ≤ exp ≤ 10^9\nUse 64-bit; assume evaluation fits 64-bit for given tests', 'P terms combine: 2x^2 + (-1)x^2 + 3 = 1x^2 + 3. Q is 5x + 1. S = x^2 + 5x + 4. Evaluate at x=2: 4 + 10 + 4 = 18.\nP=x^3, Q=−x^3 → S=0. Evaluating at x=10 gives 0.');
SET @qm5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qm5, '3\n2 2\n-1 2\n3 0\n2\n5 1\n1 0\n2', '18', TRUE),
(@qm5, '1\n1 3\n1\n-1 3\n10', '0', TRUE);


-- -----------------------------------------------------
-- Constructors
-- -----------------------------------------------------
SET @sub_cons = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Constructors' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_cons, 'Point with default and parameterized constructors', 'Define a class Point with integer fields x and y. Provide:\n\nA default constructor that initializes (x,y) = (0,0)\nA parameterized constructor Point(int x, int y)\nRead a flag t (0 or 1). If t=0, construct the default Point; if t=1, read x and y and construct the parameterized Point. Print the point’s coordinates. This demonstrates how constructors control object initialization paths.', 'Easy', 't ∈ {0,1}\n-1e9 ≤ x, y ≤ 1e9', 'Default constructor sets both fields to zero.\nParameterized constructor initializes to (5, -3).');
SET @qc1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc1, '0', '0 0', TRUE),
(@qc1, '1 5 -3', '5 -3', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_cons, 'Rectangle with validation in the constructor', 'Create a class Rect with fields width and height (64-bit). Provide a constructor Rect(long long w, long long h) that clamps negative arguments to zero (e.g., width = max(0, w); height = max(0, h)). Compute and print the area (width × height). This shows moving input validation into a constructor so all Rect objects start in a valid state.', 'Easy', '-10^12 ≤ w, h ≤ 10^12\nUse 64-bit (long long) for dimensions and area.', 'No clamping needed; area = 3×4.\nwidth is clamped to 0, so area = 0×7 = 0. Constructor-level validation prevents invalid negative sizes later.');
SET @qc2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc2, '3 4', '12', TRUE),
(@qc2, '-5 7', '0', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_cons, 'Prefix sum class constructed from an array', 'Design a class PrefixSum that stores a vector<long long> pref where pref[i] = sum of the first i elements (pref[0] = 0). The constructor takes an array of N integers and builds pref in O(N). Then answer Q range-sum queries [L, R] (0-indexed, inclusive) by returning pref[R+1] − pref[L]. Print the sum for each query. This demonstrates heavy lifting in the constructor so queries become O(1) method calls afterward.', 'Medium', '1 ≤ N ≤ 200000\n-10^9 ≤ a[i] ≤ 10^9\n1 ≤ Q ≤ 200000\nUse 64-bit (long long) for sums.', 'pref = [0,1,3,6,10,15]. Sums: [0,2]→6, [1,3]→9, [2,4]→12.\npref = [0,-1,-3,-6]. Range sums: [-1+-2] = -3; [-2+-3] = -5.');
SET @qc3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc3, '5\n1 2 3 4 5\n3\n0 2\n1 3\n2 4', '6\n9\n12', TRUE),
(@qc3, '3\n-1 -2 -3\n2\n0 1\n1 2', '-3\n-5', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_cons, 'Time class with multiple constructors and normalization', 'Create a class Time with non-negative 64-bit fields h, m, s (hours, minutes, seconds). Provide:\n\nDefault constructor → 0:0:0\nConstructor Time(h, m, s) that normalizes so that 0 ≤ s < 60, 0 ≤ m < 60, carrying excess into higher units\nConstructor Time(totalSeconds) that converts a non-negative total seconds into h:m:s\nRead two lines; each line is either of the form “H M S” or “S” (a single integer meaning total seconds). Construct both times appropriately, add them (component-wise after converting both to total seconds), re-normalize using your constructor, and print “H M S”. This demonstrates constructor overloading and normalization logic.', 'Medium', '0 ≤ H, M, S ≤ 10^12 (before normalization)\n0 ≤ totalSeconds ≤ 10^18\nUse 64-bit throughout.', 'Second line is totalSeconds=2. First is 1:59:59. Sum → 1:59:61 → normalize to 2:0:1.\n120 seconds carry 2 minutes, and 120 minutes carry 2 hours, resulting in 2:2:0.');
SET @qc4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc4, '1 59 59\n2', '2 0 1', TRUE),
(@qc4, '0 120 120\n0', '2 2 0', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_cons, 'Deep copy semantics for a small string class', 'Implement a class SmallString that owns a dynamic char array (C-style string, null-terminated). Provide:\n\nConstructors: default (empty), from std::string\nCopy constructor and copy assignment (deep copy)\nDestructor to free memory\nvoid append(const std::string& s): append text\nconst char* c_str() const: expose C-string view\nYou will process commands to exercise deep-copy behavior:\nSET t: set S to new SmallString(t)\nCOPY: create T as a copy of S (using copy constructor)\nAPPEND u: append u to S\nPRINT: print two lines — first S, then T (if T exists; otherwise print “(null)” for T)\nThe key is that after COPY, modifying S must not change T, proving deep copy. You must simulate this through the described operations and print results accordingly.', 'Hard', 'Number of commands Q: 1 ≤ Q ≤ 200000\nEach string token has no spaces\nTotal length handled ≤ 2×10^6', 'After COPY, S and T are independent. APPEND xyz modifies S only; T remains “abc”. Subsequent APPEND Q still affects only S.\nBefore COPY, T doesn’t exist, so PRINT shows S’s content and “(null)” for T.');
SET @qc5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qc5, '6\nSET abc\nCOPY\nAPPEND xyz\nPRINT\nAPPEND Q\nPRINT', 'abcxyz\nabc\nabcxyzQ\nabc', TRUE),
(@qc5, '3\nSET hello\nPRINT\nCOPY', 'hello\n(null)', TRUE);
