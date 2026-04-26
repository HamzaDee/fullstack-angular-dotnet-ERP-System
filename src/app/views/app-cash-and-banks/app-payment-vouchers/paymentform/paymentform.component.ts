import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { PaymentvoucherService } from '../paymentvoucher.service';
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

@Component({
  selector: 'app-paymentform',
  templateUrl: './paymentform.component.html',
  styleUrls: ['./paymentform.component.scss']
})
export class PaymentformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  PaymentVoucherAddForm: FormGroup = new FormGroup({});
  public TitlePage: string = "";
  tabelData: any[] = [];
  loading: boolean = false;
  opType: string = "";
  accountsList: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  debitAccountsList: any[] = [];
  creditAccountsList: any[] = [];
  chequesList: any[] = [];
  creditCardsList: any[] = [];
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
  decimalPlaces: number = 0;
  disableAll: boolean = false;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean = false;
  UseProjects: boolean = false;
  UseTax: boolean = false;
  defaultCurrencyId: number = 0;
  allowAccRepeat: any;
  // BudgetEdit
  NoteBalance: any;
  NoteAlert: any;
  NotePrevenet: any;
  showBalance: boolean = false;
  showAlert: boolean = false;
  showPrevent: boolean = false;
  Balance: any;
  BudgetAmount: number = 0;
  cheqAcc: number = 0;
  bankId: number = 0;
  cheqStatus: number = 0;
  creditAcc: number = 0
  NoteBalanceCredit: any;
  NoteAlertCredit: any;
  NotePrevenetCredit: any;
  showBalanceCredit: boolean = false;
  showAlertCredit: boolean = false;
  showPreventCredit: boolean = false;
  BalanceCredit: any;
  BudgetAmountCredit: number = 0;
  //end
  allowMultiCurrency: boolean = false;
  disableCurrRate: boolean = false;
  disableSave:boolean = false;
  Lang: string = '';
  disableVouchertype:boolean = false;
  newDate:any;
  DebitTotal:number = 0;
  CreditTotal:number = 0 ;
  CheqTotal:number = 0;
  CreditCards:number = 0;
  payment:any;
  showsave: boolean = false;
  customerAndSupplierList: any;
  cliqDetails: any[] = [];
  cliqTypesList : any;
  CliqTotal = 0;
  TotalDebitValue: number = 0;
  DiffValue: number = 0;
  dealerAccountId: number = 0;
  dealerName: string = "";

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private paymentvoucherService: PaymentvoucherService,
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
    this.voucherType ="Accounting";
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
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
      this.router.navigate(['PaymentVoucher/PaymentVoucherList']);
    }


    this.InitiailPaymentVoucherForm();
    this.GetInitailPaymentVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Paymentform');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPaymentVoucherForm() {
    this.PaymentVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      paymentMethod: ["", [Validators.required]],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      isCanceled: [false],
      isPosted: [false],
      note: [""],
      branchId: [null],
      amount: [0],
      status: [null],
      userId: [0],
      accVouchersDTModelList: [null],//, [Validators.required, Validators.minLength(1)]],
      costCenterTranModelList: [null],
      projectTransModelList: [null],
      accVouchersDocModelList: [null],
      chequeModelList: [null],
      creditCardModelList: [null],
      cliQModelList:[null],
      referenceDate: [""],
      referenceNo: [""],
      dealerId:[0],
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
    this.paymentvoucherService.GetInitailPaymentVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['PaymentVoucher/PaymentVoucherList']);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item :any) => ({
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
        paymentMethod: item.paymentMethod,
        cheqAccId: item.cheqAccId,
        bankId: item.bankId,
        defChequeStatus: item.defChequeStatus,
        creditAccId: item.creditAccId,
        allowAccRepeat: item.allowAccRepeat,
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
      this.PaymentVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.paymentMethodList = result.paymentMethodList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.customerAndSupplierList = result.customerAndSupplierList;
      this.cliqTypesList = result.cliqTypesList;
      const firstDealer = this.accVouchersDTsList.find(e => e.dealerId != null && e.dealerId != '');

      if (firstDealer) {
        this.PaymentVoucherAddForm.get("dealerId")?.setValue(firstDealer.dealerId);
      } else {
        this.PaymentVoucherAddForm.get("dealerId")?.setValue(0);
      }

      this.PaymentVoucherAddForm.get("costCenterTranModelList")?.setValue(result.costCenterTranModelList);
      this.PaymentVoucherAddForm.get("projectTransModelList")?.setValue(result.projectTransModelList);
      this.PaymentVoucherAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
      this.debitAccountsList = result.accVouchersDTModelList.filter((x: any) => x.debit > 0 && x.cheqId == null && x.creditCardId == null);
      this.creditAccountsList = result.accVouchersDTModelList.filter((x: any) => x.credit > 0 && x.cheqId == null && x.creditCardId == null);
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
      debugger
      if(this.opType == 'Edit')
        {
          this.disableVouchertype= true;
        }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if (this.voucherId > 0) {
          debugger
          var pm = result.paymentMethod.split(',').map(Number)
          this.PaymentVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.PaymentVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          this.PaymentVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.PaymentVoucherAddForm.get("paymentMethod")?.setValue(pm);
          this.payment = pm;
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.PaymentVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.PaymentVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }
        }
        else {
          debugger
          this.PaymentVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          this.PaymentVoucherAddForm.get("dealerId")?.setValue(0);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.PaymentVoucherAddForm.get("currencyId")?.setValue(defaultCurrency.id);
            this.PaymentVoucherAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          let defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true)?.id || 0;
          this.PaymentVoucherAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
          if (result.paymentMethod !== null && result.paymentMethod !== undefined) {
            this.PaymentVoucherAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          }
          else {
            this.PaymentVoucherAddForm.get("paymentMethod")?.setValue("");
          }

          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.PaymentVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          if (this.PaymentVoucherAddForm.value.currencyId == 0) {
            this.PaymentVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data1;
            this.PaymentVoucherAddForm.get("currRate")?.setValue(currRate);
          }
        }
        this.GetVoucherTypeSetting(this.PaymentVoucherAddForm.value.voucherTypeId)
        if (this.PaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
    const isValid = this.OnSaveValidation();

    if (!isValid) {
      this.disableSave = false;
      return;
    }
   
    this.PaymentVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.PaymentVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.PaymentVoucherAddForm.value.voucherNo = this.PaymentVoucherAddForm.value.voucherNo.toString();
    this.PaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue(this.debitAccountsList);
    this.PaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue([...this.PaymentVoucherAddForm.value.accVouchersDTModelList, ...this.creditAccountsList]);
    this.PaymentVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);
    this.PaymentVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
    this.PaymentVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.PaymentVoucherAddForm.get("cliQModelList")?.setValue(this.cliqDetails);
    this.paymentvoucherService.SavePaymentVoucher(this.PaymentVoucherAddForm.value)
      .subscribe((result) => {
        debugger
        if(result == null || result == undefined)
        {
          this.alert.ShowAlert("msgErrorInSave", 'error');
          this.disableSave = false;
          return;
        }
        if (result.isSuccess) {
/*           if(result.message != "" && result.message != null && result.message != undefined)
            {                
              this.alert.ShowAlert(result.message, 'error');
              this.disableSave = false;
              return;
            } */
            
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option: any) => option.label === this.PaymentVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintPaymentvoucher(Number(result.message), this.calculateSum(1));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['PaymentVoucher/PaymentVoucherList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ClearDataForm();
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
    var serialType = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.serialType;
    var currencyId = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.currencyId;
    var branchId = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.branchId;
    this.allowAccRepeat = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.allowAccRepeat;
    var voucherCategory = this.PaymentVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.PaymentVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.PaymentVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.paymentvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.PaymentVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.PaymentVoucherAddForm.get("voucherNo")?.setValue(1);
        }
        if (branchId == null || branchId == undefined) {
          this.PaymentVoucherAddForm.get("branchId")?.setValue(0);
        }
        else {
          this.PaymentVoucherAddForm.get("branchId")?.setValue(branchId);
        }

        if (currencyId != 0 && currencyId != null && currencyId != undefined) {
          this.decimalPlaces = this.currencyList.find((option: any) => option.id === currencyId)?.data2;
        }
        else {
          this.decimalPlaces = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data2;
        }
      });
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.PaymentVoucherAddForm.get("currencyId")?.setValue(currencyId);
      var currRate = this.currencyList.find((option: any) => option.id === currencyId)?.data1;
      this.PaymentVoucherAddForm.get("currRate")?.setValue(currRate);
      if (this.PaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.PaymentVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data1;
      this.PaymentVoucherAddForm.get("currRate")?.setValue(currRate);
      if (this.PaymentVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find((option: any) => option.id === selectedValue)?.data1;
    this.decimalPlaces = this.currencyList.find((option: any) => option.id === selectedValue)?.data2;
    this.PaymentVoucherAddForm.get("currRate")?.setValue(currRate);
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

  AddNewLine(grid: number) {
    if (this.disableAll == true) {
      return;
    }
    if (grid == 1) { //debit accounts
      this.debitAccountsList.push(
        {
          accountId: this.dealerAccountId,
          debit: "",
          note: "",
          costcenterList: null,
          projectsList: null,
          accountBudgetPolicy: 0,
          costCenterPolicy: 0,
          projectPolicy: 0,
          index: ""
        });
    }  
    else if (grid == 2) { //credit accounts
      this.creditAccountsList.push(
        {
          accountId: 0,
          credit: "",
          note: "",
          costcenterList: null,
          projectsList: null,
          accountBudgetPolicy: 0,
          costCenterPolicy: 0,
          projectPolicy: 0,
          index: ""
        });
    }
    else if (grid == 3) { //cheques
      debugger
      this.chequesList.push(
        {
          chequeAccId: this.cheqAcc ?? 0,
          chequeNo: "",
          dueDate: "",
          bankId: this.bankId ?? 0,
          amount: "",
          drawerName: this.dealerName ?? "",
          chequeStatus: this.cheqStatus ?? 0,          
          accId: this.dealerAccountId == 0 ? this.creditAcc : this.dealerAccountId ,
        });
    }    
    else if (grid == 4) { //credit cards
      this.creditCardsList.push(
        {
          cardNo: 0,
          accId: 0,
          paymentDate: "",
          amount: "",
          drawerName: "",
          cardTypeId: 0
        });
    }
  }

  calculateSum(type : number) {
    let amt;
        this.DebitTotal
        this.CreditTotal
        this.CheqTotal
        this.CreditCards
    if (type == 1) {
        amt = this.debitAccountsList.reduce((sum, item) =>
          {
            const debit = parseFloat(item.debit);
            return isNaN(debit) ? sum : sum + debit;
          }, 0)   
  
        const formattedTotal = this.debitAccountsList.reduce((sum, item) =>
          {
            const amount = parseFloat(item.debit);
            return isNaN(amount) ? sum : sum + amount;
          }, 0)     
        this.DebitTotal = Number(formattedTotal);
    }
    else if (type == 2) {
      amt = this.creditAccountsList.reduce((sum, item) =>
        {
          const credit = parseFloat(item.amount);
          return isNaN(credit) ? sum : sum + credit;
        }, 0)   

      const formattedTotal = this.creditAccountsList.reduce((sum, item) =>
        {
          const credit = parseFloat(item.credit);
          return isNaN(credit) ? sum : sum + credit;
        }, 0)     
      this.CreditTotal = Number(formattedTotal);
    }
    else if (type == 3) {
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
      this.CheqTotal = Number(formattedTotal);
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
      this.CreditCards = Number(formattedTotal);
    }
    else if (type == 5) {
      const formattedTotal = this.cliqDetails.reduce((sum, item) => {
      const amount = parseFloat(item.amount);
        return isNaN(amount) ? sum : sum + amount;}, 0);
      this.CliqTotal = Number(formattedTotal);
    }
  this.TotalDebitValue = this.CreditTotal + this.CheqTotal + this.CreditCards + this.CliqTotal;
  this.DiffValue =  this.DebitTotal - this.TotalDebitValue;
    // $('#totCredit').val((this.CreditTotal + this.CheqTotal + this.CreditCards).toFixed(3));

    // $('#diff').val((this.DebitTotal - parseFloat($('#totCredit').val().toString())).toFixed(3))
    return amt;
  }

  formatAmt(row: any, type: number) {

    if (type == 0) {
      row.debit = parseFloat(row.debit).toFixed(this.decimalPlaces);
      if (row.debit > 0) {
        if (this.BudgetAmount != 0) {
          if (parseFloat(this.Balance) + parseFloat(row.debit) > this.BudgetAmount) {
            if (row.accountBudgetPolicy == 60) {
              this.showBalance = false;
              this.showPrevent = false;
              this.showAlert = true;
              this.hideLabelAfterDelay();
            }
            else if (row.accountBudgetPolicy == 61) {
              row.credit = 0;
              row.debit = 0;
              this.showBalance = false;
              this.showAlert = false;
              this.showPrevent = true;
              this.hideLabelAfterDelay();
            }
          }
        }
      }
    }

    else if (type == 1) {
      row.credit = parseFloat(row.credit).toFixed(this.decimalPlaces);
      if (row.credit > 0) {
        if (this.BudgetAmountCredit != 0) {
          if (parseFloat(this.BalanceCredit) + parseFloat(row.credit) > this.BudgetAmountCredit) {
            if (row.accountBudgetPolicy == 60) {
              this.showBalanceCredit = false;
              this.showAlertCredit = true;
              this.showPreventCredit = false;
              this.hideLabelAfterDelay();
            }
            else if (row.accountBudgetPolicy == 61) {
              row.credit = 0;
              this.showBalanceCredit = false;
              this.showAlertCredit = false;
              this.showPreventCredit = true;
              this.hideLabelAfterDelay();
            }
          }
        }
      }
    }
    else if (type == 2)
      row.amount = row.amount.toFixed(this.decimalPlaces);
    else
      row.amount = row.amount.toFixed(this.decimalPlaces);
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
        this.debitAccountsList.splice(rowIndex, 1);
      else if (grid == 2)
        this.creditAccountsList.splice(rowIndex, 1);
      else if (grid == 3)
        this.chequesList.splice(rowIndex, 1);
      else if (grid == 4)
        this.creditCardsList.splice(rowIndex, 1);
    }
    //this.PaymentVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
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

  isValidVoucherDate(event : any) {

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
    if (this.disableAll == true) {
      return;
    }
    if (grid == 1) {
      const newRow =
      {
        accountId: 0,
        debit: 0,
        note: "",
        costcenterList: null,
        projectsList: null,
        accountBudgetPolicy: 0,
        costCenterPolicy: 0,
        projectPolicy: 0,
        index: ""
      };
      this.debitAccountsList.splice(rowIndex, 0, newRow);
    }
    else if (grid == 2) {
      const newRow =
      {
        accountId: 0,
        credit: 0,
        note: "",
        costcenterList: null,
        projectsList: null,
        accountBudgetPolicy: 0,
        costCenterPolicy: 0,
        projectPolicy: 0,
        index: ""
      };
      this.creditAccountsList.splice(rowIndex, 0, newRow);
    }
    else if (grid == 3) {
      const newRow =
      {
        chequeAccId: this.cheqAcc ?? 0,
        chequeNo: "",
        dueDate: "",
        bankId: this.bankId ?? 0,
        amount: 0,
        drawerName: this.dealerName ?? "",
        chequeStatus: this.cheqStatus ?? 0,
        accId: this.dealerAccountId == 0 ? this.creditAcc : this.dealerAccountId ,
      };
      this.chequesList.splice(rowIndex, 0, newRow);
    }    
    else if (grid == 4) {
      const newRow =
      {
        cardNo: 0,
        accId: 0,
        paymentDate: "",
        amount: 0,
        drawerName: "",
        cardTypeId: 0
      };
      this.creditCardsList.splice(rowIndex, 0, newRow);
    }
    //this.PaymentVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  OpenCostcenterTransForm(row: any, rowIndex: number, isDebit: boolean) {
    debugger
    if (row.debit == null || row.debit == undefined) {
      row.debit = 0;
    }
    if (row.credit == null || row.credit == undefined) {
      row.credit = 0;
    }
    if (isDebit) {
      var list = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter((item: any) => item.index == rowIndex && item.isDebit == true)
    } else {
      var list = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter((item: any) => item.index == rowIndex && item.isDebit == false)
    }
    var accName = this.accountsList.find((option: any) => option.id === row.accountId)?.text;
    let title = this.translateService.instant('Constcenters');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CostcentertransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), costcenterList: this.costcenterList, transList: list, branchId: this.PaymentVoucherAddForm.value.branchId }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          if (isDebit == true) {
            var newList = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === true));
            newList = [...newList, ...res];
            this.PaymentVoucherAddForm.get("costCenterTranModelList")?.setValue(newList);
          }
          else {
            var newList = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === false));
            newList = [...newList, ...res];
            this.PaymentVoucherAddForm.get("costCenterTranModelList")?.setValue(newList);
          }
          // var newList = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter(item => item.index !== rowIndex);
          // newList = [...newList , ...res];
          // this.PaymentVoucherAddForm.get("costCenterTranModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  OpenProjectsTransForm(row: any, rowIndex: number, isDebit: boolean) {
    if (row.debit == null || row.debit == undefined) {
      row.debit = 0;
    }
    if (row.credit == null || row.credit == undefined) {
      row.credit = 0;
    }
    if (isDebit) {
      var list = this.PaymentVoucherAddForm.value.projectTransModelList.filter((item: any) => item.index == rowIndex && item.isDebit == true)
    } else {
      var list = this.PaymentVoucherAddForm.value.projectTransModelList.filter((item: any) => item.index == rowIndex && item.isDebit == false)
    }
    var accName = this.accountsList.find((option: any) => option.id === row.accountId)?.text;
    let title = this.translateService.instant('Projects');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ProjectstransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), projectsList: this.projectsList, transList: list }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          if (isDebit == true) {
            var newList = this.PaymentVoucherAddForm.value.projectTransModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === true));
            newList = [...newList, ...res];
            this.PaymentVoucherAddForm.get("projectTransModelList")?.setValue(newList);
          }
          else {
            var newList = this.PaymentVoucherAddForm.value.projectTransModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === false));
            newList = [...newList, ...res];
            this.PaymentVoucherAddForm.get("projectTransModelList")?.setValue(newList);
          }
          // var newList = this.PaymentVoucherAddForm.value.projectTransModelList.filter(item => item.index !== rowIndex);
          // newList = [...newList , ...res];
          // this.PaymentVoucherAddForm.get("projectTransModelList").setValue(newList);
          // If user press cancel
          return;
        }
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
        this.paymentvoucherService.DeletePaymentVoucher(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['PaymentVoucher/PaymentVoucherList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['PaymentVoucher/PaymentVoucherList']);
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

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  CheckDelete(id: number, cheqNumber: number, rowIndex: number) {
    debugger

    if (cheqNumber > 0) {
      this.paymentvoucherService.CheckDeleteStatus(id, cheqNumber).subscribe(result => {
        debugger
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
              // this.alert.DeleteSuccess();
            }
          })
        }
        else {
          this.alert.ShowAlert('YouCantDeleteTheresATrasnactionsOnTheCheque', 'error')
        }
      })
    }
    else {
      if (rowIndex !== -1) {
        this.chequesList.splice(rowIndex, 1);
      }
    }

  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeBranch;
    this.cheqAcc = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.cheqAccId;
    this.bankId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.bankId;
    this.cheqStatus = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.defChequeStatus;
    this.creditAcc = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.creditAccId;
    if(this.creditAcc > 0)
    {
     this.dealerName = this.accountsList.find((option: any) => option.id === this.creditAcc)?.text ?? "";
    }
    debugger
    if (this.opType == 'Add' && voucherTypeId != this.payment) {
      var pm = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.paymentMethod;
      pm = Array.isArray(pm) ? pm : (pm !== undefined ? [pm] : []);
      if (pm[0] !== null && pm[0] !== undefined) {
        this.PaymentVoucherAddForm.get("paymentMethod")?.setValue(pm);
      }
      else {
        this.PaymentVoucherAddForm.get("paymentMethod")?.setValue("");
      }
    }
    this.cdr.detectChanges();
  }

  OnAccountChangeDebit(event : any, row : any, index : number) {
    debugger
    if (row.debit > 0) {
      row.debit = 0;
    }

    var BranchId = this.PaymentVoucherAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find((r: any) => r.id == event.value)?.text;
    debugger
    if (event.value) {
      this.paymentvoucherService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
        debugger
        if (result) {
          this.NoteBalance = "رصيد الحساب " + "-" + AccountName + ": " + Math.abs(result.balance).toFixed(3) + " , " + "الموازنة التقديرية للحساب" + ": " + result.budgetAmt.toFixed(3);
          this.Balance = Math.abs(result.balance).toFixed(3);
          this.BudgetAmount = result.budgetAmt;
          this.showBalance = true;
          this.NoteAlert = "TheEnteredAccountBalanceExceededTheBudgetBalance";
          this.NotePrevenet = "TheBalanceExceededTheAmountAllowedByTheBudget";
          this.showAlert = false;
          this.showPrevent = false;
          this.debitAccountsList[index].accountBudgetPolicy = result.budgetPolicy;
          this.debitAccountsList[index].costCenterPolicy = result.costCenterPolicy;
          this.debitAccountsList[index].projectPolicy = result.projectPolicy;                       
          this.hideLabelAfterDelay();
        }
      });
    }

    debugger
    if (event.value > 0) {
      if (this.debitAccountsList.length > 0) {
        let isDuplicate = false;
        for (let i = 0; i < this.debitAccountsList.length; i++) {
          if (this.debitAccountsList[i].accountId == event.value && i != index) {
            isDuplicate = true;

            if (this.allowAccRepeat == 61) {
              this.alert.ShowAlert("msgCantAddSameAccountForThisVoucherType", 'error');
              break;
            } else if (this.allowAccRepeat == 60) {
              this.alert.ShowAlert("msgTheAccRepeatedReminder", 'error');
              break;
            }
          }
        }
        if (isDuplicate && this.allowAccRepeat == 61) {
          this.debitAccountsList[index] = {
            ...this.debitAccountsList[index],
            accountId: 0
          };
          this.cdr.detectChanges();
        }
      }
    }
    if(event.value > 0)
      {
        this.dealerAccountId = event.value;
        this.dealerName = this.accountsList.find((option: any) => option.id === event.value)?.text ?? "";
      }
     else
      {
        this.dealerAccountId = 0;
        this.dealerName = "";
      } 
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 5000);
  }

  OnAccountChangeCredit(event : any, row : any, index : number) {
    debugger
    if (row.credit > 0) {
      row.credit = 0;
    }
    var BranchId = this.PaymentVoucherAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find((r: any) => r.id == event.value)?.text;
    debugger
    if (event.value) {
      this.paymentvoucherService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
        debugger
        if (result) {
          this.NoteBalanceCredit = "رصيد الحساب " + "-" + AccountName + ": " + Math.abs(result.balance).toFixed(3) + " , " + "الموازنة التقديرية للحساب" + ": " + result.budgetAmt.toFixed(3);
          this.BalanceCredit = Math.abs(result.balance).toFixed(3);
          this.BudgetAmountCredit = result.budgetAmt;
          this.showBalanceCredit = true;
          this.NoteAlertCredit = "TheEnteredAccountBalanceExceededTheBudgetBalance";
          this.NotePrevenetCredit = "TheBalanceExceededTheAmountAllowedByTheBudget";
          this.showAlertCredit = false;
          this.showPreventCredit = false;
          this.creditAccountsList[index].accountBudgetPolicy = result.budgetPolicy;
          this.creditAccountsList[index].costCenterPolicy = result.costCenterPolicy;
          this.creditAccountsList[index].projectPolicy = result.projectPolicy;                       
          this.hideLabelAfterDelayCredit();
        }
      });
    }

    debugger
    if (event.value > 0) {
      if (this.creditAccountsList.length > 0) {
        let isDuplicate = false;
        for (let i = 0; i < this.creditAccountsList.length; i++) {
          if (this.creditAccountsList[i].accountId == event.value && i != index) {
            isDuplicate = true;

            if (this.allowAccRepeat == 61) {
              this.alert.ShowAlert("msgCantAddSameAccountForThisVoucherType", 'error');
              break;
            } else if (this.allowAccRepeat == 60) {
              this.alert.ShowAlert("msgTheAccRepeatedReminder", 'error');
              break;
            }
          }
        }
        if (isDuplicate && this.allowAccRepeat == 61) {
          this.creditAccountsList[index] = {
            ...this.creditAccountsList[index],
            accountId: 0
          };
          this.cdr.detectChanges();
        }
      }
    }
  }

  hideLabelAfterDelayCredit() {
    setTimeout(() => {
      this.showBalanceCredit = false;
      this.showAlertCredit = false;
      this.showPreventCredit = false;
    }, 5000);
  }

  ClearDataForm() {
    this.PaymentVoucherAddForm.get("note")?.setValue("");
    this.PaymentVoucherAddForm.get("accVouchersDTModelList")?.setValue([]);
    this.PaymentVoucherAddForm.get("costCenterTranModelList")?.setValue([]);
    this.PaymentVoucherAddForm.get("projectTransModelList")?.setValue([]);
    this.PaymentVoucherAddForm.get("accVouchersDocModelList")?.setValue([]);
    this.PaymentVoucherAddForm.get("chequeModelList")?.setValue([]);
    this.PaymentVoucherAddForm.get("creditCardModelList")?.setValue([]);
    this.PaymentVoucherAddForm.get("referenceNo")?.setValue("");
    this.PaymentVoucherAddForm.get("dealerId")?.setValue(0);
    this.debitAccountsList = [];
    this.creditAccountsList = [];
    this.chequesList = [];
    this.creditCardsList = [];
    this.cliqDetails = [];
    this.DiffValue= 0 ;
    this.CliqTotal = 0;
    this.onCliqChanged(this.cliqDetails);
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.PaymentVoucherAddForm.value.voucherTypeId);
    });
  }


  PrintPaymentvoucher(voucherId: number, Balance : any) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `rptPaymentVoucherAR?VId=${voucherId}&Balance=${Balance}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `rptPaymentVoucherEN?VId=${voucherId}&Balance=${Balance}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  fillCard(cardId:any , index:number)  
  {
    debugger
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

  voucherNoBlur(VoucherNo: string, VoucherTypeId: number)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.paymentvoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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
    this.paymentvoucherService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
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

  clearFormdata(VoucherNo: string)
  {    debugger
    this.newDate = new Date;
    this.PaymentVoucherAddForm.get("id")?.setValue(0);
    this.PaymentVoucherAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.PaymentVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.PaymentVoucherAddForm.get("branchId")?.setValue(0);
    this.PaymentVoucherAddForm.get("currencyId")?.setValue(0);
    this.PaymentVoucherAddForm.get("currRate")?.setValue(0);
    this.PaymentVoucherAddForm.get("referenceNo")?.setValue("");
    this.PaymentVoucherAddForm.get("referenceDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.PaymentVoucherAddForm.get("note")?.setValue("");
    this.debitAccountsList = [];
    this.creditAccountsList = [];
    this.chequesList = [];
    this.creditCardsList = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.PaymentVoucherAddForm.value.voucherTypeId);
    });
    this.PaymentVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.PaymentVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row: any, index: number, type: number)
  {
    debugger
    if(this.allowAccRepeat == 61)
      {
        if (type == 1) { //debit accounts
          this.debitAccountsList.push(
            {
              accountId: 0,
              debit: row.debit,
              note: row.note,
              costcenterList: null,
              projectsList: null,
              accountBudgetPolicy: row.accountBudgetPolicy,
              costCenterPolicy: row.costCenterPolicy,
              projectPolicy: row.projectPolicy,
              index: ""
            });
        }
        else if (type == 2) { //credit accounts
          this.creditAccountsList.push(
            {
              accountId: 0,
              credit: row.credit,
              note: row.note,
              costcenterList: null,
              projectsList: null,
              accountBudgetPolicy: row.accountBudgetPolicy,
              costCenterPolicy: row.costCenterPolicy,
              projectPolicy: row.projectPolicy,
              index: ""
            });
        }
        else if (type == 3) { //cheques
          this.chequesList.push(
            {
              chequeAccId: row.chequeAccId,
              chequeNo: '',
              dueDate: row.dueDate,
              bankId: row.bankId,
              amount: row.amount,
              drawerName: row.drawerName,
              chequeStatus: row.chequeStatus,
              accId: row.accId,
            });
        }
        else if (type == 4) { //credit cards
          this.creditCardsList.push(
            {
              cardNo: row.cardNo,
              accId: row.accId,
              paymentDate: row.paymentDate,
              amount: row.amount,
              drawerName: row.drawerName,
              cardTypeId: row.cardTypeId,
            });
        }
      }
      else
      {
        if (type == 1) { //debit accounts
          this.debitAccountsList.push(
            {
              accountId:row.accountId,
              debit: row.debit,
              note: row.note,
              costcenterList: null,
              projectsList: null,
              accountBudgetPolicy: row.accountBudgetPolicy,
              costCenterPolicy: row.costCenterPolicy,
              projectPolicy: row.projectPolicy,
              index: ""
            });
        }
        else if (type == 2) { //credit accounts
          this.creditAccountsList.push(
            {
              accountId:row.accountId,
              credit: row.credit,
              note: row.note,
              costcenterList: null,
              projectsList: null,
              accountBudgetPolicy: row.accountBudgetPolicy,
              costCenterPolicy: row.costCenterPolicy,
              projectPolicy: row.projectPolicy,
              index: ""
            });
        }
        else if (type == 3) { //cheques
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
        else if (type == 4) { //credit cards
          this.creditCardsList.push(
            {
              cardNo: row.cardNo,
              accId: row.accId,
              paymentDate: row.paymentDate,
              amount: row.amount,
              drawerName: row.drawerName,
              cardTypeId: row.cardTypeId,
            });
        }  
      }
   
  }

  handleF3Key(event: KeyboardEvent, row: any, index: number, type: number) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index,type);
    }
  }

  CheckCheq(row: any, index: number)
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

  onCliqChanged(list: any) {
    debugger
    this.cliqDetails = list;
    let payment = this.PaymentVoucherAddForm.value.paymentMethod
    if(payment.includes(220))
      {
        this.calculateSum(5);
      }    
  }

  OnSaveValidation()
  {
  let ok = true ;
  let index = 0;
  debugger;

    if (this.debitAccountsList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataDebit", 'error');
      ok = false;
      return ok;
    }
    else {
      for (let element of this.debitAccountsList) {
        if (element.accountId <= 0 || !this.appCommonserviceService.isValidNumber(element.debit)) {
          this.alert.ShowAlert("msgEnterAllDataDebit", 'error');
          ok = false;
          return ok;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (this.creditAccountsList.length == 0 && this.PaymentVoucherAddForm.value.paymentMethod.includes(76)) {
      this.alert.ShowAlert("msgEnterAllDataCredit", 'error');
      ok = false;
      return ok;
    }
    else {
      for (let element of this.creditAccountsList) {
        if (element.accountId <= 0 || !this.appCommonserviceService.isValidNumber(element.credit)) {
          this.alert.ShowAlert("msgEnterAllDataCredit", 'error');
          ok = false;
          return ok;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (this.chequesList.length > 0 && !this.PaymentVoucherAddForm.value.paymentMethod.includes(77)) {
      this.alert.ShowAlert("Please Enter Cheq Payment Method", 'error');
      ok = false;
      return ok;
    }

    if (this.creditCardsList.length > 0 && !this.PaymentVoucherAddForm.value.paymentMethod.includes(78)) {
      this.alert.ShowAlert("Please Enter CreditCards Payment Method", 'error');
      ok = false;
      return ok;
    }

    if (this.creditAccountsList.length > 0 && (!this.PaymentVoucherAddForm.value.paymentMethod.includes(76) &&  !this.PaymentVoucherAddForm.value.paymentMethod.includes(79))) {
      this.alert.ShowAlert("Please Enter Cash Payment Method", 'error');
      ok = false;
      return ok;
    }

    if (this.chequesList.length == 0 && this.PaymentVoucherAddForm.value.paymentMethod.includes(77) ) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      ok = false;
      return ok;
    }
    else {
      for (let element of this.chequesList) {
        if (element.accId <= 0 || !this.appCommonserviceService.isValidNumber(element.amount)) {
          this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
          ok = false;
          return ok;
        }


        if (element.chequeNo == '' || element.chequeNo == null || element.chequeNo == undefined) {
          this.alert.ShowAlert("msgEnterChequesNo", 'error');
          ok = false;
          return ok;
        }

        if (element.dueDate == '' || element.dueDate == null || element.dueDate == undefined) {
          this.alert.ShowAlert("msgChosedueDate", 'error');
          ok = false;
          return ok;
        }

        if (element.bankId == 0 || element.bankId == null || element.bankId == undefined) {
          this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
          ok = false;
          return ok;
        }

        if (element.amount == 0 || element.amount == null || element.amount == undefined) {
          this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
          ok = false;
          return ok;
        }

        if (element.chequeStatus == 0 || element.chequeStatus == null || element.chequeStatus == undefined) {
          this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
          ok = false;
          return ok;
        }
        
        element.index = index.toString();
        index++;
      }
    }

    if (this.creditCardsList.length == 0 && this.PaymentVoucherAddForm.value.paymentMethod.includes(78) ) {
      this.alert.ShowAlert(this.PaymentVoucherAddForm.value.paymentMethod, 'error');
      this.alert.ShowAlert("msgEnterAllDataCards", 'error');
      ok = false;
      return ok;
    }
    else {
      for (let element of this.creditCardsList) {
        if (element.accountId <= 0 || !this.appCommonserviceService.isValidNumber(element.amount) || element.cardTypeId <= 0) {
          this.alert.ShowAlert("msgEnterAllDataCards", 'error');
          ok = false;
          return ok;
        }

        if (element.cardNo == '' || element.cardNo == null) {
          this.alert.ShowAlert("msgEntercardNo", 'error');
          ok = false;
          return ok;
        }
        element.index = index.toString();
        index++;
      }
    }
    if (this.cliqDetails.length > 0 && !this.PaymentVoucherAddForm.value.paymentMethod.includes(220)) {
      this.alert.ShowAlert("PleaseSelectCliqPaymenMethod", 'error');
      ok = false;
      return ok;
    }    
    else if (this.cliqDetails.length > 0 && this.PaymentVoucherAddForm.value.paymentMethod.includes(220))
      {
       for (let i = 0; i < this.cliqDetails.length; i++) {
        const element = this.cliqDetails[i];
        if(element.cliqType == 0 ||  element.cliqType == null || element.cliqType == undefined)
          {
            this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
            ok = false;
            return ok;
          }
          if(element.cliqName == "" ||  element.cliqName == null || element.cliqName == undefined)
          {
            this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
            ok = false;
            return ok;
          }
          if(element.amount == 0 ||  element.amount == null || element.amount == undefined)
          {
            this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
            ok = false;
            return ok;
          }
          if(element.accId == 0 ||  element.accId == null || element.accId == undefined)
          {
            this.alert.ShowAlert("MsgPleaseEnterRequierdDataInCliqTable",'error');
            this.disableSave = false;
            ok = false;
            return ok;
          }
      element.i = i.toString();
    }
    }
    if(this.PaymentVoucherAddForm.value.paymentMethod.includes(220))
      {
        if(this.cliqDetails.length == 0 || this.cliqDetails == undefined || this.cliqDetails == null)
          { 
            this.alert.ShowAlert("PleaseEnterCliqDetails", 'error');
            ok = false;
            return ok;
          }  
      }

    let paymentMethodArray = this.PaymentVoucherAddForm.value.paymentMethod;
    if (Array.isArray(paymentMethodArray)) {
      let validPaymentMethods = paymentMethodArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let paymentMethodsString = validPaymentMethods.join(',');
      this.PaymentVoucherAddForm.get("paymentMethod")?.setValue(paymentMethodsString);
      console.log('Filtered paymentMethod:', paymentMethodsString);
    } else {
      console.error('paymentMethod is not an array');
    }
    
    debugger
    if(this.DiffValue !== 0)
      {
        this.alert.ShowAlert("msgUnbalancedDebitCredit", 'error');
        ok = false;
        return ok;
      }
    
    for (let element of this.chequesList) {
      element.chequeNo = element.chequeNo.toString();
    }

    //Debit CostCenter Validation
    for (let i = 0; i < this.creditAccountsList.length; i++) {
      const element = this.creditAccountsList[i];
      if (element.accountId > 0) {
        let AccountName = this.accountsList.find((r: any) => r.id == element.accountId)?.text;
        if (this.useCostCenter) {
          if (element.costCenterPolicy == 61) {
            if (this.PaymentVoucherAddForm.value.costCenterTranModelList.length > 0) {
              let isExist = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter((r: any) => r.credit > 0 && r.index == i).reduce((sum :any, current :any) => sum + current.credit, 0);
              if (isExist == 0) {
                this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
                ok = false;
                return ok;
              }
            }
            else {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
              ok = false;
              return ok;
            }

          }
          else if (element.costCenterPolicy == 60) {
            let isExist = this.PaymentVoucherAddForm.value.costCenterTranModelList.find((r: any) => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
            }
          }
        }
        if (this.UseProjects) {
          if (element.projectPolicy == 61) {
            if (this.PaymentVoucherAddForm.value.projectTransModelList.length > 0) {
              let isExist = this.PaymentVoucherAddForm.value.projectTransModelList.filter((r: any) => r.credit > 0 && r.index == i).reduce((sum :any, current :any) => sum + current.credit, 0);
              if (isExist == 0) {
                this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
                ok = false;
                return ok;
              }
            }
            else {
              this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
              ok = false;
              return ok;
            }

          }
          else if (element.projectPolicy == 60) {
            let isExist = this.PaymentVoucherAddForm.value.projectTransModelList.find((r: any) => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
            }
          }
        }
      }
      element.i = i.toString();
    }

    
    debugger
    //Credit CostCenter Validation
    for (let i = 0; i < this.debitAccountsList.length; i++) {
      const element = this.debitAccountsList[i];
      if (element.accountId > 0) {
        let AccountName = this.accountsList.find((r: any) => r.id == element.accountId)?.text;
        if (this.useCostCenter) {
          if (element.costCenterPolicy == 61) {
            if (this.PaymentVoucherAddForm.value.costCenterTranModelList.length > 0) {
              const isExist = this.PaymentVoucherAddForm.value.costCenterTranModelList.filter((r: any) => r.debit > 0 && r.index == i).reduce((sum :any, current :any) => sum + current.debit, 0);
              if (isExist == 0) {
                this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
                ok = false;
                return ok;
              }
            }
            else {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
              ok = false;
              return ok;
            }

          }
          else if (element.costCenterPolicy == 60) {
            const isExist = this.PaymentVoucherAddForm.value.costCenterTranModelList.find((r: any) => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
            }
          }
        }
        if (this.UseProjects) {
          if (element.projectPolicy == 61) {
            if (this.PaymentVoucherAddForm.value.projectTransModelList.length > 0) {
              const isExist = this.PaymentVoucherAddForm.value.projectTransModelList.filter((r: any) => r.debit > 0 && r.index == i).reduce((sum :any, current :any) => sum + current.debit, 0);
              if (isExist == 0) {
                this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
                ok = false;
                return ok;
              }
            }
            else {
              this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
              ok = false;
              return ok;
            }

          }
          else if (element.projectPolicy == 60) {
            const isExist = this.PaymentVoucherAddForm.value.projectTransModelList.find((r: any) => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
            }
          }
        }
      }
      element.i = i.toString();
    }

   return ok;
  }

  GetDealerInfo(supplierId: any) {
    debugger
    if (supplierId) {
      let dealerInfo = this.customerAndSupplierList.find((r: any) => r.id == supplierId);
      if (dealerInfo) {
        this.dealerAccountId = dealerInfo.data2 ?? 0;
        this.dealerName = dealerInfo.text ?? '';
      }
    }
    else if(this.creditAcc > 0)
    {
      let dealerInfo = this.accountsList.find((r: any) => r.id == this.creditAcc);
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

