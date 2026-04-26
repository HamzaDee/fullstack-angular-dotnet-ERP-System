import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { MarsalesinvoiceformComponent } from './marketsalesinvoiceform/marsalesinvoiceform.component';
import { MarsalesinvoicelistComponent } from './marketsalesinvoicelist/marsalesinvoicelist.component';

export const MarsalesRoutingModule: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'Marsalesinvoicelist',
          component: MarsalesinvoicelistComponent,
          data: { title: 'Marsalesinvoicelist', breadcrumb: 'Marsalesinvoicelist', roles: config.authRoles.sa },
        },
        {
          path: 'Marsalesinvoiceform',
          component: MarsalesinvoiceformComponent,
          data: { title: 'SalesInvoicesForm', breadcrumb: 'SalesInvoicesForm', roles: config.authRoles.sa },
        },        
      ]
  }
];


