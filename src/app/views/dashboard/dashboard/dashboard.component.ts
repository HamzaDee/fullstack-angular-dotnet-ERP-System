import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from '../dashboard.service';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReminderNotesFormComponent } from './reminder-notes-form/reminder-notes-form.component';
import { ReminderNotesService } from './reminder-notes-form/reminder-notes.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { sweetalert } from 'sweetalert';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public TitlePage: string;
  ModelListAccountBalanceDetails: any;
  TodayVoucher:any;
  ReminderNoteList: any[] = [];
  AccountsBalnce:any;
  itemsSalesList:any;
  topFiveList:any;
  public responseColor: string[] = [];
  public myAnnualChart: Chart;
  public accountBalanceChart: Chart;
  public data: any;
  public dataCost: any;
  public options: any;
  public optionsCost: any;
  public CompanyName: string = '';//this.jwtAuth.getCompanyName();
  public totalInternalProjects: number = 0;
  public totalExternalProjects: number = 0;
  public totalIncomingDiwan: number = 0;
  public totalOutgoingDiwan: number = 0;
  totalInternalAmount:number = 0;
  totalExternalAmount:number = 0;
  // New Edits 
  public localOrganizations: number = 0;
  public internationalOrganizations: number = 0;
  public unOrganizations: number = 0;
  public militaryVehicles: number = 0;
  public civilianVehicles: number = 0;
  constructor(
    private translateService: TranslateService,
    private dashboardService: DashboardService,
    private title: Title,
    private routePartsService: RoutePartsService,
    private router: Router,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private ReminderNotesService: ReminderNotesService,
    private alert: sweetalert) {}

  HasPerm: boolean;
  showLoader = false
  panelOpenState = false;

  ngOnInit(): void {
    debugger
    this.CompanyName = window.localStorage.getItem('companyName');
    this.SetTitlePage();
    this.GetAllTodayVoucher();
    this.GetAllReminderNotes();
    this.GetDashboredInfo();
    this.GetDashboredAccountBalance();
    if(this.CompanyName == "Hashmyieh")
      {
        this.GetMainInfo();
      }        
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('DASHBOARD');
    this.title.setTitle(this.TitlePage);
  }

  GetAllTodayVoucher() {
    this.dashboardService.GetAllTodayVoucher().subscribe(res => {
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(() => {
        debugger
        this.TodayVoucher = res;
      })     
    })
  }

  GetAllReminderNotes() {
    debugger
    this.ReminderNotesService.getReminderNoteList().subscribe((results: any) => {
      debugger
this.ReminderNoteList = results.filter(item => typeof item.descr === 'string');
  this.ReminderNoteList.forEach(item => {
  console.log(typeof item.descr, item.descr);
});
    })
  }

  GetDashboredInfo()
  {
    this.dashboardService.GetDashboredInfo().subscribe(res => 
      {
        this.itemsSalesList = res;
        this.GetAnnualChart();
      })

  }

  navigateToReminderNotesPopUp(id: number, crruntrow: any, isNew?){
    debugger
    let title = this.translateService.instant('ReminderNotes');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ReminderNotesFormComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, row: crruntrow, isNew, GetAllReminderNotes: () => { this.GetAllReminderNotes() }}
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  DeleteReminderNotes(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.ReminderNotesService.deleteReminderNotes(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAllReminderNotes();
          }
          else {
            this.alert.DeleteFaild();
            }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  GetAnnualChart() {
    if (this.myAnnualChart) {
      this.myAnnualChart.destroy();
    }
  
    const xAxis = this.itemsSalesList.map(item => item.itemName || '');
    const soldAmountData = this.itemsSalesList.map(item => item.totalSales || 0);
    // const costAmountData = this.listSalesCostForecasting.map(item => item.totalCost || 0);
    // const forecastAmountData = this.listSalesCostForecasting.map(item => item.forecastAmount || 0);
    // const profitAmountData = this.listSalesCostForecasting.map(item => item.profitRate || 0);
  
    if (!Array.isArray(xAxis) || !Array.isArray(soldAmountData)) {
      console.error('One of the datasets is not an array!');
      return;
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
          // {
          //   label: 'التوقعات',
          //   data: forecastAmountData,
          //   backgroundColor: '#f76c6c',
          //   borderWidth: 1,
          // },
          // {
          //   label: 'التكلفة',
          //   data: costAmountData,
          //   backgroundColor: '#a76c6c',
          //   borderWidth: 1,
          // },
          // {
          //   label: 'الأرباح',
          //   data: profitAmountData,
          //   backgroundColor: '#FFFF00',
          //   borderWidth: 1,
          // }
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

  GetDashboredAccountBalance()
  {
    this.dashboardService.GetDashboredAccountBalance().subscribe(res => 
      {
        debugger
          this.AccountsBalnce = res;
          this.ShowAccountBalances();
      })
  }

  ShowAccountBalances(){
    if (this.accountBalanceChart) {
      this.accountBalanceChart.destroy();
    }
  
    const xAxis = this.AccountsBalnce.map(item => item.accountName || '');
    const value = this.AccountsBalnce.map(item => item.accountBalance || 0);  
    if (!Array.isArray(xAxis) || !Array.isArray(value)) {
      console.error('One of the datasets is not an array!');
      return;
    }
    this.accountBalanceChart = new Chart("accountBalanceChart", {
      type: 'bar',
      data: {
        labels: xAxis,
        datasets: [
          {
            label: 'الرصيد',
            data: value,
            backgroundColor: '#d4262b',
            borderWidth: 1,
          },
          // {
          //   label: 'التوقعات',
          //   data: forecastAmountData,
          //   backgroundColor: '#f76c6c',
          //   borderWidth: 1,
          // },
          // {
          //   label: 'التكلفة',
          //   data: costAmountData,
          //   backgroundColor: '#a76c6c',
          //   borderWidth: 1,
          // },
          // {
          //   label: 'الأرباح',
          //   data: profitAmountData,
          //   backgroundColor: '#FFFF00',
          //   borderWidth: 1,
          // }
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
              text: 'الحسابات',
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

  OpenAllTransactionsReport() {
    debugger
    // Construct the URL you want to navigate to
    const url = `/vouchertransactions/GetVouchersTransactionsForm`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  GetMainInfo()
  {
    debugger
    this.CompanyName
    this.dashboardService.GetTopFiveAuthorities().subscribe(res => 
      {
        debugger
        this.topFiveList = res.highestFiveAuthoritiesModel;
        this.totalInternalProjects = res.totalInternalProjects;
        this.totalExternalProjects = res.totalExtenalProjects;
        this.totalIncomingDiwan = res.totalIncomingDiwan;
        this.totalOutgoingDiwan = res.totalOutgoingDiwan;
        this.localOrganizations = res.localOrganizations;
        this.internationalOrganizations = res.internationalOrganizations;
        this.unOrganizations = res.unOrganizations;
        this.militaryVehicles = res.militaryVehicles;
        this.civilianVehicles = res.civilianVehicles;
        this.totalInternalAmount = res.totalAmountInternal
        this.totalExternalAmount = res.totalAmountExternal
      })
  }
}