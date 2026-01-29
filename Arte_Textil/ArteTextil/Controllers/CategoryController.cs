using ArteTextil.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArteTextil.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ArteTextilDbContext _context;

        public CategoryController(ArteTextilDbContext context)
        {
            _context = context;
        }

        // GET: api/category
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new
                {
                    categoryId = c.CategoryId,
                    name = c.Name,
                    description = c.Description,
                    isActive = c.IsActive
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/category/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .Where(c => c.CategoryId == id)
                .Select(c => new
                {
                    categoryId = c.CategoryId,
                    name = c.Name,
                    description = c.Description,
                    isActive = c.IsActive
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound(new { message = "Categoría no encontrada" });

            return Ok(category);
        }
    }
}

