import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiDemandService } from '../../../services/api-demand.service';
import { ApiProductService } from '../../../services/api-product.service';
import { DemandModel } from '../../../shared/models/demand.model';
import { ProductModel } from '../../../shared/models/product.model';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-demand',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './demand.component.html'
})
export class DemandComponent implements OnInit {

    @ViewChild('demandChart') demandChartRef!: ElementRef;

    data: DemandModel[] = [];
    products: ProductModel[] = [];
    chart: Chart | null = null;
    selectedProductId: number | null = null;
    loading = false;
    error = false;

    constructor(
        private api: ApiDemandService,
        private productApi: ApiProductService
    ) {}

    ngOnInit(): void {
        this.productApi.getAll().subscribe(res => this.products = res);
        this.load();
    }

    load() {
        this.loading = true;
        this.error = false;

        const product = this.products.find(p => p.productId === this.selectedProductId);
        const filter = product?.name ?? '';

        this.api.getDemand(filter).subscribe({
            next: res => {
                this.data = res;
                this.loading = false;
                setTimeout(() => this.renderChart(), 0);
            },
            error: () => {
                this.loading = false;
                this.error = true;
            }
        });
    }

    onProductChange() {
        this.load();
    }

    renderChart() {
        if (this.chart) this.chart.destroy();

        const months = [...new Set(this.data.map(d => d.month))];
        const productNames = [...new Set(this.data.map(d => d.productName))];

        const colors = [
            '#0d6efd', '#198754', '#dc3545', '#fd7e14',
            '#6610f2', '#20c997', '#0dcaf0', '#ffc107'
        ];

        const datasets = productNames.map((name, i) => {
            const color = colors[i % colors.length];
            const historical = this.data.filter(d => d.productName === name && !d.isForecast);
            const forecast   = this.data.filter(d => d.productName === name &&  d.isForecast);

            return [
                {
                    label: name,
                    data: months.map(m => {
                        const found = historical.find(d => d.month === m);
                        return found ? found.totalQuantity : null;
                    }),
                    borderColor: color,
                    backgroundColor: color + '33',
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.3,
                    spanGaps: false
                },
                {
                    label: `${name} (predicción)`,
                    data: months.map(m => {
                        const found = forecast.find(d => d.month === m);
                        return found ? found.totalQuantity : null;
                    }),
                    borderColor: color,
                    backgroundColor: color + '22',
                    borderWidth: 2,
                    borderDash: [6, 4],
                    pointRadius: 4,
                    tension: 0.3,
                    spanGaps: false
                }
            ];
        }).flat();

        this.chart = new Chart('demandChart', {
            type: 'line',
            data: { labels: months, datasets },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} unidades`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Cantidad' }
                    },
                    x: {
                        title: { display: true, text: 'Mes' }
                    }
                }
            }
        });
    }

    get tableData(): DemandModel[] {
        return this.data.filter(d => !d.isForecast);
    }

    get forecastData(): DemandModel[] {
        return this.data.filter(d => d.isForecast);
    }
}
