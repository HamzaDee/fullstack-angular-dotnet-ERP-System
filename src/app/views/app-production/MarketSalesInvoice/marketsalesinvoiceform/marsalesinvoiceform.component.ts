import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
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
import { MarketSalesService } from '../marsalesinvoice.service';
import { emptyStringGetter } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-marsalesinvoiceform',
  templateUrl: './marsalesinvoiceform.component.html',
  styleUrl: './marsalesinvoiceform.component.scss'
})
export class MarsalesinvoiceformComponent {
  MarSalesInvAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  marSalesInvDTList: any[] = [];    
  showLoader = false;
  allowedDiscount:number = 0;
  voucherId: any;
  isdisabled: boolean = false;
  decimalPlaces: number = 3;
  disableAll: boolean;
  voucherNo: number = 0;
  newDate:any;
  //lists
  countriesList:any
  agentsList:any;
  allcustomers:any;
  productedItemsList:any;
  allItemsList:any;
  allUnitsList:any;
  salesOrderList:any;
  //end
  unitList: Array<any> = [];
  disableTableFields:boolean= true;
  isFromMaterialOrder:any;
  //Totals
    SumCost:string ="";
    NetTotal:string="";
  //End
    disableSave:boolean;

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
      private service: MarketSalesService
    ) { }

    ngOnInit(): void {
      debugger
      const queryParams = new URLSearchParams(window.location.search);
      if (queryParams.get('GuidToEdit') != null) {
        this.voucherId = queryParams.get('GuidToEdit');
        this.opType = 'Show';
        this.showsave = true;
        this.isFromMaterialOrder = queryParams.get('Guid4ToEdit');
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
        this.router.navigate(['MarketSalesInvoice/Marsalesinvoicelist']);

      }
      if( this.isFromMaterialOrder > 0)
        {
          this.voucherId = 0;
          this.opType = 'Add';
          this.showsave = false;
        }
      this.InitiailPromotionForm();
      this.GetInitailPromotion();
      setTimeout(() => {
        if (this.opType == "Show") {
          this.disableAll = true;
        }
        else {
          this.disableAll = false;
        }
        this.disableTableFields= true;
      });
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('SalesInvoicesForm');
      this.title.setTitle(this.TitlePage);
    }
  
    InitiailPromotionForm() {
      this.MarSalesInvAddForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        voucherNo: [0, [Validators.required, Validators.min(1)]],
        voucherDate:["",[Validators.required]],
        countryId:[0,[Validators.required, Validators.min(1)]],
        agentId:[0,[Validators.required, Validators.min(1)]],
        orderId:[0],
        amount:[0],
        discAmt:[0],
        note:[""],        
        marketInvoicesDTModel: [null, [Validators.required, Validators.minLength(1)]],
      });
    }
  
    greaterThanZeroValidator(control: any) {
      const value = parseFloat(control.value);
      if (isNaN(value) || value <= 0) {
        return { invalidValue: true };
      }
      return null; // Validation passed
    }
  
    GetInitailPromotion() {
      debugger
      var lang = this.jwtAuth.getLang();
      this.service.GetMarSalesInvoiceForm(this.voucherId,this.opType).subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['MarketSalesInvoice/Marsalesinvoicelist']);
          return;
        }
        debugger
        result.voucherDate = formatDate(result.voucherDate, "yyyy-MM-dd", "en-US")

        this.marSalesInvDTList = result.marketInvoicesDTModel;
        this.MarSalesInvAddForm.get("marketInvoicesDTModel").setValue(result.marketInvoicesDTModel);         
        this.MarSalesInvAddForm.patchValue(result);
        this.countriesList = result.countryList;
        this.agentsList = result.agentsList;
        this.allcustomers = result.agentsList;
        this.productedItemsList = result.productedItemsList;
        this.allItemsList = result.allItemsList;
        this.allUnitsList = result.allUnitesList;
        this.salesOrderList = result.salesRequestsList;
        let index = 0;
        debugger
        if(this.marSalesInvDTList != null){
          this.marSalesInvDTList.forEach(element => {
            let promoitemId = this.allItemsList.find(s => s.data1 == element.itemNo).id;
            element.itemNo = promoitemId;
          });
        debugger
          this.marSalesInvDTList.forEach(element => {
            this.allUnitsList.forEach(item => {
              if (item.id === element.unitId) {
                this.unitList[index] = this.allUnitsList.filter(unit => unit.id == element.unitId);              
                index++;
              }
            });
          })
          for (let i = 0; i < this.marSalesInvDTList.length; i++) {
            this.GetItemUnits(this.marSalesInvDTList[i].itemNo, i)            
          }
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          this.isdisabled = false;
          this.disableTableFields= true;
          if (this.voucherId > 0) {
            debugger
            this.MarSalesInvAddForm.get("id").setValue(result.id);
            this.MarSalesInvAddForm.get("voucherNo").setValue(result.voucherNo);
            this.MarSalesInvAddForm.get("voucherDate").setValue(formatDate(result.voucherDate, "yyyy-MM-dd", "en-US"));
            this.MarSalesInvAddForm.get("orderId").setValue(result.orderId);
            this.MarSalesInvAddForm.get("countryId").setValue(result.countryId);            
            this.MarSalesInvAddForm.get("note").setValue(result.note);
            this.MarSalesInvAddForm.get("discAmt").setValue(result.discAmt);
            const countryId = result.countryId;
            if(countryId == 0)
              {
                this.agentsList = this.allcustomers;
              }              
            else
              {
                this.agentsList = this.allcustomers.filter(c => c.id == countryId || c.id == -1);
              }              
              this.MarSalesInvAddForm.get("agentId").setValue(result.agentId.toFixed(3));
              this.cdr.detectChanges();
            this.allowedDiscount = result.discAmt;
          }
          else {
            debugger
            this.newDate = new Date;
            this.MarSalesInvAddForm.get("id").setValue(0);
            this.MarSalesInvAddForm.get("voucherNo").setValue(result.voucherNo);
            this.MarSalesInvAddForm.get("voucherDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
            this.MarSalesInvAddForm.get("orderId").setValue(0);
            this.MarSalesInvAddForm.get("countryId").setValue(0);
            this.MarSalesInvAddForm.get("agentId").setValue(0);
            this.MarSalesInvAddForm.get("note").setValue("");  
            this.allowedDiscount = 0;         
          }          
        }
        )
      });
      
    }
  
    OnSaveForms() {
      debugger
      this.disableSave = true;
      let stopExecution = false;
      for (const element of this.marSalesInvDTList) {
        if(element.itemNo == 0 || element.itemNo == null|| element.itemNo == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');  
            this.disableSave = false;          
            return;
          }
        if(element.unitId == 0 || element.unitId == null|| element.unitId == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            this.disableSave = false;            
            return false;
          }
        if(element.qty == 0 || element.qty == null|| element.qty == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error'); 
            this.disableSave = false;           
            return false;
          }
        if(element.price == 0 || element.price == null|| element.price == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error'); 
            this.disableSave = false;           
            return false;
          }      
      }
      if(stopExecution)
        {
          return;
        }
      debugger
      this.MarSalesInvAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.MarSalesInvAddForm.value.userId = this.jwtAuth.getUserId();
      this.MarSalesInvAddForm.value.marketInvoicesDTModel = this.marSalesInvDTList;
      this.MarSalesInvAddForm.get("discAmt").setValue(this.allowedDiscount);
      const agentIdValue = parseInt(this.MarSalesInvAddForm.value.agentId, 10);
      if (isNaN(agentIdValue)) {
        this.alert.ShowAlert("Invalid Agent ID", 'error');
        this.disableSave = false;
        return;
      }
      this.MarSalesInvAddForm.get("agentId").setValue(agentIdValue);
      this.marSalesInvDTList.forEach(element => {
        let promoItem = this.allItemsList.find(c => c.id == element.itemNo).data1;
        element.itemNo = promoItem;
      });
      debugger
      this.service.SaveMarketSalesInvoice(this.MarSalesInvAddForm.value)
        .subscribe((result) => {
          if (result) {
            this.alert.SaveSuccess();
            this.router.navigate(['MarketSalesInvoice/Marsalesinvoicelist']);
          }
          else {
            this.alert.SaveFaild();
          }
        })
        this.disableSave = false;
    }
  
    AddNewLine() {
      debugger
      if (this.marSalesInvDTList == null) {
        this.marSalesInvDTList = [];
      }  
      this.marSalesInvDTList.push(
        {
          id: 0,
          hDId: 0,
          itemNo: 0,
          unitId: 0,
          price: 0,       
          qty:0,
          freeQty:0,
          bonusQty:0,
          otherQty:0,
          qtyTotal:0,
          value:0,
          unitrate:0,
          index: ""
        });
      this.MarSalesInvAddForm.get("marketInvoicesDTModel").setValue(this.marSalesInvDTList);
    }
  
    deleteRow(rowIndex: number) {  
      if (rowIndex !== -1) {
        this.marSalesInvDTList.splice(rowIndex, 1);
        this.unitList.splice(rowIndex,1); 
      }
      this.CalculateCost(this.marSalesInvDTList[rowIndex]);
      this.MarSalesInvAddForm.get("marketInvoicesDTModel").setValue(this.marSalesInvDTList);
    }
  
    isEmpty(input) {
      return input === '' || input === null;
    }
  
    onAddRowBefore(rowIndex: number) {
      const newRow =
      {
          id: 0,
          hDId: 0,
          itemNo: 0,
          unitId: 0,
          price: 0,       
          qty:0,
          freeQty:0,
          bonusQty:0,
          otherQty:0,
          qtyTotal:0,
          value:0,
          unitrate:0,
          index: ""
      };
  
      this.marSalesInvDTList.splice(rowIndex, 0, newRow);
      this.MarSalesInvAddForm.get("marketInvoicesDTModel").setValue(this.marSalesInvDTList);
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
          this.service.DeleteMarketSalesInvoice(id).subscribe((results) => {
            if (results.isSuccess == true) {
              this.alert.DeleteSuccess();
              this.router.navigate(['MarketSalesInvoice/Marsalesinvoicelist']);
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
      const sumCost = this.marSalesInvDTList.reduce(
        (sum, item) => sum + parseFloat(item.value || "0"),
        0
      );
    if(this.allowedDiscount == undefined || this.allowedDiscount == null)
      {
        this.allowedDiscount = 0;
      }
      const netTotal = sumCost - this.allowedDiscount;

    
      // Apply formatting to the calculated totals
      this.SumCost = this.formatCurrency(sumCost);
      this.NetTotal = this.formatCurrency(netTotal);
      // this.SumCost ="";
      // this.NetTotal ="";
      // let discount = this.MarSalesInvAddForm.value.discAmt;
      // this.SumCost  =this.formatCurrency(this.marSalesInvDTList.reduce((sum, item) => sum + parseFloat(item.value), 0));
      // this.NetTotal  =this.formatCurrency(this.marSalesInvDTList.reduce((sum, item) => sum + parseFloat(item.value) -  parseFloat(this.allowedDiscount.toString()), 0));

    }

    formatCurrency(value: number): string {
      return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
    }

    GetItemUnits(ProductedItem,index)
    {
      debugger
      let item = this.allItemsList.find(c => c.id == ProductedItem)?.data1 || null;
      if(item > 0 && item != null && item != undefined)
        {
          this.service.GetUnitItemsList(item).subscribe(res => {
            debugger
            if(res)
              {
                debugger                
                this.unitList[index]= res;          
              }
          })
        }      
    }

    CalculateCost(row:any)
    {
      if(row.price != null || row.price != undefined)
        {
          if(row.qty != null || row.qty != undefined)
            {
              row.qtyTotal = row.qty + row.freeQty + row.bonusQty + row.otherQty; 
              row.value = row.qty * row.price;
              row.value = parseFloat(row.value).toFixed(this.decimalPlaces);
              let tot  = this.formatCurrency(this.marSalesInvDTList.reduce((sum, item) => sum + parseFloat(item.value), 0)); 
              this.MarSalesInvAddForm.get("amount").setValue(tot);
               this.CalculateTotals();
            }
        }
        else if(row.qty != null || row.qty != undefined)
            {
              row.qtyTotal = row.qty + row.freeQty + row.bonusQty + row.otherQty; 
            }
        
    }

    SetUnitRate(row,index)
    {
      debugger
      if(row.unitId != 0 || row.unitId != undefined || row.unitId != null)
        {
          let rate = this.unitList[index].find(c => c.id == row.unitId).data2||0;
          if(rate != 0 || rate != undefined || rate != null)
            {
              row.unitrate = rate;
            }
        }
      
    }

    getSalesorder(event)
    {
      debugger
      if(event.value > 0)
        {
          this.service.GetSalesOrder(event.value).subscribe(res => {
            if(res)
              {
                if(res.agentId != null && res.agentId != undefined && res.agentId != null)
                  {
                    this.MarSalesInvAddForm.get("agentId").setValue(res.agentId.toFixed(3));
                  }
                if(res.countryId != null && res.countryId != undefined && res.countryId != null)
                  {
                    this.MarSalesInvAddForm.get("countryId").setValue(res.countryId);
                  }
                if(res.marketInvoicesDTModel.length > 0 && res.marketInvoicesDTModel.length != null)
                  {
                    this.MarSalesInvAddForm.get("marketInvoicesDTModel").setValue(res.marketInvoicesDTModel); 
                    this.marSalesInvDTList = res.marketInvoicesDTModel;
                  }
                
                let index = 0;
                this.marSalesInvDTList.forEach(element => {
                  let promoitemId = this.allItemsList.find(s => s.data1 == element.itemNo).id;
                  element.itemNo = promoitemId;
                });
              debugger
                this.marSalesInvDTList.forEach(element => {
                  this.allUnitsList.forEach(item => {
                    if (item.id === element.unitId) {
                      this.unitList[index] = this.allUnitsList.filter(unit => unit.id == element.unitId);              
                      index++;
                    }
                  });
                })
                for (let i = 0; i < this.marSalesInvDTList.length; i++) {
                    this.GetItemUnits(this.marSalesInvDTList[i].itemNo, i)            
                }
              }            
          })

        }
    }

    getCustomers(event: any){
      debugger
      const countryId = event.value === undefined ? event : event.value;
      if(countryId == 0)
        this.agentsList = this.allcustomers;
      else
        this.agentsList = this.allcustomers.filter(c => c.id == countryId );
    }
    
    checkVoucher(voucherNo:string)
    {
      debugger
      if(voucherNo != null || voucherNo != undefined )
        {
          this.service.CheckifVoucherExist(voucherNo).subscribe(res => 
            {
              debugger
              if(res)
              {
                this.MarSalesInvAddForm.get("voucherNo").setValue("");
                this.alert.ShowAlert("billNoIsExist","error")
                this.cdr.detectChanges();
              }
            })
        }
    }
}
