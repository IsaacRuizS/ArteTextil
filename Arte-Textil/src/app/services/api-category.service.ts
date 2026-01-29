import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiBaseService } from './api-base.service';
import { CategoryModel } from '../shared/models/category.model';

@Injectable({
    providedIn: 'root'
})
export class ApiCategoryService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/category/all
    getAll(): Observable<CategoryModel[]> {

        return this.http.get<any>(`${this.baseUrl}/api/category/all`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error desconocido al obtener categorías.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((item: any) => new CategoryModel(item));
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET: api/category/{id}
    getById(id: number): Observable<CategoryModel> {

        return this.http.get<any>(`${this.baseUrl}/api/category/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener la categoría.');
                    }

                    return new CategoryModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // POST: api/category
    create(data: CategoryModel): Observable<CategoryModel> {

        return this.http.post<any>(`${this.baseUrl}/api/category`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al crear la categoría.');
                    }

                    return new CategoryModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // PUT: api/category/{id}
    update(data: CategoryModel): Observable<CategoryModel> {

        return this.http.put<any>(`${this.baseUrl}/api/category/${data.categoryId}`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al actualizar la categoría.');
                    }

                    return new CategoryModel(res.data);
                }),
                catchError(err => throwError(() => err))
            );
    }

    // DELETE: api/category/{id}
    delete(id: number): Observable<boolean> {

        return this.http.delete<any>(`${this.baseUrl}/api/category/${id}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {

                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al eliminar la categoría.');
                    }

                    return res.data === true;
                }),
                catchError(err => throwError(() => err))
            );
    }
}
