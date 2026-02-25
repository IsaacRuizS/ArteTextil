import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable, throwError } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { AttendanceModel } from '../shared/models/attendance.model';

@Injectable({ providedIn: 'root' })
export class ApiAttendanceService extends ApiBaseService {

    constructor(public override http: HttpClient) { super(http); }

    getAll(): Observable<AttendanceModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/attendance/all`, this.getHttpOptions())
            .pipe(map((res: any) => {
                if (!res?.success) throw new Error(res.message);
                return res.data.map((x: any) => new AttendanceModel(x));
            }));
    }

    checkIn(): Observable<boolean> {
    return this.http.post<any>(
        `${this.baseUrl}/api/attendance/check-in`,
        {},
        this.getHttpOptions()
    ).pipe(
        map((res: any) => {
            if (!res?.success) throw new Error(res?.message || 'Error al marcar entrada');
            return res.data === true;
        }),
        catchError(err => throwError(() => err))
    );
}

    checkOut(): Observable<boolean> {
    return this.http.post<any>(
        `${this.baseUrl}/api/attendance/check-out`,
        {},
        this.getHttpOptions()
    ).pipe(
        map((res: any) => {
            if (!res?.success) throw new Error(res?.message || 'Error al marcar salida');
            return res.data === true;
        }),
        catchError(err => throwError(() => err))
    );
}
}