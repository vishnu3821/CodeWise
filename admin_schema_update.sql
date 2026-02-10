-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add is_active to users if it doesn't exist (using a procedure to avoid error if exists, or just direct alter and ignore error if simple script)
-- Simple ALTER approach
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
