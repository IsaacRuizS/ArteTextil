import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

    generateInventory() {
        this.activeReport.set('inventory');
        this.showModal.set(true);
        this.loading.set(true);
        this.error.set(null);
        this.inventoryData.set([]);

        this.reportsService.getInventory({
            stockLevel: this.inventoryFilters.stockLevel || undefined
        }).subscribe({
            next: data => {
                this.inventoryData.set(data);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err?.message || 'Error al generar el reporte.');
                this.loading.set(false);
            }
        });
    }

    generateSales() {
        this.activeReport.set('sales');
        this.showModal.set(true);
        this.loading.set(true);
        this.error.set(null);
        this.salesData.set([]);

        this.reportsService.getSales({
            startDate: this.salesFilters.startDate || undefined,
            endDate: this.salesFilters.endDate || undefined,
            customerId: this.salesFilters.customerId || null,
            productId: this.salesFilters.productId || null
        }).subscribe({
            next: data => {
                this.salesData.set(data);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err?.message || 'Error al generar el reporte.');
                this.loading.set(false);
            }
        });
    }

    generateCompletedOrders() {
        this.activeReport.set('completed-orders');
        this.showModal.set(true);
        this.loading.set(true);
        this.error.set(null);
        this.completedOrdersData.set([]);

        this.reportsService.getCompletedOrders({
            startDate: this.completedOrdersFilters.startDate || undefined,
            endDate: this.completedOrdersFilters.endDate || undefined,
            categoryId: this.completedOrdersFilters.categoryId || null
        }).subscribe({
            next: data => {
                this.completedOrdersData.set(data);
                this.loading.set(false);
            },
            error: err => {
                this.error.set(err?.message || 'Error al generar el reporte.');
                this.loading.set(false);
            }
        });
    }

    closeModal() {
        this.showModal.set(false);
        this.error.set(null);
    }

    get modalTitle(): string {
        switch (this.activeReport()) {
            case 'inventory': return 'Reporte de Inventario';
            case 'sales': return 'Reporte de Ventas';
            case 'completed-orders': return 'Reporte de Pedidos Finalizados';
            default: return '';
        }
    }

    stockLevelBadgeClass(level: string): string {
        switch (level) {
            case 'Agotado': return 'bg-danger';
            case 'Crítico': return 'bg-warning text-dark';
            case 'Bajo': return 'bg-info text-dark';
            default: return 'bg-success';
        }
    }
}
