import { Routes } from '@angular/router';
import { config } from 'config';
import { PostingservicesFormComponent } from './postingservices-form/postingservices-form.component';

export const postingServiceRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'postingServiceform',
          component: PostingservicesFormComponent,
          data: { title: 'postingServiceform', breadcrumb: 'postingServiceform', roles: config.authRoles.sa },
        }
      ]
  }
];