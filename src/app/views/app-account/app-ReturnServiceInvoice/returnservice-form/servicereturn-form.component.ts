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
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { ReturnInvoiceService } from '../returnserviceinvoice.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-servicereturn-form',
  templateUrl: './servicereturn-form.component.html',
  styleUrls: ['./servicereturn-form.component.scss']
})
export class ServicereturnFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  ServiceInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  accountsList: any;
  currencyList: any;
  accVouchersDTsList: any[] = [];
  voucherTypeList: any;
  branchesList: any;
  costCenterPolicyList: any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  serviceInvHd: any;
  serviceInvDT: any;
  pricewTax: number;
  isCash: number;
  fDiscount: any;
  fTotalGridNet: any;
  disableAll: boolean = false;
  // serviceInvDtList: any;
  taxlist: any;
  employeeList: any;
  pDtermsList: any;
  servicesList: any;
  costCenterList: any;
  voucherId: any;
  voucherType: any;
  isInputDisabled: boolean = true;
  servicesInvDTList: any[] = [];
  discountAmt: number = 0;
  netTotal: number;
  taxAmount: number;
  taxPerc: number;
  allowedDiscount: number = 0;
  fTotal: any;
  fTaxTotal: any;
  fNetTotal: any;
  accountId: number = 0;
  pDTerm: number = 0;
  custName: string = '';
  decimalPlaces: number;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean;
  UseProjects: boolean;
  UseTax: boolean;
  servicesinvoicesList: any;
  defaultCurrencyId: number;
  // BudgetEdit
  NoteBalance: any;
  NoteAlert: any;
  NotePrevenet: any;
  showBalance: boolean;
  showAlert: boolean;
  showPrevent: boolean;
  Balance: any;
  BudgetAmount: number;
  allowAccRepeat: any;
  disableCurrRate: boolean;
  Lang: string;
  disableSave: boolean;
  disableVouchertype: boolean = false;
  newDate: any;
  showsave: boolean;
  showIsSimplified: boolean;
  isSimplified: number = 0;
  debitAcc: number;
  creditAcc: number;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private services: ReturnInvoiceService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
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
    this.route.queryParams.subscribe((params: Params) => {
      this.voucherNo = +params['voucher'];
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
      this.router.navigate(['ReturnServiceInvoice/ReturnServiceInvoiceList']);
    }

    this.InitiailEntryVoucherForm();
    this.GetInitailOpeningBalance();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReturnServiceInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.ServiceInvoiceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      isCanceled: [false],
      isPosted: [false],
      mainInvoiceId: [0],
      note: [""],
      branchId: [null],
      amount: [0],
      status: [null],
      userId: [0],
      referenceNo: [""],
      referenceDate: [""],
      representId: [0],
      simplified: [false],
      returnReason: [""],
      accVouchersDTModelList: [null],
      servicesInvHD: [null],
      servicesInvDTs: [null, [Validators.required, Validators.minLength(1)]],
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

  GetInitailOpeningBalance() {
    var lang = this.jwtAuth.getLang();
    this.services.GetInitailServiceInvoice(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ReturnServiceInvoice/ReturnServiceInvoiceList']);
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
        creditAccountId: item.creditAccId,
        debitAccountId: item.debitAccId,
        allowAccRepeat: item.allowAccRepeat,
        printAfterSave: item.printAfterSave
      }));
      this.servicesinvoicesList = result.serviceInvoicesList.map((item) => ({
        label: item.id,
        value: item.custName,
      }));
      if (result.servicesInvHD.priceWithTax) {
        this.pricewTax = 1;
      }
      else {
        this.pricewTax = 0;
      }
      if (result.servicesInvHD.isCash) {
        this.isCash = 1;
      }
      else {
        this.isCash = 0;
      }
      if (result.servicesInvHD.simplified) {
        this.isSimplified = 1;
      }
      else {
        this.isSimplified = 0;
      }
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      this.ServiceInvoiceAddForm.value.servicesInvHD = result.servicesInvHD;
      this.pDtermsList = result.pdTermsModelList;
      this.costCenterList = result.costCenterList;
      this.servicesList = result.serviceInfoModelList;
      this.employeeList = result.employeeModelList;
      this.taxlist = result.taxModelList;
      this.showIsSimplified = result.showIsSimplefid;
      debugger
      if (result.servicesInvDTs != null)
        this.servicesInvDTList = result.servicesInvDTs;
      this.ServiceInvoiceAddForm.value.servicesInvDTs = result.servicesInvDTs;
      this.ServiceInvoiceAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.custName = result.servicesInvHD.custName;
      this.allowedDiscount = result.servicesInvHD.discount;
      this.defaultCurrencyId = result.defaultCurrency;
      this.ServiceInvoiceAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      this.childAttachment.data = result.accVouchersDocModelList;
      this.childAttachment.ngOnInit();
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.voucherId > 0) {
          this.accountId = result.servicesInvHD.accountId;
          this.pDTerm = result.servicesInvHD.pdterm;
          this.UseTax = result.useTax;
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;

          this.ServiceInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ServiceInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          this.ServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.ServiceInvoiceAddForm.get("representId").setValue(result.representId);
          this.ServiceInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ServiceInvoiceAddForm.get("mainInvoiceId").setValue(result.servicesInvHD.mainInvoiceId);
          this.ServiceInvoiceAddForm.get("returnReason").setValue(result.servicesInvHD.returnReason);
          this.onCheckboxChange(0, 0, 0);
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          this.UseTax = result.useTax;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.ServiceInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          debugger
          this.ServiceInvoiceAddForm.get("representId").setValue(0);
          this.ServiceInvoiceAddForm.get("currencyId").setValue(result.defaultCurrency);
          this.ServiceInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          const currRate = result.currencyList?.find(option => option.id === result.defaultCurrency)?.data1 ?? null;
          this.ServiceInvoiceAddForm.get("currRate").setValue(currRate);
          this.useCostCenter = result.useCostCenter;
          this.UseProjects = result.useProjects;
          this.UseTax = result.useTax;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.ServiceInvoiceAddForm.get("currencyId").setValue(result.defaultCurrency);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ServiceInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          const defaultVoucher = result.voucherTypeList?.find(option => option.isDefault === true)?.id ?? null;
          this.ServiceInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
        }
        this.GetVoucherTypeSetting(this.ServiceInvoiceAddForm.value.voucherTypeId)
        if (this.ServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })
  }

  getAccountNo(event: any) {
    debugger
    const selectedAccount = this.accountsList.find(account => account.id === event.value);
    if (selectedAccount) {
      this.custName = selectedAccount.text.split(' - ')[1] || selectedAccount.text;
    }
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;

       if (this.servicesInvDTList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
        stopExecution = true;
      return;
    }


    this.servicesInvDTList.forEach(element => {
      debugger
      if (((element.qty === '' || element.qty === null || element.qty <= 0) || (element.price === '' || element.price === null || element.price <= 0)
        || (element.serviceDescr === '' || element.serviceDescr === null) || (element.accountId === '' || element.accountId === null || element.accountId <= 0)
      )) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    });
    for (let i = 0; i < this.servicesInvDTList.length; i++) {
      debugger
      const element = this.servicesInvDTList[i];
      if (element.accountId > 0) {
        var AccountName = this.accountsList.find(r => r.id == element.accountId).text;
        if (this.useCostCenter) {
          if (element.costCenterId == 0 || element.costCenterId == null || element.costCenterId == undefined) {
            if (element.costCenterPolicy == 61) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
              stopExecution = true;
              this.disableSave = false;
              return false;
            }

            else if (element.costCenterPolicy == 60) {
              this.alert.ShowAlert4Fields("msgYouMustEnterCostCenter", " : ", AccountName, 'error');
            }
          }
        }
      }
    }
    if (this.accountId == 0 || this.accountId == null || this.accountId == undefined) {
      this.alert.ShowAlert("PleaseEnterDebitAccount", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }
    if (stopExecution) {
      return;
    }
    this.ServiceInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ServiceInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.ServiceInvoiceAddForm.value.voucherNo = this.ServiceInvoiceAddForm.value.voucherNo.toString();
    this.ServiceInvoiceAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;
    this.ServiceInvoiceAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.ServiceInvoiceAddForm.value.servicesInvDTs = this.servicesInvDTList;
    this.ServiceInvoiceAddForm.value.servicesInvHD.discount = this.allowedDiscount;
    this.ServiceInvoiceAddForm.value.servicesInvHD.custName = this.custName
    this.ServiceInvoiceAddForm.value.servicesInvHD.accountId = this.accountId
    this.ServiceInvoiceAddForm.value.servicesInvHD.pdterm = this.pDTerm
    if (this.pricewTax == 1) {
      this.ServiceInvoiceAddForm.value.servicesInvHD.priceWithTax = true;
    }
    else {
      this.ServiceInvoiceAddForm.value.servicesInvHD.priceWithTax = false;
    }

    if (this.isCash == 1) {
      this.ServiceInvoiceAddForm.value.servicesInvHD.isCash = true;
    }
    else {
      this.ServiceInvoiceAddForm.value.servicesInvHD.isCash = false;
    }
    if (this.isSimplified == 1) {
      this.ServiceInvoiceAddForm.get("simplified").setValue(true);
    }
    else {
      this.ServiceInvoiceAddForm.get("simplified").setValue(false);
    }
    this.ServiceInvoiceAddForm.get("amount").setValue(Number(this.fNetTotal));
    this.services.SaveServiceInvoice(this.ServiceInvoiceAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.ServiceInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintRetServiceInvoice(Number(result.message));
          }

          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ReturnServiceInvoice/ReturnServiceInvoiceList']);
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
    if (this.opType == "Add") {
      this.servicesInvDTList = [];
      this.ServiceInvoiceAddForm.get("accVouchersDTModelList").setValue(this.servicesInvDTList)
    }
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.ServiceInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.ServiceInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.ServiceInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    this.creditAcc = this.voucherTypeList.find(option => option.label === selectedValue)?.creditAccountId ?? 0;
    this.debitAcc = this.voucherTypeList.find(option => option.label === selectedValue)?.debitAccountId ?? 0;
    if (voucherTypeId > 0) {
      this.services.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.ServiceInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.ServiceInvoiceAddForm.get("voucherNo").setValue(1);
        }
        this.accountId = this.debitAcc;

        if (this.accountId != null) {
          const selectedAccount = this.accountsList.find(account => account.id === this.accountId);
          if (selectedAccount) {
            this.custName = selectedAccount.text.split(' - ')[1] || selectedAccount.text;
          }
        }
        else {
          this.custName = "";
        }
        if (currencyId != 0 && currencyId != null && currencyId != undefined) {
          this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
        }
        else {
          this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
        }
        if (branchId != 0 && branchId != undefined && branchId! + null) {
          this.ServiceInvoiceAddForm.get("branchId").setValue(branchId);
        }
      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.ServiceInvoiceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.ServiceInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.ServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.ServiceInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.ServiceInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.ServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.ServiceInvoiceAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.servicesInvDTList.push(
      {
        serviceId: 0,
        note: "",
        qty: "",
        price: "",
        total: 0,
        accountId: this.creditAcc,
        costCenterId: 0,
        taxId: 0,
        taxPerc: 0,
        serviceDescr: "",
        discount: "",
        accNameDtl: "",
        taxAmt: 0,
        netTotal: 0,
        discountAmt: 0,
        accountBudgetPolicy: 0,
        costCenterPolicy: 0,
        index: ""
      });
    const creditAccIds = this.voucherTypeList.map(item => item.creditAccId);
    if (creditAccIds.length > 0) {
      this.servicesInvDTList.forEach((row, index) => {
        if (this.servicesInvDTList[index].accountId > 0) {
          if (index < creditAccIds.length && creditAccIds[index] != 0) {
            // Call OnAccountChange with the current index and row
            this.OnAccountChange(row.accountId, row, index);
          }
        }
      });
    }
    this.ServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
  }

  deleteRow(rowIndex: number) {
    if (this.disableAll == true) {
      return;
    }
    if (rowIndex !== -1) {
      this.servicesInvDTList.splice(rowIndex, 1);
    }
    this.ServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.onCheckboxChange(0, 0, 0)
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isOneEmpty(row: any) {
    if ((row.serviceId === '' || row.serviceId === null) && (row.qty === '' || row.qty === null || row.qty <= 0) && (row.price === '' || row.price === null || row.price <= 0)
      && (row.total === '' || row.total === null || row.total <= 0) && (row.serviceDescr === '' || row.serviceDescr === null)
    ) {
      return true;
    }
    else {
      return false;
    }
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

  onAddRowBefore(rowIndex: number) {
    if (this.disableAll == true) {
      return;
    }
    const newRow =
    {
      serviceId: 0,
      note: "",
      qty: "",
      price: "",
      total: 0,
      accountId: this.creditAcc,
      costCenterId: 0,
      taxId: 0,
      taxPerc: 0,
      serviceDescr: "",
      discount: "",
      accNameDtl: "",
      taxAmt: 0,
      netTotal: 0,
      discountAmt: 0,
      accountBudgetPolicy: 0,
      costCenterPolicy: 0,
      index: ""
    };

    this.servicesInvDTList.splice(rowIndex, 0, newRow);
    this.ServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
  }

  onTaxChange(event, i) {
    debugger
    if (event.value > 0) {
      this.onCheckboxChange(0, 0, 0);
    }
    else {
      this.servicesInvDTList[i].taxAmt = 0;
      this.servicesInvDTList[i].taxPerc = 0;
      this.onCheckboxChange(0, 0, 0);
    }
  }

  calculateValues(i) {
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    if (this.servicesInvDTList.length > 0 && this.servicesInvDTList[i].taxId > 0)
      this.servicesInvDTList[i].taxPerc = this.taxlist.find(option => option.id === this.servicesInvDTList[i].taxId).data1;
    if (this.pricewTax == 1) {
      if (isNaN(this.servicesInvDTList[i].qty) || isNaN(this.servicesInvDTList[i].price)) {
        return;
      }
      this.servicesInvDTList.forEach(element => {
        element.cost = this.servicesInvDTList[i].price;
        element.priceWithTax = element.price;
      });
      // Calculate total
      this.servicesInvDTList[i].total = (Number(this.servicesInvDTList[i].qty) * Number(this.servicesInvDTList[i].price));
      this.servicesInvDTList[i].total = this.servicesInvDTList[i].total.toFixed(this.decimalPlaces);
      // Calculate net total
      if (isNaN(this.servicesInvDTList[i].discount) || isNaN(this.servicesInvDTList[i].total)) {
        this.servicesInvDTList[i].netTotal = this.servicesInvDTList[i].netTotal.toFixed(this.decimalPlaces);
      }
      else {
        this.servicesInvDTList[i].netTotal =
          (Number(this.servicesInvDTList[i].total) - Number(this.servicesInvDTList[i].discountAmt));
        this.servicesInvDTList[i].netTotal = this.servicesInvDTList[i].netTotal.toFixed(this.decimalPlaces);
      }
      // Calculate tax amount
      if (isNaN(this.servicesInvDTList[i].discountAmt)) {
        this.servicesInvDTList[i].taxAmt = (this.servicesInvDTList[i].total / (1 + (this.servicesInvDTList[i].taxPerc / 100)))
        this.servicesInvDTList[i].taxAmt = this.servicesInvDTList[i].taxAmt.toFixed(this.decimalPlaces);
      }
      else if (this.servicesInvDTList[i].taxPerc > 0) {
        this.servicesInvDTList[i].taxAmt = Number(((Number(this.servicesInvDTList[i].total - this.servicesInvDTList[i].discountAmt)) - ((Number(this.servicesInvDTList[i].total - this.servicesInvDTList[i].discountAmt)) / (1 + (this.servicesInvDTList[i].taxPerc / 100)))))
        this.servicesInvDTList[i].taxAmt = this.servicesInvDTList[i].taxAmt.toFixed(this.decimalPlaces);

      }
      else {
        return;
      }
    }
    else {
      if (this.servicesInvDTList[i].price > 0) {
        var price = parseFloat(this.servicesInvDTList[i].price);
        this.servicesInvDTList[i].price = price.toFixed(this.decimalPlaces);
      }
      if (isNaN(this.servicesInvDTList[i].qty) || isNaN(this.servicesInvDTList[i].price)) {
        // Handle invalid input gracefully
        return;
      }
      for (let index = 0; index < this.servicesInvDTList.length; index++) {
        this.servicesInvDTList[index].priceWithTax = Number(this.servicesInvDTList[index].price) +
          (this.servicesInvDTList[index].price * (this.servicesInvDTList[index].taxPerc / 100))
      }
      // Calculate total
      const qty = this.servicesInvDTList[i].qty;
      var total = qty * this.servicesInvDTList[i].price;
      this.servicesInvDTList[i].total = total.toFixed(this.decimalPlaces);
      var taxAmt = parseFloat(this.servicesInvDTList[i].taxAmt);
      this.servicesInvDTList[i].taxAmt = taxAmt.toFixed(this.decimalPlaces);
      var discountAmt = parseFloat(this.servicesInvDTList[i].discountAmt);
      this.servicesInvDTList[i].discountAmt = discountAmt.toFixed(this.decimalPlaces);
      // Calculate net total
      if (isNaN(this.servicesInvDTList[i].discount)) {
        this.servicesInvDTList[i].netTotal =
          (Number(this.servicesInvDTList[i].total) - Number(this.servicesInvDTList[i].taxAmt));
        this.servicesInvDTList[i].netTotal = this.servicesInvDTList[i].netTotal.toFixed(this.decimalPlaces);
      }
      else if (isNaN(this.servicesInvDTList[i].taxAmt)) {
        this.servicesInvDTList[i].netTotal =
          (Number(this.servicesInvDTList[i].total) - (Number(this.servicesInvDTList[i].discountAmt)));
        this.servicesInvDTList[i].netTotal = this.servicesInvDTList[i].netTotal.toFixed(this.decimalPlaces);
      }
      else {
        this.servicesInvDTList[i].netTotal =
          ((Number(this.servicesInvDTList[i].total) + Number(this.servicesInvDTList[i].taxAmt)) - Number(this.servicesInvDTList[i].discountAmt));
        this.servicesInvDTList[i].netTotal = this.servicesInvDTList[i].netTotal.toFixed(this.decimalPlaces);
      }
      // Calculate tax amount
      if (isNaN(this.servicesInvDTList[i].discountAmt)) {
        this.servicesInvDTList[i].taxAmt = ((this.servicesInvDTList[i].taxPerc / 100) * (this.servicesInvDTList[i].total));
        this.servicesInvDTList[i].taxAmt = this.servicesInvDTList[i].taxAmt.toFixed(this.decimalPlaces);
      }
      else if (this.servicesInvDTList[i].taxPerc > 0) {
        this.servicesInvDTList[i].taxAmt = ((this.servicesInvDTList[i].taxPerc / 100) * (this.servicesInvDTList[i].total - this.servicesInvDTList[i].discountAmt));
        this.servicesInvDTList[i].taxAmt = this.servicesInvDTList[i].taxAmt.toFixed(this.decimalPlaces);
      }
      else {
        return;
      }
      this.servicesInvDTList[i].netTotal =
        ((Number(this.servicesInvDTList[i].total) + Number(this.servicesInvDTList[i].taxAmt)) - Number(this.servicesInvDTList[i].discountAmt));
      this.servicesInvDTList[i].netTotal = this.servicesInvDTList[i].netTotal.toFixed(this.decimalPlaces);
    }
  }

  onDiscountChange(i) {
    if (this.servicesInvDTList[i].discount !== null || this.servicesInvDTList[i].discount !== 0) {
      // Calculate the discount percentage based on discountAmt
      if (this.servicesInvDTList[i].total > 0) {
        this.servicesInvDTList[i].discountAmt = (this.servicesInvDTList[i].discount * this.servicesInvDTList[i].total) / 100;
      }
      else {
        this.servicesInvDTList[i].discountAmt = 0
      }
    }
    this.onCheckboxChange(0, 0, 0);
  }

  onDiscountAmtChange(i) {
    if (this.servicesInvDTList[i].discountAmt !== null || this.servicesInvDTList[i].discountAmt !== 0) {
      // Calculate the discount amount based on discount
      if (this.servicesInvDTList[i].total > 0) {
        this.servicesInvDTList[i].discount = (this.servicesInvDTList[i].discountAmt / this.servicesInvDTList[i].total) * 100;
      }
      else {
        this.servicesInvDTList[i].discount = 0
      }
    }
    this.onCheckboxChange(0, 0, 0);
  }

  onCheckboxChange(event, Row, index) {
    var i = 0;
    this.servicesInvDTList.forEach(element => {
      if (this.servicesInvDTList[i].discount !== null || this.servicesInvDTList[i].discount !== 0) {
        if (this.servicesInvDTList[i].total > 0) { this.servicesInvDTList[i].discountAmt = (this.servicesInvDTList[i].discount * this.servicesInvDTList[i].total) / 100; }
      }
      else {
        if (this.servicesInvDTList[i].total > 0) { this.servicesInvDTList[i].discount = (this.servicesInvDTList[i].discountAmt / this.servicesInvDTList[i].total) * 100; }
      }

      this.calculateValues(i);
      i++;
    })
    for (let r = 0; r < this.servicesInvDTList.length; r++) {
      // Format specific numeric fields with three decimal places
      this.fTotal = Number((Number(this.fTotal) + Number(this.servicesInvDTList[r].total)));
      this.fTotal = this.fTotal.toFixed(this.decimalPlaces);

      this.fTotalGridNet = Number((Number(this.fTotalGridNet) + Number(this.servicesInvDTList[r].netTotal)));
      this.fDiscount = Number(parseFloat(this.fDiscount) + parseFloat(this.servicesInvDTList[r].discountAmt));
      this.fDiscount = Number(this.fDiscount).toFixed(this.decimalPlaces);

      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(this.servicesInvDTList[r].taxAmt)));
      this.fTaxTotal = this.fTaxTotal.toFixed(this.decimalPlaces);

      this.fNetTotal = Number((Number(this.fTotalGridNet) - Number(this.allowedDiscount)));
      this.fNetTotal = this.fNetTotal.toFixed(this.decimalPlaces);
    }
    if (Row != 0) {
      this.OnAccountChange(Row.accountId, Row, index);
    }
  }

  onServiceChange(event, row, index) {
    if (this.servicesInvDTList[index].serviceId !== null || this.servicesInvDTList[index].serviceId !== 0) {
      const selectedService = this.servicesList.find(service => service.id === this.servicesInvDTList[index].serviceId);
      this.servicesInvDTList[index].serviceDescr = selectedService.text;
    }

    this.services.GetServiceInfo(event.value).subscribe(res => {
      if (res) {
        debugger
        this.servicesInvDTList[index].price = res.price;

        if (res.accountId != null && res.accountId != undefined && res.accountId != 0) {
          this.servicesInvDTList[index].accountId = res.accountId
        }
        else {
          this.servicesInvDTList[index].accountId = this.creditAcc;
        }

        if (res.taxId != null && res.taxId != undefined && res.taxId != 0) {
          this.servicesInvDTList[index].taxId = res.taxId
        }
        else {
          this.servicesInvDTList[index].taxId = 0;
        }
        this.OnAccountChange(res.accountId, row, index);
      }
    })
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
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
        this.services.DeleteServiceInvoice(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['ReturnServiceInvoice/ReturnServiceInvoiceList']);
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.router.navigate(['ReturnServiceInvoice/ReturnServiceInvoiceList']);
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

  GetPurchaseInvoices(event) {
    debugger
    this.servicesInvDTList = [];
    if (event.value !== null && event.value !== 0 && event.value !== undefined) {
      this.services.GetItemsByServiceInvoice(event.value).subscribe(res => {
        debugger
        if (res) {
          if (res.servicesInvHD.priceWithTax) {
            this.pricewTax = 1;
          }
          else {
            this.pricewTax = 0;
          }
          if (res.servicesInvHD.isCash) {
            this.isCash = 1;
          }
          else {
            this.isCash = 0;
          }
          this.ServiceInvoiceAddForm.get("currencyId").setValue(res.currencyId);
          this.ServiceInvoiceAddForm.get("currRate").setValue(res.currRate);
          this.ServiceInvoiceAddForm.get("branchId").setValue(res.branchId);
          this.ServiceInvoiceAddForm.get("representId").setValue(res.representId);
          this.pDTerm = res.servicesInvHD.pdterm;
          this.custName = res.servicesInvHD.custName;
          this.allowedDiscount = res.servicesInvHD.discount;
          this.accountId = res.accVouchersDTModelList[0].accountId;
          this.servicesInvDTList = [];
          for (let i = 0; i < res.servicesInvDTs.length; i++) {
            // this.AddNewLine();

            this.servicesInvDTList.push(
              {
                serviceId: 0,
                note: "",
                qty: "",
                price: "",
                total: 0,
                accountId: this.creditAcc,
                costCenterId: 0,
                taxId: 0,
                taxPerc: 0,
                serviceDescr: "",
                discount: "",
                accNameDtl: "",
                taxAmt: 0,
                netTotal: 0,
                discountAmt: 0,
                accountBudgetPolicy: 0,
                costCenterPolicy: 0,
                index: ""
              });

            this.ServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);


            this.servicesInvDTList[i].serviceId = res.servicesInvDTs[i].serviceId;
            this.servicesInvDTList[i].note = res.servicesInvDTs[i].note;
            this.servicesInvDTList[i].qty = res.servicesInvDTs[i].qty;
            this.servicesInvDTList[i].price = res.servicesInvDTs[i].price;
            this.servicesInvDTList[i].total = res.servicesInvDTs[i].total;
            this.servicesInvDTList[i].accountId = res.servicesInvDTs[i].accountId;
            if (res.servicesInvDTs[i].costCenterId == null) {
              this.servicesInvDTList[i].costCenterId = 0;
            }
            else {
              this.servicesInvDTList[i].costCenterId = res.servicesInvDTs[i].costCenterId;
            }
            if (res.servicesInvDTs[i].taxId == null) {
              this.servicesInvDTList[i].taxId = 0;
            }
            else {
              this.servicesInvDTList[i].taxId = res.servicesInvDTs[i].taxId;
            }
            this.servicesInvDTList[i].taxPerc = res.servicesInvDTs[i].taxPerc;
            this.servicesInvDTList[i].serviceDescr = res.servicesInvDTs[i].serviceDescr;
            this.servicesInvDTList[i].discount = res.servicesInvDTs[i].discount;
            this.servicesInvDTList[i].accNameDtl = res.servicesInvDTs[i].accNameDtl;
            this.servicesInvDTList[i].taxAmt = res.servicesInvDTs[i].taxAmt;
          }
          this.onCheckboxChange(0, 0, 0);
        }
      }
      )
    }
    else {
      this.accountId = 0;
      this.custName = "";
      this.fTotal = 0;
      this.allowedDiscount = 0;
      this.fTaxTotal = 0;
      this.fNetTotal = 0;
    }
  }

  OnAccountChange(event, row, index) {
    debugger
    if (row.debit > 0) {
      row.debit = 0;
    }
    if (row.credit > 0) {
      row.credit = 0;
    }
    var BranchId = this.ServiceInvoiceAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    if (event.value != undefined) {
      var AccountName = this.accountsList.find(r => r.id == event.value).text;
    }
    else {
      var AccountName = this.accountsList.find(r => r.id == event).text;
    } debugger
    if (event.value) {
      this.services.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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
          this.servicesInvDTList[index].accountBudgetPolicy = result.budgetPolicy;
          this.servicesInvDTList[index].costCenterPolicy = result.costCenterPolicy;
          if (parseFloat(row.price) > 0) {
            if (parseFloat(row.total) + parseFloat(this.Balance) > this.BudgetAmount) {
              if (result.budgetPolicy == 60) {
                this.showAlert = true;
                this.showBalance = false;
                this.showPrevent = false;
              }
              else if (result.budgetPolicy == 61) {
                this.showPrevent = true;
                this.showAlert = false;
                this.showBalance = false;
                row.price = 0;
                row.total = 0;
              }
            }
          }
          this.hideLabelAfterDelay();
        }
      });
    }
    else if (row.accountId != 0 && row.accountId != null && row.accountId != undefined) {
      this.services.GetAccountInfo(row.accountId, BranchId).subscribe((result) => {
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
          this.servicesInvDTList[index].accountBudgetPolicy = result.budgetPolicy;
          this.servicesInvDTList[index].costCenterPolicy = result.costCenterPolicy;
          if (parseFloat(row.price) > 0) {
            if (parseFloat(row.total) + parseFloat(this.Balance) > this.BudgetAmount) {
              if (result.budgetPolicy == 60) {
                this.showAlert = true;
                this.showBalance = false;
                this.showPrevent = false;
              }
              else if (result.budgetPolicy == 61) {
                this.showPrevent = true;
                this.showAlert = false;
                this.showBalance = false;
                row.price = 0;
                row.total = 0;
              }
            }
          }
          this.hideLabelAfterDelay();
        }
      });
    }

    debugger
    if (event.value > 0) {
      if (this.servicesInvDTList.length > 0) {
        let isDuplicate = false;
        for (let i = 0; i < this.servicesInvDTList.length; i++) {
          if (this.servicesInvDTList[i].accountId == event.value && i != index) {
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
          this.servicesInvDTList[index] = {
            ...this.servicesInvDTList[index],
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
    }, 10000);
  }

  ClearFormData() {
    this.pDTerm = 0;
    this.ServiceInvoiceAddForm.get("representId").setValue(0);
    this.ServiceInvoiceAddForm.get("referenceNo").setValue("");
    this.ServiceInvoiceAddForm.get("note").setValue("");
    this.ServiceInvoiceAddForm.get("returnReason").setValue("");
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ServiceInvoiceAddForm.value.voucherTypeId);
    });
  }

  PrintRetServiceInvoice(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptRetServiceInvoiceAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptRetServiceInvoiceEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo, VoucherTypeId) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.services.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetInitailOpeningBalance();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailOpeningBalance();
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

  clearFormdata(VoucherNo) {
    debugger
    this.newDate = new Date;
    this.ServiceInvoiceAddForm.get("id").setValue(0);
    this.ServiceInvoiceAddForm.get("voucherNo").setValue(VoucherNo);
    this.ServiceInvoiceAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.ServiceInvoiceAddForm.get("branchId").setValue(0);
    this.accountId = 0;
    this.custName = '';
    this.pDTerm = 0;
    this.ServiceInvoiceAddForm.get("currencyId").setValue(0);
    this.ServiceInvoiceAddForm.get("currRate").setValue(0);
    this.ServiceInvoiceAddForm.get("representId").setValue(0);
    this.ServiceInvoiceAddForm.get("referenceNo").setValue("");
    this.ServiceInvoiceAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.ServiceInvoiceAddForm.get("note").setValue("");
    this.isCash = 0;
    this.pricewTax = 0;
    this.servicesInvDTList = [];
    this.ServiceInvoiceAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.ServiceInvoiceAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    this.allowedDiscount = 0;
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ServiceInvoiceAddForm.value.voucherTypeId);
    });
  }

  CopyRow(row, index) {
    debugger
    this.servicesInvDTList.push(
      {
        serviceId: row.serviceId,
        note: row.note,
        qty: row.qty,
        price: row.price,
        total: row.total,
        accountId: row.accountId,
        costCenterId: row.costCenterId,
        taxId: row.taxId,
        taxPerc: row.taxPerc,
        serviceDescr: row.serviceDescr,
        discount: row.discount,
        accNameDtl: row.accNameDtl,
        taxAmt: row.taxAmt,
        netTotal: row.netTotal,
        discountAmt: row.discountAmt,
        accountBudgetPolicy: row.accountBudgetPolicy,
        costCenterPolicy: row.costCenterPolicy,
        index: ""
      });
    this.ServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
    this.onCheckboxChange(0, row, index);
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }
}
