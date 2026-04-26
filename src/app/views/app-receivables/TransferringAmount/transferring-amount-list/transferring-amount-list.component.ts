import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { TransferringAmountService } from '../transferring-amount.service';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-transferring-amount-list',
  templateUrl: './transferring-amount-list.component.html',
  styleUrl: './transferring-amount-list.component.scss'
})
export class TransferringAmountListComponent {
  public TitlePage: string;
  showLoader: boolean;
  exportData: any[];
  screenId: number = 277;
  custom: boolean;
  exportColumns: any[];
  DepreciationList: any;
  tabelData: any[];
  data: any[];
  Lang: string;


  constructor(
    private title: Title,
    private translateService: TranslateService,
    private router: Router,
    private TransferringAmountService: TransferringAmountService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,    
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetTransferringAmountList();
  }

  GetTransferringAmountList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.TransferringAmountService.getTransferringAmountList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }

        this.DepreciationList = result;

        if (currentLang == "ar") {
          this.refresTransferringAmountArabic(this.DepreciationList);
        }
        else {
          this.refreshTransferringAmountEnglish(this.DepreciationList);
        }

        this.showLoader = false;
      })
    });
  }

  AddNew(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.router.navigate(['/TransferringAmount/TransferringAmountForm']);
  }

  openTransferringAmountDetails(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['/TransferringAmount/TransferringAmountForm']);
  }

  EditTransferringAmount(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['/TransferringAmount/TransferringAmountForm']);
  }

  DeleteTransferringAmount(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.TransferringAmountService.deleteTransferringAmount(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetTransferringAmountList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  Attachment(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 56 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('TransferringAmountList');
    this.title.setTitle(this.TitlePage);
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

  refresTransferringAmountArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.voucherNo,
        'تاريخ السند': voucherDate,
        'من الطالب  ': x.fromTheStudentName,
        'الى الطالب ': x.toTheStudentName,
        'المبلغ': x.amount,
      }
    });
  }

  refreshTransferringAmountEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'voucher No': x.voucherNo,
        'Voucher Date': voucherDate,
        'From The Student': x.fromTheStudentName,
        'To The Student': x.toTheStudentName,
        'The Amount': x.amount,
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
       head = [[' المبلغ', 'الى الطالب', ' من الطالب ', 'تاريخ السند ', 'رقم السند']]
    }
    else {
       head = [['The Amount', 'To The Student', 'From The Student', 'Voucher Date', 'voucher No']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {
      const date = new Date(part.voucherDate);

      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = voucherDate
      temp[2] = part.fromTheStudentName
      temp[3] = part.toTheStudentName
      temp[4] = part.amount

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "سند تحويل مبلغ" : "Transferring Amount List" ;
    const pageWidth = pdf.internal.pageSize.width;
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

  PrintTransferringAmount(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptTransferringAmountAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptTransferringAmountEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
