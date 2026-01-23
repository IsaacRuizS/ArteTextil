using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryProductImage : IRepositoryBase<ProductImage>
{
}

public class RepositoryProductImage : RepositoryBase<ProductImage>, IRepositoryProductImage
{
    public RepositoryProductImage(ArteTextilDbContext context) : base(context)
    {
    }
}
