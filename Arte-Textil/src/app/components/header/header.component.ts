import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {

    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(private authService: AuthService) { }

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    onLogout() {
        this.authService.logout();
    }
}
