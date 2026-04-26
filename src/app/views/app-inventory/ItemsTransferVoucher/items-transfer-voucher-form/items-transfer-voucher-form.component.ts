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
import { ItemssearchComponent } from 'app-ItemsAdvanceSearch/itemssearch.component';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { InvVoucherService } from '../../app-inventoryService.service';
import { ChangeDetectorRef } from '@angular/core';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { TransferStkVoucherService } from '../items-transfer-voucher.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-items-transfer-voucher-form',
  templateUrl: './items-transfer-voucher-form.component.html',
  styleUrls: ['./items-transfer-voucher-form.component.scss']
})
export class ItemsTransferVoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) attachments: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  private subscription: Subscription;
  TransferStockVoucherAddForm: FormGroup;
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
  storesList: any;
  branchesList: any;
  voucherTypeList: any;
  deliveredToList: any;
  itemsList: any;
  unitsList: Array<any> = [];
  allUntiesList: any;
  accountsList: any;
  costcenterList: any;
  currencyList: any;
  isdisabled: boolean = false;
  showsave: boolean;
  storeId: any;
  selectedItems: any[] = [];
  invVouchersDtFormArray: FormArray;
  oldStoreId: any;
  remainingQty: any;
  toStoreName:any;
  LastVoucher:any;
  disableSerial: boolean;
  CurrentQty:any;
  SoldQty:any;
  showToStoreInfo:boolean;
  showRemainQty: boolean;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number;
  voucherTypeEnum = 36;
  disableAll:boolean=false;
  voucherType:any;
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
  allowAccRepeat:any;
  //VoucherTypeSetting
  allowEditDate:boolean= false;
  allowEditVoucherSerial:boolean= false;
  allowEditBranch:boolean= false;
  voucherStoreId:number;
  //End
  disableSave:boolean;
  NewDate :Date = new Date;  
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  Lang: string;
  disapleVoucherType: boolean = false;
  HideVoucher:boolean = false;
  DefaultStoreId: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private transferStkService: TransferStkVoucherService,
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
    ) {

  }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    this.voucherType ="Inventory";
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null){
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else{
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
      this.router.navigate(['TransferStockVoucher/ItemsTransferVoucherList']);
    }

    this.InitiailTransferStockVoucherForm();
    this.GetInitailTransferStockVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsTransferVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailTransferStockVoucherForm() {
    this.TransferStockVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      storeId: [0, [Validators.required, Validators.min(1)]],
      toStoreId: [0, [Validators.required, Validators.min(1)]],
      deliveredTo: [0],
      branchId: [null],
      accountId: [0],
      note: [""],
      isCanceled: [0],
      isPosted: [0],
      status: [0],
      amount: [0],
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

  GetInitailTransferStockVoucher() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.transferStkService.GetInitailTransferStockVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['TransferStockVoucher/ItemsTransferVoucherList']);
          // this.dialogRef.close(false);
          return;
        }

        if (this.opType == 'Copy')
          {
            const currentDate = new Date().toISOString().split('T')[0];
            result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US")
            this.HideVoucher = true;
          }
          else {
            result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
            this.HideVoucher = false;
          }  
         
          
        this.voucherTypeList = result.voucherTypeList.map((item) => ({
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
        allowAccRepeat : item.allowAccRepeat,
        storeId:item.storeId,
        printAfterSave: item.printAfterSave
      }));
      this.branchesList = result.usersCompanyModels;
      this.accountsList = result.accountList;
      this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.deliveredToList = result.deliveredToList;
      this.costcenterList = result.costCenterList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.serialsListss = [];
      this.tabelData = [];
      debugger
      if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined && result.itemsSerialsTransList.length !== 0) {
        result.itemsSerialsTransList.forEach(item => {
          debugger
          item.isChecked = true;
        });

      }
      else {
        this.TransferStockVoucherAddForm.value.itemsSerialList = [];
      }
      this.savedSerials = result.itemsSerialsTransList;

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.TransferStockVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

     /*  if (result.invVouchersDocsModelList !== undefined && result.invVouchersDocsModelList !== null) {
        this.attachments.data = result.invVouchersDocsModelList;
        this.attachments.ngOnInit();
      } */
      this.firstOpen = true;
      this.oldStoreId = 0;
      this.remainingQty = 0
      this.TransferStockVoucherAddForm.patchValue(result);
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null) {
        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        this.invDtlList.forEach(element=> {
          element.total = element.qty * element.price ;
        })

        if(this.opType == "Copy")
        {debugger
          this.invDtlList.forEach(element=> {
            element.qty = 0 ;
            element.expiryDate = null;
            element.batchNo = null;
          })
        }
        else
        {
          this.invDtlList.forEach(element => {
            debugger
            this.itemsList.forEach(item => {
              debugger
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
        this.onChangeItem(this.invDtlList[i].itemId, i);
      }

      if(this.opType == 'Edit')
        {
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

        if (this.useAccountInGrid == true) {
          this.invDtlList.forEach(element => {
            element.debitAccountId = this.TransferStockVoucherAddForm.value.accountId;
          });
        }


        //End
        if (this.voucherId > 0) {
          debugger
          this.TransferStockVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.TransferStockVoucherAddForm.get("branchId").setValue(result.branchId);
          this.TransferStockVoucherAddForm.get("storeId").setValue(result.storeId);
          this.TransferStockVoucherAddForm.get("toStoreId").setValue(result.toStoreId);
          this.TransferStockVoucherAddForm.get("deliveredTo").setValue(result.deliveredTo);
          this.TransferStockVoucherAddForm.get("note").setValue(result.note);
          if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined) {
            this.TransferStockVoucherAddForm.get("itemsSerialList").setValue(result.itemsSerialsTransList);
          }


          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche]; 
            this.TransferStockVoucherAddForm.get("branchId").setValue(result.branchId); 
          }

        }
        else {

          this.TransferStockVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          this.TransferStockVoucherAddForm.get("storeId").setValue(0);
          this.TransferStockVoucherAddForm.get("toStoreId").setValue(0);          
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.TransferStockVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.DefaultStoreId = result.defaultStoreId;

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche]; 
           this.TransferStockVoucherAddForm.get("branchId").setValue(defaultBranche.id);
          }
        }
        this.GetVoucherTypeSetting(this.TransferStockVoucherAddForm.value.voucherTypeId)
      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    var fromstoreacc = this.storesList.find(s=> s.id == this.TransferStockVoucherAddForm.value.storeId).data1;
    var tostoreacc = this.storesList.find(s=> s.id == this.TransferStockVoucherAddForm.value.toStoreId).data1;
    if(!fromstoreacc || !tostoreacc){
      this.alert.ShowAlert("msgDefineAcc", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }

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
        if (this.TransferStockVoucherAddForm.value.itemsSerialList == null || this.TransferStockVoucherAddForm.value.itemsSerialList == undefined) {
          this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
          stopExecution = true;
          this.disableSave = false;
          return false;
        }

        const checkedItemCount = this.TransferStockVoucherAddForm.value.itemsSerialList.reduce((count, item) => {
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

        const item1 = this.TransferStockVoucherAddForm.value.itemsSerialList.find(item => item.itemId === itemId && item.isChecked === true && item.rowIndex === index);
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
          this.TransferStockVoucherAddForm.value.accountId = element.debitAccountId;
        }
      });


      element.index = index.toString();
    }
    // End
    debugger
    this.TransferStockVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.TransferStockVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.TransferStockVoucherAddForm.value.voucherNo = this.TransferStockVoucherAddForm.value.voucherNo.toString();
    this.TransferStockVoucherAddForm.value.invVouchersDTModelList = this.invDtlList;
    //this.TransferStockVoucherAddForm.value.invVouchersDocsModelList = this.attachments.getVoucherAttachData();
    this.TransferStockVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    this.TransferStockVoucherAddForm.value.amount = this.calculateSum();
    debugger
    this.transferStkService.SaveTransferStockVoucher(this.TransferStockVoucherAddForm.value)
      .subscribe((result) => {
        debugger
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.TransferStockVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if(PrintAfterSave == true)
          {
            this.PrintTransferStockVoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if(this.opType == 'Edit' || this.opType == 'Copy')
            {
              this.router.navigate(['TransferStockVoucher/ItemsTransferVoucherList']);
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

  
  ClearAfterSave()
  {
    this.TransferStockVoucherAddForm.value.generalAttachModelList = [];
    this.childAttachment.data =[];
   setTimeout(() => {
   this.GetVoucherTypeSetting(this.TransferStockVoucherAddForm.value.voucherTypeId);
 });
  }

  getVoucherNo(event: any) {
    this.invDtlList= [];
    this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.TransferStockVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.TransferStockVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.TransferStockVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.transferStkService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.TransferStockVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.TransferStockVoucherAddForm.get("voucherNo").setValue(1);
        }
        this.TransferStockVoucherAddForm.get("branchId").setValue(branchId);
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      });
    }
    debugger
    if(voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined)
      {
        this.GetVoucherTypeSetting(voucherTypeId);
      }
  }

  GetQty(itemId: number, storeId: number, unitId: number) {
    this.InvService.GetItemQty(itemId, storeId, unitId).subscribe(result => {
      if (result != null) {
        return result;
      }

    })
  }

  AddNewLine() {
    debugger
    if(this.disableAll ==true)
    {
      return;
    }
    this.showRemainQty = false;
    this.serialsListss = [];
    if (this.TransferStockVoucherAddForm.value.storeId == 0) {
      this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
      return;
    }
    this.invDtlList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: "",
        price: "",
        total: 0,
        productDate: '',
        expiryDate: '',
        batchNo: '',
        accountId: 0,
        orginalQty: 0,
        newRow: 0,
        index: this.invDtlList.length,
        debitAccountId : 0
      });
    debugger
    this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);

  }

  calculateSum() {
    return this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  deleteRow(row, rowIndex: number) {
    debugger
    const itemIdToRemove = this.TransferStockVoucherAddForm.value.itemsSerialList.filter(item => item.index !== rowIndex);
    debugger
    this.TransferStockVoucherAddForm.get("itemsSerialList").setValue(itemIdToRemove);
    // if (rowIndex !== -1) {
    //   this.invDtlList.splice(rowIndex, 1);
    //   this.TransferStockVoucherAddForm.value.itemsSerialList.splice(rowIndex, 1);
    // }
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex,1);
      let indexToRemove = this.TransferStockVoucherAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
          this.TransferStockVoucherAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
      else
      {
        this.TransferStockVoucherAddForm.value.itemsSerialList.forEach(element => {
          if(element.rowIndex != 0)
            {
              element.rowIndex =  element.rowIndex -1;
            } 
        });
      }
    }
    this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

isRequierdEx(row: any, index: number) {
    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
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
    const item = this.itemsList.find(item => item.id === itemId);
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

   isRequierdSerial(row: any) {

    const itemId = row.itemId;
    const item = this.itemsList.find(item => item.id === itemId);
    if (item.hasSerial) {
      this.disableSerial = false;
      return false;
    }
    else {
      this.disableSerial = true;
      return true;
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
      qty: "",
      price: "",
      total: 0,
      productDate: '',
      expiryDate: '',
      batchNo: '',
      accountId: 0,
      debitAccountId: 0,
      orginalQty: 0,
      newRow: 0,
      index: ""
    };

    this.invDtlList.splice(rowIndex, 0, newRow);
    this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
        this.transferStkService.DeleteTransferStockVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['TransferStockVoucher/ItemsTransferVoucherList']);
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }


  onChangeItem(itemId, i) {
    debugger
    this.serialsListss = [];
    this.transferStkService.GetItemUintbyItemId(itemId).subscribe(res => {
      this.unitsList[i] = res;
       if(res.length == 2)
        {
          this.invDtlList[i].unitId =res[1].id;
        }
        else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null)
        {
          this.invDtlList[i].unitId =this.invDtlList[i].unitId;
        }
        else
        {
          this.invDtlList[i].unitId =res[0].id;
        }
        this.onChangeUnit(this.invDtlList[i], i,false);
    });

    debugger
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
    debugger    
    if(this.useAccountInGrid == true)
      {
        var selectedItem = this.itemsList.find(x => x.id === itemId);
        if(selectedItem && Number(selectedItem.data1) > 0)
          {
            this.invDtlList[i].debitAccountId = Number(selectedItem.data1);
          }        
      }
  }

  async GetItemSerials(row, rowIndex): Promise<void> {
    debugger
    let store = 0;
    store = this.TransferStockVoucherAddForm.value.storeId;
    try {
      this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
      this.openSerialsPopup(row, rowIndex);
    } catch (error) {
      console.error('Error fetching item serials', error);
    }

  }

  onChangeUnit(Row, i,type) {
    debugger
    if(type == true)
    {
      this.invDtlList[i].qty =0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.InvService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.invDtlList[i].unitRate = res;
      });
    }

  }

  onStoreChange(event: any, row: any, index: number) {
    debugger
    if(event.value == this.TransferStockVoucherAddForm.value.toStoreId )
    {
      this.TransferStockVoucherAddForm.get("storeId").setValue(0);
      this.alert.ShowAlert("msgCantTransferSameStore", 'error');
      return;
    }
    
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
          this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          debugger
          this.TransferStockVoucherAddForm.get("storeId").setValue(this.oldStoreId);
        }
      })
    }
    else {
      this.oldStoreId = event.value;
    }


  }

  onStoreChange1(event: any, row: any, index: number) {
    debugger
    if(event.value == this.TransferStockVoucherAddForm.value.storeId )
    {
      this.TransferStockVoucherAddForm.get("toStoreId").setValue(0);
      this.alert.ShowAlert("msgCantTransferSameStore", 'error');
      return;
    }
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any,) {
    if(row.price == null ||row.price == undefined)
    {
      row.price =0;
      row.total =0;
    }
    if(row.price !== null && row.price !== undefined)
    {
      row.price = row.price.toFixed(this.decimalPlaces);
    }  
    if(row.total !== null && row.total !== undefined )
    {
      row.total = row.total.toFixed(this.decimalPlaces);
    }  
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  OnBlurChange(event: any, row: any, Index: number) {
    debugger
      let FromstoreName = this.storesList.find(r => r.id == this.TransferStockVoucherAddForm.value.storeId)?.text ?? '';       
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
      if(this.useStoreInGrid == true){ 
        if (this.invDtlList[Index].storeId == 0) {
          this.alert.ShowAlert("PleaseEnterStoreID", 'error');
          setTimeout(() => {
            this.invDtlList[Index].qty = 0;
            this.cdr.detectChanges();
          });
          return;
        }
      } 
      else{
        this.invDtlList[Index].storeId = this.TransferStockVoucherAddForm.value.storeId;
      }
    
      let transDate = this.TransferStockVoucherAddForm.value.voucherDate;
      if(row.qty < 0 )
      {
        this.alert.ShowAlert("CantAddValueLessThanZero", 'error');
        this.invDtlList[Index].qty =0;
        return;
      }   
      this.remainingQty = 0
      if (event == null) {
        this.showRemainQty = false;
        return;
      }  
      debugger
      let diffitemQty = 0;
      if(row.id > 0){
        diffitemQty = row.qty - row.mainQty;
      }    
      if(diffitemQty < 0)
        return;
      let itemQty = this.invDtlList.filter(item => item.index !== Index && item.itemId == row.itemId).reduce((sum, item) => sum + item.qty, 0);
  
      this.InvService.GetItemQty(row.itemId, this.TransferStockVoucherAddForm.value.storeId, row.unitId,transDate, row.qty).subscribe(res => {
        debugger
        if(res.length==0){
          setTimeout(() => {          
            row.qty = 0;
            row.price = 0;
            row.total=0;
            row.batchNo = null;    
            row.expiryDate = null;      
            row.productDate = null;  
            row.refId = 0;
            this.invDtlList[Index].orginalQty = 0;
            this.invDtlList[Index].newRow = 1;
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=" , 0 + "   " + FromstoreName, 'error');
          return;
        }
        else{
          if(row.id > 0 && diffitemQty > res[0].qoh/row.unitRate){
            setTimeout(() => {            
              row.qty = 0;
              row.price = 0;
              row.total=0;
              row.batchNo = null;    
              row.expiryDate = null;      
              row.productDate = null;  
              row.refId = 0;
              this.invDtlList[Index].orginalQty = 0;
              this.invDtlList[Index].newRow = 1;
              this.showRemainQty = false;
              this.cdr.detectChanges();
            });
            this.alert.RemainimgQty("RemainigQty=", res[0].qoh/row.unitRate + "   " + FromstoreName , 'error');
            return;
          }
          else if(row.id == 0 && row.qty+itemQty > res[0].qoh/row.unitRate){
            setTimeout(() => {            
              row.qty = 0;
              row.price = 0;
              row.total=0;
              row.batchNo = null;    
              row.expiryDate = null;      
              row.productDate = null;  
              row.refId = 0;
              this.invDtlList[Index].orginalQty = 0;
              this.invDtlList[Index].newRow = 1;
              this.showRemainQty = false;
              this.cdr.detectChanges();
            });
            this.alert.RemainimgQty("RemainigQty=", res[0].qoh/row.unitRate + "   " + FromstoreName, 'error');
            return;
          }
        }
        if (this.costingMethod == 163 || this.costingMethod == 162) {
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
          let bathQty = (element.inQty - element.outQty)/row.unitRate;
          if(itemBatchQty + remQty <= bathQty){
            if(addNewLine){            
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
                refId : element.id,
                productDate: element.productDate === null? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
                expiryDate: element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
                batchNo: element.batchNo,
                accountId: row.accountId,
                debitAccountId:row.debitAccountId,
                orginalQty: element.qoh,
                newRow: 0,
                index: this.invDtlList.length
              });
              this.unitsList[this.invDtlList.length-1] = this.unitsList[Index];
              this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
              this.showRemainQty = true;
              this.remainingQty = res[0].qoh/row.unitRate + "    " + FromstoreName;
              this.hideLabelAfterDelay();
              return;
            }
            else{
              row.price = element.cost;//*row.unitRate;
              row.total = row.price * row.qty;
              row.batchNo = element.batchNo;   
              row.refId = element.id;
              row.expiryDate = element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US")      
              row.productDate = element.productDate === null? null :formatDate(element.productDate, "yyyy-MM-dd", "en-US")  
              this.invDtlList[Index].orginalQty = element.qoh;
              this.invDtlList[Index].newRow = 1;
              this.showRemainQty = true;
              this.remainingQty = res[0].qoh/row.unitRate + "     " + FromstoreName;
              this.hideLabelAfterDelay();
              return;           
            }
  
          }
          else{
            if(bathQty - itemBatchQty > 0){
              if(addNewLine){            
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
                  refId : element.id,
                  expiryDate : element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),      
                  productDate : element.productDate === null? null :formatDate(element.productDate, "yyyy-MM-dd", "en-US"), 
                  batchNo: element.batchNo,
                  accountId: row.accountId,
                  debitAccountId:row.debitAccountId,
                  orginalQty: element.qoh,
                  newRow: 0,
                  index: this.invDtlList.length
                });
                this.unitsList[this.invDtlList.length-1] = this.unitsList[Index];
                this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
                remQty = remQty - (bathQty - itemBatchQty);
                this.showRemainQty = true;
                this.remainingQty = res[0].qoh/row.unitRate + "     " + FromstoreName;
                this.hideLabelAfterDelay();
                addNewLine = true; 
              }
              else
              {
                  row.qty = (bathQty - itemBatchQty);
                  row.price = element.cost;//*row.unitRate;
                  row.total = element.cost * row.qty;
                  row.batchNo = element.batchNo;  
                  row.refId = element.id;  
                  row.expiryDate = element.expiryDate === null? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");      
                  row.productDate = element.productDate === null? null :formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                  this.invDtlList[Index].orginalQty = element.qoh;
                  this.invDtlList[Index].newRow = 1;
                  remQty = remQty - (bathQty - itemBatchQty);
                  this.showRemainQty = true;
                  this.remainingQty = res[0].qoh/row.unitRate + "     " + FromstoreName;
                  this.hideLabelAfterDelay();
                  addNewLine = true;              
                }
            }
          }
        }
      })
      //this.GetToStoreInfo(row,Index);
    }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    let FromstoreName = this.storesList.find(r => r.id == this.TransferStockVoucherAddForm.value.storeId)?.text ?? ''; 
    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }
    debugger
    // Calculate Total And Format     
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
          this.invDtlList[Index].qty = 0;
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
            if (totBatchQty + (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate ) > this.invDtlList[Index].orginalQty) {
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

debugger
    // check if we had multiple  item  same id 
    if (this.invDtlList.length > 1) {
      let totalQty = 0;
      for (let i = 0; i < this.invDtlList.length; i++) {

        const item = row.itemId;
        if (this.invDtlList[i].itemId == item && i != Index) {
          totalQty += (row.qty * row.unitRate) + this.invDtlList[i].qty;
          this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.TransferStockVoucherAddForm.value.storeId, this.invDtlList[Index].unitId,this.TransferStockVoucherAddForm.value.voucherDate,event).subscribe(res => {
            debugger
            if(res.length > 0)
              {
                if (totalQty > res[0].qoh) {
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
                  this.remainingQty = res[Index].qoh + "     " + FromstoreName;
                  this.hideLabelAfterDelay();
                }
              }
              else
              {
                this.invDtlList[Index].qty = 0;
                this.showRemainQty = false;
                this.cdr.detectChanges();
                this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
                return;
              }
            
          })
        }
      }
    }

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
    if (this.TransferStockVoucherAddForm.value.storeId == 0) {
      this.alert.ShowAlert("PleaseEnterStoreID", 'error');
      setTimeout(() => {
        this.invDtlList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }
    let transDate = this.TransferStockVoucherAddForm.value.voucherDate;
    this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.TransferStockVoucherAddForm.value.storeId, this.invDtlList[Index].unitId,transDate, this.invDtlList[Index].qty).subscribe(res => {
            
            if(res.length===1){
              row.price = res[0].cost;
              row.batchNo = res[0].batchNo;    
              row.expiryDate = res[0].expiryDate === null? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
              row.productDate = res[0].productDate === null? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
              this.invDtlList[Index].productDate = row.productDate;
              this.invDtlList[Index].expiryDate = row.expiryDate;
              this.invDtlList[Index].batchNo = row.batchNo;
              this.invDtlList[Index].orginalQty = res[0].qoh;
              this.invDtlList[Index].newRow = 1;
            }
            else{
              row.qty = res[0].inQty;
              row.price = res[0].cost;
              row.total = res[0].inQty * res[0].cost;
              row.batchNo = res[0].batchNo;    
              row.expiryDate = res[0].expiryDate === null? null : formatDate(res[0].expiryDate, "yyyy-MM-dd", "en-US")      
              row.productDate = res[0].productDate === null? null : formatDate(res[0].productDate, "yyyy-MM-dd", "en-US")  
              this.invDtlList[Index].productDate = row.productDate;
              this.invDtlList[Index].expiryDate = row.expiryDate;
              this.invDtlList[Index].batchNo = row.batchNo;
              this.invDtlList[Index].orginalQty = res[0].qoh;
              this.invDtlList[Index].newRow = 1;
              for (let index = 1; index < res.length; index++) {
                this.unitsList[index] = this.unitsList[Index] ;
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
                  productDate: res[index].productDate === null? null :formatDate(res[index].productDate, "yyyy-MM-dd", "en-US"),
                  expiryDate: res[index].expiryDate === null? null : formatDate(res[index].expiryDate, "yyyy-MM-dd", "en-US"),
                  batchNo: res[index].batchNo,
                  accountId: row.accountId,
                  debitAccountId:row.debitAccountId,
                  orginalQty: res[index].qoh,
                  newRow: 0,
                  index: ""
                });
                this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
              this.remainingQty = res[0].qoh + "    " + FromstoreName;
              this.hideLabelAfterDelay();
            }
          })
    // this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.TransferStockVoucherAddForm.value.storeId, this.invDtlList[Index].unitId,this.TransferStockVoucherAddForm.value.voucherDate,event).subscribe(res => {
    //   debugger
    //   if(res.length > 0)
    //     {
    //       if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qoh) {
    //         setTimeout(() => {
    //           this.invDtlList[Index].qty = 0;
    //           this.showRemainQty = false;
    //           this.cdr.detectChanges();
    //         });
    //         this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
    //       }
    //       else {
    //         this.showRemainQty = true;
    //         this.remainingQty = res[0].qoh;
    //         this.hideLabelAfterDelay();
    //       }
    //     }
    //   else
    //   {
    //     this.invDtlList[Index].qty = 0;
    //     this.showRemainQty = true;
    //     this.cdr.detectChanges();
    //     this.alert.RemainimgQty("RemainigQty=", res[0].qoh.toString(), 'error');
    //   }
    // })
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
    else  if (event.key === 'F4') {
      this.CopyRow(outputList,index);
    }
  }

  listofproduct(outputList: any, index: number) {
    this.OpenItemsInfoForm(outputList, index);
  }

  OpenItemsInfoForm(row: any, rowIndex: number) {
    debugger

    var store = this.TransferStockVoucherAddForm.value.storeId;


    let title = this.translateService.instant('ADDITEMSINFO');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemssearchComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',

      data: {
        title: title, itemId: row.itemId, store,
      }
    });

    debugger
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
              productDate: formatDate(element.productDate, "yyyy-MM-dd", "en-US"),
              expiryDate: formatDate(element.expiryDate, "yyyy-MM-dd", "en-US"),
              batchNo: element.batchNo,
              orginalQty: element.qoh,
              newRow: element.newRow = 1,
            };
            this.invDtlList.push(newRow);
            this.length = this.length - 1;
          }
        }
        debugger

      })
      for (let i = 0; i < this.invDtlList.length; i++) {
        this.onChangeItem(this.invDtlList[i].itemId, i)
      }

      this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    });

    dialogRef.afterClosed().subscribe(res => {
      debugger
      for (let i = 0; i < this.invDtlList.length; i++) {
        if (this.invDtlList[i].itemId == 0 || this.invDtlList[i].itemId == null)
          this.invDtlList.splice(i, 1);
      }
      this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);

      // Check Batch Quantity If the User Add Same Batch Multi Rows
      debugger
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
      else
      {
        if (this.invDtlList.length > 0) 
        {
          let qtyy = 0;
          for (let i = 0; i < this.invDtlList.length; i++) 
          {
            qtyy = this.invDtlList[i].qty * row.unitRate;
            if(qtyy > row.orginalQty)
            {
              this.alert.RemainimgQty("QuantityOfBatchNotEnough=", this.invDtlList[i].orginalQty , 'error');
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
    this.showToStoreInfo = false;
    setTimeout(() => {
      this.showRemainQty = false;     
    }, 3000);
  }

  hideLabelAfterDelay2() {
    setTimeout(() => {      
      this.showToStoreInfo = false;
    }, 15000);
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
          const existingItem = this.TransferStockVoucherAddForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
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
          var newList = this.TransferStockVoucherAddForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.TransferStockVoucherAddForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })

  }


  GetVoucherTypeSetting(voucherTypeId:number)
  {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial; 
    this.allowEditBranch =this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId =this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;

        if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.TransferStockVoucherAddForm.get('storeId').setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.TransferStockVoucherAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.TransferStockVoucherAddForm.get("storeId").setValue(0);
      }
    }
  }

  PrintTransferStockVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if(this.Lang == "ar")
    { 
      const reportUrl = `rptTransferStockVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else{ 
      const reportUrl = `RptTransferStockVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  voucherNoBlur(VoucherTypeId , VoucherNo)
  {
    debugger
    if(VoucherNo != "" && VoucherNo != null && VoucherNo != undefined)
      {
        this.InvService.IfExistVoucher(VoucherTypeId,VoucherNo).subscribe(res =>
          {
            debugger
            if(res.id > 0)
              {
                if(res.status ==  66)
                  {
                    this.voucherId =res.id;
                    this.opType = "Edit";
                    this.TransferStockVoucherAddForm.get("generalAttachModelList").setValue([]); 
                    this.childAttachment.data = [];
                    this.showsave = false;
                    this.disableAll = false;
                    this.cdr.detectChanges();
                    this.financialvoucher.ngOnInit()
                    this.GetInitailTransferStockVoucher();
                  }
                  else if (res.status == 67 || res.status == 68)
                  {
                    this.voucherId =res.id;
                    this.opType = "Show";
                    this.TransferStockVoucherAddForm.get("generalAttachModelList").setValue([]); 
                    this.childAttachment.data = [];
                    this.showsave = true;
                    this.cdr.detectChanges();
                    this.financialvoucher.ngOnInit()
                    this.GetInitailTransferStockVoucher();
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
    this.TransferStockVoucherAddForm.get("id").setValue(0);
    this.TransferStockVoucherAddForm.get("storeId").setValue(0);
    this.TransferStockVoucherAddForm.get("toStoreId").setValue(0);
    this.TransferStockVoucherAddForm.get("deliveredTo").setValue(0);
    this.TransferStockVoucherAddForm.get("branchId").setValue(0);
    this.TransferStockVoucherAddForm.get("accountId").setValue(0);
    this.TransferStockVoucherAddForm.get("debitAccountId").setValue(0);
    this.TransferStockVoucherAddForm.get("note").setValue('');
    this.TransferStockVoucherAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue([]);
    this.TransferStockVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
    this.TransferStockVoucherAddForm.get("itemsSerialList").setValue([]);
    this.TransferStockVoucherAddForm.get("generalAttachModelList").setValue([]);   
    this.childAttachment.data =[];
    this.invDtlList = [];
    this.calculateSum();        
  }

  GetToStoreInfo(row: any, Index: number)
  {
    debugger
    let ToStoreName =  this.storesList.find(r => r.id == this.TransferStockVoucherAddForm.value.toStoreId)?.text ?? ''; 
    this.toStoreName = ToStoreName;
    setTimeout(() => {
      this.transferStkService.GetToStoreInfo(row.itemId,this.TransferStockVoucherAddForm.value.toStoreId, this.TransferStockVoucherAddForm.value.voucherDate).subscribe(res => {
        debugger
        this.showToStoreInfo = true;
        this.LastVoucher ="اخر رقم سند نقل "+ "  " +  res.lastVoucher;
        this.CurrentQty ="الكمية بمستودع" + "  "+  ToStoreName   +"  "+ res.remainingQty;
        this.SoldQty ="الكمية المباعة" +"  "+ res.totalSales;
        this.hideLabelAfterDelay2();
    })
    });
  }

  CopyRow(row,index)
  {
    debugger
    if(this.allowAccRepeat == 61)
      {
        this.invDtlList.push(
          {
            id: 0,
            hDId: 0,
            itemId: 0,
            unitId: 0,
            qty:row.qty,
            price:'',
            total:0 ,
            productDate:row.productDate,
            expiryDate:row.expiryDate,
            batchNo:'',
            accountId:row.accountId,
            debitAccountId:row.debitAccountId,
            orginalQty: 0,
            newRow: 0,
            index: ""
          });
        debugger
        this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      }
      else
      {
        this.invDtlList.push(
          {
            id: 0,
            hDId: 0,
            itemId: row.itemId,
            unitId: row.unitId,
            qty: row.qty,
            price:'',
            total:0,
            productDate: row.productDate,
            expiryDate:row.expiryDate,
            batchNo: '',
            accountId:row.accountId,
            debitAccountId:row.debitAccountId,
            orginalQty: 0,
            newRow: 0,
            index: ""
          });
        debugger
        this.TransferStockVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
      }
      setTimeout(() => {
        this.transferStkService.GetItemUintbyItemId(row.itemId).subscribe(res => {
          this.unitsList[index+1] = res;
        });
       this.onChangeUnit(row,index +1,false)
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