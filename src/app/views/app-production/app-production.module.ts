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
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { AppProductionRoutingModule } from './app-production-routing.module';
import { PurchorderstatusComponent } from './purchorderstatus/purchorderstatus.component';
import { PurchorderstatusFormComponent } from './purchorderstatus/purchorderstatus-form/purchorderstatus-form.component';
import { ProductionlinesComponent } from './productionlines/productionlines.component';
import { ProductionlinesFormComponent } from './productionlines/productionlines-form/productionlines-form.component';
import { DealersListComponent } from './dealersitems/dealers-list/dealers-list.component';
import { DealersFormComponent } from './dealersitems/dealers-form/dealers-form.component';
import { PurorderListComponent } from './purchaseorders/purorder-list/purorder-list.component';
import { PurorderFormComponent } from './purchaseorders/purorder-form/purorder-form.component';
import { SalesorderFormComponent } from './salesorders/salesorder-form/salesorder-form.component';
import { SalesorderListComponent } from './salesorders/salesorder-list/salesorder-list.component';
import { ProdorderListComponent } from './prodorders/prodorder-list/prodorder-list.component';
import { ProdorderFormComponent } from './prodorders/prodorder-form/prodorder-form.component';
import { RawMaterialsComponent } from './prodorders/raw-materials/raw-materials.component';
import { UnavlRawMaterialsComponent } from './prodorders/unavl-raw-materials/unavl-raw-materials.component';
import { RawMaterialsSuppliersComponent } from './prodorders/raw-materials-suppliers/raw-materials-suppliers.component';
import { ManorderFormComponent } from './manorders/manorder-form/manorder-form.component';
import { ManorderListComponent } from './manorders/manorder-list/manorder-list.component';
import { ItemsdealersListComponent } from './itemsdealers/itemsdealers-list/itemsdealers-list.component';
import { DealersitemsListComponent } from './itemsdealers/dealersitems-list/dealersitems-list.component';
import { ItemstransfersComponent } from './itemstransfers/itemstransfers.component';
import { QaproductionListComponent } from './qaProduction/qaproduction-list/qaproduction-list.component';
import { QaproductionFormComponent } from './qaProduction/qaproduction-form/qaproduction-form.component';
import { AvailableQtyComponent } from './prodorders/prodorder-form/available-qty/available-qty.component';
import { ProditemslistComponent } from './proditemslist/proditemslist.component';
import { InventoryreceiveComponent } from './inventoryreceive/inventoryreceive.component';
import { CountriesqtyComponent } from './inventoryreceive/countriesqty/countriesqty.component';
import { ProductPricesForCountriesComponent } from './product-prices-for-countrie/product-prices-for-countries/product-prices-for-countries.component';
import { SalesorderSheetComponent } from './salesorders/salesorder-sheet/salesorder-sheet.component';
import { ManfuequationsFormComponent } from './ManuFEquations/ManfuEquations-Form/manfuequations-form.component';
import { ManfuequationsListComponent } from './ManuFEquations/ManfuEquations-List/manfuequations-list.component';
import { ProdvoucherformComponent } from './productionVoucher/productionVoucher-Form/prodvoucherform.component';
import { ProdvoucherlistComponent } from './productionVoucher/productionVoucher-List/prodvoucherlist.component';
import { ShippAdvanceSearchModule } from './Shipping/shipping-advanced-search/shipp-advance-search.module';
import { ShippingListComponent } from './Shipping/shipping-list/shipping-list.component';
import { ShippingFormComponent } from './Shipping/shipping-form/shipping-form.component';
import { ProdoutputvoucherformComponent } from './app-prodOutPutVoucher/prodoutputVoucherForm/prodoutputvoucherform.component';
import { ProdoutputvoucherlistComponent } from './app-prodOutPutVoucher/prodoutputVoucherList/prodoutputvoucherlist.component';
import { AppInvSearchModule } from "app/views/general/app-invSearch/invSearch.module";
import { ProdreceiptformComponent } from './app-productionReceiptVoucher/productionReceiptForm/prodreceiptform.component';
import { ProdreceiptlistComponent } from './app-productionReceiptVoucher/productionReceiptList/prodreceiptlist.component';
import { AppSearchModule } from "app/views/general/app-searchs/app-searchs.module";
import { ProducedmaterialsrptComponent } from './productionReport/ProductionMaterialsRpt/producedmaterialsrpt.component';
import { ConsumedrawmaterialsComponent } from './productionReport/ConsumedRawMaterialsRpt/consumedrawmaterials.component';
import { AppFinancialvoucherModule } from "app/views/general/app-Showfinancialdocuments/financialvoucher.module";
import { ProdcostrepComponent } from './productionReport/production-cost-report/prodcostrep.component';
import { SalesOrderSearchComponent } from '../general/app-searchs/SalesOrder-Search/sales-order-search/sales-order-search.component';
@NgModule({
  declarations: [
    PurchorderstatusComponent,
    PurchorderstatusFormComponent,
    ProductionlinesComponent,
    ProductionlinesFormComponent,
    DealersListComponent,
    DealersFormComponent,
    PurorderListComponent,
    PurorderFormComponent,
    SalesorderFormComponent,
    SalesorderListComponent,
    ProdorderListComponent,
    ProdorderFormComponent,
    RawMaterialsComponent,
    UnavlRawMaterialsComponent,
    RawMaterialsSuppliersComponent,
    ManorderFormComponent,
    ManorderListComponent,
    ItemsdealersListComponent,
    DealersitemsListComponent,
    ItemstransfersComponent,
    QaproductionListComponent,
    QaproductionFormComponent,
    AvailableQtyComponent,
    ProditemslistComponent,
    InventoryreceiveComponent,
    CountriesqtyComponent,
    ProductPricesForCountriesComponent,
    SalesorderSheetComponent,
    ManfuequationsListComponent,
    ManfuequationsFormComponent,
    ProdvoucherformComponent,
    ProdvoucherlistComponent,
    ShippingListComponent,
    ShippingFormComponent,
    ProdoutputvoucherformComponent,
    ProdoutputvoucherlistComponent,
    ProdreceiptformComponent,
    ProdreceiptlistComponent,
    ProducedmaterialsrptComponent,
    ConsumedrawmaterialsComponent,
    ProdcostrepComponent,
    SalesOrderSearchComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(AppProductionRoutingModule),
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
    MatCardModule,
    MatListModule,
    ShippAdvanceSearchModule,
    AppGeneralAttachmentModule,
    AppInvSearchModule,
    AppSearchModule,
    AppFinancialvoucherModule,
]
})
export class AppProductionModule { }