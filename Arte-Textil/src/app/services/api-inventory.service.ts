import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, Observable } from 'rxjs';

import { ApiBaseService } from './api-base.service';
import {
    InventoryItemModel,
    InventoryMovementModel,
    InventoryReportModel,
    RegisterMovementModel,
    StockAlertModel
} from '../shared/models/inventory.model';

@Injectable({
    providedIn: 'root'
})
export class ApiInventoryService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET: api/inventory
    // RF-03-001: Visualizar inventario con información detallada
    getInventory(): Observable<InventoryItemModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/inventory`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener inventario.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new InventoryItemModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // POST: api/inventory/movement
    // RF-03-002: Registrar entradas y salidas de inventario
    registerMovement(data: RegisterMovementModel): Observable<InventoryMovementModel> {
        return this.http.post<any>(`${this.baseUrl}/api/inventory/movement`, data, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al registrar movimiento.');
                    }

                    return new InventoryMovementModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/inventory/availability/{productId}
    // RF-03-003: Consultar disponibilidad de materiales
    checkAvailability(productId: number): Observable<InventoryItemModel> {
        return this.http.get<any>(`${this.baseUrl}/api/inventory/availability/${productId}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al consultar disponibilidad.');
                    }

                    return new InventoryItemModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/inventory/filter
    // RF-03-004: Filtrar productos del inventario
    filterInventory(search?: string, categoryId?: number, lowStockOnly?: boolean): Observable<InventoryItemModel[]> {
        let queryParams: string[] = [];

        if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
        if (categoryId) queryParams.push(`categoryId=${categoryId}`);
        if (lowStockOnly !== undefined) queryParams.push(`lowStockOnly=${lowStockOnly}`);

        const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

        return this.http.get<any>(`${this.baseUrl}/api/inventory/filter${queryString}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al filtrar inventario.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new InventoryItemModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/inventory/report
    // RF-03-005: Generar reportes de inventario
    generateReport(): Observable<InventoryReportModel> {
        return this.http.get<any>(`${this.baseUrl}/api/inventory/report`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al generar reporte.');
                    }

                    return new InventoryReportModel(res.data);
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/inventory/alerts
    // RF-03-006: Recibir alertas por stock bajo
    getStockAlerts(): Observable<StockAlertModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/inventory/alerts`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener alertas.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new StockAlertModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/inventory/movements
    getAllMovements(): Observable<InventoryMovementModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/inventory/movements`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener movimientos.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new InventoryMovementModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }

    // GET: api/inventory/movements/{productId}
    getMovementHistory(productId: number): Observable<InventoryMovementModel[]> {
        return this.http.get<any>(`${this.baseUrl}/api/inventory/movements/${productId}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) {
                        throw new Error(res?.message || 'Error al obtener historial.');
                    }

                    if (!Array.isArray(res.data)) return [];

                    return res.data.map((x: any) => new InventoryMovementModel(x));
                }),
                catchError(err => {
                    return throwError(() => err);
                })
            );
    }
}
