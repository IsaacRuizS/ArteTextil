import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDemandService } from '../../../services/api-demand.service';
import { DemandModel } from '../../../shared/models/demand.model';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-demand',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './demand.component.html'
})
export class DemandComponent implements OnInit, AfterViewInit {

    data: DemandModel[] = [];
    chart: any;
    filter = '';

    constructor(private api: ApiDemandService) {}

    ngOnInit(): void {
        this.load();
    }

    ngAfterViewInit(): void {}

    load() {
        this.api.getDemand(this.filter).subscribe(res => {
            this.data = res;
            this.renderChart();
        });
    }

    renderChart() {

    if (this.chart) this.chart.destroy();

    const months = [...new Set(this.data.map(d => d.month))];

    const products = [...new Set(this.data.map(d => d.productName))];

    const datasets = products.map(product => {
        return {
            label: product,
            data: months.map(month => {
                const found = this.data.find(d =>
                    d.productName === product && d.month === month
                );
                return found ? found.totalQuantity : 0;
            })
        };
    });

    this.chart = new Chart('demandChart', {
        type: 'bar',
        data: {
            labels: months,
            datasets
        }
    });
}

    onFilter(event: any) {
        this.filter = event.target.value;
        this.load();
    }
}