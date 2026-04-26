import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferlistComponent } from './transferlist/transferlist.component';
import { TransferformComponent } from './transferform/transferform.component';
import { config } from 'config';


export const TransfervoucherRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'TransferVoucherList',
          component: TransferlistComponent,
          data: { title: 'TransferVoucherList', breadcrumb: 'TransferVoucherList', roles: config.authRoles.sa },
        },
        {
          path: 'TransferVoucherform',
          component: TransferformComponent,
          data: { title: 'TransferVoucherform', breadcrumb: 'TransferVoucherform', roles: config.authRoles.sa },
        },
      ]
  }
];

