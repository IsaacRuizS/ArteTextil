using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryVacation : IRepositoryBase<Vacation>
{
    ArteTextilDbContext Context { get; }

}

public class RepositoryVacation
    : RepositoryBase<Vacation>, IRepositoryVacation
{
    public RepositoryVacation(ArteTextilDbContext context)
        : base(context)
    {
    }

    public ArteTextilDbContext Context => _context;
}
