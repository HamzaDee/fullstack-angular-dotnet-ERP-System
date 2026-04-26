import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from "@angular/common/http";
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
import { EntryvoucherhService } from '../entryvoucherh.service';
import { ItemdetailsComponent } from 'app/views/general/app-itemsDetails/itemdetails.component';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-entryvouhcerhform',
  templateUrl: './entryvouhcerhform.component.html',
  styleUrl: './entryvouhcerhform.component.scss'
})
export class EntryvouhcerhformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  EntryyVoucherAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  invDtlList: any[] = [];
  invCustomsModels: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  voucherId: any;
  projectsList: any;
  voucherTypeList: any;
  authoritiesDonorList: any;
  storesList: any;
  donationTypesList: any;
  itemsList: any;
  purchaseOrdersList: any;
  outputVouchersList: any;
  unitsList: Array<any> = [];
  allUntiesList: any;
  suppliersList: any;
  currencyList: any;
  customsList: any;
  beneficiaryList: any;
  externalWareHouseList: any;
  isdisabled: boolean = false;
  showsave: boolean;
  storeId: any;
  voucherTypeEnum = 33;
  remainingQty: number;
  showRemainQty: boolean;
  decimalPlaces: number;
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
  itemsDetailsLists: any;
  //End
  allowAccRepeat: any;
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  disableSave: boolean;
  Lang: string;
  disapleVoucherType: boolean = false;
  voucherType: any;
  NewDate: Date = new Date;
  SuppliersName: string;
  countryName: string;
  beneficiaryClassificationList: any;
  voucherStoreId: any;
  CreditAccountID: any;
  DebitAccountID: any;
  DefaultStoreId: number;
  isPackage: boolean;
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
      private serv: EntryvoucherhService,
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
    this.countryName = "";
    this.voucherType = "Inventory";
    this.route.queryParams.subscribe((params: Params) => {
      this.voucherId = +params['voucher'];
    });
    if (this.voucherId > 0) {
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }
    else {
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
      this.router.navigate(['EntryVoucherH/EntryvouhcerhList']);
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
      authorityId: [0],
      referenceNo: [""],//رقم الموافقة الأستلام
      bookNo: [""],//رقم كتاب اللجنة
      deliveredTo: [""],//الجهة المستفيدة
      storeId: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      donateType: [0],
      outStoreId: [0],
      purchaseOrderId: [0],
      supplyType: [""],
      bonusType: [""],
      caravanNo: [""],
      note: [""],
      status: [0],
      amount: [0],
      dealerId: [0],
      projectId: [0, [Validators.required, Validators.min(1)]],
      isCanceled: [false],
      isPosted: [false],
      referenceDate: [""],
      beneficiaryClass: [0],
      invoiceNo: [""],
      dealerName: [""],
      invoiceDate: ["", [Validators.required]],
      bookDate: [""],
      purchaseOrderNo:[""],
      invVouchersDTModelList: [null, [Validators.required, Validators.minLength(1)]],
      invDTItemsDtlModels: [null],
      invCustomsModels: [null],
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
        this.router.navigate(['EntryVoucherH/EntryvouhcerhList']);
        return;
      }

      // this.EntryyVoucherAddForm.get('authorityId')?.disable();
debugger
      if (this.opType == 'Copy') {
        const currentDate = new Date().toISOString().split('T')[0];
        result.invoiceDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        result.bookDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
      }
      else {
        result.invoiceDate = formatDate(result.invoiceDate, "yyyy-MM-dd", "en-US");
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
        result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US");
        result.bookDate = formatDate(result.bookDate, "yyyy-MM-dd", "en-US");
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
        hasSerial: item.hasSerial
      }));

      this.externalWareHouseList = result.externalWareHouseList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitsList;
      this.customsList = result.customsList;
      this.beneficiaryList = result.beneficiaryList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === 1).data2;
      this.suppliersList = result.suppliersList;
      this.projectsList = result.projectsList;
      this.tabelData = [];
      this.authoritiesDonorList = result.authoritiesDonorList;
      this.donationTypesList = result.donationTypesList;
      this.purchaseOrdersList = result.purchaseOrdersList;
      this.outputVouchersList = result.outVouchersList;
      this.beneficiaryClassificationList = result.beneficiaryClassificationList;
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.EntryyVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      if (result.invDTItemsDtlModels !== null && result.invDTItemsDtlModels !== undefined && result.invDTItemsDtlModels.length > 0) {
        this.EntryyVoucherAddForm.get("invDTItemsDtlModels").setValue(result.invDTItemsDtlModels);
      }
      if (result.invCustomsModels !== null && result.invCustomsModels !== undefined && result.invCustomsModels.length > 0) {
        this.invCustomsModels = result.invCustomsModels;
        this.EntryyVoucherAddForm.get("invCustomsModels").setValue(result.invCustomsModels);
      }
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
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.invDtlList[index].expiryDate = element.expiryDate == null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].productDate = element.productDate == null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].batchNo = element.batchNo;
                this.invDtlList[index].newRow = 1;
                index++;
              }
            });
          })
        }
debugger
        this.invDtlList.forEach(element => {
          this.itemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              index++;
            }
          });
        })
        debugger
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
          if (result.dealerId !== null && result.dealerId !== undefined) {
            this.EntryyVoucherAddForm.get("dealerId").setValue(result.dealerId);
          }
          this.EntryyVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.EntryyVoucherAddForm.get("projectId").setValue(result.projectId);
          this.EntryyVoucherAddForm.get("storeId").setValue(result.storeId);
          this.EntryyVoucherAddForm.get("deliveredTo").setValue(result.deliveredTo);
          this.EntryyVoucherAddForm.get("beneficiaryClass").setValue(result.beneficiaryClass);

          if (result.purchaseOrderId !== null && result.purchaseOrderId !== undefined) {
            this.EntryyVoucherAddForm.get("purchaseOrderId").setValue(result.purchaseOrderId);
            this.onChangePurchaseOrder(result.purchaseOrderId);
          }
          let projId = this.EntryyVoucherAddForm.value.projectId;
          if (projId > 0) {
            this.GetAuth(projId);
          }
          this.EntryyVoucherAddForm.get("note").setValue(result.note);
        }
        else {
          this.DefaultStoreId = result.defaultStoreId;
          if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
            this.EntryyVoucherAddForm.get("storeId").setValue(this.DefaultStoreId);
          }
          else {
            this.EntryyVoucherAddForm.get("storeId").setValue(0);
          }
          this.EntryyVoucherAddForm.get("authorityId").setValue(0);
          this.EntryyVoucherAddForm.get("deliveredTo").setValue(0);
          this.EntryyVoucherAddForm.get("outStoreId").setValue(0);
          this.EntryyVoucherAddForm.get("purchaseOrderId").setValue(0);
          // let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true).id;
          this.EntryyVoucherAddForm.get("voucherTypeId").setValue(0);
          this.EntryyVoucherAddForm.get("donateType").setValue(0);
          this.EntryyVoucherAddForm.get("dealerId").setValue(0);
          this.EntryyVoucherAddForm.get("projectId").setValue(0);
          this.EntryyVoucherAddForm.get("beneficiaryClass").setValue(0);
          let Note = `إشارة لكتابكم رقم () تاريخ  /  /   قامت اللجنة المشكلة بموجد كتابكم أعلاه برئاسة السيد: .. وعضوية:  ..  باستلام المواد المبينة ادناه من المنظمة: .. لصالح )(الهيئة الخيرية الأردنية الهاشمية) رقم البيان: ..  تاريخ: .. ورقم السند: .. 
      وتبين الملاحظات التالية:
      1.
      2.
      3.`;
          this.EntryyVoucherAddForm.get("note").setValue(Note);
        }
        // this.GetVoucherTypeSetting(this.EntryyVoucherAddForm.value.voucherTypeId)
      });
    })


  }

  OnSaveForms() {
    debugger
    if (this.checkValidation() == false) {
      return;
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
          let PrintAfterSave = this.voucherTypeList.find(option => option.label === this.EntryyVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            //this.PrintEntryVoucher(Number(result.message));
          }

          // this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['EntryVoucherH/EntryvouhcerhList']);
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

  isEmpty(input) {
    return input === '' || input === null;
  }

  getVoucherNo(event: any) {
    debugger
    this.invDtlList = [];
    this.EntryyVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    this.EntryyVoucherAddForm.get("referenceNo").setValue("");
    this.EntryyVoucherAddForm.get("bookNo").setValue("");
    const selectedValue = event.value === undefined ? event : event.value;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherTypeId = this.EntryyVoucherAddForm.value.voucherTypeId;
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
  }

  voucherNoBlur(voucherTypeId, voucherNo) {
    if (this.allowEditVoucherSerial) {
      // Custom logic for handling blur event
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

  AddNewLine() {
    debugger;
    if (this.disableAll) return;

    if (this.EntryyVoucherAddForm.value.storeId == 0) {
      this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
      return;
    }
    const newLine = {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      unitRate: 0,
      qty: "",
      price: "",
      total: 0,
      expiryDate: new Date().toISOString().split('T')[0],
      pallets: 0,
      weight: 0,
      notes: '',
      isPackage: false,
      index: this.invDtlList.length,
    };

    // Create a new array reference to trigger change detection
    this.invDtlList = [...this.invDtlList, newLine];

    // Only do this if invVouchersDTModelList is needed for saving
    this.EntryyVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
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

  onChangeItem(event: any, row: any, index: number): void {
    debugger
    const eventValue = (event && typeof event === 'object') ? event.value : event;
    const currentItemId = row.itemId;

    // -----------------------------
    // 1) Reset units when no item selected
    // -----------------------------
    if (!currentItemId || currentItemId === 0) {
      this.unitsList[index] = [];
    }

    // -----------------------------
    // 2) Handle Duplicate Items Check
    // -----------------------------
    if (eventValue > 0) {
      let isDuplicate = this.invDtlList.some((x, m) =>
        x.itemId === eventValue && m !== index
      );

      if (isDuplicate) {
        if (this.allowAccRepeat === 61) {
          this.alert.ShowAlert("msgCantAddSameItemForThisVoucherType", 'error');
          this.invDtlList[index].itemId = 0;
          this.cdr.detectChanges();
          return;
        }
        if (this.allowAccRepeat === 60) {
          this.alert.ShowAlert("msgTheItemRepeatedReminder", 'error');
        }
      }
    }

    // -----------------------------
    // 3) Reset row if value changed to new item
    // -----------------------------
    if (eventValue !== 0) {
      this.invDtlList[index] = {
        ...this.invDtlList[index],
        qty: "",
        total: 0,
        price: "",
        expiryDate: null,
        unitId: 0,
        unitRate: 0,
        id: 0,
        hDId: 0
      };
    }

    // -----------------------------
    // 4) Load Units for Selected Item
    // -----------------------------
    const itemToLoadUnits = eventValue === 0 ? currentItemId : eventValue;

    if (itemToLoadUnits && itemToLoadUnits !== 0) {
      this.serv.GetItemUnitbyItemId(itemToLoadUnits).subscribe(res => {

        this.unitsList[index] = res;

        // Select correct unit
        if (res.length === 2) {
          this.invDtlList[index].unitId = res[1].id;
        }
        else if (row.unitId) {
          this.invDtlList[index].unitId = row.unitId;
        }
        else {
          this.invDtlList[index].unitId = res[0].id;
        }

        // Trigger unit change logic
        this.onChangeUnit(row, index, false);
      });
    }

    // -----------------------------
    // 5) Fetch item assembly info
    // -----------------------------
    debugger
    if (eventValue > 0) {
      debugger
      this.GetItemInfoByAssembly(eventValue, index);
    }

    debugger
      if (row.itemId > 0) {
        const item = this.itemsList.find(x => x.id == row.itemId);

     /*    if (item) {
          const itemName = item.text;

          if (itemName.includes('طرد')) {
            this.isPackage = false;
          } else {
            this.isPackage = true;
          }
        } */


          
        for (let i = 0; i < this.invDtlList.length; i++) {
              const row = this.invDtlList[i];

              if (row.itemId > 0) {
                const item = this.itemsList.find(x => x.id == row.itemId);

                if (item) {
                  const itemName = item.text;

                  if (itemName.includes('طرد')) {
                    row.isPackage = false;
                  } else {
                    row.isPackage = true;
                  }
                } else {
                  row.isPackage = true;
                }
              } else {
                row.isPackage = true;
              }
            }
      }
  }

  // onChangeItem(event, Row, i) {
  //   debugger
  //   const eventValue = (typeof event === 'object' && event.value !== undefined) ? event.value : event;
  //   if (eventValue === 0) {
  //     if (Row.itemId == 0 || Row.itemId == null) {
  //       this.unitsList[i] = [];
  //     }

  //     if (Row.itemId !== 0 && Row.itemId !== null) {
  //       this.serv.GetItemUnitbyItemId(Row.itemId).subscribe(res => {
  //         debugger
  //         this.unitsList[i] = res;
  //         if (res.length == 2) {
  //           this.invDtlList[i].unitId = res[1].id;
  //         }
  //         else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
  //           this.invDtlList[i].unitId = Row.unitId;
  //         }
  //         else {
  //           this.invDtlList[i].unitId = res[0].id;
  //         }
  //         this.onChangeUnit(Row, i, false);
  //       });
  //     }


  //   }
  //   else {
  //     if (Row.itemId == 0 || Row.itemId == null) {
  //       this.unitsList[i] = [];
  //     }
  //     if (Row.itemId !== 0 && Row.itemId !== null) {
  //       this.invDtlList[i].qty = "";
  //       this.invDtlList[i].total = 0;
  //       this.invDtlList[i].price = "";
  //       this.invDtlList[i].expiryDate = null;
  //       this.invDtlList[i].unitId = 0;
  //       this.invDtlList[i].unitRate = 0;
  //       this.invDtlList[i].id = 0;
  //       this.invDtlList[i].hDId = 0;

  //       if (eventValue !== 0) {
  //         this.serv.GetItemUnitbyItemId(eventValue).subscribe(res => {
  //           debugger
  //           this.unitsList[i] = res;
  //           if (res.length == 2) {
  //             this.invDtlList[i].unitId = res[1].id;
  //           }
  //           else if (this.invDtlList[i].unitId != 0 || this.invDtlList[i].unitId != null) {
  //             this.invDtlList[i].unitId = Row.unitId;
  //           }
  //           else {
  //             this.invDtlList[i].unitId = res[0].id;
  //           }
  //           this.onChangeUnit(Row, i, false);
  //         });
  //       }


  //     }
  //   }

  //   if (event.value > 0) {
  //     if (this.invDtlList.length > 0) {
  //       let isDuplicate = false;
  //       for (let m = 0; m < this.invDtlList.length; m++) {
  //         if (this.invDtlList[m].itemId == event.value && m != i) {
  //           isDuplicate = true;

  //           if (this.allowAccRepeat == 61) {
  //             this.alert.ShowAlert("msgCantAddSameItemForThisVoucherType", 'error');
  //             break;
  //           } else if (this.allowAccRepeat == 60) {
  //             this.alert.ShowAlert("msgTheItemRepeatedReminder", 'error');
  //             break;
  //           }
  //         }
  //       }
  //       if (isDuplicate && this.allowAccRepeat == 61) {
  //         this.invDtlList[i] = {
  //           ...this.invDtlList[i],
  //           itemId: 0
  //         };
  //         this.cdr.detectChanges();
  //       }
  //     }
  //   }

  //   if(event.value > 0)
  //     {
  //       this.GetItemInfoByAssembly(event.value, i);
  //     }
  // }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
      row.total = row.total.toFixed(this.decimalPlaces);
    }
  }

  OnPriceChange(row: any) {
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  OnPriceBlur(row: any) {

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

  OpenItemDetails(row: any, rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    row.firstOpen = row.firstOpen ?? true
    if (this.EntryyVoucherAddForm.value.invDTItemsDtlModels === null) {
      this.EntryyVoucherAddForm.get("invDTItemsDtlModels").setValue([]);
    }
    this.itemsDetailsLists = this.EntryyVoucherAddForm.value.invDTItemsDtlModels.filter(item => item.itemDTId == row.itemId && item.index == rowIndex);
    let itemName = this.itemsList.find(option => option.id === row.itemId).text;
    let title = this.translateService.instant('MaterialDetails');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ItemdetailsComponent, {
      width: '1500px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        itemName: itemName,
        itemId: row.itemId,
        items: this.itemsList,
        units: this.allUntiesList,
        itemDtl: this.itemsDetailsLists,
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
          debugger
          row.res = res;
          if (res.length > 0) {
            res.forEach(element => {
              element.index = rowIndex;
            });
          }
          let closestExpiry = null;
          const elementsWithDate = res.filter(x => x.expiryDate).map(x => ({ ...x, expiryDate: new Date(x.expiryDate) }));
          if (elementsWithDate.length > 0) {
            closestExpiry = elementsWithDate.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())[0].expiryDate;
          }
          let newList = this.EntryyVoucherAddForm.value.invDTItemsDtlModels.filter(item => item.index !== rowIndex);
          newList = [...newList, ...res];
          this.EntryyVoucherAddForm.get("invDTItemsDtlModels").setValue(newList);
          let wegith = 0;
          let pallets = 0;
          newList.forEach(element => {
            wegith += element.weight;
            pallets += element.pallets;
          });
          //this.invDtlList[rowIndex].weight = wegith;
          //this.invDtlList[rowIndex].pallets = pallets;
          //this.invDtlList[rowIndex].expiryDate = closestExpiry ? formatDate(closestExpiry, "yyyy-MM-dd", "en-US") : null;
          row.firstOpen = false;
        }
      })

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

  calculateSum() {
    return this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  AddNewLineCustom() {
    debugger;
    if (this.disableAll) return;
    const newLine = {
      id: 0,
      hDId: 0,
      customId: 0,
      leadNo: "",
      driverName: "",
      mobileNo: "",
      carNo: "",
      pallets: 0,
      notes: "",
      index: this.invCustomsModels.length,
    };
    this.invCustomsModels = [...this.invCustomsModels, newLine];
    this.EntryyVoucherAddForm.get("invCustomsModels")?.setValue(this.invCustomsModels);
  }

  checkValidation(): boolean {
    let stopExt = false;
    if (this.invDtlList.length == 0 || this.invDtlList == null || this.invDtlList == undefined) {
      stopExt = true;
    }
    if (this.invDtlList.length > 0) {
      this.invDtlList.forEach(element => {
        if (element.itemId == 0 || element.itemId == null || element.itemId == undefined) {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.unitId == 0 || element.unitId == null || element.unitId == undefined) {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.qty == null || element.qty == undefined || element.qty == '') {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.price == null || element.price == undefined || element.price == '') {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.total == null || element.total == undefined || element.total == '') {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
      });
    }
    if (this.invCustomsModels.length > 0) {
      this.invCustomsModels.forEach(element => {
        if (element.customId == 0 || element.customId == null || element.customId == undefined) {
          this.alert.ShowAlert("PleaseInsertRequierdDataFromCustomsDeclarationTable", 'error');
          stopExt = true;
        }
        if (element.leadNo == null || element.leadNo == undefined || element.leadNo == '') {
          this.alert.ShowAlert("PleaseInsertRequierdDataFromCustomsDeclarationTable", 'error');
          stopExt = true;
        }
      });
    }

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
            stopExt = true;
            this.disableSave = false;
            return false;
          }

        }

      }
      element.index = index.toString();
    }
    if (this.EntryyVoucherAddForm.get('voucherTypeId').value === 10) {
      if (this.EntryyVoucherAddForm.get('referenceNo').value === "" || this.EntryyVoucherAddForm.get('referenceNo').value === null) {
        this.alert.ShowAlert("PleaseEnterApprovalNo", 'error');
        stopExt = true;
      }
      if (this.EntryyVoucherAddForm.get('bookNo').value === "" || this.EntryyVoucherAddForm.get('bookNo').value === null) {
        this.alert.ShowAlert("PleaseEnterCommitteeBookNo", 'error');
        stopExt = true;
      }
    }
    else if (this.EntryyVoucherAddForm.get('voucherTypeId').value === 18) {
      if (this.EntryyVoucherAddForm.get('referenceNo').value === "" || this.EntryyVoucherAddForm.get('referenceNo').value === null) {
        this.alert.ShowAlert("PleaseEnterApprovalNo", 'error');
        stopExt = true;
      }
    }
    else if (this.EntryyVoucherAddForm.get('voucherTypeId').value === 19) {
      if (this.EntryyVoucherAddForm.get('bookNo').value === "" || this.EntryyVoucherAddForm.get('bookNo').value === null) {
        this.alert.ShowAlert("PleaseEnterOutBookNo", 'error');
        stopExt = true;
      }
    }


    return !stopExt;
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.EntryyVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  onAddRowBefore(rowIndex: number) {
    const newLine = {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      unitRate: 0,
      qty: "",
      price: "",
      total: 0,
      expiryDate: '',
      pallets: 0,
      weight: 0,
      notes: '',
      index: this.invDtlList.length,
    };
    this.invDtlList.splice(rowIndex, 0, newLine);
    this.EntryyVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  deleteRowCustom(rowIndex: number) {
    if (rowIndex !== -1) {
      this.invCustomsModels.splice(rowIndex, 1);
    }
    this.EntryyVoucherAddForm.get("invCustomsModels").setValue(this.invCustomsModels);
  }

  onChangePurchaseOrder(po: any) {
    debugger
    const selectedValue = po;
    this.SuppliersName = this.purchaseOrdersList.find(option => option.id === selectedValue)?.data1 || '';
  }

  ApproveVoucher(id: any) {
    debugger
    if (id != null && id != undefined && id != 0) {
      this.serv.ApproveInvVoucher(id).subscribe((result) => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['EntryVoucherH/EntryvouhcerhList']);
          return;
        }
        if (result.isSuccess) {
          this.alert.ShowAlert("RequestApproved", "success");
          this.router.navigate(['EntryVoucherH/EntryvouhcerhList']);
        }
        else {
          this.alert.SaveFaild();
        }
      });
    }
  }

  GetItems(id: any) {
    if (id > 0) {
      this.serv.GetOutPutVoucherItems(id).subscribe(res => {
        debugger
        if (res.invVouchersDTModelList.length > 0) {
          let index = 0;
          this.invDtlList = res.invVouchersDTModelList;
          this.invDtlList.forEach(element => {
            element.total = element.qty * element.price;
          })

          this.invDtlList.forEach(element => {
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.invDtlList[index].expiryDate = element.expiryDate == null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[index].productDate = element.productDate == null ? null : formatDate(element.productDate, "yyyy-MM-dd", "en-US");
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

        for (let i = 0; i < this.invDtlList.length; i++) {
          this.OnPriceBlur(this.invDtlList[i]);
          this.onChangeItem(0, this.invDtlList[i], i);
        }

      });
    }
    else {
      this.invDtlList = [];
    }


  }

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesDonorList) {
      this.authoritiesDonorList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesDonorList.length < last) {
      this.authoritiesDonorList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesDonorList[i] = this.authoritiesDonorList[i];
    }

    this.loading = false;
  }

  projectloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.projectsList) {
      this.projectsList = [];
    }

    // Make sure the array is large enough
    while (this.projectsList.length < last) {
      this.projectsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.projectsList[i] = this.projectsList[i];
    }

    this.loading = false;
  }

  ItemloadLazyOptions(event: any) {
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

  GetAuth(projectId: any) {
    if (projectId > 0) {
      let authName = "";
      const auth = this.projectsList.find(r => r.id == projectId)?.data1 ?? 0;
      if (auth != "" && auth != null && auth != undefined) {
        this.EntryyVoucherAddForm.get("authorityId").setValue(Number(auth));
        this.countryName = this.authoritiesDonorList.find(r => r.id == Number(auth))?.data1 ?? "";
        authName = this.authoritiesDonorList.find(r => r.id == Number(auth))?.text ?? "";
      }
      else {
        this.EntryyVoucherAddForm.get("authorityId").setValue(0);
        this.countryName = "";
      }
      const benClass = this.projectsList.find(r => r.id == projectId)?.data2 ?? 0;
      if (benClass != "" && benClass != null && benClass != undefined) {
        this.EntryyVoucherAddForm.get("beneficiaryClass").setValue(Number(benClass));
      }
      let propNo = "                                   ";
      let date1 = "                                    ";
      let Presidency = "                                ";
      let membership = "                                ";
      let StatementNo = "                              ";
      let date2 = this.EntryyVoucherAddForm.get("voucherDate").value ?? "                              "; 
      let VoucherNo = this.EntryyVoucherAddForm.get("voucherNo").value ?? "                                    ";     
      let Note = `
      إشارة لكتابكم رقم (${propNo}) تاريخ ${date1}
      قامت اللجنة المشكلة بموجب كتابكم أعلاه برئاسة السيد: ${Presidency}
      وعضوية: ${membership}
      باستلام المواد المبينة أدناه من المنظمة: ${authName}
      لصالح (الهيئة الخيرية الأردنية الهاشمية)
      رقم البيان: ${StatementNo} تاريخ: ${date2}
      ورقم السند: ${VoucherNo}
      وتبين الملاحظات التالية:
      1.
      2.
      3.
      `;                      
      // let Note = `إشارة لكتابكم رقم: ${propNo}  تاريخ: ${date1}  برئاسة: ${Presidency} وعضوية: ${membership}  تم استلام المواد التابعة لمنظمة: ${authName}  رقم البيان: ${StatementNo}  تاريخ: ${date2} ورقم السند: ${VoucherNo}
      // وتبين الملاحظات التالية:
      // 1.
      // 2.
      // 3.`;

      this.EntryyVoucherAddForm.get("note").setValue(Note);
    }
    else {
      this.EntryyVoucherAddForm.get("authorityId").setValue(0);
      this.countryName = "";
    }


  }

  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesDonorList) {
      this.authoritiesDonorList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesDonorList.length < last) {
      this.authoritiesDonorList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesDonorList[i] = this.authoritiesDonorList[i];
    }

    this.loading = false;
  }

  GetCountryName(AuthId: any) {
    if (AuthId > 0) {
      let countryName = this.authoritiesDonorList.find(r => r.id == AuthId)?.data1 ?? "0";
      if (countryName != "" && countryName != null && countryName != undefined) {
        this.countryName = countryName;
      }
      else {
        this.countryName = "";
      }
      let authName = this.authoritiesDonorList.find(r => r.id == Number(AuthId))?.text ?? "";
      let propNo = "                                   ";
      let date1 = "                                    ";
      let Presidency = "                                ";
      let membership = "                                ";
      let StatementNo = "                              ";
      let date2 = this.EntryyVoucherAddForm.get("voucherDate").value ?? "                              "; "                                    ";
      let VoucherNo = this.EntryyVoucherAddForm.get("voucherNo").value ?? "                              ";
      let Note = `إشارة لكتاب اللجنة المشكلة رقم: ${propNo}  تاريخ: ${date1}  برئاسة: ${Presidency} وعضوية: ${membership}  تم استلام المواد التابعة لمنظمة: ${authName}  رقم البيان: ${StatementNo}  تاريخ: ${date2} ورقم السند: ${VoucherNo}
      وتبين الملاحظات التالية:
      1.
      2.
      3.`;
      this.EntryyVoucherAddForm.get("note").setValue(Note);
    }
    else {
      this.countryName = "";
    }
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

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.EntryyVoucherAddForm.get('storeId').setValue(this.voucherStoreId);
      }
      else {
        this.EntryyVoucherAddForm.get('storeId').setValue(0);
        this.voucherStoreId = 0;
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

  GetItemInfoByAssembly(ItemId: number, index: number) {
    debugger
    this.serv.GetItemsDetailsByAssembly(ItemId).subscribe(res => {
      debugger
      if (res != null) {
        this.itemsDetailsLists = res;
        this.itemsDetailsLists.forEach(element => {
          element.index = index;
        });
        this.EntryyVoucherAddForm.get("invDTItemsDtlModels").setValue(this.itemsDetailsLists);
      }
    });
  }

  PrintEntryVoucherH(voucherId: number, voucherTypeId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (voucherTypeId == 10) {
      if (this.Lang == "ar") {
        const reportUrl = `RptEntryvouhcerHAR?VId=${voucherId}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else {
        const reportUrl = `RptEntryvouhcerHEN?VId=${voucherId}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
    }
    else if (voucherTypeId == 17) {
      const reportUrl = `RptPurchaseEntryVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else if (voucherTypeId == 18) {
      const reportUrl = `RptBounsEntryVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else if (voucherTypeId == 19) {
      const reportUrl = `RptReturnEntryVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  PrintGuaranteeLetter(voucherId: number) {
    debugger
    const reportUrl = `RptGuaranteeLetterAR?VId=${voucherId}`;
    const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
    window.open(url, '_blank');
  }

  PrintSetReceipt(Id: number) {
    debugger
    const reportUrl = `RptSetReceiptsAR?VId=${Id}`;
    const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
    window.open(url, '_blank');
  }

  exportHeadersToExcel() {
    const headerNames = this.headers.map(h => h.label);
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerNames]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Headers');
    XLSX.writeFile(wb, 'EntryyVoucherExcel.xlsx');
  }

  ImportFromExcel(event: any): void {
    0
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
                const selectedItem = this.itemsList.find(x => x.id === row.itemId);
                if (selectedItem && Number(selectedItem.debitAcc) > 0) {
                  row.debitAccountId = Number(selectedItem.debitAcc);
                }
              }
            });
            for (let i = 0; i < this.invDtlList.length; i++) {
              const row = this.invDtlList[i];

              if (row.itemId > 0) {
                const item = this.itemsList.find(x => x.id == row.itemId);

                if (item) {
                  const itemName = item.text;

                  if (itemName.includes('طرد')) {
                    row.isPackage = true;
                  } else {
                    row.isPackage = false;
                  }
                } else {
                  row.isPackage = false;
                }
              } else {
                row.isPackage = false;
              }
            }





            const requests = this.invDtlList.map((Row, i) =>
              this.serv.GetItemUnitbyItemId(Row.itemId).pipe(
                tap(res => {
                  debugger
                  this.unitsList[i] = res;

                  if (res.length === 2) {
                    this.invDtlList[i].unitId = res[1].id;
                  } else if (this.opType === "Edit") {
                    let unit = this.unitsList[i].find(r => r.id == Row.unitId);
                    if (!unit) {
                      this.invDtlList[i].unitId = 0;
                    } else {
                      this.invDtlList[i].unitId = Row.unitId;
                    }
                  } else {
                    let unit = this.unitsList[i].find(r => r.data4 == true).id;
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
                this.EntryyVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
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
}