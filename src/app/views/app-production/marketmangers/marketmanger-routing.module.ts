import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { MmangerformComponent } from './marketMangerForm/mmangerform.component';
import { MmangerlistComponent } from './marketMangerList/mmangerlist.component';

export const MarketMangerRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'MarketMangerList',
          component: MmangerlistComponent,
          data: { title: 'MarketMangerList', breadcrumb: 'MarketMangerList', roles: config.authRoles.sa },
        },
        {
          path: 'MarketMangerForm',
          component: MmangerformComponent,
          data: { title: 'MarketMangerForm', breadcrumb: 'MarketMangerForm', roles: config.authRoles.sa },
        }
      ]
  }
];


