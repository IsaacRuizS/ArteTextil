using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositorySupplier : IRepositoryBase<Supplier>
{
}

public class RepositorySupplier : RepositoryBase<Supplier>, IRepositorySupplier
{
    public RepositorySupplier(ArteTextilDbContext context) : base(context)
    {
    }
}
