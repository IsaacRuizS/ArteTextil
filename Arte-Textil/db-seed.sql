-- =========================================================
--  SEED DATA PARA ARTETEXTIL
--  Este script inserta datos iniciales en la base de datos
-- =========================================================

USE artetextil_;
GO

PRINT 'Iniciando seed data';
GO
SET IDENTITY_INSERT Roles ON;
INSERT INTO Roles (RoleId, Name, Description, isActive, createdAt) VALUES
(1, N'Administrador', N'Acceso completo al sistema', 1, SYSDATETIME()),
(2, N'Gerente', N'Gestión de operaciones y reportes', 1, SYSDATETIME()),
(3, N'Vendedor', N'Gestión de ventas y clientes', 1, SYSDATETIME()),
(4, N'Almacenista', N'Gestión de inventario', 1, SYSDATETIME());
SET IDENTITY_INSERT Roles OFF;
GO

SET IDENTITY_INSERT Users ON;
INSERT INTO Users (UserId, FullName, Email, PasswordHash, Phone, RoleId, isActive, createdAt) VALUES
(1, N'Admin Sistema', N'admin@artetextil.com', N'$2a$11$hashed_password_here', N'123456789', 1, 1, SYSDATETIME()),
(2, N'Juan Pérez', N'juan.perez@artetextil.com', N'$2a$11$hashed_password_here', N'987654321', 2, 1, SYSDATETIME()),
(3, N'María García', N'maria.garcia@artetextil.com', N'$2a$11$hashed_password_here', N'555123456', 3, 1, SYSDATETIME());
SET IDENTITY_INSERT Users OFF;
GO

SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (CategoryId, Name, Description, isActive, createdAt) VALUES
(1, N'Telas Deportivas', N'Telas especializadas para ropa deportiva', 1, SYSDATETIME()),
(2, N'Telas Básicas', N'Telas de uso general como algodón y licra', 1, SYSDATETIME()),
(3, N'Accesorios', N'Botones, cierres y otros accesorios', 1, SYSDATETIME()),
(4, N'Materiales Reflectivos', N'Cintas y vinilos reflectivos para seguridad', 1, SYSDATETIME());
SET IDENTITY_INSERT Categories OFF;
GO

SET IDENTITY_INSERT Products ON;
INSERT INTO Products (ProductId, Name, Description, ProductCode, Price, Stock, MinStock, Location, Status, CategoryId, SupplierId, isActive, createdAt) VALUES
-- Telas deportivas
(1, N'Tela deportiva dry fit jik', N'Tela técnica dry fit jik para ropa deportiva de alto rendimiento', N'PR-001', 8500.00, 100, 20, N'Bodega 1 - Estante A1', N'Disponible', 1, 1, 1, SYSDATETIME()),
(2, N'Tela deportiva dry fit cool plus', N'Tela dry fit cool plus con tecnología de enfriamiento', N'PR-002', 9200.00, 0, 20, N'Bodega 1 - Estante A1', N'Agotado', 1, 1, 1, SYSDATETIME()),

-- Telas básicas
(3, N'Tela licra - color negro', N'Tela licra elástica 95% poliéster 5% spandex - Color negro', N'PR-003', 6500.00, 15, 20, N'Bodega 1 - Estante B2', N'Stock Bajo', 2, 1, 1, SYSDATETIME()),
(4, N'Tela algodón - color blanco', N'Tela 100% algodón natural - Color blanco', N'PR-004', 4800.00, 60, 15, N'Bodega 1 - Estante B3', N'Disponible', 2, 1, 1, SYSDATETIME()),

-- Accesorios
(5, N'Botones color negro', N'Botones plásticos 4 agujeros 15mm - Color negro', N'PR-005', 25.00, 500, 100, N'Bodega 2 - Estante C1', N'Disponible', 3, 1, 1, SYSDATETIME()),

-- Materiales reflectivos
(6, N'Cinta reflectiva', N'Cinta reflectiva alta visibilidad 5cm ancho por rollo de 50m', N'PR-006', 12500.00, 8, 5, N'Bodega 2 - Estante D1', N'Disponible', 4, 1, 1, SYSDATETIME()),
(7, N'Vinil reflectivo', N'Vinil reflectivo para transfer textil - Rollo de 25m', N'PR-007', 18000.00, 3, 5, N'Bodega 2 - Estante D2', N'Stock Bajo', 4, 1, 1, SYSDATETIME());
SET IDENTITY_INSERT Products OFF;
GO

SET IDENTITY_INSERT InventoryMovements ON;
INSERT INTO InventoryMovements (MovementId, ProductId, Type, Quantity, Observations, PreviousStock, NewStock, MovementDate, PerformedByUserId, isActive, createdAt) VALUES
-- PR-001: Tela dry fit jik
(1, 1, N'Entrada', 120, N'Compra inicial de tela dry fit jik al proveedor', 0, 120, DATEADD(day, -18, SYSDATETIME()), 1, 1, DATEADD(day, -18, SYSDATETIME())),
(2, 1, N'Salida', 20, N'Salida para producción de uniformes deportivos', 120, 100, DATEADD(day, -13, SYSDATETIME()), 1, 1, DATEADD(day, -13, SYSDATETIME())),

-- PR-002: Tela dry fit cool plus (AGOTADO)
(3, 2, N'Entrada', 50, N'Entrada inicial de tela cool plus', 0, 50, DATEADD(day, -23, SYSDATETIME()), 1, 1, DATEADD(day, -23, SYSDATETIME())),
(4, 2, N'Salida', 50, N'Salida completa para producción urgente', 50, 0, DATEADD(day, -8, SYSDATETIME()), 2, 1, DATEADD(day, -8, SYSDATETIME())),

-- PR-003: Tela licra negro (BAJO STOCK)
(5, 3, N'Entrada', 40, N'Compra de tela licra negra', 0, 40, DATEADD(day, -16, SYSDATETIME()), 1, 1, DATEADD(day, -16, SYSDATETIME())),
(6, 3, N'Salida', 25, N'Salida para producción de leggings deportivos', 40, 15, DATEADD(day, -6, SYSDATETIME()), 2, 1, DATEADD(day, -6, SYSDATETIME())),

-- PR-004: Tela algodón blanco
(7, 4, N'Entrada', 80, N'Compra de tela de algodón blanco 100% natural', 0, 80, DATEADD(day, -20, SYSDATETIME()), 1, 1, DATEADD(day, -20, SYSDATETIME())),
(8, 4, N'Salida', 20, N'Salida para producción de camisetas básicas', 80, 60, DATEADD(day, -10, SYSDATETIME()), 2, 1, DATEADD(day, -10, SYSDATETIME())),

-- PR-005: Botones negros
(9, 5, N'Entrada', 1000, N'Compra de botones negros 15mm', 0, 1000, DATEADD(day, -23, SYSDATETIME()), 1, 1, DATEADD(day, -23, SYSDATETIME())),
(10, 5, N'Salida', 500, N'Salida para producción de camisas', 1000, 500, DATEADD(day, -18, SYSDATETIME()), 1, 1, DATEADD(day, -18, SYSDATETIME())),

-- PR-006: Cinta reflectiva
(11, 6, N'Entrada', 10, N'Compra de rollos de cinta reflectiva', 0, 10, DATEADD(day, -8, SYSDATETIME()), 1, 1, DATEADD(day, -8, SYSDATETIME())),
(12, 6, N'Salida', 2, N'Salida para uniformes de seguridad industrial', 10, 8, DATEADD(day, -3, SYSDATETIME()), 2, 1, DATEADD(day, -3, SYSDATETIME())),

-- PR-007: Vinil reflectivo (BAJO STOCK)
(13, 7, N'Entrada', 8, N'Entrada de rollos de vinil reflectivo', 0, 8, DATEADD(day, -13, SYSDATETIME()), 1, 1, DATEADD(day, -13, SYSDATETIME())),
(14, 7, N'Salida', 5, N'Salida para estampados reflectivos en chalecos', 8, 3, DATEADD(day, -2, SYSDATETIME()), 2, 1, DATEADD(day, -2, SYSDATETIME()));
SET IDENTITY_INSERT InventoryMovements OFF;
GO

SET IDENTITY_INSERT DashboardAlerts ON;
INSERT INTO DashboardAlerts (AlertId, Type, Description, RelatedEntityId, IsRead, isActive, createdAt) VALUES
(1, N'MaterialAgotado', N'Material agotado: Tela deportiva dry fit cool plus (PR-002)', 2, 0, 1, DATEADD(day, -8, SYSDATETIME())),
(2, N'StockBajo', N'Stock bajo: Tela licra - color negro (PR-003) - 15 metros disponibles', 3, 0, 1, DATEADD(day, -6, SYSDATETIME())),
(3, N'StockBajo', N'Stock bajo: Vinil reflectivo (PR-007) - 3 rollos disponibles', 7, 0, 1, DATEADD(day, -2, SYSDATETIME()));
SET IDENTITY_INSERT DashboardAlerts OFF;
GO

SET IDENTITY_INSERT Materiales ON;
INSERT INTO Materiales (MaterialId, Codigo, Nombre, Categoria, UnidadMedida, CantidadActual, StockMinimo, Ubicacion, Estado, FechaUltimoMovimiento, Observaciones, CreatedAt) VALUES
(1, N'MAT-001', N'Tela deportiva dry fit jik', N'Tela', N'm', 100, 20, N'Bodega 1 - Estante H1', N'ACTIVO', DATEADD(day, -13, SYSDATETIME()), N'Material de alta calidad para ropa deportiva', DATEADD(day, -18, SYSDATETIME())),
(2, N'MAT-002', N'Tela deportiva dry fit cool plus', N'Tela', N'm', 0, 20, N'Bodega 1 - Estante H1', N'AGOTADO', DATEADD(day, -8, SYSDATETIME()), N'Material agotado - requiere reposición urgente', DATEADD(day, -23, SYSDATETIME())),
(3, N'MAT-003', N'Tela licra - color negro', N'Tela', N'm', 15, 20, N'Bodega 1 - Estante H2', N'BAJO_STOCK', DATEADD(day, -6, SYSDATETIME()), N'Tela elástica para prendas ajustadas', DATEADD(day, -16, SYSDATETIME())),
(4, N'MAT-004', N'Tela algodón - color blanco', N'Tela', N'm', 60, 15, N'Bodega 2 - Estante A3', N'ACTIVO', DATEADD(day, -10, SYSDATETIME()), N'Algodón 100% natural', DATEADD(day, -20, SYSDATETIME())),
(5, N'MAT-005', N'Botones color negro', N'Accesorio', N'unidad', 500, 100, N'Bodega 2 - Estante B1', N'ACTIVO', DATEADD(day, -18, SYSDATETIME()), N'Botones de 4 agujeros, 15mm diámetro', DATEADD(day, -23, SYSDATETIME())),
(6, N'MAT-006', N'Cinta reflectiva', N'Insumo', N'rollo', 8, 5, N'Bodega 2 - Estante C2', N'ACTIVO', DATEADD(day, -3, SYSDATETIME()), N'Cinta reflectiva de alta visibilidad', DATEADD(day, -8, SYSDATETIME())),
(7, N'MAT-007', N'Vinil reflectivo', N'Insumo', N'rollo', 3, 5, N'Bodega 2 - Estante C2', N'BAJO_STOCK', DATEADD(day, -2, SYSDATETIME()), N'Vinil reflectivo para estampados', DATEADD(day, -13, SYSDATETIME()));
SET IDENTITY_INSERT Materiales OFF;
GO

SET IDENTITY_INSERT MovimientosInventario ON;
INSERT INTO MovimientosInventario (MovimientoId, MaterialId, Tipo, Cantidad, FechaMovimiento, Descripcion, EstadoAnterior, EstadoNuevo, CreatedAt) VALUES
-- PR-001: Tela deportiva dry fit jik
(1, 1, N'ENTRADA', 120, DATEADD(day, -18, SYSDATETIME()), N'Compra inicial de tela dry fit jik al proveedor TextilPro', NULL, N'ACTIVO', DATEADD(day, -18, SYSDATETIME())),
(2, 1, N'SALIDA', 20, DATEADD(day, -13, SYSDATETIME()), N'Salida para producción de uniformes deportivos - Orden #1001', NULL, NULL, DATEADD(day, -13, SYSDATETIME())),

-- PR-002: Tela deportiva dry fit cool plus
(3, 2, N'ENTRADA', 50, DATEADD(day, -23, SYSDATETIME()), N'Entrada inicial de tela cool plus', NULL, N'ACTIVO', DATEADD(day, -23, SYSDATETIME())),
(4, 2, N'SALIDA', 50, DATEADD(day, -8, SYSDATETIME()), N'Salida completa para producción urgente - Orden #1015', N'ACTIVO', N'AGOTADO', DATEADD(day, -8, SYSDATETIME())),
(5, 2, N'CAMBIO_ESTADO', 0, DATEADD(day, -8, SYSDATETIME()), N'Material agotado - se requiere reposición urgente', N'ACTIVO', N'AGOTADO', DATEADD(day, -8, SYSDATETIME())),

-- PR-003: Tela licra negro
(6, 3, N'ENTRADA', 40, DATEADD(day, -16, SYSDATETIME()), N'Compra de tela licra negra', NULL, N'ACTIVO', DATEADD(day, -16, SYSDATETIME())),
(7, 3, N'SALIDA', 25, DATEADD(day, -6, SYSDATETIME()), N'Salida para producción de leggings - Orden #1018', N'ACTIVO', N'BAJO_STOCK', DATEADD(day, -6, SYSDATETIME())),

-- PR-004: Tela algodón blanco
(8, 4, N'ENTRADA', 80, DATEADD(day, -20, SYSDATETIME()), N'Compra de tela de algodón blanco 100% natural', NULL, N'ACTIVO', DATEADD(day, -20, SYSDATETIME())),
(9, 4, N'SALIDA', 20, DATEADD(day, -10, SYSDATETIME()), N'Salida para producción de camisetas básicas', NULL, NULL, DATEADD(day, -10, SYSDATETIME())),

-- PR-005: Botones negro
(10, 5, N'ENTRADA', 1000, DATEADD(day, -23, SYSDATETIME()), N'Compra de botones negros 15mm', NULL, N'ACTIVO', DATEADD(day, -23, SYSDATETIME())),
(11, 5, N'SALIDA', 500, DATEADD(day, -18, SYSDATETIME()), N'Salida para producción de camisas - múltiples órdenes', NULL, NULL, DATEADD(day, -18, SYSDATETIME())),

-- PR-006: Cinta reflectiva
(12, 6, N'ENTRADA', 10, DATEADD(day, -8, SYSDATETIME()), N'Compra de rollos de cinta reflectiva', NULL, N'ACTIVO', DATEADD(day, -8, SYSDATETIME())),
(13, 6, N'SALIDA', 2, DATEADD(day, -3, SYSDATETIME()), N'Salida para uniformes de seguridad industrial', NULL, NULL, DATEADD(day, -3, SYSDATETIME())),

-- PR-007: Vinil reflectivo
(14, 7, N'ENTRADA', 8, DATEADD(day, -13, SYSDATETIME()), N'Entrada de rollos de vinil reflectivo', NULL, N'ACTIVO', DATEADD(day, -13, SYSDATETIME())),
(15, 7, N'SALIDA', 5, DATEADD(day, -2, SYSDATETIME()), N'Salida para estampados reflectivos en chalecos', N'ACTIVO', N'BAJO_STOCK', DATEADD(day, -2, SYSDATETIME())),
(16, 7, N'CAMBIO_ESTADO', 0, DATEADD(day, -2, SYSDATETIME()), N'Stock bajo - se recomienda realizar pedido pronto', N'ACTIVO', N'BAJO_STOCK', DATEADD(day, -2, SYSDATETIME()));
SET IDENTITY_INSERT MovimientosInventario OFF;
GO

INSERT INTO DashboardAlerts (Type, Description, RelatedEntityId, IsRead, isActive, createdAt) VALUES
(N'MaterialAgotado', N'Material agotado: Tela deportiva dry fit cool plus (Código: MAT-002)', 2, 0, 1, DATEADD(day, -8, SYSDATETIME())),
(N'StockBajo', N'Stock bajo: Tela licra - color negro (Código: MAT-003)', 3, 0, 1, DATEADD(day, -6, SYSDATETIME())),
(N'StockBajo', N'Stock bajo: Vinil reflectivo (Código: MAT-007)', 7, 0, 1, DATEADD(day, -2, SYSDATETIME()));
GO

PRINT 'Seed data completado exitosamente';
PRINT 'Datos insertados:';
PRINT '  Roles: 4';
PRINT '  Usuarios: 3';
PRINT '  Categorias: 4';
PRINT '  Productos: 7';
PRINT '  Movimientos inventario: 14';
PRINT '  Materiales: 7';
PRINT '  Movimientos de materiales: 16';
PRINT '  Alertas: 6';
GO
