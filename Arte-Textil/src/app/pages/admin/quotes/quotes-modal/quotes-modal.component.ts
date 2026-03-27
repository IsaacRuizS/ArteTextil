import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuoteModel } from '../../../../shared/models/quote.model';
import { QuoteItemModel } from '../../../../shared/models/quote-item.model';
import { CustomerModel } from '../../../../shared/models/customer.model';

import { ApiQuoteService } from '../../../../services/api-quote.service';
import { ApiCustomerService } from '../../../../services/api-customer.service';
import { ApiProductService } from '../../../../services/api-product.service';
import { CustomCurrencyPipe } from "../../../../shared/pipes/crc-currency.pipe";
import { SharedService } from '../../../../services/shared.service';
import { NotificationService } from '../../../../services/notification.service';

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
    products: any[] = [];

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
        this.loadProducts();

        if (this.quote) {

            this.quoteForm = new QuoteModel(
                JSON.parse(JSON.stringify(this.quote))
            );

            this.calculateTotal();

        }

    }

    loadCustomers() {

        this.apiCustomerService.getAll().subscribe({
            next: res => this.customers = res
        });

    }

    loadProducts() {

        this.apiProductService.getAllForMarket().subscribe({
            next: res => {

                this.products = res;

                this.sharedService.setLoading(false);

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

    calculateTotal() {

        let total = 0;

        for (const item of this.quoteForm.items!) {

            total += item.price * item.quantity;

        }

        this.quoteForm.total = total;

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

        }

        this.calculateTotal();

    }

}