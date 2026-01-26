using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryUser : IRepositoryBase<User>
{
}

public class RepositoryUser : RepositoryBase<User>, IRepositoryUser
{
    public RepositoryUser(ArteTextilDbContext context) : base(context)
    {
    }
}
