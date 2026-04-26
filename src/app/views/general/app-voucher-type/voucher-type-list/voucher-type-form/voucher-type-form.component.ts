import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { VoucherTypeService } from '../../voucher-type.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { sweetalert } from 'sweetalert';
import { VoucherTypeListComponent } from '../voucher-type-list.component';

@Component({
  selector: 'app-voucher-type-form',
  templateUrl: './voucher-type-form.component.html',
  styleUrls: ['./voucher-type-form.component.scss']
})
export class VoucherTypeFormComponent implements OnInit {
  RequstId: any;
  TitlePage: string = '';
  voucherTypesForm: FormGroup = new FormGroup({});
  showLoader = false;
  hasPerm: boolean = false;

  /** Options DropDownLsit*/
  categoryList: any;
  accountList: any;
  serialTypeList: any;
  usersList: any;
  companyBranchList: any;
  currencyList: any;
  storesList: any;
  allowAccRepeatList: any;
  chequesStatusList: any;
  bankList: any;
  statusList: any;
  paymentMethodList: any;
  loading: boolean = true;
  /** selected DropDownLsit*/
  selectedcategory: any;
  selectedcompanyBranch: any;
  selectedcurrency: any;
  selectedallowAccRepeat: any;
  selectedserialType: any;
  selectedaccount: any;
  selectedchequesStatus: any;
  selectedpaymentMethod: any;
  selectedUser: any;
  selectedstores: any;
  selectedbank: any;
  selectedstatus: any;
  SelectedfromChequeStatus: any;
  SelectedtoChequeStatus: any;
  SelectedcreditAccId: any;
  SelecteddebitAccId: any;
  SelectedMainDebitAccId: any;
  SelectedMainCreditAccId: any;


  /**checkbox status */
  isPreventChangeBranch: boolean = false;
  isPreventChangeDate: boolean = false;
  isIsDefault: boolean = false;
  isSerialByMonth: boolean = false;
  isSerialByYear: boolean = false;



  isPreventChangeSerial: boolean = false;
  isPrintAfterSave: boolean = false;
  isPrintTemplate: boolean = false;
  allowMultiCurrency: boolean = false;
  allowMultiBranch: boolean = false;
  defaultCurrencyId: number = 0;
  ParentAccountList: any;
  Hidden: boolean = false;
  parentTableNo: number = 0;

  constructor(
    private readonly formbulider: FormBuilder,
    private readonly title: Title,
    private readonly voucherTypesService: VoucherTypeService,
    private readonly translateService: TranslateService,
    public readonly router: Router,
    private readonly alert: sweetalert,
    public readonly routePartsService: RoutePartsService,
  ) { }

  ngOnInit(): void {
    this.VoucherTypeInitialForm();
    this.RequstId = this.routePartsService.GuidToEdit;
    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['VoucherType/VoucherTypesList']);
    }
    else {
      this.GetVoucherTypeInitialForm();
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('VoucherTypeForm');
    this.title.setTitle(this.TitlePage);
  }

  VoucherTypeInitialForm() {
    this.voucherTypesForm = this.formbulider.group({
      id: [0, [Validators.required]],
      companyId: [0, [Validators.required]],
      voucherNameA: ["", [Validators.required]],
      voucherNameE: ["", [Validators.required]],
      categoryId: [0, [Validators.required, Validators.min(1)]],
      debitAccId: [""],
      creditAccId: [""],
      currencyId: [""],
      branchId: [""],
      storeId: [""],
      allowAccRepeat: [0, [Validators.required, Validators.min(1)]],
      preventChangeBranch: [""],
      serialType: [0, [Validators.required, Validators.min(1)]],
      preventChangeDate: [""],
      preventChangeSerial: [""],
      signatureAr1: [""],
      signatureAr2: [""],
      signatureAr3: [""],
      signatureAr4: [""],
      signatureEn1: [""],
      signatureEn2: [""],
      signatureEn3: [""],
      signatureEn4: [""],
      printAfterSave: [""],
      isDefault: [""],
      fromChequeStatus: [""],
      toChequeStatus: [""],
      paymentMethod: [""],
      printTemplate: [""],
      cheqAccId: [""],
      bankId: [""],
      defChequeStatus: [""],
      serialByMonth: [""],
      restricUserId: [0],
      mainDebitAccId: [0],
      mainCreditAccId: [0],
      serialByYear: [false],
      voucherNumberLength: [0],
      cliqAccId: [0],
      cardAccId: [0],
    });
  }

  GetVoucherTypeInitialForm() {
    this.voucherTypesService.GetVoucherTypeInitialForm(this.RequstId).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['VoucherType/VoucherTypesList']);
        return;
      }
      debugger
      this.categoryList = result.categoryList;
      this.companyBranchList = result.companyBranchList;
      this.allowAccRepeatList = result.allowAccRepeatList;
      this.serialTypeList = result.serialTypeList;
      this.chequesStatusList = result.chequesStatusList;
      this.paymentMethodList = result.paymentMethodList;
      this.storesList = result.storesList;
      this.bankList = result.bankList;
      this.usersList = result.usersList;
      this.statusList = result.statusList;
      this.currencyList = result.currencyList;
      this.accountList = result.accountList;
      this.isPreventChangeBranch = result.preventChangeBranch;
      this.isPreventChangeDate = result.preventChangeDate;
      this.isIsDefault = result.isDefault;
      this.isSerialByMonth = result.serialByMonth;
      this.isSerialByYear = result.serialByYear;
      this.isPreventChangeSerial = result.preventChangeSerial;
      this.isPrintAfterSave = result.printAfterSave;
      this.isPrintTemplate = result.printTemplate;
      this.allowMultiCurrency = result.allowMultiCurrency;
      this.allowMultiBranch = result.allowMultiBranch
      this.defaultCurrencyId = result.defaultCurrencyId;
      this.ParentAccountList = result.parentAccountList;

      this.voucherTypesForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.voucherTypesForm.get("accLinkType")?.setValue(result.accLinkType ?? 0);
        this.voucherTypesForm.get("categoryId")?.setValue(result.categoryId ?? 0);
        this.voucherTypesForm.get("voucherNameA")?.setValue(result.voucherNameA ?? "");
        this.voucherTypesForm.get("voucherNameE")?.setValue(result.voucherNameE ?? "");
        this.voucherTypesForm.get("mainDebitAccId")?.setValue(result.mainDebitAccId ?? 0);
        this.voucherTypesForm.get("mainCreditAccId")?.setValue(result.mainCreditAccId ?? 0);
        this.voucherTypesForm.get("voucherNumberLength")?.setValue(result.voucherNumberLength ?? 0);
        this.voucherTypesForm.get("debitAccId")?.setValue(result.debitAccId ?? 0);
        this.voucherTypesForm.get("creditAccId")?.setValue(result.creditAccId ?? 0);
        this.voucherTypesForm.get("serialType")?.setValue(result.serialType ?? 0);
        this.voucherTypesForm.get("branchId")?.setValue(result.branchId ?? 0);
        this.voucherTypesForm.get("currencyId")?.setValue(result.currencyId ?? 0);
        this.voucherTypesForm.get("storeId")?.setValue(result.storeId ?? 0);
        this.voucherTypesForm.get("allowAccRepeat")?.setValue(result.allowAccRepeat ?? 0);
        this.voucherTypesForm.get("fromChequeStatus")?.setValue(result.fromChequeStatus ?? 0);
        this.voucherTypesForm.get("toChequeStatus")?.setValue(result.toChequeStatus ?? 0);
        this.voucherTypesForm.get("cheqAccId")?.setValue(result.cheqAccId ?? 0);
        this.voucherTypesForm.get("bankId")?.setValue(result.bankId ?? 0);
        this.voucherTypesForm.get("defChequeStatus")?.setValue(result.defChequeStatus ?? 0);
        this.voucherTypesForm.get("paymentMethod")?.setValue(result.paymentMethod ?? 0);
        this.voucherTypesForm.get("restricUserId")?.setValue(result.restricUserId ?? 0);
        this.voucherTypesForm.get("cardAccId")?.setValue(result.cardAccId ?? 0);
        this.voucherTypesForm.get("cliqAccId")?.setValue(result.cliqAccId ?? 0);
        this.selectedcategory = result.categoryId;
        this.selectedcompanyBranch = result.branchId;
        this.selectedcurrency = result.currencyId;
        this.selectedallowAccRepeat = result.allowAccRepeat;
        this.selectedserialType = result.serialType;
        this.selectedaccount = result.cheqAccId;
        this.selectedchequesStatus = result.selectedchequesStatus;
        this.selectedpaymentMethod = result.paymentMethod;
        this.selectedUser = result.restricUserId;
        this.selectedstores = result.storeId;
        this.selectedbank = result.bankId;
        this.selectedstatus = result.defChequeStatus;
        this.SelectedfromChequeStatus = result.selectedFromChequeStatus;
        this.SelectedtoChequeStatus = result.toChequeStatus;
        this.SelectedcreditAccId = result.creditAccId;
        this.SelecteddebitAccId = result.debitAccId;
        this.SelectedMainDebitAccId = result.mainDebitAccId;
        this.SelectedMainCreditAccId = result.mainCreditAccId;
        if (this.allowMultiCurrency == false) {
          const defaultCurrency = result.currencyList.find((currency: any) => currency.id === result.defaultCurrencyId);
          this.currencyList = [defaultCurrency];
        }

        this.parentTableNo = result.parentTableNo;

        if (result.parentTableNo == 5 || result.parentTableNo == 7) {
          this.Hidden = false;
        }
        else {
          this.Hidden = true;
        }

        this.ConvertIdsToNumber(result);
      });
    })
  }

  onYearChange() {
  this.isSerialByYear = true;
  this.isSerialByMonth = false;
  }

  onMonthChange() {
    this.isSerialByMonth = true;
    this.isSerialByYear = false;
  }

  isEmpty(input : any): boolean {
    return input === '' || input === null;
  }

  OnSaveForms() {
    debugger
    this.voucherTypesForm.value.preventChangeBranch = this.isPreventChangeBranch;
    this.voucherTypesForm.value.preventChangeDate = this.isPreventChangeDate;
    this.voucherTypesForm.value.isDefault = this.isIsDefault;
    this.voucherTypesForm.value.serialByMonth = this.isSerialByMonth;
    this.voucherTypesForm.value.serialByYear = this.isSerialByYear;
    this.voucherTypesForm.value.preventChangeSerial = this.isPreventChangeSerial;
    this.voucherTypesForm.value.printAfterSave = this.isPrintAfterSave;
    this.voucherTypesForm.value.printTemplate = this.isPrintTemplate;


    if (this.parentTableNo != 5 && this.parentTableNo != 7) {
      this.voucherTypesForm.value.fromChequeStatus = 0;
      this.voucherTypesForm.value.toChequeStatus = 0;
    }
    else if (this.parentTableNo == 5 || this.parentTableNo == 7) {

      if (this.voucherTypesForm.value.fromChequeStatus == 0 || this.voucherTypesForm.value.fromChequeStatus == null) {
        this.alert.ShowAlert('PleaseInsertfromChequeStatus', 'error');
        return;
      }

      if (this.voucherTypesForm.value.toChequeStatus == 0 || this.voucherTypesForm.value.toChequeStatus == null) {
        this.alert.ShowAlert('PleaseInserttoChequeStatus', 'error');
        return;
      }
    }


    if (this.voucherTypesForm.value.fromChequeStatus == undefined || this.voucherTypesForm.value.fromChequeStatus == null || this.voucherTypesForm.value.fromChequeStatus == 0) {
      this.voucherTypesForm.value.fromChequeStatus = "";
    }
    //this.ConvertIdsToString();
    this.voucherTypesService.PostVoucherType(this.voucherTypesForm.value).subscribe(result => {
      this.alert.SaveSuccess()
      this.router.navigate(['/VoucherType/VoucherTypesList']);
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  getVoucherCategory(event: any) {
    debugger
    this.voucherTypesService.getParentTableNo(event.value).subscribe(result => {
      debugger
      this.parentTableNo = result;

      if (result == 5 || result == 7) {
        this.Hidden = false;
      }
      else {
        this.Hidden = true;
      }
    });
  }

  loadLazyAccountss(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.accountList) {
        this.accountList = [];
    }

    // Make sure the array is large enough
    while (this.accountList.length < last) {
        this.accountList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.accountList[i] = this.accountList[i];
    }

    this.loading = false;
  }


   ConvertIdsToString() {
    debugger
    let org = this.voucherTypesForm.value.fromChequeStatus;
    if (Array.isArray(org)) {
      let validOrgs = org
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let OrgsString = validOrgs.join(',');
      this.voucherTypesForm.get("fromChequeStatus")?.setValue(OrgsString);
      console.log('Filtered paymentMethod:', OrgsString);
    } else {
      console.error('fromChequeStatus is not an array');
    }

    

  }

  ConvertIdsToNumber(data:any) {
    debugger
    if (data.fromChequeStatus != null && data.fromChequeStatus != undefined && data.fromChequeStatus != "" && data.fromChequeStatus != "0") {
      let org = data.fromChequeStatus.split(',').map(Number)
      this.voucherTypesForm.get("fromChequeStatus")?.setValue(org);
    }
    else {
      this.voucherTypesForm.get("fromChequeStatus")?.setValue("");
    }
  
  }
}
