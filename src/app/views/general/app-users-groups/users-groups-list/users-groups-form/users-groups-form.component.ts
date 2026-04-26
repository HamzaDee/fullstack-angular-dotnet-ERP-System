import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { UsersGroupsService } from '../../users-groups.service';
@Component({
  selector: 'app-users-groups-form',
  templateUrl: './users-groups-form.component.html',
  styleUrls: ['./users-groups-form.component.scss']
})
export class UsersGroupsFormComponent implements OnInit {
  usersGroupsForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  active: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private usersGroupsService: UsersGroupsService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
  ) { }

  ngOnInit(): void {
    this.InitialUsersGroupsForm();
    this.GetUesrGroupInitialForm();
  }
  InitialUsersGroupsForm() {
    this.usersGroupsForm = this.formbulider.group({
      id: [0, [Validators.required]],
      CompanyId: [0, [Validators.required]],
      descrE: ["", [Validators.required]],
      descrA: ["", [Validators.required]],
      note: [""],
      status:[0]
    });
  }
  GetUesrGroupInitialForm() {
    debugger
    this.usersGroupsService.GetUesrGroupInitialForm(this.data.id).subscribe(result => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.dialogRef.close(false);
          return;
        }
      this.usersGroupsForm.patchValue(result);
    });
  }
  OnSaveForms() {
    debugger
    this.usersGroupsForm.value.CompanyId = this.jwtAuth.getCompanyId();
    if(this.usersGroupsForm.value.status == true){
      this.usersGroupsForm.value.status = 1;
    }
    if(this.usersGroupsForm.value.status == false){
      this.usersGroupsForm.value.status = 0;
    }
    this.usersGroupsService.PostUesrGroup(this.usersGroupsForm.value)
      .subscribe((result) => {
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetUesrGroupInitialForm();
          this.data.GetAllUesrGroupsList()
        }
        else {
          this.alert.SaveSuccess()
          this.GetUesrGroupInitialForm();
          this.data.GetAllUesrGroupsList()
        }
      })
  }
}
