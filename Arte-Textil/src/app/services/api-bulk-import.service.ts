import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BulkImportResult {
    imported: number;
    errors: number;
    errorMessages: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiBulkImportService {
    constructor(private http: HttpClient) {}

    import(entity: string, file: File): Observable<{ data: BulkImportResult }> {
        const formData = new FormData();
        formData.append('file', file);

        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

        return this.http.post<{ data: BulkImportResult }>(
            `${environment.apiUrl}/api/bulkimport/${entity}`, formData, { headers }
        );
    }
}
