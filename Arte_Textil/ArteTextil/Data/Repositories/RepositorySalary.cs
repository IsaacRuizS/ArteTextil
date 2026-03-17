using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositorySalary : IRepositoryBase<Salary>
{
    ArteTextilDbContext Context { get; }
}

public class RepositorySalary
    : RepositoryBase<Salary>, IRepositorySalary
{
    public RepositorySalary(ArteTextilDbContext context)
        : base(context)
    {
    }

    public ArteTextilDbContext Context => _context;
}