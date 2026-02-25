using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryPayrollAdjustment : IRepositoryBase<PayrollAdjustment>
{
    ArteTextilDbContext Context { get; }
}

public class RepositoryPayrollAdjustment
    : RepositoryBase<PayrollAdjustment>, IRepositoryPayrollAdjustment
{
    public RepositoryPayrollAdjustment(ArteTextilDbContext context)
        : base(context)
    {
    }

    public ArteTextilDbContext Context => _context;
}