import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { SalesRequestService } from '../sales-request.service';
import { sweetalert } from 'sweetalert';

@Component({
  selector: 'app-saless-requst-sheet',
  templateUrl: './saless-requst-sheet.component.html',
  styleUrls: ['./saless-requst-sheet.component.scss']
})
export class SalessRequstSheetComponent implements OnInit {
  data: any;
  dateNow: Date;
  SalesRequestDTList: any;
  sumTotal: any;
  sumTax: any;
  sumAllTotal: any;
  sumDiscount: any;

  constructor(private route: ActivatedRoute,
    private SalesRequestSrvice: SalesRequestService,
    private alert: sweetalert,) { }

    async ngOnInit() {
      debugger
      $(".mat-checkbox-input").removeClass("cdk-visually-hidden");
      this.dateNow = new Date();
      let id = this.route.snapshot.params.id;
       await (await this.SalesRequestSrvice.printSalesRequest(id)).toPromise().then((results) => {
        debugger
        if(results.isSuccess == false && results.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            return;
          }
        this.data = results;
        this.SalesRequestDTList = results.salesRequestDTList;

        let calculatedTax = 0;
        let allTot = 0 ;
        this.sumTotal = 0;
        this.sumTax = 0;
        this.sumAllTotal = 0;
        this.sumDiscount =0;
    
        for (let i = 0; i < this.SalesRequestDTList.length; i++) {
          const qty = this.SalesRequestDTList[i].qty;
          var  price = parseFloat(this.SalesRequestDTList[i].price);
          var total = qty * price;
    
          this.SalesRequestDTList[i].price = price;
          this.SalesRequestDTList[i].total = total;
    
          this.SalesRequestDTList[i].discount = parseFloat(this.SalesRequestDTList[i].discount);
          this.SalesRequestDTList[i].discount = this.SalesRequestDTList[i].discount;
    
         calculatedTax = ( this.SalesRequestDTList[i].total *  this.SalesRequestDTList[i].taxPerc) / 100;
         allTot =  this.SalesRequestDTList[i].total + calculatedTax;
         this.SalesRequestDTList[i].taxAmount = calculatedTax;
         this.SalesRequestDTList[i].AllTotal = allTot; 

    
         this.sumDiscount = this.sumDiscount +  this.SalesRequestDTList[i].discount;
         this.sumTotal = this.sumTotal +  this.SalesRequestDTList[i].total;
         this.sumTax = this.sumTax + this.SalesRequestDTList[i].taxAmount ;;
         this.sumAllTotal = this.sumAllTotal + allTot;
        }

        setTimeout(function () {
          window.focus();
          window.print();
          window.close();
        }, 100);
      }); 
    }
  
    async Print(id) {
      debugger
      await window.open("/SalesRequest/SalessRequstSheet/" + id, "PrintWindow",
        "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
    }

    formatCurrency(value: number, decimalPlaces : number): string {
      if(value == null)
         value = 0;
      return this.SalesRequestSrvice.formatCurrency(value, decimalPlaces);
    }
}
