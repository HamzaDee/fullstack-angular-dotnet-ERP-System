import { Routes } from '@angular/router';
import { config } from 'config';
import { BanksformComponent } from './banksform/banksform.component';
import { BanksslistComponent } from './banksslist/banksslist.component'; 
export const BanksRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'banksList',
          component: BanksslistComponent,
          data: { title: 'banksList', breadcrumb: 'banksList', roles: config.authRoles.sa },
        },
        {
          path: 'BanksForm',
          component: BanksformComponent,
          data: { title: 'BanksForm', breadcrumb: 'BanksForm', roles: config.authRoles.sa },
        }
      ]
  }
];


