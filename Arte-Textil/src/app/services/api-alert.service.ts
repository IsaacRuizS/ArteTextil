import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { AlertModel } from '../shared/models/alert.model';

@Injectable({
    providedIn: 'root'
})
export class ApiAlertService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/alert/all-active
    getAll(): Observable<AlertModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/alert/all-active`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener alertas.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new AlertModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // POST: api/alert/generate — genera las alertas del día sin enviar correos
    generate(force = true): Observable<number> {

        return this.http.post<any>(
            `${this.baseUrl}/api/alert/generate?force=${force}`,
            {},
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al generar las alertas.');
                }
                return res.data as number;
            }),
            catchError(err => throwError(() => err))
        );
    }

    // PATCH: api/alert/read-all
    markAllAsRead(): Observable<number> {

        return this.http.patch<any>(
            `${this.baseUrl}/api/alert/read-all`,
            {},
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al marcar las alertas.');
                }
                return res.data as number;
            }),
            catchError(err => throwError(() => err))
        );
    }

    // PUT: api/alert/{id}/read
    markAsRead(id: number): Observable<boolean> {

    return this.http.patch<any>(
        `${this.baseUrl}/api/alert/${id}/read`,
        true,
        this.getHttpOptions()
    ).pipe(
        map((res: any) => {
            if (!res?.success) {
                throw new Error(res?.message || 'Error al marcar alerta.');
            }
            return true;
        }),
        catchError(err => throwError(() => err))
    );
}
}