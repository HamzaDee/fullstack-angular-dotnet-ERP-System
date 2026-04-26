import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { BellamaindasboredComponent } from './maindash/bellamaindasbored.component';

export const MainDashRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'GetMainDashboredForm',
          component: BellamaindasboredComponent,
          data: { title: 'MainDashForm', breadcrumb: 'MainDashForm', roles: config.authRoles.sa },
        },      
      ]
  }
];


