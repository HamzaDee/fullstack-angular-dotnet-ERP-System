import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { PromoplansformComponent } from './promotionalplansform/promoplansform.component';
import { PromoplanslistComponent } from './promotionalplanslist/promoplanslist.component';

export const PromotionPlansRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'PromotionPlanslist',
          component: PromoplanslistComponent,
          data: { title: 'PromotionPlanslist', breadcrumb: 'PromotionPlanslist', roles: config.authRoles.sa },
        },
        {
          path: 'PromotionPlansform',
          component: PromoplansformComponent,
          data: { title: 'PromotionPlansform', breadcrumb: 'PromotionPlansform', roles: config.authRoles.sa },
        },        
      ]
  }
];


