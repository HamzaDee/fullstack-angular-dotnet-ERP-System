import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { InvVoucherService } from '../../app-inventoryService.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EntryService } from '../entryvoucher.service';
import { EntryitemsserialsComponent } from 'app/views/general/app-EnterItemsSerial/entryitemsserials.component';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-entrvoucher-form',
  templateUrl: './entrvoucher-form.component.html',
  styleUrls: ['./entrvoucher-form.component.scss']
})
export class EntrvoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) invAttachments!: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  EntryyVoucherAddForm: FormGroup = new FormGroup({});
  public TitlePage: string = '';
  tabelData: any[] = [];
  savedSerials: any[] = [];
  loading: boolean = false;
  opType: string = '';
  invDtlList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string = '';
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  voucherId: any;
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
  showsave: boolean = false;
  storeId: any;
  currencyList: any;
  selectedItems: any[] = [];
  invVouchersDtFormArray: FormArray = this.formbulider.array([]);
  voucherTypeEnum = 33;
  oldStoreId: any;
  remainingQty: number = 0;
  showRemainQty: boolean = false;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number = 0;
  reservedId: number = 0;
  disableAll: boolean = false;
  // General Inventory Settings
  costingMethod: number = 0;
  defaultStoreId: number = 0;
  inventoryType: number = 0;
  useAccountInGrid: boolean = false;
  useBatch: boolean = false;
  useCostCenter: boolean = false;
  useExpiryDate: boolean = false;
  useProductDate: boolean = false;
  useSerial: boolean = false;
  useStoreInGrid: boolean = false;
  serialsListss: any;
  //End
  allowAccRepeat: any;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number = 0;
  ShowDisburseEntity: boolean = false;
  //End
  disableExpDate: boolean = false;
  disablebatch: boolean = false;
  disableSerial: boolean = false;
  disableSave: boolean = false;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  Lang: string = '';
  disapleVoucherType: boolean = false;
  voucherType: any;
  suppliersList: any;
  NewDate: Date = new Date;
  remainingQtyMessage: string = '';
  hideAccVoucher: boolean = false;
  headers = [
    { field: 'materialNumber', label: this.translateService.instant('materialNumber') },
    { field: 'Qty', label: this.translateService.instant('Qty') },
    { field: 'Price', label: this.translateService.instant('Price') },
  ];


  public CreditAccountID: number = 0;
  public DebitAccountID: number = 0;
  CostingDecimalPlaces: number = 0;
  DefaultStoreId: number = 0;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private serv: EntryService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private selectedItemsService: SelectedItemsService,
      private InvService: InvVoucherService,
      private cdr: ChangeDetectorRef,
      private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "Inventory";
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.reservedId = +params['reservedId'];
    });
    if (this.reservedId == null || this.reservedId == undefined || this.reservedId === 0 || isNaN(this.reservedId)) {
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
    else {
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
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['EntryyVoucher/ItemsEntryVoucherList']);
    }


    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();
    this.SetTitlePage();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('EntryVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.EntryyVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      storeId: [0],
      deliveredTo: [0],
      branchId: [{ value: null, disabled: this.allowEditBranch }],
      accountId: [0],
      note: [""],
      isCanceled: [0],
      isPosted: [0],
      status: [0],
      amount: [0],
      dealerId: [0],
      referenceNo: [""],
      referenceDate: [""],
      isOpeningBalance: [false],
      reserved: [false],
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

  GetInitailEntryVoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.serv.GetInitailEntryVoucher(Number(this.voucherId), this.opType, this.voucherTypeEnum).subscribe(result => {

      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['EntryyVoucher/ItemsEntryVoucherList']);
        // this.dialogRef.close(false);
        return;
      }
      debugger
      if (this.opType == 'Copy') {
        this.hideAccVoucher = true;
        const currentDate = new Date().toISOString().split('T')[0];
        result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
      }
      else {
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US");
      }

      this.voucherTypeList = result.voucherTypeList.map((item:any) => ({
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
        printAfterSave: item.printAfterSave,
        creditAccId: item.creditAccId,
        debitAccId: item.debitAccId,
      }));
      this.itemsList = result.itemsList.map((item:any) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial,
        debitAcc: item.data1
      }));
      this.ShowDisburseEntity = result.showDisburseEntity;
      this.branchesList = result.usersCompanyModels;
      this.accountsList = result.accountList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.deliveredToList = result.deliveredToList;
      this.costcenterList = result.costCenterList;
      this.currencyList = result.currencyList;
      this.CostingDecimalPlaces = result.costingDecimalPlaces;
      if (this.CostingDecimalPlaces == 0) {
        this.decimalPlaces = result.currencyList.find((option: any) => option.id === result.defaultCurrency).data2;
      }
      else {
        this.decimalPlaces = this.CostingDecimalPlaces;
      }
      this.suppliersList = result.suppliersList;
      this.serialsListss = [];
      this.tabelData = [];
      if (result.itemsSerialList !== null && result.itemsSerialList !== undefined && result.itemsSerialList.length !== 0) {
        result.itemsSerialList.forEach((item: any) => {
          item.isChecked = true;
        });

      }
      else {
        this.EntryyVoucherAddForm.value.itemsSerialList = [];
      }
      this.savedSerials = result.itemsSerialList;

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.EntryyVoucherAddForm.get("generalAttachModelList")?.setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }


      /*    if (result.invVouchersDocsModelList !== undefined && result.invVouchersDocsModelList !== null) {
           this.invAttachments.data = result.invVouchersDocsModelList;
           this.invAttachments.ngOnInit();
         } */
      this.firstOpen = true;
      this.oldStoreId = 0;
      this.remainingQty = 0
      this.EntryyVoucherAddForm.patchValue(result);
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null) {

        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        this.invDtlList.forEach(element => {
          element.total = element.qty * element.price;
        })

        if (this.opType == "Copy") {
          this.invDtlList.forEach(element => {
            element.qty = 0;
            element.batchNo = null;
            element.expiryDate = null;
            element.id = 0;
          })
        }
        else {
          this.invDtlList.forEach(element => {
            this.itemsList.forEach((item: any) => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.unitId);
                this.invDtlList[index].expiryDate = this.invDtlList[index].expiryDate == null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].productDate = this.invDtlList[index].productDate == null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].batchNo = element.batchNo;
                this.invDtlList[index].newRow = 1;
                index++;
              }
            });
          })
        }

        this.invDtlList.forEach(element => {
          this.itemsList.forEach((item: any) => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.unitId);
              index++;
            }
          });
        })
        for (let i = 0; i < this.invDtlList.length; i++) {
          this.onChangeItem(0, this.invDtlList[i], i)
        }
      }
      else {
        this.invDtlList = [];
      }
      for (let i = 0; i < this.invDtlList.length; i++) {
        this.OnPriceBlur(this.invDtlList[i]);
        this.onChangeItem(0, this.invDtlList[i], i);
      }

      /*       if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
              this.EntryyVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
              this.invAttachments.data = result.generalAttachModelList;
              this.invAttachments.ngOnInit();
            } */



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
            element.debitAccountId = this.EntryyVoucherAddForm.value.accountId;
          });
        }

        //End
        if (this.voucherId > 0) {
          this.EntryyVoucherAddForm.get("dealerId")?.setValue(result.dealerId);
          this.EntryyVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.EntryyVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.EntryyVoucherAddForm.get("storeId")?.setValue(result.storeId);
          this.EntryyVoucherAddForm.get("deliveredTo")?.setValue(result.deliveredTo);
          this.EntryyVoucherAddForm.get("note")?.setValue(result.note);
          // this.selectedVoucherType = result.voucherTypeId;
          if (result.itemsSerialList !== null && result.itemsSerialList !== undefined) {
            this.EntryyVoucherAddForm.get("itemsSerialList")?.setValue(result.itemsSerialList);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find((branche: any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.EntryyVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }

        }
        else {
          this.EntryyVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          this.EntryyVoucherAddForm.get("storeId")?.setValue(0);
          //var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          let defaultVoucher = result.voucherTypeList.find((option: any) => option.isDefault === true)?.id ?? 0;
          this.EntryyVoucherAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);


          this.EntryyVoucherAddForm.get("deliveredTo")?.setValue(0);
          this.EntryyVoucherAddForm.get("dealerId")?.setValue(0);
          this.DefaultStoreId = result.defaultStoreId;



          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find((branche: any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.EntryyVoucherAddForm.get("branchId")?.setValue(defaultBranche.id);
          }
        }
        this.GetVoucherTypeSetting(this.EntryyVoucherAddForm.value.voucherTypeId)
      });
    })
  }

  OnSaveForms() {
    debugger
    let isop = this.EntryyVoucherAddForm.value.isOpeningBalance;
    this.disableSave = true;
    let stopExecution = false;
    if (this.invDtlList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      stopExecution = true;
      return false;
    }

    for (let i = 0; i < this.invDtlList.length; i++) {
      const element = this.invDtlList[i];
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.price == 0 || (isop == false && this.inventoryType == 124 && element.accountId == 0)) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }

      if (element.storeId == null || element.storeId == undefined) {
        element.storeId = 0;
      }
      element.i = i.toString();
    }
    if (this.useStoreInGrid == true) {
      for (let i = 0; i < this.invDtlList.length; i++) {
        const element = this.invDtlList[i];
        if (element.storeId == 0) {
          this.alert.ShowAlert("msgEnterAllData", 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
        element.i = i.toString();
      }
    }
    else {
      if (this.EntryyVoucherAddForm.value.storeId == 0 || this.EntryyVoucherAddForm.value.storeId == undefined || this.EntryyVoucherAddForm.value.storeId == null) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    }

    // special Validation 
    for (let index = 0; index < this.invDtlList.length; index++) {
      const element = this.invDtlList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find((i: any) => i.id === itemId);
      if (!item) {
        continue;
      }
      if (this.useExpiryDate == true) {
        if (item.hasExpiry) {
          if (element.expiryDate == "" || element.expiryDate == null) {
            this.alert.RemainimgQty("msgPleaseEnterExpiryDate1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          if (element.batchNo == "" || element.batchNo == null) {
            this.alert.RemainimgQty("msgPleaseEnterBatch1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        }

      }
      // if(this.useBatch == true)
      //   {

      //   }
      if (this.useSerial == true) {
        if (item.hasSerial) {
          if (this.EntryyVoucherAddForm.value.itemsSerialList == null || this.EntryyVoucherAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          const checkedItemCount = this.EntryyVoucherAddForm.value.itemsSerialList.reduce((count: number, item: any) => {
            if (item.rowIndex === index) {
              return count + 1;
            }
            return count;
          }, 0);

          if (checkedItemCount !== (element.qty * element.unitRate)) {
            this.alert.RemainimgQty("CantSaveQtyEntryNotEqualForItem", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }

          const item1 = this.EntryyVoucherAddForm.value.itemsSerialList.find((i: any) => i.itemId === itemId && i.rowIndex === index);
          if (!item1) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        }
      }

      this.invDtlList.forEach(element => {
        if (this.useAccountInGrid == true) {
          this.EntryyVoucherAddForm.value.accountId = element.debitAccountId;
        }
      });


      element.index = index.toString();
    }
    // End
    debugger
    let serials = this.EntryyVoucherAddForm.value.itemsSerialList;
    if(serials.length > 0)
      {     
        if(!this.useStoreInGrid)
          {
            for (let i = 0; i < serials.length; i++) 
            {
              const store = this.EntryyVoucherAddForm.value.storeId;
              serials[i].storeId = store;
            }
          }
         
      }
    this.EntryyVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.EntryyVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.EntryyVoucherAddForm.value.voucherNo = this.EntryyVoucherAddForm.value.voucherNo.toString();
    this.EntryyVoucherAddForm.value.invVouchersDTModelList = this.invDtlList;
    // this.EntryyVoucherAddForm.value.invVouchersDocsModelList = this.invAttachments.getVoucherAttachData();
    this.EntryyVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    this.EntryyVoucherAddForm.value.amount = this.calculateSum();

    this.serv.SaveEntryVoucher(this.EntryyVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option: any) => option.label === this.EntryyVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintEntryVoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['EntryyVoucher/ItemsEntryVoucherList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.ShowAlert(result.message, 'error');
        }
        this.disableSave = false;
      })
  }

  ClearAfterSave() {
    this.EntryyVoucherAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.EntryyVoucherAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    debugger
    this.invDtlList = [];
    this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find((option: any) => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find((option: any) => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find((option: any) => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find((option: any)  => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.EntryyVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.EntryyVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.EntryyVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.serv.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.EntryyVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.EntryyVoucherAddForm.get("voucherNo")?.setValue(1);
        }

        if (branchId == null || branchId == undefined) {
          this.EntryyVoucherAddForm.get("branchId")?.setValue(0);
        }
        else {
          this.EntryyVoucherAddForm.get("branchId")?.setValue(branchId);
        }
      });
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
  }


  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).storeId;
    if (this.allowEditBranch) {
      this.EntryyVoucherAddForm.get('branchId')?.disable();
    } else {
      this.EntryyVoucherAddForm.get('branchId')?.enable();
    }
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.EntryyVoucherAddForm.get('storeId')?.setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.EntryyVoucherAddForm.get("storeId")?.setValue(this.DefaultStoreId);
      }
      else {
        this.EntryyVoucherAddForm.get("storeId")?.setValue(0);
      }
    }

    let credit = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).creditAccId;
    if (this.opType == "Add") {
      if (credit != 0 && credit != null && credit != undefined) {
        this.CreditAccountID = credit;
      }
      else {
        this.CreditAccountID = 0;
      }
    }

    let Debit = this.voucherTypeList.find((option: any) => option.label === voucherTypeId).debitAccId;
    if (this.opType == "Add") {
      if (Debit != 0 && Debit != null && Debit != undefined) {
        this.DebitAccountID = Debit;
      }
      else {
        this.DebitAccountID = 0;
      }
    }
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (!this.useStoreInGrid) {
      if (this.EntryyVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
    }

    this.invDtlList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        unitRate: 0,
        storeId: this.voucherStoreId,
        qty: "",
        cost: 0,
        price: "",
        total: 0,
        costCenterId: 0,
        productDate: '',
        expiryDate: '',
        batchNo: '',
        accountId: this.CreditAccountID,
        index: this.invDtlList.length,
        debitAccountId: this.DebitAccountID,
      });

    this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
  }

  deleteRow(rowIndex: number) {

    let stopexe = false;
    if (this.EntryyVoucherAddForm.value.itemsSerialList != null) {
      this.EntryyVoucherAddForm.value.itemsSerialList.forEach((element: any) => {
        if (element.rowIndex == rowIndex) {
          stopexe = true;
        }
      });
      if (stopexe) {
        this.alert.ShowAlert("CantDeleteRowTheresSerialsAttachedWithRow", 'error');
        return;
      }
    }

    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      let indexToRemove = this.EntryyVoucherAddForm.value.itemsSerialList.findIndex((element: any) => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.EntryyVoucherAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
    }
    this.EntryyVoucherAddForm.get("purchaseInvoiceModelList")?.setValue(this.invDtlList);
  }

  isEmpty(input: any) {
    return input === '' || input === null;
  }

  isRequierdEx(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
    // 
    if (item.hasExpiry) {
      if (this.invDtlList[index].expiryDate == "" || this.invDtlList[index].expiryDate == null) {
        return true;
      }
    }
    else {
      return false;
    }

  }

  isRequierdBatch(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
    // 
    if (item.hasExpiry) {
      if (this.invDtlList[index].batchNo == "" || this.invDtlList[index].batchNo == null) {
        return true;
      }
    }
    else {
      return false;
    }
  }

  isInvType(row: any) {
    if (this.inventoryType == 124 && (row.accountId == 0 || row.accountId == null)) {
      return true;
    }
    else {
      return false;
    }
  }

  isValidVoucherDate(event: any) {
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
      unitRate: 0,
      storeId: this.voucherStoreId,
      qty: "",
      cost: 0,
      price: "",
      total: 0,
      costCenterId: 0,
      productDate: '',
      expiryDate: '',
      batchNo: '',
      accountId: 0,
      index: this.invDtlList.length,
      debitAccountId: 0,
    };

    this.invDtlList.splice(rowIndex, 0, newRow);
    this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
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
        this.serv.DeleteInvVoucher(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['EntryyVoucher/ItemsEntryVoucherList']);
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

  onChangeItem(event: any, Row: any, i: number) {
    debugger
    const eventValue = (typeof event === 'object' && event.value !== undefined) ? event.value : event;
    if (eventValue === 0) {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serv.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
          debugger
          this.unitsList[i] = res;
          if (res.length == 2) {
            this.invDtlList[i].unitId = res[1].id;
          }
          else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
            this.invDtlList[i].unitId = Row.unitId;
          }
          else {
            this.invDtlList[i].unitId = res[0].id;
          }
          this.onChangeUnit(Row, i, false);
        });
      }
    }
    else {
      if (Row.itemId == 0 || Row.itemId == null) {
        this.unitsList[i] = [];
      }
      debugger
      if (Row.itemId !== 0 && Row.itemId !== null) {
        this.serialsListss = [];
        this.invDtlList[i].qty = "";
        this.invDtlList[i].total = 0;
        this.invDtlList[i].price = "";
        this.invDtlList[i].productDate = null;
        this.invDtlList[i].expiryDate = null;
        this.invDtlList[i].cost = 0;
        // this.invDtlList[i].storeId = 0;
        this.invDtlList[i].unitId = 0;
        this.invDtlList[i].unitRate = 0;
        this.invDtlList[i].costCenterId = 0;
        this.invDtlList[i].batchNo = "";
        this.invDtlList[i].id = 0;
        this.invDtlList[i].hDId = 0;
        this.invDtlList[i].accountId = 0;
        this.invDtlList[i].debitAccountId = 0;
        if (eventValue !== 0) {
          this.serv.GetItemUnitbyItemId(eventValue).subscribe(res => {
            debugger
            this.unitsList[i] = res;
            if (res.length == 2) {
              this.invDtlList[i].unitId = res[1].id;
            }
            else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
              this.invDtlList[i].unitId = Row.unitId;
            }
            else {
              this.invDtlList[i].unitId = res[0].id;
            }
            this.onChangeUnit(Row, i, false);
          });
        }
      }
    }

    if (event.value > 0) {
      if (this.invDtlList.length > 0) {
        let isDuplicate = false;
        for (let m = 0; m < this.invDtlList.length; m++) {
          if (this.invDtlList[m].itemId == event.value && m != i) {
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
    if (this.useStoreInGrid == true) {
      debugger
      var selectedItem = this.itemsList.find((x: any) => x.id === eventValue);
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
      var selectedItem = this.itemsList.find((x: any) => x.id === eventValue);
      if (selectedItem && Number(selectedItem.debitAcc) > 0) {
        this.invDtlList[i].debitAccountId = Number(selectedItem.debitAcc);
      }
    }
  }

  onChangeUnit(Row: any, i: number, type: boolean) {
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
        // if (row.qty > 0) {
        this.invDtlList[index].qty = 0;
        this.invDtlList[index].price = 0;
        this.invDtlList[index].productDate = null;
        this.invDtlList[index].expiryDate = null;
        this.invDtlList[index].batchNo = "";
        this.invDtlList[index].orginalQty = 0;
        this.invDtlList[index].newRow = 0;
        this.showRemainQty = false;
        this.cdr.detectChanges();
        // }

      });
    }
    else {

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
            this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {

            this.EntryyVoucherAddForm.get("storeId")?.setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
      debugger
      this.invDtlList.forEach(element => {
        element.storeId = event.value;
      });
    }

  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger;
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }

    this.serv.getItemQtyFromStore(row.itemId, row.unitId, row.qty, this.EntryyVoucherAddForm.value.storeId).subscribe(res => {
      debugger;
      if (res && res.length > 0) {
        const result = res[0];
        if (result.isExceeded) {
          this.remainingQtyMessage = result.message;
        } else {
          this.remainingQtyMessage = '';
        }
      }
    });

    this.isRequierdSerial(row);
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any) {
    debugger
    if (row.price == null || row.price == undefined) {
      row.price = 0;
      row.total = 0;
    }
    if (row.price !== null && row.price !== undefined) {
      row.price = parseFloat(row.price).toFixed(this.decimalPlaces);
    }
    if (row.total !== null && row.total !== undefined) {
      row.total = row.price * row.qty;
      row.total = parseFloat(row.total).toFixed(this.decimalPlaces);
    }
  }

  isRequierdSerial(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
    if (item.hasSerial) {
      this.disableSerial = false;
      return false;
    }
    else {
      this.disableSerial = true;
      return true;
    }
  }

  openSerialsPopup(row: any, rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    // if (this.isRequierdSerial(row) == true) {
    //   return
    // }
    if (row.bonusUnitId == 0 && row.bonus > 0) {
      return;
    }

    row.firstOpen = row.firstOpen ?? true
    if (this.EntryyVoucherAddForm.value.itemsSerialList === null) {
      this.EntryyVoucherAddForm.get("itemsSerialList")?.setValue([]);
    }
    this.serialsListss = this.EntryyVoucherAddForm.value.itemsSerialList.filter((item: any) => item.itemId == row.itemId && item.rowIndex == rowIndex);
    var itemName = this.itemsList.find((option: any) => option.id === row.itemId).text;
    let title = this.translateService.instant('itemSequencesForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(EntryitemsserialsComponent, {
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
        transList: this.tabelData,
        storeId: row.storeId,
        kind: this.opType,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          row.res = res;
          var newList = this.EntryyVoucherAddForm.value.itemsSerialList.filter((item: any) => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.EntryyVoucherAddForm.get("itemsSerialList")?.setValue(newList);
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

  CheckIfAllowEditBatch(row: any, index: number) {
    if ((row.batchNo !== '' || row.batchNo !== null || row.batchNo !== undefined) && row.itemId !== 0 || row.itemId !== null) {
      this.serv.GetAllowEditBatch(row.batchNo, row.itemId).subscribe(result => {
        if (result) {
          this.invDtlList[index].disablebatch = true;
          this.alert.ShowAlert("CantEditBatchHaveTransactions", 'error');
        }
        else {
          this.invDtlList[index].disablebatch = false;
        }
      })
    }

  }

  isExpiryReadonly(row: any): boolean {
    const item = this.itemsList.find((item: any) => item.id === row.itemId);
    return item ? !item.hasExpiry : true; // readonly if item has no expiry or is not found
  }

  PrintEntryVoucher(voucherId: number) {

    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptEntryVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptEntryyVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId: number, VoucherNo: string) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.InvService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {

          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.EntryyVoucherAddForm.get("generalAttachModelList")?.setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailEntryVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.EntryyVoucherAddForm.get("generalAttachModelList")?.setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailEntryVoucher();
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
    this.EntryyVoucherAddForm.get("id")?.setValue(0);
    this.EntryyVoucherAddForm.get("storeId")?.setValue(0);
    this.EntryyVoucherAddForm.get("deliveredTo")?.setValue(0);
    this.EntryyVoucherAddForm.get("branchId")?.setValue(0);
    this.EntryyVoucherAddForm.get("accountId")?.setValue(0);
    this.EntryyVoucherAddForm.get("debitAccountId")?.setValue(0);
    this.EntryyVoucherAddForm.get("note")?.setValue('');
    this.EntryyVoucherAddForm.get("dealerId")?.setValue(0);
    this.EntryyVoucherAddForm.get("referenceNo")?.setValue('');
    this.EntryyVoucherAddForm.get("referenceDate")?.setValue('');
    this.EntryyVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue([]);
    this.EntryyVoucherAddForm.get("invvVouchersDocsModelList")?.setValue([]);
    this.EntryyVoucherAddForm.get("itemsSerialList")?.setValue([]);
    this.EntryyVoucherAddForm.get("generalAttachModelList")?.setValue([]);
    this.EntryyVoucherAddForm.get("isOpeningBalance")?.setValue(false);
    this.EntryyVoucherAddForm.get("reserved")?.setValue(false);
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.calculateSum();
  }

  CopyRow(row : any, index : number) {
    debugger
    this.unitsList[index + 1] = this.allUntiesList.filter((unit: any) => unit.id == row.unitId);
    if (this.allowAccRepeat == 61) {
      this.invDtlList.push(
        {
          id: 0,
          hDId: 0,
          itemId: 0,
          unitId: 0,
          unitRate: 0,
          storeId: row.storeId,
          qty: row.qty,
          cost: 0,
          price: row.price,
          total: row.total,
          costCenterId: row.costCenterId,
          productDate: row.productDate,
          expiryDate: row.expiryDate,
          batchNo: row.batchNo,
          accountId: row.accountId,
          debitAccountId: row.debitAccountId,
          index: this.invDtlList.length
        });
      this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    }
    else {
      this.invDtlList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          unitRate: row.unitRate,
          storeId: row.storeId,
          qty: row.qty,
          cost: row.cost,
          price: row.price,
          total: row.total,
          costCenterId: row.costCenterId,
          productDate: row.productDate,
          expiryDate: row.expiryDate,
          batchNo: row.batchNo,
          accountId: row.accountId,
          debitAccountId: row.debitAccountId,
          index: this.invDtlList.length
        });
      this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    }
    setTimeout(() => {
      this.serv.GetItemUnitbyItemId(row.itemId).subscribe(res => {
        this.unitsList[index + 1] = res;
      });
      this.onChangeUnit(row, index + 1, false)
    });
    return false;
  }

  handleF3Key(event: KeyboardEvent, row:any, index:number) {

   if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      this.CopyRow(row, index);
    }
    else if (event.key === 'F4') {
      this.AddNewLine();
    }
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

  exportHeadersToExcel() {
    const headerNames = this.headers.map(h => h.label);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Headers');
    XLSX.writeFile(wb, 'EntryyVoucherExcel.xlsx');
  }

  ImportFromExcel(event: any): void {
    if (!this.useStoreInGrid) {
      if (this.EntryyVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
    }
    const target: DataTransfer = <DataTransfer>event.target;
    const fileInput = event.target as HTMLInputElement;

    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    const file: File = target.files[0];
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const binaryStr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

      const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      this.serv.ImportFromExcel(excelData).subscribe(
        (response) => {
          debugger
          if (response.length > 0) {
            this.invDtlList = response;
            this.unitsList = [];
            this.invDtlList.forEach((row) => {
              debugger
              const qty = +row.qty || 0;
              const price = +row.price || 0;
              row.total = qty * price;

              if (this.useAccountInGrid == true) {
                const selectedItem = this.itemsList.find((x: any) => x.id === row.itemId);
                if (selectedItem && Number(selectedItem.debitAcc) > 0) {
                  row.debitAccountId = Number(selectedItem.debitAcc);
                }
              }
            });

            const requests = this.invDtlList.map((Row, i) =>
              this.serv.GetItemUnitbyItemId(Row.itemId).pipe(
                tap(res => {
                  debugger
                  this.unitsList[i] = res;

                  if (res.length === 2) {
                    this.invDtlList[i].unitId = res[1].id;
                  } else if (this.opType === "Edit") {
                    let unit = this.unitsList[i].find((r: any) => r.id == Row.unitId);
                    if (!unit) {
                      this.invDtlList[i].unitId = 0;
                    } else {
                      this.invDtlList[i].unitId = Row.unitId;
                    }
                  } else {
                    //this.invDtlList[i].unitId = response.length > 0 ? res[0].id : 0;
                    let unit = this.unitsList[i].find((r: any) => r.data4 == true).id;
                    this.invDtlList[i].unitId = unit;
                  }


                  if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
                    this.InvService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
                      this.invDtlList[i].unitRate = res;
                    });
                  }

                })
              )
            );


            forkJoin(requests).subscribe(
              async () => {
                debugger
                this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);

                /*        for (let i = 0; i < this.invDtlList.length; i++) {
                         const row = this.invDtlList[i];
                         try {
       
       
                           this.serialsListss = await this.InvService.GetItemSerials(
                             row.itemId,
                             this.EntryyVoucherAddForm.value.storeId
                           ).toPromise();
                         } catch (error) {
                           console.error(`فشل في تحميل السيريالز للصنف ${row.itemId}:`, error);
                         }
                       } */
              },
              (error) => {
                this.alert.ShowAlert('Error loading item units', 'error');
              }
            );
          } else {
            this.alert.ShowAlert('Import failed', 'error');
            fileInput.value = "";
          }
        },
        (error) => {
          this.alert.ShowAlert('Import failed', 'error');
          fileInput.value = "";
        }
      );
    };

    reader.readAsBinaryString(file);
  }

  onImportClick(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  getItemExp(row: any) {
    return this.itemsList.find((item: any) => item.id === row.itemId) || {};
  }

  loadLazyAccountss(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.accountsList) {
        this.accountsList = [];
    }

    // Make sure the array is large enough
    while (this.accountsList.length < last) {
        this.accountsList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.accountsList[i] = this.accountsList[i];
    }

    this.loading = false;
  }
}
