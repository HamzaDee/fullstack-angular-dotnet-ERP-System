import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MainSystemDefinitionsService } from '../../main-system-definitions.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-main-system-definitions-form',
  templateUrl: './main-system-definitions-form.component.html',
  styleUrls: ['./main-system-definitions-form.component.scss']
})
export class MainSystemDefinitionsFormComponent implements OnInit {
  mainTableList: any;
  selectedMainTable: number;
  MainSystemDefinitionsForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: number = 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private mainSystemDefinitionsService: MainSystemDefinitionsService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public router: Router,) { }

  ngOnInit(): void {
    this.InitialMainSystemDefinitionsForm();
    this.GetInitialMainSystemDefinitionsForm();
  }
  InitialMainSystemDefinitionsForm() {
    this.MainSystemDefinitionsForm = this.formbulider.group({
      id: [0],
      tableNo: [0],
      descrE: ["",[Validators.required, Validators.min(1)]],
      descrA: ["",[Validators.required, Validators.min(1)]],
      note: [""],
      status: [0],
      companyid: [0],
    });
  }
  GetInitialMainSystemDefinitionsForm() {
    debugger
    this.mainSystemDefinitionsService.InitailMainSystemsDefinition(this.data.id, this.data.tableNo).subscribe((result) => {
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['MainSystemDefinitions/MainSystemDefinitionsList']);
          this.dialogRef.close(false);
          return;
        }
      this.mainTableList = result.mainTableList;
      this.active = result.status;
      this.MainSystemDefinitionsForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedMainTable = result.tableNo;
      });
    });
  }
  OnSaveForms() {
    debugger
    this.MainSystemDefinitionsForm.value.status = this.active;
    this.MainSystemDefinitionsForm.value.companyid = this.jwtAuth.getCompanyId();
    this.mainSystemDefinitionsService.PostMainSystemDefinition(this.MainSystemDefinitionsForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetInitialMainSystemDefinitionsForm();
          this.data.GetAllMainSystemsDefinitionList()
        }
        else {
          this.data.id = 0;
          this.alert.SaveSuccess()
          this.GetInitialMainSystemDefinitionsForm();
          this.data.GetAllMainSystemsDefinitionList()
        }
      })
  }
}
