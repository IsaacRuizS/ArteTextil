using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryCart : IRepositoryBase<Cart>
{
}

public class RepositoryCart : RepositoryBase<Cart>, IRepositoryCart
{
    public RepositoryCart(ArteTextilDbContext context) : base(context)
    {
    }
}
