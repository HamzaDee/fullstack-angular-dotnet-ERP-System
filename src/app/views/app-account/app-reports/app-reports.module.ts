import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { AccountsbalancesComponent } from './accountsbalances/accountsbalances.component';
import { reportsRoutes } from './app-reports-routing.module';
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
@NgModule({
  declarations: [
    AccountsbalancesComponent,
    AccountsstatementComponent,
    TrailbalanceComponent,
    BranchedaccountstatementComponent,
    BalancesheetrptComponent,
    IncomestatementComponent,
    CostcentersbalanceComponent,
    CostcentertransactionsComponent,
    BudgetsreportComponent,
    CostcenterbudgetsreportComponent,
    VoucherstransationsComponent,
    ChequesreportComponent,
    ChequestransactionsComponent,
    CurrencyexchangeratehistoryComponent,
    ServicesinvoicesreportComponent,
    ProjectbalanceComponent,
    ProjectstransactionsComponent,
    UnbalancedtransactionsComponent,
    ServicereturnComponent,
    AccountsGroupsReportComponent,
    CreditcardsreportsComponent,
    RepcollectionsComponent,
    AccountagingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    NgApexchartsModule,
    NgxEchartsModule,
    FlexLayoutModule,
    NgChartsModule,
    SharedPipesModule,
    SharedPrimengModule,
    SharedMaterialModule,
    RouterModule.forChild(reportsRoutes)
  ]
})
export class AppReportsModule { }