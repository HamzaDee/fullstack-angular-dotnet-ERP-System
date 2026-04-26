import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalancesofFinishedGoodsReportComponent } from './BalancesofFinishedGoodsReport/balancesof-finished-goods-report/balancesof-finished-goods-report.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { ProductionReportRoutes } from './production-report-routing.module';
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
import { ChartModule } from 'primeng/chart';
import { ActualSalesVsSalesOrdersComponent } from './actual-sales-vs-sales-orders/actual-sales-vs-sales-orders.component';
import { ShippedPromotionalMaterialsVsOrdersComponent } from './shipped-promotional-materials-vs-orders/shipped-promotional-materials-vs-orders.component';

@NgModule({
  declarations: [
    BalancesofFinishedGoodsReportComponent,
    ProducedQuantitiesListComponent,
    ManufacturingListforCountriesListComponent,
    ProductivityListComponent,
    DatesOfArrivalOfMaterialsListComponent,
    ProductionCapacityListComponent,
    PerformanceListComponent,
    AnnualProductsStatusListComponent,
    ProdDashboardComponent,
    CountryforecastComponent,
    PromotionalMaterialStockComponent,
    SalesforecastrptComponent,
    MaterialforecastComponent,
    ActualSalesVsSalesOrdersComponent,
    ShippedPromotionalMaterialsVsOrdersComponent,
    
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ProductionReportRoutes),  
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
    NgChartsModule,
    ChartModule
  ]
})
export class ProductionReportModule { }
