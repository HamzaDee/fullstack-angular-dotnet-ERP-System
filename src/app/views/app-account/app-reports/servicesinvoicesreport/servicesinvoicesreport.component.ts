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
  selector: 'app-servicesinvoicesreport',
  templateUrl: './servicesinvoicesreport.component.html',
  styleUrls: ['./servicesinvoicesreport.component.scss']
})
export class ServicesinvoicesreportComponent implements OnInit {
  servInvAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedserv: any;
  selectedemp: any;
  selectedtype: any;
  vouchertypeList: any;
  servicesList: any;
  employeeList: any;
  userbranchList: any;
  total: number;
  totalF: string = '0';
  sts: number = -1;
  hidden: boolean = true;
  selectedstatus: number;
  currentLang = this.jwtAuth.getLang();
  chooseText = this.currentLang === 'en' ? 'Select one' : 'اختر';
/*   statusList: { id: number; text: string }[] = [
    { id: -1, text: this.chooseText },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ]; */
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isPost: number = 1;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 83;
  custom: boolean;
  data: any[];
  public TitlePage: string;
  accountsList: any;
  selectedaccNo: any;
    statusList: any;
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
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetServiceInvoiceForm();
    this.GetServiceInvoiceInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetServiceInvoiceForm() {
    debugger
    this.servInvAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromdate: [''],
      todate: [''],
      voucherNoFrom: [''],
      voucherNoTo: [''],
      voucherStatus: [0],
      serviceId: [0],
      vouchertypeId: [0],
      note: [''],
      employeeId: [0],
      branchId: [0],
      custName: [''],
      accId: [0]
    });
  }

  GetServiceInvoiceInitialForm() {
    this.ReportsService.GetServicesInvoiceForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.vouchertypeList = result.voucherTypeList;
      this.servicesList = result.servicesList;
      this.employeeList = result.employees;
      this.userbranchList = result.companyBranchList;
      this.accountsList = result.accountsList;
      this.statusList = result.statusList;
      this.servInvAddForm.patchValue(result);
      result.fromDateTime = formatDate(result.fromDateTime, "yyyy-MM-dd", "en-US")
      result.toDateTime = formatDate(result.toDateTime, "yyyy-MM-dd", "en-US")
      this.servInvAddForm.patchValue(result);


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if (result.serviceID == null || result.serviceID == undefined) {
          result.serviceID = 0;
        }
        if (result.accountId == null || result.accountId == undefined) {
          result.accountId = 0;
        }
        if (result.branchId == null || result.branchId == undefined) {
          result.branchId = 0;
        }
        if (result.employeeID == null || result.employeeID == undefined) {
          result.employeeID = 0;
        }
        if (result.voucherTypeID == null || result.voucherTypeID == undefined) {
          result.voucherTypeID = 0;
        }

        this.selectedserv = result.serviceID;
        this.selectedacc = result.accountId;
        this.selectedbranch = result.branchId;
        this.selectedemp = result.employeeID;
        this.selectedtype = result.voucherTypeID;

       // this.servInvAddForm.get("voucherStatus").setValue(-1);
        this.servInvAddForm.get("fromdate").setValue(formatDate(result.fromDateTime, "yyyy-MM-dd", "en-US"));
        this.servInvAddForm.get("todate").setValue(formatDate(result.toDateTime, "yyyy-MM-dd", "en-US"));
        this.servInvAddForm.get("accId").setValue(0);
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.servInvAddForm.get('voucherStatus').setValue(defaultStatus);
        debugger

        this.sts = -1;
        this.servInvAddForm.value.post = this.isPost;
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
      this.total = 0;
       this.totalF ='0';
      const formValues = this.servInvAddForm.value;

      //formValues.voucherStatus = this.selectedstatus;
      if (formValues.voucherNoFrom == 0 || formValues.voucherNoTo == 0 || formValues.voucherNoFrom == null || formValues.voucherNoTo == null) {
        formValues.voucherNoFrom = 0;
        formValues.voucherNoTo = 0;
      }
      if (formValues.serviceId == 0) {
        formValues.serviceId = -1;
      }
      if (formValues.vouchertypeId == 0) {
        formValues.vouchertypeId = -1;
      }
      if (formValues.employeeId == 0) {
        formValues.employeeId = -1;
      }
      if (formValues.branchId == 0) {
        formValues.branchId = -1;
      }
      if (formValues.note == null || formValues.note == "") {
        formValues.note = '-1';
      }
      if (formValues.custName == null || formValues.custName == "") {
        formValues.custName = '-1';
      }

      if (Number.isNaN(formValues.branchId) || formValues.branchId == undefined) {
        formValues.branchId = -1;
      }

      if (formValues.accId == 0) {
        formValues.accId = -1;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetServiceInvoices(
        formValues.fromdate,
        formValues.todate,
        formValues.voucherNoFrom,
        formValues.voucherNoTo,
        formValues.voucherStatus,
        formValues.serviceId,
        formValues.vouchertypeId,
        formValues.note,
        formValues.employeeId,
        formValues.branchId,
        this.sts,
        formValues.custName,
        formValues.accId,
      ).subscribe((result) => {
        debugger;

        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresCurrencyexchangeratehistoryArabic(this.voucherData);
        }
        else {
          this.refreshCurrencyexchangeratehistoryeEnglish(this.voucherData);
        }

        this.calcultevalues();
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('servicesinvoicereport');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.servInvAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    this.GetServiceInvoiceInitialForm();
    //this.clearTotals()
   // this.total = 0;
    this.totalF ='0';
  }

  GetPeriods() {
    debugger
    if (this.servInvAddForm.value.periodId > 0) {
      const formValues = this.servInvAddForm.value;
      this.ReportsService.GetPeriods(formValues.periodId).subscribe((result) => {
        debugger
        this.servInvAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.servInvAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }

  calcultevalues() {
    debugger
    this.total = 0;
    for (const row of this.voucherData) {
      const total = parseFloat(row.voucherAmount);
      if (!isNaN(total)) { this.total += total; }
      this.totalF = this.formatWithCommas(this.total);
    }
  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.totalF ='0';
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
    debugger
    var url = '';
    var invId = 0;
    debugger;
    switch (catId) {
      case 127: // Supplier Purchase Service Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesPurchaseInv/SupplierPurServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 134: // Customer Service Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesSalesInv/CustServiceSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 48: //Service  Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesInv/ServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
      case 174: //Service  Return
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

  refresCurrencyexchangeratehistoryArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
      'نوع الفاتورة': x.voucherName,
      'رقم الفاتورة': x.voucherNo,
      'تاريخ الفاتورة': voucherDate,
      'اسم العميل': x.custName,
      'الفرع': x.branchName,
      'المندوب': x.employeeName,
      'شروط الدفع': x.pdTerm,
      'الخدمات': x.serviceName,
      'ملاحظات': x.note,
      'القيمة': x.voucherAmount,
      }
    });
  }

  refreshCurrencyexchangeratehistoryeEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
      'Voucher Type': x.voucherName,
      'Voucher Number': x.voucherNo,
      'Voucher Date': voucherDate,
      'Customer Name': x.custName,
      'Branch ': x.branchName,
      'Man': x.employeeName,
      'Payment Terms': x.pdTerm,
      'Services ': x.serviceName,
      'Notes': x.note,
      'Amount': x.voucherAmount,
      }
    });
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totalAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.voucherAmount || 0), 0);


      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'القيمة': totalAmount,
        }
        : {
          'Amount': totalAmount,
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
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
           head = [[ 'القيمة','ملاحظات','الخدمات',' شروط الدفع',' المندوب',   'الفرع',' اسسم العميل',' تاريخ الفاتورة',' رقم الفاتورة',' نوع الفاتورة']] }
      else{
           head = [[ 'Amount','Notes','Services','Payment Terms','Man','Branch','Customer Name','Voucher Date','Voucher Number','Voucher Type']]
      }
    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalAmount = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
     temp[0]= part.voucherName
     temp[1]= part.voucherNo 
     temp[2]= voucherDate
     temp[3]= part.custName
     temp[4]= part.branchName 
     temp[5]= part.employeeName
     temp[6]= part.pdTerm 
     temp[7]= part.serviceName
     temp[8]= part.note
     temp[9]= part.voucherAmount 

     totalAmount += parseFloat(part.voucherAmount) || 0;


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
      footRow[8] = "المجموع";
      footRow[9] = totalAmount.toFixed(2);     // مدين
    } else {
      footRow[8] = "Total";
      footRow[9] = totalAmount.toFixed(2);     // مدين
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "كشف فواتير الخدمات التفصيلي "
      : "Service Invoice Statment Report";

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
