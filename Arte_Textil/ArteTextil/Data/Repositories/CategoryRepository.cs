using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryCategory : IRepositoryBase<Category>
{
}

public class RepositoryCategory : RepositoryBase<Category>, IRepositoryCategory
{
    public RepositoryCategory(ArteTextilDbContext context) : base(context)
    {
    }
}
