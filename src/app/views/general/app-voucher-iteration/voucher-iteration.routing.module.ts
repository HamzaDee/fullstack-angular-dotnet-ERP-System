
import { Routes } from '@angular/router';
import { config } from 'config';
import { VoucheriterationlistComponent } from './voucheriterationlist/voucheriterationlist.component';
export const VoucheriterationRoutes: Routes = [
  {
    path: 'voucherIterationList',
    data: { title: 'voucherIterationList', breadcrumb: 'voucherIterationList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: VoucheriterationlistComponent,
        }
      ]
  },
];