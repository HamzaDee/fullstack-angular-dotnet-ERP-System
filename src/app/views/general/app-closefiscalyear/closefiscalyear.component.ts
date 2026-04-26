import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { Observable } from 'rxjs';
import { CloseYearService } from './closeyear.service';
import { delay } from 'rxjs/operators';
import {  of } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-closefiscalyear',
  templateUrl: './closefiscalyear.component.html',
  styleUrls: ['./closefiscalyear.component.scss']
})
export class ClosefiscalyearComponent implements OnInit {
  CloseYearAddForm: FormGroup;
  RequstId: any; 
  public TitlePage: string;
  accountsList:any;
  disableAll:boolean=true;
  loading: boolean;
  firstInventoryAccList: any[] = [];
  lastInventoryAccList: any[] = [];
  decimalPlaces: number =3;
  detalied:boolean;
  collective:boolean;

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    public routePartsService: RoutePartsService,
    public router: Router,
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private appCommonserviceService : AppCommonserviceService,
    private alert: sweetalert,
    private service :CloseYearService,
    private egretLoader: AppLoaderService,
  ) { }  

  ngOnInit(): void 
  {
    this.CloseYearAddNewForm();
    this.CloseYearIntitialForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CloseYearForm');
    this.title.setTitle(this.TitlePage);
  }

  CloseYearAddNewForm() {    
    this.CloseYearAddForm = this.formbulider.group({
      id:[0],
      companyId: [0], 
      year:[0],  
      profLossAccId:[0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      firstInvAcc:[null],
      lastInvAc:[null],
      isDetails:[0],
    });             
  }
 
  CloseYearIntitialForm()
  {
    debugger
    this.detalied=false;
    this.collective=true;
    this.service.GetCloseYearIntitialForm().subscribe(result => {
      if(result)
        {
          debugger
          this.accountsList = result.accountList;
          
        }
        const source$ = of(1, 2);
        source$.pipe(delay(0)).subscribe(() => {
          debugger
          this.CloseYearAddForm.get("id").setValue(this.data.id);
          this.CloseYearAddForm.get("year").setValue(this.data.year);      
          })
    })
    
  }

  AddNewLine(type:number){  
    if(type == 1 )
      {
        this.firstInventoryAccList.push(
          {
            AccID: 0,
            Amt: 0,
            
          });
          this.CloseYearAddForm.get("firstInvAcc").setValue(this.firstInventoryAccList);
      }  
      else
      {
        this.lastInventoryAccList.push(
          {
            AccID: 0,
            Amt: 0,
            
          });
          this.CloseYearAddForm.get("lastInvAc").setValue(this.lastInventoryAccList);
      }
  }
  
  onAddRowBefore(rowIndex: number,type:number) {
    if(type == 1 )
      {
        const newRow = 
        {
          AccID: 0,
          Amt: 0,
          
        };
    
        this.firstInventoryAccList.splice(rowIndex, 0, newRow);
        this.CloseYearAddForm.get("firstInvAcc").setValue(this.firstInventoryAccList);
      }
      else
      {
        const newRow = 
        {
          AccID: 0,
          Amt: 0,
          
        };
    
        this.lastInventoryAccList.splice(rowIndex, 0, newRow);
        this.CloseYearAddForm.get("lastInvAc").setValue(this.lastInventoryAccList);
      }
   
  }


  deleteRow(rowIndex: number,type:number) {
    debugger
    if(type == 1 )
      {
        if (rowIndex !== -1) {
          this.firstInventoryAccList.splice(rowIndex, 1);
        }
        this.CloseYearAddForm.get("firstInvAcc").setValue(this.firstInventoryAccList);
      }
      else
      {
        if (rowIndex !== -1) {
          this.lastInventoryAccList.splice(rowIndex, 1);
        }
        this.CloseYearAddForm.get("lastInvAc").setValue(this.lastInventoryAccList);
      }
    
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  calculateSum(type){
  if(type == 1){
      return this.formatCurrency(this.firstInventoryAccList.reduce((sum, item) => sum + parseFloat(item.Amt), 0));
    }
    else
    {
      return this.formatCurrency(this.lastInventoryAccList.reduce((sum, item) => sum + parseFloat(item.Amt), 0));
    }    
  }

handelCollectiveCB(event)
{
  debugger
  if(event.currentTarget.checked == true)
    {
      this.detalied = false;
      this.CloseYearAddForm.get("isDetails").setValue(1);
    }
}

handelDetaliedCB(event)
{
  debugger
  if(event.currentTarget.checked == true)
    {
      this.collective = false;
      this.CloseYearAddForm.get("isDetails").setValue(0);
    }
}

  formatAmt(row: any){
    debugger
    row.Amt = row.Amt.toFixed(this.decimalPlaces);
}


  isEmpty(input) {
    return input === '' || input === null;
  }
  
  onConfirm(): void {
    debugger
    const formValues = this.CloseYearAddForm.value;
    this.service.CloseYear(formValues.id,formValues.profLossAccId,formValues.firstInvAcc,formValues.lastInvAc,formValues.isDetails,).subscribe((result) => {
      debugger;
      if(result == 1)
        {
          this.alert.SaveSuccess();
          this.data.GetFiscalYearListFromParent()
          this.dialogRef.close(); 
        }
        else
        {
          console.log("failed")
        }   
      });   
  }

  onCancel(): void {
      this.dialogRef.close();  
  }

}
