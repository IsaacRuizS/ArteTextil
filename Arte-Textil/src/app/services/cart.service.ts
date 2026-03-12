import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';

import { ProductModel } from '../shared/models/product.model';
import { CartModel } from '../shared/models/cart.model';
import { AuthService } from './auth.service';
import { ApiCartService } from './api-cart.service';
import { ApiCartItemService } from './api-cart-item.service';
import { ApiProductService } from './api-product.service';

@Injectable({ providedIn: 'root' })
export class CartService {

    private readonly STORAGE_KEY = 'cart_products';

    private cartCountSubject = new BehaviorSubject<number>(0);
    cartCount$ = this.cartCountSubject.asObservable();

    private _currentCart: CartModel | null = null;

    constructor(
        private authService: AuthService,
        private apiCart: ApiCartService,
        private apiCartItem: ApiCartItemService,
        private apiProduct: ApiProductService,
    ) {
        if (this.isBrowser()) {
            const total = this.getTotalItems();
            this.cartCountSubject.next(total);
        }
    }

    private isBrowser(): boolean {
        return typeof window !== 'undefined' && !!window.localStorage;
    }

    // CORE STORAGE (localStorage)

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
        this._currentCart = null;
    }

    // SYNC FROM API (CustomerOnly)
    // Fetches cart items from backend and enriches them with product details.
    // Falls back to localStorage if not a customer or on error.
    syncFromApi(): Observable<ProductModel[]> {
        if (!this.authService.isCustomer()) {
            return of(this.getCart());
        }

        return this._ensureCart().pipe(
            switchMap(() => this.apiCartItem.getMyItems()),
            switchMap(items => {
                if (items.length === 0) {
                    this.saveCart([]);
                    return of([]);
                }
                const productRequests = items.map(item => this.apiProduct.getById(item.productId));
                return forkJoin(productRequests).pipe(
                    map(products =>
                        products.map((product, idx) => {
                            product.quantitySelected = items[idx].quantity;
                            product.cartItemId = items[idx].cartItemId;
                            return product;
                        })
                    )
                );
            }),
            tap(products => this.saveCart(products)),
            catchError(() => of(this.getCart()))
        );
    }

    // ADD PRODUCT
    // For Customer: syncs with backend API. For others: localStorage only.
    addProduct(product: ProductModel): Observable<void> {
        if (!this.authService.isCustomer()) {
            this._addToLocalStorage(product);
            return of(void 0);
        }

        return this._ensureCart().pipe(
            switchMap(cart => {
                const localCart = this.getCart();
                const existing = localCart.find(p => p.productId === product.productId);
                const newQty = Math.min(
                    (existing?.quantitySelected ?? 0) + (product.quantitySelected ?? 1),
                    product.stock
                );

                if (existing && existing.cartItemId) {
                    // Update existing item quantity via API
                    return this.apiCartItem.updateQuantity({
                        cartItemId: existing.cartItemId,
                        cartId: cart.cartId,
                        productId: product.productId,
                        quantity: newQty
                    }).pipe(
                        tap(updatedItem => {
                            existing.quantitySelected = updatedItem.quantity;
                            this.saveCart(localCart);
                        }),
                        map(() => void 0 as void)
                    );
                } else {
                    // Add new item via API
                    return this.apiCartItem.addItem({
                        cartId: cart.cartId,
                        productId: product.productId,
                        quantity: product.quantitySelected ?? 1
                    }).pipe(
                        tap(newItem => {
                            const clone = new ProductModel({
                                ...product,
                                quantitySelected: newItem.quantity,
                                cartItemId: newItem.cartItemId
                            });
                            localCart.push(clone);
                            this.saveCart(localCart);
                        }),
                        map(() => void 0 as void)
                    );
                }
            }),
            catchError(() => {
                // Fallback: update localStorage even if API fails
                this._addToLocalStorage(product);
                return of(void 0);
            })
        );
    }

    // REMOVE PRODUCT
    // For Customer: removes from backend. For others: localStorage only.
    removeProduct(productId: number): Observable<void> {
        if (!this.authService.isCustomer()) {
            this._removeFromLocalStorage(productId);
            return of(void 0);
        }

        const localCart = this.getCart();
        const item = localCart.find(p => p.productId === productId);

        if (item?.cartItemId) {
            return this.apiCartItem.removeItem(item.cartItemId).pipe(
                tap(() => this._removeFromLocalStorage(productId)),
                map(() => void 0 as void),
                catchError(() => {
                    this._removeFromLocalStorage(productId);
                    return of(void 0);
                })
            );
        }

        this._removeFromLocalStorage(productId);
        return of(void 0);
    }

    // UPDATE QUANTITY
    // For Customer: syncs quantity change with backend. For others: localStorage only.
    updateQuantity(product: ProductModel, newQty: number): Observable<void> {
        const localCart = this.getCart();
        const item = localCart.find(p => p.productId === product.productId);

        if (!this.authService.isCustomer() || !item?.cartItemId || !this._currentCart) {
            if (item) {
                item.quantitySelected = newQty;
                this.saveCart(localCart);
            }
            return of(void 0);
        }

        return this.apiCartItem.updateQuantity({
            cartItemId: item.cartItemId,
            cartId: this._currentCart.cartId,
            productId: product.productId,
            quantity: newQty
        }).pipe(
            tap(() => {
                if (item) {
                    item.quantitySelected = newQty;
                    this.saveCart(localCart);
                }
            }),
            map(() => void 0 as void),
            catchError(() => {
                if (item) {
                    item.quantitySelected = newQty;
                    this.saveCart(localCart);
                }
                return of(void 0);
            })
        );
    }

    // HELPERS

    getTotalItems(): number {
        return this.getCart().reduce((sum, p) => sum + (p.quantitySelected ?? 0), 0);
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

    // Obtiene o crea el carrito activo del cliente en el backend.
    private _ensureCart(): Observable<CartModel> {
        if (this._currentCart) {
            return of(this._currentCart);
        }
        return this.apiCart.getMyCart().pipe(
            tap(cart => this._currentCart = cart),
            catchError(() =>
                this.apiCart.create().pipe(
                    tap(cart => this._currentCart = cart)
                )
            )
        );
    }

    private _addToLocalStorage(product: ProductModel) {
        const cart = this.getCart();
        const existing = cart.find(p => p.productId === product.productId);
        if (existing) {
            existing.quantitySelected = Math.min(
                (existing.quantitySelected ?? 0) + (product.quantitySelected ?? 1),
                existing.stock
            );
        } else {
            cart.push(new ProductModel({ ...product, quantitySelected: product.quantitySelected ?? 1 }));
        }
        this.saveCart(cart);
    }

    private _removeFromLocalStorage(productId: number) {
        const cart = this.getCart().filter(p => p.productId !== productId);
        this.saveCart(cart);
    }

    private updateCartCount(cart: ProductModel[]) {
        const total = cart.reduce((sum, p) => sum + (p.quantitySelected ?? 0), 0);
        this.cartCountSubject.next(total);
    }
}
