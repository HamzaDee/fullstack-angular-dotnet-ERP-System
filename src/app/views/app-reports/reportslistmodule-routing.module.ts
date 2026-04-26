import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportListComponent } from './report-list/report-list.component';
import { config } from 'config';
import { ReportViewerComponent } from './report-viewer/report-viewer.component';
import { ReportDesignerComponent } from './report-designer/report-designer.component';


export const ReportslistmoduleRoutingModule: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'ReportList',
          component: ReportListComponent,
          data: { title: 'EditPrint', breadcrumb: 'EditPrint', roles: config.authRoles.sa },
        },
        {
          path: 'ReportViewer',
          component: ReportViewerComponent,
          data: { title: 'ReportViewer', breadcrumb: 'ReportViewer', roles: config.authRoles.sa },
        },
        {
          path: 'ReportDesigner',
          component: ReportDesignerComponent,
          data: { title: 'ReportDesigner', breadcrumb: 'ReportDesigner', roles: config.authRoles.sa },
        },
      ]
  }
];

