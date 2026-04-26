import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { EmployeesService } from '../../employees.service';
import { Router } from '@angular/router';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employees-form.component.html',
  styleUrls: ['./employees-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeFormInitialForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: number;
  isRepresentative: number;
  GovernorateList: any;
  AreaList: any;
  filteredArea: Array<any> = [];
  employeesList:any;
  loading:boolean;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private employeeService: EmployeesService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.CountyInitialForm();
    this.GetCountyInitialForm();
  }

  CountyInitialForm() {
    this.employeeFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      nameA: [0, [Validators.required, Validators.min(1)]],
      nameE: [0, [Validators.required, Validators.min(1)]],
      email: ['', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
      tel1: [0],
      tel2: [0],
      isActive: [0],
      isRepresentative: [false],
      monthlyTarget: [0],
      cityIds: [''],
      areaIds: [''],
      managerId:[0],
    });
  }
  GetCountyInitialForm() {
    this.employeeService.GetEmployeeInitailForm(this.data.id).subscribe((result) => {
      debugger
      if (!result.isSuccess  && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Employees/EmployeeList']);
        this.dialogRef.close(false);
        return;
      }

      this.GovernorateList = result.governorateList;
      this.AreaList = result.areaList;
      this.employeesList = result.employeesList;
      this.employeeFormInitialForm.patchValue(result);
      if (result.isActive) {
        this.active = 1;
      }
      else {
        this.active = 0;
      }


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        if (this.data.id > 0) {

          const cityIds = result.cityIds ? result.cityIds.split(',').map(Number) : [];
          const areaIds = result.areaIds ? result.areaIds.split(',').map(Number) : [];
          this.employeeFormInitialForm.get('cityIds')?.setValue(cityIds);
          this.FilterCITY(cityIds);
          this.employeeFormInitialForm.get('areaIds')?.setValue(areaIds);
        }
        else {
          this.employeeFormInitialForm.get('cityIds')?.setValue([]);
          this.employeeFormInitialForm.get('areaIds')?.setValue([]);
          this.employeeFormInitialForm.get('managerId')?.setValue(0);
        }
      });
    });
  }

  validatePhoneNumber(phone: string): boolean {
    const pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return pattern.test(phone);
  }

FilterCITY(cities: number[]) {

  if (!Array.isArray(cities) || cities.length === 0) {
    this.filteredArea = [];
    this.employeeFormInitialForm.get('areaIds')?.setValue([]);
    return;
  }

  this.filteredArea = this.AreaList.filter(area =>
    cities.includes(+area.data1)
  );

  const selectedAreas =
    this.employeeFormInitialForm.get('areaIds')?.value;

  if (!Array.isArray(selectedAreas)) {
    this.employeeFormInitialForm.get('areaIds')?.setValue([]);
    return;
  }

  const validAreas = selectedAreas.filter(areaId =>
    this.filteredArea.some(a => a.id === areaId)
  );

  this.employeeFormInitialForm.get('areaIds')?.setValue(validAreas);
}

  OnSaveForms() {
    debugger
    const tel1 = this.employeeFormInitialForm.value.tel1 || '';
    const tel2 = this.employeeFormInitialForm.value.tel2 || '';

    if (tel1 !== '' && !this.validatePhoneNumber(tel1)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    if (tel2 !== '' && !this.validatePhoneNumber(tel2)) {
      this.alert.ShowAlert("msgDontEnterLatters", 'error');
      return;
    }

    this.employeeFormInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    if (this.active == 1) {
      this.employeeFormInitialForm.value.isActive = true;
    }
    else {
      this.employeeFormInitialForm.value.isActive = false;
    }
    this.employeeService.PostEmployee(this.employeeFormInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetCountyInitialForm();
          this.data.GetEmployeeListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetCountyInitialForm();
          this.data.GetEmployeeListFromParent()
        }
      })
  }


  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.employeesList) {
      this.employeesList = [];
    }

    // Make sure the array is large enough
    while (this.employeesList.length < last) {
      this.employeesList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.employeesList[i] = this.employeesList[i];
    }

    this.loading = false;
  }
}
