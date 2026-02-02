using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryVacation : IRepositoryBase<Vacation>
{
}

public class RepositoryVacation
    : RepositoryBase<Vacation>, IRepositoryVacation
{
    public RepositoryVacation(ArteTextilDbContext context)
        : base(context)
    {
    }
}