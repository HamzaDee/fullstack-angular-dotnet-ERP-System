import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { sweetalert } from 'sweetalert';
import { ForecastingService } from '../forecasting.service';

@Component({
  selector: 'app-forecasting-sheet',
  templateUrl: './forecasting-sheet.component.html',
  styleUrls: ['./forecasting-sheet.component.scss']
})
export class ForecastingSheetComponent implements OnInit {
  data: any;
  dateNow: Date;
  Product: any;
  total: number = 0;
  isHidden:boolean;
  constructor(private route: ActivatedRoute,
    private alert: sweetalert,
    private forecastingService: ForecastingService) { }


    async ngOnInit() {
      debugger
      this.dateNow = new Date();
      let id = this.route.snapshot.params.id;
       await (await this.forecastingService.PrintForcasting(id)).toPromise().then((results) => {
        debugger
        this.data = results;
        this.Product = results.forecastingDTList;
        this.isHidden = false;

       
       this.calculateTotals(results.forecastingDTList);

/*   
        setTimeout(function () {
          window.focus();
          window.print();
        }, 100); */
  
      }); 
    }

     calculateTotals(forecastingDTList) {
      debugger
      forecastingDTList.forEach(row => {
        debugger
        let sum = 0;
        for (let i = 1; i <= 12; i++) {
          const qty = parseFloat(row['qty' + i]) || 0;
          const free = parseFloat(row['free' + i]) || 0;
          const bonus = parseFloat(row['bonus' + i]) || 0;
    
          row['total' + i] = qty + free + bonus;
          sum += row['total' + i];
        }
        row.total = sum.toFixed(3); 
      });
    }


    callprint1(){
      this.isHidden = true;
      window.focus();
      window.print();
    }

    callprint() {
      this.isHidden = true;
      const printContent = document.getElementById('print-section');
      const originalContent = document.body.innerHTML;
  
      if (printContent) {
          document.body.innerHTML = printContent.innerHTML;
          window.print();
          document.body.innerHTML = originalContent; // Restore the original content
          window.location.reload(); // Optional: Refresh to re-bind events
      }
  }

  Print(id) {
   window.open(`/Forecasting/ForecastingSheet/${id}`);
  }
}
