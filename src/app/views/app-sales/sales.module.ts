import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalessRequesListComponent } from './sales-request/saless-reques-list/saless-reques-list.component'; 
import { SalesRequestFormComponent } from './sales-request/sales-request-form/sales-request-form.component'; 
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
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { AppSearchModule } from '../general/app-searchs/app-searchs.module';
import { SalesRequestroutes } from './sales-routing.module'; 
import { SalessRequstSheetComponent } from './sales-request/saless-requst-sheet/saless-requst-sheet.component';
import { DetailedSaleStatementListComponent } from './sales-reports/DetailedSaleStatement/detailed-sale-statement-list/detailed-sale-statement-list.component'; 
import { ItemSalesReportListComponent } from './sales-reports/ItemSalesReport/item-sales-report-list/item-sales-report-list.component'; 
import { ListOfReturneditemReportListComponent } from './sales-reports/ListOfReturneditemReport/list-of-returneditem-report-list/list-of-returneditem-report-list.component'; 
import { ItemsTaxReportlistComponent } from './sales-reports/ItemsTaxReport/items-tax-reportlist/items-tax-reportlist.component'; 
import { RequestedItemsReportSalesListComponent } from './sales-reports/RequestedItemsReport-Sales/requested-items-report-sales-list/requested-items-report-sales-list.component'; 
import { HemsProfitReportListComponent } from './sales-reports/HemsProfitReport/hems-profit-report-list/hems-profit-report-list.component'; 
import { SalesRepresentativeSalesReportListComponent } from './sales-reports/SalesRepresentativeSalesReport/sales-representative-sales-report-list/sales-representative-sales-report-list.component'; 
import { SalesInvoicesListComponent } from './SalesInvoices/sales-invoices-list/sales-invoices-list.component'; 
import { SalesInvoicesFormComponent } from './SalesInvoices/sales-invoices-form/sales-invoices-form.component'; 
import { SalesSearchModule } from './app-SalesSearch/sales-search.module'; 
import { ReturnsalesinvoiceListComponent } from './app-ReturnSalesVoucher/returnsalesinvoice-list/returnsalesinvoice-list.component'; 
import { ReturnsalesinvoiceFormComponent } from './app-ReturnSalesVoucher/returnsalesinvoice-form/returnsalesinvoice-form.component'; 
import { AppInvSearchModule } from '../general/app-invSearch/invSearch.module';
import { TaxessreportListComponent } from './sales-reports/TaxesReport/taxessreport-list.component';
import { ComparisonSalesOfCategoryOrItemByYearsComponent } from './sales-reports/ComparisonSalesOfCategoryOrItemByYears/comparison-sales-of-category-or-item-by-years/comparison-sales-of-category-or-item-by-years.component';  
import { AppdeleiverystockModule } from './app-DeliveryVoucher/itemsdel.module';
import { AppFinancialvoucherModule } from '../general/app-Showfinancialdocuments/financialvoucher.module';
import { ItemsOffersFormComponent } from './Sales-ItemsOffers/items-offers-form/items-offers-form.component';
import { ItemsOffersListComponent } from './Sales-ItemsOffers/items-offers-list/items-offers-list.component';

@NgModule({
  declarations: [
    SalessRequesListComponent,
    SalesRequestFormComponent,
    SalessRequstSheetComponent,
    DetailedSaleStatementListComponent,
    ItemSalesReportListComponent,
    ListOfReturneditemReportListComponent,
    ItemsTaxReportlistComponent,
    RequestedItemsReportSalesListComponent,
    HemsProfitReportListComponent,
    SalesRepresentativeSalesReportListComponent,
    SalesInvoicesListComponent,
    SalesInvoicesFormComponent,
    // ItemsdeldocumentFormComponent,
    // ItemsdeldocumentListComponent,
    ReturnsalesinvoiceListComponent,
    ReturnsalesinvoiceFormComponent,
    TaxessreportListComponent,
    ComparisonSalesOfCategoryOrItemByYearsComponent,
    ItemsOffersListComponent,
    ItemsOffersFormComponent,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(SalesRequestroutes),  
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
    SalesSearchModule,  
    AppGeneralAttachmentModule,
    AppdeleiverystockModule,
    AppFinancialvoucherModule
  ]
})
export class AppSalesModule { }
