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
import { PaymentvoucherRoutingModule } from './paymentvoucher-routing.module';
import { PaymentlistComponent } from './paymentlist/paymentlist.component'; 
import { PaymentformComponent } from './paymentform/paymentform.component';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
import { AppFinancialvoucherModule } from 'app/views/general/app-Showfinancialdocuments/financialvoucher.module';
import { AppCliqvoucherModule } from 'app/views/general/app-cliqvoucher/clickvoucher.module';
import{AppPrintcheqsModule} from 'app/views/general/app-PrintCheqs/modules/printcheques.module';
@NgModule({
  declarations: [
    PaymentlistComponent,
    PaymentformComponent,
    
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
    AppCliqvoucherModule,
    AppPrintcheqsModule,
    RouterModule.forChild(PaymentvoucherRoutingModule)
  ]
})
export class PaymentvoucherModule { }
