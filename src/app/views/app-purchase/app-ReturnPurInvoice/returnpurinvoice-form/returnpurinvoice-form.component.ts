import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { ReturnPurInvoiceService } from '../returnpurinvoice.service';
import Swal from 'sweetalert2';
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { Subscription, of } from 'rxjs';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { PurchaseService } from '../../purchase-service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-returnpurinvoice-form',
  templateUrl: './returnpurinvoice-form.component.html',
  styleUrls: ['./returnpurinvoice-form.component.scss']
})
export class ReturnpurinvoiceFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  private subscription: Subscription;
  ReturnPurInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  purInvoiceDTsList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  voucherType: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 41;
  showRemainQty: boolean;
  oldStoreId: any;
  selectedItems: any[] = [];
  length: number = 0;
  remainingQty: number;
  savedSerials: any[] = [];
  validSave: boolean;
  // purInvoiceList: any[] = [];
  //header Lists
  voucherTypeList: any;
  invoiceTypesList: any;
  branchesList: any;
  suppliersList: any;
  costCenterList: any;
  paymentTermsList: any;
  currencyList: any;
  //
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
  purchaseInvoicesList: any;
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
  isInputDisabled: boolean = true;
  //End
  expensese: number;
  fTotal: any;
  fTaxTotal: any;
  fNetTotal: any;
  fDiscount: any;
  fTotalGridNet: any;
  purAccId: number = 0;
  batchExDisabled = true;
  disableAll: boolean = false;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  UseTax: boolean;
  defaultCurrencyId: number;
  allowMultiCurrency: boolean;
  allowAccRepeat: any;
  disableCurrRate: boolean;
  disableSave: boolean;
  lang: string;
  disapleVoucherType: boolean = false;
  hideSerials: boolean;
  voucherStoreId: number;
  DefaultStoreId: number;
  disableDetails:boolean = false ;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private returnpurService: ReturnPurInvoiceService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private cdr: ChangeDetectorRef,
      private selectedItemsService: SelectedItemsService,
      private InvService: InvVoucherService,
      private purService: PurchaseService,
    ) { }

  ngOnInit(): void {
    this.voucherType = "Invoice";
    this.disableSave = false;
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;

    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
    }

    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ReturnPurchaseInvoice/ReturnPurInvoiceList']);
    }
    this.InitiailReturnPurInvoiceForm();
    this.GetInitailReturnPurInvoice();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReturnPurInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailReturnPurInvoiceForm() {
    this.ReturnPurInvoiceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      dealerId: [0],
      costCenterId: [0],
      referenceNo: [""],
      invoiceId: [0],
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

  GetInitailReturnPurInvoice() {

    var lang = this.jwtAuth.getLang();
    this.returnpurService.GetInitailPurchaseInvoice(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ReturnPurchaseInvoice/ReturnPurInvoiceList']);
        // this.dialogRef.close(false);
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

      this.suppliersList = result.suppliersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));



      this.purchaseInvoicesList = result.purchaseInvoicesList.map((item) => ({
        label: item.id,
        value: item.note,
      }));
      this.expensesTypeList = result.expensesList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.expensesNameA : item.expensesNameE,
      }));

      this.itemsList = result.itemsList.map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial
      }));

      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;

      if (result.currencyList && result.currencyList.length > 0) {
        const currency = result.currencyList.find(option => option.id === result.defaultCurrency);
        if (currency) {
          this.decimalPlaces = currency.data2;
        } else {
          console.error("No currency found with id:", result.defaultCurrency);
        }
      }
      else {
        console.error("Currency list is empty or undefined.");
      }
      // this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      // this.suppliersList = result.suppliersList;
      this.accountsList = result.accountsList;
      this.costCenterList = result.costCentersList;
      this.taxesList = result.taxModelList;
      this.paymentTermsList = result.paymentTermsList;
      this.invoiceTypesList = result.invoiceTypesList;
      // this.itemsList = result.itemsList;
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
      if (result.purchaseInvoiceModelList !== undefined && result.purchaseInvoiceModelList !== null && result.purchaseInvoiceModelList.length > 0) {

        let index = 0;
        this.purInvoiceDTsList = result.purchaseInvoiceModelList;
        if (this.opType == 'Copy') {
          this.purInvoiceDTsList.forEach(element => {
            element.id = 0;
          })
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

      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.purInvoiceDTsList[i].expiryDate = formatDate(this.purInvoiceDTsList[i].expiryDate, "yyyy-MM-dd", "en-US");
        this.purInvoiceDTsList[i].productDate = formatDate(this.purInvoiceDTsList[i].productDate, "yyyy-MM-dd", "en-US");
      }
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onChangeItem(0, this.purInvoiceDTsList[i], i)
      }

      this.ReturnPurInvoiceAddForm.patchValue(result);
      //General Setting Fill
      this.costingMethod = result.inventoryGeneralSetting.costingMethod;
      this.defaultStoreId = result.inventoryGeneralSetting.defaultStoreId;
      this.inventoryType = result.inventoryGeneralSetting.inventoryType;
      this.useAccountInGrid = result.inventoryGeneralSetting.useAccountInGrid;
      this.useBatch = result.inventoryGeneralSetting.useBatch;
      this.useCostCenter = result.inventoryGeneralSetting.useCostCenter;
      this.useExpiryDate = result.inventoryGeneralSetting.useExpiryDate;
      this.useProductDate = result.inventoryGeneralSetting.useProductDate;
      debugger
      this.useSerial = result.inventoryGeneralSetting.useSerial;
      this.useStoreInGrid = result.inventoryGeneralSetting.useStoreInGrid;
      //End
      this.purAccId = 0;

      if (this.opType !== 'Copy') {
        if (result.purchaseSerialsModelList !== null && result.purchaseSerialsModelList.length !== 0 && result.purchaseSerialsModelList !== undefined) {
          this.ReturnPurInvoiceAddForm.get("itemsSerialList").setValue(result.purchaseSerialsModelList);
          this.savedSerials = result.purchaseSerialsModelList;
        }
        else {
          this.ReturnPurInvoiceAddForm.value.itemsSerialList = [];
        }
      }
      else {
        this.ReturnPurInvoiceAddForm.value.itemsSerialList = [];
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ReturnPurInvoiceAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }
      else {
        this.disapleVoucherType = false;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.ReturnPurInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ReturnPurInvoiceAddForm.get("accountId").setValue(result.accountId);
          this.ReturnPurInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.ReturnPurInvoiceAddForm.get("dealerId").setValue(result.dealerId);
          this.ReturnPurInvoiceAddForm.get("invoiceId").setValue(result.invoiceId);
          debugger
          if (this.ReturnPurInvoiceAddForm.get("invoiceId").value > 0) {
            this.hideSerials = true;
            this.cdr.detectChanges();
          }

          this.ReturnPurInvoiceAddForm.get("costCenterId").setValue(result.costCenterId);
          this.ReturnPurInvoiceAddForm.get("referenceNo").setValue(result.referenceNo);
          this.ReturnPurInvoiceAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.ReturnPurInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          this.decimalPlaces = result.currencyList.find(option => option.id === result.currencyId).data2;
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }
          if (!this.useStoreInGrid) {
            this.ReturnPurInvoiceAddForm.get("storeId").setValue(result.storeId);
          }
          this.ReturnPurInvoiceAddForm.get("note").setValue(result.note);

          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ReturnPurInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ReturnPurInvoiceAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          this.ReturnPurInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          //var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
          this.ReturnPurInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ReturnPurInvoiceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.ReturnPurInvoiceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ReturnPurInvoiceAddForm.get("branchId").setValue(defaultBranche.id);
          }
          if (this.ReturnPurInvoiceAddForm.value.currencyId == 0) {
            this.ReturnPurInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.ReturnPurInvoiceAddForm.get("currRate").setValue(currRate);
          }
          this.ReturnPurInvoiceAddForm.get("costCenterId").setValue(0);
          this.ReturnPurInvoiceAddForm.get("dealerId").setValue(0);
          this.ReturnPurInvoiceAddForm.get("storeId").setValue(0);
          this.DefaultStoreId = result.defaultStoreId;
        }
        this.hideSerials = false;
        this.cdr.detectChanges();
        this.GetVoucherTypeSetting(this.ReturnPurInvoiceAddForm.value.voucherTypeId);
        if (this.ReturnPurInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else {
          this.disableAll = false;
        }
      });
    })
  }

  OnSaveForms() {

    this.disableSave = true;
    this.validSave = false;
    let stopExecution = false;
    this.ValidationSave();
    if (this.validSave) {
      this.disableSave = false;
      return;
    }
    this.purInvoiceDTsList.forEach(element => {
      if (element.bonusUnitId == null) {
        element.bonusUnitId = 0;
      }
    })


    if (this.isCash == 1) {
      this.ReturnPurInvoiceAddForm.get("isCash").setValue(true);
    }
    if (this.pricewTax == 1) {
      this.ReturnPurInvoiceAddForm.get("priceWithTax").setValue(true);
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
      if (this.ReturnPurInvoiceAddForm.value.storeId == 0 || this.ReturnPurInvoiceAddForm.value.storeId == null || this.ReturnPurInvoiceAddForm.value.storeId == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }


    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
      var IsTaxable = this.suppliersList.find(x => x.id === this.ReturnPurInvoiceAddForm.value.dealerId).IsTaxable;
      if (IsTaxable == true && this.purInvoiceDTsList[i].taxId == 0) {
        this.alert.ShowAlert("msgMustSelectTaxForSupplier", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }

    this.ReturnPurInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ReturnPurInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.ReturnPurInvoiceAddForm.value.voucherNo = this.ReturnPurInvoiceAddForm.value.voucherNo.toString();
    this.ReturnPurInvoiceAddForm.value.purchaseInvoiceModelList = this.purInvoiceDTsList;
    this.ReturnPurInvoiceAddForm.get("amount").setValue(parseFloat(this.fNetTotal));
    //this.ReturnPurInvoiceAddForm.get("storeId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("status").setValue(0);

    this.ReturnPurInvoiceAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.returnpurService.SavePurchaseInvoice(this.ReturnPurInvoiceAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.ReturnPurInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintReturnPurchase(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ReturnPurchaseInvoice/ReturnPurInvoiceList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  ClearAfterSave() {
    this.ReturnPurInvoiceAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.ReturnPurInvoiceAddForm.get("costCenterId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("note").setValue("");
    this.fTotal = 0;
    this.fDiscount = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ReturnPurInvoiceAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.ReturnPurInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.ReturnPurInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.ReturnPurInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.returnpurService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {

        if (results) {
          this.ReturnPurInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.ReturnPurInvoiceAddForm.get("voucherNo").setValue(1);
        }
      });
    }

    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.ReturnPurInvoiceAddForm.get("branchId").setValue(branchId);
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
      this.ReturnPurInvoiceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.ReturnPurInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.ReturnPurInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.ReturnPurInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.ReturnPurInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.ReturnPurInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.ReturnPurInvoiceAddForm.get("currRate").setValue(currRate);
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

  getaccountId(voucherType, type, index) {

    if (this.disableAll == true) {
      return;
    }
    this.returnpurService.GetAccounts(voucherType).subscribe(result => {

      if (result) {
        this.purAccId = result.creditAccId;
        if (this.ReturnPurInvoiceAddForm.value.invoiceId <= 0) {
          if (type == 1) {
            this.AddNewLineDetails();
          }
          else {
            this.onAddRowBefore(index);
          }
        }
      }
    })
  }

  AddNewLineDetails() {
    if (this.purInvoiceDTsList == null) {
      this.purInvoiceDTsList = [];
    }
    if (!this.useStoreInGrid) {
      if (this.ReturnPurInvoiceAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
      else
        {
          this.voucherStoreId = this.ReturnPurInvoiceAddForm.value.storeId;
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
        orginalQty: 0,
        newRow: 0,
        invVoucherDTID: 0,
        purQty: 0,
        purBonus:0,
        index: ""
      });

    this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);


  }

  calculateSum() {
    var amount = "0"
    amount = this.formatCurrency(this.purInvoiceDTsList.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)) - (parseFloat(item.discountAmt)) + parseFloat(item.taxAmt), 0));
    return parseFloat(amount);
  }

  deleteRow(rowIndex: number) {

    if (this.ReturnPurInvoiceAddForm.value.itemsSerialList == null) {
      this.ReturnPurInvoiceAddForm.value.itemsSerialList = [];
    }
    let stopexe = false;
    if (this.ReturnPurInvoiceAddForm.value.itemsSerialList.length > 0) {
      this.ReturnPurInvoiceAddForm.value.itemsSerialList.forEach(element => {
        if (element.rowIndex == rowIndex && element.isChecked == true) {
          stopexe = true;
        }
      });
    }

    if (stopexe) {
      this.alert.ShowAlert("CantDeleteRowTheresSerialsAttachedWithRow", 'error');
      return;
    }
    if (rowIndex !== -1) {
      this.purInvoiceDTsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
      let indexToRemove = this.ReturnPurInvoiceAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.ReturnPurInvoiceAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
    }
    this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
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
      orginalQty: 0,
      newRow: 0,
      invVoucherDTID: 0,
      purQty: 0,
      purBonus:0,
      index: ""
    };

    this.purInvoiceDTsList.splice(rowIndex, 0, newRow);
    this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
  }

  onChangeItem(event, Row, i) {
    debugger
    if (event.value == undefined) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serialsListss = [];
        this.returnpurService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.purInvoiceDTsList[i].unitId = res[1].id;
            this.onChangeUnit(Row, i);
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
              this.onChangeUnit(Row, i);
            }
          }
          else if (res.length > 2 && Row.bonus == 0) {
            this.purInvoiceDTsList[i].unitId = res[0].id;
          }
          if (Row.bonus == 0 || Row.bonus == null) {
            this.bounsunitsList[i] = [];
          }
          else {
            this.bounsunitsList[i] = res;
            this.onChangeBounsUnit(Row, i);
          }
        });
      }
    }
    else {
      debugger
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serialsListss = [];
        const updatedElement = {
          ...this.purInvoiceDTsList[i], qty: "", cost: 0, bonus: "", bonusUnitId: 0, bonusUnitRate: 0, taxId: 0, taxPerc: 0, discountPerc: "",
          expiryDate: "", productDate: "", batchNo: "", unitRate: 0, discountAmt: "", taxAmt: 0, netTotal: 0, total: 0, orginalQty: 0, newRow: 0,
        };
        this.purInvoiceDTsList[i] = updatedElement;
        this.returnpurService.GetItemUnitbyItemId(event.value).subscribe(res => {
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.purInvoiceDTsList[i].unitId = res[1].id;
            Row.unitId = res[1].id;
            this.cdr.detectChanges();
            this.onChangeUnit(Row, i);
          }
          if (res.length > 2) {
            this.purInvoiceDTsList[i].unitId = 0;
          }
          if (Row.bonus == 0 || Row.bonus == null) {
            this.bounsunitsList[i] = [];
          }
          else {
            this.bounsunitsList[i] = res;
            this.onChangeBounsUnit(Row, i);
          }
        });
      }
    }


    if (event.value > 0) {
      if (this.purInvoiceDTsList.length > 0) {
        let isDuplicate = false;
        for (let m = 0; m < this.purInvoiceDTsList.length; m++) {
          if (this.purInvoiceDTsList[m].itemId == event.value && m != i) {
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
        }
      }
    }

    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === Row.itemId);

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
    let qty = 0;
    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }
    // purchase qty and return qty 

    if (this.ReturnPurInvoiceAddForm.value.invoiceId !== 0 && this.ReturnPurInvoiceAddForm.value.invoiceId !== null && this.ReturnPurInvoiceAddForm.value.invoiceId > 0) {
      const element = this.purInvoiceDTsList[Index];
      const RetQty = element.qty;
      const PurQty = element.purQty;
      if (RetQty > PurQty) {
        const updatedElement = { ...this.purInvoiceDTsList[Index], qty: PurQty };
        this.purInvoiceDTsList[Index] = updatedElement;
        this.alert.ShowAlert("CantAddQuantityMoreThanPurchaseQuantity", 'error');
        return false;
      }
    }
    //
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    // check if we had multiple  Batch ON  same Table
    if (this.purInvoiceDTsList.length > 1) {
      if (this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate > this.purInvoiceDTsList[Index].orginalQty) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.purInvoiceDTsList[Index].orginalQty, 'error');
          const updatedElement = { ...this.purInvoiceDTsList[Index], qty: 0 };
          this.purInvoiceDTsList[Index] = updatedElement;
          // this.purInvoiceDTsList[Index].qty = 0;
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


    // check if we had multiple  item  same id 
    if (this.purInvoiceDTsList.length > 1) {
      let totalQty = 0;
      let totalbouns = 0;
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {

        const item = row.itemId;
        if (this.purInvoiceDTsList[i].itemId == item && i != Index) {
          totalQty += (row.qty * row.unitRate) + this.purInvoiceDTsList[i].qty;
          totalbouns += (row.bonus * row.bonusUnitRate) + this.purInvoiceDTsList[i].bonus;
          this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.purInvoiceDTsList[Index].storeId, this.purInvoiceDTsList[Index].unitId, this.ReturnPurInvoiceAddForm.value.voucherDate, this.purInvoiceDTsList[Index].qty).subscribe(res => {
            debugger
            if (res.length == 0) {
              const qty = 0;
              setTimeout(() => {
                this.purInvoiceDTsList[Index].qty = 0;
                this.showRemainQty = false;
                this.cdr.detectChanges();
              });
              this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
              return false;
            }
            else {
              res.forEach(element => {
                qty = element.qoh;
              });

            }
            if ((totalQty + totalbouns) > qty) {
              setTimeout(() => {
                this.purInvoiceDTsList[Index].qty = 0;
                this.showRemainQty = false;
                this.cdr.detectChanges();
              });
              this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
              return;
            }
            else {
              this.showRemainQty = true;
              this.remainingQty = qty;
              this.hideLabelAfterDelay();
            }
          })
        }
      }
    }



    if (this.useStoreInGrid) {
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
      if (this.purInvoiceDTsList[Index].storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.purInvoiceDTsList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.purInvoiceDTsList[Index].storeId, this.purInvoiceDTsList[Index].unitId, this.ReturnPurInvoiceAddForm.value.voucherDate, this.purInvoiceDTsList[Index].qty).subscribe(res => {
        debugger
        if (res.length == 0) {
          const qty = 0;
          setTimeout(() => {
            this.purInvoiceDTsList[Index].qty = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
          return false;
        }
        else {
          qty = res[0].qoh;
          // res.forEach(element => {
          //   qty = element.inQty - element.outQty
          // });

        }
        let currQty = this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate;
        let currBouns = this.purInvoiceDTsList[Index].bonus * this.purInvoiceDTsList[Index].bonusUnitRate;
        if ((currQty + currBouns) > qty) {
          setTimeout(() => {
            this.purInvoiceDTsList[Index].qty = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.remainingQty = qty;
          this.hideLabelAfterDelay();
        }
      })

    }

    else {
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
      if (this.ReturnPurInvoiceAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.purInvoiceDTsList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      this.InvService.GetItemQty(this.purInvoiceDTsList[Index].itemId, this.ReturnPurInvoiceAddForm.value.storeId, this.purInvoiceDTsList[Index].unitId, this.ReturnPurInvoiceAddForm.value.voucherDate, this.purInvoiceDTsList[Index].qty).subscribe(res => {
        debugger
        if (res.length == 0) {

          setTimeout(() => {
            this.purInvoiceDTsList[Index].qty = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
          return false;
        }
        else {
          res.forEach(element => {
            qty = element.qoh;
          });

        }
        let currQty = this.purInvoiceDTsList[Index].qty * this.purInvoiceDTsList[Index].unitRate;
        let CurrBouns = this.purInvoiceDTsList[Index].bonus * this.purInvoiceDTsList[Index].bonusUnitRate;
        if ((currQty + CurrBouns) > qty) {
          setTimeout(() => {
            this.purInvoiceDTsList[Index].qty = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.remainingQty = qty;
          this.hideLabelAfterDelay();
        }
      })
    }
    this.onCheckboxChange(0);
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }

  }

  OnPriceBlur(row: any, index) {

    if (row.price == null || row.price == undefined) {
      row.price = 0;
      row.total = 0;
    }
    if (row.price !== null && row.price !== undefined) {
      row.price = Number(row.price).toFixed(this.decimalPlaces);
    }
    if (row.total !== null && row.total !== undefined) {
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

  onCheckboxChange(event) {
    var i = 0;

    if (event !== 0) {
      if (event.currentTarget.checked) {
        this.ReturnPurInvoiceAddForm.get("priceWithTax").setValue(true);
      }
      else {
        this.ReturnPurInvoiceAddForm.get("priceWithTax").setValue(false);
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
      this.fTotal = this.fTotal.toFixed(this.decimalPlaces); ///this.formatCurrency( this.fTotal);

      this.fTotalGridNet = Number((Number(this.fTotalGridNet) + Number(this.purInvoiceDTsList[r].netTotal)));
      // this.allowedDiscount = Number(this.allowedDiscount);
      // this.allowedDiscount = Number(this.formatCurrency(this.allowedDiscount));

      this.fDiscount = Number(parseFloat(this.fDiscount) + parseFloat(this.purInvoiceDTsList[r].discountAmt));
      this.fDiscount = Number(this.fDiscount).toFixed(this.decimalPlaces);

      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(this.purInvoiceDTsList[r].taxAmt)));
      this.fTaxTotal = this.fTaxTotal.toFixed(this.decimalPlaces);//this.formatCurrency( this.fTaxTotal);
      // -(Number(this.allowedDiscount))

      this.fNetTotal = Number((Number(this.fTotalGridNet)));
      this.fNetTotal = this.fNetTotal.toFixed(this.decimalPlaces); //this.formatCurrency( this.fNetTotal);
      // You can add more fields here as needed
    }
    // Add your logic here based on the checkbox's state (isChecked).
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
        // Handle invalid input gracefully
        return;
      }
      this.purInvoiceDTsList.forEach(element => {
        element.cost = this.purInvoiceDTsList[i].price;
        element.priceWithTax = element.price;
      });
      // Calculate total
      this.purInvoiceDTsList[i].total = (Number(this.purInvoiceDTsList[i].qty) * Number(this.purInvoiceDTsList[i].price));
      this.purInvoiceDTsList[i].total = this.purInvoiceDTsList[i].total.toFixed(this.decimalPlaces);  //this.formatCurrency(this.purInvoiceDTsList[i].total);

      // Calculate net total
      if (isNaN(this.purInvoiceDTsList[i].discountPerc) || isNaN(this.purInvoiceDTsList[i].total)) {
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);  //this.formatCurrency(this.purInvoiceDTsList[i].total);
      }
      else {
        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - Number(this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces); //this.formatCurrency(this.purInvoiceDTsList[i].netTotal);
      }

      // Calculate tax amount
      if (isNaN(this.purInvoiceDTsList[i].discountAmt)) {
        this.purInvoiceDTsList[i].taxAmt = (this.purInvoiceDTsList[i].total / (1 + (this.purInvoiceDTsList[i].taxPerc / 100)))
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);//this.formatCurrency( this.purInvoiceDTsList[i].taxAmount);
      }
      else if (this.purInvoiceDTsList[i].taxPerc > 0) {
        this.purInvoiceDTsList[i].taxAmt = Number(((Number(this.purInvoiceDTsList[i].total - this.purInvoiceDTsList[i].discountAmt)) - ((Number(this.purInvoiceDTsList[i].total - this.purInvoiceDTsList[i].discountAmt)) / (1 + (this.purInvoiceDTsList[i].taxPerc / 100)))))
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);//this.formatCurrency(this.purInvoiceDTsList[i].taxAmount );

      }
      else {
        return;
      }
      // || isNaN(this.taxPerc)



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
      this.purInvoiceDTsList[i].total = total.toFixed(this.decimalPlaces);//this.formatCurrency(total);
      // this.purInvoiceDTsList[i].total = (Number(this.purInvoiceDTsList[i].qty) * Number(this.purInvoiceDTsList[i].price)).toFixed(3);



      var taxAmt = parseFloat(this.purInvoiceDTsList[i].taxAmt);
      this.purInvoiceDTsList[i].taxAmt = taxAmt.toFixed(this.decimalPlaces);

      var discountAmt = parseFloat(this.purInvoiceDTsList[i].discountAmt);
      if (isNaN(discountAmt)) {
        discountAmt = 0;
      }
      this.purInvoiceDTsList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);


      // Calculate net total
      if (isNaN(this.purInvoiceDTsList[i].discountPerc)) {

        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - Number(this.purInvoiceDTsList[i].taxAmt));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces); //this.formatCurrency(this.purInvoiceDTsList[i].netTotal);

      }
      else if (isNaN(this.purInvoiceDTsList[i].taxAmt)) {
        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - (Number(this.purInvoiceDTsList[i].discountAmt)));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);//this.formatCurrency(this.purInvoiceDTsList[i].netTotal);
      }
      else {
        this.purInvoiceDTsList[i].netTotal =
          ((Number(this.purInvoiceDTsList[i].total) + Number(this.purInvoiceDTsList[i].taxAmt)) - Number(this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces);//this.formatCurrency(this.purInvoiceDTsList[i].netTotal);

      }




      // Calculate tax amount
      if (isNaN(this.purInvoiceDTsList[i].discountAmt)) {
        this.purInvoiceDTsList[i].taxAmt = ((this.purInvoiceDTsList[i].taxPerc / 100) * (this.purInvoiceDTsList[i].total));
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces);//this.formatCurrency(this.purInvoiceDTsList[i].taxAmount);

      }
      else if (this.purInvoiceDTsList[i].taxPerc > 0) {
        this.purInvoiceDTsList[i].taxAmt = ((this.purInvoiceDTsList[i].taxPerc / 100) * (this.purInvoiceDTsList[i].total - this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].taxAmt = this.purInvoiceDTsList[i].taxAmt.toFixed(this.decimalPlaces); //this.formatCurrency(this.purInvoiceDTsList[i].taxAmount);
      }
      else {
        return;
      }

      this.purInvoiceDTsList[i].netTotal =
        //     (this.purInvoiceDTsList[i].total - (this.purInvoiceDTsList[i].discountAmt + this.purInvoiceDTsList[i].taxAmount)).toFixed(3);
        // (Number(this.purInvoiceDTsList[i].total) + (Number(this.purInvoiceDTsList[i].discountAmt) + Number(this.purInvoiceDTsList[i].taxAmount))).toFixed(3);
        ((Number(this.purInvoiceDTsList[i].total) + Number(this.purInvoiceDTsList[i].taxAmt)) - Number(this.purInvoiceDTsList[i].discountAmt));
      this.purInvoiceDTsList[i].netTotal = this.purInvoiceDTsList[i].netTotal.toFixed(this.decimalPlaces); //this.formatCurrency(this.purInvoiceDTsList[i].netTotal);

    }

  }

  onDiscountChange(i) {

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

    if (event == 0) {
      const updatedElement = { ...this.purInvoiceDTsList[i], taxAmt: 0, taxId: 0, taxPerc: 0 }; // Add the other field you want to update
      this.purInvoiceDTsList[i] = updatedElement;
      this.onCheckboxChange(0);
    }
    else {
      this.onCheckboxChange(0);
    }
  }

  isRequierdEx(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);

    if (item.hasExpiry && row.expiryDate == "") {
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

      this.returnpurService.GetAccounts(voucherType).subscribe(result => {

        if (result) {
          this.purAccId = result.creditAccId;
          this.ReturnPurInvoiceAddForm.get("accountId").setValue(result.debitAccId);
          this.ReturnPurInvoiceAddForm.get("isCash").setValue(true);
        }
      })
    }
    else {
      this.ReturnPurInvoiceAddForm.get("accountId").setValue(0);
      this.ReturnPurInvoiceAddForm.get("isCash").setValue(false);
    }

  }

  getDealerAcc(event) {

    if (this.ReturnPurInvoiceAddForm.value.isCash == false) {
      if (event) {
        var acc = this.suppliersList.find(option => option.id === event.value).data2;
        this.ReturnPurInvoiceAddForm.get("accountId").setValue(acc);
      }
    }
  }

  onChangeUnit(Row, i) {
    debugger
    if (Row.qty > 0 && this.opType == 'Add' && this.ReturnPurInvoiceAddForm.value.invoiceId == 0) {
      this.purInvoiceDTsList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.returnpurService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.purInvoiceDTsList[i].unitRate = res;
      });
    }
  }

  onChangeBounsUnit(Row, i) {

    if (Row.bonus > 0) {
      if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
        this.returnpurService.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {
          this.purInvoiceDTsList[i].bonusUnitRate = res;
        });
      }
    }

  }

  openSerialsPopup(row: any, rowIndex: number) {

    if (this.ReturnPurInvoiceAddForm.value.itemsSerialList == null) {
      this.ReturnPurInvoiceAddForm.value.itemsSerialList = [];
    }
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
    else {
      this.tabelData = [];
      if (row.firstOpen == true) {
        for (const serial of this.savedSerials) {
          const existingItem = this.ReturnPurInvoiceAddForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
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
          var newList = this.ReturnPurInvoiceAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.ReturnPurInvoiceAddForm.get("itemsSerialList").setValue(newList);
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

  GetPurchaseInvoices(event) {
    debugger
    this.purInvoiceDTsList = [];
    this.clearTotals();
    this.hideSerials = true;
    this.cdr.detectChanges();
    if (event.value !== null && event.value !== 0 && event.value !== undefined) {

      this.returnpurService.GetItemsByPurchaseInvoice(event.value).subscribe(res => {
        debugger
        if (res) {
          this.disableDetails = true;
          this.purInvoiceDTsList = res.purchaseInvoiceModelList;

          let index = 0;
          this.purInvoiceDTsList.forEach(element => {
            element.expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            element.productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            element.total = element.qty * element.price;
          })
          if (res.purchaseSerialsModelList !== null && res.purchaseSerialsModelList.length !== 0 && res.purchaseSerialsModelList !== undefined) {
            this.ReturnPurInvoiceAddForm.get("itemsSerialList").setValue(res.purchaseSerialsModelList);
          }
          else {
            this.ReturnPurInvoiceAddForm.get("itemsSerialList").setValue([]);
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
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }

          for (let i = 0; i < res.purchaseInvoiceModelList.length; i++) {
            let id = res.purchaseInvoiceModelList[i].id;
            this.purInvoiceDTsList[i].invVoucherDTID = id;
            this.purInvoiceDTsList[i].qty = res.purchaseInvoiceModelList[i].qty;
            this.purInvoiceDTsList[i].purQty = res.purchaseInvoiceModelList[i].qty;
            this.purInvoiceDTsList[i].bonus = res.purchaseInvoiceModelList[i].bonus ?? 0;
            this.purInvoiceDTsList[i].purBonus = res.purchaseInvoiceModelList[i].bonus ?? 0;
            this.purInvoiceDTsList[i].id = 0;

          }
          if (res.isCash) {
            this.isCash = 1;
          }
          else {
            this.isCash = 0;

          }
          if (res.priceWithTax) {
            this.pricewTax = 1;
          }
          else {
            this.pricewTax = 0;
          }
          if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
            this.ReturnPurInvoiceAddForm.get("branchId").setValue(res.branchId);
          }
          if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
            this.ReturnPurInvoiceAddForm.get("dealerId").setValue(res.dealerId);
          }
          if (res.costCenterId !== null && res.costCenterId !== 0 && res.costCenterId !== undefined) {
            this.ReturnPurInvoiceAddForm.get("costCenterId").setValue(res.costCenterId);
          }
          if (res.referenceNo !== null && res.referenceNo !== 0 && res.referenceNo !== undefined) {
            this.ReturnPurInvoiceAddForm.get("referenceNo").setValue(res.referenceNo);
          }
          if (res.referenceDate !== null && res.referenceDate !== undefined) {
            this.ReturnPurInvoiceAddForm.get("referenceDate").setValue(formatDate(res.referenceDate, "yyyy-MM-dd", "en-US"));
          }
          if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
            this.ReturnPurInvoiceAddForm.get("currencyId").setValue(res.currencyId);
          }
          if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
            this.ReturnPurInvoiceAddForm.get("currRate").setValue(res.currRate);
          }
          if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
            this.ReturnPurInvoiceAddForm.get("storeId").setValue(res.storeId);
          }
          if (res.note !== null && res.note !== undefined) {
            this.ReturnPurInvoiceAddForm.get("note").setValue(res.note);
          }
          if (res.amount !== null && res.amount !== 0 && res.amount !== undefined) {
            this.ReturnPurInvoiceAddForm.get("amount").setValue(res.amount);
          }
          if (res.accountId !== null && res.accountId !== 0 && res.accountId !== undefined) {
            this.ReturnPurInvoiceAddForm.get("accountId").setValue(res.accountId);
          }
          this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);

        }
      })
    }
    else {
      this.hideSerials = false;
      this.disableDetails = false;
      this.cdr.detectChanges();
    }
  }

  onStoreChange(event: any, row: any, index: number) {

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
            this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {

            this.ReturnPurInvoiceAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }

    if(!this.useStoreInGrid)
      {
        if(this.purInvoiceDTsList.length>0)
          {
            for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
              this.purInvoiceDTsList[i].storeId=event.value;
            }
          }
      }


  }

  handleF3Key(event: KeyboardEvent, returnList: any, index: number) {
    if (event.key === 'F3') {
      event.preventDefault(); // prevent the default action of the F3 key
      this.OpenItemsInfoForm(returnList, index);
    }
    else if (event.key === "Backspace") {
      setTimeout(() => {
        if (returnList.qty === 0 || returnList.qty === null || returnList.qty === undefined) {
          returnList.total = 0;
          returnList.total = returnList.total.toFixed(this.decimalPlaces);
        }
      });
    }
    else if (event.key === 'F4') {
      this.CopyRow(returnList, index);
    }
  }

  OpenItemsInfoForm(row: any, rowIndex: number) {

    if (this.useStoreInGrid) {
      var store = row.storeId;
    }
    else {
      var store = this.ReturnPurInvoiceAddForm.value.storeId;
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
            // this.length++;
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
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onChangeItem(0, this.purInvoiceDTsList[i], i)
      }

      this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    });

    dialogRef.afterClosed().subscribe(res => {

      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        if (this.purInvoiceDTsList[i].itemId == 0 || this.purInvoiceDTsList[i].itemId == null)
          this.purInvoiceDTsList.splice(i, 1);
      }
      this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
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
            qtyy = this.purInvoiceDTsList[i].qty * row.unitRate;
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
    }, 3000);
  }

  listofproduct(returnList: any, index: number) {
    this.OpenItemsInfoForm(returnList, index);
  }

  async GetItemSerials(row, rowIndex): Promise<void> {

    if (this.disableAll == true) {
      return;
    }
    let store = 0;
    if (this.useStoreInGrid) {
      store = row.storeId;
    }
    else {
      store = this.ReturnPurInvoiceAddForm.value.storeId;
    }
    if (this.ReturnPurInvoiceAddForm.value.invoiceId !== 0 && this.ReturnPurInvoiceAddForm.value.invoiceId > 0) {
      try {
        this.serialsListss = await this.returnpurService.GetItemSerialsByInvoiceItem(this.ReturnPurInvoiceAddForm.value.invoiceId, row.itemId).toPromise();
        this.openSerialsPopup(row, rowIndex);
      } catch (error) {
        console.error('Error fetching item serials', error);
      }


    }
    else {
      try {
        this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
        this.openSerialsPopup(row, rowIndex);
      } catch (error) {
        console.error('Error fetching item serials', error);
      }

    }
  }

  ValidationSave() {


    if (this.isCash == 0) {
      if (this.ReturnPurInvoiceAddForm.value.dealerId == 0) {
        this.alert.ShowAlert("PleaseInsertDealer", 'error');
        this.validSave = true;
        return false;
      }
    }

    if (this.purInvoiceDTsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.validSave = true;
      return false;
    }

    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
      const element = this.purInvoiceDTsList[i];
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.price == 0 || element.accountId == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.validSave = true;
        return false;
      }
      element.i = i.toString();
    }

    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
      const element = this.purInvoiceDTsList[i];
      if (element.bonus > 0 && element.bonusUnitId == 0) {
        this.alert.ShowAlert("PleaseInsertBounsUnit", 'error');
        this.validSave = true;
        return false;
      }
      element.i = i.toString();
    }
    // Check Expenses Fields 

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
          if (element.expiryDate == "") {
            this.alert.RemainimgQty("msgPleaseEnterExpiryDate", item.text, 'error');
            this.purInvoiceDTsList[index].newRow = 0;
            this.validSave = true;
            return false;
          }

          if (this.useBatch == true) {
            if (element.batchNo == "" || element.batchNo == null) {
              this.alert.RemainimgQty("msgPleaseEnterBatch", item.text, 'error');
              this.purInvoiceDTsList[index].newRow = 0;
              this.validSave = true;
              return false;
            }
          }
        }
      }

      if (this.useSerial == true && this.hideSerials == false) {
        if (item.hasSerial) {
          if (this.ReturnPurInvoiceAddForm.value.itemsSerialList == null || this.ReturnPurInvoiceAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            this.validSave = true;
            return false;
          }
          const checkedItemCount = this.ReturnPurInvoiceAddForm.value.itemsSerialList.reduce((count, item) => {
            if (item.isChecked === true && item.rowIndex === index) {
              return count + 1;
            }
            return count;
          }, 0);
          if (checkedItemCount !== (element.qty * element.unitRate) + (element.bonus * element.bonusUnitRate)) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            this.validSave = true;
            return false;
          }
          const item1 = this.ReturnPurInvoiceAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.isChecked === true && item.rowIndex === index);
          if (!item1) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            this.validSave = true;
            return false;
          }
        }
      }
      element.index = index.toString();
    }
    // End  
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != undefined && this.voucherStoreId != null) {
        this.ReturnPurInvoiceAddForm.get("storeId").setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.ReturnPurInvoiceAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.ReturnPurInvoiceAddForm.get("storeId").setValue(0);
      }
    }
  }

  DeleteReturnPurInvoice(Id, voucherTypeId, voucherNo) {

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
        this.returnpurService.DeleteRetPurchaseInvoice(Id, voucherTypeId, voucherNo, this.voucherTypeEnum).subscribe((results) => {

          if (results.isSuccess === true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ReturnPurchaseInvoice/ReturnPurInvoiceList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.ShowAlert(results.message, 'error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  PrintReturnPurchase(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {
      const reportUrl = `RptReturnPurchaseAr?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptReturnPurchaseEn?VId=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.purService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {

          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.ReturnPurInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailReturnPurInvoice();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.ReturnPurInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailReturnPurInvoice();
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
    this.ReturnPurInvoiceAddForm.get("id").setValue(0);
    this.ReturnPurInvoiceAddForm.get("branchId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("dealerId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("referenceNo").setValue('');
    this.ReturnPurInvoiceAddForm.get("costCenterId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("invoiceId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("referenceDate").setValue('');
    this.ReturnPurInvoiceAddForm.get("storeId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("accountId").setValue(0);
    this.ReturnPurInvoiceAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue([]);
    this.ReturnPurInvoiceAddForm.get("itemsSerialList").setValue([]);
    this.ReturnPurInvoiceAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.purInvoiceDTsList = [];
    this.isCash = 0;
    this.pricewTax = 0;
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
          unitRate: 0,
          purOrderId: 0,
          receiptId: 0,
          netTotal: 0,
          total: 0,
          disablebatch: false,
          orginalQty: 0,
          newRow: 0,
          invVoucherDTID: 0,
          purQty: 0,
          purBonus:0,
          index: ""
        });

      this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
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
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          orginalQty: 0,
          newRow: 0,
          invVoucherDTID: 0,
          purQty: 0,
          purBonus:0,
          index: ""
        });

      this.ReturnPurInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    }

    setTimeout(() => {
      this.returnpurService.GetItemUnitbyItemId(row.itemId).subscribe(res => {
        this.unitsList[inds] = res;
        this.bounsunitsList[inds] = res;
      });
    });
    return false;
  }

  onBounsBlur(row, index) {
    debugger
     if (this.ReturnPurInvoiceAddForm.value.invoiceId !== 0 && this.ReturnPurInvoiceAddForm.value.invoiceId !== null && this.ReturnPurInvoiceAddForm.value.invoiceId > 0) {
      const element = this.purInvoiceDTsList[index];
      const RetBouns = element.bonus;
      const PurBouns = element.purBonus;
      if (RetBouns > PurBouns) {
        const updatedElement = { ...this.purInvoiceDTsList[index], bonus: PurBouns };
        this.purInvoiceDTsList[index] = updatedElement;
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", PurBouns, 'error');
        return false;
      }
    }
    if (this.useStoreInGrid) {
      this.InvService.GetItemQty(row.itemId, row.storeId, row.unitId, this.ReturnPurInvoiceAddForm.value.voucherDate, row.qty).subscribe(res => {
        debugger
        let qty = 0;
        let currQty = 0;
        let CurrBouns = 0;
        if (res.length > 0) {
          res.forEach(element => {
            qty = element.qoh;
          });
          this.purInvoiceDTsList.forEach(element => {
            if (element.itemId == row.itemId) {
              currQty += element.qty;
              CurrBouns += element.bonus;
            }
          });
          if ((currQty + CurrBouns) > qty) {
            setTimeout(() => {
              this.purInvoiceDTsList[index].bonus = 0;
              this.showRemainQty = false;
              this.cdr.detectChanges();
            });
            this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
          }
        }
      });
    }
    else {
      this.InvService.GetItemQty(row.itemId, this.ReturnPurInvoiceAddForm.value.storeId, row.unitId, this.ReturnPurInvoiceAddForm.value.voucherDate, row.qty).subscribe(res => {
        debugger
        let qty = 0;
        let currQty = 0;
        let CurrBouns = 0;
        if (res.length > 0) {
          res.forEach(element => {
            qty = element.qoh;
          });
          this.purInvoiceDTsList.forEach(element => {
            if (element.itemId == row.itemId) {
              currQty += element.qty;
              CurrBouns += element.bonus;
            }
          });
          if ((currQty + CurrBouns) > qty) {
            setTimeout(() => {
              this.purInvoiceDTsList[index].bonus = 0;
              this.showRemainQty = false;
              this.cdr.detectChanges();
            });
            this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
          }
        }
      });
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
