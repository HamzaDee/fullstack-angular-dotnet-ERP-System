import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { CurrencyFormComponent } from './currency-form/currency-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { CurrencyService } from '../currency.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-currency-list',
  templateUrl: './currency-list.component.html',
  styleUrls: ['./currency-list.component.scss']
})
export class CurrencyListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 19;
  custom: boolean;
  exportData: any[];


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private alert: sweetalert,
    private currencyService: CurrencyService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetCurrencyList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CurrencyList');
    this.title.setTitle(this.TitlePage);
  }

  GetCurrencyList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.currencyService.GetCurrencyList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refreshCurrencyListTableArabic(this.tabelData);
        }
        else {
          this.refreshCurrencyListTableEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });

  }

  //shoud add permission
  DeleteCurrency(id: any) {
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
        this.currencyService.DeleteCurrency(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetCurrencyList();
          }
          else if (results.isSuccess == false && results.message === "msgRecordHasLinks") {
            {
              this.alert.ShowAlert("msgRecordHasLinks", 'error');
              return;
            }
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else if (results == false) {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenCurrencyFormPopUp(id: InputNumber, isNew?) {
    let title = isNew ? this.translateService.instant('NEWCURRENCY') : this.translateService.instant('MODIFYCURRENCY');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CurrencyFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew, companyid: this.jwtAuth.getCompanyId(),
        GetCurrencyListFromParent: () => { this.GetCurrencyList() }
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

  OpenImportCompaniesFormPopUp(id: InputNumber) {
    let title = this.translateService.instant('ImportCompanies');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CurrencyFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, companyid: this.jwtAuth.getCompanyId(),
        GetCurrencyList: () => { this.GetCurrencyList() }
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

  NavigateGiveGroupPermissionForm(id) {
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.currencyService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.currencyService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refreshCurrencyListTableArabic(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      'الرقم': x.number,
      'الاسم': x.currName,
      'معامل تحويل العملة': x.exchangeRate,
      'الرمز': x.symbol,
      'الخانات العشرية': x.decimalPlaces,
    }));
  }

  refreshCurrencyListTableEnglish(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      'Number': x.number,
      'Name': x.currName,
      'Currency Ratio': x.exchangeRate,
      'Symbol': x.symbol,
      'Decimal Places': x.decimalPlaces,
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['الخانات العشرية ', 'الرمز', 'معامل تحويل العملة', 'الاسم', 'الرقم']]
    }
    else {
       head = [['Decimal Places', ' Symbol', 'Currency Ratio', ' Name', 'Number']]
    }

    const rows: (number | string)[][] = [];

    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.currName
      temp[2] = part.exchangeRate
      temp[3] = part.symbol
      temp[4] = part.decimalPlaces

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.tabelData)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "كشف  قائمة العملات   ";
    }
    else {
      Title = "Currency  List  ";
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
