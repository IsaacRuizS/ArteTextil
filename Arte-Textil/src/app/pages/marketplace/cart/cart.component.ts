import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { ProductModel } from '../../../shared/models/product.model';
import { CartService } from '../../../services/cart.service';

@Component({
    selector: 'app-cart.component',
    standalone: true,
    imports: [RouterLink, CustomCurrencyPipe, CommonModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {

    cart: ProductModel[] = [];
    alertMsg: string | null = null;
    loading = true;

    constructor(private cartService: CartService, public router: Router) { }

    ngOnInit() {
        this.loadCart();
    }

    loadCart() {
        this.loading = true;
        this.cartService.syncFromApi().subscribe({
            next: (products) => {
                this.cart = products;
                this.loading = false;
            },
            error: () => {
                this.cart = this.cartService.getCart();
                this.loading = false;
            }
        });
    }

    onOpenCart() {
        this.router.navigate(['/quoate']);
    }

    onBackToMarketplace() {
        this.router.navigate(['/marketplace']);
    }

    increaseQty(item: ProductModel) {
        if ((item.quantitySelected ?? 0) + 1 > item.stock) {
            this.alertMsg = `No hay más stock disponible para ${item.name}.`;
            return;
        }

        const newQty = (item.quantitySelected ?? 1) + 1;
        this.cartService.updateQuantity(item, newQty).subscribe({
            next: () => {
                item.quantitySelected = newQty;
                this.alertMsg = null;
            }
        });
    }

    decreaseQty(item: ProductModel) {
        if ((item.quantitySelected ?? 1) <= 1) return;

        const newQty = (item.quantitySelected ?? 1) - 1;
        this.cartService.updateQuantity(item, newQty).subscribe({
            next: () => {
                item.quantitySelected = newQty;
            }
        });
    }

    removeItem(item: ProductModel) {
        this.cartService.removeProduct(item.productId).subscribe({
            next: () => {
                this.cart = this.cartService.getCart();
            }
        });
    }

    getUnitPrice(item: ProductModel): number {
        const promo = item.bestPromotion;
        return promo ? item.price - (item.price * (promo.discountPercent ?? 0) / 100) : item.price;
    }

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

    closeAlert() {
        this.alertMsg = null;
    }
}
