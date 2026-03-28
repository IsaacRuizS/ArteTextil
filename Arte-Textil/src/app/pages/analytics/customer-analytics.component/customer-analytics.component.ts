import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { CustomerModel } from '../../../shared/models/customer.model';
import { ApiCustomerService } from '../../../services/api-customer.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { ApiQuoteService } from '../../../services/api-quote.service';
import { QuoteModel } from '../../../shared/models/quote.model';
import { CustomersSmartListComponent } from '../../../components/customers-smart-list/customers-smart-list.component';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-customer-analytics',
    standalone: true,
    imports: [FormsModule, CustomersSmartListComponent],
    templateUrl: './customer-analytics.component.html',
    styleUrls: ['./customer-analytics.component.scss']
})
export class CustomerAnalyticsComponent implements OnInit {

    @ViewChild('barChartCanvas') barChartCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

    barChart!: Chart;
    lineChart!: Chart;

    filtros = {
        fechaInicio: '',
        fechaFin: '',
        clasificacion: '',
        actividad: '',
    };

    customers: CustomerModel[] = [];
    customersOrigins: CustomerModel[] = [];

    quotes: QuoteModel[] = [];
    quotesOrigins: QuoteModel[] = [];

    page = 1;

    productos: string[] = [];
    categorias: string[] = [];

    metricCards = [
        { title: 'Clientes Frecuentes', value: 0 },
        { title: 'Clientes Nuevos', value: 0 },
        { title: 'Clientes Premium', value: 0 },
        { title: 'Clientes Inactivos', value: 0 },
    ];

    readonly CLASSIFICATIONS = {
        NUEVO: 'Cliente Nuevo',
        FRECUENTE: 'Cliente Frecuente',
        PREMIUM: 'Cliente Premium',
        INACTIVO: 'Cliente Inactivo'
    };

    constructor(
        private apiCustomerService: ApiCustomerService,
        private apiQuoteService: ApiQuoteService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadCustomers();
    }

    loadCustomers() {
        this.sharedService.setLoading(true);

        this.apiCustomerService.getAll().subscribe({
            next: (customers: CustomerModel[]) => {
                this.customersOrigins = (customers || []).map(c => new CustomerModel(c));
                this.customers = [...this.customersOrigins];
                this.loadQuotes();
            },
            error: () => {
                this.notificationService.error('No se pudieron cargar los clientes. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }

    loadQuotes() {
        this.apiQuoteService.getAll().subscribe({
            next: (quotes: QuoteModel[]) => {
                this.quotesOrigins = (quotes || []).map(q => new QuoteModel(q));
                this.quotes = [...this.quotesOrigins];
                this.quotes = [...this.quotesOrigins];

                this.applyAnalytics();

                setTimeout(() => {
                    this.createChartsIfNeeded();
                });

                this.sharedService.setLoading(false);
                this.cdr.detectChanges();
            },
            error: () => {
                this.notificationService.error('No se pudieron cargar las cotizaciones. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }

    aplicarFiltros() {
        this.page = 1;
        this.applyAnalytics();
    }

    limpiarFiltros() {

        this.filtros = {
            fechaInicio: '',
            fechaFin: '',
            clasificacion: '',
            actividad: '',
        };

        this.page = 1;
        this.applyAnalytics();
    }

    downloadReport() {

        const data = this.buildReportData();

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

        const workbook: XLSX.WorkBook = {
            Sheets: { 'Reporte': worksheet },
            SheetNames: ['Reporte']
        };

        const excelBuffer: any = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array'
        });

        this.saveExcelFile(excelBuffer, 'Reporte_Clientes');
    }

    private buildReportData() {

        return this.customers.map(c => {

            const customerQuotes = this.quotes.filter(q => q.customerId === c.customerId);

            return {
                Nombre: c.fullName,
                Email: c.email,
                Teléfono: c.phone,
                Clasificación: c.classification,
                Activo: c.isActive ? 'Sí' : 'No',
                CantidadCotizaciones: customerQuotes.length,
                TotalCotizado: customerQuotes.reduce((sum, q) => sum + (q.total || 0), 0),
                ÚltimaActividad: c.lastQuoteDate
                    ? new Date(c.lastQuoteDate).toLocaleDateString('es-CR')
                    : 'Sin actividad'
            };
        });
    }

    private saveExcelFile(buffer: any, fileName: string) {

        const data: Blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
    }

    private applyAnalytics() {

        const filteredQuotes = this.filterQuotes(this.quotesOrigins);
        const filteredCustomers = this.filterCustomers(this.customersOrigins, filteredQuotes);

        this.quotes = filteredQuotes;
        this.customers = filteredCustomers;

        this.updateMetricCards(filteredCustomers, filteredQuotes);
        this.updateCharts(filteredCustomers, filteredQuotes);
    }

    private filterQuotes(quotes: QuoteModel[]): QuoteModel[] {

        return (quotes || []).filter(q => {

            const quoteDate = q.createdAt ? new Date(q.createdAt) : null;
            const startDate = this.filtros.fechaInicio ? new Date(this.filtros.fechaInicio) : null;
            const endDate = this.filtros.fechaFin ? new Date(this.filtros.fechaFin) : null;

            if (startDate && (!quoteDate || quoteDate < startDate)) return false;
            if (endDate && (!quoteDate || quoteDate > endDate)) return false;

            return true;
        });
    }

    private filterCustomers(customers: CustomerModel[], filteredQuotes: QuoteModel[]): CustomerModel[] {

        const map = new Map<number, QuoteModel[]>();

        filteredQuotes.forEach(q => {
            if (!q.customerId) return;
            if (!map.has(q.customerId)) map.set(q.customerId, []);
            map.get(q.customerId)!.push(q);
        });

        return (customers || []).filter(customer => {

            const customerQuotes = map.get(customer.customerId!) || [];

            if (this.filtros.clasificacion) {
                if (customer.classification !== this.filtros.clasificacion) return false;
            }

            if (this.filtros.actividad) {
                const days = Number(this.filtros.actividad);
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - days);

                const hasActivity = customerQuotes.some(q =>
                    q.createdAt && new Date(q.createdAt) >= limitDate
                );

                if (!hasActivity) return false;
            }

            const hasQuoteFilters =
                this.filtros.fechaInicio ||
                this.filtros.fechaFin;

            if (hasQuoteFilters && customerQuotes.length === 0) return false;

            return true;
        });
    }

    private updateMetricCards(customers: CustomerModel[], quotes: QuoteModel[]) {

        const frecuentes = customers.filter(c => c.classification === this.CLASSIFICATIONS.FRECUENTE).length;
        const nuevos = customers.filter(c => c.classification === this.CLASSIFICATIONS.NUEVO).length;
        const premium = customers.filter(c => c.classification === this.CLASSIFICATIONS.PREMIUM).length;
        const inactivos = customers.filter(c => c.classification === this.CLASSIFICATIONS.INACTIVO).length;

        this.metricCards = [
            { title: 'Clientes Frecuentes', value: frecuentes },
            { title: 'Clientes Nuevos', value: nuevos },
            { title: 'Clientes Premium', value: premium },
            { title: 'Clientes Inactivos', value: inactivos },
        ];
    }

    private updateCharts(customers: CustomerModel[], quotes: QuoteModel[]) {

        const data = {
            frecuentes: 0,
            nuevos: 0,
            premium: 0,
            inactivos: 0
        };

        const map = new Map<number, CustomerModel>();
        customers.forEach(c => map.set(c.customerId!, c));

        quotes.forEach(q => {
            const classification = map.get(q.customerId!)?.classification;

            if (classification === this.CLASSIFICATIONS.FRECUENTE) data.frecuentes++;
            else if (classification === this.CLASSIFICATIONS.NUEVO) data.nuevos++;
            else if (classification === this.CLASSIFICATIONS.PREMIUM) data.premium++;
            else if (classification === this.CLASSIFICATIONS.INACTIVO) data.inactivos++;
        });

        // ===== BAR CHART =====
        if (this.barChart) {
            this.barChart.data = {
                labels: ['Frecuentes', 'Nuevos', 'Premium', 'Inactivos'],
                datasets: [{
                    label: 'Cotizaciones',
                    data: [data.frecuentes, data.nuevos, data.premium, data.inactivos],
                    backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#6c757d'],
                }]
            };

            this.barChart.update();
        }

        const monthlyMap = new Map<string, number>();

        quotes.forEach(q => {
            const date = q.createdAt;
            if (!date) return;

            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
        });

        const sortedKeys = Array.from(monthlyMap.keys()).sort();

        const labels = sortedKeys.map(k => {
            const [y, m] = k.split('-').map(Number);
            return new Date(y, m - 1).toLocaleDateString('es-CR', {
                month: 'short',
                year: 'numeric'
            });
        });

        const values = sortedKeys.map(k => monthlyMap.get(k) || 0);

        if (this.lineChart) {
            this.lineChart.data = {
                labels,
                datasets: [{
                    label: 'Actividad',
                    data: values,
                    borderColor: '#0d6efd',
                    tension: 0.4,
                    fill: false
                }]
            };

            this.lineChart.update();
        }
    }

    private createBarChart() {
        this.barChart = new Chart(this.barChartCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    private createLineChart() {
        this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    private createChartsIfNeeded() {

        if (!this.barChart && this.barChartCanvas) {
            this.createBarChart();
        }

        if (!this.lineChart && this.lineChartCanvas) {
            this.createLineChart();
        }

        this.updateCharts(this.customers, this.quotes);
    }
}