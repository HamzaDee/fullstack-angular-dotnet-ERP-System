import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { ReorderingsComponent } from './reorderingform/reorderings.component';

export const ReorderingRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'ReorderingsList',
          component: ReorderingsComponent,
          data: { title: 'ReorderingsList', breadcrumb: 'ReorderingsList', roles: config.authRoles.sa },
        },      
      ]
  }
];


