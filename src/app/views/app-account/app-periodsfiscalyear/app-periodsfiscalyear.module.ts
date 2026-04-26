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
import { periodsFiscalyearRoutes } from './app-periodsfiscalyear-routing.module';
import { PeriodsFiscalyearFormComponent } from './periodsfiscalyear-list/periodsfiscalyear-form/periodsfiscalyear-form.component';
import { PeriodsFiscalyearListComponent } from './periodsfiscalyear-list/periodsfiscalyear-list.component';



@NgModule({
  declarations: [
    PeriodsFiscalyearListComponent,
    PeriodsFiscalyearFormComponent
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
    RouterModule.forChild(periodsFiscalyearRoutes)
  ]
})
export class AppPeriodsFiscalyearModule { }