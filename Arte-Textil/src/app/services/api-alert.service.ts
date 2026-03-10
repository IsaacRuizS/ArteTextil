import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { AlertModel } from '../shared/models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class ApiAlertService extends ApiBaseService {

  constructor(public override http: HttpClient) {
    super(http);
  }

  getAll(): Observable<AlertModel[]> {

    return this.http.get<any>(`${this.baseUrl}/api/alert`, this.getHttpOptions())
      .pipe(
        map((res: any) => res.map((x: any) => new AlertModel(x))),
        catchError(err => throwError(() => err))
      );
  }
}