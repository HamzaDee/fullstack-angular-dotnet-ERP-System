import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { HttpClient } from "@angular/common/http";
import { delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { of } from 'rxjs';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectedItemsService } from 'app-ItemsAdvanceSearch/itemssearh.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MaintOrderService } from '../maintorder.service';
import { ItemserialsformComponent } from 'app/views/general/app-itemSerials/itemserialsform.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-maintorderform',
  templateUrl: './maintorderform.component.html',
  styleUrl: './maintorderform.component.scss'
})
export class MaintorderformComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  MaintinanceForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  voucherId:any;
  showsave:boolean;
  disableAll:boolean;
  itemsList:any;
  currencyList:any;
  storesList:any;
  allUntiesList:any;
  decimalPlaces:number;
  unitsList: Array<any> = [];
  savedSerials: any[] = [];
  requestOrdersList:any;
  orderStatusList:any;
  prioritiesList:any;
   lang: any;
  orderItemsList:any = [];
  neededItemsList:any = [];
  techRepList:any = [];
  usedItemsList:any = [];
  serialsListss: any = [];

  remainingQtyMessage: string = '';
  remainingQty: number;
  showRemainQty: boolean;
  NewDate: Date = new Date;
  showLoader = false;
  disableSave :boolean;
  selectedRadioValue: number;
  validDate = true;
  Internal:boolean;
  External:boolean;

  totalUsed: number;
  totalReport :number;
  netTotal :any;
  MaintId:any;
  FromMaintenance:number = 0;
  accountsList:any;

  constructor
    (
      private readonly title: Title,
      private readonly jwtAuth: JwtAuthService,
      private readonly alert: sweetalert,
      private readonly translateService: TranslateService,
      public router: Router,
      private readonly formbulider: FormBuilder,
      public routePartsService: RoutePartsService,
      private readonly http: HttpClient,
      private readonly appCommonserviceService: AppCommonserviceService,
      private readonly dialog: MatDialog,
      private readonly selectedItemsService: SelectedItemsService,
      private readonly cdr: ChangeDetectorRef,
      private readonly route: ActivatedRoute,
      private readonly serv : MaintOrderService, 
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
    this.MaintId = +params['MaintId'];
    });

    if (this.MaintId == null || this.MaintId == undefined || this.MaintId === 0 || isNaN(this.MaintId)) {

      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
        this.FromMaintenance = 0;
      }
      else {
        this.voucherId = this.routePartsService.GuidToEdit;
        this.opType = this.routePartsService.Guid2ToEdit;
        this.showsave = this.routePartsService.Guid3ToEdit;
        this.FromMaintenance = 0;
      }
    }
    else {
      this.FromMaintenance = 1;
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
      this.router.navigate(['MaintenanceOrder/Maintorderlist']);
    }

    this.InitiailMaintenanceForm();
    this.GetInitailMaintenance();
    this.SetTitlePage();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Maintorderform');
    this.title.setTitle(this.TitlePage);
  }

  InitiailMaintenanceForm() {
      this.MaintinanceForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        inOrder:[0, [Validators.required]],
        orderNo:[0, [Validators.required]],
        orderDate:["", [Validators.required]],
        requestId:[0, [Validators.required, Validators.minLength(1)]],
        closeDate:["", [Validators.required]],
        createdAt:[""],
        createdById:[0],
        status:[0,[Validators.required, Validators.minLength(1)]],
        priorityId:[0,[Validators.required, Validators.minLength(1)]],
        accountId:[0],
        maintOrderNeedItems:[null],
        maintOrderTechReportModels:[null , [Validators.required, Validators.minLength(1)]],
        maintOrderUsedItemsModels:[null],
        itemsSerialList: [null],
        maintOrderItemsModelList:[null],
        generalAttachModelList:[null]
      });
  }
  
  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }
  
  GetInitailMaintenance()
  {
     this.serv.GetInitailMaintenanceOrder(Number(this.voucherId), this.opType)
      .subscribe(result => {
        debugger
       if (!result.isSuccess  && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['MaintenanceOrder/Maintorderlist']);
          return false;
        }
      
        result.orderDate = formatDate(result.orderDate, "yyyy-MM-dd", "en-US");
        result.closeDate = formatDate(result.closeDate, "yyyy-MM-dd", "en-US");
        result.createdAt = formatDate(result.createdAt, "yyyy-MM-dd", "en-US");
        this.itemsList = result.itemsList.map((item) => ({
          id: item.id,
          text: item.text,
          storeId: item.storeId,
          hasExpiry: item.hasExpiry,
          hasSerial: item.hasSerial
        }));

        this.currencyList = result.currencyList;
        this.storesList = result.storesList;
        this.allUntiesList = result.unitsList;
        this.decimalPlaces = result.currencyList.find(option => option.id === 1).data2;
        this.requestOrdersList = result.mainOrderReqList;
        this.orderStatusList = result.statusList;
        this.prioritiesList = result.prioritiesList;
        this.accountsList = result.accountsList;
      if (result.generalAttachModelList !== null && result.generalAttachModelList.length !== 0 && result.generalAttachModelList !== undefined) {
        this.MaintinanceForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      if (result.maintOrderNeedItems !== null && result.maintOrderNeedItems !== undefined && result.maintOrderNeedItems.length > 0) {
        this.neededItemsList = result.maintOrderNeedItems;
        this.MaintinanceForm.get("maintOrderNeedItems").setValue(this.neededItemsList);
        let index = 0;
          this.neededItemsList.forEach(element => {
          debugger
          const item =  this.itemsList.find(c=> c.id == element.itemId);
          if(item){
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              index++;              
          }
        })

      }
       
      this.serialsListss = [];
      this.tabelData = [];
      if (result.maintenanceSerialsModelList !== null && result.maintenanceSerialsModelList !== undefined && result.maintenanceSerialsModelList.length !== 0) {
        result.maintenanceSerialsModelList.forEach(item => {
          item.isChecked = true;
        });
        this.savedSerials = result.maintenanceSerialsModelList;
      }
      else {
        this.MaintinanceForm.value.itemsSerialList = [];
        this.savedSerials =[];
      }
      
      if (result.maintOrderTechReportModels !== null && result.maintOrderTechReportModels !== undefined && result.maintOrderTechReportModels.length > 0) {
        this.techRepList = result.maintOrderTechReportModels;
        this.techRepList.forEach(element => {
          element.visitDate = formatDate(element.visitDate, "yyyy-MM-dd", "en-US"); 
        });
        this.MaintinanceForm.get("maintOrderTechReportModels").setValue(this.techRepList);
      }

      if (result.maintOrderUsedItemsModels !== null && result.maintOrderUsedItemsModels !== undefined && result.maintOrderUsedItemsModels.length > 0) {
        this.usedItemsList = result.maintOrderUsedItemsModels;
        this.MaintinanceForm.get("maintOrderUsedItemsModels").setValue(this.usedItemsList);

        let index = 0;
          this.usedItemsList.forEach(element => {
          debugger
          const item =  this.itemsList.find(c=> c.id == element.itemId);
          if(item){
              this.unitsList[index] = this.allUntiesList.filter(unit => unit.id == element.unitId);
              index++;              
          }
        })
        debugger
        for (let i = 0; i < this.usedItemsList.length; i++) {
          const Row = this.usedItemsList[i];
          this.onChangeUnit(Row,i,false);
          Row.total = (Row.qty * Row.cost).toFixed(this.decimalPlaces);
        }
        
      }

      if(result.maintOrderItemsModelList !== null && result.maintOrderItemsModelList !== undefined && result.maintOrderItemsModelList.length > 0)
        {
          this.orderItemsList = result.maintOrderItemsModelList;
        }
         
        // for (let i = 0; i < this.invDtlList.length; i++) {
        //   this.OnPriceBlur(this.invDtlList[i]);
        //   this.onChangeItem(this.invDtlList[i].itemId, i, false);
        // }
        
         this.MaintinanceForm.patchValue(result);

         const source$ = of(1, 2);
         source$.pipe(delay(0)).subscribe(() => {
          debugger
            if (this.voucherId > 0) 
            {
            
              if(result.inOrder)
                {
                  this.selectedRadioValue = 1;
                }
                else
                {
                  this.selectedRadioValue = 0;
                }
                this.MaintinanceForm.get("inOrder").setValue(result.inOrder);
                this.MaintinanceForm.get("orderNo").setValue(result.orderNo);
                this.MaintinanceForm.get("orderDate").setValue(formatDate(result.orderDate, "yyyy-MM-dd", "en-US"));
                this.MaintinanceForm.get("requestId").setValue(result.requestId);
                this.MaintinanceForm.get("status").setValue(result.status);
                this.MaintinanceForm.get("priorityId").setValue(result.priorityId);
                this.MaintinanceForm.get("accountId").setValue(result.accountId);
               if (result.itemsSerialsTransList !== null && result.itemsSerialsTransList !== undefined) {
                this.MaintinanceForm.get("itemsSerialList").setValue(result.itemsSerialsTransList);
                }
            }
            else 
            {
             this.selectedRadioValue = 1;   
             this.MaintinanceForm.get("requestId").setValue(0);
             this.MaintinanceForm.get("status").setValue(0);
             this.MaintinanceForm.get("priorityId").setValue(0);
             this.MaintinanceForm.get("accountId").setValue(0);
            }
            if (this.opType == "Show") 
              {
                this.disableAll = true;
              }

              if(this.FromMaintenance == 1)
                {
                  this.MaintinanceForm.get("requestId").setValue(this.MaintId);
                  this.GetReqItems(this.MaintId);
                }
          });
      });


  }

  OnSaveForms() {
    debugger 
    if(!this.CheckSaveValidation())
      {
        debugger
        return false;
      }         
    this.MaintinanceForm.value.companyId = this.jwtAuth.getCompanyId();
    this.MaintinanceForm.value.userId = this.jwtAuth.getUserId();
    if(this.selectedRadioValue == 1)
      {
        this.MaintinanceForm.get("inOrder").setValue(1);    
      }
    else
      {
        this.MaintinanceForm.get("inOrder").setValue(0);    
      }
    this.MaintinanceForm.get("maintOrderNeedItems").setValue(this.neededItemsList);
    this.MaintinanceForm.get("maintOrderTechReportModels").setValue(this.techRepList);
    this.MaintinanceForm.get("maintOrderUsedItemsModels").setValue(this.usedItemsList);
    this.MaintinanceForm.get("maintOrderItemsModelList").setValue(this.orderItemsList);
    this.MaintinanceForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.serv.SaveMaintenanceOrder(this.MaintinanceForm.value).subscribe((result) => {
      debugger
        if (result) {
          this.alert.SaveSuccess();
          debugger        
          if(this.opType == 'Add')
            {
              this.ClearAfterSave();         
              this.voucherId = 0;
              this.opType = 'Add';
              this.disableSave = false;
              this.ngOnInit();
            }
          else if (this.opType == 'Edit')
            {
              this.router.navigate(['MaintenanceOrder/Maintorderlist']);
            }
          
        }
        else
        {
          this.alert.SaveFaild();
        }
   
      })
  }

  ClearAfterSave() {
    this.techRepList = [];
    this.usedItemsList = [];
    this.neededItemsList = [];
    this.MaintinanceForm.value.generalAttachModelList = [];
    this.childAttachment.data = [];
    this.selectedRadioValue = 1;   
    this.MaintinanceForm.get("requestId").setValue(0);
    this.MaintinanceForm.get("status").setValue(0);
    this.MaintinanceForm.get("priorityId").setValue(0);
    this.router.navigate([], {
      queryParams: { MaintId: 0 },
      queryParamsHandling: 'merge'
    });
  }

  onChangeItemNeed(itemId, i, reset = true) {
    this.serv.GetItemUintbyItemId(itemId).subscribe(res => {
      debugger
      this.unitsList[i] = res;
      if (res.length == 2) {
        this.usedItemsList[i].unitId = res[1].id;
      }
      else if (this.usedItemsList[i].unitId != 0 || this.usedItemsList[i].unitId != null) {
        this.usedItemsList[i].unitId = this.usedItemsList[i].unitId;
      }
      else {
        this.usedItemsList[i].unitId = res[0].id;
      }
      this.onChangeUnitNeed(this.usedItemsList[i], i);
    });
  }

  onChangeUnitNeed(Row, i) {
    
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.serv.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.usedItemsList[i].unitRate = res;
      });
    }
  }

  getItemQtyFromStore(event: any, row: any, Index: number) {
    debugger;
    if (row.qty !== 0 && row.cost !== 0) {
      row.total = row.qty * row.cost;
      row.total = row.total.toFixed(this.decimalPlaces);
    }

    this.serv.getItemQtyFromStore(row.itemId, row.unitId, row.qty, row.storeId).subscribe(res => {
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
  }

  OnBlurChange(event: any, row: any, Index: number) {
    debugger
    
    if (this.usedItemsList[Index].itemId == 0) {
      this.alert.ShowAlert("PleaseEnterItemID", 'error');
      setTimeout(() => {
        this.usedItemsList[Index].qty = 0;
        this.cdr.detectChanges();
      });

      return;
    }
    if (this.usedItemsList[Index].unitId == 0) {
      this.alert.ShowAlert("PleaseEnterUnitID", 'error');
      setTimeout(() => {
        this.usedItemsList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }
    if (this.usedItemsList[Index].storeId == 0) {
      this.alert.ShowAlert("PleaseEnterStoreID", 'error');
      setTimeout(() => {
        this.usedItemsList[Index].qty = 0;
        this.cdr.detectChanges();
      });
      return;
    }
   

    let transDate = this.MaintinanceForm.value.orderDate;
    if (row.qty < 0) {
      this.alert.ShowAlert("CantAddValueLessThanZero", 'error');
      this.usedItemsList[Index].qty = 0;
      return;
    }
    this.remainingQty = 0
    if (event == null) {
      this.showRemainQty = false;
      return;
    }
    debugger
    let diffitemQty = 0;
    if (row.id > 0) {
      diffitemQty = row.qty - row.mainQty;
    }
    if (diffitemQty < 0)
      return;
    let itemQty = this.usedItemsList.filter(item => item.index !== Index && item.itemId == row.itemId).reduce((sum, item) => sum + item.qty, 0);
    setTimeout(() => {
       this.serv.GetItemQty(row.itemId, row.storeId, row.unitId, transDate, row.qty).subscribe(res => {
        debugger
        if (res.length == 0) {        
          this.remainingQty = 0
          row.qty =0;
          row.cost = 0;
          this.showRemainQty = true;
          this.hideLabelAfterDelay();
          this.alert.RemainimgQty("RemainigQty=", 0, 'error');
          this.cdr.detectChanges();
        }
        else if (row.qty + itemQty > res[0].qoh / row.unitRate) { 
            row.qty = res[0].qoh / row.unitRate;
            row.cost = res[0].cost.toFixed(this.decimalPlaces);
            row.total = Number(row.qty) * Number(row.cost);
            row.total= row.total.toFixed(this.decimalPlaces);
            this.remainingQty = res[0].qoh / row.unitRate;
            this.showRemainQty = true;        
            this.hideLabelAfterDelay();
            this.alert.RemainimgQty("RemainigQty=", res[0].qoh / row.unitRate, 'error');
            this.cdr.detectChanges();
            return;
          }
        else
          {
            this.remainingQty = res[0].qoh / row.unitRate;
            row.cost = res[0].cost.toFixed(this.decimalPlaces);
            row.total = Number(row.qty) * Number(row.cost);
            row.total= row.total.toFixed(this.decimalPlaces);
            this.showRemainQty = true;  
            this.hideLabelAfterDelay();
            this.cdr.detectChanges();
          }       
        }
      )  
    });     
    
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
    }, 3000);
  }

  formatAmt(row: any) {
    row.price = row.price.toFixed(this.decimalPlaces);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  calculateSum() {
    return this.formatCurrency(this.usedItemsList.reduce((sum, item) => sum + parseFloat(item.total), 0));
  }

  clearFormdata() {
    this.NewDate = new Date;
    this.MaintinanceForm.get("id").setValue(0);
    this.MaintinanceForm.get("storeId").setValue(0);
    this.MaintinanceForm.get("deliveredTo").setValue(0);
    this.MaintinanceForm.get("branchId").setValue(0);
    this.MaintinanceForm.get("accountId").setValue(0);
    this.MaintinanceForm.get("debitAccountId").setValue(0);
    this.MaintinanceForm.get("note").setValue('');
    this.MaintinanceForm.get("referenceNo").setValue('');
    this.MaintinanceForm.get("referenceDate").setValue('');
    this.MaintinanceForm.get("voucherDate").setValue(formatDate(this.NewDate, "yyyy-MM-dd", "en-US"));
    this.MaintinanceForm.get("maintOrderUsedItemsModels").setValue([]);
    this.MaintinanceForm.get("invvVouchersDocsModelList").setValue([]);
    this.MaintinanceForm.get("itemsSerialList").setValue([]);
    this.MaintinanceForm.get("generalAttachModelList").setValue([]);
    this.childAttachment.data = [];
    this.usedItemsList = [];
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

  isEmpty(input) {
    return input === '' || input === null;
  }

  onRadioChange(value: number) {    
    debugger
    const year = this.NewDate.getFullYear();
    let Flag = false;
    if (value == 1) {
      this.selectedRadioValue = 1            
    }
    else {
     this.selectedRadioValue = 0
    }
    if(this.selectedRadioValue ==1 )
    {
      Flag = true;
    }   
    this.serv.GetMaxVoucher(Flag,year).subscribe(res => {
        this.MaintinanceForm.get("orderNo").setValue(res);
    })
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
  
  AddNewLineTecRep() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    const date = new Date();
    this.showRemainQty = false;
    this.serialsListss = [];
    this.techRepList.forEach(item => {
      item.newRow = 1;
    });

    this.techRepList.push(
      {
        id :0,
        orderHDId:0,
        description:"",
        techniciansNo:0,
        workHours:0,
        workCost:0,
        visitDate:formatDate(date, "yyyy-MM-dd", "en-US"),
        note:"",
        index:"",
      });

    this.MaintinanceForm.get("maintOrderTechReportModels").setValue(this.techRepList);
  }

  deleteRowTechRep(rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (rowIndex !== -1) {
      this.techRepList.splice(rowIndex, 1);
    }
  }

  AddNewLineUsed() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.showRemainQty = false;
    this.serialsListss = [];
    this.usedItemsList.forEach(item => {
      item.newRow = 1;
    });


    this.usedItemsList.push(
      {
        id: 0,
        orderHDId: 0,
        itemId: 0,
        unitId: 0,
        unitRate: 0,
        storeId: 0,
        qty: "", 
        cost:0,
        total:0,
        newRow: 0,
        index: this.usedItemsList.length
      });

    this.MaintinanceForm.get("maintOrderUsedItemsModels").setValue(this.usedItemsList);
  }

  deleteRowUsed(row, rowIndex: number) {
    debugger
    const itemIdToRemove = this.MaintinanceForm.value.itemsSerialList.filter(item => item.index !== rowIndex);

    this.MaintinanceForm.get("itemsSerialList").setValue(itemIdToRemove);
    if (rowIndex !== -1) {
      this.usedItemsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
      let indexToRemove = this.MaintinanceForm.value.itemsSerialList.findIndex(element => element.rowIndex == rowIndex);
      if (indexToRemove !== -1) {
        this.MaintinanceForm.value.itemsSerialList.splice(indexToRemove, 1);
      }
      else {
        this.MaintinanceForm.value.itemsSerialList.forEach(element => {
          if (element.rowIndex != 0) {
            element.rowIndex = element.rowIndex - 1;
          }
        });
      }
    }
    this.MaintinanceForm.get("maintOrderUsedItemsModels").setValue(this.usedItemsList);
  }
  
  AddNewLineNeed() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    this.showRemainQty = false;
    this.neededItemsList.push(
      {
        id: 0,
        orderHDId: 0,
        itemId: 0,
        unitId: 0,
        unitRate: 0,
        storeId: 0,
        qty: "",        
        newRow: 0,
        index: this.neededItemsList.length
      });

    this.MaintinanceForm.get("maintOrderNeedItems").setValue(this.neededItemsList);
  }

  deleteRowNeed(rowIndex: number) {
     debugger
    if (this.disableAll == true) {
      return;
    }
    if (rowIndex !== -1) {
      this.neededItemsList.splice(rowIndex, 1);
    }
    this.MaintinanceForm.get("maintOrderNeedItems").setValue(this.neededItemsList);
  }

  openSerialsPopup(row: any, rowIndex: number) {
      debugger
      row.firstOpen = row.firstOpen ?? true
  
      if (this.opType == 'Edit' || this.opType == 'Show') {
        this.prepareTableDataForEditShow(row, rowIndex);
      }
      else {
        this.prepareTableDataForAdd(row, rowIndex);
      }
  
      const itemName = this.itemsList.find(option => option.id === row.itemId).text;
      this.openSerialsDialog(row, rowIndex, itemName);
  }

  private prepareTableDataForEditShow(row: any, rowIndex: number): void {
    this.tabelData = [];
    if (row.firstOpen == true) {
      this.addSavedSerials(row, rowIndex);
      this.addAvailableSerials(rowIndex);
    }
    else {
      this.tabelData = row.res;
    }
  }

  private addSavedSerials(row: any, rowIndex: number): void {
    for (const SavedSerilas of this.savedSerials.filter(item => item.rowIndex == rowIndex && item.itemId == row.itemId)) {
      this.tabelData.push({
        itemId: SavedSerilas.itemId,
        serialNo: SavedSerilas.serialNo,
        id: SavedSerilas.id,
        rowIndex: SavedSerilas.rowIndex,
        isChecked: true
      });
    }
  }

  private addAvailableSerials(rowIndex: number): void {
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

  private prepareTableDataForAdd(row: any, rowIndex: number): void {
    this.tabelData = [];
    if (row.firstOpen) {
      this.addUnselectedSerials(rowIndex);
    }
    else {
      this.tabelData = row.res;
    }
  }

  private addUnselectedSerials(rowIndex: number): void {
    for (const serial of this.serialsListss) {
      const existingItem = this.MaintinanceForm.value.itemsSerialList.find(item => item.id === serial.id && item.isChecked === true);
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

  private openSerialsDialog(row: any, rowIndex: number, itemName: string): void {
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
    this.handleDialogClosed(dialogRef, row, rowIndex);
  }

  private handleDialogClosed(dialogRef: MatDialogRef<any>, row: any, rowIndex: number): void {
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          row.res = res;
          let newList = this.MaintinanceForm.value.itemsSerialList.filter(item => item.rowIndex !== rowIndex);
          newList = [...newList, ...res];
          this.MaintinanceForm.get("itemsSerialList").setValue(newList);
          row.firstOpen = false;
          return;
        }
      })
  }

  CheckSaveValidation(): boolean {
    debugger
    let form = this.MaintinanceForm.value;
    
    if (!this.validateRequiredFields(form)) {
      return false;
    }
    
    if (!this.validateTechReportList()) {
      return false;
    }
    
    if (!this.validateUsedItemsList()) {
      return false;
    }
    
    if (!this.validateNeededItemsList()) {
      return false;
    }
    
    if(this.usedItemsList.length > 0)
      {
        if(form.accountId == 0 || form.accountId == null || form.accountId == undefined )
          {
            this.alert.ShowAlert("PleaseSelectMaintenanceExpenseAccount(DebitAccount)","error")
            return false;
          }
      }
      else
        {
          if(form.accountId > 0)
            {
              this.alert.ShowAlert("PleaseAddAtleastOneRowInUsedItemsTable","error")
              return false;
            }
        }
    return true;
  }

  private validateRequiredFields(form: any): boolean {
    const orderReqId = form.requestId;
    if (this.isValueEmpty(orderReqId)) {
      this.alert.ShowAlert("PleaseSelectRequestOrder", "error");
      return false;
    }

    const status = form.status;
    if (this.isValueEmpty(status)) {
      this.alert.ShowAlert("PleaseSelectStatus", "error");
      return false;
    }

    const priority = form.priorityId;
    if (this.isValueEmpty(priority)) {
      this.alert.ShowAlert("PleaseSelectPriority", "error");
      return false;
    }

    return true;
  }

  private validateTechReportList(): boolean {
    if (this.techRepList.length === 0) {
      this.alert.ShowAlert("PleaseInsertAtleastOneRowinsideTechReportTable", "error");
      return false;
    }

    for (const row of this.techRepList) {
      if (this.isValueEmpty(row.description)) {
        this.alert.ShowAlert("PleaseInsertDescriptionForTechReportTable", "error");
        return false;
      }
    }

    return true;
  }

  private validateUsedItemsList(): boolean {
    if (this.usedItemsList.length === 0) {
      return true;
    }

    for (const row of this.usedItemsList) {
      if (!this.validateItemRow(row, "PleaseInsertAllDataUsed")) {
        return false;
      }
    }

    return true;
  }

  private validateNeededItemsList(): boolean {
    if (this.neededItemsList.length === 0) {
      return true;
    }

    for (const row of this.neededItemsList) {
      if (!this.validateItemRow(row, "PleaseInsertAllDataneeded")) {
        return false;
      }
    }

    return true;
  }

  private validateItemRow(row: any, errorMessage: string): boolean {
    if (this.isValueEmpty(row.itemId) || 
        this.isValueEmpty(row.unitId) || 
        this.isValueEmpty(row.storeId) || 
        this.isValueEmpty(row.qty)) {
      this.alert.ShowAlert(errorMessage, "error");
      return false;
    }
    return true;
  }

  private isValueEmpty(value: any): boolean {
    return value === 0 || value === null || value === undefined || value === '';
  }

  onChangeItem(itemId, i, reset = true) {
    debugger
    if (reset) {
      this.serialsListss = [];
      this.usedItemsList[i].qty = "";     
    }
    this.serv.GetItemUintbyItemId(itemId).subscribe(res => {
      debugger
      this.unitsList[i] = res;
      if (res.length == 2) {
        this.usedItemsList[i].unitId = res[1].id;
      }
      else if (this.usedItemsList[i].unitId != 0 || this.usedItemsList[i].unitId != null) {
        this.usedItemsList[i].unitId = this.usedItemsList[i].unitId;
      }
      else {
        this.usedItemsList[i].unitId = res[0].id;
      }
      this.onChangeUnit(this.usedItemsList[i], i, false);
    });
    const selectedItem = this.itemsList.find(x => x.id === itemId);
    if (selectedItem && selectedItem.storeId > 0) {
      const defaultStoreNo = selectedItem.storeId;
      this.usedItemsList[i].storeId = defaultStoreNo;
      this.cdr.detectChanges();
    }
    else {
      this.cdr.detectChanges();
    }
       
  }

  onChangeUnit(Row, i, type) {
    if (type) {
      this.usedItemsList[i].qty = 0;
    }
    if (Row.unitId !== 0 && Row.unitId !== null && Row.unitId !== undefined) {
      this.serv.GetUnitRate(Row.itemId, Row.unitId).subscribe(res => {
        this.usedItemsList[i].unitRate = res;
      });
    }
  }

  async GetItemSerials(row, rowIndex): Promise<void> {
    debugger
    const store = row.storeId;
    
    try {
      this.serialsListss = await this.serv.GetItemSerials(row.itemId, store).toPromise();
      this.openSerialsPopup(row, rowIndex);
    } catch (error) {
      console.error('Error fetching item serials', error);
    }

  }

  GetReqItems(Id)
  {
    if(Id > 0)
      {
        this.serv.GetOrderItems(Id).subscribe( res => 
        {
          if(res.length > 0)
            {
              debugger
              this.orderItemsList = res;
              if(this.orderItemsList.length > 0 )
                {
                  if(res[0].inOrder)
                  {
                    this.selectedRadioValue = 1;
                  }
                  else
                  {
                    this.selectedRadioValue = 0;
                  }
                  this.orderItemsList.forEach(element => {
                    if(element.underWarranty == 1)
                      {
                        element.underWarranty =true;
                      }
                  });
                }
            }
        })
      }
    else
      {
          this.orderItemsList = [];
      }
    

  }

  deleteRowReqItems(rowIndex: number) {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (rowIndex !== -1) {
      this.orderItemsList.splice(rowIndex, 1);
    }
  }

  calculateSumTech() {
    this.totalReport = this.techRepList.reduce((sum, item) => sum + parseFloat(item.workCost), 0).toFixed(3);
     this.netTotal = (Number(this.totalReport) + Number(this.totalUsed)).toFixed(3);
    return (this.techRepList.reduce((sum, item) => sum + parseFloat(item.workCost), 0)).toFixed(3);
  }

  calculateSumUsed() {
    this.totalUsed = this.usedItemsList.reduce((sum, item) => sum + parseFloat(item.total), 0).toFixed(3);
    this.netTotal = (Number(this.totalReport) + Number(this.totalUsed)).toFixed(3);
    return (this.usedItemsList.reduce((sum, item) => sum + parseFloat(item.total), 0)).toFixed(3);
  }

  DeleteMaintenanceOrder(id: any) {
      Swal.fire({
        title: this.translateService.instant('AreYouSure?'),
        text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
        icon: 'warning',
        confirmButtonColor: '#dc3741',
        showCancelButton: true,
        confirmButtonText: this.translateService.instant('Yes,deleteit!'),
        cancelButtonText: this.translateService.instant('Close'),
      })
        .then((result) => {
          if (result.value) {
            this.serv.DeletemaintenanceVoucher(id).subscribe((results) => {
              if (results.isSuccess) {
                this.alert.DeleteSuccess();
                this.router.navigate(['MaintenanceOrder/Maintorderlist']);
                this.router.navigate(['MaintenanceOrder/Maintorderlist']);
              }
              else if (!results.isSuccess && results.message === "msNoPermission") {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
              else {
                if (results.message == "msgRecordHasLinks") {
                  this.alert.ShowAlert("msgRecordHasLinks", 'error')
                }
              }
            });
          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Delete action was canceled.');
          }
        })
  }

  PrintMaintenanceOrder(id: number) {
    debugger
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptMaintenanceOrderAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptMaintenanceOrderEN?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

}
