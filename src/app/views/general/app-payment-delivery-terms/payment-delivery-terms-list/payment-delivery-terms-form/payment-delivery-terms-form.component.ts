import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { PaymentDeliveryTermsService } from '../../payment-delivery-terms.service'
import { Router } from '@angular/router';
@Component({
  selector: 'app-paymentDeliveryTerm-form',
  templateUrl: './payment-delivery-terms-form.component.html',
  styleUrls: ['./payment-delivery-terms-form.component.scss']
})
export class PaymentDeliveryTermsFormComponent implements OnInit {
  paymentDeliveryTermFormInitialForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  /**checkbox selecter */
  active: number;
  /**radioButton Selecter */
  termsTypes: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private paymentDeliveryTermsService: PaymentDeliveryTermsService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.PaymentDeliveryTermInitialForm();
    this.GetPaymentDeliveryTermInitialForm();
  }
  PaymentDeliveryTermInitialForm() {
    this.paymentDeliveryTermFormInitialForm = this.formbulider.group({
      id: [0],
      companyid: [0],
      termType: [0,[Validators.required,Validators.min(1)]],
      descrNameA: ["",[Validators.required,Validators.min(1)]],
      descrNameE: ["",[Validators.required,Validators.min(1)]],
      dueDays: [0,[Validators.required,Validators.min(1)]],
      isActive: [false],
      note: [""],
    });
  }
  GetPaymentDeliveryTermInitialForm() {
    this.paymentDeliveryTermsService.GetPaymentDeliveryTermInitailForm(this.data.id).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['PaymentDeliveryTerms/PaymentDeliveryTermsList']);
          this.dialogRef.close(false);
          return;
        }
      this.active = result.isActive;
      this.paymentDeliveryTermFormInitialForm.patchValue(result);
      if (result.termType == 65) {
        this.termsTypes = result.termType;
      }
      else if (result.termType == 64) {
        this.termsTypes = result.termType;
      }
    });
  }
  OnSaveForms() {
    
    this.paymentDeliveryTermFormInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    if (this.active == 1) {
      this.paymentDeliveryTermFormInitialForm.value.isActive = true;
    }
    else {
      this.paymentDeliveryTermFormInitialForm.value.isActive = false;
    }
    
    debugger
    // this.paymentDeliveryTermFormInitialForm.value.termType = 64;
    this.paymentDeliveryTermsService.PostPaymentDeliveryTerm(this.paymentDeliveryTermFormInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetPaymentDeliveryTermInitialForm();
          this.data.GetPaymentDeliveryTermListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetPaymentDeliveryTermInitialForm();
          this.data.GetPaymentDeliveryTermListFromParent()
        }
      })
  }
  onCTermTypeRaido(event) {
    this.paymentDeliveryTermFormInitialForm.value.termType = event.defaultValue;
  }

}
