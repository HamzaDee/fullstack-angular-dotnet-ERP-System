import { ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Title } from '@angular/platform-browser';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import * as _ from 'lodash';
import { AppAccountsBudgetsModule } from '../app-accountsbudgets.module';
import { AccountsBudgetsService } from '../accountsbudgets.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

@Component({
  selector: 'app-accountsbudgets-form',
  templateUrl: './accountsbudgets-form.component.html',
  styleUrls: ['./accountsbudgets-form.component.scss']
})
export class AccountsbudgetsFormComponent implements OnInit {
  public TitlePage: string;  
  RequstId: any;
  hasPerm: boolean;
  titlePage: string;
  showLoader = false
  AccountBudgetsAddForm: FormGroup;
  AccountBudgetsModel: AppAccountsBudgetsModule
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
  AccountsList: any;
  selectedbranch: any;
  BranchesList: any;
  selectedpolicy: any;
  PolicysList: any;
  NewBudgetList: any[];
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
  disableAmt:boolean =false;


  constructor(
    private translateService: TranslateService,
    private jwtAuth: JwtAuthService,
    private title: Title,
    private alert: sweetalert,
    public router: Router,
    private formbulider: FormBuilder,
    private AccountsBudgetsService: AccountsBudgetsService,
    public routePartsService: RoutePartsService,
    private cdRef: ChangeDetectorRef,
    private appCommonserviceService : AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.RequstId = this.routePartsService.GuidToEdit;
    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['Budget/AccountsbudgetsList']);
    }
    this.InitiailBudgetForm();
    this.GetAccountsBudgetsInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountsbudgetsForm');
    this.title.setTitle(this.TitlePage);
  }

  InitiailBudgetForm() {
    this.AccountBudgetsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      transNo:[0],
      transDate:["",[Validators.required]],
      yearId:[0,[Validators.required, Validators.min(1)]],
      devideByMonths:[false],
      accountId:[0],
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
      newBudgetList : [null],
      currencyId: [0]
      
    });
  }

  GetAccountsBudgetsInitialForm() {
      debugger
      this.AccountsBudgetsService.GetAccountsbudgetsInitialForm(this.RequstId).subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            this.router.navigate(['Budget/AccountsbudgetsList']);
            return;
          }
        this.fiscalYearList = result.fiscalYearList;                          
        this.AccountsList = result.accountsModelList;
        this.BranchesList = result.branchesModelList;       
        this.PolicysList=result.policysModelList;
        this.NewBudgetList = result.newBudgetList;
        debugger
        result.transDate = formatDate( result.transDate , "yyyy-MM-dd" ,"en-US")
        // this.AccountBudgetsAddForm.patchValue(result);
        this.AccountBudgetsAddForm.value.yearId = result.yearId;
        this.currencyList = result.currencyList;
        this.AccountBudgetsAddForm.get("currencyId").setValue(result.defaultCurrency);
        this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2; 
        if(result.devideByMonths == true)
        {
          this.devideByMonths = 1
          this.disableAmt = false;
        }
        else
        {
          this.disableAmt = true;
          this.devideByMonths = 0
        }      
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(value => {
          this.AccountBudgetsAddForm.get("transDate").setValue(result.transDate);
          this.AccountBudgetsAddForm.get("transNo").setValue(result.transNo);
          this.AccountBudgetsAddForm.get("yearId").setValue(result.yearId);
          this.AccountBudgetsAddForm.get("accountId").setValue(result.accountId);
          this.AccountBudgetsAddForm.get("branchId").setValue(result.branchId);
          this.AccountBudgetsAddForm.get("amount").setValue(result.amount);
          this.AccountBudgetsAddForm.get("policyId").setValue(result.policyId);
          this.selectedyear = result.yearId;
        });
          debugger
        if (result.newBudgetList != null){
          this.NewBudgetList = result.newBudgetList;
          this.Mid = result.id          
        }       
        else {
          this.checkTexts();
          this.NewBudgetList = [
            {                    
              accountId:0,
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
      })
  }
        
  OnSaveForms() {
    debugger
    let stopExecution = false;
      this.NewBudgetList.forEach(element=> {
        if(element.accountId == 0 || element.policyId == 0 || element.amount == 0 ){
          this.alert.ShowAlert("msgEnterAllData",'error');
          stopExecution = true;
          return;
        }
      })
      if (stopExecution) {
        return; 
      }      
      debugger
      this.AccountBudgetsAddForm.value.newBudgetList = this.NewBudgetList
      this.AccountsBudgetsService.PostAccountsbudgets(this.AccountBudgetsAddForm.value).subscribe(res => {
        if(res){
          this.alert.SaveSuccess();
          if(this.RequstId > 0)
            {
              this.router.navigate(['Budget/AccountsbudgetsList']);
            }
          this.RequstId = 0;
          this.ngOnInit();
        }
        else{
          this.alert.SaveFaild();
        }        
      }, err => {
        this.alert.SaveFaild();
      })
  }
  
  DeleteAccountsBudgets() {
    this.NewBudgetList = [];
    this.AddNewRowAccountsBudget()
  }

  GetAccounts(){
    debugger
      this.NewBudgetList = [];
      this.AccountsList.forEach(elements => {
        if(elements.id>0){
          this.NewBudgetList.push(
            {                
              accountId:elements.id,
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

  AddNewRowAccountsBudget() {
    debugger
    if(this.NewBudgetList != null)
      {
        let maxId = 0;
        if (this.NewBudgetList.length > 0) {
          this.NewBudgetList.forEach(elements => {
            if (elements.id > maxId) {
              maxId = elements.id;
            }
          });
        }
      }
    
      const newRow = {         
        accountId:0,
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
      this.NewBudgetList.push(newRow);
  }

  deleteRow(row: number) {
    debugger
    if (row !== -1) {
      this.NewBudgetList.splice(row, 1);
    //  this.cdRef.detectChanges(); // Trigger re-render of the view
    }
  }

  checkTexts(){
  
   debugger
   
    if($('#check_Months').prop('checked'))
    {
      this.disableAmt= false;
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
      this.disableAmt= true;
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

  updateValueField(value: any, row: any, fieldName: string): void {
    debugger;
 
    if (fieldName === 'amount') {
      const copiedValue = value; // Create a copy of the original value
      this.divideValue(row, copiedValue);
    } else {
      // Update the specific month field
     // row[fieldName] = value; 
 
      value = parseFloat(value.toString());
      row[fieldName] = value.toFixed(this.decimalPlaces); 
    }
  
    this.updateSum(row);
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
      row.amount = sum.toFixed(3); 
     /*  row.month1 = parseFloat(row.month1); 
      row.month1 = row.month1.toFixed(3); */
  }

  CheckAccount(event,row,index)
  {
    debugger
    if(this.AccountBudgetsAddForm.value.yearId == 0)
      {
        this.alert.ShowAlert("msgPleaseEnterYear",'error');        
        return ;
      }
    if(event.value > 0)
      {
        this.AccountsBudgetsService.CheckIfExistAccountId(event.value,this.AccountBudgetsAddForm.value.yearId).subscribe(result => {
          debugger
          if(result)
            {
              this.alert.ShowAlert("ThisAccountNoHasBeenSavedBeforeInBudgets",'error');
              const budget = this.NewBudgetList[index];
              budget.accountId = 0;
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
            for (let r = 0; r < this.NewBudgetList.length; r++) {
              if(index != r)
                {           
                  if(event.value == this.NewBudgetList[r].accountId)
                    {
                      if(this.NewBudgetList[r].branchId == this.NewBudgetList[index].branchId)
                        {
                          this.alert.ShowAlert("ThisAccountHasBeenInsertedBefore",'error');
                          this.NewBudgetList[index].accountId=0;
                          this.cdRef.detectChanges();
                        }
                    }                      
                }
            }
          }         
        })

      }

  }

  ClearTable()
  {
    this.NewBudgetList = [];
    this.AccountBudgetsAddForm.get("newBudgetList").setValue([]);
    this.checkTexts();
    this.NewBudgetList = [
      {                    
        accountId:0,
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
      accountId:0,
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
    this.NewBudgetList.push(newRow);
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
        for (let r = 0; r < this.NewBudgetList.length; r++) {
          if(index != r)
            {           
              if(event.value == this.NewBudgetList[r].branchId)
                {
                  if(this.NewBudgetList[r].accountId == this.NewBudgetList[index].accountId)
                    {
                      this.alert.ShowAlert("ThisCostCenterHasBeenInsertedBefore",'error');
                      setTimeout(() => {
                        this.NewBudgetList[index].branchId = 0;
                        this.cdRef.detectChanges();
                      }, 0);
                    }  
                }                          
            }
        }
      }    
  }
}

