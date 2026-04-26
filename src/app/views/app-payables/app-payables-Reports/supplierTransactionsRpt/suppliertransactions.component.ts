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
import { SupplierReportsService } from '../payablesreports.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { SuppPaymentvoucherService } from '../../supplierpaymentvoucher/supplierpaymentvoucher.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-suppliertransactions',
  templateUrl: './suppliertransactions.component.html',
  styleUrls: ['./suppliertransactions.component.scss']
})
export class SuppliertransactionsComponent implements OnInit {
  supTransactionsAddForm: FormGroup;
  selectedsup: any;
  selectedbranch: any;
  vStatusList: any;
  suppliersList: any;
  userbranchList: any;
  voucherTypeList: any;
  dealerTypesList: any;
  hidden: boolean = true;
  OB: any;
  accVoucherList: any;
  selectedstatus: number;
  statusList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
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
  screenId: number = 115;
  custom: boolean;
  data: any[] = [];
  public TitlePage: string;
  lang: string;
  currenciesList: any;
  isExternalSearch = false;
  FromDate : any;

  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: SupplierReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService,
      private supPaymentvoucherService: SuppPaymentvoucherService,
      private router: Router,
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
    this.supTransactionsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      supplierId: [0],
      voucherTypeId: [0],
      branchId: [0],
      fromDate: [''],
      toDate: [''],
      note: [""],
      dealerTypeId: [0],
      currencyId: [0],
      currRate: [0],
      voucherStatus: [this.selectedstatus],
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SupplierTransactions');
    this.title.setTitle(this.TitlePage);
  }
  // ,[Validators.required, Validators.min(1)]
  GetSupplierTransactionsInitialForm() {
    this.ReportsService.GetSupplierTransactionsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.suppliersList = result.suppliersList;
      this.userbranchList = result.branchesList;
      this.voucherTypeList = result.voucherTypeList;
      this.dealerTypesList = result.dealerTypesList;
      this.vStatusList = result.statusList;
      this.currenciesList = result.currenciesList;
      this.statusList = result.statusList;
      debugger
      this.supTransactionsAddForm.patchValue(result);
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.FromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      this.supTransactionsAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedsup = result.supplierId;
        this.selectedbranch = result.branchId;
        this.isDisabled = true;

        // this.supTransactionsAddForm.get("branchId").setValue(result.defaultBranchId);
        debugger
        if (!isNaN(Number(this.supplierNumber)) && Number(this.supplierNumber) !== 0) {
          this.selectedsup = this.supplierNumber;
        }
        this.selectedstatus = 0;
        this.isPost = 1;
        this.supTransactionsAddForm.value.post = this.isPost;
          var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.supTransactionsAddForm.get('voucherStatus').setValue(defaultStatus);

        debugger
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (this.supTransactionsAddForm.value.fromDate > this.supTransactionsAddForm.value.toDate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }

    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      this.supTransactionsAddForm.value.voucherStatus 
      //= this.selectedstatus;


      const formValues = this.supTransactionsAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = -1;
      }
      if (formValues.note == null || formValues.note == "null") {
        formValues.note = '';
      }
      debugger
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetSupplierTransactions(
        formValues.supplierId,
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
          this.refresSuppliertransactionsArabic(this.voucherData);
        }
        else {
          this.refreshSuppliertransactionsEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0)
          this.OB = this.voucherData[0].balance;
        this.calcultevalues()
        this.egretLoader.close();
      });
      //this.egretLoader.close();
    });
  }

  clearFormData() {
    this.supTransactionsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetSupplierTransactionsInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.supTransactionsAddForm.get('fromDate').setValue(this.FromDate);
    this.supTransactionsAddForm.get('toDate').setValue(currentDate);
    this.clearTotals();
    this.supTransactionsAddForm.get('supplierId').setValue(0);
    this.supTransactionsAddForm.get('branchId').setValue(0);
    this.supTransactionsAddForm.get('voucherTypeId').setValue(0);
    this.supTransactionsAddForm.get('voucherStatus').setValue(0);
    this.supTransactionsAddForm.get('dealerTypeId').setValue(0);
    this.supTransactionsAddForm.get('currencyId').setValue(0);
    this.supTransactionsAddForm.get('currRate').setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot1Formatted = "0";
    this.tot2Formatted = "0";
    this.totalFormatted = "0";

    for (const row of this.voucherData) {
      let value = ((row.debit * row.exchangeRate) - (row.credit * row.exchangeRate)).toString();
      const total = parseFloat(value);

      if (!isNaN(total)) {
        this.total += total;
      }
      let deb = ((row.debit * row.exchangeRate)).toString();
      const debit = parseFloat(deb);
      if (!isNaN(debit)) {
        this.tot1 += debit;
      }
      let cred = ((row.credit * row.exchangeRate)).toString();
      const Credit = parseFloat(cred);
      if (!isNaN(Credit)) {
        this.tot2 += Credit;
      }

      this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1)
      this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2)
      this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
    }
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot1Formatted = "0";
    this.tot2Formatted = "0";
    this.totalFormatted = "0";
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

  refresSuppliertransactionsArabic(data) {
    debugger
    const format = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    this.exportData = data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      const debit = x.debit ?? 0;
      const credit = x.credit ?? 0;
      const rate = x.exchangeRate ?? 1;
      return {
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': formattedDate,
        'المورد': x.dealerName,
        'الفرع': x.branchName,
        'العملة': x.currName,
        'سعر الصرف': x.exchangeRate,
        'مدين عملة الحركة': format(debit),
        'دائن عملة الحركة': format(credit),
        'مدين العملة الرئيسية': format(debit * rate),
        'دائن العملة الرئيسية': format(credit * rate),
        'ملاحظه': x.note,
        'طريقه القبض': x.paymentMethod,
        'الحالة': x.statusName,
      }
    });
  }

  refreshSuppliertransactionsEnglish(data) {
    debugger
    const format = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    this.exportData = data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      const debit = x.debit ?? 0;
      const credit = x.credit ?? 0;
      const rate = x.exchangeRate ?? 1;
      return {
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherName,
        'Voucher Date': formattedDate,
        'Supplier': x.dealerName,
        'Branch': x.branchName,
        'Currency': x.currName,
        'Exchange Rate': x.exchangeRate,
        'Transaction Currency Debit': format(debit),
        'Transaction Currency Credit': format(credit),
        'Main Currency Debit': format(debit * rate),
        'Main Currency Credit': format(credit * rate),
        'Note': x.note,
        'Payment Method': x.paymentMethod,
        'Status': x.statusName,
      }
    });
  }

exportExcel(dt: any) {
  import("xlsx").then(xlsx => {
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
      this.refresSuppliertransactionsArabic(exportSource);
    } else {
      this.refreshSuppliertransactionsEnglish(exportSource);
    }

      const head = currentLang == "ar"
        ? ['الحالة', 'طريقة القبض', 'ملاحظه', 'مدين العملة الرئيسية', 'دائن العملة الرئيسية', 'مدين عملة الحركة', 'دائن عملة الحركة', 'سعر الصرف', 'العملة', 'الفرع', 'المورد', 'تاريخ السند', 'نوع السند', 'رقم السند']
        : ['Status', 'Payment Method', 'Note', 'Main Currency Debit', 'Main Currency Credit', 'Transaction Debit', 'Transaction Credit', 'Exchange Rate', 'Currency', 'Branch', 'Supplier', 'Voucher Date', 'Voucher Type', 'Voucher Number'];

      const rows: (number | string)[][] = [];

    // === المجاميع ===
    let tot1 = 0; 
    let tot2 = 0; 
    let total = 0; 

      const format = (val: number) =>
        val.toLocaleString('en-US', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3
        });

    exportSource.forEach((part) => {
      const date = new Date(part.voucherDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

        const debit = part.debit ?? 0;
        const credit = part.credit ?? 0;
        const rate = part.exchangeRate ?? 1;

        const debitMain = debit * rate;
        const creditMain = credit * rate;

      tot1 += debitMain;
      tot2 += creditMain;
      total += debitMain - creditMain;

        const row: (string | number)[] = [];

        row[0] = part.voucherNo;
        row[1] = part.voucherName;
        row[2] = formattedDate;
        row[3] = part.dealerName;
        row[4] = part.branchName;
        row[5] = part.currName;
        row[6] = format(rate);
        row[7] = format(debit);
        row[8] = format(credit);
        row[9] = format(debitMain);
        row[10] = format(creditMain);
        row[11] = part.note;
        row[12] = part.paymentMethod;
        row[13] = part.statusName;

        rows.push(row.reverse());
      });

    const excelData: (string | number)[][] = [];
    excelData.push(head);      
    excelData.push(...rows);   

    const columnCount = head.length;
    const footRow1 = new Array(columnCount).fill('');
    const footRow2 = new Array(columnCount).fill('');


    if (currentLang == "ar") {

        footRow1[6] = "المجموع"; 
        footRow1[7] = format(tot1);    
        footRow1[8] = format(tot2);    

        footRow2[6] = "المجموع الكلي";
        footRow2[7] = format(total);   
    } else {
        footRow1[6] = "Total";
        footRow1[7] = format(tot1);
        footRow1[8] = format(tot2);

        footRow2[6] = "Total Amount";
        footRow2[7] = format(total);
    }

    excelData.push(footRow1.reverse());
    excelData.push(footRow2.reverse());

    const worksheet = xlsx.utils.aoa_to_sheet(excelData);

    const workbook = {
      Sheets: { 'SupplierTransactions': worksheet },
      SheetNames: ['SupplierTransactions']
    };

      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

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

    const head = currentLang == "ar"
      ? [['الحالة', 'طريقة القبض', 'ملاحظه', 'مدين العملة الرئيسية', 'دائن العملة الرئيسية', 'مدين عملة الحركة', 'دائن عملة الحركة', 'سعر الصرف', 'العملة', 'الفرع', 'المورد', 'تاريخ السند', 'نوع السند', 'رقم السند']]
      : [['Status', 'Payment Method', 'Note', 'Main Currency Debit', 'Main Currency Credit', 'Transaction Debit', 'Transaction Credit', 'Exchange Rate', 'Currency', 'Branch', 'Supplier', 'Voucher Date', 'Voucher Type', 'Voucher Number']];

    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    let totalDebit = 0;
    let totalCredit = 0;
    let totalMainDebit = 0;
    let totalMainCredit = 0;
    let tot1 = 0; // Transaction Debit (مدين عملة الحركة)
    let tot2 = 0; // Transaction Credit (دائن عملة الحركة)
    let total = 0; // الفرق بين المدين والدائن


    const format = (val: number) =>
      val.toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      });
    exportSource.forEach((part) => {
      const date = new Date(part.voucherDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      const temp: (number | string)[] = [];
      const debit = part.debit ?? 0;
      const credit = part.credit ?? 0;
      const rate = part.exchangeRate ?? 1;
      const debitMain = debit * rate;
      const creditMain = credit * rate;

      tot1 += debitMain;
      tot2 += creditMain;
      total += debitMain - creditMain;
      tot1 += debitMain;
      tot2 += creditMain;
      total += debitMain - creditMain;
      totalDebit += debit;
      totalCredit += credit;
      totalMainDebit += debitMain;
      totalMainCredit += creditMain;
      totalDebit += debit;
      totalCredit += credit;
      totalMainDebit += debitMain;
      totalMainCredit += creditMain;

      temp[0] = part.voucherNo;
      temp[1] = part.voucherName;
      temp[2] = formattedDate;
      temp[3] = part.dealerName;
      temp[4] = part.branchName;
      temp[5] = part.currName;
      temp[6] = format(rate);
      temp[7] = format(debit);
      temp[8] = format(credit);
      temp[9] = format(debitMain);
      temp[10] = format(creditMain);
      temp[11] = part.note;
      temp[12] = part.paymentMethod;
      temp[13] = part.statusName;
      temp[0] = part.voucherNo;
      temp[1] = part.voucherName;
      temp[2] = formattedDate;
      temp[3] = part.dealerName;
      temp[4] = part.branchName;
      temp[5] = part.currName;
      temp[6] = format(rate);
      temp[7] = format(debit);
      temp[8] = format(credit);
      temp[9] = format(debitMain);
      temp[10] = format(creditMain);
      temp[11] = part.note;
      temp[12] = part.paymentMethod;
      temp[13] = part.statusName;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    // ==== التذييل (Footer) ====
    const columnCount = head[0].length;
    const footRow1: (string | number)[] = new Array(columnCount).fill('');
    const footRow2: (string | number)[] = new Array(columnCount).fill('');

    if (currentLang == "ar") {
      footRow1[6] = "المجموع";
      footRow1[7] = format(tot1);
      footRow1[8] = format(tot2);

      footRow2[6] = "المجموع الكلي";
      footRow2[7] = format(total);
    } else {
      footRow1[6] = "Total";
      footRow1[7] = format(tot1);
      footRow1[8] = format(tot2);

      footRow2[6] = "Total Amount";
      footRow2[7] = format(total);
    }
     
    const foot = [footRow1.reverse(), footRow2.reverse()];

    // ==== إنشاء PDF ====
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف حركات الموردين" : "Supplier Transactions";
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

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.supPaymentvoucherService.formatCurrency(value, decimalPlaces);
  }

  OpenVoucher(id, categoryId) {
    debugger
    var url = '';
    var invId = 0;
    debugger;
    switch (categoryId) {
      case 18:   // Entry Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/EntryVouchers/EntryVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 55:   // Entry Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/EntryVouchers/EntryVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 19:   // Receipt Voucher        
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReceiptVoucher/Receiptform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 20: // Payment Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/PaymentVoucher/Paymentform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 21:  //Transfer Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/TransferVoucher/TransferVoucherform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 22: //Bank Transfer Voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BankTransfer/BankTransferForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 23: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 24: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 26: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 29: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BeginningCheques/Beginingchequesform?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 30: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BeginningCheques/Beginingchequesform?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 31: //Processing Outgoing Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingOutcomingCheque/ProcoutcheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 32: //Assets Depreciation
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetDepreciation/DepreciationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 34: //Output Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/InventoryVouchers/OutputVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 39: //Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          debugger
          this.routePartsService.GuidToEdit = result;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${result}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 41: //Return Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          debugger
          this.routePartsService.GuidToEdit = result;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnPurchaseInvoice/ReturnPurInvoiceForm?GuidToEdit=${result}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 44: //Sales Invoice    
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          debugger
          this.routePartsService.GuidToEdit = result;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${result}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 45: //Return Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          debugger
          this.routePartsService.GuidToEdit = result;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${result}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
      case 48: //Service  Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesInv/ServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 58: //Opening Balance
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/OpeningBalance/OpeningbalanceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 99: //Assets Purchase Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/AssetPurchaseInvoice/AssetPurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 102: //Assets Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/AssetSalesInvoice/AssetSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 107: //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetOperation/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 108: //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetOperation/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 110: // Disposal Assets
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetOperation/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 125: // Supplier Payment Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierPaymentVoucher/SupppaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 126: // Supplier Receipt Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierReceiptVoucher/SuppReceiptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 127: // Supplier Purchase Service Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesPurchaseInv/SupplierPurServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 128: // Supplier Debit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierDepitNoteVoucher/SuppDebitVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 129: // Supplier Credit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierCreditNoteVoucher/SuppCreditVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
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
      case 100:
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SuppliersOpeningBalance/SuppopeningbalanceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
      case 100:
        if (this.lang == "ar") {
          const reportUrl = `RptSuppliersOpeningBalanceAR?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptSuppliersOpeningBalanceEN?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 125: // Supplier Payment Voucher
        if (this.lang == "ar") {
          const reportUrl = `RptSupplierpaymentvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptSupplierpaymentvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 126: // Supplier Receipt Voucher
        if (this.lang == "ar") {
          const reportUrl = `RptSupplierrecieptvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptSupplierrecieptvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 127: // Supplier Purchase Service Invoice
        if (this.lang == "ar") {
          const reportUrl = `RptSuppservicepurAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptSuppservicepurEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 128: // Supplier Debit Note
        if (this.lang == "ar") {
          const reportUrl = `RptSupplierdebitvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptSupplierdebitvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 129: // Supplier Credit Note
        if (this.lang == "ar") {
          const reportUrl = `RptSupplierCreditvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptSupplierCreditvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;

    }
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);

      if (curr) {
        this.supTransactionsAddForm.get("currRate").setValue(Number(curr.data1));
      }
      else {
        this.supTransactionsAddForm.get("currRate").setValue(0);
      }
    }
    else {
      this.supTransactionsAddForm.get("currRate").setValue(0);
    }
  }
}
