-- Agregar columna activeThemeId a la tabla GlobalConfig
ALTER TABLE GlobalConfig ADD activeThemeId VARCHAR(255);

-- Agregar las demás columnas personalizadas
-- Ejecuta solamente las que necesites o las que aún no existan en tu base de datos

-- Columnas para configuración de temas
ALTER TABLE GlobalConfig ADD defaultLightThemePresetId INT;
ALTER TABLE GlobalConfig ADD defaultDarkThemePresetId INT;

-- Columnas para configuración de apariencia guardadas como JSON
ALTER TABLE GlobalConfig ADD themeAssignments TEXT;
ALTER TABLE GlobalConfig ADD loadingSpinnerConfig TEXT;
ALTER TABLE GlobalConfig ADD themeSwitcherConfig TEXT;
ALTER TABLE GlobalConfig ADD stickyElementsConfig TEXT;
