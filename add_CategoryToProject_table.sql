-- Tabla intermedia para la relación N:M entre Category y Project (prueba compatible SQL Server/T-SQL)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '_CategoryToProject')
BEGIN
    CREATE TABLE _CategoryToProject (
        A VARCHAR(191) NOT NULL,
        B VARCHAR(191) NOT NULL,
        CONSTRAINT PK_CategoryToProject PRIMARY KEY (A, B)
    );
    -- Ajusta los tipos segun los usados en Category(id) y Project(id) si fueran INT
    -- Añade foreign keys si las tablas existen y necesitas restricciones:
    ALTER TABLE _CategoryToProject
        ADD CONSTRAINT FK_CategoryToProject_A FOREIGN KEY (A) REFERENCES Category(id) ON DELETE CASCADE;
    ALTER TABLE _CategoryToProject
        ADD CONSTRAINT FK_CategoryToProject_B FOREIGN KEY (B) REFERENCES Project(id) ON DELETE CASCADE;
END;
