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
import Swal from 'sweetalert2';
import { CustomerPaymentvoucherService } from '../customerpaymentvoucher.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-customerpaymentvoucher-form',
  templateUrl: './customerpaymentvoucher-form.component.html',
  styleUrls: ['./customerpaymentvoucher-form.component.scss']
})
export class CustomerpaymentvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  custPaymentVoucherAddForm: FormGroup = new FormGroup({});
  public TitlePage: string = "";
  tabelData: any[] = [];
  loading: boolean  = false;
  opType: string = "";
  showsave: boolean = true;
  accountsList: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  debitAccountsList: any[] = [];
  creditAccountsList: any[] = [];
  chequesList: any[] = [];
  creditCardsList: any[] = [];
  payBillsList: any[] = [];
  voucherTypeList: any;
  branchesList: any;
  costCenterPolicyList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string = "";
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  costcenterList: any;
  projectsList: any;
  voucherId: any;
  voucherType:any;
  paymentMethodList: any;
  bankList: any;
  creditBankList: any;
  statusList: any;
  creditCardsTypes: any;
  customerList: any;
  empList: any;
  cheqAmount: number = 0
  cardsAmount: number = 0
  decimalPlaces: number = 0;
  Amount: any;
  AccountNo: any;
  disableAll: boolean = false;
  voucherNo: number = 0;
  cheqAcc: number = 0;
  bankId: number = 0;
  cheqStatus: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean = false;
  defaultCurrencyId: number = 0;
  allowMultiCurrency:boolean = false;
  invoicesTotal: number = 0;
  disabled:boolean = true;
  dealerInfo:string = "";
  //Customer INFO 
  dealerBalance:number = 0;
  dealerAmt:number = 0;
  dealerChequeAmt:number = 0;
  dealerPolicy:number = 0;

  NoteBalance:any;
  NoteAlert:any;
  NotePrevenet:any;
  NoteAlertCheque:any;
  NotePreventCheque:any;
  newDate:any;
  showBalance:boolean = false;
  showAlert:boolean = false;
  showPrevent:boolean = false;
  showAlertCheque:boolean = false;
  showPreventCheque:boolean = false;
  //END
  disableCurrRate:boolean = false;
  disableSave:boolean = false;
  disableVouchertype:boolean = false;
  Lang: string = "";
  SavedTypeId : any;
  defaultCashAccId:any;
  //Linking Accounts Setting 
  cashAccount:any;
  chequesAccount:any;
  cardAccount:any;
  disableCashAccount:boolean = false;
  disableChequeAccount:boolean = false;
  disableCardAccOunt:boolean = false;
  //

  cliqDetails: any[] = [];
  cliqTypesList : any;
  CliqTotal = 0;
  TotalDebitValue: number = 0;
  DiffValue: number = 0;
  dealerAccountId :number = 0;
  dealerName:string = "";

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private cuspaymentvoucherService: CustomerPaymentvoucherService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private appCommonserviceService: AppCommonserviceService,
      private cdr: ChangeDetectorRef,
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
      this.router.navigate(['CustomerPaymentVoucher/CustpaymentvoucherList']);
    }
    this.InitiailCusPaymentVoucherForm();
    this.GetInitailCustPaymentVoucher();

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
        this.custPaymentVoucherAddForm.get('costCenterId')?.disable(); 
           }
      else {
        this.disableAll = false;
        this.custPaymentVoucherAddForm.get('costCenterId')?.enable(); 

      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('addCustomerPaymentVoucher');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCusPaymentVoucherForm() {
    this.custPaymentVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      customerId: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: ["", [Validators.required]],
      representId: [0],
      amount: [0, [Validators.required, Validators.min(1)]],
      cashAccId: [0],
      cashAmount: [0],
      referenceNo: [""],
      referenceDate: [""],
      costCenterId: [0],
      isCanceled: [false],
      isPosted: [false],
      status: [null],
      userId: [0],
      note: [""],
      accVouchersDTModelList: [null],
      accVouchersDocModelList: [null],
      chequeModelList: [null],
      creditCardModelList: [null],
      generalAttachModelList: [null],
      paymentVoucherList: [null],
      cliQModelList:[null],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailCustPaymentVoucher() {
    var lang = this.jwtAuth.getLang();

    this.cuspaymentvoucherService.GetInitailCustPaymentVoucher(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['CustomerPaymentVoucher/CustpaymentvoucherList']);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item:any) => ({
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
        paymentMethod: item.paymentMethod,
        cheqAccId: item.cheqAccId,
        bankId: item.bankId,
        defChequeStatus: item.defChequeStatus,
        creditAccId: item.creditAccId,
        printAfterSave: item.printAfterSave
      }));
      
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;      
      this.decimalPlaces = result.currencyList.find((option: any) => option.id === result.defaultCurrency).data2;
      this.bankList = result.bankList;
      this.statusList = result.statusList;
      this.creditBankList = result.creditBankList;
      this.creditCardsTypes = result.creditCardsTypes;
      this.accountsList = result.accountList;
      this.costcenterList = result.costCenterList;
      this.projectsList = result.projectsList;
      this.customerList = result.customersList
      this.empList = result.employeeModelList;
      this.custPaymentVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.paymentMethodList = result.paymentMethodList;
      this.custPaymentVoucherAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
      this.debitAccountsList = result.accVouchersDTModelList.filter((x: any) => x.debit > 0 && x.cheqId == null && x.creditCardId == null);
      this.creditAccountsList = result.accVouchersDTModelList.filter((x: any) => x.credit > 0 && x.cheqId == null && x.creditCardId == null);
      this.defaultCurrencyId = result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.defaultCashAccId = result.cashAccId;
      this.cashAccount = result.cashAccount;
      this.chequesAccount = result.chequesAccount;
      this.cardAccount = result.cardAccount;
      this.cliqTypesList = result.cliqTypesList;
      if(this.chequesAccount > 0)
        {
          this.disableChequeAccount = true; 
        }
      if(this.cardAccount > 0)
        {
          this.disableCardAccOunt = true; 
        }
      if (result.chequeModelList != null) {
        this.chequesList = result.chequeModelList;
        for (let element of this.chequesList) {
          element.dueDate = formatDate(element.dueDate, "yyyy-MM-dd", "en-US");
        }
      }
      if (result.creditCardModelList != null) {
        this.creditCardsList = result.creditCardModelList;
        for (let element of this.creditCardsList) {
          element.paymentDate = formatDate(element.paymentDate, "yyyy-MM-dd", "en-US");
        }
      }
      if(result.cliQModelList != null && result.cliQModelList.length >0)
      {
        this.cliqDetails = result.cliQModelList;
        this.calculateSum(5);          
      }
      if (result.paymentVoucherList != 0 && result.paymentVoucherList.length > 0) {
        this.payBillsList = result.paymentVoucherList
      }
      if (result.accVouchersDocModelList !== null && result.accVouchersDocModelList.length !== 0 && result.accVouchersDocModelList !== undefined) {
        this.custPaymentVoucherAddForm.get("generalAttachModelList")?.setValue(result.accVouchersDocModelList);
        this.childAttachment.data = result.accVouchersDocModelList;
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
          var pm = result.paymentMethod.split(',').map(Number)
          this.custPaymentVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.custPaymentVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          this.custPaymentVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue(pm);
          this.SavedTypeId = pm;
          this.custPaymentVoucherAddForm.get("customerId")?.setValue(result.customerId);
          this.custPaymentVoucherAddForm.get("amount")?.setValue(result.amount);
          this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(result.cashAccId);
          this.custPaymentVoucherAddForm.get("representId")?.setValue(result.representId);
          this.custPaymentVoucherAddForm.get("note")?.setValue(result.note);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency : any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.custPaymentVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche : any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.custPaymentVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }
          this.dealerInfo = result.dealerName;
        }
        else {
          debugger
          this.custPaymentVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          if (result.paymentMethod !== null && result.paymentMethod !== undefined) {
            this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          }
          else {
            this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue("");
          }
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency : any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.custPaymentVoucherAddForm.get("currencyId")?.setValue(defaultCurrency.id);
            this.custPaymentVoucherAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          debugger
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche : any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.custPaymentVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          if (this.custPaymentVoucherAddForm.value.currencyId == 0) {
            this.custPaymentVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option : any) => option.id === this.defaultCurrencyId).data1;
            this.custPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
          }
          
          if(result.representId == null || result.representId == undefined)
            {
              result.representId = 0;
              this.custPaymentVoucherAddForm.get("representId")?.setValue(result.representId);
            }
          if(result.cashAccId == null || result.cashAccId == undefined)
            {
              result.cashAccId = 0;
              this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(result.cashAccId);
            }                                
          if(result.costCenterId == null || result.costCenterId == undefined)
            {
              result.costCenterId = 0;
              this.custPaymentVoucherAddForm.get("costCenterId")?.setValue(result.costCenterId);
            }    
            this.dealerInfo = "";    
            var voucherType = this.voucherTypeList.find((r : any) => r.isDefault == true).label;
            if (voucherType != null && voucherType != undefined && voucherType > 0) {
              this.custPaymentVoucherAddForm.get("voucherTypeId")?.setValue(voucherType);
              this.getVoucherNo(this.custPaymentVoucherAddForm.value.voucherTypeId);
            }                         
        }
        this.GetVoucherTypeSetting(this.custPaymentVoucherAddForm.value.voucherTypeId)
        if(this.custPaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    const isValid = this.OnSaveValidation();
    if (!isValid) {
      this.disableSave = false;
      return;
    }
   
    this.custPaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue([]);
    this.custPaymentVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.custPaymentVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.custPaymentVoucherAddForm.value.voucherNo = this.custPaymentVoucherAddForm.value.voucherNo.toString();    
    this.custPaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue(this.debitAccountsList);
    this.custPaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue([...this.custPaymentVoucherAddForm.value.accVouchersDTModelList, ...this.creditAccountsList])
    this.custPaymentVoucherAddForm.get("paymentVoucherList")?.setValue(this.payBillsList);
    this.custPaymentVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.custPaymentVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);
    this.custPaymentVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
    this.custPaymentVoucherAddForm.get("cliQModelList")?.setValue(this.cliqDetails);    
    this.cuspaymentvoucherService.SaveCustPaymentVoucher(this.custPaymentVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
  /*         if(result.message != "" && result.message != null && result.message != undefined)
            {                
              this.alert.ShowAlert(result.message, 'error');
              this.disableSave = false;
              return;
            } */

          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option : any) => option.label === this.custPaymentVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintCustomerpaymentvoucher(Number(result.message));
          }

          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['CustomerPaymentVoucher/CustpaymentvoucherList']);
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
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find((option : any) => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find((option : any) => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find((option : any) => option.label === selectedValue).branchId;
    var voucherCategory = this.custPaymentVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.custPaymentVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.custPaymentVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.cuspaymentvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.custPaymentVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.custPaymentVoucherAddForm.get("voucherNo")?.setValue(1);
        }    
         if(branchId == null || branchId == undefined)
          {
            this.custPaymentVoucherAddForm.get("branchId")?.setValue(0);
          }
          else
          {
            this.custPaymentVoucherAddForm.get("branchId")?.setValue(branchId);
          }   
      });
       
      if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
        this.decimalPlaces = this.currencyList.find((option : any) => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.currencyList.find((option : any) => option.id === this.defaultCurrencyId).data2;
      }
    }

    
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.custPaymentVoucherAddForm.get("currencyId")?.setValue(currencyId);
        var currRate = this.currencyList.find((option : any) => option.id === currencyId).data1;
        this.custPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
        if(this.custPaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
        this.cdr.detectChanges();
      }
      else
      {
        this.custPaymentVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find((option : any) => option.id === this.defaultCurrencyId).data1;
        this.custPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
        if(this.custPaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    var currRate = this.currencyList.find((option : any) => option.id === selectedValue).data1;
    
    this.decimalPlaces = this.currencyList.find((option : any) => option.id === selectedValue).data2;
    this.custPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
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

  formatAmt() {
    
    var amount = parseFloat(this.custPaymentVoucherAddForm.value.amount);
    this.custPaymentVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);
    this.Amount = this.custPaymentVoucherAddForm.value.amount;
    this.payBillsList.forEach(element => {
      element.paidAmt = 0      
    });
  }

  FormATAmount(row: any, type: number) {
    
    if (type === 0) {
      row.amount = row.amount.toFixed(this.decimalPlaces);
      if (this.custPaymentVoucherAddForm.value.paymentMethod.indexOf(77) !== -1) 
        {
          if(Number(row.amount) + this.dealerBalance > this.dealerChequeAmt)
            {
              if(this.dealerPolicy == 60)
                {
                  this.showAlertCheque =true;
                  this.showPreventCheque=false;
                  this.hideLabelAfterDelay();
                }
              else if (this.dealerPolicy == 61)
                {
                  row.amount = 0;
                  this.showAlertCheque =false;
                  this.showPreventCheque=true;
                  this.hideLabelAfterDelay();
                  this.cdr.detectChanges();
                }
            }        
        }
    }
    if (type === 1) {
      if (row.amount >= 1000) {
        row.amount = row.amount.toLocaleString(); // Format for thousands separator
      } else {
        row.amount = row.amount.toFixed(this.decimalPlaces);
      }
    }
  }

  AddNewLine(grid: number) {
    if (this.disableAll == true) {
      return;
    }
   if (grid == 3) { //cheques
      this.chequesList.push(
        {
          chequeAccId: this.cheqAcc ?? 0,
          chequeNo: "",
          dueDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
          bankId: this.bankId ?? 0,
          amount:"",
          drawerName: this.dealerName,
          chequeStatus: this.cheqStatus ?? 0,
          accId: this.dealerAccountId == 0 ? this.AccountNo : this.dealerAccountId ,
        });
    }
    else if (grid == 4) { //credit cards
      this.creditCardsList.push(
        {
          cardNo: 0,
          accId: this.cardAccount,
          paymentDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
          amount: "",
          drawerName: "",
          cardTypeId: 0
        });
    }
  }

  calculateSum(type: number) {
    var amt = 0;
    if (type == 3) {
      amt = this.chequesList.reduce((sum, item) =>
        {
          const amount = parseFloat(item.amount);
          return isNaN(amount) ? sum : sum + amount;
        }, 0)   

      const formattedTotal = this.chequesList.reduce((sum, item) =>
        {
          const amount = parseFloat(item.amount);
          return isNaN(amount) ? sum : sum + amount;
        }, 0)     
      this.cheqAmount = Number(formattedTotal);
    }

    else if (type == 4) {
      amt = this.creditCardsList.reduce((sum, item) =>
        {
          const amount = parseFloat(item.amount);
          return isNaN(amount) ? sum : sum + amount;
        }, 0)  
      const formattedTotal = this.creditCardsList.reduce((sum, item) =>
        {
          const amount = parseFloat(item.amount);
          return isNaN(amount) ? sum : sum + amount;
        }, 0)  
      this.cardsAmount = Number(formattedTotal);
    }
    else if (type == 5) {
      const formattedTotal = this.cliqDetails.reduce((sum, item) => {
        const amount = parseFloat(item.amount);
        return isNaN(amount) ? sum : sum + amount;
      }, 0);
      this.CliqTotal = Number(formattedTotal);
    }      
    this.DiffValue = this.custPaymentVoucherAddForm.value.amount -this.cheqAmount  - this.cardsAmount - this.custPaymentVoucherAddForm.value.cashAmount -this.CliqTotal;  
    return amt;
  }

  onDebitChange(row: any) {
    if (row.debit) {
      row.credit = 0;
    }
  }

  onCreditChange(row: any) {
    if (row.credit) {
      row.debit = 0;
    }
  }

  deleteRow(rowIndex: number, grid: number) {
    if (rowIndex !== -1) {
      if (grid == 1)
      {
        this.debitAccountsList.splice(rowIndex, 1);
      }        
      else if (grid == 2)
      {
        this.creditAccountsList.splice(rowIndex, 1);
      }        
      else if (grid == 3)
      {
        this.chequesList.splice(rowIndex, 1);
        this.custPaymentVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
      }        
      else if (grid == 4)
      {
        this.creditCardsList.splice(rowIndex, 1);
        this.custPaymentVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);
      }              
    }
  }

  isEmpty(  input: any) {
    return input === '' || input === null;
  }

  isOneEmpty(row: any) {
    if ((row.debit === '' || row.debit === null || row.debit <= 0) && (row.credit === '' || row.credit === null || row.credit <= 0)) {
      return true;
    }
    else {
      return false;
    }
  }

  isValidVoucherDate(event: any) {

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

  onAddRowBefore(rowIndex: number, grid: number) {
    if (grid == 3) {
      const newRow =
      {
        chequeAccId: this.cheqAcc ?? 0,
        chequeNo: "",
        dueDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
        bankId: this.bankId ?? 0,
        amount: 0,
        drawerName: this.dealerName,
        chequeStatus: this.cheqStatus ?? 0,        
        accId: this.dealerAccountId == 0 ? this.AccountNo : this.dealerAccountId ,
      };
      this.chequesList.splice(rowIndex, 0, newRow);
    }
    else if (grid == 4) {
      const newRow =
      {
        cardNo: 0,
        accId: 0,
        paymentDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
        amount: 0,
        drawerName: "",
        cardTypeId: 0
      };
      this.creditCardsList.splice(rowIndex, 0, newRow);
    }
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
        this.cuspaymentvoucherService.DeleteCustPaymentVoucher(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['CustomerPaymentVoucher/CustpaymentvoucherList']);
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

  CheckDelete(id: number, cheqNumber: number, rowIndex: number) {

    this.cuspaymentvoucherService.CheckDeleteStatus(id, cheqNumber).subscribe(result => {

      if (result) {
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
            this.chequesList.splice(rowIndex, 1);
            //this.alert.DeleteSuccess();
          }
        })
      }
      else {
        this.alert.ShowAlert('YouCantDeleteTheresATrasnactionsOnTheCheque', 'error')
      }
    })
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger;
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeBranch;
    this.AccountNo = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.creditAccId ?? 0;
    if(this.AccountNo > 0)
    {
     this.dealerName = this.accountsList.find((option: any) => option.id === this.AccountNo)?.text ?? "";
    }
    if(this.chequesAccount !== 0 && this.chequesAccount !== null && this.chequesAccount !== undefined)
    {
      this.cheqAcc = this.chequesAccount;
    }  
    else
    {
      this.cheqAcc = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.cheqAccId;
    }        
    this.bankId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.bankId;
    this.cheqStatus = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.defChequeStatus;
    if (this.opType == 'Add' && voucherTypeId != this.SavedTypeId) {
      let pm = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.paymentMethod;
      pm = Array.isArray(pm) ? pm : (pm !== undefined ? [pm] : []);
      if (pm[0] !== null && pm[0] !== undefined) {
        this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue(pm);
      }
      else {
        this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue("");
      }
      if (this.custPaymentVoucherAddForm.value.paymentMethod.indexOf(76) !== -1 && this.cashAccount > 0) 
        {
          if(this.cashAccount  !== 0 || this.cashAccount !== undefined || this.cashAccount  !== null)
            {
              this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(this.cashAccount);
              this.disableCashAccount = true;
            } 
        }
        else
        {
              if(this.defaultCashAccId == 0 || this.defaultCashAccId == null || this.defaultCashAccId == undefined)
                {
                  this.defaultCashAccId =0;
                }
              this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(this.defaultCashAccId); 
              this.disableCashAccount = false;
        }
    }
    this.cdr.detectChanges();
  }

  formatAmtbills(row: any) {
    
    const roundToDecimals = (value: number, decimals: number): number => {
      const factor = Math.pow(10, decimals);
      return Math.round(value * factor) / factor;
    };
    if (roundToDecimals(Number(row.paidAmt), this.decimalPlaces) > roundToDecimals((row.invAmount - row.totalPaid), this.decimalPlaces)) {
      this.alert.ShowAlert("msgCantAddAmountMoreThanMainTotlaBill", 'error');
      row.paidAmt = 0;
      return;
    }    
    row.paidAmt = Number(row.paidAmt).toFixed(this.decimalPlaces);
    let totalAmount = parseFloat(this.custPaymentVoucherAddForm.value.amount) - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0);

    this.invoicesTotal = totalAmount; // if invoicesTotal is a number
    // let formattedInvoicesTotal = this.formatCurrency(totalAmount); // formatted string for display

    // this.invoicesTotal = this.formatCurrency(parseFloat(this.custReceiotVoucherAddForm.value.amount) - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    if (this.invoicesTotal < 0) {
      this.alert.ShowAlert("msgPaidVouchesValueMoreThanMainValue", 'error');
      row.paidAmt = 0;
      return;
    }
  }

  getbills(event: any) { 
    if (event.value > 0) {
      this.cuspaymentvoucherService.GetPaymentBills(event.value).subscribe(result => {
        if (result) {
          
          this.payBillsList = result.paymentVoucherList;
          this.dealerInfo = result.dealerName;
          this.cdr.detectChanges();
        }
      })
    }
    

    if (event.value > 0) 
      {
        this.cuspaymentvoucherService.GetDealerInfo(event.value).subscribe(res => {
          
          if(res)
            {
              let DealerName = this.customerList.find((r: any) => r.id == event.value)?.text;
              this.dealerBalance = res.balance;
              this.dealerAmt = res.amt;
              this.dealerChequeAmt= res.chequeAmt;
              this.dealerPolicy= res.policy;
              this.NoteAlert = "Warning:TheCustomerhasexceededthepermittedfinanciallimit";
              this.NotePrevenet = "TheCustomerhasexceededthepermittedfinanciallimit";
              this.NoteBalance = "رصيد العميل " + " - " + DealerName + ": " +  Math.abs(res.balance).toFixed(3) + " , " + "سقف العميل" + ": " + res.amt.toFixed(3)+ " , " + "سقف الشيكات" + ": " + res.chequeAmt.toFixed(3); 
              this.NoteAlertCheque= "Warning:CustomerExceededThePermittedChequeLimit";
              this.NotePreventCheque ="CustomerExceededThePermittedChequeLimit";
              this.showAlertCheque =false;
              this.showPreventCheque=false;
              this.showBalance = true;
              this.showAlert = false;
              this.showPrevent = false;              
              this.hideLabelAfterDelay();
              
              if(this.custPaymentVoucherAddForm.value.cashAmount != "" && Number(this.custPaymentVoucherAddForm.value.cashAmount) >0)
                {                  
                  this.cashAmountBlur(this.custPaymentVoucherAddForm.value.cashAmount);
                  for (let i = 0; i < this.chequesList.length; i++) {
                    const element = this.chequesList[i];
                    this.FormATAmount(element,0);
                    element.i = i.toString();
                  }
                }
            }
        })
      }
  }

  onPaymentMethodChange(event: any)
  {
    
    if(event.value)
      {
        if(this.custPaymentVoucherAddForm.value.amount != "" && Number(this.custPaymentVoucherAddForm.value.amount) >0)
          {                  
            this.cashAmountBlur(this.custPaymentVoucherAddForm.value.cashAmount);
            for (let i = 0; i < this.chequesList.length; i++) {
              const element = this.chequesList[i];
              this.FormATAmount(element,0);
              element.i = i.toString();
            }
          }
          if (this.custPaymentVoucherAddForm.value.paymentMethod.indexOf(76) !== -1 && this.cashAccount > 0) 
            {
              if(this.cashAccount  !== 0 || this.cashAccount !== undefined || this.cashAccount  !== null)
                {
                  this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(this.cashAccount);
                  this.disableCashAccount = true;
                } 
            }
            else
            {
                  if(this.defaultCashAccId == 0 || this.defaultCashAccId == null || this.defaultCashAccId == undefined)
                    {
                      this.defaultCashAccId =0;
                    }
                  this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(this.defaultCashAccId); 
                  this.disableCashAccount = false;
            }

      }
  }

  cashAmountBlur(amount: number)
  {
    
    if (this.custPaymentVoucherAddForm.value.paymentMethod.indexOf(76) !== -1) 
      {
        if(amount + this.dealerBalance > this.dealerAmt && this.custPaymentVoucherAddForm.value.customerId > 0)
          {
            if(this.dealerPolicy == 60)
              {
                  this.showAlert = true;
                  this.showBalance = false;
                  this.showPrevent = false;
                  this.hideLabelAfterDelay();
              }
            else if (this.dealerPolicy == 61)
              {
                  this.showAlert = false;
                  this.showBalance = false;
                  this.showPrevent = true;
                  this.custPaymentVoucherAddForm.get("cashAmount")?.setValue(0);
                  this.hideLabelAfterDelay();
                  this.cdr.detectChanges();
              }
          }
      }       
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
      this.showAlertCheque =false;
      this.showPreventCheque=false;
    }, 10000);
  }

  calculateSumbills(type: number) {
    
    var amt;
    if (type == 1) {
      amt = this.formatCurrency(this.payBillsList.reduce((sum, item) => sum + parseFloat(item.invAmount), 0));
    }
    else if (type == 2) {
      amt = this.formatCurrency(this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    }
    else if (type == 3) {
      
      let MainAmount = parseFloat(this.custPaymentVoucherAddForm.value.amount); // Parse MainAmount once
      if(MainAmount == null || MainAmount == undefined || isNaN(MainAmount))
        {
          amt = this.formatCurrency(parseFloat("0.000"))
          return amt ;
        }
      amt = this.formatCurrency(MainAmount - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    }
    return amt;
  }

  ClearFormData()
  {  
    this.chequesList = [];
    this.creditCardsList = [];
    this.childAttachment.data = [];
    this.payBillsList = [];
    this.custPaymentVoucherAddForm.get("branchId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("customerId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("representId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("amount")?.setValue(0);
    this.custPaymentVoucherAddForm.get("cashAccId")?.setValue(0);    
    this.custPaymentVoucherAddForm.get("cashAmount")?.setValue(0);
    this.custPaymentVoucherAddForm.get("referenceNo")?.setValue("");
    this.custPaymentVoucherAddForm.get("costCenterId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("note")?.setValue("");
    this.cliqDetails = [];
    this.DiffValue= 0 ;
    this.CliqTotal = 0;
    this.onCliqChanged(this.cliqDetails);
    setTimeout(() => {
     this.GetVoucherTypeSetting(this.custPaymentVoucherAddForm.value.voucherTypeId); 
    });
    this.cdr.detectChanges;
  }

  PrintCustomerpaymentvoucher(voucherId: number) {
    
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptCustomerpaymentvoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptCustomerpaymentvoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  fillCard(cardId:any , index:number)  
  {
    
    if(this.cardAccount == 0)
      {
        if(cardId > 0)
          {
            const AccId =  this.creditBankList.find((option: any) => option.data1 === cardId)?.data2;
            if(AccId != 0 && AccId != null && AccId != undefined)
             {
               this.creditCardsList[index].accId = AccId;
             }
             const CardType = this.creditBankList.find((option: any) => option.data1 === cardId)?.data3;
             if(CardType != 0 && CardType != null && CardType != undefined)
               {
                 this.creditCardsList[index].cardTypeId = Number(CardType);
               }
          }
        else
          {
            this.creditCardsList[index].accId =0;
            this.creditCardsList[index].cardTypeId = 0;
          }
      }    
  }

  voucherNoBlur(VoucherNo: string, VoucherTypeId: number)
  {
    
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.cuspaymentvoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
          {
            
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
                    this.GetInitailCustPaymentVoucher();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                   // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetInitailCustPaymentVoucher();
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

  clearFormdata(VoucherNo : string)
  {    
    this.newDate = new Date;
    this.custPaymentVoucherAddForm.get("id")?.setValue(0);
    this.custPaymentVoucherAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.custPaymentVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.custPaymentVoucherAddForm.get("branchId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("currencyId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("currRate")?.setValue(0);
    this.custPaymentVoucherAddForm.get("customerId")?.setValue(0);
    this.dealerInfo = '';
    this.custPaymentVoucherAddForm.get("representId")?.setValue(0);
    this.custPaymentVoucherAddForm.get("amount")?.setValue("");
    this.custPaymentVoucherAddForm.get("cashAccId")?.setValue("");
    this.custPaymentVoucherAddForm.get("cashAmount")?.setValue("");
    this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue("");
    this.custPaymentVoucherAddForm.get("referenceNo")?.setValue("");
    this.custPaymentVoucherAddForm.get("referenceDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.custPaymentVoucherAddForm.get("note")?.setValue("");
    this.chequesList = [];
    this.creditCardsList = [];
    this.payBillsList = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.custPaymentVoucherAddForm.value.voucherTypeId);
    });
    this.custPaymentVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.custPaymentVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row: any, index: number, type: number)
  {
    
    if (type == 3) { //cheques
      this.chequesList.push(
        {
          chequeAccId:row.chequeAccId,
          chequeNo:'',
          dueDate:row.dueDate,
          bankId:row.bankId,
          amount:row.amount,
          drawerName:row.drawerName,
          chequeStatus:row.chequeStatus,
          accId:row.accId,
        });
    }
    else if (type == 4) { //credit cards
      this.creditCardsList.push(
        {
          cardNo:row.cardNo,
          accId:row.accId,
          paymentDate:row.paymentDate,
          amount:row.amount,
          drawerName:row.drawerName,
          cardTypeId:row.cardTypeId,
        });
    }
   
  }

  handleF3Key(event: KeyboardEvent, row: any, index: number, type: number) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index,type);
    }
  }

  CheckCheq(row: any, index: number)
  {
    
    if(row.chequeNo == "" || row.chequeNo == null || row.chequeNo == undefined || row.chequeNo == 0) 
      {
        return false
      }
    for (let i = 0; i < this.chequesList.length; i++) {
      if (this.chequesList[i].chequeNo == row.chequeNo && i != index) {
        if(this.chequesList[i].bankId == row.bankId && i != index)
          {
            if(this.chequesList[i].accId == row.accId && i != index)
              {
                this.alert.ShowAlert("msgTheChequeNumberAlreadyExistsInThisBank", 'error');
                this.chequesList[index] = {
                ...this.chequesList[index],
                chequeNo: 0
                };
              this.cdr.detectChanges();
              }
            
          }    
      }
    }
  }

  loadLazyCustomerOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.customerList) {
        this.customerList = [];
    }

    // Make sure the array is large enough
    while (this.customerList.length < last) {
        this.customerList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.customerList[i] = this.customerList[i];
    }

    this.loading = false;
  }

  onCliqChanged(list: any) {
    debugger
    this.cliqDetails = list;
    let payment = this.custPaymentVoucherAddForm.value.paymentMethod
    if(payment.includes(220))
      {
        this.calculateSum(5);
      }    
  }

  OnSaveValidation()
  {
    let stopExecution = true ;
    let index = 0;
    debugger;
     if (this.custPaymentVoucherAddForm.value.paymentMethod.includes(76)) {
      if (this.custPaymentVoucherAddForm.value.cashAmount === 0 || this.custPaymentVoucherAddForm.value.cashAmount === null) {
        this.alert.ShowAlert("msgEnterCashAnmount", 'error');
        stopExecution = false;
        return stopExecution;
      }

      if (this.custPaymentVoucherAddForm.value.cashAccId === 0 || this.custPaymentVoucherAddForm.value.cashAccId === '' || this.custPaymentVoucherAddForm.value.cashAccId === undefined|| this.custPaymentVoucherAddForm.value.cashAccId === null) {
        this.alert.ShowAlert("msgEnterAccountCash", 'error');
        stopExecution = false;
        return stopExecution;
      }
    }
    
    if (this.custPaymentVoucherAddForm.value.paymentMethod.includes(77) && this.chequesList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }
    if (!this.custPaymentVoucherAddForm.value.paymentMethod.includes(77) && this.chequesList.length !== 0) {
      this.alert.ShowAlert("msgEnterPaymentMethodCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }
    if (this.custPaymentVoucherAddForm.value.paymentMethod.includes(78) && this.creditCardsList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCards", 'error');
      stopExecution = false;
      return stopExecution;
    }
    if (!this.custPaymentVoucherAddForm.value.paymentMethod.includes(78) && this.creditCardsList.length !== 0) {
      this.alert.ShowAlert("msgEnterPaymentMethodCards", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (this.chequesList.length == 0 && this.custPaymentVoucherAddForm.value.paymentMethod.includes(77)) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }
    else {
      for (let element of this.chequesList) {
        if (element.accountId <= 0 || !this.appCommonserviceService.isValidNumber(element.amount)) {
          this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
          stopExecution = false;
          return stopExecution;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (this.creditCardsList.length == 0 && this.custPaymentVoucherAddForm.value.paymentMethod.includes(78)) {
      this.alert.ShowAlert(this.custPaymentVoucherAddForm.value.paymentMethod, 'error');
      this.alert.ShowAlert("msgEnterAllDataCards", 'error');
      stopExecution = false;
      return stopExecution;
    }
    else {
      for (let element of this.creditCardsList) {
        if (element.accountId <= 0 || !this.appCommonserviceService.isValidNumber(element.amount)) {
          this.alert.ShowAlert("msgEnterAllDataCards", 'error');
          stopExecution = false;
          return stopExecution;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (this.custPaymentVoucherAddForm.value.paymentMethod.includes(77)) {
      if (this.chequesList.length > 0) {
        for (let element of this.chequesList) {
          if (element.chequeAccId <= 0 || element.chequeAccId === null) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (
            element.chequeNo === '' || element.chequeNo === null || element.chequeNo === 0 || 
            element.dueDate === '' || element.dueDate === null || element.dueDate === undefined
          ) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.bankId === 0 || element.bankId === null) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.amount === 0 || element.amount === null || element.amount === '') {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.drawerName === 0 || element.drawerName === '' || element.drawerName === null) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.chequeStatus === 0 || element.chequeStatus === '' || element.chequeStatus === null) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.accId === 0 || element.accId === null) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          element.index = index.toString();
          index++;
        }
      }
    }

    
    if (this.custPaymentVoucherAddForm.value.paymentMethod.includes(78)) {
      if (this.creditCardsList.length > 0) {
        for (let element of this.creditCardsList) {
          if (element.cardNo <= 0 || element.cardNo === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          else if (element.accId === '' || element.accId === null || element.accId === 0) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          else if (element.paymentDate === '' || element.paymentDate === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          else if (element.amount === 0 || element.amount === null || element.amount === '') {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          else if (element.drawerName === 0 || element.drawerName === '' || element.drawerName === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          else if (element.cardTypeId === 0 || element.cardTypeId === '' || element.cardTypeId === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          element.index = index.toString();
          index++;
        }
      }

    }

    let paymentMethodArray = this.custPaymentVoucherAddForm.value.paymentMethod;
    if (Array.isArray(paymentMethodArray)) {
      let validPaymentMethods = paymentMethodArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let paymentMethodsString = validPaymentMethods.join(',');
      this.custPaymentVoucherAddForm.get("paymentMethod")?.setValue(paymentMethodsString);
      console.log('Filtered paymentMethod:', paymentMethodsString);
    } else {
      console.error('paymentMethod is not an array');
    }

    for (let element of this.chequesList) {
      element.chequeNo = element.chequeNo.toString();
    }

    if (this.cliqDetails.length > 0 && !this.custPaymentVoucherAddForm.value.paymentMethod.includes(220)) {
        this.alert.ShowAlert("PleaseSelectCliqPaymenMethod", 'error');
        stopExecution = false;
        return stopExecution;
      }    
    else if (this.cliqDetails.length > 0 && this.custPaymentVoucherAddForm.value.paymentMethod.includes(220))
        {
        for (let i = 0; i < this.cliqDetails.length; i++) {
          const element = this.cliqDetails[i];
          if(element.cliqType == 0 ||  element.cliqType == null || element.cliqType == undefined)
            {
              this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
              stopExecution = false;
              return stopExecution;
            }
            if(element.cliqName == "" ||  element.cliqName == null || element.cliqName == undefined)
            {
              this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
              stopExecution = false;
              return stopExecution;
            }
            if(element.amount == 0 ||  element.amount == null || element.amount == undefined)
            {
              this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
              stopExecution = false;
              return stopExecution;
            }
            if(element.accId == 0 ||  element.accId == null || element.accId == undefined)
            {
              this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
              this.disableSave = false;
              stopExecution = false;
              return stopExecution;
            }
        element.i = i.toString();
      }
      }
    if(this.custPaymentVoucherAddForm.value.paymentMethod.includes(220))
        {
          if(this.cliqDetails.length == 0 || this.cliqDetails == undefined || this.cliqDetails == null)
            { 
              this.alert.ShowAlert("PleaseEnterCliqDetails", 'error');
              stopExecution = false;
              return stopExecution;
            }  
      }
    if(this.DiffValue !== 0)
        {
          this.alert.ShowAlert("msgVoucherNotBalanced", 'error');
          stopExecution = false;        
          return stopExecution;
      }
    return stopExecution;      
  }

  GetDealerInfo(supplierId: any) {
    debugger
    if (supplierId) {
      let dealerInfo = this.customerList.find((r: any) => r.id == supplierId);
      if (dealerInfo) {
        this.dealerAccountId = dealerInfo.data2 ?? 0;
        this.dealerName = dealerInfo.text ?? '';
      }
    }
    else if(this.AccountNo > 0)
    {
      let dealerInfo = this.accountsList.find((r: any) => r.id == this.AccountNo);
      if (dealerInfo) {
        this.dealerAccountId = 0;
        this.dealerName = dealerInfo.text ?? '';
      }
    }
    else
      {
        this.dealerAccountId = 0;
        this.dealerName = '';
      }
  }

}
