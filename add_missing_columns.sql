-- Columnas que faltan en la tabla GlobalConfig
-- Ejecuta estos comandos en phpMyAdmin para solucionar el problema

-- Primera prueba con solo las columnas esenciales
ALTER TABLE GlobalConfig ADD activeThemeId VARCHAR(255);
ALTER TABLE GlobalConfig ADD defaultLightThemePresetId INT;
ALTER TABLE GlobalConfig ADD defaultDarkThemePresetId INT;
ALTER TABLE GlobalConfig ADD themeAssignments TEXT;
ALTER TABLE GlobalConfig ADD loadingSpinnerConfig TEXT;
ALTER TABLE GlobalConfig ADD themeSwitcherConfig TEXT;
ALTER TABLE GlobalConfig ADD stickyElementsConfig TEXT;

-- Si la siguiente consulta falla, ejecuta estos comandos adicionales
-- ALTER TABLE GlobalConfig ADD cookieBannerText TEXT;
-- ALTER TABLE GlobalConfig ADD cookieBannerLinkPageId VARCHAR(255);
-- ALTER TABLE GlobalConfig ADD social TEXT;
-- ALTER TABLE GlobalConfig ADD sharing TEXT;
-- ALTER TABLE GlobalConfig ADD blogConfig TEXT;
-- ALTER TABLE GlobalConfig ADD portfolioConfig TEXT;
