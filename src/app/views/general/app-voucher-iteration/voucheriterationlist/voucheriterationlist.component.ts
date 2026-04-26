import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { VoucherIterationService } from '../voucher-iteration.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { VoucheriterationformComponent } from '../voucheriterationform/voucheriterationform.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-voucheriterationlist',
  templateUrl: './voucheriterationlist.component.html',
  styleUrls: ['./voucheriterationlist.component.scss']
})
export class VoucheriterationlistComponent implements OnInit {
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 127;
  custom: boolean;
  public TitlePage: string;

  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private IterationService: VoucherIterationService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private egretLoader: AppLoaderService,
      private dialog: MatDialog,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetReport();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('voucherIterationList');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    setTimeout(() => {
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.IterationService.GetVoucherIretationList().subscribe((result) => {
        debugger
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.egretLoader.close();
          return;
        }
        this.voucherData = result;

        if (currentLang == "ar") {
          this.refreshEntryvouchersListReportTableArabic(this.voucherData);
        }
        else {
          this.refreshEntryvouchersListReportTableEnglish(this.voucherData);
        }
        this.egretLoader.close();
      });
    });
  }

  refreshEntryvouchersListReportTableArabic(data) {
    this.exportData = data;
    this.exportData = this.voucherData.map(x => {
      const startDate = new Date(x.startDate).toLocaleDateString('ar-EG');
      const endDate = new Date(x.endDate).toLocaleDateString('ar-EG');
      return {
        ' نوع السند ': x.voucherTypeName,
        ' رقم السند': x.voucherNo,
        ' تاريخ البداية': startDate,
        ' تاريخ النهاية': endDate,
        ' عدد مرات التكرار': x.iterationNo,
        '  نوع التكرار - الكل': x.every + ' - ' + x.iterationName,
        ' الحالة': x.statusName,
      }
    });
  }

  refreshEntryvouchersListReportTableEnglish(data) {
    this.exportData = data;
    this.exportData = this.voucherData.map(x => {
    const startDate = new Date(x.startDate).toLocaleDateString('ar-EG');
    const endDate = new Date(x.endDate).toLocaleDateString('ar-EG');
    return {
      'Voucher Type': x.voucherTypeName,
      'Voucher No': x.voucherNo,
      'Start Date': startDate,
      'End Date': endDate,
      'Repeats': x.iterationNo,
      'Iteration Name': x.every + ' - ' + x.iterationName,
      'Status': x.statusName,
      }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Entry vouchers List");
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
       head = [['الحالة', ' نوع التكرار - الكل', 'عدد مرات التكرار', 'تاريخ النهاية ', 'تاريخ البداية', 'رقم السند', 'نوع السند']]
    }
    else {
       head = [['Status', 'Iteration Name', 'Repeats', 'End Date', 'Start Date', 'Voucher No', 'Voucher Type']]
    }

    const rows: (number | string)[][] = [];

    this.voucherData.forEach(function (part, index) {

      const date1 = new Date(part.startDate);
      const startDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.endDate);
      const endDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.voucherTypeName
      temp[1] = part.voucherNo
      temp[2] = startDate
      temp[3] = endDate
      temp[4] = part.iterationNo
      temp[5] = part.every + ' - ' + part.iterationName,
        temp[6] = part.statusName

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.voucherData)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title;
    if (currentLang == "ar") {
      Title = " كشف قائمة السندات المكررة ";
    }
    else {
      Title = "Voucher Iteration List ";
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

  OpenVoucherIretationFormPopUp(id: number, ishidden?) {
    debugger
    let title = ishidden ? this.translateService.instant('VoucherIretation') : this.translateService.instant('VoucherIretation');
    let dialogRef: MatDialogRef<any> = this.dialog.open(VoucheriterationformComponent, {
      height: '820px',
      width: '1500px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, ishidden,
        GetVoucheriterationListFromParent: () => { this.GetReport() }
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

  DeleteVoucherIretationForm(id: any) {
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
        this.IterationService.DeleteVoucherIteration(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.GetReport();
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

  AddVoucherIterationFormPopUp(id: number, ishidden?) {
    debugger
    let title = ishidden ? this.translateService.instant('VoucherIretation') : this.translateService.instant('VoucherIretation');
    let dialogRef: MatDialogRef<any> = this.dialog.open(VoucheriterationformComponent, {
      height: '820px',
      width: '1500px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, ishidden, Add: true,
        GetVoucheriterationListFromParent: () => { this.GetReport() }
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
}
