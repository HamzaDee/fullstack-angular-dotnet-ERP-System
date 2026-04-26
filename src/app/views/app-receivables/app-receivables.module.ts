import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { AppReceivablesRoutes } from './app-receivables-routing.module';
import { NotFoundComponent } from '../app-account/not-found/not-found.component';
import { ErrorComponent } from '../app-account/error/error.component';
import { LoginComponent } from '../app-account/login/login.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { MatIconModule } from '@angular/material/icon';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { AppSearchModule } from '../general/app-searchs/app-searchs.module';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { CustomersopeningbalanceListComponent } from './customersopeningbalance/customersopeningbalance-list/customersopeningbalance-list.component';
import { CustomersopeningbalanceFormComponent } from './customersopeningbalance/customersopeningbalance-form/customersopeningbalance-form.component';
import { CustomerpaymentvoucherListComponent } from './customerspaymentvoucher/customerpaymentvoucher-list/customerpaymentvoucher-list.component';
import { CustomerpaymentvoucherFormComponent } from './customerspaymentvoucher/customerpaymentvoucher-form/customerpaymentvoucher-form.component';
import { CustomerrecieptvoucherListComponent } from './customerReceiptVoucher/customerrecieptvoucher-list/customerrecieptvoucher-list.component';
import { CustomerrecieptvoucherFormComponent } from './customerReceiptVoucher/customerrecieptvoucher-form/customerrecieptvoucher-form.component';
import { CustomerdebitvoucherListComponent } from './customerDebitNoteVoucher/customerdebitvoucher-list/customerdebitvoucher-list.component';
import { CustomerdebitvoucherFormComponent } from './customerDebitNoteVoucher/customerdebitvoucher-form/customerdebitvoucher-form.component';
import { CustomercreditvoucherFormComponent } from './customerCreditNoteVoucher/customercreditvoucher-form/customercreditvoucher-form.component';
import { CustomercreditvoucherListComponent } from './customerCreditNoteVoucher/customercreditvoucher-list/customercreditvoucher-list.component';
import { CustservicesalesinvListComponent } from './customerServiceSalesInvoice/custservicesalesinv-list/custservicesalesinv-list.component';
import { CustservicesalesinvFormComponent } from './customerServiceSalesInvoice/custservicesalesinv-form/custservicesalesinv-form.component';
import { AppFinancialvoucherModule } from '../general/app-Showfinancialdocuments/financialvoucher.module';
import { ListOfNewStudentsComponent } from './ListOfNewStudents/list-of-new-students/list-of-new-students.component';
import { TransferringAmountFormComponent } from './TransferringAmount/transferring-amount-form/transferring-amount-form.component';
import { TransferringAmountListComponent } from './TransferringAmount/transferring-amount-list/transferring-amount-list.component';
import { StudentsadjustmentlistComponent } from './studentsadjustmentlist/studentsadjustmentlist.component';
import { StudentsnewinvoicesComponent } from './studentsnewinvoices/studentsnewinvoices.component'
import { TooltipModule } from 'primeng/tooltip';
import { AppCliqvoucherModule } from '../general/app-cliqvoucher/clickvoucher.module';

@NgModule({
  declarations: [
    CustomersopeningbalanceListComponent,
    CustomersopeningbalanceFormComponent,
    CustomerpaymentvoucherListComponent,
    CustomerpaymentvoucherFormComponent,
    CustomerrecieptvoucherListComponent,
    CustomerrecieptvoucherFormComponent,
    CustomerdebitvoucherListComponent,
    CustomerdebitvoucherFormComponent,
    CustomercreditvoucherListComponent,
    CustomercreditvoucherFormComponent,
    CustservicesalesinvListComponent,
    CustservicesalesinvFormComponent,
    ListOfNewStudentsComponent,
    TransferringAmountListComponent,
    TransferringAmountFormComponent,
    StudentsadjustmentlistComponent,
    StudentsnewinvoicesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TranslateModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    SharedPipesModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    AutoCompleteModule,
    MatIconModule,
    TreeTableModule,
    TableModule,
    SharedPrimengModule,
    AppSearchModule,
    AppGeneralAttachmentModule,
    AppFinancialvoucherModule,
    TooltipModule,
    AppCliqvoucherModule,
    RouterModule.forChild(AppReceivablesRoutes)
  ],

})
export class AppReceivablesModule { }