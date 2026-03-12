using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryCartItem : IRepositoryBase<CartItem>
{
}

public class RepositoryCartItem : RepositoryBase<CartItem>, IRepositoryCartItem
{
    public RepositoryCartItem(ArteTextilDbContext context) : base(context)
    {
    }
}
