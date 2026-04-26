import { Routes } from '@angular/router';
import { config } from 'config';
import { CompanyBranchListComponent } from './company-branch-list/company-branch-list.component';
import { CompanyBranchFormComponent } from './company-branch-list/company-branch-form/company-branch-form.component';
export const CompanyBranchRoutes: Routes = [
  {
    path: 'CompanyBranchList',
    data: { title: 'CompanyBranchList', breadcrumb: 'CompanyBranchList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: CompanyBranchListComponent,
        },
        {
          path: 'CompanyBranchForm',
          component: CompanyBranchFormComponent,
          data: { title: 'CompanyBranchForm', breadcrumb: 'CompanyBranchForm', roles: config.authRoles.sa },
        }
      ]
  }
  ,

];


