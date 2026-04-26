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
import { outputVoucherService } from '../outputvoucher.service';
import Swal from 'sweetalert2';
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { InvVoucherService } from '../../app-inventoryService.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ActivatedRoute, Params } from '@angular/router';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
@Component({
  selector: 'app-outputvoucherform',
  templateUrl: './outputvoucherform.component.html',
  styleUrls: ['./outputvoucherform.component.scss']
})

export class OutputvoucherformComponent implements OnInit {
  @ViewChild(FinancialvoucherComponent) financialvoucher!: FinancialvoucherComponent;
  private subscription!: Subscription;
  OutputVoucherAddForm: FormGroup = new FormGroup({});
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
  voucherTypeEnum = 34;
  oldStoreId: any;
  remainingQty: number = 0;
  showRemainQty: boolean = false;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number = 0;
  reservedId: number = 0;
  fromReserved: number = 0;
  voucherType: any;
  public disableAll: boolean = false;
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
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number = 0;
  ShowDisburseEntity: boolean = false;
  //End
  allowAccRepeat: any;
  StoredId: any[] = [];
  Lang: string = '';
  disableSave: boolean = false;
  disapleVoucherType: boolean = false;
  supplierList: any;
  NewDate: Date = new Date;
  CanSaleExpiredItems: boolean = false;
  remainingQtyMessage: string = '';
  HideVoucher:boolean = false;
  DefaultStoreId: number = 0;
  CostingDecimalPlaces: number = 0;

  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  headers = [
    { field: 'materialNumber', label: this.translateService.instant('materialNumber') },
    { field: 'Qty', label: this.translateService.instant('Qty') },
    { field: 'Price', label: this.translateService.instant('Price') },
  ];


  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private OutputService: outputVoucherService,
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
    this.disableSave = false;
    this.voucherType = "Inventory";
    this.route.queryParams.subscribe((params: Params) => {
      this.reservedId = +params['reservedId'];
    });

    if (this.reservedId == null || this.reservedId == undefined || this.reservedId === 0 || isNaN(this.reservedId)) {

      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
        this.fromReserved = 0;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
        this.fromReserved = 0;
      }
    }
    else {
      this.fromReserved = 1;
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }


    /*      if (this.reservedId != null  && this.reservedId !== undefined && this.reservedId !== 0 && !isNaN(this.reservedId)){
         this.voucherId = this.reservedId ;
         this.opType = 'Edit';
         this.showsave = false;
         this.fromReserved= 0;
       } */
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
      this.router.navigate(['InventoryVouchers/OutputVoucherList']);
    }


    this.InitiailOutputVoucherForm();
    this.GetInitailOutputVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('OutputVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailOutputVoucherForm() {
    this.OutputVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      storeId: [0],
      dealerId: [0],
      branchId: [{ value: null, disabled: this.allowEditBranch }],
      accountId: [0],
      note: [""],
      isCanceled: [0],
      isPosted: [0],
      status: [0],
      amount: [0],
      referenceNo: [""],
      referenceDate: [""],
      deliveredTo: [0],
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

  GetInitailOutputVoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.OutputService.GetInitailoutputVoucher(Number(this.voucherId), this.opType, this.voucherTypeEnum).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['InventoryVouchers/OutputVoucherList']);
        // this.dialogRef.close(false);
        return;
      }

      if (this.opType == 'Copy') {
        const currentDate = new Date().toISOString().split('T')[0];
        result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
      }
      else {
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US");
      }

      debugger
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
      }));
      this.itemsList = result.itemsList.map((item:any) => ({
        id: item.id,
        text: item.text,
        storeId: item.storeId,
        hasExpiry: item.hasExpiry,
        hasSerial: item.hasSerial,
        debitAcc: item.data1,
        costAccId:item.costAccId,
      }));
      if(this.opType == 'Copy')
        {
          this.HideVoucher = true;
        }
        else
        {
          this.HideVoucher = false;
        }
      this.ShowDisburseEntity = result.showDisburseEntity;
      this.branchesList = result.usersCompanyModels;
      this.accountsList = result.accountList;
      this.supplierList = result.suppliersList
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.deliveredToList = result.deliveredToList;
      this.costcenterList = result.costCenterList;
      this.currencyList = result.currencyList;
       this.CostingDecimalPlaces = result.costingDecimalPlaces;
      if (this.CostingDecimalPlaces == 0) {
        this.decimalPlaces = result.currencyList.find((option:any) => option.id === result.defaultCurrency).data2;
      }
      else {
        this.decimalPlaces = this.CostingDecimalPlaces;
      }
      
      this.serialsListss = [];
      this.tabelData = [];
      if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined && result.itemsSerialsTransList.length !== 0) {
        result.itemsSerialsTransList.forEach((item:any) => {
          item.isChecked = true;
        });

      }
      else {
        this.OutputVoucherAddForm.value.itemsSerialList = [];
      }
      this.savedSerials = result.itemsSerialsTransList;
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.OutputVoucherAddForm.get("generalAttachModelList")?.setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      for (let i = 0; i < this.invDtlList.length; i++) {
        this.OnPriceBlur(this.invDtlList[i]);
        this.onChangeItem(this.invDtlList[i].itemId, i, false);
      }

      this.firstOpen = true;
      this.oldStoreId = 0;
      this.remainingQty = 0
      this.OutputVoucherAddForm.patchValue(result);

      debugger
      if (this.fromReserved == 1) {
        this.GetServeditems(this.reservedId);
      }
      debugger
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null) {

        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        this.invDtlList.forEach(element => {
          element.total = element.qty * element.price;
          element.mainQty = element.qty;
        })

        if (this.opType == "Copy") {
          this.invDtlList.forEach(element => {
            element.qty = 0;
          })
        }
        else {
          this.invDtlList.forEach(element => {
            debugger
            var item =  this.itemsList.find((c:any) => c.id == element.itemId);
            if(item){
                this.unitsList[index] = this.allUntiesList.filter((unit:any) => unit.id == element.unitId);
                this.invDtlList[index].expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].batchNo = element.batchNo;
                this.invDtlList[index].newRow = 1;
                index++;              
            }

            // this.itemsList.forEach(item => {
            //   debugger
            //   if (item.id === element.itemId) {
            //     this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
            //     this.invDtlList[index].expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
            //     this.invDtlList[index].productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
            //     this.invDtlList[index].batchNo = element.batchNo;
            //     this.invDtlList[index].newRow = 1;
            //     index++;
            //   }
            // });
          })
        }

        debugger
        for (let i = 0; i < this.invDtlList.length; i++) {
          this.OnPriceBlur(this.invDtlList[i]);
          this.onChangeItem(this.invDtlList[i].itemId, i, false);
        }
      }
      else {
        this.invDtlList = [];
      }

      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {

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
        this.CanSaleExpiredItems = result.canSaleExpiredItems;


        // if (this.useAccountInGrid == true) {
        //   this.invDtlList.forEach(element => {
        //     element.debitAccountId = this.OutputVoucherAddForm.value.accountId;
        //   });
        // }

        //End
        if (this.voucherId > 0) {

          this.OutputVoucherAddForm.get("voucherTypeId")?.setValue(result.voucherTypeId);
          this.OutputVoucherAddForm.get("branchId")?.setValue(result.branchId);
          this.OutputVoucherAddForm.get("storeId")?.setValue(result.storeId);
          this.OutputVoucherAddForm.get("dealerId")?.setValue(result.dealerId);
          this.OutputVoucherAddForm.get("note")?.setValue(result.note);
          // this.selectedVoucherType = result.voucherTypeId;
          if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined) {
            this.OutputVoucherAddForm.get("itemsSerialList")?.setValue(result.itemsSerialsTransList);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find((branche:any) => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.OutputVoucherAddForm.get("branchId")?.setValue(result.branchId);
          }

        }
        else {
          this.OutputVoucherAddForm.get("branchId")?.setValue(result.defaultBranchId);
          this.OutputVoucherAddForm.get("storeId")?.setValue(0);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find((branche:any) => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.OutputVoucherAddForm.get("branchId")?.setValue(defaultBranche.id);
          }

          //var defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
            let defaultVoucher = result.voucherTypeList.find((option:any) => option.isDefault === true)?.id ?? 0;
          this.OutputVoucherAddForm.get("voucherTypeId")?.setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.DefaultStoreId = result.defaultStoreId;
        }
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else {
          this.GetVoucherTypeSetting(this.OutputVoucherAddForm.value.voucherTypeId)
        }

      });
    })
  }

  OnSaveForms() {
    debugger
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
      const item = this.itemsList.find((item:any) => item.id === element.itemId);
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0 || element.price == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (this.useStoreInGrid == true) {
        if (element.storeId == 0) {
          this.alert.RemainimgQty("msgPleaseEnterStore", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }
      if (this.useAccountInGrid == true && this.inventoryType == 124){
        if (element.debitAccountId == 0 || element.debitAccountId == null || element.debitAccountId == undefined) {
          this.alert.RemainimgQty("msgPleaseEnterAccount", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }
      }
      element.i = i.toString();
    }

    // special Validation 

    for (let index = 0; index < this.invDtlList.length; index++) {
      const element = this.invDtlList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find((item:any) => item.id === itemId);

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

        if (this.useBatch == true) {
          if (element.batchNo == "" || element.batchNo == null) {
            this.alert.RemainimgQty("msgPleaseEnterBatch", item.text, 'error');
            this.invDtlList[index].newRow = 0;
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        }
      }

      if (this.useSerial == true) {
        if (item.hasSerial) {
          if (this.OutputVoucherAddForm.value.itemsSerialList == null || this.OutputVoucherAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          const checkedItemCount = this.OutputVoucherAddForm.value.itemsSerialList.reduce((count: number, item: any) => {
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
          const item1 = this.OutputVoucherAddForm.value.itemsSerialList.find((item: any) => item.itemId === itemId && item.isChecked === true && item.rowIndex === index);
          if (!item1) {
            // this.alert.ShowAlert("msgPleaseEnterSerial", 'error');
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        }
      }


      if (this.CanSaleExpiredItems === false) {
        debugger
        const today = new Date();
        const formattedToday = formatDate(today, "yyyy-MM-dd", "en-US");

        for (let i = 0; i < this.invDtlList.length; i++) {
          const element = this.invDtlList[i];
          if (element.expiryDate < formattedToday) {
            this.alert.ShowAlert("msgCanotSaveBecuseMatrealIsExpiryDate", 'error');
            this.disableSave = false;
            return;
          }
        }
      }


      this.invDtlList.forEach(element => {
        if (this.useAccountInGrid == true) {
          this.OutputVoucherAddForm.value.accountId = element.debitAccountId;
          element.accountId = element.debitAccountId;
        }
      });
      element.index = index.toString();
    }
    // End

    this.OutputVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.OutputVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.OutputVoucherAddForm.value.voucherNo = this.OutputVoucherAddForm.value.voucherNo.toString();
    this.OutputVoucherAddForm.value.invVouchersDTModelList = this.invDtlList;
    this.OutputVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.OutputVoucherAddForm.value.amount = this.calculateSum();
    debugger
    this.OutputService.SaveOutputVoucher(this.OutputVoucherAddForm.value)
      .subscribe((result) => {

        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find((option: any) => option.label === this.OutputVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintOutputVoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy' || this.reservedId > 0) {
            this.router.navigate(['InventoryVouchers/OutputVoucherList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.disableSave = false;
          this.ngOnInit();
        }
        else {
          if (result.message.includes("Qty")) {
            let qtyArray: number[] = [];
            const regex = /Qty:([\d,]+)/;
            const match = result.message.match(regex);

            if (match && match[1]) {
              qtyArray = match[1].split(',').filter((num: string) => num !== '').map((num: string) => parseInt(num, 10));
            }
            for (let i = 0; i < qtyArray.length; i++) {
              for (let j = 0; j < this.invDtlList.length; j++) {
                if (this.invDtlList[j].itemId === qtyArray[i]) {
                  this.invDtlList[j].qty = 0;
                  this.invDtlList[j].price = 0;
                  this.invDtlList[j].total = 0;
                  this.invDtlList[j].productDate = null;
                  this.invDtlList[j].expiryDate = null;
                  this.invDtlList[j].batchNo = "";
                  this.invDtlList[j].orginalQty = 0;
                  this.invDtlList[j].newRow = 0;
                  this.invDtlList[j].debitAccountId = 0;
                  this.showRemainQty = false;
                  this.cdr.detectChanges();
                }
              }
            }
            this.alert.ShowAlert('QtyError', 'error');
            this.disableSave = false;
          }
          else {
            this.alert.ShowAlert(result.message, 'error');
            this.disableSave = false;
          }

        }
        // this.disableSave = false;
      })
  }

  ClearAfterSave() {
    this.OutputVoucherAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.OutputVoucherAddForm.get("storeId")?.setValue(0);
    this.OutputVoucherAddForm.get("dealerId")?.setValue(0);
    this.OutputVoucherAddForm.get("note")?.setValue("");
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.OutputVoucherAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    if (this.reservedId == 0 || this.reservedId == null || this.reservedId == undefined) {
      this.invDtlList = [];
      this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    }
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find((option: any) => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find((option: any) => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find((option: any) => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find((option: any) => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.OutputVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.OutputVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.OutputVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.OutputService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.OutputVoucherAddForm.get("voucherNo")?.setValue(results);
        }
        else {
          this.OutputVoucherAddForm.get("voucherNo")?.setValue(1);
        }
        this.OutputVoucherAddForm.get("branchId")?.setValue(branchId);
        //this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      });
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
  }

  GetQty(itemId: number, storeId: number, unitId: number) {
    let transDate = this.OutputVoucherAddForm.value.voucherDate;
    this.InvService.GetItemQty(itemId, storeId, unitId, transDate).subscribe(result => {
      if (result != null) {
        return result;
      }

    })
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.showRemainQty = false;
    this.serialsListss = [];
    this.invDtlList.forEach(item => {
      item.newRow = 1;
    });
    if (!this.useStoreInGrid) {
      if (this.OutputVoucherAddForm.value.storeId == 0) {
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
        price: "",
        total: 0,
        costCenterId: 0,
        productDate: '',
        expiryDate: '',
        batchNo: '',
        accountId: 0,
        debitAccountId: 0,
        orginalQty: 0,
        newRow: 0,
        index: this.invDtlList.length
      });

    this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
  }

  deleteRow(row: any, rowIndex: number) {
    debugger
    const itemIdToRemove = this.OutputVoucherAddForm.value.itemsSerialList.filter((item: any) => item.index !== rowIndex);

    this.OutputVoucherAddForm.get("itemsSerialList")?.setValue(itemIdToRemove);
    // if (rowIndex !== -1) {
    //   this.invDtlList.splice(rowIndex, 1);
    //   this.OutputVoucherAddForm.value.itemsSerialList.splice(rowIndex, 1);
    // }
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      let indexToRemove = this.OutputVoucherAddForm.value.itemsSerialList.findIndex((element: any) => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.OutputVoucherAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
      else {
        this.OutputVoucherAddForm.value.itemsSerialList.forEach((element: any) => {
          if (element.rowIndex != 0) {
            element.rowIndex = element.rowIndex - 1;
          }
        });
      }
    }
    this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
  }

  isEmpty(input: any) {
    return input === '' || input === null;
  }

  isRequierdEx(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
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

    if (item.hasExpiry) {
      if (this.invDtlList[index].batchNo == "" || this.invDtlList[index].batchNo == null) {
        return true;
      }

    }
    else {
      return false;
    }

  }

  isRequierdSerial(row: any) {
    const itemId = row.itemId;
    const item = this.itemsList.find((item: any) => item.id === itemId);
    if (item.hasSerial) {
      return false;
    }
    else {
      return true;
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
      price: "",
      total: 0,
      costCenterId: 0,
      productDate: '',
      expiryDate: '',
      batchNo: '',
      accountId: 0,
      orginalQty: 0,
      newRow: 0,
      index: "",
      debitAccountId: 0,
    };

    this.invDtlList.splice(rowIndex, 0, newRow);
    this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
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
        this.OutputService.DeleteInvVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['InventoryVouchers/OutputVoucherList']);
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

  onChangeItem(itemId: number, i: number, reset = true) {

    if (reset == true) {
      this.serialsListss = [];
      this.invDtlList[i].qty = "";
      this.invDtlList[i].total = 0;
      this.invDtlList[i].price = "";
      this.invDtlList[i].productDate = null;
      this.invDtlList[i].expiryDate = null;
      this.invDtlList[i].batchNo = null;
    }
    this.OutputService.GetItemUintbyItemId(itemId).subscribe(res => {
      debugger
      this.unitsList[i] = res;
      if (res.length == 2) {
        this.invDtlList[i].unitId = res[1].id;
      }
      else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
        this.invDtlList[i].unitId = this.invDtlList[i].unitId;
      }
      else {
        this.invDtlList[i].unitId = res[0].id;
      }
      this.onChangeUnit(this.invDtlList[i], i, false);
    });


    if (itemId > 0) {
      if (this.invDtlList.length > 0) {
        let isDuplicate = false;
        for (let m = 0; m < this.invDtlList.length; m++) {
          if (this.invDtlList[m].itemId == itemId && m != i) {
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
      var selectedItem = this.itemsList.find((x: any) => x.id === itemId);
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
    debugger
    let acc = this.itemsList.find((r: any) => r.id == itemId)?.costAccId ?? 0
    if(acc > 0)
      {
        this.invDtlList[i].debitAccountId = acc;
        this.cdr.detectChanges();
      }
    else
      {
         this.invDtlList[i].debitAccountId = 0;
        this.cdr.detectChanges();
      }

  }

  onChangeUnit(Row: any, i: number, type: boolean) {
    if (type == true) {
      this.invDtlList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.InvService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.invDtlList[i].unitRate = res;
      });
    }
  }

  async GetItemSerials(row: any, rowIndex: number): Promise<void> {

    let store = 0;
    if (this.useStoreInGrid) {
      store = row.storeId;
    }
    else {
      store = this.OutputVoucherAddForm.value.storeId;
    }
    try {
      this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
      this.openSerialsPopup(row, rowIndex);
    } catch (error) {
      console.error('Error fetching item serials', error);
    }

  }

  onStoreChange(event: any, row: any, index: number) {

    if (this.useStoreInGrid) {
      setTimeout(() => {
        // if (row.qty > 0) {
        this.invDtlList[index].qty = "";
        this.invDtlList[index].price = "";
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
            this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {

            this.OutputVoucherAddForm.get("storeId")?.setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }

  }

  getItemQtyFromStore(event: any, row: any, Index: number) {
    debugger;
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }

    this.InvService.getItemQtyFromStore(row.itemId, row.unitId, row.qty, this.OutputVoucherAddForm.value.storeId).subscribe(res => {
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
  }

  OnBlurChange(event: any, row: any, Index: number) {
    debugger
    if (this.invDtlList[Index].itemId == 0) {
      this.alert.ShowAlert("PleaseEnterItemID", 'error');
      setTimeout(() => {
        this.invDtlList[Index].qty = 0;
        this.cdr.detectChanges();
      });

      return;
    }
    if (this.invDtlList[Index].unitId == 0) {
      this.alert.ShowAlert("PleaseEnterUnitID", 'error');
      setTimeout(() => {
        this.invDtlList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }
    if (this.useStoreInGrid == true) {
      if (this.invDtlList[Index].storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
    }
    else {
      this.invDtlList[Index].storeId = this.OutputVoucherAddForm.value.storeId;
    }

    let transDate = this.OutputVoucherAddForm.value.voucherDate;
    if (row.qty < 0) {
      this.alert.ShowAlert("CantAddValueLessThanZero", 'error');
      this.invDtlList[Index].qty = 0;
      return;
    }
    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }
    debugger
    let diffitemQty = 0;
    if (row.id > 0) {
      diffitemQty = row.qty - row.mainQty;
    }
    if (diffitemQty < 0)
      return;
    let itemQty = this.invDtlList.filter(item => item.index !== Index && item.itemId == row.itemId).reduce((sum, item) => sum + item.qty, 0);

    this.InvService.GetItemQty(row.itemId, row.storeId, row.unitId, transDate, row.qty).subscribe(res => {
      debugger
      if (res.length == 0) {
        setTimeout(() => {
          row.qty = 0;
          row.price = 0;
          row.total = 0;
          row.batchNo = null;
          row.expiryDate = null;
          row.productDate = null;
          row.refId = 0;
          this.invDtlList[Index].orginalQty = 0;
          this.invDtlList[Index].newRow = 1;
          this.showRemainQty = false;
          this.cdr.detectChanges();
        });
        this.alert.RemainimgQty("RemainigQty=", 0, 'error');
        return;
      }
      else {
        if (row.id > 0 && diffitemQty > res[0].qoh / row.unitRate) {
          setTimeout(() => {
            row.qty = 0;
            row.price = 0;
            row.total = 0;
            row.batchNo = null;
            row.expiryDate = null;
            row.productDate = null;
            row.refId = 0;
            this.invDtlList[Index].orginalQty = 0;
            this.invDtlList[Index].newRow = 1;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qoh / row.unitRate, 'error');
          return;
        }
        else if (row.id == 0 && row.qty + itemQty > res[0].qoh / row.unitRate) {
          setTimeout(() => {
            row.qty = 0;
            row.price = 0;
            row.total = 0;
            row.batchNo = null;
            row.expiryDate = null;
            row.productDate = null;
            row.refId = 0;
            this.invDtlList[Index].orginalQty = 0;
            this.invDtlList[Index].newRow = 1;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qoh / row.unitRate, 'error');
          return;
        }
      }
      //Moving W. Cost
      if (this.costingMethod == 163 || this.costingMethod == 162) {
        const element = res[0];
        row.price = element.cost.toFixed(this.decimalPlaces);//*row.unitRate;
        row.total = (row.price * row.qty).toFixed(this.decimalPlaces);
        row.batchNo = element.batchNo;
        row.refId = element.id;
        row.expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")
        row.productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US")
        this.invDtlList[Index].orginalQty = element.qoh;
        this.invDtlList[Index].newRow = 1;
        this.showRemainQty = true;
        this.remainingQty = res[0].qoh / row.unitRate;
        this.hideLabelAfterDelay();
        return;
      }
      let remQty = row.qty;
      let addNewLine = false;
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        let itemBatchQty = this.invDtlList.filter(item => item.index !== Index && item.itemId == row.itemId && item.batchNo == element.batchNo).reduce((sum, item) => sum + item.qty, 0);
        let bathQty = (element.inQty - element.outQty) / row.unitRate;
        if (itemBatchQty + remQty <= bathQty) {
          if (addNewLine) {
            this.invDtlList.push(
              {
                id: 0,
                hDId: 0,
                itemId: row.itemId,
                unitId: row.unitId,
                unitRate: row.unitRate,
                storeId: row.storeId,
                qty: remQty,
                price: element.cost.toFixed(this.decimalPlaces),//*row.unitRate,
                total: (remQty * element.cost).toFixed(this.decimalPlaces),//*row.unitRate,
                costCenterId: 0,
                refId: element.id,
                productDate: element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
                expiryDate: element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
                batchNo: element.batchNo,
                accountId: row.accountId,
                orginalQty: element.qoh,
                newRow: 0,
                index: this.invDtlList.length
              });
            this.unitsList[this.invDtlList.length - 1] = this.unitsList[Index];
            this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
            this.showRemainQty = true;
            this.remainingQty = res[0].qoh / row.unitRate;
            this.hideLabelAfterDelay();
            return;
          }
          else {
            row.price = element.cost.toFixed(this.decimalPlaces);//*row.unitRate;
            row.total = (row.price * row.qty).toFixed(this.decimalPlaces);
            row.batchNo = element.batchNo;
            row.refId = element.id;
            row.expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")
            row.productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US")
            this.invDtlList[Index].orginalQty = element.qoh;
            this.invDtlList[Index].newRow = 1;
            this.showRemainQty = true;
            this.remainingQty = res[0].qoh / row.unitRate;
            this.hideLabelAfterDelay();
            return;
          }

        }
        else {
          if (bathQty - itemBatchQty > 0) {
            if (addNewLine) {
              this.invDtlList.push(
                {
                  id: 0,
                  hDId: 0,
                  itemId: row.itemId,
                  unitId: row.unitId,
                  unitRate: row.unitRate,
                  storeId: row.storeId,
                  qty: (bathQty - itemBatchQty),
                  price: element.cost.toFixed(this.decimalPlaces),//*row.unitRate,
                  total: ((bathQty - itemBatchQty) * element.cost).toFixed(this.decimalPlaces),//*row.unitRate,
                  costCenterId: 0,
                  refId: element.id,
                  expiryDate: element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
                  productDate: element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
                  batchNo: element.batchNo,
                  accountId: row.accountId,
                  debitAccountId: row.debitAccountId,
                  orginalQty: element.qoh,
                  newRow: 0,
                  index: this.invDtlList.length
                });
              this.unitsList[this.invDtlList.length - 1] = this.unitsList[Index];
              this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
              remQty = remQty - (bathQty - itemBatchQty);
              this.showRemainQty = true;
              this.remainingQty = res[0].qoh / row.unitRate;
              this.hideLabelAfterDelay();
              addNewLine = true;
            }
            else {
              row.qty = (bathQty - itemBatchQty);
              row.price = element.cost.toFixed(this.decimalPlaces);//*row.unitRate;
              row.total = (element.cost * row.qty).toFixed(this.decimalPlaces);
              row.batchNo = element.batchNo;
              row.refId = element.id;
              row.expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
              row.productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
              this.invDtlList[Index].orginalQty = element.qoh;
              this.invDtlList[Index].newRow = 1;
              remQty = remQty - (bathQty - itemBatchQty);
              this.showRemainQty = true;
              this.remainingQty = res[0].qoh / row.unitRate;
              this.hideLabelAfterDelay();
              addNewLine = true;
            }
          }
        }
      }
      // if(itemQty === 0 && res.length===1){
      //   row.price = res[0].cost;
      //   row.total = res[0].cost * row.qty;
      //   row.batchNo = res[0].batchNo;    
      //   row.expiryDate = formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
      //   row.productDate = formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
      //   this.invDtlList[Index].orginalQty = res[0].qoh;
      //   this.invDtlList[Index].newRow = 1;
      // }
      // else{
      //   if((res[0].inQty - res[0].outQty)/row.unitRate >= row.qty){
      //     row.price = res[0].cost;
      //     row.total = row.qty * res[0].cost;
      //     row.batchNo = res[0].batchNo;    
      //     row.expiryDate = formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
      //     row.productDate = formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
      //     this.invDtlList[Index].orginalQty = res[0].qoh;
      //     this.invDtlList[Index].newRow = 1;
      //     return;
      //   }
      //   else{

      //   }
      //   row.qty = res[0].inQty;
      //   row.price = res[0].cost;
      //   row.total = res[0].inQty * res[0].cost;
      //   row.batchNo = res[0].batchNo;    
      //   row.expiryDate = formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
      //   row.productDate = formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
      //   this.invDtlList[Index].orginalQty = res[0].qoh;
      //   this.invDtlList[Index].newRow = 1;
      //   for (let index = 1; index < res.length; index++) {
      //     this.unitsList[index] = this.unitsList[Index] ;
      //     this.invDtlList.push(
      //     {
      //       id: 0,
      //       hDId: 0,
      //       itemId: row.itemId,
      //       unitId: row.unitId,
      //       unitRate: row.unitRate,
      //       storeId: row.storeId,
      //       qty: res[index].inQty,
      //       price: res[index].cost,
      //       total: res[index].inQty * res[index].cost,
      //       costCenterId: 0,
      //       productDate: formatDate(res[index].productDate, "yyyy-MM-dd", "en-US"),
      //       expiryDate: formatDate(res[index].expiryDate, "yyyy-MM-dd", "en-US"),
      //       batchNo: res[index].batchNo,
      //       accountId: row.accountId,
      //       orginalQty: res[index].qoh,
      //       newRow: 0,
      //       index: this.invDtlList.length
      //     });
      //     this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      //   }          
      // }

      // if(res.length===1){
      //   row.price = res[0].cost;
      //   row.total = res[0].cost * row.qty;
      //   row.batchNo = res[0].batchNo;    
      //   row.expiryDate = formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
      //   row.productDate = formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
      //   this.invDtlList[Index].orginalQty = res[0].qoh;
      //   this.invDtlList[Index].newRow = 1;
      // }
      // else{
      //   row.qty = res[0].inQty;
      //   row.price = res[0].cost;
      //   row.total = res[0].inQty * res[0].cost;
      //   row.batchNo = res[0].batchNo;    
      //   row.expiryDate = formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
      //   row.productDate = formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
      //   this.invDtlList[Index].orginalQty = res[0].qoh;
      //   this.invDtlList[Index].newRow = 1;
      //   for (let index = 1; index < res.length; index++) {
      //     this.unitsList[index] = this.unitsList[Index] ;
      //     this.invDtlList.push(
      //     {
      //       id: 0,
      //       hDId: 0,
      //       itemId: row.itemId,
      //       unitId: row.unitId,
      //       unitRate: row.unitRate,
      //       storeId: row.storeId,
      //       qty: res[index].inQty,
      //       price: res[index].cost,
      //       total: res[index].inQty * res[index].cost,
      //       costCenterId: 0,
      //       productDate: formatDate(res[index].productDate, "yyyy-MM-dd", "en-US"),
      //       expiryDate: formatDate(res[index].expiryDate, "yyyy-MM-dd", "en-US"),
      //       batchNo: res[index].batchNo,
      //       accountId: row.accountId,
      //       orginalQty: res[index].qoh,
      //       newRow: 0,
      //       index: this.invDtlList.length
      //     });
      //     this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      //   }          
      // }
    })
  }

  OnQtyChange(event: any, row: any, Index: number) {

    let transDate = this.OutputVoucherAddForm.value.voucherDate;
    if (row.qty < 0) {
      this.alert.ShowAlert("CantAddValueLessThanZero", 'error');
      this.invDtlList[Index].qty = 0;
      return;
    }
    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }
    // check if we had multiple  Batch ON  same Table
    if (this.invDtlList.length == 1) {
      if (row.batchNo != "" && row.batchNo != null) {
        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > this.invDtlList[Index].orginalQty) {
          const Batch = row.batchNo;
          if (Batch !== "" && Batch !== null && Batch !== undefined) {
            this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[Index].orginalQty, 'error');
            this.invDtlList[Index].qty = 0;
            return false;
          }
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
                this.invDtlList[Index].qty = 0;
                return false;
              });
            }
          }
        }
      }
    }
    // THIS Checks Batch Quantity For The Item
    if (row.orginalQty > 0) {
      if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > row.orginalQty) {
        this.alert.RemainimgQty("QuantityOfBatchNotEnough=", row.orginalQty.toString(), 'error');
        this.invDtlList[Index].qty = null;
        return false;
      }
    }

    // check if we had multiple  item  same id 
    if (this.invDtlList.length > 1) {
      let totalQty = 0;
      for (let i = 0; i < this.invDtlList.length; i++) {
        const item = row.itemId;
        if (this.invDtlList[i].itemId == item && i != Index) {
          totalQty += (row.qty * row.unitRate) + this.invDtlList[i].qty;
          this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {

            if (totalQty > res[0].inQty) {
              setTimeout(() => {
                this.invDtlList[Index].qty = 0;
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
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.invDtlList[Index].storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {

        if (res.length === 1) {
          row.price = res[0].cost;
          row.batchNo = res[0].batchNo;
          row.expiryDate = res[0].expiryDate === null ? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")
          row.productDate = res[0].productDate === null ? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")
          this.invDtlList[Index].productDate = row.productDate;
          this.invDtlList[Index].expiryDate = row.expiryDate;
          this.invDtlList[Index].batchNo = row.batchNo;
          this.invDtlList[Index].orginalQty = res[0].qoh;
          this.invDtlList[Index].newRow = 1;
        }
        else {
          row.qty = res[0].inQty;
          row.price = res[0].cost;
          row.total = res[0].inQty * res[0].cost;
          row.batchNo = res[0].batchNo;
          row.expiryDate = res[0].expiryDate === null ? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")
          row.productDate = res[0].productDate === null ? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")
          this.invDtlList[Index].productDate = row.productDate;
          this.invDtlList[Index].expiryDate = row.expiryDate;
          this.invDtlList[Index].batchNo = row.batchNo;
          this.invDtlList[Index].orginalQty = res[0].qoh;
          this.invDtlList[Index].newRow = 1;
          for (let index = 1; index < res.length; index++) {
            this.unitsList[index] = this.unitsList[Index];
            this.invDtlList.push(
              {
                id: 0,
                hDId: 0,
                itemId: row.itemId,
                unitId: row.unitId,
                unitRate: row.unitRate,
                storeId: row.storeId,
                qty: res[index].inQty,
                price: res[index].cost,
                total: res[index].inQty * res[index].cost,
                costCenterId: 0,
                productDate: res[index].productDate === null ? null : formatDate(res[index].productDate, "yyyy-MM-dd", "en-US"),
                expiryDate: res[index].expiryDate === null ? null : formatDate(res[index].expiryDate, "yyyy-MM-dd", "en-US"),
                batchNo: res[index].batchNo,
                accountId: row.accountId,
                debitAccountId: row.debitAccountId,
                orginalQty: res[index].qoh,
                newRow: 0,
                index: ""
              });
            this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
          }
        }
        //row.price = res[0].cost;
        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qoh) {
          setTimeout(() => {
            this.invDtlList[Index].qty = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.remainingQty = res[0].qoh;
          this.hideLabelAfterDelay();
        }
      })
    }
    else {
      if (this.invDtlList[Index].itemId == 0) {
        this.alert.ShowAlert("PleaseEnterItemID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.OutputVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = 0;
          this.cdr.detectChanges();
        });
        return;
      }
      this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.OutputVoucherAddForm.value.storeId, this.invDtlList[Index].unitId, transDate, this.invDtlList[Index].qty).subscribe(res => {

        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].inQty) {
          setTimeout(() => {
            this.invDtlList[Index].qty = 0;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.remainingQty = res[0].qoh;
          this.hideLabelAfterDelay();
        }
      })
    }
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
    else {
      if (row.total == 0 || row.total == null || row.total == undefined) {
        row.total = 0;
        row.total = row.total.toFixed(this.decimalPlaces);
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
      row.price = parseFloat(row.price).toFixed(this.decimalPlaces);
    }
    if (row.total !== null && row.total !== undefined) {
      row.total = row.price * row.qty;
      row.total = parseFloat(row.total).toFixed(this.decimalPlaces);
    }
  }

  handleF3Key(event: KeyboardEvent, outputList: any, index: number) {
    debugger
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
    else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      this.CopyRow(outputList, index);
    }
    else if (event.key === 'F4') {
      this.AddNewLine();
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
      var store = this.OutputVoucherAddForm.value.storeId;
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

      this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    });

    dialogRef.afterClosed().subscribe(res => {

      for (let i = 0; i < this.invDtlList.length; i++) {
        if (this.invDtlList[i].itemId == 0 || this.invDtlList[i].itemId == null)
          this.invDtlList.splice(i, 1);
      }
      this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
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
          const existingItem = this.OutputVoucherAddForm.value.itemsSerialList.find((item: any) => item.id === serial.id && item.isChecked === true);
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

    var itemName = this.itemsList.find((option: any) => option.id === row.itemId)?.text;
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
          var newList = this.OutputVoucherAddForm.value.itemsSerialList.filter((item: any) => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.OutputVoucherAddForm.get("itemsSerialList")?.setValue(newList);
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

  GetServeditems(id: any) {
    debugger
    this.invDtlList = [];
    if (id !== null || id !== 0 || id !== undefined) {
      this.OutputService.GetServedItems(this.reservedId).subscribe(result => {
        debugger
        if (result) {
          this.invDtlList = result.invVouchersDTModelList;
          this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
          this.OutputVoucherAddForm.get("storeId")?.setValue(result.storeId);
          let index = 0;
          this.invDtlList.forEach(element => {
            element.total = element.qty * element.price;
          })

          this.invDtlList.forEach(element => {
            this.itemsList.forEach((item: any) => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter((unit: any) => unit.id == element.unitId);
                index++;
              }
            });
          })

          debugger
          for (let i = 0; i < this.invDtlList.length; i++) {
            this.invDtlList[i].costCenterId = 0;
            this.invDtlList[i].hDId = 0;
            this.invDtlList[i].id = 0;
            this.invDtlList[i].productDate = null;
            this.invDtlList[i].expiryDate = null;
            this.invDtlList[i].orginalQty = result.invVouchersDTModelList[i].qty;
            this.invDtlList[i].batchNo = null;
            this.invDtlList[i].newRow = 1;
          }
          /*           for (let i = 0; i < this.invDtlList.length; i++) {
                      this.StoredId[i] =  this.invDtlList[i].storeId;
                      } 
                    for (let i = 0; i < this.invDtlList.length; i++) {
                     this.OnPriceBlur(this.invDtlList[i]);
                    }
                    for (let i = 0; i < this.invDtlList.length; i++) {
                      this.onChangeItem(this.invDtlList[i].itemId, i,false);
                    } */

          this.cdr.detectChanges();

        }
      });
    }
    return id;
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    this.allowEditDate = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find((option: any) => option.label === voucherTypeId)?.storeId;
    if (this.allowEditBranch) {
      this.OutputVoucherAddForm.get('branchId')?.disable();
    } else {
      this.OutputVoucherAddForm.get('branchId')?.enable();
    }
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.OutputVoucherAddForm.get('storeId')?.setValue(this.voucherStoreId);
      }
       else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.OutputVoucherAddForm.get("storeId")?.setValue(this.DefaultStoreId);
      }
      else {
        this.OutputVoucherAddForm.get("storeId")?.setValue(0);
      }
    }


  }

  PrintOutputVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptOutputVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptOutputVoucherEN?VId=${voucherId}`;
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
            this.OutputVoucherAddForm.get("generalAttachModelList")?.setValue([]);
            this.OutputVoucherAddForm.get("invvVouchersDocsModelList")?.setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailOutputVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.OutputVoucherAddForm.get("generalAttachModelList")?.setValue([]);
            this.OutputVoucherAddForm.get("invvVouchersDocsModelList")?.setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailOutputVoucher();
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
    this.OutputVoucherAddForm.get("id")?.setValue(0);
    this.OutputVoucherAddForm.get("storeId")?.setValue(0);
    this.OutputVoucherAddForm.get("deliveredTo")?.setValue(0);
    this.OutputVoucherAddForm.get("branchId")?.setValue(0);
    this.OutputVoucherAddForm.get("accountId")?.setValue(0);
    this.OutputVoucherAddForm.get("debitAccountId")?.setValue(0);
    this.OutputVoucherAddForm.get("note")?.setValue('');
    this.OutputVoucherAddForm.get("referenceNo")?.setValue('');
    this.OutputVoucherAddForm.get("referenceDate")?.setValue('');
    this.OutputVoucherAddForm.get("voucherDate")?.setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue([]);
    this.OutputVoucherAddForm.get("invvVouchersDocsModelList")?.setValue([]);
    this.OutputVoucherAddForm.get("itemsSerialList")?.setValue([]);
    this.OutputVoucherAddForm.get("generalAttachModelList")?.setValue([]);
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.calculateSum();
  }

  CopyRow(row: any, index: number) {
    debugger
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
          price: row.price,
          total: row.total,
          costCenterId: row.costCenterId,
          productDate: row.productDate,
          expiryDate: row.expiryDate,
          batchNo: '',
          accountId: row.accountId,
          debitAccountId: row.debitAccountId,
          orginalQty: 0,
          newRow: 0,
          index: this.invDtlList.length
        });

      this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
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
          price: row.price,
          total: row.total,
          costCenterId: row.costCenterId,
          productDate: row.productDate,
          expiryDate: row.expiryDate,
          batchNo: '',
          accountId: row.accountId,
          debitAccountId: row.debitAccountId,
          orginalQty: 0,
          newRow: 0,
          index: this.invDtlList.length
        });

      this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
    }
    setTimeout(() => {
      this.OutputService.GetItemUintbyItemId(row.itemId).subscribe(res => {
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

  exportHeadersToExcel() {
    const headerNames = this.headers.map(h => h.label);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Headers');
    XLSX.writeFile(wb, 'OutputVoucherExcel.xlsx');
  }

  ImportFromExcel(event: any): void {
    if (!this.useStoreInGrid) {
      if (this.OutputVoucherAddForm.value.storeId == 0) {
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

      this.OutputService.ImportFromExcel(excelData).subscribe(
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
                var selectedItem = this.itemsList.find((x:any) => x.id === row.itemId);
                if (selectedItem && Number(selectedItem.debitAcc) > 0) {
                  this.invDtlList[0].debitAccountId = Number(selectedItem.debitAcc);
                  row.debitAccountId = Number(selectedItem.debitAcc);
                }
              }
            });

            const requests = this.invDtlList.map((Row, i) =>
              this.OutputService.GetItemUintbyItemId(Row.itemId).pipe(
                tap(res => {
                  debugger
                  this.unitsList[i] = res;

                  if (response.length === 2) 
                  {
                    this.invDtlList[i].unitId = res[1].id;
                  } 

                  else if (this.opType === "Edit")
                  {
                    let unit = this.unitsList[i].find((r: any) => r.id == Row.unitId);
                    if (!unit) {
                      this.invDtlList[i].unitId = 0;
                    } 
                    else 
                    {
                      this.invDtlList[i].unitId = Row.unitId;
                    }
                  } 
                  else 
                  {
                    //this.invDtlList[i].unitId = response.length > 0 ? res[0].id : 0;
                    let unit = this.unitsList[i].find((r: any) => r.data4 == true).id;
                    this.invDtlList[i].unitId = unit;
                  }

                  this.onChangeUnit(Row, i, false);
                })
              )
            );

            forkJoin(requests).subscribe(
              async () => {
                this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);

                for (let i = 0; i < this.invDtlList.length; i++) {
                  const row = this.invDtlList[i];
                  try {
                    this.serialsListss = await this.InvService.GetItemSerials(
                      row.itemId,
                      this.OutputVoucherAddForm.value.storeId
                    ).toPromise();
                  } catch (error) {
                    console.error(`فشل في تحميل السيريالز للصنف ${row.itemId}:`, error);
                  }
                }
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
