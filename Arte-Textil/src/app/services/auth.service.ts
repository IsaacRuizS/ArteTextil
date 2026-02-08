import { Injectable } from '@angular/core';
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
    private readonly USER_KEY = 'auth_user';

    constructor(
        private router: Router,
        private apiUser: ApiUserService
    ) {
        // const savedUser = localStorage.getItem(this.USER_KEY);
        this.currentUserSubject = new BehaviorSubject<UserModel | null>(null); // savedUser ? JSON.parse(savedUser) : null);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): UserModel | null {
        return this.currentUserSubject.value;
    }

    public get token(): string | null {
        // return localStorage.getItem(this.TOKEN_KEY);
        return null;
    }

    login(credentials: { email: string, password: string }): Promise<UserModel> {
        return this.apiUser.login(credentials).then((data: any) => {
            // Backend returns UserDto directly in data property of API response
            // ApiUserService.login returns res.data, so 'data' here IS the user object
            const user = new UserModel(data);
            // No token handling as we are not using it
            const token = '';

            this.loginSuccess(user, token);
            return user;
        });
    }

    loginSuccess(user: UserModel, token: string): void {
        // localStorage.setItem(this.TOKEN_KEY, token);
        // localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.router.navigate(['/dashboard']); // Navigate to dashboard after login
    }

    logout(): void {
        // localStorage.removeItem(this.TOKEN_KEY);
        // localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    isAuthenticated(): boolean {
        // return !!this.token; 
        return !!this.currentUserValue; // Check if we have a user in memory
    }
}
