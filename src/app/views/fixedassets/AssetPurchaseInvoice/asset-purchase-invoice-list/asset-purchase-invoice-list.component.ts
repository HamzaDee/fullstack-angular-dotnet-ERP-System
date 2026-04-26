import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { AssetPurchaseInvoiceService } from '../asset-purchase-invoice.service';
import * as FileSaver from 'file-saver';
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import { SuppPaymentvoucherService } from 'app/views/app-payables/supplierpaymentvoucher/supplierpaymentvoucher.service';
import Swal from 'sweetalert2';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { AssetPurchaseInvoiceSheetComponent } from '../asset-purchase-invoice-sheet/asset-purchase-invoice-sheet.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe, AssetPurchaseInvoiceSheetComponent],
  selector: 'app-asset-purchase-invoice-list',
  templateUrl: './asset-purchase-invoice-list.component.html',
  styleUrls: ['./asset-purchase-invoice-list.component.scss']
})
export class AssetPurchaseInvoiceListComponent implements OnInit {
  @ViewChild(AppSearchFormComponent) childSearch: AppSearchFormComponent;
  showLoader: boolean;
  BillList: any;
  DateNow: Date = new Date();
  tabelData: any[];
  screenId: number = 99;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  data: any[];
  cols: any[];
  HasPerm: boolean;
  public TitlePage: string;
  Lang: string;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private alert: sweetalert,
    private AssetPurchaseInvoiceService: AssetPurchaseInvoiceService,
    private router: Router,
    private routePartsService: RoutePartsService,
    private datepipe: DatePipe,
    private supPaymentvoucherService: SuppPaymentvoucherService,
    private AssetPurchaseInvoiceSheetComponent: AssetPurchaseInvoiceSheetComponent,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPaymentVoucherList();
    // this.GetAccVouchersHDList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssetPurchaseInvoiceList');
    this.title.setTitle(this.TitlePage);
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  /*   GetAccVouchersHDList() {
      debugger
      this.showLoader = true;
      setTimeout(() => {
        this.AssetPurchaseInvoiceService.getAccVouchersHDList().subscribe(result => {
          debugger
          this.BillList = result;
          this.showLoader = false;
        })
      }, 500);
    } */

  GetPaymentVoucherList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.AssetPurchaseInvoiceService.GetSuppPaymentVoucherList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }

        this.BillList = result;

        if (currentLang == "ar") {
          this.refreshPurchaseInvoiceArabic(this.BillList);
        }
        else {
          this.refreshPurchaseInvoiceEnglish(this.BillList);
        }

        debugger
        this.showLoader = false;
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
        } else {
          console.error('childSearch is not defined!');
        }
      });
    });

    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData = result;
      });
    } else {
      console.error('childSearch is not defined!');
    }
  }


  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceForm']);
  }

  AddNewPurchaseInvoice(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceForm']);
  }

  EditPurchaseInvoice(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceForm']);
  }

  CopyPurchaseInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['AssetPurchaseInvoice/AssetPurchaseInvoiceForm']);
  }

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 12 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }


  DeleteAssetPurchaseInvoice(id: any) {
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
        this.AssetPurchaseInvoiceService.deleteAssetPurchaseInvoice(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetPaymentVoucherList();
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
        this.AssetPurchaseInvoiceService.PostServiceInvoice(id).subscribe((result) => {
          if (result.isSuccess) {
            this.alert.ShowAlert('PostSuccess', 'success');
            this.GetPaymentVoucherList();
          }
          else if (result.isSuccess == false && result.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
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

  Print(id) {
    debugger
    this.AssetPurchaseInvoiceSheetComponent.Print(id);
  }

  handleSearchResult(result: any) {
    debugger
    this.BillList = result;
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.supPaymentvoucherService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.supPaymentvoucherService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refreshPurchaseInvoiceArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
      'نوع الحركة': x.transTypeName,
      'رقم الفاتورة': x.voucherNo,
      'تاريخ الفاتورة': formattedDate,
      'الفرع': x.branchName,
      'العمله': x.currencyName,
      'سعر الصرف': x.currRate,
      'المورد': x.dealerName,
      'المجموع': x.amount,
      'ملاحظات': x.note,
      'الحالة': x.statusName,
    }
    });
  }

  refreshPurchaseInvoiceEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
      'Transaction Type': x.transTypeName,
      'Transaction Number': x.voucherNo,
      'Transaction Date': formattedDate,
      'Branch': x.branchName,
      'Currency': x.currencyName,
      'Exchange Rate': x.currRate,
      'Supplier': x.dealerName,
      'Total': x.amount,
      'Notes': x.note,
      'Status': x.statusName,
    }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.data.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
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

      // احسب رقم آخر صف
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

      // تحديث النطاق
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


  CalculateTotal()
  {
    if(this.BillList){
      let data = this.BillList.filter(r => r.status != 67)
    return this.formatCurrency(data.reduce((sum, item) => {item.amount * item.currRate
      return sum +  item.amount * item.currRate;
  }, 0),3);
}  
  }


  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الحالة', ' ملاحظات', 'المجموع', ' المورد', ' سعر الصرف', 'العمله', ' الفرع', ' تاريخ الحركة', ' رقم الحركة', ' نوع الحركة']];
    } else {
      head = [['Status', 'Notes', 'Total', 'Supplier', 'Exchange Rate', 'Currency', 'Branch', 'Transaction Date', 'Transaction Number', 'Transaction Type']];
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    const filteredData = this.data.filter(part => part.status != 67);
    totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);

    this.data.forEach((part) => {

    const date = new Date(part.voucherDate);
    const formattedDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];

      temp[0] = part.transTypeName;
      temp[1] = part.voucherNo;
      temp[2] = formattedDate;
      temp[3] = part.branchName;
      temp[4] = part.currencyName;
      temp[5] = part.currRate;
      temp[6] = part.dealerName;
      temp[7] = part.amount;
      temp[8] = part.note;
      temp[9] = part.statusName;

      //totalAmount += part.amount * part.currRate; 
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); 
    });


    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); 
    let foot;

    if (currentLang == "ar") {
      footRow[6] = "المجموع";
      footRow[7] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[6] = "Total";
      footRow[7] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة فاتورة شراء أصل " : "Asset Purchase Invoice";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: foot,
      showFoot: 'lastPage',
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }
  
  

  PrintPurchaseAssestInvoice(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptPurchaseAssestInvoiceAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptAssetPurchaseInvoiceEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}


