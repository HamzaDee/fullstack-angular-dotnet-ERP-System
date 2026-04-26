import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsssestSalesInvoiceService } from '../asssest-sales-invoice.service';
import { sweetalert } from 'sweetalert';

@Component({
  providers: [DatePipe],
  selector: 'app-asset-sales-invoice-sheet',
  templateUrl: './asset-sales-invoice-sheet.component.html',
  styleUrls: ['./asset-sales-invoice-sheet.component.scss']
})
export class AssetSalesInvoiceSheetComponent implements OnInit {
  data: any;
  dateNow: Date;
  assetId: any;
  costCenterId: any;
  qty: any;
  price: any;
  total: any;
  taxId: any;
  taxPerc: any;
  taxAmount: any;
  AllTotal: any;
  Sum: any;
  taxAmounts: any;
  sumTax:any;
  sumAllTotal: any;
  sumTotal:any;

  constructor(private route: ActivatedRoute,
    private alert: sweetalert,
    private AsssestSalesInvoiceService: AsssestSalesInvoiceService) { }

   async ngOnInit() {
    debugger
    $(".mat-checkbox-input").removeClass("cdk-visually-hidden");
    this.dateNow = new Date();
    let id = this.route.snapshot.params.id;
    await (await this.AsssestSalesInvoiceService.printAssetSalesInvoice(id)).toPromise().then((results) => {
      debugger
      if(results.isSuccess == false && results.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }  
      this.data = results;
      this.assetId = results.faTransDTModelList;


      this.sumTotal = 0;
      this.sumTax = 0;
      this.sumAllTotal = 0;
      
      for (let i = 0; i < results.faTransDTModelList.length; i++) {

       // this.total = results.faTransDTModelList[i].total + results.faTransDTModelList[i].total;
        const perTax = results.faTransDTModelList[i].taxPerc; // نسبه الضريبه
        const taxAm = (results.faTransDTModelList[i].total * perTax) / 100; // مبلغ الضريبه


        let allTot = taxAm + results.faTransDTModelList[i].total;// الاجمالي

        if (results.priceWithTax) {
          const calculatedTax = results.faTransDTModelList[i].total - (results.faTransDTModelList[i].total / (1 + perTax / 100));
          results.faTransDTModelList[i].taxAmount = parseFloat(calculatedTax.toFixed(3));
          allTot = results.faTransDTModelList[i].total;
        } else {
          const calculatedTax = (results.faTransDTModelList[i].total * perTax) / 100;// مبلغ الضريبه
          results.faTransDTModelList[i].taxAmount = parseFloat(calculatedTax.toFixed(3));// مبلغ الضريبه
          results.faTransDTModelList[i].AllTotal = results.faTransDTModelList[i].total + results.faTransDTModelList[i].taxAmount;// الاجمالي
        }


        if (results.priceWithTax) {
          results.faTransDTModelList[i].AllTotal = results.faTransDTModelList[i].total;
        }


        this.sumTotal =  this.sumTotal + results.faTransDTModelList[i].total;// المجموع التحتاني
        this.sumTax = this.sumTax + taxAm;// مجموع مبلغ الضريبه  
        this.sumAllTotal = this.sumAllTotal + allTot;// مجموع الاجمالي 
      }

      setTimeout(function () {
        window.focus();
        window.print();
      }, 100);
    });

  }
/* 
  function Print(id) {
    debugger
    await window.open("/AssetSalesInvoice/AssetSalesInvoiceSheet/" + id, "PrintWindow",
      "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  } */

      async Print(id) {
        const printWindow = window.open(`/AssetSalesInvoice/AssetSalesInvoiceSheet/${id}`, "PrintWindow",
          "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
      
        // Check if the window was successfully opened
        if (printWindow) {
          // Wait for the content to be loaded in the new window
          printWindow.onload = () => {
            printWindow.focus(); // Focus on the new window
            printWindow.print(); // Trigger the print dialog
          };
        } else {
          console.error("Failed to open the print window.");
        }
      }

}
