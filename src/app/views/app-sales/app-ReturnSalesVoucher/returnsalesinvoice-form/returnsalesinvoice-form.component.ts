import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { EntryitemsserialsComponent } from 'app/views/general/app-EnterItemsSerial/entryitemsserials.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { ReturnSalesInvoicesService } from '../returnsalesinvoice.service';

import Swal from 'sweetalert2';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-returnsalesinvoice-form',
  templateUrl: './returnsalesinvoice-form.component.html',
  styleUrls: ['./returnsalesinvoice-form.component.scss']
})
export class ReturnsalesinvoiceFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  allowAccRepeat: any;

  ReturnSalesInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  invoiceSerialsList: any[] = [];
  purInvoiceDTsList: any[] = [];
  purExpensesList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  voucherId: any;
  voucherType: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 45;
  isHidden: boolean = false;
  type: any;
  isInputDisabled: boolean = true;
  disableAll: boolean = false;
  //header Lists
  voucherTypeList: any;
  invoiceTypesList: any;
  branchesList: any;
  customersList: any;
  costCenterList: any;
  paymentTermsList: any;
  currencyList: any;
  employeeList: any;

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
  purchaseRequestList: any;
  receiptsList: any;
  isdisabled: boolean = false;
  isCash: number;
  pricewTax: number;
  decimalPlaces: number;
  defaultCurrencyId: number;
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
  orginalSerialList: any;
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
  salesInvoiceList: any;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  UseTax: boolean;
  oldStoreId: any;
  showRemainQty: boolean;
  allowMultiCurrency: boolean;
  disableCurrRate: boolean;
  lang: string;
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  voucherStoreId: number;
  DefaultStoreId: number;
  disableDetails:boolean = false;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private returnService: ReturnSalesInvoicesService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private invserv: InvVoucherService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "Invoice";
    this.disableSave = false;
    this.route.queryParams.subscribe((params: Params) => {
      this.voucherNo = +params['voucher'];
    });
    if (this.voucherNo > 0) {
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }
    else {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }
    }
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
        this.ReturnSalesInvoiceAddForm.get('costCenterId')?.disable();
      }
      else {
        this.disableAll = false;
        this.ReturnSalesInvoiceAddForm.get('costCenterId')?.enable();
      }
    });
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ReturnSalesInvoice/ReturnSalesInvoiceList']);
    }
    this.ReturnInvoicerForm();
    this.GetInitailReturnInvoice();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReturnSalesInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  ReturnInvoicerForm() {
    this.ReturnSalesInvoiceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      invoiceType: [0],
      branchId: [null],
      dealerId: [0],
      invoiceId: [0],
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
      storeId: [0],
      note: [""],
      amount: [0],
      status: [null],
      userId: [0],
      representId: [0],
      purOrdersIds: [""],
      receiptIds: [""],
      accountId: [0, [Validators.required, Validators.min(1)]],
      purchaseInvoiceModelList: [null, [Validators.required, Validators.minLength(1)]],
      purchaseExpensesModelList: [null],
      itemsSerialList: [null],
      generalAttachModelList: [null],
      returnReason: [null]
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailReturnInvoice() {
    var lang = this.jwtAuth.getLang();
    this.returnService.GetInitailReturnSalesInvoice(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ReturnSalesInvoice/ReturnSalesInvoiceList']);
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

      debugger
      this.salesInvoiceList = result.salesInvoiceList.map((item) => ({
        label: item.id,
        value: item.note,
      }));


      this.itemsList = result.itemsList.map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial
      }));

      this.customersList = result.customersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));

      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      // this.customersList = result.customersList;
      this.employeeList = result.employeeList;
      this.accountsList = result.accountsList;
      this.costCenterList = result.costCentersList;
      this.taxesList = result.taxModelList;
      this.paymentTermsList = result.paymentTermsList;
      this.invoiceTypesList = result.invoiceTypesList;
      //this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.itemsUnitList = result.unitsList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;
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

      debugger

      if (result.invoiceSerialsModelList.length > 0 && result.invoiceSerialsModelList != null) {
        this.invoiceSerialsList = result.invoiceSerialsModelList;
      }

      debugger

      if (result.purchaseInvoiceModelList !== undefined && result.purchaseInvoiceModelList !== null && result.purchaseInvoiceModelList.length > 0) {
        let index = 0;
        this.purInvoiceDTsList = result.purchaseInvoiceModelList;
        if (this.opType == 'Copy') {
          this.purInvoiceDTsList.forEach(element => {
            element.id = 0;
          })
        }
        this.purInvoiceDTsList.forEach(element => {
          debugger
          element.total = element.qty * element.price;
        })

        this.purInvoiceDTsList.forEach(element => {
          debugger
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
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.purInvoiceDTsList[i].expiryDate = formatDate(this.purInvoiceDTsList[i].expiryDate, "yyyy-MM-dd", "en-US");
        this.purInvoiceDTsList[i].productDate = formatDate(this.purInvoiceDTsList[i].productDate, "yyyy-MM-dd", "en-US");
      }
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onChangeItem(0, this.purInvoiceDTsList[i], i)
      }

      this.ReturnSalesInvoiceAddForm.patchValue(result);
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
      if (this.opType !== 'Copy') {
        if (result.purchaseSerialsModelList !== null && result.purchaseSerialsModelList.length !== 0 && result.purchaseSerialsModelList !== undefined) {
          this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue(result.purchaseSerialsModelList);
        }
      }
      else {
        this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue([]);
      }


      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ReturnSalesInvoiceAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if (this.voucherNo > 0) {
        this.ReturnSalesInvoiceAddForm.get("purOrdersIds").setValue(this.voucherNo);
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.ReturnSalesInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ReturnSalesInvoiceAddForm.get("invoiceType").setValue(result.invoiceType);
          this.ReturnSalesInvoiceAddForm.get("accountId").setValue(result.accountId);
          this.ReturnSalesInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.ReturnSalesInvoiceAddForm.get("dealerId").setValue(result.dealerId);
          this.ReturnSalesInvoiceAddForm.get("costCenterId").setValue(result.costCenterId);
          this.ReturnSalesInvoiceAddForm.get("paymentTerm").setValue(result.paymentTerm);
          this.ReturnSalesInvoiceAddForm.get("deliveryPeriod").setValue(result.deliveryPeriod);
          this.ReturnSalesInvoiceAddForm.get("deliveryTime").setValue(result.deliveryTime);
          this.ReturnSalesInvoiceAddForm.get("referenceNo").setValue(result.referenceNo);
          this.ReturnSalesInvoiceAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          this.ReturnSalesInvoiceAddForm.get("representId").setValue(result.representId);
          this.ReturnSalesInvoiceAddForm.get("invoiceId").setValue(result.invoiceId);

          this.decimalPlaces = result.currencyList.find(option => option.id === result.currencyId).data2;
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }
          if (!this.useStoreInGrid) {
            this.ReturnSalesInvoiceAddForm.get("storeId").setValue(result.storeId);
          }
          this.ReturnSalesInvoiceAddForm.get("note").setValue(result.note);

          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ReturnSalesInvoiceAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.ReturnSalesInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          //var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.ReturnSalesInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.ReturnSalesInvoiceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          if (this.ReturnSalesInvoiceAddForm.value.currencyId == 0) {
            this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.ReturnSalesInvoiceAddForm.get("currRate").setValue(currRate);
          }
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ReturnSalesInvoiceAddForm.get("branchId").setValue(defaultBranche.id);
          }
          this.ReturnSalesInvoiceAddForm.get("representId").setValue(0);
          this.ReturnSalesInvoiceAddForm.get("dealerId").setValue(0);
          this.ReturnSalesInvoiceAddForm.get("costCenterId").setValue(0);
          this.ReturnSalesInvoiceAddForm.get("paymentTerm").setValue(0);
          this.ReturnSalesInvoiceAddForm.get("storeId").setValue(0);
          this.DefaultStoreId = result.defaultStoreId;
        }
        this.GetVoucherTypeSetting(this.ReturnSalesInvoiceAddForm.value.voucherTypeId);
        if (this.ReturnSalesInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    if (this.isCash == 0) {
      if (this.ReturnSalesInvoiceAddForm.value.dealerId == 0) {
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
      element.i = i.toString();
    }

    if (this.useStoreInGrid == true) {
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        const element = this.purInvoiceDTsList[i];
        if (element.storeId == 0 || element.storeId == null || element.storeId == undefined) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }
    else {
      if (this.ReturnSalesInvoiceAddForm.value.storeId == 0 || this.ReturnSalesInvoiceAddForm.value.storeId == null || this.ReturnSalesInvoiceAddForm.value.storeId == undefined) {
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
    // Check Expenses Fields 
    if (this.purExpensesList.length > 0) {
      for (let i = 0; i < this.purExpensesList.length; i++) {
        const element = this.purExpensesList[i];
        if (element.expensesTypeId == 0 || element.transDate == "" || element.amount == 0 || element.debitAccId == 0 || element.creditAccId == 0) {
          this.alert.ShowAlert("msgEnterAllDataExpenses", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }
    // End Expenses
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

      if (this.useSerial == true) {
        if (item.hasSerial) {
          if (this.ReturnSalesInvoiceAddForm.value.itemsSerialList == null || this.ReturnSalesInvoiceAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          const checkedItemCount = this.ReturnSalesInvoiceAddForm.value.itemsSerialList.reduce((count, item) => {
            if (item.rowIndex === index) {
              return count + 1;
            }
            return count;
          }, 0);
          debugger
          if (checkedItemCount !== (element.qty * element.unitRate) + (element.bonus * element.bonusUnitRate)) {
            this.alert.RemainimgQty("CantSaveQtyEntryNotEqualForItem", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          const item1 = this.ReturnSalesInvoiceAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.rowIndex === index);
          if (!item1) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
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

    debugger
    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
      var IsTaxable = this.customersList.find(x => x.id === this.ReturnSalesInvoiceAddForm.value.dealerId).IsTaxable;
      if (IsTaxable == true && this.purInvoiceDTsList[i].taxId == 0) {
        this.alert.ShowAlert("msgMustSelectTaxForDealer", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }
    this.ReturnSalesInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ReturnSalesInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.ReturnSalesInvoiceAddForm.value.voucherNo = this.ReturnSalesInvoiceAddForm.value.voucherNo.toString();
    this.ReturnSalesInvoiceAddForm.value.purchaseInvoiceModelList = this.purInvoiceDTsList;
    this.ReturnSalesInvoiceAddForm.get("amount").setValue(parseFloat(this.fNetTotal));
    this.ReturnSalesInvoiceAddForm.get("status").setValue(0);
    this.ReturnSalesInvoiceAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.returnService.SaveReturnSalesInvoice(this.ReturnSalesInvoiceAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.ReturnSalesInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintReturnedSalesInvoice(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ReturnSalesInvoice/ReturnSalesInvoiceList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  ClearAfterSave() {
    debugger
    this.ReturnSalesInvoiceAddForm.get("costCenterId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("currRate").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("note").setValue("");
    this.ReturnSalesInvoiceAddForm.get("invoiceId").setValue(0);
    this.fTotal = 0;
    this.fDiscount = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.ReturnSalesInvoiceAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ReturnSalesInvoiceAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    this.clearFormdata();
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.ReturnSalesInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.ReturnSalesInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.ReturnSalesInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.returnService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.ReturnSalesInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.ReturnSalesInvoiceAddForm.get("voucherNo").setValue(1);
        }
      });
    }
    debugger
    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.ReturnSalesInvoiceAddForm.get("branchId").setValue(branchId);
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
      this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.ReturnSalesInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.ReturnSalesInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.ReturnSalesInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.ReturnSalesInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
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
      this.ReturnSalesInvoiceAddForm.get("currRate").setValue(currRate);
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
      this.ReturnSalesInvoiceAddForm.get("currRate").setValue(currRate);
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
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.ReturnSalesInvoiceAddForm.value.invoiceId === 0 || this.ReturnSalesInvoiceAddForm.value.invoiceId === null) {
      this.returnService.GetAccounts(voucherType).subscribe(result => {
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
  }

  AddNewLineDetails() {
    debugger
    if (this.purInvoiceDTsList == null) {
      this.purInvoiceDTsList = [];
    }
    if (!this.useStoreInGrid) {
      if (this.ReturnSalesInvoiceAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
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
        mainQty: 0,
        mainBouns: 0,
        index: ""
      });
    this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);


  }

  toggleIncludeCost(event, index) {
    this.purExpensesList[index].affectCost = event.currentTarget.checked;
  }

  calculateSum() {
    var amount = "0"
    amount = this.formatCurrency(this.purInvoiceDTsList.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)) - (parseFloat(item.discountAmt)) + parseFloat(item.taxAmt), 0));
    return parseFloat(amount);
  }

  deleteRow(rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.purInvoiceDTsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
      if (this.ReturnSalesInvoiceAddForm.value.itemsSerialList != null && this.ReturnSalesInvoiceAddForm.value.itemsSerialList != undefined) {
        if (this.ReturnSalesInvoiceAddForm.value.itemsSerialList.length > 0) {
          let indexToRemove = this.ReturnSalesInvoiceAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
          if (indexToRemove !== -1) {
            this.ReturnSalesInvoiceAddForm.value.itemsSerialList.splice(indexToRemove, 1);
          }
        }
        this.ReturnSalesInvoiceAddForm.value.itemsSerialList.forEach(element => {
          if (element.rowIndex !== 0) {
            element.rowIndex = element.rowIndex - 1;
          }
        });
      }

    }

    this.purInvoiceDTsList.splice(rowIndex, 1);
    this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    this.clearTotals();
    debugger
    this.onCheckboxChange(0);
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
      mainQty: 0,
      mainBouns: 0,
      index: ""
    };

    this.purInvoiceDTsList.splice(rowIndex, 0, newRow);
    this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
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
    if (event == 0) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.returnService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          this.unitsList[i] = res;
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
              return;
            }
            if (this.purInvoiceDTsList[i].unitId != 0) {
              this.purInvoiceDTsList[i].unitId = Row.unitId;
            }
          }
          if (Row.bonus == 0 || Row.bonus == null) {
            this.bounsunitsList[i] = [];
          }
          else {
            this.bounsunitsList[i] = res;
          }
        });
      }

      // this.onChangeUnit(this.purInvoiceDTsList[i], i);

    }
    else {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serialsListss = [];
        this.purInvoiceDTsList[i].qty = "";
        this.purInvoiceDTsList[i].price = "";
        this.purInvoiceDTsList[i].priceWithTax = 0;
        this.purInvoiceDTsList[i].taxAmt = 0;
        this.purInvoiceDTsList[i].cost = 0;
        // this.purInvoiceDTsList[i].storeId=0;
        this.purInvoiceDTsList[i].bonus = "";
        this.purInvoiceDTsList[i].bonusUnitId = 0;
        this.purInvoiceDTsList[i].bonusUnitRate = 0;
        this.purInvoiceDTsList[i].taxId = 0;
        this.purInvoiceDTsList[i].taxPerc = 0;
        this.purInvoiceDTsList[i].discountPerc = "";
        this.purInvoiceDTsList[i].expiryDate = "";
        this.purInvoiceDTsList[i].productDate = "";
        this.purInvoiceDTsList[i].batchNo = "";
        this.purInvoiceDTsList[i].unitRate = 0;
        this.purInvoiceDTsList[i].discountAmt = "";
        this.purInvoiceDTsList[i].netTotal = 0;
        this.purInvoiceDTsList[i].total = 0;
        this.purInvoiceDTsList[i].orginalQty = 0;
        this.purInvoiceDTsList[i].newRow = 0;
        this.purInvoiceDTsList[i].unitId = 0;
        if (event.value > 0) {
          this.returnService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
            this.unitsList[i] = res;
            if (res.length == 2) {
              this.purInvoiceDTsList[i].unitId = res[1].id;
              this.purInvoiceDTsList[i].unitRate = res[1].data3;

            }
            if (res.length > 2) {
              this.purInvoiceDTsList[i].unitId = 0;
            }
            if (Row.bonus == 0 || Row.bonus == null) {
              this.bounsunitsList[i] = [];
            }
            else {
              this.bounsunitsList[i] = res;
            }
          });



          debugger
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
  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    if (row.qty < 0) {
    this.alert.RemainimgQty("CantAddValueLessThanZero", row.qty, 'error')
    row.qty = 0 
    return
  }
    if (this.ReturnSalesInvoiceAddForm.value.invoiceId != 0 && this.ReturnSalesInvoiceAddForm.value.invoiceId != null) {
      if (row.qty > (row.mainQty - row.orginalQty)) {
        const updatedElement = { ...this.purInvoiceDTsList[Index], qty: row.mainQty };
        this.purInvoiceDTsList[Index] = updatedElement;
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainQty, 'error');
      }
    }
    debugger
    if (this.ReturnSalesInvoiceAddForm.value.purOrdersIds > 0 || this.ReturnSalesInvoiceAddForm.value.receiptIds > 0) {
      if (Number((row.qty * row.unitRate)) > (row.mainQty)) {
        const updatedElement = { ...this.purInvoiceDTsList[Index], qty: row.orgQty };
        this.purInvoiceDTsList[Index] = updatedElement;
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.orgQty, 'error');
        return false;
      }
    }
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    this.onCheckboxChange(0);
  }

  onChangeBouns(event, row, index) {
    debugger
    if (this.ReturnSalesInvoiceAddForm.value.invoiceId > 0) {
      if (row.bonusUnitRate == 0 || row.bonusUnitRate == null) {
        const updatedElement = { row, bonusUnitRate: 1 };
        row.bonusUnitRate = updatedElement;
      }
      if (Number((row.bonus * row.bonusUnitRate.bonusUnitRate)) > (row.mainBouns)) {
        const updatedElement = { ...this.purInvoiceDTsList[index], bonus: row.mainBouns };
        this.purInvoiceDTsList[index] = updatedElement;
        this.bounsunitsList[index] = [];
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainBouns, 'error');
        return false;
      }
    }
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any, index) {
    if (row.price !== null && row.price !== undefined) {
      row.price = Number(row.price).toFixed(this.decimalPlaces);
      row.total = Number(row.total).toFixed(this.decimalPlaces);
    }
    this.onCheckboxChange(0);
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  onCheckboxChange(event) {
    var i = 0;
    if (event !== 0) {
      if (event.currentTarget.checked) {
        this.ReturnSalesInvoiceAddForm.get("priceWithTax").setValue(true);
      }
      else {
        this.ReturnSalesInvoiceAddForm.get("priceWithTax").setValue(false);
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
  }

  calculateValues(i) {
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    if (this.purInvoiceDTsList.length > 0 && this.purInvoiceDTsList[i].taxId > 0)
      this.purInvoiceDTsList[i].taxPerc = this.taxesList.find(option => option.id === this.purInvoiceDTsList[i].taxId).data1;
    debugger;
    if (this.pricewTax == 1) {
      if (isNaN(this.purInvoiceDTsList[i].qty) || isNaN(this.purInvoiceDTsList[i].price)) {
        return;
      }
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
        return;
      }
      debugger
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

  onStoreChange(event: any, row: any, index: number) {
    debugger
    if (this.useStoreInGrid) {
      setTimeout(() => {
        // if (row.qty > 0) {
        this.purInvoiceDTsList[index].qty = 0;
        this.purInvoiceDTsList[index].price = 0;
        this.purInvoiceDTsList[index].productDate = null;
        this.purInvoiceDTsList[index].expiryDate = null;
        this.purInvoiceDTsList[index].batchNo = "";
        this.purInvoiceDTsList[index].orginalQty = 0;
        this.purInvoiceDTsList[index].newRow = 0;
        this.showRemainQty = false;
        this.cdr.detectChanges();
        // }

      });
    }
    else {
      debugger
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
            this.ReturnSalesInvoiceAddForm.get("invVouchersDTModelList").setValue(this.purInvoiceDTsList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            debugger
            this.ReturnSalesInvoiceAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }

  }

  onDiscountChange(i) {
    debugger
    if (this.purInvoiceDTsList[i].discountPerc !== null || this.purInvoiceDTsList[i].discountPerc !== 0) {
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
    if (this.purInvoiceDTsList[i].discountAmt !== null || this.purInvoiceDTsList[i].discountAmt !== 0) {
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

  onTaxChange(event, i) {
    debugger
    if (event.value == 0) {
      this.purInvoiceDTsList.forEach(element => {
        element.taxAmt = 0;
        element.taxPerc = 0;
      });
    }
    this.onCheckboxChange(0);
  }

  isRequierdEx(row: any, index) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
    if (item.hasExpiry && this.purInvoiceDTsList[index].expiryDate == "" || this.purInvoiceDTsList[index].expiryDate == null) {
      return true;
    }
    else {
      return false;
    }
  }

  isRequierdBatch(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);

    if (item.hasExpiry && row.batchNo == "" || row.batchNo == null) {
      return true;
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

      this.returnService.GetAccounts(voucherType).subscribe(result => {
        if (result) {
          this.purAccId = result.creditAccId;
          this.ReturnSalesInvoiceAddForm.get("accountId").setValue(result.debitAccId);
          this.ReturnSalesInvoiceAddForm.get("isCash").setValue(true);
        }
      })
    }
    else {
      this.ReturnSalesInvoiceAddForm.get("accountId").setValue(0);
      this.ReturnSalesInvoiceAddForm.get("isCash").setValue(false);
    }

  }

  getDealerAcc(event) {
    if (this.isCash == 0) {
      if (event.value) {
        var acc = this.customersList.find(option => option.id === event.value).data2;
        this.ReturnSalesInvoiceAddForm.get("accountId").setValue(acc);
      }
      else {
        if (event) {
          var acc = this.customersList.find(option => option.id === event).data2;
          this.ReturnSalesInvoiceAddForm.get("accountId").setValue(acc);
        }
      }
    }
  }

  onChangeUnit(Row, i) {
    debugger
    if (Row.qty > 0) {
      this.purInvoiceDTsList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.returnService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.purInvoiceDTsList[i].unitRate = res;
      });
    }
  }

  onChangeBounsUnit(Row, i) {
    if (Row.bonus > 0) {
      if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
        this.returnService.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {
          this.purInvoiceDTsList[i].bonusUnitRate = res;
        });
      }
    }

  }

  openSerialsPopup(row: any, rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }

    if (this.isRequierdSerial(row) == true) {
      return
    }
    row.firstOpen = row.firstOpen ?? true
    if (this.ReturnSalesInvoiceAddForm.value.itemsSerialList === null) {
      this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue([]);
    }
    this.serialsListss = this.ReturnSalesInvoiceAddForm.value.itemsSerialList.filter(item => item.itemId == row.itemId && item.rowIndex == rowIndex);
    debugger
    if (this.opType == 'Edit') {
      if (row.qty != this.serialsListss.length) {
        this.orginalSerialList = this.invoiceSerialsList.filter(item => item.itemId == row.itemId && item.rowIndex == rowIndex);
      }
      else {
        this.orginalSerialList = this.serialsListss;
      }
    }
    else {
      if (this.orginalSerialList == undefined || this.orginalSerialList == null) {
        this.orginalSerialList = [];
      }
      else {
        if (this.ReturnSalesInvoiceAddForm.value.invoiceId !== '' && this.ReturnSalesInvoiceAddForm.value.invoiceId !== null) {
          this.orginalSerialList = this.serialsListss.filter(item => item.itemId == row.itemId && item.rowIndex == rowIndex);
        }
      }
    }

    var itemName = this.itemsList.find(option => option.id === row.itemId).text;
    let title = this.translateService.instant('itemSequencesForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(EntryitemsserialsComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        itemName: itemName,
        itemId: row.itemId,
        serials: this.serialsListss,
        qty: (row.qty * this.ReturnSalesInvoiceAddForm.value.currRate) + (row.bonus * row.bonusUnitRate),
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        transList: this.tabelData,
        storeId: row.storeId,
        invoice: this.ReturnSalesInvoiceAddForm.value.invoiceId,
        type: 1,
        firstOpen: row.firstOpen,
        orginalserialTransList: [...this.orginalSerialList],
        bill: this.ReturnSalesInvoiceAddForm.value.invoiceId,
        kind: this.opType,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        debugger
        if (res !== null) {
          row.res = res;
          var newList = this.ReturnSalesInvoiceAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })

  }

  clearTotals() {
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.onCheckboxChange(0);
  }

  calculateSumExp() {
    return this.formatCurrency(this.purExpensesList.reduce((sum, item) => sum + parseFloat(item.amount), 0));
  }

  CheckIfAllowEditBatch(row, index) {
    if ((row.batchNo !== '' || row.batchNo !== null || row.batchNo !== undefined) && row.itemId !== 0 || row.itemId !== null) {
      this.returnService.GetAllowEditBatch(row.batchNo, row.itemId).subscribe(result => {
        if (result) {
          this.purInvoiceDTsList[index].disablebatch = true;
          this.alert.ShowAlert("CantEditBatchHaveTransactions", 'error');
        }
        else {
          this.purInvoiceDTsList[index].disablebatch = false;
        }
      })
    }

  }

  GetSaleInvoices(event) {
    debugger
    this.purInvoiceDTsList = [];
    this.clearTotals();
    if (event.value !== null && event.value !== 0 && event.value !== undefined) {

      this.returnService.GetItemsBySalesInvoice(event.value).subscribe(res => {
        debugger
        if (res) {
          debugger
          this.disableDetails = true;

          res.purchaseInvoiceModelList.forEach(element => {
            if (element.price > 0) {
              var price = parseFloat(element.price);
              element.price = price.toFixed(this.decimalPlaces);
            }
          });


          this.purInvoiceDTsList = res.purchaseInvoiceModelList;
          this.orginalSerialList = res.invoiceSerialsModelList;

          let index = 0;
          this.purInvoiceDTsList.forEach(element => {
            element.expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            element.productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            element.total = element.qty * element.price;
          })
          if (res.purchaseSerialsModelList !== null && res.purchaseSerialsModelList.length !== 0 && res.purchaseSerialsModelList !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue(res.purchaseSerialsModelList);
          }
          else {
            this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue([]);
          }
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
            this.onChangeItem(0, this.purInvoiceDTsList[i], i)
          }
          debugger
          for (let i = 0; i < res.purchaseInvoiceModelList.length; i++) {
            let id = res.purchaseInvoiceModelList[i].id;
            this.purInvoiceDTsList[i].invVoucherDTID = id;
            this.purInvoiceDTsList[i].orgQty = res.purchaseInvoiceModelList[i].qty;
            this.purInvoiceDTsList[i].mainQty = res.purchaseInvoiceModelList[i].qty;
            this.purInvoiceDTsList[i].bouns = res.purchaseInvoiceModelList[i].bouns ?? 0;
            this.purInvoiceDTsList[i].mainBouns = res.purchaseInvoiceModelList[i].bonus ?? 0;
            this.purInvoiceDTsList[i].id = 0;
          }
          if (res.isCash) {
            this.isCash = 1;
            this.ReturnSalesInvoiceAddForm.get("isCash").setValue(true);
          }
          else {
            this.isCash = 0;
            this.ReturnSalesInvoiceAddForm.get("isCash").setValue(false);
          }
          if (res.priceWithTax) {
            this.pricewTax = 1;
          }
          else {
            this.pricewTax = 0;
          }
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }
          debugger
          if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("branchId").setValue(res.branchId);
          }
          if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("dealerId").setValue(res.dealerId);
          }
          if (res.costCenterId !== null && res.costCenterId !== 0 && res.costCenterId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("costCenterId").setValue(res.costCenterId);
          }
          if (res.referenceNo !== null && res.referenceNo !== 0 && res.referenceNo !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("referenceNo").setValue(res.referenceNo);
          }
          if (res.referenceDate !== null && res.referenceDate !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("referenceDate").setValue(formatDate(res.referenceDate, "yyyy-MM-dd", "en-US"));
          }
          if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("currencyId").setValue(res.currencyId);
          }
          if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("currRate").setValue(res.currRate);
          }
          if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("storeId").setValue(res.storeId);
          }
          if (res.note !== null && res.note !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("note").setValue(res.note);
          }
          if (res.amount !== null && res.amount !== 0 && res.amount !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("amount").setValue(res.amount);
          }
          if (res.accountId !== null && res.accountId !== 0 && res.accountId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("accountId").setValue(res.accountId);
          }
          if (res.paymentTerm !== null && res.paymentTerm !== 0 && res.paymentTerm !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("paymentTerm").setValue(res.paymentTerm);
          }
          if (res.representId !== null && res.representId !== 0 && res.representId !== undefined) {
            this.ReturnSalesInvoiceAddForm.get("representId").setValue(res.representId);
          }
          this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
        }
      })
    }
    else
      {
        this.disableDetails=false;
      }
  }

  GetBounsUnitsItem(event, Row, i) {
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
    }
    if (Row.bonus == 0 || Row.bonus == null) {
      this.bounsunitsList[i] = [];
    }
    if (Row.itemId !== 0 && Row.itemId !== null) {
      if (Row.bonus != 0 || Row.bonus != null) {
        this.returnService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          this.bounsunitsList[i] = res;
          this.onChangeBouns(0, Row, i);
        });
      }
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != undefined && this.voucherStoreId != null) {
        this.ReturnSalesInvoiceAddForm.get("storeId").setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.ReturnSalesInvoiceAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.ReturnSalesInvoiceAddForm.get("storeId").setValue(0);
      }
    }
  }

  PrintReturnedSalesInvoice(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {
      const reportUrl = `rptReturnedSalesInvoiceAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptReturnedSalesInvoiceEN?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.returnService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.ReturnSalesInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.disableAll = false;
            this.showsave = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailReturnInvoice();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.ReturnSalesInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailReturnInvoice();
          }
        }
        else {
          this.voucherId = 0;
          this.opType = "Add";
          this.disableAll = false;
          this.disapleVoucherType = false;
          this.showsave = false;
          this.cdr.detectChanges();
          this.clearFormdata();
        }
      })


    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.ReturnSalesInvoiceAddForm.get("id").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("invoiceType").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("accountId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("branchId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("dealerId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("costCenterId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("paymentTerm").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("deliveryPeriod").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("deliveryTime").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("referenceNo").setValue('');
    this.ReturnSalesInvoiceAddForm.get("representId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("storeId").setValue(0);
    this.ReturnSalesInvoiceAddForm.get("referenceDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ReturnSalesInvoiceAddForm.get("note").setValue('');
    this.isCash = 0;
    this.pricewTax = 0;
    this.ReturnSalesInvoiceAddForm.get("invoiceId").setValue(0);
    this.ReturnSalesInvoiceAddForm.value.purInvoiceDTsList = [];
    this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue([]);
    this.ReturnSalesInvoiceAddForm.get("itemsSerialList").setValue([]);
    this.ReturnSalesInvoiceAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.purInvoiceDTsList = [];
    this.clearTotals();

  }

  CopyRow(row, index) {
    debugger

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
          qty: row.qty,
          price: row.price,
          cost: row.cost,
          storeId: row.storeId,
          bonus: row.bonus,
          bonusUnitId: row.bonusUnitId,
          bonusUnitRate: row.bonusUnitRate,
          accountId: row.accountId,
          taxId: row.taxId,
          taxAmt: row.taxAmt,
          taxPerc: row.taxPerc,
          discountPerc: row.discountPerc,
          discountAmt: row.discountAmt,
          priceWithTax: row.priceWithTax,
          expiryDate: row.expiryDate,
          productDate: row.productDate,
          batchNo: "",
          unitRate: 0,
          purOrderId: 0,
          receiptId: 0,
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          orgQty: 0,
          mainQty: 0,
          mainBouns: 0,
          index: ""
        });
      this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    }
    else {
      this.purInvoiceDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          qty: row.qty,
          price: row.price,
          cost: row.cost,
          storeId: row.storeId,
          bonus: row.bonus,
          bonusUnitId: row.bonusUnitId,
          bonusUnitRate: row.bonusUnitRate,
          accountId: row.accountId,
          taxId: row.taxId,
          taxAmt: row.taxAmt,
          taxPerc: row.taxPerc,
          discountPerc: row.discountPerc,
          discountAmt: row.discountAmt,
          priceWithTax: row.priceWithTax,
          expiryDate: row.expiryDate,
          productDate: row.productDate,
          batchNo: "",
          unitRate: row.unitRate,
          purOrderId: 0,
          receiptId: 0,
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          orgQty: 0,
          mainQty: 0,
          mainBouns: 0,
          index: ""
        });
      this.ReturnSalesInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    }
    setTimeout(() => {
      this.returnService.GetItemUnitbyItemId(row.itemId).subscribe(res => {
        this.unitsList[inds] = res;
        this.bounsunitsList[inds] = res;
      });
    });
    this.onCheckboxChange(0);
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }

  loadLazyOptions(event: any) {
    debugger
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
