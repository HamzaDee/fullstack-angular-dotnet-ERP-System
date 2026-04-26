import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesTypesService } from '../expenses-types.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ExpensesTypesModel } from '../ExpensesTypesModel';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-expenses-types-form',
  templateUrl: './expenses-types-form.component.html',
  styleUrls: ['./expenses-types-form.component.scss']
})
export class ExpensesTypesFormComponent implements OnInit {
  public showLoader: boolean;
  public loading: boolean;
  public ExpensesTypesForm: FormGroup;
  public Data: ExpensesTypesModel = new ExpensesTypesModel();
  public AccountsList: any;
  public selectedDebitAccount: number = 0;
  public selectedCreditAccount: number = 0;
  active: number;

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<any>,
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private expensesTypesService: ExpensesTypesService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private formbulider: FormBuilder) { }


  ngOnInit(): void {
    this.ExpensesTypesForm = this.formbulider.group({
      id             : [0],
      companyId      : [0],
      expensesNameA  : ["", [Validators.required]],
      expensesNameE  : ["",[Validators.required]],
      debitAccountId : [0],
      creditAccountId: [0],
      isActive       : [false],
      note           :  [""],
    });

    this.GetExpensesTypesInitialForm();
  }

  GetExpensesTypesInitialForm() {
    debugger
    this.expensesTypesService.getExpensesTypesForm(this.data.id).subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          this.router.navigate(['ExpensesTypes/ExpensesTypesList']);
          this.dialogRef.close(false);
          return;
        }

      this.AccountsList = result.accountsList;

      if (result.isActive) {
        this.active = 1;
      }
      else {
        this.active = 0;
      }

      this.Data = result;
      this.ExpensesTypesForm.patchValue(result);
     
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if(result.debitAccountId == null)
          {
            result.debitAccountId = 0;
          }
        if(result.creditAccountId == null)
          {
            result.creditAccountId = 0;
          }
        this.selectedDebitAccount = result.debitAccountId;
        this.selectedCreditAccount = result.creditAccountId;
      });
    });
  }

  OnSaveForms(){
    debugger
    if (this.active == 1) {
      this.ExpensesTypesForm.value.isActive = true;
    }
    else {
      this.ExpensesTypesForm.value.isActive = false;
    }

    this.expensesTypesService.postExpensesType(this.ExpensesTypesForm.value).subscribe(() => {
      debugger
      if (!this.data.isNew) {
        this.data.isNew = true
        this.data.id = 0
        this.alert.SaveSuccess();
        this.GetExpensesTypesInitialForm();
        this.data.GetExpensesTypesList()
      }
      else {
        this.alert.SaveSuccess()
        this.GetExpensesTypesInitialForm();
        this.data.GetExpensesTypesList()
      }
    })
  }
}
