-- User Admin Module Security Fields Migration

-- Add security configuration fields to GlobalConfig table

-- Minimum password length
ALTER TABLE GlobalConfig ADD passwordMinLength INT DEFAULT 8;

-- Require uppercase in password
ALTER TABLE GlobalConfig ADD passwordRequireUppercase BOOLEAN DEFAULT true;

-- Require number in password
ALTER TABLE GlobalConfig ADD passwordRequireNumber BOOLEAN DEFAULT true;

-- Require special character in password
ALTER TABLE GlobalConfig ADD passwordRequireSymbol BOOLEAN DEFAULT true;

-- Session duration in hours
ALTER TABLE GlobalConfig ADD sessionDuration INT DEFAULT 24;

-- Maximum login attempts before lockout
ALTER TABLE GlobalConfig ADD maxLoginAttempts INT DEFAULT 5;

-- Enable CAPTCHA on login page
ALTER TABLE GlobalConfig ADD captchaEnabled BOOLEAN DEFAULT false;

-- Account lockout duration in minutes
ALTER TABLE GlobalConfig ADD accountLockoutDuration INT DEFAULT 30;
