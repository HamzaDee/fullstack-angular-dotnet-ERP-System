import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
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
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-chequesreport',
  templateUrl: './chequesreport.component.html',
  styleUrls: ['./chequesreport.component.scss']
})
export class ChequesreportComponent implements OnInit {
  chequesAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedsts: any;
  selectedbank: any;
  selectedvouchers: any;
  vouchertypeList: any;
  cheqStatusList: any;
  accountsList: any;
  userbranchList: any;
  banksList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 67;
  custom: boolean;
  data: any[];
  public TitlePage: string;
  tot1Formatted: string = '';
  total: number = 0;
  FromDate : any;

  constructor(private formbulider: FormBuilder,
    private translateService: TranslateService,
    private ReportsService: ReportsService,
    private alert: sweetalert,
    public ValidatorsService: ValidatorsService,
    private jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private egretLoader: AppLoaderService,
    private title: Title,
    private appCommonserviceService: AppCommonserviceService
  ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetchequesForm();
    this.GetchequesInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetchequesForm() {
    debugger
    this.chequesAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypes: [''],
      fromChequeNo: [0],
      toChequeNo: [0],
      chequeStatusId: [0],
      accountId: [0],
      bankId: [0],
      branchId: [''],
      isDate: [''],
      fromDate: [''],
      toDate: [''],
      drawerName: [''],
      fromAmount: [0],
      toAmount: [0],

    });
  }

  GetchequesInitialForm() {
    this.ReportsService.GetChequesForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.vouchertypeList = result.voucherTypeList;
      this.cheqStatusList = result.cheqStatusList;
      this.accountsList = result.accountList;
      this.userbranchList = result.companyBranchList;
      this.banksList = result.banksList;

      debugger
      this.chequesAddForm.patchValue(result);
      debugger
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.FromDate =formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      debugger
      this.chequesAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.chequesAddForm.get('voucherTypes').setValue([0]);
        this.selectedsts = result.chequeStatusId;
        this.selectedacc = result.accountId;
        this.selectedbranch = result.branchId;
        this.selectedbank = result.bankId;
        // this.chequesAddForm.get("branchId").setValue(result.defaultBranchId);

        debugger


      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      debugger
      this.voucherData = [];

      if (this.chequesAddForm.value.fromChequeNo == null || this.chequesAddForm.value.fromChequeNo == -1) {
        this.chequesAddForm.value.fromChequeNo = 0;
      }
      if (this.chequesAddForm.value.toChequeNo == null || this.chequesAddForm.value.toChequeNo == -1) {
        this.chequesAddForm.value.toChequeNo = 0;
      }
      if (this.chequesAddForm.value.fromAmount == null || this.chequesAddForm.value.fromAmount == -1) {
        this.chequesAddForm.value.fromAmount = 0;
      }
      if (this.chequesAddForm.value.toAmount == null || this.chequesAddForm.value.toAmount == -1) {
        this.chequesAddForm.value.toAmount = 0;
      }
      if (this.chequesAddForm.value.drawerName == 0) {
        this.chequesAddForm.value.drawerName = null;
      }
      if (this.chequesAddForm.value.voucherTypes == 0) {
        this.chequesAddForm.value.voucherTypes = null;
      }
      const formValues = this.chequesAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      if (formValues.accountId == null) {
        formValues.accountId = 0;
      }
      if (formValues.chequeStatusId == null) {
        formValues.chequeStatusId = 0;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetCheques(
        formValues.accountId,
        formValues.bankId,
        formValues.branchId,
        formValues.chequeStatusId,
        formValues.voucherTypes,
        formValues.drawerName,
        formValues.fromChequeNo,
        formValues.toChequeNo,
        formValues.fromAmount,
        formValues.toAmount,
        formValues.fromDate,
        formValues.toDate,
      ).subscribe((result) => {
        debugger;

        this.voucherData = result;


        if (currentLang == "ar") {
          this.refresChequesreportArabic(this.voucherData);
        }
        else {
          this.refreshChequesreportEnglish(this.voucherData);
        }

        this.total = 0;
        for (const row of this.voucherData) {
          const Sum1 = parseFloat(row.amount);
          if (!isNaN(Sum1)) {
            this.total += Sum1;
          }
        }

        this.tot1Formatted += this.formatCurrency(this.total, 2);

        this.egretLoader.close();
      });
    });
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('chequesreport');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.chequesAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetchequesInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.chequesAddForm.get('fromDate').setValue(this.FromDate);
    this.chequesAddForm.get('toDate').setValue(currentDate);
    this.chequesAddForm.get('voucherTypes').setValue([0]);
    this.chequesAddForm.get('fromChequeNo').setValue(0);
    this.chequesAddForm.get('toChequeNo').setValue(0);
    this.chequesAddForm.get('chequeStatusId').setValue(0);
    this.chequesAddForm.get('accountId').setValue(0);
    this.chequesAddForm.get('bankId').setValue(0);
    this.chequesAddForm.get('branchId').setValue(0);
    this.chequesAddForm.get('fromAmount').setValue(0);
    this.chequesAddForm.get('toAmount').setValue(0);
    this.tot1Formatted = '0';
  }

  GetPeriods() {
    debugger
    if (this.chequesAddForm.value.periodId > 0) {
      const formValues = this.chequesAddForm.value;
      this.ReportsService.GetPeriods(formValues.periodId).subscribe((result) => {
        debugger
        this.chequesAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.chequesAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }

  onOptionSelect(event: any) {
    debugger
    this.voucherData = [];
    // this.trialBalanceAddForm.get('yearIds').setValue(this.selectedYears);
    // Update the selectedOptions array when an item is selected
    this.selectedvouchers = event.value;
    this.chequesAddForm.get('voucherTypes').setValue(this.selectedvouchers);
  }

  //   OpenCheqTransForm(cheq: number) {
  //     debugger
  //   this.routePartsService.GuidToEdit = cheq
  //   // this.routePartsService.Guid2ToEdit = 'Edit';
  //   this.router.navigate(['AccountingReports/chequestransreport']);
  // }

  OpenCheqTransForm(cheq: number) {
    this.routePartsService.GuidToEdit = cheq;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/chequestransreport?cheq=${cheq}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
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

  detailsCheqTrans(id, categoryId) {
    debugger
    var url = '';
    var invId = 0;
    switch (categoryId) {
      case 21:  // قائمة سندات التحويل والأيداع النقدي
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/TransferVoucher/TransferVoucherform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 19:  //  قائمة سندات القبض  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReceiptVoucher/Receiptform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 20:  //  قائمة سندات الصرف   
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/PaymentVoucher/Paymentform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 22:  //  قائمة سندات الحوالة البنكية  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BankTransfer/BankTransferForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 29:  //  قائمة شيكات اول المدة 
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BeginningCheques/Beginingchequesform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 30:  //  قائمة شيكات اول المدة 
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BeginningCheques/Beginingchequesform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 26:  //  قائمة معالجة الشيكات الواردة
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 23:  //  قائمة معالجة الشيكات الواردة
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 24:  //  قائمة معالجة الشيكات الواردة
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 31:  //    قائمة معالجة الشيكات الصادرة  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingOutcomingCheque/ProcoutcheqForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 100:  //  الأرصدة الأفتتاحية للموردين 
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SuppliersOpeningBalance/SuppopeningbalanceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 125:  //    سند صرف مورد  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierPaymentVoucher/SupppaymentvoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 126:  //   سند قبض المورد   
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierReceiptVoucher/SuppReceiptvoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 128:  //   اشعار مدين موردين
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierDepitNoteVoucher/SuppDebitVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 129:  //   إشعار دائن موردين 
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierCreditNoteVoucher/SuppCreditVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
      case 130:  //    سند صرف العملاء  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomerPaymentVoucher/CustpaymentvoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 131:  //      سند قبض العملاء  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomerReceiptVoucher/CustRecieptvoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 132:  //      اشعار مدين عملاء  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersDebitNote/CustDebitvoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 133:  //      اشعار دائن  عملاء  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersCreditNote/CustCreditvoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 134:  //   فاتورة بيع خدمات  
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesSalesInv/CustServiceSalesInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
    }
  }

  refresChequesreportArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      const dueDate = new Date(x.dueDate).toLocaleDateString('ar-EG');
      return {
        'نوع السند': x.voucherTypeDesc,
        'رقم السند': x.voucherNo,
        'تاريخ السند': transDate,
        'رقم الشيك': x.chequeNo,
        'تاريخ الاستحقاق': dueDate,
        'اسم الساحب': x.drawerName,
        'البنك': x.bankName,
        'القيمة': x.amount,
        'حالة الشيك': x.chequeStatus,
      }
    });
  }

  refreshChequesreportEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      const dueDate = new Date(x.dueDate).toLocaleDateString('ar-EG');
      return {
        'Voucher Type': x.voucherTypeDesc,
        'Voucher Number': x.voucherNo,
        'Voucher Date': transDate,
        'Cheq Number': x.chequeNo,
        'Due Date': dueDate,
        'Drawer Name': x.drawerName,
        'Bank': x.bankName,
        'Amount': x.amount,
        'Cheq Status': x.chequeStatus,
      }
    });
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totaleAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'القيمة': totaleAmount,
        }
        : {
          'Amount': totaleAmount,
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

  exportPdf1() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' حالة الشيك', 'القيمة', ' البنك', ' اسم الساحب', 'تاريخ الاستحقاق', ' رقم الشيك ', ' تاريخ السند', ' رقم السند', ' نوع السند']]
    }
    else {
       head = [['Cheq Status', 'Amount', 'Bank', 'Drawer Name', 'Due Date', 'Cheq Number', 'Voucher Date', 'Voucher Number', 'Voucher Type']]
    }
    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalAmount = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      const date1 = new Date(part.transDate);
      const transDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.dueDate);
      const dueDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.voucherTypeDesc
      temp[1] = part.voucherNo
      temp[2] = transDate
      temp[3] = part.chequeNo
      temp[4] = dueDate
      temp[5] = part.drawerName
      temp[6] = part.bankName
      temp[7] = part.amount
      temp[8] = part.chequeStatus

      totalAmount += parseFloat(part.amount) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // لعكس الأعمدة حسب اللغة
    });

    // عدد الأعمدة
    const columnCount = head[0].length;

    // إنشاء صف التذييل (footer row)
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[6] = "المجموع";
      footRow[7] = totalAmount.toFixed(2);     // مدين
    } else {
      footRow[6] = "Total";
      footRow[7] = totalAmount.toFixed(2);     // مدين
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar" ? "كشف الشيكات" : "Cheque Transactions Report";

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
}
