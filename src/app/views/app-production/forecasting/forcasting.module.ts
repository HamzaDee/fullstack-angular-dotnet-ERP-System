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


import { ForcastingRoutingModule } from './forcasting-routing.module';
import { ForecastingListComponent } from './forecasting-list/forecasting-list.component';
import { ForecastingFormComponent } from './forecasting-form/forecasting-form.component';
import { ForecastingSheetComponent } from './forecasting-sheet/forecasting-sheet.component'; 
import { ProductionSearchModule } from '../app-productionSearch/production-search.module';



@NgModule({
  declarations: [
    ForecastingListComponent,
    ForecastingFormComponent,
    ForecastingSheetComponent
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
    ProductionSearchModule,
    RouterModule.forChild(ForcastingRoutingModule)
  ]
})
export class ForcastingModule { }
