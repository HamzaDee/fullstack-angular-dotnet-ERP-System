import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TaxService } from '../../tax.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tax-form',
  templateUrl: './tax-form.component.html',
  styleUrls: ['./tax-form.component.scss']
})
export class TaxFormComponent implements OnInit {
  taxForm: FormGroup;
  /**options dropDownList */
  AccountsList: any;
  TaxTypesList: any;
  /**selected dropDownList */
  selectedTaxType: any;
  selectedAccount: any;

  showLoader = false;
  hasPerm: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private taxService: TaxService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.InitialTaxForm();
    this.GetInitialTaxForm();
  }
  InitialTaxForm() {
    this.taxForm = this.formbulider.group({
      id: [0,],
      companyID: [0,],
      taxNameA: [0, [Validators.required,Validators.min(1)]],
      taxNameE: [0, [Validators.required,Validators.min(1)]],
      accountId: [0, [Validators.required,Validators.min(1)]],
      taxPercentage: [0, [Validators.required, Validators.min(0)]],
      taxType: [0, [Validators.required,Validators.min(1)]],
    });
  }
  GetInitialTaxForm() {
    debugger
    this.taxService.GetTaxInitialForm(this.data.id).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Tax/TaxList']);
          this.dialogRef.close(false);
          return;
        }
      this.AccountsList = result.accountsList;
      this.TaxTypesList = result.taxTypesList;
      this.taxForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedTaxType = result.taxType;
        this.selectedAccount = result.accountId;
      });
    });
  }
  OnSaveForms() {
    debugger
    this.taxForm.value.companyID = this.jwtAuth.getCompanyId();
    this.taxService.PostTax(this.taxForm.value)
      .subscribe(() => {
        debugger
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetInitialTaxForm();
          this.data.GetAllTaxList()
        }
        else {
          this.alert.SaveSuccess()
          this.GetInitialTaxForm();
          this.data.GetAllTaxList()
        }
      })
  }
}
