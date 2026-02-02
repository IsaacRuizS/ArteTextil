import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable, throwError } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import { VacationModel } from '../shared/models/vacation.model';

@Injectable({ providedIn: 'root' })
export class ApiVacationService extends ApiBaseService {

    constructor(public override http: HttpClient) { super(http); }

    create(data: VacationModel) {
        return this.http.post<any>(`${this.baseUrl}/api/vacation`, data, this.getHttpOptions());
    }

    getByUser(userId: number) {
        return this.http.get<any>(`${this.baseUrl}/api/vacation/user/${userId}`, this.getHttpOptions())
            .pipe(map((res: any) => res.data.map((x: any) => new VacationModel(x))));
    }

    getPending() {
        return this.http.get<any>(`${this.baseUrl}/api/vacation/pending`, this.getHttpOptions())
            .pipe(map((res: any) => res.data.map((x: any) => new VacationModel(x))));
    }

    approve(id: number, approvedByUserId: number) {
        return this.http.put<any>(`${this.baseUrl}/api/vacation/approve/${id}?approvedByUserId=${approvedByUserId}`, {}, this.getHttpOptions());
    }

    reject(id: number, approvedByUserId: number) {
        return this.http.put<any>(`${this.baseUrl}/api/vacation/reject/${id}?approvedByUserId=${approvedByUserId}`, {}, this.getHttpOptions());
    }
}