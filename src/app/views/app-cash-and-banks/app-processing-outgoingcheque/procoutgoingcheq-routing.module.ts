import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcessoutgoingcheqListComponent } from './processoutgoingcheq-list/processoutgoingcheq-list.component';
import { ProcessoutgoingcheqFormComponent } from './processoutgoingcheq-form/processoutgoingcheq-form.component';
import { config } from 'config';

export const ProcOutcheqListRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ProcoutcheqList',
          component: ProcessoutgoingcheqListComponent,
          data: { title: 'ProcoutcheqList', breadcrumb: 'ProcoutcheqList', roles: config.authRoles.sa },
        },
        {
          path: 'ProcoutcheqForm',
          component: ProcessoutgoingcheqFormComponent,
          data: { title: 'ProcoutcheqForm', breadcrumb: 'ProcoutcheqForm', roles: config.authRoles.sa },
        },
      ]
  }
];

