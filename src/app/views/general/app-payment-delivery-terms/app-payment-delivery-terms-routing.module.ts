import { Routes } from '@angular/router';
import { config } from 'config';
import { PaymentDeliveryTermsFormComponent } from './payment-delivery-terms-list/payment-delivery-terms-form/payment-delivery-terms-form.component';
import { PaymentDeliveryTermsListComponent } from './payment-delivery-terms-list/payment-delivery-terms-list.component';

export const PaymentDeliveryTermsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'PaymentDeliveryTermsList',
          component: PaymentDeliveryTermsListComponent,
          data: { title: 'PaymentDeliveryTermsList', breadcrumb: 'PaymentDeliveryTermsList', roles: config.authRoles.sa },
        },
        {
          path: 'PaymentDeliveryTermsFormComponent',
          component: PaymentDeliveryTermsFormComponent,
          data: { title: 'PaymentDeliveryTermsFormComponent', breadcrumb: 'PaymentDeliveryTermsFormComponent', roles: config.authRoles.sa },
        }
      ]
  }
];


