import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { UserService } from '../user.service';
@Component({
  selector: 'app-change-user-password-form',
  templateUrl: './change-user-password-form.component.html',
  styleUrls: ['./change-user-password-form.component.scss']
})
export class ChangeUserPasswordFormComponent implements OnInit {
  formControleGroup: FormGroup;
  newPassword: string;
  confirmPassword: string;
  hasPerm: boolean;
  titlePage: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private alert: sweetalert,
    private userService: UserService,
    private jwtAuth: JwtAuthService,) { }

  ngOnInit(): void {
    this.InitialFormControle();
  }
  InitialFormControle() {
    this.formControleGroup = this.formbulider.group({
      uesrId: [0],
      currentPassword: ["",[Validators.required]],
      newPassword: ["",[Validators.required]],
      confirmPassword: ["",[Validators.required]]
    });
  }
  OnSaveForms() {
    debugger
    if(this.formControleGroup.value.newPassword != this.formControleGroup.value.confirmPassword){
      this.alert.ShowAlert("PasswordMismatch",'error');
      return;
    }
    this.formControleGroup.value.uesrId = this.jwtAuth.getUserId();
    if ((this.formControleGroup.value.newPassword != null || undefined)) {
      this.userService.Changepassord(this.formControleGroup.value)
        .subscribe(response => {
          if (response)
            this.alert.SaveSuccess();
          else {
            this.alert.ShowAlert("WrongCurrentPassword",'error');
          }
        })
    } err => {
      this.alert.SaveFaildFieldRequired()
    }
  }

  isEmpty(input) {
    return input === '' || input === null;
  }
}
