using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryAttendance : IRepositoryBase<Attendance>
{
}

public class RepositoryAttendance
    : RepositoryBase<Attendance>, IRepositoryAttendance
{
    public RepositoryAttendance(ArteTextilDbContext context)
        : base(context)
    {
    }
}