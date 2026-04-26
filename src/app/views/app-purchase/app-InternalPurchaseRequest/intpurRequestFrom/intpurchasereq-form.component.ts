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
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { IntPurchaseRequestService } from '../intpurchase.service';
import { PurchaseService } from '../../purchase-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-intpurchasereq-form',
  templateUrl: './intpurchasereq-form.component.html',
  styleUrl: './intpurchasereq-form.component.scss'
})
export class IntpurchasereqFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  PurcahseRequestAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  accVouchersDTsList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  isExistAccNo: boolean = true;
  selectedVoucherType: any;
  voucherId: any;
  storesList: any;
  costCenterList: any;
  branchesList: any;
  currencyList: any;
  voucherTypeList: any;
  suppliersList: any;
  prioritiesList: any;
  requestPartyList: any;
  paymentTermsList: any;
  requestTypesList: any;
  itemsList: any;
  unitsList: Array<any> = [];
  bounsunitsList: Array<any> = [];
  allUntiesList: any;
  itemsUnitList: any;
  isdisabled: boolean = false;
  decimalPlaces: number;
  disableAll: boolean;
  delieverdToLists: any;
  oldItem:any;
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
  hideGet: boolean = true;
  //End
  unAvlItems: any;
  allUnitsList: any;
  //VoucherTypeSetting
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  //End
  voucherNo: number = 0;
  // Invoice Cycle Setting 
  salesCycle: number;
  sCycle1: number;
  sCycle2: number;
  sCycle3: number;
  sCycle4: number;
  sCycle5: number;
  sCycle6: number;
  purchaseCucleCycle: number;
  pCycle1: number;
  pCycle2: number;
  pCycle3: number;
  pCycle4: number;
  hideGetFromPurchaseOrder: boolean;
  hideGetFromRecieptVoucher: boolean;
  //End
  defaultCurrencyId: number;
  oldStoreId: any;
  showRemainQty: boolean;
  allowMultCurrency: boolean;
  allowAccRepeat: any;
  disableCurrRate: boolean;
  disableSave: boolean;
  lang: string;

  disapleVoucherType: boolean = false;
  NewDate: any;

  voucherStoreId: number;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private purService: IntPurchaseRequestService,
      private translateService: TranslateService,
      public router: Router,
      private formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private http: HttpClient,
      private appCommonserviceService: AppCommonserviceService,
      private dialog: MatDialog,
      private route: ActivatedRoute,
      private pursService: PurchaseService,
      private cdr: ChangeDetectorRef,
    ) { }

  ngOnInit(): void {
                 
    this.disableSave = false;
    this.route.queryParams.subscribe((params: Params) => {
                   
      this.voucherNo = +params['voucher'];
    });
    if (isNaN(this.voucherNo)) {
      this.voucherNo = 0;
    }

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

    const storedData = localStorage.getItem('items');
    localStorage.removeItem('items');

    if (storedData) {
      this.unAvlItems = JSON.parse(storedData);
      console.log('Updating shared data:', this.unAvlItems);
    }
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.voucherId = 0;
    }
    this.SetTitlePage();
    if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
      this.router.navigate(['InternalPurchaseRequest/IntpurchasereqList']);
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
    this.TitlePage = this.translateService.instant('ntpurchasereqForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.PurcahseRequestAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypeId: [0, [Validators.required, Validators.min(1)]],
      voucherTypeEnum: [0],
      voucherNo: ["", [Validators.required]],
      voucherDate: ["", [Validators.required]],
      currencyId: [0, [Validators.required, Validators.min(1)]],
      currRate: [0, [Validators.required, this.greaterThanZeroValidator]],
      note: [""],
      branchId: [null],
      amount: [0],
      status: [null],
      storeId: [0],
      userId: [0],
      dealerId: [0],
      requestParty: [0],
      paymentTerm: [0],
      deliveryPeriod: [0],
      requestedBy: [""],
      deliveryTime: [""],
      origin: [""],
      packing: [""],
      requestType: [0],
      priority: [0],
      deliveredTo: [0],
      requestPurModelList: [null, [Validators.required, Validators.minLength(1)]],
      costCenterTranModelList: [null],
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
    var lang = this.jwtAuth.getLang();
    this.purService.GetInitailPurRequest(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['InternalPurchaseRequest/IntpurchasereqList']);
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
      this.branchesList = result.userCompanyBranchList;
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.suppliersList = result.suppliersList;
      this.costCenterList = result.costCenterList;
      this.requestPartyList = result.requestPartyList;
      this.paymentTermsList = result.paymentTermsList;
      this.requestTypesList = result.requestTypesList;
      this.prioritiesList = result.priorityList;
      this.delieverdToLists = result.delieverdToList;
      //this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.allUntiesList = result.unitList;
      this.itemsUnitList = result.unitsList;
      this.defaultCurrencyId = result.defaultCurrency;
      this.salesCycle = result.invoiceCycleSetting.salesWorkCycle;
      this.sCycle1 = result.invoiceCycleSetting.salesCycle1;
      this.sCycle2 = result.invoiceCycleSetting.salesCycle2;
      this.sCycle3 = result.invoiceCycleSetting.salesCycle3;
      this.sCycle4 = result.invoiceCycleSetting.salesCycle4;
      this.sCycle5 = result.invoiceCycleSetting.salesCycle5;
      this.sCycle6 = result.invoiceCycleSetting.salesCycle6;
      this.purchaseCucleCycle = result.invoiceCycleSetting.purchaseWorkCycle;
      this.pCycle1 = result.invoiceCycleSetting.purchasseCycle1;
      this.pCycle2 = result.invoiceCycleSetting.purchasseCycle2;
      this.pCycle3 = result.invoiceCycleSetting.purchasseCycle3;
      this.pCycle4 = result.invoiceCycleSetting.purchasseCycle4;
      this.allowMultCurrency = result.allowMultiCurrency;
      if (this.salesCycle == this.pCycle2) {
        this.hideGet = false;
      }
      // this.accVouchersDTsList = result.requestPurModelList;
                   
      if (this.opType != 'createPO') {
        if (result.requestPurModelList !== undefined && result.requestPurModelList !== null) {

          let index = 0;
          this.accVouchersDTsList = result.requestPurModelList;

          this.accVouchersDTsList.forEach(element => {
            element.total = element.qty * element.price;
          })

          this.accVouchersDTsList.forEach(element => {
            this.itemsList.forEach(item => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
                this.bounsunitsList[index] = this.allUntiesList.filter(unit => unit.id == element.bonusUnitId);
                index++;
              }
            });
          })

        }

        else {
          this.accVouchersDTsList = [];
        }
                     
        for (let i = 0; i < this.accVouchersDTsList.length; i++) {
          this.onChangeItem(this.accVouchersDTsList[i], i)

        }


      }
      else if (this.opType === 'createPO') {
        const supplierId = this.unAvlItems[0].supplierId;
        let index = 0;
        for (const element of this.unAvlItems) {
          try {
                         
            this.purService.GetUnitId(element.itemId).subscribe(
              (result) => {
                             


                // Process each item in unAvlItems
                for (const item of this.unAvlItems) {
                  if (item.itemId === element.itemId) {
                    const filteredUnits = this.allUntiesList.filter(unit => unit.id === result);
                    this.unitsList[index] = filteredUnits;
                    this.bounsunitsList[index] = filteredUnits;
                    index++;
                  }
                }
                // Push data to accVouchersDTsList
                             
                this.accVouchersDTsList.push({
                  itemId: element.itemId,
                  unitId: result,
                  qty: element.qty,
                  price: 0,
                  total: 0,
                  storeId: 0,
                  costCenterId: 0,
                  bonus: 0,
                  bonusUnitId: result,
                  index: index.toString()
                });
                             
                for (let i = 0; i < this.unAvlItems.length; i++) {
                               
                  this.onChangeItem(this.unAvlItems[i], i)

                }
                             
                this.PurcahseRequestAddForm.get("requestPurModelList").setValue(this.PurcahseRequestAddForm);
              },
              (error) => {
                console.error('Error fetching unit ID:', error);
              }
            );
          } catch (error) {
            console.error('Error processing item:', error);
          }
        }
      }

      this.PurcahseRequestAddForm.patchValue(result);
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
      this.oldStoreId = 0;
      if (result.costCenterTranModelList !== null && result.costCenterTranModelList !== 0 && result.costCenterTranModelList !== undefined) {
        this.PurcahseRequestAddForm.get("costCenterTranModelList").setValue(result.costCenterTranModelList);
      }
      if (result.generalAttachModelList !== null && result.generalAttachModelList !== 0 && result.generalAttachModelList !== undefined) {
        this.PurcahseRequestAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }


      if (this.opType == 'Edit') {
        this.disapleVoucherType = true;
      }


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.PurcahseRequestAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.PurcahseRequestAddForm.get("currencyId").setValue(result.currencyId);
          this.PurcahseRequestAddForm.get("branchId").setValue(result.branchId);
          this.PurcahseRequestAddForm.get("note").setValue(result.note);
          if (!this.useStoreInGrid) {
            this.PurcahseRequestAddForm.get("storeId").setValue(result.storeId);
          }
          this.PurcahseRequestAddForm.get("dealerId").setValue(result.dealerId);
          this.PurcahseRequestAddForm.get("requestParty").setValue(result.requestParty);
          this.PurcahseRequestAddForm.get("paymentTerm").setValue(result.paymentTerm);
          this.PurcahseRequestAddForm.get("deliveryPeriod").setValue(result.deliveryPeriod);
          this.PurcahseRequestAddForm.get("requestedBy").setValue(result.requestedBy);
          this.PurcahseRequestAddForm.get("deliveredTo").setValue(result.deliveredTo)
          this.PurcahseRequestAddForm.get("deliveryTime").setValue(result.deliveryTime);
          this.PurcahseRequestAddForm.get("origin").setValue(result.origin);
          this.PurcahseRequestAddForm.get("packing").setValue(result.packing);
          this.PurcahseRequestAddForm.get("requestType").setValue(result.requestType);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.currencyId);
            this.currencyList = [defaultCurrency];
            this.PurcahseRequestAddForm.get("currencyId").setValue(result.currencyId);
          }

          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.branchId);
            this.branchesList = [defaultBranche];
            this.PurcahseRequestAddForm.get("branchId").setValue(result.branchId);
          }
        }
        else {
          this.PurcahseRequestAddForm.get("branchId").setValue(result.defaultBranchId);
          let defaultVoucher = result.voucherTypeList.find(option => option.isDefault === true)?.id || 0;
          this.PurcahseRequestAddForm.get("voucherTypeId").setValue(defaultVoucher);
          if (result.allowMultiCurrency == false) {
            const defaultCurrency = result.currencyList.find(currency => currency.id === result.defaultCurrency);
            this.currencyList = [defaultCurrency];
            this.PurcahseRequestAddForm.get("currencyId").setValue(defaultCurrency.id);
            this.PurcahseRequestAddForm.get("currRate").setValue(defaultCurrency.data1);
          }
          this.getVoucherNo(defaultVoucher);
          this.useCostCenter = result.useCostCenter;
          if (result.allowMultiBranch == false) {
            const defaultBranche = result.userCompanyBranchList.find(branche => branche.id === result.defaultBranchId);
            this.branchesList = [defaultBranche];
            this.PurcahseRequestAddForm.get("branchId").setValue(defaultBranche.id);
          }
          if (this.PurcahseRequestAddForm.value.currencyId == 0) {
            this.PurcahseRequestAddForm.get("currencyId").setValue(this.defaultCurrencyId);
            var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
            this.PurcahseRequestAddForm.get("currRate").setValue(currRate);
          }
          this.PurcahseRequestAddForm.get("storeId").setValue(0);
          this.PurcahseRequestAddForm.get("priority").setValue(0);
          this.PurcahseRequestAddForm.get("dealerId").setValue(0);
          this.PurcahseRequestAddForm.get("paymentTerm").setValue(0);
          this.PurcahseRequestAddForm.get("requestType").setValue(0);
          this.PurcahseRequestAddForm.get("requestParty").setValue(0);
          this.PurcahseRequestAddForm.get("deliveredTo").setValue(0);
        }
        this.GetVoucherTypeSetting(this.PurcahseRequestAddForm.value.voucherTypeId);
        if (this.PurcahseRequestAddForm.value.currencyId == this.defaultCurrencyId) {
          this.disableCurrRate = true;
        }
        else {
          this.disableCurrRate = false;
        }
      });
    })
  }

  onStoreChange(event: any, row: any, index: number) {
                 
    if (this.useStoreInGrid) {
      setTimeout(() => {
        // if (row.qty > 0) {
        this.accVouchersDTsList[index].qty = 0;
        this.accVouchersDTsList[index].price = 0;
        this.accVouchersDTsList[index].productDate = null;
        this.accVouchersDTsList[index].expiryDate = null;
        this.accVouchersDTsList[index].batchNo = "";
        this.accVouchersDTsList[index].orginalQty = 0;
        this.accVouchersDTsList[index].newRow = 0;
        this.showRemainQty = false;
        this.cdr.detectChanges();
        // }

      });
    }
    else {
                   
      if (this.accVouchersDTsList.length > 0 && this.oldStoreId > 0) {
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
            this.accVouchersDTsList = [];
            this.oldStoreId = event.value;
            this.PurcahseRequestAddForm.get("invVouchersDTModelList").setValue(this.accVouchersDTsList);
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
                         
            this.PurcahseRequestAddForm.get("storeId").setValue(this.oldStoreId);
          }
        })
      }
      else {
        this.oldStoreId = event.value;
      }
    }

  }

  OnSaveForms() {
                 
    this.disableSave = true;
    let stopExecution = false;


    for (let i = 0; i < this.accVouchersDTsList.length; i++) {
      const element = this.accVouchersDTsList[i];
      if (element.itemId == 0 || element.unitId == 0 || element.qty == 0) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.i = i.toString();
    }
                 
    this.PurcahseRequestAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.PurcahseRequestAddForm.value.userId = this.jwtAuth.getUserId();
    this.PurcahseRequestAddForm.value.voucherNo = this.PurcahseRequestAddForm.value.voucherNo.toString();
    this.PurcahseRequestAddForm.value.requestPurModelList = this.accVouchersDTsList;
    this.PurcahseRequestAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.PurcahseRequestAddForm.value.amount = this.calculateSum();
                 
    this.purService.SavePurchaseRequest(this.PurcahseRequestAddForm.value)
      .subscribe((result) => {
                     
        if (result) {
          this.alert.SaveSuccess();

                       
          var PrintAfterSave = this.voucherTypeList.find(option => option.label === this.PurcahseRequestAddForm.value.voucherTypeId)?.printAfterSave || false;
          if (PrintAfterSave == true) {
            this.PrintPurchaseRequest(Number(result.message));
          }

          this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['InternalPurchaseRequest/IntpurchasereqList']);
          }
          this.voucherId = 0;
          this.opType = 'Add';
          this.ngOnInit();
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  ClearAfterSave() {
    this.PurcahseRequestAddForm.value.generalAttachModelList = [];
    this.accVouchersDTsList = [];
    this.childAttachment.data = [];
    setTimeout(() => {
      this.GetVoucherTypeSetting(this.PurcahseRequestAddForm.value.voucherTypeId);
    });
  }

  getVoucherNo(event: any) {
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.PurcahseRequestAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.PurcahseRequestAddForm.value.voucherTypeId;
    var date = new Date(this.PurcahseRequestAddForm.value.voucherDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.purService.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        if (results) {
          this.PurcahseRequestAddForm.get("voucherNo").setValue(results);
        }
        else {
          this.PurcahseRequestAddForm.get("voucherNo").setValue(1);
        }
      });
      if (branchId == null || branchId == undefined) {
        branchId = 0;
        this.PurcahseRequestAddForm.get("branchId").setValue(branchId);
      }
      if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultCurrency == true) {
        this.decimalPlaces = this.currencyList.find(option => option.id === currencyId).data2;
      }
      else {
        this.decimalPlaces = this.currencyList.find(option => option.id === this.defaultCurrencyId).data2;
      }
    }
                 
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
    if (currencyId != 0 && currencyId != null && currencyId != undefined && this.allowMultCurrency == true) {
      this.PurcahseRequestAddForm.get("currencyId").setValue(currencyId);
      var currRate = this.currencyList.find(option => option.id === currencyId).data1;
      this.PurcahseRequestAddForm.get("currRate").setValue(currRate);
      if (this.PurcahseRequestAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
    else {
      this.PurcahseRequestAddForm.get("currencyId").setValue(this.defaultCurrencyId);
      var currRate = this.currencyList.find(option => option.id === this.defaultCurrencyId).data1;
      this.PurcahseRequestAddForm.get("currRate").setValue(currRate);
      if (this.PurcahseRequestAddForm.value.currencyId == this.defaultCurrencyId) {
        this.disableCurrRate = true;
      }
      else {
        this.disableCurrRate = false;
      }
    }
  }

  getCurrencyRate(event: any) {
    const selectedValue = event.value;
    var currRate = this.currencyList.find(option => option.id === selectedValue).data1;
    this.PurcahseRequestAddForm.get("currRate").setValue(currRate);
    if (event.value == this.defaultCurrencyId) {
      this.disableCurrRate = true;
    }
    else {
      this.disableCurrRate = false;
    }
  }

  AddNewLine() {
                 
    if (this.disableAll == true) {
      return;
    }
    
    if (this.accVouchersDTsList == null) {
      this.accVouchersDTsList = [];
    }

    this.accVouchersDTsList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: "",
        price: 0,
        total: 0,
        storeId: this.voucherStoreId,
        costCenterId: 0,
        bonus: "",
        bonusUnitId: 0,
        index: ""
      });
    this.PurcahseRequestAddForm.get("requestPurModelList").setValue(this.accVouchersDTsList);
  }

  calculateSum() {
    return this.formatCurrency(
      this.accVouchersDTsList.reduce((sum, item) => {
        const qty = parseFloat(item.qty);
        const price = parseFloat(item.price);

        // Check for invalid qty or price and treat them as 0 if invalid
        const validQty = isNaN(qty) ? 0 : qty;
        const validPrice = isNaN(price) ? 0 : price;

        return sum + (validQty * validPrice);
      }, 0)
    );
  }

  deleteRow(rowIndex: number) {

    if (rowIndex !== -1) {
      this.accVouchersDTsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      this.bounsunitsList.splice(rowIndex, 1);
    }
    // if (rowIndex !== -1) {
    //   this.accVouchersDTsList.splice(rowIndex, 1);
    // }
    this.PurcahseRequestAddForm.get("requestPurModelList").setValue(this.accVouchersDTsList);
  }

  isEmpty(input) {
    return input === '' || input === null;
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
      qty: "",
      price: "",
      total: 0,
      storeId: this.voucherStoreId,
      costCenterId: 0,
      bonus: "",
      bonusUnitId: 0,
      index: ""
    };

    this.accVouchersDTsList.splice(rowIndex, 0, newRow);
    this.PurcahseRequestAddForm.get("requestPurModelList").setValue(this.accVouchersDTsList);
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/accountsstatement?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  onChangeItem(Row, i) {
    
   
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
    }
    if (Row.bonus == 0 || Row.bonus == null) {
      this.bounsunitsList[i] = [];
    }
    if (Row.itemId !== 0 && Row.itemId !== null) {
      this.purService.GetItemUintbyItemId(Row.itemId).subscribe(res => {
        
        this.unitsList[i] = res;
        if (res.length == 2) {
          this.accVouchersDTsList[i].unitId = res[1].id;
        }
        else if (this.opType =="Edit") {
   /*        if(this.oldItem != Row.itemId)
            {
              this.accVouchersDTsList[i].unitId =0;
              return;
            } */
          let unit = this.unitsList[i].find(r => r.id == Row.unitId);
          if(unit == 0 ||unit == undefined || unit == null)
            {
              this.accVouchersDTsList[i].unitId =0;
              return;
            }
          if(this.accVouchersDTsList[i].unitId != 0)
            {
              this.accVouchersDTsList[i].unitId =Row.unitId;
            }
          
        }
        else {
          this.accVouchersDTsList[i].unitId = 0;
        }
        
        this.bounsunitsList[i] = res;
        this.oldItem =Row.itemId;
      });
    }


    if (Row.itemId > 0) {
      if (this.accVouchersDTsList.length > 0) {
        let isDuplicate = false;
        for (let m = 0; m < this.accVouchersDTsList.length; m++) {
          if (this.accVouchersDTsList[m].itemId == Row.itemId && m != i) {
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
          this.accVouchersDTsList[i] = {
            ...this.accVouchersDTsList[i],
            itemId: 0
          };
          this.cdr.detectChanges();
        }
      }
    }

    if (this.useStoreInGrid == true) {
      var selectedItem = this.itemsList.find(x => x.id === Row.itemId);

      if (selectedItem && selectedItem.storeId > 0) {
        var defaultStoreNo = selectedItem.storeId;
        this.accVouchersDTsList[i].storeId = defaultStoreNo;
        this.cdr.detectChanges();
      }
      else {
        // this.accVouchersDTsList[i].storeId = 0;
        this.cdr.detectChanges();
      }
    }
 
  }

  OnQtyChange(event: any, row: any, Index: number) {
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

  OnPriceBlur(row: any,) {
                 
    if (row.price !== null && row.price !== undefined) {
      row.price = row.price.toFixed(this.decimalPlaces);
      row.total = row.total.toFixed(this.decimalPlaces);
    }
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
                 
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
    this.voucherStoreId = this.voucherTypeList.find(option => option.label === voucherTypeId).storeId;
    if (this.opType == 'Add') {
      if (this.voucherStoreId > 0 && this.voucherStoreId != undefined && this.voucherStoreId != null) {
        this.PurcahseRequestAddForm.get("storeId").setValue(this.voucherStoreId);
      }
      else {
        this.voucherStoreId = 0;
      }
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
        this.purService.DeleteVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['InternalPurchaseRequest/IntpurchasereqList']);
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

  PrintPurchaseRequest(id: number) {
    this.lang = this.jwtAuth.getLang();
     if(this.lang == 'ar')
      {
        const reportUrl = `RptIntpurchasereqAr?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else
      {
        const reportUrl = `RptIntpurchasereqEn?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
  }

  voucherNoBlur(VoucherTypeId, VoucherNo) {
                 
    if (VoucherNo != "" && VoucherNo != null && VoucherNo != undefined) {
      this.purService.IfExistVoucher(VoucherTypeId, VoucherNo).subscribe(res => {
                     
        if (res.id > 0) {
          if (res.status == 66) {
            this.voucherId = res.id;
            this.opType = "Edit";
            this.showsave = false;
            this.PurcahseRequestAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.GetInitailEntryVoucher();
          }
          else if (res.status == 67 || res.status == 68) {
            this.voucherId = res.id;
            this.opType = "Show";
            this.PurcahseRequestAddForm.get("generalAttachModelList").setValue([]);
            this.childAttachment.data = [];
            this.showsave = true;
            this.GetInitailEntryVoucher();
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
    this.PurcahseRequestAddForm.get("id").setValue(0);
    this.PurcahseRequestAddForm.get("note").setValue('');
    this.PurcahseRequestAddForm.get("branchId").setValue(0);
    this.PurcahseRequestAddForm.get("amount").setValue(0);
    this.PurcahseRequestAddForm.get("storeId").setValue(0);
    this.PurcahseRequestAddForm.get("dealerId").setValue(0);
    this.PurcahseRequestAddForm.get("requestParty").setValue(0);
    this.PurcahseRequestAddForm.get("deliveredTo").setValue(0);
    this.PurcahseRequestAddForm.get("priority").setValue(0);
    this.PurcahseRequestAddForm.get("paymentTerm").setValue('');
    this.PurcahseRequestAddForm.get("deliveryPeriod").setValue(0);
    this.PurcahseRequestAddForm.get("requestedBy").setValue('');
    this.PurcahseRequestAddForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.PurcahseRequestAddForm.get("deliveryTime").setValue(0);
    this.PurcahseRequestAddForm.get("origin").setValue('');
    this.PurcahseRequestAddForm.get("packing").setValue('');
    this.PurcahseRequestAddForm.get("requestType").setValue(0);
    this.PurcahseRequestAddForm.get("requestPurModelList").setValue([]);
    this.PurcahseRequestAddForm.get("costCenterTranModelList").setValue([]);
    this.PurcahseRequestAddForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.accVouchersDTsList = [];
    this.calculateSum();

  }

  CopyRow(row, index) {
                 
    let inds = 0;
    if (this.accVouchersDTsList.length == 1) {
      inds = 1;
    }
    else {
      inds = this.accVouchersDTsList.length;
    }
    if (this.allowAccRepeat == 61) {
      this.accVouchersDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: 0,
          unitId: 0,
          qty: row.qty,
          price: row.price,
          total: row.total,
          storeId: row.storeId,
          costCenterId: row.costCenterId,
          bonus: row.bonus,
          bonusUnitId: row.bonusUnitId,
          index: ""
        });
      this.PurcahseRequestAddForm.get("requestPurModelList").setValue(this.accVouchersDTsList);
    }
    else {
      this.accVouchersDTsList.push(
        {
          id: 0,
          hDId: 0,
          itemId: row.itemId,
          unitId: row.unitId,
          qty: row.qty,
          price: row.price,
          total: row.total,
          storeId: row.storeId,
          costCenterId: row.costCenterId,
          bonus: row.bonus,
          bonusUnitId: row.bonusUnitId,
          index: ""
        });
      this.PurcahseRequestAddForm.get("requestPurModelList").setValue(this.accVouchersDTsList);
    }

    setTimeout(() => {
      this.purService.GetItemUintbyItemId(row.itemId).subscribe(res => {
        this.unitsList[inds] = res;
      });
    });
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {

    if (event.key === 'F4') {
      this.CopyRow(row, index);
    }
  }

  loadLazyOptions(event: any) {
      debugger           
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
