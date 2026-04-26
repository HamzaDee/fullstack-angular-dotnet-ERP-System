import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { PromotionitemsformComponent } from './promotionordersform/promotionitemsform.component';
import { PromotionitemslistComponent } from './promotionorderslist/promotionitemslist.component';

export const PromotionOrdersRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'Promotionitemslist',
          component: PromotionitemslistComponent,
          data: { title: 'Promotion', breadcrumb: 'Promotion', roles: config.authRoles.sa },
        },
        {
          path: 'Promotionitemsform',
          component: PromotionitemsformComponent,
          data: { title: 'Promotionitemsform', breadcrumb: 'Promotionitemsform', roles: config.authRoles.sa },
        },        
      ]
  }
];


