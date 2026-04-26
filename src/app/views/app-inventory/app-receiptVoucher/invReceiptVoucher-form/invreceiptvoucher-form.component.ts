import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { ReceiptStockVoucherService } from '../receiptVoucher.service';
import { EntryitemsserialsComponent } from 'app/views/general/app-EnterItemsSerial/entryitemsserials.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-invreceiptvoucher-form',
  templateUrl: './invreceiptvoucher-form.component.html',
  styleUrls: ['./invreceiptvoucher-form.component.scss']
})
export class InvreceiptvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  oldStoreId: any;
  ReceiptItemsAddForm: FormGroup = new FormGroup({});
  public TitlePage: string ='';
  tabelData: any[]= [];
  loading: boolean = false;
  opType: string = '';
  showsave: boolean = false;
  invDtlList: any[] = [];
  purchaseInvoicesList: any;
  receiptExpensesModelList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string = '';
  isExistAccNo: boolean = true;
  voucherId: any;
  voucherType: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 38;
  categoryId: number = 0;
  disableSerials: boolean = false;
  disableAll: boolean = false;
  //header Lists
  voucherTypeList: any;
  branchesList: any;
  suppliersList: any;
  costCenterList: any;
  currencyList: any;
  //
  reqPurInvoice: number = 0;
  purchaseInvoices: number = 0;
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
  //
  purchaseRequestList: any;
  isdisabled: boolean = false;
  decimalPlaces: number = 0;
  // General Inventory Settings
  costingMethod: number = 0;
  defaultStoreId: number = 0;
  inventoryType: number = 0;
  useAccountInGrid: boolean = false;
  useBatch: boolean = false;
  useCostCenter: boolean = false;
  useExpiryDate: boolean = false;
  useProductDate: boolean = false;
  useSerial: boolean = false;
  useStoreInGrid: boolean = false;
  serialsListss: any;
  hideExpenses: boolean = false;
  //End
  expensese: number = 0;
  fTotal: any;
  fTaxTotal: any;
  fNetTotal: any;
  fDiscount: any;
  fTotalGridNet: any;
  purAccId: number = 0;
  batchExDisabled = true;
  oldQty: number = 0;
  voucherNo: number = 0;
  // Invoice Cycle Setting 
  salesCycle: number = 0;
  sCycle1: number = 0;
  sCycle2: number = 0;
  sCycle3: number = 0;
  sCycle4: number = 0;
  sCycle5: number = 0;
  sCycle6: number = 0;
  purchaseCucleCycle: number = 0;
  pCycle1: number = 0;
  pCycle2: number = 0;
  pCycle3: number = 0;
  pCycle4: number = 0;
  hideGetFromPurchaseOrder: boolean = false;
  hideGetFromPurchaseInvoice: boolean = false;
  //End
  defaultCurrencyId: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowCreditAccId: number = 0;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number = 0;
  //End
  showRemainQty: boolean = false;
  allowMultiCurrency: boolean = false;
  allowAccRepeat: any;
  disableExp: boolean = false;
  disableBatch: boolean = false;
  disableSerial: boolean = false;
  disableCurrRate: boolean = false;
  Lang: string ='';
  disableSave: boolean = false;
  disapleVoucherType: boolean = false;
  LinkingCreditAccounts: number = 0;
  DefaultStoreId: number = 0;
  InvertoryType: number = 0;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly alert: sweetalert,
      private readonly receiptService: ReceiptStockVoucherService,
      private readonly translateService: TranslateService,
      public router: Router,
      private readonly formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private readonly http: HttpClient,
      private readonly appCommonserviceService: AppCommonserviceService,
      private readonly dialog: MatDialog,
      private readonly route: ActivatedRoute,
      private readonly cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "Inventory";
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

    if (this.opType == "Show") {
      this.disableAll = true;
    }
    else {
      this.disableAll = false;
    }

    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ReceiptItemsVoucher/ReceiptItemsVoucherList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('InvreceiptvoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.ReceiptItemsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      dealerId: [0],
      costCenterId: [0],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      priceWithTax: [0],
      storeId: [0],
      note: [""],
      amount: [0],
      status: [null],
      userId: [0],
      purOrdersIds: [""],
      purinvoiceIds: [""],
      accountId: [0],
      invVouchersDTModelList: [null, [Validators.required, Validators.minLength(1)]],
      itemsSerialList: [null],
      receiptExpensesModelList: [null],
      generalAttachModelList: [null],
      refVoucherTypeId: [0],
      refVoucherId: [0],
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
    this.receiptService.GetInitailReceiptItemsVoucher(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
      debugger
      // this.ReceiptItemsAddForm.get("accountId").disable();
      if (result.isSuccess === false || result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", "error");
        this.router.navigate(['ReceiptItemsVoucher/ReceiptItemsVoucherList']);
        return
      }


      if (this.opType == 'Copy') {
        const currentDate = new Date().toISOString().split('T')[0];
        result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US")
      }
      else {
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      }
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item:any) => ({
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
        creditAccountId: item.creditAccId,
        debitAccountId: item.debitAccId,
        printAfterSave: item.printAfterSave
      }));

      this.itemsList = result.itemsList.map((item:any) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial,
        debitAcc: item.data1,
        taxId:item.taxId
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

      this.hideGetFromPurchaseInvoice = true;
      if (this.purchaseCucleCycle == this.pCycle1) {
        this.hideGetFromPurchaseOrder = false;
      }
      else if (this.purchaseCucleCycle == this.pCycle2) {
        this.hideGetFromPurchaseOrder = true;
      }
      else if (this.purchaseCucleCycle == this.pCycle3) {
        this.hideGetFromPurchaseOrder = true;
      }
      else if (this.purchaseCucleCycle == this.pCycle4) {
        this.hideGetFromPurchaseOrder = true;
      }
      this.purchaseRequestList = result.purchaseOrderList.map((item:any) => ({
        label: item.id,
        value: item.note,
        voucherTypeId: item.voucherTypeId,
      }));
      this.purchaseInvoicesList = result.purchaseInvoicesList.map((item:any) => ({
        label: item.id,
        value: item.note,
        voucherTypeId: item.voucherTypeId,
        categoryId: item.accountId,
      }));

      this.branchesList = result.usersCompanyModels;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find((option:any) => option.id === result.defaultCurrency)?.data2;
      this.suppliersList = result.suppliersList;
      this.accountsList = result.accountList;
      this.costCenterList = result.costCenterList;
      this.taxesList = result.taxModelList;
      // this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.itemsUnitList = result.unitsList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.hideExpenses = result.hideExpenses;
      this.expensesTypeList = result.expensesList.map((item:any) => ({
        label: item.id,
        value: lang == 'ar' ? item.expensesNameA : item.expensesNameE,
      }));
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null && result.invVouchersDTModelList.length > 0) {

        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        if (this.opType == 'Copy') {
          this.invDtlList.forEach(element => {
            element.id = 0;
          })
        }
        this.invDtlList.forEach(element => {
          element.total = element.qty * element.price;
        })

        this.invDtlList.forEach(element => {
          debugger
          this.itemsList.forEach((item:any) => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter((unit:any) => unit.id == element.unitId);
              this.bounsunitsList[index] = this.allUntiesList.filter((unit:any) => unit.id == element.bonusUnitId);
              index++;
            }
          });
        })

      }
      else {
        this.invDtlList = [];
      }
      if (result.receiptExpensesModelList === undefined || result.receiptExpensesModelList === null || result.receiptExpensesModelList.length == 0) {
        this.receiptExpensesModelList = [];
      }
      else {
        this.receiptExpensesModelList = result.receiptExpensesModelList;
        this.receiptExpensesModelList.forEach((element:any) => {
          element.transDate = formatDate(element.transDate, "yyyy-MM-dd", "en-US");
        });
        this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue(this.receiptExpensesModelList);
      }
      for (let i = 0; i < this.invDtlList.length; i++) {
        this.invDtlList[i].expiryDate = formatDate(this.invDtlList[i].expiryDate, "yyyy-MM-dd", "en-US");
        this.invDtlList[i].productDate = formatDate(this.invDtlList[i].productDate, "yyyy-MM-dd", "en-US");
      }
      for (let i = 0; i < this.invDtlList.length; i++) {
        this.onChangeItem(0, this.invDtlList[i], i)
      }

      this.ReceiptItemsAddForm.patchValue(result);
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
      // this.useStoreInGrid = result.useStoreInGrid;
      this.oldStoreId = 0;
      //End
      this.purAccId = 0;
      if (this.opType !== 'Copy') {
        if (result.itemsSerialList !== null && result.itemsSerialList.length !== 0 && result.itemsSerialList !== undefined) {
          this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue(result.itemsSerialList);
        }
      }
      else {
        this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue([]);
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ReceiptItemsAddForm.get("generalAttachModelList")?.setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.isdisabled = false;
        this.disableSave = false;

        /*         if (this.useAccountInGrid == true) {
                  this.invDtlList.forEach(element => {
                    element.accountId = element.accountId;
                  });
                } */
        if (this.voucherId > 0) {
          debugger
          this.ReceiptItemsAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.ReceiptItemsAddForm.get("accountId")?.setValue(result.accountId);
          this.ReceiptItemsAddForm.get("branchId")?.setValue(result.branchId);
          this.ReceiptItemsAddForm.get("dealerId")?.setValue(result.dealerId);
          this.invDtlList.forEach(element => {
            this.ReceiptItemsAddForm.get("costCenterId")?.setValue(element.costCenterId);
          });
          this.ReceiptItemsAddForm.get("refVoucherId")?.setValue(result.refVoucherId);
          this.ReceiptItemsAddForm.get("currencyId")?.setValue(result.currencyId);
          this.decimalPlaces = result.currencyList.find((option:any) => option.id === result.currencyId).data2;
          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onCheckboxChange(0);
          }
          if (!this.useStoreInGrid) {
            this.ReceiptItemsAddForm.get("storeId")?.setValue(result.storeId);
          }
          this.ReceiptItemsAddForm.get("note")?.setValue(result.note);
          debugger
          var exist = false;
          this.purchaseRequestList.forEach((element: any) => {
            if (element.voucherTypeId == this.ReceiptItemsAddForm.value.refVoucherTypeId) {
              exist = true;
            }
          });
          if (exist) {
            this.reqPurInvoice = this.ReceiptItemsAddForm.value.refVoucherId;
          }
          else {
            this.purchaseInvoices = this.ReceiptItemsAddForm.value.refVoucherId;
          }

          this.useCostCenter = result.useCostCenter;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ReceiptItemsAddForm.get("currencyId")?.setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ReceiptItemsAddForm.get("branchId")?.setValue(result.branchId);
          }

        }
        else {
          this.ReceiptItemsAddForm.get("branchId")?.setValue(result.defaultBranchId);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ReceiptItemsAddForm.get("currencyId")?.setValue(defaultCurrency.id);
            this.ReceiptItemsAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ReceiptItemsAddForm.get("branchId")?.setValue(defaultBranche.id);
          }
          debugger
          var defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true)?.id ?? 0;
          this.ReceiptItemsAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          if (this.ReceiptItemsAddForm.value.currencyId == 0) {
            this.ReceiptItemsAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option: any)  => option.id === this.defaultCurrencyId).data1;
            this.ReceiptItemsAddForm.get("currRate")?.setValue(currRate);
          }
          this.ReceiptItemsAddForm.get("dealerId")?.setValue(0);
          this.ReceiptItemsAddForm.get("costCenterId")?.setValue(0);
          this.ReceiptItemsAddForm.get("storeId")?.setValue(0);
          this.DefaultStoreId = result.defaultStoreId;
          this.InvertoryType = result.invertoryType;



          // ......... Credit Account .........//
          this.LinkingCreditAccounts = result.creditAccountId;
          if (this.useAccountInGrid == true) {
            if (result.creditAccountId > 0) {
              this.invDtlList.forEach(element => {
                element.accountId = result.creditAccountId;
              });
            }
            else {
              this.allowCreditAccId = this.voucherTypeList.find((option: any) => option.label === this.ReceiptItemsAddForm.value.voucherTypeId).creditAccountId;
              if (this.opType == 'Add') {
                if (this.allowCreditAccId > 0 && this.allowCreditAccId != null) {
                  this.invDtlList.forEach(element => {
                    element.accountId = this.allowCreditAccId;
                  });
                }
              }
            }
          }
          else {
            if (result.creditAccountId > 0) {
              this.ReceiptItemsAddForm.get("accountId")?.setValue(result.creditAccountId);
            }
            else {
              this.allowCreditAccId = this.voucherTypeList.find((option: any) => option.label === this.ReceiptItemsAddForm.value.voucherTypeId).creditAccountId;
              if (this.opType == 'Add') {
                if (this.allowCreditAccId > 0 && this.allowCreditAccId != null) {
                  this.ReceiptItemsAddForm.get('accountId')?.setValue(this.allowCreditAccId);
                }
              }
            }
          }

          // ......... Credit Account .........//


        }
        this.GetVoucherTypeSetting(this.ReceiptItemsAddForm.value.voucherTypeId);
        if (this.ReceiptItemsAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });

      debugger
      if (this.voucherNo > 0) {
        this.GetPurchaseOrder(0, this.voucherNo);
      }
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    if (this.invDtlList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    if (this.inventoryType === 124 &&
      (!this.ReceiptItemsAddForm.value.accountId ||
        this.ReceiptItemsAddForm.value.accountId === 0)
    ) {
      this.alert.ShowAlert("MustEnterCreditAccount", 'error');
      this.disableSave = false;
      return false;
    }


    for (let i = 0; i < this.invDtlList.length; i++) {
      const element = this.invDtlList[i];
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.price == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (element.bonus > 0 && element.bonusUnitId == 0) {
        this.alert.ShowAlert("PleaseInsertBounsUnit", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (this.useStoreInGrid == true) {
        if (element.storeId == 0 || element.storeId == null || element.storeId == undefined) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }
      if (this.useAccountInGrid == true) {
        if ((element.debitAccountId == 0 || element.debitAccountId == null || element.debitAccountId == undefined)) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }
      element.i = i.toString();
      element.cost = element.price;
    }
    if (this.useStoreInGrid == false) {
      if (this.ReceiptItemsAddForm.value.storeId == 0 || this.ReceiptItemsAddForm.value.storeId == null || this.ReceiptItemsAddForm.value.storeId == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }

      this.invDtlList.forEach(element => {
        if (element.storeId == null) {
          element.storeId = 0;
        }
      });
    }
    if (!this.useAccountInGrid) {
      if (this.ReceiptItemsAddForm.value.accountId == 0 || this.ReceiptItemsAddForm.value.accountId == null || this.ReceiptItemsAddForm.value.accountId == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }

    // special Validation 

    for (let index = 0; index < this.invDtlList.length; index++) {
      const element = this.invDtlList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find((it: any) => it.id === itemId);

      if (!item) {
        continue;
      }
      if (this.useExpiryDate == true) {
        if (item.hasExpiry) {
          if (element.expiryDate == "") {
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
          if (this.ReceiptItemsAddForm.value.itemsSerialList == null || this.ReceiptItemsAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          const checkedItemCount = this.ReceiptItemsAddForm.value.itemsSerialList.reduce((count: number, item: any) => {
            if (item.rowIndex === index) {
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

          const item1 = this.ReceiptItemsAddForm.value.itemsSerialList.find((item: any) => item.itemId === itemId && item.rowIndex === index);
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
    this.invDtlList.forEach(element => {
      if (element.bonusUnitId == null) {
        element.bonusUnitId = 0;
      }
    })
    this.ReceiptItemsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ReceiptItemsAddForm.value.accountId = this.ReceiptItemsAddForm.get("accountId")?.value;
    this.ReceiptItemsAddForm.value.userId = this.jwtAuth.getUserId();
    this.ReceiptItemsAddForm.value.voucherNo = this.ReceiptItemsAddForm.value.voucherNo.toString();
    this.ReceiptItemsAddForm.value.invVouchersDTModelList = this.invDtlList;
    const totalSum = this.invDtlList.reduce((acc, curr) => acc + parseFloat(curr.netTotal), 0);
    this.ReceiptItemsAddForm.value.amount = totalSum;
    //this.ReceiptItemsAddForm.get("storeId")?.setValue(0);
    this.ReceiptItemsAddForm.value.status = 0;
    if (this.reqPurInvoice > 0) {
      this.ReceiptItemsAddForm.value.refVoucherId = this.reqPurInvoice;
    }
    else if (this.purchaseInvoices > 0) {
      this.ReceiptItemsAddForm.value.refVoucherId = this.purchaseInvoices;
    }
    debugger
    this.ReceiptItemsAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.ReceiptItemsAddForm.value.receiptExpensesModelList = this.receiptExpensesModelList;
    debugger
    this.receiptService.SaveReceiptItemsVoucher(this.ReceiptItemsAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option: any) => option.label === this.ReceiptItemsAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintInvreceiptvoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ReceiptItemsVoucher/ReceiptItemsVoucherList']);
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
    this.ReceiptItemsAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.fTotal ='';
    this.fTaxTotal='';
    this.fNetTotal='';
    this.GetVoucherTypeSetting(this.ReceiptItemsAddForm.value.voucherTypeId);
  }

  onStoreChange(event: any, row: any, index: number) {
    debugger
    if (this.useStoreInGrid) {
        // if (row.qty > 0) {
        this.invDtlList[index].qty = 0;
        this.invDtlList[index].price = 0;
        this.invDtlList[index].productDate = null;
        this.invDtlList[index].expiryDate = null;
        this.invDtlList[index].batchNo = "";
        this.invDtlList[index].orginalQty = 0;
        this.invDtlList[index].newRow = 0;
        this.showRemainQty = false;
        this.cdr.detectChanges();
    }
    else {
      debugger
      if (this.invDtlList.length > 0 && this.oldStoreId > 0) {
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
            this.invDtlList = [];
            this.oldStoreId = event.value;
            this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            debugger
            this.ReceiptItemsAddForm.get("storeId")?.setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }

  }

  getVoucherNo(event: any) {
    debugger
    //this.invDtlList = [];
    this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    const selectedValue = event.value === undefined ? event : event.value;
    const serialType = this.voucherTypeList.find((option: any) => option.label === selectedValue).serialType;
    const currencyId = this.voucherTypeList.find((option: any) => option.label === selectedValue).currencyId;
    let branchId = this.voucherTypeList.find((option: any) => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find((option: any) => option.label === selectedValue).allowAccRepeat;
    const voucherCategory = this.voucherTypeEnum;
    const voucherTypeId = this.ReceiptItemsAddForm.value.voucherTypeId;
    const date = new Date(this.ReceiptItemsAddForm.value.voucherDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const creditAccountId = this.voucherTypeList.find((option: any) => option.label === selectedValue).creditAccountId;


    if (voucherTypeId > 0) {
      this.receiptService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          debugger
          this.ReceiptItemsAddForm.get("voucherNo")?.setValue(results);
          // this.ReceiptItemsAddForm.get("accountId")?.setValue(creditAccountId);
        }
        else {
          this.ReceiptItemsAddForm.get("voucherNo")?.setValue(1);
        }
        //         
      });
    }
    debugger
    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.ReceiptItemsAddForm.get("branchId")?.setValue(branchId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.decimalPlaces = this.currencyList.find((option: any) => option.id === currencyId).data2;
    }
    else {
      this.decimalPlaces = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data2;
    }
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.ReceiptItemsAddForm.get("currencyId")?.setValue(currencyId);
      var currRate = this.currencyList.find((option: any) => option.id === currencyId).data1;
      this.ReceiptItemsAddForm.get("currRate")?.setValue(currRate);
      if (this.ReceiptItemsAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.ReceiptItemsAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data1;
      this.ReceiptItemsAddForm.get("currRate")?.setValue(currRate);
      if (this.ReceiptItemsAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find((option: any) => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find((option: any) => option.id === selectedValue).data2;
    this.decimalPlaces = this.currencyList.find((option: any) => option.id === selectedValue).data2;
    this.ReceiptItemsAddForm.get("currRate")?.setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
    for (let i = 0; i < this.invDtlList.length; i++) {
      debugger
      this.onCheckboxChange(0);
    }
  }

  getaccountId(voucherType : any, type: number, index: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }

    // ......... Credit Account .........//

    if (this.LinkingCreditAccounts > 0) {
      this.purAccId = this.LinkingCreditAccounts;
    }
    else {
      var selectedValue = this.ReceiptItemsAddForm.get('voucherTypeId')?.value;
      this.purAccId = this.voucherTypeList.find((option: any) => option.label === selectedValue).creditAccountId;
    }

    // ......... Credit Account .........//


    if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
      return;
    }
    if (type == 1) {
      this.AddNewLineDetails();
    }
    else {
      this.onAddRowBefore(index);
    }
  }

  AddNewLineDetails() {

    if (this.invDtlList == null) {
      this.invDtlList = [];
    }
    if (!this.useStoreInGrid) {
      if (this.ReceiptItemsAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
    }
    this.invDtlList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: "",
        price: "",
        cost: "",
        storeId: this.voucherStoreId,
        bonus: "",
        bonusUnitId: 0,
        bonusUnitRate: 0,
        accountId: this.purAccId,
        taxId: 0,
        taxPerc: 0,
        discount: "",
        expiryDate: "",
        productDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
        batchNo: "",
        unitRate: 0,
        purOrderId: 0,
        receiptId: 0,
        discountAmt: "",
        taxAmt: 0,
        netTotal: 0,
        total: 0,
        disablebatch: false,
        mainQty: 0,
        mainBouns: 0,
        orgQty: 0,
        disableExp: false,
        disableSerial: false,
        disableBatch: false,
        index: ""
      });

    this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);


  }

  calculateSum() {
    var amount = "0"
    amount = this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + (parseFloat(item.netTotal)), 0));
    return amount;
  }

  deleteRow(rowIndex: number) {
    debugger
    let stopexe = false;
    this.ReceiptItemsAddForm.value.itemsSerialList.forEach((element: any) => {
      if (element.rowIndex == rowIndex && element.serialNo !== null) {
        stopexe = true;
        return;
      }
    });
    if (stopexe) {
      this.alert.ShowAlert("CantDeleteRowTheresSerialsAttachedWithRow", 'error');
      return;
    }
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
      let indexToRemove = this.ReceiptItemsAddForm.value.itemsSerialList.findIndex((element: any) => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.ReceiptItemsAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
    }
    this.ReceiptItemsAddForm.value.itemsSerialList.forEach((element: any) => {
      if (element.rowIndex !== 0) {
        element.rowIndex = element.rowIndex - 1;
      }
    });
    this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    this.clearTotals();
  }

  isEmpty(input:any) {
    return input === '' || input === null;
  }

  isValidVoucherDate(event: any) {

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
    if (!this.useStoreInGrid) {
      if (this.ReceiptItemsAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
    }
    const newRow =
    {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      qty: "",
      price: "",
      cost: "",
      storeId: this.voucherStoreId,
      bonus: "",
      bonusUnitId: 0,
      bonusUnitRate: 0,
      accountId: this.purAccId,
      taxId: 0,
      taxPerc: 0,
      discount: "",
      expiryDate: "",
      productDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
      batchNo: "",
      unitRate: 0,
      purOrderId: 0,
      receiptId: 0,
      discountAmt: "",
      taxAmt: 0,
      netTotal: 0,
      total: 0,
      disablebatch: false,
      mainQty: 0,
      mainBouns: 0,
      orgQty: 0,
      disableExp: false,
      disableSerial: false,
      disableBatch: false,
      index: ""
    };

    this.invDtlList.splice(rowIndex, 0, newRow);
    this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/accountsstatement?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  onChangeItem(event: any, Row: any, i: number) {
    debugger
    if (event.value == undefined) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.receiptService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          debugger
          this.unitsList[i] = res;
          this.bounsunitsList[i] = res;
          if (res.length == 2) {
            this.invDtlList[i].unitId = res[1].id;
          }
          else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
            this.invDtlList[i].unitId = Row.unitId;
          }
          else {
            this.invDtlList[i].unitId = res[0].id;
          }
          this.onChangeUnit(0, this.invDtlList[i], i);

          if (Row.bonus == 0 || Row.bonus == null) {
            this.bounsunitsList[i] = [];
          }
          else {
            this.bounsunitsList[i] = res;
          }
        });
      }
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
        // storeId: 0,
        const updatedElement = {
          ...this.invDtlList[i], qty: "", price: "", cost: "", bonus: "", bonusUnitId: 0, bonusUnitRate: 0, taxId: 0, taxPerc: 0, discount: "",
          expiryDate: "", productDate: "", batchNo: "", unitRate: 0, discountAmt: "", taxAmt: 0, netTotal: 0, total: 0, orginalQty: 0, newRow: 0,
        };
        this.invDtlList[i] = updatedElement;
        this.receiptService.GetItemUnitbyItemId(event.value).subscribe(res => {
          debugger
          this.unitsList[i] = res;
          this.bounsunitsList[i] = res;
          if (res.length == 2) {
            this.invDtlList[i].unitId = res[1].id;
          }
          else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
            this.invDtlList[i].unitId = Row.unitId;
          }
          else {
            this.invDtlList[i].unitId = res[0].id;
          }
          this.onChangeUnit(0, this.invDtlList[i], i);
        });
      }
    }

    debugger
    if (event.value > 0) {
      if (this.invDtlList.length > 0) {
        let isDuplicate = false;
        for (let m = 0; m < this.invDtlList.length; m++) {
          if (this.invDtlList[m].itemId == event.value && m != i) {
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
          this.invDtlList[i] = {
            ...this.invDtlList[i],
            itemId: 0
          };
          this.cdr.detectChanges();
        }
      }
    }


    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find((x: any) => x.id === event.value);

      if (selectedItem && selectedItem.storeId > 0) {
        var defaultStoreNo = selectedItem.storeId;
        this.invDtlList[i].storeId = defaultStoreNo;
        this.cdr.detectChanges();
      }
      else {
        // this.invDtlList[i].storeId = 0;
        this.cdr.detectChanges();
      }
    }
    if (this.useAccountInGrid == true) {
      var selectedItem = this.itemsList.find((x: any) => x.id === Row.itemId);
      if (selectedItem && Number(selectedItem.debitAcc) > 0) {
        this.invDtlList[i].debitAccountId = Number(selectedItem.debitAcc);
      }
    }
debugger
     if(this.opType == 'Add' && Row.taxId == 0)
      {
        let taxId = this.itemsList.find((r: any) => r.id == Row.itemId)?.taxId;
        if(taxId !== null && taxId !== undefined && taxId !== 0)
          {
            this.invDtlList[i].taxId =taxId;
            this.onCheckboxChange(0);
          }
        else
          {
            this.invDtlList[i].taxId =0;
          }
          this.cdr.detectChanges();
      }
    this.disableButtons(Row, i);
  }

  onChangeBouns(event: any, row: any, index: number) {
    debugger
    if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
      if (Number((row.bonus * row.bonusUnitRate)) > (row.mainBouns)) {
        const updatedElement = { ...this.invDtlList[index], bonus: row.mainBouns };
        this.invDtlList[index] = updatedElement;
        var itemName = this.itemsList.find((option: any) => option.id === row.itemId)?.text;

        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error');
        return false;
      }
    }
    else {
      if (row.bonus == 0 || row.bonus == null) {
        this.bounsunitsList[index] = [];
      }
      else {
        this.receiptService.GetItemUnitbyItemId(row.itemId).subscribe(res => {
          debugger
          this.unitsList[index] = res;
          if (row.bonus == 0 || row.bonus == null) {
            this.bounsunitsList[index] = [];
          }
          else {
            this.invDtlList[index].bonusUnitId= 0;
            this.bounsunitsList[index] = res;
            this.cdr.detectChanges();
          }
        });

      }
      //this.onChangeItem(0, row, index);
    }
  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
      if (Number((row.qty * row.unitRate)) > (row.mainQty)) {
        const updatedElement = { ...this.invDtlList[Index], qty: row.orgQty };
        this.invDtlList[Index] = updatedElement;
        var itemName = this.itemsList.find((option: any) => option.id === row.itemId)?.text;
        itemName = itemName + '    ' + 'المتبقي' + '=' + Number(row.mainQty)
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error');
        return false;
      }

    }


    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    this.onCheckboxChange(0);
  }

  OnPriceChange(row: any) {
    debugger
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = this.formatCurrency(row.total);
      // row.total = row.total.toFixed(this.decimalPlaces)
    }
    this.onCheckboxChange(0);
  }

  OnPriceBlur(row: any, index: number) {
    if (row.price !== null && row.price !== undefined) {
      row.price = this.formatCurrency(row.price);
      if (row.qty > 0 && row.price > 0) {
        row.total = row.qty * row.price;
      }
      row.total = this.formatCurrency(row.total);
    }
    this.onCheckboxChange(0);
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  onCheckboxChange(event: any) {
    var i = 0;

    if (event !== 0) {
      if (event.currentTarget.checked) {
        this.ReceiptItemsAddForm.get("priceWithTax")?.setValue(true);
      }
      else {
        this.ReceiptItemsAddForm.get("priceWithTax")?.setValue(false);
      }
    }

    this.invDtlList.forEach(element => {

      if (this.invDtlList[i].discount !== null || this.invDtlList[i].discount !== 0) {
        if (this.invDtlList[i].total > 0) { this.invDtlList[i].discountAmt = (this.invDtlList[i].discount * this.invDtlList[i].total) / 100; }
      }
      else {
        if (this.invDtlList[i].total > 0) { this.invDtlList[i].discount = (this.invDtlList[i].discountAmt / this.invDtlList[i].total) * 100; }
      }

      this.calculateValues(i);
      i++;
    })



    for (let r = 0; r < this.invDtlList.length; r++) {
      // Format specific numeric fields with three decimal places
      this.fTotal = Number((Number(this.fTotal) + Number(this.invDtlList[r].total)));
      this.fTotal = this.fTotal.toFixed(this.decimalPlaces); ///this.formatCurrency( this.fTotal);

      this.fTotalGridNet = Number((Number(this.fTotalGridNet) + Number(this.invDtlList[r].netTotal)));
      // this.allowedDiscount = Number(this.allowedDiscount);
      // this.allowedDiscount = Number(this.formatCurrency(this.allowedDiscount));

      this.fDiscount = Number(parseFloat(this.fDiscount) + parseFloat(this.invDtlList[r].discountAmt));
      this.fDiscount = Number(this.fDiscount).toFixed(this.decimalPlaces);

      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(this.invDtlList[r].taxAmt)));
      this.fTaxTotal = this.fTaxTotal.toFixed(this.decimalPlaces);//this.formatCurrency( this.fTaxTotal);
      // -(Number(this.allowedDiscount))

      this.fNetTotal = Number((Number(this.fTotalGridNet)));
      this.fNetTotal = this.fNetTotal.toFixed(this.decimalPlaces); //this.formatCurrency( this.fNetTotal);
      // You can add more fields here as needed
    }
    // Add your logic here based on the checkbox's state (isChecked).
  }

  calculateValues(i: number) {
    debugger
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    if (this.invDtlList.length > 0 && this.invDtlList[i].taxId > 0) {
      const tax = this.taxesList.find((option: any) => option.id === this.invDtlList[i].taxId);

      if (tax && tax.data1) {
        // Convert to string, trim spaces, and replace Arabic & standard comma decimal separators
        let taxValue = tax.data1.toString().trim().replace(/[٫,]/g, '.');
        let numericTaxValue = Number(taxValue);
        this.invDtlList[i].taxPerc = !isNaN(numericTaxValue) ? numericTaxValue : 0;
      } else {
        this.invDtlList[i].taxPerc = 0;
      }
    }

    if (this.invDtlList[i].price > 0) {
      var price = parseFloat(this.invDtlList[i].price);
      this.invDtlList[i].price = price.toFixed(this.decimalPlaces);
    }
    if (isNaN(this.invDtlList[i].qty) || isNaN(this.invDtlList[i].price)) {
      return;
    }
    for (const element of this.invDtlList) {
      element.priceWithTax = Number(element.price) +
        (element.price * (element.taxPerc / 100))
    }
    // Calculate total
    const qty = this.invDtlList[i].qty;
    let total = qty * this.invDtlList[i].price;
    this.invDtlList[i].total = total.toFixed(this.decimalPlaces);//this.formatCurrency(total);
    let taxAmt = parseFloat(this.invDtlList[i].taxAmt);
    this.invDtlList[i].taxAmt = taxAmt.toFixed(this.decimalPlaces);
    // let discountAmt = parseFloat(this.invDtlList[i].discountAmt);
    // this.invDtlList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);
    // Calculate net total      
    // if (isNaN(this.invDtlList[i].discountPerc)) {
    this.invDtlList[i].netTotal =
      (Number(this.invDtlList[i].total) - Number(this.invDtlList[i].taxAmt));
    this.invDtlList[i].netTotal = this.formatCurrency(this.invDtlList[i].netTotal);//.toFixed(this.decimalPlaces);
    // }  else
    if (isNaN(this.invDtlList[i].taxAmt)) {
      this.invDtlList[i].netTotal =
        (Number(this.invDtlList[i].total)) //- (Number(this.invDtlList[i].discountAmt)));
      this.invDtlList[i].netTotal = this.formatCurrency(this.invDtlList[i].netTotal);//.toFixed(this.decimalPlaces);
    }
    else {
      this.invDtlList[i].netTotal =
        (Number(this.invDtlList[i].total) + Number(this.invDtlList[i].taxAmt)) //- Number(this.invDtlList[i].discountAmt));
      this.invDtlList[i].netTotal = this.formatCurrency(this.invDtlList[i].netTotal);//.toFixed(this.decimalPlaces);
    }
    // Calculate tax amount
    // if (isNaN(this.invDtlList[i].discountAmt)) {
    //   this.invDtlList[i].taxAmt = ((this.invDtlList[i].taxPerc / 100) * (this.invDtlList[i].total));
    //   this.invDtlList[i].taxAmt = this.invDtlList[i].taxAmt.toFixed(this.decimalPlaces);
    // }else
    if (this.invDtlList[i].taxPerc > 0) {
      this.invDtlList[i].taxAmt = ((this.invDtlList[i].taxPerc / 100) * (this.invDtlList[i].total));//- this.invDtlList[i].discountAmt));
      this.invDtlList[i].taxAmt = this.invDtlList[i].taxAmt.toFixed(this.decimalPlaces);
    }
    else {
      this.invDtlList[i].taxAmt = 0;
    }
    this.invDtlList[i].netTotal =
      (Number(this.invDtlList[i].total) + Number(this.invDtlList[i].taxAmt))//- Number(this.invDtlList[i].discountAmt));
    this.invDtlList[i].netTotal = this.formatCurrency(this.invDtlList[i].netTotal);//.toFixed(this.decimalPlaces);

  }

  isRequierdEx(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
    if (item.hasExpiry) {
      if (this.invDtlList[index].expiryDate == "" || this.invDtlList[index].expiryDate == null) {
        return true;
      }
    }
    else {
      return false;
    }
  }

  isRequierdBatch(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);

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
    const item = this.itemsList.find((item: any) => item.id === itemId);

    if (item.hasSerial) {
      return false;
    }
    else {
      return true;
    }
  }

  GetAccounts(event: any, voucherType: number) {

    if (event.currentTarget.checked && voucherType !== 0 && voucherType > 0) {

      this.receiptService.GetAccounts(voucherType).subscribe(result => {

        if (result) {
          this.purAccId = result.creditAccId;
          this.ReceiptItemsAddForm.get("accountId")?.setValue(result.debitAccId);
          // this.ReceiptItemsAddForm.get("isCash")?.setValue(true);
        }
      })
    }
    else {
      this.ReceiptItemsAddForm.get("accountId")?.setValue(0);
      // this.ReceiptItemsAddForm.get("isCash")?.setValue(false);
    }

  }

  getDealerAcc(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    if (selectedValue == 0) {
      this.ReceiptItemsAddForm.get("accountId")?.setValue(0);
      return;
    }
    // if (!this.ReceiptItemsAddForm.get("accountId").value && this.opType == 'Add') {
    if (selectedValue) {
      var acc = this.suppliersList.find((option: any) => option.id === selectedValue).data2;
      this.ReceiptItemsAddForm.get("accountId")?.setValue(acc);
    }
    else {
      if (selectedValue) {
        var acc = this.suppliersList.find((option: any) => option.id === selectedValue).data2;
        this.ReceiptItemsAddForm.get("accountId")?.setValue(acc);
      }
    }
    // }
  }

  onChangeUnit(event: any, Row: any, i: number) {
    debugger
    if (Row.qty > 0 && event > 0) {
      this.invDtlList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.receiptService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        debugger
        this.invDtlList[i].unitRate = res;
      });
    }
  }

  onChangeBounsUnit(Row: any, i: number) {
    if (Row.bonus > 0) {
      if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
        this.receiptService.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {
          this.invDtlList[i].bonusUnitRate = res;
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
    if (this.purchaseInvoices > 0) {
      this.disableSerials = true;
    }
    row.firstOpen = row.firstOpen ?? true
    if (this.ReceiptItemsAddForm.value.itemsSerialList === null) {
      this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue([]);
    }
    this.serialsListss = this.ReceiptItemsAddForm.value.itemsSerialList.filter((item: any) => item.itemId == row.itemId && item.rowIndex == rowIndex);
    var itemName = this.itemsList.find((option: any) => option.id === row.itemId).text;
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
        qty: (row.qty * row.unitRate) + (row.bonus * row.bonusUnitRate),
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        transList: this.tabelData,
        storeId: row.storeId,
        disableSerials: this.disableSerials,
        voucherTypeEnum: this.voucherTypeEnum,
        kind: this.opType,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {

          row.res = res;
          var newList = this.ReceiptItemsAddForm.value.itemsSerialList.filter((item: any) => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue(newList);
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

  CheckIfAllowEditBatch(row: any, index: number) {

    if ((row.batchNo !== '' || row.batchNo !== null || row.batchNo !== undefined) && row.itemId !== 0 || row.itemId !== null) {
      this.receiptService.GetAllowEditBatch(row.batchNo, row.itemId).subscribe(result => {
        if (result) {
          debugger
          this.invDtlList[index].disablebatch = true;
          this.alert.ShowAlert("CantEditBatchHaveTransactions", 'error');
        }
        else {
          this.invDtlList[index].disablebatch = false;
        }
      })
    }

  }

  GetPurchaseOrder(event: any, id: number) {
    debugger
    if (event) {
      this.purchaseInvoices = 0;
      this.ReceiptItemsAddForm.get("dealerId")?.setValue(0);
      this.ReceiptItemsAddForm.get("accountId")?.setValue(0);
      this.invDtlList = [];
      this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue([]);
      this.clearTotals();
      if (event.value !== null && event.value !== 0 && event.value !== undefined) {
        debugger
        var vouchertype = this.purchaseRequestList.find((option: any) => option.label === event.value).voucherTypeId;
        this.ReceiptItemsAddForm.get("refVoucherTypeId")?.setValue(vouchertype);
        this.receiptService.GetItemsByPurchaseOrder(event.value).subscribe(res => {
          debugger
          if (res) {
            this.invDtlList = res.invVouchersDTModelList;
            let index = 0;
            this.invDtlList.forEach(element => {
              element.total = element.qty * element.price;
            });


            this.receiptExpensesModelList = res.purchaseExpensesModelList;
            this.receiptExpensesModelList.forEach((element: any) => {
              element.transDate = formatDate(element.transDate, "yyyy-MM-dd", "en-US");
            });

            const source$ = of(1, 2);
            source$.pipe(delay(0)).subscribe(() => {
              this.invDtlList.forEach(element => {
                this.itemsList.forEach((item: any) => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.unitId);
                    this.bounsunitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.bonusUnitId);
                    index++;
                  }
                });
              })

              for (let i = 0; i < this.invDtlList.length; i++) {
                this.invDtlList[i].expiryDate = null;
                this.invDtlList[i].productDate = null;
                this.invDtlList[i].mainQty = res.invVouchersDTModelList[i].qty * res.invVouchersDTModelList[i].unitRate;
                this.invDtlList[i].mainBouns = res.invVouchersDTModelList[i].bonus * res.invVouchersDTModelList[i].bonusUnitRate;
                this.invDtlList[i].orgQty = res.invVouchersDTModelList[i].qty;
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.onChangeItem(0, this.invDtlList[i], i)
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.onCheckboxChange(0);
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                debugger
                this.isRequierdEx(this.invDtlList[i], i);
                this.isRequierdBatch(this.invDtlList[i]);
              }
              if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
                this.ReceiptItemsAddForm.get("branchId")?.setValue(res.branchId);
              }
              if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
                this.ReceiptItemsAddForm.get("dealerId")?.setValue(res.dealerId);
                this.getDealerAcc(event = res.dealerId);
              }
              if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
                this.ReceiptItemsAddForm.get("currencyId")?.setValue(res.currencyId);
              }
              if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
                this.ReceiptItemsAddForm.get("currRate")?.setValue(res.currRate);
              }
              if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
                this.ReceiptItemsAddForm.get("storeId")?.setValue(res.storeId);
              }
              if (this.LinkingCreditAccounts > 0) {
                this.ReceiptItemsAddForm.get("accountId")?.setValue(this.LinkingCreditAccounts);
                this.invDtlList.forEach(element => {
                  element.accountId = this.LinkingCreditAccounts;
                });
              }
              this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
              this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue(this.receiptExpensesModelList);

            });
          }
        })
      }
    }
    else {
      debugger
      this.purchaseInvoices = 0;
      this.ReceiptItemsAddForm.get("dealerId")?.setValue(0);
      this.ReceiptItemsAddForm.get("accountId")?.setValue(0);
      this.invDtlList = [];
      this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue([]);
      this.clearTotals();
      if (id !== null && id !== 0 && id !== undefined) {
        debugger
        var vouchertype = this.purchaseRequestList.find((option: any) => option.label === id).voucherTypeId;
        this.ReceiptItemsAddForm.get("refVoucherTypeId")?.setValue(vouchertype);
        this.receiptService.GetItemsByPurchaseOrder(id).subscribe(res => {
          debugger
          if (res) {
            this.reqPurInvoice = id;
            this.invDtlList = res.invVouchersDTModelList;
            let index = 0;
            this.invDtlList.forEach(element => {
              element.total = element.qty * element.price;
            });


            this.receiptExpensesModelList = res.purchaseExpensesModelList;
            this.receiptExpensesModelList.forEach((element: any) => {
              element.transDate = formatDate(element.transDate, "yyyy-MM-dd", "en-US");
            });

            this.invDtlList.forEach((element: any) => {
              this.itemsList.forEach((item: any) => {
                if (item.id === element.itemId) {
                  this.unitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.unitId);
                  this.bounsunitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.bonusUnitId);
                  index++;
                }
              });
            })

            for (let i = 0; i < this.invDtlList.length; i++) {
              this.invDtlList[i].expiryDate = null;
              this.invDtlList[i].productDate = null;
              this.invDtlList[i].mainQty = res.invVouchersDTModelList[i].qty * res.invVouchersDTModelList[i].unitRate;
              this.invDtlList[i].mainBouns = res.invVouchersDTModelList[i].bonus * res.invVouchersDTModelList[i].bonusUnitRate;
              this.invDtlList[i].orgQty = res.invVouchersDTModelList[i].qty;
            }
            for (let i = 0; i < this.invDtlList.length; i++) {
              this.onChangeItem(0, this.invDtlList[i], i)
            }
            for (let i = 0; i < this.invDtlList.length; i++) {
              this.onCheckboxChange(0);
            }
            if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
              this.ReceiptItemsAddForm.get("branchId")?.setValue(res.branchId);
            }
            if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
              this.ReceiptItemsAddForm.get("dealerId")?.setValue(res.dealerId);
              this.getDealerAcc(event = res.dealerId);
            }
            if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
              this.ReceiptItemsAddForm.get("currencyId")?.setValue(res.currencyId);
            }
            if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
              this.ReceiptItemsAddForm.get("currRate")?.setValue(res.currRate);
            }
            if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
              this.ReceiptItemsAddForm.get("storeId")?.setValue(res.storeId);
            }
            if (this.LinkingCreditAccounts > 0) {
              this.ReceiptItemsAddForm.get("accountId")?.setValue(this.LinkingCreditAccounts);
              this.invDtlList.forEach(element => {
                element.accountId = this.LinkingCreditAccounts;
              });
            }
            this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
            this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue(this.receiptExpensesModelList);

          }
        })
      }
    }

  }

  GetPurchaseInvoices(event: any) {

    this.reqPurInvoice = 0;
    this.ReceiptItemsAddForm.get("dealerId")?.setValue(0);
    this.ReceiptItemsAddForm.get("accountId")?.setValue(0);
    this.invDtlList = [];
    this.clearTotals();
    if (event.value !== null && event.value !== 0 && event.value !== undefined) {
      var vouchertype = this.purchaseInvoicesList.find((option: any) => option.label === event.value).voucherTypeId;
      this.ReceiptItemsAddForm.get("refVoucherTypeId")?.setValue(vouchertype);

      this.receiptService.GetItemsByPurchaseInvoice(event.value).subscribe(res => {

        if (res) {
          this.invDtlList = res.invVouchersDTModelList;

          let index = 0;
          this.invDtlList.forEach(element => {
            element.expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            element.productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            element.total = element.qty * element.price;
          })
          this.invDtlList.forEach((element: any) => {
            this.itemsList.forEach((item: any) => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.unitId);
                this.bounsunitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.bonusUnitId);
                index++;
              }
            });
          })

          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onChangeItem(0, this.invDtlList[i], i)
          }
          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onCheckboxChange(0);
          }
          debugger
          for (let i = 0; i < res.invVouchersDTModelList.length; i++) {
            let id = res.invVouchersDTModelList[i].id;
            this.invDtlList[i].invVoucherDTID = id;
            this.invDtlList[i].id = 0;
            this.invDtlList[i].mainQty = res.invVouchersDTModelList[i].qty * res.invVouchersDTModelList[i].unitRate;
            this.invDtlList[i].mainBouns = res.invVouchersDTModelList[i].bonus * res.invVouchersDTModelList[i].bonusUnitRate;
          }

          if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
            this.ReceiptItemsAddForm.get("branchId")?.setValue(res.branchId);
          }
          if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
            this.ReceiptItemsAddForm.get("dealerId")?.setValue(res.dealerId);
          }
          if (res.costCenterId !== null && res.costCenterId !== 0 && res.costCenterId !== undefined) {
            this.ReceiptItemsAddForm.get("costCenterId")?.setValue(res.costCenterId);
          }

          if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
            this.ReceiptItemsAddForm.get("currencyId")?.setValue(res.currencyId);
          }
          if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
            this.ReceiptItemsAddForm.get("currRate")?.setValue(res.currRate);
          }
          if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
            this.ReceiptItemsAddForm.get("storeId")?.setValue(res.storeId);
          }
          if (res.note !== null && res.note !== undefined) {
            this.ReceiptItemsAddForm.get("note")?.setValue(res.note);
          }
          if (res.amount !== null && res.amount !== 0 && res.amount !== undefined) {
            this.ReceiptItemsAddForm.get("amount")?.setValue(res.amount);
          }
          debugger
          if (res.accountId !== null && res.accountId !== 0 && res.accountId !== undefined) {
            this.ReceiptItemsAddForm.get("accountId")?.setValue(res.accountId);
          }
          this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);



          if (res.itemsSerialList !== null && res.itemsSerialList.length !== 0 && res.itemsSerialList !== undefined) {
            this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue(res.itemsSerialList);
          }
          else {
            this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue([]);
          }

        }
      })
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).storeId;
    if (!(this.ReceiptItemsAddForm.get('storeId')?.value > 0)) {
      if (this.opType == 'Add') {
        if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
          this.ReceiptItemsAddForm.get('storeId')?.setValue(this.voucherStoreId);
        }
        else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
          this.ReceiptItemsAddForm.get("storeId")?.setValue(this.DefaultStoreId);
        }
        else {
          this.ReceiptItemsAddForm.get("storeId")?.setValue(0);
        }
      }
    }

  }

  disableButtons(row: any, index: number) {
    debugger
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
    if (item.hasExpiry) {
      this.invDtlList[index].disableExp = false;
      this.invDtlList[index].disableBatch = false;
    }
    else {
      this.invDtlList[index].disableExp = true;
      this.invDtlList[index].disableBatch = true;
    }

    if (item.hasSerial) {
      this.invDtlList[index].disableSerial = false;
    }
    else {
      this.invDtlList[index].disableSerial = true;
    }
  }

  PrintInvreceiptvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptReceiptItemsVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptReceiptItemsVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId: number, VoucherNo: string) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.receiptService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.ReceiptItemsAddForm.get("generalAttachModelList")?.setValue([]);
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
            this.ReceiptItemsAddForm.get("generalAttachModelList")?.setValue([]);
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
    this.ReceiptItemsAddForm.get("id")?.setValue(0);
    this.ReceiptItemsAddForm.get("branchId")?.setValue(0);
    this.ReceiptItemsAddForm.get("dealerId")?.setValue(0);
    this.ReceiptItemsAddForm.get("costCenterId")?.setValue(0);
    // this.ReceiptItemsAddForm.get("currencyId")?.setValue(0);
    // this.ReceiptItemsAddForm.get("currRate")?.setValue(0);
    this.ReceiptItemsAddForm.get("storeId")?.setValue(0);
    this.ReceiptItemsAddForm.get("note")?.setValue('');
    this.ReceiptItemsAddForm.get("purOrdersIds")?.setValue('');
    this.ReceiptItemsAddForm.get("purinvoiceIds")?.setValue('');
    // this.ReceiptItemsAddForm.get("accountId")?.setValue(0);
    this.ReceiptItemsAddForm.get("voucherDate")?.setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ReceiptItemsAddForm.get("refVoucherTypeId")?.setValue(0);
    this.ReceiptItemsAddForm.get("refVoucherId")?.setValue(0);
    this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue([]);
    this.ReceiptItemsAddForm.get("itemsSerialList")?.setValue([]);
    this.ReceiptItemsAddForm.get("generalAttachModelList")?.setValue([]);
    this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue([]);
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.receiptExpensesModelList = []
    this.calculateSum();
  }

  CopyRow(row: any, index: number) {
    debugger
    if (this.ReceiptItemsAddForm.value.purOrdersIds > 0 || this.ReceiptItemsAddForm.value.purinvoiceIds > 0) {
      return false;
    }
    if (this.allowAccRepeat == 61) {
      this.invDtlList.push(
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
          taxPerc: row.taxPerc,
          discount: row.discount,
          expiryDate: "",
          productDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
          batchNo: "",
          unitRate: 0,
          purOrderId: 0,
          receiptId: 0,
          discountAmt: row.discountAmt,
          taxAmt: row.taxAmt,
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          mainQty: row.mainQty,
          mainBouns: 0,
          orgQty: 0,
          disableExp: false,
          disableSerial: false,
          disableBatch: false,
          index: ""
        });

      this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    }
    else {
      this.invDtlList.push(
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
          taxPerc: row.taxPerc,
          discount: row.discount,
          expiryDate: "",
          productDate: row.productDate,
          batchNo: "",
          unitRate: row.unitRate,
          purOrderId: 0,
          receiptId: 0,
          discountAmt: row.discountAmt,
          taxAmt: row.taxAmt,
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          mainQty: row.mainQty,
          mainBouns: 0,
          orgQty: 0,
          disableExp: false,
          disableSerial: false,
          disableBatch: false,
          index: ""
        });

      this.ReceiptItemsAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    }

    this.receiptService.GetItemUnitbyItemId(row.itemId).subscribe(res => {
      this.unitsList[index + 1] = res;
      this.bounsunitsList[index + 1] = res;
    });
    this.onChangeUnit(0, row, index + 1)
    this.onChangeBounsUnit(row, index + 1)

    return false;
  }

  handleF3Key(event: KeyboardEvent, row: any, index: number) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
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

  AddNewLineExpenses() {
    if (this.disableAll == true) {
      return;
    }
    if (this.receiptExpensesModelList == null) {
      this.receiptExpensesModelList = [];
    }
    this.receiptExpensesModelList.push(
      {
        id: 0,
        hDId: 0,
        expensesTypeId: 0,
        transDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
        amount: "",
        debitAccId: 0,
        creditAccId: 0,
        note: "",
        affectCost: true,
        index: "",
      });
    this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue(this.receiptExpensesModelList);
  }

  onAddRowBeforeExpenses(rowIndex: number) {
    const newRow =
    {
      id: 0,
      hDId: 0,
      expensesTypeId: 0,
      transDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
      amount: "",
      debitAccId: 0,
      creditAccId: 0,
      note: "",
      affectCost: true,
      index: "",
    };
    this.receiptExpensesModelList.splice(rowIndex, 0, newRow);
    this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue(this.receiptExpensesModelList);
  }

  deleteRowExpenses(rowIndex: number) {
    if (rowIndex !== -1) {
      this.receiptExpensesModelList.splice(rowIndex, 1);
    }
    this.ReceiptItemsAddForm.get("receiptExpensesModelList")?.setValue(this.ReceiptItemsAddForm);
  }

  calculateSumExp() {
    if (this.receiptExpensesModelList) {
      return this.formatCurrency(this.receiptExpensesModelList.reduce((sum: number, item: any) => sum + Number.parseFloat(item.amount), 0));
    }
    else
      return 0;

  }

  GetExpensesAccounts(event: any, rowIndex: number) {
    if (event.value > 0) {
      this.receiptService.getExpensesAccounts(event.value).subscribe(res => {
        if (res) {
          this.receiptExpensesModelList[rowIndex].debitAccId = res.debitAccId;
          this.receiptExpensesModelList[rowIndex].creditAccId = res.creditAccId;
        }
      })
    }
  }

  toggleIncludeCost(event: any, index: number) {
    this.receiptExpensesModelList[index].isValid = event.currentTarget.checked;
    this.receiptExpensesModelList[index].affectCost = event.currentTarget.checked;
  }

  onTaxChange(event: any, i: number) {
    debugger
    if (event.value == 0) {
      const updatedElement = { ...this.invDtlList[i], taxAmt: 0, taxPerc: 0 };
      this.invDtlList[i] = updatedElement;
      this.cdr.detectChanges();
    }
    this.onCheckboxChange(0);
  }

}
