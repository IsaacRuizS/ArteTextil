import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    const authService = inject(AuthService);
    const isBrowser = isPlatformBrowser(platformId);

    // No adjuntar token en endpoints de autenticación para evitar loops
    const isAuthEndpoint =
        req.url.includes('/login') ||
        req.url.includes('/refresh-token') ||
        req.url.includes('/logout');

    let authReq = req;
    if (!isAuthEndpoint && isBrowser) {
        const token = authService.token;
        if (token) {
            authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Si es 401 y hay refresh token disponible, intentar renovar
            if (error.status === 401 && !isAuthEndpoint && isBrowser && authService.refreshToken) {
                return from(authService.refreshAccessToken()).pipe(
                    switchMap((newToken: string) => {
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        });
                        return next(retryReq);
                    }),
                    catchError(() => {
                        authService.logout();
                        return throwError(() => error);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
