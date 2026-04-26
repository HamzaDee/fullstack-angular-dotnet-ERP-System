import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AreaService } from '../../area.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-area-form',
  templateUrl: './area-form.component.html',
  styleUrls: ['./area-form.component.scss']
})
export class AreaFormComponent implements OnInit {
  areaFormInitialForm: FormGroup;
  selectedCountry: any;
  selectedCity; any;
  citiesList: any;
  countriesList: any;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private areaService: AreaService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.AreaInitialForm();
    this.GetAreaInitailForm();
  }
  AreaInitialForm() {
    this.areaFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      parentTableNo: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      selectedCountry: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]],
      descrE: ["", [Validators.required]],
      descrA: ["", [Validators.required]],
      note: [""],
    });
  }
  GetAreaInitailForm() {
    debugger
    this.areaService.GetAreaInitailForm(this.data.id).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Area/AreaList']);
          this.dialogRef.close(false);
          return;
        }
      this.areaFormInitialForm.patchValue(result);

      this.countriesList = result.countriesList
      this.citiesList = result.citiesList;
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.selectedCountry = result.selectedCountry;
        this.selectedCity = result.parentTableNo;
      });
    });
  }
  OnSaveForms() {
    this.areaFormInitialForm.value.companyId = this.jwtAuth.getCompanyId();
    this.areaService.PostArea(this.areaFormInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetAreaInitailForm();
          this.data.GetAreaListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetAreaInitailForm();
          this.data.GetAreaListFromParent()
        }
      })
  }
  GetCitiesDropDownByCountryId(id) {
    this.areaService.GetCitiesDropDownByCountryId(id).subscribe(result => {
      this.citiesList = result
    })
  }
}
