import { Routes } from '@angular/router';
import { config } from 'config';
import { CountryFormComponent } from './country-list/country-form/country-form.component';
import { CountryListComponent } from './country-list/country-list.component';


export const CountriesRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'CountriesList',
          component: CountryListComponent,
          data: { title: 'CountriesList', breadcrumb: 'CountriesList', roles: config.authRoles.sa },
        },
        {
          path: 'CountryForm',
          component: CountryFormComponent,
          data: { title: 'CountryForm', breadcrumb: 'CountryForm', roles: config.authRoles.sa },
        }
      ]
  }
];


