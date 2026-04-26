import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import * as FileSaver from 'file-saver';
import { TaxFormComponent } from './tax-form/tax-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { TaxService } from '../tax.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-tax-list',
  templateUrl: './tax-list.component.html',
  styleUrls: ['./tax-list.component.scss']
})
export class TaxListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 20;
  custom: boolean;
  data: any[];
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private alert: sweetalert,
    private taxService: TaxService,
    private readonly serv: AppCommonserviceService,
  ) {
  }
  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAllTaxList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('TaxList');
    this.title.setTitle(this.TitlePage);
  }

  GetAllTaxList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.taxService.GetTaxList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }

        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresTaxListArabic(this.tabelData);
        }
        else {
          this.refreshTaxListEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteTax(id: any) {
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
        this.taxService.DeleteTax(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetAllTaxList();
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
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenTaxFormPopUp(id: InputNumber, isNew?) {
    let title = isNew ? this.translateService.instant('NEWTAX') : this.translateService.instant('MODIFYTAX');
    let dialogRef: MatDialogRef<any> = this.dialog.open(TaxFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew, companyid: this.jwtAuth.getCompanyId(),
        GetAllTaxList: () => { this.GetAllTaxList() }
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
    let dialogRef: MatDialogRef<any> = this.dialog.open(TaxFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, companyid: this.jwtAuth.getCompanyId(),
        GetAllTaxList: () => { this.GetAllTaxList() }
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

  refresTaxListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'الرقم': x.number,
      'الاسم': x.taxName,
      'اسم الحساب': x.accountName,
      'نوع الضريبة ': x.taxTypeName,
      'نسبة الضريبة': x.taxPercentage,
    }));
  }

  refreshTaxListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.number,
      'Name': x.taxName,
      'Account Name': x.accountName,
      'Tax Type': x.taxTypeName,
      'Tax Percentage': x.taxPercentage,
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
       head = [['نسبة الضريبة', 'نوع الضريبة', 'اسم الحساب', 'الاسم ', 'الرقم']]
    }
    else {
       head = [['Tax Percentage', 'Tax Type', 'Account Name', ' Name', 'Number']]
    }

    const rows: (number | string)[][] = [];

    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.taxName
      temp[2] = part.accountName
      temp[3] = part.taxTypeName
      temp[4] = part.taxPercentage

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
      Title = "قائمة الضرائب      ";
    }
    else {
      Title = " Tax List ";
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
