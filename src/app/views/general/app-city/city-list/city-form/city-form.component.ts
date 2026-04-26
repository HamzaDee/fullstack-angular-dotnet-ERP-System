import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { CityService } from '../../city.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-city-form',
  templateUrl: './city-form.component.html',
  styleUrls: ['./city-form.component.scss']
})
export class CityFormComponent implements OnInit {
  CityFormInitialForm: FormGroup;
  selectedCountry:any;
  countriesList:any;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private cityService: CityService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.CityInitialForm();
    this.GetCityInitialForm();
  }
  CityInitialForm() {
    this.CityFormInitialForm = this.formbulider.group({
      id: [0],
      companyid: [0],
      parentTableNo: [0,[Validators.required]],
      descrE: ["",[Validators.required, Validators.min(1)]],
      descrA: ["",[Validators.required, Validators.min(1)]],
      note: [""],
    });
  }
  GetCityInitialForm() {
    this.cityService.GetCityInitailForm(this.data.id).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['City/CityList']);
          this.dialogRef.close(false);
          return;
        }

      this.countriesList=result.countriesList;
      this.CityFormInitialForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedCountry=result.parentTableNo;
      });
    });
  }
  OnSaveForms() {
    this.CityFormInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    this.cityService.PostCity(this.CityFormInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetCityInitialForm();
          this.data.GetCityListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetCityInitialForm();
          this.data.GetCityListFromParent()
        }
      })
  }
}
