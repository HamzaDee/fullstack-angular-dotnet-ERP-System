import { Component, OnInit } from '@angular/core';
import { ProductionReportService } from '../production-report.service';
// import * as Chart from 'chart.js';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-prod-dashboard',
  templateUrl: './prod-dashboard.component.html',
  styleUrls: ['./prod-dashboard.component.scss']
})
export class ProdDashboardComponent implements OnInit {
  public Data: any;
  public myChart: Chart;
  public myAnnualChart: Chart;
  fromYear : number;
  toYear : number;
  itemId : string;
  itemsList: any;
  selectedItemName: string;
  requiredTotal:number;
  manufactTotal:number;
  performPer:any;
  pharmaLine:number;
  cosmeticLine:number;
  fluidLine:number;
  foamLine:number;

  constructor(
    private productionReportService: ProductionReportService
  ) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.fromYear = currentDate.getFullYear()-1;
    this.toYear = currentDate.getFullYear();
    this.productionReportService.GetItemsList().subscribe(result => {
      this.itemsList = result;    
    })
    this.GetReport();
    this.GetPerfReport();
    this.GetProdCapacity();
  }

  GetProdCapacity(){
    this.productionReportService.GetProdCapacity().subscribe(result => {     
      debugger
      this.Data=result; 
      this.pharmaLine = this.Data.pharmaLine;      
      this.cosmeticLine = this.Data.cosmeticLine;      
      this.fluidLine = this.Data.fluidLine;      
      this.foamLine = this.Data.foamLine;      
      
    })
  }

  GetReport() {
    this.productionReportService.GetProductivity(this.fromYear,this.toYear).subscribe(result => {
      debugger
      this.Data = result      
      this.GetChart();
    })
  }

  GetAnnualReport() {
    this.productionReportService.GetAnnualProductivity(this.itemId,this.fromYear,this.toYear).subscribe(result => {
      debugger
      this.Data = result      
      this.GetAnnualChart();
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
          label: 'الانتاجية',
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
              text: 'الانتاجية', // Use 'text' instead of 'labelString'
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

  GetAnnualChart() {
    debugger
    const xAxis = this.Data.map(item => item.yearNo);
    const yAxis = this.Data.map(item => item.manufactTotal);
    this.myAnnualChart = new Chart("myAnnualChart", {
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

  GetPerfReport(){
    this.productionReportService.GetPerformance(2,this.toYear).subscribe(result => {
      this.requiredTotal = result[0].requiredTotal;
      this.manufactTotal = result[0].manufactTotal;
      this.performPer = ((this.manufactTotal/this.requiredTotal) * 100).toFixed(3) + '%';
    });
  }

  onItemSelectionChange() {
    // Find the selected item from itemsList based on itemId
    const selectedItem = this.itemsList.find(item => item.data1 === this.itemId);
    // Update selectedItemName with the selected item's name
    this.selectedItemName = selectedItem ? selectedItem.text : '';
  }
}
