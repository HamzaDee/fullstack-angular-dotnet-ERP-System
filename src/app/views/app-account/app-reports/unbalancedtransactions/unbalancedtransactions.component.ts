import { Component, OnInit } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-unbalancedtransactions',
  templateUrl: './unbalancedtransactions.component.html',
  styleUrls: ['./unbalancedtransactions.component.scss']
})
export class UnbalancedtransactionsComponent implements OnInit {
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 148;
  custom: boolean;
  data: any[];
  hidden: boolean = true;
  public TitlePage: string;
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  totalFormatted: string = '0';
  total: number = 0;
  tot1: number = 0;
  tot2: number = 0;


  constructor(
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private ReportsService: ReportsService,
    private alert: sweetalert,
    public ValidatorsService: ValidatorsService,
    private jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private egretLoader: AppLoaderService,
    private title: Title,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetReport();
    this.getFavouriteStatus(this.screenId);
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    debugger
    setTimeout(() => {
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetUnbalancedTrans().subscribe((result) => {
        debugger
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.egretLoader.close();
          return;
        }
        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresUnbalancedtransactionsArabic(this.voucherData);
        }
        else {
          this.refreshUnbalancedtransactionsEnglish(this.voucherData);
        }


        this.calcultevalues();
        this.egretLoader.close();
      });
    });
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;

    for (const row of this.voucherData) {
      const debit = parseFloat(row.sumDebit);
      const credit = parseFloat(row.sumCredit);

      if (!isNaN(debit)) {
        this.tot1 += debit;
      }

      if (!isNaN(credit)) {
        this.tot2 += credit;
      }
    }

    // this.tot1 = tot1;
    // this.tot2 = tot2;
    // this.total = this.tot1 - this.tot2;

    // Format the values with thousand commas
    this.tot1Formatted = this.formatWithCommas(this.tot1);
    this.tot2Formatted = this.formatWithCommas(this.tot2);
    // this.totalFormatted = this.formatWithCommas(this.total);
    debugger


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

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('unbalancedtransactions');
    this.title.setTitle(this.TitlePage);
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
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
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

  OpenVoucher(id, catId) {
    // alert(catId)
    var url = '';
    var invId = 0;
    debugger;
    switch (catId) {
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
        window.open(url, '_blank');
        break;
      case 34: //Output Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/InventoryVouchers/OutputVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
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
          window.open(url, '_blank');
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

  refresUnbalancedtransactionsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': voucherDate,
        'المجموع المدين': x.sumDebit,
        'المجموع الدائن': x.sumCredit,
      }
    });
  }

  refreshUnbalancedtransactionsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherName,
        'Voucher Date': voucherDate,
        'Total Debit': x.sumDebit,
        'Total Credit': x.sumCredit,
      }
    });
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totalDebit = this.voucherData.reduce((sum, item) => sum + parseFloat(item.sumDebit || 0), 0);
      const totalCredit = this.voucherData.reduce((sum, item) => sum + parseFloat(item.sumCredit || 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'المجموع المدين': totalDebit,
          'المجموع الدائن': totalCredit,
        }
        : {
          'Total Debit': totalDebit,
          'Total Credit': totalCredit,
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

    if(currentLang == "ar"){
         head = [['المجموع الدائن',' المجموع المدين',' تاريخ السند',' نوع السند',' رقم السند']]    }
      else{
         head = [['Total Credit','Total Debit',' Voucher Date','Voucher Type','Voucher Number']]
      }
    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalDebit = 0;
    let totalCredit = 0;
    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = voucherDate
      temp[3] = part.sumDebit
      temp[4] = part.sumCredit

      totalDebit += parseFloat(part.sumDebit) || 0;
      totalCredit += parseFloat(part.sumCredit) || 0;

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
      footRow[7] = totalDebit.toFixed(2);     // مدين
      footRow[8] = totalCredit.toFixed(2);

    } else {
      footRow[6] = "Total";
      footRow[7] = totalDebit.toFixed(2);     // مدين
      footRow[8] = totalCredit.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "كشف القيود الغير متزنة "
      : "UnBalanced Transactions Report";

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
