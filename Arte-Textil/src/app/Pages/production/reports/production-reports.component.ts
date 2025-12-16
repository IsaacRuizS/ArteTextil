import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionService, ProductionOrder } from '../../../services/production.service';

@Component({
    selector: 'app-production-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './production-reports.component.html',
    styleUrls: ['./production-reports.component.scss']
})
export class ProductionReportsComponent {
    productionService = inject(ProductionService);

    // Filter State
    startDate: string = new Date().toISOString().split('T')[0];
    endDate: string = new Date().toISOString().split('T')[0];
    productType: string = '';

    reportData: ProductionOrder[] = [];
    hasSearched = false;

    get products() {
        // Extract unique product types for filter
        const allOrders = this.productionService.orders();
        const names = allOrders.map(o => o.Product?.Name || '').filter(Boolean);
        return [...new Set(names)];
    }

    generateReport() {
        this.hasSearched = true;
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        this.reportData = this.productionService.getReportData(start, end, this.productType || null);
    }

    exportTo(format: 'PDF' | 'Excel') {
        alert(`Exportando reporte a ${format}... (Funcionalidad simulada)`);
    }
}
