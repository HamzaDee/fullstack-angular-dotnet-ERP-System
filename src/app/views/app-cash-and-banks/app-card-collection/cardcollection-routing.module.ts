import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { CardscollectionformComponent } from './cardcollection-form/cardscollectionform.component';
import { CardscollectionlistComponent } from './cardcollection-list/cardscollectionlist.component';


export const CardscollectionRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'Cardscollectionlist',
          component: CardscollectionlistComponent,
          data: { title: 'Cardscollectionlist', breadcrumb: 'Cardscollectionlist', roles: config.authRoles.sa },
        },
        {
          path: 'Cardscollectionform',
          component: CardscollectionformComponent,
          data: { title: 'Cardscollectionform', breadcrumb: 'Cardscollectionform', roles: config.authRoles.sa },
        },
      ]
  }
];

