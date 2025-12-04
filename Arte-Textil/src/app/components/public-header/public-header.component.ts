import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-public-header',
    templateUrl: './public-header.component.html',
    styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent {

    constructor() { 
    }

    @Output() toggleSidebar = new EventEmitter<void>();

    onToggleSidebar() {

        this.toggleSidebar.emit();
    }
}
