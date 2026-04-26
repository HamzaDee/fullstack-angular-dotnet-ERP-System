import { Routes } from '@angular/router';
import { config } from 'config';
import { DiscountFormComponent } from './discounts-list/discounts-form/discounts-form.component';
import { DiscountsListComponent } from './discounts-list/discounts-list.component';

export const DiscountsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'DiscountsList',
          component: DiscountsListComponent,
          data: { title: 'DiscountsList', breadcrumb: 'DiscountsList', roles: config.authRoles.sa },
        },
        {
          path: 'DiscountForm',
          component: DiscountFormComponent,
          data: { title: 'DiscountForm', breadcrumb: 'DiscountForm', roles: config.authRoles.sa },
        }
      ]
  }
];


