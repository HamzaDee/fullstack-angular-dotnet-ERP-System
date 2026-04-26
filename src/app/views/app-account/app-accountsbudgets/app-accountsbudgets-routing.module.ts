import { Routes } from '@angular/router';
import { config } from 'config';
import { AccountsbudgetsListComponent } from './accountsbudgets-list/accountsbudgets-list.component';
import { AccountsbudgetsFormComponent } from './accountsbudgets-form/accountsbudgets-form.component';
export const AccountsbudgetsRoutes: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'AccountsbudgetsList',
          component: AccountsbudgetsListComponent,      
          data: { title: 'AccountsbudgetsList', breadcrumb: 'AccountsbudgetsList', roles: config.authRoles.sa },    
        },
        {
          path: 'AccountsbudgetsForm',
          component: AccountsbudgetsFormComponent,
          data: { title: 'AccountsbudgetsForm', breadcrumb: 'AccountsbudgetsForm', roles: config.authRoles.sa },
        }
      ]
  }
  ,

];