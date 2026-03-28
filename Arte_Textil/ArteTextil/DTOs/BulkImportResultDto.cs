namespace ArteTextil.DTOs;

public class BulkImportResultDto
{
    public int Imported { get; set; }
    public int Errors { get; set; }
    public List<string> ErrorMessages { get; set; } = new();
}
