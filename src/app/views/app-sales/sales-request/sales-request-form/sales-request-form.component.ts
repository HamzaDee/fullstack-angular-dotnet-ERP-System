import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { SalesRequestHDModel } from '../../SalesRequestHDModel';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { SalesRequestService } from '../sales-request.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { DatePipe, formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import { SalessRequstSheetComponent } from '../saless-requst-sheet/saless-requst-sheet.component';
import { ActivatedRoute, Params } from '@angular/router';
import { text } from 'stream/consumers';

@Component({
  providers: [DatePipe, SalessRequstSheetComponent],
  selector: 'app-sales-request-form',
  templateUrl: './sales-request-form.component.html',
  styleUrls: ['./sales-request-form.component.scss']
})
export class SalesRequestFormComponent implements OnInit {
  public showLoader: boolean;
  public loading: boolean;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  accVouchersDTsList: any[] = [];
  public Data: SalesRequestHDModel = new SalesRequestHDModel();
  SalesRequestForm: FormGroup;
  voucherTypeList: any;
  allowAccRepeat: any;
  decimalPlaces: number;
  public voucherId: any;
  public opType: string;
  public VoucherTypeList: any;
  public StoreList: any;
  public branchesList: any;
  public SuppliersList: any;
  public EmployeeList: any;
  public PDTermsList: any;
  public CurrencyList: any;
  public TypeRequestSalesList: any;
  public ItemsList: any;
  public unitesByItemList: any;
  public TaxModelLists: any;
  public requestPartyList: any;
  public unitsList: Array<any> = [];
  useStoreInGrid: boolean;
  public totalNo: any;
  public taxAmount: any;
  public AllTotal: any;
  public sumDiscount: any;
  sumTot: any;
  isdisabled: boolean = false;
  allUntiesList: any;
  showsave: boolean;
  voucherNo: number = 0;
  disableAll: boolean = false;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  itemsUnitList: any;
  public voucherTypeEnum = 43;
  public TitlePage: string;
  UseTax: boolean;
  defaultCurrencyId: number;
  allowMultiCurrency: boolean;
  //End
  disableCurrRate: boolean;
  lang: string;
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  newDate: any;
  voucherStoreId: number;
  oldItem: any;
  DefaultStoreId: number;
  OpportunitiesId: number;

  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private SalesRequestService: SalesRequestService,
    private router: Router,
    private route: ActivatedRoute,
    private routePartsService: RoutePartsService,
    private formbulider: FormBuilder,
    private appCommonserviceService: AppCommonserviceService,
    private SalessRequstSheetComponent: SalessRequstSheetComponent,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.disableSave = false;
    this.route.queryParams.subscribe((params: Params) => {
      this.voucherNo = params['voucher'] ? +params['voucher'] : 0;
      this.OpportunitiesId = params['id'] ? +params['id'] : 0;
    });

    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else if (this.voucherNo > 0 || this.OpportunitiesId > 0) {
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.SalesRequestForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      voucherNo: ["", [Validators.required]],
      voucherDate: [new Date(), [Validators.required]],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      currRate: [0, [Validators.required]],
      note: [""],
      branchId: [0],
      amount: [0],
      status: [0],
      storeId: [0],
      stampDate: [new Date()],
      userId: [0],
      dealerId: [0],
      salesManId: [0],
      paymentTerm: [0],
      deliveryPeriod: [0],
      requestType: [0],
      requestParty: [0],
      requestedBy: [0],
      opporId:[0],
      allowEditDelete: [false],
      SalesRequestDTList: [null],
      voucherTypeEnum: [0],
      generalAttachModelList: [null],
    });

    if ((this.voucherId == null || this.voucherId === "" || this.voucherId == undefined) && !this.OpportunitiesId) {
      this.router.navigate(['SalesRequest/SalessRequesList']);
      return;
    }
    this.GetSalesRequestInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesOrder');
    this.title.setTitle(this.TitlePage);
  }

  GetSalesRequestInfo() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.SalesRequestService.GetInitailSalesRequest(this.voucherId, this.opType, this.voucherTypeEnum).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['SalesRequest/SalessRequesList']);
        return;
      }

      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")

      this.VoucherTypeList = result.voucherTypeList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
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
        storeId: item.storeId,
        printAfterSave: item.printAfterSave
      }));

      this.ItemsList = result.itemsList.map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial
      }));

      this.SuppliersList = result.suppliersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));

      this.accVouchersDTsList = result.salesRequestDTList;

      this.StoreList = result.storeList;
      this.branchesList = result.userCompanyBranchList;
      //this.SuppliersList = result.suppliersList;
      this.EmployeeList = result.employeeList;
      this.PDTermsList = result.pdTermsList;
      this.CurrencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.TypeRequestSalesList = result.typeRequestSalesList;
      //this.ItemsList = result.itemsList;
      this.itemsUnitList = result.unitesByItemList;
      this.allUntiesList = result.unitList;
      this.TaxModelLists = result.taxModelLists;
      this.requestPartyList = result.requestPartyList;
      this.childAttachment.data = result.accVouchersDocModelList;
      this.useStoreInGrid = result.inventoryGeneralSetting.useStoreInGrid;
      this.childAttachment.ngOnInit();
      this.defaultCurrencyId = result.defaultCurrency;
      this.allowMultiCurrency = result.allowMultiCurrency;

      if (result.salesRequestDTList !== undefined && result.salesRequestDTList !== null) {
        debugger
        let index = 0;
        this.accVouchersDTsList = result.salesRequestDTList;
        this.accVouchersDTsList.forEach(element => {
          debugger
          this.ItemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              index++;
            }

          });
        })
      }
      else {
        this.accVouchersDTsList = [];
      }
      for (let i = 0; i < this.accVouchersDTsList.length; i++) {
        this.onChangeItem(this.accVouchersDTsList[i], i);
      }

      this.claculateAllAmount();
      this.UseTax = result.useTax;


      if (this.OpportunitiesId > 0) {
        this.SalesRequestService.getOpportunitiesInfo(this.OpportunitiesId).subscribe(res => {
          debugger
          this.SalesRequestForm.get("branchId").setValue(res.branchId);
          this.SalesRequestForm.get("dealerId").setValue(res.customerId);
          this.SalesRequestForm.get("salesManId").setValue(res.salesUserId);
          this.SalesRequestForm.get("opporId").setValue(this.OpportunitiesId);

          if (res.opportunityItemsDTsList !== undefined && res.opportunityItemsDTsList !== null) {
            debugger
            let index = 0;
            let sumTotal = 0;
            let sumTax = 0;
            let sumAllTotal = 0;
            let sumDiscount = 0;
            this.accVouchersDTsList = res.opportunityItemsDTsList.map(x => {

              this.accVouchersDTsList.forEach(element => {
                debugger
                this.ItemsList.forEach(item => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                    index++;
                  }
                });
              });

              const quantity = x.quantity || 0;
              const unitPrice = parseFloat(x.unitPrice) || 0;
              const discount = parseFloat(x.discount) || 0;
              const taxPerc = parseFloat(x.taxPerc) || 0;

              const total = quantity * unitPrice;
              const calculatedTax = ((total - discount) * taxPerc) / 100;
              const allTotal = total - discount + calculatedTax;


              sumTotal += total;
              sumTax += calculatedTax;
              sumAllTotal += allTotal;
              sumDiscount += discount;

              this.sumDiscount = this.formatCurrency(sumDiscount);
              this.totalNo = this.formatCurrency(sumTotal);
              this.taxAmount = this.formatCurrency(sumTax);
              this.AllTotal = this.formatCurrency(sumAllTotal);

              return {
                id: x.id,
                hDId: x.opportunityHDId,
                itemId: x.itemId,
                unitId: x.unitId,
                qty: quantity,
                price: unitPrice,
                total: total,
                discount: discount,
                taxId: x.taxId,
                taxAmount: calculatedTax,
                AllTotal: allTotal,
                storeId: this.voucherStoreId,
                bonus: 0,
                bonusUnitId: 0
              };
            });

            for (let i = 0; i < this.accVouchersDTsList.length; i++) {
              this.onChangeItem(this.accVouchersDTsList[i], i);
            }

            //this.claculateAllAmount();
          }
          else {
            this.accVouchersDTsList = [];
          }
        });
      }


      this.Data = result;
      this.SalesRequestForm.patchValue(result);


      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.SalesRequestForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        debugger
        if (this.voucherId > 0) {
          this.SalesRequestForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.SalesRequestForm.get("currencyId").setValue(result.currencyId);
          this.SalesRequestForm.get("branchId").setValue(result.branchId);
          this.SalesRequestForm.get("requestedBy").setValue(result.requestedBy);
          this.SalesRequestForm.get("dealerId").setValue(result.dealerId);
          this.SalesRequestForm.get("paymentTerm").setValue(result.paymentTerm);
          this.SalesRequestForm.get("salesManId").setValue(result.salesManId);
          this.SalesRequestForm.get("requestType").setValue(result.requestType);
          this.SalesRequestForm.get("SalesRequestDTList").setValue(result.salesRequestDTList);
          if (!this.useStoreInGrid) {
            this.SalesRequestForm.get("storeId").setValue(result.storeId);
          }

          // this.UseTax = result.useTax;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.CurrencyList = [defaultCurrency];
            this.SalesRequestForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.SalesRequestForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          debugger
          this.SalesRequestForm.get("branchId").setValue(result.defaultBranchId);
          // var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.SalesRequestForm.get("voucherTypeId").setValue(defaultVoucher);
          debugger
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.CurrencyList = [defaultCurrency];
            this.SalesRequestForm.get("currencyId").setValue(defaultCurrency.id);
            this.SalesRequestForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          //this.UseTax = result.useTax;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.SalesRequestForm.get("branchId").setValue(defaultBranche.id);
          }
          if (this.SalesRequestForm.value.currencyId == 0) {
            this.SalesRequestForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.CurrencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.SalesRequestForm.get("currRate").setValue(currRate);
          }

          this.SalesRequestForm.get("storeId").setValue(0);
          this.SalesRequestForm.get("dealerId").setValue(0);
          this.SalesRequestForm.get("requestedBy").setValue(0);
          this.SalesRequestForm.get("salesManId").setValue(0);
          this.SalesRequestForm.get("requestType").setValue(0);
          this.SalesRequestForm.get("paymentTerm").setValue(0);
          this.DefaultStoreId = result.defaultStoreId;
        }
        this.GetVoucherTypeSetting(this.SalesRequestForm.value.voucherTypeId);
        if (this.SalesRequestForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    });
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.VoucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.VoucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.VoucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.VoucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.SalesRequestForm.value.voucherTypeEnum;
    var voucherTypeId = this.SalesRequestForm.value.voucherTypeId;
    var date = new Date(this.SalesRequestForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.SalesRequestService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.SalesRequestForm.get("voucherNo").setValue(results);
        }
        else {
          this.SalesRequestForm.get("voucherNo").setValue(1);
        }
      });
    }
    debugger
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.decimalPlaces = this.CurrencyList.find(option => option.id === currencyId).data2;
    }
    else {
      this.decimalPlaces = this.CurrencyList.find(option => option.id === this.defaultCurrencyId).data2;
    }
    if (branchId == null || branchId == undefined) {
      branchId = 0;
      this.SalesRequestForm.get("branchId").setValue(branchId);
    }
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultiCurrency == true) {
      this.SalesRequestForm.get("currencyId").setValue(currencyId);
      var currRate = this.CurrencyList.find(option => option.id === currencyId).data1;
      this.SalesRequestForm.get("currRate").setValue(currRate);

      if (this.SalesRequestForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.SalesRequestForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.CurrencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.SalesRequestForm.get("currRate").setValue(currRate);

      if (this.SalesRequestForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any, CurrId: any) {
    debugger
    if (event.value > 0) {
      const selectedValue = event.value;
      var currRate = this.CurrencyList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.CurrencyList.find(option => option.id === selectedValue).data2;
      this.SalesRequestForm.get("currRate").setValue(currRate);

      if (event.value == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      const selectedValue = CurrId;
      var currRate = this.CurrencyList.find(option => option.id === selectedValue).data1;
      this.decimalPlaces = this.CurrencyList.find(option => option.id === selectedValue).data2;
      this.SalesRequestForm.get("currRate").setValue(currRate);

      if (event.value == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.accVouchersDTsList == null) {
      this.accVouchersDTsList = [];
    }

    this.accVouchersDTsList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,   // اسم الماده
        unitId: 0,   // الوحدة
        qty: "",   // الكميه
        price: "",   // السعر
        total: '',   // المجموع
        discount: "",   // خصم 
        taxId: 0,   // الضريبه
        taxAmount: '',   // قيمه الضريبه
        AllTotal: '',    // المجموع الصافي
        storeId: this.voucherStoreId,    // المستودع
        bonus: "",    // البونص
        bonusUnitId: 0,    // وحده البونص 
        // costCenterId:0, // الكلفه 
      });
    this.SalesRequestForm.get("SalesRequestDTList").setValue(this.accVouchersDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
    }
    this.claculateAllAmount();
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let isValid = true;
    if (this.accVouchersDTsList.length <= 0) {
      isValid = false;
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      return;
    }
    this.accVouchersDTsList.forEach(element => {
      if ((element.itemId == null || element.itemId <= 0)
        || (element.unitId == null || element.unitId <= 0)
        || (element.qty == null || element.qty <= 0)
        /*  || (element.storeId === '' || element.storeId === null || element.storeId <= 0) */) {
        isValid = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }
    });

    if (isValid) {
      // this.sumTot = 0.0;
      this.SalesRequestForm.get("SalesRequestDTList").setValue(this.accVouchersDTsList);
      this.sumTot = 0; // Initialize sumTot to ensure it's not undefined
      this.accVouchersDTsList.forEach(element => {
        debugger;
        // Remove commas and convert element.AllTotal to a number before adding it to sumTot
        let total = Number(element.AllTotal);
        if (!isNaN(total)) {
          this.sumTot += total;
        } else {
          this.disableSave = false;
          console.warn(`Invalid number: ${element.AllTotal}`);
        }
      });


      if (this.SalesRequestForm.value.dealerId != 0 && this.SalesRequestForm.value.dealerId != null) {
        for (let i = 0; i < this.accVouchersDTsList.length; i++) {
          var IsTaxable = this.SuppliersList.find(x => x.id === this.SalesRequestForm.value.dealerId).IsTaxable ?? 0;
          if (IsTaxable == true && this.accVouchersDTsList[i].taxId == 0) {
            this.alert.ShowAlert("msgMustSelectTaxForDealer", 'error');
            isValid = true;
            this.disableSave = false;
            return false;
          }
        }

      }



      debugger
      for (let i = 0; i < this.accVouchersDTsList.length; i++) {
        const element = this.accVouchersDTsList[i];
        if (element.bonus > 0 && (element.bonusUnitId == 0 || element.bonusUnitId == null)) {
          this.alert.ShowAlert("PleaseInsertBounsUnit", 'error');
          this.disableSave = false;
          return false;
        }
        else if (element.bonusUnitId > 0 && (element.bonus == 0 || element.bonus == null)) {
          this.alert.ShowAlert("PleaseInsertBouns", 'error');
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
      // this.SalesRequestDTList.forEach(element => {
      //   debugger
      //   element.AllTotal= element.AllTotal;
      //   this.sumTot = this.sumTot + element.AllTotal;

      // });
      this.SalesRequestForm.get("amount").setValue(this.sumTot);
      //this.SalesRequestForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
      this.SalesRequestForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.SalesRequestForm.value.companyId = this.jwtAuth.getCompanyId();
      this.SalesRequestForm.value.userId = this.jwtAuth.getUserId();
      if (!this.useStoreInGrid) {
        let storeId = this.SalesRequestForm.value.storeId;
        if (this.accVouchersDTsList.length > 0) {
          for (let i = 0; i < this.accVouchersDTsList.length; i++) {
            this.accVouchersDTsList[i].storeId = storeId;
          }
        }
      }

      this.SalesRequestService.saveSalesRequestForm(this.SalesRequestForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.SalesRequestForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintSalesRequest(Number(result.message));
          }


          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['SalesRequest/SalessRequesList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      });
    }
  }

  ClearAfterSave() {
    this.SalesRequestForm.value.generalAttachModelList = [];
    this.accVouchersDTsList = [];
    this.childAttachment.data = [];
    this.clearFormdata();
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.SalesRequestForm.value.voucherTypeId);
    });
  }

  onChangeItem(Row, i) {
    debugger
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
    }

    this.SalesRequestService.GetItemUintbyItemId(Row.itemId).subscribe(res => {
      debugger
      this.unitsList[i] = res;
      if(this.OpportunitiesId > 0)
        {
          let unit = this.unitsList[i].find(r => r.id == Row.unitId);
          if (unit == 0 || unit == undefined || unit == null) {
            this.accVouchersDTsList[i].unitId = 0;
            return;
          }
          if (this.accVouchersDTsList[i].unitId != 0) {
            this.accVouchersDTsList[i].unitId = Row.unitId;
          }
          return;
        }
      if (res.length == 2) {
        this.accVouchersDTsList[i].unitId = res[1].id;
      }
      else if (this.opType == "Edit" || this.opType == "Show") {
        /*             if (this.oldItem != Row.itemId) {
                      this.accVouchersDTsList[i].unitId = 0;
                      return;
                    }  */
        let unit = this.unitsList[i].find(r => r.id == Row.unitId);
        if (unit == 0 || unit == undefined || unit == null) {
          this.accVouchersDTsList[i].unitId = 0;
          return;
        }
        if (this.accVouchersDTsList[i].unitId != 0) {
          this.accVouchersDTsList[i].unitId = Row.unitId;
        }
      }
      else {
        this.accVouchersDTsList[i].unitId = res[0].id;
      }
      // this.oldItem =Row.itemId;
    });

    if (this.accVouchersDTsList.length > 0) {
      let isDuplicate = false;
      for (let m = 0; m < this.accVouchersDTsList.length; m++) {
        if (this.accVouchersDTsList[m].itemId == Row.itemId && i != m) {
          isDuplicate = true;

          if (this.allowAccRepeat == 61) {
            this.alert.ShowAlert("msgCantAddSameItemForThisVoucherType", 'error');
            break;
          } else if (this.allowAccRepeat == 60) {
            this.alert.ShowAlert("msgTheItemRepeatedReminder", 'error');
            break;
          }
        }
      }
      if (isDuplicate && this.allowAccRepeat == 61) {
        this.accVouchersDTsList[i] = {
          ...this.accVouchersDTsList[i],
          itemId: 0
        };
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.useStoreInGrid == true && this.opType == 'Add') {
      var selectedItem = this.ItemsList.find(x => x.id === Row.itemId);

      if (selectedItem && selectedItem.storeId > 0) {
        var defaultStoreNo = selectedItem.storeId;
        this.accVouchersDTsList[i].storeId = defaultStoreNo;
        this.cdr.detectChanges();
      }
      else {
        // this.accVouchersDTsList[i].storeId = 0;
        this.cdr.detectChanges();
      }
    }
  }

  onChangeCost(itemId, unitId, i) {
    debugger
    this.SalesRequestService.GetPriceUnit(itemId, unitId).subscribe(res => {
      debugger
      this.accVouchersDTsList[i].price = res;
      this.accVouchersDTsList[i].price = this.accVouchersDTsList[i].price.toFixed(this.decimalPlaces);
    });

    /* var price = this.allUntiesList.find(option => option.data2 === unitId)?.data1;
    this.SalesRequestDTList[i].price = parseFloat(price);
    this.SalesRequestDTList[i].price = this.SalesRequestDTList[i].price.toFixed(this.decimalPlaces); */
  }

  getTaxPersantage(i: number = 0, row) {

    this.SalesRequestService.getTaxPersantage(this.accVouchersDTsList[i].taxId).subscribe((result) => {
      debugger
      this.accVouchersDTsList[i].taxPerc = result;
      this.claculateAllAmount();
    });
  }

  claculateAllAmount() {
    debugger
    let calculatedTax = 0;
    let allTot = 0;
    let sumTotal = 0;
    let sumTax = 0;
    let sumAllTotal = 0;
    let SumDiscount = 0;

    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      const qty = this.accVouchersDTsList[i].qty;
      var price = parseFloat(this.accVouchersDTsList[i].price);
      var total = qty * price;
      var discount = parseFloat(this.accVouchersDTsList[i].discount);
      if (isNaN(discount)) {
        discount = 0;
      }
      calculatedTax = ((total - discount) * this.accVouchersDTsList[i].taxPerc) / 100;
      if (isNaN(calculatedTax)) {
        calculatedTax = 0;
      }


      this.accVouchersDTsList[i].price = price.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].total = this.formatCurrency(isNaN(total) ? 0 : total);
      this.accVouchersDTsList[i].discount = parseFloat(this.accVouchersDTsList[i].discount).toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].taxAmount = this.formatCurrency(calculatedTax);
      this.accVouchersDTsList[i].AllTotal = (total - discount + calculatedTax);


      allTot = total - discount + calculatedTax;
      if (isNaN(allTot)) {
        allTot = 0;
      }


      this.accVouchersDTsList[i].AllTotal = this.formatCurrency(this.accVouchersDTsList[i].AllTotal);

      SumDiscount += discount;
      sumTotal += total;
      sumTax += calculatedTax;
      sumAllTotal += allTot;
    }

    if (isNaN(sumTotal)) {
      sumTotal = 0;
    }
    if (isNaN(sumTax)) {
      sumTax = 0;
    }
    if (isNaN(sumAllTotal)) {
      sumAllTotal = 0;
    }

    // Assign totals after the loop completes
    this.sumDiscount = this.formatCurrency(SumDiscount);
    this.totalNo = this.formatCurrency(sumTotal);
    this.taxAmount = this.formatCurrency(sumTax);
    this.AllTotal = this.formatCurrency(sumAllTotal);
  }

  CheckIfChooseSameUnit(i, row) {
    debugger
    for (let j = 0; j < this.accVouchersDTsList.length; j++) {
      if (i !== j && this.accVouchersDTsList[i].itemId === this.accVouchersDTsList[j].itemId) {
        //  this.alert.CanntSameItem();
        this.accVouchersDTsList[i].itemId = [];
        break;
      }

    }
  }

  DeleteSalesRequest(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.SalesRequestService.deleteSalesRequest(id).subscribe((result) => {
          debugger
          if (result.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['SalesRequest/SalessRequesList']);
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteFaild();
            }

          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  Print(id) {
    debugger
    this.SalessRequstSheetComponent.Print(id);
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.VoucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.VoucherTypeList != undefined && this.voucherStoreId != null) {
        this.SalesRequestForm.get("storeId").setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.SalesRequestForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.SalesRequestForm.get("storeId").setValue(0);
      }
    }

  }

  PrintSalesRequest(id: number) {
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {
      const reportUrl = `rptSalesRequestAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptSalesRequestEn?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }

  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.SalesRequestService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.SalesRequestForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.GetSalesRequestInfo();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.SalesRequestForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.GetSalesRequestInfo();
          }
        }
        else {
          this.clearFormdata();
          this.disableAll = false;
          this.disapleVoucherType = false;
          this.showsave = false;
        }
      })

    }
  }

  clearFormdata() {
    this.newDate = new Date;
    this.SalesRequestForm.get("id").setValue(0);
    this.SalesRequestForm.get("note").setValue('');
    this.SalesRequestForm.get("branchId").setValue(0);
    this.SalesRequestForm.get("storeId").setValue(0);
    this.SalesRequestForm.get("dealerId").setValue(0);
    this.SalesRequestForm.get("salesManId").setValue(0);
    this.SalesRequestForm.get("deliveryPeriod").setValue('');
    this.SalesRequestForm.get("requestType").setValue(0);
    this.SalesRequestForm.get("requestParty").setValue(0);
    this.SalesRequestForm.get("requestedBy").setValue('');
    this.SalesRequestForm.get("SalesRequestDTList").setValue([]);
    this.SalesRequestForm.get("generalAttachModelList").setValue([]);
    this.SalesRequestForm.get("paymentTerm").setValue(0);
    this.childAttachment.data = [];
    this.SalesRequestForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.accVouchersDTsList = [];
    this.claculateAllAmount();
  }

  CopyRow(row, index) {
    debugger
    let inds = 0;
    if (this.accVouchersDTsList.length == 1) {
      inds = 1;
    }
    else {
      inds = this.accVouchersDTsList.length;
    }
    if (this.allowAccRepeat == 61) {
      this.accVouchersDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: 0,
          unitId: 0,
          qty: row.qty,
          price: row.price,
          total: row.total,
          discount: row.discount,
          taxId: row.taxId,
          taxAmount: row.taxAmount,
          AllTotal: row.AllTotal,
          storeId: row.storeId,
          bonus: row.bonus,
          bonusUnitId: row.bonusUnitId,
        });
      this.SalesRequestForm.get("SalesRequestDTList").setValue(this.accVouchersDTsList);
      setTimeout(() => {
        this.unitsList[inds] = [];
      });
    }
    else {
      this.accVouchersDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          qty: row.qty,
          price: row.price,
          total: row.total,
          discount: row.discount,
          taxId: row.taxId,
          taxAmount: row.taxAmount,
          AllTotal: row.AllTotal,
          storeId: row.storeId,
          bonus: row.bonus,
          bonusUnitId: row.bonusUnitId,
        });
      this.SalesRequestForm.get("SalesRequestDTList").setValue(this.accVouchersDTsList);
    }
    setTimeout(() => {
      this.SalesRequestService.GetItemUintbyItemId(row.itemId).subscribe(res => {
        this.unitsList[inds] = res;
      });
    });
    this.claculateAllAmount();
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }

  loadLazyOptions(event: any) {
    debugger
    const { first, last } = event;
    

    // Don't replace the full list; copy and fill only the needed range
    if (!this.ItemsList) {
      this.ItemsList = [];
    }

    // Make sure the array is large enough
    while (this.ItemsList.length < last) {
      this.ItemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.ItemsList[i] = this.ItemsList[i];
    }

    this.loading = false;
  }
}
