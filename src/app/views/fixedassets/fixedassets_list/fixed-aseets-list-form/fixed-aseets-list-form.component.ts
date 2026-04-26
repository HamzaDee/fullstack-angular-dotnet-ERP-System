import { Component, Input, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FixedassetsListService } from '../FixedAssetsList.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { FixedAssetsModel } from '../FixedAssetsModel';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { environment } from 'environments/environment';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-fixed-aseets-list-form',
  templateUrl: './fixed-aseets-list-form.component.html',
  styleUrls: ['./fixed-aseets-list-form.component.scss']
})
export class FixedAseetsListFormComponent implements OnInit {
  public showLoader = false;
  FixedImage = "assets/images/defualt-upload.png";
  file: File;
  cardImageBase64: string;
  FixedassetsListForm: FormGroup;
  public Data: FixedAssetsModel = new FixedAssetsModel();
  public TypeOfAssestList: DropDownModel[];
  public selectedTypeOfAssest: Number = 0;
  public calculationMethodList: DropDownModel[];
  public selectedcalculationMethod: Number = 0;
  public AccountsModelList: DropDownModel[];
  public selectedAccountsModel: Number = 0;
  public BranchList: DropDownModel[];
  public selectedBranch: Number = 0;
  public LocationList: DropDownModel[];
  public selectedLocation: Number = 0;
  public BuildingList: DropDownModel[];
  public selectedBuilding: Number = 0;
  public SectionList: DropDownModel[];
  public selectedSection: Number = 0;
  public AdministrationList: DropDownModel[];
  public selectedAdministration: Number = 0;
  public CustodianList: DropDownModel[];
  public selectedCustodian: Number = 0;
  public StatusList: DropDownModel[];
  public selectedStatus: Number = 0;
  public selecteddepreriationAccId: Number = 0;
  public selectedaccumulatedDeprAccId: Number = 0;
  public selectedexpensesAccId: Number = 0;
  public selectedprofitLossAccId: Number = 0;
  public id: any;
  public opType: string;
  fixedAssetNo: any;
  Type: string;
  disableAll: boolean = false;
  showsave: boolean;
  public TitlePage: string;
  disableSave: boolean;
  AssestCategoryList: any;
  TypeList: any;
  ModelList: any;
  DeviceSourceList: any;
  loading: boolean;
  
  constructor(
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private FixedassetsListService: FixedassetsListService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private route: ActivatedRoute,
    private title: Title,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.FixedassetsListForm = this.formbulider.group({
      id: [0],
      typeId: [0, [Validators.required, Validators.min(1)]],              // نوع الاصل    
      fano: [0, [Validators.required]],                                // رقم الاصل 
      fanameA: ['', [Validators.required]],                               // الاسم العربي 
      fanameE: ['', [Validators.required]],                              // الاسم الانجليزي 
      isDepreciable: [false],
      depreciationMethod: [0, [Validators.required,Validators.min(1)]],            // طريقة الحساب 
      depreciationPercentage: [0],     /* , [Validators.required, Validators.pattern('^[1-9][0-9]*')] */                       // نسبة الاهلاك 
      branchId: [0],
      locationId: [0, [Validators.required, Validators.min(1)]],                        // الموقع
      buildingId: [0],
      sectionId: [0],
      departmentId: [0],
      employeeId: [0],
      status: [0, [Validators.required, Validators.min(1)]],      // الحالة
      assetAccId: [0],   /* , [Validators.required, Validators.pattern('^[1-9][0-9]*')] */  // حساب الاصل
      depreriationAccId: [0],    // حساب  الاستهلاك
      accumulatedDeprAccId: [0],  // حساب مجمع الاهلاك
      expensesAccId: [0],  // حساب الصيانة
      profitLossAccId: [0], // حساب الارباح والخسائر الراسمالية   
      floorNo: [0],
      startDateUse: [new Date()],
      amount: [0, [Validators.required]],               // القيمة
      salvageValue: [0, [Validators.required]],              // القيمة المتوقعة
      purchaseDate: [new Date()],
      purchaseInvNo: [0],
      startDepreciationDate: [new Date()],
      barcode: [''],
      note: [''],
      image: [''],
      previousDeprBalance: [0],                                                    // النوع الرئيسي
      categoryId: [0],
      brandId: [0],
      modelId: [0],
      serialNo: [''],
      fASource: [0],
      hasWarranty: [false],
      warrantyEndDate: [new Date()],
      lanMacAddress: [''],
      wiFiMacAddress: [''],
      obQty: [0],
      ramSize:[""],
      hDDType:[""],
      domainMember:[false],
      oSActivationKey:[""],
      officeActivationKey:[""],
      iPAddress:[""],
      supplierCompany:[""],
      internetSecurity:[""],
    });

    debugger
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.fixedAssetNo = +params['fixedAssetNo'];
      // this.Type = params['opType'];
      if (params.showsave == "true") {
        this.showsave = true;
      }
      else {
        this.showsave = false;
      }


      if (this.fixedAssetNo > 0) {
        this.id = params.voucherId;
        this.opType = params.opType;

      }
      else if (this.fixedAssetNo == 0) {
        this.id = 0;
        this.opType = 'Add';
      }
      else {
        this.id = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
      }


      // Check for valid voucherId values
      if (this.fixedAssetNo > 0 || this.fixedAssetNo) {
        this.id = this.fixedAssetNo;
        this.opType = this.Type;
      } else {
        // Assign values from routePartsService if conditions aren't met
        this.id = this.routePartsService.GuidToEdit || 0;
        this.opType = this.routePartsService.Guid2ToEdit || null;
      }

    });

    if (this.id == undefined)
      this.router.navigate(['FixedAssetsList/FixedAseetsList']);

    setTimeout(() => {
      if (this.opType == "Show") {
        this.disableAll = true;
      }
      else {
        this.disableAll = false;
      }
    });

    this.GetFixedassetsListformInfo();
  }

  GetFixedassetsListformInfo() {
    debugger
    this.FixedassetsListService.getFixedAssetsListInfo(this.id, this.opType).subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['FixedAssetsList/FixedAseetsList']);
        return;
      }
      this.disableSave = false;
      this.TypeOfAssestList = result.typeOfAssestList;
      this.calculationMethodList = result.calculationMethodList;
      this.AccountsModelList = result.accountsModelList;
      this.BranchList = result.branchList;
      this.LocationList = result.locationList;
      this.BuildingList = result.buildingList;
      this.SectionList = result.sectionList;
      this.AdministrationList = result.administrationList;
      this.CustodianList = result.custodianList;
      this.StatusList = result.statusList;
      this.AssestCategoryList = result.assestCategoryList;
      this.TypeList = result.typeList;
      this.ModelList = result.modelList;
      this.DeviceSourceList = result.deviceSourceList;

      if (result.id == 0) {
        this.Data.startDateUse = new Date();
        this.Data.purchaseDate = new Date();
        this.Data.startDepreciationDate = new Date();
        this.Data.warrantyEndDate = new Date();
      }

      if (result.barcode == "null") {
        result.barcode = "";
      }

      if (result.note == "null") {
        result.note = "";
      }

      result.warrantyEndDate = formatDate(result.warrantyEndDate, "yyyy-MM-dd", "en-US")
      this.FixedassetsListForm.get('fASource').setValue(result.faSource);
      this.FixedassetsListForm.get('obQty').setValue(result.obQty);
      this.FixedassetsListForm.get('ramSize').setValue(result.ramSize);
      this.FixedassetsListForm.get('hDDType').setValue(result.hddType);
      this.FixedassetsListForm.get('domainMember').setValue(result.domainMember);
      this.FixedassetsListForm.get('oSActivationKey').setValue(result.osActivationKey);
      this.FixedassetsListForm.get('officeActivationKey').setValue(result.officeActivationKey);
      this.FixedassetsListForm.get('iPAddress').setValue(result.ipAddress);
      this.FixedassetsListForm.get('supplierCompany').setValue(result.supplierCompany);
      this.FixedassetsListForm.get('internetSecurity').setValue(result.internetSecurity);

      this.Data = result;
      this.FixedassetsListForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedTypeOfAssest = result.typeId;
        this.selectedcalculationMethod = result.depreciationMethod;
        this.selectedBranch = result.branchId;
        this.selectedLocation = result.locationId;
        this.selectedBuilding = result.buildingId;
        this.selectedSection = result.sectionId;
        this.selectedAdministration = result.departmentId;
        this.selectedCustodian = result.employeeId;
        this.selectedStatus = result.status;
        this.selectedAccountsModel = result.assetAccId;
        this.selecteddepreriationAccId = result.depreriationAccId;
        this.selectedaccumulatedDeprAccId = result.accumulatedDeprAccId;
        this.selectedexpensesAccId = result.expensesAccId;
        this.selectedprofitLossAccId = result.profitLossAccId;
      });

      if (result.image != null && result.image != "")
        //this.FixedImage = 'http://localhost:7205' + result.image;
        this.FixedImage = environment.apiURL_Main + result.image;
      else
        this.FixedImage = "assets/images/defualt-upload.png";
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('FixedAseetsListForm');
    this.title.setTitle(this.TitlePage);
  }

  GetOriginalTypeInfo() {

    this.FixedassetsListService.getOriginalTypeInfo(this.FixedassetsListForm.value.typeId).subscribe((result) => {
      this.Data.startDateUse = new Date();
      this.Data.purchaseDate = new Date();
      this.Data.startDepreciationDate = new Date();
      this.Data.warrantyEndDate = new Date();

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.Data.depreciationPercentage = this.FixedassetsListForm.value.depreciationPercentage;
        this.FixedassetsListForm.get("depreciationMethod").setValue(result.depreciationMethod);
        this.FixedassetsListForm.get("assetAccId").setValue(result.assetAccId);
        this.FixedassetsListForm.get("depreriationAccId").setValue(result.depreriationAccId);
        this.FixedassetsListForm.get("accumulatedDeprAccId").setValue(result.accumulatedDeprAccId);
        this.FixedassetsListForm.get("expensesAccId").setValue(result.expensesAccId);
        this.FixedassetsListForm.get("profitLossAccId").setValue(result.profitLossAccId);
      });
      this.Data = result;
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;

    if (this.FixedassetsListForm.value.isDepreciable === true) {
      if (this.FixedassetsListForm.value.depreciationPercentage <= 0 || this.FixedassetsListForm.value.depreciationPercentage == undefined) {
        this.alert.ShowAlert("PleaseEnterDepreciationPercentage", 'error');
        this.disableSave = false;
        return;
      }

      if (this.FixedassetsListForm.value.previousDeprBalance == undefined) {
        this.alert.ShowAlert("PleaseEnterPreviousDeprBalance", 'error');
        this.disableSave = false;
        return;
      }

      if (this.FixedassetsListForm.value.assetAccId <= 0 || this.FixedassetsListForm.value.assetAccId == undefined) {
        this.alert.ShowAlert("PleaseEnterassetAccId", 'error');
        this.disableSave = false;
        return;
      }

      if (this.FixedassetsListForm.value.depreriationAccId <= 0 || this.FixedassetsListForm.value.depreriationAccId == undefined) {
        this.alert.ShowAlert("PleaseEnterdepreriationAccId", 'error');
        this.disableSave = false;
        return;
      }

      if (this.FixedassetsListForm.value.accumulatedDeprAccId <= 0 || this.FixedassetsListForm.value.accumulatedDeprAccId == undefined) {
        this.alert.ShowAlert("PleaseEnteraccumulatedDeprAccId", 'error');
        this.disableSave = false;
        return;
      }

      if (this.FixedassetsListForm.value.expensesAccId <= 0 || this.FixedassetsListForm.value.expensesAccId == undefined) {
        this.alert.ShowAlert("PleaseEnterexpensesAccId", 'error');
        this.disableSave = false;
        return;
      }

      if (this.FixedassetsListForm.value.profitLossAccId <= 0 || this.FixedassetsListForm.value.profitLossAccId == undefined) {
        this.alert.ShowAlert("PleaseEnterprofitLossAccId", 'error');
        this.disableSave = false;
        return;
      }
    }

     if (this.FixedassetsListForm.value.domainMember == null || this.FixedassetsListForm.value.domainMember == undefined) {
       this.FixedassetsListForm.value.domainMember = false;
      }


    const formData = new FormData();
    formData.append('Id', this.id);
    formData.append('typeId', this.FixedassetsListForm.value.typeId);
    formData.append('fano', this.FixedassetsListForm.value.fano);
    formData.append('fanameA', this.FixedassetsListForm.value.fanameA);
    formData.append('fanameE', this.FixedassetsListForm.value.fanameE);
    formData.append('isDepreciable', this.FixedassetsListForm.value.isDepreciable);
    formData.append('depreciationPercentage', this.FixedassetsListForm.value.depreciationPercentage);
    formData.append('depreciationMethod', this.FixedassetsListForm.value.depreciationMethod ?? 0);
    formData.append('branchId', this.FixedassetsListForm.value.branchId ?? 0);
    formData.append('locationId', this.FixedassetsListForm.value.locationId);
    formData.append('buildingId', this.FixedassetsListForm.value.buildingId ?? 0);
    formData.append('sectionId', this.FixedassetsListForm.value.sectionId ?? 0);
    formData.append('departmentId', this.FixedassetsListForm.value.selectedAdministration ?? 0);
    formData.append('floorNo', this.FixedassetsListForm.value.floorNo ?? 0);
    formData.append('employeeId', this.FixedassetsListForm.value.employeeId ?? 0);
    formData.append('startDateUse', this.FixedassetsListForm.value.startDateUse);
    formData.append('status', this.FixedassetsListForm.value.status);
    formData.append('amount', this.FixedassetsListForm.value.amount);
    formData.append('salvageValue', this.FixedassetsListForm.value.salvageValue);
    formData.append('purchaseDate', this.FixedassetsListForm.value.purchaseDate);
    formData.append('purchaseInvNo', this.FixedassetsListForm.value.purchaseInvNo ?? 0);
    formData.append('startDepreciationDate', this.FixedassetsListForm.value.startDepreciationDate);
    formData.append('assetAccId', this.FixedassetsListForm.value.assetAccId ?? null);
    formData.append('depreriationAccId', this.FixedassetsListForm.value.depreriationAccId ?? null);
    formData.append('accumulatedDeprAccId', this.FixedassetsListForm.value.accumulatedDeprAccId ?? null);
    formData.append('expensesAccId', this.FixedassetsListForm.value.expensesAccId ?? null);
    formData.append('profitLossAccId', this.FixedassetsListForm.value.profitLossAccId ?? null);
    formData.append('barcode', this.FixedassetsListForm.value.barcode);
    formData.append('categoryId', this.FixedassetsListForm.value.categoryId ?? 0);
    formData.append('brandId', this.FixedassetsListForm.value.brandId ?? 0);
    formData.append('modelId', this.FixedassetsListForm.value.modelId ?? 0);
    formData.append('serialNo', this.FixedassetsListForm.value.serialNo);
    formData.append('lanMacAddress', this.FixedassetsListForm.value.lanMacAddress);
    formData.append('wiFiMacAddress', this.FixedassetsListForm.value.wiFiMacAddress);
    formData.append('fASource', this.FixedassetsListForm.value.fASource ?? 0);
    formData.append('hasWarranty', this.FixedassetsListForm.value.hasWarranty);
    formData.append('warrantyEndDate', this.FixedassetsListForm.value.warrantyEndDate);
    formData.append('obQty', this.FixedassetsListForm.value.obQty ?? 0);
    formData.append('note', this.FixedassetsListForm.value.note);
    formData.append('previousDeprBalance', this.FixedassetsListForm.value.previousDeprBalance ?? 0);
    formData.append('ramSize', this.FixedassetsListForm.value.ramSize);
    formData.append('hDDType', this.FixedassetsListForm.value.hDDType);
    formData.append('domainMember', this.FixedassetsListForm.value.domainMember);
    formData.append('oSActivationKey', this.FixedassetsListForm.value.oSActivationKey ?? "");
    formData.append('officeActivationKey', this.FixedassetsListForm.value.officeActivationKey ?? "");
    formData.append('iPAddress', this.FixedassetsListForm.value.iPAddress ?? "");
    formData.append('supplierCompany', this.FixedassetsListForm.value.supplierCompany ?? "");
    formData.append('internetSecurity', this.FixedassetsListForm.value.internetSecurity ?? "");
    if (this.file == undefined) {
      formData.append("file", null)
      formData.append("image", null)
    }
    else {
      formData.append("file", this.file)
      formData.append("image", this.file.type);
    }

    this.FixedassetsListService.SaveFixedAssetsList(formData).subscribe(res => {

      if (res == true) {
        this.alert.SaveSuccess();
        this.ClearAfterSave();
        if (this.opType == 'Edit') {
          this.router.navigate(['FixedAssetsList/FixedAseetsList']);
        }
        this.id = 0;
        this.opType = 'Add';
        this.ngOnInit();
      }
      else {
        this.alert.SaveFaild();
      }
      this.disableSave = false;
    }, err => {
      this.alert.SaveFaildFieldRequired()
    })
  }

  ClearAfterSave() {
    this.FixedassetsListForm.get("assetAccId").setValue(0);
    this.FixedassetsListForm.get("depreriationAccId").setValue(0);
    this.FixedassetsListForm.get("accumulatedDeprAccId").setValue(0);
    this.FixedassetsListForm.get("expensesAccId").setValue(0);
    this.FixedassetsListForm.get("profitLossAccId").setValue(0);
    this.FixedassetsListForm.get('ramSize').setValue("");
    this.FixedassetsListForm.get('hDDType').setValue("");
    this.FixedassetsListForm.get('domainMember').setValue(false);
    this.FixedassetsListForm.get('oSActivationKey').setValue("");
    this.FixedassetsListForm.get('officeActivationKey').setValue("");
    this.FixedassetsListForm.get('iPAddress').setValue("");
    this.FixedassetsListForm.get('supplierCompany').setValue("");
    this.FixedassetsListForm.get('internetSecurity').setValue("");
  }

  onUploadIamge(event) {
    if (event) {
      this.file = event[0];
      var reader = new FileReader();
      reader.readAsDataURL(event[0]);
      reader.onload = (event: any) => {
        this.FixedImage = event.target.result;
        const imgBase64Path = event.target.result;
        this.cardImageBase64 = imgBase64Path;
      }
    }
  }

  ClearImagePath(image): void {
    image.value = "";
    this.FixedImage = "assets/images/defualt-upload.png";
  }

  
  isEmpty(input) {
    return input === '' || input === null;
  }


  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.DeviceSourceList) {
        this.DeviceSourceList = [];
    }

    // Make sure the array is large enough
    while (this.DeviceSourceList.length < last) {
        this.DeviceSourceList.push(null);
    }

    for (let i = first; i < last; i++) {
        this.DeviceSourceList[i] = this.DeviceSourceList[i];
    }

    this.loading = false;
  }
  
}
