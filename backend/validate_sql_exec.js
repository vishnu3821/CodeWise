const sqlite3 = require('sqlite3').verbose();

// Seed Data
const seedSql = `
CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY,
    emp_name TEXT,
    department TEXT,
    salary NUMERIC,
    hire_date DATE
);

INSERT INTO employees (emp_id, emp_name, department, salary, hire_date) VALUES
(1, 'Arjun Rao', 'Engineering', 75000.00, '2022-01-15'),
(2, 'Meera Iyer', 'HR', 52000.00, '2021-06-20'),
(3, 'Karan Singh', 'Finance', 68000.00, '2020-03-10'),
(4, 'Sneha Patel', 'Marketing', 60000.00, '2023-02-01'),
(5, 'Rahul Verma', 'Engineering', 82000.00, '2019-11-25'),
(6, 'Ananya Sharma', 'Sales', 55000.00, '2022-07-18'),
(7, 'Vikram Nair', 'IT Support', 48000.00, '2021-09-30'),
(8, 'Pooja Reddy', 'Finance', 71000.00, '2020-12-12'),
(9, 'Aman Gupta', 'Engineering', 79000.00, '2018-08-05'),
(10, 'Divya Kapoor', 'Marketing', 62000.00, '2023-04-22');
`;

const userQuery = "SELECT * FROM employees WHERE department = 'Engineering'";

function runUserQuery() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(':memory:');

        db.serialize(() => {
            // Seed
            db.exec(seedSql, (err) => {
                if (err) {
                    console.error("Seed Error:", err);
                    reject(err);
                    return;
                }
            });

            // Execute User Query
            db.all(userQuery, [], (err, rows) => {
                if (err) {
                    console.error("Query Error:", err);
                    resolve({ error: err.message });
                } else {
                    resolve({ rows });
                }
                db.close();
            });
        });
    });
}

runUserQuery().then(res => {
    console.log("Result:", JSON.stringify(res, null, 2));
});
