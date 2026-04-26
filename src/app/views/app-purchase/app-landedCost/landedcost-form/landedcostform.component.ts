import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { LandedCostService } from '../landedcost.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
@Component({
  selector: 'app-landedcostform',
  templateUrl: './landedcostform.component.html',
  styleUrl: './landedcostform.component.scss'
})
export class LandedcostformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  LandedCostForm: FormGroup;
  public TitlePage: string;
  loading: boolean;
  opType: string;
  voucherId: any;
  isdisabled: boolean = false;
  showLoader = false;
  decimalPlaces: number;
  disableAll: boolean;
  disableSave: boolean;
  lang: string;
  NewDate: any;
  showsave: boolean;
  disableCurrRate: boolean;
  voucherTypeEnum = 233;
  allowAccRepeat: any;
  allowMultiCurrency: boolean;
  defaultCurrencyId: number;
  disableVouchertype: boolean = false;
  validDate = true;
  dealerInfo:string;
  labelName:string;
  voucherType: any;

  allUntiesList: any;
  unitsList: Array<any> = [];
  expensesModelList: any[] = [];
  landedCostDtList: any[] = [];
  voucherTypeList: any;
  currnciesList: any;
  suppliersList: any;
  branchesList: any;
  itemsList: any;
  allUnitesList: any;
  expensesList: any;
  accountsList: any;
  vouchersList:any;
  allvouchersList:any;
  selectedVoucherType: any;
  previousSelection: number[] = [];

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



  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private Service: LandedCostService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "LandedCost";
    this.disableSave = false;
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
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['LandedCost/LandedCostList']);
    }
    
    this.InitiailLandedCostForm();
    this.GetInitailLandedCost();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('LandedCostForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailLandedCostForm() {
    this.LandedCostForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required]],
      voucherNo: [0, [Validators.required]],
      voucherDate: ["", [Validators.required]],
      dealerId: [0, [Validators.required]],
      currencyId: [0, [Validators.required]],
      currRate: [0, [Validators.required]],
      note: [""],
      branchId: [0],
      status: [0],
      referenceNo: [""],
      referenceDate: [""],
      receiptIds: ["", [Validators.required]],
      totalExpenses: [0],
      totalItemsValue: [0],
      brokerId: [0],
      landedCostDtModels: [null],
      expensesModelList: [null,[Validators.required, Validators.min(1)]],
      generalAttachModelList: [null],
    });
  }

  GetInitailLandedCost() {
    var lang = this.jwtAuth.getLang();
    this.Service.GetInitailandedCost(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['LandedCost/LandedCostList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
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
        printAfterSave: item.printAfterSave
      }));

      this.expensesList = result.expensesList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.expensesNameA : item.expensesNameE,
      }));

      this.purchaseCucleCycle = result.invoiceCycleSetting.purchaseWorkCycle;
      this.pCycle1 = result.invoiceCycleSetting.purchasseCycle1;
      this.pCycle2 = result.invoiceCycleSetting.purchasseCycle2;
      this.pCycle3 = result.invoiceCycleSetting.purchasseCycle3;
      this.pCycle4 = result.invoiceCycleSetting.purchasseCycle4;
      if(this.purchaseCucleCycle == this.pCycle1 || this.purchaseCucleCycle == this.pCycle3)
        {
          this.labelName = "ReceiptVouchersList"
          this.vouchersList = result.receiptVouchersList;
          this.allvouchersList = result.receiptVouchersList;
        }
      if(this.purchaseCucleCycle == this.pCycle2 || this.purchaseCucleCycle == this.pCycle4)
        {
          this.labelName = "PurchaseInvoicesList"
          this.vouchersList = result.purchaseInvoicesList;
          this.allvouchersList = result.purchaseInvoicesList;
        }
      
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.defaultCurrencyId = result.defaultCurrency;
      this.currnciesList = result.currnciesList;
      this.suppliersList = result.suppliersList;
      this.branchesList = result.branchesList;
      this.allUnitesList = result.countriesList;
      this.accountsList = result.accountsList;
      this.decimalPlaces = result.decimalPlaces;
      this.landedCostDtList = result.landedCostDtModels;
      if (result.generalAttachModelList != null && result.generalAttachModelList != undefined) {
        if (result.generalAttachModelList.length > 0) {
          this.childAttachment.data = result.generalAttachModelList;
          this.childAttachment.ngOnInit();
          this.LandedCostForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        }
      }
      if (this.landedCostDtList != null && this.landedCostDtList != undefined) {
        if (this.landedCostDtList.length > 0) {
         
          this.LandedCostForm.get("landedCostDtModels").setValue(this.landedCostDtList);
        }
      }
       if (result.expensesModelList !== undefined && result.expensesModelList !== null && result.expensesModelList.length > 0) {
        this.expensesModelList = result.expensesModelList;
        for (let i = 0; i < this.expensesModelList.length; i++) {
          this.expensesModelList[i].transDate = formatDate(this.expensesModelList[i].transDate, "yyyy-MM-dd", "en-US");
        }
        this.CalculateNewCost();
      }
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      this.LandedCostForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.dealerInfo = result.dealerName;
          this.LandedCostForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.LandedCostForm.get("voucherNo").setValue(result.voucherNo);
          this.LandedCostForm.get("voucherDate").setValue(result.voucherDate);
          this.LandedCostForm.get("dealerId").setValue(result.dealerId);
          this.LandedCostForm.get("currencyId").setValue(result.currencyId);
          this.LandedCostForm.get("currRate").setValue(result.currRate);
          this.LandedCostForm.get("note").setValue(result.note);
          this.LandedCostForm.get("branchId").setValue(result.branchId);
          this.LandedCostForm.get("referenceNo").setValue(result.referenceNo);
          this.LandedCostForm.get("referenceDate").setValue(result.referenceDate);
          this.LandedCostForm.get("receiptIds").setValue(result.receiptIds);
          this.LandedCostForm.get("totalExpenses").setValue(result.totalExpenses);
          this.LandedCostForm.get("totalItemsValue").setValue(result.totalItemsValue);
          this.ConvertIdsToNumber(result);
        }
        else {
          this.NewDate = new Date;
          // this.LandedCostForm.get("voucherTypeId").setValue(0);
          this.LandedCostForm.get("voucherNo").setValue(0);
          this.LandedCostForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
          this.LandedCostForm.get("dealerId").setValue(0);
          this.LandedCostForm.get("currencyId").setValue(0);
          this.LandedCostForm.get("currRate").setValue(0);
          this.LandedCostForm.get("note").setValue("");
          this.LandedCostForm.get("branchId").setValue(0);
          this.LandedCostForm.get("referenceNo").setValue("");
          this.LandedCostForm.get("referenceDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
          this.LandedCostForm.get("receiptIds").setValue('');
          this.LandedCostForm.get("totalExpenses").setValue(0);
          this.LandedCostForm.get("totalItemsValue").setValue(0);
          this.LandedCostForm.get("brokerId").setValue(0);
          this.dealerInfo = "";
          if(this.LandedCostForm.value.voucherTypeId > 0)
            {
              this.getVoucherNo(this.LandedCostForm.value.voucherTypeId);
            }
        }
      });
    })
  }

  OnSaveForms() {
    debugger
    if (this.CheckValidationOnSave() == false) {
      return;
    }
    debugger
    this.LandedCostForm.value.companyId = this.jwtAuth.getCompanyId();
    this.LandedCostForm.value.userId = this.jwtAuth.getUserId();
    this.LandedCostForm.get("landedCostDtModels").setValue(this.landedCostDtList);
    this.LandedCostForm.get("expensesModelList").setValue(this.expensesModelList);
    this.LandedCostForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
    let totalItems = this.landedCostDtList.reduce((sum, item) => sum + parseFloat(item.vendorPrice), 0); 
    let totalExp = this.expensesModelList.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    totalItems= this.parseCurrency(totalItems);
    totalExp= this.parseCurrency(totalExp);
    this.LandedCostForm.get("totalExpenses").setValue(totalExp);
    this.LandedCostForm.get("totalItemsValue").setValue(totalItems);
    this.ConvertIdsToString();
    this.Service.SaveLandedCost(this.LandedCostForm.value).subscribe((result) => {
        debugger

        if (result) {
          this.alert.SaveSuccess();
          this.disableSave = false;
          if (this.opType == 'Edit') {
            this.router.navigate(['LandedCost/LandedCostList']);
          }
          this.clearFormdata();

          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.landedCostDtList ??= [];
    this.landedCostDtList.push(
      {
        id: 0,
        hdId: 0,
        billNo:0,
        itemId: 0,
        unitId:0,
        qty: 0,
        vendorPrice: 0,
        allocatedPercent: 0,
        allocatedAmount: 0,
        finalCost: 0,
        invDTId: 0,
        storeId:0,
        index: ""
      });
    this.LandedCostForm.get("customsInvoicesModels").setValue(this.landedCostDtList);
  }

  deleteRow(rowIndex: number) {
    this.landedCostDtList.splice(rowIndex, 1);
    this.LandedCostForm.get("customsInvoicesModels").setValue(this.landedCostDtList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  DeleteVoucher(id: any) {
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
        this.Service.DeleteVoucher(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['LandedCost/LandedCostList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
        // No action needed if the user cancels
      }
    })
  }

  CheckValidationOnSave() {
    if (this.landedCostDtList.length > 0) {
      for (let i = 0; i < this.landedCostDtList.length; i++) 
        {
          const element = this.landedCostDtList[i];
          element.vendorPrice = this.parseCurrency(element.vendorPrice)
          element.allocatedPercent = this.parseCurrency(element.allocatedPercent)
          element.allocatedAmount = this.parseCurrency(element.allocatedAmount)
          element.finalCost = this.parseCurrency(element.finalCost)
        }


      for (let i = 0; i < this.landedCostDtList.length; i++) {
        const element = this.landedCostDtList[i];
        if (element.billNo == 0 || element.billDate == "" || element.amount == 0) {
          this.alert.ShowAlert("PleaseInserRequierdFieldsInTable", 'error');
          return false;
        }
      }
    }

    if (this.expensesModelList.length > 0) {
      for (let i = 0; i < this.expensesModelList.length; i++) {
        const element = this.expensesModelList[i];
        if (element.expensesTypeId == 0 || element.transDate == "" || element.amount == 0 || element.creditAccId == 0) {
          this.alert.ShowAlert("msgEnterAllDataExpenses", 'error');
          this.disableSave = false;
          return false;
        }
       if (!element.affectCost && (element.debitAccId == 0 || element.debitAccId == null || element.debitAccId == undefined)) {
          this.alert.ShowAlert("PleaseEnterDebitAccount", 'error');
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.LandedCostForm.get("id").setValue(0);
    // this.LandedCostForm.get("voucherTypeId").setValue(0);
    this.LandedCostForm.get("voucherNo").setValue(0);
    this.LandedCostForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.LandedCostForm.get("dealerId").setValue(0);
    this.LandedCostForm.get("currencyId").setValue(0);
    this.LandedCostForm.get("currRate").setValue(0);
    this.LandedCostForm.get("note").setValue(0);
    this.LandedCostForm.get("branchId").setValue(0);
    this.LandedCostForm.get("referenceNo").setValue('');
    this.LandedCostForm.get("referenceDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.LandedCostForm.get("receiptIds").setValue('');
    this.LandedCostForm.get("totalExpenses").setValue(0);
    this.LandedCostForm.get("totalItemsValue").setValue(0);
    this.landedCostDtList = [];
    this.LandedCostForm.get("landedCostDtModels").setValue(this.landedCostDtList);
    this.expensesModelList = [];
    this.LandedCostForm.get("expensesModelList").setValue(this.expensesModelList);
    this.LandedCostForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.voucherId = 0;
    this.opType = 'Add';
    this.GetInitailLandedCost();
  }

  ConvertIdsToString() {
    debugger
    let C1 = this.LandedCostForm.value.receiptIds;
    if (Array.isArray(C1)) {
      let validC1 = C1
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let C1String = validC1.join(',');
      this.LandedCostForm.get("receiptIds").setValue(C1String);
      console.log('Filtered receiptIds:', C1String);
    } else {
      console.error('receiptIds is not an array');
    }

  }

  ConvertIdsToNumber(data) {
    debugger
    if (data.receiptIds != null && data.receiptIds != undefined && data.receiptIds != "" && data.receiptIds != "0") {
      let A1 = data.receiptIds.split(',').map(Number)
      this.LandedCostForm.get("receiptIds").setValue(A1);
    }
    else {
      this.LandedCostForm.get("receiptIds").setValue("");
    }
  }

  calculateSum() {
    return this.formatCurrency(
      this.landedCostDtList.reduce((sum, item) => {
        const Tot = parseFloat(item.amount);

        // Check for invalid qty or price and treat them as 0 if invalid
        const ValidTot = isNaN(Tot) ? 0 : Tot;

        return sum + (ValidTot);
      }, 0)
    );
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    if(selectedValue == 0 || selectedValue == null || selectedValue == undefined)
      {
        this.LandedCostForm.get("voucherNo").setValue(0);
      }  
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.voucherTypeEnum;
    var voucherTypeId = this.LandedCostForm.value.voucherTypeId;
    var date = new Date(this.LandedCostForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.Service.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.LandedCostForm.get("voucherNo").setValue(results);
        }
        else {
          this.LandedCostForm.get("voucherNo").setValue(1);
        }
      });
    }
    debugger
    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.LandedCostForm.get("branchId").setValue(branchId);
    }
    debugger
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.decimalPlaces = this.currnciesList.find(option => option.id === currencyId).data2;
    }
    else {
      this.decimalPlaces = this.currnciesList.find(option => option.id === this.defaultCurrencyId).data2;
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.LandedCostForm.get("currencyId").setValue(currencyId);
      var currRate = this.currnciesList.find(option => option.id === currencyId).data1;
      this.LandedCostForm.get("currRate").setValue(currRate);
      if (this.LandedCostForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.LandedCostForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currnciesList.find(option => option.id === this.defaultCurrencyId).data1;
      this.LandedCostForm.get("currRate").setValue(currRate);
      if (this.LandedCostForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    // if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
    //   this.Service.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {

    //     if (res.id > 0) {
    //       if (res.status == 66) {
    //         this.voucherId = res.id;
    //         this.opType = "Edit";
    //         this.showsave = false;
    //         this.LandedCostForm.get("generalAttachModelList").setValue([]);
    //         this.childAttachment.data = [];
    //         this.cdr.detectChanges();
    //         this.disableAll = false;
    //         this.financialvoucher.ngOnInit()
    //         this.GetInitailLandedCost();
    //       }
    //       else if (res.status == 67 || res.status == 68) {
    //         this.voucherId = res.id;
    //         this.opType = "Show";
    //         this.LandedCostForm.get("generalAttachModelList").setValue([]);
    //         this.childAttachment.data = [];
    //         this.showsave = true;
    //         this.cdr.detectChanges();
    //         this.financialvoucher.ngOnInit()
    //         this.GetInitailLandedCost();
    //       }
    //     }
    //     else {
    //       this.voucherId = 0;
    //       this.opType = "Add";
    //       this.showsave = false;
    //       this.disableVouchertype = false;
    //       this.disableAll = false;
    //       this.cdr.detectChanges();
    //       this.clearFormdata();
    //     }
    //   })


    // }
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

  AddNewLineExpenses() {
    if (this.disableAll == true) {
      return;
    }
    if (this.expensesModelList == null) {
      this.expensesModelList = [];
    }
    this.expensesModelList.push(
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
    this.LandedCostForm.get("expensesModelList").setValue(this.expensesModelList);
  }

   GetExpensesAccounts(event, rowIndex) {
    if (event.value > 0) {
      this.Service.getExpensesAccounts(event.value).subscribe(res => {

        if (res) {

          this.expensesModelList[rowIndex].debitAccId = res.debitAccId;
          this.expensesModelList[rowIndex].creditAccId = res.creditAccId;
        }
      })
    }
  }

  toggleIncludeCost(event, index) {
    this.expensesModelList[index].isValid = event.currentTarget.checked;
    this.expensesModelList[index].affectCost = event.currentTarget.checked; 
    this.CalculateNewCost();
  }

  getCurrencyRate(event: any, CurrId: any) {
    if (event.value > 0) {
      const selectedValue = event.value;
      let currRate = this.currnciesList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.currnciesList.find(option => option.id === selectedValue).data2;
      this.LandedCostForm.get("currRate").setValue(currRate);
      if (event.value == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      
    }
    else {
      const selectedValue = CurrId;
      let currRate = this.currnciesList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.currnciesList.find(option => option.id === selectedValue).data2;
      this.LandedCostForm.get("currRate").setValue(currRate);
      
    }
  }

  GetDealerInfo(event:any)
  {
    debugger
    if(event.value > 0)
      {
        let acc = this.suppliersList.find(r => r.id == event.value)?.data2 ?? 0 ;
        if(acc > 0)
          {
            let accountId = Number(acc);
            let dealername = this.accountsList.find(r => r.id == accountId)?.data1 ?? "";
            this.dealerInfo = dealername;
          }
          this.vouchersList = this.allvouchersList.filter(c=> c.data2 == event.value);
      }
    else
      {
        this.dealerInfo =""
      }

  }

  OnVouchersChange(ReceiptIds :any)
  {
    debugger
    if (ReceiptIds != "") {
      this.Service.GetVouchersToReCost(ReceiptIds).subscribe(res => {
        debugger
        if (res) {
          this.landedCostDtList = res.landedCostDtModels;
          this.expensesModelList = res.expensesModelList;
          for (let i = 0; i < this.expensesModelList.length; i++) {
            this.expensesModelList[i].transDate = formatDate(this.expensesModelList[i].transDate, "yyyy-MM-dd", "en-US");
          }
          this.calculateSumExp();         
          this.CalculateNewCost();
          this.LandedCostForm.get("expensesModelList").setValue(this.expensesModelList);
          this.LandedCostForm.get("landedCostDtModels").setValue(this.landedCostDtList);
        }
      })
    }

  }

  calculateSumExp() {
    return this.formatCurrency(this.expensesModelList.reduce((sum, item) => sum + parseFloat(item.amount), 0));
  }

  OnReceiptChange(event: any) {
    debugger
  const newSelection: number[] = event;
  if(newSelection.length == 0)
    {
      this.landedCostDtList =[];
      this.LandedCostForm.get("landedCostDtModels").setValue(this.landedCostDtList);
      return;
    }
  if (newSelection.length < this.previousSelection.length) {
        this.Service.GetVouchersToReCost(this.LandedCostForm.value.receiptIds).subscribe(res => {
        debugger
        if (res) {
          this.landedCostDtList = res;
          this.CalculateNewCost();
        }
      })
      }
  this.previousSelection = [...newSelection];
}

  CalculateNewCost()
  {
    debugger
    let row = this.expensesModelList.filter(r => r.affectCost);
    if(row.length > 0)
      {
        let totalItems = this.landedCostDtList.reduce((sum, item) => sum + parseFloat(item.vendorPrice), 0); 
        let totalExp = this.expensesModelList.filter(item => item.affectCost).reduce((sum, item) => sum + parseFloat(item.amount), 0)
        for (let i = 0; i < this.landedCostDtList.length; i++) 
          {
            this.landedCostDtList[i].allocatedPercent = this.formatCurrency(((this.landedCostDtList[i].vendorPrice/totalItems) * 100));
            this.landedCostDtList[i].allocatedAmount = this.formatCurrency(((this.landedCostDtList[i].vendorPrice / totalItems) * totalExp))
            this.landedCostDtList[i].finalCost = this.formatCurrency(this.parseCurrency(this.landedCostDtList[i].vendorPrice) + this.parseCurrency(this.landedCostDtList[i].allocatedAmount));
          }
      }
    else
      {
        for (let i = 0; i < this.landedCostDtList.length; i++) 
          {
            this.landedCostDtList[i].allocatedPercent = 0;
             this.landedCostDtList[i].allocatedAmount = 0;
             this.landedCostDtList[i].finalCost = 0;
          }
      }
    
  }

  calculateSumitems()
  {
    return this.formatCurrency(this.landedCostDtList.reduce((sum, item) => sum + parseFloat(item.vendorPrice), 0));
  }

  deleteRowExpenses(rowIndex: number) {
    if (rowIndex !== -1) {
      this.expensesModelList.splice(rowIndex, 1);
    }
    this.CalculateNewCost();
    this.LandedCostForm.get("expensesModelList").setValue(this.expensesModelList);    
  }

  parseCurrency(value: any): number {
    if (!value) return 0;
    return Number(value.toString().replace(/,/g, '')) || 0;
  }
  

}
