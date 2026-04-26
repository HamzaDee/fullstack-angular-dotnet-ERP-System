import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient,HttpErrorResponse } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog} from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { SuppPaymentvoucherService } from '../supplierpaymentvoucher.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import { Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-supplierpaymentvoucher-form',
  templateUrl: './supplierpaymentvoucher-form.component.html',
  styleUrls: ['./supplierpaymentvoucher-form.component.scss']
})
export class SupplierpaymentvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment !: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher !: FinancialvoucherComponent;
  supPaymentVoucherAddForm: FormGroup = new FormGroup({});
  public TitlePage: string = "";
  tabelData: any[] = [];
  loading: boolean = false;
  opType: string = "";
  showsave: boolean = false;
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
  supplierList: any;
  empList: any;
  cheqAmount: number = 0
  cardsAmount: number = 0
  decimalPlaces: number = 0;
  public Amount: any;
  disableAll: boolean = false;
  disabled:boolean = true;
  AccountNo: any;
  voucherNo: number = 0;
  cheqAcc: number = 0;
  bankId: number = 0;
  cheqStatus: number = 0;
  dealerInfo:string = "";
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean = false;
  defaultCurrencyId: number = 0;
  allowMultiCurrency:boolean = false;
  invoicesTotal: number = 0;
  //DELEAR INFO 
  dealerBalance:number = 0;
  dealerAmt:number = 0;
  dealerChequeAmt:number = 0;
  dealerPolicy:number = 0;
  newDate:any;
  NoteBalance:any;
  NoteAlert:any;
  NotePrevenet:any;
  NoteAlertCheque:any;
  NotePreventCheque:any;
  showBalance:boolean = false;
  showAlert:boolean = false;
  showPrevent:boolean = false;
  showAlertCheque:boolean = false;
  showPreventCheque:boolean = false;
  //END
  disableCurrRate:boolean = false;
  disableSave:boolean = false;
  Lang: string = "";
  disableVouchertype:boolean = false;
  payment :any;
  creditAcc:any;
  debitAcc:any;
  cliqDetails: any[] = [];
  cliqTypesList : any;
  CliqTotal = 0;
  TotalDebitValue: number = 0;
  DiffValue: number = 0;
  dealerAccountId: number = 0;
  dealerName: string = "";

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private suppaymentvoucherService: SuppPaymentvoucherService,
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
    this.voucherType ="Accounting";
    this.SetTitlePage();
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
      this.router.navigate(['SupplierPaymentVoucher/SupppaymentvoucherList']);
    }
    this.InitiailPaymentVoucherForm();
    this.GetInitailPaymentVoucher();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
        this.supPaymentVoucherAddForm.get('costCenterId')?.disable(); 
           }
      else {
        this.disableAll = false;
        this.supPaymentVoucherAddForm.get('costCenterId')?.enable(); 

      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SupppaymentvoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPaymentVoucherForm() {
    this.supPaymentVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      branchId: [null],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      supplierId: [0, [Validators.required, Validators.min(1)]],
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

  GetInitailPaymentVoucher() {
    var lang = this.jwtAuth.getLang();
     
    this.suppaymentvoucherService.GetInitailSuppPaymentVoucher(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['SupplierPaymentVoucher/SupppaymentvoucherList']);
        return;
      }
      
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item : any) => ({
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
      this.decimalPlaces = result.currencyList.find((option: any) => option.id === result.defaultCurrency)?.data2;
      this.bankList = result.bankList;
      this.statusList = result.statusList;
      this.creditBankList = result.creditBankList;
      this.creditCardsTypes = result.creditCardsTypes;
      this.accountsList = result.accountList;
      this.costcenterList = result.costCenterList;
      this.projectsList = result.projectsList;
      this.supplierList = result.suppliersList
      this.empList = result.employeeModelList;
      this.cliqTypesList = result.cliqTypesList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.supPaymentVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.paymentMethodList = result.paymentMethodList;
      if (result.paymentVoucherList != 0 && result.paymentVoucherList.length > 0) {
        this.payBillsList = result.paymentVoucherList
      }
      this.supPaymentVoucherAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
      this.debitAccountsList = result.accVouchersDTModelList.filter((x: any) => x.debit > 0 && x.cheqId == null && x.creditCardId == null);
      this.creditAccountsList = result.accVouchersDTModelList.filter((x: any) => x.credit > 0 && x.cheqId == null && x.creditCardId == null);
      this.allowMultiCurrency = result.allowMultiCurrency;

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
      this.childAttachment.data = result.accVouchersDocModelList;
      this.childAttachment.ngOnInit();
     if(this.opType == 'Edit')
      {
        this.disableVouchertype= true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if (this.voucherId > 0) {          
          var pm = result.paymentMethod.split(',').map(Number)
          this.supPaymentVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.supPaymentVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          this.supPaymentVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.supPaymentVoucherAddForm.get("supplierId")?.setValue(result.supplierId);
          this.supPaymentVoucherAddForm.get("amount")?.setValue(result.amount);
          this.supPaymentVoucherAddForm.get("cashAccId")?.setValue(result.cashAccId);
          this.supPaymentVoucherAddForm.get("representId")?.setValue(result.representId);
          this.supPaymentVoucherAddForm.get("note")?.setValue(result.note);
          this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue(pm);
          this.payment = pm;
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.supPaymentVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.supPaymentVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }
          this.dealerInfo = result.dealerName;
        }
        else {
          this.supPaymentVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          if (result.paymentMethod !== null && result.paymentMethod !== undefined) {
            this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          }
          else {
            this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue("");
          }
          var defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true).id;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.supPaymentVoucherAddForm.get("currencyId")?.setValue(defaultCurrency.id);
            this.supPaymentVoucherAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          this.supPaymentVoucherAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.supPaymentVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          if (this.supPaymentVoucherAddForm.value.currencyId == 0) {
            this.supPaymentVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId).data1;
            this.supPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
          }
          
          if(result.representId == null || result.representId == undefined)
            {
              result.representId = 0;
            }
          this.supPaymentVoucherAddForm.get("representId")?.setValue(result.representId);
          if(result.cashAccId == null || result.cashAccId == undefined)
            {
              result.cashAccId = 0;
            }
            this.supPaymentVoucherAddForm.get("cashAccId")?.setValue(result.cashAccId);
          if(result.costCenterId == null || result.costCenterId == undefined)
            {
              result.costCenterId = 0;
            }
            this.supPaymentVoucherAddForm.get("costCenterId")?.setValue(result.costCenterId);
            this.dealerInfo = "";
        }
        this.GetVoucherTypeSetting(this.supPaymentVoucherAddForm.value.voucherTypeId)
        if(this.supPaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    let stopExecution = false;
    var index = 0;
    
    debugger
    this.supPaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue([]);
    this.supPaymentVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.supPaymentVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.supPaymentVoucherAddForm.value.voucherNo = this.supPaymentVoucherAddForm.value.voucherNo.toString();
    this.supPaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue(this.debitAccountsList);
    this.supPaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue([...this.supPaymentVoucherAddForm.value.accVouchersDTModelList, ...this.creditAccountsList])
    this.supPaymentVoucherAddForm.get("paymentVoucherList")?.setValue(this.payBillsList);
    this.supPaymentVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);
    this.supPaymentVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
    this.supPaymentVoucherAddForm.get("cliQModelList")?.setValue(this.cliqDetails);
    this.supPaymentVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();    
    this.suppaymentvoucherService.SaveSuppPaymentVoucher(this.supPaymentVoucherAddForm.value)
      .subscribe((result) => {
        debugger
        if (result.isSuccess) {          
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option : any) => option.label === this.supPaymentVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintSupplierpaymentvoucher(Number(result.message));
          }

          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['SupplierPaymentVoucher/SupppaymentvoucherList']);
            }
            this.opType ='Add'
            this.voucherId= 0;
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
    var serialType = this.voucherTypeList.find((option : any) => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find((option : any) => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find((option : any) => option.label === selectedValue).branchId;
    var voucherCategory = this.supPaymentVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.supPaymentVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.supPaymentVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.suppaymentvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        
        if (results) {
          this.supPaymentVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.supPaymentVoucherAddForm.get("voucherNo")?.setValue(1);
        }
        if(branchId == null || branchId == undefined)
          {
            this.supPaymentVoucherAddForm.get("branchId")?.setValue(0);
          }
          else
          {
            this.supPaymentVoucherAddForm.get("branchId")?.setValue(branchId);
          }
        
        if (currencyId != 0 && currencyId != null && currencyId != undefined) {
          this.decimalPlaces = this.currencyList.find((option : any) => option.id === currencyId).data2;
        }
        else {
          this.decimalPlaces = this.currencyList.find((option : any) => option.id === this.defaultCurrencyId).data2;
        }
      });
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.supPaymentVoucherAddForm.get("currencyId")?.setValue(currencyId);
        var currRate = this.currencyList.find((option : any) => option.id === currencyId).data1;
        this.supPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
        if(this.supPaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
        this.supPaymentVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find((option : any) => option.id === this.defaultCurrencyId).data1;
        this.supPaymentVoucherAddForm.get("currRate")?.setValue(currRate);
        if(this.supPaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    this.supPaymentVoucherAddForm.get("currRate")?.setValue(currRate);    
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
    
    let amount = parseFloat(this.supPaymentVoucherAddForm.value.amount);
    this.supPaymentVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);   
    this.Amount = this.supPaymentVoucherAddForm.value.amount;
    this.payBillsList.forEach(element => {
      element.paidAmt = 0      
    });
  }

  FormATAmount(row: any, type: number) {
    debugger
    if (type === 0) {
      if (row.amount >= 1000) {
        //row.amount = row.amount.toLocaleString(); // Format for thousands separator
           row.amount = row.amount.toFixed(this.decimalPlaces);

      } else {
        row.amount = row.amount.toFixed(this.decimalPlaces);
      }
      if (this.supPaymentVoucherAddForm.value.paymentMethod.indexOf(77) !== -1) 
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
    debugger
     if (grid == 3) { //cheques
      this.chequesList.push(
        {
          chequeAccId: this.cheqAcc ?? 0,
          chequeNo: "",
          dueDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
          bankId: this.bankId ?? 0,
          amount: "",
          drawerName: this.dealerName,
          chequeStatus: this.cheqStatus ?? 0,
          accId: this.dealerAccountId == 0 ? this.AccountNo : this.dealerAccountId ,
        });        
    }
    else if (grid == 4) { //credit cards
      this.creditCardsList.push(
        {
          cardNo: 0,
          accId: 0,
          paymentDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
          amount: "",
          drawerName: "",
          cardTypeId: 0
        });
    }
  }

  calculateSum(type: number) { 
     
    let amt = 0;
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
        return isNaN(amount) ? sum : sum + amount;}, 0);
      this.CliqTotal = Number(formattedTotal);
    }
    const paymentMethod = this.supPaymentVoucherAddForm.value.paymentMethod;
    if (paymentMethod !== null) {
      // Ensure paymentMethod is an array
      const paymentMethodArray = Array.isArray(paymentMethod) ? paymentMethod : [paymentMethod];    
      if (paymentMethodArray.includes(76)  || paymentMethodArray.includes(220)) {
        this.DiffValue = Number(this.supPaymentVoucherAddForm.value.amount) -  this.cheqAmount - this.cardsAmount - this.supPaymentVoucherAddForm.value.cashAmount - this.CliqTotal;
        // $('#diff').val((Number(this.supPaymentVoucherAddForm.value.amount) - this.cheqAmount - this.cardsAmount - this.supPaymentVoucherAddForm.value.cashAmount).toFixed(3));
      } else {
        this.DiffValue = Number(this.supPaymentVoucherAddForm.value.amount) -  this.cheqAmount - this.cardsAmount;
        // $('#diff').val((Number(this.supPaymentVoucherAddForm.value.amount) - this.cheqAmount - this.cardsAmount).toFixed(3));
      }
    }
    this.TotalDebitValue = this.cheqAmount + this.cardsAmount + this.supPaymentVoucherAddForm.value.cashAmount + this.CliqTotal;
    // this.DiffValue = Number(this.supPaymentVoucherAddForm.value.amount) -  this.cheqAmount - this.cardsAmount - this.supPaymentVoucherAddForm.value.cashAmount - this.CliqTotal;
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
    debugger
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
          this.supPaymentVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
        }
        
      else if (grid == 4)
        {
          this.creditCardsList.splice(rowIndex, 1);
          this.supPaymentVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);          
        }
    }
  }

  isEmpty(input : any) {
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
        this.suppaymentvoucherService.DeleteSuppPaymentVoucher(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['SupplierPaymentVoucher/SupppaymentvoucherList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['SupplierPaymentVoucher/SupppaymentvoucherList']);
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

  CheckDelete(id: number, cheqNumber: number, rowIndex: number) {
    
    this.suppaymentvoucherService.CheckDeleteStatus(id, cheqNumber).subscribe(result => {
      
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
    
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeSerial;
    this.AccountNo = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.creditAccId ?? 0;
    if(this.AccountNo > 0)
      {
        this.dealerName = this.accountsList.find((option: any) => option.id === this.AccountNo)?.text ?? "";
      }
    this.cheqAcc = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.cheqAccId;
    this.bankId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.bankId;
    this.cheqStatus = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.defChequeStatus;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeBranch;
    this.creditAcc = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.creditAccId ?? 0;
    this.debitAcc = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.debitAccId ?? 0;
    
    if (this.opType == 'Add' && voucherTypeId != this.payment) {
      let pm = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.paymentMethod;
      pm = Array.isArray(pm) ? pm : (pm !== undefined ? [pm] : []);
      if (pm[0] !== null && pm[0] !== undefined) {
        this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue(pm);
      }
      else {
        this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue("");
      }
    }
    debugger
    this.onPaymentMethodChange(0);
    this.cdr.detectChanges();
  }

  getbills(event : any) {
    
    if (event.value > 0) {
      this.suppaymentvoucherService.GetPaymentBills(event.value).subscribe(result => {
        if (result) {
          
          this.payBillsList = result.paymentVoucherList;
          this.dealerInfo = result.dealerName;
          this.cdr.detectChanges();
        }
      })
    }
    else
      {
        this.dealerInfo = "";
        this.payBillsList = [];
        this.cdr.detectChanges();
    }
    if (event.value > 0) 
      {
        this.suppaymentvoucherService.GetDealerInfo(event.value).subscribe(res => {
          
          if(res)
            {
              let DealerName = this.supplierList.find((r : any) => r.id == event.value).text;
              this.dealerBalance = res.balance;
              this.dealerAmt = res.amt;
              this.dealerChequeAmt= res.chequeAmt;
              this.dealerPolicy= res.policy;
              this.NoteAlert = "Warning:Thesupplierhasexceededthepermittedfinanciallimit";
              this.NotePrevenet = "Thesupplierhasexceededthepermittedfinanciallimit";
              this.NoteBalance = "رصيد المورد " + " - " + DealerName + ": " +  Math.abs(res.balance).toFixed(3) + " , " + "سقف المورد" + ": " + res.amt.toFixed(3)+ " , " + "سقف الشيكات" + ": " + res.chequeAmt.toFixed(3); 
              this.NoteAlertCheque= "Warning:SupplierExceededThePermittedChequeLimit";
              this.NotePreventCheque ="SupplierExceededThePermittedChequeLimit";
              this.showAlertCheque =false;
              this.showPreventCheque=false;
              this.showBalance = true;
              this.showAlert = false;
              this.showPrevent = false;              
              this.hideLabelAfterDelay();
              
              if(this.supPaymentVoucherAddForm.value.amount != "" && Number(this.supPaymentVoucherAddForm.value.amount) >0)
                {                  
                  this.cashAmountBlur(this.supPaymentVoucherAddForm.value.cashAmount);
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
  
  calculateSumbills(type : number) {
    
    var amt;
    if (type == 1) {
      amt = this.formatCurrency(this.payBillsList.reduce((sum, item) => sum + parseFloat(item.invAmount), 0));
    }
    else if (type == 2) {
      amt = this.formatCurrency(this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    }
    else if (type == 3) {
      
      let MainAmount = parseFloat(this.supPaymentVoucherAddForm.value.amount); // Parse MainAmount once
      if(MainAmount == null || MainAmount == undefined || isNaN(MainAmount))
        {
          amt = this.formatCurrency(parseFloat("0.000"))
          return amt ;
        }
      amt = this.formatCurrency(MainAmount - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    }
    return amt;
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
    let totalAmount = parseFloat(this.supPaymentVoucherAddForm.value.amount) - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0);
    this.invoicesTotal = totalAmount; 
    if (this.invoicesTotal < 0) {
      this.alert.ShowAlert("msgPaidVouchesValueMoreThanMainValue", 'error');
      row.paidAmt = 0;
      return;
    }
  }

  ClearFormData()
  {
    this.chequesList = [];
    this.creditCardsList = [];
    this.payBillsList = [];  
    this.supPaymentVoucherAddForm.get("branchId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("supplierId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("representId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("amount")?.setValue(0);
    this.supPaymentVoucherAddForm.get("cashAccId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("cashAmount")?.setValue(0);
    this.supPaymentVoucherAddForm.get("referenceNo")?.setValue("");
    this.supPaymentVoucherAddForm.get("costCenterId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("note")?.setValue("");
    this.cliqDetails = [];
    this.DiffValue= 0 ;
    this.CliqTotal = 0;
    this.onCliqChanged(this.cliqDetails);
    this.onCliqChanged(this.cliqDetails);
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.supPaymentVoucherAddForm.value.voucherTypeId); 
    });
  }

  cashAmountBlur(amount: number)
  {
    
    if (this.supPaymentVoucherAddForm.value.paymentMethod.indexOf(76) !== -1 || this.supPaymentVoucherAddForm.value.paymentMethod.indexOf(220) !== -1) 
      {
        if(amount + this.dealerBalance > this.dealerAmt && this.supPaymentVoucherAddForm.value.supplierId > 0)
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
                  this.supPaymentVoucherAddForm.get("cashAmount")?.setValue(0);
                  this.hideLabelAfterDelay();
                  this.cdr.detectChanges();
              }
          }
      }       
  }

  onPaymentMethodChange(event : any)
  {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    debugger
    if(selectedValue)
      {
        if(this.supPaymentVoucherAddForm.value.amount != "" && Number(this.supPaymentVoucherAddForm.value.amount) >0)
          {                  
            this.cashAmountBlur(this.supPaymentVoucherAddForm.value.cashAmount);
            for (let i = 0; i < this.chequesList.length; i++) {
              const element = this.chequesList[i];
              this.FormATAmount(element,0);
              element.i = i.toString();
            }
          }        
      }
      debugger
        const paymentMethod = this.supPaymentVoucherAddForm.value.paymentMethod;
        if (paymentMethod !== null) {
          // Ensure paymentMethod is an array
          const paymentMethodArray = Array.isArray(paymentMethod) ? paymentMethod : [paymentMethod];    
          if (paymentMethodArray.indexOf(76) != -1 ) {
            this.supPaymentVoucherAddForm.get("cashAccId")?.setValue(this.creditAcc);
          } 
          else
          {
            this.supPaymentVoucherAddForm.get("cashAccId")?.setValue(0);
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

  PrintSupplierpaymentvoucher(voucherId: number) {
    
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
      { 
        const reportUrl = `RptSupplierpaymentvoucherAR?VId=${voucherId}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else{ 
        const reportUrl = `RptSupplierpaymentvoucherEN?VId=${voucherId}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
  }

  fillCard(cardId:any , index:number)  
  {
    
    if(cardId > 0)
      {
        const AccId =  this.creditBankList.find((option : any) => option.data1 === cardId).data2;
      if(AccId != 0 && AccId != null && AccId != undefined)
        {
          this.creditCardsList[index].accId = AccId;
        }
        const CardType = this.creditBankList.find((option : any) => option.data1 === cardId).data3;
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

  voucherNoBlur(VoucherNo : string, VoucherTypeId : number)
  {
    
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.suppaymentvoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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
  
  clearFormdata(VoucherNo : string)
  {    
    this.newDate = new Date;
    this.supPaymentVoucherAddForm.get("id")?.setValue(0);
    this.supPaymentVoucherAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.supPaymentVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.supPaymentVoucherAddForm.get("branchId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("currencyId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("currRate")?.setValue(0);
    this.supPaymentVoucherAddForm.get("supplierId")?.setValue(0);
    this.dealerInfo = '';
    this.supPaymentVoucherAddForm.get("representId")?.setValue(0);
    this.supPaymentVoucherAddForm.get("amount")?.setValue("");
    this.supPaymentVoucherAddForm.get("cashAccId")?.setValue("");
    this.supPaymentVoucherAddForm.get("cashAmount")?.setValue("");
    this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue("");
    this.supPaymentVoucherAddForm.get("referenceNo")?.setValue("");
    this.supPaymentVoucherAddForm.get("referenceDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.supPaymentVoucherAddForm.get("note")?.setValue("");
    this.chequesList = [];
    this.creditCardsList = [];
    this.payBillsList = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.supPaymentVoucherAddForm.value.voucherTypeId);
    });
    this.supPaymentVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.supPaymentVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row: any, index: number, type: number)
  {
    
    if (type == 3) {
      this.chequesList.push(
        {
          chequeAccId: row.chequeAccId,
          chequeNo:'',
          dueDate: row.dueDate,
          bankId: row.bankId,
          amount: row.amount,
          drawerName: row.drawerName,
          chequeStatus: row.chequeStatus,
          accId: row.accId,
        });
    }
    else if (type == 4) {
      this.creditCardsList.push(
        {
          cardNo: row.cardNo,
          accId: row.accId,
          paymentDate:row.paymentDate,
          amount: row.amount,
          drawerName: row.drawerName,
          cardTypeId: row.cardTypeId,
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ Backend returned an error:', error);
    return throwError(() => error);
  }

  onCliqChanged(list: any) {
    debugger
    this.cliqDetails = list;
    let payment = this.supPaymentVoucherAddForm.value.paymentMethod
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
    if (this.supPaymentVoucherAddForm.value.paymentMethod.includes(76)) {
      if (this.supPaymentVoucherAddForm.value.cashAmount === 0 || this.supPaymentVoucherAddForm.value.cashAmount === null) {
        this.alert.ShowAlert("msgEnterCashAnmount", 'error');
        stopExecution = false;
        return stopExecution;
      }
      if (this.supPaymentVoucherAddForm.value.cashAccId === 0 || this.supPaymentVoucherAddForm.value.cashAccId === '' || this.supPaymentVoucherAddForm.value.cashAccId === undefined
        || this.supPaymentVoucherAddForm.value.cashAccId === null) {
        this.alert.ShowAlert("msgEnterAccountCash", 'error');
        stopExecution = false;
        return stopExecution;
      }
    }

    if (!this.supPaymentVoucherAddForm.value.paymentMethod.includes(76)) {
      if (this.supPaymentVoucherAddForm.value.cashAccId !== 0 && this.supPaymentVoucherAddForm.value.cashAmount > 0) {
        this.alert.ShowAlert("msgEnterPaymentMethodCash", 'error');
        stopExecution = false;
        return stopExecution;
      }
    }

    if (this.supPaymentVoucherAddForm.value.paymentMethod.includes(77)  && this.chequesList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (!this.supPaymentVoucherAddForm.value.paymentMethod.includes(77) && this.chequesList.length !== 0) {
      this.alert.ShowAlert("msgEnterPaymentMethodCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }
    if (this.supPaymentVoucherAddForm.value.paymentMethod.includes(78) && this.creditCardsList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCards", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (!this.supPaymentVoucherAddForm.value.paymentMethod.includes(78) && this.creditCardsList.length !== 0) {
      this.alert.ShowAlert("msgEnterPaymentMethodCards", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (this.chequesList.length == 0 && this.supPaymentVoucherAddForm.value.paymentMethod.includes(77)) {
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
    if (this.creditCardsList.length == 0 && this.supPaymentVoucherAddForm.value.paymentMethod.includes(78)) {
      this.alert.ShowAlert(this.supPaymentVoucherAddForm.value.paymentMethod, 'error');
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
    if (this.supPaymentVoucherAddForm.value.paymentMethod.includes(77)) {
      if (this.chequesList.length > 0) {
        for (let element of this.chequesList) {
          if (element.chequeAccId <= 0 || element.chequeAccId === null) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.chequeNo === '' || element.chequeNo === null || element.chequeNo === 0) {
            this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.dueDate === '' || element.dueDate === null) {
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
    if (this.supPaymentVoucherAddForm.value.paymentMethod.includes(78)) {
      if (this.creditCardsList.length > 0) {
        for (let element of this.creditCardsList) {
          if (element.cardNo <= 0 || element.cardNo === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = false;
            return stopExecution;
          }
          else if (element.accId === '' || element.accId === null || element.accId === 0) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = false;
            
            return stopExecution;
          }
          else if (element.paymentDate === '' || element.paymentDate === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = false;
            
            return stopExecution;
          }

          else if (element.amount === 0 || element.amount === null || element.amount === '') {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = false;
            
            return stopExecution;
          }
          else if (element.drawerName === 0 || element.drawerName === '' || element.drawerName === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = false;
            
            return stopExecution;
          }
          else if (element.cardTypeId === 0 || element.cardTypeId === '' || element.cardTypeId === null) {
            this.alert.ShowAlert("msgEnterAllDataCards", 'error');
            stopExecution = false;
            
            return stopExecution;
          }
          element.index = index.toString();
          index++;
        }
      }

    }
   
    if (this.cliqDetails.length > 0 && !this.supPaymentVoucherAddForm.value.paymentMethod.includes(220)) {
      this.alert.ShowAlert("PleaseSelectCliqPaymenMethod", 'error');
      stopExecution = false;
      return stopExecution;
    }    
    else if (this.cliqDetails.length > 0 && this.supPaymentVoucherAddForm.value.paymentMethod.includes(220))
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
    if(this.supPaymentVoucherAddForm.value.paymentMethod.includes(220))
      {
        if(this.cliqDetails.length == 0 || this.cliqDetails == undefined || this.cliqDetails == null)
          { 
            this.alert.ShowAlert("PleaseEnterCliqDetails", 'error');
            stopExecution = false;
            return stopExecution;
          }  
      }

    let paymentMethodArray = this.supPaymentVoucherAddForm.value.paymentMethod;
    if (Array.isArray(paymentMethodArray)) {
      let validPaymentMethods = paymentMethodArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let paymentMethodsString = validPaymentMethods.join(',');
      this.supPaymentVoucherAddForm.get("paymentMethod")?.setValue(paymentMethodsString);
      console.log('Filtered paymentMethod:', paymentMethodsString);
    } else {
      console.error('paymentMethod is not an array');
    }
    for (let element of this.chequesList) {
      element.chequeNo = element.chequeNo.toString();
    }
   
     if (this.supPaymentVoucherAddForm.value.paymentMethod.includes(76) === false) {
      if (Number(this.supPaymentVoucherAddForm.value.amount) !== (this.cheqAmount + this.cardsAmount + this.CliqTotal)) {
        this.alert.ShowAlert("msgVoucherNotBalanced", 'error');
        stopExecution = false;
        
        return stopExecution;
      }
    }
    else {
      if (Number(this.supPaymentVoucherAddForm.value.amount) !== this.cheqAmount + this.cardsAmount + this.supPaymentVoucherAddForm.value.cashAmount + this.CliqTotal) {
        this.alert.ShowAlert("msgVoucherNotBalanced", 'error');
        stopExecution = false;
        
        return stopExecution;
      }
    }
   return stopExecution;
  }

  GetDealerInfo(supplierId: any) {
    debugger
    if (supplierId) {
      let dealerInfo = this.supplierList.find((r: any) => r.id == supplierId);
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
