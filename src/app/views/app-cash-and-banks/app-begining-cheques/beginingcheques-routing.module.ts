import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeginingchequesFormComponent } from './beginingcheques-form/beginingcheques-form.component';
import { BeginingchequesListComponent } from './beginingcheques-list/beginingcheques-list.component';
import { config } from 'config';


export const BeginingchequesRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'BeginingchequesList',
          component: BeginingchequesListComponent,
          data: { title: 'BeginingchequesList', breadcrumb: 'BeginingchequesList', roles: config.authRoles.sa },
        },
        {
          path: 'Beginingchequesform',
          component: BeginingchequesFormComponent,
          data: { title: 'Beginingchequesform', breadcrumb: 'Beginingchequesform', roles: config.authRoles.sa },
        },
      ]
  }
];

