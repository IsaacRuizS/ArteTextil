using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryOrderItem : IRepositoryBase<OrderItem>
{
}

public class RepositoryOrderItem : RepositoryBase<OrderItem>, IRepositoryOrderItem
{
    public RepositoryOrderItem(ArteTextilDbContext context) : base(context)
    {
    }
}