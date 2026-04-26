import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay, of } from 'rxjs';
import { sweetalert } from 'sweetalert';
import { ItemsOffersService } from '../items-offers.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-items-offers-form',
  templateUrl: './items-offers-form.component.html',
  styleUrl: './items-offers-form.component.scss'
})
export class ItemsOffersFormComponent {
  showLoader = false;
  loading: boolean;
  ItemsOffersForm: FormGroup;
  showsave: boolean;
  disableSave: boolean;
  public TitlePage: string;
  decimalPlaces: number;
  public id: any;
  public opType: string;
  disableAll: boolean = false;
  itemsOffersDTList: any[] = [];
  isInvoiceOffer: boolean = false;
  disableItemsTable: boolean = false;
  disableIsDisount: boolean = false;
  Lang: any;


  // Lists
  BranchesList: any;
  ItemsList: any;
  CategoriesList: any;
  UnitList: any;
  FreeItemsList: any;
  FreeUnitList: any;
  DisplayTypeList: any;
  public unitsList: Array<any> = [];
  public freeUnitList: Array<any> = [];

  OfferTypeList: { id: number; text: string }[] = [
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Choose' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'نسبة' : 'Rate' },
    { id: 2, text: this.jwtAuth.getLang() === 'ar' ? ' مبلغ ثابت' : 'Fixed Amount' },
  ];

  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private http: HttpClient,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private itemsOffersService: ItemsOffersService) { }

  ngOnInit(): void {
    debugger
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.id = +params['id'];
      this.opType = params.opType;

      if (params.showsave == "true") {
        this.showsave = true;
      }
      else {
        this.showsave = false;
      }
    });

    if (this.id == null || this.id == undefined || this.id === 0 || isNaN(this.id)) {
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.id = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
      }
      else {
        this.id = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }
    }

    this.SetTitlePage();
    this.ItemsOffersForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      offerNameA: ["", Validators.required],
      offerNameE: ["", Validators.required],
      fromDate: [new Date()],
      toDate: [new Date()],
      isInvoiceOffer: [false, Validators.required],
      minInvoiceAmount: [0],
      invOfferType: [0],
      invOfferValue: [0],
      active: [false],
      note: [""],
      branchId: [0],
      priority: [0],
      itemsOffersDTList: [null],
    });
    if (this.id == null || this.id == undefined || this.id === "") {
      this.router.navigate(['ItemsOffers/ItemsOffersList']);
    }

    this.GetItemsOffersInfo();

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });
  }

  GetItemsOffersInfo() {
    debugger
    this.itemsOffersService.GetItemsOffers(this.id, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ItemsOffers/ItemsOffersList']);
        return;
      }

      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.BranchesList = result.userCompanyBranchList;
      this.ItemsList = result.itemsList;
      this.CategoriesList = result.categoriesList;
      this.UnitList = result.unitList;
      this.FreeItemsList = result.freeItemsList;
      this.FreeUnitList = result.freeUnitList;
      this.DisplayTypeList = result.displayTypeList;
      this.ItemsOffersForm.patchValue(result);

      if (result.itemsOffersDTList != null) {
        debugger
        let index = 0;
        this.itemsOffersDTList = result.itemsOffersDTList;
        this.itemsOffersDTList.forEach(element => {
          this.ItemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.unitsList[index] = this.UnitList.filter(unit => unit.id == element.unitId);
              index++;
            }
          });

          this.FreeItemsList.forEach(item => {
            if (item.id === element.itemId) {
              this.freeUnitList[index] = this.FreeUnitList.filter(unit => unit.id == element.unitId);
              index++;
            }
          });
        });
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.disableSave = false;
        if (this.id > 0) {
          debugger
          this.ItemsOffersForm.get("branchId").setValue(result.branchId);
          this.ItemsOffersForm.get("itemsOffersDTList").setValue(result.itemsOffersDTList);
          this.ItemsOffersForm.get("invOfferType").setValue(result.invOfferType);


          if (result.isInvoiceOffer == true) {
            this.isInvoiceOffer = true;
            this.disableItemsTable = true;
            this.disableIsDisount = false;
          }
          else{
               this.disableItemsTable = false;
               this.disableIsDisount = true;
          }
        }
        else {
          this.ItemsOffersForm.get("branchId").setValue(result.defaultBranchId);
          this.ItemsOffersForm.get("invOfferType").setValue(0);
          this.ItemsOffersForm.get("active").setValue(true);


          if (this.isInvoiceOffer === false) {
            this.disableIsDisount = true;
          }
        }
      });
    });
  }

  onChangeItem(Row, i) {
    debugger
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
    }

    this.itemsOffersService.GetItemUintbyItemId(Row.itemId).subscribe(res => {
      debugger
      this.unitsList[i] = res;

      if (res.length == 2) {
        this.itemsOffersDTList[i].unitId = res[1].id;
      }
      else if (this.opType == "Edit" || this.opType == "Show") {

        let unit = this.unitsList[i].find(r => r.id == Row.unitId);
        if (unit == 0 || unit == undefined || unit == null) {
          this.itemsOffersDTList[i].unitId = 0;
          return;
        }
        if (this.itemsOffersDTList[i].unitId != 0) {
          this.itemsOffersDTList[i].unitId = Row.unitId;
        }
      }
      else {
        this.itemsOffersDTList[i].unitId = res[0].id;
      }

      this.checkDuplicateItemUnit(this.itemsOffersDTList[i], i);
    });
  }

  onFreeItemChange(Row, i) {
    debugger
    if (Row.freeItemId == 0 || Row.freeItemId == null) {
      this.freeUnitList[i] = [];
    }

    this.itemsOffersService.GetItemUintbyItemId(Row.freeItemId).subscribe(res => {
      debugger
      this.freeUnitList[i] = res;

      if (res.length == 2) {
        this.itemsOffersDTList[i].unitId = res[1].id;
      }
      else if (this.opType == "Edit" || this.opType == "Show") {

        let freeUnit = this.freeUnitList[i].find(r => r.id == Row.freeUnitId);
        if (freeUnit == 0 || freeUnit == undefined || freeUnit == null) {
          this.itemsOffersDTList[i].freeUnitId = 0;
          return;
        }
        if (this.itemsOffersDTList[i].freeUnitId != 0) {
          this.itemsOffersDTList[i].freeUnitId = Row.freeUnitId;
        }
      }
      else {
        this.itemsOffersDTList[i].freeUnitId = res[0].id;
      }

    });
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsOffersForm');
    this.title.setTitle(this.TitlePage);
  }

  AddNewLine() {
    if (this.disableAll == true) {
      return;
    }
    this.itemsOffersDTList.push(
      {
        id: 0,
        offerId: 0,
        itemId: 0,
        categoryId: 0,
        unitId: 0,
        offerType: 0,
        offerValue: "",
        minQty: 0,
        maxQty: 0,
        freeItemId: 0,
        freeUnitId: 0,
        freeQty: 0,
      });
    this.ItemsOffersForm.get("itemsOffersDTList").setValue(this.itemsOffersDTList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.itemsOffersDTList.splice(rowIndex, 1);
    }
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let isValid = true;

    if (this.ItemsOffersForm.value.fromDate > this.ItemsOffersForm.value.toDate) {
      isValid = false;
      this.alert.ShowAlert("ToDateValidation", 'error');
      this.disableSave = false;
      return false;
    }

    if (this.isInvoiceOffer === true) {

      if (this.ItemsOffersForm.value.minInvoiceAmount <= 0 || this.ItemsOffersForm.value.invOfferType <= 0 || this.ItemsOffersForm.value.invOfferValue <= 0) {
        isValid = false;
        this.alert.ShowAlert("msgEnterMinAmountAndOfferTypeAndOfferValue", 'error');
        this.disableSave = false;
        return;
      }

      this.ItemsOffersForm.value.itemsOffersDTList = [];
      this.disableSave = true;
      isValid = true;
    }

    else {

      if (this.itemsOffersDTList.length <= 0) {
        isValid = false;
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        return;
      }

      this.itemsOffersDTList.forEach(element => {
        if ((element.offerType == null || element.offerType <= 0)
          || (element.minQty == null || element.minQty <= 0)) {
          isValid = false;
          this.alert.ShowAlert("msgEnterAllData", 'error');
          this.disableSave = false;
          return;
        }

        if (element.itemId > 0) {
          if (element.unitId <= 0) {
            isValid = false;
            this.alert.ShowAlert("msgEnterUnitOfItem", 'error');
            this.disableSave = false;
            return
          }
        }

        if (element.offerType == 247) {
          if ((element.freeItemId <= 0 || element.freeItemId == null || element.freeItemId == undefined)
            || (element.freeUnitId <= 0 || element.freeUnitId == null || element.freeUnitId == undefined)
            || (element.freeQty <= 0 || element.freeQty == null || element.freeQty == undefined)) {
            isValid = false;
            this.alert.ShowAlert("msgEnterFreeItemAndFreeUnit", 'error');
            this.disableSave = false;
            return;
          }
        }
        else {
          if (element.offerValue <= 0) {
            isValid = false;
            this.alert.ShowAlert("PleaseEnterOfferValue", 'error');
            this.disableSave = false;
            return;
          }
        }

        if (element.itemId == 0) {
          element.itemId = null;
        }

        if (element.unitId == 0) {
          element.unitId = null;
        }

        if (element.offerValue == "" || element.offerValue == null || element.offerValue == undefined) {
          element.offerValue = 0;
        }
      });

    }

    if (isValid) {
      this.ItemsOffersForm.value.itemsOffersDTList = this.itemsOffersDTList;
      this.ItemsOffersForm.value.companyId = this.jwtAuth.getCompanyId();
      this.ItemsOffersForm.value.userId = this.jwtAuth.getUserId();
      this.itemsOffersService.saveItemsOffers(this.ItemsOffersForm.value).subscribe((result) => {
        debugger;
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();

          debugger
          /*          var PrintAfterSave = this.VoucherTypeList.find(option => option.label === this.SalesRequestForm.value.voucherTypeId)?.printAfterSave || false;
                   if (PrintAfterSave == true) {
                     this.PrintSalesRequest(Number(result.message));
                   } */


          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['ItemsOffers/ItemsOffersList']);
          }
          this.id = 0;
          this.opType = 'Add';
          this.ngOnInit();
        } else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      });
    }
  }

  ClearAfterSave() {
    this.itemsOffersDTList = [];
  }

  checkDuplicateItemUnit(currentRow: any, rowIndex: number) {
    debugger
    if (!currentRow.itemId || !currentRow.unitId) {
      return;
    }

    const isDuplicate = this.itemsOffersDTList.some((row, index) =>
      index !== rowIndex &&
      row.itemId === currentRow.itemId &&
      row.unitId === currentRow.unitId
    );

    if (isDuplicate) {
      setTimeout(() => {
        currentRow.unitId = 0;
      });
      this.alert.ShowAlert("msNoCantChooseSameItemForSameUnit", 'error');
      return;

    }
  }

  onItemChange(row: any, rowIndex: number) {
    if (row.itemId && row.itemId > 0) {
      row.categoryId = 0;
    }
    this.onChangeItem(row, rowIndex);
  }

  onCategoryChange(row: any) {
    if (row.categoryId && row.categoryId > 0) {
      row.itemId = 0;
      row.unitId = 0;
      // this.alert.ShowAlert("Onlythematerialorthecategoryshouldbechosennotboth", 'error');
    }
  }

  onOfferTypeChange(row: any, i: number) {
    debugger
    if (row.offerType === 247) {
      row.offerValue = 0;
    }
  }

  OnChangeDiscount() {
    this.isInvoiceOffer = this.ItemsOffersForm.get('isInvoiceOffer')?.value;
     debugger
    if (this.isInvoiceOffer) {
      this.disableItemsTable = true;
      this.disableIsDisount = false;
      this.itemsOffersDTList = [];

    } else {
      this.disableItemsTable = false;
      this.disableIsDisount = true;
      this.ItemsOffersForm.get("minInvoiceAmount").setValue(0);
      this.ItemsOffersForm.get("invOfferType").setValue(0);
      this.ItemsOffersForm.get("invOfferValue").setValue(0);



      /*       if (this.itemsOffersDTList.length === 0) {
              this.AddNewLine();
            } */
    }
  }

  DeleteItemsOffers(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.itemsOffersService.DeleteItemsOffers(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ItemsOffers/ItemsOffersList']);
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

    PrintItemsOffers(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptItemsOffersAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptItemsOffersEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
