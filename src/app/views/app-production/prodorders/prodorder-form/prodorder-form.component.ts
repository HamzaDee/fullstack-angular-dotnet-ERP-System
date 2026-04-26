import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ProdordersService } from '../prodorders.service'; 
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RawMaterialsComponent } from '../raw-materials/raw-materials.component';
import { tr } from 'date-fns/locale';
import { UnavlRawMaterialsComponent } from '../unavl-raw-materials/unavl-raw-materials.component';
import { AvailableQtyComponent } from './available-qty/available-qty.component';

@Component({
  selector: 'app-prodorder-form',
  templateUrl: './prodorder-form.component.html',
  styleUrls: ['./prodorder-form.component.scss']
})
export class ProdorderFormComponent implements OnInit {

  @ViewChild(AppGeneralAttachmentComponent) childAttachment:AppGeneralAttachmentComponent;

  ProdOrderAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  itemsList: any;
  allUnitsList: any;
  ProdOrderDTList: any[] = [];
  salesOrdersList: any[];
  prodSalesOrdersList: any[] = [];
  countryList: any;
  customersList: any;
  showLoader = false;
  orderId: any;
  showOnly = false;
  approval = false;
  salesOrderDTList: any;
  previousSelectedOrderId: any[] = [];
  RawMaterialList: any[] = [];
  transferQty : any[] = [];
  reservedQty: number;
  disableSave:boolean;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private prodordersService: ProdordersService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private appCommonserviceService : AppCommonserviceService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void { 
    this.orderId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    if(this.opType == 'Show')
      this.showOnly = true;
    else if(this.opType == 'Approval')
      this.approval = true;
    this.SetTitlePage();
    if (this.orderId == null || this.orderId == undefined || this.orderId === "") {
      this.router.navigate(['ProdOrder/GetProdOrdersList']);
    }
    this.disableSave = false;
    this.InitiailProdOrderForm();
    this.GetInitailProdOrder();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProdOrderForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailProdOrderForm() {
    this.ProdOrderAddForm = this.formbulider.group({
      id: [0],
      orderNo: [0, [Validators.required]],
      orderDate: [null, [Validators.required]],
      deliveryDate: [null],
      salesOrders: [null],
      status: [0],
      note:"",
      ProdOrderDTList: [null, [Validators.required, Validators.minLength(1)]],    
      TransferQtyList  : [null]
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }
  
  GetInitailProdOrder() {
    this.prodordersService.GetProdOrder(this.orderId,this.opType).subscribe(result => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.router.navigate(['ProdOrder/GetProdOrdersList']);
        return
      }
      result.orderDate = formatDate( result.orderDate , "yyyy-MM-dd" ,"en-US");
      result.deliveryDate = formatDate( result.deliveryDate , "yyyy-MM-dd" ,"en-US");
      this.ProdOrderAddForm.patchValue(result);
      this.allUnitsList = result.itemsUnitsList;
      this.itemsList = result.itemsList;
      this.countryList = result.countryList;
      this.customersList = result.customersList;
      this.salesOrdersList = result.salesOrdersList;
      if(result.prodSalesOrdersList !== null)
        this.prodSalesOrdersList = result.prodSalesOrdersList;
      this.ProdOrderAddForm.get("ProdOrderDTList").setValue(result.prodOrderDTList);
      if(result.prodOrderDTList !== null){
        let index = 0;
        this.ProdOrderDTList = result.prodOrderDTList;
        this.ProdOrderDTList.forEach(element=> {
          element.total = element.qty + element.freeQty + element.bonusQty + element.otherQty;
          if((element.qty * element.manFactQty) > element.avlQty ){
            element.notAvlQty = true;
            return;
          }
        })   
        this.calculateSum(1);
        this.calculateSum(2);     
        this.calculateSum(3);     
        this.calculateSum(2);     
        this.calculateSum(5);     
        this.calculateSum(6);     
      }    

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(this.orderId > 0){
          //this.ProdOrderAddForm.get("v_Type").setValue(result.v_Type);
          //this.ProdOrderAddForm.get("cus").setValue(result.cus);
          if(this.opType == 'Copy'){
            //this.getVoucherNo(result.v_Type);
            this.ProdOrderAddForm.get("id").setValue(0);
          }
        }
      });
    })
  }
  
  CheckAvlQty(row: any){
    debugger
    if (row.itemNo !== null)
    {
      row.notAvlQty = false;
      this.prodordersService.GetItemRawMaterials(row.itemNo).subscribe(result => {
        this.RawMaterialList = result;
        this.RawMaterialList.forEach(element=> {
          if((element.qty * row.manFactQty) > element.avlQty ){
            row.notAvlQty = true;
            return;
          }
        })
      })
    }
    this.ProdOrderDTList.forEach(element=> {

    })
  }

  OnSaveForms(temp) {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if(this.ProdOrderDTList.length <= 0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }
    this.ProdOrderDTList.forEach(element=> {      
      if((element.itemNo === '' || element.itemNo === null) || 
      (element.total === '' || element.total === null || element.total <= 0) || 
      (element.unitNo === '' || element.unitNo === null || element.unitNo <= 0) || 
      (element.manFactQty === '' || element.manFactQty === null || element.manFactQty <= 0)){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if(element.manFactQty<element.minProdQty){
        this.alert.ShowAlert("msgFacQtyLessminFacqty",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if(element.notAvlQty === true && temp == false){
        this.alert.ShowAlert("msgNoRawMaterial",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    })
    if (stopExecution) {
      return; 
    } 
    this.ProdOrderAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.ProdOrderAddForm.value.userId = this.jwtAuth.getUserId();
    this.ProdOrderAddForm.value.orderNo = this.ProdOrderAddForm.value.orderNo.toString();
    this.ProdOrderAddForm.value.ProdOrderDTList = this.ProdOrderDTList;
    this.ProdOrderAddForm.value.TransferQtyList = this.transferQty;
    const transNosArray = this.prodSalesOrdersList.map(order => order.trans_no);
    const transNos = transNosArray.join(',');
    this.ProdOrderAddForm.value.salesOrders = transNos;

    this.prodordersService.SaveProdOrder(this.ProdOrderAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.router.navigate(['ProdOrder/GetProdOrdersList']);
          localStorage.setItem('porderId',this.ProdOrderAddForm.value.orderNo.toString());
          const url = `ManOrder/ManOrderForm`; 
          if(temp === false){
            window.open(url, '_blank');
          }          
        }
        else {
          this.alert.SaveFaild();
        }
      })
  }

  getVoucherNo(event: any) {
    const serialType = event.value === undefined ? event : event.value;    
    if (serialType > 0) {
      this.prodordersService.GetSerialVoucher(serialType).subscribe((results) => {
        if (results) {
          this.ProdOrderAddForm.get("orderNo").setValue(results);
        }
        else {
          this.ProdOrderAddForm.get("orderNo").setValue(1);
        }
      });
    }
  }

  GetSalesOrder(event, row, index){
    debugger
    const orderId = event.value;//row.trans_no;  
    row.trans_no = event.value; // Update the current selected value
    this.previousSelectedOrderId[index] = event;

    if(this.ProdOrderDTList !== undefined && this.ProdOrderDTList.length > 0)  {
      if(this.ProdOrderDTList.filter(c=> c.salesOrderId === orderId).length>0){
        this.alert.ShowAlert('SelectedRecord','error');
        row.trans_no = null;
        return;
      }
    }
    
    this.ProdOrderDTList = this.ProdOrderDTList.filter(c=> c.salesOrderId !== this.previousSelectedOrderId);

    if (orderId > 0) {
      this.prodordersService.GetSalesOrder(orderId).subscribe((results) => {
        row.date = results.sdate;
        row.deliveryDate = results.deliveryDate;
        row.statusName = results.statusName;
        row.percentage = results.percentage;
        row.countryName = results.countryName;
        row.countryId = results.countryId;
        this.salesOrderDTList = results.salesOrderDTList
        let index = this.ProdOrderDTList.length;
        this.salesOrderDTList.forEach(element=> {
          var total = element.oq2 + element.freeQty + element.bonusQty + element.otherQty;
          var manFactQty = 0;
          if(total < element.minProdQty){
            manFactQty = element.minProdQty;
          }
          else{
            manFactQty = total;
          }
          var notAvlQty = false;
          for (const rowitem of element.itemRawMaterials){
            if((rowitem.qty * manFactQty) > rowitem.avlQty ){
              notAvlQty = true;
              break;
            }
          }
          const newRow =
          {
            salesOrderId : orderId,
            bill : results.sales_No,
            itemNo: element.item_no,
            unitNo: element.unitNo,
            prodLineNo : element.prodLineNo,
            qty: element.oq2,
            freeQty: element.freeQty,
            bonusQty: element.bonusQty,
            otherQty: element.otherQty,
            total:element.oq2 + element.freeQty + element.bonusQty + element.otherQty,
            avlQty: element.avlQty,
            minProdQty : element.minProdQty,
            manFactQty : manFactQty,
            notAvlQty : notAvlQty,
            itemUnitsList: element.itemUnitsList,
            checked: false
          };
          this.ProdOrderDTList = [...this.ProdOrderDTList, newRow];
          this.ProdOrderAddForm.get("ProdOrderDTList").setValue(this.ProdOrderDTList);
        })
      });      
    }
  }

  AddNewLine(){    
    debugger
    const newRow =
    {
      salesOrderId : 0,
      itemNo: '',
      unitNo: 0,
      prodLineNo : 0,
      qty: "",
      freeQty: "",
      bonusQty: "",
      otherQty: "",
      total:0,
      avlQty: 0,
      minFactQty : 0,
      manFactQty : "",
      notAvlQty : false,
      itemUnitsList: null,
      checked: false
    }
    this.ProdOrderDTList = [...this.ProdOrderDTList, newRow];
    this.ProdOrderAddForm.get('ProdOrderDTList').setValue(this.ProdOrderDTList);
  }

  checkQty(row){
    debugger
    if(row.checked){
      row.manFactQty = row.total - row.avlQty;
      if(row.manFactQty < 0)
        row.manFactQty = 0;
    }
    else{
      if(row.total < row.minProdQty){
        row.manFactQty = row.minProdQty;
      }
      else{
        row.manFactQty = row.total;
      }
    }
    
    this.ProdOrderDTList.filter(c=> c.itemNo == row.itemNo).forEach(element=> {
      if(element.salesOrderId !== row.salesOrderId){
        if(row.checked)
          element.avlQty = element.avlQty - row.total;
        else
          element.avlQty = element.avlQty + row.total;
        if(element.avlQty < 0 )
          element.avlQty = 0;
      }      
    }) 
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
      countryName : ""
    });
  }

  calculateSum(type){
    if(this.ProdOrderDTList != null){
      if(type == 1){
        return this.ProdOrderDTList.reduce((sum, item) => sum + item.qty, 0);
      }
      else if(type == 2){
        return this.ProdOrderDTList.reduce((sum, item) => sum + item.freeQty, 0);
      }
      else if(type == 3)
        return this.ProdOrderDTList.reduce((sum, item) => sum + item.bonusQty, 0);
      else if(type == 4)
        return this.ProdOrderDTList.reduce((sum, item) => sum + item.otherQty, 0);
      else if(type == 5)
        return this.ProdOrderDTList.reduce((sum, item) => sum + (item.qty + item.freeQty + item.bonusQty + item.otherQty), 0);
      else if(type == 6)
        return this.ProdOrderDTList.reduce((sum, item) => sum + item.manFactQty, 0);
    }    
  }

  calculateResQty(itemNo){
    if(this.transferQty.length>0)
      return this.transferQty.filter(item => item.itemNo === itemNo).reduce((sum, item) => sum + item.qty, 0);
    else
      return 0;
  }

  GetItemUnits(row,i){
    debugger
    if(row.itemNo != ''){
      this.prodordersService.GetItemUnits(row.itemNo).subscribe((result) => {        
        row.itemUnitsList = result.itemsUnitsList;
        row.avlQty = result.avlQty;
        row.minProdQty = result.minProdQty;
        row.prodLineNo = result.prodLineNo;
      });      
    }
  }

  updateSum(row: any): void {
    row.total = (row.qty + row.freeQty + row.bonusQty + row.otherQty);
    if(row.total < row.minProdQty){
      row.manFactQty = row.minProdQty;
    }
    else{
      row.manFactQty = row.total;
    }
    //this.calculateSum(1);
    //this.calculateSum(2);
  }

  ApproveOrder(id: any) {
    debugger    
    this.prodordersService.ApproveOrder(id).subscribe((result) => {  
      debugger    
      if (result.isSuccess) {
        this.alert.ShowAlert("RequestApproved","success");
        this.router.navigate(['ProdOrder/GetProdOrdersList']);
      }
      else {
        this.alert.SaveFaild();
      }      
    }); 
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.ProdOrderDTList.splice(rowIndex, 1);
    }
    this.ProdOrderAddForm.get("ProdOrderDTList").setValue(this.ProdOrderDTList);
  }

  deleteSalesOrderRow(row, rowIndex: number) {
    debugger
    if (rowIndex !== -1) {
      this.ProdOrderDTList = this.ProdOrderDTList.filter(c=> c.salesOrderId !== row.trans_no);
      this.prodSalesOrdersList.splice(rowIndex, 1);
    }
    this.ProdOrderAddForm.get("ProdOrderDTList").setValue(this.ProdOrderDTList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetItemRawMaterials(row: any, rowIndex: number){
    debugger
    var itemName = this.itemsList.find(option => option.data1 === row.itemNo).text;
    let title = this.translateService.instant('RawMaterial');
    let dialogRef: MatDialogRef<any> = this.dialog.open(RawMaterialsComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, itemName: itemName, totQty: row.manFactQty, itemNo: row.itemNo, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId()}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          return;
        }
      })
  }

  GetQtyByCountry(row: any, rowIndex: number){
    debugger
    var itemName = this.itemsList.find(option => option.data1 === row.itemNo).text;
    var salesOrderId = row.salesOrderId;
    var toCountryId = this.prodSalesOrdersList.find(c=> c.trans_no === salesOrderId).countryId;
    let title = this.translateService.instant('QtyByCountry');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AvailableQtyComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, itemName: itemName, totQty: row.manFactQty, itemNo: row.itemNo, rowIndex: rowIndex, companyid: this.jwtAuth.getCompanyId()}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null  && res.length>0) {
          this.transferQty = this.transferQty.filter(item => item.itemNo !== row.itemNo);
          res.forEach(element => {
            element.toCountryId = toCountryId;
            this.transferQty.push(
              {
                itemNo: row.itemNo,
                unitNo: row.unitNo,
                batchNo: element.batchNo,
                fromCountryId: element.fromCountryId,
                toCountryId: element.toCountryId,
                qty: element.reqQty,
                index: rowIndex
              });
          });
          this.reservedQty = res.reduce((sum, item) => sum + item.reqQty, 0);
          //this.transferQty = [...this.transferQty, res];
          return;
        }
      })
  }

  OpenPO(){
    debugger
    let title = this.translateService.instant('UnavlItems');
    let dialogRef: MatDialogRef<any> = this.dialog.open(UnavlRawMaterialsComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title,itemsList: this.ProdOrderDTList.filter(c=> c.notAvlQty === true), companyid: this.jwtAuth.getCompanyId()}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          return;
        }
      })
  }
}

