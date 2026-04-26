import { Routes } from '@angular/router';
import { config } from 'config';
import { FiscalyearFormComponent } from './fiscalyear-list/fiscalyear-form/fiscalyear-form.component';
import { FiscalyearListComponent } from './fiscalyear-list/fiscalyear-list.component';

export const FiscalyearRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'FiscalyearList',
          component: FiscalyearListComponent,
          data: { title: 'FiscalyearList', breadcrumb: 'FiscalyearList', roles: config.authRoles.sa },
        },
        {
          path: 'FiscalyearForm',
          component: FiscalyearFormComponent,
          data: { title: 'FiscalyearForm', breadcrumb: 'FiscalyearForm', roles: config.authRoles.sa },
        }
      ]
  }
];


