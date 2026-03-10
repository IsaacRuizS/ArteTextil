import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { OrderModel } from '../shared/models/order.model';
import { OrderStatusHistoryModel } from '../shared/models/order-status-history.model';

@Injectable({
    providedIn: 'root'
})
export class ApiOrderService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/order/all
    getAll(): Observable<OrderModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/order/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener órdenes.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new OrderModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/order/{id}
    getById(id: number): Observable<OrderModel> {

        return this.http.get<any>(`${this.baseUrl}/api/order/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener orden.');
                    }

                    return new OrderModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // POST: api/order
    create(data: OrderModel): Observable<OrderModel> {

        return this.http.post<any>(`${this.baseUrl}/api/order`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al crear orden.');
                    }

                    return new OrderModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PUT: api/order/{id}
    update(data: OrderModel): Observable<OrderModel> {

        return this.http.put<any>(
            `${this.baseUrl}/api/order/${data.orderId}`,
            data,
            this.getHttpOptions()
        )
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar orden.');
                    }

                    return new OrderModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PATCH: api/order/{id}/status
    changeStatus(id: number, newStatus: string): Observable<boolean> {

        return this.http.patch<any>(
            `${this.baseUrl}/api/order/${id}/status`,
            newStatus,
            this.getHttpOptions()
        )
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al cambiar estado.');
                    }

                    return res.data === true;
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PATCH: api/order/{id}/active
    updateIsActive(id: number, isActive: boolean): Observable<boolean> {

        return this.http.patch<any>(
            `${this.baseUrl}/api/order/${id}/active`,
            isActive,
            this.getHttpOptions()
        )
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar estado de la orden.');
                    }

                    return res.data === true;
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/order/all-active
    getAllActive(): Observable<OrderModel[]> {

        return this.http.get<any>(
            `${this.baseUrl}/api/order/all-active`,
            this.getHttpOptions()
        )
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener órdenes activas.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new OrderModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/order/{orderId}/status-history
    getStatusHistory(orderId: number): Observable<OrderStatusHistoryModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/order/${orderId}/status-history`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener historial de estados.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new OrderStatusHistoryModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }
}