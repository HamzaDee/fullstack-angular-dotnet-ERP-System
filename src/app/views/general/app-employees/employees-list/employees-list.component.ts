import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmployeesService } from '../employees.service';
import { EmployeeFormComponent } from './employees-form/employees-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-paymentDeliveryTerms-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss']
})
export class EmployeesListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 58;
  custom: boolean;
  data: any[];
  exportData: any[];
  CompanyName: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private employeesService: EmployeesService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.CompanyName = window.localStorage.getItem('companyName');
    this.SetTitlePage();
    this.GetEmployeeList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('EmployeesList');
    this.title.setTitle(this.TitlePage);
  }

  GetEmployeeList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.employeesService.GetEmployeesList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresEmployeesListArabic(this.tabelData);
        }
        else {
          this.refreshEmployeesListEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }
  //shoud add permission
  DeleteEmployee(id: any) {
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
        this.employeesService.DeleteEmployee(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetEmployeeList();
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

  OpenEmployeeFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('NEWEMPLOYEE') : this.translateService.instant('MODIFYEMPLOYEE');
    let dialogRef: MatDialogRef<any> = this.dialog.open(EmployeeFormComponent, {
      width: '920px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        GetEmployeeListFromParent: () => { this.GetEmployeeList() }
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

  refresEmployeesListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'الرقم': x.number,
      'الاسم- انجليزي': x.nameE,
      'الاسم- عربي ': x.nameA,
      'الرقم الخلوي ': x.tel1,
      'البريد الالكتروني': x.email,
      'نشط': x.isActive,
    }));
  }

  refreshEmployeesListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Number': x.number,
      'English Name': x.nameE,
      'Arabic Name': x.nameA,
      'Mobile Number': x.tel1,
      'Email': x.email,
      'Active': x.isActive,
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
       head = [[' نشط', 'البريد الالكتروني', 'الرقم الخلوي', 'الاسم - عربي', 'الاسم - انجليزي', 'الرقم']]
    }
    else {
       head = [['Active', 'Email', 'Mobile Number', 'Arabic Name', 'English Name', 'Number']]
    }

    const rows: (number | string)[][] = [];
    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.nameE
      temp[2] = part.nameA
      temp[3] = part.tel1
      temp[4] = part.email
      temp[5] = part.isActive

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
      Title = "قائمة المندوبين";
    }
    else {
      Title = "Representative";
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

  UpdateHrEmp() {
    this.employeesService.UpdateHrEmp().subscribe(result => {
      if (result.isSuccess == true) {
        this.alert.UpdateSuccess();
        this.GetEmployeeList();
      }
      else {
        this.alert.UpdateFaild();
      }
    })
  }

}
