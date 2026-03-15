namespace ArteTextil.DTOs;

public class SalaryDto
{
    public int salaryId { get; set; }

    public int userId { get; set; }

    public string userName { get; set; }

    public decimal baseSalary { get; set; }

    public bool isActive { get; set; }
}