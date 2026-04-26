import { Routes } from '@angular/router';
import { config } from 'config';
import { AuditChangesLogsListComponent } from './audit-changes-logs-list/audit-changes-logs-list.component';

export const AuditChangesLogsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'AuditChangesLogsList',
          component: AuditChangesLogsListComponent,
          data: { title: 'AuditChangesLogsList', breadcrumb: 'AuditChangesLogsList', roles: config.authRoles.sa },
        }
      ]
  }
];

