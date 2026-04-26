import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsGroupsListComponent } from './accounts-groups-list/accounts-groups-list.component';
import { AccountsGroupsFormComponent } from './accounts-groups-form/accounts-groups-form.component';
import { config } from 'config';

export const AccountsGroupsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'AccountsGroupsList',
          component: AccountsGroupsListComponent,
          data: { title: 'AccountsGroupsList', breadcrumb: 'AccountsGroupsList', roles: config.authRoles.sa },
        },
        {
          path: 'AccountsGroupsForm',
          component: AccountsGroupsFormComponent,
          data: { title: 'AccountsGroupsForm', breadcrumb: 'AccountsGroupsForm', roles: config.authRoles.sa },
        }
      ]
  }
];

