using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities;

public class CompletedOrdersReportView
{
    public int OrderId { get; set; }

    [Column("FechaPedido")]
    public DateTime OrderDate { get; set; }

    [Column("FechaPedidoFecha")]
    public DateTime OrderDateOnly { get; set; }

    [Column("Anio")]
    public int Year { get; set; }

    [Column("Mes")]
    public int Month { get; set; }

    [Column("Periodo")]
    public string Period { get; set; } = string.Empty;

    [Column("FechaEntrega")]
    public DateTime? DeliveryDate { get; set; }

    [Column("DiasParaEntrega")]
    public int? DaysToDelivery { get; set; }

    public int CustomerId { get; set; }

    [Column("Cliente")]
    public string CustomerName { get; set; } = string.Empty;

    [Column("ClasificacionCliente")]
    public string? CustomerClassification { get; set; }

    public int ProductId { get; set; }

    [Column("CodigoProducto")]
    public string ProductCode { get; set; } = string.Empty;

    [Column("Producto")]
    public string ProductName { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    [Column("Categoria")]
    public string Category { get; set; } = string.Empty;

    [Column("Cantidad")]
    public int Quantity { get; set; }

    [Column("PrecioUnitario")]
    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }
}
