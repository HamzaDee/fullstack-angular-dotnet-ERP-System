import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { FiscalyearService } from '../../fiscalyear.service';
import { formatDate } from '@angular/common';
import { ValidatorsService } from 'app/shared/services/validators.service';

@Component({
  selector: 'app-fiscalyear-form',
  templateUrl: './fiscalyear-form.component.html',
  styleUrls: ['./fiscalyear-form.component.scss']
})
export class FiscalyearFormComponent implements OnInit {
  FiscalYearFormInitialForm: FormGroup;
  selectedaccount: any;
  accountsList: any;
  DateNow : Date = new Date();
  active: number;
  closed: number;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  disable:boolean;
  disableCloseYear:boolean;
  public fromDate: any = (new Date()).toISOString().substring(0, 10);
  public toDate: any = (new Date()).toISOString().substring(0, 10);
  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  private formbulider: FormBuilder,
  public dialogRef: MatDialogRef<any>,
  private FiscalyearService: FiscalyearService,
  public validatorsService:ValidatorsService,
  private alert: sweetalert,
  
  private jwtAuth: JwtAuthService,) { }  
  ngOnInit(): void {
  this.CountyInitialForm()
  this.GetfiscalYearsInitialForm();
  setTimeout(() => {
    this.disableCloseYear = true;
    });
  }

  CountyInitialForm() {
    this.FiscalYearFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      yearNo: [0,[Validators.required, Validators.min(1)]],
      yearNameA: ["",[Validators.required, Validators.min(1)]],
      yearNameE: ["",[Validators.required, Validators.min(1)]],
      startDate:[this.fromDate,[Validators.required, Validators.min(1)]],
      endDate:[this.toDate,[Validators.required, Validators.min(1)]],
      isClosed: [0],
      isActive: [0],
      fromDate: [new Date()],
      toDate: [new Date()],
      
    });
  }

   GetfiscalYearsInitialForm() {
    
    this.FiscalyearService.GetFiscalYearInitailForm(this.data.id).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.dialogRef.close(false)
          return;
        }
      if (this.data.id == 0) {
        result.startDate = formatDate( this.fromDate , "yyyy-MM-dd" ,"en-US") 
        result.endDate= formatDate( this.toDate , "yyyy-MM-dd" ,"en-US") 
      }
      else
      {
        result.endDate = formatDate( result.endDate , "yyyy-MM-dd" ,"en-US")
        result.startDate = formatDate( result.startDate , "yyyy-MM-dd" ,"en-US")
      }
      if(this.data.isNew == false)
        {
          this.disable = true;
        }
        else
        {
          this.disable = false;
        }
            
      this.FiscalYearFormInitialForm.patchValue(result); 
      if (result.isActive) {
        this.active = 1;
      }
      else {
        this.active = 0;
      }
      if (result.isClosed) {
        this.closed = 1;
      }
      else {
        this.closed = 0;
      }
      
    });
    
  }

  OnSaveForms() {
    debugger
    if (this.active == 1) {
      this.FiscalYearFormInitialForm.value.isActive = true;
    }
    else {
      this.FiscalYearFormInitialForm.value.isActive = false;
    }
    if (this.closed == 1) {
      this.FiscalYearFormInitialForm.value.isClosed = true;
    }
    else {
      this.FiscalYearFormInitialForm.value.isClosed = false;
    }
    const startDateYear = Number(this.FiscalYearFormInitialForm.value.startDate.split("-")[0]);

    if (this.FiscalYearFormInitialForm.value.yearNo != startDateYear) {
      this.alert.ShowAlert("msgConfirmyear", 'error');
      return;
    }

    this.FiscalyearService.getYearNo(this.FiscalYearFormInitialForm.value.yearNo,this.FiscalYearFormInitialForm.value.id).subscribe((result) =>{
     debugger
     if(result == true) {    
        this.alert.ShowAlert("msgErrorYearNo", 'error');
      return;
     }
     else{
      this.FiscalYearFormInitialForm.value.companyId = this.jwtAuth.getCompanyId();
      this.FiscalyearService.PostFiscalYear(this.FiscalYearFormInitialForm.value)
        .subscribe((result) => {
          if (!this.data.isNew) {
            debugger            
            this.data.isNew = true
            this.data.id = 0
            this.alert.SaveSuccess();
            this.data.GetFiscalYearListFromParent()
            this.dialogRef.close(false)
          }
          else {
            if(result.isSuccess ==false && result.message =="msNoPermission")
              {
                this.alert.ShowAlert("msNoPermission",'error');
                return;
              }
            this.alert.SaveSuccess()
            this.GetfiscalYearsInitialForm();
            this.data.GetFiscalYearListFromParent()
          }
        })
     }
    });
  }
}

