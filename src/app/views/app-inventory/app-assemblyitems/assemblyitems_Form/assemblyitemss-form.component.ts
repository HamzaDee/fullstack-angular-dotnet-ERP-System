import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AssemblyitemsService } from '../assemblyitems.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';

@Component({
  selector: 'app-assemblyitemss-form',
  templateUrl: './assemblyitemss-form.component.html',
  styleUrl: './assemblyitemss-form.component.scss'
})
export class AssemblyitemssFormComponent {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  assembleyItemsAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  assembleyItemsDTList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  voucherId: any;
  itemsList: any;
  unitsList: Array<any> = [];
  storesList: any;
  allUntiesList: any;
  itemsUnitList: Array<any> = [];
  isdisabled: boolean = false;
  decimalPlaces: number;
  disableAll: boolean;
  voucherNo: number = 0;
  newDate: any;
  disableSave: boolean;
  sumTotalCost: number = 0;
  showRemainQty: boolean;
  remainingQty: number;
  isAssembleyy: boolean = true;
  sumCost: number = 0;
  DefaultStoreId: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private cdr: ChangeDetectorRef,
      private service: AssemblyitemsService
    ) { }

  ngOnInit(): void {
    debugger
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.voucherId = queryParams.get('GuidToEdit');
      this.opType = 'Show';
      this.showsave = true;
    }
    else if (this.voucherNo > 0) {
      this.voucherId = 0;
      this.opType = 'Add';
      this.showsave = false;
    }
    else {
      this.voucherId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
      this.showsave = this.routePartsService.Guid3ToEdit;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['AssemblyItems/AssemblyitemsList']);

    }
    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();
    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssemblyitemsForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.assembleyItemsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherNo: [''],
      voucherDate: ["", [Validators.required]],
      notes: [""],
      itemId: [0, [Validators.required]],
      unitId: [0, [Validators.required]],
      qty: [0, [Validators.required, Validators.min(1)]],
      cost: [0],
      totalCost: [0],
      isAssembly: [true],
      storeId: [0, [Validators.required]],
      assemblyItemsDtModels: [null, [Validators.required, Validators.minLength(1)]],
      generalAttachModelList: [null]
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
    this.service.GetInitailAssemblyItems(this.voucherId, this.opType, this.isAssembleyy).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['AssemblyItems/AssemblyitemsList']);
        return;
      }
      debugger
      result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")
      this.itemsList = result.itemsList;
      this.allUntiesList = result.unitesList;
      this.storesList = result.storesList;
      if (result.assemblyItemsDtModels != undefined) {
        this.assembleyItemsDTList = result.assemblyItemsDtModels;
        this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue(result.assemblyItemsDtModels);
        if (this.assembleyItemsDTList.length > 0) {
          for (let i = 0; i < this.assembleyItemsDTList.length; i++) {
            this.onChangeItem(this.assembleyItemsDTList[i], i)
            this.assembleyItemsDTList[i].total = (this.assembleyItemsDTList[i].qty * this.assembleyItemsDTList[i].cost).toFixed(3);
            this.sumTotalCost += Number(this.assembleyItemsDTList[i].total);
          }
        }
      }

      debugger
      this.assembleyItemsAddForm.patchValue(result);
      if (result.generalAttachModelList !== null && result.generalAttachModelList !== 0 && result.generalAttachModelList !== undefined) {
        this.assembleyItemsAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.assembleyItemsAddForm.get("voucherNo").setValue(result.voucherNo);
          this.assembleyItemsAddForm.get("voucherDate").setValue(result.voucherDate);
          this.assembleyItemsAddForm.get("notes").setValue(result.notes);
          this.assembleyItemsAddForm.get("itemId").setValue(result.itemId);
          this.service.GetItemUintbyItemId(result.itemId).subscribe(res => {
            this.itemsUnitList = res;
          });
          this.assembleyItemsAddForm.get("unitId").setValue(result.unitId);
          this.assembleyItemsAddForm.get("qty").setValue(result.qty);
        }
        else {
          debugger
          this.DefaultStoreId = result.defaultStoreId;
          if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
            this.assembleyItemsAddForm.get("storeId").setValue(this.DefaultStoreId);
          }
          else {
            this.assembleyItemsAddForm.get("storeId").setValue(0);
          }
          this.getVoucherNo();
          this.newDate = new Date;
          this.assembleyItemsAddForm.get("voucherNo").setValue(result.voucherNo);
          this.assembleyItemsAddForm.get("notes").setValue("");
          this.assembleyItemsAddForm.get("itemId").setValue(0);
          this.assembleyItemsAddForm.get("unitId").setValue(0);
          this.assembleyItemsAddForm.get("qty").setValue(0);
          this.assembleyItemsAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.itemsUnitList = [];
        }

      }
      )
    });

  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    for (const element of this.assembleyItemsDTList) {
      if (element.itemId == 0 || element.itemId == null || element.itemId == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }
      if (element.unitId == 0 || element.unitId == null || element.unitId == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
      if (element.qty == 0 || element.qty == null || element.qty == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return false;
      }
    }
    if (this.assembleyItemsDTList.length == 0) {
      this.alert.ShowAlert("PleaseInsertAtLeastOneRow", 'error');
      this.disableSave = false;
      return false;
    }
    debugger
    this.assembleyItemsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.assembleyItemsAddForm.value.userId = this.jwtAuth.getUserId();
    this.assembleyItemsAddForm.get("isAssembly").setValue(this.isAssembleyy);
    this.assembleyItemsAddForm.value.assemblyItemsDtModels = this.assembleyItemsDTList;
    this.assembleyItemsAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.service.SaveManuFuEquations(this.assembleyItemsAddForm.value)
      .subscribe((result) => {
        debugger
        if (result) {
          this.alert.SaveSuccess();
          this.router.navigate(['AssemblyItems/AssemblyitemsList']);
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo() {
    this.service.GetSerialVoucher(this.isAssembleyy).subscribe((results) => {
      if (results) {
        this.assembleyItemsAddForm.get("voucherNo").setValue(results);
      }
      else {
        this.assembleyItemsAddForm.get("voucherNo").setValue(1);
      }
    });
  }

  AddNewLine() {
    debugger
    if (this.assembleyItemsAddForm.value.storeId == 0 || this.assembleyItemsAddForm.value.storeId == null || this.assembleyItemsAddForm.value.storeId == undefined) {
      this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
      return false;
    }
    if (!(this.assembleyItemsAddForm.value.unitId > 0) || this.assembleyItemsAddForm.value.unitId == null || this.assembleyItemsAddForm.value.unitId == undefined) {
      this.alert.ShowAlert("PleaseEnterUnitToAdd", 'error');
      return false;
    }
    if (this.assembleyItemsAddForm.value.qty == 0 || this.assembleyItemsAddForm.value.qty == null || this.assembleyItemsAddForm.value.qty == undefined) {
      this.alert.ShowAlert("PleaseInsertQty", 'error');
      return false;
    }
    if (this.disableAll == true) {
      return;
    }
    if (this.assembleyItemsDTList == null) {
      this.assembleyItemsDTList = [];
    }
    this.assembleyItemsDTList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: 0,
        cost: 0,
        total: 0,
        unitRate: 0,
        index: ""
      });
    this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue(this.assembleyItemsDTList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.assembleyItemsDTList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    debugger
    this.sumTotalCost = 0;
    this.assembleyItemsDTList.forEach(element => {
      this.sumTotalCost += element.cost * element.qty;
    });
    this.assembleyItemsAddForm.get("totalCost").setValue((this.sumTotalCost).toFixed(3));
    this.assembleyItemsAddForm.get("cost").setValue((this.sumTotalCost / this.assembleyItemsAddForm.value.qty).toFixed(3));
    this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue(this.assembleyItemsDTList);
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

  onChangeItem(Row, i) {
    debugger
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
    }

    if (Row.itemId !== 0 && Row.itemId !== null) {
      this.service.GetItemUintbyItemId(Row.itemId).subscribe(res => {
        this.unitsList[i] = res;
        if (res.length == 2) {
          this.assembleyItemsDTList[i].unitId = res[1].id;
        }
        else if (this.assembleyItemsDTList[i].unitId != 0 || this.assembleyItemsDTList[i].unitId != null) {
          this.assembleyItemsDTList[i].unitId = Row.unitId;
        }
        else {
          this.assembleyItemsDTList[i].unitId = res[0].id;
        }
      });
    }
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
        this.service.DeleteVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['AssemblyItems/AssemblyitemsList']);
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

  onChangeAssemblyItem(event) {
    debugger
    this.assembleyItemsAddForm.get("unitId").setValue(0);
    this.assembleyItemsDTList = [];
    this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue([]);
    if (event.value > 0) {
      this.service.GetItemUintbyItemId(event.value).subscribe(res => {
        this.itemsUnitList = res;
      });
    }
  }

  StoreChange() {
    this.assembleyItemsDTList = [];
    this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue([]);
  }

  OnQtyChange(event, row, index) {
    debugger
    this.sumTotalCost = 0;
    if (event > 0) {
      if (row.unitId == 0) {
        this.alert.ShowAlert('PleaseEnterUnitID', "Error")
        setTimeout(() => {
          this.assembleyItemsDTList[index].qty = 0;
        });
        this.cdr.detectChanges();
        return false;
      }
      let TotalQty = 0
      let Item = row.itemId;
      this.service.GetItemQty(row.itemId, this.assembleyItemsAddForm.value.storeId, row.unitId, this.assembleyItemsAddForm.value.voucherDate, event).subscribe(res => {
        if (res) {
          debugger
          if (res.length > 0) {
            row.cost = res[0].cost;
            row.total = (row.cost * row.qty).toFixed(3);
            row.cost = (row.cost).toFixed(3);
            for (let i = 0; i < this.assembleyItemsDTList.length; i++) {
              const row = this.assembleyItemsDTList[i];
              if (row.itemId == Item) {
                TotalQty += row.qty * row.unitRate;
              }
            }
            debugger
            if (TotalQty > res[0].qoh) {
              setTimeout(() => {
                this.assembleyItemsDTList[index].qty = 0;
                this.assembleyItemsDTList[index].cost = 0;
                this.assembleyItemsDTList[index].total = 0;
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
            debugger
            this.assembleyItemsDTList.forEach(element => {
              this.sumTotalCost += Number(element.total);
            });
            if (this.sumTotalCost > 0) {
              this.assembleyItemsAddForm.get("totalCost").setValue((this.sumTotalCost).toFixed(3));
            }
            this.assembleyItemsAddForm.get("cost").setValue((this.sumTotalCost / this.assembleyItemsAddForm.value.qty).toFixed(3));
          }
          else {
            let qty = 0;
            row.qty = 0;
            row.cost = 0;
            this.alert.RemainimgQty("RemainigQty=", qty.toString(), 'error');
          }

        }
      })

    }
    else {
      row.cost = 0;
      row.total = 0;
    }
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
    }, 3000);
  }

  OnUnitChange(event, row) {
    debugger


    this.service.GetUnitRate(row.itemId, event.value).subscribe(res => {
      if (res) {
        debugger
        row.unitRate = res;
      }
    })
  }

  calculateSum() {
    return (this.assembleyItemsDTList.reduce((sum, item) => sum + parseFloat(item.total), 0)).toFixed(3);
  }

  voucherNoBlur(VoucherNo, IsAssembley) {
    debugger
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.service.IfExistVoucher(VoucherNo, IsAssembley).subscribe(res => {
        if (res > 0) {
          this.voucherId = res;
          this.opType = "Edit";
          this.GetInitailEntryVoucher();
        }
        else {
          this.clearFormdata(VoucherNo);
        }
      })

    }
  }

  clearFormdata(VoucherNo) {
    this.newDate = new Date;
    this.assembleyItemsAddForm.get("id").setValue(0);
    this.assembleyItemsAddForm.get("voucherNo").setValue(VoucherNo);
    this.assembleyItemsAddForm.get("notes").setValue("");
    this.assembleyItemsAddForm.get("itemId").setValue(0);
    this.assembleyItemsAddForm.get("unitId").setValue(0);
    this.assembleyItemsAddForm.get("qty").setValue(0);
    this.assembleyItemsAddForm.get("cost").setValue(0);
    this.assembleyItemsAddForm.get("totalCost").setValue(0);
    this.assembleyItemsAddForm.get("storeId").setValue(0);
    this.assembleyItemsAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
    this.itemsUnitList = [];
    this.childAttachment.data = [];
    this.assembleyItemsDTList = [];
    this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue(this.assembleyItemsDTList);
    this.assembleyItemsAddForm.get("generalAttachModelList").setValue([]);
  }

  CopyRow(row, index) {
    debugger
    this.assembleyItemsDTList.push(
      {
        id: 0,
        hDId: 0,
        itemId: row.itemId,
        unitId: row.unitId,
        qty: row.qty,
        cost: row.cost,
        total: row.total,
        unitRate: row.unitRate,
        index: ""
      });
    this.assembleyItemsAddForm.get("assemblyItemsDtModels").setValue(this.assembleyItemsDTList);
    setTimeout(() => {
      this.service.GetItemUintbyItemId(row.itemId).subscribe(res => {
        this.unitsList[index + 1] = res;
      });
      this.OnUnitChange2(row);
    });

    setTimeout(() => {
      this.OnQtyChange(row.qty, row, index + 1)
    }, 10);
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }

  OnUnitChange2(row) {
    debugger
    this.service.GetUnitRate(row.itemId, row.unitId).subscribe(res => {
      if (res) {
        debugger
        row.unitRate = res;
      }
    })
  }

  QtyChange(event) {
    debugger
    if (event.currentTarget.value == 0) {
      this.alert.ShowAlert("PleaseInsertQty", 'error');
      this.assembleyItemsAddForm.get("cost").setValue(0);
      this.assembleyItemsAddForm.get("totalCost").setValue(0);
      for (let i = 0; i < this.assembleyItemsDTList.length; i++) {
        this.assembleyItemsDTList[i].qty = 0;
        this.OnQtyChange(this.assembleyItemsDTList[i].qty, this.assembleyItemsDTList[i], i);
      }
      return false;
    }
    else {
      for (let i = 0; i < this.assembleyItemsDTList.length; i++) {
        this.OnQtyChange(this.assembleyItemsDTList[i].qty, this.assembleyItemsDTList[i], i);
      }
    }
    this.calculateSum();
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