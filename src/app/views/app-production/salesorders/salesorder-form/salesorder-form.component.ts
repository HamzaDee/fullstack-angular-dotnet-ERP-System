import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { SalesordersService } from '../salesorders.service'; 
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-salesorder-form',
  templateUrl: './salesorder-form.component.html',
  styleUrls: ['./salesorder-form.component.scss']
})
export class SalesorderFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment:AppGeneralAttachmentComponent;
  isInputDisabled: boolean = true;
  SalesOrderAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  itemsList: any;
  allUnitsList: any;
  SalesOrderDTList: any[] = [];
  orderTypeList: any;
  countryList: any;
  allCustomersList: any;
  customersList: any;
  unitsList: Array<any> = [];
  storesList: any;
  salesOrderStsList:any;
  showLoader = false;
  orderId: any;
  showOnly = false;
  approval = false;
  fTotal: any;
  allowedDiscount: number = 0;
  fNetTotal: any;
  hideStatus:boolean;
  statuss:any;
  disableSave:boolean;
  itemWithPriceList:any;
  disableAll:boolean=false;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private salesordersService: SalesordersService,
    private translateService: TranslateService,
    public router: Router,
    private formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private appCommonserviceService : AppCommonserviceService,
    private cdr :ChangeDetectorRef,
  ) { }

  ngOnInit(): void { 
    debugger
    this.disableSave = false;
    this.orderId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    this.statuss = this.routePartsService.Guid3ToEdit;
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('GuidToEdit') != null) {
      this.orderId = queryParams.get('GuidToEdit');
      this.opType = queryParams.get('Guid2ToEdit');;
    }
    else if (this.orderId == 0) {
      this.orderId = 0;
      this.opType = 'Add';
      
    }
    else {
      this.orderId = this.routePartsService.GuidToEdit;
      this.opType = this.routePartsService.Guid2ToEdit;
    }

    if(this.opType == 'Show')
      this.showOnly = true;
    else if(this.opType == 'Approval')
      this.approval = true;

    if(this.opType == 'New' || this.opType == 'Copy'  || this.opType == 'Add' ||this.opType == 'Approval' )
      {
        this.hideStatus = true;
      }
      else
      {
        this.hideStatus = false;
      }
    this.SetTitlePage();
    if (this.orderId == null || this.orderId == undefined || this.orderId === "") {
      this.router.navigate(['SalesOrder/SalesOrderList']);
    }
    this.InitiailSalesOrderForm();
    this.GetInitailSalesOrder();

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
    if(this.opType == 'Show')
      {
        this.TitlePage = this.translateService.instant('ShowSalesOrder');
        this.title.setTitle(this.TitlePage);
      }
      else
      {
        this.TitlePage = this.translateService.instant('SalesOrderForm');
        this.title.setTitle(this.TitlePage);
      }
    
  }

  InitiailSalesOrderForm() {
    this.SalesOrderAddForm = this.formbulider.group({
      trans_no: [0],
      sales_No: [0, [Validators.required]],
      v_type: [0, [Validators.required, Validators.min(1)]],
      myear : [0],
      percentage: [0],
      deliveryDate: [null],
      sdate: ["", [Validators.required]],
      cus: [0, [Validators.required, Validators.min(1)]],
      status: [0],
      note:"",
      userId:0,
      countryId : 0,
      salesOrderDTList: [null, [Validators.required, Validators.minLength(1)]],      
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }
  
  setDeliveryDate(event){
    debugger
    const date = new Date(event.target.value);
    date.setDate(date.getDate() + 45);
    this.SalesOrderAddForm.get("deliveryDate").setValue(formatDate( date , "yyyy-MM-dd" ,"en-US"));
  }

  GetInitailSalesOrder() {
    debugger
    this.salesordersService.GetSalesOrder(this.orderId,this.opType).subscribe(result => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission",'error');
        this.router.navigate(['SalesOrder/SalesOrderList']);
        return;
      }
      debugger

      result.sdate = formatDate( result.sdate , "yyyy-MM-dd" ,"en-US");
      if(result.deliveryDate === null){
        const date = new Date(result.sdate);
        result.deliveryDate = date.setDate(date.getDate() + 45);
      }
      result.deliveryDate = formatDate( result.deliveryDate , "yyyy-MM-dd" ,"en-US");

      if(this.opType == 'Copy')
        {
          const currentDate = new Date(); // Get current date
          result.sdate = formatDate(currentDate, 'yyyy-MM-dd', 'en-US');      
        }
        
      this.SalesOrderAddForm.patchValue(result);
      this.allUnitsList = result.itemsUnitsList;
      this.salesOrderStsList = result.prodSalesOrderStsList;
      this.itemsList = result.itemsList;
      this.countryList = result.countryList;
      this.customersList = result.customersList;
      this.allCustomersList = result.customersList;
      this.orderTypeList = result.voucherTypeList;
      if(result.salesOrderDTList !== null){
        let index = 0;
        this.SalesOrderDTList = result.salesOrderDTList;
        
        this.SalesOrderDTList.forEach(element=> {          
          element.total = element.oq2 + (element.freeQty ?? 0) + (element.bonusQty ?? 0) + (element.otherQty ?? 0);
          this.itemsList.forEach(item => {
            if(item.data1 === element.item_no){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == element.item_no);
              index++;          
            }
          });
          this.allowedDiscount = element.disAmt;
          
          this.updateSum();
        })   
/*         this.calculateSum(1);
        this.calculateSum(2);     
        this.calculateSum(3);     
        this.calculateSum(2);     
        this.calculateSum(5);  */    
      }    

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        if(this.orderId > 0){
          debugger
          this.SalesOrderAddForm.get("v_type").setValue(result.v_type);
          this.SalesOrderAddForm.get("cus").setValue(result.cus.toFixed(3));
          this.SalesOrderAddForm.get("countryId").setValue(result.countryId);
          if(this.opType == 'Copy'){
            this.getVoucherNo(result.v_type);
            this.SalesOrderAddForm.get("trans_no").setValue(0);
          }
        }
        this.updateSum();
      });
    })
  }

  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if(this.SalesOrderDTList.length <= 0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }
    this.SalesOrderDTList.forEach(element=> {
      if((element.item_no === '' || element.item_no === null) && (element.total === '' || element.total === null || element.total <= 0) && (element.unitNo === '' || element.unitNo === null || element.unitNo <= 0)){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.index = index.toString();
      index++;
    })

    this.SalesOrderDTList.forEach(element=> {
      debugger
      element.disAmt = this.allowedDiscount;
    })

    if (stopExecution) {
      return; 
    } 
    this.SalesOrderAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.SalesOrderAddForm.value.userId = this.jwtAuth.getUserId();
    this.SalesOrderAddForm.value.sales_No = this.SalesOrderAddForm.value.sales_No.toString();
    this.SalesOrderAddForm.value.salesOrderDTList = this.SalesOrderDTList;
    this.SalesOrderAddForm.value.Percentage = 0;
    this.salesordersService.SaveSalesOrder(this.SalesOrderAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.router.navigate(['SalesOrder/SalesOrderList']);
        }
        else {
          this.alert.SaveFaild();
        }
        this.disableSave = false;
      })  
  }
  
  getCustomers(event: any){
    debugger
    const countryId = event.value === undefined ? event : event.value;
    if(countryId == 0)
      this.customersList = this.allCustomersList;
    else
      this.customersList = this.allCustomersList.filter(c => c.id == countryId || c.id == -1);
  }

  getCountry(event: any){
    debugger
    const custId = event.value === undefined ? event : event.value;
    this.SalesOrderAddForm.get("countryId").setValue(this.customersList.find(c=> c.data1 == custId).id);
    //this.selectedCountry = this.customersList.find(c=> c.data1 == custId).id;
    // if(countryId > 0)
    //   this.SalesOrderAddForm.get("sales_No").setValue(countryId);
  }

  getVoucherNo(event: any) {
    const serialType = event.value === undefined ? event : event.value;    
    if (serialType > 0) {
      this.salesordersService.GetSerialVoucher(serialType).subscribe((results) => {
        if (results) {
          this.SalesOrderAddForm.get("sales_No").setValue(results);
        }
        else {
          this.SalesOrderAddForm.get("sales_No").setValue(1);
        }
      });
    }
  }

  AddNewLine(){    
    this.SalesOrderDTList.push(
    {
      item_no: "",
      unitNo: 0,
      oq2: "",
      price: "",
      freeQty: "",
      bonusQty: "",
      otherQty: "",
      shipped:-1,
      total:0,
      amount:0,
      disAmt:0,
    });
    this.SalesOrderAddForm.get("salesOrderDTList").setValue(this.SalesOrderDTList);
  }

  calculateSum(type){
    if(this.SalesOrderDTList != null){
      if(type == 1)
        return this.SalesOrderDTList.reduce((sum, item) => sum + item.oq2, 0);
      else if(type == 2)
        return this.SalesOrderDTList.reduce((sum, item) => sum + item.price, 0);
      else if(type == 3)
        return this.SalesOrderDTList.reduce((sum, item) => sum + item.freeQty, 0);
      else if(type == 4)
        return this.SalesOrderDTList.reduce((sum, item) => sum + item.bonusQty, 0);
      else if(type == 5)
        return this.SalesOrderDTList.reduce((sum, item) => sum + item.otherQty, 0);
      else if(type == 6)
        return this.SalesOrderDTList.reduce((sum, item) => sum + (item.oq2 + item.freeQty + item.bonusQty + item.otherQty), 0);
      else if(type == 7)
        return this.SalesOrderDTList.reduce((sum, item) => sum + item.amount, 0);
    }    
  }

  GetItemUnits(itemNo,i){
    if(itemNo != ''){
      this.salesordersService.GetItemUnits(itemNo.value).subscribe((result) => {        
        this.unitsList[i] = result;
      });      
    }
  }

  filterUnits(selectedItem: any, rowIndex: number): void {
    debugger
    if(this.SalesOrderDTList.length > 0)
      {
        for (let i = 0; i < this.SalesOrderDTList.length; i++) 
        {
          let element = this.SalesOrderDTList[i];
          if(element.item_no == selectedItem.value && i != rowIndex )
            {            
               Swal.fire({
                title: this.translateService.instant('DoWantToContinue'),
                text: this.translateService.instant('msgTheItemRepeatedReminder'),
                icon: 'warning',
                confirmButtonColor: '#dc3741',
                showCancelButton: true,
                confirmButtonText: this.translateService.instant('Yes,deleteit!'),
                cancelButtonText: this.translateService.instant('Close'),
              }).then((result) => {
                if (result.value) {
                                    
                }
                else if (result.dismiss === Swal.DismissReason.cancel) {
                    setTimeout(() => {
                    this.SalesOrderDTList[rowIndex].item_no = 0;
                    this.SalesOrderDTList[rowIndex].unitNo = 0;
                    this.cdr.detectChanges();
                  }); 
                }
              })                            
            }
        }
      }
      this.unitsList[rowIndex] = this.allUnitsList.filter(unit => unit.data1 === selectedItem.value);
      this.salesordersService.getPriceByCountryAndAgent(selectedItem.value, this.SalesOrderAddForm.value.countryId, this.SalesOrderAddForm.value.cus).subscribe(result => {
      this.SalesOrderDTList[rowIndex].price = result;
      this.SalesOrderDTList[rowIndex].unitNo = this.unitsList[rowIndex].find(c => c.data1 ==selectedItem.value).id;
    })
  }

  updateSum(): void {
    this.fTotal = 0; 
    this.fNetTotal = 0; 


        for (const element of this.SalesOrderDTList) {
          // Ensure all quantities are valid numbers, otherwise treat them as 0
          const oq2 = isNaN(parseFloat(element.oq2)) ? 0 : parseFloat(element.oq2);
          const freeQty = isNaN(parseFloat(element.freeQty)) ? 0 : parseFloat(element.freeQty);
          const bonusQty = isNaN(parseFloat(element.bonusQty)) ? 0 : parseFloat(element.bonusQty);
          const otherQty = isNaN(parseFloat(element.otherQty)) ? 0 : parseFloat(element.otherQty);
      
          // Calculate total
          element.total = oq2 + freeQty + bonusQty + otherQty;
      
          // Ensure price is a valid number, otherwise treat it as 0
          element.price = isNaN(parseFloat(element.price)) ? 0 : parseFloat(element.price);
      
          // Calculate amount
          element.amount =  (element.price * oq2).toFixed(3);
      
          // Accumulate total amount
          this.fTotal += <number>element.amount | 0;
          
      }
    
    this.fNetTotal = this.fTotal - this.allowedDiscount;
    const fNetTotal = parseFloat(this.fNetTotal)
      this.fNetTotal = this.formatCurrency(fNetTotal);
    if(this.fTotal == 0)
    {
      this.allowedDiscount = 0;
      this.fNetTotal = 0; 
    }
    else
    {
      const fTotal = parseFloat(this.fTotal)
      this.fTotal = this.formatCurrency(fTotal);
    }
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, 3);
  }

  ApproveOrder(id: any) {
    debugger    
    this.salesordersService.ApproveOrder(id).subscribe((result) => {      
      if (result.isSuccess) {
        this.alert.ShowAlert("RequestApproved","success");
        this.router.navigate(['SalesOrder/SalesOrderList']);
      }
      else {
        this.alert.SaveFaild();
      }      
    }); 
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.SalesOrderDTList.splice(rowIndex, 1);
    }
    this.SalesOrderAddForm.get("salesOrderDTList").setValue(this.SalesOrderDTList);
    this.updateSum();
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  ApproveSalesOrder(Trans:number)
  {
    debugger
    this.salesordersService.ApproveOrder(Trans).subscribe(res => {
      debugger
      if (res.isSuccess == false && res.message == "msNoPermission") 
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }
      if(res.isSuccess == true)
        {
          this.alert.SaveSuccess();
          this.router.navigate(['SalesOrder/SalesOrderList']);
        }
        else
        {
          this.alert.SaveFaild();
        }
    })
  }

  GetItems() {
    debugger
 
    this.showLoader = true;
    this.SalesOrderDTList = [];
    debugger
    setTimeout(() => {
      this.salesordersService.GetAllItemsWithPrice(this.SalesOrderAddForm.value.countryId,this.SalesOrderAddForm.value.cus).subscribe(res => 
        {
          debugger
          if(res.length > 0)
            {
              this.itemWithPriceList = res;
              if(this.itemWithPriceList.length > 0)
                {    
                  for (let i = 0; i < this.itemWithPriceList.length; i++) {
                      const  element = this.itemWithPriceList[i];
                      this.unitsList[i] = this.allUnitsList.filter(unit => unit.data1 === element.itemNo);  
                      const unit = this.unitsList[i].find(c => c.data1 ==element.itemNo).id;
                      this.SalesOrderDTList.push(
                        {
                          item_no: element.itemNo,
                          unitNo: unit,
                          oq2: "",
                          price: element.price,
                          freeQty: "",
                          bonusQty: "",
                          otherQty: "",
                          shipped:-1,
                          total:0,
                          amount:0,
                          disAmt:0,
                        })
                    }        
                } 
            }        
        })
    });     
    this.showLoader = false;
  }
}

