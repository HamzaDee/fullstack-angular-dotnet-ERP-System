
import { Routes } from '@angular/router';
import { config } from 'config';
import { TaxFormComponent } from './tax-list/tax-form/tax-form.component';
import { TaxListComponent } from './tax-list/tax-list.component';
export const TaxRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'TaxList',
          component: TaxListComponent,
          data: { title: 'TaxList', breadcrumb: 'TaxList', roles: config.authRoles.sa },
        },
        {
          path: 'TaxForm',
          component: TaxFormComponent,
          data: { title: 'TaxForm', breadcrumb: 'TaxForm', roles: config.authRoles.sa },
        }
      ]
  },
];


