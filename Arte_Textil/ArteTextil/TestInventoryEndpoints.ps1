# =====================================================
# SCRIPT DE PRUEBAS - ENDPOINTS DE INVENTARIO
# Arte Textil - Verificación de Requerimientos RF-03
# =====================================================

param(
    [string]$BaseUrl = "http://localhost:5045/api/inventory"
)

$ErrorActionPreference = "Continue"

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host " $Title" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    if ($Success) {
        Write-Host "[PASS] " -ForegroundColor Green -NoNewline
        Write-Host "$TestName" -ForegroundColor White
    } else {
        Write-Host "[FAIL] " -ForegroundColor Red -NoNewline
        Write-Host "$TestName - $Message" -ForegroundColor White
    }
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [bool]$ExpectSuccess = $true
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 5)
        }
        
        $response = Invoke-RestMethod @params
        
        if ($ExpectSuccess) {
            if ($response.success -eq $true) {
                Write-TestResult -TestName $Name -Success $true
                return @{ Success = $true; Data = $response }
            } else {
                Write-TestResult -TestName $Name -Success $false -Message $response.message
                return @{ Success = $false; Data = $response }
            }
        } else {
            # Esperábamos fallo pero tuvo éxito
            Write-TestResult -TestName $Name -Success $false -Message "Se esperaba error pero tuvo éxito"
            return @{ Success = $false; Data = $response }
        }
    }
    catch {
        if (-not $ExpectSuccess) {
            Write-TestResult -TestName $Name -Success $true
            return @{ Success = $true; Data = $null }
        } else {
            Write-TestResult -TestName $Name -Success $false -Message $_.Exception.Message
            return @{ Success = $false; Data = $null }
        }
    }
}

# =====================================================
# INICIO DE PRUEBAS
# =====================================================

Write-Host "`n"
Write-Host "###################################################" -ForegroundColor Yellow
Write-Host "#  PRUEBAS DE ENDPOINTS DE INVENTARIO - ARTE TEXTIL  #" -ForegroundColor Yellow
Write-Host "###################################################" -ForegroundColor Yellow
Write-Host "`nBase URL: $BaseUrl" -ForegroundColor Gray
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

$totalTests = 0
$passedTests = 0

# =====================================================
# RF-03-001: Visualizar inventario completo
# =====================================================
Write-TestHeader "RF-03-001: Visualizar inventario"

$result = Test-Endpoint -Name "GET /inventory - Obtener inventario completo" -Method "GET" -Url "$BaseUrl"
$totalTests++; if ($result.Success) { $passedTests++ }

if ($result.Data.data) {
    Write-Host "   -> Productos encontrados: $($result.Data.data.Count)" -ForegroundColor Gray
}

# =====================================================
# RF-03-002: Registrar movimientos de inventario
# =====================================================
Write-TestHeader "RF-03-002: Registrar movimientos"

# Primero obtener el stock actual
$inventoryResult = Invoke-RestMethod -Uri "$BaseUrl/availability/1" -Method GET -ErrorAction SilentlyContinue
$initialStock = if ($inventoryResult.data) { $inventoryResult.data.stock } else { 0 }

# Test Entrada
$body = @{
    productId = 1
    type = "Entrada"
    quantity = 5
    reason = "Test automatizado - Entrada"
    performedByUserId = 1
}
$result = Test-Endpoint -Name "POST /movement - Registrar ENTRADA (+5)" -Method "POST" -Url "$BaseUrl/movement" -Body $body
$totalTests++; if ($result.Success) { $passedTests++ }

# Test Salida
$body = @{
    productId = 1
    type = "Salida"
    quantity = 3
    reason = "Test automatizado - Salida"
    performedByUserId = 1
}
$result = Test-Endpoint -Name "POST /movement - Registrar SALIDA (-3)" -Method "POST" -Url "$BaseUrl/movement" -Body $body
$totalTests++; if ($result.Success) { $passedTests++ }

# Test Ajuste (restaurar stock inicial)
$body = @{
    productId = 1
    type = "Ajuste"
    quantity = $initialStock
    reason = "Test automatizado - Ajuste (restaurar)"
    performedByUserId = 1
}
$result = Test-Endpoint -Name "POST /movement - Registrar AJUSTE (=$initialStock)" -Method "POST" -Url "$BaseUrl/movement" -Body $body
$totalTests++; if ($result.Success) { $passedTests++ }

# =====================================================
# RF-03-003: Consultar disponibilidad
# =====================================================
Write-TestHeader "RF-03-003: Consultar disponibilidad"

$result = Test-Endpoint -Name "GET /availability/1 - Consultar producto 1" -Method "GET" -Url "$BaseUrl/availability/1"
$totalTests++; if ($result.Success) { $passedTests++ }

if ($result.Data.data) {
    $item = $result.Data.data
    Write-Host "   -> Producto: $($item.productName)" -ForegroundColor Gray
    Write-Host "   -> Stock: $($item.stock) / Mínimo: $($item.minStock)" -ForegroundColor Gray
    Write-Host "   -> Stock bajo: $($item.isLowStock)" -ForegroundColor Gray
}

$result = Test-Endpoint -Name "GET /availability/2 - Consultar producto 2" -Method "GET" -Url "$BaseUrl/availability/2"
$totalTests++; if ($result.Success) { $passedTests++ }

# =====================================================
# RF-03-004: Filtrar productos
# =====================================================
Write-TestHeader "RF-03-004: Filtrar inventario"

$result = Test-Endpoint -Name "GET /filter?search=Camisa - Búsqueda por texto" -Method "GET" -Url "$BaseUrl/filter?search=Camisa"
$totalTests++; if ($result.Success) { $passedTests++ }

$result = Test-Endpoint -Name "GET /filter?lowStockOnly=true - Solo stock bajo" -Method "GET" -Url "$BaseUrl/filter?lowStockOnly=true"
$totalTests++; if ($result.Success) { $passedTests++ }

$result = Test-Endpoint -Name "GET /filter?categoryId=1 - Por categoría" -Method "GET" -Url "$BaseUrl/filter?categoryId=1"
$totalTests++; if ($result.Success) { $passedTests++ }

# =====================================================
# RF-03-005: Generar reportes
# =====================================================
Write-TestHeader "RF-03-005: Generar reportes"

$result = Test-Endpoint -Name "GET /report - Generar reporte completo" -Method "GET" -Url "$BaseUrl/report"
$totalTests++; if ($result.Success) { $passedTests++ }

if ($result.Data.data) {
    $report = $result.Data.data
    Write-Host "   -> Total productos: $($report.totalProducts)" -ForegroundColor Gray
    Write-Host "   -> Stock bajo: $($report.lowStockProducts)" -ForegroundColor Gray
    Write-Host "   -> Agotados: $($report.outOfStockProducts)" -ForegroundColor Gray
    Write-Host "   -> Valor total: $($report.totalInventoryValue)" -ForegroundColor Gray
}

# =====================================================
# RF-03-006: Alertas stock bajo
# =====================================================
Write-TestHeader "RF-03-006: Alertas de stock bajo"

$result = Test-Endpoint -Name "GET /alerts - Obtener alertas" -Method "GET" -Url "$BaseUrl/alerts"
$totalTests++; if ($result.Success) { $passedTests++ }

if ($result.Data.data) {
    Write-Host "   -> Alertas encontradas: $($result.Data.data.Count)" -ForegroundColor Gray
}

# =====================================================
# EXTRA: Historial de movimientos
# =====================================================
Write-TestHeader "EXTRA: Historial de movimientos"

$result = Test-Endpoint -Name "GET /movements - Todos los movimientos" -Method "GET" -Url "$BaseUrl/movements"
$totalTests++; if ($result.Success) { $passedTests++ }

if ($result.Data.data) {
    Write-Host "   -> Movimientos registrados: $($result.Data.data.Count)" -ForegroundColor Gray
}

$result = Test-Endpoint -Name "GET /movements/1 - Historial producto 1" -Method "GET" -Url "$BaseUrl/movements/1"
$totalTests++; if ($result.Success) { $passedTests++ }

# =====================================================
# VALIDACIONES (casos de error esperados)
# =====================================================
Write-TestHeader "Validaciones de errores"

$body = @{
    productId = 1
    type = "Entrada"
    quantity = 0
    reason = "Test cantidad cero"
    performedByUserId = 1
}
$result = Test-Endpoint -Name "POST /movement - Cantidad 0 (debe fallar)" -Method "POST" -Url "$BaseUrl/movement" -Body $body -ExpectSuccess $false
$totalTests++; if ($result.Success) { $passedTests++ }

$body = @{
    productId = 1
    type = "TipoInvalido"
    quantity = 10
    reason = "Test tipo inválido"
    performedByUserId = 1
}
$result = Test-Endpoint -Name "POST /movement - Tipo inválido (debe fallar)" -Method "POST" -Url "$BaseUrl/movement" -Body $body -ExpectSuccess $false
$totalTests++; if ($result.Success) { $passedTests++ }

$result = Test-Endpoint -Name "GET /availability/99999 - Producto inexistente (debe fallar)" -Method "GET" -Url "$BaseUrl/availability/99999" -ExpectSuccess $false
$totalTests++; if ($result.Success) { $passedTests++ }

# =====================================================
# RESUMEN
# =====================================================
Write-Host "`n"
Write-Host "###################################################" -ForegroundColor Yellow
Write-Host "#                    RESUMEN                       #" -ForegroundColor Yellow
Write-Host "###################################################" -ForegroundColor Yellow

$percentage = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "`nTotal de pruebas: $totalTests" -ForegroundColor White
Write-Host "Pruebas exitosas: " -NoNewline -ForegroundColor White
Write-Host "$passedTests" -ForegroundColor Green
Write-Host "Pruebas fallidas: " -NoNewline -ForegroundColor White
Write-Host "$($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Porcentaje: " -NoNewline -ForegroundColor White

if ($percentage -eq 100) {
    Write-Host "$percentage%" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "$percentage%" -ForegroundColor Yellow
} else {
    Write-Host "$percentage%" -ForegroundColor Red
}

Write-Host "`n"

# Retornar código de salida basado en resultado
if ($passedTests -eq $totalTests) {
    Write-Host "*** TODAS LAS PRUEBAS PASARON ***" -ForegroundColor Green
    exit 0
} else {
    Write-Host "*** ALGUNAS PRUEBAS FALLARON ***" -ForegroundColor Red
    exit 1
}
