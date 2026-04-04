using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities;

public class SalesReportView
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

    public int CustomerId { get; set; }

    [Column("Cliente")]
    public string CustomerName { get; set; } = string.Empty;

    [Column("ClasificacionCliente")]
    public string CustomerClassification { get; set; } = string.Empty;

    [Column("EmailCliente")]
    public string CustomerEmail { get; set; } = string.Empty;

    [Column("TelefonoCliente")]
    public string CustomerPhone { get; set; } = string.Empty;

    [Column("EstadoPedido")]
    public string OrderStatus { get; set; } = string.Empty;

    [Column("FechaEntrega")]
    public DateTime? DeliveryDate { get; set; }

    public int ProductId { get; set; }

    [Column("CodigoProducto")]
    public string ProductCode { get; set; } = string.Empty;

    [Column("Producto")]
    public string ProductName { get; set; } = string.Empty;

    [Column("Categoria")]
    public string Category { get; set; } = string.Empty;

    public int OrderItemId { get; set; }

    [Column("Cantidad")]
    public int Quantity { get; set; }

    [Column("PrecioUnitario")]
    public decimal UnitPrice { get; set; }

    public decimal Subtotal { get; set; }
}
