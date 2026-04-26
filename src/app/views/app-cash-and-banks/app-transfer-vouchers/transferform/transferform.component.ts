import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TransferVoucherService } from '../transfervoucher.service';
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
@Component({
  selector: 'app-transferform',
  templateUrl: './transferform.component.html',
  styleUrls: ['./transferform.component.scss']
})
export class TransferformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  TransferVoucherAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  accountsList: any
  accountsList2: any
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
  selectedVoucherType: any;
  selectedacc1: any;
  selectedacc2: any;
  voucherId: any;
  showsave: boolean;
  decimalPlaces: number;
  public Amount: any;
  disableAll: boolean = false;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  defaultCurrencyId: number;
  disableCurrRate: boolean;
  disableSave:boolean;
  Lang: string;
  disableVouchertype:boolean = false;
  newDate:any;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private transferVoucherService: TransferVoucherService,
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
      this.router.navigate(['TransferVoucher/TransferVoucherList']);
    }


    this.SetTitlePage();
    this.TransfervoucherForm();
    this.GetInitailTransfervoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('TransferVoucherform');
    this.title.setTitle(this.TitlePage);
  }

  TransfervoucherForm() {
    this.TransferVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
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
      referenceDate: [""],
      referenceNo: [""],
      note: [""],
      // projectTransModelList : [null],
      accVouchersDocModelList: [null],
      accVouchersDTModelList: [null],
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      paymentMethod: [''],
    });
  }

  GetInitailTransfervoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.transferVoucherService.GetInitailTransferVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['TransferVoucher/TransferVoucherList']);
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
      this.defaultCurrencyId = result.defaultCurrency;
      this.TransferVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.TransferVoucherAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      this.childAttachment.data = result.accVouchersDocModelList;
      this.childAttachment.ngOnInit();
    if(this.opType == 'Edit')
      {
        this.disableVouchertype= true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.disableSave = false;
        debugger
        if (this.voucherId > 0) {
          var pm = result.paymentMethod.split(',').map(Number)
          this.TransferVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.TransferVoucherAddForm.get("currencyId").setValue(result.currencyId);
          this.TransferVoucherAddForm.get("branchId").setValue(result.branchId);
          this.selectedacc1 = result.debitAccountId;
          this.selectedacc2 = result.creditAccountId;
          this.TransferVoucherAddForm.get("debitAccountId").setValue(result.debitAccountId);
          this.TransferVoucherAddForm.get("creditAccountId").setValue(result.creditAccountId);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.TransferVoucherAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.TransferVoucherAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          debugger
          this.TransferVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.TransferVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.TransferVoucherAddForm.get("paymentMethod").setValue(result.paymentMethod);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.TransferVoucherAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.TransferVoucherAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.TransferVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (this.TransferVoucherAddForm.value.currencyId == 0) {
            this.TransferVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.TransferVoucherAddForm.get("currRate").setValue(currRate);
          }

        }
        this.GetVoucherTypeSetting(this.TransferVoucherAddForm.value.voucherTypeId)
        if (this.TransferVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
    var voucherCategory = this.TransferVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.TransferVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.TransferVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    this.selectedacc1 = this.voucherTypeList.find(option => option.label === selectedValue).debitAccId;
    this.selectedacc2 = this.voucherTypeList.find(option => option.label === selectedValue).creditAccId;
    this.TransferVoucherAddForm.get("debitAccountId").setValue(this.selectedacc1);
    this.TransferVoucherAddForm.get("creditAccountId").setValue(this.selectedacc2);
    if (branchId == null || branchId == undefined) {
      branchId = 0;
    }
    debugger
    if (voucherTypeId > 0) {
      this.transferVoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.TransferVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.TransferVoucherAddForm.get("voucherNo").setValue(1);
        }
        debugger
        this.TransferVoucherAddForm.get("branchId").setValue(branchId);
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
      this.TransferVoucherAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.TransferVoucherAddForm.get("currRate").setValue(currRate);
      if (this.TransferVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.TransferVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.TransferVoucherAddForm.get("currRate").setValue(currRate);
      if (this.TransferVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.TransferVoucherAddForm.get("currRate").setValue(currRate);
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

  claculateAmount(amountt) {
    debugger
    if (amountt > 0) {
      this.TransferVoucherAddForm.get("amount").setValue(amountt);
    }
    var amount = parseFloat(this.TransferVoucherAddForm.value.amount);
    this.TransferVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);
    this.Amount = this.TransferVoucherAddForm.value.amount;
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
        this.transferVoucherService.DeleteTransferVoucher(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['TransferVoucher/TransferVoucherList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['TransferVoucher/TransferVoucherList']);
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
    this.disableSave = true;
    this.changeDetectorRef.detectChanges();
    debugger
    this.TransferVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.TransferVoucherAddForm.value.userId = this.jwtAuth.getUserId();

    debugger
    this.TransferVoucherAddForm.value.voucherNo = this.TransferVoucherAddForm.value.voucherNo.toString();
    this.TransferVoucherAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;

    if (this.TransferVoucherAddForm.value.paymentMethod == null) {
      this.TransferVoucherAddForm.value.paymentMethod = '';
    }
    this.changeDetectorRef.detectChanges();
    this.TransferVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.transferVoucherService.SaveTransferVoucher(this.TransferVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.TransferVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintTransferVoucher(Number(result.message));
          }

          debugger
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['TransferVoucher/TransferVoucherList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ClearForm();
          this.Amount = 0;
          this.changeDetectorRef.detectChanges();
          this.ngOnInit();
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

  ClearForm() {
    this.changeDetectorRef.detectChanges();
    this.TransferVoucherAddForm.get("amount").setValue(0);
    this.TransferVoucherAddForm.get("referenceNo").setValue("");
    this.TransferVoucherAddForm.get("note").setValue("");
    this.Amount = 0;
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.TransferVoucherAddForm.value.voucherTypeId);
    });
    this.changeDetectorRef.detectChanges();
  }

  PrintTransferVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptTransferVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `rptTransferVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  } 

  voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.transferVoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
          {
            debugger
            if(res.id > 0)
              {
                if(res.status ==  66)
                  {
                    this.voucherId =res.id;
                    this.opType = "Edit";
                    this.showsave = false;
                    //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                    //this.childAttachment.data = [];
                    this.disableAll = false;
                    this.GetInitailTransfervoucher();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                   // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetInitailTransfervoucher();
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


/*   voucherNoBlur(voucherNo, voucherTypeId)
  {
    debugger
    this.transferVoucherService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
      debugger
      if (result !=  null) {
        this.voucherId = result.id;
        this.opType = 'Edit';
        if(result.status == 67)
          {
              this.opType = 'Show';
          }
        this.GetInitailTransfervoucher();
      }
      else {
        this.voucherId = 0;
        this.opType = 'Add';
        this.clearFormdata(voucherNo);
      }
    });
  } */


  clearFormdata(VoucherNo)
  {    debugger
    this.newDate = new Date;
    this.TransferVoucherAddForm.get("id").setValue(0);
    this.TransferVoucherAddForm.get("voucherNo").setValue(VoucherNo);
    this.TransferVoucherAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.TransferVoucherAddForm.get("branchId").setValue(0);
    this.TransferVoucherAddForm.get("currencyId").setValue(0);
    this.TransferVoucherAddForm.get("currRate").setValue(0);
    this.TransferVoucherAddForm.get("debitAccountId").setValue(0);
    this.TransferVoucherAddForm.get("creditAccountId").setValue(0);
    this.TransferVoucherAddForm.get("referenceNo").setValue("");
    this.TransferVoucherAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.TransferVoucherAddForm.get("amount").setValue("");
    this.TransferVoucherAddForm.get("note").setValue("");
    this.TransferVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.TransferVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }
}
