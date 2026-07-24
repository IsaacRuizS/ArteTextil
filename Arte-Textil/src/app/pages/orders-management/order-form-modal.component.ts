import { Component, EventEmitter, Input, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiCustomerService } from '../../services/api-customer.service';
import { ApiOrderService } from '../../services/api-order.service';
import { ApiProductService } from '../../services/api-product.service';
import { ApiQuoteService } from '../../services/api-quote.service';
import { QuoteModel } from '../../shared/models/quote.model';
import { OrderModel } from '../../shared/models/order.model';
import { CustomerModel } from '../../shared/models/customer.model';
import { ProductModel } from '../../shared/models/product.model';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';
import { UserModel } from '../../shared/models/user.model';
import { NotificationService } from '../../services/notification.service';


@Component({
    selector: 'app-order-form-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './order-form-modal.component.html',
})
export class OrderFormModalComponent {

    @Input() isEdit = false;
    @Input() order: OrderModel | null = null;

    @Output() closed = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    createStep = 1;
    mode: 'existing' | 'new' | null = null;

    quotes: QuoteModel[] = [];
    customers: CustomerModel[] = [];
    products: ProductModel[] = [];

    selectedQuoteId: number | null = null;
    selectedQuote: QuoteModel | null = null;

    quoteForm: QuoteModel = new QuoteModel({
        customerId: 0,
        status: 'Pendiente',
        total: 0,
        createdByUserId: 1,
        isActive: true,
        items: [],
        sentToEmail: '',
        notes: 'Creado por el Admin'
    });

    orderForm: OrderModel = new OrderModel({
        deliveryDate: null,
        status: 'Nuevo',
        isActive: true,
        quoteId: 0,
        notes: 'Creado por el Admin'
    });

    model: OrderModel = new OrderModel();

    // Fecha mínima permitida para la entrega (hoy, en hora local)
    minDeliveryDate = this.toDateInputValue(new Date());

    orderStatuses = [
        'Nuevo',
        'Corte',
        'Confección',
        'Estampado',
        'Procesando',
        'En Camino',
        'Entregado',
        'Cancelado'
    ];

    constructor(
        private quoteService: ApiQuoteService,
        private orderService: ApiOrderService,
        private customerService: ApiCustomerService,
        private productService: ApiProductService,
        private sharedService: SharedService,
        private notificationService: NotificationService,
    ) {
    }

    ngOnInit() {

        if (this.isEdit) {

            this.model = this.order ?? new OrderModel();

            if (this.model.deliveryDate) {
                const date = new Date(this.model.deliveryDate);
                this.model.deliveryDate = date.toISOString().split('T')[0] as any;
            }

            return;
        }

        this.loadQuotes();
        this.loadCustomers();
        this.loadProducts();
    }

    goToStep2() {
        this.createStep = 2;
    }

    loadQuotes() {

        forkJoin({
            quotes: this.quoteService.getAll(),
            orders: this.orderService.getAll()
        }).subscribe({
            next: ({ quotes, orders }) => {

                const quoteIdsWithOrder = new Set(
                    orders.filter(o => o.isActive).map(o => o.quoteId)
                );

                this.quotes = quotes.filter(q => q.isActive && !quoteIdsWithOrder.has(q.quoteId));
            },
            error: (err) => {
                this.notificationService.error(err?.error?.message || 'Error al cargar las cotizaciones disponibles.');
            }
        });
    }

    loadCustomers() {
        this.customerService.getAll().subscribe({
            next: (c) => this.customers = c,
            error: (err) => {
                this.notificationService.error(err?.error?.message || 'Error al cargar los clientes.');
            }
        });
    }

    loadProducts() {
        this.productService.getAllForMarket().subscribe({
            next: (p) => this.products = p,
            error: (err) => {
                this.notificationService.error(err?.error?.message || 'Error al cargar los productos.');
            }
        });
    }

    loadQuoteDetails() {
        if (!this.selectedQuoteId) return;

        this.selectedQuote = this.quotes.filter(q => q.quoteId == this.selectedQuoteId)[0];
        this.selectedQuote.customer = this.customers.filter(c => c.customerId == this.selectedQuote?.customerId)[0];
    }

    addItem() {
        this.quoteForm.items?.push({
            productId: 0,
            quantity: 1,
            price: 0,
            discountAmount: 0
        });
    }

    removeItem(index: number) {
        this.quoteForm.items?.splice(index, 1);
    }

    updatePrice(item: any) {
        const product = this.products.find(p => p.productId == item.productId);
        if (product) {
            item.price = product.price;
            const promo = product.bestPromotion;
            item.discountAmount = promo ? Math.round(product.price * (promo.discountPercent ?? 0) / 100) : 0;
        } else {
            item.price = 0;
            item.discountAmount = 0;
        }
    }

    getProductForItem(item: any): ProductModel | undefined {
        return this.products.find(p => p.productId == item.productId);
    }

    getItemFinalPrice(item: any): number {
        return (item.price ?? 0) - (item.discountAmount ?? 0);
    }

    validateStock(index: number) {
        const item = this.quoteForm.items![index];
        const product = this.products.find(p => p.productId == item.productId);
        if (!product) return;

        if (item.quantity > product.availableStock) {
            this.notificationService.warning('Stock insuficiente');
            item.quantity = product.availableStock;
        }
    }

    createOrderFromExistingQuote() {

        const payload: OrderModel = new OrderModel({
            customerId: this.selectedQuote?.customerId,
            quoteId: this.selectedQuote?.quoteId,
            deliveryDate: this.orderForm.deliveryDate,
            performByUserId: this.order?.loggedUserId ?? 1,
            status: 'Nuevo',
            isActive: true
        });

        this.sharedService.setLoading(true);

        this.orderService.create(payload).subscribe({
            next: () => {
                this.sharedService.setLoading(false);
                this.saved.emit();
                this.close();
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                this.notificationService.error(err?.error?.message || 'Error al crear el pedido.');
            }
        });
    }

    createFromScratch() {

        if (!this.quoteForm.items?.length) {
            this.notificationService.warning('Debe agregar productos');
            return;
        }

        this.sharedService.setLoading(true);

        let total = 0;
        for (const item of this.quoteForm.items) {
            const product = this.products.find(p => p.productId == item.productId);
            if (product) {
                total += item.quantity * (item.price - (item.discountAmount ?? 0));
            }
        }

        this.quoteForm.total = total;

        const customer = this.customers.find(c => c.customerId == this.quoteForm.customerId);
        this.quoteForm.sentToEmail = customer ? customer.email : '';
        this.quoteForm.createdByUserId = this.order?.loggedUserId ?? 1;
        this.quoteForm.customerId = Number(this.quoteForm.customerId);

        this.quoteService.create(this.quoteForm).subscribe({

            next: (createdQuote) => {
                
                const orderPayload: OrderModel = new OrderModel({
                    customerId: createdQuote.customerId,
                    quoteId: createdQuote.quoteId,
                    deliveryDate: this.orderForm.deliveryDate,
                    performByUserId: this.order?.loggedUserId ?? 1,
                    status: 'Nuevo',
                    isActive: true,
                }) ;


                this.orderService.create(orderPayload).subscribe({

                    next: () => {
                        this.sharedService.setLoading(false);
                        this.saved.emit();
                        this.close();
                    },

                    error: (err) => {
                        console.error('Error creando el pedido:', err);
                        this.notificationService.error('Error al crear el pedido.');
                        this.sharedService.setLoading(false);
                    }

                });

            },

            error: (err) => {
                console.error('Error creando la cotización:', err);
                this.notificationService.error('Error al crear la cotización.');
                this.sharedService.setLoading(false);
            }

        });
    }

    saveEdit() {

        this.sharedService.setLoading(true);

        this.model.performByUserId = this.order?.loggedUserId ?? 1;

        this.orderService.update(this.model).subscribe({
            next: () => {
                this.saved.emit();
                this.close();
            },
            error: (err) => {
                this.sharedService.setLoading(false);
                this.notificationService.error(err?.error?.message || 'Error al actualizar el pedido.');
            }
        });
    }

    close() {
        this.closed.emit();
    }

    getProductName(productId: number): string {

        const product = this.products.find(p => p.productId == productId);
        return product ? product.name : 'Producto no encontrado';
    }

    // VALIDACIONES
    private toDateInputValue(value: Date | string): string {

        if (typeof value === 'string') return value;

        const month = `${value.getMonth() + 1}`.padStart(2, '0');
        const day = `${value.getDate()}`.padStart(2, '0');

        return `${value.getFullYear()}-${month}-${day}`;
    }

    isDeliveryDateValid(): boolean {

        if (!this.orderForm.deliveryDate) return false;

        return this.toDateInputValue(this.orderForm.deliveryDate) >= this.minDeliveryDate;
    }

    canCreateFromExisting(): boolean {

        if (!this.selectedQuote) return false;
        if (!this.isDeliveryDateValid()) return false;

        return true;
    }

    isCustomerSelected(): boolean {

        return !!this.quoteForm.customerId && this.quoteForm.customerId != 0;
    }

    canCreateFromScratch(): boolean {

        if (!this.isCustomerSelected())
            return false;

        if (!this.isDeliveryDateValid())
            return false;

        if (!this.quoteForm.items || this.quoteForm.items.length == 0)
            return false;

        for (const item of this.quoteForm.items) {

            if (!item.productId || item.productId == 0)
                return false;

            if (!item.quantity || item.quantity <= 0)
                return false;

            const product = this.products.find(p => p.productId == item.productId);
            if (!product) return false;

            if (item.quantity > product.availableStock)
                return false;
        }

        return true;
    }
}