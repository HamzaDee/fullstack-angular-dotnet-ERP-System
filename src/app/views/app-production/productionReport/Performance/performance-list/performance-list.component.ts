import { Component, OnInit } from '@angular/core';
import { ProductionReportService } from '../../production-report.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
@Component({
  selector: 'app-performance-list',
  templateUrl: './performance-list.component.html',
  styleUrls: ['./performance-list.component.scss']
})
export class PerformanceListComponent implements OnInit {
  type:number;
  year:number;
  public Data: any;
  requiredTotal:number;
  manufactTotal:number;
  performPer:any;
  dataMonth: any[] = [];
  public TitlePage: string;

  constructor(    private title: Title,
    private productionReportService: ProductionReportService,
    private translateService: TranslateService,
    private alert :sweetalert,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();

    this.type = 2;
    this.year = 2024;
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PerformanceList');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    this.productionReportService.GetPerformance(this.type,this.year).subscribe(result => {
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        return
      } 
      debugger
      this.dataMonth = [];
      this.Data = result     
      if(result != null){
        if(this.type == 1){
          this.dataMonth.push({ name: this.translateService.instant('ActualquantityRequired'), m1: result[0].requiredTotal, m2: result[1].requiredTotal
          , m3: result[2].requiredTotal, m4: result[3].requiredTotal , m5: result[4].requiredTotal
          , m6: result[5].requiredTotal, m7: result[6].requiredTotal , m8: result[7].requiredTotal
          , m9: result[8].requiredTotal, m10: result[9].requiredTotal
          , m11: result[10].requiredTotal, m12: result[11].requiredTotal
           });
          this.dataMonth.push({ name: this.translateService.instant('Actualquantityproduced'), m1: result[0].manufactTotal, m2: result[1].manufactTotal
          , m3: result[2].manufactTotal, m4: result[3].manufactTotal , m5: result[4].manufactTotal
          , m6: result[5].manufactTotal, m7: result[6].manufactTotal , m8: result[7].manufactTotal
          , m9: result[8].manufactTotal, m10: result[9].manufactTotal
          , m11: result[10].manufactTotal, m12: result[11].manufactTotal
           });
           this.dataMonth.push({
            name: this.translateService.instant('PerformanceList'),
            m1: isNaN(result[0].manufactTotal / result[0].requiredTotal) ? '0%' : (result[0].manufactTotal / result[0].requiredTotal * 100).toFixed(3) + '%',
            m2: isNaN(result[1].manufactTotal / result[1].requiredTotal) ? '0%' : (result[1].manufactTotal / result[1].requiredTotal * 100).toFixed(3) + '%',
            m3: isNaN(result[2].manufactTotal / result[2].requiredTotal) ? '0%' : (result[2].manufactTotal / result[2].requiredTotal * 100).toFixed(3) + '%',
            m4: isNaN(result[3].manufactTotal / result[3].requiredTotal) ? '0%' : (result[3].manufactTotal / result[3].requiredTotal * 100).toFixed(3) + '%',
            m5: isNaN(result[4].manufactTotal / result[4].requiredTotal) ? '0%' : (result[4].manufactTotal / result[4].requiredTotal * 100).toFixed(3) + '%',
            m6: isNaN(result[5].manufactTotal / result[5].requiredTotal) ? '0%' : (result[5].manufactTotal / result[5].requiredTotal * 100).toFixed(3) + '%',
            m7: isNaN(result[6].manufactTotal / result[6].requiredTotal) ? '0%' : (result[6].manufactTotal / result[6].requiredTotal * 100).toFixed(3) + '%',
            m8: isNaN(result[7].manufactTotal / result[7].requiredTotal) ? '0%' : (result[7].manufactTotal / result[7].requiredTotal * 100).toFixed(3) + '%',
            m9: isNaN(result[8].manufactTotal / result[8].requiredTotal) ? '0%' : (result[8].manufactTotal / result[8].requiredTotal * 100).toFixed(3) + '%',
            m10: isNaN(result[9].manufactTotal / result[9].requiredTotal) ? '0%' : (result[9].manufactTotal / result[9].requiredTotal * 100).toFixed(3) + '%',
            m11: isNaN(result[10].manufactTotal / result[10].requiredTotal) ? '0%' : (result[10].manufactTotal / result[10].requiredTotal * 100).toFixed(3) + '%',
            m12: isNaN(result[11].manufactTotal / result[11].requiredTotal) ? '0%' : (result[11].manufactTotal / result[11].requiredTotal * 100).toFixed(3) + '%'
          });
        }
        else if(this.type == 2){
          this.requiredTotal = result[0].requiredTotal;
          this.manufactTotal = result[0].manufactTotal;
          this.performPer = ((this.manufactTotal/this.requiredTotal) * 100).toFixed(3) + '%';
        }
      } 
    })
  }

}
