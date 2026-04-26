import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { SalesordersService } from '../salesorders.service';

@Component({
  selector: 'app-salesorder-sheet',
  templateUrl: './salesorder-sheet.component.html',
  styleUrls: ['./salesorder-sheet.component.scss']
})
export class SalesorderSheetComponent implements OnInit {
  data: any;
  dateNow: Date;
  Product: any;
  total: any;
  SumQty: number = 0;
  SumAllQty: number = 0;
  SumFree: number = 0;
  SumAllFree: number = 0;
  SumBonus: number = 0;
  SumAllBonus: number = 0;
  SumOtherQty: number = 0;
  SumAllOtherQty: number = 0;
  SumAllTotal: number = 0;
  allTotal: number = 0;

  constructor(private route: ActivatedRoute,
    private alert: sweetalert,
    private salesordersService: SalesordersService,) { }

  async ngOnInit() {
    debugger
    this.dateNow = new Date();
    let orderId = this.route.snapshot.params.id;
    await (await this.salesordersService.PrintSalesOrder(orderId)).toPromise().then((results) => {
      debugger
      this.data = results;
      this.Product = results.salesOrderDTList;


      for (let i = 0; i < results.salesOrderDTList.length; i++) {
        results.salesOrderDTList[i].total = results.salesOrderDTList[i].oq2 + (results.salesOrderDTList[i].freeQty ?? 0) + (results.salesOrderDTList[i].bonusQty ?? 0) + (results.salesOrderDTList[i].otherQty ?? 0);
        this.SumQty += results.salesOrderDTList[i].oq2;
        this.SumFree += results.salesOrderDTList[i].freeQty;
        this.SumBonus += results.salesOrderDTList[i].bonusQty;
        this.SumOtherQty += results.salesOrderDTList[i].otherQty;
        this.allTotal += results.salesOrderDTList[i].total;
      }


      this.SumAllQty = this.SumAllQty + this.SumQty;
      this.SumAllFree = this.SumAllFree + this.SumFree;
      this.SumAllBonus = this.SumAllBonus + this.SumBonus;
      this.SumAllOtherQty = this.SumAllOtherQty + this.SumOtherQty;
      this.SumAllTotal = this.SumAllTotal + this.allTotal;

      setTimeout(function () {
        window.focus();
        window.print();
      }, 100);

    });
  }


/*   async Print(id) {
    debugger
    await window.open("/SalesOrderList/SalesorderSheet/" + id, "PrintWindow",
      "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
  } */


      Print(id) {
         window.open(`/SalesOrderList/SalesorderSheet/${id}`, '_blank');
      }
}
