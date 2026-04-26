import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpensesTypesFormComponent } from './expenses-types-form/expenses-types-form.component';
import { ExpensesTypesListComponent } from './expenses-types-list/expenses-types-list.component';
import { config } from 'config';

export const ExpensesTypesroutes: Routes =
 [
  {
    path: '',
    children:
    [
        {
          path: 'ExpensesTypesList',
          component: ExpensesTypesListComponent,
          data: { title: 'ExpensesTypesList', breadcrumb: 'ExpensesTypesList', roles: config.authRoles.sa}
        },
        {
          path: 'ExpensesTypesForm',
          component: ExpensesTypesFormComponent,
          data: { title: 'ExpensesTypesForm', breadcrumb: 'ExpensesTypesForm', roles: config.authRoles.sa}
        }
    ]
  }
 ];


