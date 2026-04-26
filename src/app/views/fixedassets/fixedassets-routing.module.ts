import { Routes } from "@angular/router";
import { FixedassetsTypelistComponent } from "./fixedassets-types/fixedassets-typelist/fixedassets-typelist.component";
import { config } from 'config';
import { FixedassetsTypeformComponent } from "./fixedassets-types/fixedassets-typeform/fixedassets-typeform.component";
import { FixedAseetsListComponent } from "./fixedassets_list/fixed-aseets-list/fixed-aseets-list.component";
import { FixedAseetsListFormComponent } from "./fixedassets_list/fixed-aseets-list-form/fixed-aseets-list-form.component";
import { ChangeFixedAssetsLocationListComponent } from "./ChangeFixedAssetsLocation/change-fixed-assets-location-list/change-fixed-assets-location-list.component";
import { ChangeFixedAssetsLocationFormComponent } from "./ChangeFixedAssetsLocation/change-fixed-assets-location-form/change-fixed-assets-location-form.component";
import { ChangeFixedAssetsLocationSheetComponent } from "./ChangeFixedAssetsLocation/change-fixed-assets-location-sheet/change-fixed-assets-location-sheet.component";
import { ReceivingDeliveringAnOriginalToAnEmployeeListComponent } from "./ReceivingDeliveringAnOriginalToAnEmployee/receiving-delivering-an-original-to-an-employee-list/receiving-delivering-an-original-to-an-employee-list.component";
import { ReceivingDeliveringAnOriginalToAnEmployeeFormComponent } from "./ReceivingDeliveringAnOriginalToAnEmployee/receiving-delivering-an-original-to-an-employee-form/receiving-delivering-an-original-to-an-employee-form.component";
import { EceivingDeliveringAnOriginalEmployeeSheetComponent } from "./ReceivingDeliveringAnOriginalToAnEmployee/eceiving-delivering-an-original-employee-sheet/eceiving-delivering-an-original-employee-sheet.component";
import { AssetPurchaseInvoiceListComponent } from "./AssetPurchaseInvoice/asset-purchase-invoice-list/asset-purchase-invoice-list.component";
import { AssetPurchaseInvoiceFormComponent } from "./AssetPurchaseInvoice/asset-purchase-invoice-form/asset-purchase-invoice-form.component";
import { AssetPurchaseInvoiceSheetComponent } from "./AssetPurchaseInvoice/asset-purchase-invoice-sheet/asset-purchase-invoice-sheet.component";
import { AssetSalesInvoiceComponent } from "./AssetSalesInvoice/asset-sales-invoice-list/asset-sales-invoice.component";
import { AssetSalesInvoiceFormComponent } from "./AssetSalesInvoice/asset-sales-invoice-form/asset-sales-invoice-form.component";
import { AssetSalesInvoiceSheetComponent } from "./AssetSalesInvoice/asset-sales-invoice-sheet/asset-sales-invoice-sheet.component";
import { DepreciationFormComponent } from "./asset-depreciation/depreciation-form/depreciation-form.component";
import { DepreciationListComponent } from "./asset-depreciation/depreciation-list/depreciation-list.component";
import { InventoryReportComponent } from "./fa-reports/inventory-report/inventory-report.component";
import { TransactionReportComponent } from "./fa-reports/transaction-report/transaction-report.component";
import { YearlyDepreciationReportComponent } from "./fa-reports/yearly-depreciation-report/yearly-depreciation-report.component";
import { FixedAssetOperationListComponent } from "./FixedAssetOperation/fixed-asset-operation-list/fixed-asset-operation-list.component";
import { FixedAssetOperationFormComponent } from "./FixedAssetOperation/fixed-asset-operation-form/fixed-asset-operation-form.component";
import { FixedAssetOperationSheetComponent } from "./FixedAssetOperation/fixed-asset-operation-sheet/fixed-asset-operation-sheet.component";
import { DepreciationSheetComponent } from "./asset-depreciation/depreciation-sheet/depreciation-sheet.component";
import { FixedAssetsContractsListComponent } from "./FixedAssetsContracts/fixed-assets-contracts-list/fixed-assets-contracts-list.component";
import { FixedAssetsContractsFormComponent } from "./FixedAssetsContracts/fixed-assets-contracts-form/fixed-assets-contracts-form.component";
import { FixedAssetsContractsSheetComponent } from "./FixedAssetsContracts/fixed-assets-contracts-sheet/fixed-assets-contracts-sheet.component";

export const fixedassetsRoutes: Routes = [
  {
    path: '',
    children:
      [
        {
          path: 'FixedassetsTypelist',
          component: FixedassetsTypelistComponent,
          data: { title: 'FixedassetsTypelist', breadcrumb: 'FixedassetsTypelist', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAseetsList',
          component: FixedAseetsListComponent,
          data: { title: 'FixedAseetsList', breadcrumb: 'FixedAseetsList', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAseetsListForm',
          component: FixedAseetsListFormComponent,
          data: { title: 'FixedAseetsListForm', breadcrumb: 'FixedAseetsListForm', roles: config.authRoles.sa}
        },
        {
          path: 'ChangeFixedAssetsLocationList',
          component: ChangeFixedAssetsLocationListComponent,
          data: { title: 'ChangeFixedAssetsLocationList', breadcrumb: 'ChangeFixedAssetsLocationList', roles: config.authRoles.sa}
        },
        {
          path: 'ChangeFixedAssetsLocationForm',
          component: ChangeFixedAssetsLocationFormComponent,
          data: { title: 'ChangeFixedAssetsLocationForm', breadcrumb: 'ChangeFixedAssetsLocationForm', roles: config.authRoles.sa}
        },
        {
          path: 'ChangeFixedAssetsLocationSheet/:id',
          component: ChangeFixedAssetsLocationSheetComponent,
          data: { title: 'ChangeFixedAssetsLocationSheet', breadcrumb: 'ChangeFixedAssetsLocationSheet', roles: config.authRoles.sa}
        },
        {
          path: 'ReceivingDeliveringAnOriginalToAnEmployee',
          component: ReceivingDeliveringAnOriginalToAnEmployeeListComponent,
          data: { title: 'ReceivingDeliveringAnOriginalToAnEmployee', breadcrumb: 'ReceivingDeliveringAnOriginalToAnEmployee', roles: config.authRoles.sa}
        },
        {
          path: 'ReceivingDeliveringAnOriginalToAnEmployeeForm',
          component: ReceivingDeliveringAnOriginalToAnEmployeeFormComponent,
          data: { title: 'ReceivingDeliveringAnOriginalToAnEmployeeForm', breadcrumb: 'ReceivingDeliveringAnOriginalToAnEmployeeForm', roles: config.authRoles.sa}
        },
        {
          path: 'EceivingDeliveringAnOriginalEmployeeSheet/:id',
          component: EceivingDeliveringAnOriginalEmployeeSheetComponent,
          data: { title: 'EceivingDeliveringAnOriginalEmployeeSheet', breadcrumb: 'EceivingDeliveringAnOriginalEmployeeSheet', roles: config.authRoles.sa}
        },
        {
          path: 'AssetPurchaseInvoiceList',
          component: AssetPurchaseInvoiceListComponent,
          data: { title: 'AssetPurchaseInvoiceList', breadcrumb: 'AssetPurchaseInvoiceList', roles: config.authRoles.sa}
        },
        {
          path: 'AssetPurchaseInvoiceForm',
          component: AssetPurchaseInvoiceFormComponent,
          data: { title: 'AssetPurchaseInvoiceForm', breadcrumb: 'AssetPurchaseInvoiceForm', roles: config.authRoles.sa}
        },
        {
          path: 'AssetPurchaseInvoiceSheet/:id',
          component: AssetPurchaseInvoiceSheetComponent,
          data: { title: 'AssetPurchaseInvoiceSheet', breadcrumb: 'AssetPurchaseInvoiceSheet', roles: config.authRoles.sa}
        },
        {
          path: 'AssetSalesInvoice',
          component: AssetSalesInvoiceComponent,
          data: { title: 'AssetSalesInvoice', breadcrumb: 'AssetSalesInvoice', roles: config.authRoles.sa}
        },
        {
          path: 'AssetSalesInvoiceForm',
          component: AssetSalesInvoiceFormComponent,
          data: { title: 'AssetSalesInvoiceForm', breadcrumb: 'AssetSalesInvoiceForm', roles: config.authRoles.sa}
        },
        {
          path: 'AssetSalesInvoiceSheet/:id',
          component: AssetSalesInvoiceSheetComponent,
          data: { title: 'AssetSalesInvoiceSheet', breadcrumb: 'AssetSalesInvoiceSheet', roles: config.authRoles.sa}
        },
        {
          path: 'DepreciationForm',
          component: DepreciationFormComponent,
          data: { title: 'DepreciationForm', breadcrumb: 'DepreciationForm', roles: config.authRoles.sa}
        },
        {
          path: 'DepreciationList',
          component: DepreciationListComponent,
          data: { title: 'DepreciationList', breadcrumb: 'DepreciationList', roles: config.authRoles.sa}
        },
        {
          path: 'GetInventoryReport',
          component: InventoryReportComponent,
          data: { title: 'AssetsStockingReport', breadcrumb: 'AssetsStockingReport', roles: config.authRoles.sa}
        },
        {
          path: 'GetTransactionReport',
          component: TransactionReportComponent,
          data: { title: 'AssetsOperationsReport', breadcrumb: 'AssetsOperationsReport', roles: config.authRoles.sa}
        },
        {
          path: 'GetYearlyDepreciationReport',
          component: YearlyDepreciationReportComponent,
          data: { title: 'YearlyDepreciationReport', breadcrumb: 'YearlyDepreciationReport', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAssetOperationList',
          component: FixedAssetOperationListComponent,
          data: { title: 'FixedAssetOperationList', breadcrumb: 'FixedAssetOperationList', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAssetOperationForm',
          component: FixedAssetOperationFormComponent,
          data: { title: 'FixedAssetOperationForm', breadcrumb: 'FixedAssetOperationForm', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAssetOperationSheet/:id',
          component: FixedAssetOperationSheetComponent,
          data: { title: 'FixedAssetOperationSheet', breadcrumb: 'FixedAssetOperationSheet', roles: config.authRoles.sa}
        },
        {
          path: 'DepreciationSheet/:id',
          component: DepreciationSheetComponent,
          data: { title: 'DepreciationSheet', breadcrumb: 'DepreciationSheet', roles: config.authRoles.sa}
        },
        {
          path: 'AssetsContractsList',
          component: FixedAssetsContractsListComponent,
          data: { title: 'AssetsContractsList', breadcrumb: 'AssetsContractsList', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAssetsContractsForm',
          component: FixedAssetsContractsFormComponent,
          data: { title: 'FixedAssetsContractsForm', breadcrumb: 'FixedAssetsContractsForm', roles: config.authRoles.sa}
        },
        {
          path: 'FixedAssetsContractsSheet/:id',
          component: FixedAssetsContractsSheetComponent,
          data: { title: 'FixedAssetsContractsSheet', breadcrumb: 'FixedAssetsContractsSheet', roles: config.authRoles.sa}
        }
      ]
  }
];