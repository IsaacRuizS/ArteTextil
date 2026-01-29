namespace ArteTextil.Helpers
{
    public enum ProducType : byte
    {
        HandMade = 1,
        Imported = 2,
    }

    public enum EstadoMaterial
    {
        ACTIVO,
        BAJO_STOCK,
        AGOTADO,
        INACTIVO
    }

    public enum TipoMovimientoInventario
    {
        ENTRADA,
        SALIDA,
        AJUSTE,
        CAMBIO_ESTADO
    }

    public enum CategoriaMaterial
    {
        Tela,
        Accesorio,
        Insumo
    }
}
