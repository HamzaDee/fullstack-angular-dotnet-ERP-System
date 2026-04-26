import { RouterModule, Routes } from '@angular/router';
import { MaterialRequiredReportComponent } from './material-required-report/material-required-report.component';
import { config } from 'config';
import { MaterialPurchaseReportComponent } from './material-purchase-report/material-purchase-report.component';
import { ReportOfItemsReceivedAsPartOfItComponent } from './report-of-items-received-as-part-of-it/report-of-items-received-as-part-of-it.component';
import { PurchaseExpensesStatementComponent } from './purchase-expenses-statement/purchase-expenses-statement.component';
export const purchaseReportsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'GetMaterialRequiredReport',
          component: MaterialRequiredReportComponent,
          data: { title: 'MaterialRequiredReport', breadcrumb: 'MaterialRequiredReport', roles: config.authRoles.sa}
        },
        {
          path: 'GetMaterialPurchaseReport',
          component: MaterialPurchaseReportComponent,
          data: { title: 'MaterialPurchaseReport', breadcrumb: 'MaterialPurchaseReport', roles: config.authRoles.sa}
        },
        {
          path: 'GetReportOfItemsReceivedReport',
          component: ReportOfItemsReceivedAsPartOfItComponent,
          data: { title: 'ReportOfItemsReceivedAsPartOfIt', breadcrumb: 'ReportOfItemsReceivedAsPartOfIt', roles: config.authRoles.sa}
        },
        {
          path: 'GetPurchaseExpensesStatementReport',
          component: PurchaseExpensesStatementComponent,
          data: { title: 'PurchaseExpensesStatement', breadcrumb: 'PurchaseExpensesStatement', roles: config.authRoles.sa}
        }
      ]
  }
];
