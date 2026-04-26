import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { MaterialforecastComponent } from './materialforecastlist/materialforecast.component';

export const MaterialforecastRouting: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'GetMaterialForecast',
          component: MaterialforecastComponent,
          data: { title: 'Marsalesinvoicelist', breadcrumb: 'Marsalesinvoicelist', roles: config.authRoles.sa },
        },               
      ]
  }
];


