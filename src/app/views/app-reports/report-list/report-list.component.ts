import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { ReportslistserviceService } from '../reportslistservice.service';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent implements OnInit {
  public TitlePage: string;
  data: any[];
  cols: any[];
  mainTableList: any;
  selectedMainTable: any;
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  exportData: any[];

  constructor(
    @Inject('BASE_URL') public baseUrl: string,
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private reportsService: ReportslistserviceService,
    private egretLoader: AppLoaderService
  ) {
  }
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAllReportsList();
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('EditPrint');
    this.title.setTitle(this.TitlePage);
  }

  ResetReports(reportName: string){
    Swal.fire({
          title: this.translateService.instant('AreYouSure?'),
          text: this.translateService.instant('ResetReports'),
          icon: 'warning',
          confirmButtonColor: '#dc3741',
          showCancelButton: true,
          confirmButtonText: this.translateService.instant('Yes,deleteit!'),
          cancelButtonText: this.translateService.instant('Close'),
        }).then((result) => {
          if (result.value) {
            this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
            this.reportsService.ResetReports(reportName).subscribe((results) => {
              if (results) {
                debugger
                if (results.isSuccess == false && results.message == "msNoPermission") {
                  this.alert.ShowAlert("msNoPermission", 'error');
                  this.egretLoader.close();
                  return;
                }
                this.data = results;
                this.alert.SaveSuccess();
                this.egretLoader.close();
              }
              else {
                this.alert.DeleteFaild();
                this.egretLoader.close();
              }
            });
          }
        })
  }

  GetAllReportsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.reportsService.GetAllReportsList().subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.data = result;

      if (currentLang == "ar") {
        this.refreshReportListArabic(this.data);
      }
      else {
        this.refreshReportListEnglish(this.data);
      }
    })
  }


  refreshReportListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      ' الرقم': x.id,
      'الاسم - عربي': x.reportNameAr,
      'الاسم - انجليزي': x.reportNameEn,
    }));
  }

  refreshReportListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.id,
      'Arabic Name': x.reportNameAr,
      'English Name': x.reportNameEn,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "products");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [[' الاسم - انجليزي', 'الاسم - عربي', ' الرقم']]
    }
    else {
      var head = [['English Name', 'Arabic Name', 'Number']]
    }
    var rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.reportNameAr
      temp[2] = part.reportNameEn
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('p', null, 'a4', true);
    pdf.setHeaderFunction
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");

    pdf.setFont("Amiri"); // set font For Title
    pdf.setFontSize(14);  // set font Size  For Title

    let Title;
    if (currentLang == "ar") {
      Title = "قائمة طباعة السندات ";
    }
    else {
      Title = "Report List";
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
}


