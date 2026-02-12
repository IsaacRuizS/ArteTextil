import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { CartService } from '../../../services/cart.service';
import { ProductModel } from '../../../shared/models/product.model';
import { QuoteModel } from '../../../shared/models/quote.model';
import { QuoteItemModel } from '../../../shared/models/quote-item.model';
import { CustomerModel } from '../../../shared/models/customer.model';
import { ApiQuoteService } from '../../../services/api-quote.service';
import { finalize } from 'rxjs';
import { SharedService } from '../../../services/shared.service';

@Component({
    selector: 'app-quote',
    standalone: true,
    imports: [ReactiveFormsModule, CustomCurrencyPipe],
    templateUrl: './quote.component.html',
    styleUrl: './quote.component.scss',
})
export class QuoteComponent implements OnInit {

    cart: ProductModel[] = [];
    quoteForm!: FormGroup;

    errorMsg = '';
    successMsg = '';

    constructor(
        private fb: FormBuilder,
        private cartService: CartService,
        private sharedService: SharedService,
        private apiQuoteService: ApiQuoteService
    ) { }

    ngOnInit() {

        this.cart = this.cartService.getCart();

        this.quoteForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(3)]],
            correo: ['', [Validators.required, Validators.email]],
            whatsapp: ['', [Validators.pattern(/^[0-9+\s-]{8,15}$/)]],
            mensaje: ['', [Validators.required, Validators.minLength(5)]],
        });
    }

    // TOTAL CON PROMOCIONES

    getSubtotal(item: ProductModel): number {

        const promo = item.bestPromotion;

        const price = promo
            ? item.price - (item.price * promo.discountPercent! / 100)
            : item.price;

        return price * (item.quantitySelected ?? 1);
    }

    get total(): number {
        return this.cart.reduce((sum, item) => sum + this.getSubtotal(item), 0);
    }

    // ENVÍO

    onSend() {

        this.errorMsg = '';
        this.successMsg = '';

        if (this.quoteForm.invalid) {
            this.quoteForm.markAllAsTouched();
            this.errorMsg = 'Por favor completa correctamente el formulario.';
            return;
        }

        if (this.cart.length === 0) {
            this.errorMsg = 'Tu carrito está vacío.';
            return;
        }

        const customer = new CustomerModel({
            customerId: 0,
            fullName: this.quoteForm.value.nombre,
            email: this.quoteForm.value.correo,
            phone: this.quoteForm.value.whatsapp,
            isActive: true
        });

        const quote = new QuoteModel({
            customerId: 0, // backend resolverá esto, o si hay login, se asignará el userId
            status: 'Pendiente',
            total: this.total,
            notes: this.quoteForm.value.mensaje,
            createdByUserId: 0, // usado solo si el admin crea la cotización
            sentToEmail: this.quoteForm.value.correo,
            isActive: true,
            customer: customer,
            items: this.cart.map(p => ({
                productId: p.productId,
                quantity: p.quantitySelected ?? 1,
                price: p.price
            }))
        });

        console.log('COTIZACIÓN ENVIADA (MODEL):', quote);

        this.sharedService.setLoading(true);

        this.apiQuoteService.create(quote)
        .pipe(finalize(() => this.sharedService.setLoading(false)))
        .subscribe({
            next: () => {

                this.successMsg = 'Tu cotización fue enviada correctamente.';
                this.cartService.clearCart();
                this.cart = [];
                this.quoteForm.reset();
            },
            error: (err) => {
                // manejar error
                console.log('COTIZACIÓN ENVIADA (ERROR):', err);

            }
        });
    }

    goBack() {
        window.history.back();
    }
}
