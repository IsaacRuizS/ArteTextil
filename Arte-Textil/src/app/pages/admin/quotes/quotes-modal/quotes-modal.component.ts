import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuoteModel } from '../../../../shared/models/quote.model';
import { QuoteItemModel } from '../../../../shared/models/quote-item.model';
import { CustomerModel } from '../../../../shared/models/customer.model';
import { ProductModel } from '../../../../shared/models/product.model';

import { ApiQuoteService } from '../../../../services/api-quote.service';
import { ApiCustomerService } from '../../../../services/api-customer.service';
import { ApiProductService } from '../../../../services/api-product.service';
import { CustomCurrencyPipe } from "../../../../shared/pipes/crc-currency.pipe";
import { SharedService } from '../../../../services/shared.service';
import { NotificationService } from '../../../../services/notification.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-quotes-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, CustomCurrencyPipe],
    templateUrl: './quotes-modal.component.html'
})
export class QuotesModalComponent implements OnInit {

    @Input() quote: QuoteModel | null = null;
    @Input() isEditing = false;

    @Output() saved = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();

    quoteForm: QuoteModel = new QuoteModel({ items: [] });

    customers: CustomerModel[] = [];
    products: ProductModel[] = [];

    originalQuantity: number = 0;

    constructor(
        private apiQuoteService: ApiQuoteService,
        private apiCustomerService: ApiCustomerService,
        private apiProductService: ApiProductService,
        private sharedService: SharedService,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {

        this.sharedService.setLoading(true);

        this.loadCustomers();

        if (this.quote) {

            this.quoteForm = new QuoteModel(
                JSON.parse(JSON.stringify(this.quote))
            );

            this.calculateTotal();
        } 

    }

    loadCustomers() {

        this.apiCustomerService.getAll()
            .subscribe({
                next: (customers: CustomerModel[]) => {

                    this.customers = customers;
                    this.loadProducts();
                },
                error: () => {
                    this.notificationService.error('Error al cargar los Clientes. Intente de nuevo.');
                    this.closed.emit();
                }
            });

    }

    loadProducts() {

        this.apiProductService.getAllForMarket()
            .pipe(finalize(() => this.sharedService.setLoading(false)))
            .subscribe({
                next: (products: ProductModel[]) => {

                    this.products = products;
                    this.sharedService.setLoading(false);
                },
                error: () => {
                    this.notificationService.error('Error al cargar los Productos. Intente de nuevo.');
                    this.closed.emit();
                }
            });

    }

    saveQuote() {

        if (!this.quoteForm.items?.length) {

            this.notificationService.warning("Debe agregar al menos un producto");

            return;

        }

        this.calculateTotal();

        this.sharedService.setLoading(true);

        if (this.isEditing) {

            this.apiQuoteService.update(this.quoteForm).subscribe({

                next: () => {
                    this.saved.emit();
                    this.sharedService.setLoading(false);
                },

                error: (err) => {

                    this.sharedService.setLoading(false);
                    this.notificationService.error(err?.error?.message || 'Ocurrió un error al actualizar la cotización');
                }

            });

        } else {


            this.quoteForm.sentToEmail = this.customers.find(c => c.customerId == this.quoteForm.customerId)?.email;

            this.apiQuoteService.create(this.quoteForm).subscribe({

                next: () => {
                    this.saved.emit();
                    this.sharedService.setLoading(false);
                },

                error: (err) => {


                    this.sharedService.setLoading(false);
                    this.notificationService.error(err?.error?.message || 'Ocurrió un error al crear la cotización');
                }

            });

        }

    }

    validateStock(index: number) {
        
        const item = this.quoteForm.items![index];
        const itemOrigin = this.quote?.items![index];
        const product = this.products.find(p => p.productId == item.productId);
        if (!product) return; 

        // stock real disponible considerando lo que ya tiene el item
        const maxAllowed = product.availableStock + (itemOrigin?.quantity ?? 0);

        if (item.quantity > maxAllowed) {
            this.notificationService.warning('Stock insuficiente');

            item.quantity = maxAllowed;
            this.calculateTotal();
        }
    }

    calculateTotal() {

        let total = 0;

        for (const item of this.quoteForm.items!) {

            total += (item.price - (item.discountAmount ?? 0)) * item.quantity;

        }

        this.quoteForm.total = total;

    }

    getItemFinalPrice(item: QuoteItemModel): number {
        return (item.price ?? 0) - (item.discountAmount ?? 0);
    }

    addItem() {

        this.quoteForm.items!.push(new QuoteItemModel({
            quoteItemId: 0,
            productId: 0,
            quantity: 1,
            price: 0
        }));

        this.calculateTotal();

    }

    removeItem(index: number) {

        this.quoteForm.items!.splice(index, 1);

        this.calculateTotal();

    }

    updatePrice(item: QuoteItemModel) {
        const product = this.products.find(p => p.productId == item.productId);
        if (product) {
            item.price = product.price;
            const promo = product.bestPromotion;
            item.discountAmount = promo ? Math.round(product.price * (promo.discountPercent ?? 0) / 100) : 0;
        } else {
            item.price = 0;
            item.discountAmount = 0;
        }
        this.calculateTotal();
    }

}