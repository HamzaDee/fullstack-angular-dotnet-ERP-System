import { Routes } from '@angular/router';
import { config } from 'config';
import { ServicereturnListComponent } from './returnservice-list/servicereturn-list.component';
import { ServicereturnFormComponent } from './returnservice-form/servicereturn-form.component';

export const ReturnServiceinvoiceRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ReturnServiceInvoiceList',
          component: ServicereturnListComponent,
          data: { title: 'ReturnServiceInvoiceList', breadcrumb: 'ReturnServiceInvoiceList', roles: config.authRoles.sa },
        },
        {
          path: 'ReturnServiceInvoiceForm',
          component: ServicereturnFormComponent,
          data: { title: 'ReturnServiceInvoiceForm', breadcrumb: 'ReturnServiceInvoiceForm', roles: config.authRoles.sa },
        },
 
      ]
  }
];


