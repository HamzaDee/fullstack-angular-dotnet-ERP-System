import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgChartsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SharedPipesModule } from 'app/shared/pipes/shared-pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPrimengModule } from 'app/shared/shared-primeng.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { AppInventoryRoutingModule } from './app-inventory-routing.module';
import { RepricingItemsComponent } from './repricing-items/repricing-items.component';
import { RepricingItemsFormComponent } from './repricing-items/repricing-items-form/repricing-items-form.component';  
import { RepricingItemsDetailsComponent } from './repricing-items/repricing-items-details/repricing-items-details.component';
import { ItemSetListComponent } from './items-sets/item-set-list/item-set-list.component';
import { ItemSetFormComponent } from './items-sets/item-set-form/item-set-form.component';
import { ExpiryDatesComponent } from './inv-reports/expiry-dates/expiry-dates.component';
import { ItemsBalancesComponent } from './inv-reports/items-balances/items-balances.component';
import { ItemsLocationComponent } from './inv-reports/items-location/items-location.component';
import { ItemsTransComponent } from './inv-reports/items-trans/items-trans.component';
import { ReorderItemsComponent } from './inv-reports/reorder-items/reorder-items.component';
import { ReserveItemsComponent } from './inv-reports/reserve-items/reserve-items.component';
import { ItemsEntryVoucherFormComponent } from './items-entry-voucher/component/items-entry-voucher-form/items-entry-voucher-form.component';
import { ItemsEntryVoucherListComponent } from './items-entry-voucher/component/items-entry-voucher-list/items-entry-voucher-list.component';
import { ItemsEntryVoucherTemplatComponent } from './items-entry-voucher/component/items-entry-voucher-templat/items-entry-voucher-templat.component';
import { VoucherTermsComponent } from './items-entry-voucher/component/items-entry-voucher-form/voucher-terms/voucher-terms.component';
import { ItemSequencesComponent } from './items-entry-voucher/component/items-entry-voucher-form/voucher-terms/item-sequences/item-sequences.component';
import { AppGeneralAttachmentModule } from 'app/views/general/app-general-attachment/app-general-attachment.module';
import { ItemsReservationVoucherListComponent } from './ItemsReservationVoucher/items-reservation-voucher-list/items-reservation-voucher-list.component';
import { ItemsReservationVoucherFormComponent } from './ItemsReservationVoucher/items-reservation-voucher-form/items-reservation-voucher-form.component';
import { AppSearchModule } from '../general/app-searchs/app-searchs.module';
import { ItemsTransferVoucherListComponent } from './ItemsTransferVoucher/items-transfer-voucher-list/items-transfer-voucher-list.component';
import { ItemsTransferVoucherFormComponent } from './ItemsTransferVoucher/items-transfer-voucher-form/items-transfer-voucher-form.component';
import { DamageStockVoucherListComponent } from './DamageStockVoucher/damage-stock-voucher-list/damage-stock-voucher-list.component';
import { DamageStockVoucherFormComponent } from './DamageStockVoucher/damage-stock-voucher-form/damage-stock-voucher-form.component';
import { OutputvoucherlistComponent } from './items-output-voucher/OutputVoucherList/outputvoucherlist.component';
import { OutputvoucherformComponent } from './items-output-voucher/OutputVoucherForm/outputvoucherform.component';
import { AppInvSearchModule } from '../general/app-invSearch/invSearch.module';
import { AppItemSerialsModule } from '../general/app-itemSerials/itemsserials.modeule';
import { InvreceiptvoucherListComponent } from './app-receiptVoucher/invReceiptVoucher-list/invreceiptvoucher-list.component';
import { InvreceiptvoucherFormComponent } from './app-receiptVoucher/invReceiptVoucher-form/invreceiptvoucher-form.component';
import { GetItemCostComponent } from './get-item-cost/get-item-cost.component';
import { EntrvoucherFormComponent } from './app-entryvoucher/entryvoucher-form/entrvoucher-form.component';
import { EntrvoucherListComponent } from './app-entryvoucher/entryvoucher-list/entrvoucher-list.component';
import { AppFinancialvoucherModule } from '../general/app-Showfinancialdocuments/financialvoucher.module';
import { AssemblyitemssFormComponent } from './app-assemblyitems/assemblyitems_Form/assemblyitemss-form.component';
import { AssemblyitemssListComponent } from './app-assemblyitems/assemblyitems-List/assemblyitemss-list.component';
import { DisassemblyitemssListComponent } from './app-disassemblyitems/disassemblyItems-list/disassemblyitemss-list.component';
import { DisassemblyitemssFormComponent } from './app-disassemblyitems/disassemblyItems-form/disassemblyitemss-form.component';
import { EntryvouhcerhformComponent } from './app-entryvoucherh/entryvoucherh-form/entryvouhcerhform.component';
import { EntryvouhcerhlistComponent } from './app-entryvoucherh/entryvoucherh-list/entryvouhcerhlist.component';
import { ItemdetailsComponent } from '../general/app-itemsDetails/itemdetails.component';
import { OutputvoucherhformComponent } from './app-outputvoucherh/outputvoucherh-form/outputvoucherhform.component';
import { OutputvoucherhlistComponent } from './app-outputvoucherh/outputvoucherh-list/outputvoucherhlist.component';
import { ItemssettelmentlistComponent } from './app-itemsSettelment/itemsSettelmentList/itemssettelmentlist.component';
import { ItemssettelmentformComponent } from './app-itemsSettelment/itemsSettlementForm/itemssettelmentform.component';
import { ItemsSerialsReportComponent } from './inv-reports/items-serials-report/items-serials-report.component';
import { ItempricesComponent } from './inv-reports/Item-Prices/itemprices.component';
import { AppCarsDetailsComponent } from '../general/app-cars-details/app-cars-details.component';

@NgModule({ 
  declarations: [
    RepricingItemsComponent, 
    RepricingItemsFormComponent, 
    RepricingItemsDetailsComponent, 
    ItemSetListComponent, 
    ItemSetFormComponent, 
    ExpiryDatesComponent, 
    ItemsBalancesComponent, 
    ItemsLocationComponent, 
    ItemsTransComponent, 
    ReorderItemsComponent, 
    ReserveItemsComponent,
    ItemsEntryVoucherFormComponent,
    ItemsEntryVoucherListComponent,
    ItemsEntryVoucherTemplatComponent,
    VoucherTermsComponent,
    ItemSequencesComponent,
    ItemsReservationVoucherListComponent,
    ItemsReservationVoucherFormComponent,
    ItemsTransferVoucherListComponent,
    ItemsTransferVoucherFormComponent,
    DamageStockVoucherListComponent,
    DamageStockVoucherFormComponent,
    RepricingItemsComponent, RepricingItemsFormComponent, RepricingItemsDetailsComponent, 
    ItemSetListComponent, ItemSetFormComponent, ExpiryDatesComponent, ItemsBalancesComponent, ItemsLocationComponent, 
    ItemsTransComponent, ReorderItemsComponent, ReserveItemsComponent, ItemsEntryVoucherFormComponent, 
    ItemsEntryVoucherListComponent, ItemsEntryVoucherTemplatComponent, VoucherTermsComponent, ItemSequencesComponent, 
    OutputvoucherlistComponent,OutputvoucherformComponent, InvreceiptvoucherListComponent, InvreceiptvoucherFormComponent, GetItemCostComponent,
    // EntryitemsserialsComponent,
    OutputvoucherlistComponent,OutputvoucherformComponent, InvreceiptvoucherListComponent, InvreceiptvoucherFormComponent, 
    EntrvoucherFormComponent, EntrvoucherListComponent,AssemblyitemssFormComponent,AssemblyitemssListComponent,DisassemblyitemssListComponent,DisassemblyitemssFormComponent
    ,EntryvouhcerhformComponent, EntryvouhcerhlistComponent,ItemdetailsComponent,OutputvoucherhformComponent
    ,OutputvoucherhlistComponent,ItemssettelmentlistComponent,ItemsSerialsReportComponent,
    ItemssettelmentformComponent,ItempricesComponent ,AppCarsDetailsComponent
    
  ],
  imports: [
    CommonModule,
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
    MatCardModule,
    MatListModule,
    AppGeneralAttachmentModule,
    AppSearchModule,
    AppInvSearchModule,   
    AppItemSerialsModule,
    AppFinancialvoucherModule,
    RouterModule.forChild(AppInventoryRoutingModule)
  ],
})
export class AppInventoryModule { }
