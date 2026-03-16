import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiPaymentService } from '../../../services/api-payment.service';
import { SharedService } from '../../../services/shared.service';
import { PaymentModel } from '../../../shared/models/payment.model';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payments.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class PaymentsComponent implements OnInit {
    payments: PaymentModel[] = [];

    constructor(private api: ApiPaymentService, private shared: SharedService, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void { this.load(); }

    load() {
        this.shared.setLoading(true);
        this.api.getAll().subscribe({
            next: d => { this.payments = d; this.shared.setLoading(false); this.cdr.markForCheck(); },
            error: () => this.shared.setLoading(false)
        });
    }
}