import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { SalesReportsService } from '../../salesreoprt.service';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-requested-items-report-sales-list',
  templateUrl: './requested-items-report-sales-list.component.html',
  styleUrls: ['./requested-items-report-sales-list.component.scss']
})
export class RequestedItemsReportSalesListComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 181;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  ItemsList: any;
  TypesList: any;
  EmployeeList: any;
  QuantityPurchased: number;
  SoldQty: number;
  SaleValue: number;
  SalesTax: number;
  ReturnValue: number;
  ReturnTax: number;
  SuppliersList: any;
  salesOrderList: any;
  voucherData: any;
  isHidden: boolean = false;
  //totals
  requestedQty: number = 0;
  delieverdQty: number = 0;
  saledQty: number = 0;
  saledTotal: number = 0;
  remainingQty: number = 0;
  netTotalFormatted: string = '0.000';
  //end
  loading: boolean;
  currenciesList: any;


  constructor(private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private SalesRptService: SalesReportsService,
    private appCommonserviceService: AppCommonserviceService
  
  ) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      salesOrderId: [0],
      customerId: [0],
      categoryId: [0],
      itemId: [0],
      represntedId: [0],
      currencyId: [0],
      currRate: [0],
    });

    this.GetRequestedItemsReportInitialForm();
    this.SetTitlePage();
  }

  GetRequestedItemsReportInitialForm() {
    debugger
    this.SalesRptService.GetRequestedItemsReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.SuppliersList = result.suppliersList;
      this.TypesList = result.typesList;
      this.ItemsList = result.itemsList;
      this.EmployeeList = result.employeeList;
      this.currenciesList = result.currencyList;
      this.salesOrderList = result.salesOrderList.map((item) => ({
        label: item.id,
        value: item.note,
      }));

      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.currencyList = result.currencyList;
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
    this.TitlePage = this.translateService.instant('RequestedItemsReportSalesList');
    this.title.setTitle(this.TitlePage);
  }

  GetReport() {
    debugger
    this.voucherData = [];
    this.clearTotals();
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger

      const formValues = this.SaleReportForm.value;

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

      this.SalesRptService.GetRequestedItemsReport(
        formValues.fromDate,
        formValues.toDate,
        formValues.salesOrderId,
        formValues.customerId,
        formValues.categoryId,
        formValues.itemId,
        formValues.represntedId,
        formValues.currencyId,
        formValues.currRate
      ).subscribe((result) => {
        debugger

        this.voucherData = result;
        this.voucherData.forEach(element => {
          if (element.totalAmount == null) {
            element.totalAmount = 0;
          }
        });
        if (currentLang == "ar") {
          this.refreshRequestedItemsReportArabic(this.voucherData);
        }
        else {
          this.refreshRequestedItemsReportEnglish(this.voucherData);
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

  clearFormData() {
    debugger
    this.clearTotals();
    this.SaleReportForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
    const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
    this.SaleReportForm.get('fromDate').setValue(dddate);
    this.SaleReportForm.get('toDate').setValue(currentDate);
    this.Data = []; // Clear the table data
    this.voucherData = [];
    this.SaleReportForm.get('salesOrderId').setValue(0);
    this.SaleReportForm.get('customerId').setValue(0);
    this.SaleReportForm.get('categoryId').setValue(0);
    this.SaleReportForm.get('itemId').setValue(0);
    this.SaleReportForm.get('represntedId').setValue(0);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);
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

  refreshRequestedItemsReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رمز المادة': x.itemId,
        'اسم المادة': x.itemName,
        'رقم الطلب': x.voucherNo,
        'تاريخ  الطلب': voucherDate,
        ' العميل': x.dealerName,
        'المندوب': x.empName,
        'الكمية المطلوبة': x.orderQty,
        'الكمية المستلمة': x.deliveredQty,
        'الكمية المفوترة': x.salesQTy,
        'قيمة الكمية المفوترة': x.totalAmount.toFixed(3),
        'المتبقي': x.remaning,
      }
    });
  }

  refreshRequestedItemsReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'item': x.itemId,
        'item Number': x.itemName,
        'material Name': x.voucherNo,
        'Order Number': voucherDate,
        'Order Date': x.dealerName,
        'Customer': x.empName,
        'Man': x.orderQty,
        'Required Qty': x.deliveredQty,
        'Quantity Received': x.salesQTy,
        'Quantity Received Value': x.totalAmount.toFixed(3),
        'remaining': x.remaning,
      }
    });
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

      const totalAmount = this.Data.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'قيمة الكمية المفوترة';
      const totalHeaderEnglish = 'Quantity Received Value';
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
       head = [['الكمية المتبقية', 'قيمة الكمية المفوترة', 'الكمية المفوترة', 'الكمية المستلمة', 'الكمية المطلوبة,', 'المندوب ', ' العميل', 'تاريخ الطلب', 'رقم الطلب', ' اسم المادة', 'رمز المادة']]
    }
    else {
       head = [['remaining', 'Quantity Received Value', 'Quantity Sales', 'Quantity Received', 'Required Qty', 'Man', 'Customer', 'Order Date', 'Order Number', 'material Name', ' item Number', 'item']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    this.Data.forEach((part) => {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.itemId,
        temp[1] = part.itemName,
        temp[2] = part.voucherNo,
        temp[3] = voucherDate,
        temp[4] = part.dealerName,
        temp[5] = part.empName,
        temp[6] = part.orderQty,
        temp[7] = part.deliveredQty,
        temp[8] = part.salesQTy,
        temp[9] = part.totalAmount.toFixed(3),
        temp[10] = part.remaning,

        totalAmount += parseFloat(part.totalAmount);
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

    const Title = currentLang == "ar" ? "كشف المواد المطلوبة - طلبات البيع " : "Requested Items Report Sales List";
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

  clearTotals() {
    this.requestedQty = 0
    this.delieverdQty = 0
    this.saledQty = 0
    this.saledTotal = 0
    this.remainingQty = 0
    this.netTotalFormatted = '0.000';

  }

  calcultevalues() {
    debugger
    this.requestedQty = 0
    this.delieverdQty = 0
    this.saledQty = 0
    this.saledTotal = 0
    this.remainingQty = 0


    for (let r = 0; r < this.voucherData.length; r++) {
      this.requestedQty += Number(this.voucherData[r].orderQty);
      this.delieverdQty += Number(this.voucherData[r].deliveredQty)
      this.saledQty += Number(this.voucherData[r].salesQTy)
      this.saledTotal += Number(this.voucherData[r].totalAmount)
      this.remainingQty += Number(this.voucherData[r].remaning)
    }
    this.netTotalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.saledTotal);


  }

  OpenForm(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    let url = `/SalesRequest/SalesRequestForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);
      if (curr) {
        this.SaleReportForm.get("currRate").setValue(Number(curr.data1))
      }
      else {
        this.SaleReportForm.get("currRate").setValue(0);
      }
    }
    else {
      this.SaleReportForm.get("currRate").setValue(0);
    }
  }
}

