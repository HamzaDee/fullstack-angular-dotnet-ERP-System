import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import { deabdashboredService } from '../deabdashbored.service';
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';


@Component({
  selector: 'app-deabdashbored',
  templateUrl: './deabdashbored.component.html',
  styleUrl: './deabdashbored.component.scss'
})
export class DeabdashboredComponent implements OnInit {
  public Data: any;
  public TitlePage: string;
  showLoader = false;
  DashboaredForm: FormGroup;
  newSalesOrderList:any;
  prodSalesList:any;
  countrySales : any;
  itemsSales : any ;
  listSalesComparedToForecasting : any ;
  loading: boolean;
  public countrySalesTotals: Chart;
  public itemsSalesTotals: Chart;
  public data: any;
  public options: any;
  CountryList:any;
  AgentsList:any;
  allCustomersList:any;
  countryId:number ;
  agentId:number ;
  year:number ;
  
  constructor(
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private egretLoader: AppLoaderService,
      private service: deabdashboredService,
      private router: Router,
      private http: HttpClient,
      private formbulider: FormBuilder,
      private routePartsService: RoutePartsService,
      private cdr : ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
      this.SetTitlePage();
      this.InitiailDashboredForm();
    }

    SetTitlePage() {
        this.TitlePage = this.translateService.instant('DeabDashbored');
        this.title.setTitle(this.TitlePage);
      }
    
      InitiailDashboredForm() {
          debugger
          this.DashboaredForm = this.formbulider.group({
            // reOrderingItemsList: [null],
            // countryId:[0],
            // agentId:[0],
            // itemId:[0],
            // itemmIdd:[0],
            // year:[0, [Validators.required]],
          });  
          
        this.service.GetDeabForm().subscribe(result => {
          if(result.isSuccess == false && result.message ==="msNoPermission")
            {
              this.alert.ShowAlert("msNoPermission",'error');
              this.showLoader = false;
              return;
            } 
          debugger       
          this.newSalesOrderList = result.newListSalesOrder;
          this.prodSalesList = result.prodListSalesOrder;
          this.countrySales = result.countriesSales;
          this.itemsSales = result.mostItemsSales;
          this.CountryList = result.marketsList;
          this.AgentsList = result.agentsList;
          this.allCustomersList = result.agentsList;
          this.year = result.year;
          this.countryId = 0;
          this.agentId = 0;
          this.listSalesComparedToForecasting = result.salesToForecastList;
          this.GetcountrySalesTotals();
          this.GetItemsSalesTotals();
          this.ShowTotalsalesallcountries();
          this.DashboaredForm.patchValue(result);
        })
      }
                  
      EditSalesOrder(id: any) {
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Edit';
        var url = `/SalesOrder/SalesOrderForm?GuidToEdit=${id}&Guid2ToEdit=Edit`; 
        window.open(url,'_blank');
      }
    
      ShowSalesOrder(id: any) {
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        var url = `/SalesOrder/SalesOrderForm?GuidToEdit=${id}&Guid2ToEdit=Show`; 
        window.open(url,'_blank'); 
      }
    
     ApproveSalesOrder(id: any) {
        debugger
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Approval';
        var url = `/SalesOrder/SalesOrderForm?GuidToEdit=${id}&Guid2ToEdit=Approval`; 
        window.open(url,'_blank'); 
      }
    
     DeleteSalesOrder(id: any) {
         Swal.fire({
           title: this.translateService.instant('AreYouSure?'),
           text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
           icon: 'warning',
           confirmButtonColor: '#dc3741',
           showCancelButton: true,
           confirmButtonText: this.translateService.instant('Yes,deleteit!'),
           cancelButtonText: this.translateService.instant('Close'),
         }).then((result) => {
           if (result.value) {
             this.service.DeleteSalesOrder(id).subscribe((results) => {
               if (results) {
                 this.alert.DeleteSuccess();
                 this.InitiailDashboredForm();
               }
               else {
                 this.alert.DeleteFaild()
               }
             });
           }
           else if (result.dismiss === Swal.DismissReason.cancel) {
           }
         })      
      }

      GetcountrySalesTotals() {
        if (this.countrySalesTotals) {
          this.countrySalesTotals.destroy();
        }
      
        const xAxis = this.countrySales.map(item => item.countryName || '');
        const soldAmountData = this.countrySales.map(item => item.totalSales || 0);
        const forecastAmountData = this.countrySales.map(item => item.totalForecasting || 0);
        const profitAmountData = this.countrySales.map(item => item.invedtegationRate || 0);
        if (!Array.isArray(xAxis) || !Array.isArray(soldAmountData) || !Array.isArray(profitAmountData) || !Array.isArray(forecastAmountData)) {
          console.error('One of the datasets is not an array!');
          return;
        }
        this.countrySalesTotals = new Chart("countrySalesTotals", {
          type: 'bar',
          data: {
            labels: xAxis,
            datasets: [
              {
                label: 'التوقعات',
                data: forecastAmountData,
                backgroundColor: '#f76c6c',
                borderWidth: 1,
              },
              {
                label: 'المبيعات',
                data: soldAmountData,
                backgroundColor: '#1a389f',
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
                  text: 'الدول',
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
                    const forecastValue = forecastAmountData[tooltipItem.dataIndex] || 0;
                    const soldValue = soldAmountData[tooltipItem.dataIndex] || 0;
        
                    // Calculate the percentage difference
                    const percentage =
                      forecastValue > 0
                        ? (soldValue / forecastValue) * 100
                        : 0;
        
                    return [
                      `التوقعات: ${forecastValue}`,
                      `المبيعات: ${soldValue}`,
                      `النسبة: ${percentage.toFixed(2)}%`
                    ];
                  }
                }
              }
            }
          }
        });
      }

      GetItemsSalesTotals() {
        if (this.itemsSalesTotals) {
          this.itemsSalesTotals.destroy();
        }
      
        const xAxis = this.itemsSales.map(item => item.itemName || '');
        const soldAmountData = this.itemsSales.map(item => item.itemSalesTotal || 0);
        this.itemsSalesTotals = new Chart("itemsSalesTotals", {
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
                  text: 'المنتجات',
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

      ShowTotalsalesallcountries() {
        const totalSales = this.listSalesComparedToForecasting.totalSales;
        const totalForecast = this.listSalesComparedToForecasting.totalForcasting;
        const percent = ((totalSales / totalForecast) * 100).toFixed(2);
      
        this.data = {
          labels: ['Total Sales', 'Total Forecast'],
          datasets: [
            {
              data: [totalSales, totalForecast],
              backgroundColor: ['#36A2EB', '#FF6384'],
              hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }
          ]
        };
      
        this.options = {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            // Custom center text plugin
            tooltip: {
              enabled: true
            },
            datalabels: {
              color: '#FFF', // Text color
              font: {
                size: 16
              },
              formatter: (value: number, ctx: any) => {
                const label = ctx.chart.data.labels[ctx.dataIndex];
                return `${label}: ${value}`;
              }
            },
            customCenterText: {
              id: 'customCenterText',
              afterDraw: (chart: any) => {
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#FF6384';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${percent}%`, width / 2, height / 2);
                ctx.restore();
              }
            }
          },
          aspectRatio: 1 // Makes the chart square
        };
      }
      

      GetReport()
      {
        if(this.agentId == null || this.agentId == undefined)
          {
            this.agentId =0;
          }
        if(this.countryId == null || this.countryId == undefined)
          {
            this.countryId =0;
          }
        if(this.year == null || this.year == undefined )
          {
            this.year =0;
          }
          this.cdr.detectChanges();
          setTimeout(() => {
            this.service.GetMostItemsSales(Math.trunc(this.agentId),this.countryId,this.year).subscribe(result => {          
            this.itemsSales = result; 
            this.GetItemsSalesTotals();
            this.cdr.detectChanges();
          });
          
        })
        
      }

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
