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
import { PurchaseInvoiceService } from '../purchaseinvoice.service';
import { EntryitemsserialsComponent } from 'app/views/general/app-EnterItemsSerial/entryitemsserials.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import Swal from 'sweetalert2';
import { TreeQueryNode } from '@devexpress/analytics-core/analytics-wizard-internal';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-purchaseinvoice-form',
  templateUrl: './purchaseinvoice-form.component.html',
  styleUrls: ['./purchaseinvoice-form.component.scss']
})
export class PurchaseinvoiceFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  PurcahseInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  purInvoiceDTsList: any[] = [];
  purExpensesList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  voucherType: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 39;
  isHidden: boolean = false;
  //header Lists
  voucherTypeList: any;
  invoiceTypesList: any;
  branchesList: any;
  suppliersList: any;
  costCenterList: any;
  paymentTermsList: any;
  currencyList: any;
  //END
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
  //END
  purchaseRequestList: any;
  receiptsList: any;
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
  disablebuttons: boolean = false;
  disableAll: boolean = false;
  hideExpenses : boolean = false;
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
  isInputDisabled: boolean = true;
  // Invoice Cycle Setting 
  purchaseCucleCycle: number;
  pCycle1: number;
  pCycle2: number;
  pCycle3: number;
  pCycle4: number;
  hideGetFromPurchaseOrder: boolean;
  hideGetFromRecieptVoucher: boolean;
  //End
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  UseTax: boolean;
  defaultCurrencyId: number;
  oldStoreId: any;
  showRemainQty: boolean;
  allowMultiCurrency: boolean;
  allowAccRepeat: any;
  //DealerInfoModel
  dealerBalance: number = 0;
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
  disableSave: boolean;
  Lang: string;
  disapleVoucherType: boolean = false;
  disableDetails: boolean = false;
  voucherStoreId: number;
  hideSerials: boolean = false;
  disableVouchers: boolean = false;
  totalExpenses:any =0;
  CostingDecimalPlaces:number;
  DefaultStoreId: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private purService: PurchaseInvoiceService,
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
    
    this.voucherType = "Invoice";
    this.disableSave = false;
    this.route.queryParams.subscribe((params: Params) => {

      this.voucherNo = +params['voucher'];
    });
    if (isNaN(this.voucherNo)) {
      this.voucherNo = 0;
    }
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
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
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['PurchaseInvoice/PurchaseInvoiceList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PurchaseInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.PurcahseInvoiceAddForm = this.formbulider.group({
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
      storeId: [0],
      note: [""],
      amount: [0],
      status: [null],
      userId: [0],
      purOrdersIds: [""],
      receiptIds: [""],
      accountId: [0, [Validators.required, Validators.min(1)]],
      debitAccId: 0,
      purchaseInvoiceModelList: [null, [Validators.required, Validators.minLength(1)]],
      purchaseExpensesModelList: [null],
      itemsSerialList: [null],
      generalAttachModelList: [null]
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null;
  }

  GetInitailEntryVoucher() {
    var lang = this.jwtAuth.getLang();
    this.purService.GetInitailPurchaseInvoice(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['PurchaseInvoice/PurchaseInvoiceList']);
        // this.dialogRef.close(false);
        return;
      }
      debugger
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
        debitAccId: item.debitAccId,
        creditAccId: item.creditAccId,
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
        taxId : item.taxId,
      }));

      this.suppliersList = result.suppliersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));


      // Billing system           
      this.purchaseCucleCycle = result.invoiceCycleSetting.purchaseWorkCycle;
      this.pCycle1 = result.invoiceCycleSetting.purchasseCycle1;
      this.pCycle2 = result.invoiceCycleSetting.purchasseCycle2;
      this.pCycle3 = result.invoiceCycleSetting.purchasseCycle3;
      this.pCycle4 = result.invoiceCycleSetting.purchasseCycle4;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.oldStoreId = 0;


      if (this.purchaseCucleCycle == this.pCycle1) {
        this.hideGetFromPurchaseOrder = false;
        this.hideGetFromRecieptVoucher = false;
      }
      else if (this.purchaseCucleCycle == this.pCycle2) {
        this.hideGetFromPurchaseOrder = false;
        this.hideGetFromRecieptVoucher = true;
      }
      else if (this.purchaseCucleCycle == this.pCycle3) {
        this.hideGetFromPurchaseOrder = true;
        this.hideGetFromRecieptVoucher = false;
      }
      else if (this.purchaseCucleCycle == this.pCycle4) {
        this.hideGetFromPurchaseOrder = true;
        this.hideGetFromRecieptVoucher = true;
      }
      if (this.purchaseCucleCycle == this.pCycle1) {
        this.receiptsList = [];
      }
      else {
        this.receiptsList = result.receiptVoucherLists.map((item) => ({
          label: item.id,
          value: item.note,
        }));
      }
      // End
      this.purchaseRequestList = result.purchaseOrderList.map(item => ({
      label: item.note,   // 👈 shows FULL text
      value: item.id     // 👈 stores ID
      }));

      this.expensesTypeList = result.expensesList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.expensesNameA : item.expensesNameE,
      }));
      if (Number(result.purOrdersIds) > 0) {

        this.GetPurchaseOrder(0, 0, Number(result.purOrdersIds));
      }
      // 
      if (Number(result.receiptIds) > 0) {
        // this.disableVouchers =true;
        this.hideSerials = true;
      }
      // if(Number(result.purOrdersIds) > 0 && Number(result.receiptIds) == 0)
      //   {
      //     this.disableDetails = true;
      //   }
      // if(this.voucherId > 0 && Number(result.purOrdersIds) > 0)
      //   {
      //     this.disableVouchers = true;
      //   }
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.CostingDecimalPlaces = result.costingDecimalPlaces;
      if(this.CostingDecimalPlaces == 0)
        {
          this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
        }
      else
        {
          this.decimalPlaces = this.CostingDecimalPlaces;
        }
      
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
      this.hideExpenses = result.hideExpenses;
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
      if (result.purchaseExpensesModelList !== undefined && result.purchaseExpensesModelList !== null && result.purchaseExpensesModelList.length > 0) {
        this.purExpensesList = result.purchaseExpensesModelList;
        for (let i = 0; i < this.purExpensesList.length; i++) {
          this.purExpensesList[i].transDate = formatDate(this.purExpensesList[i].transDate, "yyyy-MM-dd", "en-US");
        }
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
          element.cost = element.cost.toFixed(this.decimalPlaces)
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
        this.purInvoiceDTsList[i].expiryDate = this.purInvoiceDTsList[i].expiryDate == null ? null : formatDate(this.purInvoiceDTsList[i].expiryDate, "yyyy-MM-dd", "en-US");
        this.purInvoiceDTsList[i].productDate = this.purInvoiceDTsList[i].productDate == null ? null : formatDate(this.purInvoiceDTsList[i].productDate, "yyyy-MM-dd", "en-US");
      }
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onChangeItem(0, this.purInvoiceDTsList[i], i)
      }

      this.PurcahseInvoiceAddForm.patchValue(result);
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
          this.PurcahseInvoiceAddForm.get("itemsSerialList").setValue(result.purchaseSerialsModelList);
        }
      }
      else {
        this.PurcahseInvoiceAddForm.get("itemsSerialList").setValue([]);
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.PurcahseInvoiceAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {

          this.PurcahseInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.PurcahseInvoiceAddForm.get("invoiceType").setValue(result.invoiceType);
          this.PurcahseInvoiceAddForm.get("accountId").setValue(result.accountId);
          this.PurcahseInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.PurcahseInvoiceAddForm.get("dealerId").setValue(result.dealerId);
          this.PurcahseInvoiceAddForm.get("costCenterId").setValue(result.costCenterId);
          this.PurcahseInvoiceAddForm.get("paymentTerm").setValue(result.paymentTerm);
          this.PurcahseInvoiceAddForm.get("deliveryPeriod").setValue(result.deliveryPeriod);
          this.PurcahseInvoiceAddForm.get("deliveryTime").setValue(result.deliveryTime);
          this.PurcahseInvoiceAddForm.get("referenceNo").setValue(result.referenceNo);
          this.PurcahseInvoiceAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.PurcahseInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          this.PurcahseInvoiceAddForm.get("purOrdersIds").setValue(Number(result.purOrdersIds));
          this.PurcahseInvoiceAddForm.get("receiptIds").setValue(Number(result.receiptIds));
          if(this.CostingDecimalPlaces == 0)
            {
              this.decimalPlaces = result.currencyList.find(option => option.id === result.currencyId).data2;
            }
          else
            {
              this.decimalPlaces = this.CostingDecimalPlaces;
            }
          
          for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
            this.onCheckboxChange(0);
          }
          if (!this.useStoreInGrid) {
            this.PurcahseInvoiceAddForm.get("storeId").setValue(result.storeId);
          }
          this.PurcahseInvoiceAddForm.get("note").setValue(result.note);


          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.PurcahseInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.PurcahseInvoiceAddForm.get("branchId").setValue(result.branchId);
          }


        }
        else {
          this.PurcahseInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.PurcahseInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.PurcahseInvoiceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.PurcahseInvoiceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.PurcahseInvoiceAddForm.get("branchId").setValue(defaultBranche.id);
          }
          this.clearTotals();
          if (this.PurcahseInvoiceAddForm.value.currencyId == 0) {
            this.PurcahseInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.PurcahseInvoiceAddForm.get("currRate").setValue(currRate);
          }
          this.PurcahseInvoiceAddForm.get("invoiceType").setValue(0);
          this.PurcahseInvoiceAddForm.get("dealerId").setValue(0);
          this.PurcahseInvoiceAddForm.get("costCenterId").setValue(0);
          this.PurcahseInvoiceAddForm.get("paymentTerm").setValue(0);
          this.PurcahseInvoiceAddForm.get("storeId").setValue(0);
          this.DefaultStoreId = result.defaultStoreId;

        }
        this.GetVoucherTypeSetting(this.PurcahseInvoiceAddForm.value.voucherTypeId);
        if (this.PurcahseInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }

        if (this.voucherNo > 0) {
          this.PurcahseInvoiceAddForm.get("purOrdersIds").setValue(Number(this.voucherNo));
          this.GetPurchaseOrder(0, this.voucherNo, 0);
        }
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else {
          this.disableAll = false;
        }
        debugger
        if(this.purInvoiceDTsList.length > 0 && !this.useAccountInGrid)
          {
            const DebitAccId = this.purInvoiceDTsList[0].accountId;
            this.PurcahseInvoiceAddForm.get("debitAccId")?.setValue(DebitAccId);
          }                
      });
    })
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
            this.PurcahseInvoiceAddForm.get("invVouchersDTModelList").setValue(this.purInvoiceDTsList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {

            this.PurcahseInvoiceAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
      this.purInvoiceDTsList.forEach(element => {
        element.storeId = event.value;
      });
    }

  }

  OnSaveForms() {

    //  this.disableSave = true;
    let stopExecution = false;
    if (this.isCash == 0) {
      if (this.PurcahseInvoiceAddForm.value.dealerId == 0) {
        this.alert.ShowAlert("PleaseInsertDealer", 'error');
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
      if (this.PurcahseInvoiceAddForm.value.receiptIds && element.accountId == 0) {
        element.accountId = this.PurcahseInvoiceAddForm.value.debitAccId;
      }
      if (element.itemId == 0 || element.unitId == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }


      if(element.bonus ==0)
        {
          if(element.qty == 0 || element.price == 0)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        }
        else if(element.qty > 0 && element.price == 0)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        else if(element.price > 0 && element.qty == 0)
          {
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
      // if(this.useAccountInGrid == true)
      //   {
      //     if (element.accountId == 0 || element.accountId == null || element.accountId == undefined) {
      //       this.alert.ShowAlert("msgEnterAllData", 'error');
      //       stopExecution = true;
      //       this.disableSave = false;
      //       return false;
      //     }
      //   }
      element.i = i.toString();
    }

    if (this.useStoreInGrid == false) {
      if (this.PurcahseInvoiceAddForm.value.storeId == 0 || this.PurcahseInvoiceAddForm.value.storeId == null || this.PurcahseInvoiceAddForm.value.storeId == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        const element = this.purInvoiceDTsList[i];
          let storeId = this.PurcahseInvoiceAddForm.value.storeId;
          element.storeId = storeId;       
        element.i = i.toString();
      }
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
      if (this.useSerial == true && this.hideSerials == false) {
        if (item.hasSerial) {
          if (this.PurcahseInvoiceAddForm.value.itemsSerialList == null || this.PurcahseInvoiceAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          const checkedItemCount = this.PurcahseInvoiceAddForm.value.itemsSerialList.reduce((count, item) => {
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

          const item1 = this.PurcahseInvoiceAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.rowIndex === index);
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


  if(this.PurcahseInvoiceAddForm.value.dealerId != 0 && this.PurcahseInvoiceAddForm.value.dealerId != null && this.PurcahseInvoiceAddForm.value.dealerId != undefined)
    {
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        var IsTaxable = this.suppliersList.find(x => x.id === this.PurcahseInvoiceAddForm.value.dealerId)?.IsTaxable ?? false;
        if (IsTaxable == true && this.purInvoiceDTsList[i].taxId == 0) {
          this.alert.ShowAlert("msgMustSelectTaxForSupplier", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }
    }
    

    for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
  let item = this.purInvoiceDTsList[i];
      item.cost ??= 0;
      item.bonus ??= 0;   
      item.bonusUnitId ??= 0;
      item.bonusUnitRate ??= 0;
      item.accountId ??= 0;
      item.taxId ??= 0;
      item.taxAmt ??= 0;
      item.purOrderId ??= 0;
      item.receiptId ??= 0;
      item.discountPerc ??= 0;
      item.discountAmt ??= 0;
      if(item.qty == null || item.qty == undefined || item.qty == "")
        {
          item.qty = 0; 
        }
      if(item.price == null || item.price == undefined || item.price == "")
        {
          item.price = 0; 
        }
    }


     
    let serials = this.PurcahseInvoiceAddForm.value.itemsSerialList;
    if(serials){
      if(serials.length > 0)
      {     
        if(!this.useStoreInGrid)
          {
            for (let i = 0; i < serials.length; i++) 
            {
              const store = this.PurcahseInvoiceAddForm.value.storeId;
              serials[i].storeId = store;
            }
          }
        
      }      
    }

    this.PurcahseInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.PurcahseInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.PurcahseInvoiceAddForm.value.voucherNo = this.PurcahseInvoiceAddForm.value.voucherNo.toString();
    this.PurcahseInvoiceAddForm.value.purchaseInvoiceModelList = this.purInvoiceDTsList;
    if(Number(this.fNetTotal.replace(/,/g, '')) > 0)
      {
        let numberValue = parseFloat(this.fNetTotal.replace(/,/g, '')).toFixed(this.decimalPlaces);
        this.PurcahseInvoiceAddForm.get("amount").setValue(numberValue);
      }
    else
      {
        this.PurcahseInvoiceAddForm.get("amount").setValue(0);
      }
    
    // this.PurcahseInvoiceAddForm.get("storeId").setValue(0);
    this.PurcahseInvoiceAddForm.get("status").setValue(0);
    this.PurcahseInvoiceAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.purService.SavePurchaseInvoice(this.PurcahseInvoiceAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.PurcahseInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintPurchaseInvoice(Number(result.message));
          }

          this.clearFormdata();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['PurchaseInvoice/PurchaseInvoiceList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.ShowAlert(result.message, 'error');
          this.disableSave = false;
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    //this.clearFormdata();
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.PurcahseInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.PurcahseInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.PurcahseInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.purService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.PurcahseInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.PurcahseInvoiceAddForm.get("voucherNo").setValue(1);
        }
      });
    }
    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.PurcahseInvoiceAddForm.get("branchId").setValue(branchId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      if(this.CostingDecimalPlaces == 0)
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
        }
      else
        {
          this.decimalPlaces = this.CostingDecimalPlaces;
        }
      
    }
    else {
       if(this.CostingDecimalPlaces == 0)
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
        }
      else
        {
          this.decimalPlaces = this.CostingDecimalPlaces;
        }      
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.PurcahseInvoiceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.PurcahseInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.PurcahseInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.PurcahseInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.PurcahseInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.PurcahseInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
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
      if(this.CostingDecimalPlaces == 0)
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
        }
      else
        {
          this.decimalPlaces = this.CostingDecimalPlaces;
        }      
      this.PurcahseInvoiceAddForm.get("currRate").setValue(currRate);
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
      if(this.CostingDecimalPlaces == 0)
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
        }
      else
        {
          this.decimalPlaces = this.CostingDecimalPlaces;
        }
      this.PurcahseInvoiceAddForm.get("currRate").setValue(currRate);
      for (let i = 0; i < this.purInvoiceDTsList.length; i++) {
        this.onCheckboxChange(0);
      }
    }
  }

  getaccountId(voucherType, type, index) {
    if (this.disableAll == true) {
      return;
    }
    this.purAccId = this.voucherTypeList.find(option => option.label === voucherType).debitAccId;
    if (type == 1) {
      this.AddNewLineDetails();
    }
    else if (type == 2) {
      this.onAddRowBefore(index);
    }
    else {
      this.PurcahseInvoiceAddForm.get("debitAccId").setValue(this.purAccId);
      }
  }

  AddNewLineDetails() {
    if (this.purInvoiceDTsList == null) {
      this.purInvoiceDTsList = [];
    }
    if (!this.useStoreInGrid) {
      if (this.PurcahseInvoiceAddForm.value.storeId == 0) {
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
        discountPerc: 0,
        discountAmt: 0,
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
        index: ""
      });
    this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
  }

  AddNewLineExpenses() {
    
    if (this.disableAll == true) {
      return;
    }
    if (this.purExpensesList == null) {
      this.purExpensesList = [];
    }
    this.purExpensesList.push(
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
        dealerId: 0
      });
    this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList").setValue(this.purExpensesList);
  }

  // toggleIncludeCost(event, index) {
  //   this.purExpensesList[index].affectCost = event.currentTarget.checked;
  // }

  calculateSum() {
    var amount = "0"
    amount = this.formatCurrency(this.purInvoiceDTsList.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)) - (parseFloat(item.discountAmt)) + parseFloat(item.taxAmt), 0));
    return parseFloat(amount);
  }

  deleteRow(rowIndex: number) {

    let stopexe = false;
    if (this.PurcahseInvoiceAddForm.value.itemsSerialList != null) {
      this.PurcahseInvoiceAddForm.value.itemsSerialList.forEach(element => {
        if (element.rowIndex == rowIndex) {
          stopexe = true;
        }
      });
      if (stopexe) {
        this.alert.ShowAlert("CantDeleteRowTheresSerialsAttachedWithRow", 'error');
        return;
      }
    }

    if (rowIndex !== -1) {
      this.purInvoiceDTsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
      if (this.PurcahseInvoiceAddForm.value.itemsSerialList != null) {
        let indexToRemove = this.PurcahseInvoiceAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
        if (indexToRemove !== -1) {
          this.PurcahseInvoiceAddForm.value.itemsSerialList.splice(indexToRemove, 1);
        }
      }

    }


    // if (rowIndex !== -1) {
    //   this.purInvoiceDTsList.splice(rowIndex, 1);
    // }

    this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    this.clearTotals();
    this.onCheckboxChange(0);
    this.cdr.detectChanges();
  }

  deleteRowExpenses(rowIndex: number) {
    
    if (rowIndex !== -1) {
      this.purExpensesList.splice(rowIndex, 1);
    }
    this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList").setValue(this.purExpensesList);
    this.calculateSumExp();
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
      mainBouns: 0,
      index: ""
    };

    this.purInvoiceDTsList.splice(rowIndex, 0, newRow);
    this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
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

    this.purExpensesList.splice(rowIndex, 0, newRow);
    this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList").setValue(this.purExpensesList);
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/accountsstatement?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  onChangeItem(event, Row, i) {
     
    if (event.value == undefined) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.bonus == 0 || Row.bonus == null) {
        this.bounsunitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.purService.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          
          this.unitsList[i] = res;
          if(!(this.purInvoiceDTsList[i].unitId > 0)){
            if (res.length == 2) {
              this.purInvoiceDTsList[i].unitId = res[1].id;
            }
            else if (this.opType == "Edit") {
              let unit = this.unitsList[i].find(r => r.id == Row.unitId);
              if (unit == 0 || unit == undefined || unit == null) {
                this.purInvoiceDTsList[i].unitId = 0;
                return;
              }
              if (this.purInvoiceDTsList[i].unitId != 0) {
                this.purInvoiceDTsList[i].unitId = Row.unitId;
              }
            }
            else if(res.length > 2 && Row.bonus == 0){
              this.purInvoiceDTsList[i].unitId = res[0].id;
            }           
          }

          if (Row.bonus == 0 || Row.bonus == null) {
            this.bounsunitsList[i] = [];
          }
          else {
            this.bounsunitsList[i] = res;
          }
          this.onChangeUnit(this.purInvoiceDTsList[i], i,false);
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
        this.purService.GetItemUnitbyItemId(event.value).subscribe(res => {
          
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.purInvoiceDTsList[i].unitId = res[1].id;
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
          this.onChangeUnit(this.purInvoiceDTsList[i], i,false);
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
    if(this.opType == 'Add' && Row.taxId == 0)
      {
        let taxId = this.itemsList.find(r => r.id == Row.itemId).taxId;
        if(taxId !== null && taxId !== undefined && taxId !== 0)
          {
            this.purInvoiceDTsList[i].taxId =taxId;
          }
        else
          {
            this.purInvoiceDTsList[i].taxId =0;
          }
      }
    
  }

  OnQtyChange(event: any, row: any, Index: number) {

    if (this.PurcahseInvoiceAddForm.value.purOrdersIds > 0 || this.PurcahseInvoiceAddForm.value.receiptIds > 0) {
      // if (this.opType == 'Edit') {
      if (Number((row.qty * row.unitRate)) > (row.mainQty)) {
        if (row.unitRate > 1) {
          const updatedElement = { ...this.purInvoiceDTsList[Index], qty: 0, unitId: 0 };
          this.purInvoiceDTsList[Index] = updatedElement;
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainQty, 'error');
          return false;
        }
        else {
          const updatedElement = { ...this.purInvoiceDTsList[Index], qty: row.mainQty };
          this.purInvoiceDTsList[Index] = updatedElement;
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainQty, 'error');
          return false;
        }
      }
      // }
      // else {
      //   if (Number((row.qty * row.unitRate)) > (row.mainQty)) {
      //     const updatedElement = { ...this.purInvoiceDTsList[Index], qty: row.orgQty };
      //     this.purInvoiceDTsList[Index] = updatedElement;
      //     this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.orgQty, 'error');
      //     return false;
      //   }
      // }
    }
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    this.onCheckboxChange(0);
    this.CalculateNewCost();
  }

  onChangeBouns(event, row, index) {
    
    if (this.PurcahseInvoiceAddForm.value.purOrdersIds > 0 || this.PurcahseInvoiceAddForm.value.receiptIds > 0) {
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

      }
    }
  }

  OnPriceChange(row: any) {
    
    if (row.qty !== 0 && row.price !== 0) {
        row.total = row.qty * row.price;       
        row.total = this.formatCurrency(row.total);
        //row.total = row.total.toFixed(this.decimalPlaces)       
    }
  }

  OnPriceBlur(row: any, index) {
    
    if (row.price !== null && row.price !== undefined) {
       row.price = this.formatCurrency(row.price);
       //row.price = Number(row.price.toFixed(this.decimalPlaces))
    }
    
    this.FormatDiscount(row, index);    
    this.onCheckboxChange(0);
    this.CalculateNewCost();
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
    return this.appCommonserviceService.formatCurrency(value, 3);
  }

  onCheckboxChange(event) {

    let i = 0;
    if (event !== 0) {
      if (event.currentTarget.checked) {
        this.PurcahseInvoiceAddForm.get("priceWithTax").setValue(true);
      }
      else {
        this.PurcahseInvoiceAddForm.get("priceWithTax").setValue(false);
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

    for (const element of this.purInvoiceDTsList) {
      // Format specific numeric fields with three decimal places
      this.fTotal = Number((Number(this.fTotal) + Number(element.total)));
      this.fTotalGridNet = Number((Number(this.fTotalGridNet) + Number(parseFloat(element.netTotal.replace(/,/g, '')))));
      this.fDiscount = Number(Number(this.fDiscount) + Number(element.discountAmt));
      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(element.taxAmt)));      
    }
    
    this.fNetTotal = Number((Number(this.fTotalGridNet)) + Number(this.totalExpenses));
    this.fTotal = this.formatCurrency(this.fTotal);
    this.fDiscount = this.formatCurrency(this.fDiscount);
    this.fTaxTotal = this.formatCurrency(this.fTaxTotal);
    this.fNetTotal = this.formatCurrency(this.fNetTotal);
    this.fTotalGridNet = this.formatCurrency(Number(this.fTotalGridNet));

    if (Number(String(this.fNetTotal).replace(/,/g, '')) + Number(this.dealerBalance) > Number(String(this.dealerAmt).replace(/,/g, ''))) {
      if (this.dealerPolicy === 60) {
        this.showPrevent = false;
        this.showAlert = true;
        this.hideLabelAfterDelay();
      }
      else if (this.dealerPolicy === 61) {
        this.showPrevent = true;
        this.showAlert = false;
        this.hideLabelAfterDelay();
        for (const element of this.purInvoiceDTsList) {
          element.price = 0;
          element.total = 0;
        }
      }
    }
  }

  calculateValues(i) {

    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    if (this.purInvoiceDTsList.length > 0 && this.purInvoiceDTsList[i].taxId > 0) {
      const tax = this.taxesList.find(option => option.id === this.purInvoiceDTsList[i].taxId);

      if (tax && tax.data1) {
        // Convert to string, trim spaces, and replace Arabic & standard comma decimal separators
        let taxValue = tax.data1.toString().trim().replace(/[٫,]/g, '.');
        let numericTaxValue = Number(taxValue);
        this.purInvoiceDTsList[i].taxPerc = !isNaN(numericTaxValue) ? numericTaxValue : 0;
      } else {
        this.purInvoiceDTsList[i].taxPerc = 0;
      }
    }
    if (this.pricewTax == 1) {
      if (isNaN(this.purInvoiceDTsList[i].qty) || isNaN(this.purInvoiceDTsList[i].price)) {
        // Handle invalid input gracefully
        return;
      }
      this.purInvoiceDTsList.forEach(element => {
        // element.cost = this.purInvoiceDTsList[i].price;
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
        this.purInvoiceDTsList[i].taxAmt = 0;
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
      for (const element of this.purInvoiceDTsList) {
        element.priceWithTax = Number(element.price) +
          (element.price * (element.taxPerc / 100))
      }
      // Calculate total
      const qty = this.purInvoiceDTsList[i].qty;
      let total = qty * this.purInvoiceDTsList[i].price;
      this.purInvoiceDTsList[i].total = total.toFixed(this.decimalPlaces);//this.formatCurrency(total);
      let taxAmt = parseFloat(this.purInvoiceDTsList[i].taxAmt);
      this.purInvoiceDTsList[i].taxAmt = taxAmt.toFixed(this.decimalPlaces);
      let discountAmt = parseFloat(this.purInvoiceDTsList[i].discountAmt);
      this.purInvoiceDTsList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);
      // Calculate net total      
      if (isNaN(this.purInvoiceDTsList[i].discountPerc)) {
        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - Number(this.purInvoiceDTsList[i].taxAmt));
        this.purInvoiceDTsList[i].netTotal = this.formatCurrency(this.purInvoiceDTsList[i].netTotal);//.toFixed(this.decimalPlaces);
      }
      else if (isNaN(this.purInvoiceDTsList[i].taxAmt)) {
        this.purInvoiceDTsList[i].netTotal =
          (Number(this.purInvoiceDTsList[i].total) - (Number(this.purInvoiceDTsList[i].discountAmt)));
        this.purInvoiceDTsList[i].netTotal = this.formatCurrency(this.purInvoiceDTsList[i].netTotal);//.toFixed(this.decimalPlaces);
      }
      else {
        this.purInvoiceDTsList[i].netTotal =
          ((Number(this.purInvoiceDTsList[i].total) + Number(this.purInvoiceDTsList[i].taxAmt)) - Number(this.purInvoiceDTsList[i].discountAmt));
        this.purInvoiceDTsList[i].netTotal = this.formatCurrency(this.purInvoiceDTsList[i].netTotal);//.toFixed(this.decimalPlaces);
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
        this.purInvoiceDTsList[i].taxAmt = 0;
      }
      this.purInvoiceDTsList[i].netTotal =
        ((Number(this.purInvoiceDTsList[i].total) + Number(this.purInvoiceDTsList[i].taxAmt)) - Number(this.purInvoiceDTsList[i].discountAmt));
      this.purInvoiceDTsList[i].netTotal = this.formatCurrency(this.purInvoiceDTsList[i].netTotal);//.toFixed(this.decimalPlaces);
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

  FormatDiscount(row, i) {
    if (row.discountAmt == "" || row.discountPerc == "") {
      row.discountAmt = 0;
      row.discountPerc = 0;
      this.onCheckboxChange(0);
    }
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
    
    if (event.value == 0) {
      const updatedElement = { ...this.purInvoiceDTsList[i], taxAmt: 0, taxPerc: 0 };
      this.purInvoiceDTsList[i] = updatedElement;
      this.cdr.detectChanges();
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
  debugger
    if (event.currentTarget.checked && voucherType !== 0 && voucherType > 0) {
      this.purAccId = this.voucherTypeList.find(option => option.label === voucherType).debitAccId;
      var creditAccId = this.voucherTypeList.find(option => option.label === voucherType).creditAccId;
      this.PurcahseInvoiceAddForm.get("accountId").setValue(creditAccId);
      this.PurcahseInvoiceAddForm.get("isCash").setValue(true);
    }
    else {
      this.PurcahseInvoiceAddForm.get("accountId").setValue(0);
      this.PurcahseInvoiceAddForm.get("isCash").setValue(false);
    }
    this.cdr.detectChanges();
  }

  getDealerAcc(event) {
    let dealerId = 0;
    if (event.value)
      dealerId = event.value;
    else
      dealerId = event;

    if (dealerId) {
      var acc = this.suppliersList.find(option => option.id === dealerId).data2;
      setTimeout(() => {
        this.PurcahseInvoiceAddForm.get("accountId").setValue(acc);
        this.PurcahseInvoiceAddForm.get("dealerId").setValue(dealerId)
        this.cdr.detectChanges();
      });
    }
    if (dealerId) {
      this.purService.GetDealerInfo(dealerId).subscribe(res => {

        if (res) {
          let DealerName = this.suppliersList.find(r => r.id == dealerId).text;
          this.dealerBalance = res.balance;
          this.dealerAmt = res.amt;
          this.dealerChequeAmt = res.chequeAmt;
          this.dealerPolicy = res.policy;
          this.NoteAlert = "Warning:Thesupplierhasexceededthepermittedfinanciallimit";
          this.NotePrevenet = "Thesupplierhasexceededthepermittedfinanciallimit";
          this.NoteBalance = "رصيد المورد " + "-" + DealerName + ": " + Math.abs(res.balance).toFixed(3) + " , " + "سقف المورد" + ": " + res.amt.toFixed(3);
          this.showBalance = true;
          this.showAlert = false;
          this.showPrevent = false;
          this.hideLabelAfterDelay();
          this.onCheckboxChange(0);
        }
      })

    }

  }

  onChangeUnit(Row, i ,type) {
    if (type == true) {
      this.purInvoiceDTsList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.purService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {        
        this.purInvoiceDTsList[i].unitRate = res;
      });
    }
  }

  onChangeBounsUnit(Row, i) {
   
    if (Row.bonus > 0 && Row.bonusUnitId == 0) {
      this.purInvoiceDTsList[i].bonus = 0;
    }
    if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
      this.purService.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {

        this.purInvoiceDTsList[i].bonusUnitRate = res;
      });
    }
  }

  openSerialsPopup(row: any, rowIndex: number) {

    if (this.disableAll == true) {
      return;
    }
    if (this.isRequierdSerial(row) == true) {
      return
    }
    if (row.bonusUnitId == 0 && row.bonus > 0) {
      return;
    }
    if (this.PurcahseInvoiceAddForm.value.receiptIds !== "" && this.PurcahseInvoiceAddForm.value.receiptIds !== 0 && this.PurcahseInvoiceAddForm.value.receiptIds !== null) {
      if (row.qty + (row.bonus * row.bonusUnitRate) > row.qty + row.mainBouns) {
        this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", row.mainBouns, 'error');
        return;
      }
    }

    row.firstOpen = row.firstOpen ?? true
    if (this.PurcahseInvoiceAddForm.value.itemsSerialList === null) {
      this.PurcahseInvoiceAddForm.get("itemsSerialList").setValue([]);
    }
    this.serialsListss = this.PurcahseInvoiceAddForm.value.itemsSerialList.filter(item => item.itemId == row.itemId && item.rowIndex == rowIndex);
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
        qty: (row.qty * row.unitRate) + (row.bonus * row.bonusUnitRate),
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        transList: this.tabelData,
        storeId: row.storeId,
        kind: this.opType,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          row.res = res;
          var newList = this.PurcahseInvoiceAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.PurcahseInvoiceAddForm.get("itemsSerialList").setValue(newList);
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
    this.fTotalGridNet = 0;
    this.onCheckboxChange(0);
  }

  calculateSumExp() {
    // Calculate total as a pure number
    const total = this.purExpensesList.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0
    );

    // Save numeric value
    this.totalExpenses = total.toFixed(3);

    // Return formatted string if needed for display
    return this.formatCurrency(total);
  }

  CheckIfAllowEditBatch(row, index) {

    if (row.batchNo !== '' && row.batchNo !== null && row.batchNo !== undefined && row.batchNo !== "") {
      if (row.itemId !== 0 && row.itemId !== null) {
        this.purService.GetAllowEditBatch(row.batchNo, row.itemId).subscribe(result => {
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

  }

  GetPurchaseOrder(event, id, orderId) {

  this.resetFormBasics();

  if (this.purchaseCucleCycle === this.pCycle1) {

    const sourceId = event?.value || id || orderId;

    if (!this.isValid(sourceId)) return;

    this.purService.GetReceiptslist(sourceId, this.voucherId).subscribe(res => {

      // Receipts
      if (res?.receiptVoucherLists?.length > 0) {
        this.receiptsList = this.mapReceipts(res.receiptVoucherLists);

        // Auto-select if only 2
        if(this.opType == 'Add')
          {
             if (this.receiptsList.length === 2) {
              const recId = this.receiptsList[1].value;

              this.PurcahseInvoiceAddForm.get("receiptIds")?.setValue(recId);
              this.GetReceiptVoucherItems({ value: recId }, recId);
            }
          }       
      }

      // Header data
      this.applyHeaderData(res);
    });

  } else {

    const sourceId = event?.value || id;
    if (!this.isValid(sourceId)) return;

    this.purService.GetItemsByOrder(sourceId).subscribe(res => {
      if (!res) return;

      this.disableDetails = true;

      this.purInvoiceDTsList = res.purchaseInvoiceModelList || [];
      this.purExpensesList = res.purchaseExpensesModelList || [];

      // Expenses
      this.purExpensesList.forEach(e => {
        e.transDate = formatDate(e.transDate, "yyyy-MM-dd", "en-US");
        e.dealerId ??= 0;
      });

      this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList")
        ?.setValue(this.purExpensesList);

      // Items
      this.prepareItems(res);

      // Header
      this.applyHeaderData(res);

      // Final updates
      this.calculateSumExp();
      this.CalculateNewCost();
      this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList")?.setValue(this.purInvoiceDTsList);
    });
  }
  }

  GetReceiptVoucherItems(event, id) {
    debugger
  const value = event?.value || id;

    if (!this.isValid(value)) {
      this.resetFormBasics();
      this.disablebuttons = false;
      this.hideSerials = false;
      return;
    }

  this.disablebuttons = true;
  this.hideSerials = true;

  this.purInvoiceDTsList = [];
  this.clearTotals();

  this.purService.getReceiptVoucherItems(value).subscribe(res => {
    if (!res) {
      this.PurcahseInvoiceAddForm.get("itemsSerialList")?.setValue([]);
      return;
    }

    this.purInvoiceDTsList = res.purchaseInvoiceModelList || [];

    this.prepareItems(res);

    // Expenses
    if (res.purchaseExpensesModelList?.length) {
      this.purExpensesList = res.purchaseExpensesModelList;

      this.purExpensesList.forEach(e => {
        e.transDate = formatDate(e.transDate, "yyyy-MM-dd", "en-US");
        e.debitAccId = e.creditAccId;

        const acc = this.suppliersList.find(x => x.id === res.dealerId)?.data2;
        e.creditAccId = acc;
      });

      this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList")?.setValue(this.purExpensesList);
      this.calculateSumExp();
    }

    // Header
    this.applyHeaderData(res);

    if (this.isValid(res.accountId)) {
      this.PurcahseInvoiceAddForm.get("debitAccId")?.setValue(res.accountId);
    }

    this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList")
      ?.setValue(this.purInvoiceDTsList);

    if (res.purchaseSerialsModelList?.length) {
      this.PurcahseInvoiceAddForm.get("itemsSerialList")
        ?.setValue(res.purchaseSerialsModelList);
    }
  });
}

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != undefined && this.voucherStoreId != null) {
        this.PurcahseInvoiceAddForm.get("storeId").setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.PurcahseInvoiceAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.PurcahseInvoiceAddForm.get("storeId").setValue(0);
      }
    }

  }

  GetExpensesAccounts(event, rowIndex) {

    if (event.value > 0) {
      this.purService.getExpensesAccounts(event.value).subscribe(res => {

        if (res) {

          this.purExpensesList[rowIndex].debitAccId = res.debitAccId;
          this.purExpensesList[rowIndex].creditAccId = res.creditAccId;
        }
      })
    }
  }

  DeletePurchaseInvoice(Id, voucherTypeId, voucherNo) {

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
        this.purService.DeletePurchaseInvoice(Id, voucherTypeId, voucherNo, this.voucherTypeEnum).subscribe((results) => {

          if (results.isSuccess === true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['PurchaseInvoice/PurchaseInvoiceList']);
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

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 10000);
  }

  PrintPurchaseInvoice(Id: number) {

    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptPurchaseInvoiceAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptPurchaseInvoiceEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {

    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.purService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {

        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            this.PurcahseInvoiceAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.cdr.detectChanges();
            this.disableAll = false;
            this.financialvoucher.ngOnInit()
            this.GetInitailEntryVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.PurcahseInvoiceAddForm.get("generalAttachModelList").setValue([]);
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
    this.PurcahseInvoiceAddForm.get("id").setValue(0);
    this.PurcahseInvoiceAddForm.get("invoiceType").setValue(0);
    this.PurcahseInvoiceAddForm.get("accountId").setValue(0);
    this.PurcahseInvoiceAddForm.get("debitAccId").setValue(0);
    this.PurcahseInvoiceAddForm.get("branchId").setValue(0);
    this.PurcahseInvoiceAddForm.get("dealerId").setValue(0);
    this.PurcahseInvoiceAddForm.get("costCenterId").setValue(0);
    this.PurcahseInvoiceAddForm.get("paymentTerm").setValue(0);
    this.PurcahseInvoiceAddForm.get("deliveryPeriod").setValue(0);
    this.PurcahseInvoiceAddForm.get("deliveryTime").setValue(0);
    this.PurcahseInvoiceAddForm.get("referenceNo").setValue('');
    this.PurcahseInvoiceAddForm.get("storeId").setValue(0);
    this.PurcahseInvoiceAddForm.get("referenceDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.PurcahseInvoiceAddForm.get("note").setValue('');
    this.isCash = 0;
    this.pricewTax = 0;
    this.PurcahseInvoiceAddForm.value.purInvoiceDTsList = [];
    this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList").setValue([]);
    this.PurcahseInvoiceAddForm.get("itemsSerialList").setValue([]);
    this.PurcahseInvoiceAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.purInvoiceDTsList = [];
    this.purExpensesList = [];
    this.clearTotals();
  }

  CopyRow(row, index) {
    if (Number(this.PurcahseInvoiceAddForm.value.purOrdersIds) > 0 || Number(this.PurcahseInvoiceAddForm.value.receiptIds) > 0) {
      return;
    }
    
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
          expiryDate: "",
          productDate: row.productDate,
          batchNo: "",
          unitRate: 0,
          purOrderId: 0,
          receiptId: 0,
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          orgQty: 0,
          mainBouns: 0,
          index: ""
        });
      this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
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
          expiryDate: "",
          productDate: row.productDate,
          batchNo: "",
          unitRate: row.unitRate,
          purOrderId: 0,
          receiptId: 0,
          netTotal: row.netTotal,
          total: row.total,
          disablebatch: false,
          orgQty: 0,
          mainBouns: 0,
          index: ""
        });
      this.PurcahseInvoiceAddForm.get("purchaseInvoiceModelList").setValue(this.purInvoiceDTsList);
    }
    setTimeout(() => {
      this.purService.GetItemUnitbyItemId(row.itemId).subscribe(res => {
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

  getItemExp(row: any) {
  return this.itemsList.find(item => item.id === row.itemId) || {};
  }

  toggleIncludeCost(event, index) {
    this.purExpensesList[index].isValid = event.currentTarget.checked;
    this.purExpensesList[index].affectCost = event.currentTarget.checked; 
    this.CalculateNewCost();
  }

  CalculateNewCost()
  {
    
    let row = this.purExpensesList.filter(r => r.affectCost);
    if(row.length > 0)
      {
        let totalItems = this.purInvoiceDTsList.reduce((sum, item) => sum + (Number.parseFloat(item.total) - Number.parseFloat(item.discountAmt)), 0); 
        let totalExp = this.purExpensesList.filter(item => item.affectCost).reduce((sum, item) => sum + Number.parseFloat(String(item.amount)), 0)
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) 
          {
            let row = this.purInvoiceDTsList[i];
            let rowTotal = Number(row.total - row.discountAmt);
            let totall = Number(rowTotal / totalItems) * totalExp;
            let cost = row.qty == 0 ? 0 : (totall + rowTotal)/row.qty;
            this.purInvoiceDTsList[i].cost = this.formatCurrency(cost);
            // let Expnet = this.formatCurrency(((this.purInvoiceDTsList[i].price / totalItems) * totalExp))
            // this.purInvoiceDTsList[i].cost = this.formatCurrency(this.parseCurrency(this.purInvoiceDTsList[i].price) + this.parseCurrency(Expnet));
          }
      }
    else
      {
        for (let i = 0; i < this.purInvoiceDTsList.length; i++) 
          {
             this.purInvoiceDTsList[i].cost = 0;
          }
      }    
  }

  parseCurrency(value: any): number {
    if (!value) return 0;
    return Number(value.toString().replace(/,/g, '')) || 0;
  }

  private isValid(val: any): boolean {
  return val !== null && val !== undefined && val !== 0;
  }

  private resetFormBasics() {
    this.purInvoiceDTsList = [];
    this.receiptsList = [];
    this.PurcahseInvoiceAddForm.patchValue({
      dealerId: 0,
      accountId: 0
    });
  this.clearTotals();
  }

  private mapReceipts(list: any[]) {
    return list.map(item => ({
      label: item.note,
      value: item.id
    }));
  }

  private applyHeaderData(res: any) {
    const form = this.PurcahseInvoiceAddForm;

    if (this.isValid(res.branchId)) form.get("branchId")?.setValue(res.branchId);
    if (this.isValid(res.dealerId)) {
      form.get("dealerId")?.setValue(res.dealerId);
      this.getDealerAcc(res.dealerId);
    }
    if (this.isValid(res.currencyId)) form.get("currencyId")?.setValue(res.currencyId);
    if (this.isValid(res.currRate)) form.get("currRate")?.setValue(res.currRate);
    if (this.isValid(res.storeId)) form.get("storeId")?.setValue(res.storeId);

    if (this.isValid(res.paymentTerm)) form.get("paymentTerm")?.setValue(res.paymentTerm);
    if (this.isValid(res.deliveryPeriod)) form.get("deliveryPeriod")?.setValue(res.deliveryPeriod);
    if (res.deliveryTime) form.get("deliveryTime")?.setValue(res.deliveryTime);
  }

  private prepareItems(res: any) {

    let index = 0;

    this.purInvoiceDTsList.forEach((element, i) => {

      element.total = element.qty * element.price;
      element.expiryDate = element.expiryDate
        ? formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")
        : null;

      element.orgQty = res.purchaseInvoiceModelList[i].qty;
      element.mainBouns = res.purchaseInvoiceModelList[i].bonus * res.purchaseInvoiceModelList[i].bonusUnitRate;
      element.mainQty = res.purchaseInvoiceModelList[i].qty * res.purchaseInvoiceModelList[i].unitRate;

      const item = this.itemsList.find(x => x.id === element.itemId);

      if (item) {
        this.unitsList[index] = this.allUntiesList.filter(u => u.id == element.unitId);
        element.unitId = element.unitId;
        this.bounsunitsList[index] = this.allUntiesList.filter(u => u.id == element.bonusUnitId);
        index++;
      }

      this.onChangeItem(0, element, i);
      this.isRequierdEx(element, i);
      this.isRequierdBatch(element);
    });

    this.onCheckboxChange(0);
  }


   loadLazyAccountsOptions(event: any) {
                 
    const { first, last } = event;
    

    // Don't replace the full list; copy and fill only the needed range
    if (!this.accountsList) {
        this.accountsList = [];
    }

    // Make sure the array is large enough
    while (this.accountsList.length < last) {
        this.accountsList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.accountsList[i] = this.accountsList[i];
    }

    this.loading = false;
  }



}
