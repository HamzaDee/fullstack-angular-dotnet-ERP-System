import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { BankTransferService } from '../banktransfer.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { CostcentertransComponent } from 'app/views/app-account/costcentertrans/costcentertrans.component';
import { ProjectstransComponent } from 'app/views/app-account/projectstrans/projectstrans.component';
import Swal from 'sweetalert2';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import { tr } from 'date-fns/locale';

@Component({
  selector: 'app-banktransfer-form',
  templateUrl: './banktransfer-form.component.html',
  styleUrls: ['./banktransfer-form.component.scss']
})
export class BanktransferFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  BankTransferAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  accountsList: any;
  accountsList2: any;
  accountsList3: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  debitAccountsList: any[] = [];
  creditAccountsList: any[] = [];
  voucherTypeList: any;
  branchesList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  selectedacc1: any;
  selectedacc2: any;
  selectedacc3: any;
  voucherId: any;
  voucherType: any;
  showsave: boolean;
  istype: number;
  isOut: number;
  IsDealerAcc:number;
  decimalPlaces: number;

  disableAll: boolean = false;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  defaultCurrencyId: number;
  disableCurrRate: boolean;
  disableSave: boolean;
  Lang: string;
  disableVouchertype: boolean = false;
  newDate: any;
  customerAndSupplierList: any;
  CompanyName: string;
  hideInfo: boolean;
  CreditTotal: number = 0;
  paymentTypesList: any;
  semesterList: any;

private lastDealerId: number = 0;

  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private bankTransferService: BankTransferService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    debugger
    this.CompanyName = window.localStorage.getItem('companyName');
    if (this.CompanyName != "Noor") {
      this.hideInfo = true;
    }
    else {
      this.hideInfo = false;
    }
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.voucherType = "Accounting";
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
    if (this.voucherId !== 0 || this.voucherId !== null || this.voucherId !== "" || this.voucherId == undefined) {
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    else {
      this.showsave = true;
    }
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
    }
    else if (this.voucherNo > 0) {
      this.voucherId = 0;
      this.opType = 'Add';
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
    }

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['BankTransfer/BankTransferList']);
    }
    this.SetTitlePage();
    this.BankTransferForm();
    this.GetBankTransferForm();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BankTransferForm');
    this.title.setTitle(this.TitlePage);
  }

  BankTransferForm() {
    this.BankTransferAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      transferType: [0],
      isOut: [0],
      commByDealer: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      amount: [0, [Validators.required, Validators.min(1)]],
      debitAccountId: [0, [Validators.required, Validators.min(1)]],
      creditAccountId: [0, [Validators.required, Validators.min(1)]],
      commissionAmt: [0],
      commissionAccId: [0],
      receiverName: ["", [Validators.required, Validators.min(1)]],
      receiverAddress: [""],
      receiverBank: [""],
      receiverBankNo: [""],
      swift: [""],
      iban: [""],
      senderName: [""],
      referenceDate: [""],
      referenceNo: [""],
      note: [""],
      dealerId: [0],
      
      // projectTransModelList : [null],
      accVouchersDocModelList: [null],
      accVouchersDTModelList: [null],
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      paymentMethod: [''],
      generalAttachModelList: [null],
    });
  }
  // debitAccountId
  // creditAccountId
  // commissionAccId
  GetBankTransferForm() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.bankTransferService.GetInitailBankTransfer(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['BankTransfer/BankTransferList']);
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
        debitAccId: item.debitAccId,
        creditAccId: item.creditAccId,
        printAfterSave: item.printAfterSave
      }));
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      this.accountsList2 = result.accountList;
      this.accountsList3 = result.accountList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.customerAndSupplierList = result.customerAndSupplierList;
      this.BankTransferAddForm.patchValue(result);
      this.lastDealerId = Number(this.BankTransferAddForm.get('dealerId')?.value || 0);

      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.creditAccountsList = result.accVouchersDTModelList;
      this.paymentTypesList = result.paymentTypesList;
      this.semesterList = result.semesterList;

      const validElement = this.accVouchersDTsList.find(el => el.dealerId != null && el.dealerId != undefined && el.dealerId != '');

      if (result.dealerId) {
          this.BankTransferAddForm.get("dealerId").setValue(result.dealerId);
      } else {
          this.BankTransferAddForm.get("dealerId").setValue(0);
      }

      const did = this.BankTransferAddForm.get("dealerId")?.value;
        if (did && did > 0) {
       this.onDealerChange(did);}

      // this.accVouchersDTsList.forEach(element => {
      //   debugger
      //   if(element.dealerId == null || element.dealerId == undefined || element.dealerId == '')
      //   {
      //     this.BankTransferAddForm.get("dealerId").setValue(0);
      //   }
      //   else{
      //     this.BankTransferAddForm.get("dealerId").setValue(element.dealerId);
          
      //   }
      // });

      this.BankTransferAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      if (result.accVouchersDocModelList.length !== 0) {
        this.childAttachment.data = result.accVouchersDocModelList;
        this.childAttachment.ngOnInit();
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.BankTransferAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      if(result.status == 71)
        {
          $("#tempSave").prop('checked', true);
        }
      else
        {
          $("#tempSave").prop('checked', false);
        }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        debugger
        if (this.voucherId > 0) {
          var pm = result.paymentMethod.split(',').map(Number)
          this.BankTransferAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.BankTransferAddForm.get("currencyId").setValue(result.currencyId);
          this.BankTransferAddForm.get("branchId").setValue(result.branchId);
          this.selectedacc1 = result.debitAccountId;
          this.selectedacc2 = result.creditAccountId;
          this.selectedacc3 = result.commissionAccId;
          this.BankTransferAddForm.get("debitAccountId").setValue(result.debitAccountId);
          this.BankTransferAddForm.get("creditAccountId").setValue(result.creditAccountId);

          if (result.bankTransfer.transferType == 80) {
            this.istype = 1;
          }
          else {
            this.istype = 2;
          }
          if (result.bankTransfer.isOut == true) {
            this.isOut = 1;
          }
          else {
            this.isOut = 0;
          }

          if (result.bankTransfer.commByDealer == true) {
            this.IsDealerAcc = 1;
          }
          else {
            this.IsDealerAcc = 0;
          }
          this.BankTransferAddForm.get("receiverName").setValue(result.bankTransfer.receiverName);
          this.BankTransferAddForm.get("receiverBank").setValue(result.bankTransfer.receiverBank);
          this.BankTransferAddForm.get("receiverAddress").setValue(result.bankTransfer.receiverAddress);
          this.BankTransferAddForm.get("receiverBankNo").setValue(result.bankTransfer.receiverBankNo);
          this.BankTransferAddForm.get("swift").setValue(result.bankTransfer.swift);
          this.BankTransferAddForm.get("iban").setValue(result.bankTransfer.iban);
          this.BankTransferAddForm.get("senderName").setValue(result.bankTransfer.senderName);
          this.BankTransferAddForm.get("commissionAmt").setValue(result.commissionAmt);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.BankTransferAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.BankTransferAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.BankTransferAddForm.get("branchId").setValue(result.defaultBranchId);
          this.BankTransferAddForm.get("dealerId").setValue(0);
          this.BankTransferAddForm.get("amount").setValue(0);
          this.selectedacc1 = 0;
          this.selectedacc2 = 0;
          this.selectedacc3 = 0;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.BankTransferAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.BankTransferAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          // var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id;
          if (defaultVoucher != 0 && defaultVoucher != null && defaultVoucher != undefined) {
            this.BankTransferAddForm.get("voucherTypeId").setValue(defaultVoucher);
          }
          this.BankTransferAddForm.get("paymentMethod").setValue(result.paymentMethod);
          this.istype = 1;
          this.isOut = 0;
          this.IsDealerAcc = 0;
          this.changeDetectorRef.detectChanges();
          this.getVoucherNo(defaultVoucher);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.BankTransferAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (this.BankTransferAddForm.value.currencyId == 0) {
            this.BankTransferAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.BankTransferAddForm.get("currRate").setValue(currRate);
          }
        }
        this.GetVoucherTypeSetting(this.BankTransferAddForm.value.voucherTypeId)
        if (this.BankTransferAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    var voucherCategory = this.BankTransferAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.BankTransferAddForm.value.voucherTypeId;
    var date = new Date(this.BankTransferAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    this.selectedacc1 = this.voucherTypeList.find(option => option.label === selectedValue).debitAccId;
    this.selectedacc2 = this.voucherTypeList.find(option => option.label === selectedValue).creditAccId;
    if (this.selectedacc1 == null || this.selectedacc1 == undefined) {
      this.selectedacc1 = 0;
    }
    if (this.selectedacc2 == null || this.selectedacc2 == undefined) {
      this.selectedacc2 = 0;
    }
    this.selectedacc3 = 0;
    if (currencyId !== null) {
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.BankTransferAddForm.get("currRate").setValue(currRate);
    }

    debugger
    if (voucherTypeId > 0) {
      this.bankTransferService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.BankTransferAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.BankTransferAddForm.get("voucherNo").setValue(1);
        }
        if (branchId == null || branchId == undefined) {
          this.BankTransferAddForm.get("branchId").setValue(0);
        }
        else {
          this.BankTransferAddForm.get("branchId").setValue(branchId);
        }

        if (currencyId != 0 && currencyId != null && currencyId != undefined) {
          this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
        }
        else {
          this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
        }

      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.BankTransferAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.BankTransferAddForm.get("currRate").setValue(currRate);
      if (this.BankTransferAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.BankTransferAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.BankTransferAddForm.get("currRate").setValue(currRate);
      if (this.BankTransferAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.BankTransferAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  formatCurrency(value: number): string {
    debugger
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  claculateAmount() {
    debugger
    const amountValue = this.BankTransferAddForm.value.amount;
    if (amountValue == null || amountValue == undefined || amountValue == '') {
      this.BankTransferAddForm.get("amount").setValue(0);
      return;
    }
    var amount = parseFloat(this.BankTransferAddForm.value.amount);
    this.BankTransferAddForm.get("amount").setValue(amount.toFixed(this.decimalPlaces));
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isValidVoucherDate(event) {
    debugger
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

  DeleteVoucher(id: any) {
    debugger
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
        this.bankTransferService.DeleteBankTransfer(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['BankTransfer/BankTransferList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['BankTransfer/BankTransferList']);
            }

          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OnSaveForms() {
    let stopExecution = false;
    // this.disableSave = true;
    this.changeDetectorRef.detectChanges();
    debugger
    if (this.BankTransferAddForm.value.commissionAmt > 0) {
      if (this.BankTransferAddForm.value.commissionAccId == 0 || this.BankTransferAddForm.value.commissionAccId == null) {
        this.alert.ShowAlert("msgEntercommission", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }

    }
    if (this.BankTransferAddForm.value.commissionAmt !== undefined && this.BankTransferAddForm.value.commissionAccId > 0) {
      if (this.BankTransferAddForm.value.commissionAccId > 0 && this.BankTransferAddForm.value.commissionAmt == 0 || this.BankTransferAddForm.value.commissionAmt == null) {
        this.alert.ShowAlert("msgEntercommission", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }
    let amount =this.calculateSum();
    
    if(amount > 0 && amount !== parseFloat(this.BankTransferAddForm.value.amount)){
      this.alert.ShowAlert("msgCreditExceedAmount", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    if (this.BankTransferAddForm.value.commissionAmt === "") {
      this.BankTransferAddForm.value.commissionAmt = 0;
    }

    this.BankTransferAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.BankTransferAddForm.value.userId = this.jwtAuth.getUserId();

    debugger
    this.BankTransferAddForm.value.voucherNo = this.BankTransferAddForm.value.voucherNo.toString();
    this.BankTransferAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;
    //this.BankTransferAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.BankTransferAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    if (this.BankTransferAddForm.value.paymentMethod == null) {
      this.BankTransferAddForm.value.paymentMethod = '';
    }
    if (this.isOut == 1) {
      this.BankTransferAddForm.value.isOut = 1;
    }
    else {
      this.BankTransferAddForm.value.isOut = 0;
    }
    debugger
    if(this.IsDealerAcc == 1){
      this.BankTransferAddForm.get("commByDealer").setValue(1);
    }
    else{
      this.BankTransferAddForm.get("commByDealer").setValue(0);
    }
    this.BankTransferAddForm.get("accVouchersDTModelList").setValue(this.creditAccountsList);
    
    if(this.creditAccountsList.length > 0)
      {
        for (let i = 0; i < this.creditAccountsList.length; i++) {
          if(this.creditAccountsList[i].paymentType == null || this.creditAccountsList[i].paymentType == undefined || this.creditAccountsList[i].paymentType == 0){
           stopExecution = true;
           this.alert.ShowAlert("msgEnterAllData", 'error');
           this.disableSave = false;
           break;
          }
          if(this.creditAccountsList[i].semesterId == null || this.creditAccountsList[i].semesterId == undefined || this.creditAccountsList[i].semesterId == 0){
            stopExecution = true;
            this.alert.ShowAlert("msgEnterAllData", 'error');
            this.disableSave = false;
            break;
          }
          if(this.creditAccountsList[i].credit == null || this.creditAccountsList[i].credit == undefined || this.creditAccountsList[i].credit == 0){
            stopExecution = true;
            this.alert.ShowAlert("msgEnterAllData", 'error');
            this.disableSave = false;
            break;
          }
        }
      }
    if (stopExecution) {
      this.disableSave = false;
      return;
    }
    var tempSave = $("#tempSave").prop('checked');
    if (tempSave) {
      this.BankTransferAddForm.value.status = 71;
    }
    else {
      this.BankTransferAddForm.value.status = 66;
    }
    this.changeDetectorRef.detectChanges();
    this.bankTransferService.SaveBankTransfer(this.BankTransferAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.BankTransferAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrinBankTransferVoucher(Number(result.message));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['BankTransfer/BankTransferList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
          setTimeout(() => {
            this.GetVoucherTypeSetting(this.BankTransferAddForm.value.voucherTypeId);
          });

        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  PrinBankTransferVoucher(voucherId: number) {
    debugger
    var amount=this.BankTransferAddForm.get('amount').value;
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptBankTransferAR?VId=${voucherId}&Amount=${amount}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptBankTransferEN?VId=${voucherId}&Amount=${amount}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo, VoucherTypeId) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.bankTransferService.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetBankTransferForm();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetBankTransferForm();
          }
        }
        else {
          this.voucherId = 0;
          this.opType = "Add";
          this.showsave = false;
          this.disableAll = false;
          this.disableVouchertype = false;
          this.clearFormdata(VoucherNo);
        }
      })
    }
  }

  clearFormdata(VoucherNo) {
    debugger
    this.newDate = new Date;
    this.BankTransferAddForm.get("id").setValue(0);
    this.BankTransferAddForm.get("transferType").setValue(1);
    this.BankTransferAddForm.get("voucherNo").setValue(VoucherNo);
    this.BankTransferAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.BankTransferAddForm.get("amount").setValue(0);
    this.BankTransferAddForm.get("branchId").setValue(0);
    this.BankTransferAddForm.get("currencyId").setValue(0);
    this.BankTransferAddForm.get("currRate").setValue(0);
    this.BankTransferAddForm.get("commissionAmt").setValue(0);
    this.BankTransferAddForm.get("commissionAccId").setValue(0);
    this.BankTransferAddForm.get("debitAccountId").setValue(0);
    this.BankTransferAddForm.get("creditAccountId").setValue(0);
    this.BankTransferAddForm.get("referenceNo").setValue("");
    this.BankTransferAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.BankTransferAddForm.get("receiverName").setValue("");
    this.BankTransferAddForm.get("receiverAddress").setValue("");
    this.BankTransferAddForm.get("receiverBank").setValue("");
    this.BankTransferAddForm.get("senderName").setValue("");
    this.BankTransferAddForm.get("receiverBankNo").setValue("");
    this.BankTransferAddForm.get("swift").setValue("");
    this.BankTransferAddForm.get("iban").setValue("");
    this.BankTransferAddForm.get("note").setValue("");
    this.BankTransferAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.BankTransferAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  onDealerChange(event: any) {
    
    if (!event?.originalEvent) return; 

    const dealerId = Number(event?.value ?? event ?? 0);
    if (dealerId === this.lastDealerId) return;
    this.BankTransferAddForm.patchValue({
      receiverBankNo: '',
      swift: '',
      iban: '',
      receiverBank: ''

    }, { emitEvent: false });
    if (!dealerId || dealerId === 0) {
      this.lastDealerId = 0;
      return; }
    this.lastDealerId = dealerId;
    this.bankTransferService.GetDealerBankInfo(dealerId)
      .subscribe((res: any) => {

        this.BankTransferAddForm.patchValue({
          receiverBankNo: res?.bankAccNo ?? '',
          swift: res?.swift ?? '',
          iban: res?.iban ?? '',
          receiverBank: res?.bankName ?? ''
        }, { emitEvent: false });
        const selected = (this.customerAndSupplierList || []).find(x => x.id === dealerId);
        if (selected?.text) {
          const name = selected.text.includes('-')
            ? selected.text.split('-').slice(1).join('-').trim()
            : selected.text;

          const currentName = this.BankTransferAddForm.get('receiverName')?.value;
          if (!currentName) {
            this.BankTransferAddForm.get('receiverName')?.setValue(name, { emitEvent: false });
          }
        }
      });
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    let creditAccountId = this.BankTransferAddForm.get('creditAccountId').value;
    if (creditAccountId == 0 || creditAccountId == null || creditAccountId == undefined) {
      this.alert.ShowAlert("msgSelectCreditAccount", 'error');
      return;

    }
    this.creditAccountsList.push(
      {
        accountId: creditAccountId,
        credit: "",
        paymentType: 0,
        semesterId: 0,
        index: ""
      });
  }

  formatAmt(row: any) {
    debugger
    row.credit = parseFloat(row.credit).toFixed(this.decimalPlaces);
    let amount = 0;
    for (let i = 0; i < this.creditAccountsList.length; i++) {
      amount += parseFloat(this.creditAccountsList[i].credit) || 0;
    }
    if(amount > parseFloat(this.BankTransferAddForm.value.amount)){
      this.alert.ShowAlert("msgCreditExceedAmount", 'error');
      row.credit = "0.00";
    }
  }

  calculateSum() {
    let amt;
    amt = this.creditAccountsList.reduce((sum, item) => {
      const credit = parseFloat(item.credit);
      return isNaN(credit) ? sum : sum + credit;
    }, 0)

    const formattedTotal = this.creditAccountsList.reduce((sum, item) => {
      const credit = parseFloat(item.credit);
      return isNaN(credit) ? sum : sum + credit;
    }, 0)
    this.CreditTotal = Number(formattedTotal);

    return amt;
  }

  deleteRow(rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (rowIndex !== -1) {
      this.creditAccountsList.splice(rowIndex, 1);
    }
  }

  onChangeCreditAccount(event: any) {
    debugger
    const selectedValue = event.value;
    if (this.creditAccountsList.length > 0) {
      for (let i = 0; i < this.creditAccountsList.length; i++) {
        this.creditAccountsList[i].accountId = selectedValue;
      }
    }
  }


  DealerLazyOptions(event: any) {
    const { first, last } = event;
    if (!this.customerAndSupplierList) {
      this.customerAndSupplierList = [];
    }

    while (this.customerAndSupplierList.length < last) {
      this.customerAndSupplierList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.customerAndSupplierList[i] = this.customerAndSupplierList[i];
    }

    this.loading = false;
  }
}
