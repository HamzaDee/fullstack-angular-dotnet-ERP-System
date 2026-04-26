import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialRequiredReportComponent } from './material-required-report/material-required-report.component';
import { RouterModule } from '@angular/router';
import { purchaseReportsRoutes } from './purchase-report-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { MaterialPurchaseReportComponent } from './material-purchase-report/material-purchase-report.component';
import { ReportOfItemsReceivedAsPartOfItComponent } from './report-of-items-received-as-part-of-it/report-of-items-received-as-part-of-it.component';
import { PurchaseExpensesStatementComponent } from './purchase-expenses-statement/purchase-expenses-statement.component';


@NgModule({
  declarations: [
    MaterialRequiredReportComponent,
    MaterialPurchaseReportComponent,
    ReportOfItemsReceivedAsPartOfItComponent,
    PurchaseExpensesStatementComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(purchaseReportsRoutes),  
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    NgApexchartsModule,
    NgxEchartsModule,
    FlexLayoutModule,
    NgChartsModule,
    SharedPipesModule,
    SharedMaterialModule,
    SharedPrimengModule,  
    DropdownModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
  ]
})
export class PurchaseReportModule { }
