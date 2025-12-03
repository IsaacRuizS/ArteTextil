import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        children: [
            //route to load the componenth and inside the comp load the html and scss
            {
                path: 'marketplace',
                loadComponent: () => import('./Pages/marketplace/marketplace').then(m => m.MarketplaceComponent)
            },
            {
                path: 'inventory',
                loadComponent: () => import('./Pages/inventory/inventory').then(m => m.InventoryComponent)
            },
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
