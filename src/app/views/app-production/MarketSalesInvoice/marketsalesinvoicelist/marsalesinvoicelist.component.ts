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
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { MarketSalesService } from '../marsalesinvoice.service';
import { MarsalesinvoiceadvancesearchComponent } from '../marketSalesInvoiceAdvancedSearch/marsalesinvoiceadvancesearch.component';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-marsalesinvoicelist',
  templateUrl: './marsalesinvoicelist.component.html',
  styleUrl: './marsalesinvoicelist.component.scss'
})
export class MarsalesinvoicelistComponent {
  @ViewChild(MarsalesinvoiceadvancesearchComponent) childSearch: MarsalesinvoiceadvancesearchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 219;
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
    private service: MarketSalesService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private AppEntryvouchersService:AppEntryvouchersService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetPromotionalOrdersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Marsalesinvoicelist');
    this.title.setTitle(this.TitlePage);
  }

  GetPromotionalOrdersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetMarketSalesInvoiceList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }
        this.tabelData = result;
        debugger
        if (currentLang == "ar") {
          this.refresPurchaserequestArabic(this.tabelData);
        }
        else {
          this.refreshPurchaserequestEnglish(this.tabelData);
        }

        this.showLoader = false;
        debugger
        if (this.childSearch && this.tabelData.length > 0) {
          this.childSearch.vagentsList = result[0].advancedSearch.agentsList;
          this.childSearch.vcountryList = result[0].advancedSearch.countiesList;
          this.childSearch.vfromdate = result[0].advancedSearch.fromdate;
          this.childSearch.vtodate = result[0].advancedSearch.todate;
          this.childSearch.billNo = result[0].advancedSearch.billNo;
          this.childSearch.ngOnInit();
        } //else {
        //   console.error('childSearch is not defined!');
        // }  

      })
    });

  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
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
        this.service.DeleteMarketSalesInvoice(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetPromotionalOrdersList();
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

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['MarketSalesInvoice/Marsalesinvoiceform']);
  }

  AddPurRequestForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['MarketSalesInvoice/Marsalesinvoiceform']);
  }

  OpenPurRequestForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['MarketSalesInvoice/Marsalesinvoiceform']);
  }

  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
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
      else {
        this.custom = false;
      }
      debugger
    })
  }

  refresPurchaserequestArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم الفاتورة': x.voucherNo,
        'تاريخ الفاتورة': voucherDate,
        ' الدولة': x.countryName,
        'الوكيل': x.agentName,
        'المجموع': x.amount,
      }
    });
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Bill Number': x.voucherNo,
        'Bill Date': voucherDate,
        'Country': x.countryName,
        'Agent': x.agentName,
        'Total': x.amount,
      }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['المجموع', ' الوكيل', ' الدولة ', ' تاريخ الفاتورة', ' رقم الفاتورة']]
    }
    else {
       head = [['Total', 'Agent', 'Country', ' Bill Date', 'Bill Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    this.data.forEach((part) => {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = voucherDate
      temp[2] = part.countryName
      temp[3] = part.agentName
      temp[4] = part.amount

      totalAmount += part.amount; // Accumulate total (make sure amount is a number)
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

    const Title = currentLang == "ar" ? "قائمة فواتير بيع التسويق" : "Market Sales Invoice List";
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
    if (this.tabelData == undefined)
      return;
    return this.formatCurrency(this.tabelData.reduce((sum, item) => {
      item.amount
      return sum + item.amount;
    }, 0), 3);
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.AppEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
    
  PrinMarsalesinvoice(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptMarsalesinvoiceAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptMarsalesinvoiceEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

}
