import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { CustomerReceiptvoucherService } from '../customerreceiptvoucher.service';
import { CostcentertransComponent } from 'app/views/app-account/costcentertrans/costcentertrans.component';
import { ProjectstransComponent } from 'app/views/app-account/projectstrans/projectstrans.component';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';


@Component({
  selector: 'app-customerrecieptvoucher-form',
  templateUrl: './customerrecieptvoucher-form.component.html',
  styleUrls: ['./customerrecieptvoucher-form.component.scss']
})

export class CustomerrecieptvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  custReceiotVoucherAddForm : FormGroup = new FormGroup({});
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
  costcenterList: any;
  projectsList: any;
  voucherId: any;
  paymentTypesList:any;
  voucherType:any;
  paymentMethodList: any;
  bankList: any;
  creditBankList: any;
  statusList: any;
  creditCardsTypes: any;
  customerList: any;
  empList: any;
  paymentTypeList: any;
  medicalNoList: any;
  isHisConnected: boolean = false;
  cheqAmount: number = 0
  cardsAmount: number = 0
  decimalPlaces: number = 0;
  public Amount: any;
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
  AccountNo: any;
  useCostCenter: boolean = false;
  defaultCurrencyId: number = 0;
  hidden: boolean = false;
  invoicesTotal: number = 0;
  allowMultiCurrency:boolean = false;
  disabled:boolean = true;
  dealerInfo:string = "";
  newDate:any;
  medList:any;
  //Customer INFO 
  dealerBalance:any;
  dealerAmt:number = 0;
  dealerChequeAmt:number = 0;
  dealerPolicy:number = 0;
  Balance: any;
  BudgetAmount: number = 0;
  NoteBalance:any;
  NoteAlert:any;
  NotePrevenet:any;
  NoteAlertCheque:any;
  NotePreventCheque:any;
  allowAccRepeat: any;
  showBalance:boolean = false;
  showAlert:boolean = false;
  showPrevent:boolean = false;
  showAlertCheque:boolean = false;
  showPreventCheque:boolean = false;
  //END
  disableCurrRate:boolean = false;
  disableSave:boolean = false;
  disableVouchertype:boolean = false;
  Lang: string = 'en';
  SavedTypeId : any;
  defaultCashAccId:any;
  //Linking Accounts Setting 
  cashAccount:any;
  chequesAccount:any;
  cliqAccount:any;
  cardAccount:any;
  disableCashAccount:boolean = false;
  disableChequeAccount:boolean = false;
  disableCardAccOunt:boolean = false;
  disableCliqAccount:boolean = false;
  disableHis:boolean = false;
  hideMedicalNo:boolean = false;
  midNo:any;
  SelectedMidNo:any;
  restoredMedNo:any;
  disableCustomer:boolean = false;
  DebitTotal:number = 0;
  UseProjects: boolean = false;
  semesterList: any;
  CompanyName: any;
  hideInfo:boolean= false;
  lastAutoPayerName: string = "";
  cliqDetails: any[] = [];
  cliqTypesList : any;
  CliqTotal :number  = 0;
  TotalDebitValue: number = 0;
  DiffValue: number = 0;
  AccountLinkType:number = 0;
  dealerAccountId :number = 0;
  dealerName :string = "";

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private cusReceiptvoucherService: CustomerReceiptvoucherService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.CompanyName = window.localStorage.getItem('companyName');
    if(this.CompanyName != "Noor")
      {
        this.hideInfo = true;
      }
    else
      {
        this.hideInfo = false; 
      }
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
      this.router.navigate(['CustomerReceiptVoucher/CustRecieptvoucherList']);
    }
    this.InitiailCusPaymentVoucherForm();
    this.GetInitailCustPaymentVoucher();

      if (this.opType == "Show") 
        {
          this.disableAll = true;
          this.custReceiotVoucherAddForm.get('costCenterId')?.disable(); 
          //  this.custReceiotVoucherAddForm.get('medicalNo').disable(); 
          // this.custReceiotVoucherAddForm.get('paymentType').disable(); 
        }
      else {
        this.disableAll = false;
        this.custReceiotVoucherAddForm.get('costCenterId')?.enable();   
        // this.custReceiotVoucherAddForm.get('medicalNo').enable(); 
        // this.custReceiotVoucherAddForm.get('paymentType').enable(); 
      }

      if(this.opType == "Edit" || this.opType == "Show")
        {
          this.hideMedicalNo = false;
          this.disableHis = true;
        }
        else
        {
          this.disableHis = false;
          this.hideMedicalNo = true
        }

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustRecieptvoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCusPaymentVoucherForm() {
    this.custReceiotVoucherAddForm = this.formbulider.group({
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
      payerName: [""],
      paymentType:[0],
      medicalNo:[""],
      accVouchersDTModelList: [null],
      costCenterTranModelList: [null],
      projectTransModelList: [null],
      accVouchersDocModelList: [null],
      chequeModelList: [null],
      creditCardModelList: [null],
      generalAttachModelList: [null],
      paymentVoucherList: [null],   
      cliQModelList:[null],
      updatePaymentModel: this.formbulider.group({
      amount: [0],
      clinicRecordNo: [null],
      mYear: [0],
      orderNo: [null],
      patientNo: [0],
      paymentType: [0],
      prescriptionNo: [0],
      receiptNo: [0],
      voucherNo: [null],
      voucherType: [0],
    })
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

    this.cusReceiptvoucherService.GetInitailCustReceiptVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['CustomerReceiptVoucher/CustRecieptvoucherList']);
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
        debitAccId: item.debitAccId,
        paymentMethod: item.paymentMethod,
        cheqAccId: item.cheqAccId,
        bankId: item.bankId,
        defChequeStatus: item.defChequeStatus,
        creditAccId: item.creditAccId,
        printAfterSave: item.printAfterSave,
        cliqAccId: item.cliqAccId,
        cardAccId:item.cardAccId
      }));
      this.paymentTypesList = result.paymentTypesList;
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
      this.custReceiotVoucherAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.paymentMethodList = result.paymentMethodList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;
      debugger
      this.paymentTypeList = result.paymentTypeList;  
      this.isHisConnected = result.isHisConnected;
      this.cashAccount = result.cashAccount;
      this.cliqAccount = result.cliqAccount;
      this.chequesAccount = result.chequesAccount;
      this.cheqAcc = this.chequesAccount;
      this.cardAccount = result.cardAccount;
      this.semesterList = result.semesterList;
      this.cliqTypesList = result.cliqTypesList;
      this.AccountLinkType = result.accLinkType;
      if(this.chequesAccount > 0)
        {
          this.disableChequeAccount = true; 
        }
      if(this.cardAccount > 0)
        {
          this.disableCardAccOunt = true; 
        }
      this.custReceiotVoucherAddForm.get("accVouchersDocModelList")?.setValue(result.accVouchersDocModelList);
      this.custReceiotVoucherAddForm.get("costCenterTranModelList")?.setValue(result.costCenterTranModelList);
      this.custReceiotVoucherAddForm.get("projectTransModelList")?.setValue(result.projectTransModelList);
      this.debitAccountsList = result.accVouchersDTModelList.filter((x: any) => x.debit > 0 && x.cheqId == null && x.creditCardId == null);
      this.creditAccountsList = result.accVouchersDTModelList.filter((x: any) => x.credit > 0 && x.cheqId == null && x.creditCardId == null);
      if (result.paymentVoucherList != 0 && result.paymentVoucherList.length > 0) {
        this.payBillsList = result.paymentVoucherList
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
      if (result.accVouchersDocModelList !== null && result.accVouchersDocModelList.length !== 0 && result.accVouchersDocModelList !== undefined) {
        this.custReceiotVoucherAddForm.get("generalAttachModelList")?.setValue(result.accVouchersDocModelList);
        this.childAttachment.data = result.accVouchersDocModelList;
        this.childAttachment.ngOnInit();
      }
      if(this.opType == 'Edit')
        {
          this.disableVouchertype= true;
          // this.disableHis= true;
          // this.custReceiotVoucherAddForm.get('medicalNo').disable(); 
          // this.custReceiotVoucherAddForm.get('paymentType').disable(); 
        }
        debugger
        
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.disableSave = false;
        if (this.voucherId > 0) {
          this.restoredMedNo = result.medicalNo;
          var pm = result.paymentMethod.split(',').map(Number)
          this.custReceiotVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.custReceiotVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          this.custReceiotVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue(pm);
          this.SavedTypeId= pm;
          this.custReceiotVoucherAddForm.get("customerId")?.setValue(result.customerId);
          this.custReceiotVoucherAddForm.get("amount")?.setValue(result.amount);
          this.custReceiotVoucherAddForm.get("cashAccId")?.setValue(result.cashAccId);
          this.custReceiotVoucherAddForm.get("representId")?.setValue(result.representId);
          this.custReceiotVoucherAddForm.get("note")?.setValue(result.note);
          this.custReceiotVoucherAddForm.get("paymentType")?.setValue(result.paymentType);
          debugger
          this.custReceiotVoucherAddForm.get("medicalNo")?.setValue(result.medicalNo);
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency:any) => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.custReceiotVoucherAddForm.get("currencyId")?.setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche:any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.custReceiotVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }
          this.dealerInfo = result.dealerName;
          // if(result.paymentType > 0)
          // {
          //   this.getMedicalNoListOnEdit(result.paymentType);
          // }
          this.SelectedMidNo = result.medicalNo;
          if(this.custReceiotVoucherAddForm.value.paymentType == 10 || this.custReceiotVoucherAddForm.value.paymentType == -1 )
          {
            this.disableCustomer = false;
          }
          else
          {
            this.disableCustomer = true;
          }
        }
        else {
          this.custReceiotVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          
          if (result.paymentMethod !== null && result.paymentMethod !== undefined) {
            this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue(result.paymentMethod);
          }
          else {
            this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue("");
          }
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find((currency:any) => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.custReceiotVoucherAddForm.get("currencyId")?.setValue(defaultCurrency.id);
            this.custReceiotVoucherAddForm.get("currRate")?.setValue(defaultCurrency.data1);
          }
          let voucherType = this.voucherTypeList.find((r:any) => r.isDefault == true)?.label ?? 0;
          if (voucherType != null && voucherType != undefined && voucherType > 0) {
            this.custReceiotVoucherAddForm.get("voucherTypeId")?.setValue(voucherType);
            this.getVoucherNo(this.custReceiotVoucherAddForm.value.voucherTypeId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find((branche:any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.custReceiotVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          }
          if (this.custReceiotVoucherAddForm.value.currencyId == 0) {
            this.custReceiotVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find((option:any) => option.id === this.defaultCurrencyId)?.data1;
            this.custReceiotVoucherAddForm.get("currRate")?.setValue(currRate);
          }
          
          if(result.representId == null || result.representId == undefined)
            {
              result.representId = 0;
              this.custReceiotVoucherAddForm.get("representId")?.setValue(result.representId);
            }
          
          if(result.cashAccId == null || result.cashAccId == undefined)
            {
              result.cashAccId = 0;
              this.custReceiotVoucherAddForm.get("cashAccId")?.setValue(result.cashAccId);
            }
            
          if(result.costCenterId == null || result.costCenterId == undefined)
            {
              result.costCenterId = 0;
              this.custReceiotVoucherAddForm.get("costCenterId")?.setValue(result.costCenterId);
            }   
            this.dealerInfo = "";  
            this.custReceiotVoucherAddForm.get("paymentType")?.setValue(-1);                
        }            
        this.GetVoucherTypeSetting(this.custReceiotVoucherAddForm.value.voucherTypeId)
        if(this.custReceiotVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
    debugger;    
    this.custReceiotVoucherAddForm.get("accVouchersDTModelList")?.setValue([]);
    this.custReceiotVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.custReceiotVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.custReceiotVoucherAddForm.value.voucherNo = this.custReceiotVoucherAddForm.value.voucherNo.toString();    
    this.custReceiotVoucherAddForm.get("accVouchersDTModelList")?.setValue(this.debitAccountsList);
    this.custReceiotVoucherAddForm.get("accVouchersDTModelList")?.setValue([...this.custReceiotVoucherAddForm.value.accVouchersDTModelList, ...this.creditAccountsList])
    this.custReceiotVoucherAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.custReceiotVoucherAddForm.get("paymentVoucherList")?.setValue(this.payBillsList);
    this.custReceiotVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList);
    this.custReceiotVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
    this.custReceiotVoucherAddForm.get("cliQModelList")?.setValue(this.cliqDetails);
    debugger
    if(this.SelectedMidNo != undefined && this.SelectedMidNo != null && this.SelectedMidNo != "" &&  this.opType == "Add")      
      {
        // this.custReceiotVoucherAddForm.get("medicalNo").setValue(this.SelectedMidNo);
        this.fillUpdatePaymentModel();
        // let id = this.medicalNoList.find(r => r.id == this.custReceiotVoucherAddForm.value.medicalNo)
        // if(id != null || id != undefined)
        //   {
        //     this.custReceiotVoucherAddForm.get("medicalNo").setValue(id.text);
        //   }
      }
      else if (this.opType == "Add")
        {
          this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: 0,
            voucherNo:"",
            orderNo:"",
            prescriptionNo:0,
            patientNo: 0,
            amount: 0,
            mYear: 0,
            clinicRecordNo:"",
            receiptNo:0,
            voucherType: 0,
          }
        });

      }

    else
      {
          let payment = this.custReceiotVoucherAddForm.value.paymentType;
          let amount = Number(this.custReceiotVoucherAddForm.value.amount) || 0;
          amount = Number(amount.toFixed(3));
        this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: payment || 0,
            voucherNo:this.SelectedMidNo,
            orderNo:"",
            prescriptionNo:0,
            patientNo: 0,
            amount: amount,
            mYear: 0,
            clinicRecordNo:"",
            receiptNo:0,
            voucherType: 0,
          }
        });

      }

    
    this.cusReceiptvoucherService.SaveCustReceiptVoucher(this.custReceiotVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
/*           if(result.message != "" && result.message != null && result.message != undefined)
            {                
              this.alert.ShowAlert(result.message, 'error');
              this.disableSave = false;
              return;
            } */

          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option:any) => option.label === this.custReceiotVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintCustomerReciptvoucher(Number(result.message));
          }
          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['CustomerReceiptVoucher/CustRecieptvoucherList']);
            }
            this.voucherId = 0;
            this.opType = 'Add';
            this.ClearFormData();
            this.ngOnInit();
        }
        else if(!result.isSuccess && result.message==="NexionDataUpdateFailed")
          {
            this.alert.ShowAlert("NexionDataUpdateFailed", 'error');
            this.disableSave = false;
            return;
          }        
        else{
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    let serialType = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.serialType;
    let currencyId = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.currencyId;
    let branchId = this.voucherTypeList.find((option: any) => option.label === selectedValue)?.branchId;
    let voucherCategory = this.custReceiotVoucherAddForm.value.voucherTypeEnum;
    let voucherTypeId = this.custReceiotVoucherAddForm.value.voucherTypeId;
    let date = new Date(this.custReceiotVoucherAddForm.value.voucherDate);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    debugger;
    if (voucherTypeId > 0) {
      this.cusReceiptvoucherService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.custReceiotVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.custReceiotVoucherAddForm.get("voucherNo")?.setValue(1);
        }        
      });
    }
    if(branchId == null || branchId == undefined)
      {
        branchId = 0;
        this.custReceiotVoucherAddForm.get("branchId")?.setValue(branchId);
      }
      else
      {
       this.custReceiotVoucherAddForm.get("branchId")?.setValue(branchId); 
      }
    
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.decimalPlaces = this.currencyList.find((option: any) => option.id === currencyId)?.data2;
    }
    else {
      this.decimalPlaces = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data2;
    }
    
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.custReceiotVoucherAddForm.get("currencyId")?.setValue(currencyId);
        var currRate = this.currencyList.find((option: any) => option.id === currencyId)?.data1;
        this.custReceiotVoucherAddForm.get("currRate")?.setValue(currRate);
        if(this.custReceiotVoucherAddForm.value.currencyId == this.defaultCurrencyId)
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
        this.custReceiotVoucherAddForm.get("currencyId")?.setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find((option: any) => option.id === this.defaultCurrencyId)?.data1;
        this.custReceiotVoucherAddForm.get("currRate")?.setValue(currRate);
        if(this.custReceiotVoucherAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
      }
      this.GetVoucherTypeSetting(voucherTypeId);
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find((option: any) => option.id === selectedValue)?.data1;
    this.decimalPlaces = this.currencyList.find((option: any) => option.id === selectedValue)?.data2;
    this.custReceiotVoucherAddForm.get("currRate")?.setValue(currRate);        
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

  formatAmt(row: any, type: number) {
    
    if (type == 0)
      row.amount = Number(row.amount).toFixed(this.decimalPlaces);


    if (this.custReceiotVoucherAddForm.value.paymentMethod.indexOf(77) !== -1) 
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



    else if (type == 1)
      row.amount = row.amount.toFixed(this.decimalPlaces);

    this.payBillsList.forEach(element => {
      element.paidAmt = 0      
    });
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
    let debitTot = this.debitAccountsList.reduce((sum, item) => sum + parseFloat(item.debit), 0);
    let tot = debitTot;
    let totalAmount = tot - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0);

    this.invoicesTotal = totalAmount; // if invoicesTotal is a number
    // let formattedInvoicesTotal = this.formatCurrency(totalAmount); // formatted string for display

    // this.invoicesTotal = this.formatCurrency(parseFloat(this.custReceiotVoucherAddForm.value.amount) - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    if (this.invoicesTotal < 0) {
      this.alert.ShowAlert("msgPaidVouchesValueMoreThanMainValue", 'error');
      row.paidAmt = 0;
      return;
    }
  }

  claculateAmount() {    
    var amount = parseFloat(this.custReceiotVoucherAddForm.value.amount);
    this.custReceiotVoucherAddForm.value.amount = amount.toFixed(this.decimalPlaces);
    this.Amount = this.custReceiotVoucherAddForm.value.amount;
    if (this.payBillsList.length > 0) {
      this.payBillsList.forEach(element => {
        element.paidAmt = 0;
      });

    }
    debugger
     this.custReceiotVoucherAddForm.patchValue({
      updatePaymentModel: {
      paymentType: this.custReceiotVoucherAddForm.value.medicalNo,
      // ...
      amount: amount,   // 👈 safe integer
      // ...
    }
  });
  }

  AddNewLine(grid: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (grid == 2) { //debit accounts
      this.debitAccountsList.push(
        {
          accountId:this.cashAccount,
          paymentType: 0,
          semesterId: 0,
          debit: "",
          note: "",
          costcenterList: null,
          projectsList: null,
          accountBudgetPolicy: 0,
          costCenterPolicy: 0,
          projectPolicy: 0,
          index: "",
        });
    }
    else if (grid == 3) { //cheques
      this.chequesList.push(
        {
          chequeAccId: this.cheqAcc ?? 0,
          chequeNo: "",
          dueDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
          bankId: this.bankId ?? 0,
          amount: "",
          drawerName: this.dealerName ?? "",
          chequeStatus: this.cheqStatus ?? 0,
          accId: this.dealerAccountId == 0 ? this.AccountNo : this.dealerAccountId ,
        });        
    }
    else if (grid == 4) { //credit cards
      this.creditCardsList.push(
        {
          cardNo:0,
          accId:this.cardAccount,
          paymentDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
          amount: "",
          drawerName: "",
          cardTypeId: 0
        });
    }
  }

  calculateSum(type: number) {
    var amt;
    if (type == 2) {
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
    
    //  $('#diff').val((this.custReceiotVoucherAddForm.value.amount - this.DebitTotal - this.cheqAmount - this.cardsAmount).toFixed(3))    
    // if (this.custReceiotVoucherAddForm.value.paymentMethod !== null) {
    //   if (this.custReceiotVoucherAddForm.value.paymentMethod.indexOf(76) !== -1 || this.custReceiotVoucherAddForm.value.paymentMethod.indexOf(220) !== -1) {
    //     $('#diff').val((Number(this.custReceiotVoucherAddForm.value.amount) - this.DebitTotal - this.cheqAmount - this.cardsAmount).toFixed(3))
    //   }
    //   else {
    //     $('#diff').val((this.custReceiotVoucherAddForm.value.amount - this.DebitTotal - this.cheqAmount - this.cardsAmount).toFixed(3))
    //   }
    // }
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
          this.custReceiotVoucherAddForm.get("chequeModelList")?.setValue(this.chequesList);
        }        
      else if (grid == 4)
        {
          this.creditCardsList.splice(rowIndex, 1);
          this.custReceiotVoucherAddForm.get("creditCardModelList")?.setValue(this.creditCardsList); 
        }        
    }
  }

  isEmpty(input: string | null) {
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
   if (grid == 2) {
      const newRow =
      {
        accountId: 0,
        paymentType: 0,
        debit: "",
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
    else if (grid == 3) {
      const newRow =
      {
        chequeAccId: this.cheqAcc ?? 0,
        chequeNo: "",
        dueDate: formatDate(new Date(), "yyyy-MM-dd", "en-US"),
        bankId: this.bankId ?? 0,
        amount: 0,
        drawerName: this.dealerName ?? "",
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
        this.cusReceiptvoucherService.DeleteCustReceiptVoucher(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['CustomerReceiptVoucher/CustRecieptvoucherList']);
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
    
    this.cusReceiptvoucherService.CheckDeleteStatus(id, cheqNumber).subscribe(result => {
      
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
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeBranch;
    this.AccountNo = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.creditAccId ?? 0;
    if(this.AccountNo > 0)
    {
     this.dealerName = this.accountsList.find((option: any) => option.id === this.AccountNo)?.text ?? "";
    }
    this.bankId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.bankId;
    this.cheqStatus = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.defChequeStatus;
    if (this.opType == 'Add' && voucherTypeId != this.SavedTypeId) {
      let pm = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.paymentMethod;
      pm = Array.isArray(pm) ? pm : (pm !== undefined ? [pm] : []);
      if (pm[0] !== null && pm[0] !== undefined) {
        this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue(pm);
      }
      else {
        this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue("");
      }
    }    
    debugger  
    if(this.AccountLinkType == 290)
      {
        const cashAccId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.debitAccId;
        const cardAccId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.cardAccId;
        const cheqAccId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.cheqAccId;
        const cliqAccId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.cliqAccId;
        if(cashAccId != null && cashAccId != undefined && cashAccId != 0)
          {            
            this.cashAccount = cashAccId;
            this.disableCashAccount = true;
          }
        if(cardAccId != null && cardAccId != undefined && cardAccId != 0)
          {
            this.cardAccount = cardAccId;
            this.disableCardAccOunt = true;
          }
        if(cheqAccId != null && cheqAccId != undefined && cheqAccId != 0)
          {
            this.cheqAcc = cheqAccId;
            this.disableChequeAccount = true;
          }
        if(cliqAccId != null && cliqAccId != undefined && cliqAccId != 0)
          {
            this.cliqAccount = cliqAccId;
            this.disableCliqAccount = true;
          }        
      }    
    this.cdr.detectChanges();
  }

  getbills(event: any) {
    debugger
    if (event.value > 0) {
      this.cusReceiptvoucherService.GetPaymentBills(event.value).subscribe(result => {
        debugger
        if (result) {
          
          this.payBillsList = result.paymentVoucherList;
          this.dealerInfo = result.dealerName;
          this.cdr.detectChanges();
        }
      })
      }
    else
      {
          this.custReceiotVoucherAddForm.get("payerName")?.setValue("");
          this.dealerInfo = "";
      }

    if (event.value > 0) 
      
      {
        this.cusReceiptvoucherService.GetDealerInfo(event.value).subscribe(res => {
debugger
     let dealer = this.customerList.find((r: any) => r.id == event.value);
     let dealerName = "";

     if (dealer?.text) {
         let parts = dealer.text.split('-');
         dealerName = parts.length > 1 ? parts[1].trim() : dealer.text.trim();
      } else {
        dealerName = String(event.value).trim();
      }

    let currentPayer = this.custReceiotVoucherAddForm.get("payerName")?.value;

if (!currentPayer || currentPayer === this.lastAutoPayerName) {
  this.custReceiotVoucherAddForm.get("payerName")?.setValue(dealerName);
  this.lastAutoPayerName = dealerName;
}


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
              
              if(this.custReceiotVoucherAddForm.value.cashAmount != "" && Number(this.custReceiotVoucherAddForm.value.cashAmount) >0)
                {                  
                  this.cashAmountBlur(this.custReceiotVoucherAddForm.value.cashAmount);
                  for (let i = 0; i < this.chequesList.length; i++) {
                    const element = this.chequesList[i];
                    this.formatAmt(element,0);
                    element.i = i.toString();
                  }
                }
            }
        })
      }
    else
        {
          this.dealerInfo = "";
          this.custReceiotVoucherAddForm.get("payerName")?.setValue("");
      }     
  }

  onPaymentMethodChange(event:any)
  {
    if(event.value)
      {
        if(this.custReceiotVoucherAddForm.value.amount != "" && Number(this.custReceiotVoucherAddForm.value.amount) >0)
          {                  
            this.cashAmountBlur(this.custReceiotVoucherAddForm.value.cashAmount);
            for (let i = 0; i < this.chequesList.length; i++) {
              const element = this.chequesList[i];
              this.formatAmt(element,0);
              element.i = i.toString();
            }
          }
          // if (this.custReceiotVoucherAddForm.value.paymentMethod.indexOf(76) !== -1 && this.cashAccount > 0) 
          //   {
          //     if(this.cashAccount  !== 0 || this.cashAccount !== undefined || this.cashAccount  !== null)
          //       {
          //         this.custReceiotVoucherAddForm.get("cashAccId").setValue(this.cashAccount);
          //         this.disableCashAccount = true;
          //       } 
          //   }
            // else
            // {
            //       if(this.defaultCashAccId == 0 || this.defaultCashAccId == null || this.defaultCashAccId == undefined)
            //         {
            //           this.defaultCashAccId =0;
            //         }
            //       this.custReceiotVoucherAddForm.get("cashAccId").setValue(this.defaultCashAccId); 
            //       this.disableCashAccount = false;
            // }
      }
  }

  cashAmountBlur(amount: string | number)
  {
    
    if (this.custReceiotVoucherAddForm.value.paymentMethod.indexOf(76) !== -1) 
      {
        if(amount + this.dealerBalance > this.dealerAmt && this.custReceiotVoucherAddForm.value.customerId > 0)
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
                  this.custReceiotVoucherAddForm.get("cashAmount")?.setValue(0);
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
      let debitTot = this.debitAccountsList.reduce((sum, item) => sum + parseFloat(item.debit), 0);
      let tot = debitTot ;
      let MainAmount = tot;
      if (MainAmount == null || MainAmount == undefined || isNaN(MainAmount)) {
        amt = this.formatCurrency(parseFloat("0.000"))
        return amt;
      }
      amt = this.formatCurrency(MainAmount - this.payBillsList.reduce((sum, item) => sum + parseFloat(item.paidAmt), 0));
    }
    return amt;
  }

  ClearFormData()
  {
    this.creditAccountsList = [];
    this.debitAccountsList = [];
    this.chequesList = [];
    this.creditCardsList = [];
    this.payBillsList = [];
    this.childAttachment.data = [];    
    this.custReceiotVoucherAddForm.get("branchId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("representId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("amount")?.setValue(0);
    // this.custReceiotVoucherAddForm.get("cashAccId")?.setValue(0);
    // this.custReceiotVoucherAddForm.get("cashAmount")?.setValue(0);
    this.custReceiotVoucherAddForm.get("referenceNo")?.setValue("");
    this.custReceiotVoucherAddForm.get("costCenterId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("note")?.setValue("");
    this.custReceiotVoucherAddForm.get("paymentType")?.setValue(-1);
    this.custReceiotVoucherAddForm.get("medicalNo")?.setValue([]);
    this.medicalNoList =[];
    this.medList =[];
    this.custReceiotVoucherAddForm.get("medicalNo")?.setValue("");
    this.cliqDetails = [];
    this.DiffValue= 0 ;
    this.CliqTotal = 0;
    this.onCliqChanged(this.cliqDetails);
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.custReceiotVoucherAddForm.value.voucherTypeId); 
    });
  }

  fillCard(cardId:any , index:number)  
  {
    
    if(this.cardAccount == 0)
      {
        if(cardId > 0)
          {
            const AccId =  this.creditBankList.find((option: any) => option.data1 === cardId).data2;
            if(AccId != 0 && AccId != null && AccId != undefined)
             {
               this.creditCardsList[index].accId = AccId;
             }
             const CardType = this.creditBankList.find((option: any) => option.data1 === cardId).data3;
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

  PrintCustomerReciptvoucher(voucherId: number) {
    const Balance = this.custReceiotVoucherAddForm.get('amount')?.value;
    this.Lang = this.jwtAuth.getLang();
    let User = this.jwtAuth.getUserId();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptCustomerReciptvoucherAR?VId=${voucherId}&Balance=${Balance}&User=${User}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptCustomerReciptvoucherEN?VId=${voucherId}&Balance=${Balance}&User=${User}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo: string, VoucherTypeId: number)
  {
    
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.cusReceiptvoucherService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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

  clearFormdata(VoucherNo: string)
  {    
    this.newDate = new Date;
    this.custReceiotVoucherAddForm.get("id")?.setValue(0);
    this.custReceiotVoucherAddForm.get("voucherNo")?.setValue(VoucherNo);
    this.custReceiotVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue("");
    this.custReceiotVoucherAddForm.get("currencyId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("currRate")?.setValue(0);
    this.custReceiotVoucherAddForm.get("branchId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("representId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
    this.dealerInfo = '';
    this.custReceiotVoucherAddForm.get("referenceNo")?.setValue("");
    this.custReceiotVoucherAddForm.get("referenceDate")?.setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.custReceiotVoucherAddForm.get("amount")?.setValue("");
    // this.custReceiotVoucherAddForm.get("cashAccId").setValue("");
    // this.custReceiotVoucherAddForm.get("cashAmount").setValue("");
    this.custReceiotVoucherAddForm.get("note")?.setValue("");
    this.chequesList = [];
    this.payBillsList = [];
   this.creditCardsList = [];
     setTimeout(() => {
      this.GetVoucherTypeSetting(this.custReceiotVoucherAddForm.value.voucherTypeId);
    });
    this.custReceiotVoucherAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.custReceiotVoucherAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row:any, index:number, type:number)
  {
    if (type == 2) { //debit accounts
          this.debitAccountsList.push(
            {
              accountId: 0,
              paymentType: row.paymentType,
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
      this.CopyRow(row,index ,type);
    }
  }

  CheckCheq(row:any, index:number)
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

  getMedicalNoList(event: any) {
    debugger    
    this.custReceiotVoucherAddForm.get("medicalNo")?.setValue(-1);
    this.SelectedMidNo = -1;
    this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
    this.custReceiotVoucherAddForm.get("amount")?.setValue(0);
    this.custReceiotVoucherAddForm.get("payerName")?.setValue("");    
    this.dealerInfo = "";
    const selectedValue = event.value;
    if(selectedValue == 10 || selectedValue == 20 || selectedValue == -1 )
      {
        this.disableCustomer = false;
      }
      else
        {
          this.disableCustomer = true;
        }
      this.cusReceiptvoucherService.GetHisVouchers(selectedValue).subscribe((result) => {
        debugger;
        if (result.hisVouchers.length > 1) {
          this.medicalNoList = result.hisVouchers;
          this.medList = result.hISVouchersModels;
          this.custReceiotVoucherAddForm.get("medicalNo")?.setValue(-1);
          this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
        } else {
          this.medicalNoList = [];
          this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
        }
      });  
      debugger
      if(selectedValue == 20)
        {
          this.customerList = this.customerList.filter((r:any) => Number(r.data5) == 3 || r.id == 0);
        }
  }

  loadLazyOptions(event: any) {
    let val = this.custReceiotVoucherAddForm.value;
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.medicalNoList) {
        this.medicalNoList = [];
    }

    // Make sure the array is large enough
    while (this.medicalNoList.length < last) {
        this.medicalNoList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.medicalNoList[i] = this.medicalNoList[i];
    }

    this.loading = false;
  }

  UpdateMedNo(event: any) {
    debugger;
    let form = this.custReceiotVoucherAddForm.value;
    // if(form.amount == 0 || form.amount == null || form.amount == undefined)
    //   {
    //     this.alert.ShowAlert("PleaseInsertAmount","error")
    //     return;
    //   }
  if (event.value != -1) {
      let selectedMedNo = this.medicalNoList.find((med: any) => med.id === event.value);
      if (selectedMedNo) {
        this.SelectedMidNo = selectedMedNo.id;
    if(this.custReceiotVoucherAddForm.value.paymentType == 0 || this.custReceiotVoucherAddForm.value.paymentType == 2 || this.custReceiotVoucherAddForm.value.paymentType == 3||this.custReceiotVoucherAddForm.value.paymentType == 4 || this.custReceiotVoucherAddForm.value.paymentType == 5
      ||this.custReceiotVoucherAddForm.value.paymentType == 6||this.custReceiotVoucherAddForm.value.paymentType == 7 || this.custReceiotVoucherAddForm.value.paymentType == 8 || this.custReceiotVoucherAddForm.value.paymentType == 9 || this.custReceiotVoucherAddForm.value.paymentType == 11
      ||this.custReceiotVoucherAddForm.value.paymentType == 12 || this.custReceiotVoucherAddForm.value.paymentType == 15
      )
      {
        let medd = this.medList.find((med: any) => med.id === event.value);
        if(this.custReceiotVoucherAddForm.value.paymentType == 6 && Number(medd.desc5) === -1)
          {
            medd.desc5= 1;
          }
        this.custReceiotVoucherAddForm.get("medicalNo")?.setValue(medd.desc1);
        let DealerId = this.customerList.find((r: any) => r.data1 == Number(medd.desc5))?.id ?? "";
        if(DealerId > 0)
          {
            this.custReceiotVoucherAddForm.get("customerId")?.setValue(DealerId);
            let DealerName = this.customerList.find((r: any) => r.id == DealerId)?.text ?? "";
            this.custReceiotVoucherAddForm.get("payerName")?.setValue(DealerName);
          }
        else
          {
            this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
             this.custReceiotVoucherAddForm.get("payerName")?.setValue("");
          }
        if(Number(medd.desc5) > 0)
          {
            this.cusReceiptvoucherService.GetPaymentBills(DealerId).subscribe(result => {
              if (result) {
                
                this.payBillsList = result.paymentVoucherList;
                this.dealerInfo = result.dealerName;
                this.cdr.detectChanges();
              }
            })
          }        
      }
    else if(this.custReceiotVoucherAddForm.value.paymentType == 1 || this.custReceiotVoucherAddForm.value.paymentType == 14 || this.custReceiotVoucherAddForm.value.paymentType == 16 || this.custReceiotVoucherAddForm.value.paymentType == 17 || this.custReceiotVoucherAddForm.value.paymentType == 18 || this.custReceiotVoucherAddForm.value.paymentType == 19)
      {
        let medd = this.medList.find((med: any) => med.id === event.value);
        this.custReceiotVoucherAddForm.get("medicalNo")?.setValue(medd.desc2);
        let DealerId = this.customerList.find((r: any) => r.data1 == Number(medd.desc5))?.id ?? "";
        if(DealerId > 0)
          {
            this.custReceiotVoucherAddForm.get("customerId")?.setValue(DealerId);
            let DealerName = this.customerList.find((r: any) => r.id == DealerId)?.text ?? "";
            this.custReceiotVoucherAddForm.get("payerName")?.setValue(DealerName);
          }
        else
          {
            this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
             this.custReceiotVoucherAddForm.get("payerName")?.setValue("");
          }
        
         if(Number(medd.desc5) > 0)
          {
            this.cusReceiptvoucherService.GetPaymentBills(DealerId).subscribe(result => {
              if (result) {
                
                this.payBillsList = result.paymentVoucherList;
                this.dealerInfo = result.dealerName;
                this.cdr.detectChanges();
              }
            })
          }    
      }          
    else 
      {
        this.custReceiotVoucherAddForm.get("medicalNo")?.setValue(0);
        this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
        this.dealerInfo = "";
      }
     debugger
    if(this.custReceiotVoucherAddForm.value.paymentType == 0 || this.custReceiotVoucherAddForm.value.paymentType == 2 || this.custReceiotVoucherAddForm.value.paymentType == 3 || this.custReceiotVoucherAddForm.value.paymentType == 4 || this.custReceiotVoucherAddForm.value.paymentType == 5 || this.custReceiotVoucherAddForm.value.paymentType == 6 || this.custReceiotVoucherAddForm.value.paymentType == 12)
      {
         let medd = this.medList.find((med: any) => med.id === event.value);
         medd.desc6 = Number(medd.desc6);
         this.custReceiotVoucherAddForm.get("amount")?.setValue(medd.desc6);
      }
    else
      {
         this.custReceiotVoucherAddForm.get("amount")?.setValue(0);
      }

    }
  }
  else
    {
      this.custReceiotVoucherAddForm.get("customerId")?.setValue(0);
      this.custReceiotVoucherAddForm.get("payerName")?.setValue("");
      this.custReceiotVoucherAddForm.get("amount")?.setValue(0);
      this.dealerInfo = "";

    }
    this.fillUpdatePaymentModel();
  }

  fillUpdatePaymentModel() {
    debugger
    // let amount = parseInt(this.custReceiotVoucherAddForm.value.amount, 10) || 0;
    let amount = Number(this.custReceiotVoucherAddForm.value.amount) || 0;

    // round to 3 decimal places
    amount = Number(amount.toFixed(3));
      if(this.custReceiotVoucherAddForm.value.paymentType == 0 || this.custReceiotVoucherAddForm.value.paymentType == 7 || this.custReceiotVoucherAddForm.value.paymentType == 9 || this.custReceiotVoucherAddForm.value.paymentType == 10 || this.custReceiotVoucherAddForm.value.paymentType == 13 || this.custReceiotVoucherAddForm.value.paymentType == 14)      
      {
          this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: this.custReceiotVoucherAddForm.value.paymentType,
            voucherNo:"",
            orderNo:"",
            prescriptionNo:0,
            patientNo: 0,
            amount: amount,
            mYear: 0,
            clinicRecordNo:"",
            receiptNo:0,
            voucherType: this.custReceiotVoucherAddForm.value.voucherTypeId,                        
          }
        });
      }
      if(this.custReceiotVoucherAddForm.value.paymentType == 1)      
      {
        let orderNo="";
          let item = this.medList.find((r: any) => r.desc2 == this.custReceiotVoucherAddForm.value.medicalNo)
          if(item != null)
            {
               orderNo = item.desc2;
            }
          this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: this.custReceiotVoucherAddForm.value.paymentType,
            voucherNo:"",
            orderNo:orderNo,
            prescriptionNo:0,
            patientNo: 0,
            amount: amount,
            mYear: 0,
            clinicRecordNo:"",
            receiptNo:0,
            voucherType: this.custReceiotVoucherAddForm.value.voucherTypeId,                        
          }
        });
      }
      else if(this.custReceiotVoucherAddForm.value.paymentType == 2)
        {         
          this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: this.custReceiotVoucherAddForm.value.paymentType,
            voucherNo:"",
            orderNo:"",
            prescriptionNo:0,
            patientNo: 0,
            amount: amount,
            mYear: 0,
            clinicRecordNo:"",
            receiptNo:0,
            voucherType: this.custReceiotVoucherAddForm.value.voucherTypeId,                        
          }
        });

      }
      else if(this.custReceiotVoucherAddForm.value.paymentType == 3 || this.custReceiotVoucherAddForm.value.paymentType == 4 || this.custReceiotVoucherAddForm.value.paymentType == 5 || this.custReceiotVoucherAddForm.value.paymentType == 8 || this.custReceiotVoucherAddForm.value.paymentType == 12 || this.custReceiotVoucherAddForm.value.paymentType == 15)
        {         
          let VoucherNo="";
          let item = this.medList.find((r: any) => r.desc1 == this.custReceiotVoucherAddForm.value.medicalNo)
          if(item != null)
            {
               VoucherNo = item.desc1;
            }
          this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: this.custReceiotVoucherAddForm.value.paymentType,
            voucherNo:VoucherNo,
            orderNo:"",
            prescriptionNo:0,
            patientNo: 0,
            amount: amount,
            mYear: 0,
            clinicRecordNo:"",
            receiptNo:0,
            voucherType: this.custReceiotVoucherAddForm.value.voucherTypeId,                        
          }
        });

      }
      else if(this.custReceiotVoucherAddForm.value.paymentType == 6 ||this.custReceiotVoucherAddForm.value.paymentType == 11)
        {   
          this.newDate = new Date();
          let PrescriptionNo=0;   
          let Myear = this.newDate.getFullYear();
          let ReceiptNo = this.custReceiotVoucherAddForm.value.voucherNo;
          let item = this.medList.find((r: any) => r.desc1 == this.custReceiotVoucherAddForm.value.medicalNo)
          if(item != null)
            {
               PrescriptionNo = parseInt(item.desc1, 10) || 0;
            }   
          this.custReceiotVoucherAddForm.patchValue({
          updatePaymentModel: {
            paymentType: this.custReceiotVoucherAddForm.value.paymentType,
            voucherNo:"",
            orderNo:"",
            prescriptionNo:PrescriptionNo,
            patientNo: 0,
            amount: amount,
            mYear: Myear,
            clinicRecordNo:"",
            receiptNo:ReceiptNo,
            voucherType: this.custReceiotVoucherAddForm.value.voucherTypeId,                        
          }
        });

      }
 
  }

  getMedicalNoListOnEdit(MedNo: any) {
    debugger 
    const selectedValue = MedNo;    
      // this.cusReceiptvoucherService.GetHisVouchers(selectedValue).subscribe((result) => {
      //   debugger;
      //   if (result.hisVouchers.length > 0) {
      //     this.medicalNoList = result.hisVouchers;
      //     this.medList = result.hISVouchersModels;
      //     if(this.medList.length == 0)
      //       {
      //         this.SelectedMidNo =this.restoredMedNo;
      //       }

      //       else
      //         {
      //           if(this.custReceiotVoucherAddForm.value.paymentType == 0 || this.custReceiotVoucherAddForm.value.paymentType == 2 || this.custReceiotVoucherAddForm.value.paymentType == 3||this.custReceiotVoucherAddForm.value.paymentType == 4 || this.custReceiotVoucherAddForm.value.paymentType == 5
      //           ||this.custReceiotVoucherAddForm.value.paymentType == 6||this.custReceiotVoucherAddForm.value.paymentType == 7 || this.custReceiotVoucherAddForm.value.paymentType == 8 || this.custReceiotVoucherAddForm.value.paymentType == 9 || this.custReceiotVoucherAddForm.value.paymentType == 11
      //           ||this.custReceiotVoucherAddForm.value.paymentType == 12 || this.custReceiotVoucherAddForm.value.paymentType == 15
      //             )
      //             {
      //               let medds = this.medList.find(r => r.desc1 == this.custReceiotVoucherAddForm.value.medicalNo)
      //                 if(medds != null && medds != undefined)
      //                   {             
      //                     let id = this.medicalNoList.find(r => r.id == medds.id)
      //                     if(id != null || id != undefined)
      //                     {
      //                       this.SelectedMidNo = this.medicalNoList.find(r => r.id == medds.id)?.text  ?? "";
      //                       this.custReceiotVoucherAddForm.patchValue({
      //                           updatePaymentModel: {
      //                           paymentType: id.id,
      //                         }
      //                       });
      //                       this.midNo = id.id;
      //                     }
      //                   else
      //                     {
      //                       let id = this.medicalNoList.find(r => r.id == Number(this.custReceiotVoucherAddForm.value.medicalNo))
      //                       if(id != null && id != undefined)
      //                         {
      //                             this.midNo = id.id;
      //                         }
      //                     }
                          
      //                   }   
                    
      //             }
      //             else if(this.custReceiotVoucherAddForm.value.paymentType == 1 || this.custReceiotVoucherAddForm.value.paymentType == 14 || this.custReceiotVoucherAddForm.value.paymentType == 16 || this.custReceiotVoucherAddForm.value.paymentType == 17 || this.custReceiotVoucherAddForm.value.paymentType == 18 || this.custReceiotVoucherAddForm.value.paymentType == 19)
      //             {
      //               let medds = this.medList.find(r => r.desc2 == this.custReceiotVoucherAddForm.value.medicalNo)
      //                 if(medds != null && medds != undefined)
      //                   {             
      //                     let id = this.medicalNoList.find(r => r.id == medds.id)
      //                     if(id != null || id != undefined)
      //                     {
      //                       this.SelectedMidNo = this.medicalNoList.find(r => r.id == medds.id)?.text  ?? "";
      //                       this.custReceiotVoucherAddForm.patchValue({
      //                           updatePaymentModel: {
      //                           paymentType: id.id,
      //                         }
      //                       });
      //                       this.midNo = id.id;
      //                     }
      //                   else
      //                     {
      //                       let id = this.medicalNoList.find(r => r.id == Number(this.custReceiotVoucherAddForm.value.medicalNo))
      //                       if(id != null && id != undefined)
      //                         {
      //                             this.midNo = id.id;
      //                         }
      //                     }
                          
      //                   }   
      //             }
      //         }
          
                                    
      //   } else {
      //     this.medicalNoList = [];
      //   }
      // });     
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

  loadLazyAccountss(event: any) {
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

  OnAccountChangeDebit(event:any, row:any, index:number) {
    debugger
    if (row.debit > 0) {
      row.debit = 0;
    }

    var BranchId = this.custReceiotVoucherAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    var AccountName = this.accountsList.find((r: any) => r.id == event.value)?.text;
    debugger
    if (event.value) {
      this.cusReceiptvoucherService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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

  OpenCostcenterTransForm(row: any, rowIndex: number, isDebit: boolean) {
    debugger
    if (row.debit == null || row.debit == undefined) {
      row.debit = 0;
    }
    if (row.credit == null || row.credit == undefined) {
      row.credit = 0;
    }
    if (isDebit) {
      var list = this.custReceiotVoucherAddForm.value.costCenterTranModelList.filter((item: any) => item.index == rowIndex && item.isDebit == true);
    } else {
      var list = this.custReceiotVoucherAddForm.value.costCenterTranModelList.filter((item: any) => item.index == rowIndex && item.isDebit == false);
    }
    var accName = this.accountsList.find((option: any) => option.id === row.accountId)?.text;
    let title = this.translateService.instant('Constcenters');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CostcentertransComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, accName: accName, debit: row.debit, credit: row.credit, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId(), costcenterList: this.costcenterList, transList: list, branchId: this.custReceiotVoucherAddForm.value.branchId }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          if (isDebit == true) {
            var newList = this.custReceiotVoucherAddForm.value.costCenterTranModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === true));
            newList = [...newList, ...res];
            this.custReceiotVoucherAddForm.get("costCenterTranModelList")?.setValue(newList);
          }
          else {
            var newList = this.custReceiotVoucherAddForm.value.costCenterTranModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === false));
            newList = [...newList, ...res];
            this.custReceiotVoucherAddForm.get("costCenterTranModelList")?.setValue(newList);
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
      var list = this.custReceiotVoucherAddForm.value.projectTransModelList.filter((item: any) => item.index == rowIndex && item.isDebit == true)
    } else {
      var list = this.custReceiotVoucherAddForm.value.projectTransModelList.filter((item: any) => item.index == rowIndex && item.isDebit == false)
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
            var newList = this.custReceiotVoucherAddForm.value.projectTransModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === true));
            newList = [...newList, ...res];
            this.custReceiotVoucherAddForm.get("projectTransModelList")?.setValue(newList);
          }
          else {
            var newList = this.custReceiotVoucherAddForm.value.projectTransModelList.filter((item: any) => !(item.index === rowIndex && item.isDebit === false));
            newList = [...newList, ...res];
            this.custReceiotVoucherAddForm.get("projectTransModelList")?.setValue(newList);
          }
          // var newList = this.ReceiptVoucherAddForm.value.projectTransModelList.filter(item => item.index !== rowIndex);
          // newList = [...newList , ...res];
          // this.ReceiptVoucherAddForm.get("projectTransModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }
  
  calculateDifference(): number {
    const amount = this.custReceiotVoucherAddForm.value.amount || 0;
    return +(amount - this.DebitTotal - this.cheqAmount - this.cardsAmount - this.CliqTotal).toFixed(3);
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

  onCliqChanged(list:any) {
    debugger
    this.cliqDetails = list;
    let payment = this.custReceiotVoucherAddForm.value.paymentMethod
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
    if (this.debitAccountsList.length == 0 && this.custReceiotVoucherAddForm.value.paymentMethod.includes(76)) {
      this.alert.ShowAlert("msgPleaseInsertAtLeastOneRowInCashTable", 'error');
      stopExecution = false;
      return stopExecution;
    }
    else {
      for (let element of this.debitAccountsList) {
        if (element.accountId <= 0 || ((element.debit === '' || element.debit === null || element.debit <= 0))) {
          this.alert.ShowAlert("msgEnterAllDataCash", 'error');
          stopExecution = false;
          return stopExecution;
        }
        element.index = index.toString();
        index++;
      }
    }

    if (this.debitAccountsList.length > 0 && !this.custReceiotVoucherAddForm.value.paymentMethod.includes(76)) {
      this.alert.ShowAlert("Please Enter Cash Payment Method", 'error');
      stopExecution = false;
      return stopExecution;
    }



    if (this.custReceiotVoucherAddForm.value.paymentMethod.includes(77) && this.chequesList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (!this.custReceiotVoucherAddForm.value.paymentMethod.includes(77)  && this.chequesList.length !== 0) {
      this.alert.ShowAlert("msgEnterPaymentMethodCheques", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (this.custReceiotVoucherAddForm.value.paymentMethod.includes(78)  && this.creditCardsList.length == 0) {
      this.alert.ShowAlert("msgEnterAllDataCards", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (!this.custReceiotVoucherAddForm.value.paymentMethod.includes(78)  && this.creditCardsList.length !== 0) {
      this.alert.ShowAlert("msgEnterPaymentMethodCards", 'error');
      stopExecution = false;
      return stopExecution;
    }

    if (this.chequesList.length == 0 && this.custReceiotVoucherAddForm.value.paymentMethod.includes(77)) {
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
    if (this.creditCardsList.length == 0 && this.custReceiotVoucherAddForm.value.paymentMethod.includes(78)) {
      this.alert.ShowAlert(this.custReceiotVoucherAddForm.value.paymentMethod, 'error');
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
    if (this.custReceiotVoucherAddForm.value.paymentMethod.includes(77)) {
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
    if (this.custReceiotVoucherAddForm.value.paymentMethod.includes(78)) {
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

    
    debugger
    if(this.opType == "Add")
      {
        if(this.medicalNoList !== "" && this.medicalNoList != null && this.medicalNoList != undefined)
        {
          if(this.custReceiotVoucherAddForm.value.paymentType >= 0 && this.custReceiotVoucherAddForm.value.paymentType != 10)
            {
              if(this.custReceiotVoucherAddForm.value.medicalNo === null || this.custReceiotVoucherAddForm.value.medicalNo === undefined || this.custReceiotVoucherAddForm.value.medicalNo === "")
                {
                  this.alert.ShowAlert("msgEnterMedicalNo", 'error');
                  this.disableSave = false;
                  return false;
                }
            }
        }

      }
   
        //Debit CostCenter Validation
    for (let i = 0; i < this.creditAccountsList.length; i++) {
      const element = this.creditAccountsList[i];
      if (element.accountId > 0) {
        const AccountName = this.accountsList.find((r: any) => r.id == element.accountId)?.text;
        if(this.useCostCenter)
          {
            if (element.costCenterPolicy == 61) {
              if (this.custReceiotVoucherAddForm.value.costCenterTranModelList.length > 0) {
                const isExist = this.custReceiotVoucherAddForm.value.costCenterTranModelList.filter((r: any) => r.credit > 0 && r.index == i).reduce((sum: number, current: any) => sum + current.credit, 0);
                if (isExist == 0) {
                  this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
                  stopExecution = false;
                  return stopExecution;
                }
              }
              else {
                this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
                stopExecution = false;
                return stopExecution;
              }
    
            }
            else if (element.costCenterPolicy == 60) {
              const isExist = this.custReceiotVoucherAddForm.value.costCenterTranModelList.find((r: any) => r.accountId == element.accountId);
              if (!isExist) {
                this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
              }
            }
          }      
        if(this.UseProjects)
          {
            if (element.projectPolicy == 61) {
              if (this.custReceiotVoucherAddForm.value.projectTransModelList.length > 0) {
                const isExist = this.custReceiotVoucherAddForm.value.projectTransModelList.filter((r: any) => r.credit > 0 && r.index == i).reduce((sum: number, current: any) => sum + current.credit, 0);
                if (isExist == 0) {
                  this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
                  stopExecution = false;
                  return stopExecution;
                }
              }
              else {
                this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
                stopExecution = false;
                return stopExecution;
              }
    
            }
            else if (element.projectPolicy == 60) {
              const isExist = this.custReceiotVoucherAddForm.value.projectTransModelList.find((r: any) => r.accountId == element.accountId);
              if (!isExist) {
                this.alert.ShowAlert4Fields("msgYouMustEnterprojectPolicy", " : ", AccountName, 'error');
              }
            }
          }        
      }
      element.i = i.toString();
    }

    if (this.cliqDetails.length > 0 && !this.custReceiotVoucherAddForm.value.paymentMethod.includes(220)) {
      this.alert.ShowAlert("PleaseSelectCliqPaymenMethod", 'error');
       stopExecution = false;
       return stopExecution;
    }    
    else if (this.cliqDetails.length > 0 && this.custReceiotVoucherAddForm.value.paymentMethod.includes(220))
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
    if(this.custReceiotVoucherAddForm.value.paymentMethod.includes(220))
      {
        if(this.cliqDetails.length == 0 || this.cliqDetails == undefined || this.cliqDetails == null)
          { 
            this.alert.ShowAlert("PleaseEnterCliqDetails", 'error');
            stopExecution = false;
            return stopExecution;
          }  
      }
    const diff = this.calculateDifference();
    if (diff !== 0) {
      this.alert.ShowAlert("msgUnbalancedDebitCredit", 'error');
      this.disableSave = false;
      return false;
    }
        
    for (let element of this.chequesList) {
      element.chequeNo = element.chequeNo.toString();
    }

    let paymentMethodArray = this.custReceiotVoucherAddForm.value.paymentMethod;
    if (Array.isArray(paymentMethodArray)) {
      let validPaymentMethods = paymentMethodArray
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let paymentMethodsString = validPaymentMethods.join(',');
      this.custReceiotVoucherAddForm.get("paymentMethod")?.setValue(paymentMethodsString);
      console.log('Filtered paymentMethod:', paymentMethodsString);
    } else {
      console.error('paymentMethod is not an array');
    }
    
    return stopExecution;      
  }
  // openEditPayerModal() {
  //   const currentName = this.custReceiotVoucherAddForm.get('payerName').value;
  //   Swal.fire({
  //     title: this.translateService.instant('PayerName'),
  //     input: 'text',
  //     inputValue: currentName,
  //     showCancelButton: true,
  //     confirmButtonText: this.translateService.instant('Save'),
      
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.custReceiotVoucherAddForm.patchValue({ payerName: result.value });
  //       // هنا يمكنك استدعاء API الحفظ مباشرة إذا أردت
  //     }
  //   });
  // }
  openEditPayerModal() {
    const currentName = this.custReceiotVoucherAddForm.get('payerName')?.value || '';
    const recordId = this.custReceiotVoucherAddForm.get('id')?.value;

    Swal.fire({
      title: this.translateService.instant('PayerName'),
      input: 'text',
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Save'),
      showLoaderOnConfirm: true,
      preConfirm: async (newName) => {
        try {
          const response = await firstValueFrom(this.cusReceiptvoucherService.updatePayerName(recordId, newName));
          if (response === true) {
            return newName; 
          } else {
            throw new Error('Update Failed');
          }
        } catch (error) {
          Swal.showValidationMessage(this.translateService.instant('Error updating name'));
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.custReceiotVoucherAddForm.patchValue({ payerName: result.value });
        
        Swal.fire({
          icon: 'success',
          title: this.translateService.instant('Saved Successfully'),
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
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
