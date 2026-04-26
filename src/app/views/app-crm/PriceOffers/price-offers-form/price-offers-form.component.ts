import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { PriceOffersService } from '../PriceOffers.Service';

@Component({
  selector: 'app-price-offers-form',
  templateUrl: './price-offers-form.component.html',
  styleUrls: ['./price-offers-form.component.scss']
})
export class PriceOffersFormComponent implements OnInit {
  public showLoader: boolean = false;
  public loading: boolean = false;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  public Data: any = {};
  QuotationForm: FormGroup;
  public voucherId: any;
  public opType: string;
  public showsave: boolean;
  public voucherTypeEnum = 43;
  public TitlePage: string;
  VoucherTypeList: any[] = [];
  branchesList: any[] = [];
  DealerList: any[] = [];
  opportunitiesList:any;
  EmployeeList: any[] = [];
  PDTermsList: any[] = [];
  CurrencyList: any[] = [];
  ItemsList: any[] = [];
  TaxModelLists: any[] = [];
  allUntiesList: any[] = [];
  unitsList: Array<any> = [];
  accVouchersDTsList: any[] = [];
  decimalPlaces: number = 2;
  defaultCurrencyId: number = 0;
  allowMultiCurrency: boolean = true;
  allowMultiBranch: boolean = true;
  disableCurrRate: boolean = false;
  disableAll: boolean = false;
  disapleVoucherType: boolean = false;
  disableSave: boolean = false;
  allowAccRepeat: any;
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  totalNo: any = 0;
  taxAmount: any = 0;
  AllTotal: any = 0;
  sumDiscount: any = 0;
  sumTot: any = 0;
  voucherNo: number = 0;
  newDate: any;
  lang: string;
  UseTax: boolean = false;
  oppertunityId:any;
  fromOpper:any;

  constructor(
    private readonly title: Title,
    private readonly jwtAuth: JwtAuthService,
    private readonly translateService: TranslateService,
    private readonly alert: sweetalert,
    private readonly priceOffersService: PriceOffersService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly routePartsService: RoutePartsService,
    private readonly formbulider: FormBuilder,
    private readonly appCommonserviceService: AppCommonserviceService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.disableSave = false;
     this.route.queryParams.subscribe((params: Params) => {
      this.oppertunityId = +params['oppertunityId'];
    });

    if (this.oppertunityId == null || this.oppertunityId == undefined || this.oppertunityId === 0 || isNaN(this.oppertunityId)) {

      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
        this.fromOpper = 0;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
        this.fromOpper = 0;
      }
    }
    else {
      this.fromOpper = 1;
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }
    setTimeout(() => {
      this.disableAll = this.opType === 'Show';
    });

    this.QuotationForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      voucherNo: ['', [Validators.required]],
      voucherDate: [new Date(), [Validators.required]],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      currRate: [0, [Validators.required]],
      note: [''],
      branchId: [0],
      amount: [0],
      status: [0],
      stampDate: [new Date()],
      userId: [0],
      dealerId: [0, [Validators.required]],
      salesManId: [0],
      paymentTerm: [0],
      deliveryPeriod: [0],
      validity: [0, [Validators.required, Validators.min(1)]],
      opporId:[0],
      allowEditDelete: [false],
      QuotationDTList: [null],
      voucherTypeEnum: [this.voucherTypeEnum],
      generalAttachModelList: [null],
    });

    if (this.voucherId == null || this.voucherId === undefined || this.voucherId === '') {
      this.router.navigate(['Quotations/PriceoffersList']);
      return;
    }

  this.GetQuotationInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PriceOffer');
    this.title.setTitle(this.TitlePage);
  }

  GetQuotationInfo() {
    debugger
    const lang = this.jwtAuth.getLang();
    this.showLoader = true;

    this.priceOffersService.GetQuotationForm(this.voucherId, this.opType).subscribe((result: any) => {
      if (result?.isSuccess === false && result?.message === 'msNoPermission') {
        this.alert.ShowAlert('msNoPermission', 'error');
        this.router.navigate(['Quotations/PriceoffersList']);
        this.showLoader = false;
        return;
      }
debugger
      result.voucherDate = formatDate(result.voucherDate ?? new Date(), 'yyyy-MM-dd', 'en-US');

      this.VoucherTypeList = (result.voucherTypeList || []).map((item) => ({
        label: item.id,
        value: lang === 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        serialType: item.serialType,
        currencyId: item.currencyId,
        currRate: item.currRate,
        serialByMonth: item.serialByMonth,
        preventChangeBranch: item.preventChangeBranch,
        allowAccRepeat: item.allowAccRepeat,
        printAfterSave: item.printAfterSave
      }));

      this.ItemsList = (result.itemsList || []).map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial
      }));

      this.DealerList = result.dealersList || [];
      this.EmployeeList = result.employeeList || [];
      this.PDTermsList = result.pdTermsList || [];
      this.CurrencyList = result.currencyList || [];
      this.TaxModelLists = result.taxModelLists || [];
      this.allUntiesList = result.unitList || [];
      this.branchesList = result.userCompanyBranchList || [];
      this.opportunitiesList = result.opportunitiesList;
      this.UseTax = result.useTax ?? false;
      this.defaultCurrencyId = result.defaultCurrency || 0;
      this.allowMultiCurrency = result.allowMultiCurrency ?? true;
      this.allowMultiBranch = result.allowMultiBranch ?? true;

      const dc = this.CurrencyList.find(x => x.id === (result.defaultCurrency || result.currencyId));
      this.decimalPlaces = dc?.data2 ?? 2;

      this.accVouchersDTsList = result.quotationDTList || [];

      if (this.childAttachment) {
        this.childAttachment.data = result.generalAttachModelList || [];
        this.childAttachment.ngOnInit();
      }

      if (this.accVouchersDTsList !== undefined && this.accVouchersDTsList !== null) {
        let index = 0;
        this.accVouchersDTsList.forEach(element => {
          this.ItemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              index++;
            }
          });
        });
      } else {
        this.accVouchersDTsList = [];
      }

      for (let i = 0; i < this.accVouchersDTsList.length; i++) {
        this.onChangeItem(this.accVouchersDTsList[i], i);
      }

      this.claculateAllAmount();

      this.Data = result;
      this.QuotationForm.patchValue(result);

      if (this.opType === 'Edit') {
        this.disapleVoucherType = true;
      }

      if(this.fromOpper == 1)
        {
          this.QuotationForm.get("opporId").setValue(this.oppertunityId);
          this.GetOpertuntiesItems(this.oppertunityId);
        }
      of(1).pipe(delay(0)).subscribe(() => {

        if (this.opType === 'Edit' || this.opType === 'Show') {
          this.QuotationForm.get('voucherTypeId')?.setValue(result.voucherTypeId);
          this.QuotationForm.get('currencyId')?.setValue(result.currencyId);
          this.QuotationForm.get('branchId')?.setValue(result.branchId);
          this.QuotationForm.get('dealerId')?.setValue(result.dealerId);
          this.QuotationForm.get('paymentTerm')?.setValue(result.paymentTerm);
          this.QuotationForm.get('salesManId')?.setValue(result.salesManId);
          this.QuotationForm.get('deliveryPeriod')?.setValue(result.deliveryPeriod);
          this.QuotationForm.get('validity')?.setValue(result.validity);
          this.QuotationForm.get('QuotationDTList')?.setValue(result.quotationDTList);

          if (result.allowMultiCurrency === false) {
            const def = result.currencyList.find(c => c.id === result.currencyId);
            this.CurrencyList = def ? [def] : this.CurrencyList;
          }

          if (result.allowMultiBranch === false) {
            const defB = result.userCompanyBranchList.find(b => b.id === result.branchId);
            this.branchesList = defB ? [defB] : this.branchesList;
          }
        }

        else if (this.opType === 'Copy') {
          this.voucherId = 0;
          this.QuotationForm.get('id')?.setValue(0);
          this.QuotationForm.get('voucherTypeId')?.setValue(result.voucherTypeId);
          this.QuotationForm.get('currencyId')?.setValue(result.currencyId);
          this.QuotationForm.get('branchId')?.setValue(result.branchId);
          this.QuotationForm.get('dealerId')?.setValue(result.dealerId);
          this.QuotationForm.get('paymentTerm')?.setValue(result.paymentTerm);
          this.QuotationForm.get('salesManId')?.setValue(result.salesManId);
          this.QuotationForm.get('deliveryPeriod')?.setValue(result.deliveryPeriod);
          this.QuotationForm.get('validity')?.setValue(result.validity);

          this.accVouchersDTsList = (result.quotationDTList || []).map(x => ({
            ...x,
            id: 0,
            hDId: 0
          }));

          this.QuotationForm.get('QuotationDTList')?.setValue(this.accVouchersDTsList);

          if (result.allowMultiCurrency === false) {
            const def = result.currencyList.find(c => c.id === result.currencyId);
            this.CurrencyList = def ? [def] : this.CurrencyList;
          }

          if (result.allowMultiBranch === false) {
            const defB = result.userCompanyBranchList.find(b => b.id === result.branchId);
            this.branchesList = defB ? [defB] : this.branchesList;
          }

          const vt = this.VoucherTypeList.find(x => x.label === result.voucherTypeId);
          if (vt) {
            const date = new Date(this.QuotationForm.value.voucherDate || new Date());
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            this.priceOffersService
              .GetSerialVoucher(vt.serialType, result.voucherTypeId, this.QuotationForm.value.voucherTypeEnum, year, month)
              .subscribe((newVoucherNo: any) => {
                this.QuotationForm.get('voucherNo')?.setValue(newVoucherNo ? newVoucherNo : 1);
              });
          }
        }

        else {
          this.QuotationForm.get('branchId')?.setValue(result.defaultBranchId);

          const defVoucher = result.voucherTypeList.find(v => v.isDefault === true)?.id ?? 0;
          this.QuotationForm.get('voucherTypeId')?.setValue(defVoucher);
          this.QuotationForm.get('voucherNo')?.setValue(result.voucherNo);

          if (result.allowMultiCurrency === false) {
            const def = result.currencyList.find(c => c.id === result.defaultCurrency);
            this.CurrencyList = def ? [def] : this.CurrencyList;
            if (def) {
              this.QuotationForm.get('currencyId')?.setValue(def.id);
              this.QuotationForm.get('currRate')?.setValue(def.data1);
            }
          }

          if (result.allowMultiBranch === false) {
            const defB = result.userCompanyBranchList.find(b => b.id === result.defaultBranchId);
            this.branchesList = defB ? [defB] : this.branchesList;
          }

          if (this.QuotationForm.value.currencyId === 0) {
            this.QuotationForm.get('currencyId')?.setValue(this.defaultCurrencyId);
            const rate = this.CurrencyList.find(c => c.id === this.defaultCurrencyId)?.data1;
            this.QuotationForm.get('currRate')?.setValue(rate);
          }

          this.QuotationForm.get('dealerId')?.setValue(0);
          this.QuotationForm.get('salesManId')?.setValue(0);
          this.QuotationForm.get('paymentTerm')?.setValue(0);
          this.QuotationForm.get('deliveryPeriod')?.setValue(0);
          if(this.fromOpper == 0)
          {
            this.QuotationForm.get('opporId')?.setValue(0);
          }
                    
          this.QuotationForm.get('validity')?.setValue('');
        }

        this.GetVoucherTypeSetting(this.QuotationForm.value.voucherTypeId);
        this.disableCurrRate = this.QuotationForm.value.currencyId === this.defaultCurrencyId;
      });

      this.showLoader = false;
    }, () => {
      this.showLoader = false;
    });
  }

  getVoucherNo(event: any) {
    const selectedValue = event?.value === undefined ? event : event.value;
    const vt = this.VoucherTypeList.find(x => x.label === selectedValue);
    if (!vt) return;

    const serialType = vt.serialType;
    const currencyId = vt.currencyId;
    let branchId = vt.branchId;

    this.allowAccRepeat = vt.allowAccRepeat;

    const voucherCategory = this.QuotationForm.value.voucherTypeEnum;
    const voucherTypeId = this.QuotationForm.value.voucherTypeId;

    const date = new Date(this.QuotationForm.value.voucherDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.priceOffersService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results: any) => {
        this.QuotationForm.get('voucherNo')?.setValue(results ? results : 1);
      });
    }

    if (currencyId && this.allowMultiCurrency) {
      this.decimalPlaces = this.CurrencyList.find(c => c.id === currencyId)?.data2 ?? this.decimalPlaces;
    } else {
      this.decimalPlaces = this.CurrencyList.find(c => c.id === this.defaultCurrencyId)?.data2 ?? this.decimalPlaces;
    }

    if (branchId == null) {
      branchId = 0;
      this.QuotationForm.get('branchId')?.setValue(branchId);
    }

    this.GetVoucherTypeSetting(voucherTypeId);

    if (currencyId && this.allowMultiCurrency) {
      this.QuotationForm.get('currencyId')?.setValue(currencyId);
      const rate = this.CurrencyList.find(c => c.id === currencyId)?.data1;
      this.QuotationForm.get('currRate')?.setValue(rate);
    } else {
      this.QuotationForm.get('currencyId')?.setValue(this.defaultCurrencyId);
      const rate = this.CurrencyList.find(c => c.id === this.defaultCurrencyId)?.data1;
      this.QuotationForm.get('currRate')?.setValue(rate);
    }

    this.disableCurrRate = this.QuotationForm.value.currencyId === this.defaultCurrencyId;
  }

  getCurrencyRate(event: any, CurrId: any) {
    const selectedValue = event?.value > 0 ? event.value : CurrId;
    const curr = this.CurrencyList.find(c => c.id === selectedValue);
    if (!curr) return;

    this.QuotationForm.get('currRate')?.setValue(curr.data1);
    this.decimalPlaces = curr.data2 ?? this.decimalPlaces;
    this.disableCurrRate = selectedValue === this.defaultCurrencyId;
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  AddNewLine() {
    if (this.disableAll) return;

    if (!this.accVouchersDTsList) this.accVouchersDTsList = [];

    this.accVouchersDTsList.push({
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      qty: '',
      price: '',
      total: '',
      discount: '',
      taxId: 0,
      taxPerc: 0,
      taxAmount: '',
      AllTotal: '',
      bonus: '',
      bonusUnitId: 0,
    });

    this.QuotationForm.get('QuotationDTList')?.setValue(this.accVouchersDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.unitsList = [...this.unitsList];
    }
    this.QuotationForm.get("QuotationDTList").setValue(this.accVouchersDTsList);

    this.claculateAllAmount();
  }

  OnSaveForms() {
    this.disableSave = true;

    if (!this.accVouchersDTsList || this.accVouchersDTsList.length <= 0) {
      this.alert.ShowAlert('msgEnterAllData', 'error');
      this.disableSave = false;
      return;
    }

    let isValid = true;

    this.accVouchersDTsList.forEach(element => {
      if (!element.itemId || !element.unitId || !element.qty || element.qty <= 0) {
        isValid = false;
      }
    });

    if (!isValid) {
      this.alert.ShowAlert('msgEnterAllData', 'error');
      this.disableSave = false;
      return;
    }

    if (this.opType === 'Copy') {
      this.QuotationForm.get('id')?.setValue(0);
    }

    this.QuotationForm.value.QuotationDTList = this.accVouchersDTsList;

    this.sumTot = 0;
    this.accVouchersDTsList.forEach(element => {
      const total = Number((element.AllTotal || '0').toString().replace(/,/g, ''));
      if (!isNaN(total)) {
        this.sumTot += total;
      }
    });

    this.QuotationForm.get('amount')?.setValue(this.sumTot);
    this.QuotationForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    this.QuotationForm.value.companyId = this.jwtAuth.getCompanyId();
    this.QuotationForm.value.userId = this.jwtAuth.getUserId();

    this.priceOffersService.SaveQuotationForm(this.QuotationForm.value).subscribe((result: any) => {
      debugger
      if (result?.isSuccess === true) {
        this.alert.SaveSuccess();

        const printAfterSave = this.VoucherTypeList.find(v => v.label === this.QuotationForm.value.voucherTypeId)?.printAfterSave || false;
        if (printAfterSave) {
          this.PrintQuotation(Number(result.message));
        }

        this.ClearAfterSave();

        if (this.opType === 'Edit' || this.opType === 'Copy') {
          this.router.navigate(['Quotations/PriceoffersList']);
        }

        this.voucherId = 0;
        this.opType = 'Add';
        this.ngOnInit();
      } else {
        this.alert.SaveFaild();
      }

      this.disableSave = false;
    }, () => {
      this.disableSave = false;
    });
  }

  ClearAfterSave() {
    this.QuotationForm.value.generalAttachModelList = [];
    this.accVouchersDTsList = [];
    this.unitsList = [];
    if (this.childAttachment) this.childAttachment.data = [];
    this.oppertunityId= 0;
    this.fromOpper = 0;
    this.clearFormdata();

    setTimeout(() => {
      this.GetVoucherTypeSetting(this.QuotationForm.value.voucherTypeId);
    });
  }

  onChangeItem(Row: any, i: number) {
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
      this.accVouchersDTsList[i].unitId = 0;
      this.accVouchersDTsList[i].bonusUnitId = 0;
      this.unitsList = [...this.unitsList];
      this.cdr.detectChanges();
      return;
    }

    this.priceOffersService.GetItemUintbyItemId(Row.itemId).subscribe((res: any[]) => {
      this.unitsList[i] = res || [];

      if (this.opType == 'Edit' || this.opType == 'Show' || this.opType == 'Copy') {
        const unit = this.unitsList[i].find(r => +r.id === +Row.unitId);
        if (unit == undefined || unit == null) {
          this.accVouchersDTsList[i].unitId = 0;
        } else {
          this.accVouchersDTsList[i].unitId = +Row.unitId;
        }

        const bonusUnit = this.unitsList[i].find(r => +r.id === +Row.bonusUnitId);
        if (bonusUnit == undefined || bonusUnit == null) {
          this.accVouchersDTsList[i].bonusUnitId = 0;
        } else {
          this.accVouchersDTsList[i].bonusUnitId = +Row.bonusUnitId;
        }
      } else {
        this.accVouchersDTsList[i].unitId = this.unitsList[i][0]?.id ?? 0;
        this.accVouchersDTsList[i].bonusUnitId = 0;
      }

      this.unitsList = [...this.unitsList];
      this.accVouchersDTsList = [...this.accVouchersDTsList];
      this.cdr.detectChanges();
    });

    if (this.accVouchersDTsList.length > 0) {
      let isDuplicate = false;

      for (let m = 0; m < this.accVouchersDTsList.length; m++) {
        if (this.accVouchersDTsList[m].itemId == Row.itemId && i != m) {
          isDuplicate = true;

          if (this.allowAccRepeat == 61) {
            this.alert.ShowAlert('msgCantAddSameItemForThisVoucherType', 'error');
            break;
          } else if (this.allowAccRepeat == 60) {
            this.alert.ShowAlert('msgTheItemRepeatedReminder', 'error');
            break;
          }
        }
      }

      if (isDuplicate && this.allowAccRepeat == 61) {
        this.accVouchersDTsList[i] = {
          ...this.accVouchersDTsList[i],
          itemId: 0,
          unitId: 0,
          bonusUnitId: 0
        };
        this.unitsList[i] = [];
        this.unitsList = [...this.unitsList];
        this.cdr.detectChanges();
        return;
      }
    }
  }

  onChangeCost(itemId: any, unitId: any, i: number) {
    this.priceOffersService.GetPriceUnit(itemId, unitId).subscribe((res: any) => {
      this.accVouchersDTsList[i].price = Number(res || 0).toFixed(this.decimalPlaces);
      this.claculateAllAmount();
    });
  }

  getTaxPersantage(i: number) {
    const taxId = this.accVouchersDTsList[i]?.taxId;
    this.priceOffersService.getTaxPersantage(taxId).subscribe((result: any) => {
      this.accVouchersDTsList[i].taxPerc = result || 0;
      this.claculateAllAmount();
    });
  }

  claculateAllAmount() {
    debugger
    let sumTotal = 0;
    let sumTax = 0;
    let sumAllTotal = 0;
    let SumDiscount = 0;

    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      const qty = Number(this.accVouchersDTsList[i].qty || 0);
      const price = Number(this.accVouchersDTsList[i].price || 0);
      const total = qty * price;

      let discount = Number(this.accVouchersDTsList[i].discount || 0);
      if (isNaN(discount)) discount = 0;

      let calculatedTax = ((total - discount) * Number(this.accVouchersDTsList[i].taxPerc || 0)) / 100;
      if (isNaN(calculatedTax)) calculatedTax = 0;

      const allTot = total - discount + calculatedTax;

      this.accVouchersDTsList[i].price = price.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].total = this.formatCurrency(isNaN(total) ? 0 : total);
      this.accVouchersDTsList[i].discount = discount.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].taxAmount = this.formatCurrency(calculatedTax);
      this.accVouchersDTsList[i].AllTotal = this.formatCurrency(isNaN(allTot) ? 0 : allTot);

      SumDiscount += discount;
      sumTotal += total;
      sumTax += calculatedTax;
      sumAllTotal += isNaN(allTot) ? 0 : allTot;
    }

    this.sumDiscount = this.formatCurrency(SumDiscount);
    this.totalNo = this.formatCurrency(sumTotal);
    this.taxAmount = this.formatCurrency(sumTax);
    this.AllTotal = this.formatCurrency(sumAllTotal);
  }

  DeleteQuotation(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((res) => {
      if (res.value) {
        this.priceOffersService.DeleteQuotation(id).subscribe((r: any) => {
          if (r === true || r?.isSuccess === true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['Quotations/PriceoffersList']);
          } else {
            if (r?.isSuccess === false && r?.message === 'msNoPermission') {
              this.alert.ShowAlert('msNoPermission', 'error');
              return;
            }
            this.alert.DeleteFaild();
          }
        });
      }
    });
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    const vt = this.VoucherTypeList.find(v => v.label === voucherTypeId);
    if (!vt) return;

    this.allowEditDate = vt.preventChangeDate;
    this.allowEditVoucherSerial = vt.preventChangeSerial;
    this.allowEditBranch = vt.preventChangeBranch;
  }

  clearFormdata() {
    this.newDate = new Date();

    this.QuotationForm.get('id')?.setValue(0);
    this.QuotationForm.get('note')?.setValue('');
    this.QuotationForm.get('branchId')?.setValue(0);
    this.QuotationForm.get('dealerId')?.setValue(0);
    this.QuotationForm.get('salesManId')?.setValue(0);
    this.QuotationForm.get('deliveryPeriod')?.setValue(0);
    this.QuotationForm.get('QuotationDTList')?.setValue([]);
    this.QuotationForm.get('generalAttachModelList')?.setValue([]);
    this.QuotationForm.get('paymentTerm')?.setValue(0);
    this.QuotationForm.get('validity')?.setValue(0);
    this.oppertunityId = 0;
    this.fromOpper = 0;
    if (this.childAttachment) this.childAttachment.data = [];

    this.QuotationForm.get('voucherDate')?.setValue(formatDate(this.newDate, 'yyyy-MM-dd', 'en-US'));

    this.accVouchersDTsList = [];
    this.unitsList = [];

    this.routePartsService.GuidToEdit = 0;
    this.routePartsService.Guid2ToEdit = "Add";
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate([], {
      queryParams: { oppertunityId: 0 },
      queryParamsHandling: 'merge'
    });
    this.claculateAllAmount();
  }

  CopyRow(row: any) {
    const newRow = {
      id: 0,
      hDId: 0,
      itemId: (this.allowAccRepeat === 61) ? 0 : row.itemId,
      unitId: (this.allowAccRepeat === 61) ? 0 : row.unitId,
      qty: row.qty,
      price: row.price,
      total: row.total,
      discount: row.discount,
      taxId: row.taxId,
      taxPerc: row.taxPerc,
      taxAmount: row.taxAmount,
      AllTotal: row.AllTotal,
      bonus: row.bonus,
      bonusUnitId: (this.allowAccRepeat === 61) ? 0 : row.bonusUnitId,
    };

    this.accVouchersDTsList.push(newRow);
    this.QuotationForm.get('QuotationDTList')?.setValue(this.accVouchersDTsList);

    const idx = this.accVouchersDTsList.length - 1;

    if (newRow.itemId && newRow.itemId > 0) {
      this.priceOffersService.GetItemUintbyItemId(newRow.itemId).subscribe((res: any[]) => {
        this.unitsList[idx] = res || [];

        const selectedUnit = this.unitsList[idx].find(x => +x.id === +newRow.unitId);
        this.accVouchersDTsList[idx].unitId = selectedUnit ? +selectedUnit.id : 0;

        const selectedBonusUnit = this.unitsList[idx].find(x => +x.id === +newRow.bonusUnitId);
        this.accVouchersDTsList[idx].bonusUnitId = selectedBonusUnit ? +selectedBonusUnit.id : 0;

        this.unitsList = [...this.unitsList];
        this.accVouchersDTsList = [...this.accVouchersDTsList];
        this.cdr.detectChanges();
      });
    } else {
      this.unitsList[idx] = [];
      this.unitsList = [...this.unitsList];
      this.accVouchersDTsList = [...this.accVouchersDTsList];
      this.cdr.detectChanges();
    }

    this.claculateAllAmount();
    return false;
  }

  handleF3Key(event: KeyboardEvent, row: any) {
    if (event.key === 'F4') this.CopyRow(row);
  }

  loadLazyOptions(event: any) {
    const { first, last } = event;

    if (!this.ItemsList) this.ItemsList = [];

    while (this.ItemsList.length < last) {
      this.ItemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.ItemsList[i] = this.ItemsList[i];
    }

    this.loading = false;
  }

  PrintQuotation(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptQuotationsAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptQuotationsEN?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  GetOpertuntiesItems(Id:any)
  {
    debugger
    if(Id > 0)
      {
        this.priceOffersService.GetOppertunitiesItems(Id).subscribe(res => 
        {
          debugger
          if(res.length> 0)
          {
            this.QuotationForm.get('dealerId')?.setValue(res[0].leadId);
            this.accVouchersDTsList = res || [];
          if (this.accVouchersDTsList !== undefined && this.accVouchersDTsList !== null) {
            let index = 0;
            this.accVouchersDTsList.forEach(element => {
              this.ItemsList.forEach(item => {
                if (item.id === element.itemId) {
                  this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                  index++;
                }
              });
            });
          } else {
            this.accVouchersDTsList = [];
          }
          this.claculateAllAmount();
          this.QuotationForm.get("QuotationDTList").setValue(this.accVouchersDTsList);
          }
        })   
      }
      else
      {
        this.accVouchersDTsList = [];
        this.QuotationForm.get("QuotationDTList").setValue(this.accVouchersDTsList);
        this.claculateAllAmount();
      }    
  } 


  VoucherNoBlur(voucherNo, voucherTypeId) {
    debugger
    if (!voucherNo) return;

    this.priceOffersService.IsValidVoucherNo(voucherNo, voucherTypeId).subscribe(res => {
      debugger
      if (res.id && res.id > 0) {

        this.voucherId = res.id;

        if (res.status == 66) {
          this.opType = "Edit";
          this.showsave = false;
          this.disableAll = false;
        }
        else if (res.status == 67 || res.status == 68) {
          this.opType = "Show";
          this.showsave = true;
        }

        this.GetQuotationInfo();

      } else {
        this.voucherId = 0;
        this.opType = "Add";
        this.showsave = false;
        this.disableAll = false;
        this.ClearAfterSave();
      }
    });
  }


}