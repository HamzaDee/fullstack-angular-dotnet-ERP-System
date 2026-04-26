
import { Routes } from '@angular/router';
import { config } from 'config';
import { UsersGroupsFormComponent } from './users-groups-list/users-groups-form/users-groups-form.component';
import { UsersGroupsListComponent } from './users-groups-list/users-groups-list.component';
import { GroupuserpermissinsFormComponent } from './users-groups-list/group-user-permission-form/groupuserpermissins-form.component';
export const UsersGroupsRoutes: Routes = [
  {
    path: 'GetUesrGrouptList',
    data: { title: 'UsersGroupsList', breadcrumb: 'UsersGroupsList', roles: config.authRoles.sa },
    children:
      [
        {
          path: '',
          component: UsersGroupsListComponent,
        },
        {
          path: 'addUserGroup',
          component: UsersGroupsFormComponent,
          data: { title: 'addUserGroup', breadcrumb: 'addUserGroup', roles: config.authRoles.sa },
        },
        {
          path: 'GetUserPermissionForm',
          component: GroupuserpermissinsFormComponent,
          data: { title: 'UserGroupPermissions', breadcrumb: 'UserGroupPermissions', roles: config.authRoles.sa },
        }
      ]
  },
];


