import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { EntryvoucherslistComponent } from './entryvoucherslist/entryvoucherslist.component';
import { EntryVouchersRoutes } from './app-entryvouchers-routing.module';
import { EntryvoucherformComponent } from './entryvoucherform/entryvoucherform.component';
import { AppGeneralvoucherComponent } from 'app/views/general/app-generalvoucher/app-generalvoucher.component';
// import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
import { AppgeneralvouchersModule } from 'app/views/general/app-generalvoucher/generalvoucher.module';
import { AppShowCostCenterModule } from 'app/views/general/app-showcostcenter/showcostcenter.module';
import { AppShowProjectsModule } from 'app/views/general/app-showprojects/showprojects.module';
@NgModule({
  declarations: [
    EntryvoucherslistComponent,
    EntryvoucherformComponent,
    // AppGeneralAttachmentComponent
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
    AppGeneralAttachmentModule,
    AppgeneralvouchersModule,
    AppSearchModule,   
    AppShowCostCenterModule,
    AppShowProjectsModule,
    RouterModule.forChild(EntryVouchersRoutes)
  ]
})
export class AppEntryvouchersModule { }
