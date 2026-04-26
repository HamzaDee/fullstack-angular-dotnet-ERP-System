import { Routes } from '@angular/router';
import { config } from 'config';
import { EmployeeFormComponent } from './employees-list/employees-form/employees-form.component';
import { EmployeesListComponent } from './employees-list/employees-list.component';

export const EmployeesRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'EmployeeList',
          component: EmployeesListComponent,
          data: { title: 'EmployeesList', breadcrumb: 'EmployeesList', roles: config.authRoles.sa },
        },
        {
          path: 'EmployeeForm',
          component: EmployeeFormComponent,
          data: { title: 'EmployeeForm', breadcrumb: 'EmployeeForm', roles: config.authRoles.sa },
        }
      ]
  }
];


