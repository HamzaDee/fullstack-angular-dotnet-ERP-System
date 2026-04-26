import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { ProdDashboredService } from './proddash.service';
import { Chart, ChartConfiguration } from 'chart.js';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
@Component({
  selector: 'app-prodinfodashboared',
  templateUrl: './prodinfodashboared.component.html',
  styleUrl: './prodinfodashboared.component.scss'
})
export class ProdinfodashboaredComponent implements OnInit {
  public Data: any;
  public TitlePage: string;
  showLoader = false;
  public myAnnualChart: Chart;
  public myTotalSalesChart: Chart; 
  public myChart: Chart;
  public chartInstance: Chart;
  CountryList: any[];
  AgentsList: any[];
  allCustomersList:any;
  ItemsList: any[];
  ItemsList2: any[];
  dashboredList:any;
  listsalesComparedToCost:any;
  listSalesComparedToForecasting:any;
  listSalesCostForecasting:any;
  loading: boolean;
  itemId : number;
  year : number;
  countryId : number;
  agentId : number;
  public data: any;
  public dataCost: any;
  public options: any;
  public optionsCost: any;

constructor(
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private service: ProdDashboredService,
    private egretLoader: AppLoaderService,
    private jwtAuth : JwtAuthService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.InitiailDashboredForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DashboaredList');
    this.title.setTitle(this.TitlePage);
  }

  InitiailDashboredForm() {
       this.service.GetDashboredForm().subscribe(result => {
        if(result.isSuccess == false && result.message ==="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission",'error');
          return;
        }
        debugger       
        this.CountryList = result.countriesList;
        this.AgentsList = result.agentsList;
        this.allCustomersList = result.agentsList;
        this.ItemsList = result.itemsList;
        this.ItemsList2 = result.itemsList;
        this.listsalesComparedToCost =result.salesToCost;
        this.listSalesComparedToForecasting = result.salesToForcasting;
        this.agentId = 0;
        this.countryId = 0;
        this.year = result.year;
        this.itemId = 0;
        this.ShowTotalsalesallcountries();
        this.ShowTotalCost();
        this.GetReport1();
      })
    }
  
    GetReport()//countryId ,agentId,itemId,year)
    {
      debugger
      if(this.year == 0 || this.year == undefined || this.year == null)
      {
        this.alert.ShowAlert("msgPleaseEnterYear","error")
        return;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.service.GetDashboredInfo(this.countryId,Number(this.agentId),this.itemId,this.year).subscribe(result => {
        debugger
        if(result.isSuccess == false && result.message ==="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission",'error');
            this.showLoader = false;
            return;
          }         
        this.dashboredList = result;
        this.CountryList = result[0].countriesList;
        this.AgentsList = result[0].agentsList;
        this.ItemsList = result[0].itemsList;
        this.dashboredList = result;
        this.egretLoader.close();
      })
    }

    isEmpty(input) {
      return input === '' || input === null;
    }



    ShowTotalsalesallcountries(){
      const totalSales = this.listSalesComparedToForecasting.totalSales;
      const totalForecast = this.listSalesComparedToForecasting.totalForcasting;
      const percent = this.listSalesComparedToForecasting.investigationRate;

      this.data = {
        labels: ['Total Sales', 'Total Forecast'],
        datasets: [
          {
            data: [totalSales, totalForecast],
            backgroundColor: ['#36A2EB', '#FF6384'],
            hoverBackgroundColor: ['#36A2EB','#FF6384']
          }
        ]
      };

      this.options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        aspectRatio: 1,  // Makes the chart square
        // You can also set the width and height as per your requirement:
        width: 400,  // Adjust the width
        height: 400, // Adjust the height
        
          cutoutPercentage: 50,
        
      };
      Chart.register({
        id: 'customCenterText',
        afterDraw: (chart: any) => {
          if (chart.id === 3) {
            const ctx = chart.ctx;
            const width = chart.width;
            const height = chart.height;
            const percentage = ((totalSales / totalForecast) * 100).toFixed(2);
            const fontSize = (height / 114).toFixed(2);
            ctx.save();
            ctx.font = fontSize + "em sans-serif";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FF6384'; // Text color
            ctx.fillText(percentage + '%', width / 2, height / 2); // Place percentage in center
            ctx.restore();
          }
        }
      });
    }

    ShowTotalCost(){
      const totalCost = this.listsalesComparedToCost.totalCost;
      const winRate = this.listsalesComparedToCost.winRate;

      this.dataCost = {
        labels: ['Total Cost', 'Total Profit'],
        datasets: [
          {
            data: [totalCost, winRate],
            backgroundColor: ['#FF6384', '#36A2EB'],
            hoverBackgroundColor: ['#FF6384', '#36A2EB']
          }
        ]
      };

      this.optionsCost = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          }
        }
        ,
        aspectRatio: 1,  // Makes the chart square
        // You can also set the width and height as per your requirement:
        width: 400,  // Adjust the width
        height: 400,
      };
    }

    GetReport1()
    {
      debugger
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.service.GetSalesAndForecastingAndWinRate(this.itemId).subscribe(result => {
        debugger
        this.listSalesCostForecasting = result;
        this.GetAnnualChart();     
        this.egretLoader.close();
      })
    }
    GetAnnualChart() {
      if (this.myAnnualChart) {
        this.myAnnualChart.destroy();
      }
    
      const xAxis = this.listSalesCostForecasting.map(item => item.itemName || '');
      const soldAmountData = this.listSalesCostForecasting.map(item => item.soldAmount || 0);
      const costAmountData = this.listSalesCostForecasting.map(item => item.totalCost || 0);
      const forecastAmountData = this.listSalesCostForecasting.map(item => item.forecastAmount || 0);
      const profitAmountData = this.listSalesCostForecasting.map(item => item.profitRate || 0);
    
      if (!Array.isArray(xAxis) || !Array.isArray(soldAmountData) || !Array.isArray(costAmountData)) {
        console.error('One of the datasets is not an array!');
        return;
      }
      let lang = this.jwtAuth.getLang()
      let titlename = '';
      if(lang == 'ar')
        {
          titlename = 'المنتجات'
        }
        else
        {
          titlename = 'Products'
        }
      this.myAnnualChart = new Chart("myAnnualChart", {
        type: 'bar',
        data: {
          labels: xAxis,
          datasets: [
            {
              label: 'المبيعات',
              data: soldAmountData,
              backgroundColor: '#1a389f',
              borderWidth: 1,
            },
            {
              label: 'التوقعات',
              data: forecastAmountData,
              backgroundColor: '#f76c6c',
              borderWidth: 1,
            },
            {
              label: 'التكلفة',
              data: costAmountData,
              backgroundColor: '#a76c6c',
              borderWidth: 1,
            },
            {
              label: 'الأرباح',
              data: profitAmountData,
              backgroundColor: '#FFFF00',
              borderWidth: 1,
            }
          ]
        },
        options: {
          scales: {
            y: {
              ticks: {
                font: {
                  family: 'ArFont', // Font family
                }
              },
              title: {
                display: true,
                text: '',
                font: {
                  family: 'ArFont', // Font family
                  size: 20, // Font size
                  weight: 'bold' // Font style
                },
                color: '#2B1B17'
              }
            },
            x: {
              ticks: {
                display: true,
              },
              title: {
                display: true,
                text: titlename,
                font: {
                  family: 'ArFont',
                  size: 20,
                  weight: 'bold'
                },
                color: '#2B1B17'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `Value: ${tooltipItem.raw}`;
                }
              }
            }
          }
        }
      });
    }
    

     /*  testChart()
      {
        debugger;
        const labels = 'كل الحالات';
        let data = this.listsalesComparedToCost.map(item => item);
        const xAxis = this.Data.map(item => item.itemName);
        const yAxis = this.Data.map(item => item.countryQty);
        const allZero = this.listsalesComparedToCost.every(value => value.count === 0);
  
        if (allZero) {
          //labels.splice(0, labels.length, 'كل الحالات');
          data = [1];
        }
  
        // إذا كان الرسم البياني موجودًا بالفعل، قم بتدميره
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }
  
        // إنشاء الرسم البياني الجديد
        this.chartInstance = new Chart('birthMethodChart', {
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
                  text: 'الكميات المنتجة', // Use 'text' instead of 'labelString'
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





      } */

        getCustomers(event: any){
          debugger
          const countryId = event.value === undefined ? event : event.value;
          if(countryId == 0)
            {
              this.AgentsList = this.allCustomersList;
            this.agentId = -1;
            }            
          else
          {
            this.AgentsList = this.allCustomersList.filter(c => c.id == countryId || c.id == -1);
          }
        }
        

}
