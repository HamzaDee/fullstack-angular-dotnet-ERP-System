import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { PaymentlistComponent } from './paymentlist/paymentlist.component';
// import { PaymentformComponent } from './paymentform/paymentform.component';
import { ReceiptformComponent } from './receiptform/receiptform.component';
import { ReceiptlistComponent } from './receiptlist/receiptlist.component';
import { config } from 'config';


export const ReceiptvoucherRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ReceiptVoucherList',
          component: ReceiptlistComponent,
          data: { title: 'ReceiptVoucherList', breadcrumb: 'ReceiptVoucherList', roles: config.authRoles.sa },
        },
        {
          path: 'Receiptform',
          component: ReceiptformComponent,
          data: { title: 'Receiptform', breadcrumb: 'Receiptform', roles: config.authRoles.sa },
        },
      ]
  }
];

