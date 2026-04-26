import { PerfectScrollbarModule } from 'app/shared/components/perfect-scrollbar';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
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
import { SuppopeningbalanceFormComponent } from './suppliersopeningbalance/suppopeningbalance-form/suppopeningbalance-form.component';
import { SuppopeningbalanceListComponent } from './suppliersopeningbalance/suppopeningbalance-list/suppopeningbalance-list.component';
import { AppPayablesRoutes } from './app-payables-routing.module';
import { AppSearchModule } from '../general/app-searchs/app-searchs.module';
import { SupplierpaymentvoucherFormComponent } from './supplierpaymentvoucher/supplierpaymentvoucher-form/supplierpaymentvoucher-form.component';
import { SupplierpaymentvoucherListComponent } from './supplierpaymentvoucher/supplierpaymentvoucher-list/supplierpaymentvoucher-list.component';
import { AppGeneralAttachmentModule } from '../general/app-general-attachment/app-general-attachment.module';
import { SupplierrecieptvoucherListComponent } from './supplierReceiptVoucher/supplierrecieptvoucher-list/supplierrecieptvoucher-list.component';
import { SupplierrecieptvoucherFormComponent } from './supplierReceiptVoucher/supplierrecieptvoucher-form/supplierrecieptvoucher-form.component';
import { SupplierdebitvoucherListComponent } from './supplierDebitNoteVoucher/supplierdebitvoucher-list/supplierdebitvoucher-list.component';
import { SupplierdebitvoucherFormComponent } from './supplierDebitNoteVoucher/supplierdebitvoucher-form/supplierdebitvoucher-form.component';
import { SuppliercreditvoucherListComponent } from './supplierCreditNoteVoucher/suppliercreditvoucher-list/suppliercreditvoucher-list.component';
import { SuppliercreditvoucherFormComponent } from './supplierCreditNoteVoucher/suppliercreditvoucher-form/suppliercreditvoucher-form.component';
import { SuppservicepurListComponent } from './supplierServicePurInvoice/suppservicepur-list/suppservicepur-list.component';
import { SuppservicepurFormComponent } from './supplierServicePurInvoice/suppservicepur-form/suppservicepur-form.component';
import { AppFinancialvoucherModule } from '../general/app-Showfinancialdocuments/financialvoucher.module';
import { AppCliqvoucherModule } from '../general/app-cliqvoucher/clickvoucher.module';

@NgModule({
  declarations: [SuppopeningbalanceListComponent,SuppopeningbalanceFormComponent, SupplierpaymentvoucherFormComponent, SupplierpaymentvoucherListComponent, SupplierrecieptvoucherListComponent, SupplierrecieptvoucherFormComponent, SupplierdebitvoucherListComponent, SupplierdebitvoucherFormComponent, SuppliercreditvoucherListComponent, SuppliercreditvoucherFormComponent, SuppservicepurListComponent, SuppservicepurFormComponent],
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
    AppCliqvoucherModule,
    RouterModule.forChild(AppPayablesRoutes)
  ],
})
export class ApppayablesModule { }