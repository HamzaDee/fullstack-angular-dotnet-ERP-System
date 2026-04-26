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
import { DealersFormComponent } from './dealers-form/dealers-form.component';
import { DealersListComponent } from './dealers-list/dealers-list.component';
import { DealersRoutes } from './dealers-routing.module';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';


@NgModule({
  declarations: [
    DealersListComponent,
    DealersFormComponent
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
    AppGeneralAttachmentModule,
    RouterModule.forChild(DealersRoutes)
  ]
})
export class AppDealersModule { }
