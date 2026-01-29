import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-public-header',
    templateUrl: './public-header.component.html',
    styleUrl: './public-header.component.scss',
})
export class PublicHeaderComponent {

    cartCount = 3; 

    constructor() { 
    }

    @Output() toggleSidebar = new EventEmitter<void>();

    onToggleSidebar() {

        this.toggleSidebar.emit();
    }

    onOpenCart(){
        window.location.href = '/cart';
    }
}
