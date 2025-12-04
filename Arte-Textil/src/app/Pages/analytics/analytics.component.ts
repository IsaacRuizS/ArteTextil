import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-analytics.component',
    standalone: true,
    imports: [FormsModule, CustomCurrencyPipe],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements AfterViewInit {

    // REFERENCIAS DE CANVAS
    @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('predictionChartCanvas') predictionChartCanvas!: ElementRef<HTMLCanvasElement>;

    lineChart: Chart | null = null;
    barChart: Chart | null = null;
    predictionChart: Chart | null = null;

    // FILTROS
    filtros = {
        fechaInicio: '',
        fechaFin: '',
        producto: '',
        categoria: '',
        tipo: 'tendencias'
    };

    productos = ['Camisa Azul', 'Pantalón Negro', 'Gorra Roja', 'Vestido Floral'];
    categorias = ['Camisas', 'Pantalones', 'Accesorios', 'Vestidos'];

    cotizaciones = [
        { fecha: '2025-01-12', producto: 'Camisa Azul', qty: 12, total: 8500 },
        { fecha: '2025-01-13', producto: 'Pantalón Negro', qty: 5, total: 12000 },
        { fecha: '2025-01-14', producto: 'Gorra Roja', qty: 20, total: 3000 },
    ];

    ngAfterViewInit() {
        this.loadLineChart();
        this.loadBarChart();
        this.loadPredictionChart();
    }

    // ⭐⭐⭐ CHARTS

    loadLineChart() {
        this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Cotizaciones por mes',
                    data: [50, 80, 65, 90, 120, 140],
                    fill: true,
                    tension: 0.4,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13,110,253,0.2)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }

    loadBarChart() {
        this.barChart = new Chart(this.barChartCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: ['Camisa', 'Pantalón', 'Gorra', 'Vestido'],
                datasets: [{
                    data: [120, 85, 200, 70],
                    label: 'Cantidad cotizada',
                    backgroundColor: ['#0d6efd', '#6610f2', '#198754', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    loadPredictionChart() {
        this.predictionChart = new Chart(this.predictionChartCanvas.nativeElement, {
            type: 'line',
            data: {
                labels: ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'],
                datasets: [
                    {
                        label: 'Histórico',
                        data: [140, 150, 160, 170, 180, 190],
                        borderColor: '#6c757d',
                        backgroundColor: 'rgba(108,117,125,0.2)',
                        borderDash: [5, 5],
                        tension: 0.3
                    },
                    {
                        label: 'Predicción',
                        data: [190, 210, 240, 260, 280, 300],
                        borderColor: '#198754',
                        backgroundColor: 'rgba(25,135,84,0.2)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                }
            }
        });
    }
}
