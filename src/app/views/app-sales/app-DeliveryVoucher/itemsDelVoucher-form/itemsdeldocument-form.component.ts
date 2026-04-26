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
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { ActivatedRoute, Params } from '@angular/router';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { Subscription, of } from 'rxjs';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { DeliveryStockVoucherService } from '../itemsDel.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-itemsdeldocument-form',
  templateUrl: './itemsdeldocument-form.component.html',
  styleUrls: ['./itemsdeldocument-form.component.scss']
})
export class ItemsdeldocumentFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  allowAccRepeat: any;
  private subscription: Subscription;
  DeliveryItemsAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  invDtlList: any[] = [];
  selectedItems: any[] = [];
  purchaseInvoicesList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 175;
  categoryId: number;
  disableSerials: boolean = false;
  showRemainQty: boolean;
  disableAll: boolean = false;
  voucherType: any;
  //header Lists
  voucherTypeList: any;
  branchesList: any;
  suppliersList: any;
  costCenterList: any;
  currencyList: any;
  //
  reqPurInvoice: number;
  purchaseInvoices: number;
  length: number = 0;
  oldStoreId: any;
  //Details Lists
  itemsList: any;
  unitsList: Array<any> = [];
  taxesList: any;
  storesList: any;
  savedSerials: any[] = [];
  bounsunitsList: Array<any> = [];
  allUntiesList: any;
  itemsUnitList: any;
  accountsList: any;
  expensesTypeList: any;
  orderId: any;
  //
  purchaseRequestList: any;
  isdisabled: boolean = false;
  decimalPlaces: number;
  CostingDecimalPlaces: number;
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
  oldQty: number = 0;
  voucherNo: number = 0;
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
  hideGetFromSalesbill: boolean;
  //End
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  allowMultiCurrency: boolean;
  disableCurrRate: boolean;
  disableSave: boolean;
  Lang;
  disapleVoucherType: boolean = false;
  disableReqSales: boolean = false;
  voucherStoreId: number;
  disableDetails: boolean = false;
  total: number = 0;
  formatedTotal: string;
  DefaultStoreId: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private DeliService: DeliveryStockVoucherService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private InvService: InvVoucherService,
      private selectedItemsService: SelectedItemsService,
      private cdr: ChangeDetectorRef,
      // private saService:SalesService,
    ) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "Inventory";
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
        this.DeliveryItemsAddForm.get('costCenterId')?.disable();
      }
      else {
        this.disableAll = false;
        this.DeliveryItemsAddForm.get('costCenterId')?.enable();
      }
    });
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryList']);
    }

    this.InitiailDeliveryVoucherForm();
    this.GetInitailDeliveryVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsDeliveryForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailDeliveryVoucherForm() {
    this.DeliveryItemsAddForm = this.formbulider.group({
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
      itemsSerialList: [],
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

  GetInitailDeliveryVoucher() {
    var lang = this.jwtAuth.getLang();
    this.DeliService.GetInitailDeliveryItemsVoucher(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryList']);
        return;
      }

      if (this.opType == 'Copy') {
        const currentDate = new Date().toISOString().split('T')[0];
        result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US")
      }
      else {
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      }

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

      this.purchaseRequestList = result.salesOrderList.map((item) => ({
        label: item.id,
        value: item.note,
        voucherTypeId: item.voucherTypeId,
      }));
      this.purchaseInvoicesList = result.purchaseInvoicesList.map((item) => ({
        label: item.id,
        value: item.note,
        voucherTypeId: item.voucherTypeId,
        categoryId: item.accountId,
      }));
      this.orderId = result.orderId;
      this.itemsList = result.itemsList.map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial
      }));

      debugger
      this.branchesList = result.usersCompanyModels;
      this.currencyList = result.currencyList;
      this.CostingDecimalPlaces = result.costingDecimalPlaces;
      if (this.CostingDecimalPlaces == 0) {
        this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      }
      else {
        this.decimalPlaces = this.CostingDecimalPlaces;
      }
      this.suppliersList = result.customersList;
      this.accountsList = result.accountList;
      this.costCenterList = result.costCenterList;
      this.taxesList = result.taxModelList;
      //this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.itemsUnitList = result.unitsList;
      this.defaultCurrencyId = result.defaultCurrency;
      // Billing system     
      debugger
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
        this.hideGetFromSalesbill = true;
      }
      else if (this.salesCycle == this.sCycle2) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromSalesbill = true;
      }
      else if (this.salesCycle == this.sCycle3) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromSalesbill = true;
      }
      else if (this.salesCycle == this.sCycle4) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromSalesbill = true;
      }
      else if (this.salesCycle == this.sCycle5) {
        this.hideGetFromSalesOrder = true;
        this.hideGetFromSalesbill = false;
      }
      else if (this.salesCycle == this.sCycle6) {
        this.hideGetFromSalesOrder = false;
        this.hideGetFromSalesbill = false;
      }
      debugger
      if (this.salesCycle == this.sCycle6) {
        // this.purchaseInvoicesList = [];
      }
      else {
        this.purchaseInvoicesList = result.purchaseInvoicesList.map((item) => ({
          label: item.id,
          value: item.note,
          voucherTypeId: item.voucherTypeId,
          categoryId: item.accountId,
        }));
      }
      // End
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null && result.invVouchersDTModelList.length > 0) {

        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        if (this.opType == 'Copy') {
          this.invDtlList.forEach(element => {
            element.id = 0;
          })
        }
        this.invDtlList.forEach(element => {
          element.total = (element.qty + element.bonus) * element.cost;
          element.total = element.total.toFixed(this.decimalPlaces);
        })

        this.invDtlList.forEach(element => {
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
        this.invDtlList = [];
      }

      for (let i = 0; i < this.invDtlList.length; i++) {
        this.invDtlList[i].expiryDate = this.invDtlList[i].expiryDate === null ? null : formatDate(this.invDtlList[i].expiryDate, "yyyy-MM-dd", "en-US");
        this.invDtlList[i].productDate = this.invDtlList[i].productDate === null ? null : formatDate(this.invDtlList[i].productDate, "yyyy-MM-dd", "en-US");
      }
      if (this.opType === 'Copy' || this.opType !== 'Edit') {
        for (let i = 0; i < this.invDtlList.length; i++) {
          this.onChangeItem(0, this.invDtlList[i], i)
        }
      }
      this.DeliveryItemsAddForm.patchValue(result);
      //General Setting Fill
      debugger
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
      this.purAccId = 0;
      debugger
      if (this.opType !== 'Copy') {
        if (result.itemsSerialList !== null && result.itemsSerialList.length !== 0 && result.itemsSerialList !== undefined) {
          this.DeliveryItemsAddForm.get("itemsSerialList").setValue(result.itemsSerialList);
          this.savedSerials = result.itemsSerialList;
        }
      }
      else {
        this.DeliveryItemsAddForm.get("itemsSerialList").setValue([]);
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.DeliveryItemsAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      debugger
      if (this.voucherNo > 0) {
        this.GetSalesOrder(0, this.voucherNo);
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.DeliveryItemsAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.DeliveryItemsAddForm.get("accountId").setValue(result.accountId);
          this.DeliveryItemsAddForm.get("branchId").setValue(result.branchId);
          this.DeliveryItemsAddForm.get("dealerId").setValue(result.dealerId);
          this.DeliveryItemsAddForm.get("costCenterId").setValue(result.costCenterId);
          this.DeliveryItemsAddForm.get("refVoucherId").setValue(result.refVoucherId);
          debugger
          if (Number(result.refVoucherId) > 0) {
            this.disableReqSales = true;
            this.disableDetails = true;
          }
          this.DeliveryItemsAddForm.get("currencyId").setValue(result.currencyId);
          debugger
          let selectedOrder = this.purchaseRequestList.find(option => option.label === result.refVoucherId);
          let selectedOrder2 = this.purchaseRequestList.find(option => option.label === this.orderId);
          let order = selectedOrder?.label;
          let order2 = selectedOrder2?.label;
          if (order != null && order !== "" && order !== undefined) {
            this.DeliveryItemsAddForm.get("purOrdersIds").setValue(Number(result.refVoucherId));
          }
          else if (order2 != null && order2 !== "" && order2 !== undefined) {
            this.DeliveryItemsAddForm.get("purOrdersIds").setValue(Number(this.orderId));
            this.reqPurInvoice = this.orderId;
          }

          let selectedInvoice = this.purchaseInvoicesList.find(option => option.label === result.refVoucherId);
          let bill = selectedInvoice?.label;
          if (bill != null && bill !== "" && bill !== undefined) {
            this.DeliveryItemsAddForm.get("purinvoiceIds").setValue(Number(result.refVoucherId));
          }
          if (result.currencyId != 0 && result.currencyId != null && result.currencyId != undefined) {
            if (this.CostingDecimalPlaces == 0) {
              this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
            }
            else {
              this.decimalPlaces = this.CostingDecimalPlaces;
            }
          }
          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onCheckboxChange(0);
          }
          if (!this.useStoreInGrid) {
            this.DeliveryItemsAddForm.get("storeId").setValue(result.storeId);
          }
          this.DeliveryItemsAddForm.get("note").setValue(result.note);
          debugger
          var exist = false;
          this.purchaseRequestList.forEach(element => {
            if (element.voucherTypeId == this.DeliveryItemsAddForm.value.refVoucherTypeId) {
              exist = true;
            }
          });
          if (exist) {
            this.reqPurInvoice = this.DeliveryItemsAddForm.value.refVoucherId;
          }
          else {
            this.purchaseInvoices = this.DeliveryItemsAddForm.value.refVoucherId;
          }

          this.useCostCenter = result.useCostCenter;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.purchaseRequestList.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.purchaseRequestList.get("branchId").setValue(result.branchId);
          }
        }
        else {
          debugger
          this.DeliveryItemsAddForm.get("branchId").setValue(result.defaultBranchId);
         // var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
            var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.DeliveryItemsAddForm.get("voucherTypeId").setValue(defaultVoucher);

          this.DeliveryItemsAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.DeliveryItemsAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.DeliveryItemsAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          if (this.DeliveryItemsAddForm.value.currencyId == 0) {
            this.DeliveryItemsAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.DeliveryItemsAddForm.get("currRate").setValue(currRate);
          }
          this.useCostCenter = result.useCostCenter;
          debugger
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.DeliveryItemsAddForm.get("branchId").setValue(defaultBranche.id);
          }
          this.DeliveryItemsAddForm.get("dealerId").setValue(0);
          this.DeliveryItemsAddForm.get("costCenterId").setValue(0);
          this.DeliveryItemsAddForm.get("accountId").setValue(0);
          this.DeliveryItemsAddForm.get("storeId").setValue(0);
          this.DefaultStoreId = result.defaultStoreId;
        }
        this.GetVoucherTypeSetting(this.DeliveryItemsAddForm.value.voucherTypeId);
        if (this.DeliveryItemsAddForm.value.currencyId == this.defaultCurrencyId) {
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
    if (this.invDtlList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    for (let i = 0; i < this.invDtlList.length; i++) {
      const element = this.invDtlList[i];
      // element.price = element.cost;
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.cost == 0) {
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
      element.i = i.toString();
    }

    if (this.useStoreInGrid == false) {
      if (this.DeliveryItemsAddForm.value.storeId == 0 || this.DeliveryItemsAddForm.value.storeId == null || this.DeliveryItemsAddForm.value.storeId == undefined) {
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
      const item = this.itemsList.find(item => item.id === itemId);

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
          if (this.DeliveryItemsAddForm.value.itemsSerialList == null || this.DeliveryItemsAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          debugger
          const checkedItemCount = this.DeliveryItemsAddForm.value.itemsSerialList.reduce((count, item) => {
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

          const item1 = this.DeliveryItemsAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.rowIndex === index);
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
    this.invDtlList.forEach(element => {
      if (element.bonusUnitId == null) {
        element.bonusUnitId = 0;
      }
    })

    this.DeliveryItemsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.DeliveryItemsAddForm.value.userId = this.jwtAuth.getUserId();
    this.DeliveryItemsAddForm.value.voucherNo = this.DeliveryItemsAddForm.value.voucherNo.toString();
    this.DeliveryItemsAddForm.value.invVouchersDTModelList = this.invDtlList;
    debugger
    const totalSum = this.invDtlList.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
    this.DeliveryItemsAddForm.get("amount").setValue(totalSum);
    this.DeliveryItemsAddForm.get("status").setValue(0);

    if (this.purchaseInvoices > 0) {
      this.DeliveryItemsAddForm.get("refVoucherId").setValue(this.purchaseInvoices);
    }
    else if (this.reqPurInvoice > 0) {
      this.DeliveryItemsAddForm.get("refVoucherId").setValue(this.reqPurInvoice);
    }

    this.DeliveryItemsAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    for (let i = 0; i < this.invDtlList.length; i++) {
      let elemnt = this.invDtlList[i];
      if (elemnt.mainBouns == null || elemnt.mainBouns == undefined) {
        elemnt.mainBouns = 0;
      }
    }
    this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    this.DeliService.SaveDeleviryItemsVoucher(this.DeliveryItemsAddForm.value)
      .subscribe((result) => {
        debugger
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.DeliveryItemsAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintDeliveryItems(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryList']);
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
    this.DeliveryItemsAddForm.value.generalAttachModelList = [];
    this.reqPurInvoice = 0;
    this.purchaseInvoices = 0;
    this.childAttachment.data = [];
    this.clearFormdata();
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.DeliveryItemsAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.voucherTypeEnum;
    var voucherTypeId = this.DeliveryItemsAddForm.value.voucherTypeId;
    var date = new Date(this.DeliveryItemsAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.DeliService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.DeliveryItemsAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.DeliveryItemsAddForm.get("voucherNo").setValue(1);
        }
      });
    }
    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.DeliveryItemsAddForm.get("branchId").setValue(branchId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      if (this.CostingDecimalPlaces == 0) {
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.CostingDecimalPlaces;
      }

    }
    else {
      if (this.CostingDecimalPlaces == 0) {
        this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
      }
      else {
        this.decimalPlaces = this.CostingDecimalPlaces;
      }
    }
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    debugger
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.DeliveryItemsAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.DeliveryItemsAddForm.get("currRate").setValue(currRate);
      if (this.DeliveryItemsAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.DeliveryItemsAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.DeliveryItemsAddForm.get("currRate").setValue(currRate);
      if (this.DeliveryItemsAddForm.value.currencyId == this.defaultCurrencyId) {
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
    if (this.CostingDecimalPlaces == 0) {
      this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    }
    else {
      this.decimalPlaces = this.CostingDecimalPlaces;
    }

    this.DeliveryItemsAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
    for (let i = 0; i < this.invDtlList.length; i++) {
      this.onCheckboxChange(0);
    }
  }

  getaccountId(voucherType, type, index) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.DeliService.GetAccounts(voucherType).subscribe(result => {
      if (result) {
        this.purAccId = result.creditAccId;
        if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
        }
      }
    })
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
    this.invDtlList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: "",
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
        taxAmount: 0,
        netTotal: 0,
        total: 0,
        disablebatch: false,
        mainQty: 0,
        mainBouns: 0,
        orgQty: 0,
        index: ""
      });

    this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  deleteRow(rowIndex: number) {
    debugger
    let stopexe = false;
    this.DeliveryItemsAddForm.value.itemsSerialList.forEach(element => {
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
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
      let indexToRemove = this.DeliveryItemsAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.DeliveryItemsAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
    }
    this.DeliveryItemsAddForm.value.itemsSerialList.forEach(element => {
      if (element.rowIndex !== 0) {
        element.rowIndex = element.rowIndex - 1;
      }
    });

    this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    this.clearTotals();
    this.calcTotal();
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
      cost: "",
      price: "",
      storeId: this.voucherStoreId,
      bonus: 0,
      bonusUnitId: 0,
      accountId: this.purAccId,
      taxId: 0,
      taxPerc: 0,
      discount: "",
      expiryDate: formatDate(this.NewDate, "yyyy-MM-dd", "en-US"),
      batchNo: "",
      unitRate: 0,
      purOrderId: 0,
      receiptId: 0,
      total: 0,
      productDate: "",
      discountAmt: "",
      taxAmount: 0,
      netTotal: 0,
      index: ""
    };
    this.invDtlList.splice(rowIndex, 0, newRow);
    this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
        this.DeliService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {

          this.unitsList[i] = res;

          if (res.length == 2) {
            this.invDtlList[i].unitId = res[1].id;
            Row.unitId = res[1].id;
            this.cdr.detectChanges();
            this.onChangeUnit(0, Row, i);
          }
          else if (this.opType == "Edit") {
            let unit = this.unitsList[i].find(r => r.id == Row.unitId);
            if (unit == 0 || unit == undefined || unit == null) {
              this.invDtlList[i].unitId = 0;
              return;
            }
            if (this.invDtlList[i].unitId != 0) {
              this.invDtlList[i].unitId = Row.unitId;
            }

          }
          else if (res.length > 2 && Row.bonus == 0) {
            if (this.invDtlList[i].unitId == 0 || this.invDtlList[i].unitId == null || this.invDtlList[i].unitId == undefined) {
              this.invDtlList[i].unitId = res[0].id;
              Row.unitId = res[0].id;
              this.cdr.detectChanges();
            }
            this.onChangeUnit(0, Row, i);
          }


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
      this.unitsList[i] = [];
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serialsListss = [];
        const updatedElement = {
          ...this.invDtlList[i], qty: "", cost: "", bonus: "", bonusUnitId: 0, bonusUnitRate: 0, taxId: 0, taxPerc: 0, discount: "",
          expiryDate: "", productDate: "", batchNo: "", unitRate: 0, discountAmt: "", taxAmount: 0, netTotal: 0, total: 0, orginalQty: 0, newRow: 0,
        };
        this.invDtlList[i] = updatedElement;
        this.DeliService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.invDtlList[i].unitId = res[1].id;
            Row.unitId = res[1].id;
            this.cdr.detectChanges();
            this.onChangeUnit(0, Row, i);
          }
          if (res.length > 2) {
            this.invDtlList[i].unitId = 0;
          }
          if (Row.bonus == 0 || Row.bonus == null) {
            this.bounsunitsList[i] = [];
          }
          else {
            this.bounsunitsList[i] = res;
          }
        });
      }
    }
    if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
      if (Row.mainQty == 0) {
        var savedqty = 0
        this.DeliService.GetMainQtySalesOrder(this.reqPurInvoice, Row.itemId).subscribe(res => {
          if (res) {
            for (let index = 0; index < this.invDtlList.length; index++) {
              if (this.invDtlList[index].itemId == Row.itemId && index != i) {
                savedqty = savedqty + this.invDtlList[index].qty;
              }
            }
            const updatedElement = {
              ...this.invDtlList[i], mainQty: res.qty - savedqty, orginalQty: res.qty - savedqty, mainBouns: res.bonus, unitId: res.unitId, storeId: res.storeId,
              unitRate: res.unitRate, bonusUnitRate: res.bonusUnitRate
            };
            this.invDtlList[i] = updatedElement;
          }
        })
      }
    }

    debugger
    if (this.invDtlList.length > 0) {
      let isDuplicate = false;
      for (let m = 0; m < this.invDtlList.length; m++) {
        if (this.invDtlList[m].itemId == Row.itemId && i != m) {
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
        return;
      }
    }

    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === event.value);

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
  }

  onChangeBouns(event, row, index) {
    debugger
    if (row.bonus == 0 || row.bonus == null) {
      this.bounsunitsList[index] = [];
    }
    if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
      if (Number((row.bonus * row.bonusUnitRate)) > (row.mainBouns)) {
        const updatedElement = { ...this.invDtlList[index], bonus: row.mainBouns };
        this.invDtlList[index] = updatedElement;
        let itemName = this.itemsList.find(option => option.id === row.itemId).text;
        itemName = itemName + '    ' + 'المتبقي' + '=' + Number(row.mainBouns)
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error')
        return false;
      }
    }
    else {
      debugger
      this.onChangeItem(0, row, index);
      let totalQty = 0;

      if (this.invDtlList[index].bonusUnitRate == 0) {
        const updatedElement = { ...this.invDtlList[index], bonusUnitRate: row.unitRate };
        this.invDtlList[index] = updatedElement;
      }
      let transDate = this.DeliveryItemsAddForm.value.voucherDate;
      for (let i = 0; i < this.invDtlList.length; i++) {
        totalQty = (this.invDtlList[index].qty * this.invDtlList[index].unitRate) + (this.invDtlList[index].bonus * this.invDtlList[index].bonusUnitRate);
        this.InvService.GetItemQty(this.invDtlList[index].itemId, this.invDtlList[index].storeId, this.invDtlList[index].unitId, transDate, totalQty).subscribe(res => {
          debugger
          if (res.length == 0) {
            this.invDtlList[index].qty = "";
            this.alert.ShowAlert("quantityNotEnough", "error");
          }
          if (totalQty > res[0].qty) {
            setTimeout(() => {
              this.invDtlList[index].bonus = 0;
              this.showRemainQty = false;
              this.cdr.detectChanges();
            });
            this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
            return;
          }
          else {
            this.showRemainQty = true;
            this.remainingQty = res[index].qty;
            this.hideLabelAfterDelay();
          }
        })

      }
    }
    this.calcTotal();
  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    let transDate = this.DeliveryItemsAddForm.value.voucherDate;
    if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
      var qtyused = this.invDtlList.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);

      if ((event * row.unitRate) > (row.mainQty)) {
        if (row.unitRate > 1) {
          const updatedElement = { ...this.invDtlList[Index], qty: 0, unitId: 0 };
          this.invDtlList[Index] = updatedElement;
          let itemName = this.itemsList.find(option => option.id === row.itemId).text;
          itemName = itemName + '    ' + 'المتبقي' + '=' + Number(row.mainQty)
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error')
          return false;
        }
        else {
          const updatedElement = { ...this.invDtlList[Index], qty: row.mainQty };
          this.invDtlList[Index] = updatedElement;
          let itemName = this.itemsList.find(option => option.id === row.itemId).text;
          itemName = itemName + '    ' + 'المتبقي' + '=' + Number(row.mainQty)
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error')
          return false;
        }

      }

    }
    if (row.qty < 0) {
      this.alert.ShowAlert("CantAddValueLessThanZero", 'error');
      this.invDtlList[Index].qty = "";
      return;
    }

    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }
    debugger
    if (row.qty !== 0 && row.price !== 0) {
      const bonus = Number(row.bonus) || 0;
      row.total = (row.qty + bonus) * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    else {
      if (row.total == 0 || row.total == null || row.total == undefined) {
        row.total = 0;
        row.total = row.total.toFixed(this.decimalPlaces);
      }

    }
    // check if we had multiple  Batch ON  same Table
    if (this.invDtlList.length == 1) {
      if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > this.invDtlList[Index].orginalQty) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[Index].orginalQty, 'error');
          this.invDtlList[Index].qty = "";
          return false;
        }

      }
    }
    if (this.invDtlList.length > 1) {
      let totBatchQty = 0;
      let allBatchQty = 0;
      for (let i = 0; i < this.invDtlList.length; i++) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          if (this.invDtlList[i].batchNo == Batch && i != Index) {
            totBatchQty += this.invDtlList[i].qty * this.invDtlList[i].unitRate;
            allBatchQty += this.invDtlList[i].qty * this.invDtlList[i].unitRate;
            if (totBatchQty + (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate) > this.invDtlList[Index].orginalQty) {
              const source$ = of(1, 2);
              source$.pipe(delay(0)).subscribe(() => {
                this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[Index].orginalQty - totBatchQty, 'error');
                this.invDtlList[Index].qty = "";
                return false;
              });
            }
          }
        }
      }
    }
    // THIS Checks Batch Quantity For The Item
    if (row.orginalQty > 0) {
      if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > row.orginalQty) {
        this.alert.RemainimgQty("QuantityOfBatchNotEnough=", row.orginalQty.toString(), 'error');
        this.invDtlList[Index].qty = null;
        return false;
      }
    }
    // check if we had multiple  item  same id 
    if (this.invDtlList.length > 1) {
      let totalQty = 0;
      for (let i = 0; i < this.invDtlList.length; i++) {

        const item = row.itemId;
        if (this.invDtlList[i].itemId == item && i != Index) {
          totalQty += (row.qty * row.unitRate) + this.invDtlList[i].qty;
          this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId, transDate, totalQty).subscribe(res => {
            if (res.length == 0) {
              this.invDtlList[Index].qty = "";
              this.alert.ShowAlert("quantityNotEnough", "error");
            }
            debugger
            if (totalQty > res[0].qty) {
              setTimeout(() => {
                this.invDtlList[Index].qty = "";
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


    debugger
    var storeId = 0;
    if (this.useStoreInGrid) {
      if (this.invDtlList[Index].itemId == 0) {
        this.alert.ShowAlert("PleaseEnterItemID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.invDtlList[Index].storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
      storeId = this.invDtlList[Index].storeId;
    }
    else {
      if (this.invDtlList[Index].itemId == 0) {
        this.alert.ShowAlert("PleaseEnterItemID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.DeliveryItemsAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
      storeId = this.DeliveryItemsAddForm.value.storeId;
    }
    this.InvService.GetItemQty(this.invDtlList[Index].itemId, storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {
      debugger
      if (res.length == 0) {
        this.invDtlList[Index].qty = "";
        this.alert.ShowAlert("quantityNotEnough", "error");
        return;
      }
      if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qoh) {
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.showRemainQty = false;
          this.cdr.detectChanges();
        });
        this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
        return;
      }
      else {
        if (res.length == 1) {
          const bonus = Number(this.invDtlList[Index].bonus) || 0;
          this.invDtlList[Index].price = this.invDtlList[Index].price;
          this.invDtlList[Index].cost = res[0].cost;
          this.invDtlList[Index].refId = res[0].id;
          this.invDtlList[Index].total = res[0].cost * (this.invDtlList[Index].qty + bonus);
          this.invDtlList[Index].total = this.invDtlList[Index].total.toFixed(this.decimalPlaces);
          row.batchNo = res[0].batchNo;
          row.expiryDate = res[0].expiryDate === null ? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")
          row.productDate = res[0].productDate === null ? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")
          this.invDtlList[Index].productDate = row.productDate;
          this.invDtlList[Index].expiryDate = row.expiryDate;
          this.invDtlList[Index].batchNo = row.batchNo;
          this.showRemainQty = true;
          this.remainingQty = res[0].qoh;
          this.calcTotal();
          this.hideLabelAfterDelay();
        }
        else {
          const bonus = Number(this.invDtlList[Index].bonus) || 0;
          this.invDtlList[Index].qty = res[0].qtyIssued;
          this.invDtlList[Index].price = this.invDtlList[Index].price;
          this.invDtlList[Index].cost = res[0].cost;
          this.invDtlList[Index].refId = res[0].id;
          this.invDtlList[Index].total = res[0].cost * (res[0].qtyIssued + bonus);
          this.invDtlList[Index].total = this.invDtlList[Index].total.toFixed(this.decimalPlaces);
          row.batchNo = res[0].batchNo;
          row.expiryDate = res[0].expiryDate === null ? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")
          row.productDate = res[0].productDate === null ? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")
          this.invDtlList[Index].productDate = row.productDate;
          this.invDtlList[Index].expiryDate = row.expiryDate;
          this.invDtlList[Index].batchNo = row.batchNo;
          this.showRemainQty = true;
          this.remainingQty = res[0].qoh;
          this.calcTotal();
          for (let index = 1; index < res.length; index++) {
            this.unitsList[index] = this.unitsList[Index];
            this.invDtlList.push(
              {
                id: 0,
                hDId: 0,
                itemId: row.itemId,
                unitId: row.unitId,
                unitRate: row.unitRate,
                storeId: row.storeId,
                qty: res[index].qtyIssued,
                price: this.invDtlList[Index].price,
                cost: res[index].cost,
                total: (res[index].qtyIssued * res[index].cost).toFixed(this.decimalPlaces),
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
            this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
          }
        }
      }
    })

  }

  OnPriceChange(row: any) {
    const qty = Number(row.qty) || 0;
    const bonus = Number(row.bonus) || 0; // كمية البونص
    const cost = Number(row.cost) || 0;

    if ((qty + bonus) > 0 && cost > 0) {
      row.total = (qty + bonus) * cost;
      row.total = row.total.toFixed(this.decimalPlaces);
    } else {
      row.total = 0;
    }
  }


  OnPriceBlur(row: any, index) {

    if (row.cost !== null && row.cost !== undefined) {
      row.cost = Number(row.cost).toFixed(this.decimalPlaces);
      row.total = Number(row.total).toFixed(this.decimalPlaces);
    }
    this.onCheckboxChange(0);
    this.calcTotal();
  }

  formatAmt(row: any) {
    row.cost = row.cost.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  onCheckboxChange(event) {
    var i = 0;
    if (event !== 0) {
      if (event.currentTarget.checked) {
        this.DeliveryItemsAddForm.get("priceWithTax").setValue(true);
      }
      else {
        this.DeliveryItemsAddForm.get("priceWithTax").setValue(false);
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
      this.fTotal = this.fTotal.toFixed(this.decimalPlaces);
      this.fTotalGridNet = Number((Number(this.fTotalGridNet) + Number(this.invDtlList[r].netTotal)));
      this.fDiscount = Number(parseFloat(this.fDiscount) + parseFloat(this.invDtlList[r].discountAmt));
      this.fDiscount = Number(this.fDiscount).toFixed(this.decimalPlaces);
      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(this.invDtlList[r].taxAmount)));
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
    if (this.invDtlList[i].cost > 0) {
      var cost = parseFloat(this.invDtlList[i].cost);
      this.invDtlList[i].cost = cost.toFixed(this.decimalPlaces);
    }
    if (isNaN(this.invDtlList[i].qty) || isNaN(this.invDtlList[i].cost)) {
      // Handle invalid input gracefully
      return;
    }
    // Calculate total
    const qty = this.invDtlList[i].qty;
    const bonus = this.invDtlList[i].bonus;
    let total = (qty + bonus) * this.invDtlList[i].cost;
    this.invDtlList[i].total = total.toFixed(this.decimalPlaces);//this.formatCurrency(total);
    // this.purInvoiceDTsList[i].total = (Number(this.purInvoiceDTsList[i].qty) * Number(this.purInvoiceDTsList[i].price)).toFixed(3);
    var taxAmount = parseFloat(this.invDtlList[i].taxAmount);
    this.invDtlList[i].taxAmount = taxAmount.toFixed(this.decimalPlaces);
    var discountAmt = parseFloat(this.invDtlList[i].discountAmt);
    if (isNaN(discountAmt)) {
      discountAmt = 0;
    }
    this.invDtlList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);
    // Calculate net total
    if (isNaN(this.invDtlList[i].discount)) {
      this.invDtlList[i].netTotal =
        (Number(this.invDtlList[i].total) - Number(this.invDtlList[i].taxAmount));
      this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces);
    }
    else if (isNaN(this.invDtlList[i].taxAmount)) {
      this.invDtlList[i].netTotal =
        (Number(this.invDtlList[i].total) - (Number(this.invDtlList[i].discountAmt)));
      this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces);
    }
    else {
      this.invDtlList[i].netTotal =
        ((Number(this.invDtlList[i].total) + Number(this.invDtlList[i].taxAmount)) - Number(this.invDtlList[i].discountAmt));
      this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces);

    }
    // Calculate tax amount
    if (isNaN(this.invDtlList[i].discountAmt)) {
      this.invDtlList[i].taxAmount = ((this.invDtlList[i].taxPerc / 100) * (this.invDtlList[i].total));
      this.invDtlList[i].taxAmount = this.invDtlList[i].taxAmount.toFixed(this.decimalPlaces);

    }
    else if (this.invDtlList[i].taxPerc > 0) {
      this.invDtlList[i].taxAmount = ((this.invDtlList[i].taxPerc / 100) * (this.invDtlList[i].total - this.invDtlList[i].discountAmt));
      this.invDtlList[i].taxAmount = this.invDtlList[i].taxAmount.toFixed(this.decimalPlaces);
    }
    else {
      return;
    }
    this.invDtlList[i].netTotal =
      ((Number(this.invDtlList[i].total) + Number(this.invDtlList[i].taxAmount)) - Number(this.invDtlList[i].discountAmt));
    this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces);



  }

  isRequierdEx(row: any, index) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
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
      this.DeliService.GetAccounts(voucherType).subscribe(result => {
        if (result) {
          this.purAccId = result.creditAccId;
          this.DeliveryItemsAddForm.get("accountId").setValue(result.debitAccId);
        }
      })
    }
    else {
      this.DeliveryItemsAddForm.get("accountId").setValue(0);
    }

  }

  getDealerAcc(event) {
    debugger
    if (event.value) {
      var acc = this.suppliersList.find(option => option.id === event.value).data2;
      this.DeliveryItemsAddForm.get("accountId").setValue(acc);
    }
    else {
      if (event) {
        var acc = this.suppliersList.find(option => option.id === event).data2;
        this.DeliveryItemsAddForm.get("accountId").setValue(acc);
      }
    }
  }

  onChangeUnit(event, Row, i) {
    debugger
    setTimeout(() => {
      if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
        this.DeliService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
          debugger
          this.invDtlList[i].unitRate = res;
          debugger
          if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
            if (Row.qty * this.invDtlList[i].unitRate > Row.mainQty) {
              if (Row.qty > 0 && event > 0) {
                const updatedElement = { ...this.invDtlList[i], qty: 0, unitId: 0, unitRate: 0 };
                this.invDtlList[i] = updatedElement;
                let itemName = this.itemsList.find(option => option.id === Row.itemId).text;
                itemName = itemName + '    ' + 'المتبقي' + '=' + Number(Row.mainQty)
                this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error')
                return false;
              }
            }
          }

        });
      }
    });
  }

  onChangeBounsUnit(Row, i) {

    if (Row.bonus > 0) {
      if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
        this.DeliService.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {
          this.invDtlList[i].bonusUnitRate = res;
        });
      }


      if (this.invDtlList[i].bonusUnitRate == 0) {
        const updatedElement = { ...this.invDtlList[i], bonusUnitRate: Row.unitRate / Row.bonusUnitRate };
        this.invDtlList[i] = updatedElement;
      }


    }
    this.calcTotal();
  }

  clearTotals() {
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.onCheckboxChange(0);
  }

  GetSalesOrder(event, id) {
    debugger
    this.disableDetails = true;
    if (this.salesCycle == this.sCycle6) {
      if (event) {
        this.DeliService.GetSalesInvoiceLists(event.value).subscribe(res => {
          if (res) {
            this.purchaseInvoicesList = [];
            this.purchaseInvoicesList = res.salesInvoiceList.map((item) => ({
              label: item.id,
              value: item.note,
              voucherTypeId: item.voucherTypeId,
              categoryId: item.accountId,
            }));
          }
        })
      }
      else {
        if (id !== null || id !== 0 || id !== undefined) {
          this.DeliService.GetSalesInvoiceLists(id).subscribe(res => {
            if (res) {
              this.purchaseInvoicesList = [];
              this.purchaseInvoicesList = res.salesInvoiceList.map((item) => ({
                label: item.id,
                value: item.note,
                voucherTypeId: item.voucherTypeId,
                categoryId: item.accountId,
              }));
            }
          })
        }
      }

    }
    else {
      if (event) {
        this.purchaseInvoices = 0;
        this.DeliveryItemsAddForm.get("dealerId").setValue(0);
        this.DeliveryItemsAddForm.get("accountId").setValue(0);
        this.invDtlList = [];
        this.DeliveryItemsAddForm.get("itemsSerialList").setValue([]);
        this.clearTotals();
        if (event.value !== null || event.value !== 0 || event.value !== undefined) {
          debugger
          let vouchertype = this.purchaseRequestList.find(option => option.label === event.value).voucherTypeId;
          this.DeliveryItemsAddForm.get("refVoucherTypeId").setValue(vouchertype);
          this.DeliService.GetItemsBySalesOrder(event.value).subscribe(res => {
            debugger
            if (res) {
              this.invDtlList = res.invVouchersDTModelList;
              let index = 0;
              this.invDtlList.forEach(element => {
                element.total = (element.qty + element.bonus) * element.cost;
                element.total = element.total.toFixed(this.decimalPlaces);
              })

              this.invDtlList.forEach(element => {
                this.itemsList.forEach(item => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                    this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                    index++;
                  }
                });
              })

              debugger
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.onChangeItem(0, this.invDtlList[i], i);
                this.OnPriceBlur(this.invDtlList[i], i);
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.onCheckboxChange(0);
              }
              if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
                this.DeliveryItemsAddForm.get("branchId").setValue(res.branchId);
              }
              if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
                this.DeliveryItemsAddForm.get("dealerId").setValue(res.dealerId);
                this.getDealerAcc(event = res.dealerId);
              }
              if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
                this.DeliveryItemsAddForm.get("currencyId").setValue(res.currencyId);
              }
              if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
                this.DeliveryItemsAddForm.get("currRate").setValue(res.currRate);
              }
              if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
                this.DeliveryItemsAddForm.get("storeId").setValue(res.storeId);
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.invDtlList[i].expiryDate = null;
                this.invDtlList[i].productDate = null;
                this.invDtlList[i].mainQty = res.invVouchersDTModelList[i].qty * res.invVouchersDTModelList[i].unitRate;
                debugger
                this.invDtlList[i].mainBouns = res.invVouchersDTModelList[i].bonus * res.invVouchersDTModelList[i].bonusUnitRate;
                this.invDtlList[i].orgQty = res.invVouchersDTModelList[i].qty;
                this.invDtlList[i].storeId = res.invVouchersDTModelList[i].storeId;
                if (res.invVouchersDTModelList[i].bonus == null || res.invVouchersDTModelList[i].bonus == undefined) {
                  this.invDtlList[i].bonus = 0;
                }
                this.OnQtyChange(0, this.invDtlList[i], i);
              }
              this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
              this.itemsList = res.itemsList;
            }
          })
        }
      }
      else {
        debugger
        this.purchaseInvoices = 0;
        this.DeliveryItemsAddForm.get("dealerId").setValue(0);
        this.DeliveryItemsAddForm.get("accountId").setValue(0);
        this.invDtlList = [];
        this.DeliveryItemsAddForm.get("itemsSerialList").setValue([]);
        this.clearTotals();
        if (id !== null || id !== 0 || id !== undefined) {
          debugger
          var vouchertype = this.purchaseRequestList.find(option => option.label === id).voucherTypeId;
          this.DeliveryItemsAddForm.get("refVoucherTypeId").setValue(vouchertype);
          this.DeliService.GetItemsBySalesOrder(id).subscribe(res => {
            debugger
            if (res) {
              this.invDtlList = res.invVouchersDTModelList;
              let index = 0;
              this.invDtlList.forEach(element => {
                element.total = (element.qty + element.bonus) * element.cost;
                element.total = element.total.toFixed(this.decimalPlaces);
              })

              this.invDtlList.forEach(element => {
                this.itemsList.forEach(item => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                    this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                    index++;
                  }
                });
              })

              for (let i = 0; i < this.invDtlList.length; i++) {
                this.invDtlList[i].expiryDate = null;
                this.invDtlList[i].productDate = null;
                this.invDtlList[i].mainQty = res.invVouchersDTModelList[i].qty * res.invVouchersDTModelList[i].unitRate;
                debugger
                this.invDtlList[i].mainBouns = res.invVouchersDTModelList[i].bonus * res.invVouchersDTModelList[i].bonusUnitRate;
                this.invDtlList[i].orgQty = res.invVouchersDTModelList[i].qty;
                this.invDtlList[i].storeId = res.invVouchersDTModelList[i].storeId;
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.onChangeItem(0, this.invDtlList[i], i)
              }
              for (let i = 0; i < this.invDtlList.length; i++) {
                this.onCheckboxChange(0);
              }
              if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
                this.DeliveryItemsAddForm.get("branchId").setValue(res.branchId);
              }
              if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
                this.DeliveryItemsAddForm.get("dealerId").setValue(res.dealerId);
                this.getDealerAcc(event = res.dealerId);
              }
              if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
                this.DeliveryItemsAddForm.get("currencyId").setValue(res.currencyId);
              }
              if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
                this.DeliveryItemsAddForm.get("currRate").setValue(res.currRate);
              }
              if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
                this.DeliveryItemsAddForm.get("storeId").setValue(res.storeId);
              }
              this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
            }
          })
        }
      }
    }
    for (let i = 0; i < this.invDtlList.length; i++) {
      this.isRequierdEx(this.invDtlList[i], i);
      this.isRequierdBatch(this.invDtlList[i]);
    }

  }

  GetSalesInvoices(event) {
    debugger;
    this.disableDetails = true;
    this.reqPurInvoice = 0;
    this.DeliveryItemsAddForm.get("dealerId").setValue(0);
    this.DeliveryItemsAddForm.get("accountId").setValue(0);
    this.invDtlList = [];
    this.clearTotals();
    if (event.value !== null && event.value !== 0 && event.value !== undefined) {
      var vouchertype = this.purchaseInvoicesList.find(option => option.label === event.value).voucherTypeId;
      if (vouchertype > 0) {
        this.DeliveryItemsAddForm.get("refVoucherTypeId").setValue(vouchertype);
      }
      this.DeliService.GetItemsBySalesInvoice(event.value).subscribe(res => {

        if (res) {
          this.invDtlList = res.invVouchersDTModelList;

          let index = 0;
          this.invDtlList.forEach(element => {
            element.expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            element.productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            element.total = (element.qty + element.bonus) * element.cost;
            element.total = element.total.toFixed(this.decimalPlaces);
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                index++;
              }
            });
          })

          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onChangeItem(0, this.invDtlList[i], i)
            this.OnQtyChange(0, this.invDtlList[i], i);
          }
          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onCheckboxChange(0);
          }
          debugger
          for (let i = 0; i < res.invVouchersDTModelList.length; i++) {
            let id = res.invVouchersDTModelList[i].id;
            this.invDtlList[i].invVoucherDTID = id;
            // this.invDtlList[i].mainQty= res.invVouchersDTModelList[i].qty;
            this.invDtlList[i].id = 0;
            this.invDtlList[i].mainQty = res.invVouchersDTModelList[i].qty * res.invVouchersDTModelList[i].unitRate;
            debugger
            this.invDtlList[i].mainBouns = res.invVouchersDTModelList[i].bonus * res.invVouchersDTModelList[i].bonusUnitRate;
          }

          if (res.branchId !== null && res.branchId !== 0 && res.branchId !== undefined) {
            this.DeliveryItemsAddForm.get("branchId").setValue(res.branchId);
          }
          if (res.dealerId !== null && res.dealerId !== 0 && res.dealerId !== undefined) {
            this.DeliveryItemsAddForm.get("dealerId").setValue(res.dealerId);
          }
          if (res.costCenterId !== null && res.costCenterId !== 0 && res.costCenterId !== undefined) {
            this.DeliveryItemsAddForm.get("costCenterId").setValue(res.costCenterId);
          }

          if (res.currencyId !== null && res.currencyId !== 0 && res.currencyId !== undefined) {
            this.DeliveryItemsAddForm.get("currencyId").setValue(res.currencyId);
          }
          if (res.currRate !== null && res.currRate !== 0 && res.currRate !== undefined) {
            this.DeliveryItemsAddForm.get("currRate").setValue(res.currRate);
          }
          if (res.storeId !== null && res.storeId !== 0 && res.storeId !== undefined) {
            this.DeliveryItemsAddForm.get("storeId").setValue(res.storeId);
          }
          if (res.note !== null && res.note !== undefined) {
            this.DeliveryItemsAddForm.get("note").setValue(res.note);
          }
          if (res.amount !== null && res.amount !== 0 && res.amount !== undefined) {
            this.DeliveryItemsAddForm.get("amount").setValue(res.amount);
          }
          debugger
          if (res.accountId !== null && res.accountId !== 0 && res.accountId !== undefined) {
            this.DeliveryItemsAddForm.get("accountId").setValue(res.accountId);
          }
          this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);



          if (res.itemsSerialList !== null && res.itemsSerialList.length !== 0 && res.itemsSerialList !== undefined) {
            this.DeliveryItemsAddForm.get("itemsSerialList").setValue(res.itemsSerialList);
            this.serialsListss = res.itemsSerialList;
          }
          else {
            this.DeliveryItemsAddForm.get("itemsSerialList").setValue([]);
          }

        }
      })
    }
  }

  async GetItemSerials(row, rowIndex): Promise<void> {
    debugger
    // if (this.disableAll == true) {
    //   return;
    // }
    if (this.purchaseInvoices == 0 || this.purchaseInvoices == null || this.purchaseInvoices == undefined) {
      if (this.isRequierdSerial(row) == true) {
        return;
      }
      let store = 0;
      if (this.useStoreInGrid) {
        store = row.storeId;
      }
      else {
        store = this.DeliveryItemsAddForm.value.storeId;
      }
      try {
        this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
        this.openSerialsPopup(row, rowIndex);
      } catch (error) {
        console.error('Error fetching item serials', error);
      }
    }
    else {
      this.openSerialsPopup(row, rowIndex);
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
    else {
      this.tabelData = [];
      if (row.firstOpen == true) {
        for (const serial of this.serialsListss) {
          const existingItem = this.DeliveryItemsAddForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
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
          debugger
          row.res = res;
          var newList = this.DeliveryItemsAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.DeliveryItemsAddForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })


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
  }

  OpenItemsInfoForm(row: any, rowIndex: number) {
    debugger
    if (this.useStoreInGrid) {
      var store = row.storeId;
    }
    else {
      var store = this.DeliveryItemsAddForm.value.storeId;
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

    debugger
    this.subscription = this.selectedItemsService.selectedItems$.subscribe((items) => {
      this.selectedItems = [];
      this.selectedItems = items;
      this.length = this.invDtlList.length;
      if (this.selectedItems.length > 0) {
        if (this.invDtlList[rowIndex].qty == null) {
          this.invDtlList[rowIndex].qty = 0;
        }
        if ((this.invDtlList[rowIndex].qty * this.invDtlList[rowIndex].unitRate) + (this.invDtlList[rowIndex].bonus * this.invDtlList[rowIndex].bonusUnitRate) > this.selectedItems[0].qoh) {
          this.alert.ShowAlert("QuantityOfBatchNotEnough", 'error');
          this.invDtlList[rowIndex].productDate = null;
          this.invDtlList[rowIndex].expiryDate = null;
          this.invDtlList[rowIndex].batchNo = null;
          return false;
        }
      }

      this.selectedItems.forEach((element, index) => {
        let emptyRowCount = 0;
        for (let i = 0; i < this.invDtlList.length; i++) {
          if (this.invDtlList[i].newRow === 0) {
            emptyRowCount++;
            // this.length++;
          }
        }
        if (this.selectedItems.length == 1) {
          const element = this.selectedItems[index];
          this.invDtlList[rowIndex].itemId = element.id;
          if (element.productDate !== null) {
            this.invDtlList[rowIndex].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
          }
          if (element.expiryDate !== null) {
            this.invDtlList[rowIndex].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
          }
          this.invDtlList[rowIndex].batchNo = element.batchNo;
          this.invDtlList[rowIndex].orginalQty = element.qoh;
          this.invDtlList[rowIndex].newRow = 1;
          return;
        }
        if (emptyRowCount > 0) {
          const element = this.selectedItems[index];
          this.invDtlList[rowIndex].itemId = element.id;
          if (element.productDate !== null) {
            this.invDtlList[rowIndex].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
          }
          if (element.expiryDate !== null) {
            this.invDtlList[rowIndex].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
          }
          this.invDtlList[rowIndex].batchNo = element.batchNo;
          this.invDtlList[rowIndex].orginalQty = element.qoh;
          if (this.selectedItems.length > emptyRowCount) {
            this.invDtlList[rowIndex].newRow = 1;
          }
        }
        else {
          const existingRow = this.invDtlList.find(row => (row.itemId == ""));
          if (existingRow == undefined) {
            const newRow = {
              itemId: element.id,
              productDate: element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
              expiryDate: element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
              batchNo: element.batchNo,
              orginalQty: element.qoh,
              newRow: element.newRow = 1,
            };
            this.invDtlList.push(newRow);
            this.length = this.length - 1;
          }
        }
        debugger

      })
      // for (let i = 0; i < this.invDtlList.length; i++) {
      //   this.onChangeItem(0,this.invDtlList[i].itemId, i)
      // }

      this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    });

    dialogRef.afterClosed().subscribe(res => {
      debugger
      for (let i = 0; i < this.invDtlList.length; i++) {
        if (this.invDtlList[i].itemId == 0 || this.invDtlList[i].itemId == null)
          this.invDtlList.splice(i, 1);
      }
      this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      // Check Batch Quantity If the User Add Same Batch Multi Rows
      debugger
      if (this.invDtlList.length > 1) {
        let totBatchQty = 0;
        let allBatchQty = 0;
        for (let i = 0; i < this.invDtlList.length; i++) {
          debugger
          const Batch = row.batchNo;
          if (Batch !== "" && Batch !== null && Batch !== undefined) {
            if (this.invDtlList[i].batchNo == Batch && i != rowIndex) {
              debugger
              totBatchQty += (this.invDtlList[i].qty * row.unitRate) + (this.invDtlList[i].bonus * row.bonusUnitRate);
              allBatchQty += this.invDtlList[i].qty * row.unitRate;
              if (totBatchQty + ((this.invDtlList[rowIndex].qty * row.unitRate) + (this.invDtlList[rowIndex].bonus * row.bonusUnitRate)) > this.invDtlList[rowIndex].orginalQty) {
                this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[rowIndex].orginalQty - totBatchQty, 'error');
                this.invDtlList[rowIndex].productDate = null;
                this.invDtlList[rowIndex].expiryDate = null;
                this.invDtlList[rowIndex].batchNo = null;
                return false;
              }
            }
          }
        }
      }
      else {
        if (this.invDtlList.length > 0) {
          let qtyy = 0;
          for (let i = 0; i < this.invDtlList.length; i++) {
            qtyy = (this.invDtlList[i].qty * row.unitRate) + (this.invDtlList[i].bonus * row.bonusUnitRate);
            if (qtyy > row.orginalQty) {
              this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[i].orginalQty, 'error');
              this.invDtlList[i].productDate = null;
              this.invDtlList[i].expiryDate = null;
              this.invDtlList[i].batchNo = null;
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

  onStoreChange(event: any, row: any, index: number) {
    debugger
    if (this.useStoreInGrid) {
      if (this.DeliveryItemsAddForm.value.purOrdersIds == "" && this.DeliveryItemsAddForm.value.purinvoiceIds == "" && this.reqPurInvoice == 0 && this.purchaseInvoices == 0) {
        setTimeout(() => {
          // if (row.qty > 0) {
          this.invDtlList[index].qty = "";
          this.invDtlList[index].price = "";
          this.invDtlList[index].cost = "";
          this.invDtlList[index].productDate = null;
          this.invDtlList[index].expiryDate = null;
          this.invDtlList[index].batchNo = "";
          this.invDtlList[index].orginalQty = 0;
          this.invDtlList[index].newRow = 0;
          this.showRemainQty = false;
          this.cdr.detectChanges();
          // }

        });
      }
    }
    else {
      debugger
      if (this.invDtlList.length > 0 && this.oldStoreId > 0 && this.reqPurInvoice == 0) {
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
            this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            debugger
            this.DeliveryItemsAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
      this.OnQtyChange(0, this.invDtlList[index], index);
    }

  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
    }, 3000);
  }

  listofproduct(returnList: any, index: number) {
    this.OpenItemsInfoForm(returnList, index);
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != undefined && this.voucherStoreId != null) {
        this.DeliveryItemsAddForm.get("storeId").setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.DeliveryItemsAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.DeliveryItemsAddForm.get("storeId").setValue(0);
      }
    }
  }

  PrintDeliveryItems(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptDeliveryItemsAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptDeliveryItemsEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.InvService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.DeliveryItemsAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailDeliveryVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.DeliveryItemsAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailDeliveryVoucher();
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
    this.DeliveryItemsAddForm.get("id").setValue(0);
    this.DeliveryItemsAddForm.get("accountId").setValue(0);
    this.DeliveryItemsAddForm.get("branchId").setValue(0);
    this.DeliveryItemsAddForm.get("dealerId").setValue(0);
    this.DeliveryItemsAddForm.get("costCenterId").setValue(0);
    this.DeliveryItemsAddForm.get("refVoucherId").setValue(0);
    this.DeliveryItemsAddForm.get("note").setValue('');
    this.DeliveryItemsAddForm.get("purinvoiceIds").setValue('');
    this.DeliveryItemsAddForm.get("purOrdersIds").setValue(0);
    this.DeliveryItemsAddForm.get("invVouchersDTModelList").setValue([]);
    this.DeliveryItemsAddForm.get("itemsSerialList").setValue([]);
    this.DeliveryItemsAddForm.get("generalAttachModelList").setValue([]);
    this.DeliveryItemsAddForm.get("refVoucherTypeId").setValue('');
    this.DeliveryItemsAddForm.get("refVoucherId").setValue('');
    this.DeliveryItemsAddForm.get("storeId").setValue(0);
    this.DeliveryItemsAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.invDtlList = [];
    this.childAttachment.data = [];
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

  DeleteDeliveryItems(Id) {

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
        this.DeliService.DeleteDeleviryItemsVoucher(Id).subscribe((result) => {

          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ItemsDeliveryVoucher/ItemsDeliveryList']);
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

  calcTotal() {
    debugger
    let sumTotal = 0;
    for (let i = 0; i < this.invDtlList.length; i++) {
      const qty = this.invDtlList[i].qty;
      const bonus = this.invDtlList[i].bonus || 0;
      let price = parseFloat(this.invDtlList[i].cost);
      let total = (qty + bonus) * price;
      this.invDtlList[i].cost = price.toFixed(this.decimalPlaces);
      this.invDtlList[i].total = total.toFixed(this.decimalPlaces);
      sumTotal += total;
    }

    if (isNaN(sumTotal)) {
      sumTotal = 0;
    }

    // Assign totals after the loop completes
    this.formatedTotal = this.formatCurrency(sumTotal);

  }

}
