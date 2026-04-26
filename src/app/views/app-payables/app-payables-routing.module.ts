
import { Routes } from "@angular/router";
import { NotFoundComponent } from "../app-account/not-found/not-found.component"; 
import { ErrorComponent } from "../app-account/error/error.component"; 
import { LoginComponent } from "../app-account/login/login.component"; 
import { config } from 'config';
import { SuppopeningbalanceFormComponent } from "./suppliersopeningbalance/suppopeningbalance-form/suppopeningbalance-form.component";
import { SuppopeningbalanceListComponent } from "./suppliersopeningbalance/suppopeningbalance-list/suppopeningbalance-list.component";
import { SupplierpaymentvoucherFormComponent } from "./supplierpaymentvoucher/supplierpaymentvoucher-form/supplierpaymentvoucher-form.component";
import { SupplierpaymentvoucherListComponent } from "./supplierpaymentvoucher/supplierpaymentvoucher-list/supplierpaymentvoucher-list.component";
import { SupplierrecieptvoucherFormComponent } from "./supplierReceiptVoucher/supplierrecieptvoucher-form/supplierrecieptvoucher-form.component";
import { SupplierrecieptvoucherListComponent } from "./supplierReceiptVoucher/supplierrecieptvoucher-list/supplierrecieptvoucher-list.component";
import { SupplierdebitvoucherFormComponent } from "./supplierDebitNoteVoucher/supplierdebitvoucher-form/supplierdebitvoucher-form.component";
import { SupplierdebitvoucherListComponent } from "./supplierDebitNoteVoucher/supplierdebitvoucher-list/supplierdebitvoucher-list.component";
import { SuppliercreditvoucherFormComponent } from "./supplierCreditNoteVoucher/suppliercreditvoucher-form/suppliercreditvoucher-form.component";
import { SuppliercreditvoucherListComponent } from "./supplierCreditNoteVoucher/suppliercreditvoucher-list/suppliercreditvoucher-list.component";
import { SuppservicepurFormComponent } from "./supplierServicePurInvoice/suppservicepur-form/suppservicepur-form.component";
import { SuppservicepurListComponent } from "./supplierServicePurInvoice/suppservicepur-list/suppservicepur-list.component";
import { SupplierbalanceComponent } from "./app-payables-Reports/supplierbalancesRpt/supplierbalance/supplierbalance.component";
import { SupplieraccountstatementComponent } from "./app-payables-Reports/supplierAccountStatementRpt/supplieraccountstatement.component";
import { SuppliertransactionsComponent } from "./app-payables-Reports/supplierTransactionsRpt/suppliertransactions.component";
import { SupplieragingComponent } from "./app-payables-Reports/SupplierAging/supplieraging.component";
import { SupplierpaidbillsComponent } from "./app-payables-Reports/supplierPaidBills/supplierpaidbills.component";

export const AppPayablesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'SuppOpeningBalanceList',
        component: SuppopeningbalanceListComponent,
        data: { title: 'SuppOpeningBalanceList', breadcrumb: 'SuppOpeningBalanceList', roles: config.authRoles.sa }
      },
      {
        path: 'SuppopeningbalanceForm',
        component: SuppopeningbalanceFormComponent,
        data: { title: 'SuppopeningbalanceForm', breadcrumb: 'SuppopeningbalanceForm', roles: config.authRoles.sa }
      },
      {
        path: 'SupppaymentvoucherList',
        component: SupplierpaymentvoucherListComponent,
        data: { title: 'SupppaymentvoucherList', breadcrumb: 'SupppaymentvoucherList', roles: config.authRoles.sa }
      },      
      {
        path: 'SupppaymentvoucherForm',
        component: SupplierpaymentvoucherFormComponent,
        data: { title: 'SupppaymentvoucherForm', breadcrumb: 'SupppaymentvoucherForm', roles: config.authRoles.sa }
      },
      {
        path: 'SuppReceiptvoucherList',
        component: SupplierrecieptvoucherListComponent,
        data: { title: 'SuppReceiptvoucherList', breadcrumb: 'SuppReceiptvoucherList', roles: config.authRoles.sa }
      },      
      {
        path: 'SuppReceiptvoucherForm',
        component: SupplierrecieptvoucherFormComponent,
        data: { title: 'SuppReceiptvoucherForm', breadcrumb: 'SuppReceiptvoucherForm', roles: config.authRoles.sa }
      },
      {
        path:'SuppDebitVoucherList',
        component: SupplierdebitvoucherListComponent ,
        data : {title:'SuppDebitVoucherList',breadcrumb:'SuppDebitVoucherList',roles:config.authRoles.sa}
      },
      {
        path:'SuppDebitVoucherForm',
        component:SupplierdebitvoucherFormComponent ,
        data :{title:'SuppDebitVoucherForm',breadcrumb:'SuppDebitVoucherForm',roles:config.authRoles.sa}
      },
      {
        path:'SuppCreditVoucherList',
        component: SuppliercreditvoucherListComponent ,
        data : {title:'SuppCreditVoucherList',breadcrumb:'SuppCreditVoucherList',roles:config.authRoles.sa}
      },
      {
        path:'SuppCreditVoucherForm',
        component:SuppliercreditvoucherFormComponent ,
        data :{title:'SuppCreditVoucherForm',breadcrumb:'SuppCreditVoucherForm',roles:config.authRoles.sa}
      },
      {
        path:'SupplierPurServiceInvoiceList',
        component: SuppservicepurListComponent ,
        data : {title:'SupplierPurServiceInvoiceList',breadcrumb:'SupplierPurServiceInvoiceList',roles:config.authRoles.sa}
      },
      {
        path:'SupplierPurServiceInvoiceForm',
        component:SuppservicepurFormComponent ,
        data :{title:'SupplierPurServiceInvoiceForm',breadcrumb:'SupplierPurServiceInvoiceForm',roles:config.authRoles.sa}
      },
      {
        path:'GetSupplierBalanceForm',
        component:SupplierbalanceComponent ,
        data :{title:'SupplierBalances',breadcrumb:'SupplierBalances',roles:config.authRoles.sa}
      },
      {
        path:'GetSupplierAccountStatementForm',
        component:SupplieraccountstatementComponent ,
        data :{title:'SupplierAccountStatement',breadcrumb:'SupplierAccountStatement',roles:config.authRoles.sa}
      },
      {
        path:'GetSupplierTransactionsForm',
        component:SuppliertransactionsComponent ,
        data :{title:'SupplierTransactions',breadcrumb:'SupplierTransactions',roles:config.authRoles.sa}
      },      
      {
        path:'GetSupplierAgingForm',
        component:SupplieragingComponent ,
        data :{title:'SupplierAging',breadcrumb:'SupplierAging',roles:config.authRoles.sa}
      },
      {
        path:'GetSupplierPaidBillsForm',
        component:SupplierpaidbillsComponent ,
        data :{title:'PaidBills',breadcrumb:'PaidBills',roles:config.authRoles.sa}
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
