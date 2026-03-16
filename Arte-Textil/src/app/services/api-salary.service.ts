import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { SalaryModel } from '../shared/models/salary.model';

@Injectable({ providedIn: 'root' })
export class ApiSalaryService extends ApiBaseService {
    constructor(public override http: HttpClient) { super(http); }

    getAll(): Observable<SalaryModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/salary`, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                if (!Array.isArray(res.data)) return [];
                return res.data.map((x: any) => new SalaryModel(x));
            }),
            catchError(err => throwError(() => err))
        );
    }

    create(data: SalaryModel): Observable<SalaryModel> {
        return this.http.post<any>(`${this.baseUrl}/api/salary`, data, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return new SalaryModel(res.data);
            }),
            catchError(err => throwError(() => err))
        );
    }

    update(id: number, data: Partial<SalaryModel>): Observable<SalaryModel> {
        return this.http.put<any>(`${this.baseUrl}/api/salary/${id}`, data, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return new SalaryModel(res.data);
            }),
            catchError(err => throwError(() => err))
        );
    }
}