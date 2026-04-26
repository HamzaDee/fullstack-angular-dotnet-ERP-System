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
import { ServiceInvoiceFormComponent } from './serviceinvoice-form/serviceinvoice-form.component';
import { ServiceInvoiceListComponent } from './serviceinvoice-list/serviceinvoice-list.component';
import { ServiceinvoiceRoutes } from './app-serviceinvoice-routing.module';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
import { AppFinancialvoucherModule } from 'app/views/general/app-Showfinancialdocuments/financialvoucher.module';
@NgModule({
    declarations: [
        ServiceInvoiceFormComponent,
        ServiceInvoiceListComponent,
        //AppGeneralAttachmentComponent
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
      RouterModule.forChild(ServiceinvoiceRoutes)
    ]
  })
  export class AppServiceInvoiceModule { }