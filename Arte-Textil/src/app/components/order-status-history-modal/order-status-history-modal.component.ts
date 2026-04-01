import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiOrderService } from '../../services/api-order.service';
import { OrderStatusHistoryModel } from '../../shared/models/order-status-history.model';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/shared.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-order-status-history-modal',
    templateUrl: './order-status-history-modal.component.html',
    styleUrl: './order-status-history-modal.component.scss',
    standalone: true,
    imports: [
        CommonModule, 
    ],
})
export class OrderStatusHistoryModalComponent implements OnInit {

    @Input() orderId!: number;

    isOpen = false;
    history: OrderStatusHistoryModel[] = [];

    constructor(private apiOrderService: ApiOrderService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void { }

    open(orderId: number) {
        this.orderId = orderId;
        this.isOpen = true;
        this.loadHistory();
    }

    close() {
        this.isOpen = false;
    }

    loadHistory() {

        this.apiOrderService.getStatusHistory(this.orderId).subscribe({
            next: (orders: OrderStatusHistoryModel[]) => {

                this.history = orders;

                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.notificationService.error('Error al cargar el historial de estados del pedido. Intente de nuevo.');
                this.sharedService.setLoading(false);
            }
        });
    }

    getStatusColor(status: string) {

    switch (status) {

        case 'Nuevo':
            return 'badge-secondary';

        case 'Corte':
            return 'badge-primary';

        case 'Confección':
            return 'badge-info';

        case 'Estampado':
            return 'badge-warning';

        case 'Procesando':
            return 'badge-dark';

        case 'En Camino':
            return 'badge-purple';

        case 'Entregado':
            return 'badge-success';

        case 'Cancelado':
            return 'badge-danger';

        default:
            return 'badge-secondary';
    }
}
}