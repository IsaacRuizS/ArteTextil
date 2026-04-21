import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { PublicComponent } from './layouts/public/public.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/orders-management/orders-management.component').then(m => m.OrdersManagementComponent),
                data: { roles: [1, 2, 4] }
            },
            // HR Routes
            {
                path: 'hr/attendance',
                loadComponent: () => import('./pages/hr/attendance/attendance.component').then(m => m.AttendanceComponent),
                data: { roles: [1, 2, 4] }
            },
            {
                path: 'hr/vacations',
                loadComponent: () => import('./pages/hr/vacations/vacations.component').then(m => m.VacationsComponent),
                data: { roles: [1, 2, 4] }
            },
            {
                path: 'hr/payroll',
                loadComponent: () => import('./pages/hr/payroll-adjustments/payroll-adjustments.component').then(m => m.PayrollAdjustmentsComponent),
                data: { roles: [1] }
            },
            {
                path: 'hr/payroll/salaries',
                loadComponent: () => import('./pages/hr/payroll/salary.component').then(m => m.SalaryComponent),
                data: { roles: [1, 2, 4] }
            },
            {
                path: 'hr/payroll/monthly',
                loadComponent: () => import('./pages/hr/payroll/payroll-monthly.component').then(m => m.PayrollMonthlyComponent),
                data: { roles: [1] }
            },
            {
                path: 'hr/payroll/payments',
                loadComponent: () => import('./pages/hr/payroll/payments.component').then(m => m.PaymentsComponent),
                data: { roles: [1] }
            },
            // Existing Routes
            {
                path: 'inventory',
                loadComponent: () => import('./pages/inventory/inventory').then(m => m.InventoryComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'categories',
                loadComponent: () =>
                    import('./pages/category-management/category-management.component')
                        .then(m => m.CategoryManagementComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'promotions',
                loadComponent: () => import('./pages/promotion/promotion.component').then(m => m.PromotionComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'analytics/customer-segmentation',
                loadComponent: () =>
                    import('./pages/analytics/customer-analytics.component/customer-analytics.component')
                        .then(m => m.CustomerAnalyticsComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'analytics/demand',
                loadComponent: () =>
                    import('./pages/analytics/demand/demand.component')
                        .then(m => m.DemandComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'analytics/alerts',
                loadComponent: () =>
                    import('./pages/analytics/alerts/alerts.component')
                        .then(m => m.AlertsComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'analytics',
                loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'customer-analytics',
                loadComponent: () => import('./pages/analytics/customer-analytics.component/customer-analytics.component').then(m => m.CustomerAnalyticsComponent),
                data: { roles: [1, 4] }
            },

            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'reports',
                loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'orders-management',
                loadComponent: () => import('./pages/orders-management/orders-management.component').then(m => m.OrdersManagementComponent),
                data: { roles: [1, 2, 4] }
            },
            {
                path: 'admin/roles',
                loadComponent: () => import('./pages/admin/roles/roles.component').then(m => m.RolesComponent),
                data: { roles: [1] }
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'suppliers',
                loadComponent: () => import('./pages/admin/suppliers/suppliers.component').then(m => m.SuppliersComponent),
                data: { roles: [1, 4] }
            },
            {
                path: 'admin/products',
                loadComponent: () => import('./pages/admin/products/products.component').then(m => m.ProductsComponent),
                data: { roles: [1, 2, 4] }
            },
            {
                path: 'customers',
                loadComponent: () => import('./pages/admin/customers/customers.component').then(m => m.CustomersComponent),
                data: { roles: [1, 2, 4] }
            },
            {
                path: 'quotes',
                loadComponent: () => import('./pages/admin/quotes/quotes.component').then(m => m.QuotesComponent),
                data: { roles: [1, 2, 4] }
            },


        ]
    },
    {
        path: '',
        component: BlankComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/login/login').then(m => m.Login)
            },
            {
                path: 'login',
                loadComponent: () => import('./pages/login/login').then(m => m.Login)
            },
            {
                path: 'register',
                loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
            }
        ]
    },
    {
        path: '',
        component: PublicComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
            },
            {
                path: 'marketplace',
                loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
            },
            {
                path: 'product/:id',
                loadComponent: () => import('./pages/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
            },
            {
                path: 'cart',
                loadComponent: () => import('./pages/marketplace/cart/cart.component').then(m => m.CartComponent)
            },
            {
                path: 'quoate',
                loadComponent: () =>
                    import('./pages/marketplace/quote/quote.component')
                        .then(m => m.QuoteComponent)
            }

        ]
    },
    {
        path: '**',
        redirectTo: '404'
    }
];
