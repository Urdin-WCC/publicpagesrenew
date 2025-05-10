-- SQL script para añadir el campo developerHtmlContent a la tabla GlobalConfig
-- Este campo almacenará el HTML personalizado ingresado por administradores Master

-- Primero verificamos si la tabla existe
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = 'GlobalConfig'
);

-- Si la tabla existe, procedemos a verificar si el campo ya existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = DATABASE() 
    AND table_name = 'GlobalConfig' 
    AND column_name = 'developerHtmlContent'
);

-- Si la tabla existe pero el campo no existe, añadimos el campo
SET @sql = CONCAT(
    'ALTER TABLE GlobalConfig 
    ADD COLUMN developerHtmlContent LONGTEXT NULL 
    COMMENT "Contenido HTML personalizado ingresado por administradores Master" 
    AFTER cookieBannerLinkPageId'
);

-- Ejecutamos la sentencia SQL si la tabla existe pero el campo no
DELIMITER //
BEGIN
    IF @table_exists > 0 AND @column_exists = 0 THEN
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT 'Campo developerHtmlContent añadido exitosamente a la tabla GlobalConfig' as Message;
    ELSEIF @table_exists = 0 THEN
        SELECT 'La tabla GlobalConfig no existe en la base de datos' as Message;
    ELSE
        SELECT 'El campo developerHtmlContent ya existe en la tabla GlobalConfig' as Message;
    END IF;
END //
DELIMITER ;
