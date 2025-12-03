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
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Clientes', link: '/clientes' },
        { label: 'Ventas', link: '/ventas' },
        { label: 'Inventario', link: '/inventario' }
    ];
}
