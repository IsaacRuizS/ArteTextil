using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryPayrollAdjustment : IRepositoryBase<PayrollAdjustment>
{
}

public class RepositoryPayrollAdjustment
    : RepositoryBase<PayrollAdjustment>, IRepositoryPayrollAdjustment
{
    public RepositoryPayrollAdjustment(ArteTextilDbContext context)
        : base(context)
    {
    }
}