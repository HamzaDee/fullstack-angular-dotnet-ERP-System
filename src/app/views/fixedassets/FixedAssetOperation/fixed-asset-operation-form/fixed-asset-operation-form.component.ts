import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccVouchersHdModel } from '../../AssetPurchaseInvoice/AccVouchersHdModel';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { FixedAssetOperationService } from '../fixed-asset-operation.service';
import { DatePipe, formatDate } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { FixedAssetOperationSheetComponent } from '../fixed-asset-operation-sheet/fixed-asset-operation-sheet.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  providers: [DatePipe, FixedAssetOperationSheetComponent],
  selector: 'app-fixed-asset-operation-form',
  templateUrl: './fixed-asset-operation-form.component.html',
  styleUrls: ['./fixed-asset-operation-form.component.scss']
})
export class FixedAssetOperationFormComponent implements OnInit {
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  FixedAssetOperationForm: FormGroup;
  public Data: AccVouchersHdModel = new AccVouchersHdModel();
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  public voucherId: any;
  public opType: string;
  showLoader = false;
  loading: boolean;
  public VoucherTypeList: any;
  public branchesList: any;
  public currencyList: any;
  public SuppliersList: any;
  public OperationList: any;
  public accountsList: any;
  public AssestList: any;
  public disabled = false;
  accVouchersDTsList: any[] = [];
  public assestAmount: number;
  public PrevUpdate: number;
  public BookValue: number;
  public tfTotal: any;
  public Amount: number;
  public additionsAmt: number;
  public decreasesAmt: number;
  voucherNo: any;
  Type: string;
  decimalPlaces: number;
  showsave: boolean;
  disableAll: boolean = false;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  public TitlePage: string;
  disableCurrRate: boolean;
  defaultCurrencyId: number;
  disableSave: boolean;
  Lang: string;
  disapleVoucherType: boolean = false;
  voucherType: any;
  NewDate: Date = new Date;
  HideVoucher: boolean;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private FixedAssetOperationService: FixedAssetOperationService,
    private dialog: MatDialog,
    private FixedAssetOperationSheetComponent: FixedAssetOperationSheetComponent,
    private route: ActivatedRoute,
    private appCommonserviceService: AppCommonserviceService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.voucherType = "Accounting";
    this.FixedAssetOperationForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      voucherNo: ["", [Validators.required]],
      voucherDate: [new Date()],
      branchId: [0],
      currencyId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      currRate: [0, [Validators.required, , this.greaterThanZeroValidator]],
      creditAccountId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],            // رقم الحساب 
      DealerId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],           // المورد 
      note: [""],
      assetId: [0],
      total: [0],
      assetAmount: [0],
      additions: [0],
      decreases: [0],
      isCanceled: [false],
      isPosted: [false],
      status: [0],
      amount: [0],
      voucherTypeEnum: [0],
      fATransDTModelList: [null],
      accVouchersDocModelList: [null],
      accVouchersDTModelList: [null],
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

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['FixedAssetOperation/FixedAssetOperationList']);
    }
    this.GetAssetOperationInfo();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('FixedAssetOperationForm');
    this.title.setTitle(this.TitlePage);
  }

  GetAssetOperationInfo() {

    var lang = this.jwtAuth.getLang();
    this.FixedAssetOperationService.GetInitailAssetOperation(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['FixedAssetOperation/FixedAssetOperationList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      this.Data = result;
      this.FixedAssetOperationForm.patchValue(result);

      // if (this.voucherId > 0) {
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



      if (this.opType == 'Copy') {
        this.HideVoucher = true;
        this.FixedAssetOperationForm.value.generalAttachModelList = [];
        this.childAttachment.data = [];
      }
      else {
        this.HideVoucher = false;
      }

      debugger
      this.OperationList = result.operationList;
      this.accVouchersDTsList = result.faTransDTModelList;
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.accountsList = result.accountList;
      this.SuppliersList = result.suppliersList;
      this.childAttachment.data = result.accVouchersDocModelList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.childAttachment.ngOnInit();
      this.AssestList = result.assestLists;


      if (result.faTransDTModelList != null) {
        this.accVouchersDTsList.forEach(element => {
          this.accVouchersDTsList = result.faTransDTModelList;
          for (let i = 0; i < this.accVouchersDTsList.length; i++) {
            this.accVouchersDTsList[i].assetAmount = this.accVouchersDTsList[i].assetAmount;
            this.accVouchersDTsList[i].assetAmount = Number(this.accVouchersDTsList[i].assetAmount.toFixed(this.decimalPlaces));
            this.accVouchersDTsList[i].PrevUpdate = this.accVouchersDTsList[i].additions - this.accVouchersDTsList[i].decreases;
            this.accVouchersDTsList[i].BookValue = this.accVouchersDTsList[i].assetAmount + this.accVouchersDTsList[i].additions - this.accVouchersDTsList[i].decreases;
          }
          this.claculateAllAmount();
        });
      }
      else {
        this.accVouchersDTsList = [
          {
            assetId: 0,
            total: "",
            assetAmount: 0,
            additions: 0,
            decreases: 0,
            note: '',
            PrevUpdate: 0,
            BookValue: 0,
          }
        ]
      }

      debugger
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.FixedAssetOperationForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.voucherId > 0) {
          this.FixedAssetOperationForm.get("voucherTypeEnum").setValue(result.voucherTypeEnum);
          this.FixedAssetOperationForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.FixedAssetOperationForm.get("currencyId").setValue(result.currencyId);
          this.FixedAssetOperationForm.get("branchId").setValue(result.branchId);
          this.FixedAssetOperationForm.get("creditAccountId").setValue(result.creditAccountId);
          this.FixedAssetOperationForm.get("DealerId").setValue(result.faTransHD.dealerId);
          this.FixedAssetOperationForm.get("assetId").setValue(result.faTransDTModelList.assetId);

          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.FixedAssetOperationForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.FixedAssetOperationForm.get("branchId").setValue(result.branchId);
          }

          if (this.FixedAssetOperationForm.value.currencyId == this.defaultCurrencyId) {
            this.disableCurrRate = true;
          }
          else {
            this.disableCurrRate = false;
          }

        }
        else {
          debugger
          this.FixedAssetOperationForm.get("branchId").setValue(result.defaultBranchId);
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.FixedAssetOperationForm.get("voucherTypeId").setValue(defaultVoucher);


          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.FixedAssetOperationForm.get("currencyId").setValue(defaultCurrency.id);
            this.FixedAssetOperationForm.get("currRate").setValue(defaultCurrency.data1);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.FixedAssetOperationForm.get("branchId").setValue(defaultBranche.id);
          }

          this.getVoucherNo(defaultVoucher);


          if (this.FixedAssetOperationForm.value.currencyId == 0) {
            this.FixedAssetOperationForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.FixedAssetOperationForm.get("currRate").setValue(currRate);
          }

          if (this.FixedAssetOperationForm.value.currencyId == this.defaultCurrencyId) {
            this.disableCurrRate = true;
          }
          else {
            this.disableCurrRate = false;
          }

          if (result.voucherTypeEnum != 0 || result.voucherTypeEnum != null) {
            this.FixedAssetOperationService.getVoucherType(result.voucherTypeEnum).subscribe((result) => {
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
            });
          }
          debugger
          var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.FixedAssetOperationForm.get("voucherTypeId").setValue(defaultVoucher);

        }

        this.GetVoucherTypeSetting(this.FixedAssetOperationForm.value.voucherTypeId);

        if (this.opType == 'Copy') {
          this.FixedAssetOperationForm.value.generalAttachModelList = [];
          this.childAttachment.data = [];
        }

      });
    });
  }

  isDisabled(assetId: any): boolean {
    const selectedAsset = this.AssestList.find(asset => asset.id === assetId);
    return selectedAsset ? selectedAsset.status == 97 : false;
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.VoucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.VoucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.VoucherTypeList.find(option => option.label === selectedValue).branchId;
    var voucherCategory = this.FixedAssetOperationForm.value.voucherTypeEnum;
    var voucherTypeId = this.FixedAssetOperationForm.value.voucherTypeId;
    var date = new Date(this.FixedAssetOperationForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var creditAccountId = this.VoucherTypeList.find(option => option.label === selectedValue).creditAccountId;

    if (voucherTypeId > 0) {

      this.FixedAssetOperationService.GetSerialOpeningBalance(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.FixedAssetOperationForm.get("voucherNo").setValue(results);
        }
        else {
          this.FixedAssetOperationForm.get("voucherNo").setValue(1);
        }
        this.FixedAssetOperationForm.get("creditAccountId").setValue(creditAccountId);
        this.FixedAssetOperationForm.get("branchId").setValue(branchId);
      });

      if (currencyId != 0 && currencyId != null && currencyId != undefined) {
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
      }
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }

    if (currencyId != 0 && currencyId != null && currencyId != undefined) {
      this.FixedAssetOperationForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.FixedAssetOperationForm.get("currRate").setValue(currRate);
      if (this.FixedAssetOperationForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.FixedAssetOperationForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.FixedAssetOperationForm.get("currRate").setValue(currRate);
      if (this.FixedAssetOperationForm.value.currencyId == this.defaultCurrencyId) {
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
    this.FixedAssetOperationForm.get("currRate").setValue(currRate);
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

  getVoucherType(event: any) {
    debugger
    var lang = this.jwtAuth.getLang();
    const selectedValue = event.value;
    debugger
    this.FixedAssetOperationService.getVoucherType(selectedValue).subscribe((result) => {
      debugger
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

      const defaultItem = this.VoucherTypeList.find(v => v.isDefault);
      if (defaultItem) {
          this.FixedAssetOperationForm.get('voucherTypeId')?.setValue(defaultItem.label); 

          if(defaultItem.currencyId == null)
          {
             this.FixedAssetOperationForm.get("currencyId").setValue(this.defaultCurrencyId);
             var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
             this.FixedAssetOperationForm.get("currRate").setValue(currRate);          }
          else
          {
             this.FixedAssetOperationForm.get('currencyId')?.setValue(defaultItem.currencyId); 
          }
      }
    });
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.accVouchersDTsList.push(
      {
        assetId: 0,
        total: "",
        assetAmount: 0,
        additions: 0,
        decreases: 0,
        note: '',
        PrevUpdate: 0,
        BookValue: 0,
      });
    this.FixedAssetOperationForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
      this.claculateAllAmount();
    }
  }

  formatAmt(row: any) {
    debugger
    row.total = row.total.toFixed(this.decimalPlaces);
  }

  getAssestAmount(i, row) {
    debugger
    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      this.accVouchersDTsList[i].assestAmount = this.AssestList.find(x => x.id == this.accVouchersDTsList[i].assetId).amount;
      this.accVouchersDTsList[i].assestAmount = Number(this.accVouchersDTsList[i].assestAmount.toFixed(this.decimalPlaces));
      this.accVouchersDTsList[i].additionsAmt = this.AssestList.find(x => x.id == this.accVouchersDTsList[i].assetId).additions;
      this.accVouchersDTsList[i].decreasesAmt = this.AssestList.find(x => x.id == this.accVouchersDTsList[i].assetId).decreases;

      if (this.accVouchersDTsList[i].additionsAmt == undefined) {
        this.accVouchersDTsList[i].additionsAmt = 0;
      }
      if (this.accVouchersDTsList[i].decreasesAmt == undefined) {
        this.accVouchersDTsList[i].decreasesAmt = 0;
      }

      row.assetAmount = this.accVouchersDTsList[i].assestAmount;
      this.accVouchersDTsList[i].PrevUpdate = this.accVouchersDTsList[i].additionsAmt - this.accVouchersDTsList[i].decreasesAmt;
      this.accVouchersDTsList[i].PrevUpdate = Number(this.accVouchersDTsList[i].PrevUpdate.toFixed(this.decimalPlaces));
      this.accVouchersDTsList[i].BookValue = this.accVouchersDTsList[i].assestAmount + this.accVouchersDTsList[i].additionsAmt - this.accVouchersDTsList[i].decreasesAmt;
      this.accVouchersDTsList[i].BookValue = Number(this.accVouchersDTsList[i].BookValue.toFixed(this.decimalPlaces));
      this.claculateAllAmount();
    }
  }

  claculateAllAmount() {
    debugger
    var sumTotal = 0;
    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      var tot = this.accVouchersDTsList[i].total;
      sumTotal += parseFloat(tot);
    }
    //this.Amount =  sumTotal;
    this.tfTotal = this.formatCurrency(sumTotal);
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  CheckIfChooseSameAssest(i, row) {
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

  OnSaveForms() {
    let isValid = true;
    this.disableSave = true;
    if (this.accVouchersDTsList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      isValid = false;
      this.disableSave = false;
      return;
    }

    this.accVouchersDTsList.forEach(element => {
      if (element.assetId == null || element.assetId <= 0 || (element.total == null || element.total <= 0) || (element.note == null || element.ngOnInit <= '')) {
        isValid = false;
        this.disabled = true;
        this.disableSave = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        return;
      }
    });
    debugger
    if (isValid) {
      debugger
      this.disabled = true;
      this.FixedAssetOperationForm.value.fATransDTModelList = this.accVouchersDTsList;
      //this.FixedAssetOperationForm.value.accVouchersDocModelList = this.childAttachment.getVoucherAttachData();
      this.FixedAssetOperationForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      this.FixedAssetOperationForm.value.accVouchersDTModelList = this.accVouchersDTsList;
      this.FixedAssetOperationForm.value.amount = this.tfTotal;

      this.FixedAssetOperationService.saveFixedAssetOperationForm(this.FixedAssetOperationForm.value).subscribe((result) => {

        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.FixedAssetOperationForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintFixedAssetOperation(Number(result.message));
          }

          this.ClearAfterSave();
          this.disabled = false;
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['FixedAssetOperation/FixedAssetOperationList']);
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
    debugger
    this.tfTotal = 0;
    this.FixedAssetOperationForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.FixedAssetOperationForm.value.voucherTypeId);
    });
  }

  DeleteFixedAssetOperation(id: any) {
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
        this.FixedAssetOperationService.deleteFixedAssetOperation(id).subscribe((results) => {

          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAssetOperationInfo();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
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
    this.FixedAssetOperationSheetComponent.Print(id);
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.VoucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  PrintFixedAssetOperation(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptFixedAssetOperationAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptFixedAssetOperationEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.FixedAssetOperationService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            this.FixedAssetOperationForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.cdr.detectChanges();
            this.disableAll = false;
            this.financialvoucher.ngOnInit()
            this.GetAssetOperationInfo();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.FixedAssetOperationForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetAssetOperationInfo();
          }
        }
        else {
          this.voucherId = 0;
          this.opType = "Add";
          this.showsave = false;
          this.disapleVoucherType = false;
          this.disableAll = false;
          this.cdr.detectChanges();
          this.clearFormdata();
        }
      })


    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.FixedAssetOperationForm.get("id").setValue(0);
    this.FixedAssetOperationForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.FixedAssetOperationForm.get("note").setValue('');
    this.FixedAssetOperationForm.get("branchId").setValue(0);
    this.FixedAssetOperationForm.get("creditAccountId").setValue(0);
    this.FixedAssetOperationForm.get("DealerId").setValue(0);
    this.FixedAssetOperationForm.get("fATransDTModelList").setValue([]);
    this.FixedAssetOperationForm.get("assetId").setValue(0);
    this.FixedAssetOperationForm.get("assetAmount").setValue(0);
    this.FixedAssetOperationForm.get("additions").setValue(0);
    this.FixedAssetOperationForm.get("total").setValue(0);
    this.FixedAssetOperationForm.get("decreases").setValue(0);
    this.FixedAssetOperationForm.get("accVouchersDocModelList").setValue([]);
    this.FixedAssetOperationForm.get("accVouchersDTModelList").setValue([]);
    this.FixedAssetOperationForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.accVouchersDTsList = [];
    this.claculateAllAmount();
  }

  CopyRow(row, index) {
    debugger
    this.accVouchersDTsList.push(
      {
        assetId: 0,
        total: row.total,
        assetAmount: row.assetAmount,
        additions: row.additions,
        decreases: row.decreases,
        note: row.note,
        PrevUpdate: row.PrevUpdate,
        BookValue: row.BookValue,
      });
    this.FixedAssetOperationForm.get("fATransDTModelList").setValue(this.accVouchersDTsList);
    this.claculateAllAmount();
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }
}
