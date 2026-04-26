import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PeriodsFiscalyearFormComponent } from './periodsfiscalyear-form/periodsfiscalyear-form.component';
import { PeriodsFiscalyearService } from '../periodsfiscalyear.service';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-fiscalyear-list',
  templateUrl: './periodsfiscalyear-list.component.html',
  styleUrls: ['./periodsfiscalyear-list.component.scss']
})
export class PeriodsFiscalyearListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  DateNow: Date = new Date();
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 27;
  custom: boolean;
  data: any[];
  exportData: any[];


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private PeriodsFiscalyearService: PeriodsFiscalyearService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPeriodsFiscalYearsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('periodsFiscalyearList');
    this.title.setTitle(this.TitlePage);
  }

  GetPeriodsFiscalYearsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.PeriodsFiscalyearService.GetperiodsFiscalYearList().subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresPeriodsFiscalyearArabic(this.tabelData);
        }
        else {
          this.refreshPeriodsFiscalyearEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }

  OpenPeriodsFiscalYearFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('NEWPeriodsFiscalyear') : this.translateService.instant('MODIFYPeriodsFiscalYear');
    let dialogRef: MatDialogRef<any> = this.dialog.open(PeriodsFiscalyearFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        GetPeriodsFiscalYearListFromParent: () => { this.GetPeriodsFiscalYearsList() }
      }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  DeletePeriodsFiscalYear(id: any, periodsfiscalyear) {
    debugger
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
        this.PeriodsFiscalyearService.PeriodsDeleteFiscalYear(id, periodsfiscalyear).subscribe((results) => {

          if (results.isSuccess == true) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.GetPeriodsFiscalYearsList();
              return;
            }
            this.alert.DeleteSuccess();
            this.GetPeriodsFiscalYearsList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            if (results.message == "msgRecordHasLinks") {

              this.alert.ShowAlert("msgRecordHasLinks", 'error')

            }
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
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

  refresPeriodsFiscalyearArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedstartDate = new Date(x.startDate).toLocaleDateString('ar-EG');
      const formattedendDate = new Date(x.endDate).toLocaleDateString('ar-EG');
      return {
        'الرقم': x.id,
        'اسم الفتره الماليه': x.periodNameA,
        'السنه': x.yearNo,
        'تاريخ البداية': formattedstartDate,
        'تاريخ التهاية': formattedendDate,
        'فعال': x.isActive,
        'مغلقه': x.isClosed,
      }
    });
  }

  refreshPeriodsFiscalyearEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedstartDate = new Date(x.startDate).toLocaleDateString('en-GB');
      const formattedendDate = new Date(x.endDate).toLocaleDateString('en-GB');
      return {
        'number': x.id,
        'Period Fiscal Year Name': x.periodNameA,
        'Period Fiscal Year': x.yearNo,
        'Start Date': formattedstartDate,
        'End Date': formattedendDate,
        'Active': x.isActive,
        'Closed': x.isClosed,
      }
    });
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['مغلقه', 'فعال', 'تاريخ النهاية', ' تاريخ البداية', 'السنه', 'اسم الفترة المالية', 'الرقم']]
    }
    else {
       head = [['Closed', 'Active', 'End Date', 'Start Date', 'Period Fiscal Year', 'Period Fiscal Year Name', 'number']]
    }

    const rows: (number | string)[][] = [];

    this.data.forEach(function (part, index) {


      const date1 = new Date(part.startDate);
      const formattedstartDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      const date2 = new Date(part.endDate);
      const formattedDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.periodNameA
      temp[2] = part.yearNo
      temp[3] = formattedstartDate
      temp[4] = formattedDate
      temp[5] = part.isActive
      temp[6] = part.isClosed
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "الفترات المالية";
    }
    else {
      Title = "Fiscal Periods ";
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

  CloseYearPeriods(id: any) {
    this.PeriodsFiscalyearService.CloseYearPeriod(id).subscribe(result => {
      debugger
      if (result) {
        this.alert.SaveSuccess();
        this.GetPeriodsFiscalYearsList();
      }
      else {
        this.alert.SaveFaild()
      }
    })

  }
  
  openPeriodsYear(id: any) {
    this.PeriodsFiscalyearService.OpenYearPeriod(id).subscribe(result => {
      debugger
      if (result) {
        this.alert.SaveSuccess();
        this.GetPeriodsFiscalYearsList();
      }
      else {
        this.alert.SaveFaild()
      }
    })

  }
}
