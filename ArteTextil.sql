/* =====================================================
   ROLES
===================================================== */
CREATE TABLE Roles (
    RoleId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL
);

/* =====================================================
   USERS
===================================================== */
CREATE TABLE Users (
    UserId INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(30),
    LastLoginAt DATETIME2,
    RoleId INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

/* =====================================================
   SUPPLIERS
===================================================== */
CREATE TABLE Suppliers (
    SupplierId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(30),
    Email NVARCHAR(150),
    ContactPerson NVARCHAR(150),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL
);

/* =====================================================
   CATEGORIES
===================================================== */
CREATE TABLE Categories (
    CategoryId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL
);

/* =====================================================
   PRODUCTS
===================================================== */
CREATE TABLE Products (
    ProductId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX),
    ProductCode NVARCHAR(50) NOT NULL UNIQUE,
    Price DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    MinStock INT NOT NULL DEFAULT 0,
    Status NVARCHAR(50) NOT NULL,
    CategoryId INT NOT NULL,
    SupplierId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId),
    CONSTRAINT FK_Products_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId)
);

/* =====================================================
   PRODUCT IMAGES
===================================================== */
CREATE TABLE ProductImages (
    ProductImageId INT IDENTITY PRIMARY KEY,
    ProductId INT NOT NULL,
    ImageUrl NVARCHAR(400) NOT NULL,
    IsMain BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

/* =====================================================
   INVENTORY
===================================================== */
CREATE TABLE InventoryMovements (
    MovementId INT IDENTITY PRIMARY KEY,
    ProductId INT NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    Reason NVARCHAR(255),
    PreviousStock INT NOT NULL,
    NewStock INT NOT NULL,
    PerformedByUserId INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_InventoryMovements_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    CONSTRAINT FK_InventoryMovements_User FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE InventoryStatusHistory (
    InventoryStatusHistoryId INT IDENTITY PRIMARY KEY,
    ProductId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_InventoryStatusHistory_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

/* =====================================================
   PROMOTIONS
===================================================== */
CREATE TABLE Promotions (
    PromotionId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Description NVARCHAR(255),
    DiscountPercent DECIMAL(5,2) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    ProductId INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Promotions_Product FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId),
);

CREATE TABLE PromotionHistory (
    PromotionHistoryId INT IDENTITY PRIMARY KEY,
    PromotionId INT NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    PerformedByUserId INT NOT NULL,
    Comment NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_PromotionHistory_Promotion FOREIGN KEY (PromotionId) REFERENCES Promotions(PromotionId),
    CONSTRAINT FK_PromotionHistory_User FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

/* =====================================================
   CUSTOMERS
===================================================== */
CREATE TABLE Customers (
    CustomerId INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(150),
    Phone NVARCHAR(30),
    Classification NVARCHAR(50),
    ActivityScore INT,
    LastQuoteDate DATE,
    UserId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Customers_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

/* =====================================================
   QUOTES
===================================================== */
CREATE TABLE Quotes (
    QuoteId INT IDENTITY PRIMARY KEY,
    CustomerId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    Total DECIMAL(18,2) NOT NULL,
    Notes NVARCHAR(MAX),
    CreatedByUserId INT NOT NULL,
    SentToEmail NVARCHAR(150),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Quotes_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId),
    CONSTRAINT FK_Quotes_Users FOREIGN KEY (CreatedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE QuoteItems (
    QuoteItemId INT IDENTITY PRIMARY KEY,
    QuoteId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_QuoteItems_Quotes FOREIGN KEY (QuoteId) REFERENCES Quotes(QuoteId),
    CONSTRAINT FK_QuoteItems_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

/* =====================================================
   CARTS
===================================================== */
CREATE TABLE Carts (
    CartId INT IDENTITY PRIMARY KEY,
    CustomerId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Carts_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

CREATE TABLE CartItems (
    CartItemId INT IDENTITY PRIMARY KEY,
    CartId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartId) REFERENCES Carts(CartId),
    CONSTRAINT FK_CartItems_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

/* =====================================================
   ORDERS
===================================================== */
CREATE TABLE Orders (
    OrderId INT IDENTITY PRIMARY KEY,
    CustomerId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    DeliveryDate DATE,
    Notes NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(CustomerId)
);

CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY PRIMARY KEY,
    OrderId INT NOT NULL,
    ProductId INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE OrderStatusHistory (
    OrderStatusHistoryId INT IDENTITY PRIMARY KEY,
    OrderId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    PerformedByUserId INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_OrderStatusHistory_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId),
    CONSTRAINT FK_OrderStatusHistory_Users FOREIGN KEY (PerformedByUserId) REFERENCES Users(UserId)
);

/* =====================================================
   PRODUCTION
===================================================== */
CREATE TABLE ProductionStages (
    StageId INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    OrderNumber INT NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL
);

CREATE TABLE ProductionOrders (
    ProductionOrderId INT IDENTITY PRIMARY KEY,
    ProductId INT NOT NULL,
    QuantityRequired INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    DueDate DATE,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_ProductionOrders_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
);

CREATE TABLE ProductionProgress (
    ProgressId INT IDENTITY PRIMARY KEY,
    ProductionOrderId INT NOT NULL,
    StageId INT NOT NULL,
    EmployeeId INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    Notes NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_ProductionProgress_Order FOREIGN KEY (ProductionOrderId) REFERENCES ProductionOrders(ProductionOrderId),
    CONSTRAINT FK_ProductionProgress_Stage FOREIGN KEY (StageId) REFERENCES ProductionStages(StageId),
    CONSTRAINT FK_ProductionProgress_User FOREIGN KEY (EmployeeId) REFERENCES Users(UserId)
);

/* =====================================================
   HR
===================================================== */
CREATE TABLE Attendance (
    AttendanceId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    CheckIn DATETIME2,
    CheckOut DATETIME2,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Attendance_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE Vacations (
    VacationId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    ApprovedByUserId INT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_Vacations_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT FK_Vacations_Approver FOREIGN KEY (ApprovedByUserId) REFERENCES Users(UserId)
);

CREATE TABLE PayrollAdjustments (
    AdjustmentId INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Reason NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_PayrollAdjustments_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

/* =====================================================
   DASHBOARD & LOGS
===================================================== */
CREATE TABLE DashboardAlerts (
    AlertId INT IDENTITY PRIMARY KEY,
    Type NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    RelatedEntityId INT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL
);

CREATE TABLE SystemLogs (
    LogId INT IDENTITY PRIMARY KEY,
    Action NVARCHAR(100) NOT NULL,
    UserId INT,
    TableName NVARCHAR(100),
    RecordId INT,
    PreviousValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NULL,
    DeletedAt DATETIME2 NULL,
    CONSTRAINT FK_SystemLogs_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
