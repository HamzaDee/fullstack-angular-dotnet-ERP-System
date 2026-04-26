import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Chart } from 'chart.js';
import autoTable from 'jspdf-autotable';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../../production-report.service';

@Component({
  selector: 'app-annual-products-status-list',
  templateUrl: './annual-products-status-list.component.html',
  styleUrls: ['./annual-products-status-list.component.scss']
})
export class AnnualProductsStatusListComponent implements OnInit {
  public Data: any;
  screenId:number = 189;
  exportData: any[];
  custom:boolean;
  ProductionReportForm: FormGroup;
  public myChart: Chart;
  fromYear : number;
  toYear : number;
  itemId : string;
  itemsList: any;
  selectedItemName: string;
  public TitlePage: string;

  constructor(private title: Title,
  private translateService: TranslateService,
  private alert: sweetalert,
  private jwtAuth: JwtAuthService,
  public routePartsService: RoutePartsService,
  private productionReportService: ProductionReportService,) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.productionReportService.GetItemsList().subscribe(result => {
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        return
      }
      this.itemsList = result;    
    })
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AnnualProductsStatusList');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    this.productionReportService.GetAnnualProductivity(this.itemId,this.fromYear,this.toYear).subscribe(result => {
      debugger
      if(result.isSuccess === false || result.message === "msNoPermission"){
        this.alert.ShowAlert("msNoPermission","error");
        return
      }
      this.Data = result      
      this.GetChart();
    })
  }



  GetChart() {
    debugger
    const xAxis = this.Data.map(item => item.yearNo);
    const yAxis = this.Data.map(item => item.manufactTotal);
    

    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: xAxis,
        datasets: [{
          label: 'حالة المنتجات السنوية',
          data: yAxis,
          backgroundColor: '#1a389f',
          borderWidth: 1,
        }]
      },
      options: {
        scales: {
          yAxes: {
            ticks: {
              font: {
                family: 'ArFont', // Font family
              }
            },
            title: {
              display: true,
              text: '', // Use 'text' instead of 'labelString'
              font: {
                  family: 'ArFont', // Font family
                  size: 20, // Font size
                  weight: 'bold' // Font style
              },
              color: '#2B1B17' // Replaces 'fontColor'
            }
          },
          xAxes: {
            beginAtZero: true,
            ticks: {
              display: true,              
            },
            title: {
              display: true,
              text: 'حالة المنتجات السنوية', // Use 'text' instead of 'labelString'
              font: {
                  family: 'ArFont', // Font family
                  size: 20, // Font size
                  weight: 'bold' // Font style
              },
              color: '#2B1B17' // Replaces 'fontColor'
            }
          },
        },
      }
    });
  }

  onItemSelectionChange() {
    // Find the selected item from itemsList based on itemId
    const selectedItem = this.itemsList.find(item => item.data1 === this.itemId);
    // Update selectedItemName with the selected item's name
    this.selectedItemName = selectedItem ? selectedItem.text : '';
  }

}



