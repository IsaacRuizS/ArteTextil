import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { VacationModel } from '../shared/models/vacation.model';

@Injectable({
    providedIn: 'root'
})
export class ApiVacationService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // Colaborador: crear solicitud
    create(data: { startDate: Date; endDate: Date }): Observable<VacationModel> {

        const body = {
            startDate: data.startDate,
            endDate: data.endDate
        };

        return this.http.post<any>(
            `${this.baseUrl}/api/vacation`,
            body,
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al crear solicitud');
                }
                return new VacationModel(res.data);
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Colaborador: ver mis solicitudes
    getMine(): Observable<VacationModel[]> {

        return this.http.get<any>(
            `${this.baseUrl}/api/vacation/mine`,
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener solicitudes');
                }
                if (!Array.isArray(res.data)) return [];
                return res.data.map((x: any) => new VacationModel(x));
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Admin: ver pendientes
    getPending(): Observable<VacationModel[]> {

        return this.http.get<any>(
            `${this.baseUrl}/api/vacation/pending`,
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener pendientes');
                }
                if (!Array.isArray(res.data)) return [];
                return res.data.map((x: any) => new VacationModel(x));
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Admin: aprobar
    approve(id: number): Observable<boolean> {

        return this.http.put<any>(
            `${this.baseUrl}/api/vacation/approve/${id}`,
            {},
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al aprobar');
                }
                return res.data === true;
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Admin: rechazar
    reject(id: number): Observable<boolean> {

        return this.http.put<any>(
            `${this.baseUrl}/api/vacation/reject/${id}`,
            {},
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al rechazar');
                }
                return res.data === true;
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Vistas
    getAll(): Observable<VacationModel[]> {

    return this.http.get<any>(
        `${this.baseUrl}/api/vacation/all`,
        this.getHttpOptions()
    ).pipe(
        map((res: any) => {
            if (!res?.success) throw new Error(res?.message);
            if (!Array.isArray(res.data)) return [];
            return res.data.map((x: any) => new VacationModel(x));
        }),
        catchError(err => throwError(() => err))
    );
}
}