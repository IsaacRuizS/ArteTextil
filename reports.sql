-- =========================================================
--  ARTETEXTIL — VISTAS PARA REPORTES
--  Tickets: #78, #77, #76, #70, #72
-- =========================================================


-- =========================================================
--  #78 — Reporte de inventario: rotación, consumo y nivel de stock
--
--  Rotación   = total salidas / stock actual  (veces que se "renovó" el stock)
--  Consumo    = suma de movimientos tipo Salida
--  Nivel      = stock actual vs. mínimo requerido
-- =========================================================
CREATE OR ALTER VIEW vw_ReporteInventario AS
SELECT
    p.ProductId,
    p.ProductCode                                           AS Codigo,
    p.Name                                                  AS Producto,
    c.Name                                                  AS Categoria,
    p.Stock                                                 AS StockActual,
    p.MinStock                                              AS StockMinimo,
    p.Price                                                 AS PrecioUnitario,

    -- Nivel de stock
    CASE
        WHEN p.Stock = 0                        THEN 'Agotado'
        WHEN p.Stock <= p.MinStock              THEN 'Crítico'
        WHEN p.Stock <= p.MinStock * 1.5        THEN 'Bajo'
        ELSE                                         'Normal'
    END                                                     AS NivelStock,

    -- Consumo: total de unidades que salieron (Salida)
    ISNULL(mov.TotalSalidas, 0)                             AS ConsumoTotal,

    -- Entradas totales (para contexto)
    ISNULL(mov.TotalEntradas, 0)                            AS EntradasTotal,

    -- Rotación = salidas / stock actual (evita división por cero)
    CASE
        WHEN p.Stock > 0
        THEN CAST(ISNULL(mov.TotalSalidas, 0) AS DECIMAL(18,2)) / p.Stock
        ELSE NULL
    END                                                     AS IndiceRotacion,

    -- Cantidad de movimientos de ajuste
    ISNULL(mov.TotalAjustes, 0)                             AS TotalAjustes,

    -- Estado del producto
    p.Status                                                AS EstadoProducto,
    p.isActive                                              AS Activo

FROM Products p
INNER JOIN Categories c
    ON c.CategoryId = p.CategoryId
    AND c.deletedAt IS NULL
LEFT JOIN (
    SELECT
        ProductId,
        SUM(CASE WHEN Type = 'Salida'  THEN Quantity ELSE 0 END) AS TotalSalidas,
        SUM(CASE WHEN Type = 'Entrada' THEN Quantity ELSE 0 END) AS TotalEntradas,
        SUM(CASE WHEN Type = 'Ajuste'  THEN Quantity ELSE 0 END) AS TotalAjustes
    FROM InventoryMovements
    WHERE deletedAt IS NULL
    GROUP BY ProductId
) mov ON mov.ProductId = p.ProductId
WHERE p.deletedAt IS NULL;
GO

-- =========================================================
--  #76 — Reporte de ventas por producto, cliente o período
--
--  Una fila por ítem de pedido.
--  Filtros sugeridos desde el backend: fechas, CustomerId, ProductId.
--  Se incluyen columnas suficientes para agrupar por cualquiera
--  de los tres ejes sin necesidad de vistas adicionales.
-- =========================================================
CREATE OR ALTER VIEW vw_ReporteVentas AS
SELECT
    o.OrderId,
    o.createdAt                                             AS FechaPedido,
    CAST(o.createdAt AS DATE)                               AS FechaPedidoFecha,
    YEAR(o.createdAt)                                       AS Anio,
    MONTH(o.createdAt)                                      AS Mes,
    FORMAT(o.createdAt, 'yyyy-MM')                          AS Periodo,

    -- Cliente
    cu.CustomerId,
    cu.FullName                                             AS Cliente,
    cu.Classification                                       AS ClasificacionCliente,
    cu.Email                                                AS EmailCliente,
    cu.Phone                                                AS TelefonoCliente,

    -- Estado del pedido
    o.Status                                                AS EstadoPedido,
    o.DeliveryDate                                          AS FechaEntrega,

    -- Producto
    p.ProductId,
    p.ProductCode                                           AS CodigoProducto,
    p.Name                                                  AS Producto,
    cat.Name                                                AS Categoria,

    -- Detalle de venta
    oi.OrderItemId,
    oi.Quantity                                             AS Cantidad,
    oi.Price                                                AS PrecioUnitario,
    oi.Quantity * oi.Price                                  AS Subtotal

FROM Orders o
INNER JOIN Customers cu
    ON cu.CustomerId = o.CustomerId
    AND cu.deletedAt IS NULL
INNER JOIN OrderItems oi
    ON oi.OrderId  = o.OrderId
    AND oi.deletedAt IS NULL
INNER JOIN Products p
    ON p.ProductId = oi.ProductId
    AND p.deletedAt IS NULL
INNER JOIN Categories cat
    ON cat.CategoryId = p.CategoryId
    AND cat.deletedAt IS NULL
WHERE o.deletedAt IS NULL;
GO


-- =========================================================
--  #70 — Reporte de pedidos finalizados por período o tipo de producto
--
--  Solo pedidos con Status = 'Entregado'.
--  Agrupable por período (Periodo) o categoría (Categoria).
-- =========================================================
CREATE OR ALTER VIEW vw_ReportePedidosFinalizados AS
SELECT
    o.OrderId,
    o.createdAt                                             AS FechaPedido,
    CAST(o.createdAt AS DATE)                               AS FechaPedidoFecha,
    YEAR(o.createdAt)                                       AS Anio,
    MONTH(o.createdAt)                                      AS Mes,
    FORMAT(o.createdAt, 'yyyy-MM')                          AS Periodo,
    o.DeliveryDate                                          AS FechaEntrega,

    -- Días entre pedido y entrega (eficiencia)
    DATEDIFF(DAY, o.createdAt, o.DeliveryDate)              AS DiasParaEntrega,

    -- Cliente
    cu.CustomerId,
    cu.FullName                                             AS Cliente,
    cu.Classification                                       AS ClasificacionCliente,

    -- Producto / tipo
    p.ProductId,
    p.ProductCode                                           AS CodigoProducto,
    p.Name                                                  AS Producto,
    cat.CategoryId,
    cat.Name                                                AS Categoria,

    -- Detalle
    oi.Quantity                                             AS Cantidad,
    oi.Price                                                AS PrecioUnitario,
    oi.Quantity * oi.Price                                  AS Subtotal

FROM Orders o
INNER JOIN Customers cu
    ON cu.CustomerId = o.CustomerId
    AND cu.deletedAt IS NULL
INNER JOIN OrderItems oi
    ON oi.OrderId  = o.OrderId
    AND oi.deletedAt IS NULL
INNER JOIN Products p
    ON p.ProductId = oi.ProductId
    AND p.deletedAt IS NULL
INNER JOIN Categories cat
    ON cat.CategoryId = p.CategoryId
    AND cat.deletedAt IS NULL
WHERE o.Status   = 'Entregado'
  AND o.deletedAt IS NULL;
GO
