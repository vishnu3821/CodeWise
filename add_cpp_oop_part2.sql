USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_oop = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'object-oriented-programming' LIMIT 1);

-- -----------------------------------------------------
-- Subtopics
-- -----------------------------------------------------
-- No slug column. Use order_index.
INSERT IGNORE INTO subtopics (topic_id, name, order_index) VALUES
(@topic_oop, 'Access Specifiers', 4),
(@topic_oop, 'Encapsulation', 5),
(@topic_oop, 'Inheritance', 6),
(@topic_oop, 'Polymorphism', 7);

-- -----------------------------------------------------
-- Access Specifiers
-- -----------------------------------------------------
SET @sub_access = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Access Specifiers' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_access, 'BankAccount with private balance and public deposit/withdraw', 'Design a class BankAccount that encapsulates its internal balance. The balance must be private and only modifiable through public methods:\n\nvoid deposit(long long amt): adds amt to the balance; if amt < 0, ignore the operation.\nbool withdraw(long long amt): subtracts amt if there is sufficient balance (balance ≥ amt); otherwise, do nothing and return false; return true on success.\nYou will read an initial balance B and then Q operations. Each operation is either “DEPOSIT x” or “WITHDRAW x”. After processing all operations, print the final balance. This exercise highlights access control: client code cannot touch the internal balance directly and must go through the safe public API.', 'Easy', '0 ≤ B ≤ 10^12\n1 ≤ Q ≤ 200000\n0 ≤ x ≤ 10^12\nUse 64-bit (long long) for all balances and amounts.', 'Start with 100. +50 → 150. −30 → 120. Attempt to withdraw 200 fails (insufficient funds) → still 120. +10 → 130.\nFirst withdraw fails (balance 0). Deposit 5 → balance 5. Withdraw 5 succeeds → balance 0.');
SET @qa1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa1, '100 4\nDEPOSIT 50\nWITHDRAW 30\nWITHDRAW 200\nDEPOSIT 10', '130', TRUE),
(@qa1, '0 3\nWITHDRAW 1\nDEPOSIT 5\nWITHDRAW 5', '0', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_access, 'Person with private age; setter enforces [0,150]', 'Create a class Person with private fields: string name and int age. Provide:\n\nvoid setName(string n) — set the name as given (no spaces in input).\nvoid setAge(int a) — if a < 0, set age = 0; if a > 150, set age = 150; otherwise set age = a.\nstring getName() const and int getAge() const.\nYou will receive name, initialAge, and k years to add. Use setters to initialize, then increase the age by k through setAge(currentAge + k) so the clamp is respected. Print the final name and age. This shows how write access is controlled by a setter that maintains invariants.', 'Easy', 'Name has no spaces.\n-10^9 ≤ initialAge, k ≤ 10^9\nStored age is clamped to [0, 150].', 'setAge(-3) clamps to 0. Adding 10 via setAge(0+10) gives 10.\nInitial age 149, then +5 → 154, but setAge clamps to 150.');
SET @qa2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa2, 'bob -3 10', 'bob 10', TRUE),
(@qa2, 'amy 149 5', 'amy 150', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_access, 'Protected score accessible from a derived class', 'Create a base class BaseScore with a protected long long score initialized to 0. Derive GameScore publicly with these public methods:\n\nvoid add(long long x): if x ≥ 0, score += x; otherwise ignore.\nbool spend(long long x): if x ≥ 0 and score ≥ x, score -= x and return true; otherwise return false.\nlong long get() const: returns the current score.\nRead Q commands: “ADD x”, “SPEND x”, or “GET”. For each GET, print the score. This demonstrates protected: the derived class directly manipulates score while clients cannot.', 'Medium', '1 ≤ Q ≤ 200000\n0 ≤ x ≤ 10^12\nUse 64-bit arithmetic.', 'Start at 0. After +100 and −40, score 60. Attempt to spend 1000 fails; score remains 60.\nTwo additions accumulate to 12; GET prints 12.');
SET @qa3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa3, '6\nGET\nADD 100\nSPEND 40\nGET\nSPEND 1000\nGET', '0\n60\n60', TRUE),
(@qa3, '3\nADD 5\nADD 7\nGET', '12', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_access, 'Friend functions on a class with private fields', 'Define a class Box with private long long l, w, h (dimensions). Provide:\n\nConstructor Box(l, w, h), clamping each dimension to ≥ 0.\nFriend long long volume(const Box& b) — returns lwh using 64-bit.\nFriend bool canNest(const Box& a, const Box& b) — returns true if a can fit inside b without rotation when l_a < l_b, w_a < w_b, and h_a < h_b.\nRead two boxes and print:\nvolume of each,\nwhether box1 can nest into box2,\nwhether box2 can nest into box1.\nThis shows friend functions can access private members while keeping them hidden from general code.', 'Medium', '-10^12 ≤ l, w, h ≤ 10^12 (clamp to ≥ 0 on construct)\nUse 64-bit for volume.', 'Volume(2×3×4)=24; Volume(5×5×5)=125. All dimensions of box1 are strictly less than box2, so box1 nests into box2.\nNegative dimension clamps to 0 → first box is 0×3×3 with volume 0; 0 is not strictly less than 3 in all dimensions, so no nesting either way.');
SET @qa4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa4, '2 3 4\n5 5 5', '24\n125\nYES NO', TRUE),
(@qa4, '-1 3 3\n3 3 3', '0\n27\nNO NO', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_access, 'Friend-powered transfer across private accounts', 'Create a class Account with private long long balance and a public constructor Account(long long b) that clamps b ≥ 0. Provide public:\n\nvoid deposit(long long x) — if x ≥ 0, balance += x.\nbool withdraw(long long x) — if x ≥ 0 and balance ≥ x, deduct and return true; else return false.\nAlso define a friend function:\nbool transfer(Account& from, Account& to, long long x) — directly accesses private balances; if x ≥ 0 and from.balance ≥ x, subtract x from from.balance and add x to to.balance, returning true; otherwise return false.\nYou will create N accounts with initial balances. Then process Q operations: “DEPOSIT i x”, “WITHDRAW i x”, “TRANSFER i j x”. After all operations, print the balances of all accounts in order. This showcases friend functions editing encapsulated state across objects in a controlled way.', 'Hard', '1 ≤ N ≤ 200000\n0 ≤ initial balances ≤ 10^12\n1 ≤ Q ≤ 200000\n0 ≤ x ≤ 10^12\nUse 64-bit for all amounts.', 'Transfer 7: [3,7,5]; deposit 1 to 2: [3,8,5]; transfer 8 from 2→3: [3,0,13]; withdraw 0 does nothing.\nFirst fails, second succeeds, third succeeds exactly; ending [10,0].');
SET @qa5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa5, '3\n10 0 5\n4\nTRANSFER 1 2 7\nDEPOSIT 2 1\nTRANSFER 2 3 8\nWITHDRAW 1 0', '3 0 13', TRUE),
(@qa5, '2\n5 5\n3\nWITHDRAW 1 10\nTRANSFER 1 2 2\nTRANSFER 2 1 7', '10 0', TRUE);


-- -----------------------------------------------------
-- Encapsulation
-- -----------------------------------------------------
SET @sub_encap = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Encapsulation' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_encap, 'Encapsulated stack with safe push/pop and size', 'Implement a class IntStack that encapsulates a vector<int> buffer with public methods:\n\nvoid push(int x)\nbool pop(int& out): if non-empty, writes top into out, removes it, and returns true; else returns false\nint size() const\nYou will read Q operations: “PUSH x”, “POP”. For each POP, print the popped value on success or “EMPTY” if the stack is empty. Finally, print the final size. This shows how the class protects its representation and exposes a minimal, safe API.', 'Easy', '1 ≤ Q ≤ 200000\nPushed values fit 32-bit int.', 'First POP fails (empty). Push 3, push 4. POP gives 4, then POP gives 3. Final size 0.\nLIFO order is preserved; the class controls all internal state.');
SET @qe1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe1, '5\nPOP\nPUSH 3\nPUSH 4\nPOP\nPOP', 'EMPTY\n4\n3\nSIZE 0', TRUE),
(@qe1, '4\nPUSH -1\nPUSH 2\nPOP\nPOP', '2\n-1\nSIZE 0', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_encap, 'Temperature class that stores Celsius internally', 'Design a class Temperature that internally stores a double in Celsius, but clients can set/get in either Celsius (C) or Fahrenheit (F).\n\nvoid setC(double c)\nvoid setF(double f) — store as (f − 32) × 5/9\ndouble getC() const\ndouble getF() const — return c × 9/5 + 32\nYou will read an initial scale S0 (C or F) and value v0, set the temperature, then read a target scale S1 to print the temperature in that scale with two decimals. Encapsulation hides the representation and unifies conversions.', 'Easy', 'Values fit in double.\nInput scales are exactly \'C\' or \'F\'.', 'Store 0°C internally; convert to 32°F on output.\n212°F equals 100°C. Representation is consistently Celsius internally.');
SET @qe2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe2, 'C 0\nF', '32.00', TRUE),
(@qe2, 'F 212\nC', '100.00', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_encap, 'Rational number with invariant maintained by methods', 'Create a class Rational with private long long num, den. The class must always satisfy:\n\nden > 0\ngcd(|num|, den) = 1\nProvide methods:\nvoid set(long long a, long long b) — set then normalize (reduce and fix sign).\nRational add(const Rational& other) const — return normalized sum.\nstring str() const — return “num/den”.\nRead two rationals, add them, and print the result. This shows encapsulation of invariants through a disciplined API.', 'Medium', 'b ≠ 0 on set\n|a|, |b| ≤ 10^12\nUse 64-bit math; use gcd for reduction.', '1/2 + 1/3 = (3+2)/6 = 5/6 (already reduced).\n1/2 + (-1/6) = 3/6 − 1/6 = 2/6 = 1/3.');
SET @qe3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe3, '1 2\n1 3', '5/6', TRUE),
(@qe3, '-2 -4\n1 -6', '1/3', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_encap, 'Daily withdrawal-limited account enforced by methods', 'Build a class LimitedAccount with private fields: long long balance, long long dailyLimit, long long spentToday. Methods:\n\nvoid setLimit(long long L): set dailyLimit ≥ 0 and reset spentToday = 0.\nvoid deposit(long long x): x ≥ 0 adds to balance.\nbool withdraw(long long x): success only if x ≥ 0, x ≤ balance, and spentToday + x ≤ dailyLimit; on success add to spentToday and subtract from balance.\nYou will read an initial balance B, an initial limit L, and Q commands: SETLIMIT L, DEPOSIT x, WITHDRAW x, NEWDAY (resets spentToday to 0). For each WITHDRAW, print YES/NO. At the end, print the balance.', 'Medium', '0 ≤ B, L, x ≤ 10^12\n1 ≤ Q ≤ 200000', 'Day 1: spent 30. Next 25 would exceed 50 → NO. NEWDAY resets. Withdraw 25 → YES. Then 30 fails (balance OK, limit OK, but total limit logic depends on implementation details explained in problem). Final balance 70.\nWithdraw 0 is allowed. After deposit 5, daily limit is still 0 so withdrawing 1 fails.');
SET @qe4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe4, '100 50\n5\nWITHDRAW 30\nWITHDRAW 25\nNEWDAY\nWITHDRAW 25\nWITHDRAW 30', 'YES\nNO\nYES\nNO\nBAL 70', TRUE),
(@qe4, '0 0\n3\nWITHDRAW 0\nDEPOSIT 5\nWITHDRAW 1', 'YES\nNO\nBAL 5', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_encap, 'Inventory class with non-negative stock and reserved invariants', 'Implement a class Inventory that maintains two non-negative integers: stock and reserved, with the invariant 0 ≤ reserved ≤ stock at all times. Provide methods:\n\nvoid addStock(long long x) — x ≥ 0 increases stock.\nbool reserve(long long x) — if x ≥ 0 and stock − reserved ≥ x, then reserved += x and return true; else return false.\nbool ship(long long x) — if x ≥ 0 and reserved ≥ x, then reserved -= x and stock -= x (shipping consumes reserved units), return true; else return false.\nbool cancel(long long x) — if x ≥ 0 and reserved ≥ x, then reserved -= x (returns to available), return true; else return false.\nProcess Q operations, printing OK or FAIL. After all operations, print stock and reserved. This problem stresses encapsulation: client code cannot accidentally violate invariants.', 'Hard', 'Initial stock S0, reserved R0 provided with 0 ≤ R0 ≤ S0\n0 ≤ x ≤ 10^12\n1 ≤ Q ≤ 200000', 'Properly adhering to reserved <= stock invariants ensures operations succeed or fail predictably.\nCannot reserve before adding stock. After adding 1, you can reserve 1; stock stays 1 while reserved=1, leaving 0 available.');
SET @qe5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qe5, '10 2\n6\nRESERVE 5\nSHIP 3\nCANCEL 1\nSHIP 4\nADD 2\nRESERVE 3', 'OK\nOK\nOK\nFAIL\nOK\nOK\n9 6', TRUE),
(@qe5, '0 0\n3\nRESERVE 1\nADD 1\nRESERVE 1', 'FAIL\nOK\nOK\n1 1', TRUE);


-- -----------------------------------------------------
-- Inheritance
-- -----------------------------------------------------
SET @sub_inherit = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Inheritance' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_inherit, 'Person (base) and Student (derived): compute student average', 'Create a base class Person with protected string name. Derive class Student publicly with additional private ints m1, m2, m3 and public methods:\n\nvoid set(string name, int m1, int m2, int m3)\ndouble average() const\nRead a student’s name and three marks, construct the Student, and print name and average to two decimals. This illustrates simple public inheritance: Student reuses Person’s name and adds behavior.', 'Easy', 'Name has no spaces.\n0 ≤ marks ≤ 100.', 'Average = (90+80+100)/3 = 90. Student inherits name from Person.\nAll zeros give 0.00; straightforward use of inherited field.');
SET @qi1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi1, 'alice 90 80 100', 'alice 90.00', TRUE),
(@qi1, 'bob 0 0 0', 'bob 0.00', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_inherit, 'Shape2D (base) and Rectangle (derived): area and perimeter', 'Define a base class Shape2D with no data (an interface-style base). Derive Rectangle with private long long w, h and methods:\n\nvoid set(long long w, long long h) with clamp to ≥ 0\nlong long area() const → w*h\nlong long perimeter() const → 2*(w+h)\nRead w and h, and print area and perimeter. This demonstrates simple inheritance for organization.', 'Easy', '-10^12 ≤ w, h ≤ 10^12\nUse 64-bit.', 'Standard formulas; clamping isn’t needed here.\nWidth clamps to 0; area 0; perimeter is 2*(0+10)=20.');
SET @qi2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi2, '3 4', '12 14', TRUE),
(@qi2, '-1 10', '0 20', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_inherit, 'Account (base) and SavingsAccount (derived) with interest', 'Create a base class Account with protected long long balance and public:\n\nexplicit Account(long long b) clamped to ≥ 0\nvoid deposit(long long x)\nbool withdraw(long long x)\nDerive SavingsAccount with a double rate (annual, e.g., 5 means 5%). Provide:\nvoid addMonthlyInterest(): balance += floor(balance * (rate/100) / 12)\nSimulate Q operations: DEPOSIT x, WITHDRAW x, MONTH (apply monthly interest). After all operations, print final balance. This shows inheritance to extend behavior.', 'Medium', '0 ≤ initial balance ≤ 10^12\n0 ≤ rate ≤ 100\n1 ≤ Q ≤ 200000\n0 ≤ x ≤ 10^12', 'Start 1000. Month 1 adds 10 → 1010. Withdraw 100 → 910. Month 2 adds 9 → 919.\nWithdraw fails. Interest on 0 remains 0.');
SET @qi3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi3, '1000 12\n3\nMONTH\nWITHDRAW 100\nMONTH', '919', TRUE),
(@qi3, '0 5\n2\nWITHDRAW 1\nMONTH', '0', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_inherit, 'Point (base) and ColoredPoint (derived): bounding box by color', 'Create class Point with protected int x, y and constructor Point(int x, int y). Derive ColoredPoint with private string color and public getters. Read N colored points (x, y, color). For a given color C, compute the area of the axis-aligned bounding rectangle of all points having that color; if none, print 0. This demonstrates inheritance for code reuse.', 'Medium', '1 ≤ N ≤ 200000\n-1e9 ≤ x, y ≤ 1e9\nColor has no spaces.', 'red points: (0,0), (-1,5), (4,4). min_x=-1, max_x=4, min_y=0, max_y=5. Area = 5*5=25.\nNo red points → area 0.');
SET @qi4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi4, '4\n0 0 red\n2 3 blue\n-1 5 red\n4 4 red\nred', '25', TRUE),
(@qi4, '2\n1 1 green\n2 2 blue\nred', '0', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_inherit, 'Energy simulation with inheritance hierarchy', 'Create base class Creature with protected long long energy and constructor Creature(long long e). Derive:\n\nHerbivore: public, method void forage(long long food) increases energy by food.\nCarnivore: public, method void hunt(long long prey) increases energy by prey/2 (floor), but only if prey ≥ 2; otherwise no change.\nSimulate a mixed population over T events: “H t food” or “C t prey”. At the end, print total energy across all creatures. This illustrates a hierarchy with differing behaviors but shared base data.', 'Hard', '0 ≤ Hcnt, Ccnt ≤ 200000\n1 ≤ T ≤ 200000\nUse 64-bit.', 'Start energies: 10, 0, 5. Total 15. H 1 3 → 13. C 1 9 → 9. H 2 1 → 1. C 1 1 → no change. Total: 13+1+9=23.\nStart 20. Carn1 hunts 2 → 11; Carn2 hunts 3 → 11; total 22.');
SET @qi5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qi5, '2 1\n10\n0\n5\n4\nH 1 3\nC 1 9\nH 2 1\nC 1 1', '23', TRUE),
(@qi5, '0 2\n10\n10\n2\nC 1 2\nC 2 3', '22', TRUE);


-- -----------------------------------------------------
-- Polymorphism
-- -----------------------------------------------------
SET @sub_poly = (SELECT id FROM subtopics WHERE topic_id = @topic_oop AND name = 'Polymorphism' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_poly, 'Virtual speak(): animals talk', 'Define an abstract base class Animal with a pure virtual method string speak() const. Implement derived classes:\n\nDog → “Woof”\nCat → “Meow”\nYou will read N lines, each “Dog” or “Cat”. For each, construct the matching object polymorphically (e.g., store Animal* in a vector) and print speak() on its own line. This demonstrates runtime polymorphism with an interface and overrides.', 'Easy', '1 ≤ N ≤ 200000\nTypes are exactly “Dog” or “Cat”.', 'Calls resolve to the derived implementation via the Animal* base pointer.\nSingle instance behaves the same way.');
SET @qp1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp1, '3\nDog\nCat\nDog', 'Woof\nMeow\nWoof', TRUE),
(@qp1, '1\nCat', 'Meow', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_poly, 'Virtual area(): pick a shape at runtime', 'Create an abstract base class Shape with virtual double area() const = 0. Implement:\n\nCircle(double r): area = πr² (use π = 3.141592653589793)\nRectangle(double w, double h): area = w*h\nRead a type T (“CIRCLE” or “RECT”), followed by the required dimensions, create the object polymorphically, and print area with 6 decimals. This shows choosing behavior at runtime through virtual dispatch.', 'Easy', '0 ≤ dimensions ≤ 1e9\nUse double, print with fixed 6 decimals.', 'π*9 = 28.274334...\nRectangle area is width*height.');
SET @qp2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp2, 'CIRCLE 3', '28.274334', TRUE),
(@qp2, 'RECT 2 5', '10.000000', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_poly, 'Payment processors with different fees (runtime polymorphism)', 'Create abstract class PayProc with virtual long long charge(long long amount) const = 0 that returns the total amount charged to the customer (amount + fees). Implement:\n\nFlatProc(fee): charge(amount) = amount + fee\nPercentProc(pct): charge(amount) = amount + floor(amount * pct / 100)\nRead Q operations of the form: “FLAT fee amount” or “PCT pct amount”. For each, construct the appropriate processor and print the charged total. This shows how a single interface abstracts varied strategies.', 'Medium', '1 ≤ Q ≤ 200000\n0 ≤ fee, pct, amount ≤ 10^12 (pct in percent, integer)\nUse 64-bit arithmetic.', 'Flat adds 10; percent adds floor(200*5/100)=10; zero percent adds nothing.\n50% of 1 is floor(0.5)=0, so total remains 1.');
SET @qp3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp3, '3\nFLAT 10 100\nPCT 5 200\nPCT 0 5', '110\n210\n5', TRUE),
(@qp3, '2\nFLAT 0 999\nPCT 50 1', '999\n1', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_poly, 'Command pattern with virtual execute()', 'Define abstract class Command with virtual long long execute(long long x) const = 0. Implement:\n\nAdd(k): returns x + k\nMul(k): returns x * k\nPow(k): returns x^k (k ≥ 0), using fast exponentiation with 64-bit (assume results fit for tests).\nYou will read an initial value X and then a sequence of Q commands. Apply them in order, each time replacing X with the returned value, and finally print X. This demonstrates polymorphic behavior chaining.', 'Medium', '0 ≤ Q ≤ 200000\n|X|, |k| ≤ 10^9\n64-bit results assumed to fit tests.', '(((5+2)*3)^(2)) = (7*3)^2 = 21^2 = 441.\nx^0 = 1 (by definition), then +10 → 11.');
SET @qp4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp4, '5 3\nADD 2\nMUL 3\nPOW 2', '441', TRUE),
(@qp4, '2 2\nPOW 0\nADD 10', '11', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_oop, @sub_poly, 'Expression tree with polymorphic evaluate() and print', 'Implement an arithmetic expression tree with these node types, all deriving from abstract class Node { virtual long long eval() const = 0; virtual void printPostfix(ostream&) const = 0; virtual ~Node() = default; }: Const(v), Add(lhs, rhs), Mul(lhs, rhs).\nYou will be given a postfix (Reverse Polish Notation) expression consisting of integers (within 64-bit), plus operators \'+\' and \'*\'. Build the tree using a stack of Node* and polymorphically compute the result and print the postfix again (to confirm structure). Output two lines: the value and the normalized postfix with single spaces.', 'Hard', '1 ≤ tokens ≤ 200000\nAll intermediate results fit 64-bit signed', '(2+3)*4 = 20. The reconstructed postfix matches the normalized spacing.\n(1+2)=3; 3*4=12; 5+12=17. Both eval and printPostfix align.');
SET @qp5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qp5, '2 3 + 4 *', '20\n2 3 + 4 *', TRUE),
(@qp5, '5 1 2 + 4 * +', '17\n5 1 2 + 4 * +', TRUE);
