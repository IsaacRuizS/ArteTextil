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

    // VALIDACIONES
    // Se recalculan en cada cambio para poder deshabilitar el botón Guardar y
    // mostrar el detalle exacto de lo que falta.
    get customerError(): string | null {

        return Number(this.quoteForm.customerId) > 0
            ? null
            : 'Debe seleccionar el cliente de la cotización.';
    }

    itemError(item: QuoteItemModel): string | null {

        if (!Number(item.productId)) {
            return 'Seleccione un producto.';
        }

        const quantity = Number(item.quantity);

        if (!quantity || isNaN(quantity)) {
            return 'Indique la cantidad.';
        }

        if (quantity < 1) {
            return 'La cantidad debe ser al menos 1.';
        }

        if (!Number.isInteger(quantity)) {
            return 'La cantidad debe ser un número entero.';
        }

        if (this.isDuplicatedProduct(item)) {
            return 'Este producto ya está agregado en otra línea.';
        }

        return null;
    }

    isDuplicatedProduct(item: QuoteItemModel): boolean {

        const productId = Number(item.productId);

        if (!productId) return false;

        return this.quoteForm.items!
            .filter(i => Number(i.productId) === productId).length > 1;
    }

    get validationErrors(): string[] {

        const errors: string[] = [];

        if (this.customerError) {
            errors.push(this.customerError);
        }

        if (!this.quoteForm.items?.length) {
            errors.push('Debe agregar al menos un producto a la cotización.');
            return errors;
        }

        this.quoteForm.items.forEach((item, index) => {
            const error = this.itemError(item);
            if (error) {
                errors.push(`Línea ${index + 1}: ${error}`);
            }
        });

        return errors;
    }

    get isValid(): boolean {
        return this.validationErrors.length === 0;
    }

    saveQuote() {

        if (!this.isValid) {

            this.notificationService.warning(this.validationErrors[0]);

            return;

        }

        // El select devuelve string: se normaliza antes de enviar al API.
        this.quoteForm.customerId = Number(this.quoteForm.customerId);

        this.quoteForm.items = this.quoteForm.items!.map(item => new QuoteItemModel({
            ...item,
            productId: Number(item.productId),
            quantity: Number(item.quantity)
        }));

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

        // Corrige cantidades inválidas antes de comparar contra el stock.
        const quantity = Math.floor(Number(item.quantity));

        if (!quantity || isNaN(quantity) || quantity < 1) {
            item.quantity = 1;
            this.notificationService.warning('La cantidad mínima es 1.');
            this.calculateTotal();
            return;
        }

        item.quantity = quantity;

        const product = this.products.find(p => p.productId == item.productId);
        if (!product) return;

        // stock real disponible considerando lo que ya tiene el item
        const maxAllowed = product.availableStock + (itemOrigin?.quantity ?? 0);

        if (item.quantity > maxAllowed) {
            this.notificationService.warning(
                `Stock insuficiente para ${product.name}. Disponible: ${maxAllowed} unidad(es).`);

            item.quantity = maxAllowed;
        }

        this.calculateTotal();
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

        // Evita apilar líneas vacías: primero hay que completar la anterior.
        const lastItem = this.quoteForm.items?.[this.quoteForm.items.length - 1];

        if (lastItem && !Number(lastItem.productId)) {
            this.notificationService.warning('Seleccione un producto en la línea anterior antes de agregar otra.');
            return;
        }

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