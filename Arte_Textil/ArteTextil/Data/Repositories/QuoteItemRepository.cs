using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryQuoteItem : IRepositoryBase<QuoteItem>
{
}

public class RepositoryQuoteItem : RepositoryBase<QuoteItem>, IRepositoryQuoteItem
{
    public RepositoryQuoteItem(ArteTextilDbContext context) : base(context)
    {
    }
}
