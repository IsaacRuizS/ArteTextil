import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiBaseService } from './api-base.service';
import { PromotionModel } from '../shared/models/promotion.model';

@Injectable({
    providedIn: 'root'
})
export class ApiPromotionService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/promotion/all
    getAll(): Observable<PromotionModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/promotion/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error desconocido al obtener promociones.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((item: any) => new PromotionModel(item));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/promotion/active
    getAllActive(): Observable<PromotionModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/promotion/active`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error desconocido al obtener promociones activas.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((item: any) => new PromotionModel(item));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/promotion/{id}
    getById(id: number): Observable<PromotionModel> {

        return this.http.get<any>(`${this.baseUrl}/api/promotion/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener la promoción.');
                    }

                    return new PromotionModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // POST: api/promotion
    create(data: PromotionModel): Observable<PromotionModel> {

        return this.http.post<any>(`${this.baseUrl}/api/promotion`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al crear la promoción.');
                    }

                    return new PromotionModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PUT: api/promotion/{id}
    update(data: PromotionModel): Observable<PromotionModel> {

        return this.http.put<any>(`${this.baseUrl}/api/promotion/${data.promotionId}`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar la promoción.');
                    }

                    return new PromotionModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PATCH: api/promotion/{id}/status
    changeStatus(id: number, isActive: boolean): Observable<PromotionModel> {

        return this.http.patch<any>(`${this.baseUrl}/api/promotion/${id}/status`, isActive, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al cambiar estado de la promoción.');
                    }

                    return new PromotionModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }
}
