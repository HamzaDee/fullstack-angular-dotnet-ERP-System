import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FiscalyearService } from '../fiscalyear.service';
import { FiscalyearFormComponent } from './fiscalyear-form/fiscalyear-form.component';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { ClosefiscalyearComponent } from 'app/views/general/app-closefiscalyear/closefiscalyear.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-fiscalyear-list',
  templateUrl: './fiscalyear-list.component.html',
  styleUrls: ['./fiscalyear-list.component.scss']
})
export class FiscalyearListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tableData: any[];
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 26;
  custom: boolean;
  exportData: any[];
  CloseYearTooltip: any = this.translateService.instant('MakeSureAllPeriodsClosed');

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private fiscalyearService: FiscalyearService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {

    this.setTitlePage();
    this.getFiscalYearsList();
    this.getFavouriteStatus(this.screenId);



  }

  setTitlePage() {
    this.TitlePage = this.translateService.instant('FiscalyearList');
    this.title.setTitle(this.TitlePage);
  }

  getFiscalYearsList() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    this.fiscalyearService.GetFiscalYearList()
      .pipe(finalize(() => this.showLoader = false))
      .subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tableData = result;

        if (currentLang == "ar") {
          this.refresFiscalyearListArabic(this.tableData);
        }
        else {
          this.refreshFiscalyearListEnglish(this.tableData);
        }
      });
  }

  OpenFiscalYearFormPopUp(id: number, isNew?: boolean) {
    let title = isNew ? this.translateService.instant('NEWFiscalyear') : this.translateService.instant('MODIFYFiscalYear');
    let dialogRef: MatDialogRef<any> = this.dialog.open(FiscalyearFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        GetFiscalYearListFromParent: () => { this.getFiscalYearsList() }
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

  DeleteFiscalYear(id: any) {
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
        this.fiscalyearService.DeleteFiscalYear(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.getFiscalYearsList();
          }
          else {
            if (results.message == "msgRecordHasLinks") {
              this.alert.ShowAlert("msgRecordHasLinks", 'error')
            }
            else if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
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

  getFavouriteStatus(screenId: number) {
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
    })
  }

  refresFiscalyearListArabic(data: any[]) {
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedstartDate = new Date(x.startDate).toLocaleDateString('ar-EG');
      const formattedendDate = new Date(x.endDate).toLocaleDateString('ar-EG');
      return {
        'الرقم': x.id,
        'اسم السنه': x.yearNameA,
        'السنه الماليه': x.yearNo,
        'تاريخ البدايه': formattedstartDate,
        'تاريخ النهايه ': formattedendDate,
        ' نشط': x.isActive,
        'مغلقه': x.isClosed,
      }
    });
  }

  refreshFiscalyearListEnglish(data: any[]) {
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedstartDate = new Date(x.startDate).toLocaleDateString('en-GB');
      const formattedendDate = new Date(x.endDate).toLocaleDateString('en-GB');
      return {
        'number': x.id,
        'Fiscal Year Name': x.yearNameA,
        'Fiscal Year': x.yearNo,
        'Start Date': formattedstartDate,
        'End Date': formattedendDate,
        'Active': x.isActive,
        'Closed': x.isClosed,
      }
    });
  }

  exportExcel() {
    const isArabic = this.jwtAuth.getLang() === 'ar';
    const headers = isArabic
      ? ['مغلقه', 'نشط', 'تاريخ النهايه', 'تاريخ البدايه', 'السنه الماليه', 'اسم السنه', 'الرقم']
      : ['number', 'Fiscal Year Name', 'Fiscal Year', 'Start Date', 'End Date', 'Active', 'Closed'];

    const excelRows = (this.data || []).map((x) => {
      const formattedStartDate = new Date(x.startDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
      const formattedEndDate = new Date(x.endDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB');
      const row = isArabic
        ? {
          'مغلقه': x.isClosed,
          'نشط': x.isActive,
          'تاريخ النهايه': formattedEndDate,
          'تاريخ البدايه': formattedStartDate,
          'السنه الماليه': x.yearNo,
          'اسم السنه': x.yearNameA,
          'الرقم': x.id,
        }
        : {
          'number': x.id,
          'Fiscal Year Name': x.yearNameA,
          'Fiscal Year': x.yearNo,
          'Start Date': formattedStartDate,
          'End Date': formattedEndDate,
          'Active': x.isActive,
          'Closed': x.isClosed,
        };
      return row;
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelRows, { header: headers });
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

    if (isArabic) {
      head = [[' مغلقه', 'نشط', 'تاريخ النهاية', ' تاريخ البداية', ' السنه الماليه', ' اسم السنه', 'الرقم']]
    }
    else {
      head = [['number', 'Fiscal Year Name', 'Fiscal Year', 'Start Date', 'End Date', 'Active', 'Closed']]
    }

    const rows: (number | string)[][] = [];

    this.data.forEach((part) => {

      const date1 = new Date(part.startDate);
      const formattedstartDate = `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      const date2 = new Date(part.endDate);
      const formattedDate = `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.yearNameA
      temp[2] = part.yearNo
      temp[3] = formattedstartDate
      temp[4] = formattedDate
      temp[5] = part.isActive
      temp[6] = part.isClosed

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    })

    const pdf = new jsPDF('l', 'pt', 'a4');
    if (isArabic) {
      pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
      pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      pdf.setFont('Amiri');
    } else {
      pdf.setFont('helvetica');
    }
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "قائمة السنوات المالية ";
    }
    else {
      Title = "Fiscal Years List  ";
    }

    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: {
        font: isArabic ? 'Amiri' : 'helvetica',
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: isArabic ? 'Amiri' : 'helvetica',
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }

  CloseYear(row: any) {
    let title = this.translateService.instant('CloseYearForm');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ClosefiscalyearComponent, {
      width: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title,
        companyid: this.jwtAuth.getCompanyId(),
        userid: this.jwtAuth.getUserId(),
        year: row.yearNameA,
        id: row.id,
        GetFiscalYearListFromParent: () => { this.getFiscalYearsList() },

      }
    });
  }

  openYear(id: number) {
    this.fiscalyearService.OpenYear(id).subscribe(result => {
      if (result) {
        this.alert.SaveSuccess();
        this.getFiscalYearsList();
      }
      else {
        this.alert.SaveFaild()
      }
    })
  }
}
