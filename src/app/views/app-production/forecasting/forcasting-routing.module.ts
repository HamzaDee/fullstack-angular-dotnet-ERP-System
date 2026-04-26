import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForecastingListComponent } from './forecasting-list/forecasting-list.component';
import { ForecastingFormComponent } from './forecasting-form/forecasting-form.component';
import { config } from 'config';
import { ForecastingSheetComponent } from './forecasting-sheet/forecasting-sheet.component';

export const ForcastingRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'ForecastingList',
          component: ForecastingListComponent,
          data: { title: 'ForecastingList', breadcrumb: 'ForecastingList', roles: config.authRoles.sa },
        },
        {
          path: 'ForecastingForm',
          component: ForecastingFormComponent,
          data: { title: 'ForecastingForm', breadcrumb: 'ForecastingForm', roles: config.authRoles.sa },
        },
        {
          path: 'ForecastingSheet/:id',
          component: ForecastingSheetComponent,
          data: { title: 'ForecastingSheet', breadcrumb: 'ForecastingSheet', roles: config.authRoles.sa },
        },
      ]
  }
];


