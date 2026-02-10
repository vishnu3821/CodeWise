DELETE FROM users WHERE email = 'cm@codewise.com';
INSERT INTO users (name, email, password_hash, role, email_verified) 
VALUES ('Content Manager', 'cm@codewise.com', '$2b$10$/QFOVj3XkapG5P7IPUtng.oRpleG.DHBAce8oqPx059pDLYaWCbJm', 'content_manager', true);
SELECT * FROM users WHERE email = 'cm@codewise.com';
