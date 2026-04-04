using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities;

public class InventoryReportView
{
    public int ProductId { get; set; }

    [Column("Codigo")]
    public string Code { get; set; } = string.Empty;

    [Column("Producto")]
    public string ProductName { get; set; } = string.Empty;

    [Column("Categoria")]
    public string Category { get; set; } = string.Empty;

    [Column("StockActual")]
    public int CurrentStock { get; set; }

    [Column("StockMinimo")]
    public int MinStock { get; set; }

    [Column("PrecioUnitario")]
    public decimal UnitPrice { get; set; }

    [Column("NivelStock")]
    public string StockLevel { get; set; } = string.Empty;

    [Column("ConsumoTotal")]
    public int TotalConsumption { get; set; }

    [Column("EntradasTotal")]
    public int TotalEntries { get; set; }

    [Column("IndiceRotacion")]
    public decimal? RotationIndex { get; set; }

    [Column("TotalAjustes")]
    public int TotalAdjustments { get; set; }

    [Column("EstadoProducto")]
    public string ProductStatus { get; set; } = string.Empty;

    [Column("Activo")]
    public bool IsActive { get; set; }
}
