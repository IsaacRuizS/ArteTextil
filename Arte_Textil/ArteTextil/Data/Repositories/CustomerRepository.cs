using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryCustomer : IRepositoryBase<Customer>
{
}

public class RepositoryCustomer : RepositoryBase<Customer>, IRepositoryCustomer
{
    public RepositoryCustomer(ArteTextilDbContext context) : base(context)
    {
    }
}
