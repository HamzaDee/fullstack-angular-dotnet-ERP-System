import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { PeriodsFiscalyearService } from '../../periodsfiscalyear.service';
import { formatDate } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { id } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';

@Component({
  selector: 'app-periodsfiscalyear-form',
  templateUrl: './periodsfiscalyear-form.component.html',
  styleUrls: ['./periodsfiscalyear-form.component.scss']
})
export class PeriodsFiscalyearFormComponent implements OnInit {
  PeriodsFiscalYearFormInitialForm: FormGroup;
  selectedyear: any;
  fiscalYearList: any;
  DateNow : Date = new Date();
  active: number;
  closed: number;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  public Valid: boolean;
  public fromDate: any = (new Date()).toISOString().substring(0, 10);
  public toDate: any = (new Date()).toISOString().substring(0, 10);
  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  private formbulider: FormBuilder,
  private translateService: TranslateService ,
  public dialogRef: MatDialogRef<any>,
  private PeriodsFiscalyearService: PeriodsFiscalyearService,
  private alert: sweetalert,
  public validatorsService:ValidatorsService,
  private jwtAuth: JwtAuthService,) { }  
  ngOnInit(): void {
this.GetPeriodsFiscalyearInitialForm();
this.GetperiodsfiscalYearsInitialForm();
  }
  CheckDateFromLessDateTo(fromDate, toDate) {
    debugger
    if (fromDate > toDate) {
      this.fromDate = toDate
    }
    if (toDate > (new Date()).toISOString().substring(0, 10)) {
      this.toDate = (new Date()).toISOString().substring(0, 10);
    }
  }
  GetPeriodsFiscalyearInitialForm() {
  
    this.PeriodsFiscalYearFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      periodNo:[0],
      yearId: [0,[Validators.required, Validators.min(1)]],
      periodNameA: ["",[Validators.required, Validators.min(1)]],
      periodNameE: ["",[Validators.required, Validators.min(1)]],
      startDate:[this.fromDate,[Validators.required, Validators.min(1)]],
      endDate:[this.toDate,[Validators.required, Validators.min(1)]],
      isActive: [0],
      isClosed: [0], 
      fromDate: [new Date()],
      toDate: [new Date()],
    });
  }

   GetperiodsfiscalYearsInitialForm() {
    this.PeriodsFiscalyearService.GetperiodsfiscalYearsInitialForm(this.data.id).subscribe((result) => {
    this.fiscalYearList = result.fiscalYearList
    this.PeriodsFiscalYearFormInitialForm.patchValue(result);
    if(result.isSuccess == false && result.message =="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.dialogRef.close(false)
        return;
      }
      debugger
      if (this.data.id == 0) {
        result.startDate = formatDate( this.fromDate , "yyyy-MM-dd" ,"en-US") 
        result.endDate= formatDate( this.toDate , "yyyy-MM-dd" ,"en-US") 
      }
      else
      {
        result.endDate = formatDate( result.endDate , "yyyy-MM-dd" ,"en-US")
        result.startDate = formatDate( result.startDate , "yyyy-MM-dd" ,"en-US")
      }
      
      result.yearno = result.yearno;
      this.selectedyear=result.yearId;
    this.PeriodsFiscalYearFormInitialForm.patchValue(result); 
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
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedyear = result.yearId;
      });
    });
    
  }

  OnSaveForms() {
    debugger
    debugger
    this.PeriodsFiscalyearService.ValidPeriodsFiscalYear(this.PeriodsFiscalYearFormInitialForm.value.yearId,this.PeriodsFiscalYearFormInitialForm.value.id,this.PeriodsFiscalYearFormInitialForm.value.startDate,this.PeriodsFiscalYearFormInitialForm.value.endDate).subscribe(
      (response) => {
        debugger
        this.Valid = response;

        if (this.Valid == false)
        {
          if (this.active == 1) {
            this.PeriodsFiscalYearFormInitialForm.value.isActive = true;
          }
          else {
            this.PeriodsFiscalYearFormInitialForm.value.isActive = false;
          }
          if (this.closed == 1) {
            this.PeriodsFiscalYearFormInitialForm.value.isClosed = true;
          }
          else {
            this.PeriodsFiscalYearFormInitialForm.value.isClosed = false;
          }
          this.PeriodsFiscalYearFormInitialForm.value.companyId = this.jwtAuth.getCompanyId();
          this.PeriodsFiscalyearService.PostPeriodsFiscalYear(this.PeriodsFiscalYearFormInitialForm.value)
            .subscribe(() => {
              if (!this.data.isNew) {
                this.data.isNew = true
                this.data.id = 0
                this.alert.SaveSuccess();
                this.GetperiodsfiscalYearsInitialForm();
                this.data.GetPeriodsFiscalYearListFromParent()
              }
              else {
                this.alert.SaveSuccess()
                this.GetperiodsfiscalYearsInitialForm();
                this.data.GetPeriodsFiscalYearListFromParent()
              }
            })
         
        }
       else{
        
        this.alert.ErrSave();
      
        }

      },
      (error) => {
        console.error('Error retrieving boolean value from API:', error);
      });

}
  
  getData(yearid,id,startDate,endDate) {
    debugger

     this.PeriodsFiscalyearService.ValidPeriodsFiscalYear(yearid,id,startDate,endDate).subscribe(
      (response) => {
        debugger
        this.Valid = response;
      },
      (error) => {
        console.error('Error retrieving boolean value from API:', error);
      });
  }

  handleIsActiveCheckBox(event)
  {
    debugger
    if(event.currentTarget.checked)
      {
        this.closed=0;
      }
  }


  handleIsClosedCheckBox(event)
  {
    debugger
    if(event.currentTarget.checked)
      {
        this.active=0;
      }
  }
}
  
