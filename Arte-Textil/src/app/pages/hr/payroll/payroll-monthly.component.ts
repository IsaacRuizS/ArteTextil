import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';

import { ApiPayrollService } from '../../../services/api-payroll.service';
import { ApiPaymentService } from '../../../services/api-payment.service';
import { SharedService } from '../../../services/shared.service';

import { PayrollMonthlyModel } from '../../../shared/models/payroll-monthly.model';

@Component({
    selector: 'app-payroll-monthly',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './payroll-monthly.component.html',
    styleUrls: ['./payroll-monthly.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [FormBuilder]
})
export class PayrollMonthlyComponent implements OnInit {

    payrolls: PayrollMonthlyModel[] = [];
    payrollsOrigin: PayrollMonthlyModel[] = [];
    paymentMethod: string = 'Transferencia';
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' | 'warning' = 'success';

    form: FormGroup;

    // Modal
    showMessageModal = false;
    messageText = '';
    modalType: 'success' | 'error' = 'success';

    showConfirmPaymentModal = false;
    selectedPayroll: PayrollMonthlyModel | null = null;

    generating = false;

    totalPayroll = 0;

    constructor(
        private api: ApiPayrollService,
        private payments: ApiPaymentService,
        private shared: SharedService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
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
            },

            error: () => this.shared.setLoading(false)
        });
    }

    // Generar planilla
    generate() {

        const monthValue = this.form.get('month')?.value;

        if (!monthValue) {
            this.showModal("Seleccione un mes primero", 'error');
            return;
        }

        const [year, month] = monthValue.split('-');

        this.generating = true;

        this.api.generate(year, month).subscribe({

            next: (res: any) => {

                this.generating = false;

                if (res.success) {
                    this.showToastMessage(res.message, 'success');
                } else {
                    this.showToastMessage(res.message, 'warning');
                }

                this.load(monthValue);
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

    // Confirmar el pago
    confirmPayment() {

        if (!this.selectedPayroll) return;

        const payload = {
            payrollId: this.selectedPayroll.payrollId,
            paymentDate: new Date(),
            amount: this.selectedPayroll.total,
            method: this.paymentMethod
        };

        this.payments.create(payload).subscribe({

            next: (res: any) => {

                this.showConfirmPaymentModal = false;

                if (res.success) {
                    this.showToastMessage(res.message, 'success');
                } else {
                    this.showToastMessage(res.message, 'warning');
                }

                const month = this.form.get('month')?.value;
                if (month) this.load(month);
            }
        });
    }

    // toast para advertencias
    showToastMessage(message: string, type: 'success' | 'error' | 'warning' = 'success') {

        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;

        this.cdr.detectChanges();

        setTimeout(() => {
            this.showToast = false;
            this.cdr.detectChanges();
        }, 3000); // desaparece en 3s
    }

}