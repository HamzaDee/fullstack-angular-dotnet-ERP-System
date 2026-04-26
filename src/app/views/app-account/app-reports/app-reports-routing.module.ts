import { Routes } from '@angular/router';
import { config } from 'config';
import { AccountsbalancesComponent } from './accountsbalances/accountsbalances.component';
import { AccountsstatementComponent } from './accountsstatement/accountsstatement.component';
import { TrailbalanceComponent } from './trailbalance/trailbalance.component';
import { BranchedaccountstatementComponent } from './branchedaccountstatement/branchedaccountstatement.component';
import { BalancesheetrptComponent } from './balancesheetrpt/balancesheetrpt.component';
import { IncomestatementComponent } from './incomestatement/incomestatement.component';
import { CostcentersbalanceComponent } from './costcentersbalance/costcentersbalance.component';
import { CostcentertransactionsComponent } from './costcentertransactions/costcentertransactions.component';
import { BudgetsreportComponent } from './budgetsreport/budgetsreport.component';
import { CostcenterbudgetsreportComponent } from './costcenterbudgetsreport/costcenterbudgetsreport.component';
import { VoucherstransationsComponent } from './voucherstransations/voucherstransations.component';
import { ChequesreportComponent } from './chequesreport/chequesreport.component';
import { ChequestransactionsComponent } from './chequestransactions/chequestransactions.component';
import { CurrencyexchangeratehistoryComponent } from './currencyexchangeratehistory/currencyexchangeratehistory.component';
import { ServicesinvoicesreportComponent } from './servicesinvoicesreport/servicesinvoicesreport.component';
import { ProjectbalanceComponent } from './projectbalance/projectbalance.component';
import { ProjectstransactionsComponent } from './projectstransactions/projectstransactions.component';
import { UnbalancedtransactionsComponent } from './unbalancedtransactions/unbalancedtransactions.component';
import { ServicereturnComponent } from './returnservicerpt/servicereturn.component';
import { AccountsGroupsReportComponent } from './AccountsGroupsReport/accounts-groups-report/accounts-groups-report.component';
import { CreditcardsreportsComponent } from './creditcardsreports/creditcardsreports.component';
import { RepcollectionsComponent } from './RepresentativeCollections/repcollections.component';
import { AccountagingComponent } from './accountAgingReport/accountaging.component';


export const reportsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'GetAccountBalanceForm',
          component: AccountsbalancesComponent,
          data: { title: 'accountsbalances', breadcrumb: 'accountsbalances', roles: config.authRoles.sa },
        },

        {
          path: 'GetAccountStatementForm',
          component: AccountsstatementComponent,
          data: { title: 'accountsstatement', breadcrumb: 'accountsstatement', roles: config.authRoles.sa },
        },
        {
          path: 'GetTraialBalanceForm',
          component: TrailbalanceComponent,
          data: { title: 'trailbalance', breadcrumb: 'trailbalance', roles: config.authRoles.sa },
        },
        {
          path: 'GetbranchedaccountstatmentForm',
          component: BranchedaccountstatementComponent,
          data: { title: 'branchedaccountstatment', breadcrumb: 'branchedaccountstatment', roles: config.authRoles.sa },
        },
        {
          path: 'GetBalanceSheetForm',
          component: BalancesheetrptComponent,
          data: { title: 'balancesheet', breadcrumb: 'balancesheet', roles: config.authRoles.sa },
        },
        {
          path: 'GetincomestatementForm',
          component: IncomestatementComponent,
          data: { title: 'incomestatement', breadcrumb: 'incomestatement', roles: config.authRoles.sa },
        },
        {
          path: 'GetCostCenterBalancesForm',
          component: CostcentersbalanceComponent,
          data: { title: 'costcentersbalance', breadcrumb: 'costcentersbalance', roles: config.authRoles.sa },
        },
        {
          path: 'GetCostTransactionsForm',
          component: CostcentertransactionsComponent,
          data: { title: 'costcentertransactions', breadcrumb: 'costcentertransactions', roles: config.authRoles.sa },
        },
        {
          path: 'GetBudgetsForm',
          component: BudgetsreportComponent,
          data: { title: 'budgets', breadcrumb: 'budgets', roles: config.authRoles.sa },
        },
        {
          path: 'GetCostCenterBudgetsFormModel',
          component: CostcenterbudgetsreportComponent,
          data: { title: 'costcenterbudgets', breadcrumb: 'costcenterbudgets', roles: config.authRoles.sa },
        },
        {
          path: 'GetVouchersTransactionsForm',
          component: VoucherstransationsComponent,
          data: { title: 'vouchertransactions', breadcrumb: 'vouchertransactions', roles: config.authRoles.sa },
        },
        {
          path: 'GetCheqesForm',
          component: ChequesreportComponent,
          data: { title: 'chequesreport', breadcrumb: 'chequesreport', roles: config.authRoles.sa },
        },
        {
          path: 'GetChequesTranModel',
          component: ChequestransactionsComponent,
          data: { title: 'chequestransreport', breadcrumb: 'chequestransreport', roles: config.authRoles.sa },
        },
        {
          path: 'GetCurrencyPriceForm',
          component: CurrencyexchangeratehistoryComponent,
          data: { title: 'currencyexhangehistory', breadcrumb: 'currencyexhangehistory', roles: config.authRoles.sa },
        },
        {
          path: 'GetServicesInvoicesReportModel',
          component: ServicesinvoicesreportComponent,
          data: { title: 'servicesinvoicereport', breadcrumb: 'servicesinvoicereport', roles: config.authRoles.sa },
        },
        {
          path: 'GetProjectBalancesForm',
          component: ProjectbalanceComponent,
          data: { title: 'projectbalance', breadcrumb: 'projectbalance', roles: config.authRoles.sa },
        },
        {
          path: 'GetProjectsTransForm',
          component: ProjectstransactionsComponent,
          data: { title: 'projecttransactions', breadcrumb: 'projecttransactions', roles: config.authRoles.sa },
        },
        {
          path: 'GetUnbalancedTrans',
          component: UnbalancedtransactionsComponent,
          data: { title: 'unbalancedtransactions', breadcrumb: 'unbalancedtransactions', roles: config.authRoles.sa },
        },
        {
          path: 'GetServicesReturnInvoicesReportModel',
          component: ServicereturnComponent,
          data: { title: 'ReturnService', breadcrumb: 'ReturnService', roles: config.authRoles.sa },
        },
        {
          path: 'GetAccountsGroupsReportForm',
          component: AccountsGroupsReportComponent,
          data: { title: 'AccountsGroupsReport', breadcrumb: 'AccountsGroupsReport', roles: config.authRoles.sa },
        },
        {
          path: 'GetCreditCardsStatusForm',
          component: CreditcardsreportsComponent,
          data: { title: 'CreditCardsStatusReport', breadcrumb: 'CreditCardsStatusReport', roles: config.authRoles.sa },
        },
        {
          path: 'GetRepresentativeCollectionsForm',
          component: RepcollectionsComponent,
          data: { title: 'RepresentativeCollections', breadcrumb: 'RepresentativeCollections', roles: config.authRoles.sa },
        },
        {
          path: 'GetAccountsAgingForm',
          component: AccountagingComponent,
          data: { title: 'AccountsAging', breadcrumb: 'AccountsAging', roles: config.authRoles.sa },
        }
        

        
        
      ]
  }
];