import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { PrintChequeService } from '../print-cheque.service';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { PrintChequeFormComponent } from '../print-cheque-form/print-cheque-form.component';
import { Router } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

@Component({
  selector: 'app-print-cheque-list',
  templateUrl: './print-cheque-list.component.html',
  styleUrl: './print-cheque-list.component.scss'
})
export class PrintChequeListComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 256;
  custom: boolean;
  exportData: any[];
  Lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private printChequeService: PrintChequeService,
    private dialog: MatDialog,
    private router: Router,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPrintChequeList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PrintChequeList');
    this.title.setTitle(this.TitlePage);
  }

  GetPrintChequeList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;

    this.printChequeService.GetPrintChequeList().subscribe(result => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.tabelData = result;

      if (currentLang == "ar") {
        this.refreshPrintChequeArabic(this.tabelData);
      }
      else {
        this.refreshPrintChequeEnglish(this.tabelData);
      }

      this.showLoader = false;
    })

  }

  DeletePrintCheque(id: any) {
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
        this.printChequeService.deletePrintCheque(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetPrintChequeList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.ShowAlert("msgRecordHasLinks", 'error')
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenPrintChequeFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('NewPrintCheque') : this.translateService.instant('MODIFYPrintCheque');
    let dialogRef: MatDialogRef<any> = this.dialog.open(PrintChequeFormComponent, {
      width: '1000px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        GetPrintChequeListFromParent: () => { this.GetPrintChequeList() }
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

  getFavouriteStatus(screenId) {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refreshPrintChequeArabic(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => {
      const cheqDate = new Date(x.cheqDate).toLocaleDateString('ar-EG');
      return {
        'رقم الشيك': x.chequeNo,
        'تاريخ الشيك': cheqDate,
        'اسم الساحب': x.drawerName,
        'المبلغ': x.amount,
        'ختم الشيك': x.cheqStamp,
      }
    });
  }

  refreshPrintChequeEnglish(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => {
      const cheqDate = new Date(x.cheqDate).toLocaleDateString('ar-EG');
      return {
        'Cheque Number': x.chequeNo,
        'Cheque Date': cheqDate,
        'Drawer Name': x.drawerName,
        'Amount': x.amount,
        'Cheque Stamp': x.cheqStamp,
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
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [['ختم الشيك', 'المبلغ', 'اسم الساحب', 'تاريخ الشيك', 'رقم الشيك']]
    }
    else {
      var head = [['Cheque Stamp', 'Amount', 'Drawer Name', 'Cheque Date', 'Cheque Number']]
    }
    var rows: (number | string)[][] = [];
    this.tabelData.forEach(function (part, index) {

      const date1 = new Date(part.cheqDate);
      const cheqDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.chequeNo
      temp[1] = cheqDate
      temp[2] = part.drawerName
      temp[3] = part.amount
      temp[4] = part.cheqStamp
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.tabelData)

    const pdf = new jsPDF('l', null, 'a4', true);
    pdf.setHeaderFunction
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");

    pdf.setFont("Amiri"); // set font For Title
    pdf.setFontSize(14);  // set font Size  For Title


    let Title;
    if (currentLang == "ar") {
      Title = "قائمة طباعة الشيكات";
    }
    else {
      Title = "Print Cheque List";
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

  PrintPrintCheque(Id, Balance, Fils) {
    debugger
    if (!Fils)
      Fils = 0;
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptPrintChequeAR?Id=${Id}&Balance=${Balance}&Fils=${Fils}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptPrintChequeEN?Id=${Id}&Fils=${Fils}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
