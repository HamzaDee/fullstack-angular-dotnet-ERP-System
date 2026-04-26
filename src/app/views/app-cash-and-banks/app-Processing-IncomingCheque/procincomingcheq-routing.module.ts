import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcincheqListComponent } from './procincheq-list/procincheq-list.component';
import { ProcincheqFormComponent } from './procincheq-form/procincheq-form.component';
import { config } from 'config';

export const ProcincheqListRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ProcincheqList',
          component: ProcincheqListComponent,
          data: { title: 'ProcincheqList', breadcrumb: 'ProcincheqList', roles: config.authRoles.sa },
        },
        {
          path: 'ProcincheqForm',
          component: ProcincheqFormComponent,
          data: { title: 'ProcincheqForm', breadcrumb: 'ProcincheqForm', roles: config.authRoles.sa },
        },
      ]
  }
];

