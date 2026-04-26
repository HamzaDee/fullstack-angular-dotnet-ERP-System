import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-user-messages-form',
  templateUrl: './user-messages-form.component.html',
  styleUrls: ['./user-messages-form.component.scss']
})
export class UserMessagesFormComponent implements OnInit {

  usersList: any;
  priortitiesList: any;
  selectedUser: any[];
  selectedprioraty: number;
  msg: any;
  userMessageInitialForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: number;
  hidesave:boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private userService: UserService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,) { }

  ngOnInit(): void {
    this.UserMessageInitialForm();
    this.GetUserMessageInitialForm();
  }
  UserMessageInitialForm() {
    this.userMessageInitialForm = this.formbulider.group({
      id: [0 || this.data.id],
      companyid: [0],
      fromUser: [0],
      userTo: [0,],
      toUserList:[0,[Validators.required,Validators.min(1)]],
      msg: ["",[Validators.required,Validators.min(1)]],
      messagePriority: [0,[Validators.required,Validators.min(1)]],
    });
  }
  GetUserMessageInitialForm() {
    this.userService.UserMessageInitialForm(this.data.id).subscribe(result => {
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.dialogRef.close(false);
          return;
        }
        debugger
      this.usersList = result.usersList;
      this.priortitiesList = result.priortitiesList;
      this.msg = result.msg;
      this.hidesave = this.data.Hidesave;
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedprioraty = result.messagePriority;
        this.selectedUser = result.userTo;
      });
    })
  }
  OnSaveForms() {
    debugger
    this.userMessageInitialForm.value.fromUser = this.jwtAuth.getUserId();
    this.userMessageInitialForm.value.companyid = this.jwtAuth.getCompanyId();
    this.userService.PostUserMessage(this.userMessageInitialForm.value)
      .subscribe(() => {
        if (!this.data.isNew) {
          this.data.isNew = true
          this.data.id = 0
          this.alert.SaveSuccess();
          this.GetUserMessageInitialForm();
          this.data.GetUserMessagesListFromParent()
        }
        else {
          this.alert.SaveSuccess()
          this.GetUserMessageInitialForm();
          this.data.GetUserMessagesListFromParent()
        }
      })
  }
}
