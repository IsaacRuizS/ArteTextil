using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryPromotion : IRepositoryBase<Promotion>
{
}

public class RepositoryPromotion : RepositoryBase<Promotion>, IRepositoryPromotion
{
    public RepositoryPromotion(ArteTextilDbContext context) : base(context)
    {
    }
}
