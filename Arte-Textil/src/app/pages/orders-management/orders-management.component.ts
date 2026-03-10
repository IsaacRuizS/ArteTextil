import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiOrderService } from '../../services/api-order.service';
import { SharedService } from '../../services/shared.service';
import { OrderModel } from '../../shared/models/order.model';
import { OrderFormModalComponent } from './order-form-modal.component';
import { QuoteModel } from '../../shared/models/quote.model';
import { CustomerModel } from '../../shared/models/customer.model';
import { CustomerModalComponent } from '../../components/customer-modal/customer-modal.component';
import { QuoteModalComponent } from '../../components/quote-modal/quote-modal.component';
import { AuthService } from '../../services/auth.service';
import { UserModel } from '../../shared/models/user.model';
import { OrderStatusHistoryModalComponent } from '../../components/order-status-history-modal/order-status-history-modal.component';


@Component({
    selector: 'app-orders-management',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [
        CommonModule,
        FormsModule,
        NgxPaginationModule,
        OrderFormModalComponent,
        QuoteModalComponent,
        CustomerModalComponent,
        OrderStatusHistoryModalComponent
    ],
    templateUrl: './orders-management.component.html',
    styleUrls: ['./orders-management.component.scss']
})
export class OrdersManagementComponent implements OnInit {

    @ViewChild('statusHistoryModal')
    statusHistoryModal!: any;

    // LISTADO
    orders: OrderModel[] = [];
    ordersOrigin: OrderModel[] = [];
    filteredOrders: OrderModel[] = [];

    page = 1;
    statusFilter: number = 1; // 0 todos, 1 activos, 2 inactivos
    searchTerm = '';

    // MODAL STATE
    showModal = false;
    isEditing = false;
    selectedOrder: OrderModel | null = null;

    // DELETE STATE
    showDeleteModal = false;
    orderToDelete: OrderModel | null = null;

    showCustomerModal = false;
    showQuoteModal = false;

    selectedCustomer?: CustomerModel;
    selectedQuote?: QuoteModel;

    loggedUserId: number | null = null;

    constructor(
        private apiOrderService: ApiOrderService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) { }

    ngOnInit(): void {

        this.loggedUserId = this.authService.currentUserValue?.userId ?? null;

        this.loadOrders();
    }

    //
    // LOAD DATA
    //

    loadOrders() {

        this.sharedService.setLoading(true);

        this.apiOrderService.getAll().subscribe({
            next: (orders: OrderModel[]) => {

                this.orders = orders;
                this.ordersOrigin = orders;

                this.applyFilters();

                this.sharedService.setLoading(false);
                this.cdr.markForCheck();
            },
            error: () => {
                this.sharedService.setLoading(false);
            }
        });
    }

    reloadOrders() {
        this.closeModal();
        this.loadOrders();
    }

    //
    // FILTERS
    //

    onSearch(event: any) {
        this.searchTerm = event.target.value;
        this.applyFilters();
    }

    applyFilters() {

        this.filteredOrders = [...this.ordersOrigin];

        // FILTRO ACTIVO / INACTIVO
        if (this.statusFilter === 1) {
            this.filteredOrders = this.filteredOrders.filter(o => o.isActive);
        } else if (this.statusFilter === 2) {
            this.filteredOrders = this.filteredOrders.filter(o => !o.isActive);
        }

        // BUSQUEDA
        if (this.searchTerm?.trim()) {

            const term = this.searchTerm.toLowerCase();

            this.filteredOrders = this.filteredOrders.filter(o =>
                o.status?.toLowerCase().includes(term) ||
                o.orderId?.toString().includes(term)
            );
        }

        this.page = 1;

        this.cdr.markForCheck();
    }

    //
    // MODAL CONTROL
    //

    openStatusHistory(orderId: number) {
        this.statusHistoryModal.open(orderId);
    }

    openCustomerModal(customer?: CustomerModel) {
        this.selectedCustomer = customer;
        this.showCustomerModal = true;
    }

    openQuoteModal(quote?: QuoteModel) {
        this.selectedQuote = quote;
        this.showQuoteModal = true;
    }

    openCreateModal() {
        this.isEditing = false;
        this.selectedOrder = new OrderModel();
        this.selectedOrder.loggedUserId = this.loggedUserId ?? 0;
        this.showModal = true;
    }

    openEditModal(order: OrderModel) {
        this.isEditing = true;
        this.selectedOrder = { ...order }; // copia para evitar mutación directa
        this.selectedOrder.loggedUserId = this.loggedUserId ?? 0;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
        this.selectedOrder = null;
        this.isEditing = false;
    }

    // DELETE (SOFT)

    openDeleteModal(order: OrderModel) {
        this.orderToDelete = order;
        this.showDeleteModal = true;
    }

    confirmDelete() {

        if (!this.orderToDelete) return;

        this.sharedService.setLoading(true);

        this.apiOrderService
            .updateIsActive(
                this.orderToDelete.orderId ?? 0,
                !this.orderToDelete.isActive
            )
            .subscribe({
                next: () => {

                    this.showDeleteModal = false;
                    this.orderToDelete = null;

                    this.loadOrders();
                },
                error: () => {
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