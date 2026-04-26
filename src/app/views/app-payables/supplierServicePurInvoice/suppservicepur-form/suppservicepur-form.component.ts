import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { debounce, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { serviceInvoicePurService } from '../supServicePur.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Params } from '@angular/router';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import { T } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-suppservicepur-form',
  templateUrl: './suppservicepur-form.component.html',
  styleUrls: ['./suppservicepur-form.component.scss']
})
export class SuppservicepurFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  purServiceInvoiceAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  suppliersList: any;
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
  dealerId: number = 0;
  pDTerm: number = 0;
  decimalPlaces: number;
  voucherNo: number = 0;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean;
  UseTax: boolean;
  newDate: any;
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
  allowAccRepeat: any;

  //DealerInfoModel
  dealerBalance: number = 0;
  dealerAmt: number = 0;
  dealerChequeAmt: number = 0;
  dealerPolicy: number = 0;

  NoteDealerBalance: any;
  NoteDealerAlert: any;
  NoteDealerPrevenet: any;

  showBalanceDealer: boolean;
  showAlertDealer: boolean;
  showPreventDealer: boolean;
  //End 
  defaultCurrencyId: number;
  disableCurrRate: boolean;
  disableSave: boolean;
  disableVouchertype: boolean = false;
  Lang: string;
  debitAcc: number = 0;
  creditAcc: number = 0;
  accountId: number = 0;
  custName: string = '';

  reqPurInvoice: number;
  purchaseRequestList: any;
  LandedCostList: any;

  constructor
    (private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private supServiceInvoiceService: serviceInvoicePurService,
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
      this.router.navigate(['ServicesPurchaseInv/SupplierPurServiceInvoiceList']);
    }
    this.InitiailPurServiceInvoiceForm();
    this.GetInitailPurServiceInvoice();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SupplierPurServiceInvoiceList');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPurServiceInvoiceForm() {
    this.purServiceInvoiceAddForm = this.formbulider.group({
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
      note: [""],
      branchId: [null],
      amount: [0],
      discount: [0],
      status: [null],
      userId: [0],
      referenceNo: [""],
      referenceDate: [""],
      representId: [0],
      mainInvoiceId: [0],
      landedCostId: [0],
      accVouchersDTModelList: [null],
      servicesInvHD: [null],
      servicesInvDTs: [null, [Validators.required, Validators.minLength(1)]],
      accVouchersDocModelList: [null],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailPurServiceInvoice() {
    var lang = this.jwtAuth.getLang();
    this.supServiceInvoiceService.GetInitailServicesPurchaseInv(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ServicesPurchaseInv/SupplierPurServiceInvoiceList']);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US")
      debugger
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

      this.suppliersList = result.suppliersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));

      this.purchaseRequestList = result.serviceRequestList.map((item) => ({
        label: item.id,
        value: item.note,
        voucherTypeId: item.voucherTypeId,
      }));


      this.LandedCostList = result.landedCostList.map((item) => ({
        label: item.id,
        value: item.note,
        voucherTypeId: item.voucherTypeId,
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
      //this.suppliersList = result.suppliersList;
      this.accountsList = result.accountList;
      this.purServiceInvoiceAddForm.value.servicesInvHD = result.servicesInvHD;
      this.pDtermsList = result.pdTermsModelList;
      this.costCenterList = result.costCenterList;
      this.servicesList = result.serviceInfoModelList;
      this.employeeList = result.employeeModelList;
      this.taxlist = result.taxModelList;
      this.defaultCurrencyId = result.defaultCurId;
      if (result.servicesInvDTs != null)
        this.servicesInvDTList = result.servicesInvDTs;
      this.purServiceInvoiceAddForm.value.servicesInvDTs = result.servicesInvDTs;
      this.purServiceInvoiceAddForm.patchValue(result);
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.allowedDiscount = result.servicesInvHD.discount;
      this.purServiceInvoiceAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
      if (result.accVouchersDocModelList !== null && result.accVouchersDocModelList.length !== 0 && result.accVouchersDocModelList !== undefined) {
        this.purServiceInvoiceAddForm.get("accVouchersDocModelList").setValue(result.accVouchersDocModelList);
        this.childAttachment.data = result.accVouchersDocModelList;
        this.childAttachment.ngOnInit();
      }
      if (this.opType == 'Edit') {
        this.disableVouchertype = true;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if (this.voucherId > 0) {
          this.accountId = result.servicesInvHD.accountId;
          this.dealerId = result.servicesInvHD.dealerId;
          this.pDTerm = result.servicesInvHD.pdterm;
          this.purServiceInvoiceAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.purServiceInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          this.purServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          this.purServiceInvoiceAddForm.get("representId").setValue(result.representId);
          this.onCheckboxChange(0, 0, 0);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.purServiceInvoiceAddForm.get("currencyId").setValue(result.currencyId);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.purServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.purServiceInvoiceAddForm.get("currencyId").setValue(result.defaultCurrency);
          this.purServiceInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          let currRate = result.currencyList.find(option => option.id === result.defaultCurrency).data1;
          this.purServiceInvoiceAddForm.get("currRate").setValue(currRate);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
          this.purServiceInvoiceAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.purServiceInvoiceAddForm.get("currencyId").setValue(result.defaultCurrency);
          }
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.purServiceInvoiceAddForm.get("branchId").setValue(result.defaultBranchId);
          }
          if (result.branchId == null || result.branchId == undefined && this.purServiceInvoiceAddForm.value.branchId == 0) {
            result.branchId = 0;
            this.purServiceInvoiceAddForm.get("branchId").setValue(result.branchId);
          }
          if (result.representId == null || result.representId == undefined && this.purServiceInvoiceAddForm.value.representId == 0) {
            result.representId = 0;
            this.purServiceInvoiceAddForm.get("representId").setValue(result.representId);
          }
        }
        this.GetVoucherTypeSetting(this.purServiceInvoiceAddForm.value.voucherTypeId)
        if (this.purServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })

  }


  GetLandedCost(event, id) {
    debugger;
    this.servicesInvDTList = [];
    const isValidEvent = event && event.value !== null && event.value !== 0 && event.value !== undefined;
    const selectedId = isValidEvent ? event.value : id;
    if (selectedId) {
      const selectedItem = this.voucherTypeList.find(option => option.label === this.purServiceInvoiceAddForm.value.voucherTypeId);
      const vouchertype = selectedItem ? selectedItem.label : null;

      if (vouchertype !== null) {
        this.purServiceInvoiceAddForm.get("voucherTypeId")?.setValue(vouchertype);
      }

      this.supServiceInvoiceService.GetLandedCost(selectedId).subscribe(res => {
        debugger;
        if (res) {
          this.servicesInvDTList = res.purchaseExpenses ?? [];

          this.servicesInvDTList.forEach((element) => {
            element.serviceId = 0;
            element.serviceDescr = element.expensesTypeName;
            element.qty = 1;
            element.price = element.amount;
            element.accountId = element.creditAccId;
            element.discount = 0;
            element.discountAmt = 0;
            element.taxId = 0;
            element.taxAmt = 0;
            element.costCenterId = 0;
            element.expiryDate = null;
            element.productDate = null;
          });

          this.purServiceInvoiceAddForm.get("branchId")?.setValue(res.branchId ?? 0);
          this.purServiceInvoiceAddForm.get("currencyId")?.setValue(res.currencyId ?? 0);
          this.purServiceInvoiceAddForm.get("currRate")?.setValue(res.currRate ?? 1);

          if (res.dealerId) {
            this.dealerId = res.dealerId;
          }

      /*     if (res.pdTerm) {
            this.pDTerm = res.pdTerm;
          } */

          this.purServiceInvoiceAddForm.get("servicesInvDTs")?.setValue(this.servicesInvDTList);

          if (this.purServiceInvoiceAddForm.valid) {
            this.disableSave = false;
          }

          this.onCheckboxChange(0, 0, 0);

          this.cdr.detectChanges();
        }
      });

    } else {
      this.purServiceInvoiceAddForm.get("dealerId")?.setValue(0);
      this.servicesInvDTList = [];
      this.disableSave = true;
    }
  }


  GetpurchaseRequest(event, id) {
    debugger;
    this.servicesInvDTList = [];

    const isValidEvent = event && event.value !== null && event.value !== 0 && event.value !== undefined;
    const selectedId = isValidEvent ? event.value : id;

    if (selectedId) {
      const selectedItem = this.voucherTypeList.find(option => option.label === this.purServiceInvoiceAddForm.value.voucherTypeId);
      const vouchertype = selectedItem ? selectedItem.label : null;

      if (vouchertype !== null) {
        this.purServiceInvoiceAddForm.get("voucherTypeId")?.setValue(vouchertype);
      }

      this.supServiceInvoiceService.GetItemsByPurchaseOrder(selectedId).subscribe(res => {
        debugger;
        if (res) {
          this.servicesInvDTList = res.servicesInvDTs ?? [];

          this.servicesInvDTList.forEach((element) => {
            element.total = element.qty * element.price;
            element.discount = 0;
            element.discountAmt = 0;
            element.taxId = 0;
            element.taxAmt = 0;
            element.expiryDate = null;
            element.productDate = null;
          });

          this.purServiceInvoiceAddForm.get("branchId")?.setValue(res.branchId ?? 0);
          this.purServiceInvoiceAddForm.get("currencyId")?.setValue(res.currencyId ?? 0);
          this.purServiceInvoiceAddForm.get("currRate")?.setValue(res.currRate ?? 1);

          if (res.dealerId) {
            this.dealerId = res.dealerId;
          }

          if (res.pdTerm) {
            this.pDTerm = res.pdTerm;
          }

          this.purServiceInvoiceAddForm.get("servicesInvDTs")?.setValue(this.servicesInvDTList);

          if (this.purServiceInvoiceAddForm.valid) {
            this.disableSave = false;
          }

          this.onCheckboxChange(0, 0, 0);

          this.cdr.detectChanges();
        }
      });

    } else {
      this.purServiceInvoiceAddForm.get("dealerId")?.setValue(0);
      this.servicesInvDTList = [];
      this.disableSave = true;
    }
  }



  OnSaveForms() {
    debugger
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
    });
    for (let i = 0; i < this.servicesInvDTList.length; i++) {
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

    debugger
    for (let i = 0; i < this.servicesInvDTList.length; i++) {
      var IsTaxable = this.suppliersList.find(x => x.id === this.dealerId).IsTaxable;
      if (IsTaxable == true && this.servicesInvDTList[i].taxId == 0) {
        this.alert.ShowAlert("msgMustSelectTaxForSupplier", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }

    if (this.dealerId == 0 || this.dealerId == null || this.dealerId == undefined) {
      this.alert.ShowAlert("msgMustSelectSupplier", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }
    if (stopExecution) {
      return;
    }
    this.purServiceInvoiceAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.purServiceInvoiceAddForm.value.userId = this.jwtAuth.getUserId();
    this.purServiceInvoiceAddForm.value.voucherNo = this.purServiceInvoiceAddForm.value.voucherNo.toString();
    this.purServiceInvoiceAddForm.value.accVouchersDTModelList = this.accVouchersDTsList;
    this.purServiceInvoiceAddForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
    this.purServiceInvoiceAddForm.value.servicesInvDTs = this.servicesInvDTList;
    this.purServiceInvoiceAddForm.value.servicesInvHD.discount = this.allowedDiscount;
    this.purServiceInvoiceAddForm.value.servicesInvHD.dealerId = this.dealerId
    this.purServiceInvoiceAddForm.value.servicesInvHD.pdterm = this.pDTerm
    this.purServiceInvoiceAddForm.value.servicesInvHD.accountId = this.accountId
    if (this.pricewTax == 1) {
      this.purServiceInvoiceAddForm.value.servicesInvHD.priceWithTax = true;
    }
    else {
      this.purServiceInvoiceAddForm.value.servicesInvHD.priceWithTax = false;
    }
    if (this.isCash == 1) {
      this.purServiceInvoiceAddForm.value.servicesInvHD.isCash = true;
    }
    else {
      this.purServiceInvoiceAddForm.value.servicesInvHD.isCash = false;
    }
    this.purServiceInvoiceAddForm.value.amount = this.fNetTotal;
    this.purServiceInvoiceAddForm.value.discount = this.allowedDiscount;
    this.supServiceInvoiceService.SaveServicesPurchaseInv(this.purServiceInvoiceAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.purServiceInvoiceAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintSuppservicepur(Number(result.message));
          }


          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ServicesPurchaseInv/SupplierPurServiceInvoiceList']);
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
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.purServiceInvoiceAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.purServiceInvoiceAddForm.value.voucherTypeId;
    var date = new Date(this.purServiceInvoiceAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    this.creditAcc = this.voucherTypeList.find(option => option.label === selectedValue)?.creditAccountId ?? 0;
    this.debitAcc = this.voucherTypeList.find(option => option.label === selectedValue)?.debitAccountId ?? 0;

    if (voucherTypeId > 0) {
      this.supServiceInvoiceService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.purServiceInvoiceAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.purServiceInvoiceAddForm.get("voucherNo").setValue(1);
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

        if (branchId == null || branchId == undefined) {
          this.purServiceInvoiceAddForm.get("branchId").setValue(0);
        }
        else {
          this.purServiceInvoiceAddForm.get("branchId").setValue(branchId);
        }
      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.purServiceInvoiceAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.purServiceInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.purServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
      this.cdr.detectChanges();
    }
    else {
      this.purServiceInvoiceAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      let currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.purServiceInvoiceAddForm.get("currRate").setValue(currRate);
      if (this.purServiceInvoiceAddForm.value.currencyId == this.defaultCurrencyId) {
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
    this.purServiceInvoiceAddForm.get("currRate").setValue(currRate);
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
        debugger;
        if (this.servicesInvDTList[index].accountId > 0) {
          if (index < creditAccIds.length && creditAccIds[index] != 0) {
            // Call OnAccountChange with the current index and row
            this.OnAccountChange(row.accountId, row, index);
          }
        }
      });
    }

    this.purServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.servicesInvDTList.splice(rowIndex, 1);
    }
    this.purServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
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
    this.purServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
  }

  onTaxChange(event, i) {
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
    debugger
    if (Row != 0) {
      this.OnAccountChange(Row.accountId, Row, index);
    }
    debugger
    setTimeout(() => {
      if (Number(String(this.fNetTotal).replace(/,/g, '')) + Number(this.dealerBalance) > Number(String(this.dealerAmt).replace(/,/g, ''))) {
        if (this.dealerPolicy === 60) {
          this.showAlertDealer = true;
          this.showPreventDealer = false;
          this.showAlert = false;
          this.showPrevent = false;
          this.showBalance = false;
          this.hideLabelAfterDelayDealer();
          this.cdr.detectChanges();
        }
        else if (this.dealerPolicy === 61) {
          this.showAlertDealer = false;
          this.showPreventDealer = true;
          this.showAlert = false;
          this.showPrevent = false;
          this.showBalance = false;
          this.hideLabelAfterDelayDealer();
          for (const element of this.servicesInvDTList) {
            element.price = 0;
            element.total = 0;
          }
          this.onCheckboxChange(0, 0, 0);
          this.cdr.detectChanges();
        }
      }
    });

  }

  onServiceChange(event, row, index) {
    debugger
    if (this.servicesInvDTList[index].serviceId !== null || this.servicesInvDTList[index].serviceId !== 0) {
      const selectedService = this.servicesList.find(service => service.id === this.servicesInvDTList[index].serviceId);
      this.servicesInvDTList[index].serviceDescr = selectedService.text;
    }

    this.supServiceInvoiceService.GetServiceInfo(event.value).subscribe(res => {
      if (res) {
        debugger
        this.servicesInvDTList[index].price = res.price;
        if (res.accountId != null && res.accountId != undefined && res.accountId != 0) {
          this.servicesInvDTList[index].accountId = res.accountId
        }
        else {
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
        this.supServiceInvoiceService.DeleteServicesPurchaseInv(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ServicesPurchaseInv/SupplierPurServiceInvoiceList']);
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
  }

  OnAccountChange(event, row, index) {
    debugger
    this.showBalanceDealer = false;
    this.showAlertDealer = false;
    this.showPreventDealer = false;
    var BranchId = this.purServiceInvoiceAddForm.value.branchId;
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
    setTimeout(() => {
      if (event.value) {
        this.supServiceInvoiceService.GetAccountInfo(event.value, BranchId).subscribe((result) => {
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
                  this.onCheckboxChange(0, 0, 0);
                }
              }
            }
            this.hideLabelAfterDelay();
          }
        });
      }
      else if (row.accountId != 0 && row.accountId != null && row.accountId != undefined) {
        this.supServiceInvoiceService.GetAccountInfo(row.accountId, BranchId).subscribe((result) => {
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
    })
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 10000);
  }

  ClearFormData() {
    this.servicesInvDTList = [];
    this.dealerId = 0;
    this.pDTerm = 0;
    this.purServiceInvoiceAddForm.get("branchId").setValue(0);
    this.purServiceInvoiceAddForm.get("representId").setValue(0);
    this.purServiceInvoiceAddForm.get("referenceNo").setValue("");
    this.purServiceInvoiceAddForm.get("note").setValue("");
    this.childAttachment.data = [];
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.purServiceInvoiceAddForm.value.voucherTypeId);
    });
    this.cdr.detectChanges;
  }

  GetDealerInfo(event) {
    if (event.value) {
      this.supServiceInvoiceService.GetDealerInfo(event.value).subscribe(res => {
        debugger
        if (res) {
          let DealerName = this.suppliersList.find(r => r.id == event.value).text;
          this.dealerBalance = res.balance;
          this.dealerAmt = res.amt;
          this.dealerChequeAmt = res.chequeAmt;
          this.dealerPolicy = res.policy;
          this.NoteDealerAlert = "Warning:Thesupplierhasexceededthepermittedfinanciallimit";
          this.NoteDealerPrevenet = "Thesupplierhasexceededthepermittedfinanciallimit";
          this.NoteDealerBalance = "رصيد المورد " + "-" + DealerName + ": " + Math.abs(res.balance).toFixed(3) + " , " + "سقف المورد" + ": " + res.amt.toFixed(3);
          this.showBalanceDealer = true;
          this.showAlertDealer = false;
          this.showPreventDealer = false;
          this.hideLabelAfterDelayDealer();
          this.onCheckboxChange(0, 0, 0);
        }
      })

    }
  }

  hideLabelAfterDelayDealer() {
    setTimeout(() => {
      this.showBalanceDealer = false;
      this.showAlertDealer = false;
      this.showPreventDealer = false;
    }, 10000);
  }

  PrintSuppservicepur(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptSuppservicepurAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptPrintSuppservicepurEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherNo, VoucherTypeId) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.supServiceInvoiceService.GetValidVoucherNo(VoucherNo, VoucherTypeId).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            //this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            //this.childAttachment.data = [];
            this.disableAll = false;
            this.GetInitailPurServiceInvoice();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            // this.OpeningBalanceAddForm.get("generalAttachModelList").setValue([]); 
            // this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailPurServiceInvoice();
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
    this.purServiceInvoiceAddForm.get("id").setValue(0);
    this.purServiceInvoiceAddForm.get("voucherNo").setValue(VoucherNo);
    this.purServiceInvoiceAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.dealerId = 0;
    this.purServiceInvoiceAddForm.get("branchId").setValue(0);
    this.pDtermsList = 0;
    this.purServiceInvoiceAddForm.get("representId").setValue(0);
    this.purServiceInvoiceAddForm.get("currencyId").setValue(0);
    this.purServiceInvoiceAddForm.get("currRate").setValue(0);
    this.purServiceInvoiceAddForm.get("referenceNo").setValue("");
    this.purServiceInvoiceAddForm.get("referenceDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.purServiceInvoiceAddForm.get("note").setValue("");
    this.isCash = 0;
    this.pricewTax = 0;
    this.servicesInvDTList = [];
    this.fTotal = 0;
    this.fTaxTotal = 0;
    this.fNetTotal = 0;
    this.fDiscount = 0;
    this.fTotalGridNet = 0;
    this.allowedDiscount = 0;
    this.purServiceInvoiceAddForm.value.accVouchersDocModelList = []
    this.childAttachment.data = this.purServiceInvoiceAddForm.value.accVouchersDocModelList;
    this.childAttachment.ngOnInit();
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
    const creditAccIds = this.voucherTypeList.map(item => item.creditAccId);
    if (creditAccIds.length > 0) {
      this.servicesInvDTList.forEach((row, index) => {
        debugger;
        if (this.servicesInvDTList[index].accountId > 0) {
          if (index < creditAccIds.length && creditAccIds[index] != 0) {
            this.OnAccountChange(row.accountId, row, index + 1);
          }
        }
      });
    }
    this.purServiceInvoiceAddForm.get("servicesInvDTs").setValue(this.servicesInvDTList);
    this.onCheckboxChange(0, row, index);
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }
}
