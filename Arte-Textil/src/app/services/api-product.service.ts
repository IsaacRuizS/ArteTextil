import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiBaseService } from './api-base.service';
import { ProductModel } from '../shared/models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ApiProductService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/product/all
    getAll(): Observable<ProductModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/product/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error desconocido al obtener productos.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((item: any) => new ProductModel(item));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/product/{id}
    getById(id: number): Observable<ProductModel> {

        return this.http.get<any>(`${this.baseUrl}/api/product/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener el producto.');
                    }

                    return new ProductModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // POST: api/product
    create(data: ProductModel): Observable<ProductModel> {

        return this.http.post<any>(`${this.baseUrl}/api/product`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al crear el producto.');
                    }

                    return new ProductModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PUT: api/product/{id}
    update(data: ProductModel): Observable<ProductModel> {

        return this.http.put<any>(`${this.baseUrl}/api/product/${data.productId}`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar el producto.');
                    }

                    return new ProductModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // DELETE: api/product/{id}
    delete(id: number): Observable<boolean> {

        return this.http.delete<any>(`${this.baseUrl}/api/product/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al eliminar el producto.');
                    }

                    return res.data === true;
                }),
                catchError(err => throwError(() => err))
            );
    }
}
