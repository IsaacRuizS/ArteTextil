import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authService: AuthService,
        @Inject(PLATFORM_ID) private platformId: object
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (!isPlatformBrowser(this.platformId)) {
            return true;
        }

        if (!this.authService.isAuthenticated()) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }

        const user = this.authService.currentUserValue;

        if (!user) {
            this.router.navigate(['/login']);
            return false;
        }

        if (user.roleId === 3) {
            if (!state.url.startsWith('/marketplace')) {
                this.router.navigate(['/marketplace']);
                return false;
            }
            return true;
        }

        let child = route.firstChild;
        while (child?.firstChild) {
            child = child.firstChild;
        }

        const allowedRoles = child?.data?.['roles'] as number[];

        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.roleId)) {
                this.router.navigate(['/orders-management']);
                return false;
            }
        }

        return true;
    }
}
