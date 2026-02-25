import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { PayrollAdjustmentModel } from '../shared/models/payroll-adjustment.model';

@Injectable({ providedIn: 'root' })
export class ApiPayrollAdjustmentService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // Admin: ver todos
    getAll(): Observable<PayrollAdjustmentModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/payrollAdjustment/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message);
                    return res.data.map((x: any) => new PayrollAdjustmentModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // Colaborador: ver los suyos
    getMine(): Observable<PayrollAdjustmentModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/payrollAdjustment/mine`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message);
                    return res.data.map((x: any) => new PayrollAdjustmentModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // Crear
    create(data: PayrollAdjustmentModel): Observable<PayrollAdjustmentModel> {

        return this.http.post<any>(`${this.baseUrl}/api/payrollAdjustment`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message);
                    return new PayrollAdjustmentModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // Eliminar
    delete(id: number): Observable<boolean> {

        return this.http.delete<any>(`${this.baseUrl}/api/payrollAdjustment/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message);
                    return res.data === true;
                }),
                catchError(err => throwError(() => err))
            );
    }
}