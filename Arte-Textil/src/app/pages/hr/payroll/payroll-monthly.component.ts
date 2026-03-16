import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ApiPayrollService } from '../../../services/api-payroll.service';
import { ApiPaymentService } from '../../../services/api-payment.service';
import { SharedService } from '../../../services/shared.service';
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
    form: FormGroup;
    generating = false;

    constructor(
        private api: ApiPayrollService,
        private payments: ApiPaymentService,
        private shared: SharedService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({ period: [''] });
    }

    ngOnInit(): void { this.load(); }

    load() {
        this.shared.setLoading(true);
        this.api.getAll().subscribe({
            next: d => { this.payrolls = d; this.shared.setLoading(false); this.cdr.markForCheck(); },
            error: () => this.shared.setLoading(false)
        });
    }

    generate() {
        const period = this.form.value.period;
        if (!period) { alert('Seleccione periodo (YYYY-MM)'); return; }
        this.generating = true;
        this.api.generate(period).subscribe({
            next: () => { this.generating = false; this.load(); },
            error: () => { this.generating = false; alert('Error generando nómina'); }
        });
    }

    approve(p: PayrollMonthlyModel) {
        if (!confirm('Aprobar nómina?')) return;
        this.shared.setLoading(true);
        this.api.approve(p.payrollId).subscribe({
            next: () => { this.load(); this.shared.setLoading(false); },
            error: () => this.shared.setLoading(false)
        });
    }

    registerPayment(p: PayrollMonthlyModel) {
        const method = prompt('Método de pago (ej. Transferencia)') || 'Transferencia';
        this.shared.setLoading(true);
        this.payments.create({ payrollId: p.payrollId, method, amount: p.total }).subscribe({
            next: () => { alert('Pago registrado'); this.load(); this.shared.setLoading(false); },
            error: () => { this.shared.setLoading(false); alert('Error al registrar pago'); }
        });
    }
}