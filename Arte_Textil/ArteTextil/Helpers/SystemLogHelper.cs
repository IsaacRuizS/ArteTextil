using ArteTextil.Data;
using ArteTextil.Data.Entities;

namespace ArteTextil.Helpers
{
    public interface ISystemLogHelper
    {
        Task LogCreate(string tableName, int recordId, string? newValue, int? userId = null);
        Task LogUpdate(string tableName, int recordId, string? previousValue, string? newValue, int? userId = null);
        Task LogDelete(string tableName, int recordId, string? previousValue, int? userId = null);
    }

    public class SystemLogHelper : ISystemLogHelper
    {
        private readonly ArteTextilDbContext _context;

        public SystemLogHelper(ArteTextilDbContext context)
        {
            _context = context;
        }

        private async Task LogChange(
            string action,
            string tableName,
            int recordId,
            string? previousValue,
            string? newValue,
            int? userId)
        {
            var log = new SystemLog
            {
                Action = action,
                TableName = tableName,
                RecordId = recordId,
                PreviousValue = previousValue,
                NewValue = newValue,
                UserId = userId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.SystemLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task LogCreate(string tableName, int recordId, string? newValue, int? userId = null)
        {
            await LogChange(
                action: "CREATE",
                tableName: tableName,
                recordId: recordId,
                previousValue: null,
                newValue: newValue,
                userId: userId
            );
        }

        public async Task LogUpdate(string tableName, int recordId, string? previousValue, string? newValue, int? userId = null)
        {
            await LogChange(
                action: "UPDATE",
                tableName: tableName,
                recordId: recordId,
                previousValue: previousValue,
                newValue: newValue,
                userId: userId
            );
        }

        public async Task LogDelete(string tableName, int recordId, string? previousValue, int? userId = null)
        {
            await LogChange(
                action: "DELETE",
                tableName: tableName,
                recordId: recordId,
                previousValue: previousValue,
                newValue: null,
                userId: userId
            );
        }
    }
}
