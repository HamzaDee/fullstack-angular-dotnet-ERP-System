import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild ,ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { AsssestSalesInvoiceService } from '../asssest-sales-invoice.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { AccVouchersHdModel } from '../../AssetPurchaseInvoice/AccVouchersHdModel';
import { delay } from 'rxjs/operators';
import { DatePipe, formatDate } from '@angular/common';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { AssetSalesInvoiceSheetComponent } from '../asset-sales-invoice-sheet/asset-sales-invoice-sheet.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  providers: [DatePipe, AssetSalesInvoiceSheetComponent],
  selector: 'app-asset-sales-invoice-form',
  templateUrl: './asset-sales-invoice-form.component.html',
  styleUrls: ['./asset-sales-invoice-form.component.scss']
})
export class AssetSalesInvoiceFormComponent implements OnInit {
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  showLoader = false;
  loading: boolean;
  public voucherId: any;
  public opType: string;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  public Data: AccVouchersHdModel = new AccVouchersHdModel();
  AssetSalesInvoiceForm: FormGroup;
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
  accVouchersDTsList: any[] = [];
  public AssestList: any;
  public selectedAssest: number = 0;
  public CostCenterList: any;
  public selectedCostCenter: number = 0;
  public TaxModelList: any;
  public selectedTaxModel: number = 0;
  public totalNo: any;
  public taxAmount: any;
  public AllTotal: any;
  public taxPerc: number = 0;
  public disabled = false;
  Type: string;
  voucherNo: any;
  voucherType:any;
  showsave: boolean;
  decimalPlaces: number;
  disableAll: boolean = false;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  public TitlePage: string;
  useCostCenter: boolean;
  UseTax: boolean;
  defaultCurrencyId: number;
  pricewTax: number;
  isCash: number;
  disableCurrRate:boolean;
  disableSave:boolean;
  Lang: string;
  disapleVoucherType: boolean = false;
  NewDate : Date = new Date;
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
    private AsssestSalesInvoiceService: AsssestSalesInvoiceService,
    private dialog: MatDialog,
    private AssetSalesInvoiceSheetComponent: AssetSalesInvoiceSheetComponent,
    private route: ActivatedRoute,
    private appCommonserviceService: AppCommonserviceService,
    private cdr : ChangeDetectorRef) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.voucherType ="Accounting";
    this.AssetSalesInvoiceForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      voucherNo: ["", [Validators.required]],
      voucherDate: [new Date()],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      currRate: [0, [Validators.required, , this.greaterThanZeroValidator]],
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
      voucherTypeEnum: [0],
      accVouchersDocModelList: [null],
      accVouchersDTModelList: [null],
      generalAttachModelList: [null],
    });

    debugger
    this.route.queryParams.subscribe((params: Params) => {
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
      this.router.navigate(['AssetSalesInvoice/AssetSalesInvoice']);
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssetSalesInvoiceForm');
    this.title.setTitle(this.TitlePage);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetAssetPurchaseInvoiceInfo() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.AsssestSalesInvoiceService.GetInitailAssetSalesInvoice(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['AssetSalesInvoice/AssetSalesInvoice']);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")

      this.Data = result;
      this.AssetSalesInvoiceForm.patchValue(result);

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
      debugger
      this.accVouchersDTsList = result.faTransDTModelList;
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
     // this.SuppliersList = result.suppliersList;
      this.AssestList = result.assestList;
      this.CostCenterList = result.costCenterList;
      this.TaxModelList = result.taxModelLists;
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.childAttachment.ngOnInit();
      this.useCostCenter = result.useCostCenter;
      this.UseTax = result.useTax;
      if (result.faTransDTModelList != null) {
        debugger
        this.accVouchersDTsList = result.faTransDTModelList;

        this.accVouchersDTsList.forEach(element => {
          element.assetId = element.assetId;
          this.taxPerc = element.taxPerc;
          this.AllTotal = element.total;
          this.AssetSalesInvoiceForm.get("priceWithTax").setValue(result.faTransHD.priceWithTax);
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
        this.AssetSalesInvoiceForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if(this.opType == 'Edit')
        {
          this.disapleVoucherType = true;
        }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
      this.disableSave = false;
        debugger
        if (this.voucherId > 0) {
          this.AssetSalesInvoiceForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.AssetSalesInvoiceForm.get("currencyId").setValue(result.currencyId);
          this.AssetSalesInvoiceForm.get("branchId").setValue(result.branchId);
          this.AssetSalesInvoiceForm.get("creditAccountId").setValue(result.creditAccountId);
          this.AssetSalesInvoiceForm.get("dealerId").setValue(result.faTransHD.dealerId);
          this.AssetSalesInvoiceForm.get("isCash").setValue(result.faTransHD.isCash);
          this.AssetSalesInvoiceForm.get("priceWithTax").setValue(result.faTransHD.priceWithTax);

     /*      this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax; */

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.AssetSalesInvoiceForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.AssetSalesInvoiceForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          debugger
          this.AssetSalesInvoiceForm.get("branchId").setValue(result.defaultBranchId);
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.AssetSalesInvoiceForm.get("voucherTypeId").setValue(defaultVoucher);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.AssetSalesInvoiceForm.get("currencyId").setValue(defaultCurrency.id);
            this.AssetSalesInvoiceForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);


/*           this.useCostCenter = result.useCostCenter;
          this.UseTax = result.useTax; */

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.AssetSalesInvoiceForm.get("branchId").setValue(defaultBranche.id);
          }

          if (this.AssetSalesInvoiceForm.value.currencyId == 0) {
            this.AssetSalesInvoiceForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.AssetSalesInvoiceForm.get("currRate").setValue(currRate);
          }

        }
        this.GetVoucherTypeSetting(this.AssetSalesInvoiceForm.value.voucherTypeId);
        if(this.AssetSalesInvoiceForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
        else
          {
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
    var voucherCategory = this.AssetSalesInvoiceForm.value.voucherTypeEnum;
    var voucherTypeId = this.AssetSalesInvoiceForm.value.voucherTypeId;
    var date = new Date(this.AssetSalesInvoiceForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var creditAccountId = this.VoucherTypeList.find(option => option.label === selectedValue).creditAccountId;


    if (voucherTypeId > 0) {
      debugger
      this.AsssestSalesInvoiceService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.AssetSalesInvoiceForm.get("voucherNo").setValue(results);
        }
        else {
          this.AssetSalesInvoiceForm.get("voucherNo").setValue(1);
        }
        this.AssetSalesInvoiceForm.get("creditAccountId").setValue(creditAccountId);
        this.AssetSalesInvoiceForm.get("branchId").setValue(branchId);
      });

      if( currencyId!= 0 && currencyId != null && currencyId != undefined)
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
        }
        else
        {
          this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;            
        }
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if( currencyId!= 0 && currencyId != null && currencyId != undefined)
      {
        this.AssetSalesInvoiceForm.get("currencyId").setValue(currencyId);
        var currRate = this.currencyList.find(option => option.id === currencyId).data1;
        this.AssetSalesInvoiceForm.get("currRate").setValue(currRate);
        if(this.AssetSalesInvoiceForm.value.currencyId == this.defaultCurrencyId)
          {
            this.disableCurrRate = true;
          }
          else
          {
            this.disableCurrRate = false;
          }
      }
      else
      {
        this.AssetSalesInvoiceForm.get("currencyId").setValue(this.defaultCurrencyId);
        var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
        this.AssetSalesInvoiceForm.get("currRate").setValue(currRate);     
        if(this.AssetSalesInvoiceForm.value.currencyId == this.defaultCurrencyId)
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
    this.AssetSalesInvoiceForm.get("currRate").setValue(currRate);
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

  getTaxPersantage(i: number = 0, row) {
    debugger
    this.AsssestSalesInvoiceService.getTaxPersantage(this.accVouchersDTsList[i].taxId).subscribe((result) => {
      debugger
      this.accVouchersDTsList[i].taxPerc = result;
      this.claculateAllAmount();
    });
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
    this.AssetSalesInvoiceForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
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
      isValid = false;
      this.disableSave = false;
      return;
    }
    
    this.accVouchersDTsList.forEach(element => {
      if (element.assetId == null || element.assetId <= 0 || (element.qty == null || element.qty <= 0) || (element.price == null || element.price <= 0)) {
        isValid = false;
        this.disabled = true;
        this.disableSave = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        return;
      }
    });

    for (let i = 0; i < this.accVouchersDTsList.length; i++)
      {
        var IsTaxable = this.SuppliersList.find(x => x.id === this.AssetSalesInvoiceForm.value.dealerId).IsTaxable;
        if(IsTaxable == true && this.accVouchersDTsList[i].taxId == 0)
        {
          this.alert.ShowAlert("msgMustSelectTaxForDealer", 'error');
          isValid = true;
          this.disableSave = false;
          return false;
        }
      }

    if (isValid) {
      debugger
      this.disabled = true;
      this.AssetSalesInvoiceForm.value.fATransDTModelList = this.accVouchersDTsList;
      // this.AssetSalesInvoiceForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
      this.AssetSalesInvoiceForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.AssetSalesInvoiceForm.value.amount = this.AllTotal;
      this.AssetSalesInvoiceForm.value.accVouchersDTModelList = this.accVouchersDTsList;
      this.accVouchersDTsList.forEach(element => {
        debugger
        element.AllTotal = element.AllTotal.toString();
        this.AssetSalesInvoiceForm.value.costCenterId = element.costCenterId;
      });

      this.AsssestSalesInvoiceService.saveAssetSalessInvoiceForm(this.AssetSalesInvoiceForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.AssetSalesInvoiceForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintAssetSalesInvoice(Number(result.message));
          }

          this.ClearAfterSave();
          this.disabled = false;
          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['AssetSalesInvoice/AssetSalesInvoice']);
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

  ClearAfterSave()
  {  
    this.totalNo = 0;
    this.taxAmount = 0;
    this.AllTotal = 0; 
    this.AssetSalesInvoiceForm.value.generalAttachModelList = [];
    this.childAttachment.data =[];
   setTimeout(() => {
    this.GetVoucherTypeSetting(this.AssetSalesInvoiceForm.value.voucherTypeId);
  });
  }

  claculateAllAmount() {
    debugger
    let sumTotal = 0;
    let sumTax = 0;
    let sumAllTotal = 0;
    let calculatedTax = 0;
    let allTot = 0;


    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      const qty = this.accVouchersDTsList[i].qty;
      var price = parseFloat(this.accVouchersDTsList[i].price);
      var total = qty * price;

      this.accVouchersDTsList[i].price = price.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].total =this.formatCurrency(isNaN(total) ? 0 : total); 

      const perTax = this.accVouchersDTsList[i].taxPerc;

      if (perTax > 0) {
        if (this.AssetSalesInvoiceForm.value.priceWithTax) {
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
        allTot = total;
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

  DeleteAssetSalesInvoice(id: any) {
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
        this.AsssestSalesInvoiceService.deleteAssetSalesInvoice(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['AssetSalesInvoice/AssetSalesInvoice']);
            //this.GetAccVouchersHDList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.router.navigate(['AssetSalesInvoice/AssetSalesInvoice']);
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

  Print(id) {
    debugger
    this.AssetSalesInvoiceSheetComponent.Print(id);
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  
  PrintAssetSalesInvoice(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptAssetSalesInvoiceAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptAssetSalesInvoiceEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId , VoucherNo)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.AsssestSalesInvoiceService.IfExistVoucher(VoucherTypeId,VoucherNo).subscribe(res =>
          {
            debugger
            if(res.id > 0)
              {

                if(res.status ==  66)
                  {
                    this.voucherId =res.id;
                    this.opType = "Edit";
                    this.showsave = false;
                    this.AssetSalesInvoiceForm.get("generalAttachModelList").setValue([]); 
                    this.childAttachment.data = [];
                    this.disableAll = false;
                    this.cdr.detectChanges();
                    this.financialvoucher.ngOnInit()
                    this.GetAssetPurchaseInvoiceInfo();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    this.AssetSalesInvoiceForm.get("generalAttachModelList").setValue([]); 
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
                this.showsave = false;
                this.disableAll = false;
                this.disapleVoucherType = false;
                this.cdr.detectChanges();
                this.clearFormdata();               
              }
          })
          
          
      }
  }

  clearFormdata()
  {    
    this.NewDate = new Date;    
    this.AssetSalesInvoiceForm.get("id").setValue(0);
    this.AssetSalesInvoiceForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.AssetSalesInvoiceForm.get("note").setValue('');
    this.AssetSalesInvoiceForm.get("branchId").setValue(0);
    this.AssetSalesInvoiceForm.get("creditAccountId").setValue(0);
    this.AssetSalesInvoiceForm.get("dealerId").setValue(0);
    this.AssetSalesInvoiceForm.get("fATransDTModelList").setValue([]);
    this.AssetSalesInvoiceForm.get("assetId").setValue(0);
    this.AssetSalesInvoiceForm.get("costCenterId").setValue(0);
    this.AssetSalesInvoiceForm.get("qty").setValue(0);
    this.AssetSalesInvoiceForm.get("price").setValue(0);
    this.AssetSalesInvoiceForm.get("total").setValue(0);
    this.AssetSalesInvoiceForm.get("taxId").setValue(0);
    this.AssetSalesInvoiceForm.get("taxPerc").setValue(0); 
    this.AssetSalesInvoiceForm.get("accVouchersDocModelList").setValue([]);
    this.AssetSalesInvoiceForm.get("generalAttachModelList").setValue([]);  
    
    
    this.isCash = 0;
    this.AssetSalesInvoiceForm.get("isCash").setValue(false); 
    this.pricewTax = 0;    
    this.AssetSalesInvoiceForm.get("priceWithTax").setValue(false); 

    this.AssetSalesInvoiceForm.value.purInvoiceDTsList = [];     
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
    this.AssetSalesInvoiceForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
    this.claculateAllAmount();
   return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }

  getDealerAcc(event) {
    debugger
    if (event.value) {
      var acc = this.SuppliersList.find(option => option.id === event.value).data2;
      this.AssetSalesInvoiceForm.get("creditAccountId").setValue(acc);
    }
    else {
      if (event) {
        var acc = this.SuppliersList.find(option => option.id === event).data2;
        this.AssetSalesInvoiceForm.get("creditAccountId").setValue(acc);
      }
    }
  }
}
