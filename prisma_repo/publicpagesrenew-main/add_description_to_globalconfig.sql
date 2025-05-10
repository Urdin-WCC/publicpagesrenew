-- Script SQL simplificado para actualizar la tabla GlobalConfig

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS `GlobalConfig` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'global',
  `siteName` VARCHAR(191) NOT NULL DEFAULT 'Neurowitch',
  `description` TEXT,
  `siteUrl` VARCHAR(191) NOT NULL DEFAULT 'http://localhost:3000',
  `logoUrl` VARCHAR(191) NULL,
  `faviconUrl` VARCHAR(191) NULL,
  `themeColor` VARCHAR(191) NULL,
  `header` LONGTEXT NULL,
  `footer` LONGTEXT NULL,
  `sidebar` LONGTEXT NULL,
  `social` LONGTEXT NULL,
  `sharing` LONGTEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
  `blogConfig` LONGTEXT NULL,
  `portfolioConfig` LONGTEXT NULL,
  `defaultLightThemePresetId` INT NULL,
  `defaultDarkThemePresetId` INT NULL,
  `themeAssignments` LONGTEXT NULL,
  `loadingSpinnerConfig` LONGTEXT NULL,
  `themeSwitcherConfig` LONGTEXT NULL,
  `stickyElementsConfig` LONGTEXT NULL,
  `cookieBannerText` TEXT NULL,
  `cookieBannerLinkPageId` INT NULL,
  `globalMetaDescription` TEXT NULL,
  `globalKeywords` TEXT NULL,
  `globalSeoTitle` VARCHAR(191) NULL,
  
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Intentar agregar columnas individualmente (en caso de que la tabla ya exista)
-- Estas consultas podrían fallar si las columnas ya existen, pero eso está bien

ALTER TABLE `GlobalConfig` ADD COLUMN `description` TEXT NULL AFTER `siteName`;

ALTER TABLE `GlobalConfig` ADD COLUMN `globalMetaDescription` TEXT NULL;

ALTER TABLE `GlobalConfig` ADD COLUMN `globalKeywords` TEXT NULL;

ALTER TABLE `GlobalConfig` ADD COLUMN `globalSeoTitle` VARCHAR(191) NULL;

-- Insertar un registro global por defecto si no existe
-- Usamos ON DUPLICATE KEY UPDATE para no sobrescribir datos existentes
INSERT INTO `GlobalConfig` 
(`id`, `siteName`, `description`, `siteUrl`, `createdAt`, `updatedAt`, 
 `themeAssignments`, `loadingSpinnerConfig`, `themeSwitcherConfig`, `stickyElementsConfig`)
VALUES 
('global', 'Neurowitch', 'Sitio web creado con Neurowitch CMS', 'http://localhost:3000', 
 NOW(), NOW(), '{}', '{}', '{}', '{}')
ON DUPLICATE KEY UPDATE 
  `updatedAt` = NOW();

-- Actualizar updatedAt para arreglar los problemas de fecha
UPDATE `GlobalConfig` SET 
  `updatedAt` = NOW(),
  `createdAt` = NOW()
WHERE `id` = 'global';
