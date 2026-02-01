using ArteTextil.Data.Entities;

namespace ArteTextil.Data.Repositories;

public interface IRepositoryInventoryMovement : IRepositoryBase<InventoryMovement>
{
}

public class RepositoryInventoryMovement : RepositoryBase<InventoryMovement>, IRepositoryInventoryMovement
{
    public RepositoryInventoryMovement(ArteTextilDbContext context) : base(context)
    {
    }
}
