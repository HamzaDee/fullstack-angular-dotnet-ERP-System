import { Routes } from '@angular/router';
import { config } from 'config';
import { EntryvoucherslistComponent } from './entryvoucherslist/entryvoucherslist.component';
import { EntryvoucherformComponent } from './entryvoucherform/entryvoucherform.component';

export const EntryVouchersRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'EntryVouchersList',
          component: EntryvoucherslistComponent,
          data: { title: 'EntryVouchersList', breadcrumb: 'EntryVouchersList', roles: config.authRoles.sa },
        },
        {
          path: 'EntryVoucherForm',
          component: EntryvoucherformComponent,
          data: { title: 'EntryVoucher', breadcrumb: 'EntryVoucher', roles: config.authRoles.sa },
        },
        // {
        //   path: 'AccountBranchForm',
        //   component: AccountbranchformComponent,
        //   data: { title: 'AccountBranchForm', breadcrumb: 'AccountTree', roles: config.authRoles.sa },
        // }
      ]
  }
];


