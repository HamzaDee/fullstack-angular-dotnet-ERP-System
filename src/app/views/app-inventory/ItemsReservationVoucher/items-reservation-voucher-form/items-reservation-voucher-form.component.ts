import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { InvVoucherService } from '../../app-inventoryService.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ItemsReservationVoucherService } from '../items-reservation-voucher.service';

@Component({
  selector: 'app-items-reservation-voucher-form',
  templateUrl: './items-reservation-voucher-form.component.html',
  styleUrls: ['./items-reservation-voucher-form.component.scss']
})
export class ItemsReservationVoucherFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) attachments: AppGeneralAttachmentComponent;
  private subscription: Subscription;
  ItemsReservationVoucherAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  invDtlList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  voucherId: any;
  storesList: any;
  customersList: any;
  branchesList: any;
  voucherTypeList: any;
  itemsList: any;
  unitsList: Array<any> = [];
  allUntiesList: any;
  costcenterList: any;
  currencyList: any;
  isdisabled: boolean = false;
  showsave: boolean;
  storeId: any;
  selectedItems: any[] = [];
  invVouchersDtFormArray: FormArray;
  oldStoreId: any;
  remainingQty: number;
  showRemainQty: boolean;
  oldRow: number = 0;
  firstOpen: boolean = true;
  length: number = 0;
  decimalPlaces: number;
  served: number;
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
  //End
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  allowAccRepeat: any;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  voucherStoreId: number;
  //End
  Lang: string;
  disableSave: boolean;
  disapleVoucherType: boolean = false;
  NewDate: Date = new Date;
  DefaultStoreId: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private ItemsResService: ItemsReservationVoucherService,
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
    ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
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
      this.router.navigate(['ItemsReservationVoucher/ItemsReservationVoucherList']);
    }

    this.InitiailTransferStockVoucherForm();
    this.GetInitailTransferStockVoucher();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsReservationVoucherList');
    this.title.setTitle(this.TitlePage);
  }

  InitiailTransferStockVoucherForm() {
    this.ItemsReservationVoucherAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      dealerId: [0],
      storeId: [0],
      branchId: [null],
      reserveDays: [0, [Validators.required, Validators.min(1)]],
      reserved: [0],
      autoCancelReserve: [0],
      note: [""],
      isCanceled: [0],
      isPosted: [0],
      status: [0],
      amount: [0],
      invVouchersDTModelList: [null, [Validators.required, Validators.minLength(1)]],
      invvVouchersDocsModelList: [null],
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
    this.ItemsResService.GetInitailItemsReservationVoucher(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ItemsReservationVoucher/ItemsReservationVoucherList']);
        // this.dialogRef.close(false);
        return;
      }
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
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
      this.branchesList = result.usersCompanyModels;
      // this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.customersList = result.customersList;
      this.costcenterList = result.costCenterList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.tabelData = [];
      /*    if (result.invVouchersDocsModelList !== undefined && result.invVouchersDocsModelList !== null) {
           this.attachments.data = result.invVouchersDocsModelList;
           this.attachments.ngOnInit();
         } */

      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.ItemsReservationVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      this.firstOpen = true;
      this.oldStoreId = 0;
      this.remainingQty = 0
      this.ItemsReservationVoucherAddForm.patchValue(result);
      if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null) {
        let index = 0;
        this.invDtlList = result.invVouchersDTModelList;
        debugger
        if (this.opType == "Copy") {
          this.invDtlList.forEach(element => {
            element.qty = 0;
            element.Total = 0;
            if (Number(element.qty) && Number(element.price)) {
              element.total = element.qty * element.price;
            } else {
              // Handle cases where qty or price is not valid
              element.total = 0; // Set a default value or handle this scenario appropriately
            }
          })
          this.invDtlList.forEach(element => {
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.invDtlList[index].newRow = 1;
                index++;
              }
            });
          })
        }
        else {
          this.invDtlList.forEach(element => {
            debugger
            element.total = element.qty * element.price;
          })
          this.invDtlList.forEach(element => {
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
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
        //End
        if (this.voucherId > 0) {
          debugger
          this.ItemsReservationVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ItemsReservationVoucherAddForm.get("branchId").setValue(result.branchId);
          this.ItemsReservationVoucherAddForm.get("storeId").setValue(result.storeId);
          this.ItemsReservationVoucherAddForm.get("reserveDays").setValue(result.reserveDays);
          this.ItemsReservationVoucherAddForm.get("dealerId").setValue(result.dealerId);
          this.served = result.reserved;
          this.ItemsReservationVoucherAddForm.get("note").setValue(result.note);
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.ItemsReservationVoucherAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.ItemsReservationVoucherAddForm.get("dealerId").setValue(0);
          this.ItemsReservationVoucherAddForm.get("storeId").setValue(0);
          this.ItemsReservationVoucherAddForm.get("branchId").setValue(result.defaultBranchId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id ?? 0;
          this.ItemsReservationVoucherAddForm.get("voucherTypeId").setValue(defaultVoucher);
          this.getVoucherNo(defaultVoucher);
          this.DefaultStoreId = result.defaultStoreId;

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.usersCompanyModels.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.ItemsReservationVoucherAddForm.get("branchId").setValue(defaultBranche.id);
          }
        }
        this.GetVoucherTypeSetting(this.ItemsReservationVoucherAddForm.value.voucherTypeId)
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

      if (element.storeId == null || element.storeId == undefined) {
        element.storeId = 0;
      }

      element.i = i.toString();
    }

    debugger
    this.ItemsReservationVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ItemsReservationVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.ItemsReservationVoucherAddForm.value.voucherNo = this.ItemsReservationVoucherAddForm.value.voucherNo.toString();
    //this.ItemsReservationVoucherAddForm.value.invVouchersDTModelList = this.invDtlList;
    //this.ItemsReservationVoucherAddForm.value.invVouchersDocsModelList = this.attachments.getVoucherAttachData();
    this.ItemsReservationVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();

    this.ItemsReservationVoucherAddForm.value.amount = this.calculateSum();
    debugger
    this.ItemsResService.SaveItemsReservationVoucher(this.ItemsReservationVoucherAddForm.value)
      .subscribe((result) => {
        debugger
        if (result.isSuccess) {
          this.alert.SaveSuccess();


          debugger
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.ItemsReservationVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintItemsReservationVoucher(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ItemsReservationVoucher/ItemsReservationVoucherList']);
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
    this.ItemsReservationVoucherAddForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.ItemsReservationVoucherAddForm.get("dealerId").setValue(0);
    this.ItemsReservationVoucherAddForm.get("storeId").setValue(0);
    this.ItemsReservationVoucherAddForm.get("reserveDays").setValue(0);
    this.ItemsReservationVoucherAddForm.get("reserved").setValue(0);
    this.ItemsReservationVoucherAddForm.get("note").setValue("");
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.ItemsReservationVoucherAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    this.invDtlList = [];
    this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.ItemsReservationVoucherAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.ItemsReservationVoucherAddForm.value.voucherTypeId;
    var date = new Date(this.ItemsReservationVoucherAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.ItemsResService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.ItemsReservationVoucherAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.ItemsReservationVoucherAddForm.get("voucherNo").setValue(1);
        }
        this.ItemsReservationVoucherAddForm.get("branchId").setValue(branchId);
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      });
    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
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
    if (this.disableAll == true) {
      return;
    }

    this.showRemainQty = false;
    if (!this.useStoreInGrid) {
      if (this.ItemsReservationVoucherAddForm.value.storeId == 0) {
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
        storeId: this.voucherStoreId,
        qty: "",
        price: "",
        total: 0,
        newRow: 0,
        index: ""
      });
    debugger
    this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);

  }

  calculateSum() {
    return this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  deleteRow(row, rowIndex: number) {
    debugger
    // this.invDtlList.splice(rowIndex, 1);
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  isEmpty(input) {
    return input === '' || input === null;
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
    debugger
    if (!this.useStoreInGrid) {
      if (this.ItemsReservationVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
        return;
      }
    }
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
      newRow: 0,
      index: ""
    };

    this.invDtlList.splice(rowIndex, 0, newRow);
    this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    return;
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
        this.ItemsResService.DeleteItemsReservation(id).subscribe((results) => {
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ItemsTransferVoucher/ItemsTransferVoucherList']);
          }
          else if (results.isSuccess === false || results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", "error")
            return;
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

  onChangeItem(itemId, i) {
    debugger
    let item = itemId.itemId ? itemId.itemId : itemId;
    this.ItemsResService.GetItemUintbyItemId(item).subscribe(res => {
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
    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === itemId);

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
          this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          debugger
          this.ItemsReservationVoucherAddForm.get("storeId").setValue(this.oldStoreId);
        }
      })
    }
    else {
      this.oldStoreId = event.value;
    }


  }

  onStoreChangeGrid(event: any, row: any, index: number) {
    if (row.qty !== 0) {
      this.invDtlList[index].qty = 0;
    }
  }

  OnPriceChange(row: any) {
    debugger
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
      row.price = row.price.toFixed(this.decimalPlaces);
    }
    if (row.total !== null && row.total !== undefined) {
      row.total = row.total.toFixed(this.decimalPlaces);
    }
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  OnQtyChange(event: any, row: any, Index: number) {
    debugger
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
    // check if we had multiple  item  same id 
    if (this.invDtlList.length > 1) {
      let totalQty = 0;
      if (this.invDtlList[Index].itemId == 0) {
        this.alert.ShowAlert("PleaseEnterItemID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });

        return;
      }
      if (this.invDtlList[Index].unitId == 0) {
        this.alert.ShowAlert("PleaseEnterUnitID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
      if (this.useStoreInGrid) {
        if (this.invDtlList[Index].storeId == 0) {
          this.alert.ShowAlert("PleaseEnterStoreID", 'error');
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.cdr.detectChanges();
          });
          return;
        }
      }
      else {
        if (this.ItemsReservationVoucherAddForm.value.storeId == 0) {
          this.alert.ShowAlert("PleaseEnterStoreID", 'error');
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.cdr.detectChanges();
          });
          return;
        }
      }
      if (this.useStoreInGrid) {
        for (let i = 0; i < this.invDtlList.length; i++) {

          const item = row.itemId;
          if (this.invDtlList[i].itemId == item && i != Index) {
            totalQty += (row.qty * row.unitRate) + this.invDtlList[i].qty;
            this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId).subscribe(res => {
              debugger
              if (totalQty > res[0].qty) {
                setTimeout(() => {
                  this.invDtlList[Index].qty = "";
                  this.showRemainQty = false;
                  this.cdr.detectChanges();
                });
                this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
                return;
              }
              else {
                this.showRemainQty = true;
                this.remainingQty = res[Index].qty;
                this.hideLabelAfterDelay();
              }
            })
          }
        }
      }
      else {
        for (let i = 0; i < this.invDtlList.length; i++) {

          const item = row.itemId;
          if (this.invDtlList[i].itemId == item && i != Index) {
            totalQty += (row.qty * row.unitRate) + this.invDtlList[i].qty;
            this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.ItemsReservationVoucherAddForm.value.storeId, this.invDtlList[Index].unitId).subscribe(res => {
              debugger
              if (totalQty > res[0].qty) {
                setTimeout(() => {
                  this.invDtlList[Index].qty = "";
                  this.showRemainQty = false;
                  this.cdr.detectChanges();
                });
                this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
                return;
              }
              else {
                this.showRemainQty = true;
                this.remainingQty = res[Index].qty;
                this.hideLabelAfterDelay();
              }
            })
          }
        }
      }

    }

    if (this.invDtlList[Index].itemId == 0) {
      this.alert.ShowAlert("PleaseEnterItemID", 'error');
      setTimeout(() => {
        this.invDtlList[Index].qty = "";
        this.cdr.detectChanges();
      });

      return;
    }
    if (this.invDtlList[Index].unitId == 0) {
      this.alert.ShowAlert("PleaseEnterUnitID", 'error');
      setTimeout(() => {
        this.invDtlList[Index].qty = "";
        this.cdr.detectChanges();
      });
      return;
    }
    if (this.useStoreInGrid) {
      if (this.invDtlList[Index].storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
    }
    else {
      if (this.ItemsReservationVoucherAddForm.value.storeId == 0) {
        this.alert.ShowAlert("PleaseEnterStoreID", 'error');
        setTimeout(() => {
          this.invDtlList[Index].qty = "";
          this.cdr.detectChanges();
        });
        return;
      }
    }
    if (this.useStoreInGrid) {
      this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.invDtlList[Index].storeId, this.invDtlList[Index].unitId).subscribe(res => {
        debugger
        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qty) {
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.remainingQty = res[0].qty;
          this.hideLabelAfterDelay();
        }
      })
    }
    else {
      this.InvService.GetItemQty(this.invDtlList[Index].itemId, this.ItemsReservationVoucherAddForm.value.storeId, this.invDtlList[Index].unitId).subscribe(res => {
        debugger
        if (this.invDtlList[Index].qty * this.invDtlList[Index].unitRate > res[0].qty) {
          setTimeout(() => {
            this.invDtlList[Index].qty = "";
            this.showRemainQty = false;
            this.cdr.detectChanges();
          });
          this.alert.RemainimgQty("RemainigQty=", res[0].qty.toString(), 'error');
        }
        else {
          this.showRemainQty = true;
          this.remainingQty = res[0].qty;
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
    if (event.key === 'F4') {
      this.CopyRow(outputList, index);
    }
  }

  listofproduct(outputList: any, index: number) {
    this.OpenItemsInfoForm(outputList, index);
  }

  OpenItemsInfoForm(row: any, rowIndex: number) {
    debugger

    var store = this.ItemsReservationVoucherAddForm.value.storeId;


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

      this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    });

    dialogRef.afterClosed().subscribe(res => {
      debugger
      for (let i = 0; i < this.invDtlList.length; i++) {
        if (this.invDtlList[i].itemId == 0 || this.invDtlList[i].itemId == null)
          this.invDtlList.splice(i, 1);
      }
      this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);

      // Check Batch Quantity If the User Add Same Batch Multi Rows
      debugger
      if (this.invDtlList.length > 1) {
        let totBatchQty = 0;
        let allBatchQty = 0;
        for (let i = 0; i < this.invDtlList.length; i++) {
          const Batch = row.batchNo;
          if (Batch !== "" && Batch !== null && Batch !== undefined) {
            if (this.invDtlList[i].batchNo == Batch && i != rowIndex) {
              totBatchQty += this.invDtlList[i].qty;
              allBatchQty += this.invDtlList[i].qty;
              if (totBatchQty + this.invDtlList[rowIndex].qty > this.invDtlList[rowIndex].orginalQty) {
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

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != null) {
        this.ItemsReservationVoucherAddForm.get('storeId').setValue(this.voucherStoreId);
      }
      else if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
        this.ItemsReservationVoucherAddForm.get("storeId").setValue(this.DefaultStoreId);
      }
      else {
        this.ItemsReservationVoucherAddForm.get("storeId").setValue(0);
      }
    }
  }

  PrintItemsReservationVoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptItemsReservationVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptItemsReservationVoucherEN?VId=${voucherId}`;
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
            this.ItemsReservationVoucherAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = false;
            this.GetInitailTransferStockVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.ItemsReservationVoucherAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailTransferStockVoucher();
          }
        }
        else {
          this.voucherId = 0;
          this.opType = "Add";
          this.showsave = false;
          this.disapleVoucherType = false;
          this.clearFormdata();
        }
      })


    }
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.ItemsReservationVoucherAddForm.get("id").setValue(0);
    this.ItemsReservationVoucherAddForm.get("dealerId").setValue(0);
    this.ItemsReservationVoucherAddForm.get("storeId").setValue(0);
    this.ItemsReservationVoucherAddForm.get("branchId").setValue(0);
    this.ItemsReservationVoucherAddForm.get("reserveDays").setValue(0);
    this.ItemsReservationVoucherAddForm.get("reserved").setValue(false);
    this.ItemsReservationVoucherAddForm.get("note").setValue('');
    this.ItemsReservationVoucherAddForm.get("amount").setValue(0);
    this.ItemsReservationVoucherAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue([]);
    this.ItemsReservationVoucherAddForm.get("invvVouchersDocsModelList").setValue([]);
    this.ItemsReservationVoucherAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.calculateSum();
  }

  CopyRow(row, index) {
    debugger
    if (this.allowAccRepeat == 61) {
      this.invDtlList.push(
        {
          id: 0,
          hDId: 0,
          itemId: 0,
          unitId: 0,
          storeId: row.storeId,
          qty: row.qty,
          price: row.price,
          total: row.total,
          newRow: 0,
          index: ""
        });
      debugger
      this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    }
    else {
      this.invDtlList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          storeId: row.storeId,
          qty: row.qty,
          price: row.price,
          total: row.total,
          newRow: 0,
          index: ""
        });
      debugger
      this.ItemsReservationVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    }
    setTimeout(() => {
      this.ItemsResService.GetItemUintbyItemId(row.itemId).subscribe(res => {
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
