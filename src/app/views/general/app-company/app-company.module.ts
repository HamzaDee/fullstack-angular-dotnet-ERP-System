import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';

import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';

//import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CompanyRoutes } from './app-company-routing.module';
import { CompanyListComponent } from './company-list/company-list.component';
import { CompanyFormComponent } from './company-list/company-form/company-form.component';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';


@NgModule({
  declarations: [
    CompanyListComponent,
    CompanyFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
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
    //AgmCoreModule.forRoot({ apiKey: 'AIzaSyBNcjxo_35qnEG17dQvvftWa68eZWepYE0' }),
    RouterModule.forChild(CompanyRoutes)
  ]
})
export class AppCompanyModule { }
