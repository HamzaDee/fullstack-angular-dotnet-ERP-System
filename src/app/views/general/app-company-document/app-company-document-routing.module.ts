import { Routes } from '@angular/router';
import { config } from 'config';
import { CompanyDocumentFormComponent } from './company-document-list/company-document-form/company-document-form.component';
import { CompanyDocumentListComponent } from './company-document-list/company-document-list.component';
export const CompanyDocumentRoutes: Routes = [
  {
    path: 'CompanyDocumentList',
    data: { title: 'CompanyDocumentList', breadcrumb: 'CompanyDocumentList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: CompanyDocumentListComponent,
        },
        {
          path: 'CompanyDocumentForm',
          component: CompanyDocumentFormComponent,
          data: { title: 'CompanyDocumentForm', breadcrumb: 'CompanyDocumentForm', roles: config.authRoles.sa },
        }
      ]
  }
];

