import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-left-sidebar',
    imports: [],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss',
})
export class LeftSidebarComponent {

    @Input() isClosed = false;

    filteredMenu: any[] = [];
    menu: any[] = [
        { label: 'Dashboard', link: '/dashboard', roles: [1, 4] },
        { label: 'Marketplace', link: '/marketplace', roles: [1, 2, 3, 4] },

        {
            label: 'Configuración de Catálogo',
            collapsed: true,
            roles: [1, 4, 2],
            children: [
                { label: 'Proveedores', link: '/suppliers', roles: [1, 4] },
                { label: 'Categorías', link: '/categories', roles: [1, 4] },
                { label: 'Inventario', link: '/inventory', roles: [1, 4] },
                { label: 'Productos', link: '/admin/products', roles: [1, 2, 4] },
                { label: 'Promociones', link: '/promotions', roles: [1, 4] },
            ]
        },

        {
            label: 'Administración General',
            collapsed: true,
            roles: [1, 4, 2],
            children: [
                { label: 'Roles', link: '/admin/roles', roles: [1] },
                { label: 'Usuarios', link: '/admin/users', roles: [1, 4] },
                { label: 'Pedidos', link: '/orders-management', roles: [1, 2, 4] },
                { label: 'Cotizaciones', link: '/quotes', roles: [1, 2, 4] },
                { label: 'Clientes', link: '/customers', roles: [1, 2, 4] },
            ]
        },

        {
            label: 'Recursos Humanos',
            collapsed: true,
            roles: [1, 2, 4],
            children: [
                { label: 'Asistencia', link: '/hr/attendance', roles: [1, 2, 4] },
                { label: 'Vacaciones', link: '/hr/vacations', roles: [1, 2, 4] },
                { label: 'Ajustes de Planilla', link: '/hr/payroll', roles: [1] },
                { label: 'Salarios', link: '/hr/payroll/salaries', roles: [1 , 2, 4] },
                { label: 'Planillas Mensuales', link: '/hr/payroll/monthly', roles: [1] },
                { label: 'Pagos', link: '/hr/payroll/payments', roles: [1] }
            ]
        },

        {
            label: 'Analítica',
            collapsed: true,
            roles: [1, 4],
            children: [
                { label: 'Cotizaciones', link: '/analytics', roles: [1, 4] },
                { label: 'Alertas', link: '/analytics/alerts', roles: [1, 4] }
            ]
        }
    ];

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.filteredMenu = this.menu
            .map(item => {

                if (!this.hasAccess(item)) return null;

                if (item.children) {
                    const filteredChildren = item.children.filter((c: any) => this.hasAccess(c));

                    if (filteredChildren.length === 0) return null;

                    return { ...item, children: filteredChildren };
                }

                return item;
            })
            .filter(x => x !== null);
    }

    onOpen(item: any) {
        if (item.children) {
            item.collapsed = !item.collapsed;
        } else if (item.link) {
            window.location.href = item.link;
        }
    }

    hasAccess(item: any): boolean {
        if (!item.roles) return true;
        return item.roles.includes(this.userRole);
    }

    get userRole(): number | undefined {
        return this.authService.currentUserValue?.roleId;
    }
}
