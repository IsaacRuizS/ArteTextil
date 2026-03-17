import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiBaseService } from './api-base.service';
import { CartItemModel } from '../shared/models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class ApiCartItemService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/cartitem/my — CustomerOnly
    getMyItems(): Observable<CartItemModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/cartitem/my`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al obtener los items del carrito.');
                    if (!Array.isArray(res.data)) return [];
                    return res.data.map((item: any) => new CartItemModel(item));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // POST: api/cartitem — CustomerOnly
    addItem(dto: { cartId: number; productId: number; quantity: number }): Observable<CartItemModel> {
        return this.http.post<any>(`${this.baseUrl}/api/cartitem`, dto, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al agregar el item al carrito.');
                    return new CartItemModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PUT: api/cartitem — CustomerOnly
    updateQuantity(dto: { cartItemId: number; cartId: number; productId: number; quantity: number }): Observable<CartItemModel> {
        return this.http.put<any>(`${this.baseUrl}/api/cartitem`, dto, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al actualizar la cantidad.');
                    return new CartItemModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // DELETE: api/cartitem/{id}/remove — CustomerOnly
    removeItem(cartItemId: number): Observable<void> {
        return this.http.delete<any>(`${this.baseUrl}/api/cartitem/${cartItemId}/remove`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al eliminar el item del carrito.');
                }),
                catchError(err => throwError(() => err))
            );
    }
}
