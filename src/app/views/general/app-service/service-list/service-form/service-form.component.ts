import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ServiceService } from '../../service.service'
import { Router } from '@angular/router';
@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  serviceFormInitialForm: FormGroup;
  accountsList: any;
  taxesList: any;

  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private serviceService: ServiceService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.ServiceInitialForm();
    this.GetServiceInitialForm();
  }
  ServiceInitialForm() {
    this.serviceFormInitialForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      serviceNameA: [0,[Validators.required,Validators.min(1)]],
      serviceNameE: [0,[Validators.required,Validators.min(1)]],
      accountId: [0],
      price: [0],
      note: [0],
      taxId: [0],
    });
  }
  GetServiceInitialForm() {
    debugger
    this.serviceService.GetServiceInitailForm(this.data.id).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['Service/ServicesList']);
          this.dialogRef.close(false);
          return;
        }

      this.accountsList = result.accountsList
      this.taxesList = result.taxesList
      this.serviceFormInitialForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if(result.accountId == null)
          {
            result.accountId= 0;
          }
        if(result.taxId == null)
          {
            result.taxId= 0;
          }
      });
    });
  }
  OnSaveForms() {
    debugger
    this.serviceFormInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    this.serviceService.PostService(this.serviceFormInitialForm.value)
      .subscribe(() => {
        debugger
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetServiceInitialForm();
          this.data.GetServiceListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetServiceInitialForm();
          this.data.GetServiceListFromParent()
        }
      })
  }
}
