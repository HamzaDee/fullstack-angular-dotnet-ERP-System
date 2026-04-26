import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { CurrencyratelistComponent } from './currencyratelist/currencyratelist.component';


export const CurrencyRateRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'Currencyratelist',
          component: CurrencyratelistComponent,
          data: { title: 'Currencyratelist', breadcrumb: 'Currencyratelist', roles: config.authRoles.sa },
        }
      ]
  },
];


