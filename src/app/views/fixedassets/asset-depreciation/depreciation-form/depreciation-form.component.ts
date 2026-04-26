import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { DeprecationServiceService } from '../deprecation-service.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { AccVouchersHdModel } from '../../AssetPurchaseInvoice/AccVouchersHdModel';
import { formatDate } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import isThisHour from 'date-fns/esm/isThisHour/index';
import { isThisSecond } from 'date-fns';
import { E } from '@angular/cdk/keycodes';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-depreciation-form',
  templateUrl: './depreciation-form.component.html',
  styleUrls: ['./depreciation-form.component.scss']
})
export class DepreciationFormComponent implements OnInit {
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  public TitlePage: string;
  showLoader = false;
  loading: boolean;
  public voucherId: any;
  public opType: string;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  public Data: AccVouchersHdModel = new AccVouchersHdModel();
  DepreciationForm: FormGroup;
  public VoucherTypeList: any;
  public currencyList: any;
  public FixedAssetTypeList: any;
  public SelectFixedTypeList: number = 0;
  public AssestList: any;
  public CostCenterList: any;
  accVouchersDTsList: any[] = [];
  public AssetAmount: number;
  public Additions: number;
  public depreciationPersantage: number;
  public Decreases: number;
  public tfTotal: any;
  public Ammount: number;
  decimalPlaces: number;
  voucherNo: number = 0;
  disableAll:boolean=false;
//VoucherTypeSetting
  allowEditDate:boolean= false;
  allowEditVoucherSerial:boolean= false;
  allowEditBranch:boolean= false;
  useCostCenter: boolean;
  defaultCurrencyId: number;
  disableCurrRate:boolean;
  currentLang: string;
//End
  disableSave:boolean;
  disapleVoucherType: boolean = false;
  voucherType:any;
  Lang: string;
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
    private DeprecationServiceService: DeprecationServiceService,
    private dialog: MatDialog,
    private appCommonserviceService : AppCommonserviceService,
      private route: ActivatedRoute,) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.currentLang = this.jwtAuth.getLang();      
    this.voucherType ="Accounting";
   // this.voucherId = this.routePartsService.GuidToEdit;
    //this.opType = this.routePartsService.Guid2ToEdit;


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
          }
          else {
            this.voucherId = this.routePartsService.GuidToEdit;
            this.opType = this.routePartsService.Guid2ToEdit;
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

/*     const queryParams = new URLSearchParams(window.location.search);
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
    } */

    this.DepreciationForm = this.formbulider.group({
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
      depreciationMonth: [new Date()],
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
      FixedAssetType: [0],
      generalAttachModelList: [null],
    });

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['FixedAssetDepreciation/DepreciationList']);
    }
    this.GetAssetDepreciatioInfo();
  }

  GetAssetDepreciatioInfo() {    
    var lang = this.jwtAuth.getLang();
    this.DeprecationServiceService.GetInitailAssetDeprecation(this.voucherId, this.opType).subscribe(result => {
      
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['FixedAssetDepreciation/DepreciationList']);
          return;
        }

      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
      result.depreciationMonth = formatDate(result.faTransHD.depreciationMonth, "yyyy-MM-dd", "en-US");
      this.Data = result;
      this.DepreciationForm.patchValue(result);
      debugger
      this.VoucherTypeList = result.voucherTypeList.map((item) => ({
        label: item.id,
        value: lang == 'ar' ? item.voucherNameA : item.voucherNameE,
        isDefault: item.isDefault,
        branchId: item.branchId,
        preventChangeSerial: item.preventChangeSerial,
        preventChangeDate: item.preventChangeDate,
        preventChangeBranch:item.preventChangeBranch,
        serialType: item.serialType,
        currencyId: item.currencyId,
        serialByMonth: item.serialByMonth,
        printAfterSave: item.printAfterSave
      }));

      if (result.faTransDTModelList != null){
        this.accVouchersDTsList = result.faTransDTModelList;

      }
      else{
        this.accVouchersDTsList = [
          {                    
            assetId: 0,
            costCenterId: 0,
            assetAmount: 0,
            depreciationComplex: 0,
            additions: 0,
            decreases: 0,
            depreciationPersantage: 0,
            total: 0,               
          }
        ]
      }
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.FixedAssetTypeList = result.fixedAssetTypeList;
      this.AssestList = result.assestLists;
      this.CostCenterList = result.costCenterList;
      this.accVouchersDTsList = result.accVouchersDTModelList;   
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.childAttachment.ngOnInit();
      if(this.opType == 'Copy')
        {
          this.HideVoucher = true;
        }
        else
        {
          this.HideVoucher = false;
        }
      if (result.faTransDTModelList != null) {
        this.accVouchersDTsList = result.faTransDTModelList;
        this.tfTotal = result.amount;
      }
      else{
        // this.accVouchersDTsList = [
        //   {                    
        //     assetId: 0,
        //     costCenterId: 0,
        //     assetAmount: 0,
        //     depreciationComplex: 0,
        //     additions: 0,
        //     decreases: 0,
        //     depreciationPersantage: 0,
        //     total: 0,               
        //   }
        // ]
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.DepreciationForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if(this.opType == 'Edit')
        {
          this.disapleVoucherType = true;
        }

  
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        debugger
        if (this.voucherId > 0) {
          this.DepreciationForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.DepreciationForm.get("currencyId").setValue(result.currencyId);

          this.useCostCenter = result.useCostCenter;

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency]; 
            this.DepreciationForm.get("currencyId").setValue(result.currencyId);          
          }

          if(this.DepreciationForm.value.currencyId == this.defaultCurrencyId)
            {
              this.disableCurrRate = true;
            }
          else
            {
              this.disableCurrRate = false;
            }

        }
        else {
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.DepreciationForm.get("voucherTypeId").setValue(defaultVoucher);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.DepreciationForm.get("currencyId").setValue(defaultCurrency.id);
            this.DepreciationForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;

          if (this.DepreciationForm.value.currencyId == 0) {
            this.DepreciationForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.DepreciationForm.get("currRate").setValue(currRate);
          }

          if(this.DepreciationForm.value.currencyId == this.defaultCurrencyId)
            {
              this.disableCurrRate = true;
            }
          else
            {
              this.disableCurrRate = false;
            }
        }
        if(this.accVouchersDTsList.length>0){
          for(let i = 0; i < this.accVouchersDTsList.length; i++){
                this.accVouchersDTsList[i].assetAmount =  this.accVouchersDTsList[i].assetAmount.toFixed(3)
                this.accVouchersDTsList[i].depreciationComplex =  this.accVouchersDTsList[i].depreciationComplex.toFixed(3)
                this.accVouchersDTsList[i].additions = this.accVouchersDTsList[i].additions.toFixed(3)
                this.accVouchersDTsList[i].decreases =  this.accVouchersDTsList[i].decreases.toFixed(3) 
          }
        }
        this.GetVoucherTypeSetting(this.DepreciationForm.value.voucherTypeId)
         if(this.opType == 'Copy')
        {
          this.DepreciationForm.value.generalAttachModelList = [];
          this.childAttachment.data =[];
        }
      });
    });
  }


  isDisabled(assetId: any): boolean {
    const selectedAsset = this.AssestList.find(asset => asset.id === assetId);
    return selectedAsset ? selectedAsset.status == 97 : false;
  }
  
  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.VoucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.VoucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.VoucherTypeList.find(option => option.label === selectedValue).branchId;
    var voucherCategory = this.DepreciationForm.value.voucherTypeEnum;
    var voucherTypeId = this.DepreciationForm.value.voucherTypeId;
    var date = new Date(this.DepreciationForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.DeprecationServiceService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.DepreciationForm.get("voucherNo").setValue(results);
        }
        else {
          this.DepreciationForm.get("voucherNo").setValue(1);
        }
        this.DepreciationForm.get("branchId").setValue(branchId);
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
    if(voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined)
      {
        this.GetVoucherTypeSetting(voucherTypeId);
      }
      if( currencyId!= 0 && currencyId != null && currencyId != undefined)
        {
          this.DepreciationForm.get("currencyId").setValue(currencyId);
          var currRate = this.currencyList.find(option => option.id === currencyId).data1;
          this.DepreciationForm.get("currRate").setValue(currRate);
          if(this.DepreciationForm.value.currencyId == this.defaultCurrencyId)
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
          this.DepreciationForm.get("currencyId").setValue(this.defaultCurrencyId);
          var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
          this.DepreciationForm.get("currRate").setValue(currRate);    
          if(this.DepreciationForm.value.currencyId == this.defaultCurrencyId)
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
    this.DepreciationForm.get("currRate").setValue(currRate);
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

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('FormOfAssetDepreciationNotes');
    this.title.setTitle(this.TitlePage);
  }

  AddNewLine() {
    if(this.disableAll ==true)
      {
        return;
      }
    this.accVouchersDTsList.push(
      {
        assetId: 0,
        costCenterId: 0,
        assetAmount: 0,
        depreciationComplex: 0,
        additions: 0,
        decreases: 0,
        depreciationPersantage: 0,
        total: 0,
      });
    this.DepreciationForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
  }

  deleteRow(rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
      this.claculateAllAmount();
    }
  }

  getAssestInfo(assetId,i) {  
    debugger 
    const asset = this.AssestList.find(x => x.id == assetId);
      this.accVouchersDTsList[i].assetAmount = asset.amount.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].additions = asset.additions.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].depreciationPersantage = asset.depreciationPercentage.toFixed(3);
      this.accVouchersDTsList[i].decreases =asset.decreases.toFixed(this.decimalPlaces);
      this.accVouchersDTsList[i].depreciationComplex = asset.depreciationComplex.toFixed(this.decimalPlaces);
      this.claculateAllAmount();
  }

  claculateAllAmount() {
    var sumTotal = 0;
    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      debugger
      this.AssetAmount =  this.accVouchersDTsList[i].assetAmount;
      this.Additions =    this.accVouchersDTsList[i].additions;
      this.Decreases =   this.accVouchersDTsList[i].decreases;
 
      if (this.accVouchersDTsList[i].depreciationComplex == null) {
        this.accVouchersDTsList[i].depreciationComplex = 0;
        this.accVouchersDTsList[i].depreciationComplex =  this.accVouchersDTsList[i].depreciationComplex.toFixed(this.decimalPlaces);
      }

      var sum1 = ( this.AssetAmount * this.accVouchersDTsList[i].depreciationPersantage / 100) / 12;
      var sum2 = ( this.Additions   * this.accVouchersDTsList[i].depreciationPersantage / 100) / 12;
      var sum3 = ( this.Decreases   * this.accVouchersDTsList[i].depreciationPersantage / 100) / 12;

      var depreciationValue = sum1 + sum2 - sum3;
      this.accVouchersDTsList[i].total = depreciationValue.toFixed(this.decimalPlaces);
      sumTotal += parseFloat(depreciationValue.toFixed(3));

    }
    this.tfTotal = this.formatCurrency(sumTotal);
    this.Ammount = sumTotal;
  }

  CheckIfChooseSameAssest(i, row) {
    debugger
    for (let j = 0; j < this.accVouchersDTsList.length; j++) {
      if (i !== j && this.accVouchersDTsList[i].assetId === this.accVouchersDTsList[j].assetId) {
        this.alert.CanntSameAssestID();
        this.accVouchersDTsList[i] = [];
        break;
      }
    }
  }

  displayAllFixedAsset() {
    debugger
    var depreciationMonth = this.DepreciationForm.value.depreciationMonth;
    if (depreciationMonth = '') {
      this.alert.ShowAlert("msgSelectAllData", 'error');
      return;
    }
    else {
      var dateval = this.DepreciationForm.value.depreciationMonth;
      var catgId = this.SelectFixedTypeList;
      if(catgId > 0)
      {
        this.DeprecationServiceService.getFixedAssestModelListByCategory(catgId, dateval).subscribe((result) => {
          if (result.length > 0) {
            debugger
            var found = false;
            for (let i = 0; i < result.length; i++) {
              found = false
              for (let j = 0; j < this.accVouchersDTsList.length; j++) {
                  if (this.accVouchersDTsList[j].assetId === result[i].id) {
                    found = true;
                    break;
                  }
                }
              if(found == false){
                this.accVouchersDTsList.push(
                {
                  assetId: result[i].id,
                  assetAmount: result[i].amount.toFixed(3),
                  depreciationComplex: result[i].depreciationComplex.toFixed(3),
                  additions: result[i].additions.toFixed(3),
                  decreases: result[i].decreases.toFixed(3),
                  depreciationPersantage: result[i].depreciationPercentage,
                });
              }                         
            }
  
            this.claculateAllAmount();
          }
        });
      }
    }
  }

  onSubmit() {  
    let isValid = true;
    this.disableSave = true;
    if (this.accVouchersDTsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      isValid = false;
      this.disableSave = false;
      return;
    }

    this.accVouchersDTsList.forEach(element => {
      if (element.assetId == null || element.assetId <= 0) {   
        isValid = false;
        this.disableSave = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        return;
      }
    });
    if (isValid) {
      debugger
      this.DepreciationForm.value.fATransDTModelList = this.accVouchersDTsList;
      //this.DepreciationForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
      this.DepreciationForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.DepreciationForm.value.amount = this.tfTotal;
      this.DeprecationServiceService.saveFixedAssetDeprecationForm(this.DepreciationForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.DepreciationForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintFixedAssetDepreciation(Number(result.message));
          }

          this.ClearAfterSave();
          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['FixedAssetDepreciation/DepreciationList']);
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

  ClearAfterSave()
  {
   debugger
   this.tfTotal = 0;
   this.DepreciationForm.value.generalAttachModelList = [];
   this.childAttachment.data =[];
   setTimeout(() => {
   this.GetVoucherTypeSetting(this.DepreciationForm.value.voucherTypeId);
 });
  }

  GetVoucherTypeSetting(voucherTypeId:number)
    {
      debugger
      this.allowEditDate = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
      this.allowEditVoucherSerial = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial; 
      this.allowEditBranch =this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  PrintFixedAssetDepreciation(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `RptFixedAssetDepreciationAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptFixedAssetDepreciationEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
