-- Asegurarse de que la columna existe
SELECT COUNT(*) INTO @column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'GlobalConfig' 
AND COLUMN_NAME = 'navigationMenu';

-- Si la columna no existe, crearla
SET @query = IF(@column_exists = 0, 
                'ALTER TABLE GlobalConfig ADD COLUMN navigationMenu LONGTEXT', 
                'SELECT "Column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar el valor del menú de navegación
UPDATE GlobalConfig 
SET navigationMenu = '[{\"id\":\"menu-item-home\",\"label\":\"Inicio\",\"target\":\"home\",\"openInNewTab\":false},{\"id\":\"menu-item-blog\",\"label\":\"Blog\",\"target\":\"blog\",\"openInNewTab\":false},{\"id\":\"menu-item-portfolio\",\"label\":\"Portfolio\",\"target\":\"portfolio\",\"openInNewTab\":false}]'
WHERE id = 'global';

-- Verificar la actualización
SELECT id, navigationMenu FROM GlobalConfig WHERE id = 'global';
