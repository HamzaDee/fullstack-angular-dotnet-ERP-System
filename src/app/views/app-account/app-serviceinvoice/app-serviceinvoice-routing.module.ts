import { Routes } from '@angular/router';
import { config } from 'config';
import { ServiceInvoiceFormComponent } from './serviceinvoice-form/serviceinvoice-form.component';
import { ServiceInvoiceListComponent } from './serviceinvoice-list/serviceinvoice-list.component';
export const ServiceinvoiceRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ServiceInvoiceList',
          component: ServiceInvoiceListComponent,
          data: { title: 'ServiceInvoiceList', breadcrumb: 'ServiceInvoiceList', roles: config.authRoles.sa },
        },
        {
          path: 'ServiceInvoiceForm',
          component: ServiceInvoiceFormComponent,
          data: { title: 'ServiceInvoiceForm', breadcrumb: 'ServiceInvoiceForm', roles: config.authRoles.sa },
        },
 
      ]
  }
];


