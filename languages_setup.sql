USE codewise;

CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO languages (name, slug, description) VALUES
('C', 'c', 'General-purpose, procedural computer programming language supporting structured programming.'),
('C++', 'cpp', 'General-purpose programming language created as an extension of the C programming language.'),
('Java', 'java', 'High-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible.'),
('Python', 'python', 'High-level, general-purpose programming language. Its design philosophy emphasizes code readability.');
