import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { PayrollMonthlyModel } from '../shared/models/payroll-monthly.model';

@Injectable({ providedIn: 'root' })
export class ApiPayrollService extends ApiBaseService {
    constructor(public override http: HttpClient) { super(http); }

    // Generar nómina mensual (backend: POST /api/payroll/generate)
    generate(year: number, month: number): Observable<boolean> {

        return this.http.post<any>(
            `${this.baseUrl}/api/payroll/generate`,
            { year, month },
            this.getHttpOptions()
        ).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return true;
            }),
            catchError(err => throwError(() => err))
        );
    }

    // Obtener nóminas mensuales
    getAll(): Observable<PayrollMonthlyModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/payroll`, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return (res.data || []).map((x: any) => new PayrollMonthlyModel(x));
            }),
            catchError(err => throwError(() => err))
        );
    }

    approve(id: number): Observable<boolean> {
        return this.http.put<any>(`${this.baseUrl}/api/payroll/approve/${id}`, {}, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return res.data === true;
            }),
            catchError(err => throwError(() => err))
        );
    }
}