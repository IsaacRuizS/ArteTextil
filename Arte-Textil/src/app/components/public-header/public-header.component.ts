import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-public-header',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './public-header.component.html',
    styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent implements OnInit {

    cartCount = 0;

    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(
        private cartService: CartService,
        private router: Router,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.cartService.cartCount$.subscribe(count => {
            this.cartCount = count;
        });
    }

    get isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    onOpenCart() {
        this.router.navigate(['/cart']);
    }

    onNavigateToLogin() {
        this.router.navigate(['/login']);
    }

    onNavigateToRegister() {
        this.router.navigate(['/register']);
    }

    onLogout() {
        this.authService.logout();
    }
}
