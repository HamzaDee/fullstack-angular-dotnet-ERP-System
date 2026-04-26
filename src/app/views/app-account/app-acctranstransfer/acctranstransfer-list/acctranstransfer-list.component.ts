import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AcctranstransferFormComponent } from '../acctranstransfer-form/acctranstransfer-form.component';
import { AccTransTransferService } from '../acctrantransfer.service';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-acctranstransfer-list',
  templateUrl: './acctranstransfer-list.component.html',
  styleUrls: ['./acctranstransfer-list.component.scss']
})
export class AccTranstransferListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  DateNow : Date = new Date();
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId:number = 51 ;
  custom:boolean;
  data: any[];
  exportData: any[];

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private AccTransTransferService: AccTransTransferService,
    private dialog: MatDialog,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAccTransTransferList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('acctranstransferlist');
    this.title.setTitle(this.TitlePage);
  }

  GetAccTransTransferList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';      
    debugger    
    this.showLoader = true;
    setTimeout(() => {
      this.AccTransTransferService.GetListAccTransTransfer().subscribe(result => {
        if(result.isSuccess == false && result.message =="msNoPermission")
          {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
        this.tabelData = result;

        if(currentLang == "ar"){
          this.refresAccTranstransferArabic(this.tabelData);
         }
         else{
          this.refreshAccTranstransferEnglish(this.tabelData);
         } 

        this.showLoader = false;
      })
    });
  }

  OpenAccTransTransferFormPopUp(id: number, isNew?) {
    let title = isNew ? this.translateService.instant('ConvertFromAccToAcc') : this.translateService.instant('MODIFYPeriodsFiscalYear');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AcctranstransferFormComponent, {
      width: '720px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: {
        title: title, id: id, isNew,
        GetNewAccTransTransferFormParent: () => { this.GetAccTransTransferList() }
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

  refresAccTranstransferArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
      'التاريخ': transDate,
      'من حساب': x.fromAccName,
      'الى حساب': x.toAccName,
      ' المستخدم ': x.userName,
      'نوع السند': x.voucherTypesList[0],
      }
    });
  }

  refreshAccTranstransferEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
      'Date': transDate,
      'From Acc': x.fromAccName,
      'To Acc': x.toAccName,
      'User': x.userName,
      'Voucher Type': x.voucherTypesList[0],
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
       head = [[ 'نوع السند', 'المستخدم','الى الحساب','من حساب ','التاريخ']]
    }
    else {
       head = [['Voucher Type','User','To Acc',' From Acc', 'Date']]
    }

    const rows: (number | string)[][] = [];

    this.tabelData.forEach(function (part, index) {

      const date1 = new Date(part.transDate);
      const transDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = transDate
      temp[1] = part.fromAccName
      temp[2] = part.toAccName
      temp[3] = part.userName
      temp[4] = part.voucherTypesList

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
      Title = " قائمة نقل حركات الحسابات ";
    }
    else {
      Title = "Account Transactions Transfer List  ";
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
