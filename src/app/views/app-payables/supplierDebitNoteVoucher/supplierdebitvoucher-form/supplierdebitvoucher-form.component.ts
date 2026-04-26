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
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { CostcentertransComponent } from 'app/views/app-account/costcentertrans/costcentertrans.component';
import { ProjectstransComponent } from 'app/views/app-account/projectstrans/projectstrans.component';
import Swal from 'sweetalert2';
import { SuppDebitNoteVoucherService } from '../supplierdebit.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-supplierdebitvoucher-form',
  templateUrl: './supplierdebitvoucher-form.component.html',
  styleUrls: ['./supplierdebitvoucher-form.component.scss']
})
export class SupplierdebitvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  supDebitVoucherAddForm: FormGroup;
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
  voucherType:any;
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
  allowMultiCurrency:boolean;
  disableCurrRate:boolean;
  disableSave:boolean;
  disableVouchertype:boolean = false;
  Lang: string;
  newDate:any;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private supDebitvoucherService: SuppDebitNoteVoucherService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.showsave = this.routePartsService.Guid3ToEdit;
    this.voucherType ="Accounting";
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
      this.router.navigate(['SupplierDepitNoteVoucher/SuppDebitVoucherList']);
    }
    this.InitiailPaymentVoucherForm();
    this.GetInitailPaymentVoucher();


    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
        this.supDebitVoucherAddForm.get('costCenterId').disable(); 
           }
      else {
        this.disableAll = false;
        this.supDebitVoucherAddForm.get('costCenterId').enable(); 

      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SuppDebitVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPaymentVoucherForm() {
    this.supDebitVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      supplierId: [0, [Validators.required, Validators.min(1)]],
      creditAccountId: [0, [Validators.required, Validators.min(1)]],
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
    this.supDebitvoucherService.GetInitailSuppDebitNoteVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['SupplierDepitNoteVoucher/SuppDebitVoucherList']);
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
        debitAccId:item.debitAccId,
        creditAccId : item.creditAccId,
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
      this.supDebitVoucherAddForm.patchValue(result);
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.supDebitVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if(this.opType == 'Edit')
        {
          this.disableVouchertype= true;
        }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.disableSave = false;
        if (this.voucherId > 0) {
          this.supDebitVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.supDebitVoucherAddForm.get("voucherNo").setValue(result.voucherNo);
          this.supDebitVoucherAddForm.get("voucherDate").setValue(formatDate(result.voucherDate, "yyyy-MM-dd", "en-US"));
          this.supDebitVoucherAddForm.get("supplierId").setValue(result.supplierId);
          this.supDebitVoucherAddForm.get("creditAccountId").setValue(result.creditAccountId);
          this.supDebitVoucherAddForm.get("branchId").setValue(result.branchId);
          this.supDebitVoucherAddForm.get("amount").setValue(result.amount);
          this.supDebitVoucherAddForm.get("currencyId").setValue(result.currencyId);
          this.supDebitVoucherAddForm.get("representId").setValue(result.representId);
          this.supDebitVoucherAddForm.get("costCenterId").setValue(result.costCenterId);
          this.supDebitVoucherAddForm.get("referenceNo").setValue(result.referenceNo);
          this.supDebitVoucherAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.supDebitVoucherAddForm.get("note").setValue(result.note);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.supDebitVoucherAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.supDebitVoucherAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          debugger
          this.supDebitVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.supDebitVoucherAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.supDebitVoucherAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.supDebitVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.supDebitVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (this.supDebitVoucherAddForm.value.currencyId == 0) {
            this.supDebitVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.supDebitVoucherAddForm.get("currRate").setValue(currRate);
          }
          if(result.branchId == null || result.branchId == undefined)
            {
              result.branchId = 0;
            }
          this.supDebitVoucherAddForm.get("branchId").setValue(result.branchId);
          if(result.representId == null || result.representId == undefined)
            {
              result.representId = 0;
            }
          this.supDebitVoucherAddForm.get("representId").setValue(result.representId);
          if(result.costCenterId == null || result.costCenterId == undefined)
            {
              result.costCenterId = 0;
            }
          this.supDebitVoucherAddForm.get("costCenterId").setValue(result.costCenterId);
        }
        this.GetVoucherTypeSetting(this.supDebitVoucherAddForm.value.voucherTypeId)
        if(this.supDebitVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
        else
          {
            this.disableCurrRate = false;
          }
      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    this.supDebitVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.supDebitVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.supDebitVoucherAddForm.value.voucherNo = this.supDebitVoucherAddForm.value.voucherNo.toString();
    this.supDebitVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.supDebitVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    if (this.supDebitVoucherAddForm.value.branchId === 0) {
      this.supDebitVoucherAddForm.value.branchId == null;
    }
    if (this.supDebitVoucherAddForm.value.costCenterId === 0) {
      this.supDebitVoucherAddForm.value.costCenterId == null;
    }
    if (this.supDebitVoucherAddForm.value.representId === 0) {
      this.supDebitVoucherAddForm.value.representId == null;
    }
    this.supDebitvoucherService.SaveSuppDebitNoteVoucher(this.supDebitVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.supDebitVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintSupplierdebitvoucher(Number(result.message));
          }


          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['SupplierDepitNoteVoucher/SuppDebitVoucherList']);
            }
            this.voucherId = 0;
            this.opType = 'Add';
            this.ClearFormData();
            this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    var voucherCategory = this.supDebitVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.supDebitVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.supDebitVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.supDebitvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.supDebitVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.supDebitVoucherAddForm.get("voucherNo").setValue(1);
        }
        if(branchId == null || branchId == undefined)
          {
            this.supDebitVoucherAddForm.get("branchId").setValue(0);
          }
          else
          {
            this.supDebitVoucherAddForm.get("branchId").setValue(branchId);
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
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.supDebitVoucherAddForm.get("currencyId").setValue(currencyId);
        var currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.supDebitVoucherAddForm.get("currRate").setValue(currRate);
        if(this.supDebitVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
      }
      else
      {
        this.supDebitVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
        this.supDebitVoucherAddForm.get("currRate").setValue(currRate);
        if(this.supDebitVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
      }
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.supDebitVoucherAddForm.get("currRate").setValue(currRate);
    if(event.value == this.defaultCurrencyId)
      {
        this.disableCurrRate=true;
      }
    else
      {
        this.disableCurrRate = false;
      }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  claculateAmount() {
    debugger
    var amount = parseFloat(this.supDebitVoucherAddForm.value.amount);
    this.supDebitVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);
    this.Amount = this.supDebitVoucherAddForm.value.amount;
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
        this.supDebitvoucherService.DeleteSuppDebitNoteVoucher(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['SupplierDepitNoteVoucher/SuppDebitVoucherList']);
          }
          else {
            if (results.isSuccess == false && results.message == "msNoPermission") {
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
    let credit = this.voucherTypeList.find(option => option.label === voucherTypeId).creditAccId;
     if(this.opType == "Add")
     {
     if(credit != 0 && credit != null && credit != undefined)
      {
        this.supDebitVoucherAddForm.get("creditAccountId").setValue(credit)
      } 
     } 
  }

  ClearFormData()
  {
    this.supDebitVoucherAddForm.get("supplierId").setValue(0);
    this.supDebitVoucherAddForm.get("creditAccountId").setValue(0);
    this.supDebitVoucherAddForm.get("branchId").setValue(0);
    this.supDebitVoucherAddForm.get("amount").setValue(0);
    this.supDebitVoucherAddForm.get("representId").setValue(0);
    this.supDebitVoucherAddForm.get("costCenterId").setValue(0);
    this.supDebitVoucherAddForm.get("referenceNo").setValue("");
    this.supDebitVoucherAddForm.get("note").setValue("");
    this.supDebitVoucherAddForm.get("accVouchersDocModelList").setValue([]);
    this.supDebitVoucherAddForm.get("generalAttachModelList").setValue([]); 
    this.childAttachment.data =[];   
    setTimeout(() => {
     this.GetVoucherTypeSetting(this.supDebitVoucherAddForm.value.voucherTypeId); 
    });
  }

  PrintSupplierdebitvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptSupplierdebitvoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptSupplierdebitvoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  
  voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.supDebitvoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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
                    this.GetInitailPaymentVoucher();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                   // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetInitailPaymentVoucher();
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

  
/*   voucherNoBlur(voucherNo, voucherTypeId) {
    debugger
    this.supDebitvoucherService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
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


  clearFormdata(VoucherNo)
  {    debugger
    this.newDate = new Date;
    this.supDebitVoucherAddForm.get("id").setValue(0);
    this.supDebitVoucherAddForm.get("voucherNo").setValue(VoucherNo);
    this.supDebitVoucherAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.supDebitVoucherAddForm.get("supplierId").setValue(0);
    this.supDebitVoucherAddForm.get("creditAccountId").setValue(0);
    this.supDebitVoucherAddForm.get("branchId").setValue(0);
    this.supDebitVoucherAddForm.get("representId").setValue(0);
    this.supDebitVoucherAddForm.get("amount").setValue("");
    this.supDebitVoucherAddForm.get("currencyId").setValue(0);
    this.supDebitVoucherAddForm.get("currRate").setValue(0);
    this.supDebitVoucherAddForm.get("referenceNo").setValue("");
    this.supDebitVoucherAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.supDebitVoucherAddForm.get("note").setValue("");
    this.supDebitVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.supDebitVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }
}
