import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FixedassetsTypelistComponent } from './fixedassets-types/fixedassets-typelist/fixedassets-typelist.component';
import { FixedassetsTypeformComponent } from './fixedassets-types/fixedassets-typeform/fixedassets-typeform.component';
import { RouterModule } from '@angular/router';
import { fixedassetsRoutes } from './fixedassets-routing.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { FixedAseetsListComponent } from './fixedassets_list/fixed-aseets-list/fixed-aseets-list.component';
import { FixedAseetsListFormComponent } from './fixedassets_list/fixed-aseets-list-form/fixed-aseets-list-form.component';
import { ChangeFixedAssetsLocationListComponent } from './ChangeFixedAssetsLocation/change-fixed-assets-location-list/change-fixed-assets-location-list.component';
import { ChangeFixedAssetsLocationFormComponent } from './ChangeFixedAssetsLocation/change-fixed-assets-location-form/change-fixed-assets-location-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { MatIconModule } from '@angular/material/icon';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { ChangeFixedAssetsLocationSheetComponent } from './ChangeFixedAssetsLocation/change-fixed-assets-location-sheet/change-fixed-assets-location-sheet.component';
import { ReceivingDeliveringAnOriginalToAnEmployeeListComponent } from './ReceivingDeliveringAnOriginalToAnEmployee/receiving-delivering-an-original-to-an-employee-list/receiving-delivering-an-original-to-an-employee-list.component';
import { ReceivingDeliveringAnOriginalToAnEmployeeFormComponent } from './ReceivingDeliveringAnOriginalToAnEmployee/receiving-delivering-an-original-to-an-employee-form/receiving-delivering-an-original-to-an-employee-form.component';
import { EceivingDeliveringAnOriginalEmployeeSheetComponent } from './ReceivingDeliveringAnOriginalToAnEmployee/eceiving-delivering-an-original-employee-sheet/eceiving-delivering-an-original-employee-sheet.component';
import { AssetPurchaseInvoiceListComponent } from './AssetPurchaseInvoice/asset-purchase-invoice-list/asset-purchase-invoice-list.component';
import { AssetPurchaseInvoiceFormComponent } from './AssetPurchaseInvoice/asset-purchase-invoice-form/asset-purchase-invoice-form.component';
import { AppSearchModule } from '../general/app-searchs/app-searchs.module';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { AssetPurchaseInvoiceSheetComponent } from './AssetPurchaseInvoice/asset-purchase-invoice-sheet/asset-purchase-invoice-sheet.component';
import { AssetSalesInvoiceComponent } from './AssetSalesInvoice/asset-sales-invoice-list/asset-sales-invoice.component';
import { AssetSalesInvoiceFormComponent } from './AssetSalesInvoice/asset-sales-invoice-form/asset-sales-invoice-form.component';
import { AssetSalesInvoiceSheetComponent } from './AssetSalesInvoice/asset-sales-invoice-sheet/asset-sales-invoice-sheet.component';
import { InventoryReportComponent } from './fa-reports/inventory-report/inventory-report.component';
import { TransactionReportComponent } from './fa-reports/transaction-report/transaction-report.component';
import { YearlyDepreciationReportComponent } from './fa-reports/yearly-depreciation-report/yearly-depreciation-report.component';
import { DepreciationFormComponent } from './asset-depreciation/depreciation-form/depreciation-form.component';
import { DepreciationListComponent } from './asset-depreciation/depreciation-list/depreciation-list.component';
import { FixedAssetOperationListComponent } from './FixedAssetOperation/fixed-asset-operation-list/fixed-asset-operation-list.component';
import { FixedAssetOperationFormComponent } from './FixedAssetOperation/fixed-asset-operation-form/fixed-asset-operation-form.component';
import { FixedAssetOperationSheetComponent } from './FixedAssetOperation/fixed-asset-operation-sheet/fixed-asset-operation-sheet.component';
import { DepreciationSheetComponent } from './asset-depreciation/depreciation-sheet/depreciation-sheet.component';
import { FixedAssetsContractsListComponent } from './FixedAssetsContracts/fixed-assets-contracts-list/fixed-assets-contracts-list.component';
import { FixedAssetsContractsFormComponent } from './FixedAssetsContracts/fixed-assets-contracts-form/fixed-assets-contracts-form.component';
import { FixedAssetsContractsSheetComponent } from './FixedAssetsContracts/fixed-assets-contracts-sheet/fixed-assets-contracts-sheet.component';
import { AppFinancialvoucherModule } from '../general/app-Showfinancialdocuments/financialvoucher.module';

@NgModule({
  declarations: [
    FixedassetsTypelistComponent,
    FixedassetsTypeformComponent,
    FixedAseetsListComponent,
    FixedAseetsListFormComponent,
    ChangeFixedAssetsLocationListComponent,
    ChangeFixedAssetsLocationFormComponent,
    ChangeFixedAssetsLocationSheetComponent,
    ReceivingDeliveringAnOriginalToAnEmployeeListComponent,
    ReceivingDeliveringAnOriginalToAnEmployeeFormComponent,
    EceivingDeliveringAnOriginalEmployeeSheetComponent,
    AssetPurchaseInvoiceListComponent,
    AssetPurchaseInvoiceFormComponent,
    AssetPurchaseInvoiceSheetComponent,
    AssetSalesInvoiceComponent,
    AssetSalesInvoiceFormComponent,
    AssetSalesInvoiceSheetComponent,
    InventoryReportComponent,
    TransactionReportComponent,
    YearlyDepreciationReportComponent,
    DepreciationFormComponent,
    DepreciationListComponent,
    FixedAssetOperationListComponent,
    FixedAssetOperationFormComponent,
    FixedAssetOperationSheetComponent,
    DepreciationSheetComponent,
    FixedAssetsContractsListComponent,
    FixedAssetsContractsFormComponent,
    FixedAssetsContractsSheetComponent,    
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    RouterModule.forChild(fixedassetsRoutes),  
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
    DropdownModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    AppSearchModule,
    AppFinancialvoucherModule,
    AppGeneralAttachmentModule,
  ]
  
})
export class FixedassetsModule { }
