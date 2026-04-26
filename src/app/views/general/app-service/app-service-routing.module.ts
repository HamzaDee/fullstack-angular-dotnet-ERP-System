import { Routes } from '@angular/router';
import { config } from 'config';
import { ServiceFormComponent } from './service-list/service-form/service-form.component';
import { ServiceListComponent } from './service-list/service-list.component';

export const ServiceRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ServicesList',
          component: ServiceListComponent,
          data: { title: 'ServicesList', breadcrumb: 'ServicesList', roles: config.authRoles.sa },
        },
        {
          path: 'ServiceFormComponent',
          component: ServiceFormComponent,
          data: { title: 'ServiceFormComponent', breadcrumb: 'ServiceFormComponent', roles: config.authRoles.sa },
        }
      ]
  }
];


