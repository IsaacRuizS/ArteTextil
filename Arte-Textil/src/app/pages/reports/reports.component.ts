import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';
import {
    ApiReportsService,
    InventoryReport,
    SalesReport,
    CompletedOrdersReport
} from '../../services/api-reports.service';

type ActiveReport = 'inventory' | 'sales' | 'completed-orders' | null;

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule, CustomCurrencyPipe],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {

    showModal = signal(false);
    activeReport = signal<ActiveReport>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    inventoryData = signal<InventoryReport[]>([]);
    salesData = signal<SalesReport[]>([]);
    completedOrdersData = signal<CompletedOrdersReport[]>([]);

    // Paginación
    page = signal(1);
    readonly pageSize = 15;

    paginatedInventory  = computed(() => this._paginate(this.inventoryData()));
    paginatedSales      = computed(() => this._paginate(this.salesData()));
    paginatedOrders     = computed(() => this._paginate(this.completedOrdersData()));

    totalInventoryPages  = computed(() => this._totalPages(this.inventoryData().length));
    totalSalesPages      = computed(() => this._totalPages(this.salesData().length));
    totalOrdersPages     = computed(() => this._totalPages(this.completedOrdersData().length));

    // Filtros
    inventoryFilters = { stockLevel: '' };

    salesFilters = {
        startDate: '',
        endDate: '',
        customerId: null as number | null,
        productId: null as number | null
    };

    completedOrdersFilters = {
        startDate: '',
        endDate: '',
        categoryId: null as number | null
    };

    stockLevelOptions = ['Agotado', 'Crítico', 'Bajo', 'Normal'];

    constructor(private reportsService: ApiReportsService) { }

    // ── Generar reportes ────────────────────────────────────────────────────

    generateInventory() {
        this.activeReport.set('inventory');
        this.showModal.set(true);
        this.loading.set(true);
        this.error.set(null);
        this.inventoryData.set([]);
        this.page.set(1);

        this.reportsService.getInventory({
            stockLevel: this.inventoryFilters.stockLevel || undefined
        }).subscribe({
            next: data => { this.inventoryData.set(data); this.loading.set(false); },
            error: err => { this.error.set(err?.message || 'Error al generar el reporte.'); this.loading.set(false); }
        });
    }

    generateSales() {
        this.activeReport.set('sales');
        this.showModal.set(true);
        this.loading.set(true);
        this.error.set(null);
        this.salesData.set([]);
        this.page.set(1);

        this.reportsService.getSales({
            startDate: this.salesFilters.startDate || undefined,
            endDate: this.salesFilters.endDate || undefined,
            customerId: this.salesFilters.customerId || null,
            productId: this.salesFilters.productId || null
        }).subscribe({
            next: data => { this.salesData.set(data); this.loading.set(false); },
            error: err => { this.error.set(err?.message || 'Error al generar el reporte.'); this.loading.set(false); }
        });
    }

    generateCompletedOrders() {
        this.activeReport.set('completed-orders');
        this.showModal.set(true);
        this.loading.set(true);
        this.error.set(null);
        this.completedOrdersData.set([]);
        this.page.set(1);

        this.reportsService.getCompletedOrders({
            startDate: this.completedOrdersFilters.startDate || undefined,
            endDate: this.completedOrdersFilters.endDate || undefined,
            categoryId: this.completedOrdersFilters.categoryId || null
        }).subscribe({
            next: data => { this.completedOrdersData.set(data); this.loading.set(false); },
            error: err => { this.error.set(err?.message || 'Error al generar el reporte.'); this.loading.set(false); }
        });
    }

    // ── Modal ───────────────────────────────────────────────────────────────

    closeModal() {
        this.showModal.set(false);
        this.error.set(null);
    }

    get modalTitle(): string {
        switch (this.activeReport()) {
            case 'inventory':        return 'Reporte de Inventario';
            case 'sales':            return 'Reporte de Ventas';
            case 'completed-orders': return 'Reporte de Pedidos Finalizados';
            default:                 return '';
        }
    }

    // ── Paginación ──────────────────────────────────────────────────────────

    private _paginate<T>(data: T[]): T[] {
        const start = (this.page() - 1) * this.pageSize;
        return data.slice(start, start + this.pageSize);
    }

    private _totalPages(total: number): number {
        return Math.max(1, Math.ceil(total / this.pageSize));
    }

    prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }

    nextPage() {
        const total = this.activeReport() === 'inventory' ? this.totalInventoryPages()
                    : this.activeReport() === 'sales'     ? this.totalSalesPages()
                    : this.totalOrdersPages();
        if (this.page() < total) this.page.update(p => p + 1);
    }

    get currentTotalPages(): number {
        return this.activeReport() === 'inventory' ? this.totalInventoryPages()
             : this.activeReport() === 'sales'     ? this.totalSalesPages()
             : this.totalOrdersPages();
    }

    get currentTotalRecords(): number {
        return this.activeReport() === 'inventory' ? this.inventoryData().length
             : this.activeReport() === 'sales'     ? this.salesData().length
             : this.completedOrdersData().length;
    }

    // ── Export Excel ────────────────────────────────────────────────────────

    exportToExcel() {
        let rows: any[] = [];
        let filename = '';
        const date = new Date().toISOString().split('T')[0];

        switch (this.activeReport()) {
            case 'inventory':
                filename = `Reporte_Inventario_${date}.xlsx`;
                rows = this.inventoryData().map(r => ({
                    'Código':           r.code,
                    'Producto':         r.productName,
                    'Categoría':        r.category,
                    'Stock Actual':     r.currentStock,
                    'Stock Mínimo':     r.minStock,
                    'Nivel':            r.stockLevel,
                    'Consumo Total':    r.totalConsumption,
                    'Entradas':         r.totalEntries,
                    'Índice Rotación':  r.rotationIndex ?? '',
                    'Precio Unitario':  r.unitPrice,
                    'Estado Producto':  r.productStatus,
                }));
                break;
            case 'sales':
                filename = `Reporte_Ventas_${date}.xlsx`;
                rows = this.salesData().map(r => ({
                    '#Pedido':          r.orderId,
                    'Fecha':            new Date(r.orderDate).toLocaleDateString('es-CR'),
                    'Cliente':          r.customerName,
                    'Clasificación':    r.customerClassification ?? '',
                    'Estado Pedido':    r.orderStatus,
                    'Producto':         r.productName,
                    'Código Producto':  r.productCode,
                    'Categoría':        r.category,
                    'Cantidad':         r.quantity,
                    'Precio Unitario':  r.unitPrice,
                    'Subtotal':         r.subtotal,
                }));
                break;
            case 'completed-orders':
                filename = `Reporte_Pedidos_Finalizados_${date}.xlsx`;
                rows = this.completedOrdersData().map(r => ({
                    '#Pedido':          r.orderId,
                    'Fecha Pedido':     new Date(r.orderDate).toLocaleDateString('es-CR'),
                    'Fecha Entrega':    r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString('es-CR') : '',
                    'Días p/ Entrega':  r.daysToDelivery ?? '',
                    'Cliente':          r.customerName,
                    'Clasificación':    r.customerClassification ?? '',
                    'Producto':         r.productName,
                    'Código Producto':  r.productCode,
                    'Categoría':        r.category,
                    'Cantidad':         r.quantity,
                    'Precio Unitario':  r.unitPrice,
                    'Subtotal':         r.subtotal,
                }));
                break;
        }

        if (!rows.length) return;

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
        XLSX.writeFile(wb, filename);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    pageNumbers(total: number): number[] {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    stockLevelBadgeClass(level: string): string {
        switch (level) {
            case 'Agotado': return 'bg-danger';
            case 'Crítico': return 'bg-warning text-dark';
            case 'Bajo':    return 'bg-info text-dark';
            default:        return 'bg-success';
        }
    }
}
