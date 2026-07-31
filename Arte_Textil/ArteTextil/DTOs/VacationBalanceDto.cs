namespace ArteTextil.DTOs;

/// <summary>
/// Desglose del saldo de vacaciones de un colaborador.
/// Regla: se gana 1 día por cada mes completo trabajado desde el ingreso,
/// y se descuentan los días aprobados más los que están pendientes de resolución.
/// </summary>
public class VacationBalanceDto
{
    public int userId { get; set; }
    public string? userName { get; set; }
    public DateTime hireDate { get; set; }
    public int monthsWorked { get; set; }
    public int earnedDays { get; set; }
    public int approvedDays { get; set; }
    public int pendingDays { get; set; }
    public int availableDays { get; set; }
}
