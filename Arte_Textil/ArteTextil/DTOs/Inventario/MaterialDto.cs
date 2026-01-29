namespace ArteTextil.DTOs.Inventario
{
    public class MaterialDto
    {
        public int MaterialId { get; set; }
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string Categoria { get; set; } = null!;
        public string UnidadMedida { get; set; } = null!;
        public decimal CantidadActual { get; set; }
        public string? Ubicacion { get; set; }
        public string Estado { get; set; } = null!;
        public decimal StockMinimo { get; set; }
        public DateTime FechaUltimoMovimiento { get; set; }
        public string? Observaciones { get; set; }
    }

    public class CrearMaterialDto
    {
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string Categoria { get; set; } = "Tela";
        public string UnidadMedida { get; set; } = "m";
        public decimal CantidadActual { get; set; }
        public string? Ubicacion { get; set; }
        public decimal StockMinimo { get; set; }
        public string? Observaciones { get; set; }
    }

    public class ActualizarMaterialDto
    {
        public string? Nombre { get; set; }
        public string? Categoria { get; set; }
        public string? UnidadMedida { get; set; }
        public decimal? CantidadActual { get; set; }
        public string? Ubicacion { get; set; }
        public decimal? StockMinimo { get; set; }
        public string? Observaciones { get; set; }
        public string? Estado { get; set; }
    }

    public class CambiarEstadoMaterialDto
    {
        public string NuevoEstado { get; set; } = null!; // ACTIVO, BAJO_STOCK, AGOTADO, INACTIVO
        public string DescripcionMovimiento { get; set; } = null!;
    }
}
