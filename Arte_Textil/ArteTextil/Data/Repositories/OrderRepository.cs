using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryOrder : IRepositoryBase<Order>
{
}

public class RepositoryOrder : RepositoryBase<Order>, IRepositoryOrder
{
    public RepositoryOrder(ArteTextilDbContext context) : base(context)
    {
    }
}