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
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { ProcincheqListRoutingModule } from './procincomingcheq-routing.module';
import { ProcincheqListComponent } from './procincheq-list/procincheq-list.component';
import { ProcincheqFormComponent } from './procincheq-form/procincheq-form.component';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
import { AppFinancialvoucherModule } from 'app/views/general/app-Showfinancialdocuments/financialvoucher.module';
@NgModule({
  declarations: [
    ProcincheqListComponent,
    ProcincheqFormComponent
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
    AppSearchModule,
    AppFinancialvoucherModule,
    RouterModule.forChild(ProcincheqListRoutingModule)
  ]
})
export class ProcincheqModule { }
