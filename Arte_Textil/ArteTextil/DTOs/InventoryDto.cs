namespace ArteTextil.DTOs;

public class InventoryMovementDto : DtoBase
{
    public int movementId { get; set; }
    public int productId { get; set; }
    public string type { get; set; } = null!; // Entrada, Salida, Ajuste
    public int quantity { get; set; }
    public string? reason { get; set; }
    public int previousStock { get; set; }
    public int newStock { get; set; }
    public int performedByUserId { get; set; }
    public bool isActive { get; set; }

    // Datos adicionales para visualización
    public string? productName { get; set; }
    public string? productCode { get; set; }
    public string? performedByUserName { get; set; }
}

public class InventoryItemDto
{
    public int productId { get; set; }
    public string productName { get; set; } = null!;
    public string? productCode { get; set; }
    public int stock { get; set; }
    public int minStock { get; set; }
    public decimal price { get; set; }
    public string? status { get; set; }
    public string? categoryName { get; set; }
    public bool isLowStock { get; set; }
}

public class InventoryReportDto
{
    public DateTime reportDate { get; set; }
    public int totalProducts { get; set; }
    public int lowStockProducts { get; set; }
    public int outOfStockProducts { get; set; }
    public decimal totalInventoryValue { get; set; }
    public List<InventoryItemDto> items { get; set; } = new List<InventoryItemDto>();
}

public class StockAlertDto
{
    public int productId { get; set; }
    public string productName { get; set; } = null!;
    public string? productCode { get; set; }
    public int currentStock { get; set; }
    public int minStock { get; set; }
    public string alertLevel { get; set; } = null!; // Crítico, Bajo, Normal
}

public class RegisterMovementDto
{
    public int productId { get; set; }
    public string type { get; set; } = null!; // Entrada, Salida, Ajuste
    public int quantity { get; set; }
    public string? reason { get; set; }
    public int performedByUserId { get; set; }
}
