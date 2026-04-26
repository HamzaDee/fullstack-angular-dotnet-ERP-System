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
import { PurchaseRoutes } from './purchase-routing.module';
import { PurchaseinvoiceFormComponent } from './app-purchaseinvoice/purchaseinvoice-form/purchaseinvoice-form.component';
import { PurchaseinvoiceListComponent } from './app-purchaseinvoice/purchaseinvoice-list/purchaseinvoice-list.component';
import { PurchaserequestFormComponent } from './app-purchaseRequest/purchaserequest-form/purchaserequest-form.component';
import { PurchaserequestListComponent } from './app-purchaseRequest/purchaserequest-list/purchaserequest-list.component';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from 'app/views/general/app-searchs/app-searchs.module';
import { EntryitemsserialsComponent } from '../general/app-EnterItemsSerial/entryitemsserials.component';
import { ReturnpurinvoiceFormComponent } from './app-ReturnPurInvoice/returnpurinvoice-form/returnpurinvoice-form.component';
import { ReturnpurinvoiceListComponent } from './app-ReturnPurInvoice/returnpurinvoice-list/returnpurinvoice-list.component';
import { AppItemSerialsModule } from '../general/app-itemSerials/itemsserials.modeule';
import { AppFinancialvoucherModule } from '../general/app-Showfinancialdocuments/financialvoucher.module';
import { IntpurchasereqListComponent } from './app-InternalPurchaseRequest/intpurRequestList/intpurchasereq-list.component';
import { IntpurchasereqFormComponent } from './app-InternalPurchaseRequest/intpurRequestFrom/intpurchasereq-form.component';
import { ServicePurchaseRequestFormComponent } from './ServicePurchaseRequestList/service-purchase-request-form/service-purchase-request-form.component';
import { ServicePurchaseRequestListComponent } from './ServicePurchaseRequestList/service-purchase-request-list/service-purchase-request-list.component';
import { LandedcostformComponent } from './app-landedCost/landedcost-form/landedcostform.component';
import { LandedcostlistComponent } from './app-landedCost/landedcost-list/landedcostlist.component';
import { LandedcostsearchComponent } from 'app/views/general/app-searchs/app-LandedCostAdvanceSearch/landedcostsearch.component';
import { ServicePurchaseSearchComponent } from '../general/app-searchs/service-purchase-search/service-purchase-search.component';
@NgModule({
  declarations: [
    PurchaserequestListComponent,PurchaserequestFormComponent,PurchaseinvoiceFormComponent,PurchaseinvoiceListComponent,
    EntryitemsserialsComponent, ReturnpurinvoiceFormComponent, ReturnpurinvoiceListComponent, IntpurchasereqListComponent,IntpurchasereqFormComponent,
    ServicePurchaseRequestListComponent, ServicePurchaseRequestFormComponent,LandedcostformComponent,LandedcostlistComponent,LandedcostsearchComponent,ServicePurchaseSearchComponent
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
    AppItemSerialsModule,
    AppFinancialvoucherModule,
    RouterModule.forChild(PurchaseRoutes)
  ]
})
export class AppPurchaseModule { }