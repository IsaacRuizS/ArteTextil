using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryOrderStatusHistory : IRepositoryBase<OrderStatusHistory>
{
}

public class RepositoryOrderStatusHistory : RepositoryBase<OrderStatusHistory>, IRepositoryOrderStatusHistory
{
    public RepositoryOrderStatusHistory(ArteTextilDbContext context) : base(context)
    {
    }
}