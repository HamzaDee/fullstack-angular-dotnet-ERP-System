import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { UserService } from '../../user.service';
@Component({
  selector: 'app-user-messages-detials-form',
  templateUrl: './user-messages-detials-form.component.html',
  styleUrls: ['./user-messages-detials-form.component.scss']
})
export class UserMessagesDetialsFormComponent implements OnInit {

  usersList: any;
  priortitiesList: any;
  selectedUser: any[];
  selectedprioraty: number;
  timeDate:any;
  msg: any;
  userMessageInitialForm: any;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  active: number;
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
      id: [0],
      companyid: [0],
      userFrom: [0,[Validators.required,Validators.min(1)]],
      userTo: [0,[Validators.required,Validators.min(1)]],
      msg: ["",[Validators.required,Validators.min(1)]],
      messagePriority: [0],
    });
  }
  GetUserMessageInitialForm() {
    debugger
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
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedprioraty = result.messagePriority;
        this.selectedUser = result.userTo;
      });
    })
  }
  OnSaveForms() {

  }
}
