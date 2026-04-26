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
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { CostcentertransComponent } from 'app/views/app-account/costcentertrans/costcentertrans.component';
import { ProjectstransComponent } from 'app/views/app-account/projectstrans/projectstrans.component';
import Swal from 'sweetalert2';
import { SuppCreditNoteVoucherService } from '../supplierCreditNote.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-suppliercreditvoucher-form',
  templateUrl: './suppliercreditvoucher-form.component.html',
  styleUrls: ['./suppliercreditvoucher-form.component.scss']
})
export class SuppliercreditvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  supCreditVoucherAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  accountsList: any;
  currencyList: any;
  voucherTypeList: any;
  branchesList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  selectedVoucherType: any;
  costcenterList: any;
  projectsList: any;
  voucherId: any;
  voucherType: any;
  bankList: any;
  creditBankList: any;
  supplierList: any;
  empList: any;
  decimalPlaces: number;
  public Amount: any;
  disableAll: boolean = false;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean;
  defaultCurrencyId: number;
  allowMultiCurrency: boolean;
  disableCurrRate: boolean;
  disableSave: boolean;
  Lang: string;
  disableVouchertype: boolean = false;
  newDate: any;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private supCreditvoucherService: SuppCreditNoteVoucherService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;
    this.voucherType = "Accounting";
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


    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['SupplierCreditNoteVoucher/SuppCreditVoucherList']);
    }
    this.InitiailPaymentVoucherForm();
    this.GetInitailPaymentVoucher();

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
        this.supCreditVoucherAddForm.get('costCenterId').disable();
      }
      else {
        this.disableAll = false;
        this.supCreditVoucherAddForm.get('costCenterId').enable();

      }
    });
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SuppCreditVoucherList');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPaymentVoucherForm() {
    this.supCreditVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      supplierId: [0, [Validators.required, Validators.min(1)]],
      debitAccountId: [0, [Validators.required, Validators.min(1)]],
      branchId: [null],
      amount: [0, [Validators.required, Validators.min(1)]],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      representId: [0],
      costCenterId: [0],
      referenceNo: [""],
      referenceDate: [""],
      note: [""],
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      userId: [0],
      accVouchersDocModelList: [null],
      generalAttachModelList: [null],

    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailPaymentVoucher() {
    var lang = this.jwtAuth.getLang();
    debugger
    this.supCreditvoucherService.GetInitailSuppCreditNoteVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['SupplierCreditNoteVoucher/SuppCreditVoucherList']);
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
        printAfterSave: item.printAfterSave,
        creditAccId: item.creditAccId,
        debitAccId: item.debitAccId,
      }));
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.bankList = result.bankList;
      this.creditBankList = result.creditBankList;
      this.accountsList = result.accountList;
      this.costcenterList = result.costCenterList;
      this.projectsList = result.projectsList;
      this.supplierList = result.suppliersList
      this.empList = result.employeeModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.supCreditVoucherAddForm.patchValue(result);
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.supCreditVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.voucherId > 0) {
          this.supCreditVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.supCreditVoucherAddForm.get("voucherNo").setValue(result.voucherNo);
          this.supCreditVoucherAddForm.get("voucherDate").setValue(formatDate(result.voucherDate, "yyyy-MM-dd", "en-US"));
          this.supCreditVoucherAddForm.get("supplierId").setValue(result.supplierId);
          this.supCreditVoucherAddForm.get("debitAccountId").setValue(result.debitAccountId);
          this.supCreditVoucherAddForm.get("branchId").setValue(result.branchId);
          this.supCreditVoucherAddForm.get("amount").setValue(result.amount);
          this.supCreditVoucherAddForm.get("currencyId").setValue(result.currencyId);
          this.supCreditVoucherAddForm.get("representId").setValue(result.representId);
          this.supCreditVoucherAddForm.get("costCenterId").setValue(result.costCenterId);
          this.supCreditVoucherAddForm.get("referenceNo").setValue(result.referenceNo);
          this.supCreditVoucherAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.supCreditVoucherAddForm.get("note").setValue(result.note);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.supCreditVoucherAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.supCreditVoucherAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.supCreditVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.supCreditVoucherAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.supCreditVoucherAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.supCreditVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.supCreditVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (this.supCreditVoucherAddForm.value.currencyId == 0) {
            this.supCreditVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.supCreditVoucherAddForm.get("currRate").setValue(currRate);
          }
          if (result.branchId == null || result.branchId == undefined) {
            result.branchId = 0;
          }
          this.supCreditVoucherAddForm.get("branchId").setValue(result.branchId);
          if (result.representId == null || result.representId == undefined) {
            result.representId = 0;
          }
          this.supCreditVoucherAddForm.get("representId").setValue(result.representId);
          if (result.costCenterId == null || result.costCenterId == undefined) {
            result.costCenterId = 0;
          }
          this.supCreditVoucherAddForm.get("costCenterId").setValue(result.costCenterId);
        }
        this.GetVoucherTypeSetting(this.supCreditVoucherAddForm.value.voucherTypeId)
        if (this.supCreditVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.supCreditVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.supCreditVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.supCreditVoucherAddForm.value.voucherNo = this.supCreditVoucherAddForm.value.voucherNo.toString();
    // this.supCreditVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.supCreditVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    if (this.supCreditVoucherAddForm.value.branchId === 0) {
      this.supCreditVoucherAddForm.value.branchId == null;
    }
    if (this.supCreditVoucherAddForm.value.costCenterId === 0) {
      this.supCreditVoucherAddForm.value.costCenterId == null;
    }
    if (this.supCreditVoucherAddForm.value.representId === 0) {
      this.supCreditVoucherAddForm.value.representId == null;
    }
    this.supCreditvoucherService.SaveSuppCreditNoteVoucher(this.supCreditVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.supCreditVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintSupplierCreditvoucher(Number(result.message));
          }

          debugger
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['SupplierCreditNoteVoucher/SuppCreditVoucherList']);
          }
          this.opType = 'Add';
          this.voucherId = 0;
          this.ClearFormData();
          this.ngOnInit();
          this.cdr.detectChanges();
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    var voucherCategory = this.supCreditVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.supCreditVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.supCreditVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.supCreditvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.supCreditVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.supCreditVoucherAddForm.get("voucherNo").setValue(1);
        }
        if (branchId == undefined || branchId == null) {
          this.supCreditVoucherAddForm.get("branchId").setValue(0);
        }
        else {
          this.supCreditVoucherAddForm.get("branchId").setValue(branchId);
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
      this.supCreditVoucherAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.supCreditVoucherAddForm.get("currRate").setValue(currRate);
      if (this.supCreditVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.supCreditVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.supCreditVoucherAddForm.get("currRate").setValue(currRate);
      if (this.supCreditVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.supCreditVoucherAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  claculateAmount() {
    debugger
    var amount = parseFloat(this.supCreditVoucherAddForm.value.amount);
    this.supCreditVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);
    this.Amount = this.supCreditVoucherAddForm.value.amount;
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
        this.supCreditvoucherService.DeleteSuppCreditNoteVoucher(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['SupplierCreditNoteVoucher/SuppCreditVoucherList']);
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteFaild()
            }

          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    let debit = this.voucherTypeList.find(option => option.label === voucherTypeId).debitAccId;
    if (this.opType == "Add") {
      if (debit != 0 && debit != null && debit != undefined) {
        this.supCreditVoucherAddForm.get("debitAccountId").setValue(debit)
      }
    }
  }

  ClearFormData() {
    this.supCreditVoucherAddForm.get("supplierId").setValue(0);
    this.supCreditVoucherAddForm.get("branchId").setValue(0);
    this.supCreditVoucherAddForm.get("amount").setValue(0);
    this.supCreditVoucherAddForm.get("representId").setValue(0);
    this.supCreditVoucherAddForm.get("costCenterId").setValue(0);
    this.supCreditVoucherAddForm.get("referenceNo").setValue("");
    this.supCreditVoucherAddForm.get("note").setValue("");
    this.supCreditVoucherAddForm.get("accVouchersDocModelList").setValue([]);
    this.supCreditVoucherAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.supCreditVoucherAddForm.value.voucherTypeId);
    });
    this.cdr.detectChanges();
  }

  PrintSupplierCreditvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptSupplierCreditvoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptSupplierCreditvoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }


  voucherNoBlur(VoucherNo, VoucherTypeId) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.supCreditvoucherService.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetInitailPaymentVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailPaymentVoucher();
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

  /*   voucherNoBlur(voucherNo, voucherTypeId) {
      debugger
      this.supCreditvoucherService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
        debugger
        if (result !=  null) {
          this.voucherId = result.id;
          this.opType = 'Edit';
          if(result.status == 67)
            {
                this.opType = 'Show';
            }
          this.GetInitailPaymentVoucher();
        }
        else {
          this.voucherId = 0;
          this.opType = 'Add';
          this.clearFormdata(voucherNo);
        }
      });
    } */


  clearFormdata(VoucherNo) {
    debugger
    this.newDate = new Date;
    this.supCreditVoucherAddForm.get("id").setValue(0);
    this.supCreditVoucherAddForm.get("voucherNo").setValue(VoucherNo);
    this.supCreditVoucherAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.supCreditVoucherAddForm.get("supplierId").setValue(0);
    this.supCreditVoucherAddForm.get("debitAccountId").setValue(0);
    this.supCreditVoucherAddForm.get("representId").setValue(0);
    this.supCreditVoucherAddForm.get("representId").setValue(0);
    this.supCreditVoucherAddForm.get("amount").setValue("");
    this.supCreditVoucherAddForm.get("currencyId").setValue(0);
    this.supCreditVoucherAddForm.get("currRate").setValue(0);
    this.supCreditVoucherAddForm.get("referenceNo").setValue("");
    this.supCreditVoucherAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.supCreditVoucherAddForm.get("note").setValue("");
    this.supCreditVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.supCreditVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }
}
