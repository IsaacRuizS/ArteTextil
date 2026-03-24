using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryAlert : IRepositoryBase<Alert>
{
}

public class RepositoryAlert : RepositoryBase<Alert>, IRepositoryAlert
{
    public RepositoryAlert(ArteTextilDbContext context) : base(context)
    {
    }
}
