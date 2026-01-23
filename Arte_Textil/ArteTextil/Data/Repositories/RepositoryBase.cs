using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ArteTextil.Data.Repositories
{
    public interface IRepositoryBase<T> where T : class
    {
        Task<List<T>> GetAllAsync();
        Task<List<T>> GetAllAsync(Expression<Func<T, bool>> predicate);
        Task<T?> GetByIdAsync(int id);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        void Update(T entity);
        Task SaveAsync();
        IQueryable<T> Query();
    }

    public class RepositoryBase<T> : IRepositoryBase<T> where T : class
    {
        protected readonly ArteTextilDbContext _context;
        protected readonly DbSet<T> _set;

        public RepositoryBase(ArteTextilDbContext context)
        {
            _context = context;
            _set = _context.Set<T>();
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await _set.ToListAsync();
        }

        public async Task<List<T>> GetAllAsync(Expression<Func<T, bool>> predicate)
        {
            return await _set.Where(predicate).ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _set.FindAsync(id);
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _set.FirstOrDefaultAsync(predicate);
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            return await _set.AnyAsync(predicate);
        }

        public async Task AddAsync(T entity)
        {
            await _set.AddAsync(entity);
            await SaveAsync();
        }

        public void Update(T entity)
        {
            if (_context.Entry(entity).State == EntityState.Detached)
                _set.Attach(entity);

            _context.Entry(entity).State = EntityState.Modified;
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public IQueryable<T> Query()
        {
            return _set.AsQueryable();
        }
    }
}
