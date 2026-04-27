import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
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
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-accountsstatement',
  templateUrl: './accountsstatement.component.html',
  styleUrls: ['./accountsstatement.component.scss']
})
export class AccountsstatementComponent implements OnInit {
  accountStatmentAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedper: any;
  selectedCur: any;
  usersList: any;
  accountsList: any;
  userbranchList: any;
  currancyList: any;
  periodsList: any;
  OB: any;
  accVoucherList: any;
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
  accountNumber: number;
  screenId: number = 38;
  custom: boolean;
  public TitlePage: string;
  Lang: string;
  FromDate : any;


  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: ReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private router: Router,
      private readonly serv: AppCommonserviceService,
    ) { }


  ngOnInit(): void {
    
    this.SetTitlePage();
    this.route.queryParams.subscribe((params: Params) => {
      
      this.accountNumber = +params['acc'];
    });

    // this.accountNumber = this.routePartsService.GuidToEdit;
    this.GetaccountbalanceForm();
    this.GetaccountbalanceInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetaccountbalanceForm() {
    
    this.accountStatmentAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      accId: [0, [Validators.required, Validators.min(1)]],
      branchId: [0],
      fromdate: [''],
      todate: [''],
      voucherStatus: [-1],
      yearId: [0],
      currencyId: [0],
      exRate: [0],
      showAgeing: [0],
      user: [0]
    });
  }

  GetaccountbalanceInitialForm() {
    this.ReportsService.GetaccountStatmentForm().subscribe((result) => {
      
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.accountsList = result.accountsList;
      this.statusList = result.statusList;
      this.userbranchList = result.companyBranchList;
      this.periodsList = result.periodsFiscalYearsList;
      this.currancyList = result.currencyList;
      this.usersList = result.usersList;
      
      result.fromdate = formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US");
      this.FromDate = formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      this.accountStatmentAddForm.patchValue(result);

      
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.accountStatmentAddForm.get('voucherStatus').setValue(defaultStatus);
        if (result.accId == null || result.accId == undefined || result.accId == 0) {
          result.accId = 0;
          this.selectedacc = 0;
        }
        if (result.branchId == null || result.branchId == undefined) {
          result.branchId = 0;
        }
        if (result.yearId == null || result.yearId == undefined) {
          result.yearId = 0;
        }
        if (result.currencyId == null || result.currencyId == undefined) {
          result.currencyId = 0;
        }
        this.selectedacc = result.accId;
        this.selectedbranch = result.branchId;
        this.selectedper = result.yearId;
        this.selectedCur = result.currencyId;
        this.isDisabled = true;
        this.accountStatmentAddForm.get("user").setValue(0)
        
        if (!isNaN(Number(this.accountNumber)) && Number(this.accountNumber) !== 0) {
          this.selectedacc = this.accountNumber;
        }
        this.isPost = 1;
        this.accountStatmentAddForm.value.post = this.isPost;
      });
    });
  }

  GetReport() {
    let currentLang = this.jwtAuth.getLang();
    this.Lang = this.jwtAuth.getLang();
    if (this.accountStatmentAddForm.value.fromdate > this.accountStatmentAddForm.value.todate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }
    
    setTimeout(() => {
      
      this.voucherData = [];
      this.clearTotals();
      
      const formValues = this.accountStatmentAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }

      if (Number.isNaN(formValues.accId) || formValues.accId == undefined) {
        formValues.accId = 0;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetAccountStatement(
        formValues.accId,
        formValues.voucherStatus,
        formValues.branchId,
        formValues.fromdate,
        formValues.todate,
        formValues.exRate,
        formValues.user,
        formValues.currencyId,
      ).subscribe((result) => {
        

        this.voucherData = result;

        if (currentLang == "ar") {
          this.refreshAccountsstatementArabic(this.voucherData);
        }
        else {
          this.refreshAccountsstatementEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0)
          this.OB = this.voucherData[0].balance;

        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('accountsstatement');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    debugger
    this.accountStatmentAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    const currentDate = new Date().toISOString().split('T')[0];
    this.accountStatmentAddForm.get('fromdate').setValue(this.FromDate);
    this.accountStatmentAddForm.get('todate').setValue(currentDate);
    this.accountStatmentAddForm.get('accId').setValue(0);
    this.accountStatmentAddForm.get('branchId').setValue(0);
    this.accountStatmentAddForm.get('voucherStatus').setValue(0);
    this.accountStatmentAddForm.get('yearId').setValue(0);
    this.accountStatmentAddForm.get('currencyId').setValue(0);
    //this.GetaccountbalanceInitialForm();
    this.clearTotals();
  }

  calcultevalues() {
    
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;


    for (const row of this.voucherData) {
      const debit = parseFloat(row.debit);
      const credit = parseFloat(row.credit);

      if (!isNaN(debit)) {
        this.tot1 += debit;
      }

      if (!isNaN(credit)) {
        this.tot2 += credit;
      }
    }

    // this.tot1 = tot1;
    // this.tot2 = tot2;
    this.total = this.tot1 - this.tot2;

    // Format the values with thousand commas
    this.tot1Formatted = this.formatWithCommas(this.tot1);
    this.tot2Formatted = this.formatWithCommas(this.tot2);
    this.totalFormatted = this.formatWithCommas(this.total);
    
  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;

    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
    this.totalFormatted = '0';

  }

  getCurrencyRate(event: any) {
    
    if (event > 0) {
      const selectedValue = event;
      var currRate = this.currancyList.find(option => option.id === selectedValue).data1;
      this.accountStatmentAddForm.get("exRate").setValue(Number(currRate));
    }
    else {
      var Rate = 0;
      this.accountStatmentAddForm.get("exRate").setValue(Rate);
    }


  }

  GetPeriods() {
    
    if (this.accountStatmentAddForm.value.yearId > 0) {
      const formValues = this.accountStatmentAddForm.value;
      this.ReportsService.GetPeriods(formValues.yearId).subscribe((result) => {
        
        this.accountStatmentAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.accountStatmentAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }

  refreshAccountsstatementArabic(data) {
    
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رقم السند': x.voucherNumber,
      'نوع السند ': x.voucher_Ar_Name,
      'تاريخ السند': x.voucherDate,
      'ملاحظة': x.voucherStatement,
      'مدين': x.debit,
      'دائن': x.credit,
      'الرصيد': x.balance,
    }));
  }

  refreshAccountsstatementEnglish(data) {
    
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Voucher Number': x.voucherNumber,
      'Voucher Name': x.voucher_Ar_Name,
      'Voucher Date': x.voucherDate,
      'Note': x.voucherStatement,
      'Debit': x.debit,
      'Credit': x.credit,
      'Balance': x.balance,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      ;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totalDebit = this.voucherData.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
      const totalCredit = this.voucherData.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);
      //const totalBalance = this.voucherData.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);
      const totalBalance = totalDebit - totalCredit;

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      // التعرف على اللغة تلقائيًا
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      // ربط أسماء الأعمدة الظاهرة مع الحقول
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

      // دالة لتحويل رقم العمود إلى حرف إكسل
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

      // حساب الصف الأخير
      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // إدخال المجاميع في الأعمدة المناسبة
      headers.forEach((header, index) => {
        const trimmedHeader = header.trim(); // إزالة الفراغات من الاسم
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      // وضع التسمية "Total" أو "المجموع" في أول عمود
      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      // تحديث نطاق الورقة
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      // إنشاء ملف الإكسل وتصديره
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
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    // رأس الجدول
    const head = currentLang === "ar"
      ? [['الرصيد', 'دائن', 'مدين', 'ملاحظة', 'تاريخ السند', 'اسم السند', 'رقم السند']]
      : [['Balance', 'Credit', 'Debit', 'Note', 'Voucher Date', 'Voucher Name', 'Voucher Number']];

    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalDebit = 0;
    let totalCredit = 0;
    let totalBalance = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];

      temp[0] = part.voucherNumber;
      temp[1] = part.voucher_Ar_Name;
      temp[2] = part.voucherDate;
      temp[3] = part.voucherStatement;
      temp[4] = part.debit;
      temp[5] = part.credit;
      temp[6] = part.balance;

      totalDebit += parseFloat(part.debit) || 0;
      totalCredit += parseFloat(part.credit) || 0;
     // totalBalance += parseFloat(part.balance) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // لعكس الأعمدة حسب اللغة
    });

    totalBalance = totalDebit - totalCredit;

    // عدد الأعمدة
    const columnCount = head[0].length;

    // إنشاء صف التذييل (footer row)
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

    const title = currentLang === "ar"
      ? "كشف حساب تفصيلي"
      : "Account Statement Report";

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
    
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      
      if(result.isSuccess)
      {
        this.custom = true;
      }
      else
      {
        this.custom = false;
      }
                   
    })        
  }

  PrintReport() {
    
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.accountStatmentAddForm.value;
    if (formValues.showAgeing == true) {
      formValues.showAgeing = 1;
    }
    if (formValues.showAgeing == false) {
      formValues.showAgeing = 0;
    }

    if (this.Lang == "ar") {
    const reportUrl = `rptAccountStatementAR?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&AccountId=${formValues.accId}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&User=${formValues.user}&FromDate=${formValues.fromdate}&ToDate=${formValues.todate}&ExchangeRate=${formValues.exRate}&CurrId=${formValues.currencyId}&Balance=${this.totalFormatted}&showAgeing=${formValues.showAgeing}`;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/report-viewer'], {
        queryParams: { reportUrl }
      })
    );
    
    window.open(url, '_blank');

    }
    else {
    const reportUrl = `rptAccountStatementEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&AccountId=${formValues.accId}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&User=${formValues.user}&FromDate=${formValues.fromdate}&ToDate=${formValues.todate}&ExchangeRate=${formValues.exRate}&CurrId=${formValues.currencyId}&Balance=${this.totalFormatted}&showAgeing=${formValues.showAgeing}`;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/report-viewer'], {
        queryParams: { reportUrl }
      })
    );
    
    window.open(url, '_blank');
    }

  }

  OpenVoucher(id, catId) {
    // alert(catId)
    var url = '';
    var invId = 0;
    ;
    switch (catId) {
      case 18 :   // Entry Voucher
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
      case 53 :   // Entry Voucher
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
        url = `/ProcessingOutcomingCheque/ProcoutcheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 30: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
        window.open(url,'_blank');
        break;           
       case 34: //Output Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/InventoryVouchers/OutputVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
        break; 
      case 33: //Items Input Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/EntryyVoucher/EntryyVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break; 
      case 35: //Items Damage Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/DamageStockVoucher/DamageStockVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;
      case 36: //Items Transfer Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/TransferStockVoucher/ItemsTransferVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;       
      case 39: //Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 41: //Return Purchase Invoice
      this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnPurchaseInvoice/ReturnPurInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;  
      case 43: //Sales Order
      this.ReportsService.GetInvoiceId(id).subscribe(result => {  
                
        var invId = result;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SalesRequest/SalesRequestForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`; 
        window.open(url,'_blank');
      })       
      break;   
      case 44: //Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 45: //Return Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
      case 174: // مردود خدمات
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnServiceInvoice/ReturnServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      default:
      // Default code if none of the cases match
    }
  }

  printVouchers(id,catId,Balance)
  {
    var url='';
    var invId=0;
    this.Lang = this.jwtAuth.getLang();
    
    
    switch (catId) {      
      case 18 :   // Entry Voucher
          this.Lang = this.jwtAuth.getLang();
          if (this.Lang == "ar") {
              const reportUrl = `rptAccountEntryVoucherAR?VId=${id}`;
              const relativeUrl = this.router.serializeUrl(
                this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } })
              );
              const fullUrl = `${window.location.origin}${relativeUrl}`;
              window.open(fullUrl, '_blank');
          }
          else {
              const reportUrl = `rptEntryVoucherEN?VId=${id}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
          }      
        break; 
      case 55:   // Entry Voucher
          if (this.Lang == "ar") {
              const reportUrl = `rptAccountEntryVoucherAR?VId=${id}`;
              const relativeUrl = this.router.serializeUrl(
                this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } })
              );
              const fullUrl = `${window.location.origin}${relativeUrl}`;
              window.open(fullUrl, '_blank');
          }
          else {
              const reportUrl = `rptEntryVoucherEN?VId=${id}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
          }      
        break; 
        case 53 :   // Entry Voucher
          this.Lang = this.jwtAuth.getLang();
          if (this.Lang == "ar") {
              const reportUrl = `rptAccountEntryVoucherAR?VId=${id}`;
              const relativeUrl = this.router.serializeUrl(
                this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } })
              );
              const fullUrl = `${window.location.origin}${relativeUrl}`;
              window.open(fullUrl, '_blank');
          }
          else {
              const reportUrl = `rptEntryVoucherEN?VId=${id}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
          }      
        break; 
      case 19:   // Receipt Voucher        
            if(this.Lang == "ar")
            { 
              const reportUrl = `rptReciptVoucherAR?VId=${id}&Balance=${Balance}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
            }
            else{ 
              const reportUrl = `rptReciptVoucherEN?VId=${id}&Balance=${Balance}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
            }           
        break;         
      case 20: // Payment Voucher       
        if (this.Lang == "ar") {
          const reportUrl = `rptPaymentVoucherAR?VId=${id}&Balance=${Balance}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `rptPaymentVoucherEN?VId=${id}&Balance=${Balance}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 21:  //Transfer Voucher
       if(this.Lang == "ar")
          { 
            const reportUrl = `RptTransferVoucherAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else{ 
            const reportUrl = `rptTransferVoucherEN?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
        break;
      case 22: //Bank Transfer Voucher
        if (this.Lang == "ar") {
          const reportUrl = `rptBankTransferAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptBankTransferEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 23 : //Processing Incoming Cheques
        if(this.Lang == "ar")
        { 
          const reportUrl = `rptProcessingIncomingChequeAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptProcessingIncomingChequeEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 24 : //ProcessingOutCheque
        if(this.Lang == "ar")
          { 
            const reportUrl = `rptProcessingOutChequeAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else{ 
            const reportUrl = `RptProcessingOutChequeEN?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
        break;
      case 26: //Processing Incoming Cheques
          if(this.Lang == "ar")
          { 
            const reportUrl = `rptProcessingIncomingChequeAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else{ 
            const reportUrl = `RptProcessingIncomingChequeEN?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
        break;
      case 29 : //Begining Cheques
         if (this.Lang == "ar") {
            const reportUrl = `RptBeginingChequesAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else {
            const reportUrl = `RptBeginingChequesEN?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
        break; 
      case 30: //Begining Cheques
        if (this.Lang == "ar") {
            const reportUrl = `RptBeginingChequesAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else {
            const reportUrl = `RptBeginingChequesEN?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
        break;        
      case 31: //Processing Outgoing Cheques
       if(this.Lang == "ar")
        { 
          const reportUrl = `rptProcessingOutChequeAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptProcessingOutChequeEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;       
      case 32: //Assets Depreciation
       if(this.Lang == "ar")
        { 
          const reportUrl = `RptFixedAssetDepreciationAR?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptFixedAssetDepreciationEN?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;           
      case 33: //Output Voucher
      this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        if(this.Lang == "ar")
            { 
              const reportUrl = `rptEntryVoucherAR?VId=${invId}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
            }
            else{ 
              const reportUrl = `RptEntryyVoucherEN?VId=${invId}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
            }
      })              
        break; 
      case 34: //Output Voucher
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;          
          if(this.Lang == "ar")
            { 
              const reportUrl = `RptOutputVoucherAR?VId=${invId}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
            }
            else{ 
              const reportUrl = `RptOutputVoucherEN?VId=${invId}`;
              const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
              window.open(url, '_blank');
            }
         })             
        break; 
      case 35: //Damage Voucher
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;          
          if(this.Lang == "ar")
          { 
            const reportUrl = `rptDamageStockVoucherAR?VId=${invId}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else{ 
            const reportUrl = `RptDamageStockVoucherEN?VId=${invId}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
         })             
        break; 
      case 36: //Items Transfer Voucher
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;          
          if(this.Lang == "ar")
          { 
            const reportUrl = `rptTransferStockVoucherAR?VId=${invId}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else{ 
            const reportUrl = `RptTransferStockVoucherEN?VId=${invId}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
         })             
        break;         
      case 39: //Purchase Invoice
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
       if(this.Lang == "ar")
        { 
          const reportUrl = `RptPurchaseInvoiceAR?Id=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptPurchaseInvoiceEN?Id=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      })            
      break;    
      case 41: //Return Purchase Invoice
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        if(this.Lang == 'ar')
        {
          const reportUrl = `RptReturnPurchaseAr?VId=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else
        {
          const reportUrl = `RptReturnPurchaseEn?VId=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        })        
        break;   
      case 44: //Sales Invoice
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        if(this.Lang == 'ar')
        {
          const reportUrl = `rptSalesInvoiceAR?Id=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else
        {
          const reportUrl = `rptSalesInvoiceEn?Id=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        })         
        break;   
      case 45: //Return Sales Invoice
       this.ReportsService.GetInvoiceId(id).subscribe(result => {          
        var invId = result;
        if(this.Lang == 'ar')
        {
          const reportUrl = `rptReturnedSalesInvoiceAR?Id=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else      
        {
          const reportUrl = `rptReturnedSalesInvoiceEN?Id=${invId}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }   
        })        
        break; 
      case 48: //Service  Invoice
        if (this.Lang == "ar") {
          const reportUrl = `rptServiceInvoiceAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `rptServiceInvoiceEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;  
      case 58: //Opening Balance
        if(this.Lang == "ar")
          { 
            const reportUrl = `RptOpeningBalanceAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
          else{ 
            const reportUrl = `RptOpeningBalanceEN?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
      break;  
      case 99: //Assets Purchase Invoice
       if (this.Lang == "ar") {
          const reportUrl = `RptPurchaseAssestInvoiceAR?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptAssetPurchaseInvoiceEN?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 102: //Assets Sales Invoice
       if(this.Lang == "ar")
        { 
          const reportUrl = `RptAssetSalesInvoiceAR?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptAssetSalesInvoiceEN?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 107 : //Assets Operations
       if(this.Lang == "ar")
        { 
          const reportUrl = `RptFixedAssetOperationAR?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptFixedAssetOperationEN?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 108: //Assets Operations
      if(this.Lang == "ar")
        { 
          const reportUrl = `RptFixedAssetOperationAR?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptFixedAssetOperationEN?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 110: // Disposal Assets
      if(this.Lang == "ar")
        { 
          const reportUrl = `RptFixedAssetOperationAR?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptFixedAssetOperationEN?Id=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 125: // Supplier Payment Voucher
        if (this.Lang == "ar") {
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
       if (this.Lang == "ar") {
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
        if (this.Lang == "ar") {
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
        if(this.Lang == "ar")
          { 
            const reportUrl = `RptSupplierdebitvoucherAR?VId=${id}`;
            const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
            window.open(url, '_blank');
          }
        else{ 
          const reportUrl = `RptSupplierdebitvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }  
        break;
      case 129: // Supplier Credit Note
       if(this.Lang == "ar")
        { 
          const reportUrl = `RptSupplierCreditvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptSupplierCreditvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }  
      break;
      case 130: // Customer Payment Voucher
        if(this.Lang == "ar")
        { 
          const reportUrl = `RptCustomerpaymentvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptCustomerpaymentvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        } 
        break;
      case 131: // Customer Receipt Voucher
      if(this.Lang == "ar")
        { 
          const reportUrl = `RptCustomerReciptvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptCustomerReciptvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 132: // Customer Debit Note
       if(this.Lang == "ar")
        { 
          const reportUrl = `RptCustomerDebitNoteAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else{ 
          const reportUrl = `RptCustomerDebitNoteEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
      break;
      case 133: // Customer Credit Note
      if(this.Lang == "ar")
      { 
        const reportUrl = `RptCustomerCreditNoteAR?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else{ 
        const reportUrl = `RptCustomerCreditNoteEN?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      break;
      case 134: // Customer Service Sales Invoice
      if(this.Lang == "ar")
      { 
        const reportUrl = `RptCustservicesalesinvAR?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else{ 
        const reportUrl = `RptCustservicesalesinvEN?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      break;
      case 174: // مردود خدمات
      if(this.Lang == "ar")
      { 
        const reportUrl = `rptRetServiceInvoiceAR?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      else{ 
        const reportUrl = `rptRetServiceInvoiceEN?VId=${id}`;
        const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
        window.open(url, '_blank');
      }
      break;
      default:
        // Default code if none of the cases match
    }
  }

  getBalance(row: any): number {
    return Math.abs((row.credit || 0) - (row.debit || 0));
  }
}
