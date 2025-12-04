import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-left-sidebar',
    imports: [],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent {

    @Input() isClosed = false;

    constructor() { }

    menu = [
        { label: 'Inventario', link: '/inventory' },
        { label: 'Categorías', link: '/categories' },
        { label: 'Productos', link: '/products' },
        { label: 'Promociones', link: '/promotions' },
    ];
}
