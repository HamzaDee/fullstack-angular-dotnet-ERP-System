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
import { EntryitemsserialsComponent } from 'app/views/general/app-EnterItemsSerial/entryitemsserials.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import { ProdReceiptService } from '../prodReceipt.service';
@Component({
  selector: 'app-prodreceiptform',
  templateUrl: './prodreceiptform.component.html',
  styleUrl: './prodreceiptform.component.scss'
})
export class ProdreceiptformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  oldStoreId: any;
  ReceiptItemsAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  invDtlList: any[] = [];
  purchaseInvoicesList: any;
  receiptExpensesModelList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  voucherType: any;
  NewDate: Date = new Date;
  voucherTypeEnum = 237;
  categoryId: number;
  disableSerials: boolean = false;
  disableAll: boolean = false;
  //header Lists
  voucherTypeList: any;
  branchesList: any;
  suppliersList: any;
  costCenterList: any;
  currencyList: any;
  //
  reqPurInvoice: number;
  purchaseInvoices: number;
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
  oldQty: number = 0;
  voucherNo: number = 0;
  productionOrdersList:any;
  defaultCurrencyId: number;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowCreditAccId: number;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number;
  //End
  showRemainQty: boolean;
  allowMultiCurrency: boolean;
  allowAccRepeat: any;
  disableExp: boolean;
  disableBatch: boolean;
  disableSerial: boolean;
  disableCurrRate: boolean;
  Lang: string;
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  LinkingCreditAccounts: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private service: ProdReceiptService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
      debugger
      this.voucherType = "Inventory";
      this.route.queryParams.subscribe((params: Params) => {
        this.voucherNo = +params['ProdId'];
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
        }
        else {
          this.disableAll = false;
        }
      });
      this.SetTitlePage();
      if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
        this.router.navigate(['ProductionReceipt/ProdReceiptvoucherlist']);
      }
      this.InitiailProdReceiptForm();
      this.GetInitailProdReceipt();
    }

    SetTitlePage() {
        this.TitlePage = this.translateService.instant('ProdReceiptvoucherform');
        this.title.setTitle(this.TitlePage);
    }
    
    InitiailProdReceiptForm() {
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
        generalAttachModelList: [null],
        refVoucherTypeId: [0],
        refVoucherId: [0, [Validators.required, Validators.min(1)]],
      });
    }
  
    greaterThanZeroValidator(control: any) {
      const value = parseFloat(control.value);
      if (isNaN(value) || value <= 0) {
        return { invalidValue: true };
      }
      return null; // Validation passed
    }
  
    GetInitailProdReceipt() {
      var lang = this.jwtAuth.getLang();
      this.service.GetInitailReceiptItemsVoucher(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
        debugger
        // this.ReceiptItemsAddForm.get("accountId").disable();
        if (result.isSuccess === false || result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", "error");
          this.router.navigate(['ProductionReceipt/ProdReceiptvoucherlist']);
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
          creditAccountId: item.creditAccId,
          debitAccountId: item.debitAccId,
          printAfterSave: item.printAfterSave
        }));
  
        this.itemsList = result.itemsList.map((item) => ({
          id: item.id,
          text: item.text,
          storeId: item.storeId,
          hasExpiry: item.hasExpiry,
          hasSerial: item.hasSerial
        }));
   
        this.purchaseRequestList = result.purchaseOrderList.map((item) => ({
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
  
        this.branchesList = result.usersCompanyModels;
        this.currencyList = result.currencyList;
        this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
        this.suppliersList = result.suppliersList;
        this.accountsList = result.accountList;
        this.costCenterList = result.costCenterList;
        this.taxesList = result.taxModelList;
        this.storesList = result.storesList;
        this.allUntiesList = result.unitList;
        this.itemsUnitList = result.unitsList;
        this.defaultCurrencyId = result.defaultCurrency;
        this.hideExpenses = result.hideExpenses;
        this.productionOrdersList=result.productionOrdersList;
        this.expensesTypeList = result.expensesList.map((item) => ({
          label: item.id,
          value: lang == 'ar' ? item.expensesNameA : item.expensesNameE,
        }));
        if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null && result.invVouchersDTModelList.length > 0) {
  
          let index = 0;
          this.invDtlList = result.invVouchersDTModelList;
          this.invDtlList.forEach(element => {
            element.total = element.qty * element.cost;
          })
  
          this.invDtlList.forEach(element => {
            debugger
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                index++;
              }
            });
          })
  
        }
        else {
          this.invDtlList = [];
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
        this.oldStoreId = 0;
        //End
        this.purAccId = 0;

        if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
          this.ReceiptItemsAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
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
          if (this.voucherId > 0) {
            debugger
            this.ReceiptItemsAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
            this.ReceiptItemsAddForm.get("accountId").setValue(result.accountId);
            this.ReceiptItemsAddForm.get("branchId").setValue(result.branchId);
            this.ReceiptItemsAddForm.get("dealerId").setValue(result.dealerId);
            this.invDtlList.forEach(element => {
              this.ReceiptItemsAddForm.get("costCenterId").setValue(element.costCenterId);
            });
            this.ReceiptItemsAddForm.get("refVoucherId").setValue(result.refVoucherId);
            this.ReceiptItemsAddForm.get("currencyId").setValue(result.currencyId);
            this.decimalPlaces = result.currencyList.find(option => option.id === result.currencyId).data2;
            for (let i = 0; i < this.invDtlList.length; i++) {
              this.onCheckboxChange(0);
            }
            if (!this.useStoreInGrid) {
              this.ReceiptItemsAddForm.get("storeId").setValue(result.storeId);
            }
            this.ReceiptItemsAddForm.get("note").setValue(result.note);
            debugger
            let exist = false;
            this.purchaseRequestList.forEach(element => {
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
  
            if (!result.allowMultiCurrency) {
              const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
              this.currencyList = [defaultCurrency];
              this.ReceiptItemsAddForm.get("currencyId").setValue(result.currencyId);
            }
  
            if (!result.allowMultiBranch) {
              const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.branchId);
              this.branchesList = [defaultBranche];
              this.ReceiptItemsAddForm.get("branchId").setValue(result.branchId);
            }
  
          }
          else {
            this.ReceiptItemsAddForm.get("branchId").setValue(result.defaultBranchId);
            this.useCostCenter = result.useCostCenter;
            if (!result.allowMultiCurrency) {
              const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
              this.currencyList = [defaultCurrency];
              this.ReceiptItemsAddForm.get("currencyId").setValue(defaultCurrency.id);
              this.ReceiptItemsAddForm.get("currRate").setValue(defaultCurrency.data1);
            }
            if (!result.allowMultiBranch) {
              const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
              this.branchesList = [defaultBranche];
              this.ReceiptItemsAddForm.get("branchId").setValue(defaultBranche.id);
            }
            debugger
            const defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
            this.ReceiptItemsAddForm.get("voucherTypeId").setValue(defaultVoucher);
            this.getVoucherNo(defaultVoucher);
            if (this.ReceiptItemsAddForm.value.currencyId == 0) {
              this.ReceiptItemsAddForm.get("currencyId").setValue(this.defaultCurrencyId);
              let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
              this.ReceiptItemsAddForm.get("currRate").setValue(currRate);
            }
            this.ReceiptItemsAddForm.get("dealerId").setValue(0);
            this.ReceiptItemsAddForm.get("costCenterId").setValue(0);
            this.ReceiptItemsAddForm.get("storeId").setValue(0);
            this.ReceiptItemsAddForm.get("accountId").setValue(0);
            this.ReceiptItemsAddForm.get("refVoucherId").setValue(0);
            // ......... Credit Account .........//
            this.LinkingCreditAccounts = result.creditAccountId;
            if (this.useAccountInGrid == true) {
              if (result.creditAccountId > 0) {
                this.invDtlList.forEach(element => {
                  element.accountId = result.creditAccountId;
                });
              }
              else {
                this.allowCreditAccId = this.voucherTypeList.find(option => option.label === this.ReceiptItemsAddForm.value.voucherTypeId).creditAccountId;
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
                this.ReceiptItemsAddForm.get("accountId").setValue(result.creditAccountId);
              }
              else {
                this.allowCreditAccId = this.voucherTypeList.find(option => option.label === this.ReceiptItemsAddForm.value.voucherTypeId).creditAccountId;
                if (this.opType == 'Add') {
                  if (this.allowCreditAccId > 0 && this.allowCreditAccId != null) {
                    this.ReceiptItemsAddForm.get('accountId').setValue(this.allowCreditAccId);
                  }
                }
              }
            }
          }
          this.GetVoucherTypeSetting(this.ReceiptItemsAddForm.value.voucherTypeId);
          if (this.ReceiptItemsAddForm.value.currencyId == this.defaultCurrencyId) {
            this.disableCurrRate = true;
          }
          else {
            this.disableCurrRate = false;
          }
        });
        if(this.voucherNo > 0)
          {
            this.GetProductedItemById(this.voucherNo);
          }
      })
    }
    
    OnSaveForms() {
      this.disableSave = true;
      let stopExecution = false;
      if (this.invDtlList.length <= 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
  debugger
      for (let i = 0; i < this.invDtlList.length; i++) {
        const element = this.invDtlList[i];
        if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || !(element.cost > 0) || element.storeId == 0 || element.storeId == null || element.storeId == undefined) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return false;
        }

        element.i = i.toString();
        element.price = element.cost;
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
              this.disableSave = false;
              return false;
            }
            if (this.useBatch == true) {
              if (element.batchNo == "" || element.batchNo == null) {
                this.alert.RemainimgQty("msgPleaseEnterBatch1", item.text, 'error');
                this.disableSave = false;
                return false;
              }
            }
          }
        }
  
        element.index = index.toString();
      }
      // End
      let DebitAcc = this.ReceiptItemsAddForm.value.accountId;
      if(this.inventoryType == 124 && (DebitAcc == null || DebitAcc == undefined || DebitAcc == 0))
        {
           this.alert.ShowAlert("PleaseInsertWork-in-ProcessCalculation", 'error');
            this.disableSave = false;
            return false;
        } 
      this.invDtlList.forEach(element => {
        element.bonusUnitId ??= 0;
      })
      this.ReceiptItemsAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.ReceiptItemsAddForm.value.accountId = this.ReceiptItemsAddForm.get("accountId").value;
      this.ReceiptItemsAddForm.value.userId = this.jwtAuth.getUserId();
      this.ReceiptItemsAddForm.value.voucherNo = this.ReceiptItemsAddForm.value.voucherNo.toString();
      this.ReceiptItemsAddForm.value.invVouchersDTModelList = this.invDtlList;
      const totalSum = this.invDtlList.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
      this.ReceiptItemsAddForm.value.amount = totalSum;
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
  
      this.service.SaveReceiptItemsVoucher(this.ReceiptItemsAddForm.value)
        .subscribe((result) => {
          if (result.isSuccess) {
            this.alert.SaveSuccess();
  
            debugger
            const PrintAfterSave = this.voucherTypeList.find(option => option.label === this.ReceiptItemsAddForm.value.voucherTypeId)?.printAfterSave || false;
            if (PrintAfterSave == true) {
              this.PrintInvreceiptvoucher(Number(result.message));
            }
  
            this.ClearAfterSave();
            if (this.opType == 'Edit' || this.opType == 'Copy') {
              this.router.navigate(['ProductionReceipt/ProdReceiptvoucherlist']);
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
       this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ProdId: 0 },
        queryParamsHandling: 'merge',
      });

      // Optionally also clear your local variable
      this.voucherNo = null;
      setTimeout(() => {
        this.GetVoucherTypeSetting(this.ReceiptItemsAddForm.value.voucherTypeId);
      });
    }
    
    onStoreChange(event: any, row: any, index: number) {
      debugger
      if (this.useStoreInGrid) {
        setTimeout(() => {
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
          // }
  
        });
      }       
    }
    
    getVoucherNo(event: any) {
      debugger
      if (this.voucherNo == 0 || this.voucherNo == null || this.voucherNo == undefined) {
        this.invDtlList = [];
        this.ReceiptItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      }
      const selectedValue = event.value === undefined ? event : event.value;
      const serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
      const currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
      let branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
      this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
      const voucherCategory = this.voucherTypeEnum;
      const voucherTypeId = this.ReceiptItemsAddForm.value.voucherTypeId;
      const date = new Date(this.ReceiptItemsAddForm.value.voucherDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const creditAccountId = this.voucherTypeList.find(option => option.label === selectedValue).creditAccountId;
  
  
      if (voucherTypeId > 0) {
        this.service.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
          debugger
          if (results) {
            debugger
            this.ReceiptItemsAddForm.get("voucherNo").setValue(results);
          }
          else {
            this.ReceiptItemsAddForm.get("voucherNo").setValue(1);
          }
          //         
        });
      }
      debugger
      if (branchId == null || branchId == undefined) {
        branchId = 0;
        this.ReceiptItemsAddForm.get("branchId").setValue(branchId);
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
        this.ReceiptItemsAddForm.get("currencyId").setValue(currencyId);
        let currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.ReceiptItemsAddForm.get("currRate").setValue(currRate);
        if (this.ReceiptItemsAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      }
      else {
        this.ReceiptItemsAddForm.get("currencyId").setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
        this.ReceiptItemsAddForm.get("currRate").setValue(currRate);
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
      let currRate = this.currencyList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
      this.ReceiptItemsAddForm.get("currRate").setValue(currRate);
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
        
    calculateSum() {
      var amount = "0"
      amount = this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.cost)), 0));
      return amount;
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
                   
    OnQtyChange(event: any, row: any, Index: number) {
      debugger
      if (this.reqPurInvoice > 0 || this.purchaseInvoices > 0) {
        if (Number((row.qty * row.unitRate)) > (row.mainQty)) {
          const updatedElement = { ...this.invDtlList[Index], qty: row.orgQty };
          this.invDtlList[Index] = updatedElement;
          let itemName = this.itemsList.find(option => option.id === row.itemId).text;
          itemName = itemName + '    ' + 'المتبقي' + '=' + Number(row.mainQty)
          this.alert.RemainimgQty("CanTAddQuantityMoreThanOrginalQty", itemName, 'error');
          return false;
        }
  
      }
  
  
      if (row.qty !== 0 && row.cost !== 0) {
        row.total = row.qty * row.cost;
        row.total = row.total.toFixed(this.decimalPlaces);
      }
      this.onCheckboxChange(0);
    }
    
    OnPriceChange(row: any) {
      if (row.qty !== 0 && row.cost !== 0) {
        row.total = row.qty * row.cost;
      }
    }
  
    OnPriceBlur(row: any, index) {    
      if (row.cost !== null && row.cost !== undefined) {
        row.cost = Number(row.cost).toFixed(this.decimalPlaces);
        row.total = Number(row.total).toFixed(this.decimalPlaces);
      }
      this.onCheckboxChange(0);
    }
  
    formatAmt(row: any) {
      row.cost = row.cost.toFixed(this.decimalPlaces);
    }
  
    formatCurrency(value: number): string {
      return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
    }
  
    onCheckboxChange(event) {
      let i = 0;
  
      if (event !== 0) {
        if (event.currentTarget.checked) {
          this.ReceiptItemsAddForm.get("priceWithTax").setValue(true);
        }
        else {
          this.ReceiptItemsAddForm.get("priceWithTax").setValue(false);
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
        let cost = parseFloat(this.invDtlList[i].cost);
        this.invDtlList[i].cost = cost.toFixed(this.decimalPlaces);
      }
  
      if (isNaN(this.invDtlList[i].qty) || isNaN(this.invDtlList[i].cost)) {
        // Handle invalid input gracefully
        return;
      }
      // Calculate total
      const qty = this.invDtlList[i].qty;
      let total = qty * this.invDtlList[i].cost;
      this.invDtlList[i].total = total.toFixed(this.decimalPlaces);

      let taxAmount = parseFloat(this.invDtlList[i].taxAmount);
      this.invDtlList[i].taxAmount = taxAmount.toFixed(this.decimalPlaces);
  
      let discountAmt = parseFloat(this.invDtlList[i].discountAmt);
      if (isNaN(discountAmt)) {
        discountAmt = 0;
      }
      this.invDtlList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);
  
  
      // Calculate net total
      if (isNaN(this.invDtlList[i].discount)) {
  
        this.invDtlList[i].netTotal =
          (Number(this.invDtlList[i].total) - Number(this.invDtlList[i].taxAmount));
        this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces); //this.formatCurrency(this.purInvoiceDTsList[i].netTotal);
  
      }
      else if (isNaN(this.invDtlList[i].taxAmount)) {
        this.invDtlList[i].netTotal =
          (Number(this.invDtlList[i].total) - (Number(this.invDtlList[i].discountAmt)));
        this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces);//this.formatCurrency(this.purInvoiceDTsList[i].netTotal);
      }
      else {
        this.invDtlList[i].netTotal =
          ((Number(this.invDtlList[i].total) + Number(this.invDtlList[i].taxAmount)) - Number(this.invDtlList[i].discountAmt));
        this.invDtlList[i].netTotal = this.invDtlList[i].netTotal.toFixed(this.decimalPlaces);//this.formatCurrency(this.purInvoiceDTsList[i].netTotal);
  
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
             
    GetAccounts(event, voucherType: number) {    
      if (event.currentTarget.checked && voucherType !== 0 && voucherType > 0) {
  
        this.service.GetAccounts(voucherType).subscribe(result => {
  
          if (result) {
            this.purAccId = result.creditAccId;
            this.ReceiptItemsAddForm.get("accountId").setValue(result.debitAccId);
          }
        })
      }
      else {
        this.ReceiptItemsAddForm.get("accountId").setValue(0);
      }
  
    }    
    
    onChangeUnit(event, Row, i) {
      debugger
      if (Row.qty > 0 && event > 0) {
        this.invDtlList[i].qty = 0;
      }
      if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
        this.service.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
          debugger
          this.invDtlList[i].unitRate = res;
        });
      }
    }
    
    onChangeBounsUnit(Row, i) {
      if (Row.bonus > 0) {
        if (Row.bonusUnitId !== 0 && Row.bonusUnitId !== null && Row.bonusUnitId !== undefined) {
          this.service.GetUnitRate(Row.itemId, Row.bonusUnitId).subscribe(res => {
            this.invDtlList[i].bonusUnitRate = res;
          });
        }
      }
  
    }
    
    clearTotals() {
      this.fTotal = 0;
      this.fTaxTotal = 0;
      this.fNetTotal = 0;
      this.fDiscount = 0;
      this.onCheckboxChange(0);
    }
  
    CheckIfAllowEditBatch(row, index) {    
      if ((row.batchNo !== '' || row.batchNo !== null || row.batchNo !== undefined) && row.itemId !== 0 || row.itemId !== null) {
        this.service.GetAllowEditBatch(row.batchNo, row.itemId).subscribe(result => {
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
    
    GetVoucherTypeSetting(voucherTypeId: number) {    
      this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
      this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
      this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
      this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
      let CreditAcc = this.voucherTypeList.find(option => option.label === voucherTypeId)?.creditAccountId ?? 0;
      if(CreditAcc > 0)
        {
          this.ReceiptItemsAddForm.get("accountId").setValue(CreditAcc);
        }
      else
        {
          this.ReceiptItemsAddForm.get("accountId").setValue(0);
        } 
      if (this.opType == 'Add') {
        if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
          this.ReceiptItemsAddForm.get('storeId').setValue(this.voucherStoreId);
        }
        else {
          this.ReceiptItemsAddForm.get('storeId').setValue(0);
          this.voucherStoreId = 0;
        }
      }
    }
    
    disableButtons(row: any, index) {
      debugger
      const itemId = row.itemId;
      const item = this.itemsList.find(item => item.id === itemId);
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
    
    voucherNoBlur(VoucherTypeId, VoucherNo) {
      debugger
      if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
        this.service.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
          debugger
          if (res.id > 0) {
            if (res.status == 66) {
              this.voucherId = res.id;
              this.opType = "Edit";
              this.ReceiptItemsAddForm.get("generalAttachModelList").setValue([]);
              this.childAttachment.data = [];
              this.showsave = false;
              this.disableAll = false;
              this.cdr.detectChanges();
              this.financialvoucher.ngOnInit()
              this.GetInitailProdReceipt();
            }
            else if (res.status == 67 || res.status == 68) {
              this.voucherId = res.id;
              this.opType = "Show";
              this.ReceiptItemsAddForm.get("generalAttachModelList").setValue([]);
              this.childAttachment.data = [];
              this.showsave = true;
              this.cdr.detectChanges();
              this.financialvoucher.ngOnInit()
              this.GetInitailProdReceipt();
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
      this.ReceiptItemsAddForm.get("id").setValue(0);
      this.ReceiptItemsAddForm.get("branchId").setValue(0);
      this.ReceiptItemsAddForm.get("dealerId").setValue(0);
      this.ReceiptItemsAddForm.get("costCenterId").setValue(0);
      // this.ReceiptItemsAddForm.get("currencyId").setValue(0);
      // this.ReceiptItemsAddForm.get("currRate").setValue(0);
      this.ReceiptItemsAddForm.get("storeId").setValue(0);
      this.ReceiptItemsAddForm.get("note").setValue('');
      this.ReceiptItemsAddForm.get("purOrdersIds").setValue('');
      this.ReceiptItemsAddForm.get("purinvoiceIds").setValue('');
      // this.ReceiptItemsAddForm.get("accountId").setValue(0);
      this.ReceiptItemsAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
      this.ReceiptItemsAddForm.get("refVoucherTypeId").setValue(0);
      this.ReceiptItemsAddForm.get("refVoucherId").setValue(0);
      this.ReceiptItemsAddForm.get("invVouchersDTModelList").setValue([]);
      this.ReceiptItemsAddForm.get("itemsSerialList").setValue([]);
      this.ReceiptItemsAddForm.get("generalAttachModelList").setValue([]);
      this.ReceiptItemsAddForm.get("receiptExpensesModelList").setValue([]);
      this.childAttachment.data = [];
      this.invDtlList = [];
      this.receiptExpensesModelList = []
      this.calculateSum();
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
            this.service.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
              debugger
              this.unitsList[i] = res;
              this.unitsList[i] = res;
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
              ...this.invDtlList[i], qty: "", cost: "", bonus: "", bonusUnitId: 0, bonusUnitRate: 0, taxId: 0, taxPerc: 0, discount: "",
              expiryDate: "", productDate: "", batchNo: "", unitRate: 0, discountAmt: "", taxAmount: 0, netTotal: 0, total: 0, orginalQty: 0, newRow: 0,
            };
            this.invDtlList[i] = updatedElement;
            this.service.GetItemUnitbyItemId(event.value).subscribe(res => {
              debugger
              this.unitsList[i] = res;
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
        const selectedItem1 = this.itemsList.find(x => x.id === event.value);

        if (selectedItem1 && selectedItem1.storeId > 0) {
          let defaultStoreNo = selectedItem1.storeId;
          this.invDtlList[i].storeId = defaultStoreNo;
          this.cdr.detectChanges();
        }
        
        const selectedItem = this.itemsList.find(x => x.id === event.value);
        if (selectedItem && Number(selectedItem.debitAcc) > 0) {
          this.invDtlList[i].debitAccountId = Number(selectedItem.debitAcc);
        }
      
      this.disableButtons(Row, i);
    }
      
    GetProductedItem(event:any)
    {
      if(event.value > 0 )
        {
          this.service.GetProdProucedItem(event.value).subscribe(res => {
            debugger
            if(res.length > 0)
              {                  
                  let index = 0;
                  this.invDtlList =res;
                  this.invDtlList.forEach(element => {
                    element.total = (element.qty * element.cost).toFixed(this.decimalPlaces);
                    element.price = element.cost.toFixed(this.decimalPlaces);
                    element.cost = element.cost.toFixed(this.decimalPlaces);
                  })
  
                  this.invDtlList.forEach(element => {
                    debugger
                    this.itemsList.forEach(item => {
                      if (item.id === element.itemId) {
                        this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                        index++;
                      }
                    });
                  })
                  for (let i = 0; i < this.invDtlList.length; i++) {
                    this.invDtlList[i].expiryDate = formatDate(this.invDtlList[i].expiryDate, "yyyy-MM-dd", "en-US");
                    this.invDtlList[i].productDate = formatDate(this.invDtlList[i].productDate, "yyyy-MM-dd", "en-US");
                    this.ReceiptItemsAddForm.get("costCenterId").setValue(this.invDtlList[i].costCenterId);
                  }
                  for (let i = 0; i < this.invDtlList.length; i++) {
                    this.onChangeItem(0, this.invDtlList[i], i)
                  }

                 this.ReceiptItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
              }
          })

        }
      else
        {          
          this.invDtlList = [];
          this.ReceiptItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
          this.ReceiptItemsAddForm.get("costCenterId").setValue(0);
        }
    }

    GetProductedItemById(ProdId:any)
    {
      if(ProdId > 0 )
        {
          this.service.GetProdProucedItem(ProdId).subscribe(res => {
            debugger
            if(res.length > 0)
              {                  
                  let index = 0;
                  this.invDtlList =res;
                  this.invDtlList.forEach(element => {
                    element.total = element.qty * element.cost;
                  })
  
                  this.invDtlList.forEach(element => {
                    debugger
                    this.itemsList.forEach(item => {
                      if (item.id === element.itemId) {
                        this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                        index++;
                      }
                    });
                  })
                  for (let i = 0; i < this.invDtlList.length; i++) {
                    this.invDtlList[i].expiryDate = formatDate(this.invDtlList[i].expiryDate, "yyyy-MM-dd", "en-US");
                    this.invDtlList[i].productDate = formatDate(this.invDtlList[i].productDate, "yyyy-MM-dd", "en-US");
                    this.invDtlList[i].total = this.invDtlList[i].total.toFixed(this.decimalPlaces);
                    this.ReceiptItemsAddForm.get("costCenterId").setValue(this.invDtlList[i].costCenterId);
                  }
                  for (let i = 0; i < this.invDtlList.length; i++) {
                    this.onChangeItem(0, this.invDtlList[i], i)
                  }

                 this.ReceiptItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
                 this.ReceiptItemsAddForm.get("refVoucherId").setValue(ProdId);
              }
          })

        }
      else
        {          
          this.invDtlList = [];
          this.ReceiptItemsAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
          this.ReceiptItemsAddForm.get("costCenterId").setValue(0);
        }
    }
}
