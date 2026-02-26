import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface UploadImageResponse {
    data: {
        url: string;
    };
    success: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UploadImageService {

    private readonly API_KEY = 'c7059330dda0e423c46cffbd04610afb';
    private readonly API_URL = 'https://api.imgbb.com/1/upload';

    constructor(private http: HttpClient) { }

    uploadImage(file: File): Observable<string> {


        const formData = new FormData();
        formData.append('image', file);

        return this.http
            .post<UploadImageResponse>(
                `${this.API_URL}?key=${this.API_KEY}`,
                formData
            )
            .pipe(
                map(res => {
                    if (!res.success) {
                        throw new Error('Error subiendo imagen a ImgBB');
                    }
                    return res.data.url;
                })
            );
    }
}