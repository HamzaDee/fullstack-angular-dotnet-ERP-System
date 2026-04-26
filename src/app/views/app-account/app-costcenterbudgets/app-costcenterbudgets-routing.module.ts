import { Routes } from '@angular/router';
import { config } from 'config';
import { CostcenterbudgetsFormComponent } from './costcenterbudgets-form/costcenterbudgets-form.component';
import { CostcenterbudgetsListComponent } from './costcenterbudgets-list/costcenterbudgets-list.component';
export const CostcenterbudgetsRoutes: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'CostcenterbudgetsList',
          component: CostcenterbudgetsListComponent,      
          data: { title: 'CostcenterbudgetsList', breadcrumb: 'CostcenterbudgetsList', roles: config.authRoles.sa },    
        },
        {
          path: 'CostcenterbudgetsForm',
          component: CostcenterbudgetsFormComponent,
          data: { title: 'CostcentersBudgets', breadcrumb: 'CostcentersBudgets', roles: config.authRoles.sa },
        }
      ]
  }
  ,

];