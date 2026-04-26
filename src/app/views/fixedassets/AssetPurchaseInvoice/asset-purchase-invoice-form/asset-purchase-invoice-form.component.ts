import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild , ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { AssetPurchaseInvoiceService } from '../asset-purchase-invoice.service';
import { DatePipe, formatDate } from '@angular/common';
import { AccVouchersHdModel } from '../AccVouchersHdModel';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AssetPurchaseInvoiceSheetComponent } from '../asset-purchase-invoice-sheet/asset-purchase-invoice-sheet.component';
import { ActivatedRoute, Params ,Router } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  providers: [DatePipe, AssetPurchaseInvoiceSheetComponent],
  selector: 'app-asset-purchase-invoice-form',
  templateUrl: './asset-purchase-invoice-form.component.html',
  styleUrls: ['./asset-purchase-invoice-form.component.scss']
})
export class AssetPurchaseInvoiceFormComponent implements OnInit {
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  showLoader = false;
  loading: boolean;
  voucherId: any;
  public opType: string;
  AssetPurchaseInvoiceForm: FormGroup;
  public VoucherTypeList: any;
  public selectedVoucherType: number = 0;
  public branchesList: any;
  public selectedbranches: number = 0;
  public currencyList: any;
  public selectedcurrency: number = 0;
  public accountsList: any;
  public selectedaccounts: number = 0;
  public SuppliersList: any;
  public selectedeSuppliers: number = 0;
  public Data: AccVouchersHdModel = new AccVouchersHdModel();
  public AssestList: any;
  public selectedAssest: number = 0;
  public CostCenterList: any;
  public selectedCostCenter: number = 0;
  public TaxModelList: any;
  public selectedTaxModel: number = 0;
  accVouchersDTsList: any[] = [];
  public disabled = false;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  public totalNo: any;
  public taxPerc: number = 0;
  public taxAmount: any;
  public AllTotal: any;
  voucherNo: any;
  voucherType:any;
  Type: string;
  showsave: boolean;
  decimalPlaces: number;
  disableAll: boolean = false;
  public TitlePage: string;
  defaultCurrencyId: number;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  useCostCenter: boolean;
  UseTax: boolean;
  pricewTax: number;
  isCash: number;
  disableCurrRate: boolean;
  disableSave: boolean;
  Lang: string;
  disapleVoucherType: boolean = false;
  NewDate:Date = new Date;
  HideVoucher:boolean;
  
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private AssetPurchaseInvoiceService: AssetPurchaseInvoiceService,
    private dialog: MatDialog,
    private AssetPurchaseInvoiceSheetComponent: AssetPurchaseInvoiceSheetComponent,
    private route: ActivatedRoute,
    private appCommonserviceService: AppCommonserviceService,
    private cdr : ChangeDetectorRef) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.voucherType ="Accounting";
    this.AssetPurchaseInvoiceForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      voucherNo: ["", [Validators.required]],
      voucherDate: [new Date()],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      isCanceled: [false],
      isPosted: [false],
      note: [""],
      branchId: [0],
      amount: [0],
      status: [0],
      creditAccountId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],            // رقم الحساب 
      dealerId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],           // المورد 
      isCash: [false],      // نقدي
      priceWithTax: [false],     // السعر شامل الضريبه 
      fATransDTModelList: [null],
      assetId: [0],       //    رقم الاصل
      costCenterId: [0],      //  مركز التكلفه
      qty: [0],     //  الرقم
      price: [0],    //  السعر
      total: [0],   //المجموع
      taxId: [0],  //   الضريبه
      taxPerc: [0], //  نسبه الضريبه
      voucherTypeEnum: [99],
      accVouchersDocModel: [null],
      generalAttachModelList: [null],
    });


    debugger
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.voucherId = +params['voucherId'];
      this.opType = params.opType;
     });

     if (this.voucherId == null || this.voucherId == undefined || this.voucherId === 0 || isNaN(this.voucherId)) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }
    }
    //else {
      //this.voucherId = 0;
      //this.opType = 'Add';
      //this.showsave = false; 
    //}



 /*      if (params.showsave == "true") {
        this.showsave = true;
      }
      else {
        this.showsave = false;
      } */

/*       if (this.voucherNo > 0) {
        this.voucherId = params.voucherId;
        this.opType = params.opType;

      }
      else if (this.voucherNo == 0) {
        this.voucherId = 0;
        this.opType = 'Add';
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      } */

      // Check for valid voucherId values
   /*    if (this.voucherNo > 0 || this.voucherNo) {
        this.voucherId = this.voucherNo;
        this.opType = this.Type;
      } else {
        // Assign values from routePartsService if conditions aren't met
        this.voucherId = this.routePartsService.GuidToEdit || 0;
        this.opType = this.routePartsService.Guid2ToEdit || null;
      } */

      setTimeout(() => {
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else {
          this.disableAll = false;
        }
      });
      this.GetAssetPurchaseInvoiceInfo();

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceList']);
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssetPurchaseInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  CheckIfChooseSameAssest(i, row) {
    debugger
    for (let j = 0; j < this.accVouchersDTsList.length; j++) {
      if (i !== j && this.accVouchersDTsList[i].assetId === this.accVouchersDTsList[j].assetId) {
        this.disabled = true;
        this.alert.CanntSameAssestID();
        this.accVouchersDTsList[i].assetId = [];

        break;
      }
      else {
        this.disabled = false;

      }
    }
  }

  GetAssetPurchaseInvoiceInfo() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.AssetPurchaseInvoiceService.GetInitailAssetPurchaseInvoice(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceList']);
        // this.dialogRef.close(false);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      this.Data = result;
      this.AssetPurchaseInvoiceForm.patchValue(result);

      this.VoucherTypeList = result.voucherTypeList.map((item) => ({
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
        printAfterSave: item.printAfterSave
      }));

      this.SuppliersList = result.suppliersList.map((item) => ({
        id: item.id,
        text: item.text,
        data2: item.data2,
        IsTaxable: item.isTaxable,
      }));
       if(this.opType == 'Copy')
        {
          this.HideVoucher = true;
        }
        else
        {
          this.HideVoucher = false;
        }
      this.accVouchersDTsList = result.faTransDTModelList;
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      //this.SuppliersList = result.suppliersList;
      this.AssestList = result.assestList;
      this.CostCenterList = result.costCenterList;
      this.TaxModelList = result.taxModelList;
      this.accVouchersDTsList = result.accVouchersDTModelList;
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.childAttachment.ngOnInit();


      this.useCostCenter = result.useCostCenter;
      this.UseTax = result.useTax;

      if (result.faTransDTModelList != null) {
        debugger
        this.accVouchersDTsList = result.faTransDTModelList;

        this.accVouchersDTsList.forEach(element => {
          this.taxPerc = element.taxPerc;
          this.AllTotal = element.total;
          this.AssetPurchaseInvoiceForm.get("priceWithTax").setValue(result.faTransHD.priceWithTax);
          this.claculateAllAmount();
        });

      }
      else {
        this.accVouchersDTsList = [
          {
            assetId: 0,
            costCenterId: 0,
            qty: "",
            price: "",
            total: 0,
            taxId: 0,
            taxPerc: 0,
            taxAmount: 0,
            AllTotal: 0,
          }
        ]
      }


      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.AssetPurchaseInvoiceForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }


      if(this.opType == 'Edit')
      {
        this.disapleVoucherType = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.voucherId > 0) {
          debugger

          this.AssetPurchaseInvoiceForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.AssetPurchaseInvoiceForm.get("currencyId").setValue(result.currencyId);
          this.AssetPurchaseInvoiceForm.get("branchId").setValue(result.branchId);
          this.AssetPurchaseInvoiceForm.get("creditAccountId").setValue(result.creditAccountId);
          this.AssetPurchaseInvoiceForm.get("dealerId").setValue(result.faTransHD.dealerId);
          this.AssetPurchaseInvoiceForm.get("isCash").setValue(result.faTransHD.isCash);
          this.AssetPurchaseInvoiceForm.get("priceWithTax").setValue(result.faTransHD.priceWithTax);



          /*        this.useCostCenter = result.useCostCenter;
                 this.UseTax = result.useTax; */

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.AssetPurchaseInvoiceForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.AssetPurchaseInvoiceForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.AssetPurchaseInvoiceForm.get("branchId").setValue(result.defaultBranchId);
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.AssetPurchaseInvoiceForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.AssetPurchaseInvoiceForm.get("currencyId").setValue(defaultCurrency.id);
            this.AssetPurchaseInvoiceForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);

          /*      this.useCostCenter = result.useCostCenter;
               this.UseTax = result.useTax; */

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.AssetPurchaseInvoiceForm.get("branchId").setValue(defaultBranche.id);
          }
          if (this.AssetPurchaseInvoiceForm.value.currencyId == 0) {
            this.AssetPurchaseInvoiceForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.AssetPurchaseInvoiceForm.get("currRate").setValue(currRate);
          }
        }
        this.GetVoucherTypeSetting(this.AssetPurchaseInvoiceForm.value.voucherTypeId);
        if (this.AssetPurchaseInvoiceForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
      debugger
      if (result.contractsAttachments !== undefined && result.contractsAttachments !== null) {
        this.AssetPurchaseInvoiceForm.get("accVouchersDocModelList").setValue(result.contractsAttachments);
        this.childAttachment.data = result.contractsAttachments;
        this.childAttachment.ngOnInit();
      }
    });
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.VoucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.VoucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.VoucherTypeList.find(option => option.label === selectedValue).branchId;
    var voucherCategory = this.AssetPurchaseInvoiceForm.value.voucherTypeEnum;
    var voucherTypeId = this.AssetPurchaseInvoiceForm.value.voucherTypeId;
    var date = new Date(this.AssetPurchaseInvoiceForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var creditAccountId = this.VoucherTypeList.find(option => option.label === selectedValue).creditAccountId;


    if (voucherTypeId > 0) {

      this.AssetPurchaseInvoiceService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.AssetPurchaseInvoiceForm.get("voucherNo").setValue(results);
        }
        else {
          this.AssetPurchaseInvoiceForm.get("voucherNo").setValue(1);
        }
        this.AssetPurchaseInvoiceForm.get("creditAccountId").setValue(creditAccountId);
        this.AssetPurchaseInvoiceForm.get("branchId").setValue(branchId);

      });
      if (currencyId != 0 && currencyId != null && currencyId != undefined) {
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
      }
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.AssetPurchaseInvoiceForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.AssetPurchaseInvoiceForm.get("currRate").setValue(currRate);
      if (this.AssetPurchaseInvoiceForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.AssetPurchaseInvoiceForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.AssetPurchaseInvoiceForm.get("currRate").setValue(currRate);
      if (this.AssetPurchaseInvoiceForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.accVouchersDTsList.push(
      {
        assetId: 0,
        costCenterId: 0,
        qty: "",
        price: "",
        total: 0,
        taxId: 0,
        taxPerc: 0,
        taxAmount: 0,
        AllTotal: 0,
      });
    this.AssetPurchaseInvoiceForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
      this.claculateAllAmount();
    }
  }

  OnSaveForms() {
    debugger
    let isValid = true;
    this.disableSave = true;
    if (this.accVouchersDTsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      isValid = false;
      return;
    }

    this.accVouchersDTsList.forEach(element => {
      debugger
      if ((element.assetId == null || element.assetId <= 0) || (element.qty == null || element.qty <= 0) || (element.price == null || element.price <= 0)) {
        isValid = false;
        this.disabled = true;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }
    });

    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      var IsTaxable = this.SuppliersList.find(x => x.id === this.AssetPurchaseInvoiceForm.value.dealerId).IsTaxable;
      if (IsTaxable == true && this.accVouchersDTsList[i].taxId == 0) {
        this.alert.ShowAlert("msgMustSelectTaxForSupplier", 'error');
        isValid = true;
        this.disableSave = false;
        return false;
      }
    }

    debugger
    if (isValid) {
      this.disabled = true;
      this.AssetPurchaseInvoiceForm.value.fATransDTModelList = this.accVouchersDTsList;
      this.AssetPurchaseInvoiceForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.AssetPurchaseInvoiceForm.value.amount = this.AllTotal;
      this.AssetPurchaseInvoiceForm.value.accVouchersDTModelList = this.accVouchersDTsList;
      this.accVouchersDTsList.forEach(element => {
        debugger
        element.AllTotal = element.AllTotal.toString();
        this.AssetPurchaseInvoiceForm.value.costCenterId = element.costCenterId;
      });

      this.AssetPurchaseInvoiceService.saveAssetPurchaseInvoiceForm(this.AssetPurchaseInvoiceForm.value).subscribe((result) => {
        if (result.isSuccess == true) {
          debugger
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.AssetPurchaseInvoiceForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintPurchaseAssestInvoice(Number(result.message));
          }

          this.ClearAfterSave();
          this.disabled = false;
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
          this.disabled = false;
        }
        this.disableSave = false;
      });
    }
  }

  ClearAfterSave() {
    this.totalNo = 0;
    this.taxAmount = 0;
    this.AllTotal = 0;
    this.AssetPurchaseInvoiceForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.AssetPurchaseInvoiceForm.value.voucherTypeId);
    });
  }

  claculateAllAmount() {
    debugger
    let sumTotal = 0;
    let sumTax = 0;
    let sumAllTotal = 0;
    let allTot = 0;
    let calculatedTax = 0;

    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      debugger
      const qty = this.accVouchersDTsList[i].qty;
      var price = parseFloat(this.accVouchersDTsList[i].price);
      var total = qty * price;
      this.accVouchersDTsList[i].price = price.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].total = this.formatCurrency(isNaN(total) ? 0 : total);

      const perTax = this.accVouchersDTsList[i].taxPerc;

      if (perTax > 0) {
        if (this.AssetPurchaseInvoiceForm.value.priceWithTax) {
          calculatedTax = total - (total / (1 + perTax / 100));
          this.accVouchersDTsList[i].taxAmount = this.formatCurrency(calculatedTax);
          allTot = total + calculatedTax;
        }
        else {
          calculatedTax = (total * perTax) / 100;
          allTot = total + calculatedTax;
          this.accVouchersDTsList[i].taxAmount = this.formatCurrency(calculatedTax);
        }
      }
      else {
        calculatedTax = 0;
        allTot = isNaN(total) ? 0 : total;
        this.accVouchersDTsList[i].taxAmount = this.formatCurrency(calculatedTax);
      }

      this.accVouchersDTsList[i].AllTotal = this.formatCurrency(isNaN(allTot) ? 0 : allTot);

      sumTotal += total;
      sumTax += calculatedTax;
      sumAllTotal += allTot;
    }

    // Assign totals after the loop completes
    this.totalNo = this.formatCurrency(isNaN(sumTotal) ? 0 : sumTotal);
    this.taxAmount = this.formatCurrency(isNaN(sumTax) ? 0 : sumTax);
    this.AllTotal = this.formatCurrency(isNaN(sumAllTotal) ? 0 : sumAllTotal);
  }

  getTaxPersantage(i: number = 0) {
    this.AssetPurchaseInvoiceService.getTaxPersantage(this.accVouchersDTsList[i].taxId).subscribe((result) => {
      //this.taxPerc = result;
      this.accVouchersDTsList[i].taxPerc = result;
      this.claculateAllAmount();
    });
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.decimalPlaces = this.currencyList.find(option => option.id === selectedValue).data2;
    this.AssetPurchaseInvoiceForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  formatCurrency(value: number): string {
    debugger
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  DeleteAssetPurchaseInvoice(id: any) {
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
        this.AssetPurchaseInvoiceService.deleteAssetPurchaseInvoice(id).subscribe((results) => {

          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceList']);
            //this.GetAccVouchersHDList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceList']);
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  Print(id) {
    this.AssetPurchaseInvoiceSheetComponent.Print(id);
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  PrintPurchaseAssestInvoice(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptPurchaseAssestInvoiceAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptAssetPurchaseInvoiceEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId , VoucherNo)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.AssetPurchaseInvoiceService.IfExistVoucher(VoucherTypeId,VoucherNo).subscribe(res =>
          {
            debugger
            if(res.id > 0)
              {
                if(res.status ==  66)
                  {
                    this.voucherId =res.id;
                    this.opType = "Edit";
                    this.AssetPurchaseInvoiceForm.get("generalAttachModelList").setValue([]); 
                    this.childAttachment.data = [];
                    this.showsave = false;
                    this.disableAll = false;
                    this.cdr.detectChanges();
                    this.financialvoucher.ngOnInit()
                    this.GetAssetPurchaseInvoiceInfo();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    this.AssetPurchaseInvoiceForm.get("generalAttachModelList").setValue([]); 
                    this.childAttachment.data = [];
                    this.showsave = true;
                    this.cdr.detectChanges();
                    this.financialvoucher.ngOnInit()
                    this.GetAssetPurchaseInvoiceInfo();
                  }          
              }
              else
              {
                this.voucherId =0;
                this.opType = "Add";
                this.disapleVoucherType = false;
                this.disableAll = false;
                this.cdr.detectChanges();
                this.clearFormdata();               
              }
          })
          
          
      }
  }

  clearFormdata()
  {    
    this.NewDate = new Date;    
    this.AssetPurchaseInvoiceForm.get("id").setValue(0);
    this.AssetPurchaseInvoiceForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.AssetPurchaseInvoiceForm.get("note").setValue('');
    this.AssetPurchaseInvoiceForm.get("branchId").setValue(0);
    this.AssetPurchaseInvoiceForm.get("creditAccountId").setValue(0);
    this.AssetPurchaseInvoiceForm.get("dealerId").setValue(0);
    this.AssetPurchaseInvoiceForm.get("fATransDTModelList").setValue([]);
    this.AssetPurchaseInvoiceForm.get("assetId").setValue(0);
    this.AssetPurchaseInvoiceForm.get("costCenterId").setValue(0);
    this.AssetPurchaseInvoiceForm.get("qty").setValue(0);
    this.AssetPurchaseInvoiceForm.get("price").setValue(0);
    this.AssetPurchaseInvoiceForm.get("total").setValue(0);
    this.AssetPurchaseInvoiceForm.get("taxId").setValue(0);
    this.AssetPurchaseInvoiceForm.get("taxPerc").setValue(0); 
    this.AssetPurchaseInvoiceForm.get("accVouchersDocModel").setValue([]);
    this.AssetPurchaseInvoiceForm.get("generalAttachModelList").setValue([]);  
    
    
    this.isCash = 0;
    this.AssetPurchaseInvoiceForm.get("isCash").setValue(false); 
    this.pricewTax = 0;    
    this.AssetPurchaseInvoiceForm.get("priceWithTax").setValue(0); 

    this.AssetPurchaseInvoiceForm.value.purInvoiceDTsList = [];     
    this.childAttachment.data =[];
    this.accVouchersDTsList = [];
    this.taxAmount=0;
    this.AllTotal=0;
        
  }

  CopyRow(row,index)
  {
    debugger
    this.accVouchersDTsList.push(
      {
        assetId:0,
        costCenterId:row.costCenterId,
        qty:row.qty,
        price:row.price,
        total:row.total,
        taxId:row.taxId,
        taxPerc:row.taxPerc,
        taxAmount:row.taxAmount,
        AllTotal:row.AllTotal,
      });
    this.AssetPurchaseInvoiceForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
    this.claculateAllAmount();
   return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }
}
