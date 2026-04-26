import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { CrmdashService } from '../crmdashbored.service';

@Component({
  selector: 'app-crmdashbored',
  templateUrl: './crmdashbored.component.html',
  styleUrl: './crmdashbored.component.scss'
})
export class CrmdashboredComponent implements OnInit {
  public Data: any;
  public TitlePage: string;
  showLoader = false;
  DashboaredForm: FormGroup;
  leadsBySourceList: any;
  followupPervesList: any;
  salesPerEmployeeList: any;
  performanceTrackingList: any;
  dueFollowUpList : any;
  lostReasonsList: any;
  totalLeads: number = 0;
  convertedLeads: number = 0;
  conversionRate: any;
  loading: boolean;
  public followupPerves: Chart;
  public salesPerEmployee: Chart;
  public lostReasons: Chart;
  public performanceTracking : Chart;
  public data: any;
  public options: any;

  constructor(
    private readonly title: Title,
    private readonly jwtAuth: JwtAuthService,
    private readonly translateService: TranslateService,
    private readonly alert: sweetalert,
    private readonly dialog: MatDialog,
    private readonly egretLoader: AppLoaderService,
    private readonly service: CrmdashService,
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly formbulider: FormBuilder,
    private readonly routePartsService: RoutePartsService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.InitiailDashboredForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CRMdashbored');
    this.title.setTitle(this.TitlePage);
  }

  InitiailDashboredForm() {
    debugger
    this.DashboaredForm = this.formbulider.group({
    });

    this.service.GetMainDashboredForm().subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.showLoader = false;
        return;
      }
      debugger
      this.leadsBySourceList = result.getLeadsBySourceList || [];
      if (this.leadsBySourceList.length > 0) {
        this.ShowleadsBySource();
      }

      this.salesPerEmployeeList = result.getSalesPerEmployeeList || [];
      if (this.salesPerEmployeeList.length > 0) {
        this.GetSalesPerEmployee();
      }

      this.totalLeads = result.getGeneralConvertRateModel.totalLeads || 0;
      this.convertedLeads = result.getGeneralConvertRateModel.convertedLeads || 0;
      this.conversionRate = result.getGeneralConvertRateModel.conversionRate || 0;
      this.conversionRate = this.conversionRate.toFixed(1)
      this.followupPervesList = result.getFollowupPerfList || [];

      this.lostReasonsList = result.getLostReasonsList || [];
      if (this.lostReasonsList.length > 0) {
        this.getLostReasonsChart();
      }
      this.performanceTrackingList = result.getPerformanceTrackingList;
      if(this.performanceTrackingList.length > 0 )
        {
          this.GetPerformanceTrackingChart();
        }
      
        this.dueFollowUpList = result.getDueFollowUpsList;
      this.DashboaredForm.patchValue(result);
    })
  }

  ShowleadsBySource(): void {
    // Safety check
    if (!this.leadsBySourceList || this.leadsBySourceList.length === 0) {
      this.data = null;
      return;
    }

    // Prepare data
    const labels = this.leadsBySourceList.map(x => x.source);
    const values = this.leadsBySourceList.map(x => x.agentCount);

    // Chart Data
    this.data = {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#36A2EB',
            '#FF6384',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          borderWidth: 0,   // 🔥 remove borders = bigger look
          spacing: 0        // 🔥 no gaps between slices
        }
      ]
    };

    // Chart Options
    this.options = {
      responsive: true,
      maintainAspectRatio: false,

      cutout: '30%',      // 🔥 thicker donut (bigger visual)
      radius: '100%',     // 🔥 fill full container

      layout: {
        padding: 0
      },

      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          enabled: true
        }
      },

      animation: {
        animateRotate: true,
        animateScale: true
      }
    };
  }

  GetSalesPerEmployee() {
    if (this.salesPerEmployee) {
      this.salesPerEmployee.destroy();
    }

    const xAxis = this.salesPerEmployeeList.map(item => item.employeeName || '');
    const totalLeads = this.salesPerEmployeeList.map(item => item.totalLeads || 0);
    const convertedCount = this.salesPerEmployeeList.map(item => item.convertedCount || 0);
    const conversionRate = this.salesPerEmployeeList.map(item => item.conversionRate || 0);

    this.salesPerEmployeeList = new Chart("salesPerEmployee", {
      type: 'bar',
      data: {
        labels: xAxis,
        datasets: [
          {
            label: this.translateService.instant('TotalLeads'),
            data: totalLeads,
            backgroundColor: '#1a389f',
          },
          {
            label: this.translateService.instant('Transferred'),
            data: convertedCount,
            backgroundColor: '#28a745',
          },
          {
            label: this.translateService.instant('ConversionRate%'),
            data: conversionRate,
            backgroundColor: '#ff5733',
            yAxisID: 'y1' // still keep separate axis
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.translateService.instant('NumberClients')
            }
          },
          y1: {
            beginAtZero: true,
            max: 100, // 👈 better for percentages
            position: 'right',
            title: {
              display: true,
              text: this.translateService.instant('ConversionRate%')
            },
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: this.translateService.instant('SalesPerEmployee')
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
              }
            }
          }
        }
      }
    });

  }

  getTotalLeads(): number {
    if (!this.leadsBySourceList) return 0;
    return this.leadsBySourceList.reduce((sum, x) => {
      const value = x.agentCount ?? 0;
      return sum + Number(value);
    }, 0);
  }

  getLostReasonsChart(): void {
    // Destroy old chart if exists
    if (this.lostReasons) {
      this.lostReasons.destroy();
    }

    if (!this.lostReasonsList || this.lostReasonsList.length === 0) {
      return;
    }

    // Prepare data
    const labels = this.lostReasonsList.map(item => item.reason || '');
    const values = this.lostReasonsList.map(item => item.lostCount || 0);

    // Create chart
    this.lostReasons = new Chart("lostReasons", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: this.translateService.instant('LostCount'),
            data: values,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40'
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: this.translateService.instant('NumberOfCases')
            }
          },
          x: {
            title: {
              display: true,
              text: this.translateService.instant('LostReasonss')
            },
            ticks: {
              autoSkip: false,       // 🔥 show all labels
              maxRotation: 45,       // 🔥 avoid overlap
              minRotation: 0
            }
          }
        },

        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${this.translateService.instant('LostCount')}: ${context.raw}`;
              }
            }
          }
        }
      }
    });
  }

  GetPerformanceTrackingChart() {

  if (this.performanceTracking) {
    this.performanceTracking.destroy();
  }

  const xAxis = this.performanceTrackingList.map(x => x.branchName || '');

  const leads = this.performanceTrackingList.map(x => x.leadsCount || 0);
  const opportunities = this.performanceTrackingList.map(x => x.opportunitiesCount || 0);
  const wonDeals = this.performanceTrackingList.map(x => x.wonDeals || 0);
  const salesAmount = this.performanceTrackingList.map(x => x.salesAmount || 0); // ✅ THIS WAS MISSING
  const conversionRate = this.performanceTrackingList.map(x => x.conversionRate || 0);

  this.performanceTracking = new Chart("performanceTracking", {
    type: 'bar',
    data: {
      labels: xAxis,
      datasets: [
        {
          label: this.translateService.instant('LeadsCount'),
          data: leads,
          backgroundColor: '#1a389f',
        },
        {
          label: this.translateService.instant('OpportunitiesCount'),
          data: opportunities,
          backgroundColor: '#ffc107',
        },
        {
          label: this.translateService.instant('WonDeals'),
          data: wonDeals,
          backgroundColor: '#28a745',
        },
        {
          label: this.translateService.instant('SaleValue'),
          data: salesAmount,
          backgroundColor: '#6f42c1',
          yAxisID: 'y2' // 👈 important
        },
        {
          label: this.translateService.instant('ConversionRate%'),
          data: conversionRate,
          backgroundColor: '#ff5733',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: this.translateService.instant('Count')
          }
        },
        y1: {
          beginAtZero: true,
          max: 100,
          position: 'right',
          title: {
            display: true,
            text: this.translateService.instant('ConversionRate%')
          },
          grid: {
            drawOnChartArea: false
          }
        },
        y2: { // ✅ NEW AXIS
          beginAtZero: true,
          position: 'right',
          title: {
            display: true,
            text: this.translateService.instant('SaleValue')
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },

      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = Number(context.raw) || 0;

              if (context.dataset.yAxisID === 'y1') {
                return `${label}: ${value.toFixed(2)}%`;
              }

              if (context.dataset.yAxisID === 'y2') {
                return `${label}: ${value} JOD`; // 💰 nicer
              }

              return `${label}: ${value}`;
            }
          }
        }
      }
    }
  });
}

}
