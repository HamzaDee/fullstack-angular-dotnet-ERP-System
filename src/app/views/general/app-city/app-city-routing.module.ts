import { Routes } from '@angular/router';
import { config } from 'config';
import { CityFormComponent } from './city-list/city-form/city-form.component';
import { CityListComponent } from './city-list/city-list.component';

export const CitiesRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'CityList',
          component: CityListComponent,
          data: { title: 'CityList', breadcrumb: 'CityList', roles: config.authRoles.sa },
        },
        {
          path: 'CityForm',
          component: CityFormComponent,
          data: { title: 'CityForm', breadcrumb: 'CityForm', roles: config.authRoles.sa },
        }
      ]
  }
];


