import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ApiBaseService } from './api-base.service';
import { SupplierModel } from '../shared/models/supplier.model';

@Injectable({
    providedIn: 'root'
})  
export class ApiSupplierService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/supplier/all
    getAll(): Promise<SupplierModel[]> {
        return this.http.get(`${this.baseUrl}/api/supplier/all`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error desconocido al obtener proveedores.');
                }

                return res.data.map((item: any) => new SupplierModel(item));
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar proveedores: ${errMsg}`));
            });
    }

    // GET: api/supplier/{id}
    getById(id: number): Promise<SupplierModel> {
        return this.http.get(`${this.baseUrl}/api/supplier/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener el proveedor.');
                }

                return new SupplierModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar proveedor: ${errMsg}`));
            });
    }

    // POST: api/supplier
    create(data: SupplierModel): Promise<SupplierModel> {
        return this.http.post(`${this.baseUrl}/api/supplier`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al crear el proveedor.');
                }

                return new SupplierModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al crear proveedor: ${errMsg}`));
            });
    }

    // PUT: api/supplier
    update(data: SupplierModel): Promise<SupplierModel> {
        return this.http.put(`${this.baseUrl}/api/supplier/${data.supplierId}`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al actualizar el proveedor.');
                }

                return new SupplierModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al actualizar proveedor: ${errMsg}`));
            });
    }

    // DELETE: api/supplier/{id}
    delete(id: number): Promise<boolean> {
        return this.http.delete(`${this.baseUrl}/api/supplier/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al eliminar el proveedor.');
                }

                return res.data === true;
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al eliminar proveedor: ${errMsg}`));
            });
    }
}
