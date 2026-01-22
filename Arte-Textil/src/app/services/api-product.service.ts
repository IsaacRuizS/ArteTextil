import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

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
    getAll(): Promise<ProductModel[]> {
        return this.http.get(`${this.baseUrl}/api/product/all`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error desconocido al obtener productos.');
                }

                return res?.data.map((item: any) => new ProductModel(item));
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar productos: ${errMsg}`));
            });
    }

    // GET: api/product/{id}
    getById(id: number): Promise<ProductModel> {
        return this.http.get(`${this.baseUrl}/api/product/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener el producto.');
                }

                return new ProductModel(res?.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar producto: ${errMsg}`));
            });
    }

    // POST: api/product
    create(data: ProductModel): Promise<ProductModel> {
        return this.http.post(`${this.baseUrl}/api/product`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al crear el producto.');
                }

                return new ProductModel(res?.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al crear producto: ${errMsg}`));
            });
    }

    // PUT: api/product
    update(data: ProductModel): Promise<ProductModel> {
        return this.http.put(`${this.baseUrl}/api/product`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al actualizar el producto.');
                }

                return new ProductModel(res?.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al actualizar producto: ${errMsg}`));
            });
    }

    // DELETE: api/product/{id}
    delete(id: number): Promise<boolean> {
        return this.http.delete(`${this.baseUrl}/api/product/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al eliminar el producto.');
                }

                return res?.data === true;
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al eliminar producto: ${errMsg}`));
            });
    }
}
