import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ItemInformationsnComponent } from './item-informationsn/item-informationsn.component';
import { UnitsPricesComponent } from './units-prices/units-prices.component';
import { AccountsComponent } from './accounts/accounts.component';
import { ItemsLocationsComponent } from './items-locations/items-locations.component';
import { AlternativeVarietiesComponent } from './alternative-varieties/alternative-varieties.component';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { ItemService } from '../item.service';
import { Information } from '../model/information';
import { Router } from '@angular/router';
import { Account } from '../model/account';
import { AlternativeItem } from '../model/alternative-item';
import { sweetalert } from 'sweetalert';
import { environment } from 'environments/environment';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ItemsdelearsComponent } from './items-dealers/itemsdelears.component';
import { ItemaddinfoFormComponent } from './item-advanceinfo/itemaddinfo-form.component';

@Component({
  selector: 'app-item-from',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit {
  @ViewChild('ItemInformation') ItemInformation: ItemInformationsnComponent
  @ViewChild('UnitPrice') UnitPrice: UnitsPricesComponent
  @ViewChild('Accounts') Accounts: AccountsComponent
  @ViewChild('ItemsLocations') ItemsLocations: ItemsLocationsComponent
  @ViewChild('AlternativeVarieties') AlternativeVarieties: AlternativeVarietiesComponent
  @ViewChild('Itemsdelears') Itemsdelears: ItemsdelearsComponent
  @ViewChild('ItemsAddInfo') ItemsAddInfo: ItemaddinfoFormComponent
  isTabDisabled = false;
  item: number;
  isViewMode = false;
  isCopied = false;
  showLoader = false
  itemForm: FormGroup;
  requstId: any = null;
  file: File;
  cardImageBase64: string;
  imagePath = "assets/images/defualt-upload.png";
  itemGroupList: any;
  informationFormData: Information = new Information();
  accountFormData: Account = new Account();
  alternativeItemFormData: any = [];
  itemsLocationsFormData: any = [];
  unitsPricesFormData: any = [];
  itemsdealersFormData: any = [];
  itemsAddInfoFormData: any = [];
  isItemInformationloaded: boolean = false;
  isItemAccountloaded: boolean = false;
  isItemsLocationsloaded: boolean = false;
  isAlternativeItemloaded: boolean = false;
  isUnitsPricesloaded: boolean = false;
  isItemsDealersloaded: boolean = false;
  isItemsAddInfoloaded: boolean = false;
  isItemloaded: boolean = false;
  disableAll: boolean = false;
  public TitlePage: string;
  UseTax: boolean;
  image: any;
  disableSave: boolean;
  categoryId: number;
  taxId: number;
  opType: any;
  allcategoreis:any;
  CategoreList: any;
  CompanyName: string;

  constructor(
    private formbulider: FormBuilder,
    private routePartsService: RoutePartsService,
    private itemService: ItemService,
    public router: Router,
    private alert: sweetalert,
    private changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private title: Title,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    debugger
    this.disableSave = false;
    this.SetTitlePage();
    this.initializePrams();
    this.initializeForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemForm');
    this.title.setTitle(this.TitlePage);
  }

  initializePrams() {
    debugger
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('item') != null) {
      this.requstId = queryParams.get('item');
      this.isViewMode = true;
      this.isCopied = false;
    }
    else {
      this.requstId = this.routePartsService.GuidToEdit;
      this.isViewMode = this.routePartsService?.Guid2ToEdit;
      this.isCopied = this.routePartsService?.Guid3ToEdit;
      this.opType = this.routePartsService?.Guid4ToEdit;

      if (this.isViewMode == true) {
        this.isTabDisabled = true;
      }
      else {
        this.isTabDisabled = false;
      }
    }
    this.opType = this.routePartsService?.Guid4ToEdit;
    if (this.requstId < 0 && (!this.requstId || this.requstId == "")) {
      this.navigateToListPage()
    }
  }

  initializeForm() {
    this.itemForm = this.formbulider.group({
      id: [0],
      itemGroupId: [null, [Validators.required, Validators.min(1)]],
      itemNo: [null, [Validators.required]],
      itemNameA: [null, [Validators.required]],
      itemNameE: [null, [Validators.required]],
      printNameA: [null],
      printNameE: [null],
      stopped: [false],
      taxable: [false],
      isNonStockItem: [false],
      hasSerialNo: [false],
      hasExpDate: [false],
      image: [null],
      note: [null],
      countryOrigin: [null],
      categoryId: [null],
      modelId: [null],
      brandId: [null],
      colorId: [null],
      expDateReminder:[null],
      supplierId: [null],
      taxId: [null],
      priorityLevelId: [null],
      productionCompany: [null],
      sizeId: [null],
      season: [null],
      maxQty: [null],
      minQty: [null],
      orderQty: [null],
      specifications: [null],
      length: [null],
      width: [null],
      height: [null],
      weight: [null],
      storeId: [null],
      typeId: [0, [Validators.required]],
      storeAccNo: [null],
      costGoodsSoldAccNo: [null],
      purchaseAccNo: [null],
      salesAccNo: [null],
      dealerItemsModel: [[]],
      itemsAddInfoModel: [[]],
      alternativeItemModel: [[]],
      itemsLocationsModel: [[]],
      unitPriceModel: [[]],
    });
    this.getInitializeForm();
    this.checkViewMode();
  }

  checkViewMode() {
    if (this.isViewMode) {
      this.itemForm.disable();
    }
  }

  isValidItemCode(itemCode) {
    debugger
    this.itemService.IsValidItemCode(itemCode).subscribe(valid => {
      const itemNoControl = this.itemForm.get("itemNo");
      if (!valid) {
        itemNoControl.setValidators([this.customItemCodeValidator(valid), Validators.required]);
        itemNoControl.updateValueAndValidity();
      } else {
        itemNoControl.clearValidators();
        itemNoControl.updateValueAndValidity();
      }
    });
  }

  isValidItemNameA(itemNameA) {
    debugger
    this.itemService.isValidItemNameA(itemNameA).subscribe(valid => {
      debugger
      const itemNoControl = this.itemForm.get("itemNameA");
      if (!valid) {
        itemNoControl.setValidators([this.customItemNameAValidator(valid), Validators.required]);
        itemNoControl.updateValueAndValidity();
      } else {
        itemNoControl.clearValidators();
        itemNoControl.updateValueAndValidity();
      }
    });
  }

  isValidItemNameE(itemNameE) {
    debugger
    this.itemService.isValidItemNameE(itemNameE).subscribe(valid => {
      debugger
      const itemNoControl = this.itemForm.get("itemNameE");
      if (!valid) {
        itemNoControl.setValidators([this.customitemNameEValidator(valid), Validators.required]);
        itemNoControl.updateValueAndValidity();
      } else {
        itemNoControl.clearValidators();
        itemNoControl.updateValueAndValidity();
      }
    });
  }

  customItemCodeValidator(valid): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!valid) {
        return { isValidItemCode: true };
      }
      return null;
    };
  }

  customItemNameAValidator(valid): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!valid) {
        return { isValidItemNameA: true };
      }
      return null;
    };
  }

  customitemNameEValidator(valid): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!valid) {
        return { isValidItemNameE: true };
      }
      return null;
    };
  }

  getInitializeForm() {
    debugger
    this.CompanyName = window.localStorage.getItem('companyName');
    if (this.requstId >= 0) {
      this.itemService.GetItemForm(this.requstId, this.isCopied, this.opType).subscribe(res => {
        debugger
        if (res.isSuccess == false && res.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['Items/ItemsList']);
          return;
        }

        this.itemGroupList = res.itemGroupList;
        this.itemForm.patchValue(res);
        const source$ = of(1, 1);
        source$.pipe(delay(0)).subscribe(() => {
          if (this.isCopied) {
            this.itemForm.get("itemNo").setValue('');
            this.itemForm.get("id").setValue(0);
          }
          this.itemForm.get("itemGroupId").setValue(res.itemGroupId);
        });
        this.isItemloaded = true;
        this.UseTax = res.useTax;
        
        if(this.CompanyName == "Hashmyieh")
          {
            this.CategoreList = res.itemsInformationInitialModel.hashCatList;
          }        
        else
          {
            this.CategoreList = res.itemsInformationInitialModel.categoriesList;
          }
         this.allcategoreis = this.CategoreList;
        debugger;
        this.setInformationFormData(res.itemsInformationInitialModel)
        this.setAccountsFormData(res.itemAccountsModel);
        this.setItemsLocationsFormData(res.itemsLocationsModels);
        this.setAlternativeItemFormData(res.alternativeItemModel);
        this.setUnitPriceFormData(res.unitsPricesInitialModel);
        this.setItemsAddinfoFormData(res.itemsInfoInitialModel);
        this.setItemsDealerFormData(res.itemDealersInitialModel)
        if (res.image && res.image != "") {
          this.imagePath = environment.apiURL_Main + res.image;
          this.image = res.image;
        }
        else {
          this.imagePath = "assets/images/defualt-upload.png";
        }

      });
    }
  }

  setInformationFormData(informationFormData) {
    this.informationFormData = informationFormData
    this.isItemInformationloaded = true;
  }

  setAccountsFormData(accountFormData) {
    this.accountFormData = accountFormData
    this.isItemAccountloaded = true;
  }

  setItemsLocationsFormData(itemsLocationsFormData) {
    this.itemsLocationsFormData = itemsLocationsFormData
    this.isItemsLocationsloaded = true;
  }

  setAlternativeItemFormData(alternativeItemFormData) {
    this.alternativeItemFormData = alternativeItemFormData
    this.isAlternativeItemloaded = true;
  }

  setUnitPriceFormData(unitsPricesFormData) {
    this.unitsPricesFormData = unitsPricesFormData
    this.isUnitsPricesloaded = true;
  }

  setItemsDealerFormData(itemsdealersFormData) {
    this.itemsdealersFormData = itemsdealersFormData
    this.isItemsDealersloaded = true;
  }

  setItemsAddinfoFormData(itemsAddInfoFormData) {
    debugger
    this.itemsAddInfoFormData = itemsAddInfoFormData
    this.isItemsAddInfoloaded = true;
  }

  ClearImagePath(image): void {
    image.value = "";
    this.image = "";
    this.imagePath = "assets/images/defualt-upload.png";
  }

  onUploadIamge(event) {
    if (event) {
      debugger
      this.file = event[0];
      if (this.file.type.startsWith('image/')) {
        var reader = new FileReader();
        reader.readAsDataURL(event[0]);
        reader.onload = (event: any) => {
          this.imagePath = event.target.result;
          const imgBase64Path = event.target.result;
          this.cardImageBase64 = imgBase64Path;
        }
      } else {
        this.alert.ShowAlert('ImageOnly', 'error');
        event.target.value = '';
        this.file = null;
        return;
      }
    }
  }

  navigateToListPage() {
    this.router.navigate(['Items/ItemsList']);
  }

  onChangeItemGroup(itemGroupvalueId) {
    debugger

    this.itemService.GetLinkingAccountItemGruop(itemGroupvalueId).subscribe(data => {
      debugger
      if (data.categoryId != 0 && data.categoryId != null && data.categoryId != undefined) {
        this.categoryId = data.categoryId;
      }
      else {
        this.categoryId = 0;
      }


      if (data.taxId != 0 && data.taxId != null && data.taxId != undefined) {
        this.taxId = data.taxId;
        this.itemForm.get("taxable").setValue(true)
      }
      else {
        this.taxId = 0;
        this.itemForm.get("taxable").setValue(false)
      }


      this.itemForm.get("hasExpDate").setValue(data.hasExpDate)

      if (data.storeId != 0 && data.storeId != null && data.storeId != undefined) {
        this.ItemInformation.informationForm.get('storeId').setValue(data.storeId);
      }
      else {
        this.ItemInformation.informationForm.get('storeId').setValue(0);
      }

      this.ItemInformation.SetvariblesValue(this.categoryId, this.taxId);
      this.Accounts.setLinkingAccountItemGruop(data);


      this.CategoreList =this.allcategoreis;
      if (data.itemClassesIds && data.itemClassesIds.trim() !== "") {
        const itemClassIdsArray = data.itemClassesIds.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
        const filteredCategories = this.CategoreList.filter(cat => itemClassIdsArray.includes(cat.id));
        if (filteredCategories.length > 0) {

          filteredCategories.unshift({
            id: 0,
            text: "أختر",
            data1: null,
            data2: 0,
            data3: null,
            isTaxable: false
          });
          this.ItemInformation.categoriesList = filteredCategories;
        }
      } else {
        this.ItemInformation.categoriesList = this.CategoreList;
      }







    });
    this.itemService.GetMaxItemNo(itemGroupvalueId).subscribe(max => {
      debugger
      if (max >= 0) {
        if (this.CompanyName != "Hashmyieh")       
          this.itemForm.get("itemNo").setValue(max);
      }
    })
    debugger
    if(this.CompanyName == "Hashmyieh")
      {
        this.CategoreList =this.allcategoreis;
        this.CategoreList = this.CategoreList.filter(x => x.id == 0 ||  x.data1 === itemGroupvalueId.toString());
        this.ItemInformation.filteredCategoriesList = this.CategoreList;
        this.itemForm.get("itemNo").setValue(" ");
      }
    else
      {
         this.ItemInformation.filteredCategoriesList =this.allcategoreis;
      }
    
    
  }

  switchTab(tabId: string) {
    // Loop through all tab elements and deactivate them
    const tabElements = document.querySelectorAll('.tab-content__pane');
    tabElements.forEach((element) => {
      element.classList.remove('active');
    });

    // Activate the specified tab
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.classList.add('active');
    } else {
      console.error(`Tab with ID '${tabId}' not found.`);
    }
  }

  OnSaveForm() {
    debugger
    this.disableSave = true;
    this.itemForm.markAllAsTouched();
    if (this.itemForm.invalid) {
      this.disableSave = false;
      return;
    }

    if (this.Accounts.accountForm.invalid) {
      this.Accounts.accountForm.markAllAsTouched();
      this.disableSave = false;
      this.switchTab('f03');
      return;
    }

    this.itemForm.patchValue(this.ItemInformation.informationForm.value);
    this.itemForm.patchValue(this.Accounts.accountForm.value);
    if (this.Accounts.inventoryType !== this.Accounts.periodic && this.Accounts.inventoryAccType === 179 && (this.itemForm.value.storeAccNo <= 0 || this.itemForm.value.costGoodsSoldAccNo <= 0)) {
      this.alert.ShowAlert("EnterAccounts", "error");
      this.disableSave = false;
      this.switchTab('f03');
      return;
    }

    this.itemForm.patchValue(this.ItemInformation.informationForm.value);
    if (this.itemForm.value.categoryId <= 0) {
      this.alert.ShowAlert("RequiredField", "error");
      this.disableSave = false;
      this.switchTab('f01');
      return;
    }
    if (this.itemForm.value.typeId <= 0) {
      this.alert.ShowAlert("RequiredField", "error");
      this.disableSave = false;
      this.switchTab('f01');
      return;
    }

    if (this.Itemsdelears.itemsDealersFormArray.invalid) {
      this.Itemsdelears.itemsDealersFormArray.markAllAsTouched();
      this.disableSave = false;
      this.switchTab('f06');
      return;
    }
    for (let i = 0; i < this.Itemsdelears.itemsDealersFormArray.length; i++) {
      const element = this.Itemsdelears.itemsDealersFormArray.value[i];
      if (element.unitId == 0 || element.dealerId == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        this.switchTab('f06');
        return false;
      }
      element.i = i.toString();
    }

    debugger
    for (let i = 0; i < this.ItemsAddInfo.itemsAddinfoFormArray.length; i++) {
      const element = this.ItemsAddInfo.itemsAddinfoFormArray.value[i];
      if ((element.infoId == 0) && element.description != "") {
        this.alert.ShowAlert("PleaseEnterItemInfo", 'error');
        this.disableSave = false;
        this.switchTab('f07');
        return false;
      }
      if ((element.description == "" || element.description == null) && element.infoId > 0) {
        this.alert.ShowAlert("PleaseEnterItemInfoDesc", 'error');
        this.disableSave = false;
        this.switchTab('f07');
        return false;
      }
      element.i = i.toString();
    }
    debugger
    for (let i = 0; i < this.ItemsAddInfo.itemsAddinfoFormArray.length; i++) {
      const element = this.ItemsAddInfo.itemsAddinfoFormArray.value[i];
      if ((element.infoId == 0 || element.infoId == null) && (element.description == "" || element.description == undefined)) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        this.disableSave = false;
        this.switchTab('f07');
        return false;
      }

    }

    let invlaidAlternativeVarietiesFormCount = 0;
    this.AlternativeVarieties.alternativeItemFormArray.controls.forEach(alternativeItem => {

      if (alternativeItem.invalid) {
        alternativeItem.markAllAsTouched();
        this.disableSave = false;
        invlaidAlternativeVarietiesFormCount++;
      }
    });
    if (invlaidAlternativeVarietiesFormCount > 0) {
      this.switchTab('f05');
      this.disableSave = false;
      return;
    }

    this.itemForm.value.alternativeItemModel = this.AlternativeVarieties.alternativeItemFormArray.value.map(item => {
      const { id, ...newItem } = item;
      return newItem;
    });

    let invlaidItemsLocationsFormCount = 0;
    this.ItemsLocations.itemsLocationsFormArray.controls.forEach(itemLocationForm => {
      if (itemLocationForm.invalid) {
        itemLocationForm.markAllAsTouched();
        this.disableSave = false;
        invlaidItemsLocationsFormCount++;
      }
    });
    if (invlaidItemsLocationsFormCount > 0) {
      this.switchTab('f04');
      return;
    }
    this.itemForm.value.itemsLocationsModel = this.ItemsLocations.itemsLocationsFormArray.value.map(item => {
      const { id, ...newItem } = item;
      return newItem;
    });
    let invlaidUnitsFormCount = 0;
    this.UnitPrice.unitsFormArray.controls.forEach(uintForm => {
      if (uintForm.invalid) {
        uintForm.markAllAsTouched();
        this.disableSave = false;
        invlaidUnitsFormCount++;
      }
    });
    if (invlaidUnitsFormCount > 0) {
      this.switchTab('f02');
      this.disableSave = false;
      this.alert.ShowAlert("msgEnterAllData", 'error');
      return;
    }
    this.itemForm.value.unitPriceModel = this.UnitPrice.unitsFormArray.value.map(item => {
      const { id, ...newItem } = item;
      return newItem;
    });
    const unitPriceModelArray = this.itemForm.value.unitPriceModel;
    const hasDefaultRow = unitPriceModelArray.some(row => row.isDefault);
    const hasSmallRow = unitPriceModelArray.some(row => row.isSmall);
    if (hasDefaultRow == false || hasSmallRow == false) {
      this.alert.ShowAlert('hasDefaultSmall', 'error');
      this.disableSave = false;
      return;
    }
    this.itemForm.value.dealerItemsModel = this.Itemsdelears.itemsDealersFormArray.value.map(item => {
      const { id, ...newItem } = item;
      return newItem;
    });
    let itemDealer = JSON.stringify(this.itemForm.value.dealerItemsModel);




    this.itemForm.value.itemsAddInfoModel = this.ItemsAddInfo.itemsAddinfoFormArray.value.map(item => {
      const { id, ...newItem } = item;
      return newItem;
    });
    let iteminfo = JSON.stringify(this.itemForm.value.itemsAddInfoModel);
    let alternativeItemModelList = JSON.stringify(this.itemForm.value.alternativeItemModel);
    let itemsLocationsModelList = JSON.stringify(this.itemForm.value.itemsLocationsModel);
    if (this.isCopied) {
      this.requstId = 0;
      this.itemForm.value.unitPriceModel.forEach(uintPrice => {
        uintPrice.itemId = 0;
      })
    }
    else {
      this.itemForm.value.unitPriceModel.forEach(uintPrice => {
        uintPrice.itemId = this.requstId;
      })
    }
    let unitPriceModelList = JSON.stringify(this.itemForm.value.unitPriceModel);
    this.changeDetectorRef.detectChanges();
    const formData = new FormData();
    formData.append('id', this.requstId);
    formData.append('itemGroupId', this.itemForm.value.itemGroupId);
    formData.append('itemNo', this.itemForm.value.itemNo);
    formData.append('itemNameA', this.itemForm.value.itemNameA);
    formData.append('itemNameE', this.itemForm.value.itemNameE);
    formData.append('printNameA', this.itemForm.value.printNameA ?? this.itemForm.value.itemNameA);
    formData.append('printNameE', this.itemForm.value.printNameE ?? this.itemForm.value.itemNameE);
    formData.append('stopped', this.itemForm.value.stopped);
    formData.append('taxable', this.itemForm.value.taxable);
    formData.append('hasSerialNo', this.itemForm.value.hasSerialNo);
    formData.append('hasExpDate', this.itemForm.value.hasExpDate);
    formData.append('isNonStockItem', this.itemForm.value.isNonStockItem ?? false);
    formData.append('note', this.itemForm.value.note);
    formData.append('expDateReminder', this.itemForm.value.expDateReminder ?? 0);    
    formData.append('countryOrigin', this.itemForm.value.countryOrigin ?? 0);
    formData.append('categoryId', this.itemForm.value.categoryId ?? 0);
    formData.append('modelId', this.itemForm.value.modelId ?? 0);
    formData.append('brandId', this.itemForm.value.brandId ?? 0);
    formData.append('colorId', this.itemForm.value.colorId ?? 0);
    formData.append('supplierId', this.itemForm.value.supplierId ?? 0);
    formData.append('taxId', this.itemForm.value.taxId ?? 0);
    formData.append('sizeId', this.itemForm.value.sizeId ?? 0);
    formData.append('storeId', this.itemForm.value.storeId ?? 0);
    formData.append('typeId', this.itemForm.value.typeId ?? 0);
    formData.append('season', this.itemForm.value.season ?? 0);
    formData.append('maxQty', this.itemForm.value.maxQty ?? 0);
    formData.append('minQty', this.itemForm.value.minQty ?? 0);
    formData.append('orderQty', this.itemForm.value.orderQty ?? 0);
    formData.append('specifications', this.itemForm.value.specifications ?? "");
    formData.append('length', this.itemForm.value.length ?? 0);
    formData.append('width', this.itemForm.value.width ?? 0);
    formData.append('height', this.itemForm.value.height ?? 0);
    formData.append('weight', this.itemForm.value.weight ?? 0);
    formData.append('productionCompany', this.itemForm.value.productionCompany ?? "");
    formData.append('priorityLevelId', this.itemForm.value.priorityLevelId ?? 0);
    formData.append('storeAccNo', this.itemForm.value.storeAccNo ?? 0);
    formData.append('costGoodsSoldAccNo', this.itemForm.value.costGoodsSoldAccNo ?? 0);
    formData.append('purchaseAccNo', this.itemForm.value.purchaseAccNo ?? 0);
    formData.append('salesAccNo', this.itemForm.value.salesAccNo ?? 0);
    formData.append('alternativeItemModel', alternativeItemModelList);
    formData.append('dealerItemsModel', itemDealer);
    formData.append('ItemsAddInfoModel', iteminfo);
    formData.append('itemsLocationsModel', itemsLocationsModelList);
    formData.append('unitPriceModel', unitPriceModelList);

    if (this.image != "" && this.image != undefined && this.image != null) {
      formData.append("image", this.image)
    }
    if (this.file == undefined) {
      formData.append("file", null)
    }
    else {
      formData.append("file", this.file)
      formData.append("image", this.file.type)
    }
    this.changeDetectorRef.detectChanges();

    this.itemService.PostItemForm(formData).subscribe(res => {
      debugger
      this.alert.SaveSuccess();
      if (this.requstId !== 0 || this.isCopied == true) {
        this.navigateToListPage();
      }
      this.requstId = 0;
      this.ngOnInit();
      this.ClearAfterSave();
      this.disableSave = false;
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  ClearAfterSave() {
    debugger
    this.informationFormData = new Information();
    this.isItemInformationloaded = false;

    this.unitsPricesFormData = [];
    this.isUnitsPricesloaded = false;

    this.itemsdealersFormData = [];
    this.isItemsDealersloaded = false;

    this.accountFormData = new Account();
    this.isItemAccountloaded = false;

    this.itemsLocationsFormData = [];
    this.isItemsLocationsloaded = false;

    this.alternativeItemFormData = [];
    this.isAlternativeItemloaded = false;

    this.itemsAddInfoFormData = [];
    this.isItemsAddInfoloaded = false;
    this.cdr.detectChanges();
  }

  onCancel() {
    this.navigateToListPage();
  }
}
