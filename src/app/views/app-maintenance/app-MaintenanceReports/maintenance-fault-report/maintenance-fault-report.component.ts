import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';
import { MaintReportsService } from '../maintenanceRep.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-maintenance-fault-report',
  templateUrl: './maintenance-fault-report.component.html',
  styleUrls: ['./maintenance-fault-report.component.scss']
})
export class MaintenanceFaultReportComponent implements OnInit {

  MaintenanceFaultReport: FormGroup = new FormGroup({});

  screenId: number = 303;

  fromdate: Date = new Date();
  todate: Date = new Date();

  maintenanceTypelist: any;
  faultList: any;
  branchList: any;

  data: any[] = [];
  exportData: any[] = [];

  showLoader: boolean = false;
  custom: boolean = false;

  pageNumber: number = 1;
  pageSize: number = 10;

  public TitlePage: string = '';

  constructor(
    private readonly formbulider: FormBuilder,
    private readonly translateService: TranslateService,
    private readonly ReportsService: MaintReportsService,
    private readonly alert: sweetalert,
    public readonly ValidatorsService: ValidatorsService,
    private readonly jwtAuth: JwtAuthService,
    private readonly appCommonserviceService: AppCommonserviceService,
    private readonly title: Title,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetMaintenanceFaultForm();
    this.GetMaintenanceFaultInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaintenanceFaultReport');
    this.title.setTitle(this.TitlePage);
  }

  GetMaintenanceFaultForm() {
        const today = new Date();
    const from = new Date(today.getFullYear(), 0, 1);
    this.MaintenanceFaultReport = this.formbulider.group({
      fromdate: [from],
      todate: [today],
      damageId: [null],
      inRequest: [null],
      branchId: [null],
      groupByBranch: [0],
      pageNumber: [1],
      pageSize: [10],
    });
  }

  GetMaintenanceFaultInitialForm() {
    debugger
    this.ReportsService.GetMaintenanceFaultForm().subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
   debugger
      this.maintenanceTypelist = result.maintenanceTypelist;
      this.faultList = result.faultList;
      this.branchList = result.branchList;
      result.fromdate = formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US");
      this.MaintenanceFaultReport.patchValue(result);
    });
  }

  loadData(event?: any) {
    this.showLoader = true;
    
    if (event) {
      this.pageNumber = (event.first / event.rows) + 1;
      this.pageSize = event.rows;
      
      this.MaintenanceFaultReport.patchValue({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      });
    }
          debugger
    
    this.ReportsService.GetMaintenanceFault(this.MaintenanceFaultReport.value)
    .subscribe({
      next: (result) => {
          debugger
          this.data = result.data || result;
          this.prepareExportData();
          this.showLoader = false;
        },
        error: () => {
          this.showLoader = false;
        }
      });
  }

  search() {
    debugger
    this.MaintenanceFaultReport.patchValue({ pageNumber: 1 });
    this.loadData();
  }

  clearFormData() {
    this.MaintenanceFaultReport.reset();
    this.data = [];

    this.fromdate = new Date();
    this.todate = new Date();

    this.MaintenanceFaultReport.patchValue({
      fromdate: this.fromdate,
      todate: this.todate
    });

    this.GetMaintenanceFaultInitialForm();
  }

  prepareExportData() {
    const currentLang = this.jwtAuth.getLang();

    if (currentLang === 'ar') {
      this.exportData = this.data.map(x => ({
        'اسم الفرع': x.branchName,
        'اسم العطل': x.descrA,
        'عدد التكرار': x.repetition
      }));
    } else {
      this.exportData = this.data.map(x => ({
        'Branch Name': x.branchName,
        'Fault Name': x.descrE,
        'Repetition': x.repetition
      }));
    }
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "MaintenanceFaultReport");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    const head = isArabic
      ? [['عدد التكرار', 'اسم العطل', 'اسم الفرع']]
      : [['Repetition', 'Fault Name', 'Branch Name']];

    const rows: any[] = [];

    this.data.forEach(x => {
      let row = [
        x.branchName,
        isArabic ? x.descrA : x.descrE,
        x.repetition
      ];

      if (isArabic) row.reverse();

      rows.push(row);
    });

    const pdf = new jsPDF('l', 'pt', 'a4');

    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');

    const title = isArabic ? "تقرير الأعطال" : "Maintenance Fault Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 10, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      styles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 10
      },
      theme: 'grid'
    });

    pdf.output('dataurlnewwindow');
  }

  updateFavourite(ScreenId: number) {
    this.appCommonserviceService.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
        this.appCommonserviceService.triggerFavouriteRefresh();
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId: any) {
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
      this.custom = result.isSuccess;
    });
  }
}