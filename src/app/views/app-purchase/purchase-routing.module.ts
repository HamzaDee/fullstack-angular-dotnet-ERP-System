import { Routes } from '@angular/router';
import { config } from 'config';
import { PurchaserequestFormComponent } from './app-purchaseRequest/purchaserequest-form/purchaserequest-form.component';
import { PurchaserequestListComponent } from './app-purchaseRequest/purchaserequest-list/purchaserequest-list.component';
import { PurchaseinvoiceFormComponent } from './app-purchaseinvoice/purchaseinvoice-form/purchaseinvoice-form.component';
import { PurchaseinvoiceListComponent } from './app-purchaseinvoice/purchaseinvoice-list/purchaseinvoice-list.component';
import { ReturnpurinvoiceFormComponent } from './app-ReturnPurInvoice/returnpurinvoice-form/returnpurinvoice-form.component';
import { ReturnpurinvoiceListComponent } from './app-ReturnPurInvoice/returnpurinvoice-list/returnpurinvoice-list.component';
import { IntpurchasereqFormComponent } from './app-InternalPurchaseRequest/intpurRequestFrom/intpurchasereq-form.component';
import { IntpurchasereqListComponent } from './app-InternalPurchaseRequest/intpurRequestList/intpurchasereq-list.component';
import { ServicePurchaseRequestFormComponent } from './ServicePurchaseRequestList/service-purchase-request-form/service-purchase-request-form.component';
import { ServicePurchaseRequestListComponent } from './ServicePurchaseRequestList/service-purchase-request-list/service-purchase-request-list.component';
import { LandedcostformComponent } from './app-landedCost/landedcost-form/landedcostform.component';
import { LandedcostlistComponent } from './app-landedCost/landedcost-list/landedcostlist.component';
export const PurchaseRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'PurchaseRequestList',
          component: PurchaserequestListComponent,
          data: { title: 'PurchaseRequestList', breadcrumb: 'PurchaseRequestList', roles: config.authRoles.sa },
        },
        {
          path: 'PurchaseRequestForm',
          component: PurchaserequestFormComponent,
          data: { title: 'PurchaseRequestForm', breadcrumb: 'PurchaseRequestForm', roles: config.authRoles.sa },
        },
        {
            path: 'PurchaseInvoiceList',
            component: PurchaseinvoiceListComponent,
            data: { title: 'PurchaseInvoiceList', breadcrumb: 'PurchaseInvoiceList', roles: config.authRoles.sa },
        },
        {
            path: 'PurchaseInvoiceForm',
            component: PurchaseinvoiceFormComponent,
            data: { title: 'PurchaseInvoiceForm', breadcrumb: 'PurchaseInvoiceForm', roles: config.authRoles.sa },
        },
        {
          path: 'ReturnPurInvoiceList',
          component: ReturnpurinvoiceListComponent,
          data: { title: 'ReturnPurInvoiceList', breadcrumb: 'ReturnPurInvoiceList', roles: config.authRoles.sa },
        },
        {
            path: 'ReturnPurInvoiceForm',
            component: ReturnpurinvoiceFormComponent,
            data: { title: 'ReturnPurInvoiceForm', breadcrumb: 'ReturnPurInvoiceForm', roles: config.authRoles.sa },
        },                
        {
          path: 'IntpurchasereqList',
          component: IntpurchasereqListComponent,
          data: { title: 'IntpurchasereqList', breadcrumb: 'IntpurchasereqList', roles: config.authRoles.sa },
        },
        {
            path: 'ntpurchasereqForm',
            component: IntpurchasereqFormComponent,
            data: { title: 'ntpurchasereqForm', breadcrumb: 'ntpurchasereqForm', roles: config.authRoles.sa },
        },
        {
            path: 'ServicePurchaseRequestList',
            component: ServicePurchaseRequestListComponent,
            data: { title: 'ServicePurchaseRequestList', breadcrumb: 'ServicePurchaseRequestList', roles: config.authRoles.sa },
        },
        {
            path: 'ServicePurchaseRequestForm',
            component: ServicePurchaseRequestFormComponent,
            data: { title: 'ServicePurchaseRequestForm', breadcrumb: 'ServicePurchaseRequestForm', roles: config.authRoles.sa },
        },
        {
            path: 'LandedCostList',
            component: LandedcostlistComponent,
            data: { title: 'LandedCostList', breadcrumb: 'LandedCostList', roles: config.authRoles.sa },
        },
        {
            path: 'LandedCostForm',
            component: LandedcostformComponent,
            data: { title: 'LandedCostForm', breadcrumb: 'LandedCostForm', roles: config.authRoles.sa },
        },
        

      ]
  }
];