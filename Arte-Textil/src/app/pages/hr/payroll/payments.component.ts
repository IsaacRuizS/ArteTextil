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

    get filteredPayments() {

        const term = this.searchTerm.toLowerCase().trim();

        if (!term) return this.paymentsOrigin;

        return this.paymentsOrigin.filter(p =>
            p.userName?.toLowerCase().includes(term) ||
            p.method?.toLowerCase().includes(term)
        );
    }

}