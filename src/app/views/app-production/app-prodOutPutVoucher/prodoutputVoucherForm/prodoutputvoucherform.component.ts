import { Component, OnInit, ElementRef, ViewChild, viewChild } from '@angular/core';
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
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ActivatedRoute, Params } from '@angular/router';
import { InvVoucherService } from 'app/views/app-inventory/app-inventoryService.service';
import { ProdoutputVoucherService } from '../prodoutputvoucher.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-prodoutputvoucherform',
  templateUrl: './prodoutputvoucherform.component.html',
  styleUrl: './prodoutputvoucherform.component.scss'
})
export class ProdoutputvoucherformComponent implements OnInit {
  @ViewChild(FinancialvoucherComponent) Financialvoucher:FinancialvoucherComponent;
  private subscription: Subscription;
  OutputVoucherAddForm: FormGroup;
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
  showsave: boolean;
  storeId: any;
  currencyList: any;
  selectedItems: any[] = [];
  invVouchersDtFormArray: FormArray;
  voucherTypeEnum = 236;
  oldStoreId: any;
  remainingQty: number;
  showRemainQty: boolean;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number;
  productionId: number = 0;
  fromReserved: number = 0;
  voucherType: any;
  productionOrdersList:any;
  public disableAll: boolean = false;
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
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number;
  ShowDisburseEntity: boolean;
  //End
  unAvlItems: any;
  allowAccRepeat: any;
  StoredId: any[];
  Lang: string;
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  supplierList: any;
  NewDate: Date = new Date;
  CanSaleExpiredItems: boolean = false;
  remainingQtyMessage: string = '';
  HideVoucher:boolean = false;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
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
        private service: ProdoutputVoucherService,
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
        this.productionId = +params['ProdId'];
        this.opType = params['opType'];
      });
        if(this.opType == 'createOutPutVoucher')
          {
            this.routePartsService.GuidToEdit = 0;
            this.routePartsService.Guid2ToEdit = 'Add';
            this.routePartsService.Guid3ToEdit = true;
            this.fromReserved = 0;
          }
      
      if (this.productionId == null || this.productionId == undefined || this.productionId === 0 || isNaN(this.productionId)) {
  
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
        this.voucherId = 0;
        this.opType = 'Add';
        this.showsave = true;
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
        this.router.navigate(['ProductionOutPutVoucher/Prodoutputvoucherlist']);
      }
      this.voucherId=Number(this.voucherId)
  
      const storedData = localStorage.getItem('items');
      localStorage.removeItem('items');

    if (storedData) {
      this.unAvlItems = JSON.parse(storedData);
      console.log('Updating shared data:', this.unAvlItems);
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
        refVoucherId:[0, [Validators.required, Validators.min(1)]],
        refVoucherTypeId:[0],
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
      this.service.GetInitailoutputVoucher(Number(this.voucherId), this.opType, this.voucherTypeEnum).subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['ProductionOutPutVoucher/Prodoutputvoucherlist']);
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
          printAfterSave: item.printAfterSave,
          debitAccId:item.debitAccId
        }));
        this.itemsList = result.itemsList.map((item) => ({
          id: item.id,
          text: item.text,
          storeId: item.storeId,
          hasExpiry: item.hasExpiry,
          hasSerial: item.hasSerial,
          debitAcc: item.data1
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
        this.productionOrdersList = result.productionOrdersList;
        this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
        this.serialsListss = [];
        this.tabelData = [];
        if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined && result.itemsSerialsTransList.length !== 0) {
          result.itemsSerialsTransList.forEach(item => {
            item.isChecked = true;
          });
  
        }
        else {
          this.OutputVoucherAddForm.value.itemsSerialList = [];
        }
        this.savedSerials = result.itemsSerialsTransList;
        if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
          this.OutputVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
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
        debugger;        
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
              
              this.itemsList.forEach(item => {
                
                if (item.id === element.itemId) {
                  this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                  this.invDtlList[index].expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                  this.invDtlList[index].productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                  this.invDtlList[index].batchNo = element.batchNo;
                  this.invDtlList[index].newRow = 1;
                  index++;
                }
              });
            })
          }
  
          
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
  
            this.OutputVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
            this.OutputVoucherAddForm.get("branchId").setValue(result.branchId);
            this.OutputVoucherAddForm.get("storeId").setValue(result.storeId);
            this.OutputVoucherAddForm.get("dealerId").setValue(result.dealerId);
            this.OutputVoucherAddForm.get("note").setValue(result.note);
            this.OutputVoucherAddForm.get("accountId").setValue(result.accountId);
            if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined) {
              this.OutputVoucherAddForm.get("itemsSerialList").setValue(result.itemsSerialsTransList);
            }
  
            if (result.allowMultiBranch == false) {
              const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.branchId);
              this.branchesList = [defaultBranche];
              this.OutputVoucherAddForm.get("branchId").setValue(result.branchId);
            }
  
          }
          else {
            this.OutputVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
            this.OutputVoucherAddForm.get("storeId").setValue(0);
            if (result.allowMultiBranch == false) {
              const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
              this.branchesList = [defaultBranche];
              this.OutputVoucherAddForm.get("branchId").setValue(defaultBranche.id);
            }
            this.OutputVoucherAddForm.get("accountId").setValue(0);
            let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id;
            if(defaultVoucher == undefined || defaultVoucher == null)
              {
                defaultVoucher = 0;
              }
            this.OutputVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
            this.OutputVoucherAddForm.get("branchId").setValue(0);
            this.getVoucherNo(defaultVoucher);
          }
          if (this.opType == "Show") {
            this.disableAll = true;
          }
          else {
            this.GetVoucherTypeSetting(this.OutputVoucherAddForm.value.voucherTypeId)
          }
  
        });
        if(this.productionId  > 0)
        {
          this.GetProdRawMaterials(this.productionId);
        }
        if(this.unAvlItems.length >0)
        {
          debugger;
            let index = 0;
            this.invDtlList = this.unAvlItems;
            this.invDtlList.forEach(element => {
            element.total = element.qty * element.cost;
            element.mainQty = element.qty;
            element.price = element.cost
          })

          this.invDtlList.forEach(element => {              
              this.itemsList.forEach(item => {
                debugger;
                if (item.id === element.itemId) {
                  this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                  this.invDtlList[index].newRow = 1;
                  index++;
                }
              });
            })

          for (let i = 0; i < this.invDtlList.length; i++) {
            debugger;
            this.OnPriceBlur(this.invDtlList[i]);
            this.onChangeItem(this.invDtlList[i].itemId, i, false);
          }
        }
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
        const item = this.itemsList.find(item => item.id === element.itemId);
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

        element.i = i.toString();
      }
  
      // special Validation 
  
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
            const checkedItemCount = this.OutputVoucherAddForm.value.itemsSerialList.reduce((count, item) => {
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
            const item1 = this.OutputVoucherAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.isChecked === true && item.rowIndex === index);
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
  
  
        // this.invDtlList.forEach(element => {
        //   if (this.useAccountInGrid == true) {
        //     this.OutputVoucherAddForm.value.accountId = element.debitAccountId;
        //   }
        // });
        element.index = index.toString();
      }
      // End
      let DebitAcc = this.OutputVoucherAddForm.value.accountId;
      if(this.inventoryType == 124 && (DebitAcc == null || DebitAcc == undefined || DebitAcc == 0))
        {
           this.alert.ShowAlert("PleaseInsertWork-in-ProcessCalculation", 'error');
            this.disableSave = false;
            return false;
        } 
      this.OutputVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.OutputVoucherAddForm.value.userId = this.jwtAuth.getUserId();
      this.OutputVoucherAddForm.value.voucherNo = this.OutputVoucherAddForm.value.voucherNo.toString();
      this.OutputVoucherAddForm.value.invVouchersDTModelList = this.invDtlList;
      this.OutputVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
      
      this.OutputVoucherAddForm.value.amount = this.calculateSum();
      
      this.service.SaveOutputVoucher(this.OutputVoucherAddForm.value)
        .subscribe((result) => {
          debugger
          if (result.isSuccess) {
            this.alert.SaveSuccess();
  
            
            var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.OutputVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
            if (PrintAfterSave == true) {
              this.PrintOutputVoucher(Number(result.message));
            }
  
            this.ClearAfterSave();
            if (this.opType == 'Edit' || this.opType == 'Copy') {
              this.router.navigate(['ProductionOutPutVoucher/Prodoutputvoucherlist']);
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
                qtyArray = match[1].split(',').filter(num => num !== '').map(num => parseInt(num, 10));
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
      this.OutputVoucherAddForm.get("storeId").setValue(0);
      this.OutputVoucherAddForm.get("dealerId").setValue(0);
      this.OutputVoucherAddForm.get("note").setValue("");
      this.OutputVoucherAddForm.get("branchId").setValue(0);
      this.OutputVoucherAddForm.get("storeId").setValue(0);
      this.OutputVoucherAddForm.get("accountId").setValue(0);
      this.OutputVoucherAddForm.get("voucherTypeId").setValue(0);  
      this.OutputVoucherAddForm.get("refVoucherId").setValue(0); 
      this.OutputVoucherAddForm.get("note").setValue('');
      this.OutputVoucherAddForm.get("referenceNo").setValue('');
      this.OutputVoucherAddForm.get("referenceDate").setValue('');
      this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue([]);
      this.OutputVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
      this.OutputVoucherAddForm.get("generalAttachModelList").setValue([]);
      this.childAttachment.data = [];
      this.invDtlList = [];
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ProdId: 0 },
        queryParamsHandling: 'merge',
      });

      // Optionally also clear your local variable
      this.productionId = null;
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = true;
      this.GetInitailOutputVoucher();
    }
    
    getVoucherNo(event: any) {
      debugger
      if (this.productionId == 0 || this.productionId == null || this.productionId == undefined) {
        this.invDtlList = [];
        this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      }
      if(event === undefined)
        return;
      const selectedValue = event.value === undefined ? event : event.value;
      var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
      var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
      var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
      this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
      var voucherCategory = this.OutputVoucherAddForm.value.voucherTypeEnum;
      var voucherTypeId = this.OutputVoucherAddForm.value.voucherTypeId;
      var date = new Date(this.OutputVoucherAddForm.value.voucherDate);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
  
      if (voucherTypeId > 0) {
        this.service.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
          if (results) {
            this.OutputVoucherAddForm.get("voucherNo").setValue(results);
          }
          else {
            this.OutputVoucherAddForm.get("voucherNo").setValue(1);
          }
          this.OutputVoucherAddForm.get("branchId").setValue(branchId);
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
      
      if (this.disableAll == true) {
        return;
      }
      this.showRemainQty = false;    
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
          orginalQty: 0,
          newRow: 0,
          index: this.invDtlList.length
        });
  
      this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    }
    
    deleteRow(row, rowIndex: number) {
      
      const itemIdToRemove = this.OutputVoucherAddForm.value.itemsSerialList.filter(item => item.index !== rowIndex);    
      this.OutputVoucherAddForm.get("itemsSerialList").setValue(itemIdToRemove);
      if (rowIndex !== -1) {
        this.invDtlList.splice(rowIndex, 1);
        this.unitsList.splice(rowIndex, 1);
        let indexToRemove = this.OutputVoucherAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
        if (indexToRemove !== -1) {
          this.OutputVoucherAddForm.value.itemsSerialList.splice(indexToRemove, 1);
        }
        else {
          this.OutputVoucherAddForm.value.itemsSerialList.forEach(element => {
            if (element.rowIndex != 0) {
              element.rowIndex = element.rowIndex - 1;
            }
          });
        }
      }
      this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    }
    
    isEmpty(input) {
      return input === '' || input === null;
    }
           
    isRequierdBatch(row: any, index: number) {
  
      const itemId = row.itemId;
      const item = this.itemsList.find(item => item.id === itemId);
  
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
    
    isValidVoucherDate(event) {
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
      };
  
      this.invDtlList.splice(rowIndex, 0, newRow);
      this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
          this.service.DeleteInvVoucher(id).subscribe((results) => {
            if (results.isSuccess == true) {
              this.alert.DeleteSuccess();
              this.router.navigate(['ProductionOutPutVoucher/Prodoutputvoucherlist']);
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
      if (reset == true) {
        this.serialsListss = [];
        this.invDtlList[i].qty = "";
        this.invDtlList[i].total = 0;
        this.invDtlList[i].price = "";
        this.invDtlList[i].productDate = null;
        this.invDtlList[i].expiryDate = null;
        this.invDtlList[i].batchNo = null;
      }
      this.service.GetItemUintbyItemId(itemId).subscribe(res => {
        debugger;
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
        var selectedItem = this.itemsList.find(x => x.id === itemId);
        if (selectedItem && selectedItem.storeId > 0) {
          var defaultStoreNo = selectedItem.storeId;
          this.invDtlList[i].storeId = defaultStoreNo;
          this.cdr.detectChanges();
        }
        else {
          this.cdr.detectChanges();
        }
      }
  
      if (this.useAccountInGrid == true) {
        var selectedItem = this.itemsList.find(x => x.id === itemId);
        if (selectedItem && Number(selectedItem.debitAcc) > 0) {
          this.invDtlList[i].debitAccountId = Number(selectedItem.debitAcc);
        }
      }
  
    }
    
    onChangeUnit(Row, i, type) {
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
    
    getItemQtyFromStore(event: any, row: any, Index: number) {
      ;
      if (row.qty !== 0 && row.price !== 0) {
        row.total = row.qty * row.price;
        row.total = row.total.toFixed(this.decimalPlaces);
      }
  
      this.InvService.getItemQtyFromStore(row.itemId, row.unitId, row.qty, row.storeId).subscribe(res => {
        ;
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
    
    let diffitemQty = 0;
    if (row.id > 0) {
      diffitemQty = row.qty - row.mainQty;
    }
    if (diffitemQty < 0)
      return;
    //let itemQty = this.invDtlList.filter(item => item.index !== Index).reduce((sum, item) => sum + item.qty, 0);

    this.InvService.GetItemQty(row.itemId, row.storeId, row.unitId, transDate, row.qty).subscribe(res => {
      
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
        else if (row.id == 0 && row.qty > res[0].qoh / row.unitRate) {
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
                price: element.cost,//*row.unitRate,
                total: remQty * element.cost,//*row.unitRate,
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
            this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
            this.showRemainQty = true;
            this.remainingQty = res[0].qoh / row.unitRate;
            this.hideLabelAfterDelay();
            return;
          }
          else {
            row.price = element.cost;//*row.unitRate;
            row.total = row.price * row.qty;
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
                  price: element.cost,//*row.unitRate,
                  total: (bathQty - itemBatchQty) * element.cost,//*row.unitRate,
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
              this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
              remQty = remQty - (bathQty - itemBatchQty);
              this.showRemainQty = true;
              this.remainingQty = res[0].qoh / row.unitRate;
              this.hideLabelAfterDelay();
              addNewLine = true;
            }
            else {
              row.qty = (bathQty - itemBatchQty);
              row.price = element.cost;//*row.unitRate;
              row.total = element.cost * row.qty;
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
              this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
  
        this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      });
  
      dialogRef.afterClosed().subscribe(res => {
  
        for (let i = 0; i < this.invDtlList.length; i++) {
          if (this.invDtlList[i].itemId == 0 || this.invDtlList[i].itemId == null)
            this.invDtlList.splice(i, 1);
        }
        this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
      if(voucherTypeId === undefined)
        return;
      this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
      this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
      this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
      this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
      let DebitAcc = this.voucherTypeList.find(option => option.label === voucherTypeId)?.debitAccId ?? 0;
      if(DebitAcc > 0)
        {
          this.OutputVoucherAddForm.get("accountId").setValue(DebitAcc);
        }
      else
        {
          this.OutputVoucherAddForm.get("accountId").setValue(0);
        } 
      if (this.allowEditBranch) {
        this.OutputVoucherAddForm.get('branchId').disable();
      } else {
        this.OutputVoucherAddForm.get('branchId').enable();
      }
      if (this.opType == 'Add') {
        if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
          this.OutputVoucherAddForm.get('storeId').setValue(this.voucherStoreId);
        }
        else {
          this.OutputVoucherAddForm.get('storeId').setValue(0);
          this.voucherStoreId = 0;
        }
      }
  
  
    }
    
    PrintOutputVoucher(voucherId: number) {
      
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
  
    voucherNoBlur(VoucherTypeId, VoucherNo) {
      
      if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
        this.InvService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
          
          if (res.id > 0) {
  
            if (res.status == 66) {
              this.voucherId = res.id;
              this.opType = "Edit";
              this.OutputVoucherAddForm.get("generalAttachModelList").setValue([]);
              this.OutputVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
              this.childAttachment.data = [];
              this.showsave = true;
              this.disableAll = false;
              this.cdr.detectChanges();
              this.Financialvoucher.ngOnInit()
              this.GetInitailOutputVoucher();
            }
            else if (res.status == 67 || res.status == 68) {
              this.voucherId = res.id;
              this.opType = "Show";
              this.OutputVoucherAddForm.get("generalAttachModelList").setValue([]);
              this.OutputVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
              this.childAttachment.data = [];
              this.showsave = false;
              this.cdr.detectChanges();
              this.Financialvoucher.ngOnInit()
              this.GetInitailOutputVoucher();
            }
          }
          else {
            this.voucherId = 0;
            this.opType = "Add";
            this.showsave = true;
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
      this.OutputVoucherAddForm.get("id").setValue(0);
      this.OutputVoucherAddForm.get("storeId").setValue(0);
      this.OutputVoucherAddForm.get("deliveredTo").setValue(0);
      this.OutputVoucherAddForm.get("branchId").setValue(0);
      this.OutputVoucherAddForm.get("accountId").setValue(0);
      this.OutputVoucherAddForm.get("refVoucherId").setValue(0);      
      this.OutputVoucherAddForm.get("note").setValue('');
      this.OutputVoucherAddForm.get("referenceNo").setValue('');
      this.OutputVoucherAddForm.get("referenceDate").setValue('');
      this.OutputVoucherAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
      this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue([]);
      this.OutputVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
      this.OutputVoucherAddForm.get("itemsSerialList").setValue([]);
      this.OutputVoucherAddForm.get("generalAttachModelList").setValue([]);
      this.childAttachment.data = [];
      this.invDtlList = [];
      this.calculateSum();
    }
    
    CopyRow(row, index) {
      
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
  
        this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
  
        this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      }
      setTimeout(() => {
        this.service.GetItemUintbyItemId(row.itemId).subscribe(res => {
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
        
    isRequierdEx(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
    if (item.hasExpiry) {
      if (this.invDtlList[index].expiryDate == "" || this.invDtlList[index].expiryDate == null) {
        return true;
      }

    }
    else {
      return false;
    }

    }

    OnProdOrdersChange(event:any)
    {
      debugger
      if(event.value > 0)
        {
          this.service.GetProdMaterialItems(event.value).subscribe(res => {
            
            if(res.length > 0)
              {
                this.invDtlList=res;
                this.invDtlList.forEach(element => {
                element.total = element.qty * element.price;
                element.mainQty = element.qty;
                })
                let index = 0;
                this.invDtlList.forEach(element => {
                  
                  this.itemsList.forEach(item => {
                    
                    if (item.id === element.itemId) {
                      this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                      this.invDtlList[index].expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                      this.invDtlList[index].productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                      this.invDtlList[index].batchNo = element.batchNo;
                      this.invDtlList[index].newRow = 1;
                      index++;
                    }
                  });
                })
                for (let i = 0; i < this.invDtlList.length; i++) {
                  this.OnPriceBlur(this.invDtlList[i]);       
                  this.onChangeItem(this.invDtlList[i].itemId, i, false);           
                  this.isRequierdEx(this.invDtlList[i], i);
                  this.isRequierdBatch(this.invDtlList[i], i);
                  this.OnBlurChange(0,this.invDtlList[i], i);
                  
                }
                
                this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
              }

          })
        }
      else
        {
          this.invDtlList=[];
          this.OutputVoucherAddForm.get("refVoucherTypeId").setValue(0);
          this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
        }

    }
    
    GetProdRawMaterials(ProdId: number) {
    
    this.service.GetProdMaterialItems(ProdId).subscribe(res => {
      
      this.invDtlList = res;        
      let index = 0;
        for (const element of this.invDtlList) {
          element.total = element.qty * element.price;
          element.mainQty = element.qty;
        }
          for (const element of this.invDtlList) {
            let item =  this.itemsList.find(c=> c.id == element.itemId);
            if(item){
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.invDtlList[index].expiryDate = element.expiryDate === null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].productDate = element.productDate === null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].batchNo = element.batchNo;
                this.invDtlList[index].newRow = 1;
                index++;              
            }
          }
        for (let i = 0; i < this.invDtlList.length; i++) {
          this.OnPriceBlur(this.invDtlList[i]);
          this.onChangeItem(this.invDtlList[i].itemId, i, false);
          this.isRequierdEx(this.invDtlList[i], i);
          this.isRequierdBatch(this.invDtlList[i], i);
          this.OnBlurChange(0,this.invDtlList[i], i);
        }
        
        this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
        this.OutputVoucherAddForm.get("refVoucherId").setValue(ProdId);
    });
    }



}
