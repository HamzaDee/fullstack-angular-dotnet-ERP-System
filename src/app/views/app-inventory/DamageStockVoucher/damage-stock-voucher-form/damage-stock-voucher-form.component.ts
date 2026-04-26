import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
// import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { InvVoucherService } from '../../app-inventoryService.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { DamageStockVoucherService } from '../damage-stock-voucher.service';
import { GetItemCostComponent } from '../../get-item-cost/get-item-cost.component';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import { de } from 'date-fns/locale';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';

@Component({
  selector: 'app-damage-stock-voucher-form',
  templateUrl: './damage-stock-voucher-form.component.html',
  styleUrls: ['./damage-stock-voucher-form.component.scss']
})
export class DamageStockVoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) attachments: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  private subscription: Subscription;
  DamageStockVoucherAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  savedSerials: any[] = [];
  loading: boolean;
  opType: string;
  invDtlList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  voucherType: any;
  storesList: any;
  branchesList: any;
  voucherTypeList: any;
  deliveredToList: any;
  itemsList: any;
  unitsList: Array<any> = [];
  allUntiesList: any;
  accountsList: any;
  costcenterList: any;
  isdisabled: boolean = false;
  showsave: boolean;
  storeId: any;
  currencyList: any;
  selectedItems: any;
  invVouchersDtFormArray: FormArray;
  oldStoreId: any;
  remainingQty: number;
  showRemainQty: boolean;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number;
  voucherTypeEnum = 35;
  disableAll: boolean = false;
  // General Inventory Settings
  costingMethod: number;
  defaultStoreId: number;
  inventoryType: number;
  useAccountInGrid: boolean;
  useBatch: boolean;
  useCostCenter: boolean;
  useExpiryDate: boolean;
  useProductDate: boolean;
  useSerial: boolean;
  useStoreInGrid: boolean;
  serialsListss: any;
  //End
  allowAccRepeat: any;
  Lang: string;
  NewDate: Date = new Date;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number;
  //End
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  HideVoucher: boolean = false;
  DefaultStoreId: number;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private DmgputService: DamageStockVoucherService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private appCommonserviceService: AppCommonserviceService,
    private dialog: MatDialog,
    private selectedItemsService: SelectedItemsService,
    private InvService: InvVoucherService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "Inventory";
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
      this.router.navigate(['DamageStockVoucher/DamageStockVoucherList']);
    }

    this.InitiailDamageStockVoucherForm();
    this.GetInitailDamageStockVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DamageVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailDamageStockVoucherForm() {
    this.DamageStockVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      storeId: [0],
      deliveredTo: [0],
      branchId: [null],
      accountId: [0],
      note: [""],
      isCanceled: [0],
      isPosted: [0],
      status: [0],
      amount: [0],
      referenceNo: [""],
      referenceDate: [""],
      invVouchersDTModelList: [null, [Validators.required, Validators.minLength(1)]],
      invvVouchersDocsModelList: [null],
      itemsSerialList: [null],
      generalAttachModelList: [null],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetInitailDamageStockVoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.DmgputService.GetInitailDamageStockVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['DamageStockVoucher/DamageStockVoucherList']);
        // this.dialogRef.close(false);
        return;
      }

      if (this.opType == 'Copy') {
        const currentDate = new Date().toISOString().split('T')[0];
        result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        this.HideVoucher = true;
      }
      else {
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US");
        this.HideVoucher = false;
      }

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
        allowAccRepeat: item.allowAccRepeat,
        storeId: item.storeId,
        printAfterSave: item.printAfterSave
      }));
      this.itemsList = result.itemsList.map((item) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial,
        debitAcc: item.data1
      }));
      this.branchesList = result.usersCompanyModels;
      this.accountsList = result.accountList;
      // this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.deliveredToList = result.deliveredToList;
      this.costcenterList = result.costCenterList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.serialsListss = [];
      this.tabelData = [];
      if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined && result.itemsSerialsTransList.length !== 0) {
        result.itemsSerialsTransList.forEach(item => {
          item.isChecked = true;
        });

      }
      else {
        this.DamageStockVoucherAddForm.value.itemsSerialList = [];
      }
      this.savedSerials = result.itemsSerialsTransList;

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.DamageStockVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      this.firstOpen = true;
      this.oldStoreId = 0;
      this.remainingQty = 0
      this.DamageStockVoucherAddForm.patchValue(result);
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null) {

        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        this.invDtlList.forEach(element => {
          debugger
          element.total = element.qty * element.price;
          element.index = index.toString();
          index++;
        })
        index = 0;
        if (this.opType == "Copy") {
          this.invDtlList.forEach(element => {
            element.qty = 0;
          })
        }
        else {
          this.invDtlList.forEach(element => {
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.invDtlList[index].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].batchNo = element.batchNo;
                this.invDtlList[index].newRow = 1;
                index++;
              }
            });
          })
        }
      }
      else {
        this.invDtlList = [];
      }
      for (let i = 0; i < this.invDtlList.length; i++) {
        this.OnPriceBlur(this.invDtlList[i]);
        this.onChangeItem(this.invDtlList[i].itemId, i, false);
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        this.isdisabled = false;
        //General Setting Fill
        this.costingMethod = result.inventoryGeneralSetting.costingMethod;
        this.defaultStoreId = result.inventoryGeneralSetting.defaultStoreId;
        this.inventoryType = result.inventoryGeneralSetting.inventoryType;
        this.useAccountInGrid = result.inventoryGeneralSetting.useAccountInGrid;
        this.useBatch = result.inventoryGeneralSetting.useBatch;
        this.useCostCenter = result.inventoryGeneralSetting.useCostCenter;
        this.useExpiryDate = result.inventoryGeneralSetting.useExpiryDate;
        this.useProductDate = result.inventoryGeneralSetting.useProductDate;
        this.useSerial = result.inventoryGeneralSetting.useSerial;
        this.useStoreInGrid = result.inventoryGeneralSetting.useStoreInGrid;

        if (this.useAccountInGrid == true) {
          this.invDtlList.forEach(element => {
            element.debitAccountId = this.DamageStockVoucherAddForm.value.accountId;
          });
        }

        //End
        if (this.voucherId > 0) {
          debugger
          this.DamageStockVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.DamageStockVoucherAddForm.get("branchId").setValue(result.branchId);
          this.DamageStockVoucherAddForm.get("storeId").setValue(result.storeId);
          this.DamageStockVoucherAddForm.get("deliveredTo").setValue(result.deliveredTo);
          this.DamageStockVoucherAddForm.get("note").setValue(result.note);
          if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined) {
            this.DamageStockVoucherAddForm.get("itemsSerialList").setValue(result.itemsSerialsTransList);
          }


          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.DamageStockVoucherAddForm.get("branchId").setValue(result.branchId);
          }

        }
        else {
          this.DamageStockVoucherAddForm.get("storeId").setValue(0);
          this.DamageStockVoucherAddForm.get("deliveredTo").setValue(0);
          this.DamageStockVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.DamageStockVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.DefaultStoreId = result.defaultStoreId;

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.DamageStockVoucherAddForm.get("branchId").setValue(defaultBranche.id);
          }
        }
        this.GetVoucherTypeSetting(this.DamageStockVoucherAddForm.value.voucherTypeId)
      });
    })
  }

  OnSaveForms() {
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if (this.invDtlList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

    for (let i = 0; i < this.invDtlList.length; i++) {
      const element = this.invDtlList[i];
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.price == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (this.useStoreInGrid == true) {
        const item = this.itemsList.find(item => item.id === element.itemId);
        if (element.storeId == 0) {
          this.alert.RemainimgQty("msgPleaseEnterStore", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }

      if (element.storeId == null || element.storeId == undefined) {
        element.storeId = 0;
      }
      element.i = i.toString();
    }

    // special Validation 
    debugger
    for (let index = 0; index < this.invDtlList.length; index++) {
      const element = this.invDtlList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find(item => item.id === itemId);

      if (!item) {
        continue;
      }

      if (item.hasExpiry) {
        if (element.expiryDate == "") {
          this.alert.RemainimgQty("msgPleaseEnterExpiryDate", item.text, 'error');
          this.invDtlList[index].newRow = 0;
          stopExecution = true;
          this.disableSave = false;
          return false;
        }

        if (element.batchNo == "" || element.batchNo == null) {
          this.alert.RemainimgQty("msgPleaseEnterBatch", item.text, 'error');
          this.invDtlList[index].newRow = 0;
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }

      if (item.hasSerial) {
        if (this.DamageStockVoucherAddForm.value.itemsSerialList == null || this.DamageStockVoucherAddForm.value.itemsSerialList == undefined) {
          this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }

        const checkedItemCount = this.DamageStockVoucherAddForm.value.itemsSerialList.reduce((count, item) => {
          if (item.isChecked === true && item.rowIndex === index) {
            return count + 1;
          }
          return count;
        }, 0);

        if (checkedItemCount !== element.qty) {
          this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }

        const item1 = this.DamageStockVoucherAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.isChecked === true && item.rowIndex === index);
        if (!item1) {
          // this.alert.ShowAlert("msgPleaseEnterSerial", 'error');
          this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }

      this.invDtlList.forEach(element => {
        if (this.useAccountInGrid == true) {
          this.DamageStockVoucherAddForm.value.accountId = element.debitAccountId;
        }
      });

      element.index = index.toString();
    }
    // End
    debugger
    this.DamageStockVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.DamageStockVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.DamageStockVoucherAddForm.value.voucherNo = this.DamageStockVoucherAddForm.value.voucherNo.toString();
    this.DamageStockVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.DamageStockVoucherAddForm.value.amount = this.calculateSum();
    debugger
    this.DmgputService.SaveDamageStockVoucher(this.DamageStockVoucherAddForm.value)
      .subscribe((result) => {
        debugger
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.DamageStockVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintDamageStockVoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['DamageStockVoucher/DamageStockVoucherList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  ClearAfterSave() {
    this.DamageStockVoucherAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.DamageStockVoucherAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    this.invDtlList = [];
    this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.DamageStockVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.DamageStockVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.DamageStockVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.DmgputService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.DamageStockVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.DamageStockVoucherAddForm.get("voucherNo").setValue(1);
        }
        this.DamageStockVoucherAddForm.get("branchId").setValue(branchId);
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.showRemainQty = false;
    this.serialsListss = [];
    if (!this.useStoreInGrid) {
      if (this.DamageStockVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
    }
    const lastIndex = this.invDtlList.length;
    this.invDtlList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        storeId: this.voucherStoreId,
        qty: "",
        price: "",
        total: 0,
        costCenterId: 0,
        productDate: '',
        expiryDate: '',
        batchNo: '',
        accountId: 0,
        orginalQty: 0,
        newRow: 0,
        debitAccountId: 0,
        index: lastIndex.toString()
      });
    debugger
    this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);

  }

  deleteRow(row, rowIndex: number) {
    debugger
    const itemIdToRemove = this.DamageStockVoucherAddForm.value.itemsSerialList.filter(item => item.index !== rowIndex);
    debugger
    this.DamageStockVoucherAddForm.get("itemsSerialList").setValue(itemIdToRemove);
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      let indexToRemove = this.DamageStockVoucherAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.DamageStockVoucherAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
      else {
        this.DamageStockVoucherAddForm.value.itemsSerialList.forEach(element => {
          if (element.rowIndex != 0) {
            element.rowIndex = element.rowIndex - 1;
          }
        });
      }
    }
    this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  isRequierdEx(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);

    if (item.hasExpiry && row.expiryDate == "") {
      return true;
    }
    else {
      return false;
    }

  }

  isRequierdBatch(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);

    if (item.hasExpiry && row.batchNo == "" || row.batchNo == null) {
      return true;
    }
    else {
      return false;
    }

  }

  isInvType(row: any) {
    if (this.inventoryType == 124 && row.accountId == 0 || row.accountId == null) {
      return true;
    }
    else {
      return false;
    }
  }

  isValidVoucherDate(event) {
    debugger
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
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      storeId: this.voucherStoreId,
      qty: "",
      price: "",
      total: 0,
      costCenterId: 0,
      productDate: '',
      expiryDate: '',
      batchNo: '',
      accountId: 0,
      orginalQty: 0,
      newRow: 0,
      debitAccountId: 0,
      index: ""
    };

    this.invDtlList.splice(rowIndex, 0, newRow);
    this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
        this.DmgputService.DeleteDamageStock(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['DamageStockVoucher/DamageStockVoucherList']);
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
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

  onChangeItem(itemId, i, reset = true) {
    debugger
    if (reset == true) {
      this.serialsListss = [];
      this.invDtlList[i].qty = "";
      this.invDtlList[i].total = 0;
      this.invDtlList[i].price = "";
      this.invDtlList[i].productDate = null;
      this.invDtlList[i].expiryDate = null;
      this.invDtlList[i].batchNo = null;
    }
    this.DmgputService.GetItemUintbyItemId(this.invDtlList[i].itemId).subscribe(res => {
      debugger
      this.unitsList[i] = res;
      if (res.length == 2) {
        this.invDtlList[i].unitId = res[1].id;
      }
      else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
        this.invDtlList[i].unitId = itemId.unitId;
      }
      else {
        this.invDtlList[i].unitId = res[0].id;
      }
      this.onChangeUnit(this.invDtlList[i], i, false);
      debugger
      if (itemId.itemId > 0) {
        if (this.invDtlList.length > 0) {
          let isDuplicate = false;
          for (let m = 0; m < this.invDtlList.length; m++) {
            if (this.invDtlList[m].itemId == itemId.itemId && m != i) {
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
            this.invDtlList[i] = {
              ...this.invDtlList[i],
              itemId: 0
            };
            this.cdr.detectChanges();
          }
        }
      }
    });
    debugger
    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === itemId.itemId);
      if (selectedItem && selectedItem.storeId > 0) {
        var defaultStoreNo = selectedItem.storeId;
        this.invDtlList[i].storeId = defaultStoreNo;
        this.cdr.detectChanges();
      }
      else {
        // this.invDtlList[i].storeId = 0;
        this.cdr.detectChanges();
      }
    }
    if (this.useAccountInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === itemId.itemId);
      if (selectedItem && Number(selectedItem.debitAcc) > 0) {
        this.invDtlList[i].debitAccountId = Number(selectedItem.debitAcc);
      }
    }
  }

  async GetItemSerials(row, rowIndex): Promise<void> {
    debugger
    let store = 0;
    if (this.useStoreInGrid) {
      store = row.storeId;
    }
    else {
      store = this.DamageStockVoucherAddForm.value.storeId;
    }
    try {
      debugger
      this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
      this.openSerialsPopup(row, rowIndex);
    } catch (error) {
      console.error('Error fetching item serials', error);
    }

  }

  onChangeUnit(Row, i, type) {
    debugger
    if (type == true) {
      this.invDtlList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.InvService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.invDtlList[i].unitRate = res;
      });
    }
  }

  onStoreChange(event: any, row: any, index: number) {
    debugger
    if (this.useStoreInGrid) {
      setTimeout(() => {
        this.invDtlList[index].qty = "";
        this.invDtlList[index].price = "";
        this.invDtlList[index].productDate = null;
        this.invDtlList[index].expiryDate = null;
        this.invDtlList[index].batchNo = "";
        this.invDtlList[index].orginalQty = 0;
        this.invDtlList[index].newRow = 0;
        this.showRemainQty = false;
        this.cdr.detectChanges();
      });
    }
    else {
      debugger
      if (this.invDtlList.length > 0 && this.oldStoreId > 0) {
        Swal.fire({
          title: this.translateService.instant('AreYouSure?'),
          text: this.translateService.instant('TheTableDataWillBeDeleted!'),
          icon: 'warning',
          confirmButtonColor: '#dc3741',
          showCancelButton: true,
          confirmButtonText: this.translateService.instant('Yes,deleteit!'),
          cancelButtonText: this.translateService.instant('Close'),
        }).then((result) => {
          if (result.value) {
            this.invDtlList = [];
            this.oldStoreId = event.value;
            this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            debugger
            this.DamageStockVoucherAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any,) {
    if (row.price == null || row.price == undefined) {
      row.price = 0;
      row.total = 0;
    }

    if (row.price !== null && row.price !== undefined) {
      if (!isNaN(row.price)) {
        row.price = parseFloat(row.price).toFixed(this.decimalPlaces);
      } else {
        row.price = row.price.toFixed(this.decimalPlaces);
      }
    }
    if (row.total !== null && row.total !== undefined) {
      row.total = row.price * row.qty;
      row.total = parseFloat(row.total).toFixed(this.decimalPlaces);
    }
  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    this.remainingQty = 0
    this.invDtlList[Index].price = "";
    if (event == null) {
      this.showRemainQty = false;
      return;
    }

    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    // check if we had multiple  Batch ON  same Table
    if (this.invDtlList.length == 1) {
      if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > this.invDtlList[Index].orginalQty) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[Index].orginalQty, 'error');
          this.invDtlList[Index].qty = "";
          this.invDtlList[Index].price = "";
          this.invDtlList[Index].refId = 0;
          return false;
        }
      }
    }
    if (this.invDtlList.length > 1) {
      let totBatchQty = 0;
      let allBatchQty = 0;
      for (let i = 0; i < this.invDtlList.length; i++) {
        const Batch = row.batchNo;
        if (Batch !== "" && Batch !== null && Batch !== undefined) {
          if (this.invDtlList[i].batchNo == Batch && i != Index) {
            totBatchQty += this.invDtlList[i].qty * this.invDtlList[i].unitRate;
            allBatchQty += this.invDtlList[i].qty * this.invDtlList[i].unitRate;
            if (totBatchQty + (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate) > this.invDtlList[Index].orginalQty) {
              const source$ = of(1, 2);
              source$.pipe(delay(0)).subscribe(() => {
                this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[Index].orginalQty - totBatchQty, 'error');
                this.invDtlList[Index].price = "";
                this.invDtlList[Index].qty = "";
                this.invDtlList[Index].refId = 0;
                return false;
              });
            }
          }
        }
      }
    }

    let transDate = this.DamageStockVoucherAddForm.value.voucherDate;
    // check if we had multiple  item  same id 
    if (this.invDtlList.length > 1) {
      let totalQty = 0;
      for (let i = 0; i < this.invDtlList.length; i++) {
        const item = row.itemId;
        if (this.invDtlList[i].itemId == item && i != Index) {
          totalQty += (row.qty * row.unitRate) + this.invDtlList[i].qty;
          this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {
            debugger
            if (res.length == 0) {
              setTimeout(() => {
                this.invDtlList[Index].qty = "";
                this.invDtlList[Index].refId = 0;
                this.showRemainQty = false;
                this.cdr.detectChanges();
              });
              this.alert.RemainimgQty("RemainigQty=", "0", 'error');
              return;
            }
            if (totalQty > res[0].qoh) {
              setTimeout(() => {
                this.invDtlList[Index].qty = "";
                this.invDtlList[Index].refId = 0;
                this.showRemainQty = false;
                this.cdr.detectChanges();
              });
              this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
              return;
            }
            else {
              this.showRemainQty = true;
              this.remainingQty = res[Index].qoh;
              this.hideLabelAfterDelay();
            }
          })
        }
      }
    }
    if (this.useStoreInGrid) {
      if (this.invDtlList[Index].itemId == 0) {
        this.alert.ShowAlert("PleaseEnterItemID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.invDtlList[Index].refId = 0;
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.invDtlList[Index].refId = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.invDtlList[Index].storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
      this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {
        debugger
        if (res.length == 0) {
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.invDtlList[Index].refId = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", "0", 'error');
          return;
        }
        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qoh) {
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.invDtlList[Index].refId = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
        }
        else {
          if (this.costingMethod == 163) {
            const element = res[0];
            row.price = element.cost;//*row.unitRate;
            row.total = row.price * row.qty;
            row.batchNo = element.batchNo;
            row.refId = element.id;
            row.expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")
            row.productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US")
            this.invDtlList[Index].orginalQty = element.qoh;
            this.invDtlList[Index].newRow = 1;
            // this.showRemainQty = true;
            // this.remainingQty = res[0].qoh/row.unitRate;
            // this.hideLabelAfterDelay();
            // return;
          }
          this.showRemainQty = true;
          this.remainingQty = res[0].qoh / row.unitRate;
          this.hideLabelAfterDelay();
        }
      })
    }
    else {
      if (this.invDtlList[Index].itemId == 0) {
        this.alert.ShowAlert("PleaseEnterItemID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.invDtlList[Index].refId = 0;
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.invDtlList[Index].refId = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.DamageStockVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.invDtlList[Index].refId = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.DamageStockVoucherAddForm.value.storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {
        debugger
        if (res.length == 0) {
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.invDtlList[Index].refId = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", "0", 'error');
          return;
        }
        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qoh) {
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.invDtlList[Index].refId = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.invDtlList[Index].price = res[0].cost;
          this.invDtlList[Index].total = this.invDtlList[Index].price * this.invDtlList[Index].qty;
          this.remainingQty = res[0].qoh;
          this.hideLabelAfterDelay();
        }
      })
    }

  }

  handleF3Key(event: KeyboardEvent, outputList: any, index: number) {
    
    if (event.key === 'F3') {
      event.preventDefault(); // prevent the default action of the F3 key
      this.OpenItemsInfoForm(outputList, index);
    }
    else if (event.key === "Backspace") {
      setTimeout(() => {
        if (outputList.qty === 0 || outputList.qty === null || outputList.qty === undefined) {
          outputList.total = 0;
          outputList.total = outputList.total.toFixed(this.decimalPlaces);
        }
      });
    }
    else if (event.key === 'F4') {
      this.CopyRow(outputList, index);
    }
  }

  listofproduct(outputList: any, index: number) {
    this.OpenItemsInfoForm(outputList, index);
  }


  OpenItemsInfoForm(row: any, rowIndex: number) {
  
      if (this.useStoreInGrid) {
        var store = row.storeId;
      }
      else {
        var store = this.DamageStockVoucherAddForm.value.storeId;
      }
  
      let title = this.translateService.instant('ADDITEMSINFO');
      let dialogRef: MatDialogRef<any> = this.dialog.open(ItemssearchComponent, {
        width: '900px',
        disableClose: true,
        direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
  
        data: {
          title: title, itemId: row.itemId, store,
        }
      });
  
  
      this.subscription = this.selectedItemsService.selectedItems$.subscribe((items) => {
        this.selectedItems = [];
        this.selectedItems = items;
        this.length = this.invDtlList.length;
        if (this.selectedItems.length > 0) {
          if (this.invDtlList[rowIndex].qty == null) {
            this.invDtlList[rowIndex].qty = 0;
          }
          if (this.invDtlList[rowIndex].qty > this.selectedItems[0].qoh) {
            this.alert.ShowAlert("QuantityOfBatchNotEnough", 'error');
            this.invDtlList[rowIndex].productDate = null;
            this.invDtlList[rowIndex].expiryDate = null;
            this.invDtlList[rowIndex].batchNo = null;
            return false;
          }
        }
  
        this.selectedItems.forEach((element, index) => {
          let emptyRowCount = 0;
          for (let i = 0; i < this.invDtlList.length; i++) {
            if (this.invDtlList[i].newRow === 0) {
              emptyRowCount++;
              // this.length++;
            }
          }
          if (this.selectedItems.length == 1) {
            const element = this.selectedItems[index];
            this.invDtlList[rowIndex].itemId = element.id;
            if (element.productDate !== null) {
              this.invDtlList[rowIndex].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            }
            if (element.expiryDate !== null) {
              this.invDtlList[rowIndex].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            }
            this.invDtlList[rowIndex].batchNo = element.batchNo;
            this.invDtlList[rowIndex].orginalQty = element.qoh;
            this.invDtlList[rowIndex].newRow = 1;
            return;
          }
          if (emptyRowCount > 0) {
            const element = this.selectedItems[index];
            this.invDtlList[rowIndex].itemId = element.id;
            if (element.productDate !== null) {
              this.invDtlList[rowIndex].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            }
            if (element.expiryDate !== null) {
              this.invDtlList[rowIndex].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            }
            this.invDtlList[rowIndex].batchNo = element.batchNo;
            this.invDtlList[rowIndex].orginalQty = element.qoh;
            if (this.selectedItems.length > emptyRowCount) {
              this.invDtlList[rowIndex].newRow = 1;
            }
          }
          else {
            const existingRow = this.invDtlList.find(row => (row.itemId == ""));
            if (existingRow == undefined) {
              const newRow = {
                itemId: element.id,
                productDate: element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
                expiryDate: element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
                batchNo: element.batchNo,
                orginalQty: element.qoh,
                newRow: element.newRow = 1,
              };
              this.invDtlList.push(newRow);
              this.length = this.length - 1;
            }
          }
  
  
        })
        for (let i = 0; i < this.invDtlList.length; i++) {
          this.onChangeItem(this.invDtlList[i].itemId, i, false)
        }
  
        this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      });
  
      dialogRef.afterClosed().subscribe(res => {
  
        for (let i = 0; i < this.invDtlList.length; i++) {
          if (this.invDtlList[i].itemId == 0 || this.invDtlList[i].itemId == null)
            this.invDtlList.splice(i, 1);
        }
        this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
        // Check Batch Quantity If the User Add Same Batch Multi Rows
  
        if (this.invDtlList.length > 1) {
          let totBatchQty = 0;
          let allBatchQty = 0;
          for (let i = 0; i < this.invDtlList.length; i++) {
  
            const Batch = row.batchNo;
            if (Batch !== "" && Batch !== null && Batch !== undefined) {
              if (this.invDtlList[i].batchNo == Batch && i != rowIndex) {
  
                totBatchQty += this.invDtlList[i].qty * row.unitRate;
                allBatchQty += this.invDtlList[i].qty * row.unitRate;
                if (totBatchQty + (this.invDtlList[rowIndex].qty * row.unitRate) > this.invDtlList[rowIndex].orginalQty) {
                  this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[rowIndex].orginalQty - totBatchQty, 'error');
                  this.invDtlList[rowIndex].productDate = null;
                  this.invDtlList[rowIndex].expiryDate = null;
                  this.invDtlList[rowIndex].batchNo = null;
                  return false;
                }
              }
            }
          }
        }
        else {
          if (this.invDtlList.length > 0) {
            let qtyy = 0;
            for (let i = 0; i < this.invDtlList.length; i++) {
              qtyy = this.invDtlList[i].qty * row.unitRate;
              if (qtyy > row.orginalQty) {
                this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[i].orginalQty, 'error');
                this.invDtlList[i].productDate = null;
                this.invDtlList[i].expiryDate = null;
                this.invDtlList[i].batchNo = null;
              }
            }
          }
        }
  
        if (res !== null) {
          dialogRef.close();
          this.selectedItemsService.updateSelectedItems([]);
          this.subscription.unsubscribe();
        }
      });
    }
  // OpenItemsInfoForm(row: any, rowIndex: number) {
  //   debugger
  //   if (row.itemId == 0) {
  //     this.alert.ShowAlert("PleaseEnterItemID", 'error');
  //     return;
  //   }
  //   if (row.unitId == 0) {
  //     this.alert.ShowAlert("PleaseEnterUnitID", 'error');
  //     return;
  //   }
  //   /*     if (row.storeId == 0) {
  //         this.alert.ShowAlert("PleaseEnterStoreID", 'error');
  //         return;
  //       } */

  //   if (this.useStoreInGrid) {

  //     if (row.storeId == 0) {
  //       this.alert.ShowAlert("PleaseEnterStoreID", 'error');
  //       return;
  //     }
  //     else {
  //       var store = row.storeId;
  //     }
  //   }
  //   else {
  //     var store = this.DamageStockVoucherAddForm.value.storeId;
  //   }

  //   let title = this.translateService.instant('ADDITEMSINFO');
  //   let dialogRef: MatDialogRef<any> = this.dialog.open(GetItemCostComponent, {
  //     width: '900px',
  //     disableClose: true,
  //     direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',

  //     data: {
  //       title: title, itemId: row.itemId, store, unitId: row.unitId, transDate: this.DamageStockVoucherAddForm.value.voucherDate
  //     }
  //   });
  //   dialogRef.afterClosed()
  //     .subscribe(res => {
  //       debugger
  //       if (this.invDtlList[rowIndex].qty == 0 || res === null) {
  //         return;
  //       }

  //       this.selectedItems = null;
  //       this.selectedItems = res;
  //       if (this.selectedItems !== null) {
  //         var totqty = this.invDtlList.filter(c => c.index !== rowIndex.toString()).reduce((sum, item) => sum + parseFloat(item.qty), 0);
  //         if (this.invDtlList[rowIndex].qty + totqty > (this.selectedItems.inQty - this.selectedItems.outQty)) {
  //           this.alert.ShowAlert("QuantityOfBatchNotEnough", 'error');
  //           this.invDtlList[rowIndex].qty = 0;
  //           this.invDtlList[rowIndex].price = 0;
  //           this.invDtlList[rowIndex].productDate = null;
  //           this.invDtlList[rowIndex].expiryDate = null;
  //           this.invDtlList[rowIndex].batchNo = null;
  //           this.invDtlList[rowIndex].refId = 0;
  //           return false;
  //         }
  //         else {
  //           if (this.selectedItems.productDate !== null) {
  //             this.invDtlList[rowIndex].productDate = formatDate(this.selectedItems.productDate, "yyyy-MM-dd", "en-US");
  //           }
  //           if (this.selectedItems.expiryDate !== null) {
  //             this.invDtlList[rowIndex].expiryDate = formatDate(this.selectedItems.expiryDate, "yyyy-MM-dd", "en-US");
  //           }
  //           this.invDtlList[rowIndex].refId = this.selectedItems.id;
  //           this.invDtlList[rowIndex].batchNo = this.selectedItems.batchNo;
  //           this.invDtlList[rowIndex].orginalQty = this.selectedItems.inQty - this.selectedItems.outQty;
  //           this.invDtlList[rowIndex].price = this.selectedItems.cost;// (this.selectedItems.qoh * this.selectedItems.unitRate);
  //           this.invDtlList[rowIndex].newRow = 1;
  //           this.OnPriceBlur(this.invDtlList[rowIndex]);
  //           return;
  //         }
  //       }

  //     })
  // }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
    }, 3000);
  }

  openSerialsPopup(row: any, rowIndex: number) {
    debugger
    row.firstOpen = row.firstOpen ?? true

    if (this.opType == 'Edit' || this.opType == 'Show') {

      this.tabelData = [];
      if (row.firstOpen == true) {
        for (const SavedSerilas of this.savedSerials.filter(item => item.rowIndex == rowIndex && item.itemId == row.itemId)) {
          this.tabelData.push({
            itemId: SavedSerilas.itemId,
            serialNo: SavedSerilas.serialNo,
            id: SavedSerilas.serialId,
            rowIndex: SavedSerilas.rowIndex,
            isChecked: true
          });
        }
        for (const serial of this.serialsListss) {
          this.tabelData.push({
            itemId: serial.itemId,
            serialNo: serial.serialNo,
            id: serial.id,
            rowIndex: rowIndex,
            isChecked: false
          });
        }
      }
      else {
        this.tabelData = row.res
      }
    }
    else {
      this.tabelData = [];
      if (row.firstOpen == true) {
        for (const serial of this.serialsListss) {
          const existingItem = this.DamageStockVoucherAddForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
          if (!existingItem) {
            this.tabelData.push({
              itemId: serial.itemId,
              serialNo: serial.serialNo,
              id: serial.id,
              rowIndex: rowIndex,
              isChecked: false
            });
          }
        }
      }
      else {
        this.tabelData = row.res;
      }
    }

    var itemName = this.itemsList.find(option => option.id === row.itemId).text;
    let title = this.translateService.instant('itemSequencesForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemserialsformComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        itemName: itemName,
        itemId: row.itemId,
        serials: this.serialsListss,
        qty: row.qty * row.unitRate,
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        transList: this.tabelData
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          row.res = res;
          var newList = this.DamageStockVoucherAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.DamageStockVoucherAddForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  calculateSum() {
    return this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.DamageStockVoucherAddForm.get('storeId').setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.DamageStockVoucherAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.DamageStockVoucherAddForm.get("storeId").setValue(0);
      }
    }
  }

  PrintDamageStockVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptDamageStockVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptDamageStockVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.InvService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.DamageStockVoucherAddForm.get("generalAttachModelList").setValue([]);
            this.DamageStockVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailDamageStockVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.DamageStockVoucherAddForm.get("generalAttachModelList").setValue([]);
            this.DamageStockVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailDamageStockVoucher();
          }
        }
        else {
          this.voucherId = 0;
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

  clearFormdata() {
    this.NewDate = new Date;
    this.DamageStockVoucherAddForm.get("id").setValue(0);
    this.DamageStockVoucherAddForm.get("storeId").setValue(0);
    this.DamageStockVoucherAddForm.get("deliveredTo").setValue(0);
    this.DamageStockVoucherAddForm.get("branchId").setValue(0);
    this.DamageStockVoucherAddForm.get("accountId").setValue(0);
    this.DamageStockVoucherAddForm.get("debitAccountId").setValue(0);
    this.DamageStockVoucherAddForm.get("note").setValue('');
    this.DamageStockVoucherAddForm.get("referenceNo").setValue('');
    this.DamageStockVoucherAddForm.get("referenceDate").setValue('');
    this.DamageStockVoucherAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue([]);
    this.DamageStockVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
    this.DamageStockVoucherAddForm.get("itemsSerialList").setValue([]);
    this.DamageStockVoucherAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.calculateSum();
  }

  CopyRow(row, index) {
    debugger
    const lastIndex = this.invDtlList.length;
    if (this.allowAccRepeat == 61) {
      this.invDtlList.push(
        {
          id: 0,
          hDId: 0,
          itemId: 0,
          unitId: 0,
          storeId: row.storeId,
          qty: "",
          price: "",
          total: 0,
          costCenterId: row.costCenterId,
          productDate: row.productDate,
          expiryDate: '',
          batchNo: '',
          accountId: row.accountId,
          debitAccountId: row.accountId,
          orginalQty: 0,
          newRow: 0,
          index: lastIndex.toString()
        });
      this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    }
    else {
      this.invDtlList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          storeId: row.storeId,
          qty: "",
          price: "",
          total: 0,
          costCenterId: row.costCenterId,
          productDate: row.productDate,
          expiryDate: '',
          batchNo: '',
          accountId: row.accountId,
          debitAccountId: row.accountId,
          orginalQty: 0,
          newRow: 0,
          index: lastIndex.toString()
        });
      this.DamageStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    }
    setTimeout(() => {
      this.DmgputService.GetItemUintbyItemId(row.itemId).subscribe(res => {
        this.unitsList[index + 1] = res;
      });
      this.onChangeUnit(row, index + 1, false)
    });
    return false;
  }


  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.itemsList) {
      this.itemsList = [];
    }

    // Make sure the array is large enough
    while (this.itemsList.length < last) {
      this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
  }

}
