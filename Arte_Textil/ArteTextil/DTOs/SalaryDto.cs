namespace ArteTextil.DTOs;

public class SalaryDto
{
    public int salaryId { get; set; }

    public int userId { get; set; }

    public string? userName { get; set; }

    public decimal baseSalary { get; set; }

    public bool isActive { get; set; }

    /// <summary>Fecha de registro. La usa el listado para ordenar de más reciente a más antiguo.</summary>
    public DateTime createdAt { get; set; }
}