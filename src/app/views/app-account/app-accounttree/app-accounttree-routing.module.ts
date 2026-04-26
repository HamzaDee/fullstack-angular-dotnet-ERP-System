import { Routes } from '@angular/router';
import { config } from 'config';
import { AccountFormComponent } from './account-form/account-form.component';
import { AccounttreelistComponent } from './accounttreelist/accounttreelist.component';
import { AccountbranchformComponent } from './accountbranchform/accountbranchform.component';


export const AccountTreeRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'AccountTreeList',
          component: AccounttreelistComponent,
          data: { title: 'AccountTree', breadcrumb: 'AccountTree', roles: config.authRoles.sa },
        },
        {
          path: 'AccountForm',
          component: AccountFormComponent,
          data: { title: 'AccountForm', breadcrumb: 'AccountTree', roles: config.authRoles.sa },
        },
        {
          path: 'AccountBranchForm',
          component: AccountbranchformComponent,
          data: { title: 'AccountBranchForm', breadcrumb: 'AccountTree', roles: config.authRoles.sa },
        }
      ]
  }
];


