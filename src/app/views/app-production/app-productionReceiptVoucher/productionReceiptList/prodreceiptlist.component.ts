import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import { AppSearchFormComponent } from 'app/views/general/app-searchs/app-search-form/app-search-form.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { error } from 'console';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { ProdReceiptService } from '../prodReceipt.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-prodreceiptlist',
  templateUrl: './prodreceiptlist.component.html',
  styleUrl: './prodreceiptlist.component.scss'
})
export class ProdreceiptlistComponent implements OnInit {
  @ViewChild(AppSearchFormComponent) childSearch: AppSearchFormComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 263;
  voucherTypeEnum = 237;
  custom: boolean;
  data: any[] = [];
  Lang: string;
  isExternalSearch = false;
  constructor(private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private service: ProdReceiptService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private appEntryvouchersService: AppEntryvouchersService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetReceiptItemsVoucherList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
      this.TitlePage = this.translateService.instant('ProdReceiptvoucherlist');
      this.title.setTitle(this.TitlePage);
    }
  
    GetReceiptItemsVoucherList() {
      let currentLang = this.jwtAuth.getLang();
  
      debugger
      this.showLoader = true;
      setTimeout(() => {
        this.service.GetReceiptItemsVoucherList().subscribe(result => {
          debugger
          if (result.isSuccess === false || result.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", "error");
            return
          }
  
          this.tabelData = result;
          this.data = result;

  
          if (currentLang == "ar") {
            this.refreshInvreceiptvoucherArabic(this.tabelData);
          }
          else {
            this.refreshInvreceiptvoucherEnglish(this.tabelData);
          }
  
          this.tabelData.forEach(element => {
            if (element.amount == null) {
              element.amount = 0;
            }
  
          });
          this.showLoader = false;
          debugger
          if (result.length > 0) {
            debugger
            if (this.childSearch) {
              const currentDate = new Date();
              const currentYear = currentDate.getFullYear();
              const firstDayOfYear = new Date(currentYear, 0, 1);
              this.childSearch.vTypeList = result[0].invSearchCriteriaModel.voucherTypeList2;
              this.childSearch.vStatusList = result[0].invSearchCriteriaModel.statusList;
              this.childSearch.vBranchList = result[0].invSearchCriteriaModel.userCompanyBranchList;
              this.childSearch.vcurrencyList = result[0].invSearchCriteriaModel.currencyModels;
              this.childSearch.vemployeeList = result[0].invSearchCriteriaModel.employeeModelList;
              this.childSearch.vfromVoucherNo = "";
              this.childSearch.vtoVoucherNo = "";
              this.childSearch.vfromDate = firstDayOfYear;
              this.childSearch.vtoDate = currentDate;
              this.childSearch.vnote = "";
              this.childSearch.ngOnInit();
            }
          }
        })
      });
      debugger
      if (this.childSearch) {
        this.childSearch.searchResultEvent.subscribe(result => {
          this.tabelData = result;
        });
      } 
    }
  
  handleSearchResult(result: any[] | null) {
    debugger;

    if (result && result.length > 0) {
      this.tabelData = result;
      this.isExternalSearch = true;
    }
    else {
      this.tabelData = this.data;
      this.isExternalSearch = false;;
    }

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang === 'ar') {
      this.refreshInvreceiptvoucherArabic(this.tabelData);
    } else {
      this.refreshInvreceiptvoucherEnglish(this.tabelData);
    }
  }
  
    DeletePurchaseInvoice(Id) {
      debugger
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
          this.service.DeleteReceiptItemsVoucher(Id).subscribe((results) => {
            debugger
            if (results.isSuccess == true) {
              this.alert.DeleteSuccess();
              this.GetReceiptItemsVoucherList();
            }
            else if (results.isSuccess == false && results.message === "msNoPermission") {
              {
                this.alert.ShowAlert("msNoPermission", 'error');
                return;
              }
            }
            else {
              this.alert.ShowAlert(results.message, 'error');
            }
          });
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      })
    }
  
    ShowDetailsOnly(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      this.router.navigate(['ProductionReceipt/ProdReceiptvoucherform']);
    }
  
    AddNewPurchaseInvoice(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Add';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['ProductionReceipt/ProdReceiptvoucherform']);
    }
  
    EditPurchaseInvoice(id: any) {
      this.routePartsService.GuidToEdit = id
      this.routePartsService.Guid2ToEdit = 'Edit';
      this.routePartsService.Guid3ToEdit = false;
      this.router.navigate(['ProductionReceipt/ProdReceiptvoucherform']);
    }
  

  
  AttachmentPurchaseInvoice(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 55 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }
  
  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
  }
  
  updateFavourite(ScreenId: number) {
    debugger
    this.service.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }
  
  getFavouriteStatus(screenId) {
    debugger
    this.service.GetFavouriteStatus(screenId).subscribe(result => {
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
  
  refreshInvreceiptvoucherArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
    return {
      'نوع الاستلام': x.voucherTypeName,
      'رقم الاستلام': x.voucherNo,
      'تاريخ الاستلام': formattedDate,
      'المورد': x.dealerName,
      'الفرع': x.branchName,
      'العملة': x.currencyName,
      'معامل التحويل': x.currRate,
      'المجموع': x.amount,
      'ملاحظات': x.note,
      'الحالة': x.statusName,
        }
    });
  }
  
  refreshInvreceiptvoucherEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
    const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
    return {
      'Receipt Type': x.voucherTypeName,
      'Receipt Number': x.voucherNo,
      'Receipt Date': formattedDate,
      'Supplier': x.dealerName,
      'Branch': x.branchName,
      'Currency': x.currencyName,
      'Exchange Rate': x.currRate,
      'Total': x.amount,
      'Notes': x.note,
      'Status': x.statusName,
    }
    });
  }
  
  exportExcel(dt: any) {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (this.isExternalSearch) {
        exportSource = this.tabelData;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refreshInvreceiptvoucherArabic(exportSource);
      } else {
        this.refreshInvreceiptvoucherEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.data.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

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
  
  exportPdf(dt: any) {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['الحالة', ' ملاحظات', 'المجموع', ' معامل التحويل', 'العمله', ' الفرع', ' المورد', ' تاريخ الاستلام', ' رقم الاستلام', ' نوع الاستلام']]
    }
    else {
       head = [['Status', 'Notes', 'Total', 'Exchange Rate', 'Currency', 'Branch', 'Supplier', ' Receipt Date', 'Receipt Number', 'Receipt Type']]
    }

    const rows: (number | string)[][] = [];


        let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (this.isExternalSearch) {
      exportSource = this.tabelData;
    }
    else {
      exportSource = this.data;
    }

    
    let totalAmount = 0;

      const filteredData = this.data.filter(part => part.status != 67);
      totalAmount = filteredData.reduce((sum, part) => sum + part.amount * part.currRate, 0);
  
      exportSource.forEach((part) => {
  
      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
          ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
          : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherTypeName
      temp[1] = part.voucherNo
      temp[2] = formattedDate
      temp[3] = part.dealerName
      temp[4] = part.branchName
      temp[5] = part.currencyName
      temp[6] = part.currRate
      temp[7] = part.amount
      temp[8] = part.note
      temp[9] = part.statusName

      //totalAmount += part.amount  * part.currRate; 
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

    const Title = currentLang == "ar" ?"قائمة سندات الأستلام " : "Receipt Items Voucher List";
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
    
  CalculateTotal() {
    if (this.tabelData) {
      let data = this.tabelData.filter(r => r.status != 67)
      return this.formatCurrency(data.reduce((sum, item) => {
        item.amount
        return sum + item.amount;
      }, 0), 3);
    }
  }  
  
  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
  
  PrintInvreceiptvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptReceiptItemsVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptReceiptItemsVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
