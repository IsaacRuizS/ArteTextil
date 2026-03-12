import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiBaseService } from './api-base.service';
import { CartModel } from '../shared/models/cart.model';

@Injectable({ providedIn: 'root' })
export class ApiCartService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/cart/my — CustomerOnly
    getMyCart(): Observable<CartModel> {
        return this.http.get<any>(`${this.baseUrl}/api/cart/my`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al obtener el carrito.');
                    return new CartModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // POST: api/cart — CustomerOnly
    create(): Observable<CartModel> {
        return this.http.post<any>(`${this.baseUrl}/api/cart`, {}, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al crear el carrito.');
                    return new CartModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PUT: api/cart — CustomerOnly
    update(cart: CartModel): Observable<CartModel> {
        return this.http.put<any>(`${this.baseUrl}/api/cart`, cart, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al actualizar el carrito.');
                    return new CartModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }
}
