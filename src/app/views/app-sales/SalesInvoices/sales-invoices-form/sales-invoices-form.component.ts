import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { ActivatedRoute, Params } from '@angular/router';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { SalesInvoicesService } from '../sales-invoices.service';
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-sales-invoices-form',
  templateUrl: './sales-invoices-form.component.html',
  styleUrls: ['./sales-invoices-form.component.scss']
})
export class SalesInvoicesFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  private subscription: Subscription;
  salesInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  purInvoiceDTsList: any[] = [];
  selectedItems: any[] = [];
  savedSerials: any[] = [];
  EmployeeList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  length: number = 0;
  isExistAccNo: boolean = true;
  voucherId: any;
  voucherType: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 44;
  isHidden: boolean = false;
  isInputDisabled: boolean = true;
  disableAll: boolean = false;
  reservedId: number = 0;
  //header Lists
  voucherTypeList: any;
  invoiceTypesList: any;
  branchesList: any;
  customersList: any;
  costCenterList: any;
  paymentTermsList: any;
  currencyList: any;
  //End
  //Details Lists
  itemsList: any;
  unitsList: Array<any> = [];
  taxesList: any;
  storesList: any;
  bounsunitsList: Array<any> = [];
  allUntiesList: any;
  itemsUnitList: any;
  accountsList: any;
  expensesTypeList: any;
  //End
  salesRequestList: any;
  deleiveryList: any;
  isdisabled: boolean = false;
  isCash: number;
  pricewTax: number;
  decimalPlaces: number;
  // General Inventory Settings
  costingMethod: number;
  defaultStoreId: number;
  inventoryType: number;
  useAccountInGrid: boolean;
  useBatch: boolean;
  useCostCenter: boolean;
  useExpiryDate: boolean;
  useProductDate: boolean;
  useSerial: boolean;
  useStoreInGrid: boolean;
  serialsListss: any;
  //End
  expensese: number;
  fTotal: any;
  fTaxTotal: any;
  fNetTotal: any;
  fDiscount: any;
  fTotalGridNet: any;
  purAccId: number = 0;
  batchExDisabled = true;
  voucherNo: number = 0;
  showRemainQty: boolean;
  oldStoreId: any;
  remainingQty: number;
  defaultCurrencyId: number;
  // Invoice Cycle Setting 
  salesCycle: number;
  sCycle1: number;
  sCycle2: number;
  sCycle3: number;
  sCycle4: number;
  sCycle5: number;
  sCycle6: number;
  purchaseCucleCycle: number;
  pCycle1: number;
  pCycle2: number;
  pCycle3: number;
  pCycle4: number;
  hideGetFromSalesOrder: boolean;
  hideGetFromDeleivryVoucher: boolean;
  //End
  UseTax: boolean;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  allowMultiCurrency: boolean;
  allowAccRepeat: any;
  //DealerInfoModel
  dealerBalance: number = 0;
  dealerPriceCategoryId: number = 0;
  dealerAmt: number = 0;
  dealerChequeAmt: number = 0;
  dealerPolicy: number = 0;
  NoteBalance: any;
  NoteAlert: any;
  NotePrevenet: any;
  showBalance: boolean;
  showAlert: boolean;
  showPrevent: boolean;
  //End 
  disableCurrRate: boolean;
  lang: string;
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  voucherStoreId: number;
  HideSerials: boolean = false;
  disableVouchers: boolean = false;
  disableDetails: boolean = false;
  DefaultStoreId: number;
  PriceOffersId: any;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private saleinvoiceService: SalesInvoicesService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private invserv: InvVoucherService,
      private selectedItemsService: SelectedItemsService,
      private cdr: ChangeDetectorRef,
      private InvService: InvVoucherService,
    ) { }

  ngOnInit(): void {
    this.voucherType = "Invoice";
    this.route.queryParams.subscribe((params: Params) => {
      this.voucherNo = +params['voucher'];
      this.reservedId = +params['reservedId'];
      this.PriceOffersId = +params['PriceOffersId'];

      const queryParams = new URLSearchParams(window.location.search);

      if (this.PriceOffersId > 0) {
        this.voucherId = 0;
        this.opType = 'Add';
        this.showsave = false;
      }
      else if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else if (this.voucherNo > 0) {
        this.voucherId = 0;
        this.opType = 'Add';
        this.showsave = false;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }

      setTimeout(() => {
        if (this.opType == "Show") {
          this.disableAll = true;
          this.salesInvoiceAddForm.get('costCenterId')?.disable();
        } else {
          this.disableAll = false;
          this.salesInvoiceAddForm.get('costCenterId')?.enable();
        }
      });

      this.SetTitlePage();

      if (!this.voucherId) {
        if (this.reservedId == null || this.reservedId == undefined) {
          this.router.navigate(['SalesInvoices/SalesInvoicesList']);
        }
      }

      this.InitiailEntryVoucherForm();
      this.GetInitailEntryVoucher();
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesInvoicesForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.salesInvoiceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      invoiceType: [0],
      branchId: [null],
      dealerId: [0],
      costCenterId: [0],
      paymentTerm: [0],
      deliveryPeriod: [0],
      deliveryTime: [""],
      referenceNo: [""],
      referenceDate: [""],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      isCash: [0],
      priceWithTax: [0],
      representId: [0],
      storeId: [0],
      note: [""],
      amount: [0],
      warrantyPeriod: [0],
      status: [null],
      userId: [0],
      purOrdersIds: [""],
      receiptIds: [""],
      accountId: [0, [Validators.required, Validators.min(1)]],
      purchaseInvoiceModelList: [null, [Validators.required, Validators.minLength(1)]],
      itemsSerialList: [null],
      generalAttachModelList: [null]

    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailEntryVoucher() {

    var lang = this.jwtAuth.getLang();
    this.saleinvoiceService.GetInitailSalesInvoice(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {

      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['SalesInvoices/SalesInvoicesList']);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        preventChangeBranch: item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        allowAccRepeat: item.allowAccRepeat,
        storeId: item.storeId,
        printAfterSave: item.printAfterSave
      }));

      this.itemsList = result.itemsList.map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial,
        taxId: item.taxId,
        salesAccId: item.salesAccId
      }));

      this.customersList = result.customersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));


      // Billing system     

      this.salesCycle = result.invoiceCycleSetting.salesWorkCycle;
      this.sCycle1 = result.invoiceCycleSetting.salesCycle1;
      this.sCycle2 = result.invoiceCycleSetting.salesCycle2;
      this.sCycle3 = result.invoiceCycleSetting.salesCycle3;
      this.sCycle4 = result.invoiceCycleSetting.salesCycle4;
      this.sCycle5 = result.invoiceCycleSetting.salesCycle5;
      this.sCycle6 = result.invoiceCycleSetting.salesCycle6;
      this.purchaseCucleCycle = result.invoiceCycleSetting.purchaseWorkCycle;
      this.pCycle1 = result.invoiceCycleSetting.purchasseCycle1;
      this.pCycle2 = result.invoiceCycleSetting.purchasseCycle2;
      this.pCycle3 = result.invoiceCycleSetting.purchasseCycle3;
      this.pCycle4 = result.invoiceCycleSetting.purchasseCycle4;
      this.allowMultiCurrency = result.allowMultiCurrency;
      if (this.salesCycle == this.sCycle1) {
        this.hideGetFromSalesOrder = false;
        this.hideGetFromDeleivryVoucher = false;
      }
      else if (this.salesCycle == this.sCycle2) {
        this.hideGetFromSalesOrder = false;
        this.hideGetFromDeleivryVoucher = true;
      }
      else if (this.salesCycle == this.sCycle3) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromDeleivryVoucher = false;
      }
      else if (this.salesCycle == this.sCycle4) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromDeleivryVoucher = true;
      }
      else if (this.salesCycle == this.sCycle5) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromDeleivryVoucher = true;
      }
      else if (this.salesCycle == this.sCycle6) {
        this.hideGetFromSalesOrder = false;
        this.hideGetFromDeleivryVoucher = true;
      }

      if (this.salesCycle == this.sCycle1 && this.voucherId == 0) {
        this.deleiveryList = [];
      }
      else {
        this.deleiveryList = result.delieveryVoucherLists.map((item) => ({
          label: item.id,
          value: item.note,
        }));
      }
      // End
      this.salesRequestList = result.salesOrderList.map((item) => ({
        label: item.id,
        value: item.note,
      }));
      this.expensesTypeList = result.expensesList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.expensesNameA : item.expensesNameE,
      }));
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      // this.customersList = result.customersList;
      this.accountsList = result.accountsList;
      this.costCenterList = result.costCentersList;
      this.taxesList = result.taxModelList;
      this.paymentTermsList = result.paymentTermsList;
      this.invoiceTypesList = result.invoiceTypesList;
      // this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.itemsUnitList = result.unitsList;
      this.EmployeeList = result.employeeList;
      this.defaultCurrencyId = result.defaultCurrency;
      if (result.isCash) {
        this.isCash = 1;
      }
      else {
        this.isCash = 0;

      }
      if (result.priceWithTax) {
        this.pricewTax = 1;
      }
      else {
        this.pricewTax = 0;
      }

      if (Number(result.receiptIds) > 0) {
        this.disableVouchers = true;
        this.HideSerials = true;
      }
      if (Number(result.purOrdersIds) > 0 && Number(result.receiptIds) == 0) {
        this.disableDetails = true;
      }
      if (result.purchaseInvoiceModelList !== undefined && result.purchaseInvoiceModelList !== null && result.purchaseInvoiceModelList.length > 0) {
        let index = 0;
        this.purInvoiceDTsList = result.purchaseInvoiceModelList;
        if (this.opType == 'Copy') {
          this.purInvoiceDTsList.forEach(element => {
            element.id = 0;
          })
          this.purInvoiceDTsList.forEach(element => {
            element.expiryDate = null;
            element.productDate = null;
            element.batchNo = null;
          })
          this.salesInvoiceAddForm.get("itemsSerialList").setValue([]);
        }
        else {
          if (result.purchaseSerialsModelList !== null && result.purchaseSerialsModelList.length !== 0 && result.purchaseSerialsModelList !== undefined) {
            this.salesInvoiceAddForm.get("itemsSerialList").setValue(result.purchaseSerialsModelList);
            this.savedSerials = result.purchaseSerialsModelList;
          }
          else {
            this.salesInvoiceAddForm.get("itemsSerialList").setValue([]);
          }
        }
        this.purInvoiceDTsList.forEach(element => {
          element.total = element.qty * element.price;
        })
        this.purInvoiceDTsList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
              index++;
            }
          });
        })

      }
      else {
        this.purInvoiceDTsList = [];
      }
      if (this.opType != 'Copy') {
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
          this.purInvoiceDTsList[i].expiryDate = formatDate(this.purInvoiceDTsList[i].expiryDate, "yyyy-MM-dd", "en-US");
          this.purInvoiceDTsList[i].productDate = formatDate(this.purInvoiceDTsList[i].productDate, "yyyy-MM-dd", "en-US");
        }
      }

      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onChangeItem(0, this.purInvoiceDTsList[i], i)
      }




      this.salesInvoiceAddForm.patchValue(result);
      //General Setting Fill
      this.costingMethod = result.inventoryGeneralSetting.costingMethod;
      this.defaultStoreId = result.inventoryGeneralSetting.defaultStoreId;
      this.inventoryType = result.inventoryGeneralSetting.inventoryType;
      this.useAccountInGrid = result.inventoryGeneralSetting.useAccountInGrid;
      this.useBatch = result.inventoryGeneralSetting.useBatch;
      this.useCostCenter = result.inventoryGeneralSetting.useCostCenter;
      this.useExpiryDate = result.inventoryGeneralSetting.useExpiryDate;
      this.useProductDate = result.inventoryGeneralSetting.useProductDate;
      this.useSerial = result.inventoryGeneralSetting.useSerial;
      this.useStoreInGrid = result.inventoryGeneralSetting.useStoreInGrid;
      //End
      this.isHidden = false;
      this.purAccId = 0;
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.salesInvoiceAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if (this.voucherNo > 0) {
        this.salesInvoiceAddForm.get("purOrdersIds").setValue(this.voucherNo);
        this.GetitemsBySalesOrder(0, this.voucherNo);
      }
      if (this.reservedId > 0) {
        this.GetItemsByReservationDoc(this.reservedId);
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
          let row = this.purInvoiceDTsList[i];
          row.orginalQty = row.mainQty;
          // this.saleinvoiceService.GetItems(row.storeId,row.itemId).subscribe(res=>
          //   {
          //     
          //     if(res.length >0)
          //       {
          //         row.orginalQty = res.filter()
          //       }
          //   }); 
        }
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.salesInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.salesInvoiceAddForm.get("invoiceType").setValue(result.invoiceType);
          this.salesInvoiceAddForm.get("accountId").setValue(result.accountId);
          this.salesInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.salesInvoiceAddForm.get("dealerId").setValue(result.dealerId);
          this.salesInvoiceAddForm.get("costCenterId").setValue(result.costCenterId);
          this.salesInvoiceAddForm.get("paymentTerm").setValue(result.paymentTerm);
          this.salesInvoiceAddForm.get("deliveryPeriod").setValue(result.deliveryPeriod);
          this.salesInvoiceAddForm.get("deliveryTime").setValue(result.deliveryTime);
          this.salesInvoiceAddForm.get("referenceNo").setValue(result.referenceNo);
          this.salesInvoiceAddForm.get("representId").setValue(result.representId);
          this.salesInvoiceAddForm.get("storeId").setValue(result.storeId);
          this.salesInvoiceAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.salesInvoiceAddForm.get("currencyId").setValue(result.currencyId);

          this.salesInvoiceAddForm.get("purOrdersIds").setValue(Number(result.purOrdersIds));
          this.salesInvoiceAddForm.get("receiptIds").setValue(Number(result.receiptIds));
          this.decimalPlaces = result.currencyList.find(option => option.id === result.currencyId).data2;
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }
          if (!this.useStoreInGrid) {
            this.salesInvoiceAddForm.get("storeId").setValue(result.storeId);
          }
          this.salesInvoiceAddForm.get("note").setValue(result.note);

          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.salesInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.salesInvoiceAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {

          this.salesInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.salesInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.salesInvoiceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.salesInvoiceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.salesInvoiceAddForm.get("branchId").setValue(defaultBranche.id);
          }
          if (this.salesInvoiceAddForm.value.currencyId == 0) {
            this.salesInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.salesInvoiceAddForm.get("currRate").setValue(currRate);
          }
          this.salesInvoiceAddForm.get("representId").setValue(0);
          this.salesInvoiceAddForm.get("storeId").setValue(0);
          this.salesInvoiceAddForm.get("dealerId").setValue(0);
          this.salesInvoiceAddForm.get("costCenterId").setValue(0);
          this.salesInvoiceAddForm.get("paymentTerm").setValue(0);
          this.DefaultStoreId = result.defaultStoreId;

        }
        this.GetVoucherTypeSetting(this.salesInvoiceAddForm.value.voucherTypeId);
        if (this.salesInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }




        if (this.PriceOffersId > 0) {
          this.saleinvoiceService.GetQuotationsInfo(this.PriceOffersId).subscribe(result => {
            debugger;

            this.salesInvoiceAddForm.get("branchId").setValue(result.branchId);
            this.salesInvoiceAddForm.get("currencyId").setValue(result.currencyId);
            this.salesInvoiceAddForm.get("currRate").setValue(result.currRate);
            this.salesInvoiceAddForm.get("representId").setValue(result.representId);
            this.salesInvoiceAddForm.get("note").setValue(result.note);

            if (result.quotationDTList && result.quotationDTList.length > 0) {

              this.purInvoiceDTsList = result.quotationDTList;
              this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);

              // لكل عنصر في القائمة
              this.purInvoiceDTsList.forEach((element, i) => {
                // حساب القيم الأساسية
                element.total = element.qty * element.price;
                element.taxAmt = Number((Math.round(element.taxAmount / 0.005) * 0.005).toFixed(3));
                element.discountAmt = Number((Math.round(element.discount / 0.005) * 0.005).toFixed(3));
                element.netTotal = element.allTotal;                
                // جلب الوحدات لكل سطر
                if (element.itemId && element.itemId > 0) {
                  this.saleinvoiceService.GetItemUnitbyItemId(element.itemId).subscribe(res => {
                    this.unitsList[i] = res;
                    this.bounsunitsList[i] = res;
                    if (res.length == 2) {
                      this.purInvoiceDTsList[i].unitId = res[1].id;
                    }
                    else if (this.opType == "Edit") {
                      /*         if (this.oldItem != Row.itemId) {
                                this.accVouchersDTsList[i].unitId = 0;
                                return;
                              } */
                      let unit = this.unitsList[i].find(r => r.id == element.unitId);
                      if (unit == 0 || unit == undefined || unit == null) {
                        this.purInvoiceDTsList[i].unitId = 0;
                        this.purInvoiceDTsList[i].bonusUnitId = 0;
                        return;
                      }
                      if (this.purInvoiceDTsList[i].unitId != 0) {
                        this.purInvoiceDTsList[i].unitId = element.unitId;

                      }
                    }
                    else if (res.length > 2 && element.bonus == 0) {
                      this.purInvoiceDTsList[i].unitId = res[0].id;

                    }
                    else {
                      this.bounsunitsList[i] = res;
                    
                  
                }

                // تحديث القيم الأخرى بعد تغيير الوحدة
                this.onChangeUnit(element, i, false);
              });
            }
          });
          debugger
           for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
             this.onDiscountAmtChange(i);
            }
          // حساب الإجماليات بعد كل شيء
          this.fTotal = 0;
          this.fTotalGridNet = 0;
          this.fDiscount = 0;
          this.fTaxTotal = 0;
          this.fNetTotal = 0;

          this.purInvoiceDTsList.forEach(el => {
            this.fTotal += Number(el.total || 0);
            this.fTotalGridNet += Number(el.netTotal || 0);
            this.fDiscount += Number(el.discountAmt || 0);
            this.fTaxTotal += Number(el.taxAmt || 0);
          });

          this.fTotal = Number(this.fTotal).toFixed(this.decimalPlaces);
          this.fTotalGridNet = Number(this.fTotalGridNet).toFixed(this.decimalPlaces);
          this.fDiscount = Number(this.fDiscount).toFixed(this.decimalPlaces);
          this.fTaxTotal = Number(this.fTaxTotal).toFixed(this.decimalPlaces);
          this.fNetTotal = Number(this.fTotalGridNet).toFixed(this.decimalPlaces);

        } else {
          this.purInvoiceDTsList = [];
        }
      });
    }
      });
})
  }

  OnSaveForms() {

    this.disableSave = true;
    let stopExecution = false;
    if (this.isCash == 0) {
      if (this.salesInvoiceAddForm.value.dealerId == 0) {
        this.alert.ShowAlert("MsgPleaseInsertCustomer", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }

    if (this.purInvoiceDTsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
      const element = this.purInvoiceDTsList[i];
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.price == 0 || element.accountId == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }

      if (element.bonus == null || element.bonus == undefined || element.bonus == 0 && element.bonusUnitId > 0) {
        this.alert.ShowAlert("PleaseInsertBouns", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }

      if (element.bonusUnitId == null || element.bonusUnitId == undefined || element.bonusUnitId == 0 && element.bonus > 0) {
        this.alert.ShowAlert("PleaseInsertBounsUnit", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.i = i.toString();
    }

    if (this.useStoreInGrid == true) {
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        const element = this.purInvoiceDTsList[i];
        if (element.storeId == 0) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }
    else {
      if (this.salesInvoiceAddForm.value.storeId == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }
    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
      const element = this.purInvoiceDTsList[i];
      if (element.bonus > 0 && element.bonusUnitId == 0) {
        this.alert.ShowAlert("PleaseInsertBounsUnit", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.i = i.toString();
    }

    // special Validation 
    for (let index = 0; index < this.purInvoiceDTsList.length; index++) {
      const element = this.purInvoiceDTsList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find(item => item.id === itemId);

      if (!item) {
        continue;
      }
      if (this.useExpiryDate == true) {
        if (item.hasExpiry) {
          if (element.expiryDate == "" || element.expiryDate == null) {
            this.alert.RemainimgQty("msgPleaseEnterExpiryDate1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          if (this.useBatch == true) {
            if (element.batchNo == "" || element.batchNo == null) {
              this.alert.RemainimgQty("msgPleaseEnterBatch1", item.text, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }
          }
        }
      }
      if (this.HideSerials == false) {
        if (this.useSerial == true) {
          if (item.hasSerial) {
            if (this.salesInvoiceAddForm.value.itemsSerialList == null || this.salesInvoiceAddForm.value.itemsSerialList == undefined) {
              this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }
            const checkedItemCount = this.salesInvoiceAddForm.value.itemsSerialList.reduce((count, item) => {
              if (item.rowIndex === index && item.isChecked === true) {
                return count + 1;
              }
              return count;
            }, 0);

            if (checkedItemCount !== (element.qty * element.unitRate) + (element.bonus * element.bonusUnitRate)) {
              this.alert.RemainimgQty("CantSaveQtyEntryNotEqualForItem", item.text, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }

            const item1 = this.salesInvoiceAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.rowIndex === index);
            if (!item1) {
              this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }
          }
        }
      }

      element.index = index.toString();
    }
    // End
    this.purInvoiceDTsList.forEach(element => {
      if (element.bonusUnitId == null) {
        element.bonusUnitId = 0;
      }
    })
    if (this.salesInvoiceAddForm.value.dealerId != 0 && this.salesInvoiceAddForm.value.dealerId != null && this.salesInvoiceAddForm.value.dealerId != undefined) {
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        var IsTaxable = this.customersList.find(x => x.id === this.salesInvoiceAddForm.value.dealerId).IsTaxable;
        if (IsTaxable == true && this.purInvoiceDTsList[i].taxId == 0) {
          this.alert.ShowAlert("msgMustSelectTaxForDealer", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }
    }

    if (!this.useStoreInGrid) {
      if (this.purInvoiceDTsList.length > 0) {
        let storeId = this.salesInvoiceAddForm.value.storeId;
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
          this.purInvoiceDTsList[i].storeId = storeId;
        }
      }
    }

    this.salesInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.salesInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.salesInvoiceAddForm.value.voucherNo = this.salesInvoiceAddForm.value.voucherNo.toString();
    this.salesInvoiceAddForm.value.purchaseInvoiceModelList = this.purInvoiceDTsList;
    this.salesInvoiceAddForm.get("amount").setValue(parseFloat(this.fNetTotal));
    this.salesInvoiceAddForm.get("status").setValue(0);
    this.salesInvoiceAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    this.saleinvoiceService.SaveSalesInvoice(this.salesInvoiceAddForm.value)
      .subscribe((result) => {

        if (result.isSuccess) {
          this.alert.SaveSuccess();


          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.salesInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintSalesInvoice(Number(result.message));
          }


          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy' || this.reservedId > 0) {
            this.router.navigate(['SalesInvoices/SalesInvoicesList']);
          }
          this.voucherId = 0;
          this.voucherNo = 0;
          this.opType = 'Add';
          this.disableSave = false;
          this.ngOnInit();

        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  ClearAfterSave() {

    this.purInvoiceDTsList = [];
    this.salesInvoiceAddForm.value.purchaseInvoiceModelList = [];
    this.salesInvoiceAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.salesInvoiceAddForm.get("receiptIds").setValue(0);
    this.salesInvoiceAddForm.get("branchId").setValue(0);
    this.salesInvoiceAddForm.get("dealerId").setValue(0);
    this.salesInvoiceAddForm.get("costCenterId").setValue(0);
    this.salesInvoiceAddForm.get("paymentTerm").setValue(0);
    this.salesInvoiceAddForm.get("currencyId").setValue(0);
    this.salesInvoiceAddForm.get("currRate").setValue(0);
    this.salesInvoiceAddForm.get("note").setValue("");
    this.salesInvoiceAddForm.get("accountId").setValue(0);
    this.fTotal = 0;
    this.fDiscount = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.salesInvoiceAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.salesInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.salesInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.salesInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.saleinvoiceService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.salesInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.salesInvoiceAddForm.get("voucherNo").setValue(1);
        }
      });
    }

    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.salesInvoiceAddForm.get("branchId").setValue(branchId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
    }
    else {
      this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
    }
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.salesInvoiceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.salesInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.salesInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.salesInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.salesInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.salesInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any, CurrId: any) {
    if (event.value > 0) {
      const selectedValue = event.value;
      var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
      this.salesInvoiceAddForm.get("currRate").setValue(currRate);
      if (event.value == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onCheckboxChange(0);
      }
    }
    else {
      const selectedValue = CurrId;
      var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
      this.salesInvoiceAddForm.get("currRate").setValue(currRate);
      if (event.value == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onCheckboxChange(0);
      }
    }
  }

  getaccountId(voucherType, type, index) {
    if (this.disableAll == true) {
      return;
    }

    this.saleinvoiceService.GetAccounts(voucherType).subscribe(result => {

      if (result) {
        this.purAccId = result.creditAccId;
        if (type == 1) {
          this.AddNewLineDetails();
        }
        else {
          this.onAddRowBefore(index);
        }

      }
    })
  }

  AddNewLineDetails() {

    if (this.purInvoiceDTsList == null) {
      this.purInvoiceDTsList = [];
    }
    if (!this.useStoreInGrid) {
      if (this.salesInvoiceAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
      else {
        this.voucherStoreId = this.salesInvoiceAddForm.value.storeId;
      }
    }
    this.purInvoiceDTsList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: "",
        price: "",
        cost: 0,
        storeId: this.voucherStoreId,
        bonus: "",
        bonusUnitId: 0,
        bonusUnitRate: 0,
        accountId: this.purAccId,
        taxId: 0,
        taxAmt: 0,
        taxPerc: 0,
        discountPerc: "",
        discountAmt: "",
        priceWithTax: 0,
        expiryDate: "",
        productDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
        batchNo: "",
        unitRate: 0,
        purOrderId: 0,
        receiptId: 0,
        netTotal: 0,
        total: 0,
        disablebatch: false,
        orgQty: 0,
        mainBouns: 0,
        index: this.purInvoiceDTsList.length
      });
    this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);


  }

  calculateSum() {
    var amount = "0"
    amount = this.formatCurrency(this.purInvoiceDTsList.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)) - (parseFloat(item.discountAmt)) + parseFloat(item.taxAmt), 0));
    return parseFloat(amount);
  }

  deleteRow(rowIndex: number) {

    let stopexe = false;
    if (this.salesInvoiceAddForm.value.itemsSerialList == null) {
      this.salesInvoiceAddForm.get("itemsSerialList").setValue([]);
    }
    this.salesInvoiceAddForm.value.itemsSerialList.forEach(element => {
      if (element.rowIndex == rowIndex && element.serialNo !== null && element.isChecked == true) {
        stopexe = true;
        return;
      }
    });
    if (stopexe) {
      this.alert.ShowAlert("CantDeleteRowTheresSerialsAttachedWithRow", 'error');
      return;
    }
    if (rowIndex !== -1) {
      this.purInvoiceDTsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
      let indexToRemove = this.salesInvoiceAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.salesInvoiceAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
    }
    this.salesInvoiceAddForm.value.itemsSerialList.forEach(element => {
      if (element.rowIndex !== 0) {
        element.rowIndex = element.rowIndex - 1;
      }
    });
    this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    this.clearTotals();
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isValidVoucherDate(event) {
    this.validDate = true;
    if (event.target.value == "") {
      this.validDate = false;
      return;
    }
    this.appCommonserviceService.isValidVoucherDate(event.target.value).subscribe(res => {
      if (!res) {
        this.validDate = false;
        this.alert.ShowAlert("msgInvalidDate", 'error');
      }
    }, err => {
      this.validDate = false;
    })
  }

  onAddRowBefore(rowIndex: number) {
    const newRow =
    {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      qty: "",
      price: "",
      cost: 0,
      storeId: this.voucherStoreId,
      bonus: "",
      bonusUnitId: 0,
      bonusUnitRate: 0,
      accountId: this.purAccId,
      taxId: 0,
      taxAmt: 0,
      taxPerc: 0,
      discountPerc: "",
      discountAmt: "",
      priceWithTax: 0,
      expiryDate: "",
      productDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
      batchNo: "",
      unitRate: 0,
      purOrderId: 0,
      receiptId: 0,
      netTotal: 0,
      total: 0,
      disablebatch: false,
      orgQty: 0,
      mainBouns: 0,
      index: this.purInvoiceDTsList.length
    };

    this.purInvoiceDTsList.splice(rowIndex, 0, newRow);
    this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/accountsstatement?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  onChangeItem(event, Row, i) {
    debugger
    if (event.value == 0 || event.value == undefined) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.saleinvoiceService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {

          this.unitsList[i] = res;
          this.bounsunitsList[i] = res;
          if (res.length == 2) {
            this.purInvoiceDTsList[i].unitId = res[1].id;
          }
          else if (this.opType == "Edit") {
            /*         if (this.oldItem != Row.itemId) {
                      this.accVouchersDTsList[i].unitId = 0;
                      return;
                    } */
            let unit = this.unitsList[i].find(r => r.id == Row.unitId);
            if (unit == 0 || unit == undefined || unit == null) {
              this.purInvoiceDTsList[i].unitId = 0;
              this.purInvoiceDTsList[i].bonusUnitId = 0;
              return;
            }
            if (this.purInvoiceDTsList[i].unitId != 0) {
              this.purInvoiceDTsList[i].unitId = Row.unitId;

            }
          }
          else if (res.length > 2 && Row.bonus == 0) {
            this.purInvoiceDTsList[i].unitId = res[0].id;

          }
          else {
            this.bounsunitsList[i] = res;
          }
        });
      }
      this.onChangeUnit(this.purInvoiceDTsList[i], i, false);
    }
    else {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      // if (Row.bonus == 0 || Row.bonus == null) {
      //   this.bounsunitsList[i] = [];
      // }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serialsListss = [];
        this.purInvoiceDTsList[i].qty = "";
        this.purInvoiceDTsList[i].cost = 0;
        this.purInvoiceDTsList[i].price = "";
        this.purInvoiceDTsList[i].taxAmt = 0;
        this.purInvoiceDTsList[i].discountPerc = "";
        this.purInvoiceDTsList[i].discountAmt = "";
        this.purInvoiceDTsList[i].priceWithTax = 0;
        // this.purInvoiceDTsList[i].storeId=0;
        this.purInvoiceDTsList[i].bonus = "";
        this.purInvoiceDTsList[i].bonusUnitId = 0;
        this.purInvoiceDTsList[i].bonusUnitRate = 0;
        this.purInvoiceDTsList[i].taxId = 0;
        this.purInvoiceDTsList[i].taxPerc = 0;
        this.purInvoiceDTsList[i].expiryDate = "";
        this.purInvoiceDTsList[i].productDate = "";
        this.purInvoiceDTsList[i].batchNo = "";
        this.purInvoiceDTsList[i].unitRate = 0;
        this.purInvoiceDTsList[i].netTotal = 0;
        this.purInvoiceDTsList[i].total = 0;
        this.purInvoiceDTsList[i].orginalQty = 0;
        this.purInvoiceDTsList[i].newRow = 0;
        if (event.value > 0) {
          this.saleinvoiceService.GetItemUnitbyItemId(event.value).subscribe(res => {

            this.unitsList[i] = res;
            this.bounsunitsList[i] = res;
            if (res.length == 2) {
              this.purInvoiceDTsList[i].unitId = res[1].id;
              this.purInvoiceDTsList[i].unitRate = res[1].data3;
              this.purInvoiceDTsList[i].price = res[1].data2;
            }
            if (res.length > 2) {
              this.purInvoiceDTsList[i].unitId = 0;
              this.purInvoiceDTsList[i].bonusUnitId = 0;
            }
            // if (Row.bonus == 0 || Row.bonus == null) {
            //   this.bounsunitsList[i] = [];
            // }
            // else {
            //   this.bounsunitsList[i] = res;
            // }
            // this.onChangeUnit(this.purInvoiceDTsList[i], i,false);
          });

          if (this.purInvoiceDTsList.length > 0) {
            let isDuplicate = false;
            for (let m = 0; m < this.purInvoiceDTsList.length; m++) {
              if (this.purInvoiceDTsList[m].itemId == Row.itemId && i != m) {
                isDuplicate = true;

                if (this.allowAccRepeat == 61) {
                  this.alert.ShowAlert("msgCantAddSameItemForThisVoucherType", 'error');
                  break;
                } else if (this.allowAccRepeat == 60) {
                  this.alert.ShowAlert("msgTheItemRepeatedReminder", 'error');
                  break;
                }
              }
            }
            if (isDuplicate && this.allowAccRepeat == 61) {
              this.purInvoiceDTsList[i] = {
                ...this.purInvoiceDTsList[i],
                itemId: 0
              };
              this.cdr.detectChanges();
              return;
            }
          }
        }

      }
    }

    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === event.value);

      if (selectedItem && selectedItem.storeId > 0) {
        var defaultStoreNo = selectedItem.storeId;
        this.purInvoiceDTsList[i].storeId = defaultStoreNo;
        this.cdr.detectChanges();
      }
      else {
        // this.purInvoiceDTsList[i].storeId = 0;
        this.cdr.detectChanges();
      }
    }



    if (this.opType == 'Add') {
      if (this.salesInvoiceAddForm.value.purOrdersIds == 0 || this.salesInvoiceAddForm.value.purOrdersIds == null) {
        let taxId = this.itemsList.find(x => x.id === Row.itemId).taxId;
        if (taxId != null && taxId != undefined) {
          this.purInvoiceDTsList[i].taxId = taxId;
        }
        else {
          this.purInvoiceDTsList[i].taxId = 0;
        }
      }


      let salesAccId = this.itemsList.find(x => x.id === Row.itemId).salesAccId;
      if (this.purInvoiceDTsList[i].accountId == 0) {
        if (salesAccId != null && salesAccId != undefined && salesAccId != 0) {
          this.purInvoiceDTsList[i].accountId = salesAccId;
        }
        else {
          this.purInvoiceDTsList[i].accountId = 0;
        }
      }
    }
  }

  OnQtyChange(event: any, row: any, Index: number) {

    this.showBalance = false;
    this.showAlert = false;
    this.showPrevent = false;
    if (this.salesInvoiceAddForm.value.purOrdersIds > 0 || this.salesInvoiceAddForm.value.receiptIds > 0) {
      const qtyUsedForItem = this.purInvoiceDTsList.filter(x => x.itemId === row.itemId).reduce((row, c) => row + (+c.qty || 0), 0);
      if ((qtyUsedForItem * row.unitRate) > (row.mainQty)) {
        if (row.unitRate > 1) {
          const updatedElement = { ...this.purInvoiceDTsList[Index], qty: 0, unitId: 0 };
          this.purInvoiceDTsList[Index] = updatedElement;
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainQty, 'error');
          return false;
        }
        else {
          const updatedElement = { ...this.purInvoiceDTsList[Index], qty: 0 };//row.mainQty
          this.purInvoiceDTsList[Index] = updatedElement;
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainQty, 'error');
          return false;
        }
      }
    }

    if (row.qty < 0) {
      this.alert.ShowAlert("CantAddValueLessThanZero", 'error');
      this.purInvoiceDTsList[Index].qty = 0;
      return;
    }

    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }

    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    else {
      if (row.total == 0 || row.total == null || row.total == undefined) {
        row.total = 0;
        row.total = row.total.toFixed(this.decimalPlaces);
      }
    }
    // check if we had multiple  Batch ON  same Table
    if (this.purInvoiceDTsList.length > 1) {
      if (this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate > this.purInvoiceDTsList[Index].orginalQty) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.purInvoiceDTsList[Index].orginalQty, 'error');
          this.purInvoiceDTsList[Index].qty = 0;
          return false;
        }
      }
    }
    if (this.purInvoiceDTsList.length > 1) {
      let totBatchQty = 0;
      let allBatchQty = 0;
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          if (this.purInvoiceDTsList[i].batchNo == Batch && i != Index) {
            totBatchQty += this.purInvoiceDTsList[i].qty * this.purInvoiceDTsList[i].unitRate;
            allBatchQty += this.purInvoiceDTsList[i].qty * this.purInvoiceDTsList[i].unitRate;
            if (totBatchQty + (this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate) > this.purInvoiceDTsList[Index].orginalQty) {
              const source$ = of(1, 2);
              source$.pipe(delay(0)).subscribe(() => {
                this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.purInvoiceDTsList[Index].orginalQty - totBatchQty, 'error');
                this.purInvoiceDTsList[Index].qty = 0;
                return false;
              });
            }
          }
        }
      }
    }
    let allowMinus = this.storesList.find(c => c.id === this.purInvoiceDTsList[Index].storeId).data4;
    // THIS Checks Batch Quantity For The Item
    if (!allowMinus && row.orginalQty > 0) {
      if (this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate > row.orginalQty) {
        this.alert.RemainimgQty("QuantityOfBatchNotEnough=", row.orginalQty.toString(), 'error');
        this.purInvoiceDTsList[Index].qty = null;
        return false;
      }
    }
    // check if we had multiple  item  same id 
    let transDate = this.salesInvoiceAddForm.value.voucherDate;
    if (this.purInvoiceDTsList.length > 1) {
      let totalQty = 0;
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        const item = row.itemId;
        if (this.purInvoiceDTsList[i].itemId == item && i != Index) {
          totalQty += (row.qty * row.unitRate) + this.purInvoiceDTsList[i].qty;
          this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.purInvoiceDTsList[Index].storeId, this.purInvoiceDTsList[Index].unitId, transDate, this.purInvoiceDTsList[Index].qty).subscribe(res => {

            if (totalQty > res[0].qty) {
              setTimeout(() => {
                this.purInvoiceDTsList[Index].qty = 0;
                this.showRemainQty = false;
                this.cdr.detectChanges();
              });
              this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
              return;
            }
            else {
              this.showRemainQty = true;
              this.remainingQty = res[Index].qty;
              this.hideLabelAfterDelay();
            }
          })
        }
      }
    }
    if (this.purInvoiceDTsList[Index].itemId == 0) {
      this.alert.ShowAlert("PleaseEnterItemID", 'error');
      setTimeout(() => {
        this.purInvoiceDTsList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }
    if (this.purInvoiceDTsList[Index].unitId == 0) {
      this.alert.ShowAlert("PleaseEnterUnitID", 'error');
      setTimeout(() => {
        this.purInvoiceDTsList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }
    //if (this.useStoreInGrid) {
    if (this.purInvoiceDTsList[Index].storeId == 0) {
      this.alert.ShowAlert("PleaseEnterStoreID", 'error');
      setTimeout(() => {
        this.purInvoiceDTsList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }

    this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.purInvoiceDTsList[Index].storeId, this.purInvoiceDTsList[Index].unitId, transDate, this.purInvoiceDTsList[Index].qty).subscribe(res => {
      if (res.length == 0) {
        setTimeout(() => {
          row.qty = 0;
          row.price = 0;
          row.cost = 0;
          row.total = 0;
          row.batchNo = null;
          row.expiryDate = null;
          row.productDate = null;
          row.refId = 0;
          this.purInvoiceDTsList[Index].orginalQty = 0;
          this.purInvoiceDTsList[Index].newRow = 1;
          this.showRemainQty = false;
          this.cdr.detectChanges();
        });
        this.alert.RemainimgQty("RemainigQty=", 0, 'error');
        return;
      }
      if (res.length === 1) {
        row.cost = res[0].cost;
        row.batchNo = res[0].batchNo;
        row.expiryDate = res[0].expiryDate === null ? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")
        row.productDate = res[0].productDate === null ? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")
        this.purInvoiceDTsList[Index].productDate = row.productDate;
        this.purInvoiceDTsList[Index].expiryDate = row.expiryDate;
        this.purInvoiceDTsList[Index].batchNo = row.batchNo;
        this.purInvoiceDTsList[Index].orginalQty = res[0].qoh;
        this.purInvoiceDTsList[Index].newRow = 1;
      }
      else {
        row.qty = res[0].inQty;
        row.cost = res[0].cost;
        row.total = res[0].inQty * res[0].price;
        row.batchNo = res[0].batchNo;
        row.expiryDate = res[0].expiryDate === null ? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")
        row.productDate = res[0].productDate === null ? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")
        this.purInvoiceDTsList[Index].productDate = row.productDate;
        this.purInvoiceDTsList[Index].expiryDate = row.expiryDate;
        this.purInvoiceDTsList[Index].batchNo = row.batchNo;
        this.purInvoiceDTsList[Index].orginalQty = res[0].qoh;
        this.purInvoiceDTsList[Index].newRow = 1;
        for (let index = 1; index < res.length; index++) {
          this.unitsList[index] = this.unitsList[Index];
          this.purInvoiceDTsList.push(
            {
              id: 0,
              hDId: 0,
              itemId: row.itemId,
              unitId: row.unitId,
              unitRate: row.unitRate,
              storeId: row.storeId,
              qty: res[index].inQty,
              price: res[index].price,
              cost: res[index].cost,
              total: res[index].inQty * res[index].price,
              costCenterId: 0,
              productDate: res[index].productDate === null ? null : formatDate(res[index].productDate, "yyyy-MM-dd", "en-US"),
              expiryDate: res[index].expiryDate === null ? null : formatDate(res[index].expiryDate, "yyyy-MM-dd", "en-US"),
              batchNo: res[index].batchNo,
              accountId: row.accountId,
              debitAccountId: row.debitAccountId,
              orginalQty: res[index].qoh,
              newRow: 0,
              index: ""
            });
          this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
        }
      }
      //row.price = res[0].cost;
      if (!allowMinus && this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate > res[0].qoh) {
        setTimeout(() => {
          this.purInvoiceDTsList[Index].qty = 0;
          this.showRemainQty = false;
          this.cdr.detectChanges();
        });
        this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
      }
      else {
        this.showRemainQty = true;
        this.remainingQty = res[0].qoh;
        this.hideLabelAfterDelay();
      }
    })
    // Comment By Hamza 
    // let itemQty = this.purInvoiceDTsList.filter(item => item.index !== Index).reduce((sum, item) => sum + item.qty, 0);
    // this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.purInvoiceDTsList[Index].storeId, this.purInvoiceDTsList[Index].unitId,transDate,this.purInvoiceDTsList[Index].qty).subscribe(res => {
    //    
    //   if(res.length==0){
    //     setTimeout(() => {
    //       row.qty = 0;
    //       row.price = 0;
    //       row.total=0;
    //       row.batchNo = null;    
    //       row.expiryDate = null;      
    //       row.productDate = null;  
    //       row.refId = 0;
    //       row.cost = 0;  
    //       row.bonus= "";
    //       row.bonusUnitId= 0;
    //       row.bonusUnitRate= 0;
    //       row.taxId= 0;
    //       row.taxAmt= 0;
    //       row.taxPerc= 0;
    //       row.discountPerc= "";
    //       row.discountAmt= "";
    //       this.purInvoiceDTsList[Index].orginalQty = 0;
    //       this.purInvoiceDTsList[Index].newRow = 1;
    //       this.showRemainQty = false;
    //       this.cdr.detectChanges();
    //     });
    //     this.alert.RemainimgQty("RemainigQty=", 0, 'error');
    //     return;
    //   }
    //   else{
    //     if(row.qty+itemQty > res[0].qoh/row.unitRate){
    //       setTimeout(() => {
    //         row.qty = 0;
    //         row.price = 0;
    //         row.total=0;
    //         row.cost = 0;  
    //         row.batchNo = null;    
    //         row.expiryDate = null;      
    //         row.productDate = null;  
    //         row.refId = 0;
    //         row.bonus= "";
    //         row.bonusUnitId= 0;
    //         row.bonusUnitRate= 0;
    //         row.taxId= 0;
    //         row.taxAmt= 0;
    //         row.taxPerc= 0;
    //         row.discountPerc= "";
    //         row.discountAmt= "";
    //         this.purInvoiceDTsList[Index].orginalQty = 0;
    //         this.purInvoiceDTsList[Index].newRow = 1;
    //         this.showRemainQty = false;
    //         this.cdr.detectChanges();
    //       });
    //       this.alert.RemainimgQty("RemainigQty=", res[0].qoh/row.unitRate, 'error');
    //       return;
    //     }
    //   }
    //   let remQty = row.qty;
    //   let addNewLine = false;
    //   for (let index = 0; index < res.length; index++) {
    //     const element = res[index];
    //     let itemBatchQty = this.purInvoiceDTsList.filter(item => item.index !== Index && item.itemId == row.itemId && item.batchNo == element.batchNo).reduce((sum, item) => sum + item.qty, 0);
    //     let bathQty = (element.inQty - element.outQty)/row.unitRate;
    //     if(itemBatchQty + remQty <= bathQty){
    //       if(addNewLine){            
    //         this.purInvoiceDTsList.push(
    //         {
    //           id: 0,
    //           hDId: 0,
    //           itemId: row.itemId,
    //           unitId: row.unitId,
    //           unitRate: row.unitRate,
    //           storeId: row.storeId,
    //           qty: remQty,
    //           cost : element.cost,
    //           price: row.price,//*row.unitRate,
    //           total: remQty * row.price,//*row.unitRate,
    //           costCenterId: 0,
    //           refId : element.id,
    //           bonus: "",
    //           bonusUnitId: 0,
    //           bonusUnitRate: 0,
    //           taxId: 0,
    //           taxAmt: 0,
    //           taxPerc: 0,
    //           discountPerc: "",
    //           discountAmt: "",
    //           productDate: element.productDate === null? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
    //           expiryDate: element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
    //           batchNo: element.batchNo,
    //           accountId: row.accountId,
    //           orginalQty: element.qoh,
    //           newRow: 0,
    //           index: this.purInvoiceDTsList.length
    //         });
    //         this.unitsList[this.purInvoiceDTsList.length-1] = this.unitsList[Index];
    //         this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    //         this.showRemainQty = true;
    //         this.remainingQty = res[0].qoh/row.unitRate;
    //         this.hideLabelAfterDelay();
    //         return;
    //       }
    //       else{
    //         row.price = row.price;//*row.unitRate;
    //         row.total = row.price * row.qty;
    //         row.batchNo = element.batchNo;   
    //         row.refId = element.id;
    //         row.cost = element.cost;  
    //         row.bonus= "";
    //         row.bonusUnitId= 0;
    //         row.bonusUnitRate= 0;
    //         row.taxId= 0;
    //         row.taxAmt= 0;
    //         row.taxPerc= 0;
    //         row.discountPerc= "";
    //         row.discountAmt= "";
    //         row.expiryDate = element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")      
    //         row.productDate = element.productDate === null? null :formatDate(element.productDate, "yyyy-MM-dd", "en-US")  
    //         this.purInvoiceDTsList[Index].orginalQty = element.qoh;
    //         this.purInvoiceDTsList[Index].newRow = 1;
    //         this.showRemainQty = true;
    //         this.remainingQty = res[0].qoh/row.unitRate;
    //         this.hideLabelAfterDelay();
    //         return;           
    //       }
    //     }
    //     else{
    //       if(bathQty - itemBatchQty > 0){
    //         if(addNewLine){            
    //           this.purInvoiceDTsList.push(
    //           {
    //             id: 0,
    //             hDId: 0,
    //             itemId: row.itemId,
    //             unitId: row.unitId,
    //             unitRate: row.unitRate,
    //             storeId: row.storeId,
    //             qty: (bathQty - itemBatchQty),
    //             price: row.price,//*row.unitRate,
    //             total: (bathQty - itemBatchQty) * row.price,//*row.unitRate,
    //             costCenterId: 0,
    //             cost : element.cost,
    //             refId : element.id,
    //             bonus: "",
    //             bonusUnitId: 0,
    //             bonusUnitRate: 0,
    //             taxId: 0,
    //             taxAmt: 0,
    //             taxPerc: 0,
    //             discountPerc: "",
    //             discountAmt: "",
    //             expiryDate : element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),      
    //             productDate : element.productDate === null? null :formatDate(element.productDate, "yyyy-MM-dd", "en-US"), 
    //             batchNo: element.batchNo,
    //             accountId: row.accountId,
    //             orginalQty: element.qoh,
    //             newRow: 0,
    //             index: this.purInvoiceDTsList.length
    //           });
    //           this.unitsList[this.purInvoiceDTsList.length-1] = this.unitsList[Index];
    //           this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    //           remQty = remQty - (bathQty - itemBatchQty);
    //           this.showRemainQty = true;
    //           this.remainingQty = res[0].qoh/row.unitRate;
    //           this.hideLabelAfterDelay();
    //           addNewLine = true; 
    //         }
    //         else
    //         {
    //             row.qty = (bathQty - itemBatchQty);
    //             row.price = row.price;//*row.unitRate;
    //             row.total = row.price * row.qty;
    //             row.batchNo = element.batchNo;  
    //             row.refId = element.id;  
    //             row.cost = element.cost;  
    //             row.bonus= "";
    //             row.bonusUnitId= 0;
    //             row.bonusUnitRate= 0;
    //             row.taxId= 0;
    //             row.taxAmt= 0;
    //             row.taxPerc= 0;
    //             row.discountPerc= "";
    //             row.discountAmt= "";
    //             row.expiryDate = element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");      
    //             row.productDate = element.productDate === null? null :formatDate(element.productDate, "yyyy-MM-dd", "en-US");
    //             this.purInvoiceDTsList[Index].orginalQty = element.qoh;
    //             this.purInvoiceDTsList[Index].newRow = 1;
    //             remQty = remQty - (bathQty - itemBatchQty);
    //             this.showRemainQty = true;
    //             this.remainingQty = res[0].qoh/row.unitRate;
    //             this.hideLabelAfterDelay();
    //             addNewLine = true;              
    //           }
    //       }
    //     }
    //   }
    // })

    //}
    // else {
    //   if (this.salesInvoiceAddForm.value.storeId == 0) {
    //     this.alert.ShowAlert("PleaseEnterStoreID", 'error');
    //     setTimeout(() => {
    //       this.purInvoiceDTsList[Index].qty = 0;
    //       this.cdr.detectChanges();
    //     });
    //     return;
    //   }
    //   this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.salesInvoiceAddForm.value.storeId, this.purInvoiceDTsList[Index].unitId, transDate, this.purInvoiceDTsList[Index].qty).subscribe(res => {
    //      
    //     if (this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate > res[0].qty) {
    //       setTimeout(() => {
    //         this.purInvoiceDTsList[Index].qty = 0;
    //         this.showRemainQty = false;
    //         this.cdr.detectChanges();
    //       });
    //       this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
    //     }
    //     else {
    //       this.showRemainQty = true;
    //       this.remainingQty = res[0].qty;
    //       this.hideLabelAfterDelay();
    //     }
    //   })
    // }

  }

  onChangeBouns(event, row, index) {

    if (this.salesInvoiceAddForm.value.purOrdersIds > 0 || this.salesInvoiceAddForm.value.receiptIds > 0) {
      if (Number((row.bonus * row.bonusUnitRate)) > (row.mainBouns)) {
        if (row.bonusUnitRate > 1) {
          const updatedElement = { ...this.purInvoiceDTsList[index], bonus: 0, bonusUnitId: 0, bonusUnitRate: 0 };
          this.purInvoiceDTsList[index] = updatedElement;
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", Number(row.mainBouns), 'error');
          return false;
        }
        else {
          const updatedElement = { ...this.purInvoiceDTsList[index], bonus: row.mainBouns };
          this.purInvoiceDTsList[index] = updatedElement;
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", Number(row.mainBouns), 'error');
          return false;
        }
        // const updatedElement = { ...this.purInvoiceDTsList[index], bonus: row.mainBouns / row.bonusUnitRate };
        // this.purInvoiceDTsList[index] = updatedElement;
        // this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", Number(row.mainBouns), 'error');
        // return false;
      }
    }
    if (row.itemId !== 0 && row.itemId !== null && row.bonus > 0) {


      let bonus = this.purInvoiceDTsList[index].bonus * Number(this.purInvoiceDTsList[index].bonusUnitRate);
      let qty = this.purInvoiceDTsList[index].qty * Number(this.purInvoiceDTsList[index].unitRate);
      if (bonus > this.purInvoiceDTsList[index].orginalQty - qty) {
        this.alert.RemainimgQty("RemainigQty=", this.purInvoiceDTsList[index].orginalQty, 'error');
        this.showRemainQty = false;
        this.purInvoiceDTsList[index].bonus = 0;
        this.cdr.detectChanges();
      }
    }

  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any, index) {
    this.showRemainQty = false;
    if (row.price !== null && row.price !== undefined) {
      row.price = Number(row.price).toFixed(this.decimalPlaces);
      row.total = Number(row.total).toFixed(this.decimalPlaces);
    }

    this.onCheckboxChange(0);
  }

  onQtyBlur(row: any) {

    if (row.price > 0 && row.qty > 0) {
      row.total = Number(row.price * row.qty).toFixed(this.decimalPlaces);
      this.onCheckboxChange(0);
    }
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  getDealerAcc(event) {


    if (this.isCash == 0) {
      if (event.value) {
        var acc = this.customersList.find(option => option.id === event.value).data2;
        this.salesInvoiceAddForm.get("accountId").setValue(acc);
      }
      else {
        if (event) {
          var acc = this.customersList.find(option => option.id === event).data2;
          this.salesInvoiceAddForm.get("accountId").setValue(acc);
        }
      }
    }


    if (event.value) {
      this.showAlert = false;

      this.saleinvoiceService.GetDealerInfo(event.value).subscribe(res => {

        if (res) {
          let DealerName = this.customersList.find(r => r.id == event.value).text;
          this.dealerBalance = res.balance;
          this.dealerAmt = res.amt;
          this.dealerPriceCategoryId = res.priceCategoryId;
          this.dealerChequeAmt = res.chequeAmt;
          this.dealerPolicy = res.policy;
          this.NoteAlert = "Warning:TheCustomerhasexceededthepermittedfinanciallimit";
          this.NotePrevenet = "TheCustomerhasexceededthepermittedfinanciallimit";
          this.NoteBalance = "رصيد العميل " + "-" + DealerName + ": " + Math.abs(res.balance).toFixed(3) + " , " + "سقف العميل" + ": " + res.amt.toFixed(3);
          this.showBalance = true;
          this.showAlert = false;
          this.showPrevent = false;
          this.onCheckboxChange(0);

        }
      })

    }

  }

  onCheckboxChange(event) {

    var i = 0;
    if (event !== 0) {
      if (event.currentTarget.checked) {
        this.salesInvoiceAddForm.get("priceWithTax").setValue(true);
      }
      else {
        this.salesInvoiceAddForm.get("priceWithTax").setValue(false);
      }
    }

    this.purInvoiceDTsList.forEach(element => {
      if (this.purInvoiceDTsList[i].discountPerc !== null || this.purInvoiceDTsList[i].discountPerc !== 0) {
        if (this.purInvoiceDTsList[i].total > 0) { this.purInvoiceDTsList[i].discountAmt = (this.purInvoiceDTsList[i].discountPerc * this.purInvoiceDTsList[i].total) / 100; }
      }
      else {
        if (this.purInvoiceDTsList[i].total > 0) { this.purInvoiceDTsList[i].discountPerc = (this.purInvoiceDTsList[i].discountAmt / this.purInvoiceDTsList[i].total) * 100; }
      }

      this.calculateValues(i);
      i++;
    })

    for (let r = 0; r < this.purInvoiceDTsList.length; r++) {
      // Format specific numeric fields with three decimal places
      this.fTotal = Number((Number(this.fTotal) + Number(this.purInvoiceDTsList[r].total)));
      this.fTotal = this.fTotal.toFixed(this.decimalPlaces);

      this.fTotalGridNet = Number((Number(this.fTotalGridNet) + Number(this.purInvoiceDTsList[r].netTotal)));
      this.fDiscount = Number(parseFloat(this.fDiscount) + parseFloat(this.purInvoiceDTsList[r].discountAmt));
      this.fDiscount = Number(this.fDiscount).toFixed(this.decimalPlaces);

      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(this.purInvoiceDTsList[r].taxAmt)));
      this.fTaxTotal = this.fTaxTotal.toFixed(this.decimalPlaces);

      this.fNetTotal = Number((Number(this.fTotalGridNet)));
      this.fNetTotal = this.fNetTotal.toFixed(this.decimalPlaces);
    }
    setTimeout(() => {
      if (Number(String(this.fNetTotal).replace(/,/g, '')) + Number(this.dealerBalance) > Number(String(this.dealerAmt).replace(/,/g, ''))) {

        if (this.dealerPolicy === 60) {
          this.showPrevent = false;
          this.showAlert = true;
          this.hideLabelAfterDelay1();
        }
        else if (this.dealerPolicy === 61) {
          this.showPrevent = true;
          this.showAlert = false;
          this.hideLabelAfterDelay1();
          for (const element of this.purInvoiceDTsList) {
            element.price = 0;
            
            element.total = 0;
          }
        }
      }
      this.hideLabelAfterDelay1();
    });


  }

  hideLabelAfterDelay1() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 10000);
  }

  calculateValues(i) {
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;

    if (this.purInvoiceDTsList.length > 0 && this.purInvoiceDTsList[i].taxId > 0)
      this.purInvoiceDTsList[i].taxPerc = this.taxesList.find(option => option.id === this.purInvoiceDTsList[i].taxId).data1;
    if (this.pricewTax == 1) {
      if (isNaN(this.purInvoiceDTsList[i].qty) || isNaN(this.purInvoiceDTsList[i].price)) {
        return;
      }
      this.purInvoiceDTsList.forEach(element => {
        element.cost = this.purInvoiceDTsList[i].price;
        element.priceWithTax = element.price;
      });
      // Calculate total
      this.purInvoiceDTsList[i].total = (Number(this.purInvoiceDTsList[i].qty) * Number(this.purInvoiceDTsList[i].price));
      this.purInvoiceDTsList[i].total = this.purInvoiceDTsList[i].total.toFixed(this.decimalPlaces);

      // Calculate net total
      if (isNaN(this.purInvoiceDTsList[i].discountPerc) || isNaN(this.purInvoiceDTsList[i].total)) {
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);
      }
      else {
        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - Number(this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);
      }

      // Calculate tax amount
      if (isNaN(this.purInvoiceDTsList[i].discountAmt)) {
        this.purInvoiceDTsList[i].taxAmt = (this.purInvoiceDTsList[i].total / (1 + (this.purInvoiceDTsList[i].taxPerc / 100)))
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);
      }
      else if (this.purInvoiceDTsList[i].taxPerc > 0) {
        this.purInvoiceDTsList[i].taxAmt = Number(((Number(this.purInvoiceDTsList[i].total - this.purInvoiceDTsList[i].discountAmt)) - ((Number(this.purInvoiceDTsList[i].total - this.purInvoiceDTsList[i].discountAmt)) / (1 + (this.purInvoiceDTsList[i].taxPerc / 100)))))
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);

      }
      else {
        return;
      }
    }
    else {

      if (this.purInvoiceDTsList[i].price > 0) {
        var price = parseFloat(this.purInvoiceDTsList[i].price);
        this.purInvoiceDTsList[i].price = price.toFixed(this.decimalPlaces);
      }

      if (isNaN(this.purInvoiceDTsList[i].qty) || isNaN(this.purInvoiceDTsList[i].price)) {
        // Handle invalid input gracefully
        return;
      }

      for (let index = 0; index < this.purInvoiceDTsList.length; index++) {
        this.purInvoiceDTsList[index].priceWithTax = Number(this.purInvoiceDTsList[index].price) +
          (this.purInvoiceDTsList[index].price * (this.purInvoiceDTsList[index].taxPerc / 100))
      }
      // Calculate total
      const qty = this.purInvoiceDTsList[i].qty;
      var total = qty * this.purInvoiceDTsList[i].price;
      this.purInvoiceDTsList[i].total = total.toFixed(this.decimalPlaces);

      var taxAmt = parseFloat(this.purInvoiceDTsList[i].taxAmt);
      this.purInvoiceDTsList[i].taxAmt = taxAmt.toFixed(this.decimalPlaces);

      var discountAmt = parseFloat(this.purInvoiceDTsList[i].discountAmt);
      this.purInvoiceDTsList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);


      // Calculate net total
      if (isNaN(this.purInvoiceDTsList[i].discountPerc)) {

        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - Number(this.purInvoiceDTsList[i].taxAmt));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);

      }
      else if (isNaN(this.purInvoiceDTsList[i].taxAmt)) {
        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - (Number(this.purInvoiceDTsList[i].discountAmt)));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);
      }
      else {
        this.purInvoiceDTsList[i].netTotal =
          ((Number(this.purInvoiceDTsList[i].total) + Number(this.purInvoiceDTsList[i].taxAmt)) - Number(this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);

      }
      // Calculate tax amount
      if (isNaN(this.purInvoiceDTsList[i].discountAmt)) {
        this.purInvoiceDTsList[i].taxAmt = ((this.purInvoiceDTsList[i].taxPerc / 100) * (this.purInvoiceDTsList[i].total));
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);

      }
      else if (this.purInvoiceDTsList[i].taxPerc > 0) {
        this.purInvoiceDTsList[i].taxAmt = ((this.purInvoiceDTsList[i].taxPerc / 100) * (this.purInvoiceDTsList[i].total - this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);
      }
      else {
        return;
      }
      this.purInvoiceDTsList[i].netTotal =
        ((Number(this.purInvoiceDTsList[i].total) + Number(this.purInvoiceDTsList[i].taxAmt)) - Number(this.purInvoiceDTsList[i].discountAmt));
      this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);

    }

  }

  onDiscountChange(i) {
    if (this.purInvoiceDTsList[i].discountPerc !== null && this.purInvoiceDTsList[i].discountPerc !== 0) {
      // Calculate the discount percentage based on discountAmt
      if (this.purInvoiceDTsList[i].total > 0) {
        this.purInvoiceDTsList[i].discountAmt = (this.purInvoiceDTsList[i].discountPerc * this.purInvoiceDTsList[i].total) / 100;
        if (parseFloat(this.purInvoiceDTsList[i].discountAmt) > parseFloat(this.purInvoiceDTsList[i].total)) {
          this.alert.ShowAlert("discountMustBeLess", 'error');
          this.purInvoiceDTsList[i].discountPerc = 0;
          this.purInvoiceDTsList[i].discountAmt = 0;
        }
      }
      else {
        this.purInvoiceDTsList[i].discountAmt = 0
      }
    }
    this.onCheckboxChange(0);
  }

  onDiscountAmtChange(i) {
    if (this.purInvoiceDTsList[i].discountAmt !== null && this.purInvoiceDTsList[i].discountAmt !== 0) {
      // Calculate the discount amount based on discount
      if (this.purInvoiceDTsList[i].total > 0) {
        this.purInvoiceDTsList[i].discountPerc = (this.purInvoiceDTsList[i].discountAmt / this.purInvoiceDTsList[i].total) * 100;
        this.purInvoiceDTsList[i].discountPerc = this.purInvoiceDTsList[i].discountPerc.toFixed(this.decimalPlaces);
        if (parseFloat(this.purInvoiceDTsList[i].discountAmt) > parseFloat(this.purInvoiceDTsList[i].total)) {
          this.alert.ShowAlert("discountMustBeLess", 'error');
          this.purInvoiceDTsList[i].discountPerc = 0;
          this.purInvoiceDTsList[i].discountAmt = 0;
        }
        this.purInvoiceDTsList[i].discountAmt = Number(this.purInvoiceDTsList[i].discountAmt).toFixed(this.decimalPlaces);
      }
      else {
        this.purInvoiceDTsList[i].discountPerc = 0
      }
    }
    this.onCheckboxChange(0);
  }

  onTaxChange(event: any, i: number) {

    const updatedElement = {
      ...this.purInvoiceDTsList[i],
      taxAmt: 0,
      taxPerc: 0
    };
    this.purInvoiceDTsList[i] = updatedElement;
    // Safely get tax value
    const tax = Number(event?.value ?? event ?? 0);

    if (tax === 0) {
      const updatedElement = {
        ...this.purInvoiceDTsList[i],
        taxAmt: 0,
        taxId: 0,
        taxPerc: 0
      };
      this.purInvoiceDTsList[i] = updatedElement;
    }

    this.onCheckboxChange(0);
  }

  isRequierdEx(row: any, index) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
    if (item.hasExpiry) {
      if (this.purInvoiceDTsList[index].expiryDate == "" || this.purInvoiceDTsList[index].expiryDate == null) {
        return true;
      }
    }
    else {
      return false;
    }
  }

  isRequierdBatch(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);

    if (item.hasExpiry) {
      if (row.batchNo == "" || row.batchNo == null) {
        return true;
      }
    }
    else {
      return false;
    }
  }

  isRequierdSerial(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);

    if (item.hasSerial) {
      return false;
    }
    else {
      return true;
    }
  }

  GetAccounts(event, voucherType: number) {
    if (event.currentTarget.checked && voucherType !== 0 && voucherType > 0) {

      this.saleinvoiceService.GetAccounts(voucherType).subscribe(result => {
        if (result) {
          this.purAccId = result.creditAccId;
          this.salesInvoiceAddForm.get("accountId").setValue(result.debitAccId);
          this.salesInvoiceAddForm.get("isCash").setValue(true);
        }
      })
    }
    else {
      this.salesInvoiceAddForm.get("accountId").setValue(0);
      this.salesInvoiceAddForm.get("isCash").setValue(false);
    }

  }

  onChangeUnit(Row, i, type) {
    if (type == true) {
      this.purInvoiceDTsList[i].qty = 0;
      const unitData = this.unitsList[i].find((u: any) => u.id === Row.unitId);
      if (unitData) {
        this.purInvoiceDTsList[i].unitRate = unitData.data3;
        this.purInvoiceDTsList[i].price = unitData.data2;
      }
    }
    // if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
    //   this.saleinvoiceService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {        
    //     this.purInvoiceDTsList[i].unitRate = res;
    //   });
    // }
  }

  onChangeBounsUnit(Row, i) {

    if (Row.bonus > 0 && Row.bonusUnitId != 0) {
      this.purInvoiceDTsList[i].bonus = 0;
    }
    if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
      this.saleinvoiceService.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {

        this.purInvoiceDTsList[i].bonusUnitRate = res;
      });
    }
  }

  clearTotals() {
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.onCheckboxChange(0);
  }

  onStoreChange(event: any, row: any, index: number) {

    this.voucherStoreId = event.value;
    if (this.useStoreInGrid) {
      setTimeout(() => {

        this.purInvoiceDTsList[index].qty = 0;
        this.purInvoiceDTsList[index].price = 0;
        this.purInvoiceDTsList[index].productDate = null;
        this.purInvoiceDTsList[index].expiryDate = null;
        this.purInvoiceDTsList[index].batchNo = "";
        this.purInvoiceDTsList[index].orginalQty = 0;
        this.purInvoiceDTsList[index].newRow = 0;
        this.showRemainQty = false;
        this.cdr.detectChanges();

      });
    }
    else {

      if (this.purInvoiceDTsList.length > 0 && this.oldStoreId > 0) {
        Swal.fire({
          title: this.translateService.instant('AreYouSure?'),
          text: this.translateService.instant('TheTableDataWillBeDeleted!'),
          icon: 'warning',
          confirmButtonColor: '#dc3741',
          showCancelButton: true,
          confirmButtonText: this.translateService.instant('Yes,deleteit!'),
          cancelButtonText: this.translateService.instant('Close'),
        }).then((result) => {
          if (result.value) {
            this.purInvoiceDTsList = [];
            this.oldStoreId = event.value;
            this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {

            this.salesInvoiceAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }
    if (!this.useStoreInGrid) {
      if (this.purInvoiceDTsList.length > 0) {
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
          this.purInvoiceDTsList[i].storeId = event.value;
        }
      }
    }
  }

  GetitemsBySalesOrder(event, id) {

    this.purInvoiceDTsList = [];
    if (this.salesCycle == this.sCycle1) {
      if (event.value !== null || event.value !== 0 || event.value !== undefined) {
        this.saleinvoiceService.GetDeleiveryLists(event.value).subscribe(res => {

          if (res) {
            this.deleiveryList = [];
            this.deleiveryList = res.delieveryVoucherLists.map((item) => ({
              label: item.id,
              value: item.note,
            }));
          }
        })
      }
      else {
        if (id !== null || id !== 0 || id !== undefined) {
          this.saleinvoiceService.GetDeleiveryLists(id).subscribe(res => {

            if (res) {
              this.deleiveryList = [];
              this.deleiveryList = res.delieveryVoucherLists.map((item) => ({
                label: item.id,
                value: item.note,
              }));
            }
          })
        }
      }
    }
    else {
      if (event) {

        this.clearTotals();
        if (event.value !== null || event.value !== 0 || event.value !== undefined) {
          this.saleinvoiceService.getSalesRequestDt(event.value).subscribe(res => {

            if (res) {
              this.disableDetails = true;
              this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
              this.salesInvoiceAddForm.get("paymentTerm").setValue(res.paymentTerm);
              this.salesInvoiceAddForm.get("representId").setValue(res.representId);
              this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
              this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);

              if (this.salesInvoiceAddForm.value.purOrdersIds == "" || this.salesInvoiceAddForm.value.purOrdersIds == null || this.salesInvoiceAddForm.value.purOrdersIds == undefined) {
                this.salesInvoiceAddForm.get("purOrdersIds").setValue(this.voucherNo);
              }

              this.purInvoiceDTsList = res.purchaseInvoiceModelList;

              this.purInvoiceDTsList.forEach(element => {
                element.storeId = res.storeId;
                element.taxId = element.taxId;
              });

              let index = 0;
              this.purInvoiceDTsList.forEach(element => {
                element.total = element.qty * element.price;
              })

              this.purInvoiceDTsList.forEach(element => {
                this.itemsList.forEach(item => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                    this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                    index++;
                  }
                });
              })

              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.purInvoiceDTsList[i].expiryDate = null;
                this.purInvoiceDTsList[i].productDate = null;
                this.purInvoiceDTsList[i].orgQty = res.purchaseInvoiceModelList[i].qty;
                this.purInvoiceDTsList[i].mainBouns = res.purchaseInvoiceModelList[i].bonus * res.purchaseInvoiceModelList[i].bonusUnitRate;
                this.purInvoiceDTsList[i].purOrderId = event.value;
                this.purInvoiceDTsList[i].mainQty = res.purchaseInvoiceModelList[i].qty * res.purchaseInvoiceModelList[i].unitRate;
                const updatedElement = {
                  ...this.purInvoiceDTsList[i],
                  discountAmt: res.purchaseInvoiceModelList[i].discountAmt,
                };
                this.purInvoiceDTsList[i] = updatedElement;
                this.onDiscountAmtChange(i);
              }
              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.onChangeItem(0, this.purInvoiceDTsList[i], i)
              }
              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.onCheckboxChange(0);
                this.onTaxChange(this.purInvoiceDTsList[i].taxId, i);
              }
              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId).subscribe(res => {

                  if (res) {
                    this.purInvoiceDTsList[i].unitRate = res;
                  }
                  if (this.purInvoiceDTsList[i].taxId == 0) {
                    this.purInvoiceDTsList[i].taxAmt = 0;
                  }
                });
              }
              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].bonusUnitId).subscribe(res => {

                  if (res) {
                    this.purInvoiceDTsList[i].bonusUnitRate = res;
                  }
                });
              }
              if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
                this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
              }
              if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
                this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
                this.getDealerAcc(event = res.dealerId);
              }
              if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
                this.salesInvoiceAddForm.get("currencyId").setValue(res.currencyId);
              }
              if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
                this.salesInvoiceAddForm.get("currRate").setValue(res.currRate);
              }
              if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
                this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);
              }
              if (this.salesInvoiceAddForm.value.purOrdersIds == "" || this.salesInvoiceAddForm.value.purOrdersIds == null || this.salesInvoiceAddForm.value.purOrdersIds == undefined) {
                this.salesInvoiceAddForm.get("purOrdersIds").setValue(this.voucherNo);
              }

              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.purInvoiceDTsList[i].unitRate = this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId);
              }
              if (!this.useStoreInGrid) {
                for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                  this.purInvoiceDTsList[i].storeId = res.storeId;
                }
              }
              this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
            }
          })
        }
      }
      else {
        if (id !== null || id !== 0 || id !== undefined) {


          this.saleinvoiceService.getSalesRequestDt(id).subscribe(res => {

            if (res) {

              this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
              this.salesInvoiceAddForm.get("paymentTerm").setValue(res.paymentTerm);
              this.salesInvoiceAddForm.get("representId").setValue(res.representId);
              this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
              if (this.salesInvoiceAddForm.value.purOrdersIds == "" || this.salesInvoiceAddForm.value.purOrdersIds == null || this.salesInvoiceAddForm.value.purOrdersIds == undefined) {
                this.salesInvoiceAddForm.get("purOrdersIds").setValue(this.voucherNo);
              }
              this.purInvoiceDTsList = res.purchaseInvoiceModelList;
              let index = 0;
              this.purInvoiceDTsList.forEach(element => {
                element.total = element.qty * element.price;
              })

              this.purInvoiceDTsList.forEach(element => {
                this.itemsList.forEach(item => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                    this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                    index++;
                  }
                });
              })

              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.purInvoiceDTsList[i].expiryDate = null;
                this.purInvoiceDTsList[i].productDate = null;
                this.purInvoiceDTsList[i].orgQty = res.purchaseInvoiceModelList[i].qty;
                this.purInvoiceDTsList[i].mainBouns = res.purchaseInvoiceModelList[i].bonus * res.purchaseInvoiceModelList[i].bonusUnitRate;
                this.purInvoiceDTsList[i].mainQty = res.purchaseInvoiceModelList[i].qty * res.purchaseInvoiceModelList[i].unitRate;
              }
              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.onChangeItem(0, this.purInvoiceDTsList[i], i)
              }
              for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
                this.onCheckboxChange(0);
              }

              if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
                this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
              }
              if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
                this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
                this.getDealerAcc(event = res.dealerId);
              }
              if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
                this.salesInvoiceAddForm.get("currencyId").setValue(res.currencyId);
              }
              if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
                this.salesInvoiceAddForm.get("currRate").setValue(res.currRate);
              }
              if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
                this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);
              }
              this.salesInvoiceAddForm.get("purOrdersIds").setValue(this.voucherNo);
              //  
              // for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              //   this.purInvoiceDTsList[i].unitRate = this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId);
              // }

              this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
            }
          })
        }
      }
    }




  }

  handleF3Key(event: KeyboardEvent, outputList: any, index: number) {
    if (event.key === 'F3') {
      event.preventDefault(); // prevent the default action of the F3 key
      this.OpenItemsInfoForm(outputList, index);
    }
    else if (event.key === "Backspace") {
      setTimeout(() => {
        if (outputList.qty === 0 || outputList.qty === null || outputList.qty === undefined) {
          outputList.total = 0;
          outputList.total = outputList.total.toFixed(this.decimalPlaces);
        }
      });
    }
    else if (event.key === 'F4') {
      this.CopyRow(outputList, index);
    }
  }

  listofproduct(outputList: any, index: number) {
    this.OpenItemsInfoForm(outputList, index);
  }

  OpenItemsInfoForm(row: any, rowIndex: number) {

    if (this.useStoreInGrid) {
      var store = row.storeId;
    }
    else {
      var store = this.salesInvoiceAddForm.value.storeId;
    }

    let title = this.translateService.instant('ADDITEMSINFO');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemssearchComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',

      data: {
        title: title, itemId: row.itemId, store,
      }
    });


    this.subscription = this.selectedItemsService.selectedItems$.subscribe((items) => {
      this.selectedItems = [];
      this.selectedItems = items;
      this.length = this.purInvoiceDTsList.length;
      if (this.selectedItems.length > 0) {
        if (this.purInvoiceDTsList[rowIndex].qty == null) {
          this.purInvoiceDTsList[rowIndex].qty = 0;
        }
        if (this.purInvoiceDTsList[rowIndex].qty > this.selectedItems[0].qoh) {
          this.alert.ShowAlert("QuantityOfBatchNotEnough", 'error');
          this.purInvoiceDTsList[rowIndex].productDate = null;
          this.purInvoiceDTsList[rowIndex].expiryDate = null;
          this.purInvoiceDTsList[rowIndex].batchNo = null;
          return false;
        }
      }

      this.selectedItems.forEach((element, index) => {
        let emptyRowCount = 0;
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
          if (this.purInvoiceDTsList[i].newRow === 0) {
            emptyRowCount++;
          }
        }
        if (this.selectedItems.length == 1) {
          const element = this.selectedItems[index];
          this.purInvoiceDTsList[rowIndex].itemId = element.id;
          if (element.productDate !== null) {
            this.purInvoiceDTsList[rowIndex].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
          }
          if (element.expiryDate !== null) {
            this.purInvoiceDTsList[rowIndex].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
          }
          this.purInvoiceDTsList[rowIndex].batchNo = element.batchNo;
          this.purInvoiceDTsList[rowIndex].orginalQty = element.qoh;
          this.purInvoiceDTsList[rowIndex].newRow = 1;
          return;
        }
        if (emptyRowCount > 0) {
          const element = this.selectedItems[index];
          this.purInvoiceDTsList[rowIndex].itemId = element.id;
          if (element.productDate !== null) {
            this.purInvoiceDTsList[rowIndex].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
          }
          if (element.expiryDate !== null) {
            this.purInvoiceDTsList[rowIndex].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
          }
          this.purInvoiceDTsList[rowIndex].batchNo = element.batchNo;
          this.purInvoiceDTsList[rowIndex].orginalQty = element.qoh;
          if (this.selectedItems.length > emptyRowCount) {
            this.purInvoiceDTsList[rowIndex].newRow = 1;
          }
        }
        else {
          const existingRow = this.purInvoiceDTsList.find(row => (row.itemId == ""));
          if (existingRow == undefined) {
            const newRow = {
              itemId: element.id,
              productDate: formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
              expiryDate: formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
              batchNo: element.batchNo,
              orginalQty: element.qoh,
              newRow: element.newRow = 1,
            };
            this.purInvoiceDTsList.push(newRow);
            this.length = this.length - 1;
          }
        }


      })


      this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    });

    dialogRef.afterClosed().subscribe(res => {

      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        if (this.purInvoiceDTsList[i].itemId == 0 || this.purInvoiceDTsList[i].itemId == null)
          this.purInvoiceDTsList.splice(i, 1);
      }
      this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
      // Check Batch Quantity If the User Add Same Batch Multi Rows

      if (this.purInvoiceDTsList.length > 1) {
        let totBatchQty = 0;
        let allBatchQty = 0;
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) {

          const Batch = row.batchNo;
          if (Batch !== "" && Batch !== null && Batch !== undefined) {
            if (this.purInvoiceDTsList[i].batchNo == Batch && i != rowIndex) {

              totBatchQty += this.purInvoiceDTsList[i].qty * row.unitRate;
              allBatchQty += this.purInvoiceDTsList[i].qty * row.unitRate;
              if (totBatchQty + (this.purInvoiceDTsList[rowIndex].qty * row.unitRate) > this.purInvoiceDTsList[rowIndex].orginalQty) {
                this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.purInvoiceDTsList[rowIndex].orginalQty - totBatchQty, 'error');
                this.purInvoiceDTsList[rowIndex].productDate = null;
                this.purInvoiceDTsList[rowIndex].expiryDate = null;
                this.purInvoiceDTsList[rowIndex].batchNo = null;
                return false;
              }
            }
          }
        }
      }
      else {
        if (this.purInvoiceDTsList.length > 0) {
          let qtyy = 0;
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            qtyy = (this.purInvoiceDTsList[i].qty * row.unitRate) + (this.purInvoiceDTsList[i].bonus * row.bonusUnitRate);
            if (qtyy > row.orginalQty) {
              this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.purInvoiceDTsList[i].orginalQty, 'error');
              this.purInvoiceDTsList[i].productDate = null;
              this.purInvoiceDTsList[i].expiryDate = null;
              this.purInvoiceDTsList[i].batchNo = null;
            }
          }
        }
      }

      if (res !== null) {
        dialogRef.close();
        this.selectedItemsService.updateSelectedItems([]);
        this.subscription.unsubscribe();
      }
    });
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
    }, 8000);
  }

  async GetItemSerials(row, rowIndex): Promise < void> {

  if(this.disableAll == true) {
  return;
}
let store = 0;
if (this.useStoreInGrid) {
  store = row.storeId;
}
else {
  store = this.salesInvoiceAddForm.value.storeId;
}
try {
  this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
  this.openSerialsPopup(row, rowIndex);
} catch (error) {
  console.error('Error fetching item serials', error);
}

  }

  openSerialsPopup(row: any, rowIndex: number) {
    debugger
    row.firstOpen = row.firstOpen ?? true

    if (this.opType == 'Edit' || this.opType == 'Show') {

      this.tabelData = [];
      if (row.firstOpen == true) {
        for (const SavedSerilas of this.savedSerials.filter(item => item.rowIndex == rowIndex && item.itemId == row.itemId)) {
          this.tabelData.push({
            itemId: SavedSerilas.itemId,
            serialNo: SavedSerilas.serialNo,
            id: SavedSerilas.id,
            rowIndex: SavedSerilas.rowIndex,
            isChecked: true
          });
        }
        for (const serial of this.serialsListss) {
          this.tabelData.push({
            itemId: serial.itemId,
            serialNo: serial.serialNo,
            id: serial.id,
            rowIndex: rowIndex,
            isChecked: false
          });
        }
      }
      else {
        this.tabelData = row.res
      }
    }
    else if (this.salesInvoiceAddForm.value.receiptIds > 0) {
      this.tabelData = [];
      this.serialsListss = [];
      let ser = [];
      for (let i = 0; i < this.savedSerials.length; i++) {
        if (this.savedSerials[i].rowIndex === 0) {
          ser.push(this.savedSerials[i]);
        }
      }
      if (row.firstOpen == true) {
        for (const SavedSerilas of this.savedSerials.filter(item => item.rowIndex == rowIndex && item.itemId == row.itemId)) {
          this.serialsListss.push({
            itemId: SavedSerilas.itemId,
            serialNo: SavedSerilas.serialNo,
            id: SavedSerilas.id,
            rowIndex: SavedSerilas.rowIndex,
            isChecked: false
          });
        }
      }
      else {
        this.tabelData = row.res
      }
    }

    else {
      this.tabelData = [];
      if (row.firstOpen == true) {
        if (this.salesInvoiceAddForm.value.itemsSerialList == null || this.salesInvoiceAddForm.value.itemsSerialList == undefined) {
          this.salesInvoiceAddForm.get("itemsSerialList").setValue([]);
        }
        for (const serial of this.serialsListss) {
          const existingItem = this.salesInvoiceAddForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
          if (!existingItem) {
            this.tabelData.push({
              itemId: serial.itemId,
              serialNo: serial.serialNo,
              id: serial.id,
              rowIndex: rowIndex,
              isChecked: false
            });
          }
        }
      }
      else {
        this.tabelData = row.res;
      }
    }

    var itemName = this.itemsList.find(option => option.id === row.itemId).text;
    let title = this.translateService.instant('itemSequencesForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemserialsformComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        itemName: itemName,
        itemId: row.itemId,
        serials: this.serialsListss,
        qty: (row.qty * row.unitRate) + (row.bonus * row.bonusUnitRate),
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        transList: this.tabelData
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {

          row.res = res;
          var newList = this.salesInvoiceAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.salesInvoiceAddForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })


  }

  GetitemsByDelieveryVoucher(event, id) {

    this.HideSerials = true;

    this.purInvoiceDTsList = [];
    if (event) {
      this.purInvoiceDTsList = [];
      this.clearTotals();
      if (event.value !== null || event.value !== 0 || event.value !== undefined) {
        this.saleinvoiceService.getDeleiveryItemsDt(event.value).subscribe(res => {

          if (res) {
            if (res.storeId !== null && res.storeId !== undefined && res.storeId > 0) {
              this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);
            }
            this.purInvoiceDTsList = res.purchaseInvoiceModelList;
            let index = 0;
            this.purInvoiceDTsList.forEach(element => {
              element.total = element.qty * element.price;
            })

            this.purInvoiceDTsList.forEach(element => {
              this.itemsList.forEach(item => {
                if (item.id === element.itemId) {
                  this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                  this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                  index++;
                }
              });
            })

            if (res.purchaseSerialsModelList !== null && res.purchaseSerialsModelList.length !== 0 && res.purchaseSerialsModelList !== undefined) {
              res.purchaseSerialsModelList.forEach(element => {
                element.id = element.serialId;
              });
              this.salesInvoiceAddForm.get("itemsSerialList").setValue(res.purchaseSerialsModelList);
              this.savedSerials = res.purchaseSerialsModelList;
            }

            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.purInvoiceDTsList[i].expiryDate = formatDate(this.purInvoiceDTsList[i].expiryDate, "yyyy-MM-dd", "en-US");
              this.purInvoiceDTsList[i].productDate = null;
              this.purInvoiceDTsList[i].orgQty = res.purchaseInvoiceModelList[i].qty;
              this.purInvoiceDTsList[i].mainBouns = res.purchaseInvoiceModelList[i].bonus * res.purchaseInvoiceModelList[i].bonusUnitRate;
              this.purInvoiceDTsList[i].purOrderId = event.value;
              this.purInvoiceDTsList[i].mainQty = res.purchaseInvoiceModelList[i].qty * res.purchaseInvoiceModelList[i].unitRate;
            }
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.onChangeItem(0, this.purInvoiceDTsList[i], i)
            }
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.onCheckboxChange(0);
            }
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId).subscribe(res => {

                if (res) {
                  this.purInvoiceDTsList[i].unitRate = res;
                }
              });
            }
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].bonusUnitId).subscribe(res => {

                if (res) {
                  this.purInvoiceDTsList[i].bonusUnitRate = res;
                }
              });
            }
            if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
              this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
            }
            if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
              this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
              this.getDealerAcc(event = res.dealerId);
            }
            if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
              this.salesInvoiceAddForm.get("currencyId").setValue(res.currencyId);
            }
            if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
              this.salesInvoiceAddForm.get("currRate").setValue(res.currRate);
            }
            if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
              this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);
            }

            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.purInvoiceDTsList[i].unitRate = this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId);
            }
            this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
          }
        })
      }
    }
    else {
      if (id !== null || id !== 0 || id !== undefined) {


        this.saleinvoiceService.getSalesRequestDt(id).subscribe(res => {

          if (res) {
            this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
            this.salesInvoiceAddForm.get("paymentTerm").setValue(res.paymentTerm);
            this.salesInvoiceAddForm.get("representId").setValue(res.representId);
            this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
            this.purInvoiceDTsList = res.purchaseInvoiceModelList;
            let index = 0;
            this.purInvoiceDTsList.forEach(element => {
              element.total = element.qty * element.price;
            })

            this.purInvoiceDTsList.forEach(element => {
              this.itemsList.forEach(item => {
                if (item.id === element.itemId) {
                  this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                  this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                  index++;
                }
              });
            })

            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.purInvoiceDTsList[i].expiryDate = null;
              this.purInvoiceDTsList[i].productDate = null;
              this.purInvoiceDTsList[i].orgQty = res.purchaseInvoiceModelList[i].qty;
              this.purInvoiceDTsList[i].mainBouns = res.purchaseInvoiceModelList[i].bonus * res.purchaseInvoiceModelList[i].bonusUnitRate;
              this.purInvoiceDTsList[i].mainQty = res.purchaseInvoiceModelList[i].qty * res.purchaseInvoiceModelList[i].unitRate;
            }
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.onChangeItem(0, this.purInvoiceDTsList[i], i)
            }
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.onCheckboxChange(0);
            }

            if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
              this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
            }
            if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
              this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
              this.getDealerAcc(event = res.dealerId);
            }
            if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
              this.salesInvoiceAddForm.get("currencyId").setValue(res.currencyId);
            }
            if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
              this.salesInvoiceAddForm.get("currRate").setValue(res.currRate);
            }
            if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
              this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);
            }

            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.purInvoiceDTsList[i].unitRate = this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId);
            }

            this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
          }
        })
      }
    }


  }

  GetVoucherTypeSetting(voucherTypeId: number) {

    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != undefined && this.voucherStoreId != null) {
        this.salesInvoiceAddForm.get("storeId").setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.salesInvoiceAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.salesInvoiceAddForm.get("storeId").setValue(0);
      }
    }
  }

  GetItemsByReservationDoc(id: any) {

    this.purInvoiceDTsList = [];
    if (id !== null || id !== 0 || id !== undefined) {
      this.saleinvoiceService.GetSalesInvoiceByReservationVoucher(id).subscribe(res => {

        if (res) {
          this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
          this.salesInvoiceAddForm.get("paymentTerm").setValue(res.paymentTerm);
          this.salesInvoiceAddForm.get("representId").setValue(res.representId);
          this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
          this.purInvoiceDTsList = res.purchaseInvoiceModelList;
          let index = 0;
          this.purInvoiceDTsList.forEach(element => {
            element.total = element.qty * element.price;
          })

          this.purInvoiceDTsList.forEach(element => {
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                index++;
              }
            });
          })

          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.purInvoiceDTsList[i].expiryDate = null;
            this.purInvoiceDTsList[i].productDate = null;
            this.purInvoiceDTsList[i].orgQty = res.purchaseInvoiceModelList[i].qty;
            this.purInvoiceDTsList[i].mainBouns = res.purchaseInvoiceModelList[i].bonus * res.purchaseInvoiceModelList[i].bonusUnitRate;
            this.purInvoiceDTsList[i].mainQty = res.purchaseInvoiceModelList[i].qty * res.purchaseInvoiceModelList[i].unitRate;
          }



          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onChangeItem(0, this.purInvoiceDTsList[i], i)
          }
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }

          if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
            this.salesInvoiceAddForm.get("branchId").setValue(res.branchId);
          }
          if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
            this.salesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
            this.getDealerAcc(event = res.dealerId);
          }
          if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
            this.salesInvoiceAddForm.get("currencyId").setValue(res.currencyId);
          }
          if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
            this.salesInvoiceAddForm.get("currRate").setValue(res.currRate);
          }
          if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
            this.salesInvoiceAddForm.get("storeId").setValue(res.storeId);
          }

          // for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
          //   this.purInvoiceDTsList[i].unitRate = this.invserv.GetUnitRate(this.purInvoiceDTsList[i].itemId, this.purInvoiceDTsList[i].unitId);
          // }

          this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
        }
      })
    }
    return id;
  }

  DeleteSalesInvoice(Id, voucherTypeId, voucherNo) {

    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.saleinvoiceService.DeleteSalesInvoice(Id, voucherTypeId, voucherNo, this.voucherTypeEnum).subscribe((result) => {

          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['SalesInvoices/SalesInvoicesList']);
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.ShowAlert(result.message, 'error');
            }

          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  PrintSalesInvoice(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {
      const reportUrl = `rptSalesInvoiceAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptSalesInvoiceEn?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {

    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.saleinvoiceService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {

        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.salesInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailEntryVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.salesInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailEntryVoucher();
          }
        }
        else {
          this.voucherId = 0;
          this.opType = "Add";
          this.showsave = false;
          this.disapleVoucherType = false;
          this.disableAll = false;
          this.cdr.detectChanges();
          this.clearFormdata();
        }
      })


    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.salesInvoiceAddForm.get("id").setValue(0);
    this.salesInvoiceAddForm.get("invoiceType").setValue(0);
    this.salesInvoiceAddForm.get("accountId").setValue(0);
    this.salesInvoiceAddForm.get("branchId").setValue(0);
    this.salesInvoiceAddForm.get("dealerId").setValue(0);
    this.salesInvoiceAddForm.get("costCenterId").setValue(0);
    this.salesInvoiceAddForm.get("paymentTerm").setValue(0);
    this.salesInvoiceAddForm.get("deliveryPeriod").setValue(0);
    this.salesInvoiceAddForm.get("deliveryTime").setValue(0);
    this.salesInvoiceAddForm.get("referenceNo").setValue('');
    this.salesInvoiceAddForm.get("representId").setValue(0);
    this.salesInvoiceAddForm.get("storeId").setValue(0);
    this.salesInvoiceAddForm.get("referenceDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    // this.salesInvoiceAddForm.get("currencyId").setValue(0);
    // this.salesInvoiceAddForm.get("currRate").setValue(0);
    this.salesInvoiceAddForm.get("note").setValue('');
    this.isCash = 0;
    this.pricewTax = 0;
    this.salesInvoiceAddForm.get("purOrdersIds").setValue(0);
    this.salesInvoiceAddForm.get("receiptIds").setValue(0);
    this.salesInvoiceAddForm.value.purInvoiceDTsList = [];
    this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue([]);
    this.salesInvoiceAddForm.get("itemsSerialList").setValue([]);
    this.salesInvoiceAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.purInvoiceDTsList = [];
    this.clearTotals();

  }

  CopyRow(row, index) {

    let inds = 0;
    if (this.purInvoiceDTsList.length == 1) {
      inds = 1;
    }
    else {
      inds = this.purInvoiceDTsList.length;
    }
    if (this.allowAccRepeat == 61) {
      this.purInvoiceDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: 0,
          unitId: 0,
          qty: 0,
          price: row.price,
          cost: row.cost,
          storeId: row.storeId,
          bonus: 0,
          bonusUnitId: 0,
          bonusUnitRate: 0,
          accountId: row.accountId,
          taxId: row.taxId,
          taxAmt: row.taxAmt,
          taxPerc: row.taxPerc,
          discountPerc: row.discountPerc,
          discountAmt: row.discountAmt,
          priceWithTax: row.priceWithTax,
          expiryDate: "",
          productDate: row.productDate,
          batchNo: "",
          unitRate: 0,
          purOrderId: 0,
          receiptId: 0,
          netTotal: 0,
          total: 0,
          disablebatch: false,
          orgQty: 0,
          mainBouns: 0,
          mainQty: 0,
          index: this.purInvoiceDTsList.length
        });
      this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    }
    else if (this.salesInvoiceAddForm.value.purOrdersIds != 0 || this.salesInvoiceAddForm.value.receiptIds != 0) {
      this.purInvoiceDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          qty: "",
          price: row.price,
          cost: row.cost,
          storeId: row.storeId,
          bonus: "",
          bonusUnitId: 0,
          bonusUnitRate: 0,
          accountId: row.accountId,
          taxId: row.taxId,
          taxAmt: row.taxAmt,
          taxPerc: row.taxPerc,
          discountPerc: row.discountPerc,
          discountAmt: row.discountAmt,
          priceWithTax: row.priceWithTax,
          expiryDate: "",
          productDate: row.productDate,
          batchNo: "",
          unitRate: row.unitRate,
          purOrderId: row.purOrderId,
          receiptId: row.receiptId,
          netTotal: 0,
          total: 0,
          disablebatch: false,
          orgQty: row.orgQty,
          mainBouns: row.mainBouns,
          mainQty: row.mainQty,
          index: this.purInvoiceDTsList.length
        });

    }
    else {
      this.purInvoiceDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          qty: "",
          price: row.price,
          cost: row.cost,
          storeId: row.storeId,
          bonus: "",
          bonusUnitId: 0,
          bonusUnitRate: 0,
          accountId: row.accountId,
          taxId: row.taxId,
          taxAmt: row.taxAmt,
          taxPerc: row.taxPerc,
          discountPerc: row.discountPerc,
          discountAmt: row.discountAmt,
          priceWithTax: row.priceWithTax,
          expiryDate: "",
          productDate: row.productDate,
          batchNo: "",
          unitRate: row.unitRate,
          purOrderId: 0,
          receiptId: 0,
          netTotal: 0,
          total: 0,
          disablebatch: false,
          orgQty: 0,
          mainBouns: 0,
          mainQty: 0,
          index: this.purInvoiceDTsList.length
        });
    }
    this.salesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    setTimeout(() => {
      this.saleinvoiceService.GetItemUintbyItemId(row.itemId).subscribe(res => {
        this.unitsList[inds] = res;
      });
    });

    return false;
  }

  loadLazyOptions(event: any) {

    const { first, last } = event;
    

    // Don't replace the full list; copy and fill only the needed range
    if (!this.itemsList) {
      this.itemsList = [];
    }

    // Make sure the array is large enough
    while (this.itemsList.length < last) {
      this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
  }
  }
