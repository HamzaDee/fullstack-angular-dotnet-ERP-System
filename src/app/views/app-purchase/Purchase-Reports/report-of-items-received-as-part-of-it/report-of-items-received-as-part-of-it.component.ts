import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { PurchaseReportService } from '../purchase-report.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { sweetalert } from 'sweetalert';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-report-of-items-received-as-part-of-it',
  templateUrl: './report-of-items-received-as-part-of-it.component.html',
  styleUrls: ['./report-of-items-received-as-part-of-it.component.scss']
})
export class ReportOfItemsReceivedAsPartOfItComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 201;
  custom: boolean;
  ReportOfItemsReceivedForm: FormGroup;
  public Data: any[];
  public currencyList: any;
  decimalPlaces: number;
  public ItemsList: any;
  public TypesList: any;
  public EmployeeList: any;
  public SuppliersList;
  exportData: any[];
  PurchaseOrderList: any;
  loading: boolean;
  public TotalAmount: number = 0;
  currenciesList: any;

  constructor(
    private title: Title,
    private purchaseReportService: PurchaseReportService,
    private formbulider: FormBuilder,
    private appCommonserviceService: AppCommonserviceService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private alert: sweetalert) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.ReportOfItemsReceivedForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      purchaseOrderNo: [0],
      SupplierId: [0],
      categoryId: [0],
      itemId: [0],
      currencyId: [0],
      currRate: [0],
    });

    this.GetReportOfItemsReceivedInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReportOfItemsReceivedAsPartOfIt');
    this.title.setTitle(this.TitlePage);
  }

  GetReportOfItemsReceivedInitialForm() {
    debugger
    this.purchaseReportService.GetReportOfItemsReceivedReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.SuppliersList = result.suppliersList;
      this.TypesList = result.typesList;
      this.ItemsList = result.itemsList;
      this.EmployeeList = result.employeeList;
      this.currenciesList = result.currencyList;
      this.PurchaseOrderList = result.purchaseOrderList.map((item) => ({
        label: item.id,
        value: item.note,
      }));

      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");

      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;

      this.ReportOfItemsReceivedForm.patchValue(result);
    });
  }

  GetReport() {
    debugger
    this.Data = [];
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    const formValues = this.ReportOfItemsReceivedForm.value;

    this.purchaseReportService.GetReportOfItemsReceivedReport(
      formValues.fromDate,
      formValues.toDate,
      formValues.purchaseOrderNo,
      formValues.SupplierId,
      formValues.categoryId,
      formValues.itemId,
      formValues.currencyId,
      formValues.currRate
    ).subscribe((result) => {
      debugger

      this.Data = result;

      if (currentLang == "ar") {
        this.refreshReportOfItemsReceivedArabic(this.Data);
      }
      else {
        this.refreshReportOfItemsReceivedEnglish(this.Data);
      }

      for (const row of this.Data) {
        const totalValue = parseFloat(row.totalAmount);
        if (!isNaN(totalValue)) {
          this.TotalAmount += totalValue;
        }
      }
    });
  }

  clearFormData() {
    debugger
    this.Data = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.ReportOfItemsReceivedForm.get('fromDate').setValue(currentDate);
    this.ReportOfItemsReceivedForm.get('toDate').setValue(currentDate);
    this.ReportOfItemsReceivedForm.get('purchaseOrderNo').setValue(0);
    this.ReportOfItemsReceivedForm.get('SupplierId').setValue(0);
    this.ReportOfItemsReceivedForm.get('categoryId').setValue(0);
    this.ReportOfItemsReceivedForm.get('itemId').setValue(0);
    this.ReportOfItemsReceivedForm.get('currencyId').setValue(0);
    this.ReportOfItemsReceivedForm.get('currRate').setValue(0);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.purchaseReportService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.purchaseReportService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refreshReportOfItemsReceivedArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      return {
        'رمز المادة': x.itemNumber,
        'اسم المادة': x.itemName,
        'رقم الطلب': x.orderNumber,
        'تاريخ  الطلب': orderDate,
        'المورد': x.dealerName,
        'الكمية المطلوبة': x.requiredQTY,
        'الكمية المستلمة': x.deliveredQty,
        'الكمية المفوترة': x.salesQTy,
        'قيمة الكمية المفوترة': x.totalAmount,
        'المتبقي': x.remaining,
      }
    });
  }

  refreshReportOfItemsReceivedEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('en-GB');
      return {
        'Item Number': x.itemNumber,
        'Item Name': x.itemName,
        'Order Number': x.orderNumber,
        'Order Date': orderDate,
        'Supplier': x.dealerName,
        'Required Qty': x.requiredQTY,
        'Quantity Received': x.deliveredQty,
        'Quantity Sales': x.salesQTy,
        'Quantity Received Value': x.totalAmount,
        'Remaining': x.remaining,
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

      const totalAmount = this.Data.reduce((sum, item) => sum + item.totalAmount, 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'قيمة الكمية المفوترة';
      const totalHeaderEnglish = 'Quantity Received Value';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

      // تحويل فهرس العمود إلى حرف إكسل
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
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      // كلمة "المجموع" أو "Total" في العمود الذي قبل المبلغ
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['المتبقي', 'قيمة الكمية المفوتره', 'الكمية المفوتره', 'الكمية المستلمة', 'الكمية المطلوبة', 'المورد', 'تاريخ الطلب', 'رقم الطلب', 'اسم المادة', 'رمز المادة']]
    }
    else {
       head = [['Remaining', 'Quantity Received Value', 'Quantity Sales', 'Quantity Received', 'Required Qty', 'Supplier', 'Order Date', 'Order Number', 'Item Name', 'Item Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    this.Data.forEach((part) => {

      const date = new Date(part.orderDate);
      const orderDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.itemNumber,
        temp[1] = part.itemName,
        temp[2] = part.orderNumber,
        temp[3] = orderDate,
        temp[4] = part.dealerName,
        temp[5] = part.requiredQTY,
        temp[6] = part.deliveredQty,
        temp[7] = part.salesQTy,
        temp[8] = part.totalAmount,
        temp[9] = part.remaining,

        totalAmount += part.totalAmount; // Accumulate total (make sure amount is a number)
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
      footRow[7] = "المجموع";
      footRow[8] = this.formatCurrency(totalAmount);
      foot = [footRow.reverse()];
    }
    else {
      footRow[7] = "Total";
      footRow[8] = this.formatCurrency(totalAmount);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف المواد المستلم جزء منها - طلبات الشراء " : "Report of Items received as part of it - Purchase Order";
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
        this.ReportOfItemsReceivedForm.get("currRate").setValue(Number(curr.data1))
      }
      else {
        this.ReportOfItemsReceivedForm.get("currRate").setValue(0);
      }
    }
    else {
      this.ReportOfItemsReceivedForm.get("currRate").setValue(0);
    }
  }
}
