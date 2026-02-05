import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { PublicComponent } from './layouts/public/public.component';
import { PayrollAdjustmentsComponent } from './pages/hr/payroll/payroll-adjustments.component';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        children: [
            // HR Routes
            {
                path: 'hr/attendance',
                loadComponent: () => import('./pages/hr/attendance/attendance.component').then(m => m.AttendanceComponent)
            },
            {
                path: 'hr/vacations',
                loadComponent: () => import('./pages/hr/vacations/vacations.component').then(m => m.VacationsComponent)
            },
            {
                path: 'hr/payroll',
                loadComponent: () => import('./pages/hr/payroll/payroll-adjustments.component').then(m => m.PayrollAdjustmentsComponent)
            },
            // Existing Routes
            {
                path: 'inventory',
                loadComponent: () => import('./pages/inventory/inventory').then(m => m.InventoryComponent)
            },
            {
                path: 'categories',
                loadComponent: () =>
                    import('./pages/category-management/category-management.component')
                        .then(m => m.CategoryManagementComponent)
            },
            {
                path: 'promotions',
                loadComponent: () => import('./pages/promotion/promotion.component').then(m => m.PromotionComponent)
            },
            {
                path: 'analytics',
                loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
            },
            {
                path: 'customer-analytics',
                loadComponent: () => import('./pages/analytics/customer-analytics.component/customer-analytics.component').then(m => m.CustomerAnalyticsComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'reports',
                loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent)
            },
            {
                path: 'orders-management',
                loadComponent: () => import('./pages/orders-management/orders-management.component').then(m => m.OrdersManagementComponent)
            },
            {
                path: 'admin/roles',
                loadComponent: () => import('./pages/admin/roles/roles.component').then(m => m.RolesComponent)
            },
            {
                path: 'admin/users',
                loadComponent: () => import('./pages/admin/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'admin/suppliers',
                loadComponent: () => import('./pages/admin/suppliers/suppliers.component').then(m => m.SuppliersComponent)
            },
            {
                path: 'admin/products',
                loadComponent: () => import('./pages/admin/products/products.component').then(m => m.ProductsComponent)
            },

            {
                path: 'production',
                loadComponent: () => import('./pages/production/production-layout.component').then(m => m.ProductionLayoutComponent),
                children: [
                    { path: '', redirectTo: 'tracking', pathMatch: 'full' },
                    { path: 'tracking', loadComponent: () => import('./pages/production/tracking/production-tracking.component').then(m => m.ProductionTrackingComponent) },
                    { path: 'control', loadComponent: () => import('./pages/production/control/order-control.component').then(m => m.OrderControlComponent) },
                    { path: 'reports', loadComponent: () => import('./pages/production/reports/production-reports.component').then(m => m.ProductionReportsComponent) }
                ]
            }
        ]
    },
    {
        path: '',
        component: PublicComponent,
        children: [
            //route to load the componenth and inside the comp load the html and scss 
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
    /* {
        path: '',
        component: BlankComponent,
        children: [
            {
                path: 'authentication',
                loadComponent: () => import('./Pages/marketplace/marketplace').then(m => m.MarketplaceComponent)
                //loadChildren: () =>import('./authentication/authentication.routes')
            }
        ]
    }, */
    {
        path: '**',
        redirectTo: '404'
    }
];
