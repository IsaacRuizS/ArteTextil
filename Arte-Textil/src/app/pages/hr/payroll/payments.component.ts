import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiPaymentService } from '../../../services/api-payment.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';
import { PaymentModel } from '../../../shared/models/payment.model';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, CustomCurrencyPipe, FormsModule, NgxPaginationModule],
    templateUrl: './payments.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class PaymentsComponent implements OnInit {
    payments: PaymentModel[] = [];
    searchTerm: string = '';
    paymentsOrigin: PaymentModel[] = [];
    page = 1;

    // Filtro por rango de fecha de pago
    dateFrom = '';
    dateTo = '';

    constructor(private api: ApiPaymentService, private shared: SharedService, private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void { this.load(); }

    load() {
        this.shared.setLoading(true);
        this.api.getAll().subscribe({
            next: d => {
                this.paymentsOrigin = d;
                this.payments = d;
                this.shared.setLoading(false);
                this.cdr.markForCheck();
            }, error: () => {
                this.notificationService.error('Error al cargar los pagos');
                this.shared.setLoading(false);
            }
        });
    }

    onFilterChange() {
        this.page = 1;
    }

    clearFilters() {
        this.searchTerm = '';
        this.dateFrom = '';
        this.dateTo = '';
        this.page = 1;
    }

    get dateRangeError(): string | null {

        if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
            return 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".';
        }

        return null;
    }

    get filteredPayments(): PaymentModel[] {

        let data = [...this.paymentsOrigin];

        const term = this.searchTerm.toLowerCase().trim();

        if (term) {
            data = data.filter(p =>
                p.userName?.toLowerCase().includes(term) ||
                p.method?.toLowerCase().includes(term)
            );
        }

        // Las fechas se construyen en horario local para que el día
        // seleccionado sea el mismo que ve el usuario.
        if (this.dateFrom) {
            const from = new Date(`${this.dateFrom}T00:00:00`);
            data = data.filter(p => p.paymentDate && new Date(p.paymentDate) >= from);
        }

        if (this.dateTo) {
            const to = new Date(`${this.dateTo}T23:59:59`);
            data = data.filter(p => p.paymentDate && new Date(p.paymentDate) <= to);
        }

        return data;
    }

    get totalFiltered(): number {
        return this.filteredPayments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    }

    // Exportar la lista filtrada a CSV compatible con Excel
    onGenerateExcel() {

        const rows = this.filteredPayments;

        if (rows.length === 0) {
            this.notificationService.warning('No hay pagos que exportar con los filtros aplicados.');
            return;
        }

        const headers = ['Empleado', 'Monto', 'Fecha de pago', 'Método'];

        const body = rows.map(p => [
            p.userName ?? '',
            p.amount ?? 0,
            p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('es-CR') : '',
            p.method ?? ''
        ]);

        // Fila de total al final, para cuadrar contra contabilidad.
        body.push(['TOTAL', this.totalFiltered, '', '']);

        const csvContent = [headers, ...body]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        const BOM = '﻿';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pagos_planilla_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.notificationService.success(`Se exportaron ${rows.length} pago(s).`);
    }
}
