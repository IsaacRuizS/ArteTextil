import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, from, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let refreshInFlight: Observable<string> | null = null;

function refreshOnce(authService: AuthService): Observable<string> {

    if (!refreshInFlight) {

        refreshInFlight = from(authService.refreshAccessToken()).pipe(
            tap({
                complete: () => { refreshInFlight = null; },
                error: () => { refreshInFlight = null; }
            }),
            shareReplay(1)
        );
    }

    return refreshInFlight;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    const authService = inject(AuthService);
    const isBrowser = isPlatformBrowser(platformId);

    const isAuthEndpoint =
        req.url.includes('/login') ||
        req.url.includes('/refresh-token') ||
        req.url.includes('/logout');

    //EXCLUIR IMGBB (CLAVE DEL PROBLEMA)
    const isImgBB = req.url.includes('api.imgbb.com');

    let authReq = req;

    if (!isAuthEndpoint && !isImgBB && isBrowser) {
        const token = authService.token;
        if (token) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {

            // NO intentar refresh con ImgBB
            if (isImgBB) {
                return throwError(() => error);
            }

            // Refresh token SOLO para tu API
            if (
                error.status === 401 &&
                !isAuthEndpoint &&
                isBrowser &&
                authService.isAuthenticated() &&
                authService.refreshToken
            ) {
                return refreshOnce(authService).pipe(
                    catchError(() => {
                        authService.logout();
                        return throwError(() => error);
                    }),
                    switchMap((newToken: string) => {
                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next(retryReq);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
