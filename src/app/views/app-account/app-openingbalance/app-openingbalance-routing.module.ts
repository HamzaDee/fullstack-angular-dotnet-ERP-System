

import { Routes } from '@angular/router';
import { config } from 'config';
import { OpeningbalanceformComponent } from './openingbalanceform/openingbalanceform.component';
import { OpeningbalancelistComponent } from './openingbalancelist/openingbalancelist.component';

export const OpeningBalanceRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'OpeningBalanceList',
          component: OpeningbalancelistComponent,
          data: { title: 'OpeningBalanceList', breadcrumb: 'OpeningBalanceList', roles: config.authRoles.sa },
        },
        {
          path: 'OpeningbalanceForm',
          component: OpeningbalanceformComponent,
          data: { title: 'OpeningBalanceForm', breadcrumb: 'OpeningBalanceForm', roles: config.authRoles.sa },
        },
 
      ]
  }
];


