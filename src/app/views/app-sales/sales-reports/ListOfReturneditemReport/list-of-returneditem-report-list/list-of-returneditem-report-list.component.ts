import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { SalesReportsService } from '../../salesreoprt.service';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-list-of-returneditem-report-list',
  templateUrl: './list-of-returneditem-report-list.component.html',
  styleUrls: ['./list-of-returneditem-report-list.component.scss']
})
export class ListOfReturneditemReportListComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 179;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  TypesList: any;
  SuppliersList: any;
  ItemsList: any;
  EmployeeList: any;
  price: any;
  Total: any;
  voucherData: any;
  isHidden: boolean = false;
  //totals
  qtyTotal: number = 0;
  netTotal: number = 0;
  netTotalFormatted: string = '0.000';
  //end
  loading: boolean;
  currenciesList:any;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private sRepService: SalesReportsService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      customerId: [0],
      categoryId: [0],
      represntedId: [0],
      itemId: [0],
      currencyId:[0],
      currRate:[0],
    });

    this.GetListOfReturneditemReportInitialForm();
    this.SetTitlePage();
    this.clearFormData();
  }

  GetListOfReturneditemReportInitialForm() {
    debugger
    this.sRepService.GetListOfReturneditemReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.SuppliersList = result.suppliersList;
      this.TypesList = result.typesList;
      this.EmployeeList = result.employeeList;
      this.ItemsList = result.itemsList;

      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");

      this.currenciesList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;

      this.SaleReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.clearFormData();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ListOfReturneditemReport');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger
      const formValues = this.SaleReportForm.value;
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.sRepService.GetReturnedSalesInvoiceReport(
        formValues.fromDate,
        formValues.toDate,
        formValues.customerId,
        formValues.categoryId,
        formValues.represntedId,
        formValues.itemId,
        formValues.currencyId,
        formValues.currRate
      ).subscribe((result) => {
        debugger

        this.voucherData = result;

        if (currentLang == "ar") {
          this.RefreshListOfReturneditemArabic(this.voucherData);
        }
        else {
          this.RefreshListOfReturneditemEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0) {
          this.calcultevalues()
          this.egretLoader.close();
        }
        else {
          this.egretLoader.close();
        }

      });
    });
  }

  clearTotals() {
    debugger
    this.qtyTotal = 0
    this.netTotal = 0
    this.netTotalFormatted = '0.000'
  }

  calcultevalues() {
    debugger
    this.qtyTotal = 0
    this.netTotal = 0
    this.netTotalFormatted = '0.000'


    for (let r = 0; r < this.voucherData.length; r++) {
      this.qtyTotal += Number(this.voucherData[r].qty);
      this.netTotal += Number(this.voucherData[r].netTotal)
    }
    this.netTotalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.netTotal);
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
    this.SaleReportForm.get('customerId').setValue(0);
    this.SaleReportForm.get('categoryId').setValue(0);
    this.SaleReportForm.get('represntedId').setValue(0);
    this.SaleReportForm.get('itemId').setValue(0);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);
    this.voucherData = [];
    this.Data = []; // Clear the table data
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
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

  getFavouriteStatus(screenId)
  {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  RefreshListOfReturneditemArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'رمز السند': x.voucherNo,
      'تاريخ السند': x.voucherDate,
      'رمز المادة': x.itemId,
      'اسم المادة': x.itemName,
      'العميل': x.dealerName,
      'المندوب': x.empName,
      'الوحدة': x.unitName,
      'الكمية': x.qty,
      'السعر': x.price.toFixed(3),
      'الاجمالي': x.netTotal.toFixed(3),
      'العملة': x.currName,
      'نسبة  التحويل': x.currRate,
    }));
  }

  RefreshListOfReturneditemEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      ' Voucher Number': x.voucherNo,
      'Voucher Date ': x.voucherDate,
      'item Number': x.itemId,
      'item Name': x.itemName,
      'Customer': x.dealerName,
      'Man': x.empName,
      'Unit': x.unitName,
      'Quantity': x.qty,
      'Price': x.price.toFixed(3),
      'Totals': x.netTotal.toFixed(3),
      'Currency': x.currName,
      'Conversion Ratio': x.currRate,
    }));
  }

  exportExcel() {
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

      const totalAmount = this.Data.reduce((sum, item) => sum + parseFloat(item.netTotal), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'الاجمالي';
      const totalHeaderEnglish = 'Totals';
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

  exportPdf() {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['نسبة التحويل', 'العملة', 'الاجمالي', 'السعر', 'الكمية', 'الوحدة', 'المندوب', 'العميل', 'اسم المادة', 'رمز المادة', 'تاريخ السند', 'رمز السند']]
    }
    else {
       head = [['Conversion Ratio', 'Currency', 'Totals', 'Price', 'Quantity', 'Unit', 'Man', 'Customer', 'item Name', 'item Number', ' Voucher Date', 'Voucher Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    this.Data.forEach((part) => {
      let temp: (number | string)[] = [];
        temp[0] = part.voucherNo,
        temp[1] = part.voucherDate,
        temp[2] = part.itemId,
        temp[3] = part.itemName,
        temp[4] = part.dealerName,
        temp[5] = part.empName,
        temp[6] = part.unitName,
        temp[7] = part.qty,
        temp[8] = part.price.toFixed(3),
        temp[9] = part.netTotal.toFixed(3),
        temp[10] = part.currName,
        temp[11] = part.currRate,

        totalAmount += parseFloat(part.netTotal); 
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); 
    });


    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); 
    let foot;

    if (currentLang == "ar") {
      footRow[8] = "المجموع";
      footRow[9] = totalAmount;
      foot = [footRow.reverse()];
    }
    else {
      footRow[8] = "Total";
      footRow[9] = totalAmount;
      foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف  المواد التي تم ارجاعها " : "List Of Returned item Report";
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

  OpenForm(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    let url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
    window.open(url, '_blank');
  }

  loadLazyOptions(event: any) {
    debugger
    const { first, last } = event;
    

    // Don't replace the full list; copy and fill only the needed range
    if (!this.ItemsList) {
      this.ItemsList = [];
    }

    // Make sure the array is large enough
    while (this.ItemsList.length < last) {
      this.ItemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.ItemsList[i] = this.ItemsList[i];
    }
    this.loading = false;
  }

  onCurrencyChange(value:any)
  {
    debugger;
    if(value > 0)
    {
      let curr = this.currenciesList.find(c => c.id == value);
      if(curr)
      {
        this.SaleReportForm.get("currRate").setValue(Number(curr.data1)) 
      }
      else
      {
        this.SaleReportForm.get("currRate").setValue(0); 
      }
    }
    else
      {
        this.SaleReportForm.get("currRate").setValue(0);
      }
  }
}
