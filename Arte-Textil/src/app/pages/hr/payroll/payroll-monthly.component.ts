import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';

import { ApiPayrollService } from '../../../services/api-payroll.service';
import { ApiPaymentService } from '../../../services/api-payment.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';

import { PayrollMonthlyModel } from '../../../shared/models/payroll-monthly.model';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
    selector: 'app-payroll-monthly',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, CustomCurrencyPipe, NgxPaginationModule],
    templateUrl: './payroll-monthly.component.html',
    styleUrls: ['./payroll-monthly.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [FormBuilder]
})
export class PayrollMonthlyComponent implements OnInit {

    payrolls: PayrollMonthlyModel[] = [];
    payrollsOrigin: PayrollMonthlyModel[] = [];
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' | 'warning' = 'success';

    page = 1;

    form: FormGroup;

    // Modal
    showMessageModal = false;
    messageText = '';
    modalType: 'success' | 'error' = 'success';

    showConfirmPaymentModal = false;
    selectedPayroll: PayrollMonthlyModel | null = null;
    paymentMethod = 'Transferencia';
    showPaymentModal = false;
    generating = false;
    errorList: string[] = [];
    searchTerm: string = '';
    statusFilter: string = 'all'; // all | approved | pending

    totalPayroll = 0;

    constructor(
        private api: ApiPayrollService,
        private payments: ApiPaymentService,
        private shared: SharedService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private notificationService: NotificationService
    ) {
        this.form = this.fb.group({
            month: ['']
        });
    }

    ngOnInit(): void { }

    // Modal
    showModal(message: string, type: 'success' | 'error' = 'success') {
        this.messageText = message;
        this.modalType = type;
        this.showMessageModal = true;
    }

    closeModal() {
        this.showMessageModal = false;
    }

    // Carga de datos
    onMonthChange() {

        const month = this.form.get('month')?.value;
        if (!month) return;

        this.searchTerm = '';
        this.statusFilter = 'all';
        this.page = 1;

        this.load(month);
    }

    load(period?: string) {

        this.shared.setLoading(true);

        this.api.getAll().subscribe({

            next: (data) => {

                this.payrollsOrigin = data;

                if (!period) {
                    this.payrolls = data;
                } else {

                    const [year, month] = period.split('-');

                    const y = Number(year);
                    const m = Number(month);

                    this.payrolls = data.filter(p =>
                        p.year === y && p.month === m
                    );
                }

                this.totalPayroll = this.payrolls
                    .reduce((sum, p) => sum + p.total, 0);

                this.shared.setLoading(false);
                this.cdr.markForCheck();
            }
        });
    }

    generate() {

        const monthValue = this.form.get('month')?.value;

        if (!monthValue) {
            this.showModal("Seleccione un mes primero", 'error');
            return;
        }

        const [year, month] = monthValue.split('-');

        this.generating = true;
        this.shared.setLoading(true);

        this.api.generate(year, month).subscribe({

            next: (res: any) => {

                this.generating = false;
                this.shared.setLoading(false);

                if (res.success) {
                    this.handleMessages(res.message, 'success');
                } else {
                    this.handleMessages(res.message, 'warning');
                }

                this.load(monthValue);
            },

            error: (err) => {

                this.generating = false;
                const msg = err?.error?.message || 'Error generando planilla';
                const type = err?.error?.success === false ? 'warning' : 'error';
                this.handleMessages(msg, type);
                this.shared.setLoading(false);
            }
        });
    }

    // Aprobar
    approve(p: PayrollMonthlyModel) {

        this.api.approve(p.payrollId).subscribe({

            next: (res: any) => {

                this.showModal("Nómina aprobada correctamente", 'success');

                const month = this.form.get('month')?.value;
                if (month) this.load(month);
            }
        });
    }

    // Modal de pago
    registerPayment(p: PayrollMonthlyModel) {
        this.selectedPayroll = p;
        this.showConfirmPaymentModal = true;
    }

    openPaymentModal(p: PayrollMonthlyModel) {
        this.selectedPayroll = p;
        this.paymentMethod = 'Transferencia';
        this.showPaymentModal = true;
    }

    openConfirmPaymentModal() {
        this.showPaymentModal = false;
        this.showConfirmPaymentModal = true;
    }

    // Confirmar el pago
    confirmPayment() {

        if (!this.selectedPayroll) return;

        this.api.process(
            this.selectedPayroll.payrollId,
            this.paymentMethod
        ).subscribe({

            next: (res: any) => {

                this.showConfirmPaymentModal = false;
                this.showPaymentModal = false;

                if (res.success) {
                    this.handleMessages(res.message, 'success');
                } else {
                    this.handleMessages(res.message, 'warning');
                }

                const month = this.form.get('month')?.value;
                if (month) this.load(month);
            },

            error: (err) => {

                this.showConfirmPaymentModal = false;
                this.showPaymentModal = false;

                const msg = err?.error?.message || 'Error al procesar pago';

                this.handleMessages(msg, 'error');
            }
        });
    }

    // filtro
    get filteredPayrolls() {

        let data = this.payrolls;

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase().trim();

            data = data.filter(p =>
                p.userName?.toLowerCase().includes(term)
            );
        }

        if (this.statusFilter === 'approved') {
            data = data.filter(p => p.approvedByUserId);
        }

        if (this.statusFilter === 'pending') {
            data = data.filter(p => !p.approvedByUserId);
        }

        return data;
    }


    // toast para advertencias
    showToastMessage(message: string, type: 'success' | 'warning' | 'error') {

        if (message?.toLowerCase().includes('no tiene salario')) {
            return;
        }

        this.errorList = message.split('|').map(x => x.trim()).filter(x => x);

        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;

        setTimeout(() => {
            this.showToast = false;
        }, 3500);
    }


    // modal para advertencias
    handleMessages(message: string, type: 'success' | 'warning' | 'error') {

        this.errorList = message.split('|').map(x => x.trim()).filter(x => x);

        if (this.errorList.length <= 2) {
            this.toastMessage = message;
            this.toastType = type;
            this.showToast = true;

            setTimeout(() => {
                this.showToast = false;
            }, 3500);
        }

        else {
            this.messageText = message;
            this.modalType = type === 'error' ? 'error' : 'success';
            this.showMessageModal = true;
        }
    }

}