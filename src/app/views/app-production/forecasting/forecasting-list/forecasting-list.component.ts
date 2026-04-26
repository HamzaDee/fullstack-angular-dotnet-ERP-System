import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ForecastingService } from '../forecasting.service';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';
import { ForecastingSheetComponent } from '../forecasting-sheet/forecasting-sheet.component';
import { ProductionSearchFormComponent } from '../../app-productionSearch/production-search-form/production-search-form.component';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe, ForecastingSheetComponent],
  selector: 'app-forecasting-list',
  templateUrl: './forecasting-list.component.html',
  styleUrls: ['./forecasting-list.component.scss']
})
export class ForecastingListComponent implements OnInit {
  @ViewChild(ProductionSearchFormComponent) childSearch: ProductionSearchFormComponent;
  tabelData: any[];
  showLoader: boolean;
  public TitlePage: string;
  Data: any[];
  exportData: any[];
  totalQty: number = 0;
  totalvalue: number = 0;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private ForecastingService: ForecastingService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private forecastingSheetComponent: ForecastingSheetComponent,
    private AppEntryvouchersService: AppEntryvouchersService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetForecastingList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ForecastingList');
    this.title.setTitle(this.TitlePage);
  }

  GetForecastingList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.ForecastingService.GetForecastingList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }
        this.tabelData = result;

        debugger
        if (currentLang == "ar") {
          this.refreshForecastingListArabic(this.tabelData);
        }
        else {
          this.refreshForecastingListEnglish(this.tabelData);
        }

        this.showLoader = false;
        debugger
        if (result.length > 0) {
          if (this.childSearch) {
            this.childSearch.vCountryList = result[0].searchProductionCriteriaModel.countryList;
            this.childSearch.vAgentList = result[0].searchProductionCriteriaModel.agentList;
            this.childSearch.ngOnInit();
          }
        }
      });
    });

    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        debugger
        this.tabelData = result;
      });
    }
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  OpenDetailsForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['Forecasting/ForecastingForm']);
  }

  AddForecastingForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.router.navigate(['Forecasting/ForecastingForm']);
  }
  EditForecastingForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['Forecasting/ForecastingForm']);
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
        this.ForecastingService.DeleteForecasting(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            this.alert.DeleteSuccess();
            this.GetForecastingList();
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

  CopyEntryvoucher(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['Forecasting/ForecastingForm']);
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
          // var newList = this.EntryVoucherAddForm.value.costCenterTranModelList.filter(item => item.index !== rowIndex);
          // newList = [...newList , ...res];
          // this.EntryVoucherAddForm.get("costCenterTranModelList").setValue(newList);
          // If user press cancel
          return;
        }
      })
  }

  refreshForecastingListArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.id,
        'تاريخ السند': transDate,
        'الدولة': x.countryName,
        'الوكيل': x.agentName,
        'مجموع الكميات': x.totalQty,
        'مجموع القيم': x.totalvalue,
        'السنه': x.fYear,
        'ملاحظه': x.note,
      }
    });
  }

  refreshForecastingListEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('en-GB');
      return {
        'Voucher Number': x.id,
        'Voucher Date': transDate,
        'Country': x.countryName,
        'Agent': x.agentName,
        'Total Quantities': x.totalQty,
        'Total Values': x.totalvalue,
        'Period Fiscal Year': x.fYear,
        'Notes': x.note,
      }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.Data.reduce((sum, item) => sum + parseFloat(item.totalvalue), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'مجموع القيم';
      const totalHeaderEnglish = 'Total Values';
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
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar'; 
    let head: string[][];

    if (currentLang == "ar") {
       head = [['ملاحظه', 'السنه', 'مجموع القيم', 'مجموع الكميات', 'الوكيل', 'الدولة', 'تاريخ السند', 'رقم السند']]
    }
    else {
       head = [['Notes', 'Period Fiscal Year', 'Total Values', 'Total Quantities', 'Agent', 'Country', 'Voucher Date', 'Voucher Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    this.Data.forEach((part) => {
      const date = new Date(part.transDate);
      const transDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.id,
        temp[1] = transDate,
        temp[2] = part.countryName,
        temp[3] = part.agentName,
        temp[4] = part.totalQty,
        temp[5] = part.totalvalue,
        temp[6] = part.fYear,
        temp[7] = part.note,

        totalAmount += part.totalvalue; // Accumulate total (make sure amount is a number)
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // reverse to match header order
    });

    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[4] = "المجموع";
      footRow[5] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }
    else {
      footRow[4] = "Total";
      footRow[5] = this.formatCurrency(totalAmount, 3);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة التوقعات" : "Forecasting List ";
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


  Print(id) {
    debugger
    this.forecastingSheetComponent.Print(id);
  }

  ApproveForecasting(id: any) {
    this.ForecastingService.ApproveForcasting(id).subscribe(res => {
      if (res.isSuccess == false && res.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        this.showLoader = false;
        return;
      }
      if (res == true) {
        this.alert.SaveSuccess();
        this.GetForecastingList();
      }
      else {
        this.alert.SaveFaild();
      }


    })
  }

  CalculateTotal() {
    if (this.tabelData == undefined)
      return;
    return this.formatCurrency(this.tabelData.reduce((sum, item) => {
      item.totalvalue
      return sum + item.totalvalue;
    }, 0), 3);
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.AppEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
}
