import { config } from 'config';
import { Routes } from "@angular/router";
import { NotFoundComponent } from "../app-account/not-found/not-found.component"; 
import { ErrorComponent } from "../app-account/error/error.component"; 
import { LoginComponent } from "../app-account/login/login.component"; 
import { CustomersopeningbalanceFormComponent } from "./customersopeningbalance/customersopeningbalance-form/customersopeningbalance-form.component";
import { CustomersopeningbalanceListComponent } from "./customersopeningbalance/customersopeningbalance-list/customersopeningbalance-list.component";
import { CustomerpaymentvoucherFormComponent } from './customerspaymentvoucher/customerpaymentvoucher-form/customerpaymentvoucher-form.component';
import { CustomerpaymentvoucherListComponent } from './customerspaymentvoucher/customerpaymentvoucher-list/customerpaymentvoucher-list.component';
import { CustomerrecieptvoucherFormComponent } from './customerReceiptVoucher/customerrecieptvoucher-form/customerrecieptvoucher-form.component';
import { CustomerrecieptvoucherListComponent } from './customerReceiptVoucher/customerrecieptvoucher-list/customerrecieptvoucher-list.component';
import { CustomerdebitvoucherFormComponent } from './customerDebitNoteVoucher/customerdebitvoucher-form/customerdebitvoucher-form.component';
import { CustomerdebitvoucherListComponent } from './customerDebitNoteVoucher/customerdebitvoucher-list/customerdebitvoucher-list.component';
import { CustomercreditvoucherFormComponent } from './customerCreditNoteVoucher/customercreditvoucher-form/customercreditvoucher-form.component';
import { CustomercreditvoucherListComponent } from './customerCreditNoteVoucher/customercreditvoucher-list/customercreditvoucher-list.component';
import { CustservicesalesinvFormComponent } from './customerServiceSalesInvoice/custservicesalesinv-form/custservicesalesinv-form.component';
import { CustservicesalesinvListComponent } from './customerServiceSalesInvoice/custservicesalesinv-list/custservicesalesinv-list.component';
import { CustomerbalancesComponent } from './app-Receivables-Reports/customerBalancesRpt/customerbalances/customerbalances.component';
import { CustomeraccountstatementComponent } from './app-Receivables-Reports/CustomerAccountStatement/customeraccountstatement.component';
import { CustomertransactionsComponent } from './app-Receivables-Reports/CustomerTransactionsRpt/customertransactions.component';
import { CustomeragingComponent } from './app-Receivables-Reports/CustomerAging/customeraging.component';
import { PaidbillsComponent } from './app-Receivables-Reports/PaymentVouchersRpt/paidbills.component';
import { ListOfNewStudentsComponent } from './ListOfNewStudents/list-of-new-students/list-of-new-students.component';
import { TransferringAmountListComponent } from './TransferringAmount/transferring-amount-list/transferring-amount-list.component';
import { TransferringAmountFormComponent } from './TransferringAmount/transferring-amount-form/transferring-amount-form.component';
import { StudentsadjustmentlistComponent } from './studentsadjustmentlist/studentsadjustmentlist.component';
import { StudentsnewinvoicesComponent } from './studentsnewinvoices/studentsnewinvoices.component'

export const AppReceivablesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'CustOpeningBalanceList',
         component: CustomersopeningbalanceListComponent,
        data: { title: 'CustOpeningBalanceList', breadcrumb: 'CustOpeningBalanceList', roles: config.authRoles.sa }
      },
      {
        path: 'CustopeningbalanceForm',
         component: CustomersopeningbalanceFormComponent,
        data: { title: 'CustopeningbalanceForm', breadcrumb: 'CustopeningbalanceForm', roles: config.authRoles.sa }
      },
      {
        path: 'CustpaymentvoucherList',
         component: CustomerpaymentvoucherListComponent,
        data: { title: 'CustpaymentvoucherList', breadcrumb: 'CustpaymentvoucherList', roles: config.authRoles.sa }
      },
      {
        path: 'CustpaymentvoucherForm',
         component: CustomerpaymentvoucherFormComponent,
        data: { title: 'CustpaymentvoucherForm', breadcrumb: 'CustpaymentvoucherForm', roles: config.authRoles.sa }
      },
      {
        path: 'CustRecieptvoucherList',
         component: CustomerrecieptvoucherListComponent,
        data: { title: 'CustRecieptvoucherList', breadcrumb: 'CustRecieptvoucherList', roles: config.authRoles.sa }
      },
      {
        path: 'CustRecieptvoucherForm',
         component: CustomerrecieptvoucherFormComponent,
        data: { title: 'CustRecieptvoucherForm', breadcrumb: 'CustRecieptvoucherForm', roles: config.authRoles.sa }
      },
      {
        path: 'AddCustomerReceiptVoucherH/:username/:password',
        component: CustomerrecieptvoucherListComponent,
        data: { title: 'CustRecieptvoucherForm', breadcrumb: 'CustRecieptvoucherForm' }
      },
      {
        path: 'AddCustomerPaymentVoucherH/:username/:password',
        component: CustomerpaymentvoucherListComponent,
        data: { title: 'CustpaymentvoucherForm', breadcrumb: 'CustpaymentvoucherForm' }
      },
      {
        path: 'CustDebitvoucherList',
         component: CustomerdebitvoucherListComponent,
        data: { title: 'CustDebitvoucherList', breadcrumb: 'CustDebitvoucherList', roles: config.authRoles.sa }
      },
      {
        path: 'CustDebitvoucherForm',
         component: CustomerdebitvoucherFormComponent,
        data: { title: 'CustDebitvoucherForm', breadcrumb: 'CustDebitvoucherForm', roles: config.authRoles.sa }
      },
      {
        path: 'CustCreditvoucherList',
         component: CustomercreditvoucherListComponent,
        data: { title: 'CustCreditvoucherList', breadcrumb: 'CustCreditvoucherList', roles: config.authRoles.sa }
      },
      {
        path: 'CustCreditvoucherForm',
         component: CustomercreditvoucherFormComponent,
        data: { title: 'CustCreditvoucherForm', breadcrumb: 'CustCreditvoucherForm', roles: config.authRoles.sa }
      },
      {
        path: 'CustServiceSalesInvoiceList',
         component: CustservicesalesinvListComponent,
        data: { title: 'CustServiceSalesInvoiceList', breadcrumb: 'CustServiceSalesInvoiceList', roles: config.authRoles.sa }
      },
      {
        path: 'CustServiceSalesInvoiceForm',
         component: CustservicesalesinvFormComponent,
        data: { title: 'CustServiceSalesInvoiceForm', breadcrumb: 'CustServiceSalesInvoiceForm', roles: config.authRoles.sa }
      },
      {
        path: 'GetSupplierBalanceForm',
         component: CustomerbalancesComponent,
        data: { title: 'CustomerBalances', breadcrumb: 'CustomerBalances', roles: config.authRoles.sa }
      },
      {
        path: 'GetCustomersAccountStatementForm',
         component: CustomeraccountstatementComponent,
        data: { title: 'CustomerAccountStatement', breadcrumb: 'CustomerAccountStatement', roles: config.authRoles.sa }
      },
      {
        path: 'GetCustomersAccountStatementH/:username/:password',
         component: CustomeraccountstatementComponent,
        data: { title: 'CustomerAccountStatement', breadcrumb: 'CustomerAccountStatement' }
      },
      {
        path: 'GetCustomerTransactionsForm',
         component: CustomertransactionsComponent,
        data: { title: 'CustomerTransactions', breadcrumb: 'CustomerTransactions', roles: config.authRoles.sa }
      },
      {
        path: 'GetCustomerAgingForm',
         component: CustomeragingComponent,
        data: { title: 'CustomerAging', breadcrumb: 'CustomerAging', roles: config.authRoles.sa }
      },
      {
        path: 'GetPaidBillsForm',
        component: PaidbillsComponent,
        data: { title: 'PaidBills', breadcrumb: 'PaidBills', roles: config.authRoles.sa }
      }, 
      {
        path: 'ListOfNewStudents',
        component: ListOfNewStudentsComponent,
        data: { title: 'ListOfNewStudents', breadcrumb: 'ListOfNewStudents', roles: config.authRoles.sa }
      },
      {
        path: 'studentsadjustmentlist',
        component: StudentsadjustmentlistComponent,
        data: { title: 'studentsadjustmentlist', breadcrumb: 'studentsadjustmentlist', roles: config.authRoles.sa }
      },
      {
        path: 'TransferringAmountList',
        component: TransferringAmountListComponent,
        data: { title: 'TransferringAmountList', breadcrumb: 'TransferringAmountList', roles: config.authRoles.sa }
      }, 
      {
        path: 'studentsnewinvoices',
        component: StudentsnewinvoicesComponent,
        data: { title: 'studentsnewinvoices', breadcrumb: 'studentsnewinvoices', roles: config.authRoles.sa }
      },
      {
        path: 'TransferringAmountForm',
        component: TransferringAmountFormComponent,
        data: { title: 'TransferringAmountForm', breadcrumb: 'TransferringAmountForm', roles: config.authRoles.sa }
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
