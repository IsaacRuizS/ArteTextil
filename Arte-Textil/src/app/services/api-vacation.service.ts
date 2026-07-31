import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { VacationModel } from '../shared/models/vacation.model';
import { VacationBalanceModel } from '../shared/models/vacation-balance.model';

@Injectable({
    providedIn: 'root'
})
export class ApiVacationService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // Colaborador: crear solicitud
    create(data: any): Observable<VacationModel> {

        return this.http.post<any>(
            `${this.baseUrl}/api/vacation`,
            data,
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

    getAvailableDays(): Observable<number> {
        return this.http.get<number>(
            `${this.baseUrl}/api/vacation/available-days`,
            this.getHttpOptions()
        ).pipe(
            map((event: any) => {
                if (event?.body !== undefined) {
                    return event.body;
                }
                return event;
            })
        );
    }

    // Colaborador: desglose de su propio saldo
    getBalance(): Observable<VacationBalanceModel> {

        return this.http.get<any>(
            `${this.baseUrl}/api/vacation/balance`,
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener el saldo de vacaciones');
                }
                return new VacationBalanceModel(res.data);
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Admin: saldo de todos los colaboradores
    getAllBalances(): Observable<VacationBalanceModel[]> {

        return this.http.get<any>(
            `${this.baseUrl}/api/vacation/balances`,
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener los saldos de vacaciones');
                }
                if (!Array.isArray(res.data)) return [];
                return res.data.map((x: any) => new VacationBalanceModel(x));
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