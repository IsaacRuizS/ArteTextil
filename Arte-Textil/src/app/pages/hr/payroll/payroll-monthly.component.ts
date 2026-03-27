import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { ApiPayrollService } from '../../../services/api-payroll.service';
import { ApiPaymentService } from '../../../services/api-payment.service';
import { SharedService } from '../../../services/shared.service';
import { NotificationService } from '../../../services/notification.service';

import { PayrollMonthlyModel } from '../../../shared/models/payroll-monthly.model';

@Component({
    selector: 'app-payroll-monthly',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './payroll-monthly.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [FormBuilder]
})
export class PayrollMonthlyComponent implements OnInit {

    payrolls: PayrollMonthlyModel[] = [];
    payrollsOrigin: PayrollMonthlyModel[] = [];

    form: FormGroup;

    generating = false;

    // total general de planilla
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

    ngOnInit(): void {
        // no cargar nada hasta seleccionar mes
    }

    // seleccionar mes
    onMonthChange() {

        const month = this.form.get('month')?.value;

        if (!month) return;

        this.load(month);
    }

    // cargar planillas
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
                        p.year === y &&
                        p.month === m
                    );

                }

                // calcular el total general
                this.totalPayroll = this.payrolls
                    .reduce((sum, p) => sum + p.total, 0);

                this.shared.setLoading(false);

                this.cdr.markForCheck();
            },

            error: () => this.shared.setLoading(false)

        });
    }

    // generar payroll
    generate() {

        const monthValue = this.form.get('month')?.value;

        if (!monthValue) {
            this.notificationService.warning("Seleccione un mes primero");
            return;
        }

        const [year, month] = monthValue.split('-');

        console.log("GENERANDO PAYROLL:", year, month);

        this.generating = true;

        this.api.generate(year, month).subscribe({

            next: () => {

                console.log("PAYROLL GENERADO / ACTUALIZADO");

                this.generating = false;

                this.load(monthValue);

            },

            error: (err) => {

                console.error("ERROR GENERANDO PAYROLL:", err);

                this.generating = false;

                this.notificationService.error("Error generando nómina");

            }

        });
    }

    approve(p: PayrollMonthlyModel) {

        if (!confirm('¿Aprobar nómina?')) return;

        this.shared.setLoading(true);

        this.api.approve(p.payrollId).subscribe({

            next: () => {

                const month = this.form.get('month')?.value;

                if (month) this.load(month);

                this.shared.setLoading(false);

            },

            error: () => this.shared.setLoading(false)

        });
    }

    registerPayment(p: PayrollMonthlyModel) {

        const method = prompt('Método de pago (ej. Transferencia)') || 'Transferencia';

        this.shared.setLoading(true);

        const payload = {
            payrollId: p.payrollId,
            paymentDate: new Date(),
            amount: p.total,
            method: method
        };

        console.log("PAYMENT PAYLOAD:", payload);

        this.payments.create(payload).subscribe({

            next: () => {

                this.notificationService.success("Pago registrado correctamente");

                const month = this.form.get('month')?.value;

                if (month) this.load(month);

                this.shared.setLoading(false);

            },

            error: (err) => {

                console.error("ERROR PAYMENT:", err);

                console.log("BACKEND:", err.error);

                this.shared.setLoading(false);

                this.notificationService.error("Error registrando pago");

            }

        });
    }
}