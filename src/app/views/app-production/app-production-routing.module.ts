import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { PurchorderstatusComponent } from './purchorderstatus/purchorderstatus.component';
import { PurchorderstatusFormComponent } from './purchorderstatus/purchorderstatus-form/purchorderstatus-form.component';
import { ProductionlinesComponent } from './productionlines/productionlines.component';
import { ProductionlinesFormComponent } from './productionlines/productionlines-form/productionlines-form.component';
import { DealersListComponent } from './dealersitems/dealers-list/dealers-list.component';
import { DealersFormComponent } from './dealersitems/dealers-form/dealers-form.component';
import { PurorderListComponent } from './purchaseorders/purorder-list/purorder-list.component';
import { PurorderFormComponent } from './purchaseorders/purorder-form/purorder-form.component';
import { SalesorderListComponent } from './salesorders/salesorder-list/salesorder-list.component';
import { SalesorderFormComponent } from './salesorders/salesorder-form/salesorder-form.component';
import { ProdorderListComponent } from './prodorders/prodorder-list/prodorder-list.component';
import { ProdorderFormComponent } from './prodorders/prodorder-form/prodorder-form.component';
import { ManorderListComponent } from './manorders/manorder-list/manorder-list.component';
import { ManorderFormComponent } from './manorders/manorder-form/manorder-form.component';
import { ItemsdealersListComponent } from './itemsdealers/itemsdealers-list/itemsdealers-list.component';
import { ItemstransfersComponent } from './itemstransfers/itemstransfers.component';
import { QaproductionListComponent } from './qaProduction/qaproduction-list/qaproduction-list.component';
import { QaproductionFormComponent } from './qaProduction/qaproduction-form/qaproduction-form.component';
import { ProditemslistComponent } from './proditemslist/proditemslist.component';
import { InventoryreceiveComponent } from './inventoryreceive/inventoryreceive.component';
import { ProductPricesForCountriesComponent } from './product-prices-for-countrie/product-prices-for-countries/product-prices-for-countries.component';
import { SalesorderSheetComponent } from './salesorders/salesorder-sheet/salesorder-sheet.component';
import { NotFoundComponent } from '../app-account/not-found/not-found.component';
import { ErrorComponent } from '../app-account/error/error.component';
import { LoginComponent } from '../app-account/login/login.component';
import { ManfuequationsFormComponent } from './ManuFEquations/ManfuEquations-Form/manfuequations-form.component';
import { ManfuequationsListComponent } from './ManuFEquations/ManfuEquations-List/manfuequations-list.component';
import { ProdvoucherformComponent } from './productionVoucher/productionVoucher-Form/prodvoucherform.component';
import { ProdvoucherlistComponent } from './productionVoucher/productionVoucher-List/prodvoucherlist.component';
import { ProdoutputvoucherformComponent } from './app-prodOutPutVoucher/prodoutputVoucherForm/prodoutputvoucherform.component';
import { ProdoutputvoucherlistComponent } from './app-prodOutPutVoucher/prodoutputVoucherList/prodoutputvoucherlist.component';
import { ProdreceiptformComponent } from './app-productionReceiptVoucher/productionReceiptForm/prodreceiptform.component';
import { ProdreceiptlistComponent } from './app-productionReceiptVoucher/productionReceiptList/prodreceiptlist.component';
import { ProducedmaterialsrptComponent } from './productionReport/ProductionMaterialsRpt/producedmaterialsrpt.component';
import { ConsumedrawmaterialsComponent } from './productionReport/ConsumedRawMaterialsRpt/consumedrawmaterials.component';
import { ProdcostrepComponent } from './productionReport/production-cost-report/prodcostrep.component';
export const AppProductionRoutingModule: Routes = [
  {
    path: '',
    children: [
      {
        path: 'GetPOrderStatusList',
        component: PurchorderstatusComponent,
        data: { title: 'PurchOrderStatusList', breadcrumb: 'PurchOrderStatusList', roles: config.authRoles.sa }
      },
      {
        path: 'PurchOrderStatusForm',
        component: PurchorderstatusFormComponent,
        data: { title: 'PurchOrderStatusForm', breadcrumb: 'PurchOrderStatusForm', roles: config.authRoles.sa }
      },   
      {
        path: 'GetProdLinesList',
        component: ProductionlinesComponent,
        data: { title: 'ProductionLinesList', breadcrumb: 'ProductionLinesList', roles: config.authRoles.sa }
      },
      {
        path: 'ProductionLinesForm',
        component: ProductionlinesFormComponent,
        data: { title: 'ProductionLinesForm', breadcrumb: 'ProductionLinesForm', roles: config.authRoles.sa }
      },   
      {
        path: 'DealersItems',
        component: DealersListComponent,
        data: { title: 'DealersItemsList', breadcrumb: 'DealersItemsList', roles: config.authRoles.sa }
      },
      {
        path: 'DealerItemForm',
        component: DealersFormComponent,
        data: { title: 'DealersItemsForm', breadcrumb: 'DealersItemsForm', roles: config.authRoles.sa }
      },   
      {
        path: 'GetPurOrdersList',
        component: PurorderListComponent,
        data: { title: 'PurorderList', breadcrumb: 'PurorderList', roles: config.authRoles.sa }
      },
      {
        path: 'PurorderForm',
        component: PurorderFormComponent,
        data: { title: 'PurorderForm', breadcrumb: 'PurorderForm', roles: config.authRoles.sa }
      },   
      {
        path: 'SalesOrderList',
        component: SalesorderListComponent,
        data: { title: 'SalesOrderList', breadcrumb: 'SalesOrderList', roles: config.authRoles.sa }
      },
      {
        path: 'SalesOrderForm',
        component: SalesorderFormComponent,
        data: { title: 'SalesOrderForm', breadcrumb: 'SalesOrderForm', roles: config.authRoles.sa }
      },    
      {
        path: 'GetProdOrdersList',
        component: ProdorderListComponent,
        data: { title: 'ProdOrderList', breadcrumb: 'ProdOrderList', roles: config.authRoles.sa }
      },
      {
        path: 'ProdOrderForm',
        component: ProdorderFormComponent,
        data: { title: 'ProdOrderForm', breadcrumb: 'ProdOrderForm', roles: config.authRoles.sa }
      },    
      {
        path: 'GetManOrdersList',
        component: ManorderListComponent,
        data: { title: 'ManOrderList', breadcrumb: 'ManOrderList', roles: config.authRoles.sa }
      },
      {
        path: 'ManOrderForm',
        component: ManorderFormComponent,
        data: { title: 'ManOrderForm', breadcrumb: 'ManOrderForm', roles: config.authRoles.sa }
      },   
      {
        path: 'ItemsdealersList',
        component: ItemsdealersListComponent,
        data: { title: 'ItemsdealersList', breadcrumb: 'ItemsdealersList', roles: config.authRoles.sa }
      },
      {
        path: 'DealersItemsForm',
        component: DealersFormComponent,
        data: { title: 'DealersItemsForm', breadcrumb: 'DealersItemsForm', roles: config.authRoles.sa }
      },
      {
        path: 'GeItemsTranfers',
        component: ItemstransfersComponent,
        data: { title: 'ItemsTransfers', breadcrumb: 'ItemsTransfers', roles: config.authRoles.sa }
      },
      {
        path: 'GetQAList',
        component: QaproductionListComponent,
        data: { title: 'QAList', breadcrumb: 'QAList', roles: config.authRoles.sa }
      },
      {
        path: 'QaproductionForm',
        component: QaproductionFormComponent,
        data: { title: 'QAList', breadcrumb: 'QAList', roles: config.authRoles.sa }
      },
      {
        path: 'Proditemslist',
        component: ProditemslistComponent,
        data: { title: 'proditemslist', breadcrumb: 'proditemslist', roles: config.authRoles.sa }
      },
      {
        path: 'GetProdList',
        component: InventoryreceiveComponent,
        data: { title: 'Inventoryreceive', breadcrumb: 'Inventoryreceive', roles: config.authRoles.sa }
      },
      {
        path: 'GetCountriesPricesList',
        component: ProductPricesForCountriesComponent,
        data: { title: 'ProductPricesForCountries', breadcrumb: 'ProductPricesForCountries', roles: config.authRoles.sa }
      },
      {
        path: 'SalesorderSheet/:id',
        component: SalesorderSheetComponent,
        data: { title: 'SalesorderSheet', breadcrumb: 'SalesorderSheet', roles: config.authRoles.sa }
      },         
      {
        path: 'ManfuequationsList',
        component: ManfuequationsListComponent,
        data: { title: 'Manfequationslist', breadcrumb: 'Manfequationslist', roles: config.authRoles.sa }
      },
      {
        path: 'manfuEquationsForm',
        component: ManfuequationsFormComponent,
        data: { title: 'manfuEquationsForm', breadcrumb: 'manfuEquationsForm', roles: config.authRoles.sa }
      },
      {
        path: 'ProdVoucherList',
        component: ProdvoucherlistComponent,
        data: { title: 'ProdVoucherList', breadcrumb: 'ProdVoucherList', roles: config.authRoles.sa }
      },
      {
        path: 'ProdVoucherForm',
        component: ProdvoucherformComponent,
        data: { title: 'ProdVoucherForm', breadcrumb: 'ProdVoucherForm', roles: config.authRoles.sa }
      },            
      {
        path: 'Prodoutputvoucherlist',
        component: ProdoutputvoucherlistComponent,
        data: { title: 'Prodoutputvoucherlist', breadcrumb: 'Prodoutputvoucherlist', roles: config.authRoles.sa }
      },
      {
        path: 'Prodoutputvoucherform',
        component: ProdoutputvoucherformComponent,
        data: { title: 'Prodoutputvoucherform', breadcrumb: 'Prodoutputvoucherform', roles: config.authRoles.sa }
      },
      {
        path: 'ProdReceiptvoucherlist',
        component: ProdreceiptlistComponent,
        data: { title: 'ProdReceiptvoucherlist', breadcrumb: 'ProdReceiptvoucherlist', roles: config.authRoles.sa }
      },
      {
        path: 'ProdReceiptvoucherform',
        component: ProdreceiptformComponent,
        data: { title: 'ProdReceiptvoucherform', breadcrumb: 'ProdReceiptvoucherform', roles: config.authRoles.sa }
      },
      {
        path: 'GetMaterialsReportForm',
        component: ProducedmaterialsrptComponent,
        data: { title: 'Producedmaterialsrpt', breadcrumb: 'Producedmaterialsrpt', roles: config.authRoles.sa }
      },
      {
        path: 'GetConsumedRawMaterialsForm',
        component: ConsumedrawmaterialsComponent,
        data: { title: 'Consumedrawmaterials', breadcrumb: 'Consumedrawmaterials', roles: config.authRoles.sa }
      },
      {
        path: 'ProductionCostingRpt',
        component: ProdcostrepComponent,
        data: { title: 'DetectionOfProductionCosts', breadcrumb: 'DetectionOfProductionCosts', roles: config.authRoles.sa }
      },

      
      {
        path: "Login",
         component: LoginComponent,
        data: { title: "Login" }
      },


      {
        path: "404",
         component: NotFoundComponent,
        data: { title: "Not Found" }
      },
      {
        path: "error",
         component: ErrorComponent,
        data: { title: "Error" }
      }
    ]
  }
];


