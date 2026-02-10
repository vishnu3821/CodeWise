ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verification_token VARCHAR(255) NULL,
ADD COLUMN email_verification_expiry DATETIME NULL;

-- Set email_verified = true for Google users (they are already verified by Google)
UPDATE users SET email_verified = TRUE WHERE auth_provider = 'google';

-- Checking the structure
DESCRIBE users;
