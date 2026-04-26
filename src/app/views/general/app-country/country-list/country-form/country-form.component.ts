import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { CountryService } from '../../country.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-country-form',
  templateUrl: './country-form.component.html',
  styleUrls: ['./country-form.component.scss']
})
export class CountryFormComponent implements OnInit {
  countryFormInitialForm: FormGroup;
  selectedCountry: any;
  countriesList: any;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private countryService: CountryService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router,) { }

  ngOnInit(): void {
    this.CountyInitialForm();
    this.GetCountyInitialForm();
  }
  CountyInitialForm() {
    this.countryFormInitialForm = this.formbulider.group({
      id: [0],
      companyid: [0],
      parentTableNo: [0],
      descrE: ["",[Validators.required, Validators.min(1)]],
      descrA: ["",[Validators.required, Validators.min(1)]],
      note: [""],
    });
  }
  GetCountyInitialForm() {
    this.countryService.GetCountryInitailForm(this.data.id).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Country/CountriesList']);
          this.dialogRef.close(false);
          return;
        }

      this.countriesList = result.countriesListك
      this.countryFormInitialForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedCountry = result.parentTableNo;
      });
    });
  }
  OnSaveForms() {
    this.countryFormInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    this.countryService.PostCountry(this.countryFormInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetCountyInitialForm();
          this.data.GetCountyListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetCountyInitialForm();
          this.data.GetCountyListFromParent()
        }
      })
  }
}
