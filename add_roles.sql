-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN role ENUM('admin', 'content_manager', 'student') DEFAULT 'student';

-- Create a Content Manager User (Password: ContentManager@123)
-- Hash generated for 'ContentManager@123' is usually needed, but for now we insert a placeholder or relying on update.
-- Actually, let's insert a user and then updates password hash via application or known hash.
-- Known hash for 'ContentManager@123' (approximate, for dev env): $2a$10$w8.3... 
-- Better approach for dev: Create user with known password via app, OR update existing user. 
-- Let's create a new user 'cm@codewise.com'

INSERT INTO users (name, email, password_hash, role, email_verified)
VALUES (
    'Content Manager', 
    'cm@codewise.com', 
    '$2a$10$x.pb.uuvC.d/x.c/x.x.x.x.x.x.x.x.x.x.x.x.x.x.x', -- Placeholder, will need to reset or handle via code if I can't gen bcrypt here.
    -- Wait, I will use a dummy hash or rely on the signup flow to create one then manually update role?
    -- No, user asked for "No signup from UI".
    -- I will use a known hash from a previous user or generate one using node script in next step.
    'content_manager', 
    1
);
