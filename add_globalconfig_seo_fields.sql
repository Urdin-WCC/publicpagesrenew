-- SEO Module Global Configuration Fields Migration

-- Add new SEO fields to GlobalConfig table

-- Default meta title
ALTER TABLE `GlobalConfig` 
ADD COLUMN `globalMetaTitle` VARCHAR(255) NULL AFTER `siteName`;

-- Default meta description
ALTER TABLE `GlobalConfig` 
ADD COLUMN `globalMetaDescription` TEXT NULL AFTER `globalMetaTitle`;

-- Default keywords
ALTER TABLE `GlobalConfig` 
ADD COLUMN `globalKeywords` TEXT NULL AFTER `globalMetaDescription`;

-- Default social share image
ALTER TABLE `GlobalConfig` 
ADD COLUMN `defaultSocialShareImage` VARCHAR(255) NULL AFTER `globalKeywords`;

-- Robots.txt content
ALTER TABLE `GlobalConfig` 
ADD COLUMN `robotsTxtContent` LONGTEXT NULL AFTER `defaultSocialShareImage`;

-- Google Analytics ID
ALTER TABLE `GlobalConfig` 
ADD COLUMN `googleAnalyticsId` VARCHAR(50) NULL AFTER `robotsTxtContent`;

-- Google Tag Manager ID
ALTER TABLE `GlobalConfig` 
ADD COLUMN `googleTagManagerId` VARCHAR(50) NULL AFTER `googleAnalyticsId`;
