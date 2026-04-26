import { Routes } from '@angular/router';
import { config } from 'config';
import { CompanyFormComponent } from './company-list/company-form/company-form.component';
import { CompanyListComponent } from './company-list/company-list.component';

export const CompanyRoutes: Routes = [
  {
    path: 'CompanyList',
    data: { title: 'CompanyList', breadcrumb: 'CompanyList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: CompanyListComponent,
        },
        {
          path: 'CompanyForm',
          component: CompanyFormComponent,
          data: { title: 'CompanyForm', breadcrumb: 'CompanyForm', roles: config.authRoles.sa },
        }
      ]
  }
];

