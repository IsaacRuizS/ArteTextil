using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryProduct : IRepositoryBase<Product>
{
}

public class RepositoryProduct : RepositoryBase<Product>, IRepositoryProduct
{
    public RepositoryProduct(ArteTextilDbContext context) : base(context)
    {
    }
}
