using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryPayment : IRepositoryBase<Payment>
{
    ArteTextilDbContext Context { get; }
}

public class RepositoryPayment
    : RepositoryBase<Payment>, IRepositoryPayment
{
    public RepositoryPayment(ArteTextilDbContext context)
        : base(context)
    {
    }

    public ArteTextilDbContext Context => _context;
}
