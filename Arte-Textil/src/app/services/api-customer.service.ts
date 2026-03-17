import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { CustomerModel } from '../shared/models/customer.model';
import { CustomerSegmentModel } from '../shared/models/customer-segment.model';

@Injectable({
    providedIn: 'root'
})
export class ApiCustomerService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/customer/all
    getAll(): Observable<CustomerModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/customer/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener clientes.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new CustomerModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/customer/{id}
    getById(id: number): Observable<CustomerModel> {

        return this.http.get<any>(`${this.baseUrl}/api/customer/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener cliente.');
                    }

                    return new CustomerModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // POST: api/customer
    create(data: CustomerModel): Observable<CustomerModel> {

        return this.http.post<any>(`${this.baseUrl}/api/customer`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al crear cliente.');
                    }

                    return new CustomerModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // PUT: api/customer/{id}
    update(data: CustomerModel): Observable<CustomerModel> {

        return this.http.put<any>(`${this.baseUrl}/api/customer/${data.customerId}`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar cliente.');
                    }

                    return new CustomerModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // PATCH: api/customer/{id}/status
    updateStatus(id: number, isActive: boolean): Observable<boolean> {

        return this.http
            .patch<any>(
                `${this.baseUrl}/api/customer/${id}/status`,
                isActive,
                this.getHttpOptions()
            )
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar estado del cliente.');
                    }

                    return res.data === true;
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/customer/all-active
    getAllActive(): Observable<CustomerModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/customer/all-active`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener clientes.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new CustomerModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/customer/segments
    getSegments(filter?: string): Observable<CustomerSegmentModel[]> {

        let url = `${this.baseUrl}/api/customer/segments`;

        if (filter) url += `?filter=${filter}`;

        return this.http.get<any>(url, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener segmentos.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new CustomerSegmentModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }
}