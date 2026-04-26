
import { Routes } from '@angular/router';
import { config } from 'config';
import { VoucherTypeFormComponent } from './voucher-type-list/voucher-type-form/voucher-type-form.component';
import { VoucherTypeListComponent } from './voucher-type-list/voucher-type-list.component';
export const VoucherTypeRoutes: Routes = [
  {
    path: 'VoucherTypesList',
    data: { title: 'VoucherTypesList', breadcrumb: 'VoucherTypesList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: VoucherTypeListComponent,
        },
        {
          path: 'VoucherTypeForm',
          component: VoucherTypeFormComponent,
          data: { title: 'VoucherTypeForm', breadcrumb: 'VoucherTypeForm', roles: config.authRoles.sa },
        }
      ]
  },
];


