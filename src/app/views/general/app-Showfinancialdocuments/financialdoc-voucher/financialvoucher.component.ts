import { Component, Inject,Input,  OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef,MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { FinancialvoucherService } from '../financialvoucher.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service'
import { RoutePartsService } from 'app/shared/services/route-parts.service';

@Component({
  selector: 'app-financialvoucher',
  templateUrl: './financialvoucher.component.html',
  styleUrl: './financialvoucher.component.scss'
})
export class FinancialvoucherComponent implements OnInit  {
  @Input() voucherId: number = 0;  
  @Input() voucherType: string = '';  
  EntryVoucherDetails: FormGroup;
  voucherDetailsList: any[] = []; 
  disableAll:boolean=true;
  decimalPlaces: number;
  sumDebit:number=0;
  sumCredit:number=0;
  sumDebitForamtted:string='0.000'
  sumCreditForamtted:string='0.000'

  constructor(
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService ,
      private serv:FinancialvoucherService,
      private jwtAuth: JwtAuthService,
      private dialog: MatDialog,
      private appCommonserviceService : AppCommonserviceService,
      public routePartsService: RoutePartsService,
    ) { }
    public TitlePage: string;

    ngOnInit(): void {    
      debugger
      console.log('Voucher ID:', this.voucherId);
      console.log('Voucher Type:', this.voucherType);  
      this.voucherDetailsList = [];
      this.calculateSum();
      this.SetTitlePage();
      debugger
      this.getvoucherdata(this.voucherId,this.voucherType);
    }
    SetTitlePage() {
      this.TitlePage = this.translateService.instant('VoucherInfo');
      this.title.setTitle(this.TitlePage);
    }

    formatCurrency(value: number): string {
      return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
    }
  
    calculateSum(){
      debugger
      this.sumDebit=0;
      this.sumCredit=0;
      this.sumDebitForamtted='0.000'
      this.sumCreditForamtted='0.000'
      this.sumDebitForamtted= this.formatCurrency(this.voucherDetailsList.reduce((sum, item) => sum + parseFloat(item.debit), 0));
      this.sumCreditForamtted = this.formatCurrency(this.voucherDetailsList.reduce((sum, item) => sum + parseFloat(item.credit), 0)); 
    }
  
    getvoucherdata(Id:number,voucherType :string)
    {
      debugger
      this.serv.getvoucherdata(Id,voucherType).subscribe(result => {
        debugger
        this.voucherDetailsList = result;
        this.decimalPlaces = result[0].costingDecimalPlaces;
        setTimeout(() => {
          this.calculateSum();        
        });  
      })
    }
}
