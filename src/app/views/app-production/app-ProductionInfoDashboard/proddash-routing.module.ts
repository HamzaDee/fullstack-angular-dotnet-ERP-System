import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { ProdinfodashboaredComponent } from './prodinfodashboared.component';

export const PproductingDashboaredRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'DashboaredList',
          component: ProdinfodashboaredComponent,
          data: { title: 'BasharDashboar', breadcrumb: 'BasharDashboar', roles: config.authRoles.sa },
        },      
      ]
  }
];


