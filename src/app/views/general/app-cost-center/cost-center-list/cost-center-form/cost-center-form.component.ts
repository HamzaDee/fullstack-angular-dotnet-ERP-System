import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { CostCenterService } from '../../cost-center.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-cost-center-form',
  templateUrl: './cost-center-form.component.html',
  styleUrls: ['./cost-center-form.component.scss']
})
export class AppCostCenterFormComponent implements OnInit {
  mainTableList: any;
  selectedMainTable: number;
  costCenterForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private costCenterService: CostCenterService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    debugger
    this.CostCenterInitailForm();
    this.GetCostCenterInitailForm();
  }
  CostCenterInitailForm() {
    this.costCenterForm = this.formbulider.group({
      id: [0],
      parentTableNo: [0],
      descrE: ["",[Validators.required,Validators.min(1)]],
      descrA: ["",[Validators.required,Validators.min(1)]],
      note: [""],
      status: [0],
      companyId: [0],
      itemNo: [0,[Validators.required,Validators.min(1)]],
    });
  }
  GetCostCenterInitailForm() {
    debugger
    this.costCenterService.GetCostCenterInitailForm(this.data.id).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['CostCenter/CostCenterTree']);
          this.dialogRef.close(false);
          return;
        }
        debugger
      this.mainTableList = result.mainTableList;
      this.active = result.status;
      this.costCenterForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if(result.parentTableNo == null)
          {
            result.parentTableNo = 0;
          }
        this.selectedMainTable = result.parentTableNo;
      });
    });
  }
  OnSaveForms() {
    this.costCenterForm.value.status = this.active;
    this.costCenterForm.value.companyId = this.jwtAuth.getCompanyId();
    this.costCenterService.PostCostCenter(this.costCenterForm.value)
      .subscribe(() => {
        debugger
        if (!this.data.isNew) {
          this.data.isNew = true;
          this.data.id = 0;
          this.alert.SaveSuccess();
          this.GetCostCenterInitailForm();
          this.data.CostCenterListFromParent();
          this.costCenterForm.get('itemNo')?.setValue(0);

        }
        else {
          this.alert.SaveSuccess()
          this.GetCostCenterInitailForm();
          this.data.CostCenterListFromParent();
            this.costCenterForm.get('itemNo')?.setValue(0);
        }
      })
  }


  CheckIfChooseSameAccNo(event: any) {
  const value = event.target.value;
  this.costCenterService.CheckIfChooseSameAccNo(value).subscribe(res => {
    if (res === false) {
      this.alert.ShowAlert("CantSameItemNo", 'error');
      this.costCenterForm.get('itemNo')?.setValue(0);
      return;
    }
  });
}
}
