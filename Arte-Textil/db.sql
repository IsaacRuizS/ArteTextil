-- =========================================================
--  SCRIPT DE CREACIÓN DE BASE DE DATOS - ArteTextilDB
--  Este script crea la base de datos y todas las tablas necesarias
-- =========================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'artetextil_')
BEGIN
    CREATE DATABASE artetextil_;
    PRINT 'Base de datos artetextil_ creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos artetextil_ ya existe.';
END
GO

USE artetextil_;
GO

PRINT 'Creando tablas en artetextil_';

-- =========================================================
--  ROLES Y USUARIOS
-- =========================================================
CREATE TABLE Roles (
    RoleId         INT IDENTITY(1,1) PRIMARY KEY,
    Name           NVARCHAR(100) NOT NULL,
    Description    NVARCHAR(255) NULL,
    isActive       BIT NOT NULL DEFAULT 1,
    createdAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt      DATETIME2 NULL,
    deletedAt      DATETIME2 NULL
);

CREATE TABLE Users (
    UserId         INT IDENTITY(1,1) PRIMARY KEY,
    FullName       NVARCHAR(150) NOT NULL,
    Email          NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash   NVARCHAR(255) NOT NULL,
    Phone          NVARCHAR(30) NULL,
    LastLoginAt    DATETIME2 NULL,
    RoleId         INT NOT NULL,
    isActive       BIT NOT NULL DEFAULT 1,
    createdAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt      DATETIME2 NULL,
    deletedAt      DATETIME2 NULL,
    CONSTRAINT FK_Users_Roles
        FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- =========================================================
--  CATEGORÍAS Y PRODUCTOS
-- =========================================================
CREATE TABLE Categories (
    CategoryId     INT IDENTITY(1,1) PRIMARY KEY,
    Name           NVARCHAR(150) NOT NULL,
    Description    NVARCHAR(255) NULL,
    isActive       BIT NOT NULL DEFAULT 1,
    createdAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt      DATETIME2 NULL,
    deletedAt      DATETIME2 NULL
);

CREATE TABLE Products (
    ProductId      INT IDENTITY(1,1) PRIMARY KEY,
    Name           NVARCHAR(150) NOT NULL,
    Description    NVARCHAR(MAX) NULL,
    ProductCode    NVARCHAR(50) NOT NULL,
    Price          DECIMAL(18,2) NOT NULL,
    Stock          INT NOT NULL DEFAULT 0,
    MinStock       INT NOT NULL DEFAULT 0,
    Location       NVARCHAR(200) NULL,
    Status         NVARCHAR(50) NOT NULL, -- Activo, Inactivo, Oculto
    CategoryId     INT NOT NULL,
    SupplierId     INT NULL,
    isActive       BIT NOT NULL DEFAULT 1,
    createdAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt      DATETIME2 NULL,
    deletedAt      DATETIME2 NULL,
    CONSTRAINT UQ_Products_ProductCode UNIQUE (ProductCode),
    CONSTRAINT FK_Products_Categories
        FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

CREATE TABLE ProductImages (
    ImageId        INT IDENTITY(1,1) PRIMARY KEY,
    ProductId      INT NOT NULL,
    ImageUrl       NVARCHAR(400) NOT NULL,
    IsMain         BIT NOT NULL DEFAULT 0,
    isActive       BIT NOT NULL DEFAULT 1,
    createdAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt      DATETIME2 NULL,
    deletedAt      DATETIME2 NULL,
    CONSTRAINT FK_ProductImages_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- =========================================================
--  INVENTARIO DE PRODUCTOS (SISTEMA ANTERIOR)
-- =========================================================
CREATE TABLE InventoryMovements (
    MovementId         INT IDENTITY(1,1) PRIMARY KEY,
    ProductId          INT NOT NULL,
    Type               NVARCHAR(50) NOT NULL, -- Entrada, Salida, Ajuste
    Quantity           INT NOT NULL,
    Observations       NVARCHAR(MAX) NULL,
    PreviousStock      INT NOT NULL,
    NewStock           INT NOT NULL,
    MovementDate       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    PerformedByUserId  INT NOT NULL,
    isActive           BIT NOT NULL DEFAULT 1,
    createdAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt          DATETIME2 NULL,
    deletedAt          DATETIME2 NULL,
    CONSTRAINT FK_InventoryMovements_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    CONSTRAINT FK_InventoryMovements_Users
        FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE InventoryStatusHistory (
    InventoryStatusHistoryId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId                INT NOT NULL,
    Status                   NVARCHAR(50) NOT NULL, -- Disponible, Agotado, Crítico, etc.
    Description              NVARCHAR(255) NULL,
    isActive                 BIT NOT NULL DEFAULT 1,
    createdAt                DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt                DATETIME2 NULL,
    deletedAt                DATETIME2 NULL,
    CONSTRAINT FK_InventoryStatusHistory_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- =========================================================
--  INVENTARIO DE MATERIALES (MÓDULO NUEVO)
-- =========================================================
CREATE TABLE Materiales (
    MaterialId              INT IDENTITY(1,1) PRIMARY KEY,
    Codigo                  NVARCHAR(50) NOT NULL UNIQUE,
    Nombre                  NVARCHAR(200) NOT NULL,
    Categoria               NVARCHAR(100) NOT NULL DEFAULT N'Tela',
    UnidadMedida            NVARCHAR(50) NOT NULL DEFAULT N'm',
    CantidadActual          DECIMAL(18,2) NOT NULL,
    Ubicacion               NVARCHAR(200) NULL,
    Estado                  NVARCHAR(50) NOT NULL DEFAULT N'ACTIVO',
    StockMinimo             DECIMAL(18,2) NOT NULL,
    FechaUltimoMovimiento   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Observaciones           NVARCHAR(MAX) NULL,
    CreatedAt               DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt               DATETIME2 NULL,
    DeletedAt               DATETIME2 NULL
);

CREATE INDEX IX_Materiales_Codigo ON Materiales(Codigo);
CREATE INDEX IX_Materiales_Estado ON Materiales(Estado);
CREATE INDEX IX_Materiales_Categoria ON Materiales(Categoria);

CREATE TABLE MovimientosInventario (
    MovimientoId        INT IDENTITY(1,1) PRIMARY KEY,
    MaterialId          INT NOT NULL,
    Tipo                NVARCHAR(50) NOT NULL,
    Cantidad            DECIMAL(18,2) NOT NULL,
    FechaMovimiento     DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Descripcion         NVARCHAR(MAX) NOT NULL,
    EstadoAnterior      NVARCHAR(50) NULL,
    EstadoNuevo         NVARCHAR(50) NULL,
    CreatedAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt           DATETIME2 NULL,
    DeletedAt           DATETIME2 NULL,
    CONSTRAINT FK_MovimientosInventario_Materiales FOREIGN KEY (MaterialId) 
        REFERENCES Materiales(MaterialId)
);

CREATE INDEX IX_MovimientosInventario_MaterialId ON MovimientosInventario(MaterialId);
CREATE INDEX IX_MovimientosInventario_FechaMovimiento ON MovimientosInventario(FechaMovimiento);
CREATE INDEX IX_MovimientosInventario_Tipo ON MovimientosInventario(Tipo);

-- =========================================================
--  PROMOCIONES
-- =========================================================
CREATE TABLE Promotions (
    PromotionId     INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(150) NOT NULL,
    Description     NVARCHAR(255) NULL,
    DiscountPercent DECIMAL(5,2) NOT NULL,
    StartDate       DATE NOT NULL,
    EndDate         DATE NOT NULL,
    Status          NVARCHAR(50) NOT NULL, -- Activa, Inactiva, Vencida
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL
);

CREATE TABLE PromotionProducts (
    PromotionProductId INT IDENTITY(1,1) PRIMARY KEY,
    PromotionId        INT NOT NULL,
    ProductId          INT NOT NULL,
    isActive           BIT NOT NULL DEFAULT 1,
    createdAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt          DATETIME2 NULL,
    deletedAt          DATETIME2 NULL,
    CONSTRAINT FK_PromotionProducts_Promotions
        FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId),
    CONSTRAINT FK_PromotionProducts_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE PromotionHistory (
    PromotionHistoryId INT IDENTITY(1,1) PRIMARY KEY,
    PromotionId        INT NOT NULL,
    Action             NVARCHAR(50) NOT NULL,   -- Create, Update, Deactivate...
    PerformedByUserId  INT NOT NULL,
    Comment            NVARCHAR(255) NULL,
    isActive           BIT NOT NULL DEFAULT 1,
    createdAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt          DATETIME2 NULL,
    deletedAt          DATETIME2 NULL,
    CONSTRAINT FK_PromotionHistory_Promotions
        FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId),
    CONSTRAINT FK_PromotionHistory_Users
        FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

-- =========================================================
--  CLIENTES, COTIZACIONES Y CARRITO
-- =========================================================
CREATE TABLE Customers (
    CustomerId      INT IDENTITY(1,1) PRIMARY KEY,
    FullName        NVARCHAR(150) NOT NULL,
    Email           NVARCHAR(150) NULL,
    Phone           NVARCHAR(30) NULL,
    Classification  NVARCHAR(50) NULL,  -- Frecuente, Nuevo, Inactivo
    ActivityScore   INT NULL,
    LastQuoteDate   DATE NULL,
    UserId          INT NULL,           -- Relación opcional al usuario de login
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_Customers_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE Quotes (
    QuoteId         INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT NOT NULL,
    Status          NVARCHAR(50) NOT NULL, -- Pendiente, Enviada, Aceptada, Rechazada
    Total           DECIMAL(18,2) NOT NULL DEFAULT 0,
    Notes           NVARCHAR(MAX) NULL,
    CreatedByUserId INT NOT NULL,
    SentToEmail     NVARCHAR(150) NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_Quotes_Customers
        FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    CONSTRAINT FK_Quotes_Users
        FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE QuoteItems (
    QuoteItemId     INT IDENTITY(1,1) PRIMARY KEY,
    QuoteId         INT NOT NULL,
    ProductId       INT NOT NULL,
    Quantity        INT NOT NULL,
    Price           DECIMAL(18,2) NOT NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_QuoteItems_Quotes
        FOREIGN KEY (QuoteId) REFERENCES Quotes(QuoteId),
    CONSTRAINT FK_QuoteItems_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE Carts (
    CartId          INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT NOT NULL,
    Status          NVARCHAR(50) NOT NULL, -- Activo, Checkout
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_Carts_Customers
        FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

CREATE TABLE CartItems (
    CartItemId      INT IDENTITY(1,1) PRIMARY KEY,
    CartId          INT NOT NULL,
    ProductId       INT NOT NULL,
    Quantity        INT NOT NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_CartItems_Carts
        FOREIGN KEY (CartId) REFERENCES Carts(CartId),
    CONSTRAINT FK_CartItems_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

-- =========================================================
--  PROVEEDORES
-- =========================================================
CREATE TABLE Suppliers (
    SupplierId      INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(150) NOT NULL,
    Phone           NVARCHAR(30) NULL,
    Email           NVARCHAR(150) NULL,
    ContactPerson   NVARCHAR(150) NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL
);

-- =========================================================
--  PRODUCCIÓN
-- =========================================================
CREATE TABLE ProductionStages (
    StageId         INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100) NOT NULL,   -- Corte, Confección, Estampado, Terminado
    OrderNumber     INT NOT NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL
);

CREATE TABLE ProductionOrders (
    ProductionOrderId   INT IDENTITY(1,1) PRIMARY KEY,
    ProductId           INT NOT NULL,
    QuantityRequired    INT NOT NULL,
    Status              NVARCHAR(50) NOT NULL, -- Pendiente, En producción, Finalizado
    DueDate             DATE NULL,
    isActive            BIT NOT NULL DEFAULT 1,
    createdAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt           DATETIME2 NULL,
    deletedAt           DATETIME2 NULL,
    CONSTRAINT FK_ProductionOrders_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE ProductionProgress (
    ProgressId          INT IDENTITY(1,1) PRIMARY KEY,
    ProductionOrderId   INT NOT NULL,
    StageId             INT NOT NULL,
    EmployeeId          INT NOT NULL,   -- UserId del empleado
    Status              NVARCHAR(50) NOT NULL, -- Pendiente, En progreso, Finalizado
    Notes               NVARCHAR(255) NULL,
    isActive            BIT NOT NULL DEFAULT 1,
    createdAt           DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt           DATETIME2 NULL,
    deletedAt           DATETIME2 NULL,
    CONSTRAINT FK_ProductionProgress_ProductionOrders
        FOREIGN KEY (ProductionOrderId) REFERENCES ProductionOrders(ProductionOrderId),
    CONSTRAINT FK_ProductionProgress_Stages
        FOREIGN KEY (StageId) REFERENCES ProductionStages(StageId),
    CONSTRAINT FK_ProductionProgress_Users
        FOREIGN KEY (EmployeeId) REFERENCES Users(UserId)
);

-- =========================================================
--  PEDIDOS / VENTAS
-- =========================================================
CREATE TABLE Orders (
    OrderId         INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT NOT NULL,
    Status          NVARCHAR(50) NOT NULL, -- Pendiente, En producción, Listo, Entregado
    DeliveryDate    DATE NULL,
    Notes           NVARCHAR(MAX) NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_Orders_Customers
        FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

CREATE TABLE OrderItems (
    OrderItemId     INT IDENTITY(1,1) PRIMARY KEY,
    OrderId         INT NOT NULL,
    ProductId       INT NOT NULL,
    Quantity        INT NOT NULL,
    Price           DECIMAL(18,2) NOT NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_OrderItems_Orders
        FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    CONSTRAINT FK_OrderItems_Products
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE OrderStatusHistory (
    OrderStatusHistoryId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId              INT NOT NULL,
    Status               NVARCHAR(50) NOT NULL,
    PerformedByUserId    INT NOT NULL,
    isActive             BIT NOT NULL DEFAULT 1,
    createdAt            DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt            DATETIME2 NULL,
    deletedAt            DATETIME2 NULL,
    CONSTRAINT FK_OrderStatusHistory_Orders
        FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    CONSTRAINT FK_OrderStatusHistory_Users
        FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

-- =========================================================
--  DASHBOARD / ALERTAS
-- =========================================================
CREATE TABLE DashboardAlerts (
    AlertId         INT IDENTITY(1,1) PRIMARY KEY,
    Type            NVARCHAR(50) NOT NULL,  -- StockBajo, PedidoAtrasado, PromocionPorVencer, etc.
    Description     NVARCHAR(255) NOT NULL,
    RelatedEntityId INT NULL,               -- Id del registro relacionado según el tipo
    IsRead          BIT NOT NULL DEFAULT 0,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL
);

-- =========================================================
--  RECURSOS HUMANOS
-- =========================================================
CREATE TABLE Attendance (
    AttendanceId    INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    CheckIn         DATETIME2 NULL,
    CheckOut        DATETIME2 NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_Attendance_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE Vacations (
    VacationId      INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    StartDate       DATE NOT NULL,
    EndDate         DATE NOT NULL,
    Status          NVARCHAR(50) NOT NULL,  -- Pendiente, Aprobada, Rechazada
    ApprovedByUserId INT NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_Vacations_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Vacations_ApprovedBy
        FOREIGN KEY (ApprovedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE PayrollAdjustments (
    AdjustmentId    INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    Amount          DECIMAL(18,2) NOT NULL,
    Type            NVARCHAR(50) NOT NULL, -- Extra, Rebajo
    Reason          NVARCHAR(255) NULL,
    isActive        BIT NOT NULL DEFAULT 1,
    createdAt       DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt       DATETIME2 NULL,
    deletedAt       DATETIME2 NULL,
    CONSTRAINT FK_PayrollAdjustments_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- =========================================================
--  AUDITORÍA
-- =========================================================
CREATE TABLE SystemLogs (
    LogId          INT IDENTITY(1,1) PRIMARY KEY,
    Action         NVARCHAR(100) NOT NULL,
    UserId         INT NULL,
    TableName      NVARCHAR(100) NULL,
    RecordId       INT NULL,
    PreviousValue  NVARCHAR(MAX) NULL,
    NewValue       NVARCHAR(MAX) NULL,
    isActive       BIT NOT NULL DEFAULT 1,
    createdAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updatedAt      DATETIME2 NULL,
    deletedAt      DATETIME2 NULL,
    CONSTRAINT FK_SystemLogs_Users
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
