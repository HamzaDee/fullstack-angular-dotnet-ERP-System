import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintChequeListComponent } from './print-cheque-list/print-cheque-list.component';
import { config } from 'config';
import { PrintChequeFormComponent } from './print-cheque-form/print-cheque-form.component';

export const PrintChequeRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'PrintChequeList',
          component: PrintChequeListComponent,
          data: { title: 'PrintChequeList', breadcrumb: 'PrintChequeList', roles: config.authRoles.sa },
        },
        {
          path: 'PrintChequeForm',
          component: PrintChequeFormComponent,
          data: { title: 'PrintChequeForm', breadcrumb: 'PrintChequeForm', roles: config.authRoles.sa },
        }
      ]
  }
];

