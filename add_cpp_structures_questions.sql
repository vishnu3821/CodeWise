USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_struct = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'structures' LIMIT 1);

-- -----------------------------------------------------
-- Structures -> Structures
-- -----------------------------------------------------
SET @sub_struct = (SELECT id FROM subtopics WHERE topic_id = @topic_struct AND name = 'Structures' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_struct, 'Model a 2D point and translate it by a vector', 'Define a struct Point containing two 32-bit integers x and y that represent a point on a 2D integer grid. You will be given a point’s coordinates (x, y) and a translation vector (dx, dy). Your task is to “move” the point by applying the translation: newX = x + dx, newY = y + dy. Print the final coordinates as two integers. This problem emphasizes how a structure clusters related fields and how reading, modifying, and printing those fields mirrors real-world modeling: instead of passing separate x and y around, you encapsulate them in a single type, keeping the data coherent. Internally, you would typically construct a Point p{x, y} and then add dx to p.x and dy to p.y.', 'Easy', '-1e9 ≤ x, y, dx, dy ≤ 1e9\nUse 32-bit int for coordinates.\nNo floating-point math is required.', 'Start at (1, 2). Translating by (3, 4) yields (1+3, 2+4) = (4, 6). The struct Point would hold x=1, y=2, and you update fields to x=4, y=6.\nThe initial point is (-5, 10). Adding the vector (2, -3) gives (-5+2, 10-3) = (-3, 7). Negative coordinates and mixed signs are handled the same way because addition is component-wise.');
SET @qs1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs1, '1 2 3 4', '4 6', TRUE),
(@qs1, '-5 10 2 -3', '-3 7', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_struct, 'Rectangle area and perimeter from a struct', 'Create a struct Rect with two non-negative integers width and height. You are given width w and height h, and you must compute and print two values: the area (w*h) and the perimeter (2*(w+h)). This represents a classic use for a struct: bundling properties of a geometric shape. Use 64-bit arithmetic for the area if w*h might exceed 32-bit limits; for perimeter, 32-bit is safe when w and h are up to 1e9 only if you store in 64-bit before printing.', 'Easy', '0 ≤ w, h ≤ 1e9\nPrint area using 64-bit (long long) to avoid overflow.', 'Width=3, height=4. Area = 3*4 = 12. Perimeter = 2*(3+4) = 14. These are direct computations from Rect fields.\nArea = 1e9 * 1 = 1e9, which fits in 64-bit easily. Perimeter = 2*(1e9 + 1) = 2,000,000,002. Using a struct keeps width and height bound together and avoids mixing values accidentally.');
SET @qs2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs2, '3 4', '12 14', TRUE),
(@qs2, '1000000000 1', '1000000000 2000000002', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_struct, 'Students with names and GPAs: find the top student', 'Define a struct Student with fields: string name and double gpa. You are given an integer N followed by N lines, each containing a student’s name (no spaces) and GPA (a decimal). Your task is to print the name and GPA of the top student. If multiple students share the maximum GPA, break ties by lexicographically smallest name. This exercise demonstrates how a struct holds heterogeneous data (string and number) and how it simplifies comparisons by letting you carry both fields together during a max search.', 'Medium', '1 ≤ N ≤ 200000\nName contains only letters/digits/underscores, no spaces.\n0.0 ≤ gpa ≤ 10.0 (use double)\nStable tie-breaking rule: choose lexicographically smallest name among max GPAs.', 'Highest GPA is 9.1, shared by alice and carol. Tie breaks to the lexicographically smaller name, “alice”. A Student struct keeps (name, gpa) together so the candidate’s data moves as a unit when checking maxima.\nThe top GPA is 8.0 from amy, which is greater than zed’s 7.0. Even though zed’s name is lexicographically larger, GPA dominates the comparison.');
SET @qs3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs3, '3\nalice 9.1\nbob 8.7\ncarol 9.1', 'alice 9.1', TRUE),
(@qs3, '2\nzed 7.0\namy 8.0', 'amy 8', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_struct, 'Complex numbers: addition and multiplication using a struct', 'Create a struct Complex with two 64-bit integers re and im representing the real and imaginary parts. You are given two complex numbers (a + bi) and (c + di) as four integers a b c d. Compute:\n- Sum: (a+c) + (b+d)i\n- Product: (a*c - b*d) + (a*d + b*c)i\nPrint both results as “sumRe sumIm prodRe prodIm”. Using a struct clarifies which values belong to which complex number and avoids mixing “real” and “imaginary” components when performing multiple operations.', 'Medium', '-1e9 ≤ a, b, c, d ≤ 1e9\nUse 64-bit intermediate results to avoid overflow when multiplying.', 'Sum = (1+3, 2+4) = (4, 6). Product: real = 1*3 - 2*4 = 3 - 8 = -5; imaginary = 1*4 + 2*3 = 4 + 6 = 10.\nSum = (-1+2, 5+(-3)) = (1, 2).\nProduct: real = (-1)*2 - 5*(-3) = -2 + 15 = 13; imaginary = (-1)*(-3) + 5*2 = 3 + 10 = 11.');
SET @qs4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs4, '1 2 3 4', '4 6 -5 10', TRUE),
(@qs4, '-1 5 2 -3', '1 2 13 11', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_struct, 'Interval merging with a struct', 'Define a struct Interval with two 32-bit integers l and r representing a closed interval [l, r] with l ≤ r. You are given N intervals. Your task is to merge all overlapping intervals and print the merged list in ascending order of start points. Intervals overlap if they share any point, i.e., [a, b] and [c, d] overlap when c ≤ b and a ≤ d; for sorted order (by l), you can merge greedily. Print the number of merged intervals M followed by the M merged ranges. This problem demonstrates how structs make interval logic far less error-prone by keeping bounds bundled as a single unit.', 'Hard', '1 ≤ N ≤ 200000\n-1e9 ≤ l ≤ r ≤ 1e9\nSort by l in non-decreasing order; merge in O(N) after sorting.', 'Sort by l → [1,3], [2,6], [8,10], [9,11].\n- Merge [1,3] with [2,6] → [1,6].\n- Merge [8,10] with [9,11] → [8,11].\nFinal merged intervals are [1,6] and [8,11].\nNone overlap because [-5,-1] ends before 0, and [0,0] ends before 1. The merged list equals the input order after sorting.\nClosed intervals touching at endpoints overlap: [1,5] overlaps [5,5]; [5,5] overlaps [5,7]. Merging all yields [1,7].');
SET @qs5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qs5, '4\n1 3\n2 6\n8 10\n9 11', '2\n1 6\n8 11', TRUE),
(@qs5, '3\n-5 -1\n0 0\n1 2', '3\n-5 -1\n0 0\n1 2', TRUE),
(@qs5, '3\n1 5\n5 5\n5 7', '1\n1 7', TRUE);


-- -----------------------------------------------------
-- Structures -> Structures and Functions
-- -----------------------------------------------------
SET @sub_func = (SELECT id FROM subtopics WHERE topic_id = @topic_struct AND name = 'Structures and Functions' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_func, 'Translate a point in-place using a function', 'Define struct Point { int x; int y; }. Implement a function translate(Point& p, int dx, int dy) that modifies p so that p.x += dx and p.y += dy. You will receive x, y, dx, dy as input, form a Point p, call translate(p, dx, dy), and print the final coordinates. This problem showcases passing a struct by reference to a function so the function can update the caller’s object directly, which is often more convenient than returning a brand-new object.', 'Easy', '-1e9 ≤ x, y, dx, dy ≤ 1e9\nUse 32-bit int for components.', 'p starts at (0,0). translate adds (7,8) to yield (7,8). Passing by reference means the updates persist after the function returns.\np = (-3,4). translate adds (-2,10) to get (-5,14). The function directly touches p’s fields through the reference.');
SET @qf1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf1, '0 0 7 8', '7 8', TRUE),
(@qf1, '-3 4 -2 10', '-5 14', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_func, 'Fraction reduction via a function operating on a struct', 'Define struct Fraction { long long num; long long den; }. Given num and den, implement void reduce(Fraction& f) that divides both parts by gcd(|num|, |den|) and ensures den > 0 (if den < 0, multiply both by -1). Read a single fraction, call reduce, then print “num/den”. This shows passing a struct by reference to normalize a multi-field object consistently.', 'Easy', 'den ≠ 0\n|num|, |den| ≤ 1e12\nUse 64-bit math.', 'gcd(6,8)=2. After division → (-3,4). Denominator already positive, so print -3/4.\ngcd(2,4)=2 → (1,-2). Denominator negative, so multiply both by -1 → (-1,2), printed as -1/2.');
SET @qf2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf2, '-6 8', '-3/4', TRUE),
(@qf2, '2 -4', '-1/2', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_func, 'Add two times using a function that returns a struct', 'Define struct Time { long long h, m, s; }. You are given two times T1 and T2 as h1 m1 s1 and h2 m2 s2 (non-negative components). Implement Time add(const Time& a, const Time& b) that returns the normalized sum: sum seconds = (a.s + b.s), carry minutes if ≥60; sum minutes = (a.m + b.m + carryFromSeconds), carry hours if ≥60; sum hours = (a.h + b.h + carryFromMinutes). Print the result as “H M S”. This demonstrates returning a struct from a function and using encapsulation to keep time components in sync during normalization.', 'Medium', '0 ≤ h, m, s ≤ 10^12\nUse 64-bit integers.\nNormalization rule: 0 ≤ s < 60, 0 ≤ m < 60; hours can grow arbitrarily.', 'Seconds: 59+2=61 → 1 second remainder, carry 1 minute.\nMinutes: 59+0+1=60 → 0 minutes, carry 1 hour.\nHours: 1+0+1=2. So (2,0,1).\nFirst normalize implicitly via addition:\nSeconds: 120+0=120 → 0 seconds, carry 2 minutes.\nMinutes: 120+0+2=122 → 2 minutes, carry 2 hours.\nHours: 0+0+2=2.');
SET @qf3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf3, '1 59 59\n0 0 2', '2 0 1', TRUE),
(@qf3, '0 120 120\n0 0 0', '2 2 0', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_func, 'Count overlapping intervals using helper functions on a struct', 'Define struct Interval { int l; int r; } representing [l, r] with l ≤ r. Implement:\n- bool overlaps(const Interval& a, const Interval& b): returns true if a and b share any point (i.e., max(a.l, b.l) ≤ min(a.r, b.r)).\nRead N and then N intervals. Count the number of unordered pairs (i, j), i < j, such that intervals[i] overlaps intervals[j]. Print the count. This problem demonstrates using a small, focused function on a struct to encapsulate logic, then reusing it within a broader computation.', 'Medium', '1 ≤ N ≤ 200000\n-1e9 ≤ l ≤ r ≤ 1e9\nO(N log N) approaches are acceptable. A sweep line or sorting by l with a suitable data structure can handle large N, but a naive O(N^2) will time out in worst cases.', 'Pairs: (1,3) with (2,5) overlap (since 2 ≤ 3). (1,3) with (6,7) do not overlap. (2,5) with (6,7) do not either. Only one overlapping pair.\nAll three pairs overlap:\n- [1,5] with [2,3] (2..3 is inside 1..5),\n- [1,5] with [3,4] (3..4 is inside 1..5),\n- [2,3] with [3,4] (they touch at 3; closed intervals overlap at endpoints).');
SET @qf4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf4, '3\n1 3\n2 5\n6 7', '1', TRUE),
(@qf4, '3\n1 5\n2 3\n3 4', '3', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_func, 'Polynomial addition using a struct and functions', 'Represent a polynomial as a list of terms. Define struct Term { long long coef; int exp; } meaning coef*x^exp. You are given two polynomials P and Q. Each polynomial is input as M terms “coef exp” (not necessarily sorted, exponents may repeat). Implement functions to:\n- read and combine like terms (sum coefficients for equal exponents),\n- produce a canonical, sorted representation by decreasing exponent,\n- add P and Q by summing coefficients of matching exponents.\nPrint the resulting polynomial as K lines “coef exp” for non-zero coefficients, in strictly decreasing exponent order. If the sum is the zero polynomial, print a single line “0 0”. This showcases structs for compound data and functions that return cleaned, normalized structures.', 'Hard', '0 ≤ MP, MQ ≤ 200000 terms each\nExponents: 0 ≤ exp ≤ 10^9\nCoefficients: |coef| ≤ 10^12 (64-bit)\nThe final number of distinct exponents can be up to MP+MQ (after combining).', 'First polynomial P terms combine: 2x^2 + 3 - 1x^2 = 1x^2 + 3. Second Q: 5x + 1. Sum: (1x^2) + (5x) + (3+1) = x^2 + 5x + 4. In decreasing exp order, terms are: (5,1), (4,0) and the x^2 term is missing here—wait—why? Because the example demonstrates combining within P first: 2x^2 − 1x^2 = 1x^2; but then suppose a later cancellation occurs: if Q had -1 2, x^2 would cancel. To keep this example precise with the given inputs: P becomes x^2 + 3, Q is 5x + 1, the full sum is x^2 + 5x + 4. The correct printed order should be:\n1 2\n5 1\n4 0\nIf you see only 5 1 and 4 0, that would indicate x^2 got dropped incorrectly. So, correct output for the shown input is:\n1 2\n5 1\n4 0\nP terms cancel: 1x^3 + (-1)x^3 = 0. Q is just the zero term (ignored). The sum is the zero polynomial, so we print a single “0 0”.');
SET @qf5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qf5, '3\n2 2\n3 0\n-1 2\n2\n5 1\n1 0', '1 2\n5 1\n4 0', TRUE),
(@qf5, '2\n1 3\n-1 3\n1\n0 0', '0 0', TRUE);


-- -----------------------------------------------------
-- Structures -> Structures and Pointers
-- -----------------------------------------------------
SET @sub_ptr_struct = (SELECT id FROM subtopics WHERE topic_id = @topic_struct AND name = 'Structures and Pointers' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_ptr_struct, 'Allocate a single struct on the heap and use arrow syntax', 'Define struct Book { string title; long long price; int qty; }. Read a title (no spaces), a price, and a quantity. Dynamically allocate one Book with new, store the values, and then compute totalValue = price * qty using 64-bit arithmetic. Print the title and the total value. Finally, delete the allocation. This problem reinforces pointer-to-struct usage with the -> operator and careful handling of 64-bit multiplication for monetary totals.', 'Easy', 'Title: no spaces\n0 ≤ price ≤ 10^12\n0 ≤ qty ≤ 10^6\nUse 64-bit for price and total.', 'Heap-allocate a Book. totalValue = 1999 * 3 = 5997. Using book->price and book->qty keeps the fields organized.\nUse 64-bit: 1,000,000 × 1,000 = 1,000,000,000.');
SET @qp1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp1, 'DSA 1999 3', 'DSA 5997', TRUE),
(@qp1, 'IntroCPP 1000000 1000', 'IntroCPP 1000000000', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_ptr_struct, 'Dynamic array of structs: inventory total', 'Define struct Item { long long price; int count; }. Read N and then N pairs (price, count). Dynamically allocate an array Item* arr = new Item[N]. Compute and print the total inventory value: sum over i of price_i * count_i using 64-bit accumulation. This task enforces using pointers to arrays of structs, field access via arr[i].field or (p+i)->field, and correct deletion with delete[].', 'Easy', '1 ≤ N ≤ 200000\n0 ≤ price ≤ 10^12\n0 ≤ count ≤ 10^6\nUse 64-bit (long long) for all products and the final sum.', 'Total = 10*2 + 7*1 + 5*5 = 20 + 7 + 25 = 52. If implemented, you’d compute via pointer stepping or indexing.\nFirst term: 10^6 × 10^6 = 10^12. Second: 25. Sum: 1,000,000,000,025.');
SET @qp2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp2, '3\n10 2\n7 1\n5 5', '52', TRUE),
(@qp2, '2\n1000000 1000000\n5 5', '1000000000025', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_ptr_struct, 'Build a singly linked list and sum even values', 'Define struct Node { int val; Node* next; }. Read N and then N integers. Build a singly linked list in the given order by creating nodes on the heap and linking through next pointers. After construction, traverse the list to compute the sum of all even values and print it. Finally, free all nodes. This exercise requires using struct pointers to create a dynamic structure and demonstrates pointer traversal patterns.', 'Medium', '1 ≤ N ≤ 200000\n-1e9 ≤ values ≤ 1e9\nUse 64-bit for the sum in case many values are large.', 'Even numbers are 2 and 4, sum is 6. The list might look like 1→2→3→4→5→nullptr; traversal examines node->val at each step.\nEven values include negative evens; sum is -2 + -2 = -4. The direction of links doesn’t matter for the sum as long as you traverse all nodes.');
SET @qp3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp3, '5\n1 2 3 4 5', '6', TRUE),
(@qp3, '3\n-2 -2 -1', '-4', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_ptr_struct, 'Dynamic array of structs: find the pointer to the maximum salary', 'Define struct Employee { string name; long long salary; }. Read N and then N pairs (name, salary). Dynamically allocate an array of N Employees. Find the pointer to the employee with the highest salary; if multiple employees tie, choose the lexicographically smallest name among them. Print the chosen name and salary. This problem demonstrates computing an “argmax” that returns a pointer to the best struct, not just the value, allowing direct access to fields via the pointer.', 'Medium', '1 ≤ N ≤ 200000\nName: no spaces\n0 ≤ salary ≤ 10^12\nTie-break: lexicographically smallest name among max salaries.', 'Highest salary is 250, shared by bob and cara. Tie-break by name → “bob”. Your algorithm maintains a pointer to the current best Employee, updating it on higher salary or tie-break.\nSalaries tie at 1000; “ada” is lexicographically smaller than “zed”. The pointer to the chosen struct ends up referencing ada’s record.');
SET @qp4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp4, '3\namy 100\nbob 250\ncara 250', 'bob 250', TRUE),
(@qp4, '2\nzed 1000\nada 1000', 'ada 1000', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_struct, @sub_ptr_struct, 'Build a Binary Search Tree (BST) using struct pointers and compute its height', 'Define struct Node { int key; Node* left; Node* right; }. Read N followed by N integers. Insert them, one by one, into a BST using the standard rule: for value x, if x ≤ current->key, go left; otherwise go right; insert new nodes where a nullptr child is encountered. After building the tree, compute and print its height, where a single-node tree has height 1 and an empty tree has height 0. This problem requires careful pointer manipulation for dynamic node creation and recursive (or iterative) traversal to compute height. Remember to free allocated nodes in an actual implementation.', 'Hard', '0 ≤ N ≤ 200000\n-1e9 ≤ key ≤ 1e9\nHeight is the number of nodes on the longest root-to-leaf path.', 'Insert order builds:\n    5\n   / \\\n  3   7\n / \\\n2   4\nThe longest path lengths: 5→3→2 or 5→3→4 → length 3, so height = 3.\nWith the rule “x ≤ key goes left,” identical keys keep going left, forming a chain:\n10\n/\n10\n/\n10\n/\n10\nThe longest path visits all 4 nodes, so height = 4.\nNo nodes means an empty tree with height 0.');
SET @qp5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp5, '5\n5 3 7 2 4', '3', TRUE),
(@qp5, '4\n10 10 10 10', '4', TRUE),
(@qp5, '0', '0', TRUE);
