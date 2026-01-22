using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryRol : IRepositoryBase<Rol>
{
}

public class RepositoryRol : RepositoryBase<Rol>, IRepositoryRol
{
    public RepositoryRol(ArteTextilDbContext context) : base(context)
    {
    }
}
