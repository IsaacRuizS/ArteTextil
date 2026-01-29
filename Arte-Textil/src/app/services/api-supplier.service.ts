import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

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
    getAll(): Observable<SupplierModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/supplier/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener proveedores.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new SupplierModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/supplier/{id}
    getById(id: number): Observable<SupplierModel> {

        return this.http.get<any>(`${this.baseUrl}/api/supplier/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener proveedor.');
                    }

                    return new SupplierModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // POST: api/supplier
    create(data: SupplierModel): Observable<SupplierModel> {

        return this.http.post<any>(`${this.baseUrl}/api/supplier`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al crear proveedor.');
                    }

                    return new SupplierModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // PUT: api/supplier/{id}
    update(data: SupplierModel): Observable<SupplierModel> {

        return this.http.put<any>(`${this.baseUrl}/api/supplier/${data.supplierId}`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar proveedor.');
                    }

                    return new SupplierModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // DELETE: api/supplier/{id}
    delete(id: number): Observable<boolean> {

        return this.http.delete<any>(`${this.baseUrl}/api/supplier/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al eliminar proveedor.');
                    }

                    return res.data === true;
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }
}
