import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-left-sidebar',
    imports: [],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent {

    @Input() isClosed = false;

    menu = [
        { label: 'Inventario', link: '/inventory' },
        { label: 'Categorías', link: '/categories' },
        { label: 'Productos', link: '/products' },
        { label: 'Promociones', link: '/promotions' },
        { label: 'Analítica', link: '/analytics' },
        { label: 'Analítica Clientes', link: '/customer-analytics' },
        { label: 'Marketplace', link: '/marketplace' },
    ];

    constructor() { }

    onOpen(link: string) {
        window.location.href = link;
    }
}
