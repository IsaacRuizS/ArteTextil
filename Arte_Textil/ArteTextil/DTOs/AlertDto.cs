namespace ArteTextil.DTOs;

public class AlertDto : DtoBase
{
    public long alertId { get; set; }
    public string? title { get; set; }
    public string? message { get; set; }
    public bool isRead { get; set; }

    // Stock, Promocion u Orden
    public string? type { get; set; }

    // Alta, Media o Baja
    public string? severity { get; set; }

    public AlertDetailDto? detail { get; set; }
}

public class AlertDetailDto
{
    public int count { get; set; }
    public List<AlertItemDto> items { get; set; } = new();
}

// Lo que el job guarda serializado en Alert.Message, para no agregar columnas.
public class AlertPayloadDto
{
    // Versión del formato
    public int v { get; set; } = 1;

    public string type { get; set; } = string.Empty;
    public string severity { get; set; } = string.Empty;
    public string summary { get; set; } = string.Empty;

    public List<AlertItemDto> items { get; set; } = new();
}

public class AlertItemDto
{
    public int entityId { get; set; }

    // "Gorra", "Orden #26"
    public string label { get; set; } = string.Empty;

    // "stock 2 · reservado 1 · mínimo 10"
    public string detail { get; set; } = string.Empty;

    // Stock en cero, orden vencida
    public bool critical { get; set; }
}