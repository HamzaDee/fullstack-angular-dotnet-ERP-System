import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppEntryvouchersService } from '../app-entryvouchers/app-entryvouchers.service';
import { sweetalert } from 'sweetalert';
@Component({
  selector: 'app-costcentertrans',
  templateUrl: './costcentertrans.component.html',
  styleUrls: ['./costcentertrans.component.scss']
})
export class CostcentertransComponent implements OnInit {
  CostcenterTransForm: FormGroup;
  RequstId: any; 
  public TitlePage: string;
  costcenterList: any[];
  CostcenterTransList: any[] = [];
  CostCenterTranModelList: any[] = [];
  branchId:any;
  NoteCostCenterBalance:any;
  Balance:any;
  CostCenterBudgetAmount:number;
  showBalance:boolean;
  CostCenterBudgetPolicy:number;
  NoteAlert:any;
  NotePrevenet:any;
  showAlert:boolean;
  showPrevent:boolean;
  SumAmount: number;



  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
    private service:AppEntryvouchersService,
    private alert: sweetalert,
  ) { }

  ngOnInit(): void {
    debugger
    this.RequstId = this.routePartsService.GuidToEdit;
    this.SumAmount = this.data.debit + this.data.credit;

    this.SetTitlePage();
    if (this.RequstId == null || this.RequstId == undefined || this.RequstId === "") {
      this.router.navigate(['EntryVouchers/EntryVouchersList']);
    }
    this.InitiailCostcentertransForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('addCompany');
    this.title.setTitle(this.TitlePage);
  }

  InitiailCostcentertransForm() {    
    this.CostcenterTransForm = this.formbulider.group({
      id: [0],
      voucherDTId: [0],
      costCenterId: [0],
      costCenterName : [""],
      debit: [0],
      credit: [0],
    });
    debugger
    this.costcenterList = this.data.costcenterList;
    this.branchId = this.data.branchId;
    debugger
    if(this.data.transList.length > 0){
      this.CostcenterTransList = this.data.transList;
    }
    else{
      this.costcenterList.forEach(element=> {
        this.CostcenterTransList.push({
          id: this.data.rowIndex,
          voucherDTId: 0,
          costCenterId : element.id,
          costCenterName: element.text,
          amount:0,
          debit: 0,
          credit: 0,
          isDebit:Number(this.data.debit)>0?true:false,
          costCenterBudgetPolicy:0,
          index: this.data.rowIndex
        });
      })
    }    
  }

  OnSaveForms() {
    debugger
    this.CostCenterTranModelList = this.CostCenterTranModelList.filter(item => item.id !== this.data.rowIndex);
    this.CostcenterTransList.forEach(element=> {
      element.debit= this.data.debit > 0 ? element.amount : 0;
      element.credit= this.data.credit > 0 ? element.amount : 0;
    })
    this.dialogRef.close(this.CostcenterTransList);
  }

  calculateSum(){
      return this.CostcenterTransList.reduce((sum, item) => sum + parseFloat(item.amount), 0); 
  }

  DistributeAmtToAllCenters(){
    debugger
    this.CostcenterTransList.length = 0;
    var rowCount = this.costcenterList.length;
    var amount = this.data.debit + this.data.credit;
    var amt =  amount / rowCount;
    this.costcenterList.forEach(element=> {
      this.CostcenterTransList.push({
        id: this.data.rowIndex,
        voucherDTId: 0,
        costCenterId : element.id,
        costCenterName: element.text,
        amount: amt.toFixed(3),
        debit: this.data.debit > 0 ? amt : 0,
        credit: this.data.credit > 0 ? amt : 0,
        isDebit:Number(this.data.debit)>0?true:false,
        index: this.data.rowIndex
      });
    })
    var totamt = this.CostcenterTransList.reduce((sum, item) => sum + parseFloat(item.amount), 0)
    var diffamt = totamt - amount;
    this.CostcenterTransList[rowCount-1].amount = (amt - diffamt).toFixed(3);
  }

  ReEnterValues(){
    this.CostcenterTransList.length = 0;
    this.costcenterList.forEach(element=> {
      this.CostcenterTransList.push({
        id: this.data.rowIndex,
        voucherDTId: 0,
        costCenterId : element.id,
        costCenterName: element.text,
        amount: 0,
        debit: 0,
        credit: 0,
        isDebit:Number(this.data.debit)>0?true:false,
        index: this.data.rowIndex
      });
    })
  }

  GetCostCenterInfo(row , index)
  {
    
    if(this.branchId == 0 || this.branchId == null || this.branchId == undefined)
      {
        this.branchId = 0;
      }
      var CostCenterName = this.costcenterList.find(r => r.id == row.costCenterId).text;
      if(row)
        {
          this.service.GetCostCenterInfo(row.costCenterId,this.branchId).subscribe((result) => {
            
            if (result)
            {   
              this.NoteCostCenterBalance = "رصيد مركز الكلفة " + "-" + CostCenterName + ": " +  Math.abs(result.balance).toFixed(3) + " , " + "الموازنة التقديرية لمراكز الكلف" + ": " + result.budgetAmt.toFixed(3); 
              this.Balance = Math.abs(result.balance).toFixed(3);
              this.CostCenterBudgetAmount =result.budgetAmt;
              this.showBalance = true;
              this.CostCenterBudgetPolicy = result.budgetPolicy;
              this.NoteAlert = "TheEnteredCostCenterBalanceExceededTheBudgetBalance";
              this.NotePrevenet = "TheCostCenterBalanceExceededTheAmountAllowedByTheBudget";           
              this.showAlert = false;
              this.showPrevent = false;
              this.CostcenterTransList[index].costCenterBudgetPolicy = result.budgetPolicy;            
              this.hideLabelAfterDelay();              
            }          
          });
        }
  }

CheckBudget(row)
{
  debugger
  if(row.amount > 0)
    {

      if(Number(row.amount)> Number(this.SumAmount)){
        row.amount = 0;
        this.alert.ShowAlert("msTheCostCenterValueIsHigherThanTheBondValue",'error');
        return;
      }



      if(this.CostCenterBudgetAmount != 0 )
        {
          if(Number(this.Balance) + Number(row.amount)  > this.CostCenterBudgetAmount)
            {
              if(row.costCenterBudgetPolicy == 60)
                {
                  this.showBalance = false;
                  this.showPrevent = false;
                  this.showAlert = true;
                  this.hideLabelAfterDelay();
                }
                else if(row.costCenterBudgetPolicy == 61)
                {
                  row.amount = 0;
                  this.showBalance = false;
                  this.showAlert = false;
                  this.showPrevent = true;
                  this.hideLabelAfterDelay();
                }
            }
        }
    }
}

  hideLabelAfterDelay() {
    setTimeout(() => {
      this.showBalance = false;
      this.showAlert = false;
      this.showPrevent = false;
    }, 10000);
  }
}
