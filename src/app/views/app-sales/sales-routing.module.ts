import { Routes } from '@angular/router';
import { SalesRequestFormComponent } from './sales-request/sales-request-form/sales-request-form.component'; 
import { SalessRequesListComponent } from './sales-request/saless-reques-list/saless-reques-list.component'; 
import { config } from 'config';
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
import { ItemsdeldocumentListComponent } from './app-DeliveryVoucher/itemsDelVoucher-list/itemsdeldocument-list.component';
import { ItemsdeldocumentFormComponent } from './app-DeliveryVoucher/itemsDelVoucher-form/itemsdeldocument-form.component';
import { ReturnsalesinvoiceListComponent } from './app-ReturnSalesVoucher/returnsalesinvoice-list/returnsalesinvoice-list.component';
import { ReturnsalesinvoiceFormComponent } from './app-ReturnSalesVoucher/returnsalesinvoice-form/returnsalesinvoice-form.component';
import { TaxessreportListComponent } from './sales-reports/TaxesReport/taxessreport-list.component';
import { ComparisonSalesOfCategoryOrItemByYearsComponent } from './sales-reports/ComparisonSalesOfCategoryOrItemByYears/comparison-sales-of-category-or-item-by-years/comparison-sales-of-category-or-item-by-years.component';
import { ItemsOffersFormComponent } from './Sales-ItemsOffers/items-offers-form/items-offers-form.component';
import { ItemsOffersListComponent } from './Sales-ItemsOffers/items-offers-list/items-offers-list.component';

export const SalesRequestroutes: Routes = 
[
  {
    path: '',
    children:
    [
        {
          path: 'SalessRequesList',
          component: SalessRequesListComponent,
          data: { title: 'SalessRequesList', breadcrumb: 'SalessRequesList', roles: config.authRoles.sa}
        },
        {
          path: 'SalesRequestForm',
          component: SalesRequestFormComponent,
          data: { title: 'SalesRequestForm', breadcrumb: 'SalesRequestForm', roles: config.authRoles.sa}
        },
        {
          path: 'SalessRequstSheet/:id',
          component: SalessRequstSheetComponent,
          data: { title: 'SalessRequstSheet', breadcrumb: 'SalessRequstSheet', roles: config.authRoles.sa}
        },
        {
          path: 'GetDetailedSalesReport',
          component: DetailedSaleStatementListComponent,
          data: { title: 'DetailedSaleStatement', breadcrumb: 'DetailedSaleStatement', roles: config.authRoles.sa}
        },
        {
          path: 'GetItemSalesReportReport',
          component: ItemSalesReportListComponent,
          data: { title: 'ItemSalesReport', breadcrumb: 'ItemSalesReport', roles: config.authRoles.sa}
        },
        {
          path: 'GetListOfReturneditemReport',
          component: ListOfReturneditemReportListComponent,
          data: { title: 'ListOfReturneditemReport', breadcrumb: 'ListOfReturneditemReport', roles: config.authRoles.sa}
        },
        {
          path: 'GetRequestedItemsForm',
          component: RequestedItemsReportSalesListComponent,
          data: { title: 'RequestedItemsReportSalesList', breadcrumb: 'RequestedItemsReportSalesList', roles: config.authRoles.sa}
        },
        {
          path: 'GetHemsProfitReport',
          component: HemsProfitReportListComponent,
          data: { title: 'HemsProfitReportList', breadcrumb: 'HemsProfitReportList', roles: config.authRoles.sa}
        },
        {
          path: 'GetSalesRepresentativeReport',
          component: SalesRepresentativeSalesReportListComponent,
          data: { title: 'SalesRepresentativeSalesReportList', breadcrumb: 'SalesRepresentativeSalesReportList', roles: config.authRoles.sa}
        },
        {
          path: 'GetTaxesReportForm',
          component: TaxessreportListComponent,
          data: { title: 'SalesTaxesReportList', breadcrumb: 'SalesTaxesReportList', roles: config.authRoles.sa}
        },
        {
          path: 'SalesInvoicesList',
          component: SalesInvoicesListComponent,
          data: { title: 'SalesInvoicesList', breadcrumb: 'SalesInvoicesList', roles: config.authRoles.sa}
        },
        {
          path: 'SalesInvoicesForm',
          component: SalesInvoicesFormComponent,
          data: { title: 'SalesInvoicesForm', breadcrumb: 'SalesInvoicesForm', roles: config.authRoles.sa}
        },
        {
          path: 'ItemsDeliveryList',
          component: ItemsdeldocumentListComponent,
          data: { title: 'ItemsDeliveryList', breadcrumb: 'ItemsDeliveryList', roles: config.authRoles.sa}
        },
        {
          path: 'ItemsDeliveryForm',
          component: ItemsdeldocumentFormComponent,
          data: { title: 'ItemsDeliveryForm', breadcrumb: 'ItemsDeliveryForm', roles: config.authRoles.sa}
        },
        {
          path: 'ReturnSalesInvoiceList',
          component: ReturnsalesinvoiceListComponent,
          data: { title: 'ReturnSalesInvoiceList', breadcrumb: 'ReturnSalesInvoiceList', roles: config.authRoles.sa}
        },
        {
          path: 'ReturnSalesInvoiceForm',
          component: ReturnsalesinvoiceFormComponent,
          data: { title: 'ReturnSalesInvoiceForm', breadcrumb: 'ReturnSalesInvoiceForm', roles: config.authRoles.sa}
        },
        {
          path: 'GetItemsTaxReport',
          component: ItemsTaxReportlistComponent,
          data: { title: 'ItemsTaxReportlist', breadcrumb: 'ItemsTaxReportlist', roles: config.authRoles.sa}
        },
        {
          path: 'GetComparisonSalesOfCategoryOrItemByYearsReport',
          component: ComparisonSalesOfCategoryOrItemByYearsComponent,
          data: { title: 'ComparisonSalesOfCategoryOrItemByYears', breadcrumb: 'ComparisonSalesOfCategoryOrItemByYears', roles: config.authRoles.sa}
        },
        {
          path: 'ItemsOffersList',
          component: ItemsOffersListComponent,
          data: { title: 'ItemsOffersList', breadcrumb: 'ItemsOffersList', roles: config.authRoles.sa}
        },
        {
          path: 'ItemsOffersForm',
          component: ItemsOffersFormComponent,
          data: { title: 'ItemsOffersForm', breadcrumb: 'ItemsOffersForm', roles: config.authRoles.sa}
        }
    ]
  }
];

