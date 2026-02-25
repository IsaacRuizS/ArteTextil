using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRefreshTokenRepository : IRepositoryBase<RefreshToken>
{
}

public class RefreshTokenRepository : RepositoryBase<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(ArteTextilDbContext context) : base(context)
    {
    }
}
