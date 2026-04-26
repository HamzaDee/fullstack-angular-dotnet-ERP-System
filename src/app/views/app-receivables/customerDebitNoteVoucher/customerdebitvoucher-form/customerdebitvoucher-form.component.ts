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
import { CustDebitNoteVoucherService } from '../customerDebitNote.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-customerdebitvoucher-form',
  templateUrl: './customerdebitvoucher-form.component.html',
  styleUrls: ['./customerdebitvoucher-form.component.scss']
})
export class CustomerdebitvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  cusDebitVoucherAddForm: FormGroup;
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
  customersList: any;
  empList: any;
  decimalPlaces: number;
  public Amount: any;
  disableAll:boolean=false;
  voucherNo: number = 0;
//VoucherTypeSetting
  allowEditDate:boolean= false;
  allowEditVoucherSerial:boolean= false;
  allowEditBranch:boolean= false;
//End
  useCostCenter: boolean;
  defaultCurrencyId:number;
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
              private cupDebitvoucherService: CustDebitNoteVoucherService,
              private translateService: TranslateService,
              public router: Router,
              private formbulider: FormBuilder,
              public routePartsService: RoutePartsService,
              private http: HttpClient,
              private appCommonserviceService: AppCommonserviceService,
              private dialog: MatDialog,
            ) { }

  ngOnInit(): void 
  {
    debugger
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
      this.router.navigate(['CustomersDebitNote/CustDebitvoucherList']);
    }
    this.InitiailPaymentVoucherForm();
    this.GetInitailPaymentVoucher();


    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
        this.cusDebitVoucherAddForm.get('costCenterId').disable(); 
           }
      else {
        this.disableAll = false;
        this.cusDebitVoucherAddForm.get('costCenterId').enable(); 

      }
    });
  }


  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustDebitvoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPaymentVoucherForm() {
    this.cusDebitVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      customerId: [0, [Validators.required, Validators.min(1)]],
      creditAccountId:[0, [Validators.required, Validators.min(1)]],
      branchId: [null],
      amount: [0, [Validators.required, Validators.min(1)]],      
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      representId: [0],
      costCenterId: [0],
      referenceNo: [""],
      referenceDate: [""],
      note:[""],             
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      userId: [0],
      accVouchersDocModelList: [null]
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
    this.cupDebitvoucherService.GetInitailCustDebitNoteVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['CustomersDebitNote/CustDebitvoucherList']);
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
        preventChangeBranch:item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        printAfterSave: item.printAfterSave,
        creditAccId : item.creditAccId,
        debitAccId:item.debitAccId,
      }));
      debugger
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.bankList = result.bankList;      
      this.creditBankList = result.creditBankList;      
      this.accountsList = result.accountList;
      this.costcenterList = result.costCenterList;
      this.projectsList = result.projectsList;
      this.customersList = result.customersList
      this.empList = result.employeeModelList;
      this.defaultCurrencyId =result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.cusDebitVoucherAddForm.patchValue(result);
      if(result.accVouchersDocModelList.length !== 0)
      {
        this.cusDebitVoucherAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
        this.childAttachment.data = result.accVouchersDocModelList;
        this.childAttachment.ngOnInit();      
      } 
      debugger
      if(this.opType == 'Edit')
        {
          this.disableVouchertype= true;
        }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.voucherId > 0) {
          this.cusDebitVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.cusDebitVoucherAddForm.get("voucherNo").setValue(result.voucherNo);
          this.cusDebitVoucherAddForm.get("voucherDate").setValue(formatDate(result.voucherDate, "yyyy-MM-dd", "en-US"));
          this.cusDebitVoucherAddForm.get("customerId").setValue(result.customerId);
          this.cusDebitVoucherAddForm.get("creditAccountId").setValue(result.creditAccountId);
          this.cusDebitVoucherAddForm.get("branchId").setValue(result.branchId);
          this.cusDebitVoucherAddForm.get("amount").setValue(result.amount);
          this.cusDebitVoucherAddForm.get("currencyId").setValue(result.currencyId);
          this.cusDebitVoucherAddForm.get("representId").setValue(result.representId);
          this.cusDebitVoucherAddForm.get("costCenterId").setValue(result.costCenterId);
          this.cusDebitVoucherAddForm.get("referenceNo").setValue(result.referenceNo);
          this.cusDebitVoucherAddForm.get("referenceDate").setValue(formatDate(result.referenceDate, "yyyy-MM-dd", "en-US"));
          this.cusDebitVoucherAddForm.get("note").setValue(result.note);

          this.useCostCenter = result.useCostCenter;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency]; 
            this.cusDebitVoucherAddForm.get("currencyId").setValue(result.currencyId);          
          }
  
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche]; 
            this.cusDebitVoucherAddForm.get("branchId").setValue(result.branchId); 
          }
        }
        else {
          debugger
          this.cusDebitVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency]; 
            this.cusDebitVoucherAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.cusDebitVoucherAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          var voucherType = this.voucherTypeList.find(r => r.isDefault == true).label;
          if(voucherType != null && voucherType != undefined && voucherType >0)
            {
              this.cusDebitVoucherAddForm.get("voucherTypeId").setValue(voucherType);
              this.getVoucherNo(this.cusDebitVoucherAddForm.value.voucherTypeId);
            }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche]; 
            this.cusDebitVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if(this.cusDebitVoucherAddForm.value.currencyId == 0 )
            {
              this.cusDebitVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
              var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
              this.cusDebitVoucherAddForm.get("currRate").setValue(currRate);       
            }
            if(result.representId == null || result.representId == undefined)
              {
                result.representId = 0;
                this.cusDebitVoucherAddForm.get("representId").setValue(result.representId);
              }
            if(result.costCenterId == null || result.costCenterId == undefined)
              {
                result.costCenterId = 0;
                this.cusDebitVoucherAddForm.get("costCenterId").setValue(result.costCenterId);
              }   
        }
        this.GetVoucherTypeSetting(this.cusDebitVoucherAddForm.value.voucherTypeId)
        if(this.cusDebitVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    this.cusDebitVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.cusDebitVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.cusDebitVoucherAddForm.value.voucherNo = this.cusDebitVoucherAddForm.value.voucherNo.toString();
    this.cusDebitVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    // this.cusDebitVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    if(this.cusDebitVoucherAddForm.value.branchId === 0)
    {
      this.cusDebitVoucherAddForm.value.branchId ==null;
    }
    if(this.cusDebitVoucherAddForm.value.costCenterId === 0)
    {
      this.cusDebitVoucherAddForm.value.costCenterId ==null;
    }
    if(this.cusDebitVoucherAddForm.value.representId === 0)
    {
      this.cusDebitVoucherAddForm.value.representId ==null;
    }
    this.cupDebitvoucherService.SaveCustDebitNoteVoucher(this.cusDebitVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.cusDebitVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintCustomerDebitNote(Number(result.message));
          }

          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['CustomersDebitNote/CustDebitvoucherList']);
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
    var voucherCategory = this.cusDebitVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.cusDebitVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.cusDebitVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.cupDebitvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.cusDebitVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.cusDebitVoucherAddForm.get("voucherNo").setValue(1);
        }               
      });
    }
    debugger
    if(branchId == null || branchId == undefined)
      {
        branchId= 0;
        this.cusDebitVoucherAddForm.get("branchId").setValue(branchId);        
      }
    
    if( currencyId!= 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true)
      {
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      }
    else
      {
        this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;            
      }
    if(voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined)
      {
        this.GetVoucherTypeSetting(voucherTypeId);
      }
      if( currencyId!= 0 && currencyId != null && currencyId != undefined)
        {
          this.cusDebitVoucherAddForm.get("currencyId").setValue(currencyId);
          var currRate = this.currencyList.find(option => option.id === currencyId).data1;
          this.cusDebitVoucherAddForm.get("currRate").setValue(currRate);
          if(this.cusDebitVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
          this.cusDebitVoucherAddForm.get("currencyId").setValue(this.defaultCurrencyId);
          let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
          this.cusDebitVoucherAddForm.get("currRate").setValue(currRate);
          if(this.cusDebitVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    this.cusDebitVoucherAddForm.get("currRate").setValue(currRate);   
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


  claculateAmount(){
    debugger
    var amount = parseFloat( this.cusDebitVoucherAddForm.value.amount);
    this.cusDebitVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);
    this.Amount =  this.cusDebitVoucherAddForm.value.amount;
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
        this.cupDebitvoucherService.DeleteCustDebitNoteVoucher(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['CustomersDebitNote/CustDebitvoucherList']);
          }
          else {
            if(result.isSuccess == false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else
              {
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

  GetVoucherTypeSetting(voucherTypeId:number)
  {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial; 
    this.allowEditBranch =this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    let CreditAcc = this.voucherTypeList.find(option => option.label === voucherTypeId).creditAccId;
    if (this.opType == "Add") {
    if(CreditAcc != null && CreditAcc != 0 && CreditAcc!= undefined)
      {
        this.cusDebitVoucherAddForm.get("creditAccountId").setValue(CreditAcc);
      }   
    }             
  }

  ClearFormData()
  {
    this.cusDebitVoucherAddForm.get("customerId").setValue(0);
    this.cusDebitVoucherAddForm.get("branchId").setValue(0);
    this.cusDebitVoucherAddForm.get("amount").setValue(0);
    this.cusDebitVoucherAddForm.get("representId").setValue(0);
    this.cusDebitVoucherAddForm.get("costCenterId").setValue(0);
    this.cusDebitVoucherAddForm.get("referenceNo").setValue("");
    this.cusDebitVoucherAddForm.get("note").setValue("");
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.cusDebitVoucherAddForm.value.voucherTypeId); 
    });
  }

  PrintCustomerDebitNote(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptCustomerDebitNoteAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptCustomerDebitNoteEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

/*   voucherNoBlur(voucherNo, voucherTypeId) {
    debugger
    this.cupDebitvoucherService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
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

    voucherNoBlur(VoucherNo , VoucherTypeId)
    {
      debugger
      if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
        {
          this.cupDebitvoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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


  clearFormdata(VoucherNo)
  {    debugger
    this.newDate = new Date;
    this.cusDebitVoucherAddForm.get("id").setValue(0);
    this.cusDebitVoucherAddForm.get("voucherNo").setValue(VoucherNo);
    this.cusDebitVoucherAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.cusDebitVoucherAddForm.get("customerId").setValue(0);
    this.cusDebitVoucherAddForm.get("creditAccountId").setValue(0);
    this.cusDebitVoucherAddForm.get("branchId").setValue(0);
    this.cusDebitVoucherAddForm.get("representId").setValue(0);
    this.cusDebitVoucherAddForm.get("amount").setValue("");
    this.cusDebitVoucherAddForm.get("currencyId").setValue(0);
    this.cusDebitVoucherAddForm.get("currRate").setValue(0);
    this.cusDebitVoucherAddForm.get("referenceNo").setValue("");
    this.cusDebitVoucherAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.cusDebitVoucherAddForm.get("note").setValue("");
    this.cusDebitVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.cusDebitVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

   loadLazyCustomerOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.customersList) {
        this.customersList = [];
    }

    // Make sure the array is large enough
    while (this.customersList.length < last) {
        this.customersList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.customersList[i] = this.customersList[i];
    }

    this.loading = false;
  }
}
