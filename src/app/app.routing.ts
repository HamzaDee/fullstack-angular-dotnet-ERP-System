import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginComponent } from './views/app-account/login/login.component';
import { ReportViewerComponent } from './views/app-reports/report-viewer/report-viewer.component';
import { ExternalRedirectComponent } from './views/app-project/geogmap.component';


export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'Account/Login', pathMatch: 'full' },
  { path: 'report-viewer', component: ReportViewerComponent },
  {
    path: 'Account/Login', component: LoginComponent
  },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'Account',
        loadChildren: () => import('./views/app-account/app-account.module').then(m => m.AppAccountModule),
        data: { title: 'Account' }
      }
    ]
  },

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'Tax',
        loadChildren: () => import('./views/general/app-tax/app-tax.module').then(m => m.AppTaxModule),
        data: { title: 'Tax' }
      },
      {
        path: 'Currency',
        loadChildren: () => import('./views/general/app-currency/app-currency.module').then(m => m.AppCurrencyModule),
        data: { title: 'Currency' }
      },
      {
        path: 'VoucherType',
        loadChildren: () => import('./views/general/app-voucher-type/app-voucher-type.module').then(m => m.AppVoucherTypeModule),
        data: { title: 'VoucherType' }
      },
      {
        path: 'Service',
        loadChildren: () => import('./views/general/app-service/app-service.module').then(m => m.AppServiceModule),
        data: { title: 'Service' }
      },
      {
        path: 'PaymentDeliveryTerms',
        loadChildren: () => import('./views/general/app-payment-delivery-terms/app-payment-delivery-terms.module').then(m => m.AppPaymentDeliveryTermsModule),
        data: { title: 'PaymentDeliveryTerms' }
      },
      {
        path: 'Employees',
        loadChildren: () => import('./views/general/app-employees/app-employees.module').then(m => m.AppEmployeeModule),
        data: { title: 'Employees' }
      },
      {
        path: 'Discount',
        loadChildren: () => import('./views/general/app-discount/app-discounts.module').then(m => m.AppDiscountModule),
        data: { title: 'Discount' }
      },
      {
        path: 'GeneralSettings',
        loadChildren: () => import('./views/general/app-general-settings/app-general-settings.module').then(m => m.AppGeneralSettingsModule),
        data: { title: 'GeneralSettings' }
      },
      {
        path: 'CostCenter',
        loadChildren: () => import('./views/general/app-cost-center/app-cost-center.module').then(m => m.AppCostCenterModule),
        data: { title: 'CostCenter' }
      },
      {
        path: 'MatIcons',
        loadChildren: () => import('./views/mat-icons/mat-icons.module').then(m => m.MatIconsModule),
        data: { title: 'MatIcons' }
      },
      {
        path: 'Profile',
        loadChildren: () => import('./views/profile/profile.module').then(m => m.ProfileModule),
        data: { title: 'PROFILE' }
      },
      {
        path: 'AuditChangesLog',
        loadChildren: () => import('./views/general/app-audit-changes-logs/app-audit-changes-logs.module').then(m => m.AppAuditChangesLogsModule),
        data: { title: 'AuditChangesLogs' }
      },
      {
        path: 'TransactionLogs',
        loadChildren: () => import('./views/general/app-transaction-logs/app-transaction-logs.module').then(m => m.AppTransactionLogsModule),
        data: { title: 'TransactionLogs' }
      },
      {
        path: 'CompanyBranch',
        loadChildren: () => import('./views/general/app-company-branch/company-branch.module').then(m => m.AppCompanyBranchModule),
        data: { title: 'CompanyBranch' }
      },
      {
        path: 'UsersGroups',
        loadChildren: () => import('./views/general/app-users-groups/app-users-groups.module').then(m => m.AppUsersGroupsModule),
        data: { title: 'UsersGroups' }
      },
      {
        path: 'CompanyDocument',
        loadChildren: () => import('./views/general/app-company-document/app-company-document.module').then(m => m.AppCompanyDocumentModule),
        data: { title: 'CompanyDocument' }
      },
      {
        path: 'Company',
        loadChildren: () => import('./views/general/app-company/app-company.module').then(m => m.AppCompanyModule),
        data: { title: 'Company' }
      },
      {
        path: 'MainSystemDefinitions',
        loadChildren: () => import('./views/general/app-main-system-definitions/app-main-system-definitions.module').then(m => m.AppMainSystemDefinitionsModule),
        data: { title: 'MainSystemDefinitions' }
      },
      {
        path: 'User',
        loadChildren: () => import('./views/general/app-user/app-user.module').then(m => m.AppUserModule),
        data: { title: 'User' }
      },
      {
        path: 'Country',
        loadChildren: () => import('./views/general/app-country/app-country.module').then(m => m.AppCountryModule),
        data: { title: 'COUNTRY' }
      },
      {
        path: 'City',
        loadChildren: () => import('./views/general/app-city/app-city.module').then(m => m.AppCityModule),
        data: { title: 'CITIES' }
      },
      {
        path: 'Area',
        loadChildren: () => import('./views/general/app-area/app-area.module').then(m => m.AppAreaModule),
        data: { title: 'AREA' }
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule),
        data: { title: 'Dashboard' }
      },
      {
        path: 'GetMainDashboredForm',
        loadChildren: () => import('./views/app-production/app-maindashbored/maindashbored.module').then(m => m.MainDashModule),
        data: { title: 'MainDashModule' }
      },
      {
        path: 'admin',
        canActivate: [AuthGuard],
        loadChildren: () => import('./views/app-admin/app-admin.module').then(m => m.AppAdminModule),
        data: { title: 'admin', breadcrumb: 'TheSystemAdminAndSecurity' }
      },
      {
        path: 'FiscalYear',
        loadChildren: () => import('./views/app-account/app-fiscalyear/app-fiscalyear.module').then(m => m.AppFiscalyearModule),
        data: { title: 'FiscalyearList' }
      },
      {
        path: 'PeriodsFiscalYear',
        loadChildren: () => import('./views/app-account/app-periodsfiscalyear/app-periodsfiscalyear.module').then(m => m.AppPeriodsFiscalyearModule),
        data: { title: 'PeriodsFiscalyearList' }
      },
      {
        path: 'LinkingAccounts',
        loadChildren: () => import('./views/app-account/app-linkingaccount/app-linkingaccounts.module').then(m => m.ApplinkingAccountsModule),
        data: { title: 'linkingAccountsForm' }
      },
      {
        path: 'Account',
        loadChildren: () => import('./views/app-account/app-accounttree/app-accounttree.module').then(m => m.AppAccountTreeModule),
        data: { title: 'AccountTreeList' }
      },
      {
        path: 'Budget',
        loadChildren: () => import('./views/app-account/app-accountsbudgets/app-accountsbudgets.module').then(m => m.AppAccountsBudgetsModule),
        data: { title: 'AccountTreeList' }
      },
      {
        path: 'CostCenterBudgets',
        loadChildren: () => import('./views/app-account/app-costcenterbudgets/app-costcenterbudgets.module').then(m => m.AppCostcenterbudgetsModule),
        data: { title: 'AccountTreeList' }
      },
      {
        path: 'EntryVouchers',
        loadChildren: () => import('./views/app-account/app-entryvouchers/app-entryvouchers.module').then(m => m.AppEntryvouchersModule),
        data: { title: 'EntryVoucherslist' }
      },
      {
        path: 'Store',
        loadChildren: () => import('./views/app-inventory/app-stores/app-stores.module').then(m => m.AppStoresModule),
        data: { title: 'Storeslist' }
      }
      ,
      {
        path: 'OpeningBalance',
        loadChildren: () => import('./views/app-account/app-openingbalance/app-openingbalance.module').then(m => m.AppOpeningBalanceModule),
        data: { title: 'OpeningBalanceList' }
      }
      ,
      {
        path: 'AccTransTransfer',
        loadChildren: () => import('./views/app-account/app-acctranstransfer/acctrantransfer.module').then(m => m.AppTransTransferModule),
        data: { title: 'acctranstransferlist' }
      },
      {
        path: 'PaymentVoucher',
        loadChildren: () => import('./views/app-cash-and-banks/app-payment-vouchers/paymentvoucher.module').then(m => m.PaymentvoucherModule),
        data: { title: 'PaymentVoucherList' }
      },
      {
        path: 'ItemsGroups',
        loadChildren: () => import('./views/app-inventory/items-group/items-group.module').then(m => m.ItemsGroupModule),
        data: { title: 'ItemsGroups' }
      },
      {
        path: 'Items',
        loadChildren: () => import('./views/app-inventory/items/item.module').then(m => m.ItemModule),
        data: { title: 'Items' }
      },
      {
        path: 'ServicesInv',
        loadChildren: () => import('./views/app-account/app-serviceinvoice/app-serviceinvoice-module').then(m => m.AppServiceInvoiceModule),
        data: { title: 'ServiceInvoiceList' }
      },
      {
        path: 'ReturnServiceInvoice',
        loadChildren: () => import('./views/app-account/app-ReturnServiceInvoice/app-returnserviceinvoice.module').then(m => m.AppReturnServiceInvoiceModule),
        data: { title: 'ServiceInvoiceList' }
      },
      {
        path: 'Forecasting',
        loadChildren: () => import('./views/app-production/forecasting/forcasting.module').then(m => m.ForcastingModule),
        data: { title: 'Forcasting' }
      },
      {
        path: 'MarketMangers',
        loadChildren: () => import('./views/app-production/marketmangers/marketmanger.module').then(m => m.MmangerModule),
        data: { title: 'MarketMangers' }
      },
      {
        path: 'Promotion',
        loadChildren: () => import('./views/app-production/promotionalMaterialItems/promotionorders.module').then(m => m.PromotionOrdersModule),
        data: { title: 'Promotion' }
      },
      {
        path: 'PromotionItemsPlans',
        loadChildren: () => import('./views/app-production/promotionalplans/promoplans.module').then(m => m.PromotionPlansModule),
        data: { title: 'PromotionItemsPlans' }
      },
      {
        path: 'MarketSalesInvoice',
        loadChildren: () => import('./views/app-production/MarketSalesInvoice/marsalesinvoice.module').then(m => m.MarsalesModule),
        data: { title: 'MarketSalesInvoice' }
      },
      {
        path: 'ReOrderingItems',
        loadChildren: () => import('./views/app-production/app-ReOrdering/reordering.module').then(m => m.ReOrderingModule),
        data: { title: 'ReOrderingItems' }
      },
      {
        path: 'DashboaredList',
        loadChildren: () => import('./views/app-production/app-ProductionInfoDashboard/proddash.module').then(m => m.ProductingDashboaredModule),
        data: { title: 'DashboaredList' }
      },
      {
        path: 'GetDeabForm',
        loadChildren: () => import('./views/app-production/app-deabdashbored/deabdashbored.module').then(m => m.DeabDashboredModule),
        data: { title: 'DashboaredList' }
      },
      {
        path: 'Posting',
        loadChildren: () => import('./views/app-account/app-postingservices/app-postingservice.module').then(m => m.ApppostingServiceModule),
        data: { title: 'postingServiceform' }
      },
      {
        path: 'ItemsProd',
        loadChildren: () => import('./views/app-production/itemsprods/itemsprods.module').then(m => m.ItemsprodsModule),
        data: { title: 'ItemsprodList' }
      },
      {
        path: 'AccountingReports',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'accountsbalances' }
      },
      {
        path: 'RepricingItem',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'RepricingItem' }
      },
      {
        path: 'PurOrderStatus',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'PurOrderStatus' }
      },
      {
        path: 'SalesOrder',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'SalesOrder' }
      },
      {
        path: 'ProductionLines',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ProductionLinesList' }
      },
      {
        path: 'PurchaseOrder',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'PurorderList' }
      },
      {
        path: 'SalesOrderList',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'SalesOrderList' }
      },
      {
        path: 'DealersItems',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'DealersItemsList' }
      },
      {
        path: 'ProductionCostReport',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ProductionCostReport' }
      },
      {
        path: 'accountsstatement',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'accountsstatement' }
      }
      ,
      {
        path: 'trailbalance',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'trailbalance' }
      }
      ,
      {
        path: 'branchedaccountstatment',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'branchedaccountstatment' }
      }
      ,
      {
        path: 'balancesheet',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'balancesheet' }
      }
      ,
      {
        path: 'costcentersbalance',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'costcentersbalance' }
      }
      ,
      {
        path: 'costcentertransactions',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'costcentertransactions' }
      }
      ,
      {
        path: 'costcenterbudgets',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'costcenterbudgets' }
      },
      {
        path: 'vouchertransactions',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'vouchertransactions' }
      },
      {
        path: 'chequesreport',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'chequesreport' }
      },
      {
        path: 'chequestransreport',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'chequestransreport' }
      },
      {
        path: 'currencyexhangehistory',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'currencyexhangehistory' }
      },
      {
        path: 'servicesinvoicereport',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'servicesinvoicereport' }
      },
      {
        path: 'projectbalance',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'projectbalance' }
      },
      {
        path: 'projecttransactions',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'projecttransactions' }
      },
      {
        path: 'unbalancedtransactions',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'unbalancedtransactions' }
      },
      {
        path: 'ReturnService',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'ReturnService' }
      },
      {
        path: 'RepresentativeCollections',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'RepresentativeCollections' }
      },
      {
        path: 'AccountsAging',
        loadChildren: () => import('./views/app-account/app-reports/app-reports.module').then(m => m.AppReportsModule),
        data: { title: 'AccountsAging' }
      },
      {
        path: 'VoucherIretation',
        loadChildren: () => import('./views/general/app-voucher-iteration/voucher-iteration.module').then(m => m.AppVoucheriterationModule),
        data: { title: 'voucherIterationList' }
      },
      {
        path: 'Banks',
        loadChildren: () => import('./views/app-cash-and-banks/banks/banks.module').then(m => m.AppBanksModule),
        data: { title: 'banksList' }
      },
      {
        path: 'ProdOrder',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ProdOrderList' }
      },
      {
        path: 'ManOrder',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ManOrderList' }
      },
      {
        path: 'ItemsdealersList',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ItemsdealersList' }
      },
      {
        path: 'ReceiptVoucher',
        loadChildren: () => import('./views/app-cash-and-banks/app-receipt-vouchers/receiptvoucher.module').then(m => m.ReceiptvoucherModule),
        data: { title: 'ReceiptVoucherList' }
      },
      {
        path: 'TransferVoucher',
        loadChildren: () => import('./views/app-cash-and-banks/app-transfer-vouchers/transfervoucher.module').then(m => m.TransferVoucherModule),
        data: { title: 'TransferVoucherList' }
      },
      {
        path: 'BankTransfer',
        loadChildren: () => import('./views/app-cash-and-banks/app-bank-transfer/banktransfer.module').then(m => m.BankTransferModule),
        data: { title: 'BankTransferList' }
      },
      {
        path: 'BeginningCheques',
        loadChildren: () => import('./views/app-cash-and-banks/app-begining-cheques/beginingcheques.module').then(m => m.BeginingchequesModule),
        data: { title: 'BeginingchequesList' }
      },
      {
        path: 'ProcessingIncomingCheque',
        loadChildren: () => import('./views/app-cash-and-banks/app-Processing-IncomingCheque/procincomingcheq.module').then(m => m.ProcincheqModule),
        data: { title: 'ProcincheqList' }
      },
      {
        path: 'ProcessingOutcomingCheque',
        loadChildren: () => import('./views/app-cash-and-banks/app-processing-outgoingcheque/procoutgoingcheq.module').then(m => m.ProcOutcheqModule),
        data: { title: 'ProcoutcheqList' }
      },
      {
        path: 'FixedAssetsType',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'FixedAssetsType' }
      },
      {
        path: 'FixedAssetsList',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'FixedAssetsList' }
      },
      {
        path: 'ChangeFixedAssetsLocation',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'ChangeFixedAssetsLocation' }
      },
      {
        path: 'ReceivingDeliveringAnOriginalToAnEmployee',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'ReceivingDeliveringAnOriginalToAnEmployee' }
      },
      {
        path: 'AssetSalesInvoice',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'AssetSalesInvoice' }
      },
      {
        path: 'AssetPurchaseInvoice',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'AssetPurchaseInvoice' }
      },
      {
        path: 'FixedAssetOperation',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'FixedAssetOperation' }
      },
      {
        path: 'FixedAssetsContracts',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'FixedAssetsContracts' }
      },
      {
        path: 'FixedAssetDepreciation',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'FixedAssetDepreciation' }
      },
      {
        path: 'FixedAssetsReports',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'FixedAssetsReports' }
      },
      {
        path: 'BankSettlement',
        loadChildren: () => import('./views/app-cash-and-banks/app-BankSettlement/bankSettlement.module').then(m => m.BankSettlmentModule),
        data: { title: 'BankSattlmentList' }
      },
      {
        path: 'CreditCardsCollection',
        loadChildren: () => import('./views/app-cash-and-banks/app-card-collection/cardcollection.module').then(m => m.CardscollectionModule),
        data: { title: 'Cardscollectionlist' }
      },
      {
        path: 'ItemsTranfers',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ItemsTransfers' }
      },
      {
        path: 'ItemsSets',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ItemsSets' }
      },
      {
        path: 'SuppliersOpeningBalance',
        loadChildren: () => import('./views/app-payables/app-payables.module').then(m => m.ApppayablesModule),
        data: { title: 'SuppOpeningBalanceList' }
      },
      {
        path: 'SupplierPaymentVoucher',
        loadChildren: () => import('./views/app-payables/app-payables.module').then(m => m.ApppayablesModule),
        data: { title: 'SupppaymentvoucherList' }
      },
      {
        path: 'SupplierReceiptVoucher',
        loadChildren: () => import('./views/app-payables/app-payables.module').then(m => m.ApppayablesModule),
        data: { title: 'SuppReceiptvoucherList' }
      },
      {
        path: 'SupplierDepitNoteVoucher',
        loadChildren: () => import('./views/app-payables/app-payables.module').then(m => m.ApppayablesModule),
        data: { title: 'SuppDebitVoucherList' }
      },
      {
        path: 'SupplierCreditNoteVoucher',
        loadChildren: () => import('./views/app-payables/app-payables.module').then(m => m.ApppayablesModule),
        data: { title: 'SuppCreditVoucherList' }
      },

      {
        path: 'ServicesPurchaseInv',
        loadChildren: () => import('./views/app-payables/app-payables.module').then(m => m.ApppayablesModule),
        data: { title: 'SupplierPurServiceInvoiceList' }
      },
      {
        path: 'CustomersOpeningBalance',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustOpeningBalanceList' }
      },
      {
        path: 'CustomerPaymentVoucher',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustpaymentvoucherList' }
      },
      {
        path: 'QAProduction',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'QAList' }
      },
      {
        path: 'InventoryReceiving',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'InventoryReceiving' }
      },
      {
        path: 'Proditemslist',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'proditemslist' }
      },
      {
        path: 'ManfuEquations',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ManfuequationsList' }
      },
      {
        path: 'ProductionVoucher',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ProdVoucherList' }
      },
      {
        path: 'GetCountriesPricesList',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'GetCountriesPricesList' }
      },
      {
        path: 'ProductPricesForCountries',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ProductPricesForCountries' }
      },
      {
        path: 'ProductionOutPutVoucher',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'Prodoutputvoucherlist' }
      },
      {
        path: 'ProductionReceipt',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'ProdReceiptvoucherlist' }
      },
      {
        path: 'ProdReports',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'Producedmaterialsrpt' }
      },
      {
        path: 'ProdReports',
        loadChildren: () => import('./views/app-production/app-production.module').then(m => m.AppProductionModule),
        data: { title: 'Consumedrawmaterials' }
      },
      {
        path: 'CustomerReceiptVoucher',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustRecieptvoucherList' }
      },
      {
        path: 'CustomersDebitNote',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustDebitvoucherList' }
      },
      {
        path: 'CustomersDebitNote',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustDebitvoucherList' }
      },
      {
        path: 'CustomersCreditNote',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustCreditvoucherList' }
      },
      {
        path: 'ServicesSalesInv',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'CustServiceSalesInvoiceList' }
      },
      {
        path: 'Dealers',
        loadChildren: () => import('./views/general/app-dealers/dealers.module').then(m => m.AppDealersModule),
        data: { title: 'DealersList' }
      },
      {
        path: 'PurchaseRequest',
        loadChildren: () => import('./views/app-purchase/purchase.module').then(m => m.AppPurchaseModule),
        data: { title: 'PurchaseRequestList' }
      },
      {
        path: 'InternalPurchaseRequest',
        loadChildren: () => import('./views/app-purchase/purchase.module').then(m => m.AppPurchaseModule),
        data: { title: 'InternalPurchaseRequest' }
      },
      {
        path: 'PayablesReport',
        loadChildren: () => import('./views/app-payables/app-payables-Reports/payablesreports.module').then(m => m.AppSupplierReportsModule),
        data: { title: 'SupplierBalances' }
      },
      {
        path: 'SupplierAccountStatement',
        loadChildren: () => import('./views/app-payables/app-payables-Reports/payablesreports.module').then(m => m.AppSupplierReportsModule),
        data: { title: 'SupplierAccountStatement' }
      },
      {
        path: 'SupplierTransactions',
        loadChildren: () => import('./views/app-payables/app-payables-Reports/payablesreports.module').then(m => m.AppSupplierReportsModule),
        data: { title: 'SupplierTransactions' }
      },
      {
        path: 'SupplierAging',
        loadChildren: () => import('./views/app-payables/app-payables-Reports/payablesreports.module').then(m => m.AppSupplierReportsModule),
        data: { title: 'SupplierAging' }
      },
      {
        path: 'CustomerBalances',
        loadChildren: () => import('./views/app-receivables/app-Receivables-Reports/receivablesreport.module').then(m => m.AppCustomerReportsModule),
        data: { title: 'CustomerBalances' }
      },
      {
        path: 'InventoryReports',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'InventoryReports' }
      },
      {
        path: 'ExpiryDates',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ReportOfPatchBalancesAndExpirationDatesOfItems' }
      },
      {
        path: 'ItemsLocation',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ReportMaterialLocation' }
      },
      {
        path: 'ItemsTrans',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'MaterialTransactions' }
      },
      {
        path: 'ReorderItems',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'MaterialRequestLimit' }
      },
      {
        path: 'Itemprices',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ItempricesReport' }
      },
      {
        path: 'ReserveItems',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ReportReservedMaterial' }
      },
      {
        path: 'TransactionRep',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'TransactionRep' }
      },
      {
        path: 'InventoryReport',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'InventoryReport' }
      },
      {
        path: 'YearlyDepreciationReport',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'YearlyDepreciationReport' }
      },
      {
        path: 'DepreciationList',
        loadChildren: () => import('./views/fixedassets/fixedassets.module').then(m => m.FixedassetsModule),
        data: { title: 'DepreciationList' }
      },
      {
        path: 'EntryyVoucher',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'EntryyVoucher' }
      },
      {
        path: 'AssemblyItems',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'AssemblyItems' }
      },
      {
        path: 'DisAssemblyItems',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'DisAssemblyItems' }
      },
      {
        path: 'EntryVoucherH',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'EntryVoucherH' }
      },
      {
        path: 'OutputVoucherH',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'OutputVoucherH' }
      },
      {
        path: 'CustomerAccountStatement',
        loadChildren: () => import('./views/app-receivables/app-Receivables-Reports/receivablesreport.module').then(m => m.AppCustomerReportsModule),
        data: { title: 'CustomerAccountStatement' }
      },
      {
        path: 'CustomerTransactions',
        loadChildren: () => import('./views/app-receivables/app-Receivables-Reports/receivablesreport.module').then(m => m.AppCustomerReportsModule),
        data: { title: 'CustomerTransactions' }
      },
      {
        path: 'ReceivableReports',
        loadChildren: () => import('./views/app-receivables/app-Receivables-Reports/receivablesreport.module').then(m => m.AppCustomerReportsModule),
        data: { title: 'CustomerAging' }
      },
      {
        path: 'ItemsReservationVoucher',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ItemsReservationVoucher' }
      },
      {
        path: 'TransferStockVoucher',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'TransferStockVoucher' }
      },
      {
        path: 'DamageStockVoucher',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'DamageStockVoucher' }
      },
      {
        path: 'NotificationsSettings',
        loadChildren: () => import('./views/general/NotificationsSettings/notifications-settings.module').then(m => m.NotificationsSettingsModule),
        data: { title: 'NotificationsSettings' }
      },
      {
        path: 'InventoryVouchers',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'InventoryVouchers' }
      },
      {
        path: 'DetailedSaleReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'ItemSalesReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'ListOfReturneditemReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'RequestedItemsReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'ItemsTaxReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'HemsProfitReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'SalesRepresentativeReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'TaxesReport',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'ComparisonSalesOfCategoryOrItemByYears',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },
      {
        path: 'SalesRequest',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesRequestList' }
      },

      {
        path: 'ExpensesTypes',
        loadChildren: () => import('./views/general/ExpensesTypes/expenses-types.module').then(m => m.ExpensesTypesModule),
        data: { title: 'SpecialReports' }
      },
      {
        path: 'PurchaseInvoice',
        loadChildren: () => import('./views/app-purchase/purchase.module').then(m => m.AppPurchaseModule),
        data: { title: 'PurchaseInvoice' }
      },
      {
        path: 'ReturnPurchaseInvoice',
        loadChildren: () => import('./views/app-purchase/purchase.module').then(m => m.AppPurchaseModule),
        data: { title: 'ReturnPurchaseInvoice' }
      },
      {
        path: 'ProductionReports',
        loadChildren: () => import('./views/app-production/productionReport/production-report.module').then(m => m.ProductionReportModule),
        data: { title: 'ProductionReport' }

      },
      {
        path: 'ProductionCostingRpt',
        loadChildren: () => import('./views/app-production/productionReport/production-report.module').then(m => m.ProductionReportModule),
        data: { title: 'ProductionCostingRpt' }

      },
      {
        path: 'ReceiptItemsVoucher',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ReceiptItemsVoucher' }
      },
      {
        path: 'ItemsSettelment',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ItemsSettlement' }
      },
      {
        path: 'InventoryReports',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'InventoryReports' }
      },
      {
        path: 'ItemsDeliveryVoucher',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'ItemsDeliveryList' }
      },
      {
        path: 'SalesInvoices',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'SalesInvoicesList' }
      },
      {
        path: 'ReturnSalesInvoice',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'ReturnSalesInvoiceList' }
      },
      {
        path: 'PurchaseReports',
        loadChildren: () => import('./views/app-purchase/Purchase-Reports/purchase-report.module').then(m => m.PurchaseReportModule),
        data: { title: 'PurchaseReports' }
      },
      {
        path: 'ReceiptItemsVoucher',
        loadChildren: () => import('./views/app-inventory/app-inventory.module').then(m => m.AppInventoryModule),
        data: { title: 'ReceiptItemsVoucher' }
      },
      {
        path: 'CurrencyRate',
        loadChildren: () => import('./views/general/app-CurrencyRates/currencyrate.module').then(m => m.CurrencyrateModule),
        data: { title: 'CurrencyRate' }
      },
      {
        path: 'ReportsList',
        loadChildren: () => import('./views/app-reports/reportslistmodule.module').then(m => m.ReportslistmoduleModule),
        data: { title: 'ReportList' }
      },
      {
        path: 'Shipping',
        loadChildren: () => import('./views/app-production/productionReport/production-report.module').then(m => m.ProductionReportModule),
        data: { title: 'Shipping' }
      },
      {
        path: 'Agreements',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'Agreements' }
      },
      {
        path: 'Authorities',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'Authorities' }
      },
      {
        path: 'Volunteers',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'Volunteers' }
      },
      {
        path: 'Activities',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'Activities' }
      },
      {
        path: 'ProjectDefinition',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectDefinition', Type: 1 }
      },
      {
        path: 'Empowerment',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectDefinition', Type: 2 }
      },
      {
        path: 'ProjectsPlans',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectsPlans' }
      },
      {
        path: 'ProjectPlanRep',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectPlanRep' }
      },
      {
        path: 'ProjectCustoms',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectCustoms' }
      },
      {
        path: 'ProjectArchive',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectArchive' }
      },
      {
        path: 'ProjectsReports',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'GetProjectLogForm' }
      },
      {
        path: 'CheckUp',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'CheckUp' }
      },
      {
        path: 'VehicleDefinition',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'VehicleDefinition' }
      },
      {
        path: 'VehicleFuel',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'VehicleFuel' }
      },
      {
        path: 'DailyMachineryMovement',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'DailyMachineryMovement' }
      },
      {
        path: 'RepairsOilChangeAndFuelRefill',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'RepairsOilChangeAndFuelRefill' }
      },
      {
        path: 'VehicleLicensingMovement',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'VehicleLicensingMovement' }
      },
      {
        path: 'Beneficiaries',
        loadChildren: () => import('./views/app-vehiclefleet/vehical.module').then(m => m.VehiclesModule),
        data: { title: 'Beneficiaries' }
      },
      {
        path: 'Orphan',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'Orphan' }
      },
      {
        path: 'SocialMediaArchiving',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectArchive' }
      },
      {
        path: 'MediaCoverage',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'ProjectArchive' }
      },
      {
        path: 'Calendar',
        loadChildren: () => import('./views/app-project/project.module').then(m => m.ProjectModule),
        data: { title: 'Calendarform' }
      },
      {
        path: 'AccountsGroup',
        loadChildren: () => import('./views/app-account/AccountsGroups/accounts-groups.module').then(m => m.AccountsGroupsModule),
        data: { title: 'AccountsGroup' }
      },
      {
        path: 'PrintCheque',
        loadChildren: () => import('./views/general/PrintCheque/print-cheque.module').then(m => m.PrintChequeModule),
        data: { title: 'PrintCheque' }
      },
      {
        path: 'ServicePurchaseRequestList',
        loadChildren: () => import('./views/app-purchase/purchase.module').then(m => m.AppPurchaseModule),
        data: { title: 'ServicePurchaseRequestList' }
      },
      {
        path: 'studentsadjustmentlist',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'studentsadjustmentlist' }
      },
      {
        path: 'studentsnewinvoices',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'studentsnewinvoices' }
      },
      {
        path: 'ListOfNewStudents',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'ListOfNewStudents' }
      },
      {
        path: 'LandedCost',
        loadChildren: () => import('./views/app-purchase/purchase.module').then(m => m.AppPurchaseModule),
        data: { title: 'LandedCostList' }
      },
      {
        path: 'ExternalRedirect',
        component: ExternalRedirectComponent,
        data: { title: 'ProjectDefinition', pageno: 1 }
      },
      {
        path: 'ExternalRedirect2',
        component: ExternalRedirectComponent,
        data: { title: 'ProjectDefinition', pageno: 2 }
      },
      {
        path: 'ExternalRedirect3',
        component: ExternalRedirectComponent,
        data: { title: 'ProjectDefinition', pageno: 3 }
      },
      {
        path: 'TransferringAmount',
        loadChildren: () => import('./views/app-receivables/app-receivables.module').then(m => m.AppReceivablesModule),
        data: { title: 'TransferringAmount' }
      },
      {
        path: 'ItemsOffers',
        loadChildren: () => import('./views/app-sales/sales.module').then(m => m.AppSalesModule),
        data: { title: 'ItemsOffers' }
      },
      {
        path: 'LeadsCustomers',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'LeadsCustomers' }
      },
      {
        path: 'LeadsActivities',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'LeadsActivities' }
      },
      {
        path: 'CRMReports',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'CRMReports' }
      },
      {
        path: 'Opportunities',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'Opportunities' }
      },
      {
        path: 'MaintenanceOrder',
        loadChildren: () => import('./views/app-maintenance/app-maintenance.module').then(m => m.AppMaintenanceModule),
        data: { title: 'MaintenanceOrder' }
      },
      {
        path: 'MaintenanceRequests',
        loadChildren: () => import('./views/app-maintenance/app-maintenance.module').then(m => m.AppMaintenanceModule),
        data: { title: 'MaintenanceRequests' }
      },
      {
        path: 'MaintenanceReports',
        loadChildren: () => import('./views/app-maintenance/app-maintenance.module').then(m => m.AppMaintenanceModule),
        data: { title: 'MaintenanceOrderReport' }
      },
      {
        path: 'MaintReports',
        loadChildren: () => import('./views/app-maintenance/app-maintenance.module').then(m => m.AppMaintenanceModule),
        data: { title: 'MaintReports' }
      },
      {
        path: 'MaintReports',
        loadChildren: () => import('./views/app-maintenance/app-maintenance.module').then(m => m.AppMaintenanceModule),
        data: { title: 'MaintenanceRequests' }
      },
      {
        path: 'Quotations',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'Quotations' }
      },
      {
        path: 'FollowUp',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'FollowUp' }
      },
      {
        path: 'CRMdashbored',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'CRMdashbored' }
      },
      {
        path: 'GetPerformanceTrackingForm',
        loadChildren: () => import('./views/app-crm/crm.module').then(m => m.AppCRMModule),
        data: { title: 'PerformanceTrackingPerBranch' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'Account/404'
  }
];

