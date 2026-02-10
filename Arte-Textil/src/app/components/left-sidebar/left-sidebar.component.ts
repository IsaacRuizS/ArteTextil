import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-left-sidebar',
    imports: [],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent {

    @Input() isClosed = false;

    menu: any[] = [
        { label: 'Marketplace', link: '/marketplace' }, 
        {
            label: 'Configuración de Catálogo',
            collapsed: true,
            children: [
                { label: 'Proveedores', link: '/admin/suppliers' },
                { label: 'Categorías', link: '/categories' },
                { label: 'Inventario', link: '/inventory' },
                { label: 'Productos', link: '/admin/products' },
                { label: 'Promociones', link: '/promotions' },
                { label: 'Pedidos', link: '/orders-management' },
            ]
        },

        {
            label: 'Administración General',
            collapsed: true,
            children: [
                { label: 'Roles', link: '/admin/roles' },
                { label: 'Usuarios', link: '/admin/users' },
                { label: 'Proveedores', link: '/admin/suppliers' },
                { label: 'Productos', link: '/admin/products' }
            ]
        },
        {
            label: 'Recursos Humanos',
            collapsed: true,
            children: [
                { label: 'Asistencia', link: '/hr/attendance' },
                { label: 'Vacaciones', link: '/hr/vacations' },
                { label: 'Planillas', link: '/hr/payroll' }
            ]
        },
        {
            label: 'Analítica',
            collapsed: true,
            children: [
                { label: 'Analítica', link: '/analytics' },
                { label: 'Analítica Clientes', link: '/customer-analytics' },
                { label: 'Dashboard', link: '/dashboard' },
                { label: 'Reportes', link: '/reports' },
                { label: 'Producción', link: '/production' }
            ]
        }
    ];

    constructor() { }

    onOpen(item: any) {
        if (item.children) {
            item.collapsed = !item.collapsed;
        } else if (item.link) {
            window.location.href = item.link;
        }
    }
}
