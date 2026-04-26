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
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';
import { serviceInvoiceSalesService } from '../cusServiceSales.service';
import { ActivatedRoute, Params } from '@angular/router';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-custservicesalesinv-form',
  templateUrl: './custservicesalesinv-form.component.html',
  styleUrls: ['./custservicesalesinv-form.component.scss']
})
export class CustservicesalesinvFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  SalesServiceInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  customersList: any;
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
  serviceInvHd: any;
  serviceInvDT: any;
  pricewTax: number;
  isCash: number;
  taxlist: any;
  employeeList: any;
  pDtermsList: any;
  servicesList: any;
  costCenterList: any;
  voucherId: any;
  voucherType:any;
  servicesInvDTList: any[] = [];
  discountAmt: number = 0;
  netTotal: number;
  taxAmount: number;
  taxPerc: number;
  allowedDiscount: number = 0;
  fTotal: any;
  fTaxTotal: any;
  fNetTotal: any;
  dealerId: number = 0;
  pDTerm: number = 0;
  decimalPlaces: number;
  currId: number = 1
  voucherNo: number = 0;
  fDiscount: any;
  fTotalGridNet: any;
  disableAll: boolean = false;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  AccountNo: any;
  useCostCenter: boolean;
  UseTax: boolean;
  defaultCurrencyId: number;
  disableCurrRate:boolean;
  showsave: boolean;
  // BudgetEdit
  NoteBalance: any;
  NoteAlert: any;
  NotePrevenet: any;
  showBalance: boolean;
  showAlert: boolean;
  showPrevent: boolean;
  Balance: any;
  BudgetAmount: number;
  allowMultiCurrency:boolean;
  allowAccRepeat:any;

  //CustomerInfoModel
  dealerBalance:number = 0;
  dealerAmt:number = 0;
  dealerChequeAmt:number = 0;
  dealerPolicy:number = 0;

  NoteDealerBalance:any;
  NoteDealerAlert:any;
  NoteDealerPrevenet:any;
  newDate:any;
  showBalanceDealer:boolean;
  showAlertDealer:boolean;
  showPreventDealer:boolean;
//End 
  disableSave:boolean;
  disableVouchertype:boolean = false;
  Lang: string;
  debitAcc:number = 0;
  creditAcc:number = 0;
  accountId: number = 0;
  custName: string = '';
  MaintId:any;
  FromMaintenance:number = 0;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private saleServiceInvoiceService: serviceInvoiceSalesService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
    this.voucherId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.voucherType ="Accounting";
    this.route.queryParams.subscribe((params: Params) => {
      this.MaintId = +params['MaintId'];
    });

    if (this.MaintId == null || this.MaintId == undefined || this.MaintId === 0 || isNaN(this.MaintId)) {

      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
        this.FromMaintenance = 0;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
        this.FromMaintenance = 0;
      }
    }
    else {
      this.FromMaintenance = 1;
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['ServicesSalesInv/CustServiceSalesInvoiceList']);
    }

    this.InitiailPurServiceInvoiceForm();
    this.GetInitailPurServiceInvoice();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustServiceSalesInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPurServiceInvoiceForm() {
    this.SalesServiceInvoiceAddForm= this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      isCanceled: [false],
      isPosted: [false],
      note: [""],
      branchId: [null],
      amount: [0],
      discount: [0],
      status: [null],
      userId: [0],
      referenceNo: [""],
      referenceDate: [""],
      representId: [0],
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
    return null;
  }

  GetInitailPurServiceInvoice() {
    var lang = this.jwtAuth.getLang();
    this.saleServiceInvoiceService.GetInitailServicesSalesInv(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ServicesSalesInv/CustServiceSalesInvoiceList']);
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
        creditAccId: item.creditAccId,
        debitAccId: item.debitAccId,
        paymentMethod: item.paymentMethod,
        allowAccRepeat : item.allowAccRepeat,
        printAfterSave: item.printAfterSave
      }));

      this.customersList = result.customersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
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
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      //this.customersList = result.customersList;
      this.accountsList = result.accountList;
      this.SalesServiceInvoiceAddForm.value.servicesInvHD = result.servicesInvHD;
      this.pDtermsList = result.pdTermsModelList;
      this.costCenterList = result.costCenterList;
      this.servicesList = result.serviceInfoModelList;
      this.employeeList = result.employeeModelList;
      this.taxlist = result.taxModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      if (result.servicesInvDTs != null)
        this.servicesInvDTList = result.servicesInvDTs;
      this.SalesServiceInvoiceAddForm.value.servicesInvDTs = result.servicesInvDTs;
      this.SalesServiceInvoiceAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.allowedDiscount = result.servicesInvHD.discount;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.SalesServiceInvoiceAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      if (result.accVouchersDocModelList !== null && result.accVouchersDocModelList.length !== 0 && result.accVouchersDocModelList !== undefined) {
        this.SalesServiceInvoiceAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
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
          this.accountId = result.servicesInvHD.accountId;
          this.dealerId = result.servicesInvHD.dealerId;
          this.pDTerm = result.servicesInvHD.pdterm;
          this.MaintId = result.servicesInvHD.maintenanceId;
          this.SalesServiceInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.SalesServiceInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          this.SalesServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.SalesServiceInvoiceAddForm.get("representId").setValue(result.representId);
          this.onCheckboxChange(0, 0, 0);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.SalesServiceInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.SalesServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.SalesServiceInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
          this.SalesServiceInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.SalesServiceInvoiceAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.SalesServiceInvoiceAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.SalesServiceInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (this.SalesServiceInvoiceAddForm.value.currencyId == 0) {
            this.SalesServiceInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.SalesServiceInvoiceAddForm.get("currRate").setValue(currRate);
          }
          if(result.representId == null || result.representId == undefined)
            {
              result.representId =0 ;
              this.SalesServiceInvoiceAddForm.get("representId").setValue(result.representId);
            }
        }
        this.GetVoucherTypeSetting(this.SalesServiceInvoiceAddForm.value.voucherTypeId)
        if(this.SalesServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
        else
          {
            this.disableCurrRate = false;
          }
          debugger
          if(this.FromMaintenance == 1)
            {
              this.SalesServiceInvoiceAddForm.value.servicesInvHD.maintenanceId = this.MaintId
              this.GetMaintenanceInfo(this.MaintId);
            }
      });
    })

  }

  OnSaveForms() {
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    this.servicesInvDTList.forEach(element => {
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
    })

    
    for (let i = 0; i < this.servicesInvDTList.length; i++)
      {
        let IsTaxable = this.customersList.find(x => x.id === this.dealerId).IsTaxable;
        if(IsTaxable == true && this.servicesInvDTList[i].taxId == 0)
        {
          this.alert.ShowAlert("msgMustSelectTaxForDealer", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }

    for (let i = 0; i < this.servicesInvDTList.length; i++) {
      const element = this.servicesInvDTList[i];
      if (element.accountId > 0) {
        let AccountName = this.accountsList.find(r => r.id == element.accountId).text;
        if(this.useCostCenter)
          {
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
    if(this.dealerId == 0 || this.dealerId== null || this.dealerId == undefined)
        {
          this.alert.ShowAlert("msgMustSelectCustomer", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }


    if (stopExecution) {
      return;
    }
    debugger
    this.SalesServiceInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.SalesServiceInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.SalesServiceInvoiceAddForm.value.voucherNo = this.SalesServiceInvoiceAddForm.value.voucherNo.toString();
    this.SalesServiceInvoiceAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;
    this.SalesServiceInvoiceAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.SalesServiceInvoiceAddForm.value.servicesInvDTs = this.servicesInvDTList;
    this.SalesServiceInvoiceAddForm.value.servicesInvHD.discount = this.allowedDiscount;
    this.SalesServiceInvoiceAddForm.value.servicesInvHD.dealerId = this.dealerId
    this.SalesServiceInvoiceAddForm.value.servicesInvHD.pdterm = this.pDTerm
    this.SalesServiceInvoiceAddForm.value.servicesInvHD.accountId = this.accountId
    this.SalesServiceInvoiceAddForm.value.servicesInvHD.maintenanceId = this.MaintId
    if (this.pricewTax == 1) {
      this.SalesServiceInvoiceAddForm.value.servicesInvHD.priceWithTax = true;
    }
    else {
      this.SalesServiceInvoiceAddForm.value.servicesInvHD.priceWithTax = false;
    }

    if (this.isCash == 1) {
      this.SalesServiceInvoiceAddForm.value.servicesInvHD.isCash = true;
    }
    else {
      this.SalesServiceInvoiceAddForm.value.servicesInvHD.isCash = false;
    }
    this.SalesServiceInvoiceAddForm.value.amount = this.fNetTotal;
    this.SalesServiceInvoiceAddForm.value.discount = this.allowedDiscount;
    this.saleServiceInvoiceService.SaveServicesSalesInv(this.SalesServiceInvoiceAddForm.value)
      .subscribe((result) => {  
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.SalesServiceInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintCustservicesalesinv(Number(result.message));
          }

          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['ServicesSalesInv/CustServiceSalesInvoiceList']);
            }
            this.voucherId = 0;
            this.opType = 'Add';
            this.ClearFormData();
            this.ngOnInit()
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
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.SalesServiceInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.SalesServiceInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.SalesServiceInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (voucherTypeId > 0) {
      this.saleServiceInvoiceService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.SalesServiceInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.SalesServiceInvoiceAddForm.get("voucherNo").setValue(1);
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
      });
    }
    if(branchId == null || branchId == undefined)
      {
        branchId= 0;
        this.SalesServiceInvoiceAddForm.get("branchId").setValue(branchId);
      }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
    }
    else {
      this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
    }
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.SalesServiceInvoiceAddForm.get("currencyId").setValue(currencyId);
        var currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.SalesServiceInvoiceAddForm.get("currRate").setValue(currRate);
        if(this.SalesServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId)
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
        this.SalesServiceInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
        let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
        this.SalesServiceInvoiceAddForm.get("currRate").setValue(currRate);
        if(this.SalesServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId)
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
    this.SalesServiceInvoiceAddForm.get("currRate").setValue(currRate);    
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

  AddNewLine() {
    this.servicesInvDTList.push(
      {
        serviceId: 0,
        note: "",
        qty: "",
        price: "",
        total: 0,
        accountId: this.AccountNo,
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
    // const creditAccIds = this.voucherTypeList.map(item => item.creditAccId);
    // if (creditAccIds.length > 0) {
    //   this.servicesInvDTList.forEach((row, index) => {
    //     if(this.servicesInvDTList[index].accountId > 0){

    //     if (index < creditAccIds.length && creditAccIds[index] != 0) {
    //       // Call OnAccountChange with the current index and row
    //       this.OnAccountChange(row.accountId, row, index);
    //     }
    //   }
    //   });
    // }
    this.SalesServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.servicesInvDTList.splice(rowIndex, 1);
    }
    this.SalesServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.onCheckboxChange(0, 0, 0);
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
    const newRow =
    {
      serviceId: 0,
      note: "",
      qty: 0,
      price: 0,
      total: 0,
      accountId: 0,
      costCenterId: 0,
      taxId: 0,
      taxPerc: 0,
      serviceDescr: "",
      discount: 0,
      accNameDtl: "",
      taxAmt: 0,
      netTotal: 0,
      discountAmt: 0,
      index: ""
    };
    this.servicesInvDTList.splice(rowIndex, 0, newRow);
    this.SalesServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
  }

  onTaxChange(event, i) {
    if(event.value > 0)
      {
        this.onCheckboxChange(0, 0, 0);
      }
      else
      {
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
    debugger
    setTimeout(() => {
      debugger
      if (Number(String(this.fNetTotal).replace(/,/g, '')) + Number(this.dealerBalance) > Number(String(this.dealerAmt).replace(/,/g, ''))) {
        if (this.dealerPolicy === 60) 
        {        
          this.showAlertDealer = true;
          this.showPreventDealer = false;
          this.showAlert = false;
          this.showPrevent = false;
          this.showBalance = false;
          this.hideLabelAfterDelayDealer();
          this.cdr.detectChanges();
        } 
        else if (this.dealerPolicy === 61) 
        {
          this.showAlertDealer = false;
          this.showPreventDealer = true; 
          this.showAlert = false;
          this.showPrevent = false;
          this.showBalance = false;
          this.hideLabelAfterDelayDealer();
            for (const element of this.servicesInvDTList) {
                element.qty = 0;
                element.total = 0;
            }
          // this.onCheckboxChange(0, 0, 0);
          this.cdr.detectChanges();
        }
    }
    });
  }

  hideLabelAfterDelayDealer() {
    setTimeout(() => {
      this.showBalanceDealer = false;
      this.showAlertDealer = false;
      this.showPreventDealer = false;
    }, 10000);
  }


  onServiceChange(event, row, index) {
    debugger
    if (this.servicesInvDTList[index].serviceId !== null || this.servicesInvDTList[index].serviceId !== 0) {
      const selectedService = this.servicesList.find(service => service.id === this.servicesInvDTList[index].serviceId);
      if(this.MaintId == 0 || this.MaintId == null || this.MaintId == undefined)
        {
          this.servicesInvDTList[index].serviceDescr = selectedService.text;
        }      
    }

      this.saleServiceInvoiceService.GetServiceInfo(event.value ).subscribe(res => {
        if (res) {
        if(this.MaintId == 0 || this.MaintId == null || this.MaintId == undefined)
          {
            this.servicesInvDTList[index].price = res.price;
          }
          
          if(res.accountId != null && res.accountId != undefined && res.accountId != 0)
          {
            this.servicesInvDTList[index].accountId = res.accountId
          }
          else
          {
            this.servicesInvDTList[index].accountId = this.creditAcc;
          }         
          this.OnAccountChange(res.accountId, row, index);
        }
      })

  }


  DeletePurServiceInvoice(id: any) {
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
        this.saleServiceInvoiceService.DeleteServicesSalesInv(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ServicesSalesInv/CustServiceSalesInvoiceList']);
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

  onCheckboxChange1() {
    var i = 0;
    this.servicesInvDTList.forEach(element => {
      this.calculateValues(i);
      i++;
    })
    for (let r = 0; r < this.servicesInvDTList.length; r++) {
      // Format specific numeric fields with three decimal places
      this.fTotal = Number((Number(this.fTotal) + Number(this.servicesInvDTList[r].netTotal)));
      this.fTotal = this.formatCurrency(this.fTotal);

      this.allowedDiscount = Number(this.allowedDiscount);
      this.allowedDiscount = Number(this.formatCurrency(this.allowedDiscount));

      this.fTaxTotal = Number((Number(this.fTaxTotal) + Number(this.servicesInvDTList[r].taxAmt)));
      this.fTaxTotal = this.formatCurrency(this.fTaxTotal);

      this.fNetTotal = Number((Number(this.fTotal) - (Number(this.allowedDiscount))));
      this.fNetTotal = this.formatCurrency(this.fNetTotal);
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.AccountNo = this.voucherTypeList.find(option => option.label === voucherTypeId)?.creditAccId ?? 0;
    if (this.SalesServiceInvoiceAddForm.value.paymentMethod == null || this.SalesServiceInvoiceAddForm.value.paymentMethod == '' || this.SalesServiceInvoiceAddForm.value.paymentMethod == undefined) {
      var pm = this.voucherTypeList.find(option => option.label === voucherTypeId)?.paymentMethod;

      if (pm != null) {
        pm = Array.isArray(pm) ? pm : (pm !== undefined ? [pm] : []);
        this.SalesServiceInvoiceAddForm.get("paymentMethod").setValue(pm);
      }
    }
    this.cdr.detectChanges();
  }

  OnAccountChange(event, row, index) {
    debugger

    var BranchId = this.SalesServiceInvoiceAddForm.value.branchId;
    if (BranchId == 0 || BranchId == null || BranchId == undefined) {
      BranchId = 0;
    }
    if (event.value != undefined) {
      var AccountName = this.accountsList.find(r => r.id == event.value).text;
    }
    else {
      var AccountName = this.accountsList.find(r => r.id == event).text;
    }
    let acc = event.value === undefined ? event : event.value;
    if (acc > 0) {
      if (this.servicesInvDTList.length > 0) {
        let isDuplicate = false;  
        for (let i = 0; i < this.servicesInvDTList.length; i++) {
          if (this.servicesInvDTList[i].accountId == acc && i != index) {
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


    debugger
    setTimeout(() => {
         if (event.value) {
      this.saleServiceInvoiceService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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
      this.saleServiceInvoiceService.GetAccountInfo(row.accountId, BranchId).subscribe((result) => {
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
    });
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 10000);
  }

  ClearFormData()
  {
    this.servicesInvDTList = [];
    this.childAttachment.data = [];
    this.dealerId = 0;
    this.pDTerm = 0;
    this.SalesServiceInvoiceAddForm.get("note").setValue("");
    this.SalesServiceInvoiceAddForm.get("branchId").setValue(0);
    this.SalesServiceInvoiceAddForm.get("referenceNo").setValue("");
    this.SalesServiceInvoiceAddForm.get("representId").setValue(0);
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
     this.router.navigate([], {
      queryParams: { MaintId: 0 },
      queryParamsHandling: 'merge'
    });
    this.cdr.detectChanges();
  }

  getCustomerAcc(event) {
    debugger
    if (event.value) 
      {    
        this.showAlert = false;
        
        this.saleServiceInvoiceService.GetDealerInfo(event.value).subscribe(res => {
          debugger
          if(res)
            {
              let DealerName = this.customersList.find(r => r.id == event.value).text;
              this.dealerBalance = res.balance;
              this.dealerAmt = res.amt;
              this.dealerChequeAmt= res.chequeAmt;
              this.dealerPolicy= res.policy;
              this.NoteDealerAlert = "Warning:TheCustomerhasexceededthepermittedfinanciallimit";
              this.NoteDealerPrevenet = "TheCustomerhasexceededthepermittedfinanciallimit";
              this.NoteDealerBalance = "رصيد العميل " + "-" + DealerName + ": " +  Math.abs(res.balance).toFixed(3) + " , " + "سقف العميل" + ": " + res.amt.toFixed(3); 
              this.showBalanceDealer = true;
              this.showAlertDealer = false;
              this.showPreventDealer = false;
              this.hideLabelAfterDelayDealer();
              this.onCheckboxChange(0, 0, 0);
            }
        })

      }
  }

  PrintCustservicesalesinv(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptCustservicesalesinvAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptCustservicesalesinvEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo , VoucherTypeId)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.saleServiceInvoiceService.GetValidVoucherNo(VoucherNo,VoucherTypeId).subscribe(res =>
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
                    this.GetInitailPurServiceInvoice();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
                    // this.childAttachment.data = [];
                    this.showsave = true;
                    this.GetInitailPurServiceInvoice();
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
    this.SalesServiceInvoiceAddForm.get("id").setValue(0);
    this.SalesServiceInvoiceAddForm.get("voucherNo").setValue(VoucherNo);
    this.SalesServiceInvoiceAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.dealerId = 0;
    this.SalesServiceInvoiceAddForm.get("branchId").setValue(0);
    this.pDtermsList = 0;
    this.SalesServiceInvoiceAddForm.get("representId").setValue(0);
    this.SalesServiceInvoiceAddForm.get("currencyId").setValue(0);
    this.SalesServiceInvoiceAddForm.get("currRate").setValue(0);
    this.SalesServiceInvoiceAddForm.get("referenceNo").setValue("");
    this.SalesServiceInvoiceAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.SalesServiceInvoiceAddForm.get("note").setValue("");
    this.isCash = 0;
    this.pricewTax = 0;
    this.servicesInvDTList = [];
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    this.allowedDiscount = 0;
    this.SalesServiceInvoiceAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.SalesServiceInvoiceAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
  }

  CopyRow(row,index)
  {
    debugger
        this.servicesInvDTList.push(
          {
            serviceId:row.serviceId,
            note:row.note,
            qty:row.qty,
            price:row.price,
            total:row.total,
            accountId:row.accountId,
            costCenterId:row.costCenterId,
            taxId:row.taxId,
            taxPerc:row.taxPerc,
            serviceDescr:row.serviceDescr,
            discount:row.discount,
            accNameDtl:row.accNameDtl,
            taxAmt:row.taxAmt,
            netTotal:row.netTotal,
            discountAmt:row.discountAmt,
            accountBudgetPolicy:row.accountBudgetPolicy,
            costCenterPolicy:row.costCenterPolicy,
            index: ""
          });
        const creditAccIds = this.voucherTypeList.map(item => item.creditAccId);
        if (creditAccIds.length > 0) {
          this.servicesInvDTList.forEach((row, index) => {
            if(this.servicesInvDTList[index].accountId > 0){
    
            if (index < creditAccIds.length && creditAccIds[index] != 0) {
              // Call OnAccountChange with the current index and row
              this.OnAccountChange(row.accountId, row, index +1);
            }
          }
          });
        }
        this.SalesServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);      
        this.onCheckboxChange(0,row,index);
   return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
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

  GetMaintenanceInfo(id :number)
  {
    debugger
    this.saleServiceInvoiceService.GetMaintenanceInfo(id).subscribe( res => 
      {
        debugger
        if(res.length > 0)
          {
            this.servicesInvDTList = res;
            if(this.servicesInvDTList.length > 0)
              {
                this.dealerId = res[0].customerId;
                 for (let r = 0; r < this.servicesInvDTList.length; r++) {
                    let row = this.servicesInvDTList[r];
                     this.onCheckboxChange(0,row,r);
                  }                 
              }

              this.SalesServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);

          }
    })


  }
}
