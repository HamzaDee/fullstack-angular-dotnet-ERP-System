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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { CustomerReportsService } from '../receivablesreports.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { SuppPaymentvoucherService } from 'app/views/app-payables/supplierpaymentvoucher/supplierpaymentvoucher.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-customertransactions',
  templateUrl: './customertransactions.component.html',
  styleUrls: ['./customertransactions.component.scss']
})
export class CustomertransactionsComponent implements OnInit {
  cusTransactionsAddForm: FormGroup;
  selectedcus: any;
  selectedbranch: any;
  vStatusList: any;
  customersList: any;
  userbranchList: any;
  voucherTypeList: any;
  OB: any;
  accVoucherList: any;
  selectedstatus: number;

  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  dealerTypesList: any;
  isDisabled: boolean = true;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  totalFormatted: string = '0';
  supplierNumber: number;
  screenId: number = 116;
  custom: boolean;
  data: any[] = [];
  public TitlePage: string;
  lang: string;
  loading: boolean;
  currenciesList: any;
  isExternalSearch = false;
  defaultStatus : number;
  FromDate : any;

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
      private appCommonserviceService: AppCommonserviceService,
      private supPaymentvoucherService: SuppPaymentvoucherService,
      private router: Router
    ) { }


  ngOnInit(): void {
    debugger
    this.SetTitlePage();

    this.route.queryParams.subscribe((params: Params) => {
      this.supplierNumber = +params['acc'];
    });

    // this.accountNumber = this.routePartsService.GuidToEdit;

    this.GetSupplierTransactionsForm();
    this.GetSupplierTransactionsInitialForm();
    this.getFavouriteStatus(this.screenId);
    // this.SetTitlePage();

  }

  GetSupplierTransactionsForm() {
    debugger
    this.cusTransactionsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      customerId: [0],
      voucherTypeId: [0],
      branchId: [0],
      fromDate: [''],
      toDate: [''],
      note: [""],
      dealerTypeId: [0],
      currencyId: [0],
      currRate: [0],
      voucherStatus: [this.defaultStatus],
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustomerTransactions');
    this.title.setTitle(this.TitlePage);
  }

  // ,[Validators.required, Validators.min(1)]

  GetSupplierTransactionsInitialForm() {
    this.ReportsService.GetCustomerTransactionsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.customersList = result.customersList;
      this.userbranchList = result.branchesList;
      this.voucherTypeList = result.voucherTypeList;
      this.vStatusList = result.statusList;
      this.dealerTypesList = result.dealersTypesList;
      this.currenciesList = result.currenciesList;
      debugger
      this.cusTransactionsAddForm.patchValue(result);
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.FromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      this.cusTransactionsAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedcus = result.customerId;
        this.selectedbranch = result.branchId;
        this.isDisabled = true;

        // this.cusTransactionsAddForm.get("branchId").setValue(result.defaultBranchId);
        debugger
        if (!isNaN(Number(this.supplierNumber)) && Number(this.supplierNumber) !== 0) {
          this.selectedcus = this.supplierNumber;
        }
        this.isPost = 1;
        this.cusTransactionsAddForm.value.post = this.isPost;
        this.defaultStatus = this.vStatusList.find(c => c.data4 == true).id;
        this.cusTransactionsAddForm.get("voucherStatus").setValue(this.defaultStatus);


        debugger
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (this.cusTransactionsAddForm.value.fromDate > this.cusTransactionsAddForm.value.toDate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }
    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      this.cusTransactionsAddForm.value.voucherStatus = this.selectedstatus;

      const formValues = this.cusTransactionsAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = -1;
      }
      if (formValues.note == null || formValues.note == "null") {
        formValues.note = '';
      }
      debugger
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetCustomerTransactions(
        formValues.customerId,
        formValues.voucherTypeId,
        formValues.voucherStatus,
        formValues.branchId,
        formValues.fromDate,
        formValues.toDate,
        formValues.note,
        formValues.dealerTypeId,
        formValues.currencyId,
        formValues.currRate
      ).subscribe((result) => {
        debugger

        this.voucherData = result;
        this.data = result;

        if (result && result.length > 0) {
          this.voucherData = result;
          this.isExternalSearch = true;
        }
        else {
          this.voucherData = this.data;
          this.isExternalSearch = false;;
        }


        if (currentLang == "ar") {
          this.refresCustomertransactionsArabic(this.voucherData);
        }
        else {
          this.refreshCustomertransactionsEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0)
          this.OB = this.voucherData[0].balance;
        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  clearFormData() {
    this.cusTransactionsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetSupplierTransactionsInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.cusTransactionsAddForm.get('fromDate').setValue(this.FromDate);
    this.cusTransactionsAddForm.get('toDate').setValue(currentDate);
    this.clearTotals();
    this.cusTransactionsAddForm.get('customerId').setValue(0);
    this.cusTransactionsAddForm.get('voucherTypeId').setValue(0);
    this.cusTransactionsAddForm.get('voucherStatus').setValue(0);
    this.cusTransactionsAddForm.get('branchId').setValue(0);
    this.cusTransactionsAddForm.get('dealerTypeId').setValue(0);
    this.cusTransactionsAddForm.get('currencyId').setValue(0);
    this.cusTransactionsAddForm.get('currRate').setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;


    for (const row of this.voucherData) {
      const debit = parseFloat(row.amount);

      if (!isNaN(debit)) {
        this.tot1 += debit;
      }


    }
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    debugger


  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot1Formatted = "0";
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

  refresCustomertransactionsArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': voucherDate,
        'العميل': x.dealerName,
        'الفرع': x.branchName,
        'العملة': x.currName,
        'سعر الصرف': x.exchangeRate,
        'المجموع': x.amount,
        'ملاحظه': x.note,
        'طريقه القبض': x.paymentMethod,
        'الحالة': x.statusName,
      }
    });
  }

  refreshCustomertransactionsEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherName,
        'Voucher Date': voucherDate,
        'Customer': x.dealerName,
        'Branch': x.branchName,
        'Currency': x.currName,
        'Exchange Rate': x.exchangeRate,
        'Total': x.amount,
        'Note': x.note,
        'Payment Method': x.paymentMethod,
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

      if (dt.filteredValue) {
        exportSource = dt.filteredValue;
      } else if (this.isExternalSearch) {
        exportSource = this.voucherData;
      } else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresCustomertransactionsArabic(exportSource);
      } else {
        this.refreshCustomertransactionsEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount), 0);
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
      head = [['الحالة', 'طريقه القبض', 'ملاحظه', 'المجموع', ' سعر الصرف', 'العملة', 'الفرع', 'العميل', 'تاريخ السند', 'نوع السند', 'رقم السند']]
    }
    else {
      head = [['Status', 'Payment Method', 'Note', 'Total', 'Exchange Rate', 'Currency', 'Branch', 'Customer', ' Voucher Date', 'Voucher Type', 'Voucher Number']]
    }
    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }


    exportSource.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = voucherDate
      temp[3] = part.dealerName
      temp[4] = part.branchName
      temp[5] = part.currName
      temp[6] = part.exchangeRate
      temp[7] = part.amount
      temp[8] = part.note
      temp[9] = part.paymentMethod
      temp[10] = part.statusName

      totalAmount += part.amount;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
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

    const Title = currentLang == "ar" ? "كشف حركات العملاء" : "Customer Transactions ";
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

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.supPaymentvoucherService.formatCurrency(value, decimalPlaces);
  }

  OpenVoucher(id, categoryId) {
    var url = '';
    var invId = 0;
    debugger;
    switch (categoryId) {
      case 130: // Customer Payment Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomerPaymentVoucher/CustpaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 131: // Customer Receipt Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomerReceiptVoucher/CustRecieptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 132: // Customer Debit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersDebitNote/CustDebitvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 133: // Customer Credit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersCreditNote/CustCreditvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 134: // Customer Service Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesSalesInv/CustServiceSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 101:  //   الأرصدة الأفتتاحية للعملاء  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersOpeningBalance/CustopeningbalanceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      default:
      // Default code if none of the cases match
    }
  }

  PrintVouchers(id, categoryId, voucherTypeId, voucherNo, voucherDate) {
    debugger
    this.lang = this.jwtAuth.getLang();
    switch (categoryId) {
      case 130: // Customer Payment Voucher
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerpaymentvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerpaymentvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 131: // Customer Receipt Voucher
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerReciptvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerReciptvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 132: // Customer Debit Note
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerDebitNoteAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerDebitNoteEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 133: // Customer Credit Note
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerCreditNoteAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerCreditNoteEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 134: // Customer Service Sales Invoice
        if (this.lang == "ar") {
          const reportUrl = `RptCustservicesalesinvAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustservicesalesinvEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 101:  //   الأرصدة الأفتتاحية للعملاء  
        voucherDate = formatDate(voucherDate, "dd-MM-yyyy", "en-US");

        if (this.lang == "ar") {
          const reportUrl = `RptCustomerOpeningBalanceAR?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerOpeningBalanceEN?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;

    }
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
        this.cusTransactionsAddForm.get("currRate").setValue(Number(curr.data1))
      }
      else {
        this.cusTransactionsAddForm.get("currRate").setValue(0);
      }
    }
    else {
      this.cusTransactionsAddForm.get("currRate").setValue(0);
    }
  }
}
