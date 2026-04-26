import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReportsService } from '../../reports.service';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, delay } from 'rxjs';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from 'assets/fonts/amiri';


@Component({
  selector: 'app-accounts-groups-report',
  templateUrl: './accounts-groups-report.component.html',
  styleUrl: './accounts-groups-report.component.scss'
})
export class AccountsGroupsReportComponent {
  public TitlePage: string;
  GroupList: any;
  BranchList: any;
  AccountsGroupsForm: FormGroup;
  Data: any;
  GroupNo: number;
  selectedGroup: any;
  exportData: any[];
  fromDate : any;
  public totalOpeningDebit = 0;
  public totalOpeningCredit = 0;
  public totalPeriodDebit = 0;
  public totalPeriodCredit = 0;
  public finalBalanceDebit = 0;
  public finalBalanceCredit = 0;
  Lang: string;
  screenId: number = 255;
  custom: boolean;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private ReportsService: ReportsService,
    private formbulider: FormBuilder,
    private route: ActivatedRoute,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.route.queryParams.subscribe((params: Params) => {
      debugger
      this.GroupNo = +params['groupNo'];
    });
    this.AccountsGroupsForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      groupNo: [0, [Validators.required, Validators.min(1)]],
      branchId: [-1],
      fromDate: [''],
      toDate: [''],
    });
    this.GetAccountsGroupsInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountsGroupsReport');
    this.title.setTitle(this.TitlePage);
  }

  GetAccountsGroupsInitialForm() {
    this.ReportsService.getAccountsGroupsReportForm().subscribe((result) => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      debugger
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.fromDate = result.fromDate
      this.GroupList = result.groupList;
      this.BranchList = result.branchList;
      this.AccountsGroupsForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if (!isNaN(Number(this.GroupNo)) && Number(this.GroupNo) !== 0) {
          this.selectedGroup = this.GroupNo;
        }
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    var GroupNo = this.AccountsGroupsForm.value.groupNo > 0 ? this.AccountsGroupsForm.value.groupNo : -1;
    var BranchId = this.AccountsGroupsForm.value.branchId > 0 ? this.AccountsGroupsForm.value.branchId : -1;
    var FromDate = this.AccountsGroupsForm.value.fromDate;
    var ToDate = this.AccountsGroupsForm.value.toDate;

    this.ReportsService.GetAccountsGroupsReport(
      GroupNo,
      BranchId,
      FromDate,
      ToDate
    ).subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.Data = result;

      if (currentLang == "ar") {
        this.refreshsAccountsGroupsArabic(this.Data);
      }
      else {
        this.refreshAccountsGroupsEnglish(this.Data);
      }

      this.calculateTotals();
    });
  }

  calculateTotals() {
    debugger
    this.totalOpeningDebit = this.Data
      .filter(item => (item.openingDebit - item.openingCredit) > 0)
      .reduce((sum, item) => sum + (item.openingDebit - item.openingCredit), 0);
      

    this.totalOpeningCredit = this.Data
      .filter(item => (item.openingDebit - item.openingCredit) < 0)
      .reduce((sum, item) => sum + (item.openingCredit - item.openingDebit), 0);

    this.totalPeriodDebit = this.Data
      .filter(item => (item.periodDebit - item.periodCredit) > 0)
      .reduce((sum, item) => sum + (item.periodDebit - item.periodCredit), 0);


    this.totalPeriodCredit = this.Data
      .filter(item => (item.periodDebit - item.periodCredit) < 0)
      .reduce((sum, item) => sum + (item.periodCredit - item.periodDebit), 0);

    this.finalBalanceDebit = this.Data
      .filter(item => item.netBalance > 0)
      .reduce((sum, item) => sum + item.netBalance, 0);

    this.finalBalanceCredit = this.Data
      .filter(item => item.netBalance < 0)
      .reduce((sum, item) => sum + Math.abs(item.netBalance), 0);


      this.totalOpeningDebit = Number(this.totalOpeningDebit.toFixed(3));
this.totalOpeningCredit = Number(this.totalOpeningCredit.toFixed(3));
this.totalPeriodDebit = Number(this.totalPeriodDebit.toFixed(3));
this.totalPeriodCredit = Number(this.totalPeriodCredit.toFixed(3));
this.finalBalanceDebit = Number(this.finalBalanceDebit.toFixed(3));
this.finalBalanceCredit = Number(this.finalBalanceCredit.toFixed(3));
  }


    formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearFormData() {
    this.totalOpeningDebit = 0;
    this.totalOpeningCredit = 0;
    this.totalPeriodDebit = 0;
    this.totalPeriodCredit = 0;
      this.finalBalanceDebit = 0;
    this.finalBalanceCredit = 0;
    this.Data = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.AccountsGroupsForm.get('fromDate').setValue(this.fromDate);
    this.AccountsGroupsForm.get('toDate').setValue(currentDate);
    this.AccountsGroupsForm.get('groupNo').setValue(0);
    this.AccountsGroupsForm.get('branchId').setValue(0);
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;
    window.open(url, '_blank');
  }

  PrintReport() {
    debugger
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.AccountsGroupsForm.value;
    if (this.AccountsGroupsForm.value.branchId == 0) {
      formValues.branchId = -1;
    }


   if (this.Lang == "ar") {
    const reportUrl = `rptAccountsGroupsReportAR?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&GroupNo=${formValues.groupNo}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}`;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/report-viewer'], {
        queryParams: { reportUrl }
      })
    );
    debugger
    window.open(url, '_blank');
    }
    else {
    const reportUrl = `rptAccountsGroupsReportEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&GroupNo=${formValues.groupNo}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}`;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/report-viewer'], {
        queryParams: { reportUrl }
      })
    );
    debugger
    window.open(url, '_blank');
    }


  }

  refreshsAccountsGroupsArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'رقم الحساب': x.accNo,
      'اسم الحساب': x.accountName,
      'رصيد قبل الفترة': x.openingDebit - x.openingCredit,
      'رصيد خلال الفترة': x.periodDebit - x.periodCredit,
      'الرصيد': (x.openingDebit - x.openingCredit) + (x.periodDebit - x.periodCredit),
    }));

  }

  refreshAccountsGroupsEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Account Number': x.accNo,
      'Account Name': x.accountName,
      'Balance Before That Time': x.openingDebit - x.openingCredit,
      'Balance During The Period': x.periodDebit - x.periodCredit,
      'Balance': (x.openingDebit - x.openingCredit) + (x.periodDebit - x.periodCredit),
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Inventory Report List", ".xlsx");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['الرصيد', 'رصيد خلال الفترة', 'رصيد قبل الفترة', 'اسم الحساب', 'رقم الحساب']]
    }
    else {
       head = [['Balance', 'Balance During The Period', 'Balance Before That Time', 'Account Name', 'Account Number']]
    }

    const rows: (number | string)[][] = [];
    this.Data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.accNo,
        temp[1] = part.accountName
      temp[2] = part.openingDebit - part.openingCredit
      temp[3] = part.periodDebit - part.periodCredit
      temp[4] = (part.openingDebit - part.openingCredit) + (part.periodDebit - part.periodCredit)
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.Data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "كشف زمر الحسابات";
    }
    else {
      Title = "Accounts Groups Report";
    }

    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
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
}
