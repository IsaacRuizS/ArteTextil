import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart } from 'chart.js/auto';

import { CustomCurrencyPipe } from '../../shared/pipes/crc-currency.pipe';
import { ApiQuoteService } from '../../services/api-quote.service';
import { ApiDemandService } from '../../services/api-demand.service';
import { ApiProductService } from '../../services/api-product.service';
import { ApiCategoryService } from '../../services/api-category.service';
import { SharedService } from '../../services/shared.service';
import { NotificationService } from '../../services/notification.service';
import { QuoteModel } from '../../shared/models/quote.model';
import { DemandModel } from '../../shared/models/demand.model';
import { QuotesSmartListComponent } from '../../components/quotes-smart-list/quotes-smart-list.component';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
    selector: 'app-analytics.component',
    standalone: true,
    imports: [CommonModule, FormsModule, CustomCurrencyPipe, QuotesSmartListComponent],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('predictionChartCanvas') predictionChartCanvas!: ElementRef<HTMLCanvasElement>;

    lineChart: Chart | null = null;
    barChart: Chart | null = null;
    predictionChart: Chart | null = null;

    // Datos crudos
    private demandData: DemandModel[] = [];
    private chartsReady = false;
    private dataReady = false;

    quotes: QuoteModel[] = [];
    quotesOrigins: QuoteModel[] = [];

    // Filtros
    filtros = { fechaInicio: '', fechaFin: '', producto: '', categoria: '' };
    productos: string[] = [];
    categorias: string[] = [];

    // KPIs
    kpi = {
        totalCotizaciones: 0,
        productoMasCotizado: '—',
        totalAcumulado: 0,
        tendencia: '—',
        tendenciaPositiva: true,
    };
    
    page = 1;

    constructor(
        private quoteApi: ApiQuoteService,
        private demandApi: ApiDemandService,
        private productApi: ApiProductService,
        private categoryApi: ApiCategoryService,
        private shared: SharedService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.shared.setLoading(true);
        forkJoin({
            quotes: this.quoteApi.getAll().pipe(catchError(() => of([]))),
            demand: this.demandApi.getDemand().pipe(catchError(() => of([]))),
            products: this.productApi.getAll().pipe(catchError(() => of([]))),
            categories: this.categoryApi.getAll().pipe(catchError(() => of([]))),
        }).subscribe({
            next: ({ quotes, demand, products, categories }) => {
                this.quotesOrigins = quotes;
                this.quotes = quotes;
                this.demandData = demand;
                this.productos = [...new Set(
                    products.filter(p => p.isActive).map(p => p.name)
                )];
                this.categorias = categories.filter(c => c.isActive).map(c => c.name);
                this.dataReady = true;
                this.shared.setLoading(false);
                this.tryRender();
            },
            error: () => {
                this.notificationService.error('Error al cargar los datos de analíticas. Intente de nuevo.');
                this.shared.setLoading(false);
            }
        });
    }

    ngAfterViewInit(): void {
        this.initCharts();
        this.chartsReady = true;
        this.tryRender();
    }

    private tryRender(): void {
        if (this.chartsReady && this.dataReady) {
            this.compute(this.quotesOrigins);
        }
    }

    // ── Filtros ──────────────────────────────────────────────────────────────

    aplicarFiltros(): void {
        let filtered = this.quotesOrigins;

        if (this.filtros.fechaInicio) {
            const from = new Date(this.filtros.fechaInicio);
            filtered = filtered.filter(q => q.createdAt && new Date(q.createdAt) >= from);
        }
        if (this.filtros.fechaFin) {
            const to = new Date(this.filtros.fechaFin);
            to.setHours(23, 59, 59);
            filtered = filtered.filter(q => q.createdAt && new Date(q.createdAt) <= to);
        }
        if (this.filtros.producto) {
            filtered = filtered.filter(q =>
                q.items?.some(i => i.productName === this.filtros.producto)
            );
        }

        this.compute(filtered);
    }

    limpiarFiltros(): void {
        this.filtros = { fechaInicio: '', fechaFin: '', producto: '', categoria: '' };
        this.compute(this.quotesOrigins);
    }

    // ── Cómputo de KPIs, tabla y gráficas ────────────────────────────────────

    private compute(quotes: QuoteModel[]): void {
        const active = quotes.filter(q => q.isActive);

        // KPIs
        this.kpi.totalCotizaciones = active.length;
        this.kpi.totalAcumulado = active.reduce((s, q) => s + (q.total ?? 0), 0);
        this.kpi.productoMasCotizado = this.topProduct(active);

        const { label, positive } = this.tendencia(active);
        this.kpi.tendencia = label;
        this.kpi.tendenciaPositiva = positive;

        this.quotes = [...active].sort(
            (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        );

        // Gráficas
        this.updateLineChart(active);
        this.updateBarChart(active);
        this.updatePredictionChart(this.demandData);
    }

    private topProduct(quotes: QuoteModel[]): string {
        const counts = new Map<string, number>();
        for (const q of quotes) {
            for (const item of q.items ?? []) {
                const name = item.productName ?? 'Desconocido';
                counts.set(name, (counts.get(name) ?? 0) + item.quantity);
            }
        }
        if (counts.size === 0) return '—';
        return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }

    private tendencia(quotes: QuoteModel[]): { label: string; positive: boolean } {
        const now = new Date();
        const last30 = new Date(now); last30.setDate(now.getDate() - 30);
        const prev30 = new Date(now); prev30.setDate(now.getDate() - 60);

        const recent = quotes.filter(q => q.createdAt && new Date(q.createdAt) >= last30).length;
        const before = quotes.filter(q => q.createdAt && new Date(q.createdAt) >= prev30 && new Date(q.createdAt) < last30).length;

        if (before === 0) return recent > 0
            ? { label: 'Positiva', positive: true }
            : { label: 'Sin datos', positive: false };

        const diff = ((recent - before) / before) * 100;
        if (diff > 5) return { label: `+${diff.toFixed(0)}% este mes`, positive: true };
        if (diff < -5) return { label: `${diff.toFixed(0)}% este mes`, positive: false };
        return { label: 'Estable', positive: true };
    }

    // ── Charts ────────────────────────────────────────────────────────────────

    private initCharts(): void {
        this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Cotizaciones por mes', data: [], fill: true, tension: 0.4, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.2)' }] },
            options: { responsive: true, plugins: { legend: { display: true } } }
        });

        this.barChart = new Chart(this.barChartCanvas.nativeElement, {
            type: 'bar',
            data: { labels: [], datasets: [{ label: 'Cantidad cotizada', data: [], backgroundColor: ['#0d6efd', '#6610f2', '#198754', '#dc3545', '#fd7e14', '#20c997'] }] },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        this.predictionChart = new Chart(this.predictionChartCanvas.nativeElement, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Histórico', data: [], borderColor: '#6c757d', backgroundColor: 'rgba(108,117,125,0.2)', tension: 0.3 },
                    { label: 'Predicción', data: [], borderColor: '#198754', backgroundColor: 'rgba(25,135,84,0.2)', fill: true, tension: 0.3, borderDash: [5, 5] }
                ]
            },
            options: { responsive: true, plugins: { legend: { display: true } } }
        });
    }

    private updateLineChart(quotes: QuoteModel[]): void {
        // Agrupar por mes (últimos 12 meses)
        const counts = new Map<string, number>();
        for (const q of quotes) {
            if (!q.createdAt) continue;
            const d = new Date(q.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const sorted = [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

        this.lineChart!.data.labels = sorted.map(([key]) => {
            const [, m] = key.split('-');
            return MONTH_NAMES[+m - 1];
        });
        this.lineChart!.data.datasets[0].data = sorted.map(([, v]) => v);
        this.lineChart!.update();
    }

    private updateBarChart(quotes: QuoteModel[]): void {
        const counts = new Map<string, number>();
        for (const q of quotes) {
            for (const item of q.items ?? []) {
                const name = item.productName ?? 'Desconocido';
                counts.set(name, (counts.get(name) ?? 0) + item.quantity);
            }
        }
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

        this.barChart!.data.labels = sorted.map(([name]) => name);
        this.barChart!.data.datasets[0].data = sorted.map(([, v]) => v);
        this.barChart!.update();
    }

    ngOnDestroy(): void {
        this.lineChart?.destroy();
        this.barChart?.destroy();
        this.predictionChart?.destroy();
    }

    private updatePredictionChart(demand: DemandModel[]): void {
        const historical = demand.filter(d => !d.isForecast)
            .sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthNumber - b.monthNumber);
        const forecast = demand.filter(d => d.isForecast)
            .sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthNumber - b.monthNumber);

        const allLabels = [...new Set([...historical, ...forecast].map(d => d.month))];

        this.predictionChart!.data.labels = allLabels;
        this.predictionChart!.data.datasets[0].data = allLabels.map(m => {
            const found = historical.find(d => d.month === m);
            return found ? found.totalQuantity : null as any;
        });
        this.predictionChart!.data.datasets[1].data = allLabels.map(m => {
            const found = forecast.find(d => d.month === m);
            return found ? found.totalQuantity : null as any;
        });
        this.predictionChart!.update();
    }
}
