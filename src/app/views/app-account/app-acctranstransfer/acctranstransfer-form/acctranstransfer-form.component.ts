import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AccTransTransferService } from '../acctrantransfer.service';
import { formatDate } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';

@Component({
  selector: 'app-acctranstransfer-form',
  templateUrl: './acctranstransfer-form.component.html',
  styleUrls: ['./acctranstransfer-form.component.scss']
})
export class AcctranstransferFormComponent implements OnInit {

  AccTransTransferForm: FormGroup;
  accountsList1: any;
  selectedAcc1: any;
  accountsList2: any;
  selectedAcc2: any;
  vouchersList:any;
  selectedVoucher:any;

  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  public Valid: boolean;
  public SDate: any = (new Date()).toISOString().substring(0, 10);


  constructor(
  @Inject(MAT_DIALOG_DATA) public data: any,
  private formbulider: FormBuilder,
  private translateService: TranslateService ,
  public dialogRef: MatDialogRef<any>,
  private AccTransTransferService: AccTransTransferService,
  private alert: sweetalert,
  public validatorsService:ValidatorsService,
  private jwtAuth: JwtAuthService,
  ) { }

  ngOnInit(): void {
    this.GetNewAccTransTransferForm();
    this.GetaccTransTransferForm();
  }

  GetNewAccTransTransferForm() {
  
    this.AccTransTransferForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      transDate:[this.SDate],
      fromAccId:[0,[Validators.required, Validators.min(1)]],
      toAccId:[0,[Validators.required, Validators.min(1)]],
      byUserId: [0],
      voucherTypes: [""],
      SDate: [new Date()],

    });
  }

   GetaccTransTransferForm() {
    debugger
    this.AccTransTransferService.GetAccTransTransferForm().subscribe((result) => {
    debugger
    if(result.isSuccess == false && result.message =="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.dialogRef.close(false)
        return;
      }
    this.accountsList1 = result.fromAccountList
    this.accountsList2 = result.toAccountList
    this.vouchersList = result.voucherTypeModelList
    this.AccTransTransferForm.patchValue(result);
    debugger
    if (this.data.id == 0) {
      result.transDate = formatDate( this.SDate , "yyyy-MM-dd" ,"en-US") 
    }
    else
    {
      result.transDate = formatDate( result.transDate , "yyyy-MM-dd" ,"en-US")
    }
      
      this.selectedAcc1=result.fromAccId;
      this.selectedAcc2=result.toAccId;
      this.selectedVoucher=result.voucherTypes;
      this.AccTransTransferForm.patchValue(result); 

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedAcc1=result.fromAccId;
        this.selectedAcc2=result.toAccId;
        this.selectedVoucher=result.voucherTypes;
      });
    });
    
  }


  OnSaveForms() {
    debugger
          this.AccTransTransferForm.value.companyId = this.jwtAuth.getCompanyId();
          this.AccTransTransferForm.value.byUserId = this.jwtAuth.getUserId();
          this.AccTransTransferForm.value.voucherTypes = this.AccTransTransferForm.value.voucherTypes.join(', ');
          this.AccTransTransferService.PostAccTransTransfer(this.AccTransTransferForm.value).subscribe(() => {
            debugger
              if (!this.data.isNew) {
                this.data.isNew = true
                this.data.id = 0
                this.alert.SaveSuccess();
                this.dialogRef.close(false)
                this.data.GetNewAccTransTransferFormParent()
              }
              else {
                this.alert.SaveSuccess()
                this.dialogRef.close(false)
                this.data.GetNewAccTransTransferFormParent()
              }
            })
        }
}
