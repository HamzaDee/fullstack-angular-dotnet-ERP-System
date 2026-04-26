
import { Routes } from "@angular/router";
import { config } from 'config';
import { MaintorderformComponent } from "./MaintenanceOrder/MaintenanceOrderForm/maintorderform.component";
import { MaintorderlistComponent } from "./MaintenanceOrder/MaintenanceOrderList/maintorderlist.component";
import { MaintenanceRequestsFormComponent } from "./app-MaintenanceRequests/maintenance-requests-form/maintenance-requests-form.component";
import { MaintenanceRequestsListComponent } from "./app-MaintenanceRequests/maintenance-requests-list/maintenance-requests-list.component";
import { MaintenanceorderrptComponent } from "./app-MaintenanceReports/MaintenanceOrderRpt/maintenanceorderrpt.component";
import { MaintenanceRequestReportComponent } from "./app-MaintenanceReports/maintenance-request-report/maintenance-request-report.component";
import { TechnicalReportComponent } from "./app-MaintenanceReports/technical-report/technical-report.component";
import { MaintenanceFaultReportComponent } from "./app-MaintenanceReports/maintenance-fault-report/maintenance-fault-report.component";

export const AppMaintenanceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'MaintenanceRequestsList',
        component: MaintenanceRequestsListComponent,
        data: { title: 'MaintenanceRequestsList', breadcrumb: 'MaintenanceRequestsList', roles: config.authRoles.sa }
      },
      {
        path: 'MaintenanceRequestsForm',
        component: MaintenanceRequestsFormComponent,
        data: { title: 'MaintenanceRequestsForm', breadcrumb: 'MaintenanceRequestsForm', roles: config.authRoles.sa }
      },
      {
        path: 'GetMaintenanceOrdersForm',
        component: MaintenanceorderrptComponent,
        data: { title: 'MaintenanceOrderReport', breadcrumb: 'MaintenanceOrderReport', roles: config.authRoles.sa }
      },
      {
        path: 'MaintenanceRequestReport',
        component: MaintenanceRequestReportComponent,
        data: { title: 'MaintenanceRequestReport', breadcrumb: 'MaintenanceRequestReport', roles: config.authRoles.sa }
      },
      {
        path: 'GetMaintenanceTechnicalReportForm',
        component: TechnicalReportComponent,
        data: { title: 'TechnicalReport', breadcrumb: 'TechnicalReport', roles: config.authRoles.sa }
      },
      {
          path: 'GetMaintenancelist',
          component: MaintenanceFaultReportComponent,
          data: { title: 'MaintenanceFaultReport', breadcrumb: 'MaintenanceFaultReport', roles: config.authRoles.sa }
      }
    ]
  },
  {
    path: '',
    children:
      [
        {
          path: 'Maintorderlist',
          component: MaintorderlistComponent,
          data: { title: 'Maintorderlist', breadcrumb: 'Maintorderlist', roles: config.authRoles.sa }
        },
        {
          path: 'Maintorderform',
          component: MaintorderformComponent,
          data: { title: 'Maintorderform', breadcrumb: 'Maintorderform', roles: config.authRoles.sa }
        },
       
  
      ]
  }
];


