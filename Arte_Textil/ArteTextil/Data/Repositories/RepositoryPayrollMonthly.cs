using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryPayrollMonthly : IRepositoryBase<PayrollMonthly>
{
    ArteTextilDbContext Context { get; }
}

public class RepositoryPayrollMonthly
    : RepositoryBase<PayrollMonthly>, IRepositoryPayrollMonthly
{
    public RepositoryPayrollMonthly(ArteTextilDbContext context)
        : base(context)
    {
    }

    public ArteTextilDbContext Context => _context;
}
