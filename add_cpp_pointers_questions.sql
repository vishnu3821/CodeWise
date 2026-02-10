USE codewise;

-- -----------------------------------------------------
-- Set IDs
-- -----------------------------------------------------
SET @cpp_id = (SELECT id FROM languages WHERE slug = 'cpp' LIMIT 1);
SET @topic_ptr = (SELECT id FROM topics WHERE language_id = @cpp_id AND slug = 'pointers' LIMIT 1);

-- -----------------------------------------------------
-- Pointers -> Pointer Declaration
-- -----------------------------------------------------
SET @sub_decl = (SELECT id FROM subtopics WHERE topic_id = @topic_ptr AND name = 'Pointer Declaration' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_decl, 'Nullable pointer that may or may not point to a variable', 'You are given a single 32-bit integer x and a binary flag f. Declare a pointer to int named p. If f == 1, make p point to x (i.e., p = &x). If f == 0, make p a null pointer (p = nullptr). Then, without ever dereferencing a null pointer, print the value pointed to by p if it is non-null; otherwise print the word “NULL”. This exercise focuses on correctly declaring and initializing pointers, choosing between a valid object address and the null pointer, and avoiding undefined behavior by not dereferencing nullptr.', 'Easy', '-1e9 ≤ x ≤ 1e9\nf ∈ {0, 1}\nUse 32-bit int for x.', 'Since f = 1, p points to x. Therefore *p is the same as x, so the program prints 17.\nSince f = 0, p is set to nullptr. Dereferencing is forbidden, so we print the literal “NULL” to explicitly indicate the pointer does not refer to an object.');
SET @q1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q1, '17 1', '17', TRUE),
(@q1, '-9 0', 'NULL', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_decl, 'Declare a heap-allocated int via pointer and modify it', 'Read a 32-bit integer v. Dynamically allocate a single int on the heap using new, store v in the allocated location, then increment the stored value by 1 via the pointer and print the final value. Finally, release the memory with delete to avoid leaks. This problem strengthens the understanding of pointer declaration for heap-allocated objects and demonstrates that the pointer refers to a distinct memory location that you must manage manually.', 'Easy', '-1e9 ≤ v ≤ 1e9\nUse 32-bit int for v.\nMust allocate with new and deallocate with delete.', 'Allocate an int, write 12, increment through the pointer to 13, print 13, then delete. The increment proves you control the stored value via the pointer.\nThe same sequence applies for negative values. After incrementing the heap value, print -4 and delete the allocation.');
SET @q2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q2, '12', '13', TRUE),
(@q2, '-5', '-4', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_decl, 'Declare a pointer to the variable with larger magnitude and update it', 'You are given two 32-bit integers a and b. Declare a pointer p that points to the one with larger absolute value (|a| vs |b|). If there is a tie (|a| == |b|), have p point to a. Then, using p, multiply the pointed-to variable by 2 (i.e., *p *= 2). Finally, print a, b, and which variable was chosen: “A” if p pointed to a, or “B” if p pointed to b. This reinforces choosing a valid pointee during pointer declaration and confirms you can mutate the chosen variable through the pointer.', 'Medium', '-1e9 ≤ a, b ≤ 1e9\nUse 32-bit int for a and b.\nMultiplication by 2 fits in 64-bit; if you’re implementing, store intermediate results in 64-bit if worried about overflow, but print 32-bit if guaranteed safe in your environment.', '|5| = 5, |-9| = 9, so p points to b. Doubling b gives -18. a remains 5. The output includes “B” to indicate b was selected.\n|a| == |b|, so on ties p points to a. Doubling a yields -6. b is unchanged, and “A” indicates the choice.');
SET @q3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q3, '5 -9', '5 -18 B', TRUE),
(@q3, '-3 3', '-6 3 A', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_decl, 'Declare pointers to the first and last elements and use them', 'You will read an integer N followed by N integers forming an array. Declare two pointers: first should point to the first element, and last should point to the last element. Use these pointers to compute and print the sum of the first and last elements by dereferencing them. Avoid invalid memory: N is at least 1, so both pointers always point to valid elements. This exercise emphasizes pointer declaration to specific array elements via addresses, such as first = &arr[0] and last = &arr[N-1].', 'Medium', '1 ≤ N ≤ 200000\nEach element fits in 32-bit int.\nUse 64-bit if you are summing to avoid overflow in intermediate steps.', 'first points to arr[0] = 1; last points to arr[4] = 5. Their sum is 6.\nWith a single element, both pointers refer to the same element. Sum = 7 + 7 = 14.');
SET @q4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q4, '5\n1 2 3 4 5', '6', TRUE),
(@q4, '1\n7', '14', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_decl, 'Declare and use a function pointer for arithmetic dispatch', 'You are given an operation name op and two 64-bit integers x and y. Declare a function pointer type Op as long long(*)(long long, long long). Implement four functions with this signature: add, sub, mul, and mx (max). Based on op (one of "add", "sub", "mul", "max"), set a function pointer fp to the matching function, call it, and print the result. For "sub", compute x - y. For "mul", compute x * y using 64-bit. For "max", return the larger of x and y. This problem ensures you can declare and assign function pointers correctly and use them to invoke behavior chosen at runtime.', 'Hard', 'op ∈ {"add", "sub", "mul", "max"}\n-1e12 ≤ x, y ≤ 1e12\nUse 64-bit long long for all arithmetic.', 'fp is assigned to add. Invoking fp(7, 13) yields 20.\nfp is assigned to mx (the max function). The maximum of -3 and 1 is 1, which is printed.\nfp points to mul. 64-bit math is required: 10^6 × 10^6 = 10^12. The program must store and print this 64-bit result.');
SET @q5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@q5, 'add 7 13', '20', TRUE),
(@q5, 'max -3 1', '1', TRUE),
(@q5, 'mul 1000000 1000000', '1000000000000', TRUE);


-- -----------------------------------------------------
-- Pointers -> Dereferencing
-- -----------------------------------------------------
SET @sub_deref = (SELECT id FROM subtopics WHERE topic_id = @topic_ptr AND name = 'Dereferencing' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_deref, 'Increment an integer through a pointer dereference', 'Read a 32-bit integer x. Create a pointer p that points to x (p = &x). Using only the pointer dereference operator (*), increase x by 1 and then print the updated value. This problem directly exercises dereferencing to modify the underlying variable, showing that *p behaves exactly like x after p = &x.', 'Easy', '-1e9 ≤ x ≤ 1e9', 'p = &x; then *p = *p + 1 updates x to 42. Printing x or *p yields the same number.\nDereferencing allows direct write to x through p, turning -1 into 0.');
SET @qd1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qd1, '41', '42', TRUE),
(@qd1, '-1', '0', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_deref, 'Swap two integers using pointer parameters', 'You will read two integers a and b. Implement a function swapPtr(int* pa, int* pb) that swaps the values stored at the two addresses pa and pb by dereferencing the pointers. Call this function with the addresses of a and b, then print the swapped values. This problem ensures you can use pointers as function parameters and correctly dereference them to mutate the caller’s variables.', 'Easy', '-1e9 ≤ a, b ≤ 1e9', 'Inside swapPtr, use a temporary and dereference both pointers to exchange values. The caller then observes a=4 and b=3.\nThe dereferences operate on the original storage of a and b, so the values are swapped in place.');
SET @qd2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qd2, '3 4', '4 3', TRUE),
(@qd2, '-5 10', '10 -5', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_deref, 'In-place absolute value of an array via pointer traversal', 'Read N and then N integers. Create a pointer p that starts at the first element of the array. Traverse the array by incrementing p and, using dereferencing, replace each negative element by its absolute value (i.e., if *p < 0, set *p = -*p). After processing the entire array, print the resulting sequence. This problem practices reading/writing through dereferenced pointers and iterating an array using pointer moves.', 'Medium', '1 ≤ N ≤ 200000\nEach element fits in 32-bit int.', 'Each negative value is flipped by writing through *p. Non-negative values are left unchanged.\nOnly one element exists; dereferencing lets you update it directly to its absolute value.');
SET @qd3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qd3, '6\n-1 0 -3 4 -5 2', '1 0 3 4 5 2', TRUE),
(@qd3, '1\n-7', '7', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_deref, 'Rebinding through a pointer-to-pointer and updating through dereference', 'You are given two integers x and y, a target letter t ∈ {\'x\',\'y\'}, and an integer delta. Start with a pointer p pointing to x. Create a pointer-to-pointer pp that points to p (pp = &p). Using only pp to change p (i.e., assign through *pp), rebind p to point to x if t == \'x\' or to y if t == \'y\'. Then, using p (dereferencing it), add delta to the chosen variable. Finally, print x and y. This exercise stresses dereferencing at two levels: using *pp to rebind p and then using *p to mutate the selected variable.', 'Medium', '-1e9 ≤ x, y, delta ≤ 1e9\nt ∈ {\'x\', \'y\'}', 'Initially p=&x. Since t=\'y\', assign through *pp so that p now equals &y. Then *p += delta updates y to 13. x remains 10.\nRebinding chooses &x; adding zero changes nothing. The sequence shows rebinding and dereferencing working without altering values.');
SET @qd4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qd4, '10 20 y -7', '10 13', TRUE),
(@qd4, '5 5 x 0', '5 5', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_deref, 'Allocate a 2D grid with pointers-to-pointers and sum the border', 'Read two integers R and C, then read R×C integers row by row to fill a matrix. Allocate the matrix on the heap as an array of pointers to rows (int** grid), where each row is a separately allocated int* of length C. After filling, compute the sum of all border cells: every element in the first row, every element in the last row, and the first/last element of each middle row. Use dereferencing to access and accumulate values (e.g., grid[r][c] via pointer-to-pointer). Print the border sum. This problem demonstrates correct pointer-based 2D allocation, dereferencing through two levels, and careful iteration over the boundary to avoid double counting corners.', 'Hard', '1 ≤ R, C ≤ 2000\nR × C ≤ 2 × 10^6\nElements fit in 32-bit int; use 64-bit accumulation to avoid overflow.\nProperly delete all allocations (delete[] rows, then delete[] grid) in an actual implementation.', 'With two rows, all cells are on the border. Sum = 1+2+3 + 4+5+6 = 21, obtained via dereferenced access grid[r][c].\nBorder cells are the entire outer ring: top row (1+1+1) + bottom row (1+1+1) + middle row ends (1+1) = 8. Access is done through pointer-to-pointer dereferences.');
SET @qd5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qd5, '2 3\n1 2 3\n4 5 6', '21', TRUE),
(@qd5, '3 3\n1 1 1\n1 9 1\n1 1 1', '8', TRUE);


-- -----------------------------------------------------
-- Pointers -> Pointer Arithmetic
-- -----------------------------------------------------
SET @sub_arith = (SELECT id FROM subtopics WHERE topic_id = @topic_ptr AND name = 'Pointer Arithmetic' LIMIT 1);

-- Q1
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_arith, 'Sum an array using only pointer arithmetic (no indexing)', 'Read N and then N integers. Compute the sum by iterating with a pointer that starts at the first element and advances one element at a time using p++ until it reaches the end pointer (arr + N). Do not use array indexing (no arr[i]); use only pointer arithmetic and dereferencing (*p). Print the sum. This problem focuses on linear traversal using pointers rather than indices.', 'Easy', '1 ≤ N ≤ 200000\nElements fit in 32-bit int.\nUse 64-bit sum to prevent overflow.', 'Start p at arr, end at arr+4. Accumulate *p while incrementing p. Total is 10.\nThere is only one iteration: sum += *p with p at arr; then p++ equals arr+1 (the end).');
SET @qa1 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa1, '4\n1 2 3 4', '10', TRUE),
(@qa1, '1\n-5', '-5', TRUE);

-- Q2
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_arith, 'Print an array in reverse using pointer arithmetic', 'Read N and then N integers. Print them in reverse order by starting a pointer at the last element (arr + N - 1) and moving backward (p--) until before arr. Avoid indexing; rely on pointer arithmetic and dereferencing to read values. This shows how decrementing a pointer walks memory in reverse across a contiguous array.', 'Easy', '1 ≤ N ≤ 200000\nElements fit in 32-bit int.', 'Initialize p = arr + 4, then print *p while decrementing p until p < arr.\nWith one element, p starts at arr and prints 42; no further movement is needed.');
SET @qa2 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa2, '5\n1 2 3 4 5', '5 4 3 2 1', TRUE),
(@qa2, '1\n42', '42', TRUE);

-- Q3
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_arith, 'Find the first occurrence of a target using pointer scanning', 'You are given a sorted or unsorted array of N integers and a target T. Scan from the beginning using a pointer p advancing one element at a time. The first time you find *p == T, stop and print the index computed as (p - arr). If T does not occur, print -1. This exercise underlines that pointer subtraction yields the distance in elements, not bytes, and shows how to compute an index without ever using [i].', 'Medium', '1 ≤ N ≤ 200000\nElements fit in 32-bit int.\nT fits in 32-bit int.', 'p starts at arr. When p points to the second element (value 4), p - arr equals 1, which is printed.\nThe scan reaches arr+N without matching T, so the program prints -1.');
SET @qa3 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa3, '6\n1 4 4 6 9 9\n4', '1', TRUE),
(@qa3, '5\n7 8 9 10 11\n5', '-1', TRUE);

-- Q4
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_arith, 'Sum every M-th element starting from index S using pointer stepping', 'Read N and then N integers. You are also given two integers S (start index) and M (step), with 0 ≤ S < N and M ≥ 1. Using pointer arithmetic only, compute the sum of elements at indices S, S+M, S+2M, … that remain within bounds (< N). Implement this by setting a pointer p = arr + S and repeatedly adding *p to the sum while advancing p by M elements (p += M). Print the resulting sum. This demonstrates pointer stepping by strides greater than one.', 'Medium', '1 ≤ N ≤ 200000\n0 ≤ S < N\n1 ≤ M ≤ N\nElements fit in 32-bit int; use 64-bit for the sum.', 'Take indices 1, 4, 7 → values 2, 5, 8. p starts at arr+1 and steps by 3 each time. Sum is 15.\nVisit indices 0, 2, 4 → 10 + 30 + 50 = 90 via p = arr, then p += 2 each iteration.');
SET @qa4 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa4, '8\n1 2 3 4 5 6 7 8\n1 3', '15', TRUE),
(@qa4, '5\n10 20 30 40 50\n0 2', '90', TRUE);

-- Q5
INSERT INTO questions (topic_id, subtopic_id, title, description, difficulty, constraints, explanation) VALUES
(@topic_ptr, @sub_arith, 'Binary search using only pointers (no indexing)', 'You are given a sorted array of N 32-bit integers in non-decreasing order and a target T. Implement binary search using only pointers: maintain two pointers low and high such that the current search range is [low, high). On each step, compute mid = low + (high - low) / 2, compare *mid with T, and shrink the range accordingly. If you find *mid == T, print its index computed as (mid - arr). If T does not exist, print -1. No array indexing (arr[i]) is allowed—only pointer arithmetic and subtraction. This problem highlights safe mid computation with pointers and shows how element-distance yields indices.', 'Hard', '1 ≤ N ≤ 200000\nArray is sorted in non-decreasing order\nElements and T fit in 32-bit int', 'Binary search narrows to the element 7. The index is (mid - arr) = 4, printed as the result.\nThe pointer-based range shrinks to empty without ever finding 3, so the answer is -1. Pointer math handles mid and index calculations without any [i] usage.');
SET @qa5 = LAST_INSERT_ID();
INSERT INTO test_cases (question_id, input, expected_output, is_sample) VALUES
(@qa5, '7\n1 2 4 5 7 9 11\n7', '4', TRUE),
(@qa5, '4\n2 4 6 8\n3', '-1', TRUE);
