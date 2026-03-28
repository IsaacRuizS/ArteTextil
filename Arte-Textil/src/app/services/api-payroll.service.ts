import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { PayrollMonthlyModel } from '../shared/models/payroll-monthly.model';

@Injectable({ providedIn: 'root' })
export class ApiPayrollService extends ApiBaseService {
    constructor(public override http: HttpClient) { super(http); }
    
    // GENERAR NÓMINA
    generate(year: number, month: number): Observable<any> {

        return this.http.post<any>(
            `${this.baseUrl}/api/payroll/generate`,
            { year, month },
            this.getHttpOptions()
        ).pipe(
            map((res: any) => res), // 🔥 SOLO DEVOLVER
            catchError(err => throwError(() => err))
        );
    }


    // OBTENER NÓMINAS
    getAll(): Observable<PayrollMonthlyModel[]> {

        return this.http.get<any>(
            `${this.baseUrl}/api/payroll`,
            this.getHttpOptions()
        ).pipe(
            map((res: any) =>
                (res.data || []).map((x: any) => new PayrollMonthlyModel(x))
            ),
            catchError(err => throwError(() => err))
        );
    }

    // APROBAR
    approve(id: number): Observable<any> {

        return this.http.put<any>(
            `${this.baseUrl}/api/payroll/approve/${id}`,
            {},
            this.getHttpOptions()
        ).pipe(
            map((res: any) => res), // 🔥 SOLO DEVOLVER
            catchError(err => throwError(() => err))
        );
    }
}