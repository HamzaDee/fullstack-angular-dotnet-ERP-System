import { Routes } from '@angular/router';
import { config } from 'config';
import { ItemsGroupListComponent } from '../items-group/items-group-list/items-group-list.component'
import { ItemsGroupFormComponent } from '../items-group/items-group-form/items-group-form.component';
import { ItemsGroupBranchingComponent } from '../items-group/items-group-branching/items-group-branching.component';
export const ItemsGroupRoutes: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'ItemsGroupsList',
          component: ItemsGroupListComponent,
          data: { title: 'ItemsGroups', breadcrumb: 'ItemsGroups', roles: config.authRoles.sa },
        },
        {
          path: 'ItemsGroupForm',
          component: ItemsGroupFormComponent
        },
        {
          path: 'SubItemsGroup',
          component: ItemsGroupBranchingComponent
        }
      ]
  }
];


