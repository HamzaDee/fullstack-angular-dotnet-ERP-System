import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { config } from 'config';
// import { NotFoundComponent } from "./not-found/not-found.component";
// import { ErrorComponent } from "./error/error.component";
// import { LoginComponent } from "./login/login.component";
import { RepricingItemsComponent } from './repricing-items/repricing-items.component';
import { RepricingItemsFormComponent } from './repricing-items/repricing-items-form/repricing-items-form.component';  
import { ItemSetListComponent } from './items-sets/item-set-list/item-set-list.component';
import { ItemSetFormComponent } from './items-sets/item-set-form/item-set-form.component';
import { ExpiryDatesComponent } from './inv-reports/expiry-dates/expiry-dates.component';
import { ItemsBalancesComponent } from './inv-reports/items-balances/items-balances.component';
import { ItemsLocationComponent } from './inv-reports/items-location/items-location.component';
import { ItemsTransComponent } from './inv-reports/items-trans/items-trans.component';
import { ReorderItemsComponent } from './inv-reports/reorder-items/reorder-items.component';
import { ReserveItemsComponent } from './inv-reports/reserve-items/reserve-items.component';
import { ItemsEntryVoucherListComponent } from './items-entry-voucher/component/items-entry-voucher-list/items-entry-voucher-list.component';
import { ItemsEntryVoucherFormComponent } from './items-entry-voucher/component/items-entry-voucher-form/items-entry-voucher-form.component';
import { ItemsReservationVoucherListComponent } from './ItemsReservationVoucher/items-reservation-voucher-list/items-reservation-voucher-list.component';
import { ItemsReservationVoucherFormComponent } from './ItemsReservationVoucher/items-reservation-voucher-form/items-reservation-voucher-form.component';
import { ItemsTransferVoucherListComponent } from './ItemsTransferVoucher/items-transfer-voucher-list/items-transfer-voucher-list.component';
import { ItemsTransferVoucherFormComponent } from './ItemsTransferVoucher/items-transfer-voucher-form/items-transfer-voucher-form.component';
import { DamageStockVoucherListComponent } from './DamageStockVoucher/damage-stock-voucher-list/damage-stock-voucher-list.component';
import { DamageStockVoucherFormComponent } from './DamageStockVoucher/damage-stock-voucher-form/damage-stock-voucher-form.component';
import { OutputvoucherformComponent } from './items-output-voucher/OutputVoucherForm/outputvoucherform.component';
import { OutputvoucherlistComponent } from './items-output-voucher/OutputVoucherList/outputvoucherlist.component';
import { InvreceiptvoucherListComponent } from './app-receiptVoucher/invReceiptVoucher-list/invreceiptvoucher-list.component';
import { InvreceiptvoucherFormComponent } from './app-receiptVoucher/invReceiptVoucher-form/invreceiptvoucher-form.component';
import { EntrvoucherListComponent } from './app-entryvoucher/entryvoucher-list/entrvoucher-list.component';
import { EntrvoucherFormComponent } from './app-entryvoucher/entryvoucher-form/entrvoucher-form.component';
import { LoginComponent } from '../app-account/login/login.component';
import { NotFoundComponent } from '../app-account/not-found/not-found.component';
import { ErrorComponent } from '../app-account/error/error.component';
import { AssemblyitemssFormComponent } from './app-assemblyitems/assemblyitems_Form/assemblyitemss-form.component';
import { AssemblyitemssListComponent } from './app-assemblyitems/assemblyitems-List/assemblyitemss-list.component';
import { DisassemblyitemssFormComponent } from './app-disassemblyitems/disassemblyItems-form/disassemblyitemss-form.component';
import { DisassemblyitemssListComponent } from './app-disassemblyitems/disassemblyItems-list/disassemblyitemss-list.component';
import { EntryvouhcerhformComponent } from './app-entryvoucherh/entryvoucherh-form/entryvouhcerhform.component';
import { EntryvouhcerhlistComponent } from './app-entryvoucherh/entryvoucherh-list/entryvouhcerhlist.component';
import { OutputvoucherhformComponent } from './app-outputvoucherh/outputvoucherh-form/outputvoucherhform.component';
import { OutputvoucherhlistComponent } from './app-outputvoucherh/outputvoucherh-list/outputvoucherhlist.component';
import { ItemssettelmentlistComponent } from './app-itemsSettelment/itemsSettelmentList/itemssettelmentlist.component';
import { ItemssettelmentformComponent } from './app-itemsSettelment/itemsSettlementForm/itemssettelmentform.component';
import { ItemsSerialsReportComponent } from './inv-reports/items-serials-report/items-serials-report.component';
import { ItempricesComponent } from './inv-reports/Item-Prices/itemprices.component';

 export const AppInventoryRoutingModule: Routes = [
  {
    path: '',
    children: [
      {
        path: 'RepricingItems',
        component: RepricingItemsComponent,
        data: { title: 'RepricingItems', breadcrumb: 'RepricingItems', roles: config.authRoles.sa }
      },
      {
        path: 'RepricingItemsForm',
        component: RepricingItemsFormComponent,
        data: { title: 'RepricingItemsForm', breadcrumb: 'RepricingItems', roles: config.authRoles.sa }
      },   
      {
        path: 'ItemSetsHDList',
        component: ItemSetListComponent,
        data: { title: 'ItemSetsHDList', breadcrumb: 'ItemSetsHDList', roles: config.authRoles.sa },
      },
      {
        path: 'ItemSetsHDForm',
        component: ItemSetFormComponent,
        data: { title: 'ItemSetsHDForm', breadcrumb: 'ItemSetsHDForm', roles: config.authRoles.sa },
      },
      {
        path: 'GetItemBatchExpiryForm',
        component: ExpiryDatesComponent,
        data: { title: 'ReportOfPatchBalancesAndExpirationDatesOfItems', breadcrumb: 'ExpiryDates', roles: config.authRoles.sa },
      },
      {
        path: 'GetItemsSerialsReportForm',
        component: ItemsSerialsReportComponent,
        data: { title: 'ItemsSerialsReport', breadcrumb: 'ItemsSerialsReport', roles: config.authRoles.sa },
      },

      {
        path: 'GetItemsBalancesForm',
        component: ItemsBalancesComponent,
        data: { title: 'MaterialBalance', breadcrumb: 'ItemsBalances', roles: config.authRoles.sa },
      },
      {
        path: 'GetItemsLocationsForm',
        component: ItemsLocationComponent,
        data: { title: 'ReportMaterialLocation', breadcrumb: 'ItemsLocation', roles: config.authRoles.sa },
      },
      {
        path: 'GetItemTransactionsForm',
        component: ItemsTransComponent,
        data: { title: 'MaterialTransactions', breadcrumb: 'ItemsTrans', roles: config.authRoles.sa },
      },
      {
        path: 'GetReorderItemsForm',
        component: ReorderItemsComponent,
        data: { title: 'MaterialRequestLimit', breadcrumb: 'MaterialRequestLimit', roles: config.authRoles.sa },
      },
      {
        path: 'GetReservedItemsForm',
        component: ReserveItemsComponent,
        data: { title: 'ReportReservedMaterial', breadcrumb: 'ReserveItems', roles: config.authRoles.sa },
      },
      {
        path: 'GetItemsPricesForm',
        component: ItempricesComponent,
        data: { title: 'ItempricesReport', breadcrumb: 'ItempricesReport', roles: config.authRoles.sa },
      },
      
  /*      {
        path: 'ItemsEntryVoucherList',
         component: ItemsEntryVoucherListComponent,
         data: { title: 'ItemsEntryVoucherList', breadcrumb: 'ItemsEntryVoucherList', roles: config.authRoles.sa },
       }, */
      {
        path: 'EntryVoucherForm',
        component: ItemsEntryVoucherFormComponent,
        data: { title: 'EntryVoucherForm', breadcrumb: 'ItemsEntryVoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'ItemsReservationVoucherList',
        component: ItemsReservationVoucherListComponent,
        data: { title: 'ItemsReservationVoucherList', breadcrumb: 'ItemsReservationVoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'ItemsReservationVoucherForm',
        component: ItemsReservationVoucherFormComponent,
        data: { title: 'ItemsReservationVoucherForm', breadcrumb: 'ItemsReservationVoucherForm', roles: config.authRoles.sa },
      },
      {
        path: 'ItemsTransferVoucherList',
        component: ItemsTransferVoucherListComponent,
        data: { title: 'ItemsTransferVoucherList', breadcrumb: 'ItemsTransferVoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'ItemsTransferVoucherForm',
        component: ItemsTransferVoucherFormComponent,
        data: { title: 'ItemsTransferVoucherForm', breadcrumb: 'ItemsTransferVoucherForm', roles: config.authRoles.sa },
      },
      {
        path: 'DamageStockVoucherList',
        component: DamageStockVoucherListComponent,
        data: { title: 'DamageStockVoucherList', breadcrumb: 'DamageStockVoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'DamageStockVoucherForm',
        component: DamageStockVoucherFormComponent,
        data: { title: 'DamageStockVoucherForm', breadcrumb: 'DamageStockVoucherForm', roles: config.authRoles.sa },
      },
// ===
      {
        
        path: 'ReceiptItemsVoucherList',
        component: InvreceiptvoucherListComponent,
        data: { title: 'InvreceiptvoucherList', breadcrumb: 'InvreceiptvoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'AddInvVoucher',
        component: InvreceiptvoucherFormComponent,
        data: { title: 'InvreceiptvoucherForm', breadcrumb: 'InvreceiptvoucherForm', roles: config.authRoles.sa },
      },
// =====      
      {
        path: 'OutputVoucherList',
        component: OutputvoucherlistComponent,
        data: { title: 'OutputVoucherList', breadcrumb: 'OutputVoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'OutputVoucherForm',
        component: OutputvoucherformComponent,
        data: { title: 'OutputVoucherForm', breadcrumb: 'OutputVoucherForm', roles: config.authRoles.sa },
      },
        {
        path: 'ItemsEntryVoucherList',
        component: EntrvoucherListComponent,
        data: { title: 'ItemsEntryVoucherList', breadcrumb: 'ItemsEntryVoucherList', roles: config.authRoles.sa },
      },  
      {
        path: 'EntryyVoucherForm',
        component: EntrvoucherFormComponent,
        data: { title: 'EntryyVoucherForm', breadcrumb: 'EntryyVoucherForm', roles: config.authRoles.sa },
      },
      {
        path: 'AssemblyitemsForm',
        component: AssemblyitemssFormComponent,
        data: { title: 'AssemblyitemsForm', breadcrumb: 'AssemblyitemsForm', roles: config.authRoles.sa },
      },

      {
        path: 'AssemblyitemsList',
        component: AssemblyitemssListComponent,
        data: { title: 'AssemblyitemsList', breadcrumb: 'AssemblyitemsList', roles: config.authRoles.sa },
      },
      {
        path: 'DisAssemblyitemsForm',
        component: DisassemblyitemssFormComponent,
        data: { title: 'DisAssemblyitemsForm', breadcrumb: 'DisAssemblyitemsForm', roles: config.authRoles.sa },
      },
      {
        path: 'DisAssemblyitemsList',
        component: DisassemblyitemssListComponent,
        data: { title: 'DisAssemblyitemsList', breadcrumb: 'DisAssemblyitemsList', roles: config.authRoles.sa },
      },
      {
        path: 'EntryvouhcerhForm',
        component: EntryvouhcerhformComponent,
        data: { title: 'EntryVoucherForm', breadcrumb: 'EntryVoucherForm', roles: config.authRoles.sa },
      },
      {
        path: 'EntryvouhcerhList',
        component: EntryvouhcerhlistComponent,
        data: { title: 'ItemsEntryVoucherList', breadcrumb: 'ItemsEntryVoucherList', roles: config.authRoles.sa },
      },
      {
        path: 'OutputvoucherhForm',
        component: OutputvoucherhformComponent,
        data: { title: 'ExitDocument', breadcrumb: 'ExitDocument', roles: config.authRoles.sa },
      },
      {
        path: 'OutputvoucherhList',
        component: OutputvoucherhlistComponent,
        data: { title: 'OutputVoucherList', breadcrumb: 'OutputVoucherList', roles: config.authRoles.sa },
      },


      {
        path: 'ItemssettelmentList',
        component: ItemssettelmentlistComponent,
        data: { title: 'ItemssettelmentList', breadcrumb: 'ItemssettelmentList', roles: config.authRoles.sa },
      },
      {
        path: 'ItemssettelmentForm',
        component: ItemssettelmentformComponent,
        data: { title: 'ItemssettelmentForm', breadcrumb: 'ItemssettelmentForm', roles: config.authRoles.sa },
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

