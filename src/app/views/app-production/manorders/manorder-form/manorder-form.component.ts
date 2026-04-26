import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ManordersService } from '../manorders.service'; 
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
  selector: 'app-manorder-form',
  templateUrl: './manorder-form.component.html',
  styleUrls: ['./manorder-form.component.scss']
})
export class ManorderFormComponent implements OnInit {

  @ViewChild(AppGeneralAttachmentComponent) childAttachment:AppGeneralAttachmentComponent;

  ManOrderAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  itemsList: any;
  allUnitsList: any;
  ManOrderDTList: any[] = [];
  salesOrdersList: any[];
  prodSalesOrdersList: any[] = [];
  countriesList: any;
  customersList: any;
  unitsList: Array<any> = [];
  showLoader = false;
  orderId: any;
  porderId: any;
  showOnly = false;
  approval = false;
  salesOrderDTList: any;
  previousSelectedOrderId: any[] = [];
  RawMaterialList: any[] = [];
  selectedCountries : any;
  prodOrdersList:any[];
  disableSave:boolean;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private manordersService: ManordersService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void { 
    this.disableSave = false;
    this.porderId  = localStorage.getItem('porderId');
    localStorage.removeItem('porderId');
    this.orderId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    if(this.opType == 'Show')
      this.showOnly = true;
    else if(this.opType == 'Approval')
      this.approval = true;
    this.SetTitlePage();
    debugger
    // if (this.isEmpty(this.porderId) && this.isEmpty(this.orderId)) {
    //   this.router.navigate(['ManOrderList/ManOrderList']);
    // }
    this.InitiailManOrderForm();
    if(!this.isEmpty(this.porderId))
      this.GetProdDetails(this.porderId);
    else
      this.GetInitailManOrder();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ManOrderForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailManOrderForm() {
    this.ManOrderAddForm = this.formbulider.group({
      id: [0],
      orderNo: [0, [Validators.required]],
      orderDate: [null, [Validators.required]],
      deliveryDate: [null],
      productionOrderId: [0],
      status: [0],
      note:"",
      ManOrderDTList: [null, [Validators.required, Validators.minLength(1)]],      
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }

  GetProdDetails(porderId){    
    debugger
    this.manordersService.GetProdOrder(porderId).subscribe(result => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.router.navigate(['ManOrder/GetManOrdersList']);
        return
      }
      this.ManOrderDTList = result.manOrderDTList;
      this.prodOrdersList = result.prodOrdersList;
      this.countriesList = result.countryList;
      this.itemsList = result.itemsList;
      result.orderDate = formatDate( result.orderDate , "yyyy-MM-dd" ,"en-US");
      result.deliveryDate = formatDate( result.deliveryDate , "yyyy-MM-dd" ,"en-US");
      this.ManOrderAddForm.patchValue(result);
      this.ManOrderAddForm.get("ManOrderDTList").setValue(result.manOrderDTList);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
          this.ManOrderAddForm.get("productionOrderId").setValue(result.productionOrderId);
      });
      if(result.manOrderDTList !== null){
        let index = 0;
        this.ManOrderDTList.forEach(element=> {
          element.total = element.minProdQty > element.manufactQty ? element.minProdQty : element.manufactQty;// + element.freeQty + element.bonusQty + element.otherQty;
          var pm = element.countries.split(',').map(Number);
          element.countries= pm;
        })      
      } 
    })
  }
  
  GetProdDetailsById(event: any){    
    debugger
    const selectedNo = event.originalEvent.target.innerText;
    this.manordersService.GetProdOrder(selectedNo).subscribe(result => {  
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.router.navigate(['ManOrder/GetManOrdersList']);
        return
      }    
      this.countriesList = result.countryList;
      this.itemsList = result.itemsList;
      result.orderDate = formatDate( result.orderDate , "yyyy-MM-dd" ,"en-US");
      result.deliveryDate = formatDate( result.deliveryDate , "yyyy-MM-dd" ,"en-US");
      this.ManOrderDTList = result.manOrderDTList;
      this.ManOrderAddForm.patchValue(result);
      this.ManOrderAddForm.get("ManOrderDTList").setValue(result.manOrderDTList);
      if(result.manOrderDTList !== null){
        let index = 0;
        this.ManOrderDTList.forEach(element=> {
          element.total = element.minProdQty > element.manufactQty ? element.minProdQty : element.manufactQty;// + element.freeQty + element.bonusQty + element.otherQty;
          var pm = element.countries.split(',').map(Number);
          element.countries= pm;
        })      
      } 
    })
  }

  GetInitailManOrder() {
    this.manordersService.GetManOrder(this.orderId,this.opType).subscribe(result => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.router.navigate(['ManOrder/GetManOrdersList']);
        return
      }
      result.orderDate = formatDate( result.orderDate , "yyyy-MM-dd" ,"en-US");
      result.deliveryDate = formatDate( result.deliveryDate , "yyyy-MM-dd" ,"en-US");
      this.ManOrderAddForm.patchValue(result);
      this.allUnitsList = result.itemsUnitsList;
      this.itemsList = result.itemsList;
      this.countriesList = result.countryList;
      this.customersList = result.customersList;
      this.salesOrdersList = result.salesOrdersList;
      this.prodOrdersList = result.prodOrdersList;
      this.ManOrderAddForm.get("ManOrderDTList").setValue(result.manOrderDTList);
      if(result.manOrderDTList !== null){
        let index = 0;
        this.ManOrderDTList = result.manOrderDTList;
        this.ManOrderDTList.forEach(element=> {
          element.total = element.minProdQty > element.manufactQty ? element.minProdQty : element.manufactQty;// + element.freeQty + element.bonusQty + element.otherQty;
          var pm = element.countries.split(',').map(Number);
          element.countries= pm;
          this.itemsList.forEach(item => {
            if(item.data1 === element.itemNo){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == element.itemNo);
              index++;          
            }
          });
        })      
      }    

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(this.orderId > 0){
          this.ManOrderAddForm.get("productionOrderId").setValue(result.productionOrderId);
          //this.ManOrderAddForm.get("cus").setValue(result.cus);
          if(this.opType == 'Copy'){
            //this.getVoucherNo(result.v_Type);
            this.ManOrderAddForm.get("id").setValue(0);
          }
        }
      });
    })
  }
  
  OnSaveForms(temp) {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if(this.ManOrderDTList.length <= 0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }
    this.ManOrderDTList.forEach(element=> {      
      if((element.itemNo === '' || element.itemNo === null) || 
      (element.manufactQty === '' || element.manufactQty === null || element.manufactQty <= 0) || 
      (element.countries === '' || element.countries === null || element.countries.length == 0)) {  
      //(element.manFactQty === '' || element.manFactQty === null || element.manFactQty <= 0)){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.countries = element.countries.join(', ');
      // if(element.notAvlQty === true && temp == false){
      //   this.alert.ShowAlert("msgNoRawMaterial",'error');
      //   stopExecution = true;
      //   return false;
      // }
      element.index = index.toString();
      index++;
    })
    if (stopExecution) {
      return; 
    } 
    this.ManOrderAddForm.value.orderNo = this.ManOrderAddForm.value.orderNo.toString();
    this.ManOrderAddForm.value.ManOrderDTList = this.ManOrderDTList;
    this.manordersService.SaveManOrder(this.ManOrderAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.router.navigate(['ManOrder/GetManOrdersList']);
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })
  }

  getVoucherNo(event: any) {
    const serialType = event.value === undefined ? event : event.value;    
    if (serialType > 0) {
      this.manordersService.GetSerialVoucher(serialType).subscribe((results) => {
        if (results) {
          this.ManOrderAddForm.get("orderNo").setValue(results);
        }
        else {
          this.ManOrderAddForm.get("orderNo").setValue(1);
        }
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
    this.ManOrderAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  AddSONewLine(){    
    this.prodSalesOrdersList.push(
    {
      trans_no: "",
      customerName: "",
      date: null,
      deliveryDate: null,
      statusName: null,
      percentage: 0,
    });
    //this.ManOrderAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  calculateSum(type){
    if(this.ManOrderDTList != null){
      return this.ManOrderDTList.reduce((sum, item) => sum + item.manFactQty, 0);
    //   if(type == 1){
    //     return this.ManOrderDTList.reduce((sum, item) => sum + item.qty, 0);
    //   }
    //   else if(type == 2){
    //     return this.ManOrderDTList.reduce((sum, item) => sum + item.freeQty, 0);
    //   }
    //   else if(type == 3)
    //     return this.ManOrderDTList.reduce((sum, item) => sum + item.bonusQty, 0);
    //   else if(type == 4)
    //     return this.ManOrderDTList.reduce((sum, item) => sum + item.otherQty, 0);
    //   else if(type == 5)
    //     return this.ManOrderDTList.reduce((sum, item) => sum + (item.qty + item.freeQty + item.bonusQty + item.otherQty), 0);
    //   else if(type == 6)
    //     return this.ManOrderDTList.reduce((sum, item) => sum + item.manFactQty, 0);
    }    
  }

  GetItemUnits(row,i){
    if(row.itemNo != ''){
      this.manordersService.GetItemUnits(row.itemNo).subscribe((result) => {        
        row.itemUnitsList = result.itemsUnitsList;
        row.avlQty = result.avlQty;
        row.minProdQty = result.minProdQty;
        row.prodLineNo = result.prodLineNo;
        row.tubeCapacity = result.tubeCapacity;        
      });      
    }
  }

  updateSum(row: any): void {
    row.manufactQty = row.minProdQty * row.batchQty;
  }

  ApproveOrder(id: any) {
    debugger    
    this.manordersService.ApproveOrder(id).subscribe((result) => {      
      if (result.isSuccess) {
        this.alert.ShowAlert("RequestApproved","success");
        this.router.navigate(['ManOrder/GetManOrdersList']);
      }
      else {
        this.alert.SaveFaild();
      }      
    }); 
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.ManOrderDTList.splice(rowIndex, 1);
    }
    this.ManOrderAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  deleteSalesOrderRow(row, rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.ManOrderDTList = this.ManOrderDTList.filter(c=> c.salesOrderId !== row.trans_no);
      this.prodSalesOrdersList.splice(rowIndex, 1);
    }
    this.ManOrderAddForm.get("ManOrderDTList").setValue(this.ManOrderDTList);
  }

  isEmpty(input) {
    return input === '' || input === null || input === undefined;
  }
}

