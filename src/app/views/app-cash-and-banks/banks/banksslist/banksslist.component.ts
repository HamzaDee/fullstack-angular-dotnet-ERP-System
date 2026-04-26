import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { BankssService } from '../banks.service';
import { BanksformComponent } from '../banksform/banksform.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-banksslist',
  templateUrl: './banksslist.component.html',
  styleUrls: ['./banksslist.component.scss']
})
export class BanksslistComponent implements OnInit {
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 39;
  custom: boolean;
  public TitlePage: string;

  constructor
    ( private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private BankssService: BankssService,
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
    debugger
    this.SetTitlePage();
    this.GetReport();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('banksList');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      

    debugger
    setTimeout(() => {
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.BankssService.GetBanksList().subscribe((result) => {
        debugger
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            this.egretLoader.close();
            return;
          }
        this.voucherData = result;

        if(currentLang == "ar"){
          this.refreshBanksslistReportTableArabic(this.voucherData);
         }
         else{
          this.refreshBanksslistReportTableEnglish(this.voucherData);
         }  

        this.egretLoader.close();
      });
    });
  }

  OpenBanksFormPopUp(id: number, IsNew, ishidden?) {
    let title = ishidden ? this.translateService.instant('Edit/AddBank') : this.translateService.instant('Edit/AddBank');
    let dialogRef: MatDialogRef<any> = this.dialog.open(BanksformComponent, {
      height: '1000',
      width: '1500px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, IsNew, ishidden,
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

  DeleteBank(id: any) {
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
        debugger
        this.BankssService.DeleteBank(id).subscribe((results) => {
          debugger
          if (results.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetReport();
          }
          else if(results.isSuccess == false && results.message =="msNoPermission")
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          else {
            this.alert.DeleteFaildcant();
            // "msgRecordHasLinks",'warning'
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');

  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['نشط','رقم الهاتف','اسم المسؤول','رقم البطاقة الائتمانية', ' رقم حساب البنك ', ' الحساب', '  نوع البنك', ' الاسم']]
    }
    else {
       head = [['Active','Phone Number','Responsible Person','Credit Card Number', 'Bank Account Number ', 'ACCOUNT ', ' Bank Type', 'Name']]
    }

    const rows: (number | string)[][] = [];
    this.voucherData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.bankName
      temp[1] = part.bankTypeName
      temp[2] = part.accountName
      temp[3] = part.accBankNo
      temp[4] = part.creditCardNo
      temp[5] = part.contactPerson
      temp[6] = part.tel
      temp[7] = part.active

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
        
  let Title = "";
  if(currentLang == "ar"){
    Title = " كشف قائمة البنوك و الصناديق ";
  }
  else{
    Title = "banks List";
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

  refreshBanksslistReportTableArabic(data) {
    this.exportData = data;
    this.exportData = this.voucherData.map(x => ({
      ' الاسم ': x.bankName,
      ' نوع البنك': x.bankTypeName,
      ' الحساب': x.accountName,
      ' رقم حساب البنك': x.accBankNo,
      ' رقم البطاقة الائتمانية': x.creditCardNo,
      ' اسم المسؤول': x.contactPerson,
      ' رقم  الهاتف': x.tel,
      ' نشط': x.active,
    }));
  }

  refreshBanksslistReportTableEnglish(data) {
    this.exportData = data;
    this.exportData = this.voucherData.map(x => ({
      'Name': x.bankName,
      'Bank Type': x.bankTypeName,
      'ACCOUNT': x.accountName,
      'Bank Account Number': x.accBankNo,
      'Credit Card Number': x.creditCardNo,
      'Responsible Person': x.contactPerson,
      'Phone Number': x.tel,
      'Active': x.active,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Main System Definitions List");
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
}
