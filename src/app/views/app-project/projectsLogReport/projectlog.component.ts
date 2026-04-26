import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProjectsLogService } from './projectlog.service';
import { AmiriRegular } from 'assets/fonts/amiri';


@Component({
  selector: 'app-projectlog',
  templateUrl: './projectlog.component.html',
  styleUrl: './projectlog.component.scss'
})
export class ProjectlogComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 260;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  projectsList: any;
  voucherData: any;
  loading: boolean;
  data: any[] = [];



  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private service: ProjectsLogService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      projectId: [0],
    });

    this.GetProjectsForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProjectLogList');
    this.title.setTitle(this.TitlePage);
  }

  GetProjectsForm() {
    debugger
    this.service.GetProjectLogForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.projectsList = result.projectsList;
      this.SaleReportForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.clearFormData();
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.voucherData = [];
      debugger
      const formValues = this.SaleReportForm.value;
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.service.GetProjectsLog(
        formValues.projectId,
      ).subscribe((result) => {
        debugger

        this.voucherData = result;
        this.data = result;

        this.egretLoader.close();
        if (currentLang == "ar") {
          this.refreshItemsTaxReportArabic(this.voucherData);
        }
        else {
          this.refreshItemsTaxReportEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0) {
          this.egretLoader.close();
        }
        else {
          this.egretLoader.close();
        }

      });
    });

  }

  clearFormData() {
    debugger
    this.SaleReportForm.reset();

    this.Data = []; // Clear the table data
    this.voucherData = [];
    this.SaleReportForm.get('projectId').setValue(0);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  updateFavourite(ScreenId: number) {
  this.appCommonserviceService.UpdateFavourite(ScreenId).subscribe(result => {
    if (result.isSuccess) {
      this.getFavouriteStatus(this.screenId);
      this.appCommonserviceService.triggerFavouriteRefresh(); // 🔥 THIS is key
    } else {
      this.alert.ShowAlert(result.message, 'error');
    }
  });
  }

  getFavouriteStatus(screenId)
  {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refreshItemsTaxReportArabic(data) {
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم المشروع': x.projectId,
        ' المشروع': x.projectName,
        'نوع الحركة': x.transName,
        'رقم السند': x.voucherNo,
        'نوع  السند': x.voucherName,
        'تاريخ السند': voucherDate,
        'القيمة': x.amount,
      };
    });
  }

  refreshItemsTaxReportEnglish(data) {
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-EG');
      return {
        'Project Number': x.projectId,
        'Project ': x.projectName,
        'Trans Type ': x.transName,
        'voucher Number ': x.voucherNo,
        'voucher Type': x.voucherName,
        'voucher Date': voucherDate,
        ' Value': x.amount,
      };
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refreshItemsTaxReportArabic(exportSource);
      } else {
        this.refreshItemsTaxReportEnglish(exportSource);
      }
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
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

  exportPdf(dt: any) {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['القيمة ', 'تاريخ السند', 'نوع السند', 'رقم السند', 'نوع الحركة', 'المشروع ', 'رقم المشروع']]
    }
    else {
       head = [['Value ', 'voucher Date', 'voucher Type', 'voucher Number ', 'Trans Type ', 'Project ', 'Project Number']]
    }

    const rows: (number | string)[][] = [];

    let exportSource: any[];

    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part) {

      const date1 = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.projectId;
      temp[1] = part.projectName;
      temp[2] = part.transName;
      temp[3] = part.voucherNo;
      temp[4] = part.voucherName;
      temp[5] = voucherDate;
      temp[6] = part.amount;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    // إعداد ملف PDF
   const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? " تقرير سجلات المشاريع ": "Projects Log Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      showFoot: 'lastPage',
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

}
