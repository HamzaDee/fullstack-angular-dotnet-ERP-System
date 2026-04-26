import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from "@angular/common/http";
import { delay } from 'rxjs/operators';
import { identity, of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { InvVoucherService } from '../../app-inventoryService.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { OutputService } from '../outputh.service';
import { ItemdetailsComponent } from 'app/views/general/app-itemsDetails/itemdetails.component';
import { AppCarsDetailsComponent } from 'app/views/general/app-cars-details/app-cars-details.component';

interface OutputVoucherForm {
  id: number;
  companyId: number;
  voucherTypeId: number;
  voucherTypeEnum: number;
  referenceNo: string;
  bookNo: string;
  deliveredTo: string;
  storeId: number;
  voucherNo: string;
  voucherDate: string;
  donateType: number;
  outStoreId: number;
  purchaseOrderId: number;
  supplyType: string;
  bonusType: string;
  caravanNo: string;
  note: string;
  projectId: number;
  status: number;
  amount: number;
  toStoreId: number;
  dealerId: number;
  userId:number;
  isCanceled: boolean;
  isPosted: boolean;
  referenceDate: string;
  transportationNo: string;
  authorityId: number;
  beneficiaryId: number;
  deliveryMethod: any; // keep flexible for now
  countryId: number;
  beneficiaryClass: number;
  invVouchersDTModelList: any;
  invDTItemsDtlModels: any;
  invCustomsModels: any;
  generalAttachModelList: any;
  projectInvCars: any;
}


@Component({
  selector: 'app-outputvoucherhform',
  templateUrl: './outputvoucherhform.component.html',
  styleUrl: './outputvoucherhform.component.scss'
})
export class OutputvoucherhformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment!: AppGeneralAttachmentComponent;
  OutputVoucherAddForm!: FormGroup<{
  [K in keyof OutputVoucherForm]: any;}>;
  public TitlePage!: string;
  tabelData!: any[];
  loading!: boolean;
  opType!: string;
  invDtlList: any[] = [];
  invCustomsModels: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo!: string;
  voucherId: any;
  entryItemsInfo: any[] = []
  voucherTypeList: any;
  authoritiesDonorList: any;
  storesList: any;
  donationTypesList: any;
  unitsList: Array<any> = [];
  itemsList: any;
  purchaseOrdersList: any;
  inVouchersList: Array<any> = [];
  inVouchersListAll: any;
  itemssList: Array<any> = [];
  allUntiesList: any;
  suppliersList: any;
  currencyList: any;
  customsList: any;
  beneficiaryList: any;
  isdisabled: boolean = false;
  showsave!: boolean;
  storeId: any;
  voucherTypeEnum = 34;
  remainingQty: any;
  inputRemainingQty!: number;
  showRemainQty!: boolean;
  showInputRemainQty!: boolean;
  decimalPlaces!: number;
  disableAll: boolean = false;
  // General Inventory Settings
  costingMethod!: number;
  defaultStoreId!: number;
  inventoryType!: number;
  useAccountInGrid!: boolean;
  useBatch!: boolean;
  useCostCenter!: boolean;
  useExpiryDate!: boolean;
  useProductDate!: boolean;
  useSerial!: boolean;
  useStoreInGrid!: boolean;
  itemsDetailsLists: any;
  //End
  allowAccRepeat: any;
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  disableSave!: boolean;
  Lang!: string;
  disapleVoucherType: boolean = false;
  voucherType: any;
  NewDate: Date = new Date;
  SuppliersName!: string;
  oldStoreId: any;
  projectsList: any;
  AuthorityList: any;
  BeneficiarysList: any;
  deliveryMethodList: any;
  countriesList: any;
  authList: any;
  beneficiaryClassificationList: any;
  countryName!: string;
  identity: any;
  DefaultStoreId!: number;
  projectInvCars: any;
  isSpecial = false;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private alert: sweetalert,
      private serv: OutputService,
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
      this.router.navigate(['OutputVoucherH/OutputvoucherhList']);
    }

    this.InitiailEntryVoucherForm();
    this.GetInitailEntryVoucher();
    this.SetTitlePage();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ExitDocument');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
  this.OutputVoucherAddForm = this.formbulider.group({
    id: [0],
    companyId: [0],
    voucherTypeId: [0, [Validators.required, Validators.min(1)]],
    voucherTypeEnum: [0],
    referenceNo: [''],
    bookNo: [''],
    deliveredTo: [''],
    storeId: [0],
    voucherNo: ['', Validators.required],
    voucherDate: ['', Validators.required],
    donateType: [0],
    outStoreId: [0],
    purchaseOrderId: [0],
    supplyType: [''],
    bonusType: [''],
    caravanNo: [''],
    note: [''],
    projectId: [0],
    status: [0],
    amount: [0],
    toStoreId: [0],
    dealerId: [0],
    isCanceled: [false],
    isPosted: [false],
    referenceDate: [''],
    transportationNo: [''],
    authorityId: [0],
    beneficiaryId: [0],
    deliveryMethod: [''],
    countryId: [0],
    userId:[0],
    beneficiaryClass: [0],
    invVouchersDTModelList: [null],
    invDTItemsDtlModels: [null],
    invCustomsModels: [null],
    generalAttachModelList: [null],
    projectInvCars: [null],
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
    
    const lang = this.jwtAuth.getLang();

    this.serv.GetInitailoutputVoucher(Number(this.voucherId), this.opType, this.voucherTypeEnum)
      .subscribe(result => {
      debugger

        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['OutputVoucherH/OutputvoucherhList']);
          return;
        }

        // Dates
        if (this.opType == 'Copy') {
          const currentDate = new Date().toISOString().split('T')[0];
          result.voucherDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
          result.referenceDate = formatDate(currentDate, "yyyy-MM-dd", "en-US");
        } else {
          result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US");
          result.referenceDate = formatDate(result.referenceDate, "yyyy-MM-dd", "en-US");
        }

        this.voucherTypeList = result.voucherTypeList.map((item:any) => ({
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

        this.itemsList = result.itemsList.map((item:any) => ({
          id: item.id,
          text: item.text,
          storeId: item.storeId,
          hasExpiry: item.hasExpiry,
          hasSerial: item.hasSerial
        }));

        this.oldStoreId = 0;
        this.BeneficiarysList = result.beneficiarysList;
        this.storesList = result.storesList;
        this.allUntiesList = result.unitsList;
        this.customsList = result.customsList;
        this.beneficiaryList = result.beneficiaryList;
        this.currencyList = result.currencyList;
        this.AuthorityList = result.authoritiesList;
        // this.decimalPlaces = result.currencyList.find(option => option.id === 1)?.data2;
        this.decimalPlaces = result.currencyList.find((option: any) => option.id === 1)?.data2;
        this.suppliersList = result.suppliersList;
        this.tabelData = [];
        this.authoritiesDonorList = result.authoritiesDonorList;
        this.donationTypesList = result.donationTypesList;
        this.purchaseOrdersList = result.purchaseOrdersList;
        this.inVouchersListAll = result.inVouchersList;

        // ✅ مهم جداً للدروب داون
        this.projectsList = result.projectsList;

        this.deliveryMethodList = result.deliveryMethodList;
        this.authList = result.autsList;
        this.beneficiaryClassificationList = result.beneficiaryClassificationList;
        this.countriesList = result.countriesList;

        if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
          this.OutputVoucherAddForm.controls.generalAttachModelList.setValue(result.generalAttachModelList);
          // this.OutputVoucherAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
          this.childAttachment.data = result.generalAttachModelList;
          this.childAttachment.ngOnInit();
        }

        if (result.invDTItemsDtlModels !== null && result.invDTItemsDtlModels !== undefined && result.invDTItemsDtlModels.length > 0) {
          this.OutputVoucherAddForm.controls.invDTItemsDtlModels.setValue(result.invDTItemsDtlModels);
          // this.OutputVoucherAddForm.get("invDTItemsDtlModels").setValue(result.invDTItemsDtlModels);
        }

        if (result.invCustomsModels !== null && result.invCustomsModels !== undefined && result.invCustomsModels.length > 0) {
          this.invCustomsModels = result.invCustomsModels;
          this.OutputVoucherAddForm.controls.invCustomsModels.setValue(result.invCustomsModels);
          // this.OutputVoucherAddForm.get("invCustomsModels").setValue(result.invCustomsModels);
        }

        this.remainingQty = 0;
        this.OutputVoucherAddForm.patchValue(result);
        this.projectInvCars = result.projectInvCars ?? [];
        if (result.invVouchersDTModelList !== undefined && result.invVouchersDTModelList !== null) {
           ;
          this.invDtlList = result.invVouchersDTModelList;

          for (let i = 0; i < this.invDtlList.length; i++) {
            const row = this.invDtlList[i];

            //  فلترة سندات الإدخال حسب مشروع السطر
            if (row.projectId > 0) {
              this.inVouchersList[i] = this.inVouchersListAll.filter((v:any) => v.data1 === row.projectId.toString());
            } else {
              this.inVouchersList[i] = [];
            }


            if (row.refId > 0) {
              this.onChangeVoucher(row.refId, row, i, 0);
            }
          }


          let index = 0;
          this.invDtlList.forEach(element => {
            if (element.refId > 0) {
              this.itemssList[index] = this.onChangeVoucher(element.refId, this.invDtlList[index], index, 0);
            }
            index++;
          });

          index = 0;
          setTimeout(() => {
            index = 0;
            this.invDtlList.forEach(element => {
              element.total = element.qty * element.price;
            });

            if (this.opType == "Copy") {
              this.invDtlList.forEach(element => {
                element.qty = 0;
                element.batchNo = null;
                element.expiryDate = null;
                element.id = 0;
              });
            } else {
              this.invDtlList.forEach(element => {
                this.itemsList.forEach((item:any)  => {
                  if (item.id === element.itemId) {
                    this.unitsList[index] = this.allUntiesList.filter((unit :any) => unit.id == element.unitId);
                    this.invDtlList[index].expiryDate = formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                    this.invDtlList[index].productDate = formatDate(element.productDate, "yyyy-MM-dd", "en-US");
                    this.invDtlList[index].batchNo = element.batchNo;
                    this.invDtlList[index].newRow = 1;
                    index++;
                  }
                });
              });
            }
          });

          for (let i = 0; i < this.invDtlList.length; i++) {
            this.onChangeItem(0, this.invDtlList[i], i, 0);
            this.OnPriceBlur(this.invDtlList[i]);
          }

          index = 0;
          this.invDtlList.forEach(element => {
            this.itemsList.forEach((item:any) => {
              if (item.id === element.itemId) {
                this.unitsList[index] = this.allUntiesList.filter((unit:any) => unit.id == element.unitId);
                index++;
              }
            });
          });

        } else {
          this.invDtlList = [];
        }

         ;
        for (let i = 0; i < this.invDtlList.length; i++) {
          this.OnPriceBlur(this.invDtlList[i]);
        }

        if (this.opType == 'Edit') {
          this.disapleVoucherType = true;
        }
debugger
        // =========================
        // تأخير بسيط لإتاحة الربط بالـ UI
        // =========================
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          debugger
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

          // if (this.useAccountInGrid == true) {
          //   this.invDtlList.forEach(element => {
          //     element.debitAccountId = this.OutputVoucherAddForm.value.accountId;
          //   });
          // }

          if (this.voucherId > 0) {
            if (result.dealerId !== null && result.dealerId !== undefined) {
              this.OutputVoucherAddForm.controls.dealerId.setValue(result.dealerId);
              // this.OutputVoucherAddForm.get("dealerId").setValue(result.dealerId);
            }
            this.OutputVoucherAddForm.controls.voucherTypeId.setValue(result.voucherTypeId);
            // this.OutputVoucherAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
            this.OutputVoucherAddForm.controls.storeId.setValue(result.storeId);
            // this.OutputVoucherAddForm.get("storeId").setValue(result.storeId);
            this.OutputVoucherAddForm.controls.deliveredTo.setValue(result.deliveredTo);
            // this.OutputVoucherAddForm.get("deliveredTo").setValue(result.deliveredTo);
            this.OutputVoucherAddForm.controls.note.setValue(result.note);
            // this.OutputVoucherAddForm.get("note").setValue(result.note);
            this.OutputVoucherAddForm.controls.deliveryMethod.setValue(result.deliveryMethod);
            // this.OutputVoucherAddForm.get("deliveryMethod").setValue(result.deliveryMethod);

           if (result.deliveryMethod) 
          {
            debugger
              const methods = result.deliveryMethod.split(',').map((x: any) => +x);
              this.isSpecial = result.deliveryMethod.includes(6803) || result.deliveryMethod.includes(6809);
              this.OutputVoucherAddForm.controls.deliveryMethod.setValue(methods);
              // this.OutputVoucherAddForm.get("deliveryMethod").setValue(methods);
            }


            // ❌ لا تعمل setValue(result.projectId) هون لأنه بخرّب القيمة الصح
            // this.OutputVoucherAddForm.get("projectId").setValue(result.projectId);

            this.ConvertIdsToNumber(result);

          } else {
            this.DefaultStoreId = result.defaultStoreId;

            if (this.DefaultStoreId > 0 && this.DefaultStoreId != undefined && this.DefaultStoreId != null) {
              this.OutputVoucherAddForm.controls.storeId.setValue(this.DefaultStoreId);
              // this.OutputVoucherAddForm.get("storeId").setValue(this.DefaultStoreId);
            } else {
              this.OutputVoucherAddForm.controls.storeId.setValue(0);
              // this.OutputVoucherAddForm.get("storeId").setValue(0);
            }
            this.OutputVoucherAddForm.controls.toStoreId.setValue(0);
            // this.OutputVoucherAddForm.get("toStoreId")!.setValue(0);
            this.OutputVoucherAddForm.controls.authorityId.setValue(0);
            // this.OutputVoucherAddForm.get("authorityId").setValue(0);
            this.OutputVoucherAddForm.controls.deliveredTo.setValue(0);
            // this.OutputVoucherAddForm.get("deliveredTo").setValue(0);
            this.OutputVoucherAddForm.controls.outStoreId.setValue(0);
            // this.OutputVoucherAddForm.get("outStoreId").setValue(0);
            this.OutputVoucherAddForm.controls.purchaseOrderId.setValue(0);
            // this.OutputVoucherAddForm.get("purchaseOrderId").setValue(0);
            this.OutputVoucherAddForm.controls.projectId.setValue(0);
            // this.OutputVoucherAddForm.get("projectId").setValue(0);
            this.OutputVoucherAddForm.controls.voucherTypeId.setValue(0);
            // this.OutputVoucherAddForm.get("voucherTypeId").setValue(0);//255
            this.OutputVoucherAddForm.controls.donateType.setValue(0);
            // this.OutputVoucherAddForm.get("donateType").setValue(0);
            this.OutputVoucherAddForm.controls.dealerId.setValue(0);
            // this.OutputVoucherAddForm.get("dealerId").setValue(0);
            this.OutputVoucherAddForm.controls.countryId.setValue(0);
            // this.OutputVoucherAddForm.get("countryId").setValue(0);
          }
            for (let i = 0; i < this.invDtlList.length; i++) {
              this.OnPriceBlur(this.invDtlList[i]);
            }
        });
      });
  }

  onBeneficiaryClassChange(event: any) {
    const selectedValue = event.value;


    // إذا لم تكن الفئة 6814 → إلغاء تحديد المستفيد
    if (selectedValue !== 6814) {
      this.OutputVoucherAddForm.controls.beneficiaryId.setValue(null);
      // this.OutputVoucherAddForm.get('beneficiaryId')?.setValue(null);
    }
  }

  onChangeItem(event :any, Row :any, i : number, check: number) {
     debugger
    let selectedOption: any;
    if (event.value != null && event.value != undefined && event.value != "") {
      selectedOption = this.itemssList[i]?.find((x:any) => x.text === event.value);
    }
    else {
      let itemName = this.itemsList.find((option:any) => option.id === Row.itemId).text
      let unitName = this.allUntiesList.find((option:any) => option.id === Row.unitId)?.text || '';
      let Item = itemName + "-" + unitName;
      selectedOption = this.itemssList[i]?.find((x:any) => x.text === Item);
      Row.itemName = Item;
      this.serv.GetItemUintbyItemId(Row.itemId).subscribe(res => {
         
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
    if (this.opType == 'Add') {
      const eventValue = selectedOption == null ? Row.itemId : selectedOption.id;
      Row.itemId = selectedOption == null ? Row.itemId : selectedOption.id;
      if (eventValue === 0) {
        if (Row.itemId == 0 || Row.itemId == null) {
          this.unitsList[i] = [];
        }
        if (Row.itemId !== 0 && Row.itemId !== null) {
          this.serv.GetItemUintbyItemId(Row.itemId).subscribe(res => {
             
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
        if (Row.itemId !== 0 && Row.itemId !== null) {
          this.invDtlList[i].qty = "";
          this.invDtlList[i].total = 0;
          this.invDtlList[i].price = "";
          this.invDtlList[i].expiryDate = null;
          this.invDtlList[i].unitId = 0;
          this.invDtlList[i].unitRate = 0;
          this.invDtlList[i].id = 0;
          this.invDtlList[i].hDId = 0;
           
          if (this.entryItemsInfo.length > 0) {
            if (this.entryItemsInfo[i].length > 0) {
               
              //let selectedUnitId = this.entryItemsInfo[i][this.identity- 1].unitId;
              //let element = this.entryItemsInfo[i].find(r => r.itemId == eventValue && r.unitId == selectedUnitId)
              let element = this.entryItemsInfo[i].find((r:any) => r.itemId == eventValue && r.unitId == selectedOption.unitId)
              if (element != null && element != undefined) {
                this.invDtlList[i].itemId = selectedOption.id;
                this.invDtlList[i].unitId = selectedOption.unitId;// element.unitId;
                this.invDtlList[i].unitRate = element.unitRate;
                this.invDtlList[i].qty = 0;//element.qty;
                this.invDtlList[i].expiryDate = element.expiryDate == null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[i].price = element.price;
                this.invDtlList[i].pallets = element.pallets;
                this.invDtlList[i].weight = element.weight;
                this.invDtlList[i].mainQty = element.mainQty;
                this.OnPriceBlur(this.invDtlList[i]);
              }
            }
          }

          if (eventValue !== 0) {
            this.serv.GetItemUintbyItemId(eventValue).subscribe(res => {
               
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
       debugger
      if (check == 1) {
        this.serv.GetCurrentQty(eventValue, Row.storeId).subscribe(res => {
           debugger
          if (res == 0) {
            Row.availableQty = this.formatCurrency(res / Row.unitRate);
            this.showRemainQty = true;
            this.showInputRemainQty = false;
            this.invDtlList[i].qty = 0;
            this.cdr.detectChanges();
            this.hideLabelAfterDelay();
            return;
          }
          else if (this.invDtlList[i].qty > res) {
            Row.availableQty = this.formatCurrency(res / Row.unitRate);
            this.inputRemainingQty = this.invDtlList[i].mainQty;
            this.showRemainQty = true;
            this.showInputRemainQty = true;
            this.invDtlList[i].qty = this.invDtlList[i].mainQty;
            this.alert.ShowAlert("quantityNotEnough", "error")
            this.cdr.detectChanges();
            this.hideLabelAfterDelay();
            return;
          }
          else {
            Row.availableQty = this.formatCurrency(res / Row.unitRate);
            this.remainingQty = this.formatCurrency(res / Row.unitRate);
            this.showRemainQty = true;
            this.hideLabelAfterDelay();
            return;
          }
        })
      }
    }
    else
      {
        debugger
          Row.itemId = selectedOption == null ? Row.itemId : selectedOption.id;
         if (Row.itemId == 0 || Row.itemId == null) {
          this.unitsList[i] = [];
        }
        if (Row.itemId !== 0 && Row.itemId !== null) {
          this.invDtlList[i].itemId = Row.itemId;

          if (this.entryItemsInfo.length > 0) {
            if (this.entryItemsInfo[i].length > 0) {
              let element = this.entryItemsInfo[i].find((r:any) => r.itemId == Row.itemId && r.unitId == selectedOption.unitId)
              if (element != null && element != undefined) {
                this.invDtlList[i].itemId = selectedOption.id;
                this.invDtlList[i].unitId = selectedOption.unitId;
                this.invDtlList[i].unitRate = element.unitRate;
                this.invDtlList[i].expiryDate = element.expiryDate == null ? null : formatDate(element.expiryDate, "yyyy-MM-dd", "en-US");
                this.invDtlList[i].price = element.price;
                this.invDtlList[i].pallets = element.pallets;
                this.invDtlList[i].weight = element.weight;
                this.invDtlList[i].mainQty = element.mainQty;
                this.OnPriceBlur(this.invDtlList[i]);
              }
            }
          }

          if (Row.itemId !== 0) {
            this.serv.GetItemUintbyItemId(Row.itemId).subscribe(res => {
               
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

        for (let i = 0; i < this.invDtlList.length; i++) {
          let row = this.invDtlList[i]
           this.serv.GetCurrentQty(row.itemId, row.storeId).subscribe(res => {
            debugger
            if (res > 0) {
              row.mainQty = this.formatCurrency(res / row.unitRate);
              row.availableQty = this.formatCurrency(res / row.unitRate);
            }          
          })
        }
       
      }




    for (let i = 0; i < this.invDtlList.length; i++) {
      const row = this.invDtlList[i];

      if (row.itemId > 0) {
        const item = this.itemsList.find((x:any) => x.id == row.itemId);

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

  onChangeVoucher(RefId :any, invdt :any, i :any, type: number) {
     debugger
    if (type == 1) {
      if (RefId > 0) {
        this.itemssList[i] = [];
        this.entryItemsInfo[i] = [];
        this.invDtlList[i].autority = '';
        this.invDtlList[i].itemId = 0;
        this.invDtlList[i].unitId = 0;
        this.invDtlList[i].unitRate = 0;
        this.invDtlList[i].qty = 0;
        this.invDtlList[i].price = 0;
        this.invDtlList[i].total = 0;
        this.invDtlList[i].pallets = 0;
        this.invDtlList[i].weight = 0;
        this.invDtlList[i].autority = '';
        this.invDtlList[i].mainQty = 0;
        this.invDtlList[i].notes = '';
        this.cdr.detectChanges();
        this.serv.GetInputItems(RefId).subscribe(res => {
           debugger
          this.itemssList[i] = res.inputItemsList;
          this.entryItemsInfo[i] = res.entryitemslList;
          this.entryItemsInfo[i].forEach((item: any, index: number) => {
             
            item.identity = index + 1;
            this.identity = item.identity;
          });
          this.invDtlList[i].autority = res.inputItemsList[1]?.data1 ?? '';
          this.invDtlList[i].storeId = this.entryItemsInfo[i][0].storeId
        });
      }
      else {
        this.itemssList[i] = [];
        this.entryItemsInfo[i] = [];
        this.invDtlList[i].autority = '';
        this.invDtlList[i].itemId = 0;
        this.invDtlList[i].unitId = 0;
        this.invDtlList[i].unitRate = 0;
        this.invDtlList[i].qty = 0;
        this.invDtlList[i].price = 0;
        this.invDtlList[i].total = 0;
        this.invDtlList[i].pallets = 0;
        this.invDtlList[i].weight = 0;
        this.invDtlList[i].autority = '';
        this.invDtlList[i].notes = '';
        this.cdr.detectChanges();
      }
    }
    else {
      if (RefId > 0) {
        this.serv.GetInputItems(RefId).subscribe(res => {
           
          this.itemssList[i] = res.inputItemsList;
          this.entryItemsInfo[i] = res.entryitemslList;
          this.invDtlList[i].autority = res.inputItemsList[1]?.data1 ?? '';
        });
      }
    }
  }

  onChangeUnit(Row :any, i :number, type:any) {
    if (type == true) {
      this.invDtlList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.InvService.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.invDtlList[i].unitRate = res;

        this.updateAvailableQty(this.invDtlList[i]);
      });
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

  OnSaveForms() {
     
    if (this.checkValidation() == false) {
      return;
    }
    if (
      this.OutputVoucherAddForm.get('beneficiaryClass')?.value == 6815 && this.OutputVoucherAddForm.get('deliveredTo')?.value == 0) {
      this.alert.ShowAlert("PleaseEnterTheBeneficiary", "error");
      return;
    }

    if (this.OutputVoucherAddForm.value.toStoreId > 0) {
      this.OutputVoucherAddForm.controls.voucherTypeEnum.setValue(36);
      // this.OutputVoucherAddForm.get("voucherTypeEnum").setValue(36);
      this.voucherTypeEnum = 36;
    }
    this.OutputVoucherAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.OutputVoucherAddForm.value.userId = this.jwtAuth.getUserId();
    this.OutputVoucherAddForm.value.voucherNo = this.OutputVoucherAddForm.value.voucherNo.toString();
    this.OutputVoucherAddForm.value.invVouchersDTModelList = this.invDtlList;
    this.OutputVoucherAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    this.OutputVoucherAddForm.value.amount = this.calculateSum();
    this.ConvertIdsToString();
    debugger
    if (this.projectInvCars?.length > 0) {
      for (const c of this.projectInvCars) {
        if (!c.itemDTId || c.itemDTId === 0) {
          this.alert.ShowAlert("PleaseSelectItemForCarRow", "error");
          return;
        }
        if (!c.driverName || c.driverName.trim() === "") {
          this.alert.ShowAlert("PleaseInsertDriverName", "error");
          return;
        }
      }
    }
    this.serv.SaveOutputVoucher(this.OutputVoucherAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();

           
          let PrintAfterSave = this.voucherTypeList.find((option:any) => option.label === this.OutputVoucherAddForm.value.voucherTypeId)?.printAfterSave || false;
          // if (PrintAfterSave == true) {
          //   this.PrintEntryVoucher(Number(result.message));
          // }

          // this.ClearAfterSave();
          if (this.opType == 'Edit' || this.opType == 'Copy') {
            this.router.navigate(['OutputVoucherH/OutputvoucherhList']);
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

  calculateSum() {
    return this.formatCurrency(this.invDtlList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  checkValidation(): boolean {
    let stopExt = false;
    if (this.invDtlList.length == 0 || this.invDtlList == null || this.invDtlList == undefined) {
      stopExt = true;
    }
    if (this.invDtlList.length > 0) {
      this.invDtlList.forEach(element => {
        if (element.itemId == 0 || element.itemId == null || element.itemId == undefined || element.itemId == 0) {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.unitId == 0 || element.unitId == null || element.unitId == undefined || element.unitId == 0) {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.qty == null || element.qty == undefined || element.qty == '' || element.qty == 0) {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.price == null || element.price == undefined || element.price == '' || element.price == 0) {
          this.alert.ShowAlert("PleaseInsertRequierdDataForVoucherDetailsTable", 'error');
          stopExt = true;
        }
        if (element.total == null || element.total == undefined || element.total == '' || element.total == 0) {
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
    return !stopExt;
  }

  isEmpty(input:any) {
    return input === '' || input === null;
  }

  isValidVoucherDate(event:any) {
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
     ;
    if (this.disableAll) return;
    // if (this.OutputVoucherAddForm.value.projectId == 0) {
    //   this.alert.ShowAlert("PleaseSelectProjectToAdd", 'error');
    //   return;
    // }
    // if (this.OutputVoucherAddForm.value.storeId == 0) {
    //   this.alert.ShowAlert("PleaseEnterStoreToAdd", 'error');
    //   return;
    // }
    const newLine = {
      id: 0,
      hDId: 0,
      refId: 0,
      storeId:0,
      itemId: 0,
      itemName: '',
      unitId: 0,
      unitRate: 0,
      qty: "",
      price: "",
      total: 0,
      pallets: 0,
      weight: 0,
      autority: '',
      isValid: false,
      mainQty: 0,
      notes: '',
      projectId: 0,
      availableQty: 0,
      isPackage: false,
      index: this.invDtlList.length,
    };

    // Create a new array reference to trigger change detection
    this.invDtlList = [...this.invDtlList, newLine];

    // Only do this if invVouchersDTModelList is needed for saving
    this.OutputVoucherAddForm.get("invVouchersDTModelList")?.setValue(this.invDtlList);
  }

  OpenItemDetails(row: any, rowIndex: number) {
     
    row.firstOpen = row.firstOpen ?? true
    if (this.OutputVoucherAddForm.value.invDTItemsDtlModels === null) {
      this.OutputVoucherAddForm.controls.invDTItemsDtlModels.setValue([]);
      // this.OutputVoucherAddForm.get("invDTItemsDtlModels").setValue([]);
    }
    this.itemsDetailsLists = this.OutputVoucherAddForm.value.invDTItemsDtlModels.filter((item:any) => item.itemDTId == row.itemId && item.index == rowIndex);
    let itemName = this.itemsList.find((option:any) => option.id === row.itemId).text;
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
          row.res = res;
          let newList = this.OutputVoucherAddForm.value.invDTItemsDtlModels.filter((item:any) => item.index !== rowIndex);
          newList = [...newList, ...res];
          this.OutputVoucherAddForm.controls.invDTItemsDtlModels.setValue(newList);
          // this.OutputVoucherAddForm.get("invDTItemsDtlModels").setValue(newList);
          row.firstOpen = false;
        }
      })

  }

  PrintOutputVoucher(voucherId: number, voucherTypeId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (voucherTypeId == 11) {
      const reportUrl = `RptPaymentOutputVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else if (voucherTypeId == 13) {
      const reportUrl = `RptDamageStockOutPutVouchert?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else if (voucherTypeId == 14) {
      const reportUrl = `RptGiftOutputVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else if (voucherTypeId == 15) {
      const reportUrl = `RptRecyclingOutputVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else if (voucherTypeId == 16) {
      const reportUrl = `RptInternalSupplyVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
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
        this.serv.DeleteInvVoucher(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['InventoryVouchers/OutputVoucherList']);
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

  ApproveVoucher(id: any) {
     
    if (id != null && id != undefined && id != 0) {
      this.serv.ApproveInvVoucher(id).subscribe((result) => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['OutputVoucherH/OutputvoucherhList']);
          return;
        }
        if (result.isSuccess) {
          this.alert.ShowAlert("RequestApproved", "success");
          this.router.navigate(['OutputVoucherH/OutputvoucherhList']);
        }
        else {
          this.alert.SaveFaild();
        }
      });
    }
  }

  onStoreChange(event: any, row: any, index: number) {
     
    if (event.value == this.OutputVoucherAddForm.value.toStoreId) {
      this.OutputVoucherAddForm.controls.storeId.setValue(0);
      // this.OutputVoucherAddForm.get("storeId").setValue(0);
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
          this.OutputVoucherAddForm.controls.invVouchersDTModelList.setValue(this.invDtlList);
          // this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          this.OutputVoucherAddForm.controls.storeId.setValue(this.oldStoreId);
          // this.OutputVoucherAddForm.get("storeId").setValue(this.oldStoreId);
        }
      })
    }
    else {
      this.oldStoreId = event.value;
    }


  }

  onStoreChange1(event: any, row: any, index: number) {
     
    if (event.value == this.OutputVoucherAddForm.value.storeId) {
      this.OutputVoucherAddForm.controls.toStoreId.setValue(0);
      // this.OutputVoucherAddForm.get("toStoreId").setValue(0);
      this.alert.ShowAlert("msgCantTransferSameStore", 'error');
      return;
    }
  }

  toggleIncludeCost(event:any, index :number) {
    this.invDtlList[index].isValid = event.currentTarget.checked;
  }

  OnBlurChange(event: any, row: any, Index: number) {
     debugger
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
      diffitemQty = row.mainQty - row.qty;
    }
    if (diffitemQty < 0)
      return;
     
    let itemQty = this.invDtlList.filter(item => item.index !== Index).reduce((sum, item) => sum + item.qty, 0);

    this.serv.GetCurrentQty(row.itemId, row.storeId).subscribe(res => {
       debugger
      if (res == 0) {
        this.remainingQty = res / row.unitRate;
        this.showRemainQty = true;
        row.qty = 0;
        this.cdr.detectChanges();
        this.hideLabelAfterDelay();
        return;
      }
      else if (row.qty > res) {
        this.remainingQty = this.formatCurrency(res / row.unitRate);
        this.inputRemainingQty = row.mainQty;
        this.showRemainQty = true;
        this.showInputRemainQty = true;
        row.qty = row.mainQty;
        this.alert.ShowAlert("quantityNotEnough", "error")
        this.cdr.detectChanges();
        this.hideLabelAfterDelay();
        return;
      }
      else if (row.qty > row.mainQty) {
        this.inputRemainingQty = row.mainQty;
        this.showInputRemainQty = true;
        row.qty = row.mainQty;
        this.alert.ShowAlert("QuantityIsMoreThanMainQtyForChoosenInputVoucher", "error")
        this.cdr.detectChanges();
        this.hideLabelAfterDelay();
        return;
      }
      else {
        this.remainingQty = this.formatCurrency(res / row.unitRate);
        this.showRemainQty = true;
        this.hideLabelAfterDelay();
        return;
      }
    });

    this.OnPriceChange(row);
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
      this.showInputRemainQty = false;
    }, 3500);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.invDtlList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.OutputVoucherAddForm.controls.invVouchersDTModelList.setValue(this.invDtlList);
    // this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
  }

  ClearData() {
     
    this.childAttachment.data = [];
    this.invDtlList = [];
    this.OutputVoucherAddForm.controls.invCustomsModels.setValue([]);
    // this.OutputVoucherAddForm.get("invCustomsModels").setValue([]);
    this.OutputVoucherAddForm.controls.invDTItemsDtlModels.setValue([]);
    // this.OutputVoucherAddForm.get("invDTItemsDtlModels").setValue([]);
    this.OutputVoucherAddForm.controls.invVouchersDTModelList.setValue([]);
    // this.OutputVoucherAddForm.get("invVouchersDTModelList").setValue(this.invDtlList);
    this.OutputVoucherAddForm.controls.generalAttachModelList.setValue([]);
    // this.OutputVoucherAddForm.get("generalAttachModelList").setValue([]);
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

  ConvertIdsToString() {
     
    let org = this.OutputVoucherAddForm.value.deliveryMethod;
    if (Array.isArray(org)) {
      let validOrgs = org
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let OrgsString = validOrgs.join(',');
      this.OutputVoucherAddForm.controls.deliveryMethod.setValue(OrgsString);
      // this.OutputVoucherAddForm.get("deliveryMethod").setValue(OrgsString);
      console.log('Filtered paymentMethod:', OrgsString);
    } else {
      console.error('deliveryMethod is not an array');
    }
  }

  ConvertIdsToNumber(data:any) {
     
    if (data.deliveryMethod != null && data.deliveryMethod != undefined && data.deliveryMethod != "" && data.deliveryMethod != "0") {
      let org = data.deliveryMethod.split(',').map(Number)
      this.OutputVoucherAddForm.controls.deliveryMethod.setValue(org);
      // this.OutputVoucherAddForm.get("deliveryMethod").setValue(org);
    }
    else {
      this.OutputVoucherAddForm.controls.deliveryMethod.setValue("");
      // this.OutputVoucherAddForm.get("deliveryMethod").setValue("");
    }


  }

  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authList) {
      this.authList = [];
    }

    // Make sure the array is large enough
    while (this.authList.length < last) {
      this.authList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authList[i] = this.authList[i];
    }

    this.loading = false;
  }

  /*   isRequierdEx(row: any, index: number) {
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
  
    } */


  isRequierdEx(row: any, index: number) {

    const itemId = row.itemId;

    if (!itemId || !this.itemsList || this.itemsList.length === 0) {
      return false;
    }

    const item = this.itemsList.find((x:any) => Number(x.id) === Number(itemId));

    if (!item) {
      return false;
    }

    if (item.hasExpiry === true) {
      return !this.invDtlList[index].expiryDate;
    }

    return false;
  }

  GetAuth(projectId: any, invdt:any, i: any) {
     debugger
    if (projectId > 0) {
      this.inVouchersList[i] = this.inVouchersListAll.filter(c => c.data1 === projectId.toString());
      let authName = "";
      const auth = this.projectsList.find((r:any) => r.id == projectId)?.data1 ?? 0;
      if (auth != "" && auth != null && auth != undefined) {
        //this.OutputVoucherAddForm.get("authorityId").setValue(Number(auth));
        //this.countryName = this.authoritiesDonorList.find(r => r.id == Number(auth))?.data1 ?? "";
        //authName = this.authoritiesDonorList.find(r => r.id == Number(auth))?.text ?? "";
      }
      else {
        this.OutputVoucherAddForm.controls.authorityId.setValue(0);
        // this.OutputVoucherAddForm.get("authorityId").setValue(0);
        this.countryName = "";
      }
      const benClass = this.projectsList.find(r => r.id == projectId)?.data2 ?? 0;
      if (benClass != "" && benClass != null && benClass != undefined) {
        this.OutputVoucherAddForm.controls.beneficiaryClass.setValue(Number(benClass));
        // this.OutputVoucherAddForm.get("beneficiaryClass").setValue(Number(benClass));
      }
    }
    else {
      this.OutputVoucherAddForm.controls.authorityId.setValue(0);
      // this.OutputVoucherAddForm.get("authorityId").setValue(0);
      this.countryName = "";
    }
    // const auth = this.projectsList.find(r => r.id == projectId)?.data1 ?? 0;
    // if(auth != "" && auth != null && auth != undefined)
    //   {
    //     this.OutputVoucherAddForm.get("authorityId").setValue(Number(auth));
    //     this.countryName = this.authoritiesDonorList.find(r => r.id == Number(auth))?.data1 ?? "";
    //   }

  }

  GetCountry(AuthId: any) {
     
    if (AuthId > 0) {
      let countryId = this.authoritiesDonorList.find(r => r.id == AuthId)?.data2 ?? 0;
      if (countryId > 0) {
        this.OutputVoucherAddForm.controls.countryId.setValue(countryId);
        // this.OutputVoucherAddForm.get("countryId").setValue(countryId);
      }
      else {
        this.OutputVoucherAddForm.controls.countryId.setValue(0);
        // this.OutputVoucherAddForm.get("countryId").setValue(0);
      }
    }
    else {
      this.OutputVoucherAddForm.controls.countryId.setValue(0);
      // this.OutputVoucherAddForm.get("countryId").setValue(0);
    }
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
    }
    else {
      this.countryName = "";
    }
  }

  updateAvailableQty(row: any) {
    if (!row.itemId || !this.OutputVoucherAddForm.value.storeId || !row.unitRate) return;

    this.serv.GetCurrentQty(row.itemId, row.storeId).subscribe(res => {
      debugger
      row.availableQty = this.formatCurrency(res / row.unitRate);
    });
  }

  addCarRow(dtIndex: number) {
    if (this.disableAll) return;

    const dtRow = this.invDtlList?.[dtIndex];
    if (!dtRow || !dtRow.itemId || dtRow.itemId === 0) {
      this.alert.ShowAlert("PleaseSelectItemFirst", "error");
      return;
    }

    this.projectInvCars.push({
      id: 0,
      invVoucherDTID: dtRow.id ?? 0,
      itemDTId: dtRow.itemId,
      driverName: '',
      phoneNo: '',
      qty: 0,
      pallets: 0,
      tractorNo: '',
      donorName: '',
      rowIndex: dtIndex
    });
  }

  deleteCarRow(i: number) {

    if (this.disableAll) return;
    this.projectInvCars.splice(i, 1);
  }

  OpenCarsDetails(dtRow: any, rowIndex: number) {     
    debugger
    if (!dtRow || !dtRow.itemId || dtRow.itemId === 0) {
      this.alert.ShowAlert("PleaseSelectItemFirst", "error");
      return;
    }

    const dtId = dtRow.id ?? 0;

    const carsForRow = (this.projectInvCars ?? []).filter(
      c => Number(c.invVoucherDTID) === Number(dtId) 
    );

    const itemName =
      this.itemsList?.find(x => Number(x.id) === Number(dtRow.itemId))?.text ?? '';

    const dialogRef = this.dialog.open(AppCarsDetailsComponent, {
      width: '1300px',
      disableClose: true,
      direction: this.jwtAuth.getLang() === "ar" ? "rtl" : "ltr",
      data: {
        title: this.translateService.instant('CarsDetails'),
        itemName,
        itemId: dtRow.itemId,
        itemDTId: dtRow.itemId,
        invVoucherDTID: dtId,
        rowIndex:rowIndex,
        carsList: carsForRow,
        kind: this.opType
      }
    });

    dialogRef.afterClosed().subscribe((res: any[] | null) => {
      debugger
      if (res !== null) {
         ;
        debugger
        this.projectInvCars[rowIndex] = (this.projectInvCars ?? []).filter(
          c => Number(c.invVoucherDTID) !== Number(dtId) 
        );

        res.forEach(c => {
          c.invVoucherDTID = dtId;
          c.itemDTId = dtRow.itemId;         
        });
        debugger
        this.projectInvCars.push(...res);

         
        let qty = 0;
        let pallets = 0;
        res.forEach(element => {
           
          qty += element.qty;
          pallets += element.pallets;
        });

        this.invDtlList[rowIndex].qty = qty;
        this.invDtlList[rowIndex].pallets = pallets;
        this.OutputVoucherAddForm.controls.projectInvCars.setValue(this.projectInvCars);
        // this.OutputVoucherAddForm.get("projectInvCars")?.setValue(this.projectInvCars);

        this.OnBlurChange(this.invDtlList[rowIndex].qty, dtRow, rowIndex);


      }
    });
  }

    popup(row: any, rowIndex: number) {
     
    row.firstOpen = row.firstOpen ?? true
    if (this.OutputVoucherAddForm.value.projectInvCars === null) {
      this.OutputVoucherAddForm.controls.projectInvCars.setValue([]);
      // this.OutputVoucherAddForm.get("projectInvCars").setValue([]);
    }
    this.projectInvCars = this.OutputVoucherAddForm.value.projectInvCars.filter(item => item.rowIndex == rowIndex);
    let itemName = this.itemsList.find(option => option.id === row.itemId).text;
    let title = this.translateService.instant('CarsDetails');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppCarsDetailsComponent, {
      width: '1500px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        itemName: itemName,
        itemId: row.itemId,
        itemCarDetailsList: this.projectInvCars,  
        rowIndex: rowIndex,
        companyid: this.jwtAuth.getCompanyId(),
        transList: this.tabelData,
        kind: this.opType,
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {    
        debugger     
        if (res !== null) {           
          row.res = res;
          let newList = this.OutputVoucherAddForm.value.projectInvCars.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.OutputVoucherAddForm.controls.projectInvCars.setValue(newList);
          // this.OutputVoucherAddForm.get("projectInvCars").setValue(newList);
          row.firstOpen = false;
        }
      })

  }

  OnPriceChange(row: any) {
     
    if (row.qty !== 0 && row.price !== 0) {
      row.total = row.qty * row.price;
    }
  }

  onDeliveryMethodChange(event: any) {
  debugger
  const selectedValues = event.value || [];
  this.isSpecial = selectedValues.includes(6803) || selectedValues.includes(6809);
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

  getProjectName(projectId: number , i :number): string {
  const project = this.projectsList?.find(p => p.id === projectId);
   const auth = this.projectsList.find(r => r.id == projectId)?.data1 ?? 0;
      if (auth != "" && auth != null && auth != undefined) {       
        this.invDtlList[i].autority = this.authoritiesDonorList.find(r => r.id == Number(auth))?.text ?? "";
      }
      else {
        this.invDtlList[i].autority = ";"
      }
  return project ? project.text : '';
  }
}
