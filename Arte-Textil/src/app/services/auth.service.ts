import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiUserService } from './api-user.service';
import { UserModel } from '../shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<UserModel | null>;
    public currentUser: Observable<UserModel | null>;

    private readonly TOKEN_KEY = 'auth_token';
    private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
    private readonly USER_KEY = 'auth_user';

    constructor(
        private router: Router,
        private apiUser: ApiUserService,
        @Inject(PLATFORM_ID) private platformId: object
    ) {
        // Solo leer localStorage en el navegador (SSR-safe)
        const savedUser = this.isBrowser ? localStorage.getItem(this.USER_KEY) : null;
        this.currentUserSubject = new BehaviorSubject<UserModel | null>(
            savedUser ? new UserModel(JSON.parse(savedUser)) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    public get currentUserValue(): UserModel | null {
        return this.currentUserSubject.value;
    }

    public get token(): string | null {
        return this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null;
    }

    public get refreshToken(): string | null {
        return this.isBrowser ? localStorage.getItem(this.REFRESH_TOKEN_KEY) : null;
    }

    login(credentials: { email: string; password: string }): Promise<UserModel> {
        return this.apiUser.login(credentials).then((data: any) => {
            // data es AuthResponseDto: { user, token, refreshToken, refreshTokenExpiry }
            const user = new UserModel(data.user);
            this.loginSuccess(user, data.token, data.refreshToken);
            return user;
        });
    }

    loginSuccess(user: UserModel, token: string, refreshToken: string): void {
        if (this.isBrowser) {
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
        this.router.navigate(['/dashboard']);
    }

    async refreshAccessToken(): Promise<string> {
        const rt = this.refreshToken;
        if (!rt) {
            return Promise.reject('No refresh token disponible');
        }

        const data = await this.apiUser.refreshToken(rt);
        // data es AuthResponseDto
        if (this.isBrowser) {
            localStorage.setItem(this.TOKEN_KEY, data.token);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
            localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        }
        this.currentUserSubject.next(new UserModel(data.user));
        return data.token;
    }

    logout(): void {
        const rt = this.refreshToken;
        if (rt) {
            // Invalidar refresh token en el servidor (fire & forget)
            this.apiUser.logout(rt).catch(() => {});
        }
        if (this.isBrowser) {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.REFRESH_TOKEN_KEY);
            localStorage.removeItem(this.USER_KEY);
        }
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        return !!this.token && !!this.currentUserValue;
    }
}
