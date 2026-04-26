import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-purchorderstatus-form',
  templateUrl: './purchorderstatus-form.component.html',
  styleUrls: ['./purchorderstatus-form.component.scss']
})
export class PurchorderstatusFormComponent implements OnInit {
  POStatusForm: FormGroup;
  hasPerm: boolean;
  titlePage: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,    
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private http: HttpClient,
    ) { }

  ngOnInit(): void {
    this.POStatusInitialForm();
    this.GetPOStatusInitialForm();
  }

  POStatusInitialForm() {
    this.POStatusForm = this.formbulider.group({
      id: [0],
      descrE: ["",[Validators.required, Validators.min(1)]],
      descrA: ["",[Validators.required, Validators.min(1)]],
    });
  }

  GetPOStatusInitialForm() {
    this.GetPOStatusService(this.data.id).subscribe((result) => { 
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        this.dialogRef.close(false);
        return
      }     
      this.POStatusForm.patchValue(result);
    });
  }

  GetPOStatusService(id) : Observable<any> {
    debugger
    return this.http.get(`${environment.apiURL_Main + '/api/PurOrderStatus/GetPOrderStatus/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId() + '/' + id} `)
      .pipe(
        catchError(this.handleError)
      )
  }

  OnSaveForms() {
    this.SavePOStatusService(this.POStatusForm.value)
      .subscribe((result) => {
        this.data.id = 0;
        this.data.descrA="";
        this.data.descrE="";
        this.POStatusForm.patchValue(this.data);
        if(result.isSuccess === false || result.message === "msNoPermission"){
          this.alert.ShowAlert("msNoPermission","error");
          this.dialogRef.close(false);
          return
        }
        this.alert.SaveSuccess();
        this.data.GetPOStatusListFromParent();
      })
  }

  SavePOStatusService(post) : Observable<any> {
    debugger
    return this.http.post(`${environment.apiURL_Main + '/api/PurOrderStatus/SavePOrderStatus/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, post)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }
}
