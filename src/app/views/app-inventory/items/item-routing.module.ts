import { Routes } from '@angular/router';
import { ItemsListComponent } from './items-list/items-list.component'; 
import { config } from 'config';
import { ItemFormComponent } from './item-form/item-form.component'; 

export const MenuIteamRoutes: Routes = [
  {
    path: 'ItemsList',
    data: { title: 'ItemsList', breadcrumb: 'ItemsList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: ItemsListComponent,
        },
        {
          path: 'ItemForm',
          component: ItemFormComponent,
          data: { title: 'ItemForm', breadcrumb: 'ItemForm', roles: config.authRoles.sa },
        }
      ]
  }
]
