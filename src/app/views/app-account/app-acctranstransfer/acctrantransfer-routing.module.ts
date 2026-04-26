import { Routes } from '@angular/router';
import { config } from 'config';
import { AcctranstransferFormComponent } from './acctranstransfer-form/acctranstransfer-form.component';
import { AccTranstransferListComponent } from './acctranstransfer-list/acctranstransfer-list.component';
export const AccTranTransferRoutes: Routes = [
  {
    path: '',   
    children:
      [
        {
          path: 'acctranstransferlist',
          component: AccTranstransferListComponent,      
          data: { title: 'acctranstransferlist', breadcrumb: 'acctranstransferlist', roles: config.authRoles.sa },    
        },
        {
          path: 'acctranstransferform',
          component: AcctranstransferFormComponent,
          data: { title: 'acctranstransferform', breadcrumb: 'acctranstransferform', roles: config.authRoles.sa },
        }
      ]
  }
  ,

];