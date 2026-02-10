USE codewise;

ALTER TABLE users
MODIFY COLUMN password_hash VARCHAR(255) NULL;

ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) UNIQUE NULL AFTER email,
ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local' AFTER google_id,
ADD COLUMN profile_picture VARCHAR(500) NULL AFTER auth_provider;
