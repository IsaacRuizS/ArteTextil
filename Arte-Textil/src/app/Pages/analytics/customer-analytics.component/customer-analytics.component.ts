import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-customer-analytics',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './customer-analytics.component.html',
    styleUrls: ['./customer-analytics.component.scss']
})
export class CustomerAnalyticsComponent implements AfterViewInit {

    // ====== REFERENCIAS A LOS CANVAS ======
    @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef<HTMLCanvasElement>;

    barChart!: Chart;
    lineChart!: Chart;
    pieChart!: Chart;

    // ====== FILTROS ======
    filtros = {
        fechaInicio: '',
        fechaFin: '',
        clasificacion: '',
        actividad: '',
        producto: '',
        categoria: ''
    };

    productos = ['Camisa', 'Vestido', 'Short', 'Gorra'];
    categorias = ['Ropa', 'Accesorios', 'Uniformes'];

    aplicarFiltros() {
        console.log('Aplicando filtros', this.filtros);

        // EJEMPLO: actualizar el pieChart según filtros
        this.pieChart.data.datasets[0].data = [
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
        ];
        this.pieChart.update();
    }

    limpiarFiltros() {
        this.filtros = {
            fechaInicio: '',
            fechaFin: '',
            clasificacion: '',
            actividad: '',
            producto: '',
            categoria: ''
        };
    }

    // ====== MÉTRICAS ======
    metricCards = [
        { title: 'Clientes Frecuentes', value: 132 },
        { title: 'Clientes Nuevos', value: 45 },
        { title: 'Clientes Inactivos', value: 63 },
        { title: 'Cotizaciones del período', value: 211 },
    ];

    // ====== CHARTS (datos mock) ======
    barData = {
        labels: ['Frecuentes', 'Nuevos', 'Inactivos'],
        datasets: [{
            label: 'Cotizaciones',
            data: [120, 45, 30],
            backgroundColor: ['#0d6efd', '#198754', '#6c757d'],
        }]
    };

    lineData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
            label: 'Actividad',
            data: [30, 50, 45, 70, 90, 60],
            borderColor: '#0d6efd',
            tension: 0.4,
            fill: false
        }]
    };

    pieData = {
        labels: ['Frecuentes', 'Nuevos', 'Inactivos'],
        datasets: [{
            data: [60, 25, 15],
            backgroundColor: ['#198754', '#0d6efd', '#6c757d']
        }]
    };

    // ====== CREACIÓN DE GRÁFICAS ======
    ngAfterViewInit() {
        this.createBarChart();
        this.createLineChart();
        this.createPieChart();
    }

    createBarChart() {
        this.barChart = new Chart(this.barChartCanvas.nativeElement, {
            type: 'bar',
            data: this.barData,
            options: { responsive: true }
        });
    }

    createLineChart() {
        this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
            type: 'line',
            data: this.lineData,
            options: { responsive: true }
        });
    }

    createPieChart() {
        this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
            type: 'pie',
            data: this.pieData,
            options: { responsive: true }
        });
    }

    // ====== TABLA ======
    clientes = [
        { id: 1, nombre: 'Carlos Rojas', correo: 'carlos@example.com', telefono: '8888-8888', tipo: 'Frecuente', ultimaActividad: 'Hace 3 días', cotizaciones: 12 },
        { id: 2, nombre: 'María López', correo: 'maria@example.com', telefono: '7000-2211', tipo: 'Nuevo', ultimaActividad: 'Hoy', cotizaciones: 2 },
        { id: 3, nombre: 'Ana Mora', correo: 'ana@example.com', telefono: '6111-9823', tipo: 'Inactivo', ultimaActividad: 'Hace 2 meses', cotizaciones: 5 }
    ];

    cambiosRecientes = [
        { cliente: 'Carlos Rojas', detalle: 'Cambió de Nuevo → Frecuente', fecha: 'Hoy' },
        { cliente: 'Ana Mora', detalle: 'Cambió a Inactivo', fecha: 'Hace 10 días' },
        { cliente: 'Pedro Varela', detalle: 'Alta actividad (3 cotizaciones)', fecha: 'Ayer' }
    ];
}
