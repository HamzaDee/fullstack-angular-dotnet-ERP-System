import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintChequeFormComponent } from './print-cheque-form/print-cheque-form.component';
import { PrintChequeListComponent } from './print-cheque-list/print-cheque-list.component';
import { PrintChequeRoutes } from './print-cheque-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';



@NgModule({
  declarations: [
    PrintChequeListComponent,
    PrintChequeFormComponent
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
    RouterModule.forChild(PrintChequeRoutes)
  ]
})
export class PrintChequeModule { }
