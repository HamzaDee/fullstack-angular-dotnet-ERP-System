import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BanktransferListComponent } from './banktransfer-list/banktransfer-list.component';
import { BanktransferFormComponent } from './banktransfer-form/banktransfer-form.component';
import { config } from 'config';

export const BankTransferRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'BankTransferList',
          component: BanktransferListComponent,
          data: { title: 'BankTransferList', breadcrumb: 'BankTransferList', roles: config.authRoles.sa },
        },
        {
          path: 'BankTransferForm',
          component: BanktransferFormComponent,
          data: { title: 'BankTransferForm', breadcrumb: 'BankTransferForm', roles: config.authRoles.sa },
        },
      ]
  }
];

