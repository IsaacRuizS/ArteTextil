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