import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PurchaseReportService } from '../purchase-report.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { sweetalert } from 'sweetalert';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-purchase-expenses-statement',
  templateUrl: './purchase-expenses-statement.component.html',
  styleUrls: ['./purchase-expenses-statement.component.scss']
})
export class PurchaseExpensesStatementComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 206;
  custom: boolean;
  PurchaseExpensesStatementReportForm: FormGroup;
  public Data: any[];
  public currencyList: any;
  decimalPlaces: number;
  public ExpensesTypesList: any;
  public ItemsList: any;
  public SuppliersList: any;
  public TypesList: any;
  public StoreList: any;
  exportData: any[];
  loading: boolean;
  public TotalAmount: number = 0;
  currenciesList: any;
  TotalAmountCurrency: number = 0;
  currencyName: any = '';

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
    this.PurchaseExpensesStatementReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      itemId: [0],
      supplierId: [0],
      categoryId: [0],
      storeId: [0],
      type: [1],
      invoiceType: [0],
      expensesId: [0],
      currencyId: [0],
      currRate: [0],
      currencyName: [''],
    });

    this.GetPurchaseExpensesStatementInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PurchaseExpensesStatement');
    this.title.setTitle(this.TitlePage);
  }

  GetPurchaseExpensesStatementInitialForm() {
    debugger
    this.purchaseReportService.GetPurchaseExpensesStatementReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.ExpensesTypesList = result.expensesTypesList;
      this.ItemsList = result.itemsList;
      this.SuppliersList = result.suppliersList;
      this.TypesList = result.typesList;
      this.StoreList = result.storeList;
      this.currenciesList = result.currencyList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.PurchaseExpensesStatementReportForm.get('fromDate').setValue(result.fromDate);
      this.PurchaseExpensesStatementReportForm.get('toDate').setValue(result.toDate);
      this.PurchaseExpensesStatementReportForm.patchValue(result);
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    const formValues = this.PurchaseExpensesStatementReportForm.value;
    const currencyIdToSend = Number(formValues.currencyId) > 0 ? Number(formValues.currencyId) : 1;
    const currRateToSend = Number(formValues.currRate) > 0 ? Number(formValues.currRate) : 1;

    this.purchaseReportService.GetFilterPurchaseExpenses(
      formValues.fromDate,
      formValues.toDate,
      formValues.expensesId,
      formValues.itemId,
      formValues.supplierId,
      formValues.categoryId,
      formValues.storeId,
      currencyIdToSend,
      currRateToSend
    ).subscribe((result: any) => {
      debugger;

      const rows = Array.isArray(result) ? result : (result ? [result] : []);
      const selectedRate = Number(this.PurchaseExpensesStatementReportForm.get('currRate')?.value) || 1;



      this.Data = rows;


      if (currentLang == "ar") {
        this.refreshPurchaseExpensesStatementArabic(this.Data);
      } else {
        this.refreshPurchaseExpensesStatementEnglish(this.Data);
      }

      this.TotalAmount = 0;
      this.TotalAmountCurrency = 0;

      for (const row of this.Data) {
        const v1 = Number(row?.expensesAmount ?? 0);
        const v2 = Number(row?.currencyAmount ?? 0);

        if (!isNaN(v1)) this.TotalAmount += v1;
        if (!isNaN(v2)) this.TotalAmountCurrency += v2;
      }
    });

  }

  clearFormData() {
    debugger
    this.Data = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.PurchaseExpensesStatementReportForm.get('fromDate').setValue(currentDate);
    this.PurchaseExpensesStatementReportForm.get('toDate').setValue(currentDate);
    this.PurchaseExpensesStatementReportForm.get('itemId').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('supplierId').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('categoryId').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('storeId').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('type').setValue(1);
    this.PurchaseExpensesStatementReportForm.get('invoiceType').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('expensesId').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('currencyId').setValue(0);
    this.PurchaseExpensesStatementReportForm.get('currRate').setValue(0);
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

  refreshPurchaseExpensesStatementArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const invoiceDate = new Date(x.invoiceDate).toLocaleDateString('ar-EG');
      const expensesDate = new Date(x.expensesDate).toLocaleDateString('ar-EG');
      return {
        'رقم المورد': x.customerNumber,
        'اسم المورد ': x.customerName,
        'رقم الفاتورة': x.invoiceNumber,
        'تاريخ الفاتورة': invoiceDate,
        'رقم المصروف': x.expensesNumber,
        'اسم المصروف': x.expensesName,
        'تاريخ المصروف': expensesDate,
        'قيمة المصروف': x.expensesAmount,
        ' ملاحظه': x.note,
        ' العملة': x.currName,
        'الإجمالي بالعملة': x.currencyAmount,
      }
    });
  }

  refreshPurchaseExpensesStatementEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const invoiceDate = new Date(x.invoiceDate).toLocaleDateString('en-GB');
      const expensesDate = new Date(x.expensesDate).toLocaleDateString('en-GB');
      return {
        'Supplier Number': x.customerNumber,
        'Supplier Name': x.customerName,
        'Invoice Number': x.invoiceNumber,
        'Invoice Date': invoiceDate,
        'Expense Number': x.expensesNumber,
        'Expense Name': x.expensesName,
        'Expense Date': expensesDate,
        'Expense Value': x.expensesAmount,
        ' Note': x.note,
        'Total in currency': x.currencyAmount,
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

      const totalAmount = this.Data.reduce((sum, item) => sum + (Number(item.currencyAmount) || 0), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'الإجمالي بالعملة';
      const totalHeaderEnglish = 'Total in currency';
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
       head = [[`الإجمالي بالعملة ${this.currencyName || ''}`, 'ملاحظه ', 'قيمة المصروف', 'تاريخ المصروف', 'اسم المصروف', 'رقم المصروف', 'تاريخ الفاتورة', 'رقم الفاتورة', 'اسم المورد', 'رقم المورد']]
    }
    else {
       head = [[`Total in currency ${this.currencyName || ''}`, ' Note', 'Expense Value', 'Expense Date', 'Expense Name', 'Expense Number', 'Invoice Date', 'Invoice Number', 'Supplier Name', 'Supplier  Number']]
    }
    const rows: (number | string)[][] = [];
    let totalAmountCurrency = 0;

    this.Data.forEach((part) => {

      const date = new Date(part.invoiceDate);
      const invoiceDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;


      const date1 = new Date(part.expensesDate);
      const expensesDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.customerNumber,
        temp[1] = part.customerName,
        temp[2] = part.invoiceNumber,
        temp[3] = invoiceDate,
        temp[4] = part.expensesNumber,
        temp[5] = part.expensesName,
        temp[6] = expensesDate,
        temp[7] = part.expensesAmount,
        temp[8] = part.note,
        temp[9] = part.currencyAmount;

      totalAmountCurrency += Number(part.currencyAmount || 0); // Accumulate total (make sure amount is a number)
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
      footRow[6] = "المجموع";
      footRow[7] = this.formatCurrency(totalAmountCurrency);
      foot = [footRow.reverse()];
    }
    else {
      footRow[6] = "Total";
      footRow[7] = this.formatCurrency(totalAmountCurrency);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف مصاريف المشتريات" : "Purchase Expenses Statement";
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

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  detailsPurchaseExpenses(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;

    let url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
        this.PurchaseExpensesStatementReportForm.get("currRate")?.setValue(Number(curr.data1));
        this.PurchaseExpensesStatementReportForm.get("currencyName")?.setValue(curr.text || '');
        this.currencyName = curr.text || '';
        this.GetReport();
      } else {
        this.PurchaseExpensesStatementReportForm.get("currRate")?.setValue(0);
        this.PurchaseExpensesStatementReportForm.get("currencyName")?.setValue('');
        this.currencyName = '';
      }
    } else {
      this.PurchaseExpensesStatementReportForm.get("currRate")?.setValue(0);
      this.PurchaseExpensesStatementReportForm.get("currencyName")?.setValue('');
      this.currencyName = '';
    }
  }

}
