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
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { ProdVoucherService } from '../productionVoucher.service';
import { FinancialvoucherComponent } from 'app/views/general/app-Showfinancialdocuments/financialdoc-voucher/financialvoucher.component';

@Component({
  selector: 'app-prodvoucherform',
  templateUrl: './prodvoucherform.component.html',
  styleUrl: './prodvoucherform.component.scss'
})
export class ProdvoucherformComponent {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  @ViewChild(FinancialvoucherComponent) financialvoucher: FinancialvoucherComponent;
  ProductionOrderAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  prodOrdersDTModels: any[] = [];
  WorkCentersDTList: any[] = [];
  OverheadCostsList: any[] = [];
  expenssesDTList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  voucherId: any;
  itemsList: any;
  unitsList: Array<any> = [];
  filteredProdItems:any[] = [];
  allUntiesList: any;
  itemsUnitList: Array<any> = [];
  accountsList: any;
  mealsList: any;
  storesList: any;
  costCenterList: any;
  isdisabled: boolean = false;
  decimalPlaces: number;
  disableAll: boolean;
  voucherNo: number = 0;
  newDate: any;
  disableSave: boolean;
  voucherTypeList: any;
  Lang: string;
  allowEditDate: boolean = false;
  allowEditVoucherSerial: boolean = false;
  allowEditBranch: boolean = false;
  selectedVoucherType: any;
  expensesList: any
  materialItemsList: any;
  isOutput: number;
  CostTypeList :any;
  CalculationMethodList :any;
  RawMaterialCostsValue: any = 0;
  ProductionProcessCostsValue: any = 0;
  AdditionalCostsValue: any = 0;
  FinalUnitCostValue: any = 0;
  finalCost: number = 0;
  finalPhaseCost: number = 0;
  finalAmount: number = 0;
  finalUnitCost: number = 0;
  finaltotalCost: number = 0;
  TotalCostForTheEntireQty:any = 0;
  CostPerUnit:any = 0;
  unitRate:number = 0;
  remainingQty: number;
  showRemainQty: boolean;
  DebitAccId:number;
  salesOrdersList:any;
  MainOrderQty:any=0;
  voucherType: any;
  ProdLineList: any;
  FilteredProdLineList: any;

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
      private service: ProdVoucherService
    ) { }

  ngOnInit(): void {
    debugger
    this.voucherType = "Production";
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
      this.router.navigate(['ProductionVoucher/ProdVoucherList']);
    }
    this.InitiailEntryVoucherForm();
    this.GetProdVoucherForm();
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
    this.TitlePage = this.translateService.instant('ProdVoucherForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.ProductionOrderAddForm = this.formbulider.group({
      id: [0, [Validators.required]],
      companyId: [0],
      voucherTypeId: [0],
      voucherTypeEnum: [0],
      orderNo: ['', [Validators.required, Validators.minLength(1)]],
      orderDate: ["", [Validators.required]],
      startDate: [""],
      endDate: [""],
      deliveryDate: [""],
      note: [""],
      salesOrders: [""],
      itemId: [0, [Validators.required]],
      unitId: [0, [Validators.required]],
      qty: [0, [Validators.required]],
      storeId: [0, [Validators.required]],
      expiryDate: [""],
      batchNo: [""],
      costCenterId: [0],
      debitAccountId: [0, [Validators.required]],
      issueInvOutput: [false],
      actualQty: [0],
      excessQty: [0],
      damagedQty: [0],
      productionLineId: [0],
      productionsOrdersDTModels: [null, [Validators.required, Validators.minLength(1)]],
      workCentersModels: [null],
      overheadCostsModels: [null],
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

  GetProdVoucherForm() {
    var lang = this.jwtAuth.getLang();
    this.service.GetProductionForm(this.voucherId, this.opType).subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ProductionVoucher/ProdVoucherList']);
        return;
      }
      result.orderDate = formatDate(result.orderDate, "yyyy-MM-dd", "en-US")
      result.startDate = formatDate(result.startDate, "yyyy-MM-dd", "en-US")
      result.endDate = formatDate(result.endDate, "yyyy-MM-dd", "en-US")
      result.deliveryDate = formatDate(result.deliveryDate, "yyyy-MM-dd", "en-US")
      result.expiryDate = formatDate(result.expiryDate, "yyyy-MM-dd", "en-US")
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
        debitAccId:item.debitAccId
      }));
      this.itemsList = result.productedItemsList;
      this.filteredProdItems = result.productedItemsList;
      this.allUntiesList = result.itemUnitesList;
      this.accountsList = result.accountsList;
      this.mealsList = result.mealsList;
      this.storesList = result.storesList;
      this.costCenterList = result.costCenterList;
      this.expensesList = result.expensesList;
      this.materialItemsList = result.materialItemsList;
      this.CostTypeList=result.costTypeList;
      this.CalculationMethodList =result.calculationMethodList;
      this.salesOrdersList = result.salesOrdersList;
      this.ProdLineList = result.productionLinesList;
      this.FilteredProdLineList = result.productionLinesList;
      if(result.overheadCostsModels != null && result.overheadCostsModels.length > 0)
      {
        this.OverheadCostsList = result.overheadCostsModels;
        this.ProductionOrderAddForm.get("overheadCostsModels").setValue(this.OverheadCostsList);
      }
      if(result.workCentersModels != null && result.workCentersModels.length > 0)
      {
        this.WorkCentersDTList = result.workCentersModels;
        this.ProductionOrderAddForm.get("workCentersModels").setValue(this.WorkCentersDTList);
      }
      if(result.productionsOrdersDTModels != null && result.productionsOrdersDTModels.length > 0)
        {
          this.prodOrdersDTModels = result.productionsOrdersDTModels;
          this.ProductionOrderAddForm.get("productionsOrdersDTModels").setValue(this.prodOrdersDTModels);
          if (this.prodOrdersDTModels.length > 0) {
            for (let i = 0; i < this.prodOrdersDTModels.length; i++) {
              this.onChangeItem(this.prodOrdersDTModels[i], i);
              this.calcTotalLine(this.prodOrdersDTModels[i], i);
            }
          }
        }
             
      this.OnAmountChange();
      this.OnPhaseCostChange();
      this.updateAllFinalValues();      
      this.TotalCostForTheEntireQty = this.finaltotalCost + this.finalPhaseCost + this.finalAmount;
      if(result.issueInvOutput)
      {
          this.isOutput = 1;
         this.ProductionOrderAddForm.get("issueInvOutput").setValue(true);
      }
      else
      {
        this.isOutput = 0;
        this.ProductionOrderAddForm.get("issueInvOutput").setValue(false);
      }

      if (result.generalAttachModelList !== null && result.generalAttachModelList !== 0 && result.generalAttachModelList !== undefined) {
        this.ProductionOrderAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.disableSave = false;
        if (this.voucherId > 0) {
          debugger
          this.ProductionOrderAddForm.get("id").setValue(result.id);
          this.ProductionOrderAddForm.get("voucherTypeId").setValue(result.voucherTypeId);
          this.ProductionOrderAddForm.get("orderNo").setValue(result.orderNo);
          this.ProductionOrderAddForm.get("orderDate").setValue(result.orderDate);
          this.ProductionOrderAddForm.get("startDate").setValue(result.startDate);
          this.ProductionOrderAddForm.get("endDate").setValue(result.endDate);
          this.ProductionOrderAddForm.get("deliveryDate").setValue(result.deliveryDate);
          this.ProductionOrderAddForm.get("expiryDate").setValue(result.expiryDate);
          this.ProductionOrderAddForm.get("actualQty").setValue(result.actualQty);
          this.ProductionOrderAddForm.get("excessQty").setValue(result.excessQty);
          this.ProductionOrderAddForm.get("damagedQty").setValue(result.damagedQty);
          this.ProductionOrderAddForm.get("itemId").setValue(result.itemId);
          this.onChangeProductedItemValue(this.ProductionOrderAddForm.get("itemId").value);
          this.ProductionOrderAddForm.get("unitId").setValue(result.unitId);
          this.GetUnitRate(result.itemId, result.unitId);
          this.ProductionOrderAddForm.get("qty").setValue(result.qty);
          this.ProductionOrderAddForm.get("storeId").setValue(result.storeId);
          this.ProductionOrderAddForm.get("batchNo").setValue(result.batchNo);           
          this.ProductionOrderAddForm.get("debitAccountId").setValue(result.debitAccountId);
          this.ProductionOrderAddForm.get("costCenterId").setValue(result.costCenterId);
          this.ProductionOrderAddForm.get("salesOrders").setValue(result.salesOrders);
          this.ProductionOrderAddForm.get("productionLineId").setValue(result.productionLineId);
          let so = this.ProductionOrderAddForm.get("salesOrders").value;
          if(so != null && so != undefined && so != "" && so != "0")
            {
              this.ConvertIdsToNumber(result);
            }          
          this.updateAllFinalValues();
          this.CalcRealQty();          
          this.cdr.detectChanges();
        }
        else {
          debugger
          this.newDate = new Date;
          this.ProductionOrderAddForm.get("id").setValue(0);
          const defaultVoucher = result.voucherTypeList?.find(option => option.isDefault)?.id ?? 0;
          this.ProductionOrderAddForm.get("voucherTypeId")?.setValue(defaultVoucher); 
          this.ProductionOrderAddForm.get("orderDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.ProductionOrderAddForm.get("startDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.ProductionOrderAddForm.get("endDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.ProductionOrderAddForm.get("deliveryDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.ProductionOrderAddForm.get("expiryDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.ProductionOrderAddForm.get("actualQty").setValue(0);
          this.ProductionOrderAddForm.get("excessQty").setValue(0);
          this.ProductionOrderAddForm.get("damagedQty").setValue(0);
          this.ProductionOrderAddForm.get("itemId").setValue(0);
          this.ProductionOrderAddForm.get("unitId").setValue(0);
          this.ProductionOrderAddForm.get("qty").setValue(0);
          this.ProductionOrderAddForm.get("storeId").setValue(0);
          this.ProductionOrderAddForm.get("batchNo").setValue("");           
          this.ProductionOrderAddForm.get("debitAccountId").setValue(0);
          this.ProductionOrderAddForm.get("costCenterId").setValue(0);
          this.ProductionOrderAddForm.get("productionLineId").setValue(0);
          this.getVoucherNo(defaultVoucher); 
          this.GetVoucherTypeSetting(this.ProductionOrderAddForm.value.voucherTypeId)
          this.isOutput = 0;
          this.cdr.detectChanges();
        }
       

      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;   
    if (this.ValidationSave()) {
      return;
    }
    debugger
    this.ProductionOrderAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProductionOrderAddForm.value.userId = this.jwtAuth.getUserId();
    this.ProductionOrderAddForm.value.orderNo = this.ProductionOrderAddForm.value.id;
    this.ProductionOrderAddForm.get("productionsOrdersDTModels").setValue(this.prodOrdersDTModels)
    this.ProductionOrderAddForm.get("workCentersModels").setValue(this.WorkCentersDTList)
    this.ProductionOrderAddForm.get("overheadCostsModels").setValue(this.OverheadCostsList)
    this.ProductionOrderAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.ConvertIdsToString();
    this.service.SaveProductionOrder(this.ProductionOrderAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();
          this.router.navigate(['ProductionVoucher/ProdVoucherList']);
          // debugger;
          // if(this.isOutput == 1 && this.opType == 'Add')
          // {
          //   this.OpenOutputVoucher();
          // }
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.prodOrdersDTModels == null) {
      this.prodOrdersDTModels = [];
    }

    this.prodOrdersDTModels.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        storeId: 0,
        qty: 0,
        wastePerc: 0,
        actualQty: 0,
        cost: 0,
        total: 0,
        creditAccId: 0,
        costCenterId: 0,
        expiryDate: '',
        batchNo: '',
        currentQty:0,
        index: ""
      });
    debugger
    this.ProductionOrderAddForm.get("manufEquationsDTModel").setValue(this.prodOrdersDTModels);
  }

  deleteRow(rowIndex: number) {

    if (rowIndex !== -1) {
      this.prodOrdersDTModels.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.ProductionOrderAddForm.get("manufEquationsDTModel").setValue(this.prodOrdersDTModels);
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
    const newRow =
    {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      qty: 0,
      index: ""
    };

    this.prodOrdersDTModels.splice(rowIndex, 0, newRow);
    this.ProductionOrderAddForm.get("manufEquationsDTModel").setValue(this.prodOrdersDTModels);
  }

  onChangeItem(Row, i) {
    debugger
    if (Row.itemId == 0 || Row.itemId == null) {
      this.unitsList[i] = [];
    }

    if (Row.itemId !== 0 && Row.itemId !== null) {
      this.service.GetItemUintbyItemId(Row.itemId).subscribe(res => {
        this.unitsList[i] = res;
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
        this.service.DeleteProductionOrder(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.router.navigate(['ProductionVoucher/ProdVoucherList']);
          }
          else if(results.isSuccess == false && results.message ==="msNoPermission"){
            {
              this.alert.ShowAlert("msNoPermission",'error');
              return;
            }}
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  onChangeProductedItem(event: any) {
  debugger;
  const selectedIds: number[] = this.ProductionOrderAddForm.get('salesOrders').value;
  const selectedItemId = event.value;
  this.ProductionOrderAddForm.get('unitId').setValue(0);
  this.ProductionOrderAddForm.get('qty').setValue(0);
  this.unitRate = 0;
  // 🟢 Get item units (works same as before)
  if (selectedItemId > 0) {
    this.service.GetItemUintbyItemId(selectedItemId).subscribe(res => {
      this.itemsUnitList = res;
    });
  } else {
    this.itemsUnitList = [];
    this.FilteredProdLineList = this.ProdLineList;
  }
  this.GetMaterialItems(selectedItemId, this.ProductionOrderAddForm.get('unitId').value ,  this.ProductionOrderAddForm.get('qty').value , ()  => {
    this.updateAllFinalValues();
    this.CalcRealQty();
  });
  // 🟢 Handle case: no sales orders selected (or only the “Select one” option)
  if (!selectedIds || selectedIds.length === 0 || (selectedIds.length === 1 && selectedIds[0] === 0)) {
    this.MainOrderQty = 0;
    this.ProductionOrderAddForm.get('unitId').setValue(null);
    return;
  }

  // 🟢 Find all selected sales orders
  const selectedOrders = this.salesOrdersList.filter((so: any) => selectedIds.includes(so.id));

  // 🟢 Find the first sales order that contains the current produced item
  const matchedOrder = selectedOrders.find((so: any) =>
    so.data1 &&
    so.data1
      .split(',')
      .map((id: string) => Number(id.trim()))
      .includes(selectedItemId)
  );

  if (matchedOrder) {
  // ✅ Extract matching unitId from data3 (comma-separated)
  let unitId = 0;
  let qty = 0;
  if (matchedOrder.data1 && matchedOrder.data3) {
    const itemIds = matchedOrder.data1.split(',').map(x => Number(x.trim()));
    const unitIds = matchedOrder.data3.split(',').map(x => Number(x.trim()));
    const quantity = matchedOrder.data5.split(',').map(x => Number(x.trim()));
    const itemIndex = itemIds.indexOf(selectedItemId);
    if (itemIndex !== -1 && unitIds[itemIndex] != null) {
      unitId = unitIds[itemIndex];
      qty = quantity[itemIndex];
    }
     this.MainOrderQty = qty;          
  }
  debugger;
  this.ProductionOrderAddForm.get('unitId').setValue(unitId); 
  this.GetUnitRate(selectedItemId, unitId, () => {
    
  // 🔥 This code runs ONLY after unitRate is loaded
  this.ProductionOrderAddForm.get('qty').setValue(
    Math.floor(this.MainOrderQty / this.unitRate)
  );    
}); 
  

  // this.GetUnitRate(selectedItemId, unitId);    
  // this.GetMaterialItems(selectedItemId, unitId, this.MainOrderQty);
  // this.ProductionOrderAddForm.get('qty').setValue(this.MainOrderQty / this.unitRate );
} else {
  // Item doesn’t belong to any selected sales order
  this.MainOrderQty = 0;
  this.ProductionOrderAddForm.get('unitId').setValue(null);
  this.ProductionOrderAddForm.get('qty').setValue(0);
  this.unitRate = 0;
  this.finaltotalCost = 0;
  this.finalPhaseCost = 0;
  this.finalAmount = 0;
  this.finalUnitCost = 0;
  this.prodOrdersDTModels = [];
  this.ProductionOrderAddForm.get("productionsOrdersDTModels").setValue(this.prodOrdersDTModels);
  this.WorkCentersDTList = [];
  this.ProductionOrderAddForm.get("workCentersModels").setValue(this.WorkCentersDTList);
  this.OverheadCostsList = [];
  this.ProductionOrderAddForm.get("overheadCostsModels").setValue(this.OverheadCostsList);
}

  }

  onChangeProductedItemValue(val:any) {
    debugger
    if (val > 0) {
      this.service.GetItemUintbyItemId(val).subscribe(res => {
        this.itemsUnitList = res;
      });
    }
    else {
      this.itemsUnitList = [];
    }
  }

  calcTotalLine(row: any, index: number) {
    debugger
    // 🔹 تحديث الكمية الفعلية أو نسبة الهدر حسب المتغير الذي تم تغييره
    if (row.lastChanged === 'wastePerc' || row.lastChanged === undefined) {
      // المستخدم غيّر نسبة الهدر → احسب الكمية الفعلية
      if (row.qty && row.wastePerc >= 0) {
        row.actualQty = row.qty + (row.qty * row.wastePerc / 100);
      }
    } 
    else if (row.lastChanged === 'actualQty' || row.lastChanged === undefined) {
      // المستخدم غيّر الكمية الفعلية → احسب نسبة الهدر
      if (row.qty && row.actualQty >= 0) {
        row.wastePerc = ((row.actualQty - row.qty) / row.qty) * 100;
      }
    }

    // 🔹 حساب المجموع الإجمالي (التكلفة × الكمية الفعلية)
    if (row.cost > 0 && row.actualQty > 0) {
      row.total = this.formatCurrency(row.cost * row.actualQty);
    } else {
      row.total = 0;
    }

    this.OnCostChange();
    this.GetCurrentQty(row);
    this.updateAllFinalValues();
  }


  AddNewLineExpenses() {
    if (this.disableAll == true) {
      return;
    }
    if (this.expenssesDTList == null) {
      this.expenssesDTList = [];
    }
    this.expenssesDTList.push(
      {
        id: 0,
        hDId: 0,
        expensesTypeId: 0,
        amount: "",
        accId: 0,
        costCenterId: 0,
        index: "",
      });
    // this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList").setValue(this.purExpensesList);
  }

  onAddRowBeforeExpenses(rowIndex: number) {
    const newRow =
    {
      id: 0,
      hDId: 0,
      expensesTypeId: 0,
      amount: "",
      accId: 0,
      costCenterId: 0,
      index: "",
    };

    this.expenssesDTList.splice(rowIndex, 0, newRow);
    // this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList").setValue(this.purExpensesList);
  }

  deleteRowExpenses(rowIndex: number) {
    if (rowIndex !== -1) {
      this.expenssesDTList.splice(rowIndex, 1);
    }
    // this.PurcahseInvoiceAddForm.get("purchaseExpensesModelList").setValue(this.purExpensesList);
  }

  getVoucherNo(event: any) {
    debugger
    const selectedValue = event.value === undefined ? event : event.value;
    var serialType = this.voucherTypeList.find(option => option.label === selectedValue).serialType;
    var currencyId = this.voucherTypeList.find(option => option.label === selectedValue).currencyId;
    var branchId = this.voucherTypeList.find(option => option.label === selectedValue).branchId;
    this.DebitAccId = this.voucherTypeList.find(option => option.label === selectedValue).debitAccId;
    if(this.DebitAccId > 0)
      {
          this.ProductionOrderAddForm.get("debitAccountId").setValue(this.DebitAccId);
      }
    else
      {
          this.ProductionOrderAddForm.get("debitAccountId").setValue(0);
      }
    // this.allowAccRepeat = this.voucherTypeList.find(option => option.label === selectedValue).allowAccRepeat;
    var voucherCategory = this.ProductionOrderAddForm.value.voucherTypeEnum;
    var voucherTypeId = this.ProductionOrderAddForm.value.voucherTypeId;
    var date = new Date(this.ProductionOrderAddForm.value.orderDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (voucherTypeId > 0) {
      this.service.GetSerialVoucher(serialType, voucherTypeId, voucherCategory, year, month).subscribe((results) => {
        debugger
        if (results) {
          this.ProductionOrderAddForm.get("orderNo").setValue(results);
        }
        else {
          this.ProductionOrderAddForm.get("orderNo").setValue(1);
        }


      });

    }
    debugger
    if (voucherTypeId != 0 && voucherTypeId != null && voucherTypeId != undefined) {
      this.GetVoucherTypeSetting(voucherTypeId);
    }
  }

  GetVoucherTypeSetting(voucherTypeId: number) {
    debugger
    this.allowEditDate = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeDate;
    this.allowEditVoucherSerial = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeSerial;
    // this.allowEditBranch = this.voucherTypeList.find(option => option.label === voucherTypeId).preventChangeBranch;
  }

  PrintOpeningBalance(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptOpeningBalanceAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptOpeningBalanceEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  GetMaterialItems(itemId, unitId, qty, callback?: () => void) {
    debugger
      this.service.GetMaterialItems(itemId, unitId, qty).subscribe(res => {
        debugger
        if (res) {
          debugger
          this.prodOrdersDTModels = res.productionsOrdersDTModels;
          if(res.productionLinesList.length > 1)
            {
              this.FilteredProdLineList = res.productionLinesList;
            }
          else
            {
             this.FilteredProdLineList = this.ProdLineList;
            }          
          if (this.prodOrdersDTModels.length > 0) {
            for (let i = 0; i < this.prodOrdersDTModels.length; i++) {
              this.onChangeItem(this.prodOrdersDTModels[i], i)
              this.calcTotalLine(this.prodOrdersDTModels[i],i)
            }
            
            this.WorkCentersDTList = res.workCentersModels;
            this.OverheadCostsList= res.overheadCostsModels;
            this.ProductionOrderAddForm.get("productionsOrdersDTModels").setValue(this.prodOrdersDTModels)
            this.ProductionOrderAddForm.get("workCentersModels").setValue(this.WorkCentersDTList)
            this.ProductionOrderAddForm.get("overheadCostsModels").setValue(this.OverheadCostsList)
            this.updateAllFinalValues();
          }
        }
        if (callback) callback();
      });
  }

  AddNewLineWorkCenters() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.WorkCentersDTList == null) {
      this.WorkCentersDTList = [];
    }

    this.WorkCentersDTList.push(
      {
        id: 0,
        hDId: 0,
        phaseName: "",
        workCenter: "",
        standardTime: 0,
        minuteCost: 0,
        phaseCost: 0,
        notes: "",
        accountId:0,
      });
    this.ProductionOrderAddForm.get("workCentersModels").setValue(this.WorkCentersDTList);
  }

  claculatephaseCost() {
    for (let i = 0; i < this.WorkCentersDTList.length; i++) {
      const row = this.WorkCentersDTList[i];
      const standardTime = +row.standardTime || 0;
      const minuteCost = +row.minuteCost || 0;

      let totalphaseCost = standardTime * minuteCost;
      totalphaseCost = isNaN(totalphaseCost) ? 0 : parseFloat(totalphaseCost.toFixed(3));

      this.WorkCentersDTList[i].phaseCost = totalphaseCost;
    }

    this.OnPhaseCostChange();
    this.updateAllFinalValues();
  }

  OnPhaseCostChange() {
    debugger
    let totalPhaseCost = this.WorkCentersDTList
      ?.map(item => +item.phaseCost || 0)
      .reduce((sum, phaseCost) => sum + phaseCost, 0);

    this.finalPhaseCost = totalPhaseCost;
  }

  updateAllFinalValues() {

    this.finaltotalCost = this.prodOrdersDTModels.reduce((sum, item) => {
      return sum + (Number(item.total) || 0);
    }, 0);


    this.finalPhaseCost = this.WorkCentersDTList?.reduce((sum, stage) => {
      return sum + (stage.phaseCost || 0);
    }, 0) || 0;


    this.finalAmount = this.OverheadCostsList?.reduce((sum, cost) => {
      return sum + (cost.amount || 0);
    }, 0) || 0;
    let MainQty = this.ProductionOrderAddForm.get("qty").value;
    this.finalUnitCost = this.finaltotalCost + this.finalPhaseCost + this.finalAmount;
    this.TotalCostForTheEntireQty = this.formatCurrency(this.finaltotalCost + this.finalPhaseCost + this.finalAmount);
    this.CostPerUnit = this.formatCurrency(Number(this.TotalCostForTheEntireQty)/MainQty)
  }

  formatCurrency(value: number): string {
    return value.toFixed(3);
  }

  deleteRowWorkCenter(rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.WorkCentersDTList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.updateAllFinalValues();
    this.ProductionOrderAddForm.get("workCentersModels").setValue(this.WorkCentersDTList);
  }

  AddNewLineOverheadCosts() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.OverheadCostsList == null) {
      this.OverheadCostsList = [];
    }

    this.OverheadCostsList.push(
      {
        id: 0,
        hDId: 0,
        costType: 0,
        calculationMethod: 0,
        value: 0,
        time: 0,
        amount: 0,
        notes: "",
        accountId:0,
      });
    this.ProductionOrderAddForm.get("overheadCostsModels").setValue(this.OverheadCostsList);
  }

  onChangeCalculate(Row, i) {
    debugger
    if (Row.calculationMethod == 228) {
      this.OverheadCostsList[i].amount = this.OverheadCostsList[i].value * this.ProductionOrderAddForm.value.qty;
    }
    else if (Row.calculationMethod == 229) {
      this.OverheadCostsList[i].amount = this.OverheadCostsList[i].value * this.OverheadCostsList[i].time;
    }
    else if (Row.calculationMethod == 230) {
      this.OverheadCostsList[i].amount = (this.finalCost * this.OverheadCostsList[i].value) / 100;
    }
    else if (Row.calculationMethod == 231) {
      this.OverheadCostsList[i].amount = this.OverheadCostsList[i].value;
    }
    this.OnAmountChange();
    this.OnPhaseCostChange();
    this.TotalCostForTheEntireQty = this.finaltotalCost + this.finalPhaseCost + this.finalAmount;
    let MainQty = this.ProductionOrderAddForm.get("qty").value;
    this.CostPerUnit = this.formatCurrency(Number(this.TotalCostForTheEntireQty)/MainQty)
  }

  OnAmountChange() {
    let totalAmount = this.OverheadCostsList
      ?.map(item => +item.amount || 0)
      .reduce((sum, amount) => sum + amount, 0);

    this.finalAmount = totalAmount;
  }

  deleteRowOverhead(rowIndex: number) {
    if (rowIndex !== -1) {
      this.OverheadCostsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.updateAllFinalValues();
    this.ProductionOrderAddForm.get("overheadCostsModels").setValue(this.OverheadCostsList);
  }

  CalcRealQty()
  {
    debugger
    let MainQty = this.ProductionOrderAddForm.get("qty").value;
    let ActQty = this.ProductionOrderAddForm.get("actualQty").value;
    if(MainQty >0 && ActQty >0)
      {
        let val = ActQty - MainQty;
        if(val < 0)
          {
            this.ProductionOrderAddForm.get("damagedQty").setValue(val * -1)
            this.ProductionOrderAddForm.get("excessQty").setValue(0)
          }
        else
          {
            this.ProductionOrderAddForm.get("damagedQty").setValue(0)
            this.ProductionOrderAddForm.get("excessQty").setValue(val)
          }      
      }    
      this.CostPerUnit = this.formatCurrency(Number(this.TotalCostForTheEntireQty)/MainQty)
  }

  ValidationSave()
  {
    for (let i = 0; i < this.prodOrdersDTModels.length; i++) {
      if (this.prodOrdersDTModels[i].itemId == 0 || this.prodOrdersDTModels[i].itemId == null || this.prodOrdersDTModels[i].itemId == undefined) {
        this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
        this.disableSave = false;
        return true;
      }
      if (this.prodOrdersDTModels[i].unitId == 0 || this.prodOrdersDTModels[i].unitId == null || this.prodOrdersDTModels[i].unitId == undefined) {
        this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
        this.disableSave = false;
        return true;
      }
      if (this.prodOrdersDTModels[i].qty == 0 || this.prodOrdersDTModels[i].qty == null || this.prodOrdersDTModels[i].qty == undefined) {
        this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
        this.disableSave = false;
        return true;
      }
      if (this.prodOrdersDTModels[i].cost == 0 || this.prodOrdersDTModels[i].cost == null || this.prodOrdersDTModels[i].cost == undefined) {
        this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
        this.disableSave = false;
        return true;
      }
      if (this.prodOrdersDTModels[i].actualQty == 0 || this.prodOrdersDTModels[i].actualQty == null || this.prodOrdersDTModels[i].actualQty == undefined) {
        this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
        this.disableSave = false;
        return true;
      }
      // if (this.prodOrdersDTModels[i].creditAccId == 0 || this.prodOrdersDTModels[i].creditAccId == null || this.prodOrdersDTModels[i].creditAccId == undefined) {
      //   this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
      //   this.disableSave = false;
      //   return true;
      // }
      if (this.prodOrdersDTModels[i].storeId == 0 || this.prodOrdersDTModels[i].storeId == null || this.prodOrdersDTModels[i].storeId == undefined) {
        this.alert.ShowAlert("msgEnterAllDataMeterailasRawTable", 'error');
        this.disableSave = false;
        return true;
      }
    }

    if(this.WorkCentersDTList.length > 0)
    {
      for (let i = 0; i < this.WorkCentersDTList.length; i++) 
      {
        let row = this.WorkCentersDTList[i];
        if (row.phaseName == '' || row.phaseName == null || row.phaseName == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.workCenter == '' || row.workCenter == null || row.workCenter == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.standardTime == 0 || row.standardTime == null || row.standardTime == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.minuteCost == 0 || row.minuteCost == null || row.minuteCost == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.phaseCost == 0 || row.phaseCost == null || row.phaseCost == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.accountId == 0 || row.accountId == null || row.accountId == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          this.disableSave = false;
          return true;
        }
      }
    }
    
    if(this.OverheadCostsList.length > 0)
    {
      for (let i = 0; i < this.OverheadCostsList.length; i++) 
      {
        let row = this.OverheadCostsList[i];
        if (row.costType == 0 || row.costType == null || row.costType == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.calculationMethod == 0 || row.calculationMethod == null || row.calculationMethod == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.value == 0 || row.value == null || row.value == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          this.disableSave = false;
          return true;
        }
        if (row.amount == 0 || row.amount == null || row.amount == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          this.disableSave = false;
          return true;
        }   
        if (row.accountId == 0 || row.accountId == null || row.accountId == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          this.disableSave = false;
          return true;
        }    
      }
    }    

    let prodLine = this.ProductionOrderAddForm.value.productionLineId;
    if(prodLine == 0 || prodLine == null || prodLine == undefined)
      {
         this.alert.ShowAlert("MsgPleaseChooseProductionLine", 'error');
          this.disableSave = false;
          return true;
      }
  }

  OnCostChange() {
    let totalCost = this.prodOrdersDTModels
      ?.map(item => +item.cost || 0)
      .reduce((sum, cost) => sum + cost, 0);

    this.finalCost = totalCost;
  }

  onCheckboxChange(event:any)
  {
    debugger
    if(event.currentTarget.checked)
      {
         this.ProductionOrderAddForm.get("issueInvOutput").setValue(true);
      }
      else
      {
        this.ProductionOrderAddForm.get("issueInvOutput").setValue(false);
      }

  }

  GetUnitRate(itemId: number, unitId: number, callback?: () => void) {
  this.service.GetUnitRate(itemId, unitId).subscribe(rate => {
    this.unitRate = rate;
    if(this.opType == 'Add')
      {
         if(rate > 1)
          {
          let qty =  this.MainOrderQty / rate;
          this.ProductionOrderAddForm.get('qty').setValue(Math.floor(qty));
          }
        else
          {
            let qty = this.MainOrderQty * rate;
          this.ProductionOrderAddForm.get('qty').setValue(Math.floor(qty));
          }
        this.GetMaterialItems(itemId, unitId,  this.ProductionOrderAddForm.get('qty').value);
      }
   
    if (callback) callback(); // 🔥 Run calculation AFTER unitRate is ready
  });
}

  GetCurrentQty(row)
  {
    if(row.itemId  > 0 )
      {
        this.service.GetCurrentQty(row.itemId,row.storeId).subscribe(res => {
          this.remainingQty = res;
          this.showRemainQty = true;
          this.hideLabelAfterDelay();
          row.currentQty = res;
        // if(res > 0)
        //     {
        //       this.remainingQty = res;
        //       this.showRemainQty = true;
        //       this.hideLabelAfterDelay();
        //     }
        //   else
        //     {
        //       this.remainingQty = 0;
        //       this.showRemainQty = true;
        //       this.hideLabelAfterDelay();
        //     }
         })
    }
    else
      {
        this.remainingQty = 0;
      }    
  }

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showRemainQty = false;
    }, 5000);
  }

  PrintProdvoucher(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptProdvoucherAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptProdvoucherEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  FilterProdItems(event: any) {
  debugger;
  const selectedIds: number[] = event.value; // array of selected SalesOrder IDs

  // ✅ If "Please Select One" or empty → show everything
  if (!selectedIds || selectedIds.length === 0 || (selectedIds.length === 1 && selectedIds[0] === 0)) {
    this.filteredProdItems = this.itemsList;
    return;
  }

  // ✅ Filter selected sales orders
  const selectedOrders = this.salesOrdersList.filter(order =>
    selectedIds.includes(order.id)
  );

  // ✅ Extract all item IDs from data1 (comma-separated)
  const targetItemIds: number[] = selectedOrders
    .flatMap(o =>
      o.data1
        ? o.data1.split(',').map(x => Number(x.trim())).filter(x => !isNaN(x))
        : []
    );

  // ✅ Filter items list
  this.filteredProdItems = this.itemsList.filter(item =>
    item.id === 0 || targetItemIds.includes(item.id)
  );
  }

  ConvertIdsToString() {
    debugger
    let org = this.ProductionOrderAddForm.value.salesOrders;
    if (Array.isArray(org)) {
      let validOrgs = org
        .filter((method: any) => method !== null && method !== undefined)
        .map((method: any) => method.toString().trim());
      let OrgsString = validOrgs.join(',');
      this.ProductionOrderAddForm.get("salesOrders").setValue(OrgsString);
      console.log('Filtered paymentMethod:', OrgsString);
    } else {
      console.error('salesOrders is not an array');
    }  
    
  }

  ConvertIdsToNumber(data) {
    debugger
    if (data.salesOrders != null && data.salesOrders != undefined && data.salesOrders != "" && data.salesOrders != "0") {
      let org = data.salesOrders.split(',').map(Number)
      this.ProductionOrderAddForm.get("salesOrders").setValue(org);
    }
    else {
      this.ProductionOrderAddForm.get("salesOrders").setValue("");
    }      
  }

  OpenPO() {
    debugger
    if (this.prodOrdersDTModels.length > 0) {
      let filteredItems = this.prodOrdersDTModels.filter(r => r.qty > r.currentQty);
      localStorage.setItem('items', JSON.stringify(filteredItems));
      const url = `PurchaseRequest/PurchaseRequestForm?opType=createPO`;
      window.open(url, '_blank');
    }
    else {
      this.alert.ShowAlert("SelectItems", 'error');
    }

  }

  // OpenOutputVoucher() {
  //   debugger
  //   if (this.prodOrdersDTModels.length > 0) {
  //     localStorage.setItem('items', JSON.stringify(this.prodOrdersDTModels));
  //     const url = `ProductionOutPutVoucher/Prodoutputvoucherform?opType=createOutPutVoucher`;
  //     window.open(url, '_blank');
  //   }
  //   else {
  //     this.alert.ShowAlert("SelectItems", 'error');
  //   }

  // }

}
