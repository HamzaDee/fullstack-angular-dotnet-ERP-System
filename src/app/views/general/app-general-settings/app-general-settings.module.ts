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

import { GeneralSettingsRoutes } from './app-general-settings-routing.module';
import { AddGeneralSettingsComponent } from './add-general-settings/add-general-settings.component';
import { StoresFormComponent } from './add-general-settings/stores-form/stores-form.component';
import { AccountingSystemFormComponent } from './add-general-settings/accounting-system-form/accounting-system-form.component';


@NgModule({
  declarations: [
    AddGeneralSettingsComponent,
    StoresFormComponent,
    AccountingSystemFormComponent
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
    SharedMaterialModule,
    SharedPrimengModule,
    RouterModule.forChild(GeneralSettingsRoutes)
  ]
})
export class AppGeneralSettingsModule { }
