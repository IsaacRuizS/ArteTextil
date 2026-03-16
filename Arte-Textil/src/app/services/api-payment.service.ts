import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { PaymentModel } from '../shared/models/payment.model';

@Injectable({ providedIn: 'root' })
export class ApiPaymentService extends ApiBaseService {
    constructor(public override http: HttpClient) { super(http); }

    create(data: { payrollId: number; method?: string; amount?: number }): Observable<PaymentModel> {
        return this.http.post<any>(`${this.baseUrl}/api/payment`, data, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return new PaymentModel(res.data);
            }),
            catchError(err => throwError(() => err))
        );
    }

    getAll(): Observable<PaymentModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/payment`, this.getHttpOptions()).pipe(
            map((res: any) => {
                if (!res?.success) throw new Error(res?.message);
                return (res.data || []).map((x: any) => new PaymentModel(x));
            }),
            catchError(err => throwError(() => err))
        );
    }
}