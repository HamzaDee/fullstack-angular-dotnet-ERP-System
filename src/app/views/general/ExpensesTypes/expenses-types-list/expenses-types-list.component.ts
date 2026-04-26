import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ExpensesTypesService } from '../expenses-types.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { ExpensesTypesFormComponent } from '../expenses-types-form/expenses-types-form.component';
import Swal from 'sweetalert2';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-expenses-types-list',
  templateUrl: './expenses-types-list.component.html',
  styleUrls: ['./expenses-types-list.component.scss']
})
export class ExpensesTypesListComponent implements OnInit {
  public Data: any;
  showLoader: boolean;
  screenId: number = 175;
  custom: boolean;
  exportData: any[];
  public TitlePage: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private expensesTypesService: ExpensesTypesService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private readonly serv: AppCommonserviceService,

  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetExpensesTypesList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ExpensesTypesList');
    this.title.setTitle(this.TitlePage);
  }

  GetExpensesTypesList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.expensesTypesService.getExpensesTypesList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.Data = result;
        if (currentLang == "ar") {
          this.refreshExpensesTypesListArabic(this.Data);
        }
        else {
          this.refreshExpensesTypesListEnglish(this.Data);
        } this.showLoader = false;
      });
    });
  }

  DeleteExpensesTypes(id: any) {
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
        this.expensesTypesService.deleteExpensesType(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetExpensesTypesList();
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

  OpenExpensesTypesFormPopUp(id: number, isNew?) {
    debugger
    let title = isNew ? this.translateService.instant('NEWExpensesTypes') : this.translateService.instant('MODIFYExpensesTypes');
    let dialogRef: MatDialogRef<any> = this.dialog.open(ExpensesTypesFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, isNew, GetExpensesTypesList: () => { this.GetExpensesTypesList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  handleSearchResult(result: any) {
    this.Data = result;
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

  refreshExpensesTypesListArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map((x) => ({
      'رقم المصروف': x.number,
      'اسم المصروف ': x.expensesNameA,
      'حساب المدين': x.debitAccountName,
      ' حساب الدائن': x.creaditAccountName,
      ' نشط': x.isActive,
      ' ملاحظات': x.note,

    }));
  }

  refreshExpensesTypesListEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map((x) => ({
      'Expense Number': x.number,
      'Expense Name ': x.expensesNameA,
      'Debit Account': x.debitAccountName,
      'Credit Account': x.creaditAccountName,
      'Active': x.isActive,
      'Note': x.note,
    }));
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, " Expenses Types List", ".xlsx");
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
       head = [['الملاحظات  ', 'نشط ', 'حساب دائن', 'حساب المدين', 'اسم المصروف', 'رقم المصروف']]
    }
    else {
       head = [['Note', 'Active', 'Credit Account', 'Debit Account', 'Expense Name', 'Expense Number']]
    }

    const rows: (number | string)[][] = [];

    this.Data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[1] = part.number;
      temp[2] = part.expensesNameA;
      temp[3] = part.debitAccountName;
      temp[4] = part.creaditAccountName;
      temp[5] = part.isActive;
      temp[6] = part.note;
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
      Title = "قائمة  انواع المصاريف ";
    }
    else {
      Title = "Expenses Types List";
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
