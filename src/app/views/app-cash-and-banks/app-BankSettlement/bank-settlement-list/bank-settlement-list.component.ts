import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { BankSettlmentService } from '../bankSettlment.service';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-bank-settlement-list',
  templateUrl: './bank-settlement-list.component.html',
  styleUrls: ['./bank-settlement-list.component.scss']
})
export class BankSettlementListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 130;
  custom: boolean;
  data: any[];
  Lang: string;

  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private bankSettlmentService: BankSettlmentService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.GetBankSettlementList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('BankSattlmentList');
    this.title.setTitle(this.TitlePage);
  }

  GetBankSettlementList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    this.showLoader = true;
    setTimeout(() => {
      this.bankSettlmentService.GetBankSettlementList().subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresBankSettlementListArabic(this.tabelData);
        }
        else {
          this.refreshBankSettlementListEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });
  }

  PostBankSettlement(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('msgConfirmPost'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.bankSettlmentService.PostBankSettlement(id).subscribe((result) => {
          debugger
          if (result) {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.ShowAlert('PostSuccess', 'success');
              this.GetBankSettlementList();
            }

          }
          else {
            this.alert.SaveFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  DeleteBankSettlement(id: any) {
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
        this.bankSettlmentService.DeleteBankSettlement(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            else {
              this.alert.DeleteSuccess();
              this.GetBankSettlementList();
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

  AddBankSettlementForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['BankSettlement/BankSattlmentForm']);
  }

  OpenBankSettlementForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['BankSettlement/BankSattlmentForm']);
  }

  EditBankSettlementForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['BankSettlement/BankSattlmentForm']);
  }

  CopyBankSettlement(id: any) {

    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['BankSettlement/BankSattlmentForm']);
  }

  ReverseBankSettlement(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Reverse';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['BankSettlement/BankSattlmentForm']);
  }

  AttachmentBankSettlement(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 1 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  refresBankSettlementListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const settlementDate = new Date(x.settlementDate).toLocaleDateString('ar-EG');
      const fromDate = new Date(x.fromDate).toLocaleDateString('ar-EG');
      const toDate = new Date(x.toDate).toLocaleDateString('ar-EG');
      return {
      'رقم التسوية': x.settlementNo,
      'تاريخ التسوية': settlementDate,
      'الفرع': x.branchName,
      ' البنك': x.bankName,
      'من تاريخ': fromDate,
      'الى تاريخ': toDate,
      'ملاحظات': x.note,
      'الحالة': x.statusName,
    }
    });
  }

  refreshBankSettlementListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const settlementDate = new Date(x.settlementDate).toLocaleDateString('ar-EG');
      const fromDate = new Date(x.fromDate).toLocaleDateString('ar-EG');
      const toDate = new Date(x.toDate).toLocaleDateString('ar-EG');
      return {
      'Settlement Number': x.settlementNo,
      'Settlement Date': settlementDate,
      'Branch': x.branchName,
      'Bank': x.bankName,
      'From Date': fromDate,
      'To Date': toDate,
      'Notes': x.note,
      'Status': x.statusName,
    }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
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
       head = [['الحالة', ' ملاحظات', 'الى تاريخ', ' من تاريخ', 'البنك', ' الفرع', ' تاريخ التسوية', ' رقم التسوية']]
    }
    else {
       head = [['Status', 'Notes', 'To Date', 'From Date', ' Bank', ' Branch', 'Settlement Date', 'Settlement Number']]
    }

    const rows: (number | string)[][] = [];

    this.data.forEach(function (part, index) {

      const date1 = new Date(part.settlementDate);
      const settlementDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.fromDate);
      const fromDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      const date3 = new Date(part.toDate);
      const toDate = currentLang === 'ar'
        ? `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`
        : `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.settlementNo
      temp[1] = settlementDate
      temp[2] = part.branchName
      temp[3] = part.bankName
      temp[4] = fromDate
      temp[5] = toDate
      temp[6] = part.note
      temp[7] = part.statusName
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

    let Title = "";
    if (currentLang == "ar") {
      Title = "قائمة التسوية البنكية";
    }
    else {
      Title = "Bank Sattlment List";
    }

    //let Title = "قائمة فاتورة شراء أصل ";
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

  PrinBankSettlement(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptBankSettlementAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptBankSettlementEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
