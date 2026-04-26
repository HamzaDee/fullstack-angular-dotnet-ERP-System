import { Routes } from '@angular/router';
import { config } from 'config';
import { PeriodsFiscalyearFormComponent } from './periodsfiscalyear-list/periodsfiscalyear-form/periodsfiscalyear-form.component';
import { PeriodsFiscalyearListComponent } from './periodsfiscalyear-list/periodsfiscalyear-list.component';

export const periodsFiscalyearRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'PeriodsFiscalYearList',
          component: PeriodsFiscalyearListComponent,
          data: { title: 'periodsFiscalyearList', breadcrumb: 'periodsFiscalyearList', roles: config.authRoles.sa },
        },
        {
          path: 'periodsFiscalyearForm',
          component: PeriodsFiscalyearFormComponent,
          data: { title: 'periodsFiscalyearForm', breadcrumb: 'periodsFiscalyearForm', roles: config.authRoles.sa },
        }
      ]
  }
];