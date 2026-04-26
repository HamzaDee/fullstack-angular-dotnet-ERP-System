import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationsSettingsListComponent } from './notifications-settings-list/notifications-settings-list.component';
import { config } from 'config';

export const NotificationsSettingsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'NotificationsSettingsList',
          component: NotificationsSettingsListComponent,
          data: { title: 'NotificationsSettingsList', breadcrumb: 'NotificationsSettingsList', roles: config.authRoles.sa }
        }

      ]

  }
];

