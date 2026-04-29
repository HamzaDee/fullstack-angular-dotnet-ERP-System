import { Component, Inject, OnInit } from '@angular/core';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';



@Component({
  selector: 'app-printcheqsform',
  templateUrl: './printcheqsform.component.html',
  styleUrl: './printcheqsform.component.scss'
})
export class PrintcheqsformComponent implements OnInit {
  public TitlePage: string = ''; 
  chequesList: any[] = [];
  loading: boolean = false;
  voucherId: number = 0;
  Lang:string = this.jwtAuth.getLang();
  constructor
    (
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<any>,
      public routePartsService: RoutePartsService,
      public router: Router,
      private readonly title: Title,
      private readonly translateService: TranslateService,
      private readonly serv: AppEntryvouchersService,
      private readonly jwtAuth: JwtAuthService,
    ) { }


  ngOnInit(): void {
    debugger
      this.voucherId = this.data.voucherId;
      this.getChequesList(this.voucherId);
      this.SetTitlePage();
    }
  
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('PrintCheqsForm');
      this.title.setTitle(this.TitlePage);
    }

  

  getChequesList(voucherId: number): void {
    debugger
    if(voucherId > 0)
      {
        this.serv.GetPrintingCheques(voucherId).subscribe(res => {
          debugger
          this.chequesList = res;
        }, err => {
          console.log(err);
        });
      }
  }

    printCheqe(Id: number, Balance: number): void {
      debugger;

      // Ensure 3 decimal places (important for money)
      const formatted = Balance.toFixed(3); // "156.221"

      // Split before and after decimal
      const [wholePart, decimalPart] = formatted.split('.');

      const newBalance = Number(wholePart); // 156
      const Fils = Number(decimalPart);     // 221

      const reportUrl = `RptPrintCheque?Id=${Id}&Balance=${newBalance}&Fils=${Fils}`;

      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } })
      );

      window.open(url, '_blank');
    }

  onCancel(): void {
    this.dialogRef.close();      
  }  
}
