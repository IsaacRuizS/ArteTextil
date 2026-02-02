import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable, throwError } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { PayrollAdjustmentModel } from '../shared/models/payroll-adjustment.model';

@Injectable({ providedIn: 'root' })
export class ApiPayrollAdjustmentService extends ApiBaseService {

    constructor(public override http: HttpClient) { super(http); }

    create(data: PayrollAdjustmentModel) {
        return this.http.post<any>(`${this.baseUrl}/api/payrolladjustment`, data, this.getHttpOptions());
    }

    getByUser(userId: number) {
        return this.http.get<any>(`${this.baseUrl}/api/payrolladjustment/user/${userId}`, this.getHttpOptions())
            .pipe(map((res: any) => res.data.map((x: any) => new PayrollAdjustmentModel(x))));
    }

    delete(id: number) {
        return this.http.delete<any>(`${this.baseUrl}/api/payrolladjustment/${id}`, this.getHttpOptions());
    }
}