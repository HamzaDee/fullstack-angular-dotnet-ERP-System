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
import { ManfuEquationsService } from '../manfuequations.service';
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component';
import { CalculationMethodEnum } from 'app/shared/Enum/enum';

@Component({
  selector: 'app-manfuequations-form',
  templateUrl: './manfuequations-form.component.html',
  styleUrl: './manfuequations-form.component.scss'
})
export class ManfuequationsFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment: AppGeneralAttachmentComponent;
  manufEquationsAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  ManufEquationsDTList: any[] = [];
  WorkCentersDTList: any[] = [];
  OverheadCostsList: any[] = [];
  validDate = true;
  showLoader = false;
  newAccNo: string;
  voucherId: any;
  prodItemsList: any;
  rawItemsList: any;
  unitsList: Array<any> = [];
  allUntiesList: any;
  itemsUnitList: Array<any> = [];
  isdisabled: boolean = false;
  decimalPlaces: number;
  disableAll: boolean;
  voucherNo: number = 0;
  newDate: any;
  disableSave: boolean;
  CostTypeList: any;
  CalculationMethodList: any;
   Lang: any;

//  finalQty: number = 0;
  finalCost: number = 0;
  finalPhaseCost: number = 0;
  finalAmount: number = 0;
  finalUnitCost: number = 0;
  finaltotalCost: number = 0;


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
      private service: ManfuEquationsService
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
      this.router.navigate(['ManfuEquations/ManfuequationsList']);
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
    this.TitlePage = this.translateService.instant('manfuEquationsForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailEntryVoucherForm() {
    this.manufEquationsAddForm = this.formbulider.group({
      id: [0, [Validators.required]],
      companyId: [0],
      equationDate: ["", [Validators.required]],
      equationDesc: [""],
      itemId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      unitId: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      isActive: [false, Validators.required],
      qty:[1,[Validators.required]],
      //qty: [{ value: 1, disabled: true }, [Validators.required]],
      manufEquationsDTModel: [null, [Validators.required, Validators.minLength(1)]],
      WorkCentersDTModel: [null],
      OverheadCostsList: [null],
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
    this.service.GetInitailManuFuEquations(this.voucherId, this.opType).subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['ManfuEquations/ManfuequationsList']);
        return;
      }
      debugger
      result.equationDate = formatDate(result.equationDate, "yyyy-MM-dd", "en-US")
      this.prodItemsList = result.prodItemsList;
      this.rawItemsList = result.rawItemsList;
      this.allUntiesList = result.unitList;
      this.CostTypeList = result.costTypeList;
      this.CalculationMethodList = result.calculationMethodList;

      this.ManufEquationsDTList = result.manufEquationsDTModel;
      this.manufEquationsAddForm.get("manufEquationsDTModel").setValue(result.manufEquationsDTModel);
      if (this.ManufEquationsDTList.length > 0) {
        for (let i = 0; i < this.ManufEquationsDTList.length; i++) {
          this.onChangeItem(this.ManufEquationsDTList[i], i);
          this.claculateTotal();
        }
      }

      this.WorkCentersDTList = result.workCentersDTList;
      this.OverheadCostsList = result.overheadCostsList;
      this.OnAmountChange();
      this.OnPhaseCostChange();
      this.finalUnitCost = this.finaltotalCost + this.finalPhaseCost + this.finalAmount;


      debugger
      this.manufEquationsAddForm.patchValue(result);
      if (result.generalAttachModelList !== null && result.generalAttachModelList !== 0 && result.generalAttachModelList !== undefined) {
        this.manufEquationsAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
        this.childAttachment.data = result.generalAttachModelList;
        this.childAttachment.ngOnInit();
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        this.isdisabled = false;
        if (this.voucherId > 0) {
          this.manufEquationsAddForm.get("id").setValue(result.id);
          this.manufEquationsAddForm.get("equationDate").setValue(result.equationDate);
          this.manufEquationsAddForm.get("equationDesc").setValue(result.equationDesc);
          this.manufEquationsAddForm.get("itemId").setValue(result.itemId);
          this.service.GetItemUintbyItemId(result.itemId).subscribe(res => {
            this.itemsUnitList = res;
          });
          this.manufEquationsAddForm.get("unitId").setValue(result.unitId);
          this.manufEquationsAddForm.get("qty").setValue(result.qty);
        }
        else {
          debugger
          this.getVoucherNo();
          this.newDate = new Date;
          this.manufEquationsAddForm.get("equationDesc").setValue("");
          this.manufEquationsAddForm.get("itemId").setValue(0);
          this.manufEquationsAddForm.get("unitId").setValue(0);
          //this.manufEquationsAddForm.get("qty").setValue(0);
          this.manufEquationsAddForm.get("equationDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
          this.itemsUnitList = [];
        }

      }
      )
    });

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

  OnSaveForms() {
    this.disableSave = true;
    let stopExecution = false;
    for (let i = 0; i < this.ManufEquationsDTList.length; i++) {
      if (this.ManufEquationsDTList[i].itemId == 0 || this.ManufEquationsDTList[i].itemId == null || this.ManufEquationsDTList[i].itemId == undefined
        || this.ManufEquationsDTList[i].itemId == ''
      ) {
        this.alert.ShowAlert("msgEnterAllDataManufEquations", 'error');
        stopExecution = true;
        this.disableSave = false;
        this.switchTab('f01');
        return;
      }
      if (this.ManufEquationsDTList[i].unitId == 0 || this.ManufEquationsDTList[i].unitId == null || this.ManufEquationsDTList[i].unitId == undefined
        || this.ManufEquationsDTList[i].unitId == ''
      ) {
        this.alert.ShowAlert("msgEnterAllDataManufEquations", 'error');
        stopExecution = true;
        this.disableSave = false;
        this.switchTab('f01');
        return false;
      }
      if (this.ManufEquationsDTList[i].qty == 0 || this.ManufEquationsDTList[i].qty == null || this.ManufEquationsDTList[i].qty == undefined) {
        this.alert.ShowAlert("msgEnterAllDataManufEquations", 'error');
        stopExecution = true;
        this.disableSave = false;
        this.switchTab('f01');
        return false;
      }
      if (this.ManufEquationsDTList[i].cost == 0 || this.ManufEquationsDTList[i].cost == null || this.ManufEquationsDTList[i].cost == undefined) {
        this.alert.ShowAlert("msgEnterAllDataManufEquations", 'error');
        stopExecution = true;
        this.disableSave = false;
        this.switchTab('f01');
        return false;
      }
      if (this.ManufEquationsDTList[i].totalCost == 0 || this.ManufEquationsDTList[i].totalCost == null || this.ManufEquationsDTList[i].totalCost == undefined) {
        this.alert.ShowAlert("msgEnterAllDataManufEquations", 'error');
        stopExecution = true;
        this.disableSave = false;
        this.switchTab('f01');
        return false;
      }
    }
    debugger
    if (this.WorkCentersDTList != null && this.WorkCentersDTList.length > 0) {
      for (let i = 0; i < this.WorkCentersDTList.length; i++) {
        if (this.WorkCentersDTList[i].phaseName == null || this.WorkCentersDTList[i].phaseName == undefined || this.WorkCentersDTList[i].phaseName == '') {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f02');
          return false;
        }
        if (this.WorkCentersDTList[i].workCenter == null || this.WorkCentersDTList[i].workCenter == undefined || this.WorkCentersDTList[i].workCenter == '') {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f02');
          return false;
        }
        if (this.WorkCentersDTList[i].standardTime == 0 || this.WorkCentersDTList[i].standardTime == null || this.WorkCentersDTList[i].standardTime == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f02');
          return false;
        }
        if (this.WorkCentersDTList[i].minuteCost == 0 || this.WorkCentersDTList[i].minuteCost == null || this.WorkCentersDTList[i].minuteCost == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f02');
          return false;
        }
        if (this.WorkCentersDTList[i].phaseCost == 0 || this.WorkCentersDTList[i].phaseCost == null || this.WorkCentersDTList[i].phaseCost == undefined) {
          this.alert.ShowAlert("msgEnterAllDataWorkCenters", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f02');
          return false;
        }
      }
    }


    if (this.OverheadCostsList != null && this.OverheadCostsList.length > 0) {
      for (let i = 0; i < this.OverheadCostsList.length; i++) {
        if (this.OverheadCostsList[i].costType == 0 || this.OverheadCostsList[i].costType == null || this.OverheadCostsList[i].costType == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f03');
          return false;
        }
        if (this.OverheadCostsList[i].calculationMethod == 0 || this.OverheadCostsList[i].calculationMethod == null || this.OverheadCostsList[i].calculationMethod == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f03');
          return false;
        }
        if (this.OverheadCostsList[i].value == 0 || this.OverheadCostsList[i].value == null || this.OverheadCostsList[i].value == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f03');
          return false;
        }
        if (this.OverheadCostsList[i].time == null || this.OverheadCostsList[i].time == undefined) {
          this.OverheadCostsList[i].time = 0;
        }
        if (this.OverheadCostsList[i].amount == 0 || this.OverheadCostsList[i].amount == null || this.OverheadCostsList[i].amount == undefined) {
          this.alert.ShowAlert("msgEnterAllDataOverheadCosts", 'error');
          stopExecution = true;
          this.disableSave = false;
          this.switchTab('f03');
          return false;
        }
      }
    }

    if (stopExecution) {
      return;
    }
    debugger
    this.manufEquationsAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.manufEquationsAddForm.value.userId = this.jwtAuth.getUserId();
    this.manufEquationsAddForm.value.voucherNo = this.manufEquationsAddForm.value.id;//.toString();
    this.manufEquationsAddForm.value.manufEquationsDTModel = this.ManufEquationsDTList;
    this.manufEquationsAddForm.value.WorkCentersDTList = this.WorkCentersDTList;
    this.manufEquationsAddForm.value.OverheadCostsList = this.OverheadCostsList;
    this.manufEquationsAddForm.value.generalAttachModelList = this.childAttachment.getVoucherAttachData();
    debugger
    this.service.SaveManuFuEquations(this.manufEquationsAddForm.value)
      .subscribe((result) => {
        if (result) {
          this.alert.SaveSuccess();
          this.router.navigate(['ManfuEquations/ManfuequationsList']);
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo() {
    this.service.GetSerialVoucher().subscribe((results) => {
      if (results) {
        this.manufEquationsAddForm.get("id").setValue(results);
      }
      else {
        this.manufEquationsAddForm.get("id").setValue(1);
      }
    });
  }

  AddNewLine() {
    debugger
    if (this.disableAll == true) {
      return;
    }
    if (this.ManufEquationsDTList == null) {
      this.ManufEquationsDTList = [];
    }

    this.ManufEquationsDTList.push(
      {
        id: 0,
        hDId: 0,
        itemId: 0,
        unitId: 0,
        qty: 0,
        wastePerc: 0,
        cost: 0,
        totalCost: 0,
        note: "",
        index: ""
      });
    debugger
    this.manufEquationsAddForm.get("manufEquationsDTModel").setValue(this.ManufEquationsDTList);
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
      });
    this.manufEquationsAddForm.get("WorkCentersDTList").setValue(this.WorkCentersDTList);
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
        notes: ""
      });
    this.manufEquationsAddForm.get("OverheadCostsList").setValue(this.OverheadCostsList);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.ManufEquationsDTList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.updateAllFinalValues();
    this.manufEquationsAddForm.get("manufEquationsDTModel").setValue(this.ManufEquationsDTList);
  }

  deleteRowWorkCenter(rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.WorkCentersDTList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }
    this.updateAllFinalValues();
    this.manufEquationsAddForm.get("WorkCentersDTModel").setValue(this.WorkCentersDTList);
  }

  deleteRowOverhead(rowIndex: number) {
    if (rowIndex !== -1) {
      this.OverheadCostsList.splice(rowIndex, 1);
      this.unitsList.splice(rowIndex, 1);
    }    
    this.updateAllFinalValues();
    this.manufEquationsAddForm.get("OverheadCostsList").setValue(this.OverheadCostsList);
  }

  onAddRowBeforeWorkCenters(rowIndex: number) {
    const newRow =
    {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      qty: 0,
      index: ""
    };

    this.WorkCentersDTList.splice(rowIndex, 0, newRow);
    this.manufEquationsAddForm.get("WorkCentersDTModel").setValue(this.WorkCentersDTList);
  }

  onAddRowBefore(rowIndex: number) {
    const newRow =
    {
      id: 0,
      hDId: 0,
      itemId: 0,
      unitId: 0,
      qty: 0,
      wastePerc: 0,
      cost: 0,
      totalCost: 0,
      note: "",
      index: ""
    };

    this.ManufEquationsDTList.splice(rowIndex, 0, newRow);
    this.manufEquationsAddForm.get("manufEquationsDTModel").setValue(this.ManufEquationsDTList);
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

/*     if (Row.itemId !== 0 && Row.itemId !== null) {
      this.ManufEquationsDTList[i].unitId = 0;
      this.ManufEquationsDTList[i].qty = 0;
      this.ManufEquationsDTList[i].wastePerc = 0;
      this.ManufEquationsDTList[i].cost = 0;
      this.ManufEquationsDTList[i].totalCost = 0;
    } */

    if (Row.itemId !== 0 && Row.itemId !== null) {
      this.service.GetItemUintbyItemId(Row.itemId).subscribe(res => {
        this.unitsList[i] = res;
      });
    }
  }

  onChangeCalculate(Row, i) {
    debugger
    if (Row.calculationMethod == 228) {
      this.OverheadCostsList[i].amount = this.OverheadCostsList[i].value * this.manufEquationsAddForm.value.qty;
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
    this.finalUnitCost = this.finaltotalCost + this.finalPhaseCost + this.finalAmount;
  }

/*   OnQtyChange() {
    debugger
    let totalQty = this.ManufEquationsDTList
      ?.map(item => +item.qty || 0)
      .reduce((sum, qty) => sum + qty, 0);

    this.finalQty = totalQty;
  } */

  OnCostChange() {
    let totalCost = this.ManufEquationsDTList
      ?.map(item => +item.cost || 0)
      .reduce((sum, cost) => sum + cost, 0);

    this.finalCost = totalCost;
  }

  OnPhaseCostChange() {
    debugger
    let totalPhaseCost = this.WorkCentersDTList
      ?.map(item => +item.phaseCost || 0)
      .reduce((sum, phaseCost) => sum + phaseCost, 0);

    this.finalPhaseCost = totalPhaseCost;
  }

  OnAmountChange() {
    let totalAmount = this.OverheadCostsList
      ?.map(item => +item.amount || 0)
      .reduce((sum, amount) => sum + amount, 0);

    this.finalAmount = totalAmount;
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
            this.router.navigate(['ManfuEquations/ManfuequationsList']);
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

  onChangeProductedItem(event) {
    debugger
    if (event.value > 0) {
      this.service.CheckIfExistItemId(event.value).subscribe(res => {
        if (res) {
          this.alert.ShowAlert("msgProducedItemIsAlreadyHaveEquation", 'error');
          this.manufEquationsAddForm.get("itemId").setValue(0);
          this.itemsUnitList = [];
          return;

        }
        else {
          this.service.GetItemUintbyItemId(event.value).subscribe(res => {
            this.itemsUnitList = res;
          });
        }
      });
    }
  }

  claculateTotal() {
    let finalTotal = 0;

    for (let i = 0; i < this.ManufEquationsDTList.length; i++) {
      const row = this.ManufEquationsDTList[i];
      const qty = +row.qty || 0;
      const cost = +row.cost || 0;

      let totalCost = qty * cost;
      totalCost = isNaN(totalCost) ? 0 : parseFloat(totalCost.toFixed(3));

      row.totalCost = totalCost;
      finalTotal += totalCost;
    }

    this.finaltotalCost = finalTotal;
    //this.OnQtyChange();
    this.OnCostChange();
    this.updateAllFinalValues();
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

  updateAllFinalValues() {

  this.finaltotalCost = this.ManufEquationsDTList.reduce((sum, item) => {
    return sum + (item.totalCost || 0);
  }, 0);


  this.finalPhaseCost = this.WorkCentersDTList?.reduce((sum, stage) => {
    return sum + (stage.phaseCost || 0);
  }, 0) || 0;


  this.finalAmount = this.OverheadCostsList?.reduce((sum, cost) => {
    return sum + (cost.amount || 0);
  }, 0) || 0;

  this.finalUnitCost = this.finaltotalCost + this.finalPhaseCost + this.finalAmount;
}

formatCurrency(value: number): string {
  return value.toFixed(3); 
}


    PrintManfuequations(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptManfuEquationsAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptManfuEquationsEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
