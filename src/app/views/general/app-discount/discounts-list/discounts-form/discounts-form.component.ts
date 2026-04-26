import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { DiscountService } from '../../discounts.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-discount-form',
  templateUrl: './discounts-form.component.html',
  styleUrls: ['./discounts-form.component.scss']
})
export class DiscountFormComponent implements OnInit {
  discountFormInitialForm: FormGroup;
  selectedaccount: any;
  accountsList: any;
  active: number;
  percentage: number;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private discountService: DiscountService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.CountyInitialForm();
    this.GetCountyInitialForm();
  }
  CountyInitialForm() {
    this.discountFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      discountNameA: [0,[Validators.required,Validators.min(1)]],
      discountNameE: [0,[Validators.required,Validators.min(1)]],
      accountId: [0],
      amount: [0,[Validators.required,Validators.min(1)]],
      isPercentage: [0,[Validators.required,Validators.min(1)]],
      isActive: [0,[Validators.required,Validators.min(1)]],
      note: [0],
    });
  }
  GetCountyInitialForm() {
    this.discountService.GetDiscountInitailForm(this.data.id).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Discount/DiscountsList']);
          this.dialogRef.close(false);
          return;
        }
      this.accountsList = result.accountsList
      this.discountFormInitialForm.patchValue(result);
      if (result.isActive) {
        this.active = 1;
      }
      else {
        this.active = 0;
      }
      if (result.isPercentage) {
        this.percentage = 1;
      }
      else {
        this.percentage = 0;
      }
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedaccount = result.accountId;
      });
    });
  }
  OnSaveForms() {
    debugger
    if (this.active == 1) {
      this.discountFormInitialForm.value.isActive = true;
    }
    else {
      this.discountFormInitialForm.value.isActive = false;
    }
    if (this.percentage == 1) {
      this.discountFormInitialForm.value.isPercentage = true;
    }
    else {
      this.discountFormInitialForm.value.isPercentage = false;
    }
    this.discountFormInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    this.discountService.PostDiscount(this.discountFormInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetCountyInitialForm();
          this.data.GetDiscountListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetCountyInitialForm();
          this.data.GetDiscountListFromParent()
        }
      })
  }
}
