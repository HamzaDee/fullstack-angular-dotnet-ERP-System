import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
import { BalancesofFinishedGoodsReportComponent } from './BalancesofFinishedGoodsReport/balancesof-finished-goods-report/balancesof-finished-goods-report.component';
import { ProducedQuantitiesListComponent } from './ProducedQuantities/produced-quantities-list/produced-quantities-list.component';
import { ManufacturingListforCountriesListComponent } from './ManufacturingListforCountries/manufacturing-listfor-countries-list/manufacturing-listfor-countries-list.component';
import { ProductivityListComponent } from './Productivity/productivity-list/productivity-list.component';
import { DatesOfArrivalOfMaterialsListComponent } from './DatesOfArrivalOfMaterials/dates-of-arrival-of-materials-list/dates-of-arrival-of-materials-list.component';
import { ProductionCapacityListComponent } from './ProductionCapacity/production-capacity-list/production-capacity-list.component';
import { PerformanceListComponent } from './Performance/performance-list/performance-list.component';
import { AnnualProductsStatusListComponent } from './AnnualProductsStatus/annual-products-status-list/annual-products-status-list.component';
import { ProdDashboardComponent } from './prod-dashboard/prod-dashboard.component';
import { CountryforecastComponent } from './countryforecast/countryforecast.component';
import { PromotionalMaterialStockComponent } from './promotional-material-stock/promotional-material-stock.component';
import { SalesforecastrptComponent } from './SalesReportAndForecast/salesforecastrpt.component';
import { MaterialforecastComponent } from '../app-materialforecasting/materialforecastlist/materialforecast.component';
import { ShippingListComponent } from '../Shipping/shipping-list/shipping-list.component';
import { ShippingFormComponent } from '../Shipping/shipping-form/shipping-form.component';
import { ActualSalesVsSalesOrdersComponent } from './actual-sales-vs-sales-orders/actual-sales-vs-sales-orders.component';
import { ShippedPromotionalMaterialsVsOrdersComponent } from './shipped-promotional-materials-vs-orders/shipped-promotional-materials-vs-orders.component';
import { ProdcostrepComponent } from './production-cost-report/prodcostrep.component';

export const ProductionReportRoutes: Routes = [
  {
    path: '',
    children:
    [
      {
        path: 'GetFinishItemsBalance',
        component: BalancesofFinishedGoodsReportComponent,
        data: { title: 'BalancesofFinishedGoodsReport', breadcrumb: 'BalancesofFinishedGoodsReport', roles: config.authRoles.sa}
      },
      {
        path: 'GetProducedQty',
        component: ProducedQuantitiesListComponent,
        data: { title: 'ProducedQuantitiesList', breadcrumb: 'ProducedQuantitiesList', roles: config.authRoles.sa}
      },
      {
        path: 'GetProdByCountriesList',
        component: ManufacturingListforCountriesListComponent,
        data: { title: 'ManufacturingListforCountriesList', breadcrumb: 'ManufacturingListforCountriesList', roles: config.authRoles.sa}
      },
      {
        path: 'GetProductivity',
        component: ProductivityListComponent,
        data: { title: 'ProductivityList', breadcrumb: 'ProductivityList', roles: config.authRoles.sa}
      },
      {
        path: 'GetItemsDatesArrival',
        component: DatesOfArrivalOfMaterialsListComponent,
        data: { title: 'DatesOfArrivalOfMaterialsList', breadcrumb: 'DatesOfArrivalOfMaterialsList', roles: config.authRoles.sa}
      },
      {
        path: 'GetProductionCapacity',
        component: ProductionCapacityListComponent,
        data: { title: 'ProductionCapacityList', breadcrumb: 'ProductionCapacityList', roles: config.authRoles.sa}
      },
      {
        path: 'GetPerformance',
        component: PerformanceListComponent,
        data: { title: 'PerformanceList', breadcrumb: 'PerformanceList', roles: config.authRoles.sa}
      },
      {
        path: 'GetItemsList',
        component: AnnualProductsStatusListComponent,
        data: { title: 'AnnualProductsStatusList', breadcrumb: 'AnnualProductsStatusList', roles: config.authRoles.sa}
      },
      {
        path: 'ProductionDashboard',
        component: ProdDashboardComponent,
        data: { title: 'ProductionDashboard', breadcrumb: 'ProductionDashboard', roles: config.authRoles.sa}
      },
      {
        path: 'GetForecastingData',
        component: CountryforecastComponent,
        data: { title: 'Countryforecast', breadcrumb: 'Countryforecast', roles: config.authRoles.sa}
      },
      {
        path: 'GetPromotionalMaterialStock',
        component: PromotionalMaterialStockComponent,
        data: { title: 'PromotionalMaterialStock', breadcrumb: 'PromotionalMaterialStock', roles: config.authRoles.sa}
      },
      {
        path: 'GetSalesForcastForm',
        component: SalesforecastrptComponent,
        data: { title: 'GetSalesForcastForm', breadcrumb: 'GetSalesForcastForm', roles: config.authRoles.sa}
      },
      {
        path: 'GetMaterialForecast',
        component: MaterialforecastComponent,
        data: { title: 'GetMaterialForecast', breadcrumb: 'GetMaterialForecast', roles: config.authRoles.sa },
      }, 
      {
        path: 'ShippingList',
        component: ShippingListComponent,
        data: { title: 'ShippingList', breadcrumb: 'ShippingList', roles: config.authRoles.sa },
      },
      {
        path: 'ShippingForm',
        component: ShippingFormComponent,
        data: { title: 'ShippingForm', breadcrumb: 'ShippingForm', roles: config.authRoles.sa },
      },
      {
        path: 'ActualSalesVsSalesOrders',
        component: ActualSalesVsSalesOrdersComponent,
        data: { title: 'ActualSalesVsSalesOrders', breadcrumb: 'ActualSalesVsSalesOrders', roles: config.authRoles.sa}
      },
      {
        path: 'ShippedPromotionalMaterialsVsOrders',
        component: ShippedPromotionalMaterialsVsOrdersComponent,
        data: { title: 'ShippedPromotionalMaterialsVsOrders', breadcrumb: 'ShippedPromotionalMaterialsVsOrders', roles: config.authRoles.sa}
      },
      {
        path: 'prodCostingRpt',
        component: ProdcostrepComponent,
        data: { title: 'prodCostingRpt', breadcrumb: 'prodCostingRpt', roles: config.authRoles.sa}
      }

      
    ]
  }
 
];


