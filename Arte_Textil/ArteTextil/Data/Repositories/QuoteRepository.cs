using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryQuote : IRepositoryBase<Quote>
{
}

public class RepositoryQuote : RepositoryBase<Quote>, IRepositoryQuote
{
    public RepositoryQuote(ArteTextilDbContext context) : base(context)
    {
    }
}
