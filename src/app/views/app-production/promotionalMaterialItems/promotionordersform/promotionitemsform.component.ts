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
import { PromotionOrdersService } from '../promotionorders.service';

@Component({
  selector: 'app-promotionitemsform',
  templateUrl: './promotionitemsform.component.html',
  styleUrl: './promotionitemsform.component.scss'
})
export class PromotionitemsformComponent {
  PromotionItemsAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  promotionDTList: any[] = [];
  promoItemsList:any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  voucherId: any;
  isdisabled: boolean = false;
  decimalPlaces: number;
  disableAll: boolean;
  voucherNo: number = 0;
  newDate:any;
  agentsList:any;
  countriesList:any
  salesOrderList:any;
  salesOrderListAll:any;
  productedItemsList:any;
  // promotionalItemsList:any;
  promotionalItemsList: Array<any> = [];
  allItemsList:any;
  disableTableFields:boolean= true;
  customersList:any;
  //Totals
    planQtyTotal:string ="1";
    availableQtyTotal:string="2";
    qtyTotal:string="3";
    remainPlanQtyTotal:string="4";
    remainStoreQtyTotal:string="5";
  //End
  disableSave:boolean;
  approval = false;

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
      private service: PromotionOrdersService
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
        this.router.navigate(['Promotion/Promotionitemslist']);
      }
      this.InitiailPromotionForm();
      this.GetInitailPromotion();
      setTimeout(() => {
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else if(this.opType == 'Approval')
          this.approval = true;
        else {
          this.disableAll = false;
        }
      });
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('Promotionitemsform');
      this.title.setTitle(this.TitlePage);
    }
  
    InitiailPromotionForm() {
      this.PromotionItemsAddForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        orderNo: [0, [Validators.required, Validators.min(1)]],
        orderDate:["",[Validators.required]],
        deliveryDate:["",[Validators.required]],
        countryId:[0,[Validators.required, Validators.min(1)]],
        agentId:[0,[Validators.required, Validators.min(1)]],
        note:[""],
        salesOrderId:[0],
        promotionalmaterialDTList: [null, [Validators.required, Validators.minLength(1)]],
      });
    }
  
    greaterThanZeroValidator(control: any) {
      const value = parseFloat(control.value);
      if (isNaN(value) || value <= 0) {
        return { invalidValue: true };
      }
      return null; // Validation passed
    }
  
    async GetInitailPromotion() {
      debugger
      var lang = this.jwtAuth.getLang();
      this.service.GetPromotionOrdersForm(this.voucherId, this.opType).subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['Promotion/Promotionitemslist']);
          return;
        }
        debugger
        result.orderDate = formatDate(result.orderDate, "yyyy-MM-dd", "en-US")
        result.deliveryDate = formatDate(result.deliveryDate, "yyyy-MM-dd", "en-US")
        this.promotionDTList = result.promotionalmaterialDTList;
        this.PromotionItemsAddForm.get("promotionalmaterialDTList").setValue(result.promotionalmaterialDTList);         
        this.PromotionItemsAddForm.patchValue(result);
        this.agentsList = result.agentsList;
        this.countriesList= result.countryList;
        this.salesOrderList= result.salesOrderList;
        this.salesOrderListAll= result.salesOrderList;
        this.productedItemsList = result.productedItemsList;
        this.allItemsList = result.allItemsList;
        this.customersList = result.agentsList;
        let index = 0;
        debugger
        

        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(async () => {
          this.isdisabled = false;
          if (this.voucherId > 0) {
            if(this.promotionDTList){
              this.promotionDTList.forEach(element => {
                let ProditemId = this.allItemsList.find(s => s.data1 == element.prodItemNo).id;
                let promoitemId = this.allItemsList.find(s => s.data1 == element.itemNo).id;
                element.prodItemNo = ProditemId;
                element.itemNo = promoitemId;                
              });    
              // this.promotionDTList.forEach(element => {
              //   this.allItemsList.forEach(item => {
              //     if (item.id === element.itemNo) {
              //       this.promotionalItemsList[index] = this.allItemsList.filter(promo => promo.id == element.itemNo);              
              //       index++;
              //     }
              //   });
              // })    
              for (let i = 0; i < this.promotionDTList.length; i++) {
                  await this.GetPromotionalItems(this.promotionDTList[i].prodItemNo, i)     
                  this.GetPromItemQty(this.promotionDTList[i].itemNo,i)
              }                      
            }
            this.PromotionItemsAddForm.get("id").setValue(result.id);
            this.PromotionItemsAddForm.get("orderNo").setValue(result.orderNo);
            this.PromotionItemsAddForm.get("orderDate").setValue(formatDate(result.orderDate, "yyyy-MM-dd", "en-US"));
            this.PromotionItemsAddForm.get("deliveryDate").setValue(formatDate(result.deliveryDate, "yyyy-MM-dd", "en-US"));
            this.PromotionItemsAddForm.get("countryId").setValue(result.countryId);
            this.PromotionItemsAddForm.get("agentId").setValue(result.agentId);
            this.PromotionItemsAddForm.get("note").setValue(result.note);
            this.PromotionItemsAddForm.get("salesOrderId").setValue(result.salesOrderId);
          }
          else {
            debugger
            this.newDate = new Date;
            this.PromotionItemsAddForm.get("id").setValue(0);
            this.PromotionItemsAddForm.get("orderNo").setValue(result.orderNo);
            this.PromotionItemsAddForm.get("orderDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
            this.PromotionItemsAddForm.get("deliveryDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
            this.PromotionItemsAddForm.get("countryId").setValue(0);
            this.PromotionItemsAddForm.get("agentId").setValue(0);
            this.PromotionItemsAddForm.get("note").setValue("");
            this.PromotionItemsAddForm.get("salesOrderId").setValue(0);            
          }
          for (let i = 0; i < this.promotionDTList.length; i++) {
                  this.CalcQuantity(this.promotionDTList[i]);
              }   
        }
        )
      });
  
    }
  
    OnSaveForms() {
      debugger
      this.disableSave = true;
      let stopExecution = false;
      for (let i = 0; i < this.promotionDTList.length; i++) {
        if(this.promotionDTList[i].prodItemNo == 0 || this.promotionDTList[i].prodItemNo == null|| this.promotionDTList[i].prodItemNo == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return;
          }
        if(this.promotionDTList[i].itemNo == 0 || this.promotionDTList[i].itemNo == null|| this.promotionDTList[i].itemNo == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        if(this.promotionDTList[i].qty == 0 || this.promotionDTList[i].qty == null|| this.promotionDTList[i].qty == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
      
      }
      if(stopExecution)
        {
          return;
        }
      debugger
      this.PromotionItemsAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.PromotionItemsAddForm.value.userId = this.jwtAuth.getUserId();
      this.PromotionItemsAddForm.value.voucherNo = this.PromotionItemsAddForm.value.id;//.toString();    
      this.PromotionItemsAddForm.value.promotionalmaterialDTList = this.promotionDTList;
      this.promotionDTList.forEach(element => {
        let prodItem = this.allItemsList.find(c => c.id == element.prodItemNo).data1;
        let promoItem = this.allItemsList.find(c => c.id == element.itemNo).data1;
        element.prodItemNo =prodItem;
        element.itemNo = promoItem;
      });
      let cust = this.agentsList.find(r => r.id == this.PromotionItemsAddForm.value.agentId);
      if(cust != null )
        {
          this.PromotionItemsAddForm.get("agentId").setValue(cust.data2);
        }
      debugger
      this.service.SavePromotionOrders(this.PromotionItemsAddForm.value)
        .subscribe((result) => {
          if (result) {
            this.alert.SaveSuccess();
            this.router.navigate(['Promotion/Promotionitemslist']);
          }
          else {
            this.alert.SaveFaild();
          }
          this.disableSave = false;
        })
    }
  
    AddNewLine() {
      debugger
      if (this.promotionDTList == null) {
        this.promotionDTList = [];
      }  
      this.promotionDTList.push(
        {
          id: 0,
          idHD: 0,
          prodItemNo: 0,
          itemNo: 0,
          qty: 0,       
          note:"",
          requiredAccordingToThePlan: 0, 
          availableQuantity: 0, 
          remainingAccordingToPlan: 0, 
          remainingInTheStore: 0, 
          index: ""
        });
      this.PromotionItemsAddForm.get("promotionalmaterialDTList").setValue(this.promotionDTList);
    }
  
    deleteRow(rowIndex: number) {
  
      if (rowIndex !== -1) {
        this.promotionDTList.splice(rowIndex, 1);
        this.promotionalItemsList.splice(rowIndex,1); 
      }
      this.PromotionItemsAddForm.get("promotionalmaterialDTList").setValue(this.promotionDTList);
    }
  
    isEmpty(input) {
      return input === '' || input === null;
    }
  
    onAddRowBefore(rowIndex: number) {
      const newRow =
      {
        id: 0,
          idHD: 0,
          prodItemNo: 0,
          itemNo: 0,
          qty: 0,       
          note:"",
          index: ""
      };
  
      this.promotionDTList.splice(rowIndex, 0, newRow);
      this.PromotionItemsAddForm.get("promotionalmaterialDTList").setValue(this.promotionDTList);
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
          this.service.DeletePromotionOrders(id).subscribe((results) => {
            if (results.isSuccess == true) {
              this.alert.DeleteSuccess();
              this.router.navigate(['Promotion/Promotionitemslist']);
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
  
    CalculateTotals()
    {
      this.planQtyTotal= "";
      this.availableQtyTotal= "";
      this.qtyTotal= "";
      this.remainPlanQtyTotal= "";
      this.remainStoreQtyTotal = "";

      // this.planQtyTotal =this.formatCurrency(this.promotionDTList.reduce((sum, item) => sum + parseFloat(item.requiredAccordingToThePlan), 0));
      // this.availableQtyTotal =this.formatCurrency(this.promotionDTList.reduce((sum, item) => sum + parseFloat(item.availableQuantity), 0));
      if(this.promotionDTList){
        this.qtyTotal =this.formatCurrency(this.promotionDTList.reduce((sum, item) => sum + parseFloat(item.qty), 0));
      }
      return this.qtyTotal
      // this.remainPlanQtyTotal =this.formatCurrency(this.promotionDTList.reduce((sum, item) => sum + parseFloat(item.remainingAccordingToPlan), 0));
      // this.remainStoreQtyTotal =this.formatCurrency(this.promotionDTList.reduce((sum, item) => sum + parseFloat(item.remainingInTheStore), 0));
      
    }

    formatCurrency(value: number): string {
      return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
    }

    GetPromotionalItems(ProductedItem,index): Promise<void> 
    {
      return new Promise((resolve, reject) => {
        debugger
        if(ProductedItem > 0 && ProductedItem != null && ProductedItem != undefined)
        {
          this.promotionDTList[index].requiredAccordingToThePlan = 0;
          this.promotionDTList[index].availableQuantity = 0;
          this.service.GetPromotionalItems(ProductedItem).subscribe(res => {
            debugger
            if(res)
            {
              debugger                
              this.promotionalItemsList[index]= res.promotionalItemsList
              resolve();
              // let item = this.productedItemsList.find(x => x.id == ProductedItem).data1;
              // this.promotionDTList[index].availableQuantity = item                
            }
          })
        }     
      });       
    }
   
    GetPromItemQty(itemNo,index){
      debugger
      let qty = this.promotionalItemsList[index].find(s => s.id == itemNo).data2;
      let avlQty = this.promotionalItemsList[index].find(s => s.id == itemNo).data1;
      this.promotionDTList[index].requiredAccordingToThePlan = qty;
      this.promotionDTList[index].availableQuantity = parseFloat(avlQty);
    }

    getCustomers(event: any){
      debugger
      const countryId = event.value === undefined ? event : event.value;
      if(countryId == 0)
        this.customersList = this.agentsList;
      else
        this.customersList = this.agentsList.filter(c => c.id == countryId || c.id == -1);
    }

    getCustomerSalesOrder(event: any){
      debugger
      const custId = event.value === undefined ? event : event.value;
      if(custId == 0)
        this.salesOrderList = this.salesOrderListAll;
      else
        this.salesOrderList = this.salesOrderListAll.filter(c => c.data2 == custId || c.data2 == 0);
    }

    getDeliveryDate(event) {
      debugger;
      if (event.value == 0)
        {
          let date = new Date;
          let date1 = formatDate(date, "yyyy-MM-dd", "en-US");
          this.PromotionItemsAddForm.get("deliveryDate").setValue(date1);
          return;
        }
      const filteredItem = this.salesOrderList.find(r => r.id === event.value); // Find the matching item
      if (filteredItem && filteredItem.data1) {
        // Normalize the date string
        const normalizedDateString = filteredItem.data1.replace(/(\d{2}:\d{2})(AM|PM)/i, (match, time, meridian) => {
          const [hours, minutes] = time.split(":").map(Number);
          let normalizedHours = hours % 12; // Convert 12-hour to 24-hour format
          if (meridian.toUpperCase() === "PM") normalizedHours += 12;
          return `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        });
    
        // Convert to Date object
        const dateObj = new Date(normalizedDateString);
        if (!isNaN(dateObj.getTime())) {
          const deldate = formatDate(dateObj, "yyyy-MM-dd", "en-US");
          this.PromotionItemsAddForm.get("deliveryDate").setValue(deldate);
        } else {
          console.error("Invalid normalized date format:", normalizedDateString);
          this.PromotionItemsAddForm.get("deliveryDate").setValue(null);
        }
      } else {
        this.PromotionItemsAddForm.get("deliveryDate").setValue(null); // Reset if no valid date is found
      }
    }
    
    CalcQuantity(row)
    {
      debugger
      if(row.qty != null && row.qty != undefined && row.qty != 0)
        {
          row.remainingAccordingToPlan = row.requiredAccordingToThePlan - row.qty ;
        }
        if(row.qty > row.availableQuantity  &&  this.opType == 'Add')
        {
          this.alert.ShowAlert("msgQtyMoreThanAvailableQty", 'error');         
        }
    }

    ApproveOrder(Id)
    {
      this.service.ApproveOrder(Id).subscribe((result) => { 
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();
          this.router.navigate(['Promotion/Promotionitemslist']);
        }
        else if(result.isSuccess == false && result.message ==="msNoPermission"){
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }}
        else {
          this.alert.SaveFaild();
        }
      });

    }
  
}
