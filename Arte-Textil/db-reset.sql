-- =========================================================
--  SCRIPT PARA RESETEAR COMPLETAMENTE LA BASE DE DATOS
--  Este script elimina toda la base de datos artetextil_
--  ⚠️ ADVERTENCIA: BORRARÁ TODOS LOS DATOS Y LA BASE DE DATOS
-- =========================================================

USE master;
GO

PRINT 'Eliminando base de datos artetextil_';

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'artetextil_')
BEGIN
    ALTER DATABASE artetextil_ SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE artetextil_;
    PRINT 'Base de datos artetextil_ eliminada completamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos artetextil_ no existe.';
END

PRINT '';
PRINT '✓ Todas las tablas han sido eliminadas correctamente.';
PRINT '';
PRINT '==============================================';
PRINT '   TABLAS ELIMINADAS EXITOSAMENTE';
PRINT '==============================================';
PRINT '';
PRINT 'Próximos pasos:';
PRINT '  1. Ejecutar db.sql para crear las tablas';
PRINT '  2. Ejecutar db-seed.sql para insertar datos';
PRINT '';
GO
