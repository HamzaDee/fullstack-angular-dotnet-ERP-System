import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { CheckPermissionsService } from 'app/shared/services/app-permissions/check-permissions.service';
import { ScreenActionsEnum } from 'app/shared/Enum/enum';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropDownModel } from 'app/shared/models/DropDownModel';
import { formatDate } from '@angular/common';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { AppCostcenterbudgetsModule } from '../app-costcenterbudgets.module';
import { CostCenterBudgetsService } from '../costcenterbudgets.service';

import { of } from 'rxjs';
import { debounce, delay } from 'rxjs/operators';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';


@Component({
  selector: 'app-costcenterbudgets-form',
  templateUrl: './costcenterbudgets-form.component.html',
  styleUrls: ['./costcenterbudgets-form.component.scss']
})
export class CostcenterbudgetsFormComponent implements OnInit {
  public TitlePage: string;  
  RequstId: any;
  hasPerm: boolean;
  titlePage: string;
  showLoader = false
  CostCenterBudgetsAddForm: FormGroup;
  AppCostcenterbudgetsModule: AppCostcenterbudgetsModule
  companyActivityList: any;
  groupList: any;
  selectedCompanyActivity: any;
  selectedGroup: any;
  selectedlatitude: any;
  selectedlongitude: any;
  zoom = 6;
  devideByMonths:number;
  selectedyear: number;
  fiscalYearList: any;
  selectedacc: any;
  costcentersList: any;
  selectedbranch: any;
  BranchesList: any;
  selectedpolicy: any;
  PolicysList: any;
  NewCostCenterBudgetsList: any[];
  startDateDealing: any;
  Mid :number;
  DateNow : Date = new Date();
  amount: number;
  months: number[] = new Array(12).fill(0);
  mapCenter = {
    lat: 31.94676919212428,
    lng: 35.91525067276346
  }
  decimalPlaces: number;
  currencyList: any;

  constructor(
    private translateService: TranslateService,
    private jwtAuth: JwtAuthService,
    private title: Title,
    private alert: sweetalert,
    public router: Router,
    private formbulider: FormBuilder,
    private CostCenterBudgetsService: CostCenterBudgetsService,
    public routePartsService: RoutePartsService,
    private cdRef: ChangeDetectorRef,
    private appCommonserviceService : AppCommonserviceService
  ) { }

ngOnInit(): void {
  this.RequstId = this.routePartsService.GuidToEdit;
  this.SetTitlePage();
  if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
    this.router.navigate(['CostCenterBudgets/CostcenterbudgetsList']);
  }
  this.InitiailCostCenterBudgetsForm();
  this.GetCostCenterBudgetsInitialForm();
}

SetTitlePage() {
  this.TitlePage = this.translateService.instant('CostcentersBudgets');
  this.title.setTitle(this.TitlePage);
}

InitiailCostCenterBudgetsForm() {
  this.CostCenterBudgetsAddForm = this.formbulider.group({
    id: [0],
    companyId: [0],
    transNo:[0],
    transDate:["",[Validators.required]],
    yearId:[0,[Validators.required, Validators.min(1)]],
    devideByMonths:[false],
    costcenterId:[0],
    branchId:[0],
    amount:[0],
    policyId:[0],
    isCanceled:[false],
    month1:[0],
    month2:[0],
    month3:[0],
    month4:[0],
    month5:[0],
    month6:[0],
    month7:[0],
    month8:[0],
    month9:[0],
    month10:[0],
    month11:[0],
    month12:[0],
    NewCostCenterBudgetsList : [null],
    currencyId: [0]
  });
}

GetCostCenterBudgetsInitialForm() {
    debugger
    this.CostCenterBudgetsService.GetCostCenterBudgetsModel(this.RequstId).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.router.navigate(['CostCenterBudgets/CostcenterbudgetsList']);
          return;
        }
      this.fiscalYearList = result.fiscalYearList;                          
      this.costcentersList = result.costCenterNewList;
      this.BranchesList = result.branchesModelList;       
      this.PolicysList=result.policysModelList;
      this.NewCostCenterBudgetsList = result.newCostCenterBudgetsList;
      result.transDate = formatDate( result.transDate , "yyyy-MM-dd" ,"en-US")
      this.CostCenterBudgetsAddForm.patchValue(result);
      this.currencyList = result.currencyList;
      this.CostCenterBudgetsAddForm.get("currencyId").setValue(result.defaultCurrency);
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2; 
      debugger
      this.CostCenterBudgetsAddForm.value.yearId = result.yearId;
      if(result.devideByMonths == true)
      {
        this.devideByMonths = 1
      }
      else
      {
        this.devideByMonths = 0
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedyear = result.yearId;
      });
        
      if (result.newCostCenterBudgetsList != null){
        this.NewCostCenterBudgetsList = result.newCostCenterBudgetsList;
        this.NewCostCenterBudgetsList.forEach(element=> {
          debugger
          element.costcenterId = element.costCenterId;
          
        })
        this.Mid = result.id          
      }
      else {
        this.checkTexts();
        this.NewCostCenterBudgetsList = [
          {                    
            costcenterId:0,
            branchId:0,
            amount: 0,
            policyId: 0,
            month1: 0,
            month2: 0,
            month3: 0,
            month4: 0,
            month5: 0,
            month6: 0,
            month7: 0,
            month8: 0,
            month9: 0,
            month10: 0,
            month11: 0,
            month12: 0,                        
          }
        ]
      }
})}

OnSaveForms() {
  debugger
  let stopExecution = false;
    this.NewCostCenterBudgetsList.forEach(element=> {
      if(element.costcenterId == 0 || element.policyId == 0 || element.amount == 0 ){
        this.alert.ShowAlert("msgEnterAllData",'error');
        stopExecution = true;
        return;
      }
    })
    if (stopExecution) {
      return; 
    }      
    debugger
    this.CostCenterBudgetsAddForm.value.newCostCenterBudgetsList = this.NewCostCenterBudgetsList
    this.CostCenterBudgetsService.PostCostCenterBudgets(this.CostCenterBudgetsAddForm.value).subscribe(res => {
      if(res){
        this.alert.SaveSuccess();
        if(this.RequstId > 0)
          {
            this.router.navigate(['CostCenterBudgets/CostcenterbudgetsList']);
          }
        this.RequstId = 0 ;
        this.ngOnInit();
      }
      else{
        this.alert.SaveFaild();
      }        
    }, err => {
      this.alert.SaveFaild();
    })
}

DeleteCostCenterBudgets() {
  this.NewCostCenterBudgetsList = [];
  this.AddNewRowCostCenterBudget()
}

GetCostcenter(){
debugger
  this.NewCostCenterBudgetsList = [];
  this.costcentersList.forEach(elements => {
    if(elements.id>0){
      this.NewCostCenterBudgetsList.push(
        {                
          costcenterId:elements.id,
          branchId:0,
          amount: 0,
          policyId: 0,
          month1: 0,
          month2: 0,
          month3: 0,
          month4: 0,
          month5: 0,
          month6: 0,
          month7: 0,
          month8: 0,
          month9: 0,
          month10: 0,
          month11: 0,
          month12: 0,           
        }
      )
    }
  });
} 

AddNewRowCostCenterBudget() {
debugger
let maxId = 0;
if (this.NewCostCenterBudgetsList.length > 0) {
  this.NewCostCenterBudgetsList.forEach(elements => {
    if (elements.id > maxId) {
      maxId = elements.id;
    }
  });
}
  const newRow = {         
    costcenterId:0,
    branchId:0,
    amount: 0,
    policyId: 0,
    month1: 0,
    month2: 0,
    month3: 0,
    month4: 0,
    month5: 0,
    month6: 0,
    month7: 0,
    month8: 0,
    month9: 0,
    month10: 0,
    month11: 0,
    month12: 0,         		
    };
  this.NewCostCenterBudgetsList.push(newRow);
}

deleteRow(rowIndex: number) {
  if (rowIndex !== -1) {
    this.NewCostCenterBudgetsList.splice(rowIndex, 1);
    //this. claculateAllAmount(); 
  }
}

checkTexts(){     
  if($('#check_Months').prop('checked'))
  {
    $('.amt').prop("disabled", false);
    $('.m01').prop('disabled', true);
    $('.m02').prop('disabled', true);
    $('.m03').prop('disabled', true);
    $('.m04').prop('disabled', true);
    $('.m05').prop('disabled', true);
    $('.m06').prop('disabled', true);
    $('.m07').prop('disabled', true);
    $('.m08').prop('disabled', true);
    $('.m09').prop('disabled', true);
    $('.m10').prop('disabled', true);
    $('.m11').prop('disabled', true);
    $('.m12').prop('disabled', true);

  }
  else{
    $('.amt').prop("disabled", true);
    $('.m01').prop('disabled', false);
    $('.m02').prop('disabled', false);
    $('.m03').prop('disabled', false);
    $('.m04').prop('disabled', false);
    $('.m05').prop('disabled', false);
    $('.m06').prop('disabled', false);
    $('.m07').prop('disabled', false);
    $('.m08').prop('disabled', false);
    $('.m09').prop('disabled', false);
    $('.m10').prop('disabled', false);
    $('.m11').prop('disabled', false);
    $('.m12').prop('disabled', false);
  }


}

updateValueField(value: number, row: any, fieldName: string): void {
  debugger;

  if (fieldName === 'amount') {
    const copiedValue = value; // Create a copy of the original value
    this.divideValue(row, copiedValue);
    row.amount = value;
  } else {      
    value = parseFloat(value.toString());
    row[fieldName] = value.toFixed(this.decimalPlaces); 
    this.updateSum(row);
  }          
}

formatCurrency(value: number): string {
  return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
}

private divideValue(row: any, value: number): void {
  
  // Divide the copied value to the 12 month fields
  const dividedValue = value / 12;
  for (let i = 1; i <= 12; i++) {
    row['month' + i] = dividedValue.toFixed(3);
  }
  
}

private updateSum(row: any): void {
  debugger
  // Calculate and update the sum
  let sum = 0;
  for (let i = 1; i <= 12; i++) {
    sum += parseFloat(row['month' + i]);
  }
  // Update the amount field with the sum (formatted to 3 decimal places)
  //  row.amount = sum.toFixed(3); 
  row.amount = sum.toFixed(this.decimalPlaces); 
}

CheckCostCenter(event,row,index)
{
  debugger
  if(this.CostCenterBudgetsAddForm.value.yearId == 0)
    {
      this.alert.ShowAlert("msgPleaseEnterYear",'error');        
      return ;
    }
  if(event.value > 0)
    {
      this.CostCenterBudgetsService.CheckIfExistCostCenter(event.value,this.CostCenterBudgetsAddForm.value.yearId).subscribe(result => {
        if(result)
          {
            this.alert.ShowAlert("ThisCostCenterHasBeenSavedBeforeInBudgets",'error');
            const budget = this.NewCostCenterBudgetsList[index];
            budget.costcenterId = 0;
            budget.branchId = 0;
            budget.amount = 0;
            budget.policyId = 0;
            budget.month1 = 0;
            budget.month2 = 0;
            budget.month3 = 0;
            budget.month4 = 0;
            budget.month5 = 0;
            budget.month6 = 0;
            budget.month7 = 0;
            budget.month8 = 0;
            budget.month9 = 0;
            budget.month10 = 0;
            budget.month11 = 0;
            budget.month12 = 0;
            this.cdRef.detectChanges();
          }  
          else
          {
            debugger
            for (let r = 0; r < this.NewCostCenterBudgetsList.length; r++) {
              if(index != r)
                {           
                  if(event.value == this.NewCostCenterBudgetsList[r].costcenterId)
                    if(this.NewCostCenterBudgetsList[r].branchId == this.NewCostCenterBudgetsList[index].branchId)
                      {
                        this.NewCostCenterBudgetsList[index].costcenterId=0;
                        this.alert.ShowAlert("ThisCostCenterHasBeenInsertedBefore",'error');                        
                        this.cdRef.detectChanges();
                      }       
             
                }
            }
          }          
      })

    }

}

ClearTable()
{
  this.NewCostCenterBudgetsList = [];
  this.CostCenterBudgetsAddForm.get("NewCostCenterBudgetsList").setValue([]);
  this.checkTexts();
    this.NewCostCenterBudgetsList = [
      {                    
        costcenterId:0,
        branchId:0,
        amount: 0,
        policyId: 0,
        month1: 0,
        month2: 0,
        month3: 0,
        month4: 0,
        month5: 0,
        month6: 0,
        month7: 0,
        month8: 0,
        month9: 0,
        month10: 0,
        month11: 0,
        month12: 0,                        
      }
    ]
  this.cdRef.detectChanges();
}

CopyRow(row,index)
  {
    debugger
    const newRow = {         
      costcenterId:0,
      branchId:0,
      amount: row.amount,
      policyId: row.policyId,
      month1: row.month1,
      month2: row.month2,
      month3: row.month3,
      month4: row.month4,
      month5: row.month5,
      month6: row.month6,
      month7: row.month7,
      month8: row.month8,
      month9: row.month9,
      month10: row.month10,
      month11: row.month11,
      month12: row.month12,        		
      };
    this.NewCostCenterBudgetsList.push(newRow);
    return false;
  }

  handleF3Key(event: KeyboardEvent, row, index) {   
     
    if (event.key === 'F4') {
      this.CopyRow(row,index);
    }
  }


  CheckBranch(event,row,index)
  {
    debugger
    if(event.value > 0)
      {          
        for (let r = 0; r < this.NewCostCenterBudgetsList.length; r++) {
          if(index != r)
            {           
              if(event.value == this.NewCostCenterBudgetsList[r].branchId)
                {
                  if(this.NewCostCenterBudgetsList[r].costcenterId == this.NewCostCenterBudgetsList[index].costcenterId)
                    {
                      this.alert.ShowAlert("ThisCostCenterHasBeenInsertedBefore",'error');
                      setTimeout(() => {
                        this.NewCostCenterBudgetsList[index].branchId = 0;
                        this.cdRef.detectChanges();
                      }, 0);
                    }  
                }                          
            }
        }
      }    
  }

}
