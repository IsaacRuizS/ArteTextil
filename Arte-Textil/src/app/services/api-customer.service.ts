import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { CustomerSegmentModel } from '../shared/models/customer-segment.model';

@Injectable({ providedIn: 'root' })
export class ApiCustomerService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    getSegments(filter?: string): Observable<CustomerSegmentModel[]> {

        let url = `${this.baseUrl}/api/customer/segments`;

        if (filter) url += `?filter=${filter}`;

        return this.http.get<any>(url, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message);
                    return res.data.map((x: any) => new CustomerSegmentModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }
}