import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';
import { BlankComponent } from './layouts/blank/blank.component';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        children: [

            {
                path: 'marketplace',
                loadComponent: () => import('./Pages/marketplace/marketplace').then(m => m.MarketplaceComponent)
            },
        ]
    },
    {
        path: '',
        component: BlankComponent,
        children: [
            {
                path: 'authentication',
                loadComponent: () => import('./Pages/marketplace/marketplace').then(m => m.MarketplaceComponent)
                //loadChildren: () =>import('./authentication/authentication.routes')
            }
        ]
    },
    {
        path: '**',
        redirectTo: '404'
    }
];
