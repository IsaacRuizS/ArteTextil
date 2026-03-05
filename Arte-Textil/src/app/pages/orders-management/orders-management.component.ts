import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiOrderService } from '../../services/api-order.service';
import { SharedService } from '../../services/shared.service';
import { OrderModel } from '../../shared/models/order.model';
import { OrderFormModalComponent } from './order-form-modal.component';
import { QuoteModel } from '../../shared/models/quote.model';


@Component({
    selector: 'app-orders-management',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [
        CommonModule,
        FormsModule,
        NgxPaginationModule,
        OrderFormModalComponent
    ],
    templateUrl: './orders-management.component.html',
    styleUrls: ['./orders-management.component.scss']
})
export class OrdersManagementComponent implements OnInit {

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
    
    constructor(
        private apiOrderService: ApiOrderService,
        private sharedService: SharedService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
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

    openCreateModal() {
        this.isEditing = false;
        this.selectedOrder = null;
        this.showModal = true;
    }

    openEditModal(order: OrderModel) {
        this.isEditing = true;
        this.selectedOrder = { ...order }; // copia para evitar mutación directa
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
}