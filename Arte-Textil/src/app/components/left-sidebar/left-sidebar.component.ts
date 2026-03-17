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
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Marketplace', link: '/marketplace' },
        {
            label: 'Configuración de Catálogo',
            collapsed: true,
            children: [
                { label: 'Proveedores', link: '/suppliers' },
                { label: 'Categorías', link: '/categories' },
                { label: 'Inventario', link: '/inventory' },
                { label: 'Productos', link: '/admin/products' },
                { label: 'Promociones', link: '/promotions' },
                { label: 'Pedidos', link: '/orders-management' },
                { label: 'Cotizaciones', link: '/quotes' },
                { label: 'Clientes', link: '/customers' },
            ]
        },

        {
            label: 'Administración General',
            collapsed: true,
            children: [
                { label: 'Roles', link: '/admin/roles' },
                { label: 'Usuarios', link: '/admin/users' },
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
                { label: 'Cotizaciones y Predicciones', link: '/analytics' },
                { label: 'Predicción de Demanda', link: '/analytics/demand' },
                { label: 'Analítica de Clientes', link: '/customer-analytics' },
                { label: 'Alertas', link: '/analytics/alerts' }
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
