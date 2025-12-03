import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {

    constructor() { 
    }

    @Output() toggleSidebar = new EventEmitter<void>();

    onToggleSidebar() {

        this.toggleSidebar.emit();
    }
}
