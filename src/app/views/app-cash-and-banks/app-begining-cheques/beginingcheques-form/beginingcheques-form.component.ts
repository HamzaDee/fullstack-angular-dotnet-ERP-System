import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { BeginingChequesService } from '../beginingcheques.service';
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

import Swal from 'sweetalert2';

@Component({
  selector: 'app-beginingcheques-form',
  templateUrl: './beginingcheques-form.component.html',
  styleUrls: ['./beginingcheques-form.component.scss']
})
export class BeginingchequesFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  BeginingChequesAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  accountsList: any;
  bankList: any;
  statusList: any;
  statusList2: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  debitAccountsList: any[] = [];
  creditAccountsList: any[] = [];
  chequesList: any[] = [];
  suppliersList: any;
  voucherTypeList: any;
  voucherTypeList2: any;
  defaultList: any;
  deafultStatusList: any;
  branchesList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  total: number = 0;
  selectedDropdownValue: any;
  selectedacc1: any;
  selectedacc2: any;
  selectedacc3: any;
  voucherId: any;
  showsave: boolean;
  istype: number;
  isOut: number;
  selectedRadioValue: number = 1; // Default selected radio value
  selectedVoucherType: any;
  decimalPlaces: number;
  public Amount: any;
  disableAll: boolean = false;
  voucherNo: number = 0;
  defaultCurId: any;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  creditAccId:number = 0;
  debitAccId:number = 0;
  cheqAccId:number = 0;
  bankId:number = 0;
  cheqStatus:number = 0;
  //End
  disableCurrRate: boolean;
  Lang: string;
  disableSave: boolean;
  disableVouchertype: boolean = false;
  newDate:any;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private beginingChequesService: BeginingChequesService,
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
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
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
      this.router.navigate(['BeginningCheques/BeginingchequesList']);
    }
    this.SetTitlePage();
    this.BankTransferForm();
    this.GetBankTransferForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Beginingchequesform');
    this.title.setTitle(this.TitlePage);
  }

  BankTransferForm() {
    this.BeginingChequesAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      receipt: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      note: [""],
      accVouchersDocModelList: [null],
      accVouchersDTModelList: [null],
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      amount: [0],
      paymentMethod: [''],
      chequeModelList: [null],
    });
  }

  GetBankTransferForm() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.beginingChequesService.GetInitailBeginingCheques(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['BeginningCheques/BeginingchequesList']);
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
        cheqAccId: item.cheqAccId,
        bankId: item.bankId,
        defChequeStatus: item.defChequeStatus,
        printAfterSave: item.printAfterSave
      }));
      this.voucherTypeList2 = result.voucherTypeList2.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        debitAccId: item.debitAccId,
        creditAccId: item.creditAccId,
        cheqAccId: item.cheqAccId,
        bankId: item.bankId,
        defChequeStatus: item.defChequeStatus,
        printAfterSave: item.printAfterSave
      }));
      debugger
      this.defaultCurId = result.defaultCurrency;
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      this.bankList = result.bankList;
      this.statusList = result.statusList;
      this.statusList2 = result.statusList2;
      this.suppliersList = result.suppliersList;
      this.BeginingChequesAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.BeginingChequesAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      if (result.accVouchersDocModelList.length !== 0) {
        this.childAttachment.data = result.accVouchersDocModelList;
        this.childAttachment.ngOnInit();
      }
      if (result.chequeModelList != null) {
        this.chequesList = result.chequeModelList;
        for (let element of this.chequesList) {
          element.dueDate = formatDate(element.dueDate, "yyyy-MM-dd", "en-US");
        }
      }
      if (result.chequeModelList !== null && result.chequeModelList.length > 0) {
        if (result.chequeModelList[0].receipt == true) {
          this.defaultList = this.voucherTypeList;
          this.deafultStatusList = this.statusList;
        }
        else {
          this.defaultList = this.voucherTypeList2;
          this.deafultStatusList = this.statusList2;
        }
      }
      else {
        this.defaultList = this.voucherTypeList;
        this.deafultStatusList = this.statusList;
      }
      this.calculateSum();
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if (this.voucherId > 0) {
          var pm = result.paymentMethod.split(',').map(Number)
          this.BeginingChequesAddForm.get("currencyId").setValue(result.currencyId);
          this.BeginingChequesAddForm.get("branchId").setValue(result.branchId);
          this.BeginingChequesAddForm.get("note").setValue(result.note);
          this.BeginingChequesAddForm.get("voucherNo").setValue(result.voucherNo);
          this.BeginingChequesAddForm.get("currencyId").setValue(result.currencyId);
          this.BeginingChequesAddForm.get("currRate").setValue(result.currRate);
          // this.BeginingChequesAddForm.get("receipt").setValue(result.chequeModelList[0].receipt);                    
          if (result.chequeModelList[0].receipt == true) {
            this.selectedRadioValue = 1;
            //this.defaultList = this.voucherTypeList;
            this.BeginingChequesAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          }
          else {
            this.selectedRadioValue = 0;
            //this.defaultList = this.voucherTypeList2;
            this.BeginingChequesAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          }

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.BeginingChequesAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.BeginingChequesAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          debugger
          this.BeginingChequesAddForm.get("currencyId").setValue(result.defaultCurrency);
          this.BeginingChequesAddForm.get("branchId").setValue(result.defaultBranchId);
          var currRate = result.currencyList.find(option => option.id === result.defaultCurrency).data1;
          this.BeginingChequesAddForm.get("currRate").setValue(currRate);
          this.selectedRadioValue = 1;

          if (this.BeginingChequesAddForm.value.currencyId == this.defaultCurId) {
            this.disableCurrRate = true;
          }
          else {
            this.disableCurrRate = false;
          }

          var defaultVoucher = this.defaultList.find(option => option.isDefault === true).label;
          if (defaultVoucher != null && defaultVoucher != undefined && defaultVoucher > 0) {
            this.BeginingChequesAddForm.get("voucherTypeId").setValue(defaultVoucher);
            this.getVoucherNo(defaultVoucher, 0);
          }


          this.BeginingChequesAddForm.get("paymentMethod").setValue(result.paymentMethod);


          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            if (defaultCurrency != null && defaultCurrency != undefined) {
              this.currencyList = [defaultCurrency];
              this.BeginingChequesAddForm.get("currencyId").setValue(result.defaultCurrency);
            }
            else if (this.defaultCurId != null && this.defaultCurId > 0) {
              var currRate = this.currencyList.find(option => option.id === this.defaultCurId).data1;
              this.BeginingChequesAddForm.get("currencyId").setValue(this.defaultCurId);
              this.BeginingChequesAddForm.get("currRate").setValue(currRate);
            }
          }
          else {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            if (defaultCurrency != null && defaultCurrency != undefined) {
              this.BeginingChequesAddForm.get("currencyId").setValue(result.defaultCurrency);
            }
            else if (this.defaultCurId != null && this.defaultCurId > 0) {
              var currRate = this.currencyList.find(option => option.id === this.defaultCurId).data1;
              this.BeginingChequesAddForm.get("currencyId").setValue(this.defaultCurId);
              this.BeginingChequesAddForm.get("currRate").setValue(currRate);
            }
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.BeginingChequesAddForm.get("branchId").setValue(result.defaultBranchId);
          }
        }

        if (this.selectedRadioValue == 1) {
          this.GetVoucherTypeSettingIncomming(this.BeginingChequesAddForm.value.voucherTypeId)
        }
        else {
          this.GetVoucherTypeSettingIncomming(this.BeginingChequesAddForm.value.voucherTypeId)
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

  getVoucherNo(event: any, voucher: any) {
    debugger
    if (event) {
      const selectedValue = event.value === undefined ? event : event.value;
      var serialType = this.defaultList.find(option => option.label === selectedValue).serialType;
      var currencyId = this.defaultList.find(option => option.label === selectedValue).currencyId;
      var branchId = this.defaultList.find(option => option.label === selectedValue).branchId;
      var voucherCategory = 0
      if (this.selectedRadioValue == 1) {
        voucherCategory = 29;
      }
      else {
        voucherCategory = 30;
      }
      var voucherTypeId = this.BeginingChequesAddForm.value.voucherTypeId;
      var date = new Date(this.BeginingChequesAddForm.value.voucherDate);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      if (voucherTypeId > 0) {
        this.beginingChequesService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
          if (results) {
            this.BeginingChequesAddForm.get("voucherNo").setValue(results);
          }
          else {
            this.BeginingChequesAddForm.get("voucherNo").setValue(1);
          }
          if (currencyId != null && currencyId != undefined && currencyId > 0) {
            var currRate = this.currencyList.find(option => option.id === currencyId).data1;
            this.BeginingChequesAddForm.get("currRate").setValue(currRate);
            this.BeginingChequesAddForm.get("currencyId").setValue(currencyId);
          }
          else if (this.defaultCurId != null && this.defaultCurId > 0) {
            var currRate = this.currencyList.find(option => option.id === this.defaultCurId).data1;
            this.BeginingChequesAddForm.get("currencyId").setValue(this.defaultCurId);
            this.BeginingChequesAddForm.get("currRate").setValue(currRate);
          }
          const des = this.currencyList.find(option => option.id === currencyId);

          if (des && des.data2 !== null && des.data2 !== undefined) {
            const decimal = parseFloat(des.data2);

            if (!isNaN(decimal)) {
              this.decimalPlaces = decimal;
            }
          }
          if (currencyId !== null) {
            const selectedCurrency = this.currencyList.find(option => option.id === currencyId);

            if (selectedCurrency && selectedCurrency.data1 !== null && selectedCurrency.data1 !== undefined) {
              const currRate = parseFloat(selectedCurrency.data1);

              if (!isNaN(currRate)) {
                this.BeginingChequesAddForm.get("currRate").setValue(currRate);
              }
            }
          }
          if (this.BeginingChequesAddForm.value.currencyId == this.defaultCurId) {
            this.disableCurrRate = true;
          }
          else {
            this.disableCurrRate = false;
          }
          if (branchId != null && branchId != undefined) {
            this.BeginingChequesAddForm.get("branchId").setValue(branchId);
          }
          else {
            this.BeginingChequesAddForm.get("branchId").setValue(0);
          }

        });
      }
      if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {

        if (this.selectedRadioValue == 1) {
          this.GetVoucherTypeSettingIncomming(voucherTypeId);
        }
        else {
          this.GetVoucherTypeSettingOutComming(voucherTypeId);
        }
      }
    }
    else {
      const selectedValue = voucher === undefined ? voucher : voucher;
      var serialType = this.defaultList.find(option => option.label === selectedValue).serialType;
      var currencyId = this.defaultList.find(option => option.label === selectedValue).currencyId;
      var branchId = this.defaultList.find(option => option.label === selectedValue).branchId;
      var voucherCategory = 0
      if (this.selectedRadioValue == 1) {
        voucherCategory = 29;
      }
      else {
        voucherCategory = 30;
      }
      var voucherTypeId = voucher;
      var date = new Date(this.BeginingChequesAddForm.value.voucherDate);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      if (voucherTypeId > 0) {
        this.beginingChequesService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
          if (results) {
            this.BeginingChequesAddForm.get("voucherNo").setValue(results);
          }
          else {
            this.BeginingChequesAddForm.get("voucherNo").setValue(1);
          }
          const des = this.currencyList.find(option => option.id === currencyId);

          if (des && des.data2 !== null && des.data2 !== undefined) {
            const decimal = parseFloat(des.data2);

            if (!isNaN(decimal)) {
              this.decimalPlaces = decimal;
            }
          }
          if (currencyId != null && currencyId > 0) {
            var currRate = this.currencyList.find(option => option.id === currencyId).data1;
            this.BeginingChequesAddForm.get("currencyId").setValue(currencyId);
            this.BeginingChequesAddForm.get("currRate").setValue(currRate);
          }
          else if (this.defaultCurId != null && this.defaultCurId > 0) {

            var currRate = this.currencyList.find(option => option.id === this.defaultCurId).data1;
            this.BeginingChequesAddForm.get("currencyId").setValue(this.defaultCurId);
            this.BeginingChequesAddForm.get("currRate").setValue(currRate);
          }
          if (branchId != null && branchId != undefined) {
            this.BeginingChequesAddForm.get("branchId").setValue(branchId);
          }
          this.BeginingChequesAddForm.get("voucherTypeId").setValue(voucherTypeId);
        });
      }
      if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {

        if (this.selectedRadioValue == 1) {
          this.GetVoucherTypeSettingIncomming(voucherTypeId);
        }
        else {
          this.GetVoucherTypeSettingOutComming(voucherTypeId);
        }
      }
    }


  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.BeginingChequesAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
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
        this.beginingChequesService.DeleteBeginingCheques(id).subscribe((results) => {
          if (results) {
            this.alert.DeleteSuccess();
            this.router.navigate(['BeginningCheques/BeginingchequesList']);
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
    debugger
     let isValid = true;
    this.disableSave = true;
    this.changeDetectorRef.detectChanges();
    let stopExecution = false;
    var index = 0;
    this.chequesList.forEach(element => {
      debugger
      if (element.dealerId <= 0 || ((element.chequeAccId === '' || element.chequeAccId === null || element.chequeAccId <= 0) && (element.chequeNo === '' || element.chequeNo === null || element.chequeNo <= 0)
        && (element.bankId === '' || element.bankId === null || element.bankId <= 0) && (element.amount === '' || element.amount === null || element.amount <= 0)
        && (element.chequeStatus === '' || element.chequeStatus === null || element.chequeStatus <= 0 || element.chequeStatus === undefined))) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }

      if (element.chequeNo == '' || element.chequeNo == null || element.chequeNo == undefined || element.chequeNo == "") {
        this.alert.ShowAlert("msgEnterChequesNo", 'error');
        stopExecution = true;
        this.disableSave = false;
         isValid = false;
         return ;
      }
  
      if (element.dueDate == '' || element.dueDate == null || element.dueDate == undefined) {
        this.alert.ShowAlert("msgChosedueDate", 'error');
        stopExecution = true;
        this.disableSave = false;
        isValid = false;
         return ;
      }

      element.index = index.toString();
      index++;
    })

    for (let element of this.chequesList) {
      if (element.dealerId <= 0 || element.chequeStatus <= 0 || !this.appCommonserviceService.isValidNumber(element.amount)) {
        this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
        stopExecution = true;
        this.disableSave = false;
         isValid = false;
        return false;
      }
      element.index = index.toString();
      index++;
    }
    if (this.BeginingChequesAddForm.value.voucherNo == "" || this.BeginingChequesAddForm.value.voucherNo == 0) {
      this.alert.ShowAlert("PleaseEnterDocumentNumber ", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }


    for (let element of this.chequesList) {
      element.chequeNo = element.chequeNo.toString();
    }
    if (this.chequesList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }
    debugger
    this.BeginingChequesAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.BeginingChequesAddForm.value.userId = this.jwtAuth.getUserId();
    this.BeginingChequesAddForm.value.voucherNo = this.BeginingChequesAddForm.value.voucherNo.toString();
    this.BeginingChequesAddForm.value.chequeModelList = this.chequesList;
    this.BeginingChequesAddForm.get("amount").setValue(this.total);
    this.BeginingChequesAddForm.get("voucherNo").setValue(this.BeginingChequesAddForm.value.voucherNo.toString());

    if (this.BeginingChequesAddForm.value.paymentMethod == null || this.BeginingChequesAddForm.value.paymentMethod == "") {
      this.BeginingChequesAddForm.get("paymentMethod").setValue('');
    }

    if (this.selectedRadioValue == 1) {
      this.BeginingChequesAddForm.value.receipt = 1;
    }
    else {
      this.BeginingChequesAddForm.value.receipt = 0;
    }
    this.BeginingChequesAddForm.get("chequeModelList").setValue(this.chequesList);
    this.changeDetectorRef.detectChanges();
    this.BeginingChequesAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    debugger

 if (isValid) {
   this.beginingChequesService.SaveBeginingCheques(this.BeginingChequesAddForm.value)
      .subscribe((result) => {
  /*       if(result.message != "" && result.message != null && result.message != undefined )
          {                
            this.alert.ShowAlert(result.message, 'error');
            this.disableSave = false;
            return;
          } */

        if (result) {
          this.alert.SaveSuccess();
          debugger

        if(this.selectedRadioValue == 1)
        {
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.BeginingChequesAddForm.value.voucherTypeId)?.printAfterSave || false;
        }
        else if(this.selectedRadioValue == 0)
        {
          var PrintAfterSave = this.voucherTypeList2.find(option => option.label === this.BeginingChequesAddForm.value.voucherTypeId)?.printAfterSave || false;
        }

          
          if(PrintAfterSave == true)
          {
            this.PrinBeginingCheckVoucher(Number(result.message));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['BeginningCheques/BeginingchequesList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ClearFormData();
          this.ngOnInit()
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
 }
  }

  AddNewLine(grid, ff) {
    if (this.disableAll == true) {
      return;
    }
    this.newDate = new Date;
    if (grid == 1) { //credit accounts
      this.chequesList.push(
        {
          dealerId: 0,
          chequeAccId: this.cheqAccId,
          chequeNo: "",
          dueDate: formatDate(this.newDate, "yyyy-MM-dd", "en-US").toString(),
          bankId: this.bankId,
          amount: 0,
          drawerName: "",
          chequeStatus: this.cheqStatus,
        });
    }
  }

  deleteRow(rowIndex: number, grid) {
    if (rowIndex !== -1) {
      if (grid == 1)
        this.chequesList.splice(rowIndex, 1);
      this.calculateSum();
    }
  }

  onAddRowBefore(rowIndex: number, grid) {
    if (grid == 1) {
      const newRow =
      {
        dealerId: 0,
        chequeAccId: 0,
        chequeNo: "",
        dueDate: "",
        bankId: 0,
        amount: 0,
        drawerName: "",
        chequeStatus: 0,

      };
      this.chequesList.splice(rowIndex, 0, newRow);
    }
  }

  onRadioChange(value: number) {
    this.BeginingChequesAddForm.get("voucherNo").setValue('');
    this.BeginingChequesAddForm.get("branchId").setValue(0);
    this.BeginingChequesAddForm.get("note").setValue('');
    this.chequesList = [];
    this.BeginingChequesAddForm.get("chequeModelList").setValue(this.chequesList);
    
    debugger
    if (value == 1) {
      this.defaultList = this.voucherTypeList;
      this.deafultStatusList = this.statusList;
      var curId = this.defaultList.find(o => o.isDefault === true).currencyId;
      if (curId != null && curId > 0) {
        var currRate = this.currencyList.find(option => option.id === curId).data1;
        this.BeginingChequesAddForm.get("currencyId").setValue(curId);
        this.BeginingChequesAddForm.get("currRate").setValue(currRate);
      }
      else if (this.defaultCurId != null && this.defaultCurId > 0) {

        var currRate = this.currencyList.find(option => option.id === this.defaultCurId).data1;
        this.BeginingChequesAddForm.get("currencyId").setValue(this.defaultCurId);
        this.BeginingChequesAddForm.get("currRate").setValue(currRate);
      }
      var defaultVoucehr = this.defaultList.find(r => r.isDefault == true).label;
      if (defaultVoucehr != null && defaultVoucehr != 0 && defaultVoucehr != undefined) {
        this.BeginingChequesAddForm.get("voucherTypeId").setValue(defaultVoucehr);
        this.getVoucherNo(0, defaultVoucehr);
      }


    }
    else {
      this.deafultStatusList = this.statusList2;
      this.defaultList = this.voucherTypeList2;
      var curId = this.defaultList.find(o => o.isDefault === true).currencyId;
      if (curId != null && curId > 0) {
        var currRate = this.currencyList.find(option => option.id === curId).data1;
        this.BeginingChequesAddForm.get("currencyId").setValue(curId);
        this.BeginingChequesAddForm.get("currRate").setValue(currRate);
      }
      else if (this.defaultCurId != null && this.defaultCurId > 0) {

        var currRate = this.currencyList.find(option => option.id === this.defaultCurId).data1;
        this.BeginingChequesAddForm.get("currencyId").setValue(this.defaultCurId);
        this.BeginingChequesAddForm.get("currRate").setValue(currRate);
      }
      var defaultVoucehr = this.defaultList.find(r => r.isDefault == true).label;
      if (defaultVoucehr != null && defaultVoucehr != 0 && defaultVoucehr != undefined) {
        this.BeginingChequesAddForm.get("voucherTypeId").setValue(defaultVoucehr);
        this.getVoucherNo(0, defaultVoucehr);
      }
    }
  }

  isOneEmpty(row: any) {
    if ((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)) {
      return true;
    }
    else {
      return false;
    }
  }

  calculateSum() {
    this.total = this.chequesList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  }

  formatAmt(row: any) {
    row.amount = row.amount.toFixed(this.decimalPlaces);
  }

  GetVoucherTypeSettingIncomming(voucherTypeId: number) {
    debugger
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.creditAccId  = this.voucherTypeList.find(option => option.label === voucherTypeId)?.creditAccId ?? 0;
    this.debitAccId  = this.voucherTypeList.find(option => option.label === voucherTypeId)?.debitAccId ?? 0;
    this.cheqAccId  = this.voucherTypeList.find(option => option.label === voucherTypeId)?.cheqAccId ?? 0;
    this.bankId  = this.voucherTypeList.find(option => option.label === voucherTypeId)?.bankId ?? 0;
    this.cheqStatus  = this.voucherTypeList.find(option => option.label === voucherTypeId)?.defChequeStatus ?? 0;
  }

  GetVoucherTypeSettingOutComming(voucherTypeId: number) {
    this.allowEditVoucherSerial = this.voucherTypeList2.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditDate = this.voucherTypeList2.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditBranch = this.voucherTypeList2.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.creditAccId  = this.voucherTypeList2.find(option => option.label === voucherTypeId)?.creditAccId ?? 0;
    this.debitAccId  = this.voucherTypeList2.find(option => option.label === voucherTypeId)?.debitAccId ?? 0;
    this.cheqAccId  = this.voucherTypeList2.find(option => option.label === voucherTypeId)?.cheqAccId ?? 0;
    this.bankId  = this.voucherTypeList2.find(option => option.label === voucherTypeId)?.bankId ?? 0;
    this.cheqStatus  = this.voucherTypeList2.find(option => option.label === voucherTypeId)?.defChequeStatus ?? 0;
  }

  ClearFormData() {
    this.chequesList = [];
    this.BeginingChequesAddForm.get("note").setValue("")
    this.BeginingChequesAddForm.get("branchId").setValue(0)
    setTimeout(() => {
      if (this.selectedRadioValue == 1) {
        this.GetVoucherTypeSettingIncomming(this.BeginingChequesAddForm.value.voucherTypeId);
      }
      else {
        this.GetVoucherTypeSettingOutComming(this.BeginingChequesAddForm.value.voucherTypeId);
      }
    });
  }

  PrinBeginingCheckVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptBeginingChequesAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptBeginingChequesEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.beginingChequesService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
          {
            debugger
            if(res.id > 0)
              {
                if(res.status ==  66 || res.status ==  71)
                  {
                    this.voucherId =res.id;
                    this.opType = "Edit";
                    this.showsave = false;
                    //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                    //this.childAttachment.data = [];
                    this.disableAll = false;
                    this.GetBankTransferForm();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                   // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetBankTransferForm();
                  }
              }
              else
              {
                this.voucherId =0;
                this.opType = "Add";
                this.showsave = false;
                this.disableAll = false;
                this.disableVouchertype = false;
                this.clearFormdata(VoucherNo);               
              }
          })
      }
  }  

  clearFormdata(VoucherNo)
  {    debugger
    this.newDate = new Date;
    this.BeginingChequesAddForm.get("id").setValue(0);
    this.BeginingChequesAddForm.get("voucherNo").setValue(VoucherNo);
    this.BeginingChequesAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.BeginingChequesAddForm.get("currencyId").setValue(0);
    this.BeginingChequesAddForm.get("currRate").setValue(0);
    this.BeginingChequesAddForm.get("branchId").setValue(0);
    this.BeginingChequesAddForm.get("note").setValue("");
    this.chequesList = [];
    this.BeginingChequesAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.BeginingChequesAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row,index)
  {
    debugger
    this.chequesList.push(
      {
        dealerId:row.dealerId,
        chequeAccId: row.chequeAccId,
        chequeNo:'',
        dueDate: row.dueDate,
        bankId: row.bankId,
        amount: row.amount,
        drawerName: row.drawerName,
        chequeStatus: row.chequeStatus,
      });
   
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }

  CheckCheq(row,index)
  {
    debugger
    if(row.chequeNo == "" || row.chequeNo == null || row.chequeNo == undefined || row.chequeNo == 0) 
      {
        return false
      }
    for (let i = 0; i < this.chequesList.length; i++) {
      if (this.chequesList[i].chequeNo == row.chequeNo && i != index) {
        if(this.chequesList[i].bankId == row.bankId && i != index)
          {
            if(this.chequesList[i].dealerId == row.dealerId && i != index)
              {
                this.alert.ShowAlert("msgTheChequeNumberAlreadyExistsInThisBank", 'error');
                this.chequesList[index] = {
                ...this.chequesList[index],
                chequeNo: 0
                };
              this.changeDetectorRef.detectChanges();
              }
            
          }    
      }
    }
  }
}
