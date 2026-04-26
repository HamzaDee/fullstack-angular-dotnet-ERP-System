import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AppEntryvouchersService } from '../app-entryvouchers.service';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { VoucheriterationformComponent } from 'app/views/general/app-voucher-iteration/voucheriterationform/voucheriterationform.component';
import { add } from 'date-fns';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-entryvoucherslist',
  templateUrl: './entryvoucherslist.component.html',
  styleUrls: ['./entryvoucherslist.component.scss']
})
export class EntryvoucherslistComponent implements OnInit {
  @ViewChild(AppSearchFormComponent) childSearch: AppSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 35;
  custom: boolean;
  Lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private AppEntryvouchersService: AppEntryvouchersService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private egretLoader: AppLoaderService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetEntryVouchersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('EntryVouchersList');
    this.title.setTitle(this.TitlePage);
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.AppEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  GetEntryVouchersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.AppEntryvouchersService.GetEntryVouchersList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refreshEntryvouchersListReportTableArabic(this.tabelData);
        }
        else {
          this.refreshEntryvouchersListReportTableEnglish(this.tabelData);
        }
        this.showLoader = false;
        debugger

        if (this.childSearch) {
          const currentDate = new Date();
          this.childSearch.vTypeList = result[0].searchCriteriaModel.voucherTypeList2;
          this.childSearch.vStatusList = result[0].searchCriteriaModel.statusList;
          this.childSearch.vBranchList = result[0].searchCriteriaModel.userCompanyBranchList;
          this.childSearch.vcurrencyList = result[0].searchCriteriaModel.currencyModels;
          this.childSearch.vemployeeList = result[0].searchCriteriaModel.employeeModelList;
          this.childSearch.vfromVoucherNo = "";
          this.childSearch.vtoVoucherNo = "";
          this.childSearch.vfromDate = currentDate;
          this.childSearch.vtoDate = currentDate;
          this.childSearch.vnote = "";
          this.childSearch.ngOnInit();
        }

        debugger
      })
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData = result;
      });
    }
  }

  handleSearchResult(result: any) {
    debugger
    // this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.tabelData = result;
  }

  PostEntryVoucher(id: any) {
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
        this.AppEntryvouchersService.PostEntryVoucher(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.ShowAlert('PostSuccess', 'success');
            this.GetEntryVouchersList();
          }
          else {
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.GetEntryVouchersList();
              return;
            }
            this.alert.SaveFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  DeleteVoucher(id: any) {
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
        this.AppEntryvouchersService.DeleteVoucher(id).subscribe((results) => {
          if (results) {
            debugger
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              this.GetEntryVouchersList();
              return;
            }
            this.alert.DeleteSuccess();
            this.GetEntryVouchersList();
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

  OpenDetailsForm(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['EntryVouchers/EntryVoucherForm']);
  }

  AddEntryVoucherForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.router.navigate(['EntryVouchers/EntryVoucherForm']);
  }

  OpenEntryVoucherForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['EntryVouchers/EntryVoucherForm']);
  }

  CopyEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['EntryVouchers/EntryVoucherForm']);
  }

  ReverseEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Reverse';
    this.router.navigate(['EntryVouchers/EntryVoucherForm']);
  }

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
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

  refreshEntryvouchersListReportTableArabic(data) {
    this.exportData = data;
    this.exportData = this.tabelData.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'نوع السند ': x.voucherTypeName,
        'رقم السند': x.voucherNo,
        'تاريخ السند': formattedDate,
        'الفرع': x.branchName,
        'العملة': x.currencyName,
        'سعر الصرف': x.currRate,
        'المجموع': x.amount,
        'ملاحظات': x.note,
        'الحالة': x.statusName,
      }
    });
  }

  refreshEntryvouchersListReportTableEnglish(data) {
    this.exportData = data;
    this.exportData = this.tabelData.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Type': x.voucherTypeName,
        'Voucher No': x.voucherNo,
        'Voucher Date': formattedDate,
        'Branch': x.branchName,
        'Currency': x.currencyName,
        'Exchange Rate': x.currRate,
        'Total': x.amount,
        'Notes': x.note,
        'Status': x.statusName,
      }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.tabelData.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      // const totalAmount = this.tabelData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate , 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المجموع';
      const totalHeaderEnglish = 'Total';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

      function getExcelColumnLetter(colIndex: number): string {
        let dividend = colIndex + 1;
        let columnName = '';
        let modulo;
        while (dividend > 0) {
          modulo = (dividend - 1) % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return columnName;
      }

      const totalColLetter = getExcelColumnLetter(totalColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: totalValue, z: '0.000' };

      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

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

  // 1️⃣ Table headers
  const head = currentLang === 'ar'
    ? [['الحالة', 'ملاحظات', 'المجموع', 'سعر الصرف', 'العملة', 'الفرع', 'تاريخ السند', 'رقم السند', 'نوع السند']]
    : [['Status', 'Notes', 'Total', 'Exchange Rate', 'Currency', 'Branch', 'Voucher Date', 'Voucher No', 'Voucher Type']];

  // 2️⃣ Table rows
  const rows: (number | string)[][] = [];
  const filteredData = this.tabelData.filter(part => part.status != 67);
  const totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);

  this.tabelData.forEach(part => {
    const date = new Date(part.voucherDate);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/` +
      `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
      `${date.getFullYear()}`;

    const temp: (number | string)[] = [
      part.statusName,   // reversed order to match your old temp.reverse()
      part.note,
      (part.amount).toFixed(3),
      part.currRate,
      part.currencyName,
      part.branchName,
      formattedDate,
      part.voucherNo,
      part.voucherTypeName
    ];

    rows.push(temp);
  });

  // 3️⃣ Table footer
  const columnCount = head[0].length;
  const footRow: (string | number)[] = new Array(columnCount).fill('');
  if (currentLang === 'ar') {
    footRow[5] = 'المجموع';
    footRow[6] = totalAmount.toFixed(3);
  } else {
    footRow[5] = 'Total';
    footRow[6] = totalAmount.toFixed(3);
  }
  const foot = [footRow];

  // 4️⃣ Initialize jsPDF
  const pdf = new jsPDF('l', 'pt', 'a4');

  // 5️⃣ Register the font
  pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
  pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  pdf.setFont('Amiri');
  pdf.setFontSize(14);

  // 6️⃣ Title
  const title = currentLang === 'ar' ? 'كشف قائمه سندات القيد': 'Entry Vouchers List';
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.text(title, pageWidth / 2, 30, { align: 'center' });

  // 7️⃣ AutoTable
  autoTable(pdf as any, {
    head: head,
    body: rows,
    foot: foot,
    showFoot: 'lastPage',
    headStyles: {
      font: 'Amiri',
      halign: isArabic ? 'right' : 'left',
      fontSize: 8,
      fontStyle: 'bold',
      textColor: 'black',
      lineWidth: 0.2,
      minCellWidth: 20
    },
    bodyStyles: {
      font: 'Amiri',
      halign: isArabic ? 'right' : 'left',
      fontSize: 8,
      fontStyle: 'normal'
    },
    footStyles: {
      font: 'Amiri',
      halign: isArabic ? 'right' : 'left',
      fontSize: 8,
      fontStyle: 'bold',
      fillColor: [240, 240, 240],
      textColor: 'black'
    },
    theme: 'grid',
  });

  // 8️⃣ Output PDF
  pdf.output('dataurlnewwindow');
}
  // exportPdf() {
  //   var currentLang = this.jwtAuth.getLang();
  //   const isArabic = currentLang === 'ar';
  //   if (currentLang == "ar") {
  //     var head = [['الحالة', 'ملاحظات', 'المجموع', 'سعر الصرف', 'العملة', 'الفرع ', 'تاريخ السند', 'رقم السند', 'نوع السند']]
  //   }
  //   else {
  //     var head = [['Status', 'Notes', 'Total', 'Exchange Rate', 'Currency', 'Branch', 'Voucher Date', 'Voucher No', 'Voucher Type']]
  //   }

  //   var rows: (number | string)[][] = [];
  //   let totalAmount = 0;


  //   const filteredData = this.tabelData.filter(part => part.status != 67);
  //   totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);


  //   this.tabelData.forEach(function (part, index) {

  //     const date = new Date(part.voucherDate);
  //     const formattedDate = currentLang === 'ar'
  //       ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  //       : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

  //     let temp: (number | string)[] = [];
  //     temp[0] = part.voucherTypeName
  //     temp[1] = part.voucherNo
  //     temp[2] = formattedDate
  //     temp[3] = part.branchName
  //     temp[4] = part.currencyName
  //     temp[5] = part.currRate
  //     temp[6] = part.amount
  //     temp[7] = part.note
  //     temp[8] = part.statusName


  //     //totalAmount += part.amount * part.currRate;
  //     if (isArabic) {
  //       temp.reverse();
  //     }
  //     rows.push(temp);
  //   });

  //   const columnCount = head[0].length;
  //   let footRow: (string | number)[] = new Array(columnCount).fill('');
  //   let foot;

  //   if (currentLang == "ar") {
  //     footRow[5] = "المجموع";
  //     footRow[6] = totalAmount.toFixed(3); foot = [footRow.reverse()];
  //   }
  //   else {
  //     footRow[5] = "Total";
  //     footRow[6] = totalAmount.toFixed(3); foot = [footRow.reverse()];
  //   }

  //   const pdf = new jsPDF('l', null, 'a4', true);
  //   pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
  //   pdf.setFont("Amiri");
  //   pdf.setFontSize(14);

  //   const title = currentLang === "ar"
  //     ? "  كشف قائمه سندات القيد  "
  //     : " Entry Vouchers List";

  //   const pageWidth = pdf.internal.pageSize.width;
  //   pdf.text(title, pageWidth / 2, 8, { align: 'center' });

  //   autoTable(pdf as any, {
  //     head: head,
  //     body: rows,
  //     foot: foot,
  //     showFoot: 'lastPage',
  //     headStyles: {
  //       font: "Amiri",
  //       halign: isArabic ? 'right' : 'left',
  //       fontSize: 8,
  //       fontStyle: 'bold',
  //       textColor: "black",
  //       lineWidth: 0.2,
  //       minCellWidth: 20
  //     },
  //     bodyStyles: {
  //       font: "Amiri",
  //       halign: isArabic ? 'right' : 'left',
  //       fontSize: 8,
  //       fontStyle: 'bold'
  //     },
  //     footStyles: {
  //       font: "Amiri",
  //       halign: isArabic ? 'right' : 'left',
  //       fontSize: 8,
  //       fontStyle: 'bold',
  //       fillColor: [240, 240, 240],
  //       textColor: 'black'
  //     },
  //     theme: "grid",
  //   });
  //   pdf.output('dataurlnewwindow')
  // }

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

  OpenVoucherIretationFormPopUp(id: number = 0, voucherTypeName: any, voucherNo: number, ishidden?, Add?) {
    debugger
    let title = ishidden ? this.translateService.instant('VoucherIretation') : this.translateService.instant('VoucherIretation');
    let dialogRef: MatDialogRef<any> = this.dialog.open(VoucheriterationformComponent, {
      height: '885px',
      width: '1500px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { title: title, id: id, voucherName: voucherTypeName, voucherNo: voucherNo, ishidden: ishidden, Add: Add, GetEntryVouchersListParent: () => { this.GetEntryVouchersList() } }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  PrintEntryvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      // const reportUrl = `rptAccountEntryVoucherAR?VId=${voucherId}`;
      // const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      // window.open(url, '_blank');
      const reportUrl = `rptAccountEntryVoucherAR?VId=${voucherId}`;
      const relativeUrl = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } })
      );
      const fullUrl = `${window.location.origin}${relativeUrl}`;
      window.open(fullUrl, '_blank');
    }
    else {
      const reportUrl = `rptEntryVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  CalculateTotal() {
    if (this.tabelData) {
      let data = this.tabelData.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {
        item.amount * item.currRate
        return sum + item.amount * item.currRate;
      }, 0), 3);
    }
  }
}
