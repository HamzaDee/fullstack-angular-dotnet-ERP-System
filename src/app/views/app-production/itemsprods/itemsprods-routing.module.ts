import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemsprodListComponent } from './itemsprod-list/itemsprod-list.component'; 
import { config } from 'config';

export const ItemsprodsRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'ItemsProd',
          component: ItemsprodListComponent,
          data: { title: 'ItemsprodList', breadcrumb: 'ItemsprodList', roles: config.authRoles.sa },
        }
      ]
  }
];


