import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { CurrencyService } from '../../currency.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-currency-form',
  templateUrl: './currency-form.component.html',
  styleUrls: ['./currency-form.component.scss']
})
export class CurrencyFormComponent implements OnInit {
  currencyForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private currencyService: CurrencyService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.InitialCurrencyForm();
    this.GetInitialCurrencyForm();
  }

  InitialCurrencyForm() {
    this.currencyForm = this.formbulider.group({
      id: [0,],
      companyID: [0,],
      currNameA: [0, [Validators.required,Validators.min(1)]],
      currNameE: [0, [Validators.required,Validators.min(1)]],
      shortNameA: [0, [Validators.maxLength(3)]],
      shortNameE: [0, [Validators.maxLength(3)]],
      exchangeRate: [0, [Validators.required,, this.greaterThanZeroValidator]],
      coinNameA: [0, [Validators.required,Validators.min(1),Validators.maxLength(10)]],
      coinNameE: [0, [Validators.required,Validators.min(1),Validators.maxLength(10)]],
      symbol: [0],
      muthannaName: [0],
      pluralName: [0],
      decimalPlaces: [0],
    });
  }

  greaterThanZeroValidator(control: any) {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidValue: true };
    }
    return null; // Validation passed
  }
  
  GetInitialCurrencyForm() {
    this.currencyService.GetCurrencyInitialForm(this.data.id).subscribe(result => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
      {
        this.alert.ShowAlert("msNoPermission",'error');
        this.router.navigate(['Currency/CurrencyList']);
        this.dialogRef.close(false);
        return;
      }
      this.currencyForm.patchValue(result);
    });
  }
  OnSaveForms() {
    this.currencyForm.value.companyID = this.jwtAuth.getCompanyId();
    this.currencyService.PostCurrency(this.currencyForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetInitialCurrencyForm();
          this.data.GetCurrencyListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetInitialCurrencyForm();
          this.data.GetCurrencyListFromParent()
        }
      })
  }
}
