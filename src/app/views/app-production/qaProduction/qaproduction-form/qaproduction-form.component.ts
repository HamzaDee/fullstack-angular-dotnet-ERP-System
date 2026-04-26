import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { QaproductionService } from '../qaproduction.service'; 
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-qaproduction-form',
  templateUrl: './qaproduction-form.component.html',
  styleUrls: ['./qaproduction-form.component.scss']
})
export class QaproductionFormComponent implements OnInit {

  QAAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  itemsList: any;
  allUnitsList: any;
  ManOrderDTList: any[] = [];
  manOrdersList: any[];
  qaDetailsList: any[] = [];
  countriesList: any;
  customersList: any;
  unitsList: Array<any> = [];
  showLoader = false;
  qaId: any;
  porderId: any;
  showOnly = false;
  approval = false;
  salesOrderDTList: any;
  previousSelectedOrderId: any[] = [];
  RawMaterialList: any[] = [];
  selectedCountries : any;
  disableSave:boolean;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private qaproductionService: QaproductionService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void { 
    this.porderId  = localStorage.getItem('porderId');
    localStorage.removeItem('porderId');
    this.qaId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    if(this.opType == 'Show')
      this.showOnly = true;
    else if(this.opType == 'Approval')
      this.approval = true;
    this.SetTitlePage();
    debugger
    this.disableSave = false;
    // if (this.isEmpty(this.porderId) && this.isEmpty(this.qaId)) {
    //   this.router.navigate(['ManOrderList/ManOrderList']);
    // }
    this.InitiailManOrderForm();
    if(!this.isEmpty(this.porderId))
      this.GetManufOrder(this.porderId);
    else
      this.GetInitailQA();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('QAList');
    this.title.setTitle(this.TitlePage);
  }

  InitiailManOrderForm() {
    this.QAAddForm = this.formbulider.group({
      id: [0],
      qaNo : [0],
      manfOrderId: [0, [Validators.required]],
      transDate: [null, [Validators.required]],
      userId : [0],
      QADetailsList: [null, [Validators.required, Validators.minLength(1)]],
      ManOrdersList: [null],      
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetManufOrder(morderId){    
    debugger
    this.qaDetailsList = [];
    this.qaproductionService.GetManufOrder(morderId.value).subscribe(result => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['QAProduction/GetQAList']);
          return;
        }
      if(result.length>0){
        result.forEach(element => {          
          element.prodDate = formatDate( element.prodDate , "yyyy-MM-dd" ,"en-US");
          element.expiryDate = formatDate( element.expiryDate , "yyyy-MM-dd" ,"en-US");
          var qty = element.batchNo;
          element.batchNo='';
          for (let i = 0; i < qty; i++) {            
            this.qaDetailsList.push({ ...element }); // Using spread operator to create a new object
          }
        });
      }      
      //this.qaDetailsList = result;
      this.QAAddForm.get("QADetailsList").setValue(this.qaDetailsList);
    })
  }
  
  GetInitailQA() {
    this.qaproductionService.GetQA(this.qaId,this.opType).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['QAProduction/GetQAList']);
          return;
        }
      result.transDate = formatDate( result.transDate , "yyyy-MM-dd" ,"en-US");
      this.QAAddForm.patchValue(result);
      this.manOrdersList = result.manOrdersList;
      this.qaDetailsList = result.qaDetailsList;
      this.qaDetailsList.forEach(e => {
        e.prodDate = formatDate( e.prodDate , "yyyy-MM-dd" ,"en-US");
        e.expiryDate = formatDate( e.expiryDate , "yyyy-MM-dd" ,"en-US");
      })
      this.QAAddForm.get("QADetailsList").setValue(this.qaDetailsList);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(this.qaId > 0){
          this.QAAddForm.get("manfOrderId").setValue(result.manfOrderId);
          //this.QAAddForm.get("cus").setValue(result.cus);
          if(this.opType == 'Copy'){
            //this.getVoucherNo(result.v_Type);
            this.QAAddForm.get("id").setValue(0);
          }
        }
      });
    })
  }

  CheckBatchNo(event: any) {
    debugger
    const inputElement = event.target as HTMLInputElement;
    const batchNo = inputElement.value;
    const duplicates = this.qaDetailsList.filter(element => element.batchNo === parseInt(batchNo));
    if (duplicates.length > 1) {
      this.alert.ShowAlert("batchNumberAvalaible", 'error');
      inputElement.value = '';
      this.itemsList.batchNo = null;
      setTimeout(() => inputElement.focus(), 10000);
      return false;
    }
    this.qaproductionService.CheckBatchNo(batchNo).subscribe(result => {
      if (result) {
        this.alert.ShowAlert("batchNumberAvalaible", 'error');
        inputElement.value = '';
        this.itemsList.batchNo = null;
        setTimeout(() => inputElement.focus(), 10000);
      }
    });
  }

  OnSaveForms(temp) {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    if(this.qaDetailsList.length <= 0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }
    this.qaDetailsList.forEach(element=> {      
      if((element.batchNo === '' || element.batchNo === null || element.batchNo <= 0)){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
    })
    if (stopExecution) {
      return; 
    } 
    this.QAAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.QAAddForm.value.userId = this.jwtAuth.getUserId();
    this.QAAddForm.value.manfOrderId = this.QAAddForm.value.manfOrderId.toString();
    this.QAAddForm.value.QADetailsList = this.qaDetailsList;
    // const transNosArray = this.prodSalesOrdersList.map(order => order.trans_no);
    // const transNos = transNosArray.join(',');
    // this.QAAddForm.value.salesOrders = transNos;

    this.qaproductionService.SaveQA(this.QAAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.router.navigate(['QAProduction/GetQAList']);
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  GetSalesOrder(event, row, index){
    debugger
    const qaId = event.value;//row.trans_no;  
    row.trans_no = event.value; // Update the current selected value
    this.previousSelectedOrderId[index] = event;

    if(this.ManOrderDTList !== undefined && this.ManOrderDTList.length > 0)  {
      if(this.ManOrderDTList.filter(c=> c.salesOrderId === qaId).length>0){
        this.alert.ShowAlert('SelectedRecord','error');
        row.trans_no = null;
        return;
      }
    }
    
    this.ManOrderDTList = this.ManOrderDTList.filter(c=> c.salesOrderId !== this.previousSelectedOrderId);

    if (qaId > 0) {
      this.qaproductionService.GetSalesOrder(qaId).subscribe((results) => {
        row.date = results.date;
        row.date = results.deliveryDate;
        row.statusName = results.statusName;
        row.percentage = results.percentage;
        this.salesOrderDTList = results.salesOrderDTList
        let index =0;
        this.salesOrderDTList.forEach(element=> {
          this.itemsList.forEach(item => {
            if(item.data1 === element.item_no){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == element.item_no);
              index++;          
            }
          });
          this.ManOrderDTList.push(
          {
            salesOrderId : qaId,
            bill : results.bill,
            itemNo: element.item_no,
            unitNo: element.unitNo,
            prodLineNo : element.prodLineNo,
            manufactQty: element.qty,
            minProdQty: element.freeQty,
            tubeCapacity: element.bonusQty,
            batchQty: element.otherQty,
            total:element.total,
            batchSize: element.avlQty,
            notAvlQty : false
          });
          this.QAAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
        })
      });      
    }
  }

  AddNewLine(){  
    if(this.ManOrderDTList === undefined){
      this.ManOrderDTList = [];
    }  
    this.ManOrderDTList.push(
    {
      salesOrderId : 0,
      itemNo: '',
      unitNo: 0,
      prodLineNo : 0,
      manufactQty: 0,
      minProdQty: 0,
      tubeCapacity: 0,
      batchQty: 0,
      total:0,
      batchSize: 0,
      countries:'',
      notAvlQty : false
    });
    this.QAAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  updateSum(row: any): void {
    row.total = (row.qty + row.freeQty + row.bonusQty + row.otherQty);
    //this.calculateSum(1);
    //this.calculateSum(2);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.ManOrderDTList.splice(rowIndex, 1);
    }
    this.QAAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  deleteSalesOrderRow(row, rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.ManOrderDTList = this.ManOrderDTList.filter(c=> c.salesOrderId !== row.trans_no);
      this.qaDetailsList.splice(rowIndex, 1);
    }
    this.QAAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  isEmpty(input) {
    return input === '' || input === null || input === undefined;
  }
}

