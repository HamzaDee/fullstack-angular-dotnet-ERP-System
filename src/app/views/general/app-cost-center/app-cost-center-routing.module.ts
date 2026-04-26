import { Routes } from '@angular/router';
import { config } from 'config';
import { AppCostCenterFormComponent } from './cost-center-list/cost-center-form/cost-center-form.component';
import { AppCostCenterListComponent } from './cost-center-list/cost-center-list.component';
import { CostcenterbranchformComponent } from './costcenterbranchform/costcenterbranchform.component';
import { CostCenterTreeComponent } from './cost-center-tree/cost-center-tree.component';
export const CostCenterRoutes: Routes = [
  {
    path: '',
    children:
      [
         {
          path: 'CostCenterList',
          component: AppCostCenterListComponent,
          data: { title: 'CostCenterList', breadcrumb: 'CostCenterList', roles: config.authRoles.sa },
        }, 
        {
          path: 'CostCenterForm',
          component: AppCostCenterFormComponent,
          data: { title: 'CostCenterForm', breadcrumb: 'CostCenterForm', roles: config.authRoles.sa },
        },
        {
          path: 'Costcenterbranchform',
          component: CostcenterbranchformComponent,
          data: { title: 'Costcenterbranchform', breadcrumb: 'Costcenterbranchform', roles: config.authRoles.sa },
        },
        {
          path: 'CostCenterTree',
          component: CostCenterTreeComponent,
          data: { title: 'CostCenterTree', breadcrumb: 'CostCenterTree', roles: config.authRoles.sa },
        }
      ]
  }
];


