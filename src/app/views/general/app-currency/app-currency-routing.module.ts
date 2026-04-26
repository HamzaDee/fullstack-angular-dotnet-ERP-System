
import { Routes } from '@angular/router';
import { config } from 'config';
import { CurrencyFormComponent } from './currency-list/currency-form/currency-form.component';
import { CurrencyListComponent } from './currency-list/currency-list.component';
export const CurrencyRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'CurrencyList',
          component: CurrencyListComponent,
          data: { title: 'CurrencyList', breadcrumb: 'CurrencyList', roles: config.authRoles.sa },
        },
        {
          path: 'CurrencyForm',
          component: CurrencyFormComponent,
          data: { title: 'CurrencyForm', breadcrumb: 'CurrencyForm', roles: config.authRoles.sa },
        }
      ]
  },
];


