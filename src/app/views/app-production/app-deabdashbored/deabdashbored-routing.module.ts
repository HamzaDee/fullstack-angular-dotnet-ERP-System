import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { DeabdashboredComponent } from './deabdash/deabdashbored.component';

export const DeabDashboredRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'GetDeabForm',
          component: DeabdashboredComponent,
          data: { title: 'DeabDashbored', breadcrumb: 'DeabDashbored', roles: config.authRoles.sa },
        },      
      ]
  }
];


