-- SQL script simple para añadir el campo developerHtmlContent a la tabla GlobalConfig
-- Este campo almacenará el HTML personalizado ingresado por administradores Master

-- Añadir el campo developerHtmlContent a la tabla GlobalConfig
ALTER TABLE `GlobalConfig` 
ADD `developerHtmlContent` LONGTEXT NULL;

-- Para revertir si es necesario:
-- ALTER TABLE `GlobalConfig` DROP `developerHtmlContent`;
