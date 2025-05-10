-- SQL Script for adding Statistics Module tables
-- Statistics Backend Module (Module 13)

-- Create PageView table
CREATE TABLE IF NOT EXISTS PageView (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(255) NOT NULL,
  referrer VARCHAR(255) NULL,
  ipAddress VARCHAR(45) NULL,
  userAgent TEXT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_url (url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create AdminLog table
CREATE TABLE IF NOT EXISTS AdminLog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NULL,
  userEmail VARCHAR(255) NULL,
  action VARCHAR(255) NOT NULL,
  details JSON NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_userId (userId),
  INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Note: No foreign key constraint on AdminLog.userId to User.id
-- to avoid potential issues in case a user is deleted
