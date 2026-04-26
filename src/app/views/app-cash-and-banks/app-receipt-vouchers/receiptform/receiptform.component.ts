import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ReceiptvoucherService } from '../receiptvoucher.service';
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
  selector: 'app-receiptform',
  templateUrl: './receiptform.component.html',
  styleUrls: ['./receiptform.component.scss']
})
export class ReceiptformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  ReceiptVoucherAddForm: FormGroup = new FormGroup({});
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
  payBillsList: any[] = [];
  voucherTypeList: any;
  branchesList: any;
  costCenterPolicyList: any;
  employeeList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string  = "";
  isExistAccNo: boolean = true;
  costcenterList: any;
  projectsList: any;
  voucherId: any;
  voucherType: any;
  paymentMethodList: any;
  bankList: any;
  creditBankList: any;
  statusList: any;
  creditCardsTypes: any;
  decimalPlaces: number = 0;
  disableAll: boolean = false;
  voucherNo: number = 0;
  cheqAcc: number = 0;
  bankId: number = 0;
  cheqStatus: number = 0;
  creditAcc: number = 0
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  defaultCurrencyId: number = 0;
  useCostCenter: boolean = false;
  UseProjects: boolean = false;
  // BudgetEdit
  NoteBalance: any;
  NoteAlert: any;
  NotePrevenet: any;
  showBalance: boolean = false;
  showAlert: boolean = false;
  showPrevent: boolean = false;
  Balance: any;
  BudgetAmount: number = 0;
  allowAccRepeat: any;
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
  invoicesTotal: number = 0;
  accId: number = 0;
  disableCurrRate: boolean = false;
  disableSave: boolean = false;
  SavedTypeId: any;
  Lang: string = "";
  disableVouchertype: boolean = false;
  DebitTotal: number = 0;
  CreditTotal: number = 0;
  CheqTotal: number = 0;
  CreditCards: number = 0;
  newDate: any;
  showid: boolean = false;
  showsave: boolean = false;
  customerAndSupplierList: any;
  hideInfo: boolean = false;
  CompanyName: any;
  paymentTypesList:any;
  semesterList: any;
  cliqDetails: any[] = [];
  cliqTypesList : any;
  CliqTotal = 0;
  TotalDebitValue: number = 0;
  DiffValue: number = 0;
  AccountName: string = "";
  DealerAccountId: number = 0;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private receiptvoucherService: ReceiptvoucherService,
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
      this.router.navigate(['ReceiptVoucher/ReceiptVoucherList']);
    }
    this.InitiailReceiptvoucherForm();
    this.GetInitailReceiptvoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Receiptform');
    this.title.setTitle(this.TitlePage);
  }

  InitiailReceiptvoucherForm() {
    this.ReceiptVoucherAddForm = this.formbulider.group({
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
      paymentVoucherList: [null],
      cliQModelList:[null],
      referenceDate: [""],
      referenceNo: [""],
      representId: [0],
      payerName: [""],
      dealerId: [0],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailReceiptvoucher() {
    var lang = this.jwtAuth.getLang();
    this.receiptvoucherService.GetInitailReceiptVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ReceiptVoucher/ReceiptVoucherList']);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      this.voucherTypeList = result.voucherTypeList.map((item: any) => ({
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
      this.defaultCurrencyId = result.defaultCurrency;
      this.ReceiptVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.paymentMethodList = result.paymentMethodList;
      this.employeeList = result.employeeModelList;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.customerAndSupplierList = result.customerAndSupplierList;
      this.paymentTypesList = result.paymentTypesList;
      this.semesterList = result.semesterList;
      this.cliqTypesList = result.cliqTypesList;
      // this.accVouchersDTsList.forEach(element => {
      //   debugger
      //   if (element.dealerId == null || element.dealerId == undefined || element.dealerId == '') {
      //     this.ReceiptVoucherAddForm.get("dealerId").setValue(0);
      //   }
      //   else {
      //     this.ReceiptVoucherAddForm.get("dealerId").setValue(element.dealerId);
      //   }
      // });

      if(result.cliQModelList != null && result.cliQModelList.length >0)
        {
          this.cliqDetails = result.cliQModelList;
          this.calculateSum(5);          
        }
      this.ReceiptVoucherAddForm.get("costCenterTranModelList")?.setValue(result.costCenterTranModelList);
      this.ReceiptVoucherAddForm.get("projectTransModelList")?.setValue(result.projectTransModelList);
      this.ReceiptVoucherAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
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
      if (result.paymentVoucherList != 0 && result.paymentVoucherList.length > 0) {
        this.payBillsList = result.paymentVoucherList;
        this.ReceiptVoucherAddForm.get("paymentVoucherList")?.setValue(result.paymentVoucherList);
      }

      this.childAttachment.data = result.accVouchersDocModelList;
      this.childAttachment.ngOnInit();
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        debugger

        if (this.voucherId > 0) {
          debugger
          var pm = result.paymentMethod.split(',').map(Number)
          this.ReceiptVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.ReceiptVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          this.ReceiptVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.ReceiptVoucherAddForm.get("paymentMethod")?.setValue(pm);
           this.ReceiptVoucherAddForm.get("dealerId")?.setValue(result.dealerId);
          this.SavedTypeId = pm;
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          debugger
          this.accId = result.paymentAccId;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ReceiptVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ReceiptVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }

        }
        else {
          this.ReceiptVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          // this.ReceiptVoucherAddForm.get("representId")?.setValue(result.representId);

          var defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true)?.id || 0;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ReceiptVoucherAddForm.get("currencyId")?.setValue(defaultCurrency.id);
            this.ReceiptVoucherAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          this.ReceiptVoucherAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
          if (result.paymentMethod !== null && result.paymentMethod !== undefined) {
            this.ReceiptVoucherAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          }
          else {
            this.ReceiptVoucherAddForm.get("paymentMethod")?.setValue("");
          }

          this.ReceiptVoucherAddForm.get("dealerId")?.setValue(0);


          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ReceiptVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          if (this.ReceiptVoucherAddForm.value.currencyId == 0) {
            this.ReceiptVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data1;
            this.ReceiptVoucherAddForm.get("currRate")?.setValue(currRate);
          }
          this.accId = 0;
        }
        this.GetVoucherTypeSetting(this.ReceiptVoucherAddForm.value.voucherTypeId)
        if (this.ReceiptVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
  debugger;
    this.ReceiptVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ReceiptVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.ReceiptVoucherAddForm.value.voucherNo = this.ReceiptVoucherAddForm.value.voucherNo.toString();
    this.ReceiptVoucherAddForm.get("accVouchersDocModelList")?.setValue(this.childAttachment.getVoucherAttachData());
    this.ReceiptVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);
    this.ReceiptVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
    this.ReceiptVoucherAddForm.get("accVouchersDTModelList")?.setValue(this.debitAccountsList);
    this.ReceiptVoucherAddForm.get("accVouchersDTModelList")?.setValue(this.ReceiptVoucherAddForm.value.accVouchersDTModelList = [...this.ReceiptVoucherAddForm.value.accVouchersDTModelList, ...this.creditAccountsList]);
    this.ReceiptVoucherAddForm.get("paymentVoucherList")?.setValue(this.payBillsList);
    this.ReceiptVoucherAddForm.get("cliQModelList")?.setValue(this.cliqDetails);
    
    debugger
    this.receiptvoucherService.SaveReceiptVoucher(this.ReceiptVoucherAddForm.value)
      .subscribe((result) => {
        debugger
        if (result.isSuccess) {
          /*      if(result.message != "" && result.message != null && result.message != undefined)
                 {                
                   this.alert.ShowAlert(result.message, 'error');
                   this.disableSave = false;
                   return;
                 } */

          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option: any) => option.label === this.ReceiptVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintReciptvoucher(Number(result.message), this.calculateSum(1));
          }


          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ReceiptVoucher/ReceiptVoucherList']);
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
    var serialType = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.serialType;
    var currencyId = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.currencyId;
    var branchId = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.branchId;
    this.allowAccRepeat = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.allowAccRepeat;
    var voucherCategory = this.ReceiptVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.ReceiptVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.ReceiptVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.receiptvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.ReceiptVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.ReceiptVoucherAddForm.get("voucherNo")?.setValue(1);
        }
        this.ReceiptVoucherAddForm.get("branchId")?.setValue(branchId);
        if (currencyId != 0 && currencyId != null && currencyId != undefined) {
          this.decimalPlaces = this.currencyList.find((option: any) => option.id === currencyId)?.data2;
        }
        else {
          this.decimalPlaces = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data2;
        }
      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.ReceiptVoucherAddForm.get("currencyId")?.setValue(currencyId);
      var currRate = this.currencyList.find((option: any) => option.id === currencyId)?.data1;
      this.ReceiptVoucherAddForm.get("currRate")?.setValue(currRate);
      if (this.ReceiptVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.ReceiptVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data1;
      this.ReceiptVoucherAddForm.get("currRate")?.setValue(currRate);
      if (this.ReceiptVoucherAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.ReceiptVoucherAddForm.get("currRate")?.setValue(currRate);
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
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (grid == 1) { //credit accounts
      this.creditAccountsList.push(
        {
          accountId: this.DealerAccountId ?? 0,
          credit: "",
          paymentType: 0,
          semesterId: 0,
          note: "",
          costcenterList: null,
          projectsList: null,
          accountBudgetPolicy: 0,
          costCenterPolicy: 0,
          projectPolicy: 0,
          index: ""
        });
    }
    else if (grid == 2) { //debit accounts
      this.debitAccountsList.push(
        {
          accountId: 0,
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
    else if (grid == 3) { //cheques
      this.chequesList.push(
        {
          id: 0,
          chequeAccId: this.cheqAcc ?? 0,
          chequeNo: "",
          dueDate: "",
          bankId: this.bankId ?? 0,
          amount: "",
          drawerName: this.AccountName ?? "",
          chequeStatus: this.cheqStatus ?? 0,
          accId: this.creditAccountsList.length > 0 ? this.creditAccountsList[0].accountId : this.DealerAccountId ?? 0
        });
    }
    else if (grid == 4) { //credit cards
      this.creditCardsList.push(
        {
          cardNo: "",
          accId: 0,
          paymentDate: "",
          amount: 0,
          drawerName: "",
          cardTypeId: 0
        });
    }

    debugger
    for (let i = 0; i < this.creditCardsList.length; i++) {
      /*     if (this.creditAccountsList[i] && this.creditAccountsList[i].accountId) { */
      const selectedAccount = this.accountsList.find((account: any) => account.id === this.creditAccountsList[0].accountId);
      this.creditCardsList[i].drawerName = selectedAccount ? selectedAccount.text.split(' - ')[1] || selectedAccount.text : '';
      /*     } */
    }

  }

  calculateSum(type : number) {

    let amt;
    if (type == 1) {
      amt = this.creditAccountsList.reduce((sum, item) => {
        const credit = parseFloat(item.credit);
        return isNaN(credit) ? sum : sum + credit;
      }, 0)

      const formattedTotal = this.creditAccountsList.reduce((sum, item) => {
        const credit = parseFloat(item.credit);
        return isNaN(credit) ? sum : sum + credit;
      }, 0)
      this.CreditTotal = Number(formattedTotal);
    }
    else if (type == 2) {

      let payment = this.ReceiptVoucherAddForm.value.paymentMethod
      // if(payment.includes(76) || payment.includes(79))
      //   {
          amt = this.debitAccountsList.reduce((sum, item) => {
            const debit = parseFloat(item.debit);
            return isNaN(debit) ? sum : sum + debit;
          }, 0)

          const formattedTotal = this.debitAccountsList.reduce((sum, item) => {
            const amount = parseFloat(item.debit);
            return isNaN(amount) ? sum : sum + amount;
          }, 0)
          this.DebitTotal = Number(formattedTotal);
        // }
      
    }

    else if (type == 3) {
      // let payment = this.ReceiptVoucherAddForm.value.paymentMethod
      // if(payment.includes(77))
        // {
          amt = this.chequesList.reduce((sum, item) => {
            const amount = parseFloat(item.amount);
            return isNaN(amount) ? sum : sum + amount;
          }, 0)

          const formattedTotal = this.chequesList.reduce((sum, item) => {
            const amount = parseFloat(item.amount);
            return isNaN(amount) ? sum : sum + amount;
          }, 0)
          this.CheqTotal = Number(formattedTotal);;
        // }     
    }

    else if (type == 4) {
       let payment = this.ReceiptVoucherAddForm.value.paymentMethod
      // if(payment.includes(78))
        // {
          amt = this.creditCardsList.reduce((sum, item) => {
            const amount = parseFloat(item.amount);
            return isNaN(amount) ? sum : sum + amount;
          }, 0)

          const formattedTotal = this.creditCardsList.reduce((sum, item) => {
            const amount = parseFloat(item.amount);
            return isNaN(amount) ? sum : sum + amount;
          }, 0)
          this.CreditCards = Number(formattedTotal);
        // }
     
    }

    else if (type == 5) {
      // let payment = this.ReceiptVoucherAddForm.value.paymentMethod
      // if(payment.includes(220))
        // {
          const formattedTotal = this.cliqDetails.reduce((sum, item) => {
            const amount = parseFloat(item.amount);
            return isNaN(amount) ? sum : sum + amount;
          }, 0);

          this.CliqTotal = Number(formattedTotal);
        // }
    
  }



  this.TotalDebitValue = this.DebitTotal + this.CheqTotal + this.CreditCards + this.CliqTotal;
  this.DiffValue = this.CreditTotal - this.TotalDebitValue;
    // $('#TotalDebit').val((this.DebitTotal + this.CheqTotal + this.CreditCards + this.CliqTotal).toFixed(3));

    // $('#diff').val((this.CreditTotal - parseFloat($('#TotalDebit').val().toString())).toFixed(3))

    return amt;
  }

  formatAmt(row: any, type: number) {
    debugger
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
    else {
      row.amount = row.amount.toFixed(this.decimalPlaces);
    }

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
    if (this.disableAll == true) {
      return;
    }
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
    //this.ReceiptVoucherAddForm.get("accVouchersDTModelList").setValue(this.accVouchersDTsList);
  }

  isEmpty(input: any) {
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
        drawerName: "",
        chequeStatus: this.cheqStatus ?? 0,
        accId: this.creditAcc ?? 0
      };
      this.chequesList.splice(rowIndex, 0, newRow);
    }
    else if (grid == 4) {
      const newRow =
      {
        cardNo: "",
        accId: 0,
        paymentDate: "",
        amount: 0,
        drawerName: "",
        cardTypeId: 0
      };
      this.creditCardsList.splice(rowIndex, 0, newRow);
    }
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
      var list = this.ReceiptVoucherAddForm.value.costCenterTranModelList.filter((item: any) => item.index == rowIndex && item.isDebit == true)
    } else {
      var list = this.ReceiptVoucherAddForm.value.costCenterTranModelList.filter((item: any) => item.index == rowIndex && item.isDebit == false)
    }
    var accName = this.accountsList.find((option: any) => option.id === row.accountId)?.text;
    let title = this.translateService.instant('Constcenters');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CostcentertransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), costcenterList: this.costcenterList, transList: list, branchId: this.ReceiptVoucherAddForm.value.branchId }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          if (isDebit == true) {
            var newList = this.ReceiptVoucherAddForm.value.costCenterTranModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === true));
            newList = [...newList, ...res];
            this.ReceiptVoucherAddForm.get("costCenterTranModelList")?.setValue(newList);
          }
          else {
            var newList = this.ReceiptVoucherAddForm.value.costCenterTranModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === false));
            newList = [...newList, ...res];
            this.ReceiptVoucherAddForm.get("costCenterTranModelList")?.setValue(newList);
          }

          // If user press cancel
          return;
        }
      })
  }

  OpenProjectsTransForm(row: any, rowIndex: number, isDebit: boolean) {
    debugger
    if (row.debit == null || row.debit == undefined) {
      row.debit = 0;
    }
    if (row.credit == null || row.credit == undefined) {
      row.credit = 0;
    }
    if (isDebit) {
      var list = this.ReceiptVoucherAddForm.value.projectTransModelList.filter((item: any) => item.index == rowIndex && item.isDebit == true)
    } else {
      var list = this.ReceiptVoucherAddForm.value.projectTransModelList.filter((item: any) => item.index == rowIndex && item.isDebit == false)
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
          debugger
          if (isDebit == true) {
            var newList = this.ReceiptVoucherAddForm.value.projectTransModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === true));
            newList = [...newList, ...res];
            this.ReceiptVoucherAddForm.get("projectTransModelList")?.setValue(newList);
          }
          else {
            var newList = this.ReceiptVoucherAddForm.value.projectTransModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === false));
            newList = [...newList, ...res];
            this.ReceiptVoucherAddForm.get("projectTransModelList")?.setValue(newList);
          }
          // var newList = this.ReceiptVoucherAddForm.value.projectTransModelList.filter(item => item.index !== rowIndex);
          // newList = [...newList , ...res];
          // this.ReceiptVoucherAddForm.get("projectTransModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  OpenAccountStatementForm(acc: number) {
    if (this.disableAll == true) {
      return;
    }
    this.routePartsService.GuidToEdit = acc;
    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;
    // Open the URL in a new tab
    window.open(url, '_blank');
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
        this.receiptvoucherService.DeleteReceiptVoucher(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['ReceiptVoucher/ReceiptVoucherList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['ReceiptVoucher/ReceiptVoucherList']);
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
    debugger
    if (cheqNumber > 0) {
      this.receiptvoucherService.CheckDeleteStatus(id, cheqNumber).subscribe(result => {
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
    if (this.opType == 'Add' && voucherTypeId != this.SavedTypeId) {
      let pm = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.paymentMethod;
      pm = Array.isArray(pm) ? pm : (pm !== undefined ? [pm] : []);
      if (pm[0] !== null && pm[0] !== undefined) {
        this.ReceiptVoucherAddForm.get("paymentMethod")?.setValue(pm);
      }
      else {
        this.ReceiptVoucherAddForm.get("paymentMethod")?.setValue("");
      }
    }
    this.cdr.detectChanges();
  }

  OnAccountChangeDebit(event : any, row : any, index : number) {
    debugger
    if (row.debit > 0) {
      row.debit = 0;
    }

    var BranchId = this.ReceiptVoucherAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find((r: any) => r.id == event.value)?.text;
    debugger
    if (event.value) {
      this.receiptvoucherService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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
    var BranchId = this.ReceiptVoucherAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find((r: any) => r.id == event.value)?.text;
    debugger
    if (event.value) {
      this.receiptvoucherService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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

    const selectedAccount = this.accountsList.find((account: any) => account.id === event.value);
    if (selectedAccount) {

      for (let i = 0; i < this.creditCardsList.length; i++) {
        this.creditCardsList[i].drawerName = selectedAccount.text.split(' - ')[1] || selectedAccount.text;
      }
    }

     this.AccountName = this.accountsList.find((r: any) => r.id == row.accountId)?.text || "";
     if(this.chequesList.length > 0)
      {
        for (let i = 0; i < this.chequesList.length; i++) {
          if(this.chequesList[i].drawerName == "" || this.chequesList[i].drawerName == null || this.chequesList[i].drawerName == undefined)
            {
              this.chequesList[i].drawerName = this.AccountName;
              this.chequesList[i].accId = row.accountId;
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

  ClearFormData() {
    this.ReceiptVoucherAddForm.get("note")?.setValue("");
    this.ReceiptVoucherAddForm.get("referenceNo")?.setValue("");
    this.ReceiptVoucherAddForm.get("representId")?.setValue(0);
    this.ReceiptVoucherAddForm.get("dealerId")?.setValue(0);
    this.ReceiptVoucherAddForm.get("accVouchersDocModelList")?.setValue([]);
    this.ReceiptVoucherAddForm.get("creditCardModelList")?.setValue([]);
    this.ReceiptVoucherAddForm.get("chequeModelList")?.setValue([]);
    this.ReceiptVoucherAddForm.get("accVouchersDTModelList")?.setValue([]);
    this.ReceiptVoucherAddForm.get("paymentVoucherList")?.setValue([]);
    this.ReceiptVoucherAddForm.get("cliQModelList")?.setValue([]);    
    this.creditAccountsList = [];
    this.debitAccountsList = [];
    this.chequesList = [];
    this.creditCardsList = [];
    this.payBillsList = [];    
    this.TotalDebitValue = 0;
    this.cliqDetails = [];
    this.DiffValue= 0 ;
    this.CliqTotal = 0;
    this.onCliqChanged(this.cliqDetails);
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ReceiptVoucherAddForm.value.voucherTypeId);
    });
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
      let debitTot = this.debitAccountsList.reduce((sum, item) => sum + parseFloat(item.debit), 0);
      let cardsTot = this.creditCardsList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      let chequeTot = this.chequesList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      let tot = debitTot + cardsTot + chequeTot;
      let MainAmount = tot;
      if (MainAmount == null || MainAmount == undefined || isNaN(MainAmount)) {
        amt = this.formatCurrency(parseFloat("0.000"))
        return amt;
      }
      amt = this.formatCurrency(MainAmount - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    }
    return amt;
  }

  formatAmtbills(row: any) {
    debugger
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
    let debitTot = this.debitAccountsList.reduce((sum, item) => sum + parseFloat(item.debit), 0);
    let cardsTot = this.creditCardsList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    let chequeTot = this.chequesList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    let tot = debitTot + cardsTot + chequeTot;
    let totalAmount = tot - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0);

    this.invoicesTotal = totalAmount;
    if (this.invoicesTotal < 0) {
      this.alert.ShowAlert("msgPaidVouchesValueMoreThanMainValue", 'error');
      row.paidAmt = 0;
      return;
    }
  }

  getbills(event : any) {
    debugger
    if (event.value > 0) {
      this.receiptvoucherService.GetServiceInvoices(event.value).subscribe(res => {
        if (res) {
          this.payBillsList = res.paymentVoucherList;
        }
      })
    }
  }

  fillCard(cardId: any, index: number) {
    debugger
    if (cardId > 0) {
      const AccId = this.creditBankList.find((option: any) => option.data1 === cardId)?.data2;
      if (AccId != 0 && AccId != null && AccId != undefined) {
        this.creditCardsList[index].accId = AccId;
      }
      const CardType = this.creditBankList.find((option: any) => option.data1 === cardId)?.data3;
      if (CardType != 0 && CardType != null && CardType != undefined) {
        this.creditCardsList[index].cardTypeId = Number(CardType);
      }
    }
    else {
      this.creditCardsList[index].accId = 0;
      this.creditCardsList[index].cardTypeId = 0;
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

  PrintReciptvoucher(voucherId: number, Balance: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    let User = this.jwtAuth.getUserId();
    if (this.Lang == "ar") {
      const reportUrl = `rptReciptVoucherAR?VId=${voucherId}&Balance=${Balance}&User=${User}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptReciptVoucherEN?VId=${voucherId}&Balance=${Balance}&User=${User}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo: string, VoucherTypeId: number) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.receiptvoucherService.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetInitailReceiptvoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailReceiptvoucher();
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
      this.receiptvoucherService.GetValidVoucherNo(voucherNo,voucherTypeId).subscribe(result => {
        debugger
        if (result !=  null) {
          this.voucherId = result.id;
          this.opType = 'Edit';
          if(result.status == 67)
            {
                this.opType = 'Show';
            }
          this.GetInitailReceiptvoucher();
        }
        else {
          this.voucherId = 0;
          this.opType = 'Add';
          this.clearFormdata(voucherNo);
        }
      });
    } */


  clearFormdata(VoucherNo : string) {
    debugger
    this.newDate = new Date;
    this.ReceiptVoucherAddForm.get("id")?.setValue(0);
    this.ReceiptVoucherAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.ReceiptVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.ReceiptVoucherAddForm.get("branchId")?.setValue(0);
    this.ReceiptVoucherAddForm.get("representId")?.setValue(0);
    this.ReceiptVoucherAddForm.get("currencyId")?.setValue(0);
    this.ReceiptVoucherAddForm.get("currRate")?.setValue(0);
    this.ReceiptVoucherAddForm.get("referenceNo")?.setValue("");
    this.ReceiptVoucherAddForm.get("referenceDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.ReceiptVoucherAddForm.get("note")?.setValue("");
    this.creditAccountsList = [];
    this.debitAccountsList = [];
    this.chequesList = [];
    this.creditCardsList = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ReceiptVoucherAddForm.value.voucherTypeId);
    });
    this.ReceiptVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.ReceiptVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row: any, index: number, type: number) {
    debugger
    if (this.allowAccRepeat == 61) {
      if (type == 1) { //credit accounts
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
      else if (type == 2) { //debit accounts
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
    else {
      if (type == 1) { //credit accounts
        this.creditAccountsList.push(
          {
            accountId: row.accountId,
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
      else if (type == 2) { //debit accounts
        this.debitAccountsList.push(
          {
            accountId: row.accountId,
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

  }

  handleF3Key(event: KeyboardEvent, row: any, index: number, type: number) {

    if (event.key === 'F4') {
      this.CopyRow(row, index, type);
    }
  }

  CheckCheq(row: any, index: number) {
    debugger
    if (row.chequeNo == "" || row.chequeNo == null || row.chequeNo == undefined || row.chequeNo == 0) {
      return false
    }
    for (let i = 0; i < this.chequesList.length; i++) {
      if (this.chequesList[i].chequeNo == row.chequeNo && i != index) {
        if (this.chequesList[i].bankId == row.bankId && i != index) {
          if (this.chequesList[i].accId == row.accId && i != index) {
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

  onCliqChanged(list: any[]) {
    debugger
    this.cliqDetails = list;
    let payment = this.ReceiptVoucherAddForm.value.paymentMethod
    this.calculateSum(5);
         
  }

  OnSaveValidation()
{
  let ok = true ;
  var index = 0;
  debugger;

    if (this.creditAccountsList.length == 0) {
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

    if (this.debitAccountsList.length == 0 && this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(76) !== -1) {
      this.alert.ShowAlert("msgEnterAllDataDebit", 'error');
      ok = false;
      return ok;
    }
    else {
      for (let element of this.debitAccountsList) {
        if (element.accountId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0))) {
          this.alert.ShowAlert("msgEnterAllDataCredit", 'error');
          ok = false;
          return ok;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (this.chequesList.length > 0 && this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(77) == -1) {
      this.alert.ShowAlert("Please Enter Cheq Payment Method", 'error');
      ok = false;
      return ok;
    }

    if (this.creditCardsList.length > 0 && this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(78) == -1) {
      this.alert.ShowAlert("Please Enter CreditCards Payment Method", 'error');
      ok = false;
      return ok;
    }

    if (this.debitAccountsList.length > 0 && (this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(76) == -1 &&  this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(79) == -1)) {
      this.alert.ShowAlert("Please Enter Cash Payment Method", 'error');
      ok = false;
      return ok;
    }

    if (this.chequesList.length == 0 && this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(77) !== -1) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      ok = false;
      return ok;
    }
    else {
      for (let element of this.chequesList) {
        if (element.accountId <= 0 || !this.appCommonserviceService.isValidNumber(element.amount)) {
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


        element.index = index.toString();
        index++;
      }
    }

    if (this.creditCardsList.length == 0 && this.ReceiptVoucherAddForm.value.paymentMethod.indexOf(78) !== -1) {
      this.alert.ShowAlert(this.ReceiptVoucherAddForm.value.paymentMethod, 'error');
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
    if (this.cliqDetails.length > 0 && !this.ReceiptVoucherAddForm.value.paymentMethod.includes(220)) {
      this.alert.ShowAlert("PleaseSelectCliqPaymenMethod", 'error');
      ok = false;
      return ok;
    }    
    else if (this.cliqDetails.length > 0 && this.ReceiptVoucherAddForm.value.paymentMethod.includes(220))
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
    if(this.ReceiptVoucherAddForm.value.paymentMethod.includes(220))
      {
        if(this.cliqDetails.length == 0 || this.cliqDetails == undefined || this.cliqDetails == null)
          { 
            this.alert.ShowAlert("PleaseEnterCliqDetails", 'error');
            ok = false;
            return ok;
          }  
      }

    let paymentMethodArray = this.ReceiptVoucherAddForm.value.paymentMethod;
    if (Array.isArray(paymentMethodArray)) {
      let validPaymentMethods = paymentMethodArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let paymentMethodsString = validPaymentMethods.join(',');
      this.ReceiptVoucherAddForm.get("paymentMethod")?.setValue(paymentMethodsString);
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
        var AccountName = this.accountsList.find((r: any) => r.id == element.accountId)?.text;
        if (this.useCostCenter) {
          if (element.costCenterPolicy == 61) {
            if (this.ReceiptVoucherAddForm.value.costCenterTranModelList.length > 0) {
              let isExist = this.ReceiptVoucherAddForm.value.costCenterTranModelList.filter((r: any) => r.credit > 0 && r.index == i).reduce((sum: number, current: any) => sum + current.credit, 0);
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
            let isExist = this.ReceiptVoucherAddForm.value.costCenterTranModelList.find((r: any) => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
            }
          }
        }
        if (this.UseProjects) {
          if (element.projectPolicy == 61) {
            if (this.ReceiptVoucherAddForm.value.projectTransModelList.length > 0) {
              let isExist = this.ReceiptVoucherAddForm.value.projectTransModelList.filter((r: any) => r.credit > 0 && r.index == i).reduce((sum: number, current: any) => sum + current.credit, 0);
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
            let isExist = this.ReceiptVoucherAddForm.value.projectTransModelList.find((r: any) => r.accountId == element.accountId)
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
        var AccountName = this.accountsList.find((r: any) => r.id == element.accountId)?.text;
        if (this.useCostCenter) {
          if (element.costCenterPolicy == 61) {
            if (this.ReceiptVoucherAddForm.value.costCenterTranModelList.length > 0) {
              const isExist = this.ReceiptVoucherAddForm.value.costCenterTranModelList.filter((r: any) => r.debit > 0 && r.index == i).reduce((sum: number, current: any) => sum + current.debit, 0);
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
            const isExist = this.ReceiptVoucherAddForm.value.costCenterTranModelList.find((r: any) => r.accountId == element.accountId)
            if (!isExist) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
            }
          }
        }
        if (this.UseProjects) {
          if (element.projectPolicy == 61) {
            if (this.ReceiptVoucherAddForm.value.projectTransModelList.length > 0) {
              const isExist = this.ReceiptVoucherAddForm.value.projectTransModelList.filter((r: any) => r.debit > 0 && r.index == i).reduce((sum: number, current: any) => sum + current.debit, 0);
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
            const isExist = this.ReceiptVoucherAddForm.value.projectTransModelList.find((r: any) => r.accountId == element.accountId)
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

  GetDealerInfo(dealerId: number) {
    debugger
    const dealer = this.customerAndSupplierList.find((r: any) => r.id == dealerId);
    if (dealer) {      
      this.DealerAccountId = dealer.data2;
      if(this.DealerAccountId > 0)
        {
          this.AccountName = this.accountsList.find((r: any) => r.id == this.DealerAccountId)?.text || "";
        }
    } else {
      this.AccountName = "";
      this.DealerAccountId = 0;
    }
  }


}




