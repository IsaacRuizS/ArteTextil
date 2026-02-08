import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ApiBaseService } from './api-base.service';
import { UserModel } from '../shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class ApiUserService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // POST: api/user/login
    login(credentials: any): Promise<any> {
        // Assuming the API endpoint is api/user/login or similar, adjusting based on standard pattern
        // If it relies on a specificauth controller, I might need to change this, but based on instructions to use users info:
        return this.http.post(`${this.baseUrl}/api/user/login`, credentials, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al iniciar sesión.');
                }
                return res.data; // Should return { user: UserModel, token: string }
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;
                return Promise.reject(new Error(`Error de autenticación: ${errMsg}`));
            });
    }

    // GET: api/user/all
    getAll(): Promise<UserModel[]> {
        return this.http.get(`${this.baseUrl}/api/user/all`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error desconocido al obtener usuarios.');
                }

                return res.data.map((item: any) => new UserModel(item));
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar usuarios: ${errMsg}`));
            });
    }

    // GET: api/user/{id}
    getById(id: number): Promise<UserModel> {
        return this.http.get(`${this.baseUrl}/api/user/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al obtener el usuario.');
                }

                return new UserModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al cargar usuario: ${errMsg}`));
            });
    }

    // POST: api/user
    create(data: UserModel): Promise<UserModel> {
        return this.http.post(`${this.baseUrl}/api/user`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al crear el usuario.');
                }

                return new UserModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al crear usuario: ${errMsg}`));
            });
    }

    // PUT: api/user
    update(data: UserModel): Promise<UserModel> {
        return this.http.put(`${this.baseUrl}/api/user/${data.userId}`, data, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al actualizar el usuario.');
                }

                return new UserModel(res.data);
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al actualizar usuario: ${errMsg}`));
            });
    }

    // DELETE: api/user/{id}
    delete(id: number): Promise<boolean> {
        return this.http.delete(`${this.baseUrl}/api/user/${id}`, this.getHttpOptions())
            .toPromise()
            .then((res: any) => {
                if (!res?.success) {
                    throw new Error(res?.message || 'Error al eliminar el usuario.');
                }

                return res.data === true;
            })
            .catch((err: HttpErrorResponse | Error) => {
                const errMsg = err instanceof HttpErrorResponse
                    ? this.getErrorMsg(err)
                    : err.message;

                return Promise.reject(new Error(`Error al eliminar usuario: ${errMsg}`));
            });
    }
}