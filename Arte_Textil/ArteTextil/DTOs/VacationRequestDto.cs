namespace ArteTextil.DTOs;

public class VacationRequestDto : DtoBase
{
    public int vacationRequestId { get; set; }
    public int userId { get; set; }
    public DateTime startDate { get; set; }
    public DateTime endDate { get; set; }
    public string status { get; set; } = "Pending";
    public int? ApprovedByUserId { get; set; }
    public bool IsActive { get; set; }
}