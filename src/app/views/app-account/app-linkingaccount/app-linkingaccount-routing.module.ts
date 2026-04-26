import { Routes } from '@angular/router';
import { config } from 'config';
import { LinkingaccountsFormComponent } from './linkingaccounts-form/linkingaccounts-form.component';
/* import { PeriodsFiscalyearFormComponent } from './periodsfiscalyear-list/periodsfiscalyear-form/periodsfiscalyear-form.component';
import { PeriodsFiscalyearListComponent } from './periodsfiscalyear-list/periodsfiscalyear-list.component';
 */
export const linkingAccountsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'linkingaccountsform',
          component: LinkingaccountsFormComponent,
          data: { title: 'linkingAccountsForm', breadcrumb: 'linkingAccountsForm', roles: config.authRoles.sa },
        }
      ]
  }
];