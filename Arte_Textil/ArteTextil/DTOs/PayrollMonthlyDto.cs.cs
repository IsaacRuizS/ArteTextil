namespace ArteTextil.DTOs;

public class PayrollMonthlyDto
{
    public int payrollId { get; set; }

    public int userId { get; set; }

    public string userName { get; set; }

    public int year { get; set; }

    public int month { get; set; }

    public decimal baseSalary { get; set; }

    public decimal extras { get; set; }

    public decimal deductions { get; set; }

    public decimal total { get; set; }

    public int? approvedByUserId { get; set; }

    public bool isActive { get; set; }

    /// <summary>Fecha de generación de la planilla. La usa el listado para ordenar de más reciente a más antiguo.</summary>
    public DateTime createdAt { get; set; }
}
