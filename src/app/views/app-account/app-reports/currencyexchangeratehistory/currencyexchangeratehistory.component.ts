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
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-currencyexchangeratehistory',
  templateUrl: './currencyexchangeratehistory.component.html',
  styleUrls: ['./currencyexchangeratehistory.component.scss']
})
export class CurrencyexchangeratehistoryComponent implements OnInit {
  currhistoryAddForm: FormGroup;
  selectedTypeId: any;
  selectedCurrId: any;
  currencyList: any;
  vouchertypeList: any;
  activeDate: boolean = false;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isPost: number = 1;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 76;
  custom: boolean;
  data: any[];
  hidden: boolean = false;
  public TitlePage: string;


  constructor
            ( 
              private title: Title,
              private formbulider: FormBuilder,
              private translateService: TranslateService ,
              private ReportsService: ReportsService,
              private alert: sweetalert,
              public ValidatorsService:ValidatorsService,
              private jwtAuth: JwtAuthService,
              public routePartsService: RoutePartsService,
              private egretLoader: AppLoaderService,
              private readonly serv: AppCommonserviceService,
            ) { }

    ngOnInit(): void {
      this.SetTitlePage();
      this.GetCurrHistoryForm();
      this.GetCurrHistoryInitialForm();
      this.getFavouriteStatus(this.screenId);
    }

    GetCurrHistoryForm() {
    debugger
    this.currhistoryAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      currencyId: [0],
      voucherTypeId: [0],
      fromDate: [''],
      toDate: [''],
      compareDate: [0],
    });
  }

  GetCurrHistoryInitialForm() {
    this.ReportsService.GetCurrRateHistoryForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.currencyList = result.currencyList;
      this.vouchertypeList = result.voucherTypeList;

      debugger
      this.currhistoryAddForm.patchValue(result);
      debugger
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.currhistoryAddForm.patchValue(result);
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.activeDate = false;
        this.selectedTypeId = result.voucherTypeId;
        this.selectedCurrId = result.currencyId;
        debugger
      });
    });
  }


  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    if (this.currhistoryAddForm.value.fromDate > this.currhistoryAddForm.value.toDate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }

    debugger
    setTimeout(() => {
      this.voucherData = [];
      const formValues = this.currhistoryAddForm.value;
      if (this.activeDate) {
        formValues.compareDate = 1
      }
      else {
        formValues.compareDate = 0
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.FilterCurrencyExchangeRateHistory(
        formValues.currencyId,
        formValues.voucherTypeId,
        formValues.compareDate,
        formValues.fromDate,
        formValues.toDate,

      ).subscribe((result) => {
        debugger;

        this.voucherData = result.cerhModelList;

        if (currentLang == "ar") {
          this.refresCurrencyexchangeratehistoryArabic(this.voucherData);
        }
        else {
          this.refreshCurrencyexchangeratehistoryeEnglish(this.voucherData);
        }

        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('currencyexhangehistory');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.currhistoryAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    this.GetCurrHistoryInitialForm();
  }

  ClearData() {
    debugger
    this.voucherData = [];
  }

  toggleDateInputs() {
    this.activeDate = !this.activeDate;
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


  refresCurrencyexchangeratehistoryArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        ' العملة': x.currencyNameArabic,
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherTypeNameArabic,
        'التاريخ': voucherDate,
        'سعر الصرف': x.currRate,
      }
    });
  }

  refreshCurrencyexchangeratehistoryeEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Currency': x.currencyNameArabic,
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherTypeNameArabic,
        'Date': voucherDate,
        'Exchange Rate': x.currRate,
      }
    });
  }

    exportExcel() {
      import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.exportData);
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
    if (currentLang == "ar") {
      var head = [['سعر الصرف', ' التاريخ', ' نوع السند', ' رقم السند', '  العملة']]
    }
    else {
      var head = [['Exchange Rate', 'Date', 'Voucher Type', 'Voucher Number', 'Currency']]
    }
    var rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.currencyNameArabic
      temp[1] = part.voucherNo
      temp[2] = part.voucherTypeNameArabic
      temp[3] = voucherDate
      temp[4] = part.currRate

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    },this.data)
    
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);
   


    let Title = "";
    if(currentLang == "ar"){
      Title = "كشف اسعار صرف العملات";
    }
    else {
      Title = "Currency Exchange History Report";
    }

    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
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
        url = `/ProcessingOutgoingCheque/ProcoutcheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 32: //Assets Depreciation
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/DepreciationList/DepreciationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 34: //Output Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/OutputVoucherList/OutputVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 39: //Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/PurchaseInvoiceList/PurchaseInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 41: //Return Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnPurInvoiceList/ReturnPurInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 44: //Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/SalesInvoicesList/SalesInvoicesForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 45: //Return Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnSalesInvoiceList/ReturnSalesInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
        url = `/FixedassetsTypelist/AssetPurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 102: //Assets Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/AssetSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 107: //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 108: //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 110: // Disposal Assets
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedassetsTypelist/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 125: // Supplier Payment Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupppaymentvoucherList/SupppaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 126: // Supplier Receipt Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SuppReceiptvoucherList/SuppReceiptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 127: // Supplier Purchase Service Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierPurServiceInvoiceList/SupplierPurServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 128: // Supplier Debit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SuppDebitVoucherList/SuppDebitVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 129: // Supplier Credit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SuppCreditVoucherList/SuppCreditVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 130: // Customer Payment Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustpaymentvoucherList/CustpaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 131: // Customer Receipt Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustRecieptvoucherList/CustRecieptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 132: // Customer Debit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustDebitvoucherList/CustDebitvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 133: // Customer Credit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustCreditvoucherList/CustCreditvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 134: // Customer Service Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustServiceSalesInvoiceList/CustServiceSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      default:
      // Default code if none of the cases match
    }
  }
}
