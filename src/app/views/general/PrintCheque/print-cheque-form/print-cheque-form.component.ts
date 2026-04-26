import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of, delay } from 'rxjs';
import { sweetalert } from 'sweetalert';
import { PrintChequeService } from '../print-cheque.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-print-cheque-form',
  templateUrl: './print-cheque-form.component.html',
  styleUrl: './print-cheque-form.component.scss'
})
export class PrintChequeFormComponent {
  PrintChequeForm: FormGroup;
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  Lang: string;
  drawerList: any;
  isNewDrawer = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formbulider: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private printChequeService: PrintChequeService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.PrintChequeForm = this.formbulider.group({
      id: [0],
      companyid: [0],
      chequeNo: ["", [Validators.required]],
      cheqDate: [new Date(), Validators.required],
      drawerName: ["", [Validators.required]],
      amount: [0, [Validators.required, Validators.min(1)]],
      cheqStamp: [""],
      amtFils: [""],
      reason: [""],
    });
    this.GetPrintChequeForm();
  }

  GetPrintChequeForm() {
    this.printChequeService.GetPrintChequeForm(this.data.id).subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.router.navigate(['Country/CountriesList']);
        this.dialogRef.close(false);
        return;
      }
      debugger
      result.cheqDate = formatDate(result.cheqDate, "yyyy-MM-dd", "en-US");
      this.drawerList=result.drawerList;
      this.PrintChequeForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        if(this.data.id <= 0)
        {
          this.PrintChequeForm.get("drawerName").setValue(0);
        }
      });
    });
  }

  toggleNewDrawer() {
    // this.isNewDrawer = !this.isNewDrawer;

    if (this.isNewDrawer) {
      // Clear previous value from dropdown
      this.PrintChequeForm.get('drawerName')?.setValue('');
    }
  }

  OnSaveForms() {
    this.PrintChequeForm.value.companyid = this.jwtAuth.getCompanyId();
    this.printChequeService.PostPrintCheque(this.PrintChequeForm.value).subscribe((result) => {
      debugger
      const id = Number(result.message); 
      this.PrintChequeForm.value.id = id;
      this.PrintPrintCheque(id,this.PrintChequeForm.value.amount,this.PrintChequeForm.value.amtFils);


      if (!this.data.isNew) {
        this.data.isNew = true
        this.data.id = 0
        this.alert.SaveSuccess();
        this.GetPrintChequeForm();
        this.data.GetPrintChequeListFromParent()
      }
      else {
        this.alert.SaveSuccess();
       // this.PrintPrintCheque(id,this.PrintChequeForm.value.amount);
        this.GetPrintChequeForm();
        this.data.GetPrintChequeListFromParent()
      }
    });
  }

  PrintPrintCheque(Id,Balance,Fils) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptPrintChequeAR?Id=${Id}&Balance=${Balance}&Fils=${Fils}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptPrintChequeEN?Id=${Id}&Balance=${Balance}&Fils=${Fils}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
