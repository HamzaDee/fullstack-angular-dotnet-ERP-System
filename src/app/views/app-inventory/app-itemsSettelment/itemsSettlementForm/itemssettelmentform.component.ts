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
import { EntryitemsserialsComponent } from 'app/views/general/app-EnterItemsSerial/entryitemsserials.component';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators'
import { ItemsettelmentService } from '../itemsettelment.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';


@Component({
  selector: 'app-itemssettelmentform',
  templateUrl: './itemssettelmentform.component.html',
  styleUrl: './itemssettelmentform.component.scss'
})
export class ItemssettelmentformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) invAttachments: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  itemsSettelmentAddForm: FormGroup;
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

  itemsList: any;
  unitsList: Array<any> = [];
  allUntiesList: any;
  accountsList: any;
  isdisabled: boolean = false;
  showsave: boolean;
  storeId: any;
  currencyList: any;
  selectedItems: any[] = [];
  invVouchersDtFormArray: FormArray;
  voucherTypeEnum = 244;
  oldStoreId: any;
  remainingQty: number;
  showRemainQty: boolean;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number;
  reservedId: number;
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
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number;

  //End
  disableExpDate: boolean;
  disablebatch: boolean;
  disableSerial: boolean;
  disableSave: boolean;
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  Lang: string;
  disapleVoucherType: boolean = false;
  voucherType: any;

  NewDate: Date = new Date;
  remainingQtyMessage: string = '';
  hideAccVoucher: boolean = false;
  groupsList: any;
  categoriesList: any;
  modelsList: any;
  brandsList: any;
  categoryId: number;
  modelId: number;
  brandId: number;
  groupId: number;
  public CreditAccountID: number;
  public DebitAccountID: number;
  DefaultStoreId: number;


  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private serv: ItemsettelmentService,
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
      private route: ActivatedRoute,
      private egretLoader: AppLoaderService,
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
      this.router.navigate(['ItemsSettelment/ItemssettelmentList']);
    }


    this.InitiailItemSettelmentVoucherForm();
    this.GetInitailItemSettelment();
    this.SetTitlePage();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemssettelmentForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailItemSettelmentVoucherForm() {
    this.itemsSettelmentAddForm = this.formbulider.group({
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
      invAdjustmentDTModels: [null, [Validators.required, Validators.minLength(1)]],
      invVouchersDTModelList: [null],
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

  GetInitailItemSettelment() {
    debugger
    var lang = this.jwtAuth.getLang();
    this.serv.GetItemsSettelmentVoucher(Number(this.voucherId), this.opType, this.voucherTypeEnum).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ItemsSettelment/ItemssettelmentList']);
        // this.dialogRef.close(false);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
      result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US");


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
        creditAccId: item.creditAccId,
        debitAccId: item.debitAccId,
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
      this.storesList = result.storesList;
      this.allUntiesList = result.unitesList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.groupsList = result.groupsList;
      this.categoriesList = result.categoriesList;
      this.modelsList = result.modelsList;
      this.brandsList = result.brandsList;
      this.serialsListss = [];
      this.tabelData = [];
      if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined && result.itemsSerialsTransList.length !== 0) {
        result.itemsSerialsTransList.forEach(item => {
          item.isChecked = true;
        });

      }
      else {
        this.itemsSettelmentAddForm.value.itemsSerialList = [];
      }
      this.savedSerials = result.itemsSerialsTransList;

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.itemsSettelmentAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      this.firstOpen = true;
      this.oldStoreId = 0;
      this.remainingQty = 0
      this.itemsSettelmentAddForm.patchValue(result);
      if (result.invAdjustmentDTModels !== undefined && result.invAdjustmentDTModels !== null) {

        let index = 0;
        this.invDtlList = result.invAdjustmentDTModels;
        this.invDtlList.forEach(element => {
          element.deff = element.systemQty - element.actualQty;
        })

        this.invDtlList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              this.invDtlList[index].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
              this.invDtlList[index].batchNo = element.batchNo;
              this.invDtlList[index].newRow = 1;
              index++;
            }
          });
        })


        this.invDtlList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
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
        this.onChangeItem(0, this.invDtlList[i], i);
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



        //End
        if (this.voucherId > 0) {
          this.itemsSettelmentAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.itemsSettelmentAddForm.get("branchId").setValue(result.branchId);
          this.itemsSettelmentAddForm.get("storeId").setValue(result.storeId);
          this.itemsSettelmentAddForm.get("note").setValue(result.note);
          if (result.itemsSerialList !== null && result.itemsSerialList !== undefined) {
            this.itemsSettelmentAddForm.get("itemsSerialList").setValue(result.itemsSerialList);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.itemsSettelmentAddForm.get("branchId").setValue(result.branchId);
          }
          this.itemsSettelmentAddForm.get("voucherDate").setValue(result.voucherDate);
          this.itemsSettelmentAddForm.get("referenceDate").setValue(result.referenceDate);
          for (let i = 0; i < this.invDtlList.length; i++) {
              this.onActualQtyChange(this.invDtlList[i],i);
            };
        }
        else {
          this.itemsSettelmentAddForm.get("branchId").setValue(result.defaultBranchId);
          this.itemsSettelmentAddForm.get("storeId").setValue(0);
          this.itemsSettelmentAddForm.get("accountId").setValue(0);
          this.categoryId = 0;
          this.modelId = 0;
          this.brandId = 0;
          this.groupId = 0;
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.itemsSettelmentAddForm.get("voucherTypeId").setValue(defaultVoucher);
                 this.DefaultStoreId = result.defaultStoreId;

          this.getVoucherNo(defaultVoucher);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.itemsSettelmentAddForm.get("branchId").setValue(defaultBranche.id);
          }          
        }
        this.GetVoucherTypeSetting(this.itemsSettelmentAddForm.value.voucherTypeId)
      });
    })
  }

  OnSaveForms() {
    debugger

    var tempSave = $("#tempSave").prop('checked');
    if (tempSave) {
      this.itemsSettelmentAddForm.get("status").setValue(71);
    }
    else {
      this.itemsSettelmentAddForm.get("status").setValue(66);
    }
   
    let stopExecution = false;
    if (this.invDtlList.length <= 0) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      this.disableSave = false;
      stopExecution = true;
      return false;
    }

    // for (let i = 0; i < this.invDtlList.length; i++) {
    //   const element = this.invDtlList[i];
    //   if (element.actualQty == 0 || element.actualQty == null || element.actualQty == undefined) {
    //     this.alert.ShowAlert("msgEnterAllData", 'error');
    //     stopExecution = true;
    //     this.disableSave = false;
    //     return false;
    //   }     
    //   element.i = i.toString();
    // }

    if (this.itemsSettelmentAddForm.value.storeId == 0 || this.itemsSettelmentAddForm.value.storeId == undefined || this.itemsSettelmentAddForm.value.storeId == null) {
      this.alert.ShowAlert("msgEnterAllData", 'error');
      stopExecution = true;
      this.disableSave = false;
      return false;
    }
    if(this.inventoryType == 124)
      {
        if (this.itemsSettelmentAddForm.value.accountId == 0 || this.itemsSettelmentAddForm.value.accountId == undefined || this.itemsSettelmentAddForm.value.accountId == null) {
            this.alert.ShowAlert("PleaseSelectItemsSettelemntAccount", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
      }
     
    // special Validation 
    for (let index = 0; index < this.invDtlList.length; index++) {
      const element = this.invDtlList[index];
      const itemId = element.itemId;
      const item = this.itemsList.find(item => item.id === itemId);
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

      if (this.useSerial == true) {
        if (item.hasSerial) {
          if (this.itemsSettelmentAddForm.value.itemsSerialList == null || this.itemsSettelmentAddForm.value.itemsSerialList == undefined) {
            this.alert.RemainimgQty("msgPleaseEnterSerial1", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
          let checkedItemCount = 0;
          if(this.invDtlList[index].deff > 0)
            {
               checkedItemCount = this.itemsSettelmentAddForm.value.itemsSerialList.reduce((count, item) => {
                if (item.isChecked === true && item.itemId === itemId) {
                  return count + 1;
                }
                return count;
              }, 0);

               if (checkedItemCount !== (element.deff * element.unitRate)) {
                  this.alert.RemainimgQty("CantSaveQtyEntryNotEqualForItem", item.text, 'error');
                  stopExecution = true;
                  this.disableSave = false;
                  return false;
                }
            }
          else if (this.invDtlList[index].deff < 0)
          {
             checkedItemCount = this.itemsSettelmentAddForm.value.itemsSerialList.reduce((count, item) => {
              if (item.itemId === itemId) {
                return count + 1;
              }
              return count;
            }, 0);

            if (checkedItemCount !== ((element.deff * -1) * element.unitRate)) {
                this.alert.RemainimgQty("CantSaveQtyEntryNotEqualForItem", item.text, 'error');
                stopExecution = true;
                this.disableSave = false;
                return false;
              }
          }                  
          // && item.rowIndex === index
          const item1 = this.itemsSettelmentAddForm.value.itemsSerialList.find(item => item.itemId === itemId );
          if (!item1 && this.invDtlList[index].deff != 0) {
            this.alert.RemainimgQty("msgPleaseEnterSerial", item.text, 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        }
      }         
      element.index = index.toString();
    }
    // End

    this.itemsSettelmentAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.itemsSettelmentAddForm.value.userId = this.jwtAuth.getUserId();
    this.itemsSettelmentAddForm.value.voucherNo = this.itemsSettelmentAddForm.value.voucherNo.toString();
    this.itemsSettelmentAddForm.value.invAdjustmentDTModels = this.invDtlList;
    this.itemsSettelmentAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.itemsSettelmentAddForm.value.amount =0 ; //this.calculateSum();
    this.itemsSettelmentAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    if(this.itemsSettelmentAddForm.value.invVouchersDTModelList.length >0)
      {
        let data = this.itemsSettelmentAddForm.value.invVouchersDTModelList;
        data.forEach(element => {
          if(element.deff < 0)
          {
            element.qty = element.deff * -1;
          }
          else
          {
            element.qty = element.deff;
          }            
        });
      }
    this.itemsSettelmentAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.serv.SaveItemsSettelmentVoucher(this.itemsSettelmentAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.itemsSettelmentAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintEntryVoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ItemsSettelment/ItemssettelmentList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.ShowAlert(result.message, 'error');
          this.disableSave = false;
        }
        this.disableSave = false;
      })
  }

  ClearAfterSave() {
    this.itemsSettelmentAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.itemsSettelmentAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    debugger
    this.invDtlList = [];
    this.itemsSettelmentAddForm.get("invAdjustmentDTModels").setValue(this.invDtlList);
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.itemsSettelmentAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.itemsSettelmentAddForm.value.voucherTypeId;
    var date = new Date(this.itemsSettelmentAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.serv.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.itemsSettelmentAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.itemsSettelmentAddForm.get("voucherNo").setValue(1);
        }

        if (branchId == null || branchId == undefined) {
          this.itemsSettelmentAddForm.get("branchId").setValue(0);
        }
        else {
          this.itemsSettelmentAddForm.get("branchId").setValue(branchId);
        }
      });
    }

    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.allowEditBranch) {
      this.itemsSettelmentAddForm.get('branchId').disable();
    } else {
      this.itemsSettelmentAddForm.get('branchId').enable();
    }
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.itemsSettelmentAddForm.get('storeId').setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.itemsSettelmentAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.itemsSettelmentAddForm.get("storeId").setValue(0);
      }
    }

    let credit = this.voucherTypeList.find(option => option.label === voucherTypeId).creditAccId;
    if (this.opType == "Add") {
      if (credit != 0 && credit != null && credit != undefined) {
        this.CreditAccountID = credit;
      }
      else {
        this.CreditAccountID = 0;
      }
    }

    let Debit = this.voucherTypeList.find(option => option.label === voucherTypeId).debitAccId;
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
      if (this.itemsSettelmentAddForm.value.storeId == 0) {
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
        systemQty: 0,
        actualQty: 0,
        cost: 0,
        storeId: this.voucherStoreId,
        expiryDate: '',
        batchNo: '',
        deff: 0,
        qtySign: 0,
        index: this.invDtlList.length,

      });

    this.itemsSettelmentAddForm.get("invAdjustmentDTModels").setValue(this.invDtlList);
  }

  deleteRow(rowIndex: number) {

    let stopexe = false;
    if (this.itemsSettelmentAddForm.value.itemsSerialList != null) {
      this.itemsSettelmentAddForm.value.itemsSerialList.forEach(element => {
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
      let indexToRemove = this.itemsSettelmentAddForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.itemsSettelmentAddForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
    }
    this.itemsSettelmentAddForm.get("purchaseInvoiceModelList").setValue(this.invDtlList);
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

  isRequierdBatch(row: any, index: number)
  {
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

  DeleteSettelementVoucher(id: any) {
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
        this.serv.DeleteSettelementVoucher(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ItemsSettelment/ItemssettelmentList']);
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

  onChangeItem(event, Row, i) {
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
      var selectedItem = this.itemsList.find(x => x.id === eventValue);
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
      var selectedItem = this.itemsList.find(x => x.id === eventValue);
      if (selectedItem && Number(selectedItem.debitAcc) > 0) {
        this.invDtlList[i].debitAccountId = Number(selectedItem.debitAcc);
      }
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

  OnQtyChange(event: any, row: any, Index: number) {
    debugger;
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }

    this.serv.getItemQtyFromStore(row.itemId, row.unitId, row.qty, this.itemsSettelmentAddForm.value.storeId).subscribe(res => {
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

  openSerialsPopupEntry(row: any, rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }


    row.firstOpen = row.firstOpen ?? true
    if (this.itemsSettelmentAddForm.value.itemsSerialList === null) {
      this.itemsSettelmentAddForm.get("itemsSerialList").setValue([]);
    }
    // && item.rowIndex == rowIndex
    this.serialsListss = this.itemsSettelmentAddForm.value.itemsSerialList.filter(item => item.itemId == row.itemId );
    var itemName = this.itemsList.find(option => option.id === row.itemId).text;
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
        qty: row.deff  * row.unitRate * -1,
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
          var newList = this.itemsSettelmentAddForm.value.itemsSerialList.filter(item => item.itemId !== row.itemId);
          newList = [...newList, ...res];
          this.itemsSettelmentAddForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })

  }

  openSerialsPopupOut(row: any, rowIndex: number) {
      debugger
      row.firstOpen = row.firstOpen ?? true
  
      if (this.opType == 'Edit' || this.opType == 'Show') {
  
        this.tabelData = [];
        // item.rowIndex == rowIndex &&
        if (row.firstOpen == true) {
          for (const SavedSerilas of this.savedSerials.filter(item =>  item.itemId == row.itemId)) {
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
            const existingItem = this.itemsSettelmentAddForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
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
          qty: row.deff  * row.unitRate ,
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
            var newList = this.itemsSettelmentAddForm.value.itemsSerialList.filter(item => item.itemId !== row.itemId);
            newList = [...newList, ...res];
            this.itemsSettelmentAddForm.get("itemsSerialList").setValue(newList);
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

  CheckIfAllowEditBatch(row, index) {
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
    const item = this.itemsList.find(item => item.id === row.itemId);
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

  voucherNoBlur(VoucherTypeId, VoucherNo) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.InvService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
        debugger
        if (res.id > 0) {

          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.itemsSettelmentAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.disableAll = false;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailItemSettelment();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.itemsSettelmentAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.cdr.detectChanges();
            this.financialvoucher.ngOnInit()
            this.GetInitailItemSettelment();
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
    this.itemsSettelmentAddForm.get("id").setValue(0);
    this.itemsSettelmentAddForm.get("storeId").setValue(0);
    this.itemsSettelmentAddForm.get("branchId").setValue(0);
    this.itemsSettelmentAddForm.get("accountId").setValue(0);  
    this.itemsSettelmentAddForm.get("note").setValue('');        
    this.itemsSettelmentAddForm.get("referenceDate").setValue('');
    this.itemsSettelmentAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.itemsSettelmentAddForm.get("invAdjustmentDTModels").setValue([]);
    this.itemsSettelmentAddForm.get("invvVouchersDocsModelList").setValue([]);
    this.itemsSettelmentAddForm.get("itemsSerialList").setValue([]);
    this.itemsSettelmentAddForm.get("generalAttachModelList").setValue([]);    
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.calculateSum();
  }

  onStoreChange()
  {
    this.itemsSettelmentAddForm.get("invAdjustmentDTModels").setValue([]);
    this.invDtlList = [];
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

  AccountloadLazyOptions(event: any) {
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

  exportExcel() {
  // 1) Build header row using translate.instant so it matches your ar.json
  const headerRow = [
    this.isdisabled ? this.translateService.instant('id') : '',
    this.isdisabled ? this.translateService.instant('hdid') : '',
    this.translateService.instant('ItemNo'),           // رقم المادة
    this.translateService.instant('unit'),             // الوحدة
    this.useBatch ? this.translateService.instant('PatchNumber') : '', // رقم الباتش
    this.useExpiryDate ? this.translateService.instant('EXPIRYDATE') : '', // تاريخ الصلاحية
    this.translateService.instant('Quantity'),         // الكمية
    this.translateService.instant('ActualQuantity'),   // الكمية الفعلية  
  ].filter(h => h !== '');

  // 2) Build data rows
  const rows = this.invDtlList.map(item => {
    const row: any[] = [];

    if (this.isdisabled) {
      row.push(item.id ?? '');
      row.push(item.hDId ?? '');
    }

    // write itemId and unitId (backend expects ids)
    row.push(item.itemId ?? '');
    row.push(item.unitId ?? '');

    if (this.useBatch) row.push(item.batchNo ?? '');

    if (this.useExpiryDate) {
      // Format expiryDate to yyyy-MM-dd if present
      if (item.expiryDate) {
        const d = new Date(item.expiryDate);
        // if invalid date, just push original string
        if (!isNaN(d.getTime())) row.push(d.toISOString().slice(0, 10));
        else row.push(item.expiryDate);
      } else {
        row.push('');
      }
    }

    row.push(item.systemQty ?? 0);
    row.push(item.actualQty ?? 0);
    return row;
  });

  // 3) Combine and export
  const excelData = [headerRow, ...rows];
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Items');
  XLSX.writeFile(wb, 'ItemsSettelementExcel.xlsx');
  }

  ImportFromExcel(event: any): void {
    debugger
  if (!this.useStoreInGrid && this.itemsSettelmentAddForm.value.storeId == 0) {
    this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
    return;
  }

  const target: DataTransfer = <DataTransfer>event.target;
  const fileInput = event.target as HTMLInputElement;

  if (!target.files || target.files.length !== 1) {
    this.alert.ShowAlert('Cannot use multiple files', 'error');
    fileInput.value = "";
    return;
  }

  const file: File = target.files[0];
  const reader: FileReader = new FileReader();

  reader.onload = (e: any) => {
    const binaryStr: string = e.target.result;
    const workbook: XLSX.WorkBook = XLSX.read(binaryStr, { type: 'binary' });
    const firstSheetName: string = workbook.SheetNames[0];
    const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

    // raw:false -> dates exported as strings (not JS Date objects) which backend expects
    const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });

    // Optional: normalize header keys (in case Excel saved slight variations)
    const normalized = excelData.map(row => this.normalizeExcelRowKeys(row));

    // Send to backend
    this.serv.ImportFromExcel(normalized).subscribe(
      (response: any[]) => {
        if (response && response.length > 0) {
          // The backend returns list of InvAdjustmentDTModel
          this.invDtlList = response.map(r => {
            // ensure numeric fields are numbers
            r.itemId = +r.itemId || 0;
            r.unitId = +r.unitId || 0;
            r.systemQty = +r.systemQty || 0;
            r.actualQty = +r.actualQty || 0;
            r.deff = r.deff ?? (r.actualQty - r.systemQty);
            return r;
          });
           for (let i = 0; i < this.invDtlList.length; i++) {
              this.invDtlList[i].expiryDate = formatDate(this.invDtlList[i].expiryDate, "yyyy-MM-dd", "en-US");
              this.onActualQtyChange(this.invDtlList[i],i);
            };
          // load units for each row
          this.unitsList = [];
          const requests = this.invDtlList.map((Row, i) =>
            this.serv.GetItemUnitbyItemId(Row.itemId).pipe(
              tap(res => {
                this.unitsList[i] = res;
                // keep previous logic for unit selection
                if (res.length === 2) {
                  this.invDtlList[i].unitId = res[1].id;
                } else if (this.opType === "Edit") {
                  let unit = this.unitsList[i].find(r => r.id == Row.unitId);
                  this.invDtlList[i].unitId = unit ? Row.unitId : 0;
                } else {
                  let defaultUnit = (this.unitsList[i].find(r => r.data4 == true) || {}).id;
                  this.invDtlList[i].unitId = defaultUnit ?? 0;
                }

                if (Row.unitId) {
                  this.InvService.GetUnitRate(Row.itemId, Row.unitId).subscribe(resRate => {
                    this.invDtlList[i].unitRate = resRate;
                  });
                }
              })
            )
          );

          forkJoin(requests).subscribe(
            () => {
              this.itemsSettelmentAddForm.get("invAdjustmentDTModels").setValue(this.invDtlList);
            },
            () => this.alert.ShowAlert('Error loading item units', 'error')
          );
        } else {
          this.alert.ShowAlert('Import failed', 'error');
          fileInput.value = "";
        }
      },
      (err) => {
        this.alert.ShowAlert('Import failed', 'error');
        fileInput.value = "";
      }
    );
  };

  reader.readAsBinaryString(file);
  }

  private normalizeExcelRowKeys(row: any): any {
  // Backend expected Arabic keys:
  const K_ITEM = this.translateService.instant('ItemNo') || 'رقم المادة';
  const K_UNIT = this.translateService.instant('unit') || 'الوحدة';
  const K_BATCH = this.translateService.instant('PatchNumber') || 'رقم الباتش';
  const K_EXPIRY = this.translateService.instant('EXPIRYDATE') || 'تاريخ الصلاحية';
  const K_QTY = this.translateService.instant('Quantity') || 'الكمية';
  const K_ACT_QTY = this.translateService.instant('ActualQuantity') || 'الكمية الفعلية';
  const K_ID = this.translateService.instant('id') || 'id';
  const K_HDID = this.translateService.instant('hdid') || 'hdid';

  const normalized: any = {};

  for (const key of Object.keys(row)) {
    const trimmed = key.trim();
    // check known English keys too just in case
    if (trimmed === K_ITEM || trimmed === 'ItemNo' || trimmed.toLowerCase().includes('item')) {
      normalized[K_ITEM] = row[key];
    } else if (trimmed === K_UNIT || trimmed === 'unit' || trimmed.toLowerCase().includes('unit')) {
      normalized[K_UNIT] = row[key];
    } else if (trimmed === K_BATCH || trimmed === 'BatchNo' || trimmed.toLowerCase().includes('batch')) {
      normalized[K_BATCH] = row[key];
    } else if (trimmed === K_EXPIRY || trimmed === 'ExpiryDate' || trimmed.toLowerCase().includes('expiry')) {
      normalized[K_EXPIRY] = row[key];
    } else if (trimmed === K_QTY || trimmed === 'Quantity' || trimmed.toLowerCase().includes('quantity')) {
      normalized[K_QTY] = row[key];
    } else if (trimmed === K_ACT_QTY || trimmed === 'ActualQuantity' || trimmed.toLowerCase().includes('actual')) {
      normalized[K_ACT_QTY] = row[key];
    } else if (trimmed === K_ID || trimmed === 'id') {
      normalized[K_ID] = row[key];
    } else if (trimmed === K_HDID || trimmed === 'hdid') {
      normalized[K_HDID] = row[key];
    } else {
      // keep any other column with its original key
      normalized[trimmed] = row[key];
    }
  }

  // ensure all expected keys exist (avoid KeyNotFound server-side)
  normalized[K_ITEM] = normalized[K_ITEM] ?? '';
  normalized[K_UNIT] = normalized[K_UNIT] ?? '';
  normalized[K_BATCH] = normalized[K_BATCH] ?? '';
  normalized[K_EXPIRY] = normalized[K_EXPIRY] ?? '';
  normalized[K_QTY] = normalized[K_QTY] ?? '';
  normalized[K_ACT_QTY] = normalized[K_ACT_QTY] ?? '';

  return normalized;
  }

  onImportClick(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  ShowData() {
    setTimeout(() => {
      debugger
      const formValues = this.itemsSettelmentAddForm.value;
      if (this.categoryId == null || this.categoryId == undefined)
        this.categoryId = 0
      if (this.groupId == null || this.groupId == undefined)
        this.groupId = 0
      if (this.modelId == null || this.modelId == undefined)
        this.modelId = 0
      if (this.brandId == null || this.brandId == undefined)
        this.brandId = 0
      if (formValues.storeId == 0 || formValues.storeId == null) {
        this.alert.ShowAlert("PleaseSelectStore", 'error');
        return;
      }
      if (formValues.referenceDate == null || formValues.referenceDate == '' || formValues.referenceDate == undefined) {
        this.alert.ShowAlert("PleaseSelectToDate", 'error');
        return;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.serv.GetSettelmentItems(
        formValues.storeId,
        formValues.referenceDate,
        this.groupId,
        this.categoryId,
        this.modelId,
        this.brandId,

      ).subscribe((result) => {
        debugger
        this.invDtlList = result;
        if (this.invDtlList.length > 0) {
           let index = 0;      
        this.invDtlList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              this.invDtlList[index].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
              this.invDtlList[index].batchNo = element.batchNo;
              this.invDtlList[index].systemQty = element.actualQty.toFixed(this.decimalPlaces);
              this.invDtlList[index].actualQty = 0;
              this.invDtlList[index].unitRate = element.unitRate;
              this.invDtlList[index].deff = 0;
              this.invDtlList[index].qtySign = 0;
              this.invDtlList[index].newRow = 1;
              index++;
            }
          });
        })


        // this.invDtlList.forEach(element => {
        //   this.itemsList.forEach(item => {
        //     if (item.id === element.itemId) {
        //       this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
        //       index++;
        //     }
        //   });
        // })
        // for (let i = 0; i < this.invDtlList.length; i++) {
        //   this.onChangeItem(0, this.invDtlList[i], i)
        // }
          this.egretLoader.close();
          this.itemsSettelmentAddForm.get("invAdjustmentDTModels").setValue(this.invDtlList);
        }
        else {
          this.egretLoader.close();
        }

      });
    });
  }

  openSerialsPopup(row: any, rowIndex: number) {
    debugger
    if (row.deff < 0) {
      row.qtySign = 1;
      this.openSerialsPopupEntry(row, rowIndex);
    }
    else {
      row.qtySign = -1;
      this.GetItemSerials(row, rowIndex);
      
    }
  }

  async GetItemSerials(row, rowIndex): Promise<void> {
    let store = 0;
    if (this.useStoreInGrid) {
      store = row.storeId;
    }
    else {
      store = this.itemsSettelmentAddForm.value.storeId;
    }
    try {
      this.serialsListss = await this.InvService.GetItemSerials(row.itemId, store).toPromise();
      this.openSerialsPopupOut(row, rowIndex);
    } catch (error) {
      console.error('Error fetching item serials', error);
    }

  }

  onActualQtyChange(row:any, index:number)
  {
    debugger;          
    if(row.actualQty > 0 && Number(row.systemQty) != 0)
      {
        if(Number(row.systemQty) < 0)
          {
            row.deff = (Number(row.systemQty) * -1)  - row.actualQty;
          }
          else
          {
            row.deff = Number(row.systemQty)  - row.actualQty;  
          }
        
      }
    else if (Number(row.systemQty) == 0 && row.actualQty > 0)
      {
        row.deff = row.actualQty * -1;
      }
    else
      {
        row.deff =0;
      }
    if (row.deff < 0) {
        row.qtySign = 1;
    }
    else {
        row.qtySign = -1;      
    }

  }

  onActualQtyBlur(row:any, index:number)
  {
    let itemsSerialList = this.itemsSettelmentAddForm.value.itemsSerialList;
        for (let i = itemsSerialList.length - 1; i >= 0; i--) {
          if (itemsSerialList[i].itemId === row.itemId) {
            itemsSerialList.splice(i, 1);
          }
        }
      this.itemsSettelmentAddForm.get("itemsSerialList").setValue(itemsSerialList);
  }
}
