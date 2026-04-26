import { Routes } from '@angular/router';
import { config } from 'config';
import { StoreslistComponent } from './storeslist/storeslist.component';
import { StoresformComponent } from './storesform/storesform.component';

export const AppStoresRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'StoresList',
          component: StoreslistComponent,
          data: { title: 'StoresList', breadcrumb: 'StoresList', roles: config.authRoles.sa },
        },
        {
          path: 'StoresForm',
          component: StoresformComponent,
          data: { title: 'StoresForm', breadcrumb: 'StoresList', roles: config.authRoles.sa },
        },
        // {
        //   path: 'AccountBranchForm',
        //   component: AccountbranchformComponent,
        //   data: { title: 'AccountBranchForm', breadcrumb: 'AccountTree', roles: config.authRoles.sa },
        // }
      ]
  }
];


