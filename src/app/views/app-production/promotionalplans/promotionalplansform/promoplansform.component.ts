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
import { PromotionPlansService } from '../promoplans.service';

@Component({
  selector: 'app-promoplansform',
  templateUrl: './promoplansform.component.html',
  styleUrl: './promoplansform.component.scss'
})
export class PromoplansformComponent {
  PromotionPlansAddForm: FormGroup;
  public TitlePage: string;
  tabelData: any[];
  loading: boolean;
  opType: string;
  showsave: boolean;
  promotionPlanDTList: any[] = [];
  promoItemsList:any;
  validDate = true;
  showLoader = false;
  newAccNo: string;
  voucherId: any;
  isdisabled: boolean = false;
  decimalPlaces: number = 3;
  disableAll: boolean;
  voucherNo: number = 0;
  newDate:any;
  agentsList:any;
  countriesList:any
  salesOrderList:any;
  productedItemsList:any;
  // promotionalItemsList:any;
  promotionalItemsList: Array<any> = [];
  allItemsList:any;
  disableTableFields:boolean= true;
  isFromMaterialOrder:any;
  //Totals
    SumCost:string ="";
    SumQty:string="";
  //End
  filteredAgentsList: any[] = [];
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
      private service: PromotionPlansService
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
      if(this.opType == 'Approval')
          this.approval = true;
      this.SetTitlePage();
      if (this.voucherId == null || this.voucherId == undefined || this.voucherId === "") {
        this.router.navigate(['PromotionItemsPlans/PromotionPlanslist']);

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
      this.TitlePage = this.translateService.instant('PromotionPlansform');
      this.title.setTitle(this.TitlePage);
    }
  
    InitiailPromotionForm() {
      this.PromotionPlansAddForm = this.formbulider.group({
        id: [0],
        companyId: [0],
        planNo: [0, [Validators.required, Validators.min(1)]],
        planDate:["",[Validators.required]],
        countryId:[0,[Validators.required, Validators.min(1)]],
        agentId:[0,[Validators.required, Validators.min(1)]],
        expectedValue:[0],
        yearNo:[0,[Validators.required, this.validYearValidator()]],
        note:[""],        
        promotionalPlansDTModel: [null, [Validators.required, Validators.minLength(1)]],
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
      this.service.GetPromotionPlansForm(this.voucherId, this.opType).subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['PromotionItemsPlans/PromotionPlanslist']);
          return;
        }
        debugger
        result.planDate = formatDate(result.planDate, "yyyy-MM-dd", "en-US")

        this.promotionPlanDTList = result.promotionalPlansDTModel;
        this.PromotionPlansAddForm.get("promotionalPlansDTModel").setValue(result.promotionalPlansDTModel);         
        this.PromotionPlansAddForm.patchValue(result);
        this.agentsList = result.agentsList;
        this.countriesList= result.countryList;
        this.productedItemsList = result.productedItemsList;
        this.allItemsList = result.allItemsList;
        this.filteredAgentsList = [...this.agentsList];
        let index = 0;
        debugger
        if(this.promotionPlanDTList){
          this.promotionPlanDTList.forEach(element => {
            let ProditemId = this.allItemsList.find(s => s.data1 == element.prodItemNo).id;
            let promoitemId = this.allItemsList.find(s => s.data1 == element.itemNo).id;
            element.prodItemNo = ProditemId;
            element.itemNo = promoitemId;
          });
          this.promotionPlanDTList.forEach(element => {
            this.allItemsList.forEach(item => {
              if (item.id === element.itemNo) {
                this.promotionalItemsList[index] = this.allItemsList.filter(promo => promo.id == element.itemNo);              
                index++;
              }
            });
          })      
          for (let i = 0; i < this.promotionPlanDTList.length; i++) {
              this.GetPromotionalItems(this.promotionPlanDTList[i].prodItemNo, i)            
          }              
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          this.isdisabled = false;
          this.disableTableFields= true;
          if (this.voucherId > 0) {
            this.PromotionPlansAddForm.get("id").setValue(result.id);
            this.PromotionPlansAddForm.get("planNo").setValue(result.planNo);
            this.PromotionPlansAddForm.get("planDate").setValue(formatDate(result.planDate, "yyyy-MM-dd", "en-US"));
            this.PromotionPlansAddForm.get("expectedValue").setValue(result.expectedValue);
            this.PromotionPlansAddForm.get("countryId").setValue(result.countryId);
            this.PromotionPlansAddForm.get("agentId").setValue(result.agentId);
            this.PromotionPlansAddForm.get("note").setValue(result.note);
            this.PromotionPlansAddForm.get("yearNo").setValue(result.yearNo);
          }
          else {
            debugger
            this.newDate = new Date;
            this.PromotionPlansAddForm.get("id").setValue(0);
            this.PromotionPlansAddForm.get("planNo").setValue(result.planNo);
            this.PromotionPlansAddForm.get("planDate").setValue(formatDate(this.newDate, "yyyy-MM-dd", "en-US"));
            this.PromotionPlansAddForm.get("expectedValue").setValue(0);
            this.PromotionPlansAddForm.get("countryId").setValue(0);
            this.PromotionPlansAddForm.get("agentId").setValue(0);
            this.PromotionPlansAddForm.get("note").setValue("");
            this.PromotionPlansAddForm.get("yearNo").setValue(result.yearNo);            
          }  
        })
      });
    }
  
    OnSaveForms() {
      debugger
      this.disableSave = true;
      let stopExecution = false;
      for (let i = 0; i < this.promotionPlanDTList.length; i++) {
        if(this.promotionPlanDTList[i].prodItemNo == 0 || this.promotionPlanDTList[i].prodItemNo == null|| this.promotionPlanDTList[i].prodItemNo == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return;
          }
        if(this.promotionPlanDTList[i].itemNo == 0 || this.promotionPlanDTList[i].itemNo == null|| this.promotionPlanDTList[i].itemNo == undefined)
          {
            this.alert.ShowAlert("msgEnterAllData", 'error');
            stopExecution = true;
            this.disableSave = false;
            return false;
          }
        if(this.promotionPlanDTList[i].qty == 0 || this.promotionPlanDTList[i].qty == null|| this.promotionPlanDTList[i].qty == undefined)
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
      this.PromotionPlansAddForm.value.companyId = this.jwtAuth.getCompanyId();
      this.PromotionPlansAddForm.value.userId = this.jwtAuth.getUserId();
      this.PromotionPlansAddForm.value.voucherNo = this.PromotionPlansAddForm.value.id;//.toString();    
      this.PromotionPlansAddForm.value.promotionalPlansDTModel = this.promotionPlanDTList;
      this.promotionPlanDTList.forEach(element => {
        let prodItem = this.allItemsList.find(c => c.id == element.prodItemNo).data1;
        let promoItem = this.allItemsList.find(c => c.id == element.itemNo).data1;
        element.prodItemNo =prodItem;
        element.itemNo = promoItem;
      });
      debugger
      this.service.SavePromotionPlans(this.PromotionPlansAddForm.value)
        .subscribe((result) => {
          if (result) {
            this.alert.SaveSuccess();
            this.router.navigate(['PromotionItemsPlans/PromotionPlanslist']);
          }
          else {
            this.alert.SaveFaild();
          }
          this.disableSave = false;
        })
    }
  
    AddNewLine() {
      debugger
      if (this.promotionPlanDTList == null) {
        this.promotionPlanDTList = [];
      }  
      this.promotionPlanDTList.push(
        {
          id: 0,
          idHD: 0,
          prodItemNo: 0,
          itemNo: 0,
          qty: 0,       
          price:0,
          expectedCost:0,
          index: ""
        });
      this.PromotionPlansAddForm.get("promotionalPlansDTModel").setValue(this.promotionPlanDTList);
    }
  
    deleteRow(rowIndex: number) {
  
      if (rowIndex !== -1) {
        this.promotionPlanDTList.splice(rowIndex, 1);
        this.promotionalItemsList.splice(rowIndex,1); 
      }
      this.CalculateCost(this.promotionPlanDTList[rowIndex]);
      this.PromotionPlansAddForm.get("promotionalPlansDTModel").setValue(this.promotionPlanDTList);
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
  
      this.promotionPlanDTList.splice(rowIndex, 0, newRow);
      this.PromotionPlansAddForm.get("promotionalPlansDTModel").setValue(this.promotionPlanDTList);
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
          this.service.DeletePromotionPlans(id).subscribe((results) => {
            if (results.isSuccess == true) {
              this.alert.DeleteSuccess();
              this.router.navigate(['PromotionItemsPlans/PromotionPlanslist']);
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
      this.SumCost ="";
      this.SumQty ="";

      this.SumQty  =this.formatCurrency(this.promotionPlanDTList.reduce((sum, item) => sum + parseFloat(item.qty), 0));
      this.SumCost  =this.formatCurrency(this.promotionPlanDTList.reduce((sum, item) => sum + parseFloat(item.qty) * parseFloat(item.price), 0));

    }

    formatCurrency(value: number): string {
      return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
    }

    GetPromotionalItems(ProductedItem,index)
    {
      debugger
      if(ProductedItem > 0 && ProductedItem != null && ProductedItem != undefined)
        {
          this.service.GetPromotionalItems(ProductedItem).subscribe(res => {
            debugger
            if(res)
            {
              debugger                
              this.promotionalItemsList[index]= res.promotionalItemsList              
            }
          })
        }      
    }

    GetPromItemCost(itemNo,index){
      debugger
      let cost = this.promotionalItemsList[index].find(s => s.id == itemNo).data2;
      this.promotionPlanDTList[index].price = cost.toFixed(3);
    }

    CalculateCost(row:any)
    {
      if(row.price != null || row.price != undefined)
        {
          if(row.qty != null || row.qty != undefined)
            {
              row.expectedCost = row.qty * row.price; 
              row.expectedCost = parseFloat(row.expectedCost).toFixed(this.decimalPlaces);
              let tot  = this.formatCurrency(this.promotionPlanDTList.reduce((sum, item) => sum + parseFloat(item.expectedCost), 0)); 
              this.PromotionPlansAddForm.get("expectedValue").setValue(tot);
              this.CalculateTotals();
            }
        }
    }

    validYearValidator() {
      return (control: any): { [key: string]: any } | null => {
        const year = control.value;
        const currentYear = new Date().getFullYear();
        const isValidYear = year >= 1900 ; // Range: 1900 to the current year
        return isValidYear ? null : { invalidYear: true };
      };
    }

    getCustomers(event: any){
      debugger
      const countryId = event.value === undefined ? event : event.value;
      if(countryId == 0)
        this.filteredAgentsList = this.agentsList;
      else
        this.filteredAgentsList = this.agentsList.filter(c => c.id == countryId || c.id == -1);
    }

     ApproveOrder(Id)
    {
      this.service.ApproveOrder(Id).subscribe((result) => { 
        if (result.isSuccess == true) {
          this.alert.SaveSuccess();
          this.router.navigate(['PromotionItemsPlans/PromotionPlanslist']);
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
