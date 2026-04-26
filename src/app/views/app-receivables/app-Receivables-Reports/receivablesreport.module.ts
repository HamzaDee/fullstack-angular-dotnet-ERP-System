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
import { AppReceivablesRoutes } from '../app-receivables-routing.module';
import { CustomerbalancesComponent } from './customerBalancesRpt/customerbalances/customerbalances.component';
import { CustomeraccountstatementComponent } from './CustomerAccountStatement/customeraccountstatement.component';
import { CustomertransactionsComponent } from './CustomerTransactionsRpt/customertransactions.component';
import { CustomeragingComponent } from './CustomerAging/customeraging.component';
import { PaidbillsComponent } from './PaymentVouchersRpt/paidbills.component';
@NgModule({
  declarations: [
    CustomerbalancesComponent,
    CustomeraccountstatementComponent,
    CustomertransactionsComponent,
    CustomeragingComponent,
    PaidbillsComponent
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
    RouterModule.forChild(AppReceivablesRoutes)
  ]
})
export class AppCustomerReportsModule { }