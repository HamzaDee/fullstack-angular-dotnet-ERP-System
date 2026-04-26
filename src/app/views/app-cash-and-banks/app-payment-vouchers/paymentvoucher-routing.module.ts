import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentlistComponent } from './paymentlist/paymentlist.component';
import { PaymentformComponent } from './paymentform/paymentform.component';
import { config } from 'config';

export const PaymentvoucherRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'PaymentVoucherList',
          component: PaymentlistComponent,
          data: { title: 'PaymentVoucherList', breadcrumb: 'PaymentVoucherList', roles: config.authRoles.sa },
        },
        {
          path: 'Paymentform',
          component: PaymentformComponent,
          data: { title: 'Paymentform', breadcrumb: 'Paymentform', roles: config.authRoles.sa },
        },
      ]
  }
];

