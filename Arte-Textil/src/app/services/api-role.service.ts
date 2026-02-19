import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ApiBaseService } from './api-base.service';
import { RolModel } from '../shared/models/rol.model';

@Injectable({
    providedIn: 'root'
})
export class ApiRolService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/rol/all
    getAll(): Promise<RolModel[]> {
        return this.http.get(`${this.baseUrl}/api/rol/all`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error desconocido al obtener proveedores.');
                }

                return res.data.map((item: any) => new RolModel(item));
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar proveedores: ${errMsg}`));
            });
    }

    // GET: api/rol/{id}
    getById(id: number): Promise<RolModel> {
        return this.http.get(`${this.baseUrl}/api/rol/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener el proveedor.');
                }

                return new RolModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar proveedor: ${errMsg}`));
            });
    }

    // POST: api/rol
    create(data: RolModel): Promise<RolModel> {
        return this.http.post(`${this.baseUrl}/api/rol`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al crear el proveedor.');
                }

                return new RolModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al crear proveedor: ${errMsg}`));
            });
    }

    // PUT: api/rol
    update(data: RolModel): Promise<RolModel> {
        return this.http.put(`${this.baseUrl}/api/rol/${data.roleId}`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al actualizar el proveedor.');
                }

                return new RolModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al actualizar proveedor: ${errMsg}`));
            });
    }

    // PATCH: api/rol/{id}/status
    updateStatus(id: number, isActive: boolean): Promise<boolean> {
        return this.http
            .patch(
                `${this.baseUrl}/api/rol/${id}/status`,
                isActive,
                this.getHttpOptions()
            )
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al actualizar estado del rol.');
                }

                return res.data === true;
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(
                    new Error(`Error al actualizar estado del rol: ${errMsg}`)
                );
            });
    }

}
