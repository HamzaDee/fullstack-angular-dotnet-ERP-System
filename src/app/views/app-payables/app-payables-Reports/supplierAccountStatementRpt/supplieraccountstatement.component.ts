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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-supplieraccountstatement',
  templateUrl: './supplieraccountstatement.component.html',
  styleUrls: ['./supplieraccountstatement.component.scss']
})
export class SupplieraccountstatementComponent implements OnInit {
  suppaccountStatmentAddForm: FormGroup;
  selectedsup: any;
  selectedbranch: any;
  selectedper: any;
  selectedCur: any;
  suppliersList: any;
  userbranchList: any;
  dealerTypesList: any;
  OB: any;
  accVoucherList: any;
  statusList: any;
  defaultStatus : number;
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
  screenId: number = 109;
  custom: boolean;
  data: any[];
  hidden: boolean = true;
  public TitlePage: string;
  lang: string;
  currenciesList: any;
  Lang: string;
  voucherDataOriginal: any[] = [];
  FromDate : any;

  constructor
    (
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
      private title: Title,
      private router: Router,
    ) { }


  ngOnInit(): void {
    debugger
    this.route.queryParams.subscribe((params: Params) => {
      this.supplierNumber = +params['acc'];
    });
    debugger
    this.SetTitlePage();

    this.GetSupplieraccountStatementForm();
    this.GetSupplieraccountStatementInitialForm();
    this.getFavouriteStatus(this.screenId);

  }

  GetSupplieraccountStatementForm() {
    debugger
    this.suppaccountStatmentAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      supplierId: [0, [Validators.required, Validators.min(1)]],
      branchId: [0],
      fromDate: [''],
      toDate: [''],
      dealerTypeId: [0],
      currencyId: [0],
      currRate: [0],
      voucherStatus: [this.defaultStatus],
    });
  }

  GetSupplieraccountStatementInitialForm() {
    this.ReportsService.GetSupplierAccountStatementForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.suppliersList = result.suppliersList;
      this.userbranchList = result.branchesList;
      this.dealerTypesList = result.dealerTypesList;
      this.currenciesList = result.currenciesList;
      this.statusList = result.statusList;
      this.defaultStatus = this.statusList.find(c=> c.data4 == true).id;
      this.suppaccountStatmentAddForm.patchValue(result);
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
     this.FromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")

      this.suppaccountStatmentAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedsup = result.supplierId;
        this.selectedbranch = result.branchId;
        this.isDisabled = true;
        this.suppaccountStatmentAddForm.get("voucherStatus").setValue(this.defaultStatus);
        // this.suppaccountStatmentAddForm.get("branchId").setValue(result.defaultBranchId);
        debugger
        if (!isNaN(Number(this.supplierNumber)) && Number(this.supplierNumber) !== 0) {
          this.selectedsup = this.supplierNumber;
        }
        this.isPost = 1;
        this.suppaccountStatmentAddForm.value.post = this.isPost;


        debugger
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    if (this.suppaccountStatmentAddForm.value.fromDate > this.suppaccountStatmentAddForm.value.toDate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }

    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      const formValues = this.suppaccountStatmentAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetSupplierAccountStatement(
        formValues.supplierId,
        formValues.voucherStatus,
        formValues.branchId,
        formValues.fromDate,
        formValues.toDate,
        formValues.dealerTypeId,
        formValues.currencyId,
        formValues.currRate
      ).subscribe((result) => {
        debugger
        this.voucherDataOriginal = JSON.parse(JSON.stringify(result));
        this.voucherData = result;

        const currentRate = Number(this.suppaccountStatmentAddForm.get("currRate")?.value);

        if (currentRate > 0) {
          this.applyCurrencyRate(currentRate);
        } else {
          this.voucherData = [...this.voucherDataOriginal];
        }



        if (this.voucherData.length > 0)
          this.OB = this.voucherData[0].balance;

        this.calcultevalues()

        if (currentLang == "ar") {
          this.refresSupplieraccountstatementArabic(this.voucherData);
        }
        else {
          this.refreshSupplieraccountstatementEnglish(this.voucherData);
        }

        this.egretLoader.close();
      });
    });
  }

  PrintReport() {
    debugger
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.suppaccountStatmentAddForm.value;
    if (formValues.branchId == 0) {
      formValues.branchId = -1;
    }
    if (formValues.dealerTypeId == 0) {
      formValues.dealerTypeId = -1;
    }

    if (this.Lang == "ar") {
      const reportUrl = `rptSupplierAccountstatementAR?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&SupplierID=${formValues.supplierId}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&CurrId=${formValues.currencyId}&CurrRate=${formValues.currRate}&Balance=${this.totalFormatted}&DealerTypeId=${formValues.dealerTypeId}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');

    }
    else {
      const reportUrl = `rptSupplierAccountstatementEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&SupplierID=${formValues.supplierId}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&CurrId=${formValues.currencyId}&CurrRate=${formValues.currRate}&Balance=${this.totalFormatted}&DealerTypeId=${formValues.dealerTypeId}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');
    }

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SupplierAccountStatement');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.suppaccountStatmentAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    const currentDate = new Date().toISOString().split('T')[0];
    this.suppaccountStatmentAddForm.get('fromDate').setValue(this.FromDate);
    this.suppaccountStatmentAddForm.get('toDate').setValue(currentDate);
    this.clearTotals();
    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
    this.totalFormatted = '0';
    this.suppaccountStatmentAddForm.get('supplierId').setValue(0);
    this.suppaccountStatmentAddForm.get('voucherStatus').setValue(this.defaultStatus);
    this.suppaccountStatmentAddForm.get('branchId').setValue(0);
    this.suppaccountStatmentAddForm.get('dealerTypeId').setValue(0);
    this.suppaccountStatmentAddForm.get('currencyId').setValue(0);
    this.suppaccountStatmentAddForm.get('currRate').setValue(0);
  }

  calcultevalues() {
    debugger;
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;

    for (const row of this.voucherData) {
      const debit = parseFloat(row.debit);
      const credit = parseFloat(row.credit);

      if (!isNaN(debit)) {
        this.tot1 += parseFloat(debit.toFixed(3)); // Round to 3 decimals before adding
      }

      if (!isNaN(credit)) {
        this.tot2 += parseFloat(credit.toFixed(3)); // Round to 3 decimals before adding
      }
    }

    this.total = this.tot1 - this.tot2;

    // Round to 3 decimal digits
    const tot1Rounded = parseFloat(this.tot1.toFixed(3));
    const tot2Rounded = parseFloat(this.tot2.toFixed(3));
    const totalRounded = parseFloat(this.total.toFixed(3));

    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(tot1Rounded);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(tot2Rounded);
    this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(totalRounded);

    debugger;
  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
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

  refresSupplieraccountstatementArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      'رقم السند': x.voucherNo,
      'نوع السند': x.voucherName,
      'تاريخ السند': x.voucherDate,
      'ملاحظات': x.voucherStatement,
      'مدين': x.debit.toFixed(3),
      'دائن': x.credit.toFixed(3),
      'الرصيد': x.balance.toFixed(3),
    }));
  }

  refreshSupplieraccountstatementEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Voucher Number': x.voucherNo,
      'Voucher Type': x.voucherName,
      'Voucher Date': x.voucherDate,
      'Notes': x.voucherStatement,
      'Debit': x.debit.toFixed(3),
      'Credit': x.credit.toFixed(3),
      'Balance': x.balance.toFixed(3),
    }));
  }

  exportExcel(dt: any) {
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
        this.refresSupplieraccountstatementArabic(exportSource);
      } else {
        this.refreshSupplieraccountstatementEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      let totalDebit = 0;
      let totalCredit = 0;

      for (const row of exportSource) {
        const debit = parseFloat(row.debit);
        const credit = parseFloat(row.credit);

        if (!isNaN(debit)) {
          totalDebit += parseFloat(debit.toFixed(3));
        }

        if (!isNaN(credit)) {
          totalCredit += parseFloat(credit.toFixed(3));
        }
      }

      const totalBalance = parseFloat((totalDebit - totalCredit).toFixed(3));

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'مدين': totalDebit,
          'دائن': totalCredit,
          'الرصيد': totalBalance,
        }
        : {
          'Debit': totalDebit,
          'Credit': totalCredit,
          'Balance': totalBalance,
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
          worksheet[cellAddress] = { t: 'n', v: +sumValue };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

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
       head = [[' الرصيد', '  دائن', 'مدين', ' ملاحظات', ' تاريخ السند', ' نوع السند', ' رقم السند']]
    }
    else {
       head = [['Balance', 'Credit', 'Debit', 'Notes', ' Voucher Date', 'Voucher Type', 'Voucher Number']]
    }

    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalDebit = 0;
    let totalCredit = 0;
    let totalBalance = 0;


    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    // إنشاء الصفوف وجمع القيم
    exportSource.forEach(function (part) {
      let temp: (number | string)[] = [];

      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = part.voucherDate
      temp[3] = part.voucherStatement
      temp[4] = part.debit
      temp[5] = part.credit
      temp[6] = part.balance

      const debit = parseFloat(part.debit);
      const credit = parseFloat(part.credit);
      const debitRounded = isNaN(debit) ? 0 : parseFloat(debit.toFixed(3));
      const creditRounded = isNaN(credit) ? 0 : parseFloat(credit.toFixed(3));
      //const balanceRounded = debitRounded - creditRounded;
      totalDebit += debitRounded;
      totalCredit += creditRounded;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });
     totalBalance = parseFloat((totalDebit - totalCredit).toFixed(3));

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];
    if (currentLang === "ar") {
      footRow[3] = "المجموع";
      footRow[4] = totalDebit.toFixed(2);     // مدين
      footRow[5] = totalCredit.toFixed(2);    // دائن
      footRow[6] = totalBalance.toFixed(2);   // الرصيد
    } else {
      footRow[3] = "Total";
      footRow[4] = totalDebit.toFixed(2);     // Debit
      footRow[5] = totalCredit.toFixed(2);    // Credit
      footRow[6] = totalBalance.toFixed(2);   // Balance
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"? "كشف حساب مورد  ": "Supplier Account Statement";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

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

  OpenVoucher(id, categoryId) {
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
        this.suppaccountStatmentAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.suppaccountStatmentAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.suppaccountStatmentAddForm.get("currRate").setValue(0);
      this.applyCurrencyRate(0);
      this.calcultevalues();
    }
  }

  applyCurrencyRate(rate: number) {
    if (rate > 0) {
      this.voucherData = this.voucherDataOriginal.map(row => {
        return {
          ...row,
          balance: rate > 0 ? (row.balance / rate) : row.balance
        };
      });
    }
    else {
      this.voucherData = [...this.voucherDataOriginal];
    }

  }
}
