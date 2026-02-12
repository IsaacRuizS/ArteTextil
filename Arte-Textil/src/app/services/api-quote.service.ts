import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, Observable, throwError } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import { QuoteModel } from '../shared/models/quote.model';

@Injectable({ providedIn: 'root' })
export class ApiQuoteService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET ALL
    getAll(): Observable<QuoteModel[]> {
        return this.http
            .get<any>(`${this.baseUrl}/api/quote/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res.message);
                    return res.data.map((x: any) => new QuoteModel(x));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET BY ID
    getById(id: number): Observable<QuoteModel> {
        return this.http
            .get<any>(`${this.baseUrl}/api/quote/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res.message);
                    return new QuoteModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // CREATE
    create(model: QuoteModel): Observable<QuoteModel> {
        return this.http
            .post<any>(`${this.baseUrl}/api/quote`, model, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res.message);
                    return new QuoteModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // UPDATE
    update(model: QuoteModel): Observable<QuoteModel> {
        return this.http
            .put<any>(`${this.baseUrl}/api/quote/${model.quoteId}`, model, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res.message);
                    return new QuoteModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // DELETE
    delete(id: number): Observable<boolean> {
        return this.http
            .delete<any>(`${this.baseUrl}/api/quote/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res.message);
                    return res.data;
                }),
                catchError(err => throwError(() => err))
            );
    }
}
