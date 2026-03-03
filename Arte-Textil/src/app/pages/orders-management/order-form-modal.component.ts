import { Component, EventEmitter, Input, Output } from '@angular/core';
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


@Component({
    selector: 'app-order-form-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './order-form-modal.component.html'
})
export class OrderFormModalComponent {

    @Input() isEdit = false;
    @Input() order: any;

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
        items: []
    });

    orderForm: OrderModel = new OrderModel({
        deliveryDate: null,
        status: 'Nuevo',
        isActive: true,
        quoteId: 0,
        notes: ''
    });

    model: any = {};

    constructor(
        private quoteService: ApiQuoteService,
        private orderService: ApiOrderService,
        private customerService: ApiCustomerService,
        private productService: ApiProductService
    ) { }

    ngOnInit() {

        if (this.isEdit) {
            this.model = { ...this.order };
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
        this.quoteService.getAll().subscribe(q => this.quotes = q);
    }

    loadCustomers() {
        this.customerService.getAll().subscribe(c => this.customers = c);
    }

    loadProducts() {
        this.productService.getAllForMarket().subscribe(p => this.products = p);
    }

    loadQuoteDetails() {
        if (!this.selectedQuoteId) return;

        this.selectedQuote = this.quotes.filter(q => q.quoteId == this.selectedQuoteId)[0];
        this.selectedQuote.customer = this.customers.filter(c => c.customerId === this.selectedQuote?.customerId)[0];
    }

    addItem() {
        this.quoteForm.items?.push({
            productId: 0,
            quantity: 1,
            price: 0
        });
    }

    removeItem(index: number) {
        this.quoteForm.items?.splice(index, 1);
    }

    updatePrice(index: number) {
        const item = this.quoteForm.items![index];
        const product = this.products.find(p => p.productId === item.productId);
        if (!product) return;
        item.price = product.price;
    }

    validateStock(index: number) {
        const item = this.quoteForm.items![index];
        const product = this.products.find(p => p.productId === item.productId);
        if (!product) return;

        if (item.quantity > product.stock) {
            alert('Stock insuficiente');
            item.quantity = product.stock;
        }
    }

    createOrderFromExistingQuote() {

        const payload: OrderModel = new OrderModel({
            customerId: this.selectedQuote?.customerId,
            quoteId: this.selectedQuote?.quoteId,
            deliveryDate: this.orderForm.deliveryDate,
            status: 'Nuevo',
            isActive: true
        });

        this.orderService.create(payload).subscribe(() => {
            this.saved.emit();
            this.close();
        });
    }

    createFromScratch() {

        if (!this.quoteForm.items?.length) {
            alert('Debe agregar productos');
            return;
        }

        this.quoteService.create(this.quoteForm).subscribe(createdQuote => {

            const orderPayload = {
                customerId: createdQuote.customerId,
                quoteId: createdQuote.quoteId,
                deliveryDate: this.orderForm.deliveryDate,
                status: 'Nuevo',
                isActive: true
            };

            this.orderService.create(orderPayload).subscribe(() => {
                this.saved.emit();
                this.close();
            });
        });
    }

    saveEdit() {
        this.orderService.update(this.model).subscribe(() => {
            this.saved.emit();
            this.close();
        });
    }

    close() {
        this.closed.emit();
    }

    getProductName(productId: number): string {

        const product = this.products.find(p => p.productId === productId);
        return product ? product.name : 'Producto no encontrado';
    }

    // VALIDACIONES
    canCreateFromExisting(): boolean {

        if (!this.selectedQuote) return false;
        if (!this.orderForm.deliveryDate) return false;

        return true;
    }

    canCreateFromScratch(): boolean {

        if (!this.quoteForm.customerId || this.quoteForm.customerId === 0)
            return false;

        if (!this.orderForm.deliveryDate)
            return false;

        if (!this.quoteForm.items || this.quoteForm.items.length === 0)
            return false;

        for (const item of this.quoteForm.items) {

            if (!item.productId || item.productId === 0)
                return false;

            if (!item.quantity || item.quantity <= 0)
                return false;

            const product = this.products.find(p => p.productId === item.productId);
            if (!product) return false;

            if (item.quantity > product.stock)
                return false;
        }

        return true;
    }
}