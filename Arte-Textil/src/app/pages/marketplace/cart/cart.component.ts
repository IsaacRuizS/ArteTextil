import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomCurrencyPipe } from '../../../shared/pipes/crc-currency.pipe';
import { ProductModel } from '../../../shared/models/product.model';
import { CartService } from '../../../services/cart.service';

@Component({
    selector: 'app-cart.component',
    standalone: true,
    imports: [RouterLink, CustomCurrencyPipe],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {

    cart: ProductModel[] = [];
    alertMsg: string | null = null;

    constructor(private cartService: CartService) { }

    ngOnInit() {
        this.loadCart();
    }

    loadCart() {
        this.cart = this.cartService.getCart();
    }

    increaseQty(item: ProductModel) {
        if ((item.quantitySelected ?? 0) + 1 > item.stock) {
            this.alertMsg = `No hay más stock disponible para ${item.name}.`;
            return;
        }

        item.quantitySelected!++;
        this.cartService.saveCart(this.cart);
        this.alertMsg = null;
    }

    decreaseQty(item: ProductModel) {
        if ((item.quantitySelected ?? 1) > 1) {
            item.quantitySelected!--;
            this.cartService.saveCart(this.cart);
        }
    }

    removeItem(item: ProductModel) {
        this.cartService.removeProduct(item.productId);
        this.loadCart();
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
