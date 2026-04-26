import { Routes } from '@angular/router';
import { config } from 'config';
import { MainSystemDefinitionsFormComponent } from './main-system-definitions-list/main-system-definitions-form/main-system-definitions-form.component';
import { MainSystemDefinitionsListComponent } from './main-system-definitions-list/main-system-definitions-list.component';
export const MainSystemDefinitionsRoutes: Routes = [
  {
    path: '',
    data: { title: 'MainSystemDefinitionsList', breadcrumb: 'MainSystemDefinitionsList', roles: config.authRoles.sa },
    children:
      [
        {
          path: 'MainSystemDefinitionsList',
          component: MainSystemDefinitionsListComponent,
        },
        {
          path: 'MainSystemDefinitionsForm',
          component: MainSystemDefinitionsFormComponent,
          data: { title: 'MainSystemDefinitionsForm', breadcrumb: 'MainSystemDefinitionsForm', roles: config.authRoles.sa },
        }
      ]
  }
];


