import { Routes } from '@angular/router';
import { config } from 'config';
import { LinkingUsersToCompaniesBranchesFormComponent } from './user-list/linking-users-to-companies-branches-form/linking-users-to-companies-branches-form.component';
import { UserFormComponent } from './user-list/user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserPermissionsFormComponent } from './user-list/user-permissions-form/user-permissions-form.component';
import { UserMessagesFormComponent } from './user-messages-list/user-messages-form/user-messages-form.component';
import { UserMessagesListComponent } from './user-messages-list/user-messages-list.component';

export const UsersRoutes: Routes = [

  {
    path: '',
    data: { title: 'UserMessagesList', breadcrumb: 'UserMessagesList', roles: config.authRoles.sa },
    children:
      [
        {
          path: 'UserMessagesList',
          component: UserMessagesListComponent,
        },
        {
          path: 'addInternalMessages',
          component: UserMessagesFormComponent,
          data: { title: 'addInternalMessages', breadcrumb: 'addInternalMessages', roles: config.authRoles.sa },
        }
      ]
  }
  ,
  {
    path: 'UserDefinitionList',
    data: { title: 'UserDefinitionList', breadcrumb: 'UserDefinitionList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: UserListComponent,
        },
        {
          path: 'UserForm',
          component: UserFormComponent,
          data: { title: 'UserForm', breadcrumb: 'UserForm', roles: config.authRoles.sa },
        }
        ,
        {
          path: 'LinkingUsersToCompaniesBranchesForm',
          component: LinkingUsersToCompaniesBranchesFormComponent,
          data: { title: 'LinkingUsersToCompaniesBranchesForm', breadcrumb: 'LinkingUsersToCompaniesBranchesForm', roles: config.authRoles.sa },
        }
        ,
        {
          path: 'GetUserPermissionForm',
          component: UserPermissionsFormComponent,
          data: { title: 'UserPermissionsForm', breadcrumb: 'UserPermissionsForm', roles: config.authRoles.sa },
        }
      ]
  }
];