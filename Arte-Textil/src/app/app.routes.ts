import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';
import { PublicComponent } from './layouts/public/public.component';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        children: [
            //route to load the componenth and inside the comp load the html and scss 
            {
                path: 'inventory',
                loadComponent: () => import('./Pages/inventory/inventory').then(m => m.InventoryComponent)
            },
            {
                path: 'products',
                loadComponent: () =>
                    import('./Pages/product-catalog/product-catalog.component')
                        .then(m => m.ProductCatalogComponent)
            },
            {
                path: 'categories',
                loadComponent: () =>
                    import('./Pages/category-management/category-management.component')
                        .then(m => m.CategoryManagementComponent)
            },
            {
                path: 'promotions',
                loadComponent: () => import('./Pages/promotion/promotion.component').then(m => m.PromotionComponent)
            },
            {
                path: 'analytics',
                loadComponent: () => import('./Pages/analytics/analytics.component').then(m => m.AnalyticsComponent)
            },
            {
                path: 'customer-analytics',
                loadComponent: () => import('./Pages/analytics/customer-analytics.component/customer-analytics.component').then(m => m.CustomerAnalyticsComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./Pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'reports',
                loadComponent: () => import('./Pages/reports/reports.component').then(m => m.ReportsComponent)
            },
            {
                path: 'orders-management',
                loadComponent: () => import('./Pages/orders-management/orders-management.component').then(m => m.OrdersManagementComponent)
            },

        ]
    },
    {
        path: '',
        component: PublicComponent,
        children: [
            //route to load the componenth and inside the comp load the html and scss 
            {
                path: 'marketplace',
                loadComponent: () => import('./Pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
            },
            {
                path: 'product/:id',
                loadComponent: () => import('./Pages/marketplace/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
            },
            {
                path: 'cart',
                loadComponent: () => import('./Pages/marketplace/cart/cart.component').then(m => m.CartComponent)
            },
            {
                path: 'quoate',
                loadComponent: () =>
                    import('./Pages/marketplace/quote/quote.component')
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
