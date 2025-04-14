-- Exportar datos de las tablas que serán eliminadas
SELECT * FROM MenuItem INTO OUTFILE '/tmp/MenuItem_backup.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

SELECT * FROM SiteSection INTO OUTFILE '/tmp/SiteSection_backup.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

SELECT * FROM ThemePreset INTO OUTFILE '/tmp/ThemePreset_backup.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

SELECT * FROM Widget INTO OUTFILE '/tmp/Widget_backup.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

-- Exportar los datos de las columnas que serán eliminadas de GlobalConfig
SELECT id, activeThemeId, maintenanceMode FROM GlobalConfig INTO OUTFILE '/tmp/GlobalConfig_columns_backup.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';