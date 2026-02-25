import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { DemandModel } from '../shared/models/demand.model';

@Injectable({ providedIn: 'root' })
export class ApiDemandService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    getDemand(product?: string): Observable<DemandModel[]> {

        let url = `${this.baseUrl}/api/demand`;

        if (product) url += `?product=${product}`;

        return this.http.get<any>(url, this.getHttpOptions())
            .pipe(
                map((res: any) => res.map((x: any) => new DemandModel(x))),
                catchError(err => throwError(() => err))
            );
    }
}