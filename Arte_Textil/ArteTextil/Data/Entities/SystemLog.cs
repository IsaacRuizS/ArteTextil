using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArteTextil.Data.Entities
{
    public class SystemLog : EntityBase
    {
        [Key]
        public int LogId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = null!;

        public int? UserId { get; set; }

        [MaxLength(100)]
        public string? TableName { get; set; }

        public int? RecordId { get; set; }

        public string? PreviousValue { get; set; }

        public string? NewValue { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
