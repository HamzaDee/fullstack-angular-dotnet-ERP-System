import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Chart } from 'chart.js';
import { sweetalert } from 'sweetalert';
import { ProductionReportService } from '../../production-report.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

@Component({
  selector: 'app-dates-of-arrival-of-materials-list',
  templateUrl: './dates-of-arrival-of-materials-list.component.html',
  styleUrls: ['./dates-of-arrival-of-materials-list.component.scss']
})
export class DatesOfArrivalOfMaterialsListComponent implements OnInit {
  public Data: any;
  screenId:number = 190;
  exportData: any[];
  custom:boolean;
  public myChart: Chart;
  public TitlePage: string;
  basicData: any;
  basicOptions: any;
  itemNames: string[] = [];

  constructor(
    private title: Title,
    private translateService: TranslateService,
    public routePartsService: RoutePartsService,
    private productionReportService: ProductionReportService,
    private readonly serv: AppCommonserviceService,
    private alert: sweetalert,
) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetItemsDatesArrival();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DatesOfArrivalOfMaterials');
    this.title.setTitle(this.TitlePage);
  }

  updateFavourite(ScreenId: number) {
  this.serv.UpdateFavourite(ScreenId).subscribe(result => {
    if (result.isSuccess) {
      this.getFavouriteStatus(this.screenId);
      this.serv.triggerFavouriteRefresh(); // 🔥 THIS is key
    } else {
      this.alert.ShowAlert(result.message, 'error');
    }
  });
  }

  getFavouriteStatus(screenId)
  {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if(result.isSuccess)
      {
        this.custom = true;
      }
      else
      {
        this.custom = false;
      }
      debugger             
    })        
  }

  GetItemsDatesArrival() {
    debugger
    this.productionReportService.GetItemsDatesArrival().subscribe(result => {
      debugger
      if (result && Array.isArray(result)) {
        // Configure chart options
        this.basicOptions = {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const index = context.dataIndex;
                  const item = this.itemNames[index]; // 👈 from our custom array
                  const date = context.label;
                  const qty = context.raw;
                  return [`Item: ${item}`, `Date: ${date}`, `Qty: ${qty}`];
                }
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Arrival Date' }
            },
            y: {
              title: { display: true, text: 'Quantity' },
              min: 0,
              max: 10,
              beginAtZero: true
            }
          }
        };

        this.buildChartData(result);
      }
    });
  }
  
  buildChartData(data: any[]) {
    const sorted = [...data].sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate));
    this.basicData = {
      labels: sorted.map(d => d.arrivalDate),
      datasets: [
        {
          label: 'Items Arrival',
          data: sorted.map(d => d.xQty),
          fill: false,
          borderColor: '#000',        
          tension: 0,                  
          pointBackgroundColor: '#000',
          pointRadius: 6,
          pointHoverRadius: 8,
          // Include item names in custom data array for tooltips
          itemNames: sorted.map(d => d.itemName) // custom property, used below
        }
      ]
    };

    // Save the item names for tooltip access
    this.itemNames = sorted.map(d => d.itemName);
  }
}
