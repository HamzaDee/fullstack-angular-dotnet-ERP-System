import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute, Params } from '@angular/router';
import { CustomerReportsService } from '../receivablesreports.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-paidbills',
  templateUrl: './paidbills.component.html',
  styleUrls: ['./paidbills.component.scss']
})
export class PaidbillsComponent implements OnInit {
  paidBillsAddForm: FormGroup;
  exportData: any[];
  supplierNumber: number;
  screenId: number = 209;
  voucherData: any;
  customersList: any;
  voucherTypesList: any;
  OB: any;
  total: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  totalFormatted: string = '0';
  custom: boolean;
  data: any[] = [];
  public TitlePage: string;
  loading: boolean;
  dealerTypesList: any;
  currenciesList: any;
  voucherDataOriginal: any[] = [];
  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: CustomerReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService
    ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.route.queryParams.subscribe((params: Params) => {
      this.supplierNumber = +params['acc'];
    });
    this.GetPaidBillsForm();
    this.GetPaidBillsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }


  GetPaidBillsForm() {
    debugger
    this.paidBillsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      customerId: [0, [Validators.required, Validators.min(1)]],
      vouchertypeId: [0],
      fromDate: [''],
      toDate: [''],
      fromVoucher: [''],
      toVoucher: [''],
      dealerTypeId: [0],
      currencyId: [0],
      currRate: [0],
    });
  }

  GetPaidBillsInitialForm() {
    this.ReportsService.GetPaidBillsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.customersList = result.customersList;
      this.voucherTypesList = result.voucherTypeList;
      this.dealerTypesList = result.dealersTypesList;
      this.currenciesList = result.currenciesList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.clearFormData();
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.paidBillsAddForm.get('customerId').setValue(0);
        this.paidBillsAddForm.get('vouchertypeId').setValue(0);
        this.paidBillsAddForm.get('dealerTypeId').setValue(0);
        this.paidBillsAddForm.get('currencyId').setValue(0);
        this.paidBillsAddForm.get('currRate').setValue(0);
      });


    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (this.paidBillsAddForm.value.fromDate > this.paidBillsAddForm.value.toDate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }
    debugger
    if (this.paidBillsAddForm.value.customerId == 0 || this.paidBillsAddForm.value.customerId == null) {
      this.alert.ShowAlert('MsgPleaseInsertCustomer', 'error');
      return;
    }
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      const formValues = this.paidBillsAddForm.value;
      if (formValues.vouchertypeId == null) {
        formValues.vouchertypeId = 0;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetPaidBills(
        formValues.customerId,
        formValues.vouchertypeId,
        formValues.fromDate,
        formValues.toDate,
        formValues.fromVoucher,
        formValues.toVoucher,
        formValues.dealerTypeId,
        formValues.currencyId,
        formValues.currRate
      ).subscribe((result) => {
        debugger

        this.voucherData = result;
        this.voucherDataOriginal = JSON.parse(JSON.stringify(result));
        this.data = result;

        const currentRate = Number(this.paidBillsAddForm.get("currRate")?.value);
        if (currentRate > 0) {
          this.applyCurrencyRate(currentRate);
        } else {
          this.voucherData = [...this.voucherDataOriginal];
        }

        if (currentLang == "ar") {
          this.refresPaidbillsArabic(this.voucherData);
        }
        else {
          this.refreshPaidbillsEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0)
          this.OB = this.voucherData[0].balance;
        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PaidBillsReport');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.paidBillsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data      
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
    const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
    this.paidBillsAddForm.get('fromDate').setValue(dddate);
    this.paidBillsAddForm.get('toDate').setValue(currentDate);
    this.clearTotals();
    this.paidBillsAddForm.get('customerId').setValue(0);
    this.paidBillsAddForm.get('vouchertypeId').setValue(0);
    this.paidBillsAddForm.get('dealerTypeId').setValue(0);
    this.paidBillsAddForm.get('currencyId').setValue(0);
    this.paidBillsAddForm.get('currRate').setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;


    for (const row of this.voucherData) {
      const amount = parseFloat(row.amount);
      const paidAmt = parseFloat(row.paidAmt);
      const remaining = parseFloat(row.remaining);
      if (!isNaN(amount)) {
        this.tot1 += amount;
      }

      if (!isNaN(paidAmt)) {
        this.tot2 += paidAmt;
      }

      if (!isNaN(remaining)) {
        this.total += remaining;
      }
    }

    debugger
    // Format the values with thousand commas
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    // this.formatWithCommas();
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
    // this.formatWithCommas();
    this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
    // this.formatWithCommas();    


  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot1Formatted = "0.000";
    this.tot2Formatted = "0.000";
    this.totalFormatted = "0.000";
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

  refresPaidbillsArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      'رقم القبض': x.receiptNo,
      'تاريخ القبض': x.receiptDate,
      'نوع السند': x.voucherType,
      'رقم الفاتورة': x.billNo,
      'تاريخ الفاتورة': x.billDate,
      'القيمة': x.amount,
      'القيمة المسددة': x.paidAmt,
      'متبقي': x.remaining,
    }));
  }

  refreshPaidbillsEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Reciept Number': x.receiptNo,
      'Reciept Date': x.receiptDate,
      'Voucher Type': x.voucherType,
      'Bill Number ': x.billNo,
      'Bill Date': x.billDate,
      'Amount': x.amount,
      'Total Paid': x.paidAmt,
      'Remaining': x.remaining,
    }));
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
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refresPaidbillsArabic(exportSource);
      } else {
        this.refreshPaidbillsEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const amountHeader = isArabic ? 'القيمة' : 'Amount';
      const paidHeader = isArabic ? 'القيمة المسددة' : 'Total Paid';
      const remainingHeader = isArabic ? 'متبقي' : 'Remaining';
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const totalPaid = this.data.reduce((sum, item) => sum + parseFloat(item.paidAmt || 0), 0);
      const totalRemaining = this.data.reduce((sum, item) => sum + parseFloat(item.remaining || 0), 0);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

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

      const amountIndex = headers.findIndex(h => h.trim() === amountHeader);
      const paidIndex = headers.findIndex(h => h.trim() === paidHeader);
      const remainingIndex = headers.findIndex(h => h.trim() === remainingHeader);

      if (amountIndex !== -1) {
        const colLetter = getExcelColumnLetter(amountIndex);
        worksheet[colLetter + lastRow] = { t: 'n', v: parseFloat(totalAmount.toFixed(2)) };
      }

      if (paidIndex !== -1) {
        const colLetter = getExcelColumnLetter(paidIndex);
        worksheet[colLetter + lastRow] = { t: 'n', v: parseFloat(totalPaid.toFixed(2)) };
      }

      if (remainingIndex !== -1) {
        const colLetter = getExcelColumnLetter(remainingIndex);
        worksheet[colLetter + lastRow] = { t: 'n', v: parseFloat(totalRemaining.toFixed(2)) };
      }

      const labelIndex = Math.min(...[amountIndex, paidIndex, remainingIndex].filter(i => i !== -1));
      if (labelIndex > 0) {
        const labelColLetter = getExcelColumnLetter(labelIndex - 1);
        worksheet[labelColLetter + lastRow] = { t: 's', v: totalLabel };
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
       head = [[' متبقي ', ' اجمالي المبلغ المدفوع', ' القيمة ', 'تاريخ الفاتورة', ' رقم الفاتورة', ' نوع السند', ' تاريخ القبض', ' رقم القبض']]
    }
    else {
       head = [['Remaining', 'Total Paid', 'Amount', 'Bill Date', 'Bill Number', ' Voucher Type', 'Reciept Date', 'Reciept Number']]
    }
    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    let totalamount = 0;
    let totalpaidAmt = 0;
    let totalremaining = 0;

    exportSource.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.receiptNo
      temp[1] = part.receiptDate
      temp[2] = part.voucherType
      temp[3] = part.billNo
      temp[4] = part.billDate
      temp[5] = part.amount
      temp[6] = part.paidAmt
      temp[7] = part.remaining

      totalamount += parseFloat(part.amount) || 0;
      totalpaidAmt += parseFloat(part.paidAmt) || 0;
      totalremaining += parseFloat(part.remaining) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[4] = "المجموع";
      footRow[5] = totalamount.toFixed(2);
      footRow[6] = totalpaidAmt.toFixed(2);
      footRow[7] = totalremaining.toFixed(2);

    } else {
      footRow[4] = "Total";
      footRow[5] = totalamount.toFixed(2);
      footRow[6] = totalpaidAmt.toFixed(2);
      footRow[7] = totalremaining.toFixed(2);
    }

    foot = [footRow.reverse()];


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف الفواتير المسدده" : "Paid Bills Report" ;        
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
    pdf.output('dataurlnewwindow')
  }

  loadLazyCustomerOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.customersList) {
      this.customersList = [];
    }

    // Make sure the array is large enough
    while (this.customersList.length < last) {
      this.customersList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.customersList[i] = this.customersList[i];
    }

    this.loading = false;
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);

      if (curr) {
        this.paidBillsAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.paidBillsAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.paidBillsAddForm.get("currRate").setValue(0);
      this.applyCurrencyRate(0);
      this.calcultevalues();
    }
  }

  applyCurrencyRate(rate: number) {
    if (rate > 0) {
      this.voucherData = this.voucherDataOriginal.map(row => {
        return {
          ...row,
          amount: row.amount / rate,
          paidAmt: row.paidAmt / rate,
          remaining: row.remaining / rate
        };
      });
    } else {
      this.voucherData = [...this.voucherDataOriginal];
    }
  }
}
