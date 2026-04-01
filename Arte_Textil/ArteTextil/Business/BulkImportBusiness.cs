using ArteTextil.DTOs;
using ClosedXML.Excel;

namespace ArteTextil.Business;

public class BulkImportBusiness
{
    private readonly ProductBusiness _productBusiness;
    private readonly CustomerBusiness _customerBusiness;
    private readonly PromotionBusiness _promotionBusiness;
    private readonly UserBusiness _userBusiness;

    public BulkImportBusiness(
        ProductBusiness productBusiness,
        CustomerBusiness customerBusiness,
        PromotionBusiness promotionBusiness,
        UserBusiness userBusiness)
    {
        _productBusiness = productBusiness;
        _customerBusiness = customerBusiness;
        _promotionBusiness = promotionBusiness;
        _userBusiness = userBusiness;
    }

    // PRODUCTS
    // Expected columns: Nombre, Descripcion, Precio, Stock, StockMinimo, CategoriaId, ProveedorId
    public async Task<BulkImportResultDto> ImportProducts(Stream fileStream)
    {
        var result = new BulkImportResultDto();

        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.First();
        var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList();

        if (rows == null || rows.Count == 0)
            return result;

        foreach (var row in rows)
        {
            try
            {
                var dto = new ProductDto
                {
                    name = row.Cell(1).GetString().Trim(),
                    description = row.Cell(2).GetString().Trim(),
                    price = row.Cell(3).TryGetValue<decimal>(out var price) ? price : 0,
                    stock = row.Cell(4).TryGetValue<int>(out var stock) ? stock : 0,
                    minStock = row.Cell(5).TryGetValue<int>(out var minStock) ? minStock : 0,
                    categoryId = row.Cell(6).TryGetValue<int>(out var catId) ? catId : 0,
                    supplierId = row.Cell(7).TryGetValue<int>(out var supId) ? supId : 0,
                    productCode = $"IMP-{DateTime.UtcNow:yyyyMMddHHmmss}-{row.RowNumber()}",
                };

                var response = await _productBusiness.Create(dto);

                if (response.Success)
                    result.Imported++;
                else
                {
                    result.Errors++;
                    result.ErrorMessages.Add($"Fila {row.RowNumber()}: {response.Message}");
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                var detail = ex.InnerException?.Message ?? ex.Message;
                result.ErrorMessages.Add($"Fila {row.RowNumber()}: {detail}");
            }
        }

        return result;
    }

    // CUSTOMERS
    // Expected columns: NombreCompleto, Email, Telefono
    public async Task<BulkImportResultDto> ImportCustomers(Stream fileStream)
    {
        var result = new BulkImportResultDto();

        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.First();
        var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList();

        if (rows == null || rows.Count == 0)
            return result;

        foreach (var row in rows)
        {
            try
            {
                var dto = new CustomerDto
                {
                    fullName = row.Cell(1).GetString().Trim(),
                    email = row.Cell(2).GetString().Trim(),
                    phone = row.Cell(3).GetString().Trim(),
                    isActive = true
                };

                var response = await _customerBusiness.Create(dto);

                if (response.Success)
                    result.Imported++;
                else
                {
                    result.Errors++;
                    result.ErrorMessages.Add($"Fila {row.RowNumber()}: {response.Message}");
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                var detail = ex.InnerException?.Message ?? ex.Message;
                result.ErrorMessages.Add($"Fila {row.RowNumber()}: {detail}");
            }
        }

        return result;
    }

    // PROMOTIONS
    // Expected columns: Nombre, Descripcion, Porcentaje, FechaInicio, FechaFin, ProductoId
    public async Task<BulkImportResultDto> ImportPromotions(Stream fileStream)
    {
        var result = new BulkImportResultDto();

        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.First();
        var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList();

        if (rows == null || rows.Count == 0)
            return result;

        foreach (var row in rows)
        {
            try
            {
                DateTime? startDate = null;
                DateTime? endDate = null;

                if (row.Cell(4).TryGetValue<DateTime>(out var parsedStart))
                    startDate = parsedStart;
                else if (DateTime.TryParse(row.Cell(4).GetString(), out var parsedStartStr))
                    startDate = parsedStartStr;

                if (row.Cell(5).TryGetValue<DateTime>(out var parsedEnd))
                    endDate = parsedEnd;
                else if (DateTime.TryParse(row.Cell(5).GetString(), out var parsedEndStr))
                    endDate = parsedEndStr;

                // EndDate es NOT NULL en la BD, usar fallback si no se pudo parsear
                endDate ??= DateTime.UtcNow.AddMonths(1);

                var dto = new PromotionDto
                {
                    name = row.Cell(1).GetString().Trim(),
                    description = row.Cell(2).GetString().Trim(),
                    discountPercent = row.Cell(3).TryGetValue<decimal>(out var pct) ? pct : 0,
                    startDate = startDate,
                    endDate = endDate,
                    productId = row.Cell(6).TryGetValue<int>(out var productId) ? productId : 0,
                    isActive = true
                };

                var response = await _promotionBusiness.Create(dto);

                if (response.Success)
                    result.Imported++;
                else
                {
                    result.Errors++;
                    result.ErrorMessages.Add($"Fila {row.RowNumber()}: {response.Message}");
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                var detail = ex.InnerException?.Message ?? ex.Message;
                result.ErrorMessages.Add($"Fila {row.RowNumber()}: {detail}");
            }
        }

        return result;
    }

    // USERS
    // Expected columns: NombreCompleto, Email, Telefono, Contrasena, RolId
    public async Task<BulkImportResultDto> ImportUsers(Stream fileStream)
    {
        var result = new BulkImportResultDto();

        using var workbook = new XLWorkbook(fileStream);
        var worksheet = workbook.Worksheets.First();
        var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1).ToList();

        if (rows == null || rows.Count == 0)
            return result;

        foreach (var row in rows)
        {
            try
            {
                var dto = new UserDto
                {
                    fullName = row.Cell(1).GetString().Trim(),
                    email = row.Cell(2).GetString().Trim(),
                    phone = row.Cell(3).GetString().Trim(),
                    passwordHash = row.Cell(4).GetString().Trim(),
                    roleId = row.Cell(5).TryGetValue<int>(out var roleId) ? roleId : 1,
                    lastLoginAt = null,
                    isActive = true
                };

                var response = await _userBusiness.Create(dto);

                if (response.Success)
                    result.Imported++;
                else
                {
                    result.Errors++;
                    result.ErrorMessages.Add($"Fila {row.RowNumber()}: {response.Message}");
                }
            }
            catch (Exception ex)
            {
                result.Errors++;
                var detail = ex.InnerException?.Message ?? ex.Message;
                result.ErrorMessages.Add($"Fila {row.RowNumber()}: {detail}");
            }
        }

        return result;
    }
}
