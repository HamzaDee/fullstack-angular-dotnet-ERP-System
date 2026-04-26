import { Routes } from '@angular/router';
import { config } from 'config';
import { TransactionLogsListComponent } from './transaction-logs-list/transaction-logs-list.component';

export const TransactionLogsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'TransactionLogsList',
          component: TransactionLogsListComponent,
          data: { title: 'TransactionLogsList', breadcrumb: 'TransactionLogsList', roles: config.authRoles.sa },
        },

      ]
  },
];

