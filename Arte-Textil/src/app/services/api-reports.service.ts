import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';

export interface InventoryReport {
    productId: number;
    code: string;
    productName: string;
    category: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    stockLevel: string;
    totalConsumption: number;
    totalEntries: number;
    rotationIndex: number | null;
    totalAdjustments: number;
    productStatus: string;
    isActive: boolean;
}

export interface SalesReport {
    orderId: number;
    orderDate: string;
    year: number;
    month: number;
    period: string;
    customerId: number;
    customerName: string;
    customerClassification: string | null;
    orderStatus: string;
    deliveryDate: string | null;
    productId: number;
    productCode: string;
    productName: string;
    category: string;
    orderItemId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface CompletedOrdersReport {
    orderId: number;
    orderDate: string;
    year: number;
    month: number;
    period: string;
    deliveryDate: string | null;
    daysToDelivery: number | null;
    customerId: number;
    customerName: string;
    customerClassification: string | null;
    productId: number;
    productCode: string;
    productName: string;
    categoryId: number;
    category: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class ApiReportsService extends ApiBaseService {

    constructor(public override http: HttpClient) {
        super(http);
    }

    // GET /api/reports/inventory
    getInventory(filters: { stockLevel?: string }): Observable<InventoryReport[]> {
        const params = new URLSearchParams();
        if (filters.stockLevel) params.set('stockLevel', filters.stockLevel);
        const query = params.toString() ? `?${params}` : '';

        return this.http.get<any>(`${this.baseUrl}/api/reports/inventory${query}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al obtener reporte de inventario.');
                    return (res.data ?? []) as InventoryReport[];
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET /api/reports/sales
    getSales(filters: { startDate?: string; endDate?: string; customerId?: number | null; productId?: number | null }): Observable<SalesReport[]> {
        const params = new URLSearchParams();
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
        if (filters.customerId) params.set('customerId', filters.customerId.toString());
        if (filters.productId) params.set('productId', filters.productId.toString());
        const query = params.toString() ? `?${params}` : '';

        return this.http.get<any>(`${this.baseUrl}/api/reports/sales${query}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al obtener reporte de ventas.');
                    return (res.data ?? []) as SalesReport[];
                }),
                catchError(err => throwError(() => err))
            );
    }

    // GET /api/reports/completed-orders
    getCompletedOrders(filters: { startDate?: string; endDate?: string; categoryId?: number | null }): Observable<CompletedOrdersReport[]> {
        const params = new URLSearchParams();
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
        if (filters.categoryId) params.set('categoryId', filters.categoryId.toString());
        const query = params.toString() ? `?${params}` : '';

        return this.http.get<any>(`${this.baseUrl}/api/reports/completed-orders${query}`, this.getHttpOptions())
            .pipe(
                map((res: any) => {
                    if (!res?.success) throw new Error(res?.message || 'Error al obtener reporte de pedidos finalizados.');
                    return (res.data ?? []) as CompletedOrdersReport[];
                }),
                catchError(err => throwError(() => err))
            );
    }
}
