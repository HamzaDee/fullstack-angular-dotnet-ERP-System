
import { Routes } from '@angular/router';
import { config } from 'config';
import { DealersFormComponent } from './dealers-form/dealers-form.component';
import { DealersListComponent } from './dealers-list/dealers-list.component';




export const DealersRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'GetDealersList',
          component: DealersListComponent,
          data: { title: 'DealersList', breadcrumb: 'DealersList', roles: config.authRoles.sa, type:2 },
        },
        {
          path: 'DealersForm',
          component: DealersFormComponent,
          data: { title: 'DealersForm', breadcrumb: 'DealersForm', roles: config.authRoles.sa },
        },
        {
          path: 'GetCustomersList',
          component: DealersListComponent,
          data: { title: 'DealersList1', breadcrumb: 'DealersList1', roles: config.authRoles.sa, type:1 },
        },
        {
          path: 'DealersForm1',
          component: DealersFormComponent,
          data: { title: 'DealersForm1', breadcrumb: 'DealersForm1', roles: config.authRoles.sa },
        }
      ]
  },
];


