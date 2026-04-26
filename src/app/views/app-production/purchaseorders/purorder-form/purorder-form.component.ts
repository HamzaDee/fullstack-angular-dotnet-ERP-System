import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { PurordersService } from '../purorders.service'; 
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { delay } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { AppGeneralAttachmentComponent } from 'app/views/general/app-general-attachment/app-general-attachment.component'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-purorder-form',
  templateUrl: './purorder-form.component.html',
  styleUrls: ['./purorder-form.component.scss']
})
export class PurorderFormComponent implements OnInit {
  @ViewChild(AppGeneralAttachmentComponent) childAttachment:AppGeneralAttachmentComponent;

  PurOrderAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  itemsList: any;
  supplierItemList:any;
  allUnitsList: any;
  purOrderDTList: any[] = [];
  orderTypeList: any;
  countryList: any;
  suppliersList: any;
  unitsList: Array<any> = [];
  storesList: any;
  showLoader = false;
  orderId: any;
  showOnly = false;
  unAvlItems : any;
  receivedData: any;
  disableSave:boolean;
  ddate:any ;
  currenciesList:any;
  dddAte:Date = new Date;
  currencyId:any;
  currRate:any;
  supplier:any;
  private subscription: Subscription;
  disableAll: boolean = false;

  constructor(
    private readonly title: Title,
    private readonly jwtAuth: JwtAuthService,
    private readonly alert: sweetalert,
    private readonly purordersService: PurordersService,
    private readonly translateService: TranslateService,
    public router: Router,
    private readonly formbulider: FormBuilder,
    public routePartsService: RoutePartsService,
    private readonly appCommonserviceService : AppCommonserviceService,
    private readonly route: ActivatedRoute,
    private  cdr :ChangeDetectorRef,
  ) { }

  ngOnInit(): void { 
    debugger
    const storageKey = this.route.snapshot.queryParamMap.get('storageKey');
    const storedData  = localStorage.getItem(storageKey);
    localStorage.removeItem(storageKey);
    if (storedData) {
      this.unAvlItems = JSON.parse(storedData);
      console.log('Updating shared data:', this.unAvlItems);
    }
    this.orderId = this.routePartsService.GuidToEdit;
    this.opType = this.routePartsService.Guid2ToEdit;
    if (this.route.snapshot.queryParamMap.has('opType')) {
      this.opType = this.route.snapshot.queryParamMap.get('opType');
      this.orderId = 0;      
    }
    if(this.opType == 'Show')
      this.showOnly = true;
    this.SetTitlePage();
    if (this.orderId == null || this.orderId == undefined || this.orderId === "") {
      this.router.navigate(['PurchaseOrder/GetPurOrdersList']);
    }

    
      setTimeout(() => {
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else {
          this.disableAll = false;
        }
      });
      
    this.InitiailPurOrderForm();
    this.GetInitailPurOrder();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PurorderForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailPurOrderForm() {
    this.PurOrderAddForm = this.formbulider.group({
      trans_no: [0],
      order_no: ["", [Validators.required]],
      v_TYPE: [0, [Validators.required, Validators.min(1)]],
      myear : [0],
      time: [0],
      odate: ["", [Validators.required]],
      ven: [0, [Validators.required, Validators.min(1)]],
      status: [0],
      no:[0],
      rate:[0],
      notes:"",
      purOrderDTList: [null, [Validators.required, Validators.minLength(1)]],   
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
  
  GetInitailPurOrder() {
    this.purordersService.GetPurOrder(this.orderId,this.opType).subscribe(result => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.router.navigate(['PurchaseOrder/GetPurOrdersList']);
        return
      }
      result.odate = formatDate( result.odate , "yyyy-MM-dd" ,"en-US");
      this.PurOrderAddForm.patchValue(result);
      this.allUnitsList = result.itemsUnitsList;
      this.itemsList = result.itemsList;
      this.supplierItemList = result.itemsList;
      this.countryList = result.countryList;
      this.suppliersList = result.suppliersList;
      this.orderTypeList = result.orderTypeList;
      this.storesList = result.storesList;
      this.currenciesList = result.currenciesList;
      if(result.purOrderDTList !== null){
        let index = 0;
        this.purOrderDTList = result.purOrderDTList;
        this.purOrderDTList.forEach(element=> {
          element.total = element.oq2 * element.cost;
          this.itemsList.forEach(item => {
            if(item.data1 === element.item_no){
              this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == element.item_no);
              index++;          
            }
          });
        })   
       for (let i = 0; i < this.purOrderDTList.length; i++) 
        {
          this.GetItemUnits(this.purOrderDTList[i],i,0);
        }
        this.calculateSum(1);
        this.calculateSum(2);     
      }    
         if(result.generalAttachModelList != null && result.generalAttachModelList != undefined)
        {
          if(result.generalAttachModelList.length > 0)
            {              
              this.childAttachment.data = result.generalAttachModelList;
              this.childAttachment.ngOnInit();
              this.PurOrderAddForm.get("generalAttachModelList").setValue(result.generalAttachModelList);
            }
        }
        this.supplier = result.ven.toFixed(3);
      const source$ = of(1);
      source$.pipe(delay(0)).subscribe(() => {
        if(this.orderId > 0){
          this.PurOrderAddForm.get("v_TYPE").setValue(result.v_TYPE);
          this.PurOrderAddForm.get("ven").setValue(result.ven.toFixed(3));
          this.PurOrderAddForm.get("no").setValue(result.no);
          if(this.opType == 'Copy'){
            this.getVoucherNo(result.v_TYPE);
            debugger
            this.PurOrderAddForm.get("trans_no").setValue(0);
            this.ddate = formatDate( this.dddAte , "yyyy-MM-dd" ,"en-US");
            result.odate  = this.ddate;
            this.PurOrderAddForm.get("odate").setValue(result.odate);
          }          
        }
        else if(this.opType == 'createPO'){
          const supplierId = this.unAvlItems[0].supplierId;
          if (supplierId != undefined){
            this.PurOrderAddForm.get("ven").setValue(supplierId.toFixed(3));
          }          
          let index = 0;
          this.unAvlItems.forEach(element=> {
            this.unitsList[index] = this.allUnitsList.filter(unit => unit.data1 == element.itemNo);
            const minOrderQty = result.itemsList.filter((item => item.data1 == element.itemNo))[0].minOrderQty || 0;
            const reqQty = element.reqQty < minOrderQty ? minOrderQty : element.reqQty;
            index++;
            this.purOrderDTList.push(
              {
                item_no: element.itemNo,
                oq2: reqQty,
                cost: element.cost,
                total: reqQty * element.cost,
                unitNo: 0,
                storeNo: 0,
                minOrderQty: minOrderQty,
                tubeCapacity:  result.itemsList.filter((item => item.data1 == element.itemNo))[0].tubeCapacity || 0,
              });
          })
          this.PurOrderAddForm.get("purOrderDTList").setValue(this.purOrderDTList);
        }
        else
        {
          this.PurOrderAddForm.get("no").setValue(0);
        }
      });
    })
  }
  
  OnSaveForms() {
    debugger
    this.disableSave = true;
    let stopExecution = false;
    var index = 0;
    if(this.purOrderDTList.length <= 0){
      this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
    }                    
    for (let i = 0; i < this.purOrderDTList.length; i++) {
      const element = this.purOrderDTList[i];
    if (element.item_no == "" || element.item_no === null || element.item_no == undefined ) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (element.unitNo == null || element.unitNo === 0 || element.unitNo == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (element.oq2 == null || element.oq2 === 0 || element.oq2 == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (element.cost == null || element.cost === 0 || element.cost == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      if (element.storeNo == null || element.storeNo === 0 || element.storeNo == undefined) {
        this.alert.ShowAlert("msgEnterAllData", 'error');
        stopExecution = true;
        this.disableSave = false;
        return false;
      }
      element.i = i.toString();
    }
    let currency = this.PurOrderAddForm.get("rate").value;
    if(currency== 0 || currency == undefined || currency == undefined)
      {
        this.alert.ShowAlert("PleaseChooseTheCurrency",'error')
        return;
      }
    if (stopExecution) {
      return; 
    } 
    this.PurOrderAddForm.value.companyId = this.jwtAuth.getCompanyId();
    this.PurOrderAddForm.value.userId = this.jwtAuth.getUserId();
    this.PurOrderAddForm.value.order_no = this.PurOrderAddForm.value.order_no.toString();
    this.PurOrderAddForm.value.purOrderDTList = this.purOrderDTList;
    this.PurOrderAddForm.get("generalAttachModelList").setValue(this.childAttachment.getVoucherAttachData());
    this.purordersService.SavePurOrder(this.PurOrderAddForm.value)
      .subscribe((result) => {
        if (result.isSuccess) {
          this.alert.SaveSuccess();
          this.router.navigate(['PurchaseOrder/GetPurOrdersList']);
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
      this.purordersService.GetSerialVoucher(serialType).subscribe((results) => {
        if (results) {
          this.PurOrderAddForm.get("order_no").setValue(results);
        }
        else {
          this.PurOrderAddForm.get("order_no").setValue(1);
        }
      });
    }
  }

  AddNewLine(){    
    if (this.PurOrderAddForm.get('ven').value <= 0) {
      return; // Do nothing if the button is disabled
    }
    this.purOrderDTList.push(
    {
      item_no: "",
      oq2: "",
      cost: "",
      unitNo: 0,
      storeNo: 0,
      minOrderQty:0,
      tubeCapacity:0
    });
    this.PurOrderAddForm.get("purOrderDTList").setValue(this.purOrderDTList);
  }

  calculateSum(type){
    if(this.purOrderDTList != null){
      if(type == 1){
        return this.purOrderDTList.reduce((sum, item) => sum + item.oq2, 0);
      }
      else if(type == 2){
        return this.purOrderDTList.reduce((sum, item) => sum + (item.oq2 * item.cost), 0);
      }
    }    
  }

  GetItemUnits(itemNo,i ,type){
    debugger
    if(type== 1)
      {
        if(itemNo != ''){
          this.purordersService.GetItemInfo(itemNo.item_no,parseInt(this.PurOrderAddForm.get('ven').value)).subscribe((result) => {  
            debugger      
            this.unitsList[i] = result.itemsUnitsList;
            this.purOrderDTList[i].unitNo=this.unitsList[i].find(r => r.id == 1).id;
            this.purOrderDTList[i].cost=result.price;
            itemNo.minOrderQty = result.minProdQty;
            itemNo.tubeCapacity = result.tubeCapacity;
            let dtime = parseInt(this.PurOrderAddForm.get('time').value) ;
            dtime = isNaN(dtime)? 0 : dtime;
            if (result.deliveryTime > dtime)
              this.PurOrderAddForm.get('time').setValue(result.deliveryTime);
          });           
        }
      }
    else
    {
      if(itemNo != ''){
          this.purordersService.GetItemInfo(itemNo.item_no,parseInt(this.PurOrderAddForm.get('ven').value)).subscribe((result) => {  
            debugger      
            this.unitsList[i] = result.itemsUnitsList;
            itemNo.minOrderQty = result.minProdQty;
            itemNo.tubeCapacity = result.tubeCapacity;
            let dtime = parseInt(this.PurOrderAddForm.get('time').value) ;
            dtime = isNaN(dtime)? 0 : dtime;
            if (result.deliveryTime > dtime)
              this.PurOrderAddForm.get('time').setValue(result.deliveryTime);
          });           
        }

    }

  }

  checkMinOrderQty(row: any): void {
    if(row.oq2 < row.minOrderQty){
      this.alert.ShowAlert('msgMinOrderQty','error');
      row.oq2 = row.minOrderQty;
    };
  }

  updateSum(row: any): void {
    row.total = (row.oq2 * row.cost).toFixed(3);
    this.calculateSum(1);
    this.calculateSum(2);
  }

  deleteRow(rowIndex: number) {
    if (rowIndex !== -1) {
      this.purOrderDTList.splice(rowIndex, 1);
    }
    this.PurOrderAddForm.get("purOrderDTList").setValue(this.purOrderDTList);
  }

  isEmpty(input) {
    return input === '' || input === null;
  }

  GetSupplierItems(event)
  {
    debugger
    if(event.value > 0 && this.purOrderDTList.length > 0)
      {
          Swal.fire({
          title: this.translateService.instant('AreYouSure?'),
          text: this.translateService.instant('TheTableContentsWillBeEmptiedDoYouWantToContinue?'),
          icon: 'warning',
          confirmButtonColor: '#dc3741',
          showCancelButton: true,
          confirmButtonText: this.translateService.instant('Yes,deleteit!'),
          cancelButtonText: this.translateService.instant('Close'),
        }).then((result) => {
          debugger
          if (result.isConfirmed) {
            this.purOrderDTList= [];
            this.PurOrderAddForm.get("purOrderDTList").setValue(this.purOrderDTList)
             let supplier = Number(event.value);
              if(supplier > 0)
                {
                  this.purordersService.GetSupplierItemsList(supplier).subscribe( res=>{      
                  debugger
                  if(res)
                    {
                      this.supplier = event.value;
                      this.supplierItemList= res;
                    }
                  })
                }
          }
          else if (result.isDismissed) {
            this.PurOrderAddForm.get("ven").setValue(this.supplier);
            return;
          }
        }) 
      }
      else
      {
        let supplier = Number(event.value);
        if(supplier > 0)
          {
            this.purordersService.GetSupplierItemsList(supplier).subscribe( res=>{      
            debugger
            if(res)
              {
                this.supplier = event.value;
                this.supplierItemList= res;
              }
            })
          }
      }
    
      
  
  }

  GetCurrencyRate(event)
  {
    debugger
    if(event.value > 0)
      {
        let rate = this.currenciesList.find(r => r.id == event.value )?.data2 ?? 0;
        if(rate > 0)
          {
           this.PurOrderAddForm.get("rate").setValue(rate);
           this.cdr.detectChanges();
          }
      }
      else
      {
        this.PurOrderAddForm.get("rate").setValue(0);
        this.cdr.detectChanges();
      }
      
  }
}
