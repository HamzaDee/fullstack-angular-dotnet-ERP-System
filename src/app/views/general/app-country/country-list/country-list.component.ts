import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { CountryFormComponent } from './country-form/country-form.component';
import { CountryService } from '../country.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 16;
  custom: boolean;
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private countryService: CountryService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) {
  }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetCountyList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CountryList');
    this.title.setTitle(this.TitlePage);
  }

  GetCountyList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.countryService.GetCountriesList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refreshCuntryListTableArabic(this.tabelData);
        }
        else {
          this.refreshCuntryListTableEnglish(this.tabelData);
        }


        this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteCountry(id: any) {
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
        this.countryService.DeleteCountry(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetCountyList();
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

  OpenCountyFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('NewCountry') : this.translateService.instant('MODIFYCOUNTRY');
    let dialogRef: MatDialogRef<any> = this.dialog.open(CountryFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        GetCountyListFromParent: () => { this.GetCountyList() }
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

  refreshCuntryListTableArabic(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      ' الرقم': x.number,
      ' اسم الدولة': x.countryName,
      '  ملاحظات': x.note,
    }));
  }

  refreshCuntryListTableEnglish(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      'Number': x.number,
      'Name': x.countryName,
      'Notes': x.note,

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
       head = [[' ملاحظات', '  اسم الدولة', ' الرقم']]
    }
    else {
       head = [['Notes', ' Name', 'Number']]
    }
    const rows: (number | string)[][] = [];
    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.countryName
      temp[2] = part.note


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
      Title = "كشف  قائمة الدول ";
    }
    else {
      Title = "Countries List  ";
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
