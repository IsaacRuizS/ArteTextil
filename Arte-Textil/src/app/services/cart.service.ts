import { BehaviorSubject } from "rxjs";
import { ProductModel } from "../shared/models/product.model";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CartService {

    private readonly STORAGE_KEY = 'cart_products';

    private cartCountSubject = new BehaviorSubject<number>(0);
    cartCount$ = this.cartCountSubject.asObservable();

    constructor() {

        if (this.isBrowser()) {
            const total = this.getTotalItems();
            this.cartCountSubject.next(total);
        }
    }

    private isBrowser(): boolean {
        return typeof window !== 'undefined' && !!window.localStorage;
    }

    // CORE STORAGE

    getCart(): ProductModel[] {

        if (!this.isBrowser()) return [];

        const data = window.localStorage.getItem(this.STORAGE_KEY);
        if (!data) return [];

        try {
            return JSON.parse(data).map((p: any) => new ProductModel(p));
        } catch {
            return [];
        }
    }

    saveCart(cart: ProductModel[]) {

        if (!this.isBrowser()) return;

        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        this.updateCartCount(cart);
    }

    clearCart() {

        if (!this.isBrowser()) return;

        window.localStorage.removeItem(this.STORAGE_KEY);
        this.cartCountSubject.next(0);
    }

    // CART OPERATIONS

    addProduct(product: ProductModel) {

        if (!this.isBrowser()) return;

        const cart = this.getCart();

        const existing = cart.find(p => p.productId === product.productId);

        if (existing) {
            existing.quantitySelected = Math.min(
                (existing.quantitySelected ?? 0) + (product.quantitySelected ?? 1),
                existing.stock
            );
        } else {
            const clone = new ProductModel({
                ...product,
                quantitySelected: product.quantitySelected ?? 1
            });
            cart.push(clone);
        }

        this.saveCart(cart);
    }

    removeProduct(productId: number) {
        if (!this.isBrowser()) return;

        const cart = this.getCart().filter(p => p.productId !== productId);
        this.saveCart(cart);
    }

    // HELPERS

    getTotalItems(): number {
        return this.getCart()
            .reduce((sum, p) => sum + (p.quantitySelected ?? 0), 0);
    }

    getTotalAmount(): number {
        return this.getCart().reduce((sum, p) => {
            const promo = p.bestPromotion;
            const price = promo
                ? p.price - (p.price * promo.discountPercent! / 100)
                : p.price;

            return sum + (price * (p.quantitySelected ?? 1));
        }, 0);
    }

    private updateCartCount(cart: ProductModel[]) {
        const total = cart.reduce((sum, p) => sum + (p.quantitySelected ?? 0), 0);
        this.cartCountSubject.next(total);
    }
}
