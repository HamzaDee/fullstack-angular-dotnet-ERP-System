import { Component, OnInit, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import { SalesReportsService } from '../salesreoprt.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-taxessreport-list',
  templateUrl: './taxessreport-list.component.html',
  styleUrls: ['./taxessreport-list.component.scss']
})
export class TaxessreportListComponent implements OnInit {

  public TitlePage: string;
  screenId: number = 205;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  taxesList: any;
  voucherTypesList: any;
  currenciesList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  collectiveTax: boolean = false;
  voucherData: any;
  HideTotals: boolean = true;
  //Collective Totals
  salesTax: number = 0;
  RsalesTax: number = 0;
  purchaseTax: number = 0;
  RpurchaseTax: number = 0;
  serviceTax: number = 0;

  salesTaxTotal: string = '0.000';
  rSalesTaxTotal: string = '0.000';
  purchaseTaxTotal: string = '0.000';
  rPurchaseTaxTotal: string = '0.000';
  serviceTaxTotal: string = '0.000';
  PurNetTotal: string = '0.000';
  SalesNetTotal: string = '0.000';
  //
  // Detalied Totals
  billAmount: number = 0;
  taxAmount: number = 0;
  total: number = 0;

  SalesAmountTotal: string = '0.000';
  PurAmountTotal : string = '0.000';
  taxAmountTotal: string = '0.000';
  netTotal: string = '0.000';
  netAmountTotal : string = '0.000';
  //
  dealerTypesList: any;

  constructor(private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private salesRptService: SalesReportsService,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      taxId: [0],
      voucherTypeId: [0],
      categoryId: [0],
      collective: [0],
      currencyId: [0],
      currRate: [0],
      dealerTypeId: [0],
    });

    this.GetTaxReportInitialForm();
    this.SetTitlePage();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesTaxesReportList');
    this.title.setTitle(this.TitlePage);
  }

  GetTaxReportInitialForm() {
    debugger
    this.salesRptService.GetTaxesReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.taxesList = result.taxesList;
      this.voucherTypesList = result.voucherTypesList;
      this.currenciesList = result.currenciesList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.dealerTypesList = result.customerList;

      this.SaleReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.SaleReportForm.get("collective").setValue(0);
        this.SaleReportForm.get("categoryId").setValue(0);
        this.SaleReportForm.get("dealerTypeId").setValue(0);
        this.clearFormData();
      });
    });
  }

  HandelTaxCheckBox(event: any) {
    debugger
    this.voucherData = [];
    this.clearTotals();
    if (event.target.checked) {
      this.collectiveTax = true;
      this.SaleReportForm.get("collective").setValue(1);
    }
    else {
      this.collectiveTax = false;
      this.SaleReportForm.get("collective").setValue(0);
    }
  }

  GetReport() {
    debugger
    this.voucherData = [];
    this.clearTotals();
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

     const formValues = this.SaleReportForm.value;
      if (formValues.voucherTypeId == null) {
        formValues.voucherTypeId = 0;
      }
      if (formValues.categoryId == null) {
        formValues.categoryId = 0;
      }
      if (this.collectiveTax == true) {
        this.SaleReportForm.get("collective").setValue(1);
      }
      else {
        this.SaleReportForm.get("collective").setValue(0);
      }
      if (formValues.collective == null) {
        formValues.collective = 0;
      }

      if (formValues.dealerTypeId == null) {
        formValues.dealerTypeId = 0;
      }


      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      if (this.collectiveTax == true) {
        this.salesRptService.GetCollectiveTaxesReport(
          formValues.fromDate,
          formValues.toDate,
          formValues.taxId,
          formValues.voucherTypeId,
          formValues.collective,
          formValues.currencyId,
          formValues.currRate,
          formValues.dealerTypeId
        ).subscribe((result) => {
          debugger
          this.voucherData = result;

          if (currentLang == "ar") {
            this.refreshTotalItemSaleReportArabic(this.voucherData);
          }
          else {
            this.refreshTotalItemSaleReportEnglish(this.voucherData);
          }

          this.voucherData.forEach(element => {
            element.totalQty = element.totalQty * -1;
            element.totalSales = element.totalSales * -1;
          });


          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        });
      }
      else {
        debugger
        this.salesRptService.GetDetailedTaxesReport(
          formValues.fromDate,
          formValues.toDate,
          formValues.taxId,
          formValues.voucherTypeId,
          formValues.collective,
          formValues.currencyId,
          formValues.currRate,
          formValues.dealerTypeId
        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;


          if (currentLang == "ar") {
            this.refreshItemSaleReportArabicTable(this.voucherData);
          }
          else {
            this.refreshItemSaleReportEnglishTable(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        });
      }

  }

  onVoucherTypeChange(event: any) {
    this.voucherData = [];
    this.clearTotals();
    let selectedValue = event.value;
    console.log('Selected Voucher Type:', selectedValue);
    this.HideTotals = selectedValue <= 0 ? true : false;
    console.log('HideTotals:', this.HideTotals); // Log HideTotals
    this.cdr.detectChanges(); // Manually trigger change detection
  }

  clearFormData() {
    debugger
    this.SaleReportForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
    const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
    this.SaleReportForm.get('fromDate').setValue(dddate);
    this.SaleReportForm.get('toDate').setValue(currentDate);
    this.voucherData = [];
    this.SaleReportForm.get('taxId').setValue(0);
    this.SaleReportForm.get('voucherTypeId').setValue(0);
    this.SaleReportForm.get('collective').setValue(0);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);
    this.collectiveTax = false;
    this.clearTotals();
    this.HideTotals = true;
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  OpenVoucher(id, catId) {
    // alert(catId)
    debugger
    var url = '';
    var invId = 0;
    switch (catId) {
      case 44:   // sales invioce          
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');

        break;
      case 45:   // Return sales invioce     
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;

      case 41: //Return Purchase Invoice
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnPurchaseInvoice/ReturnPurInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 39: //Purchase Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 48:
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesInv/ServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 134:
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesSalesInv/CustServiceSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 127:
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesPurchaseInv/SupplierPurServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      default:
      // Default code if none of the cases match
    }
  }

  updateFavourite(ScreenId: number) {
    this.appCommonserviceService.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
        this.appCommonserviceService.triggerFavouriteRefresh(); // 🔥 THIS is key
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId) {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refreshItemSaleReportArabicTable(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رقم الفاتورة': x.voucherNo,
      'التاريخ': x.voucherDate,
      'نوع السند': x.voucherName,
      'العميل ': x.dealerName,
      'الضريبة': x.taxName,
      'المجموع': x.totall != null ? x.totall.toFixed(3) : '0.000',      
      'قيمة الضريبة': x.taxAmount != null ? x.taxAmount.toFixed(3) : '0.000',
      'قيمة الفاتورة': x.billTotal != null ? x.billTotal.toFixed(3) : '0.000',
      'الملاحظات': x.note,
    }));
  }

  refreshItemSaleReportEnglishTable(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Invoice Number': x.voucherNo,
      'Date': x.voucherDate,
      'Voucher Type': x.voucherName,
      'Client ': x.dealerName,
      'tax': x.taxName,
      'total': x.totall != null ? x.totall.toFixed(3) : '0.000',      
      'Tax Amount': x.taxAmount != null ? x.taxAmount.toFixed(3) : '0.000',
      'Invoice Amount': x.billTotal != null ? x.billTotal.toFixed(3) : '0.000',
      'Notes': x.note,
    }));
  }

  exportExcel1() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      // const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const worksheet = (xlsx.utils.json_to_sheet as any)(this.exportData, { origin: 'A2' });

      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
      const headers1 = Object.keys(this.exportData[0]);
      const lastColLetter = getExcelColumnLetter(headers1.length - 1);
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];

      const totalAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totall), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المجموع';
      const totalHeaderEnglish = 'total';
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
      var labelCell = this.translateService.instant('SalesTaxTotal');
      worksheet['E' + lastRow] = { t: 's', v: labelCell };
      worksheet['F' + lastRow] = { t: 's', v: this.SalesAmountTotal };
      worksheet['G' + lastRow] = { t: 's', v: this.salesTaxTotal };
      worksheet['H' + lastRow] = { t: 's', v: this.SalesNetTotal };
      
      labelCell = this.translateService.instant('PurTaxTotal');
      worksheet['E' + (lastRow+1)] = { t: 's', v: labelCell };
      worksheet['F' + (lastRow+1)] = { t: 's', v: this.PurAmountTotal };
      worksheet['G' + (lastRow+1)] = { t: 's', v: this.purchaseTaxTotal };
      worksheet['H' + (lastRow+1)] = { t: 's', v: this.PurNetTotal };

      labelCell = this.translateService.instant('NetTax');
      worksheet['E' + (lastRow+2)] = { t: 's', v: labelCell };
      worksheet['F' + (lastRow+2)] = { t: 's', v: this.netAmountTotal };
      worksheet['G' + (lastRow+2)] = { t: 's', v: this.taxAmountTotal };
      worksheet['H' + (lastRow+2)] = { t: 's', v: this.netTotal };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow + 2;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile2(excelBuffer, this.TitlePage);
    });
  }

  exportPdf1() {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الملاحظات', 'قيمة الفاتورة ', 'قيمة الضريبة ',  ' المجموع',' الضريبة  ', 'العميل ', 'نوع السند', 'التاريخ ', ' رقم الفاتورة']]
    }
    else {
      head = [['Notes', 'total ', 'Tax Amount', 'Invoice Amount', 'Tax', 'Client', 'Voucher Type', 'Date ', ' Invoice Number']]
    }

    var rows: (number | string)[][] = [];
    let totalAmount = 0;

    this.voucherData.forEach((part) => {
      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo,
        temp[1] = part.voucherDate,
        temp[2] = part.voucherName,
        temp[3] = part.dealerName,
        temp[4] = part.taxName,
        temp[5] = part.totall != null ? part.totall.toFixed(3) : '0.000',        
        temp[6] = part.taxAmount != null ? part.taxAmount.toFixed(3) : '0.000',
        temp[7] = part.billTotal != null ? part.billTotal.toFixed(3) : '0.000',
        temp[8] = part.note,

        totalAmount += parseFloat(part.totall);
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;
    let footRow1: (string | number)[] = new Array(columnCount).fill('');
    footRow1[4] = this.translateService.instant('SalesTaxTotal');
    footRow1[5] = this.SalesAmountTotal;
    footRow1[6] = this.salesTaxTotal;
    footRow1[7] = this.SalesNetTotal;

    // تعريف الصف الثاني: مجموع المشتريات
    let footRow2: (string | number)[] = new Array(columnCount).fill('');
    footRow2[4] = this.translateService.instant('PurTaxTotal');
    footRow2[5] = this.PurAmountTotal;
    footRow2[6] = this.purchaseTaxTotal;
    footRow2[7] = this.PurNetTotal;

    // تعريف الصف الثالث: الصافي
    let footRow3: (string | number)[] = new Array(columnCount).fill('');
    footRow3[4] = this.translateService.instant('NetTax');
    footRow3[5] = this.netAmountTotal;
    footRow3[6] = this.taxAmountTotal;
    footRow3[7] = this.netTotal;

    // ملاحظة هامة جداً: 
    // إذا كان ملفك باللغة العربية (RTL)، استخدم .reverse() لكل صف
    // وجمعهم في مصفوفة واحدة لخاصية foot
    let finalFoot = [
      footRow1.reverse(),
      footRow2.reverse(),
      footRow3.reverse()
    ];

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    // const Title = currentLang == "ar" ? "كشف مبيعات الاصناف " : "Sales Taxes Report";
    const Title = this.translateService.instant(this.TitlePage);
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 20, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: finalFoot,
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

  refreshTotalItemSaleReportArabic(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'نسبة الضريبة': x.taxPercentage,
      'الضريبة': x.taxName,
      'ضريبة فواتير المبيعات': x.salesTax != null ? x.salesTax.toFixed(3) : '0.000',
      'ضريبة مردودات المبيعات ': x.returnSalesTax != null ? x.returnSalesTax.toFixed(3) : '0.000',
      'ضريبة فواتير الشراء ': x.purchaseTax != null ? x.purchaseTax.toFixed(3) : '0.000',
      'ضريبة مردودات الشراء': x.returnPurchaseTax != null ? x.returnPurchaseTax.toFixed(3) : '0.000',
      'ضريبة فواتير الخدمات': x.serviceTax != null ? x.serviceTax.toFixed(3) : '0.000',
    }));
  }

  refreshTotalItemSaleReportEnglish(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Tax Percentage': x.taxPercentage,
      'Tax': x.taxName,
      'Sales Invoices Tax': x.salesTax != null ? x.salesTax.toFixed(3) : '0.000',
      'Return Sales Invoices Tax ': x.returnSalesTax != null ? x.returnSalesTax.toFixed(3) : '0.000',
      'Purchase Invoices Tax': x.purchaseTax != null ? x.purchaseTax.toFixed(3) : '0.000',
      'Return Purchase Invoices Tax': x.returnPurchaseTax != null ? x.returnPurchaseTax.toFixed(3) : '0.000',
      'Service Invoices Tax': x.serviceTax != null ? x.serviceTax.toFixed(3) : '0.000',
    }));
  }

  exportExcel2() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
      const headers1 = Object.keys(this.exportData[0]);
      const lastColLetter = getExcelColumnLetter(headers1.length - 1);
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];

      const totalsalesTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.salesTax?.toString().trim() || "0"), 0);
      const totalreturnSalesTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.returnSalesTax?.toString().trim() || "0"), 0);
      const totalpurchaseTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.purchaseTax?.toString().trim() || "0"), 0);
      const totalreturnPurchaseTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.returnPurchaseTax?.toString().trim() || "0"), 0);
      const totalserviceTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.serviceTax?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'ضريبة فواتير المبيعات': totalsalesTax,
          'ضريبة مردودات المبيعات ': totalreturnSalesTax,
          'ضريبة فواتير الشراء ': totalpurchaseTax,
          'ضريبة مردودات الشراء': totalreturnPurchaseTax,
          'ضريبة فواتير الخدمات': totalserviceTax,
        }
        : {
          'Sales Invoices Tax': totalsalesTax,
          'Return Sales Invoices Tax ': totalreturnSalesTax,
          'Purchase Invoices Tax': totalpurchaseTax,
          'Return Purchase Invoices Tax': totalreturnPurchaseTax,
          'Service Invoices Tax': totalserviceTax,
        };

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

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      headers.forEach((header, index) => {
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile2(excelBuffer, this.TitlePage);
    });
  }

  saveAsExcelFile2(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf2() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [[' ضريبة فواتير الخدمات', 'ضريبة مردودات الشراء ', 'ضريبة فواتير الشراء ', ' ضريبة مردودات المبيعات ', 'ضريبة فواتير المبيعات ', 'الضريبة ', 'نسبة الضريبة']]
    }
    else {
      head = [['Service Invoices Tax', 'Return Purchase Invoices Tax', 'Purchase Invoices Tax', 'Return Sales Invoices Tax  ', 'Sales Invoices Tax', 'Tax', 'Tax Percentage']]
    }

    const rows: (number | string)[][] = [];
    let totalsalesTax = 0;
    let totalreturnSalesTax = 0;
    let TotalpurchaseTax = 0;
    let totalreturnPurchaseTax = 0;
    let TotalserviceTax = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.taxPercentage,
        temp[1] = part.taxName,
        temp[2] = part.salesTax != null ? part.salesTax.toFixed(3) : '0.000',
        temp[3] = part.returnSalesTax != null ? part.returnSalesTax.toFixed(3) : '0.000',
        temp[4] = part.purchaseTax != null ? part.purchaseTax.toFixed(3) : '0.000',
        temp[5] = part.returnPurchaseTax != null ? part.returnPurchaseTax.toFixed(3) : '0.000',
        temp[6] = part.serviceTax != null ? part.serviceTax.toFixed(3) : '0.000',

        totalsalesTax += parseFloat(part.salesTax) || 0;
      totalreturnSalesTax += parseFloat(part.returnSalesTax) || 0;
      TotalpurchaseTax += parseFloat(part.purchaseTax) || 0;
      totalreturnPurchaseTax += parseFloat(part.returnPurchaseTax) || 0;
      TotalserviceTax += parseFloat(part.serviceTax) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[1] = "مجموع ضريبة ";
      footRow[2] = totalsalesTax.toFixed(2);
      footRow[3] = totalreturnSalesTax.toFixed(2);
      footRow[4] = TotalpurchaseTax.toFixed(2);
      footRow[5] = totalreturnPurchaseTax.toFixed(2);
      footRow[6] = TotalserviceTax.toFixed(2);
    } else {
      footRow[1] = "Total";
      footRow[2] = totalsalesTax.toFixed(2);
      footRow[3] = totalreturnSalesTax.toFixed(2);
      footRow[4] = TotalpurchaseTax.toFixed(2);
      footRow[5] = totalreturnPurchaseTax.toFixed(2);
      footRow[6] = TotalserviceTax.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف الضرائب" : "Sales Taxes Report";
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

  calcultevalues() {
    debugger
    if (this.collectiveTax == true) {
      this.salesTax = 0;
      this.RsalesTax = 0;
      this.purchaseTax = 0;
      this.RpurchaseTax = 0;
      this.serviceTax = 0;

      this.salesTaxTotal = '0.000';
      this.rSalesTaxTotal = '0.000';
      this.purchaseTaxTotal = '0.000';
      this.rPurchaseTaxTotal = '0.000';
      this.serviceTaxTotal = '0.000';

      for (let r = 0; r < this.voucherData.length; r++) {
        this.salesTax += Number(this.voucherData[r].salesTax);
        this.RsalesTax += Number(this.voucherData[r].returnSalesTax)
        this.purchaseTax += Number(this.voucherData[r].purchaseTax)
        this.RpurchaseTax += Number(this.voucherData[r].returnPurchaseTax)
        this.serviceTax += Number(this.voucherData[r].serviceTax)
      }
      this.salesTaxTotal = this.appCommonserviceService.formatCurrencyNumber(this.salesTax);
      this.rSalesTaxTotal = this.appCommonserviceService.formatCurrencyNumber(this.RsalesTax);
      this.purchaseTaxTotal = this.appCommonserviceService.formatCurrencyNumber(this.purchaseTax);
      this.rPurchaseTaxTotal = this.appCommonserviceService.formatCurrencyNumber(this.RpurchaseTax);
      this.serviceTaxTotal = this.appCommonserviceService.formatCurrencyNumber(this.serviceTax);

    }
    else {
      this.billAmount = 0;
      this.taxAmount = 0;
      this.total = 0;

      this.SalesAmountTotal = '0.000';
      this.PurAmountTotal = '0.000';
      this.taxAmountTotal = '0.000';
      this.netAmountTotal = '0.000';
      this.netTotal = '0.000';
      enum TaxCategory {
        Sales = 44,
        SalesReturn = 45,
        Purchase = 39,
        PurchaseReturn = 41,
        ServiceInv = 48,
        PurServiceInv = 127,
        SalesServiceInv = 134,
        RetServiceInv = 174
      }
      var s = this.voucherData.reduce((acc, item) => {
        const catId = item.categoryId;

        if (!acc[catId]) {
          acc[catId] = {
            tax: 0,
            total: 0
          };
        }

        acc[catId].tax   += item.taxAmount || 0;
        acc[catId].total += item.totall || 0;

        return acc;
      }, {} as {
        [key: number]: { tax: number; total: number };
      });

      this.salesTaxTotal = this.appCommonserviceService.formatCurrencyNumber((s[TaxCategory.Sales]?.tax || 0) + (s[TaxCategory.SalesServiceInv]?.tax || 0) - (s[TaxCategory.SalesReturn]?.tax || 0) + (s[TaxCategory.ServiceInv]?.tax || 0) - (s[TaxCategory.RetServiceInv]?.tax || 0));
      this.purchaseTaxTotal = this.appCommonserviceService.formatCurrencyNumber((s[TaxCategory.Purchase]?.tax || 0) + (s[TaxCategory.PurServiceInv]?.tax || 0) - (s[TaxCategory.PurchaseReturn]?.tax || 0));
      this.taxAmountTotal = this.appCommonserviceService.formatCurrencyNumber(this.appCommonserviceService.parseAmount(this.salesTaxTotal) - this.appCommonserviceService.parseAmount(this.purchaseTaxTotal));

      this.SalesAmountTotal = this.appCommonserviceService.formatCurrencyNumber((s[TaxCategory.Sales]?.total || 0) + (s[TaxCategory.SalesServiceInv]?.total || 0) - (s[TaxCategory.SalesReturn]?.total || 0) + (s[TaxCategory.ServiceInv]?.total || 0) - (s[TaxCategory.RetServiceInv]?.total || 0) );
      this.PurAmountTotal = this.appCommonserviceService.formatCurrencyNumber((s[TaxCategory.Purchase]?.total || 0) + (s[TaxCategory.PurServiceInv]?.total || 0) - (s[TaxCategory.PurchaseReturn]?.total || 0));
      this.netAmountTotal = this.appCommonserviceService.formatCurrencyNumber(this.appCommonserviceService.parseAmount(this.SalesAmountTotal) - this.appCommonserviceService.parseAmount(this.PurAmountTotal));

      this.SalesNetTotal = this.appCommonserviceService.formatCurrencyNumber(this.appCommonserviceService.parseAmount(this.salesTaxTotal) + this.appCommonserviceService.parseAmount(this.SalesAmountTotal));
      this.PurNetTotal = this.appCommonserviceService.formatCurrencyNumber(this.appCommonserviceService.parseAmount(this.purchaseTaxTotal) + this.appCommonserviceService.parseAmount(this.PurAmountTotal));
      this.netTotal =  this.appCommonserviceService.formatCurrencyNumber(this.appCommonserviceService.parseAmount(this.SalesNetTotal) - this.appCommonserviceService.parseAmount(this.PurNetTotal));
    }
  }



  clearTotals() {
    this.salesTax = 0;
    this.RsalesTax = 0;
    this.purchaseTax = 0;
    this.RpurchaseTax = 0;
    this.serviceTax = 0;
    
    this.SalesAmountTotal = '0.000';
    this.salesTaxTotal = '0.000';
    this.SalesNetTotal = '0.000';

    this.PurAmountTotal = '0.000';
    this.purchaseTaxTotal = '0.000';
    this.PurNetTotal = '0.000';

    this.netAmountTotal = '0.000';
    this.taxAmountTotal = '0.000';
    this.netTotal = '0.000';

    this.rSalesTaxTotal = '0.000';
    
    this.rPurchaseTaxTotal = '0.000';
    this.serviceTaxTotal = '0.000';
    
    this.billAmount = 0;
    this.taxAmount = 0;
    this.total = 0;
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);
      if (curr) {
        this.SaleReportForm.get("currRate")?.setValue(Number(curr.data1))
      }
      else {
        this.SaleReportForm.get("currRate")?.setValue(0);
      }
    }
    else {
      this.SaleReportForm.get("currRate")?.setValue(0);
    }
  }
}


