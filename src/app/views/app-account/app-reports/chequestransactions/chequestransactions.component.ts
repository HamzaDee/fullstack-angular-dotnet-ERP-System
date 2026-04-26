import { Component,OnInit } from '@angular/core';
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
import { ActivatedRoute, Params } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-chequestransactions',
  templateUrl: './chequestransactions.component.html',
  styleUrls: ['./chequestransactions.component.scss']
})
export class ChequestransactionsComponent implements OnInit {
  cheqstransactionsAddForm: FormGroup;
  selectedcheq: any;
  cheqsList: any;
  cheqStatusList: any;
  accountsList: any;
  userbranchList: any;
  bankList: any;
  cheqNo: number;
  selectedstatus: number = -1;
/* 
  statusList: { id: number; text: string }[] = [
    { id: -1, text: this.jwtAuth.getLang() === 'en' ? 'Select' : 'اختر' },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ]; */
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  data: any;
  isPost: number = 1;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 73;
  custom: boolean;
  public TitlePage: string;
    statusList: any;


  constructor
    (
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: ReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private title: Title,
      private readonly serv: AppCommonserviceService,
    ) { }


  ngOnInit(): void {
    debugger
    this.SetTitlePage();

    // this.cheqNo = this.routePartsService.GuidToEdit;
    this.route.queryParams.subscribe((params: Params) => {
      this.cheqNo = +params['cheq'];
    });
    this.GetChquesTransactionsForm();
    this.GetChequesTransationsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetChquesTransactionsForm() {
    debugger
    this.cheqstransactionsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      cheqId: [0, [Validators.required, Validators.min(1)]],
      dueDate: [''],
      amount: [0],
      cheqstatus: [''],
      recievedDate: [''],
      drawerName: [''],
      bankName: [''],
      voucherStatus: [0],
      cheqNumber: [0],
    });
  }

  GetChequesTransationsInitialForm() {
    this.ReportsService.GetChequesTransForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.cheqsList = result.cheqsList;
      this.cheqStatusList = result.cheqStatusList;
      this.bankList = result.banksList;
      this.statusList = result.statusList;
      this.cheqstransactionsAddForm.patchValue(result);
      // debugger
      // result.fromdate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      // result.todate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      // debugger

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedstatus = -1;
        if (result.cheqId == null || result.cheqId == undefined) {
          result.cheqId = 0;
        }
        this.selectedcheq = result.cheqId;
        debugger
        if (!isNaN(Number(this.cheqNo)) && Number(this.cheqNo) !== 0) {
          this.selectedcheq = this.cheqNo;
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.cheqstransactionsAddForm.get('voucherStatus').setValue(defaultStatus);
        }
        // if (this.cheqNo != 0) {
        //   this.selectedcheq = this.cheqNo;
        // }

        debugger



      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.cheqstransactionsAddForm.value.voucherStatus 
      //= this.selectedstatus;
      const formValues = this.cheqstransactionsAddForm.value;
      debugger
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

      if (Number.isNaN(formValues.cheqId) || formValues.cheqId == undefined) {
        formValues.cheqId = 0;
      }

      this.ReportsService.GetChequesTransactions(
        formValues.cheqId,
        formValues.voucherStatus,

      ).subscribe((result) => {
        debugger;

        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresChequestransactionArabic(this.voucherData);
        }
        else {
          this.refreshChequestransactionEnglish(this.voucherData);
        }

        if (result.length != 0) {
          this.cheqstransactionsAddForm.get("cheqNumber").setValue(result[0].chequeNo);
          this.cheqstransactionsAddForm.get("dueDate").setValue(formatDate(result[0].dueDate, "yyyy-MM-dd", "en-US"));
          this.cheqstransactionsAddForm.get("amount").setValue(result[0].amount);
          this.cheqstransactionsAddForm.get("drawerName").setValue(result[0].drawerName);
          this.cheqstransactionsAddForm.get("recievedDate").setValue(formatDate(result[0].cheqDate, "yyyy-MM-dd", "en-US"));
          this.cheqstransactionsAddForm.get("bankName").setValue(result[0].bankName);
          this.cheqstransactionsAddForm.get("cheqstatus").setValue(result[0].chequeStatusName);
        }

        this.egretLoader.close();

      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('cheqstransactions');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.cheqstransactionsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetChequesTransationsInitialForm();
    this.cheqstransactionsAddForm.get('cheqId').setValue(0);
    this.cheqstransactionsAddForm.get('voucherStatus').setValue(0);
  }

  ClearData() {
    debugger
    this.voucherData = [];
    this.cheqstransactionsAddForm.get("voucherStatus").setValue(0);
    this.cheqstransactionsAddForm.get("cheqNumber").setValue('');
    this.cheqstransactionsAddForm.get("dueDate").setValue('');
    this.cheqstransactionsAddForm.get("amount").setValue('');
    this.cheqstransactionsAddForm.get("drawerName").setValue('');
    this.cheqstransactionsAddForm.get("recievedDate").setValue('');
    this.cheqstransactionsAddForm.get("bankName").setValue('');
    this.cheqstransactionsAddForm.get("cheqstatus").setValue('');

  }

  findCheqIdByCheqNumber(targetCheqNumber: string): number | null {
    const cheque = this.cheqsList.find(cheque => cheque.cheqNumber === targetCheqNumber);
    return cheque ? cheque.cheqId : null;
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

  refresChequestransactionArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
      'رقم السند': x.voucherNo,
      'نوع السند': x.voucherName,
      'تاريخ السند': voucherDate,
      'ملاحظات': x.note,
      }
    });
  }

  refreshChequestransactionEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
      'Voucher Number': x.voucherNo,
      'Voucher Type': x.voucherName,
      'Voucher Date':voucherDate,
      'Notes': x.note,
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

  exportPdf()
  {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
       head = [[' ملاحظات',' تاريخ السند',' نوع السند',' رقم السند']]    }
    else{
       head = [['Notes',' Voucher Date','Voucher Type','Voucher Number']]
    }
    var rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = voucherDate
      temp[3] = part.note

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
     Title = "كشف حركة شيك ";
  }
   else{
     Title = "Cheque Transactions Report ";
   }
  
   let pageWidth = pdf.internal.pageSize.width;
   pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
  
   autoTable(pdf as any, {
    head  :head,
    body :rows,
    headStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold' ,textColor: "black", lineWidth: 0.2 ,minCellWidth:20},
    bodyStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold'},
    theme:"grid",
  });
   pdf.output('dataurlnewwindow')
  }

  OpenVoucher(id, categoryId) {
    debugger
    var url = '';
    var invId = 0;
    debugger;
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
      case 26:  //  قائمة معالجة الشيكات الواردة
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
}
