import { Routes } from '@angular/router';
import { config } from 'config';
import { AreaFormComponent } from './area-list/area-form/area-form.component';
import { AreaListComponent } from './area-list/area-list.component';

export const AreasRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'AreaList',
          component: AreaListComponent,
          data: { title: 'AreaList', breadcrumb: 'AreaList', roles: config.authRoles.sa },
        },
        {
          path: 'AreaForm',
          component: AreaFormComponent,
          data: { title: 'AreaForm', breadcrumb: 'AreaForm', roles: config.authRoles.sa },
        }
      ]
  }
];


