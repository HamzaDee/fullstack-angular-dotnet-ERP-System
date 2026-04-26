import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
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
  selector: 'app-costcentersbalance',
  templateUrl: './costcentersbalance.component.html',
  styleUrls: ['./costcentersbalance.component.scss']
})
export class CostcentersbalanceComponent implements OnInit {
  costcenterbalanceAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedcostId: any;
  accountsList: any;
  userbranchList: any;
  currancyList: any;
  costcenterList: any;
  accVoucherList: any;
  selectedstatus: number = -1;
  currenciesList:any;
  currentLang = this.jwtAuth.getLang();
  chooseText = this.currentLang === 'en' ? 'Select one' : 'اختر';
/*   statusList: { id: number; text: string }[] = [
    { id: -1, text: this.chooseText },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ]; */

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
  tot3: number = 0;
  tot4: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  tot4Formatted: string = '0';
  totalFormatted: string = '0';
  showTotals: boolean = false;
  showfatheracc: boolean = false;
  showchildacc: boolean = false;
  isZeroBalnce: boolean = false;
  selectedYears: any[] = [];
  maxSelectionLimit = 2;
  yearId1: number;
  yearId2: number;
  isSelected: boolean = false;
  screenId: number = 52;
  custom: boolean;
  public TitlePage: string;

  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: ReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private egretLoader: AppLoaderService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetCostCenterBalanceForm();
    this.GetCostCenterBalanceInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetCostCenterBalanceForm() {
    debugger
    this.costcenterbalanceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      branchId: [0],
      status: [-1],
      accId: [0],
      todate: [''],
      showGroupByAcc: [0],
      costCenterId: [0],
      currencyId:[0],
      exRate:[0],
    });
  }

  GetCostCenterBalanceInitialForm() {
    this.ReportsService.GetCostCenterBalanceForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.accountsList = result.accountList;
      this.userbranchList = result.companyBranchList;
      this.costcenterList = result.costCenterList;
      this.currenciesList = result.currenciesList;
      this.costcenterbalanceAddForm.patchValue(result);
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US");
      this.statusList = result.statusList;
      this.costcenterbalanceAddForm.patchValue(result);
      this.selectedstatus = -1;
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        if (result.accId == null || result.accId == undefined) {
          result.accId = 0;
        }
        if (result.branchId == null || result.branchId == undefined) {
          result.branchId = 0;
        }
        if (result.costCenterId == null || result.costCenterId == undefined) {
          result.costCenterId = 0;
        }
        this.selectedacc = result.accId;
        this.selectedbranch = result.branchId;
        this.selectedcostId = result.costCenterId;
        this.isDisabled = true;
        // this.costcenterbalanceAddForm.get("branchId").setValue(result.defaultBranchId);
        //this.costcenterbalanceAddForm.get("status").setValue(-1);
          var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.costcenterbalanceAddForm.get('status').setValue(defaultStatus);
        this.selectedstatus = -1;
        this.isPost = 1;
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      debugger
      this.voucherData = [];
      this.clearTotals();
      const formValues = this.costcenterbalanceAddForm.value;

      this.costcenterbalanceAddForm.value.status = this.selectedstatus;

      if (this.selectedcostId <= 0) {
        this.costcenterbalanceAddForm.value.costCenterId = -1;
      }
      if (this.selectedacc <= 0) {
        this.costcenterbalanceAddForm.value.accId = 0;
      }

      if (!this.showTotals) {
        formValues.showGroupByAcc = 0;
      }
      else {
        formValues.showGroupByAcc = 1;
      }

      if (Number.isNaN(formValues.accId) || formValues.accId == undefined) {
        formValues.accId = 0;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetCostCenterBalance(
        formValues.costCenterId,
        formValues.status,
        formValues.branchId,
        formValues.accId,
        formValues.todate,
        formValues.showGroupByAcc,
        formValues.currencyId , 
        formValues.exRate ,        
      ).subscribe((result) => {
        debugger

        this.voucherData = result;

        if (this.showTotals == false) {
          if (currentLang == "ar") {
            this.refreshCostcentersbalanceArabic(this.voucherData);
          }
          else {
            this.refreshCostcentersbalanceEnglish(this.voucherData);
          }
        }
        else {
          if (currentLang == "ar") {
            this.refreshGroupByAccountsArabic(this.voucherData);
          }
          else {
            this.refreshGroupByAccountsEnglish(this.voucherData);
          }
        }
        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('costcentersbalance');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.costcenterbalanceAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetCostCenterBalanceInitialForm();    
    const currentDate = new Date().toISOString().split('T')[0];
    this.costcenterbalanceAddForm.get('todate').setValue(currentDate);
    this.costcenterbalanceAddForm.get('currencyId').setValue(0);
    this.costcenterbalanceAddForm.get('exRate').setValue(0);
    this.costcenterbalanceAddForm.get('costCenterId').setValue(0);
    this.costcenterbalanceAddForm.get('status').setValue(0);
    this.costcenterbalanceAddForm.get('accId').setValue(0);
    this.costcenterbalanceAddForm.get('branchId').setValue(0);
    this.clearTotals();
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;


    for (const row of this.voucherData) {
      const balance1 = parseFloat(row.balance);



      if (!isNaN(balance1)) {
        this.tot1 += balance1;
      }
    }
    this.tot1Formatted = this.formatWithCommas(this.tot1);
  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;
    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
    this.tot3Formatted = '0';
    this.tot4Formatted = '0';
    this.totalFormatted = '0';
  }

  ontotalChange() {
    debugger
    this.voucherData = [];
    this.selectedYears = [];
    this.clearTotals();
  }

  OpenAccountStatementForm(CostCenterNo: number, acc: number) {
    this.routePartsService.GuidToEdit = CostCenterNo;
    this.routePartsService.Guid2ToEdit = acc;

    // Construct the URL you want to navigate to

    const url = `/AccountingReports/GetCostTransactionsForm?CostCenterNo=${CostCenterNo}&acc=${acc}`;
    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  //   OpenCostTransactionsForm(CostCenterNo: number) {
  //     debugger
  //   this.routePartsService.GuidToEdit = CostCenterNo
  //   // this.routePartsService.Guid2ToEdit = 'Edit';
  //   this.router.navigate(['AccountingReports/costcentertransactions']);
  // }

  OpenCostTransactionsForm(CostCenterNo: number) {
    this.routePartsService.GuidToEdit = CostCenterNo;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetCostTransactionsForm?CostCenterNo=${CostCenterNo}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
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

  PrintReport() {
    debugger
    const formValues = this.costcenterbalanceAddForm.value;
  }

  refreshCostcentersbalanceArabic(data) { // defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رقم مركز الكلفة ': x.costCenterNumber,
      'اسم مركز الكلفة': x.costCenterName,
      'الرصيد': x.balance,
    }));
  }

  refreshCostcentersbalanceEnglish(data) {// defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Cost Center Number ': x.costCenterNumber,
      'Cost Center Name': x.costCenterName,
      'Balance': x.balance,
    }));
  }

  refreshGroupByAccountsArabic(data) { // GroupByAccounts
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رقم مركز الكلفة ': x.costCenterNumber,
      'اسم مركز الكلفة': x.costCenterName,
      'رقم الحساب ': x.accountNumber,
      'اسم  الحساب': x.accountName,
      'الرصيد': x.balance,
    }));
  }

  refreshGroupByAccountsEnglish(data) {// GroupByAccounts
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Cost Center Number ': x.costCenterNumber,
      'Cost Center Name': x.costCenterName,
      'Account Number ': x.accountNumber,
      'Account Name': x.accountName,
      'Balance': x.balance,
    }));
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      // حساب المجاميع
      const totalBalance = this.voucherData.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'الرصيد': totalBalance,
        }
        : {
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

  exportExcel2() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      // حساب المجاميع
      const totalBalance = this.voucherData.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'الرصيد': totalBalance,
        }
        : {
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

  exportPdf1() {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [[' الرصيد ', 'اسم مركز الكلفة', 'رقم مركز الكلفة']];
    } else {
      head = [['Balance', 'Cost Center Name', 'Cost Center Number']];
    }

    const rows: (number | string)[][] = [];
    let totalBalance = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.costCenterNumber;
      temp[1] = part.costCenterName;
      temp[2] = part.balance;
      totalBalance += parseFloat(part.balance) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // لعكس الأعمدة حسب اللغة
    });

    // إعداد تذييل الجدول
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[1] = "المجموع";
      footRow[2] = totalBalance.toFixed(2);
    } else {
      footRow[1] = "Total";
      footRow[2] = totalBalance.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إنشاء ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? " تقرير ارصدة مراكز الكلف": "Cost Center Balance Report";

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

  exportPdf2() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    let head: string[][] = currentLang == "ar"
      ? [[' الرصيد ', 'اسم الحساب ', 'رمز الحساب ', 'اسم مركز الكلفة', 'رقم مركز الكلفة']]
      : [['Balance', 'Account Name', 'Account Number', 'Cost Center Name', 'Cost Center Number']];

    const rows: (number | string)[][] = [];
    let totalBalance = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.costCenterNumber;
      temp[1] = part.costCenterName;
      temp[2] = part.accountNumber;
      temp[3] = part.accountName;
      temp[4] = part.balance;
      totalBalance += parseFloat(part.balance) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // لعكس الأعمدة حسب اللغة
    });

    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill('');

    if (currentLang === "ar") {
      footRow[3] = "المجموع";
      footRow[4] = totalBalance.toFixed(2);
    } else {
      footRow[3] = "Total";
      footRow[4] = totalBalance.toFixed(2);
    }

    const foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? " تقرير أرصدة مراكز الكلف حسب الحساب" : "Cost Center Balance Report by Account";

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

 onCurrencyChange(value:any)
  {
    debugger;
    if(value > 0)
    {
      let curr = this.currenciesList.find(c => c.id == value);
      if(curr)
      {
        this.costcenterbalanceAddForm.get("exRate").setValue(Number(curr.data1)) 
      }
      else
      {
        this.costcenterbalanceAddForm.get("exRate").setValue(0); 
      }
    }
    else
      {
        this.costcenterbalanceAddForm.get("exRate").setValue(0);
      }
  }

}
