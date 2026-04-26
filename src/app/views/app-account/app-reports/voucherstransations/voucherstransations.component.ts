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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralvoucherComponent } from 'app/views/general/app-generalvoucher/app-generalvoucher.component';
import { Router } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-voucherstransations',
  templateUrl: './voucherstransations.component.html',
  styleUrls: ['./voucherstransations.component.scss']
})
export class VoucherstransationsComponent implements OnInit {
  voucherstransactionsAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedper: any;
  selectedCostId: any;
  selectedvouchers: any;
  vouchertypeList: any;
  periodsList: any;
  accountsList: any;
  userbranchList: any;
  costcenterList: any;
  Lang: string;
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
  screenId: number = 57;
  custom: boolean;
  data: any[];
  public TitlePage: string;
  tot1Formatted: string = '';
  total: number = 0;
  statusList: any;
  FromDate : any;

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
      private dialog: MatDialog,
      private title: Title,
      private router: Router,
      private appCommonserviceService: AppCommonserviceService
    ) { }


  ngOnInit(): void {
    debugger
    this.GetVoucherTransactionsForm();
    this.GetVouchersTransationsInitialForm();
    this.getFavouriteStatus(this.screenId);
    this.SetTitlePage();
  }

  GetVoucherTransactionsForm() {
    debugger
    this.voucherstransactionsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      voucherTypes: [''],
      periodId: [0],
      accountId: [0],
      branchId: [0],
      costcenterId: [0],
      voucherStatus: [0],
      fromdate: [''],
      todate: [''],
      voucherNoFrom: [''],
      voucherNoTo: [''],
      note: [''],
    });
  }

  GetVouchersTransationsInitialForm() {
    this.ReportsService.GetVoucherTransactionsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.vouchertypeList = result.voucherTypeList;
      this.periodsList = result.periodsFiscalYearsList;
      this.accountsList = result.accountList;
      this.userbranchList = result.companyBranchList;
      this.costcenterList = result.costCenterList;
      this.statusList = result.statusList;
      this.voucherstransactionsAddForm.patchValue(result);
      result.fromdate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.todate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.FromDate =formatDate(result.fromdate, "yyyy-MM-dd", "en-US");

      this.voucherstransactionsAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {

        this.voucherstransactionsAddForm.get('voucherTypes').setValue([0]);

        debugger
        if (result.periodId == null || result.periodId == undefined) {
          result.periodId = 0;
        }
        if (result.accountId == null || result.accountId == undefined) {
          result.accountId = 0;
        }
        if (result.branchId == null || result.branchId == undefined) {
          result.branchId = 0;
        }
        if (result.costcenterId == null || result.costcenterId == undefined) {
          result.costcenterId = 0;
        }
        this.selectedper = result.periodId;
        this.selectedacc = result.accountId;
        this.selectedbranch = result.branchId;
        this.selectedCostId = result.costcenterId;
        // this.voucherstransactionsAddForm.get("branchId").setValue(result.defaultBranchId);
        //this.voucherstransactionsAddForm.get("voucherStatus").setValue(-1);
        this.isPost = 1;
        this.voucherstransactionsAddForm.value.post = this.isPost;
          var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.voucherstransactionsAddForm.get('voucherStatus').setValue(defaultStatus);
        // this.SetTitlePage();
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      this.voucherData = [];
debugger
      this.voucherstransactionsAddForm.value.voucherStatus
      // = this.selectedstatus;
      if (this.voucherstransactionsAddForm.value.voucherNoFrom == null || this.voucherstransactionsAddForm.value.voucherNoFrom == -1) {
        this.voucherstransactionsAddForm.value.voucherNoFrom = null;
      }
      if (this.voucherstransactionsAddForm.value.voucherNoTo == null || this.voucherstransactionsAddForm.value.voucherNoTo == -1) {
        this.voucherstransactionsAddForm.value.voucherNoTo = null;
      }
      if (this.voucherstransactionsAddForm.value.note == null || this.voucherstransactionsAddForm.value.note == -1) {
        this.voucherstransactionsAddForm.value.note = null;
      }

      if (this.voucherstransactionsAddForm.value.costcenterId == 0) {
        this.voucherstransactionsAddForm.value.costcenterId = -1;
      }
      const formValues = this.voucherstransactionsAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }

      if (Number.isNaN(formValues.voucherTypes) || formValues.voucherTypes == undefined) {
        formValues.voucherTypes = 0;
      }


      if (Number.isNaN(formValues.costcenterId) || formValues.costcenterId == undefined) {
        formValues.costcenterId = 0;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetVoucherTransactions(
        formValues.costcenterId,
        formValues.accountId,
        formValues.voucherStatus,
        formValues.note,
        formValues.branchId,
        formValues.fromdate,
        formValues.todate,
        formValues.voucherNoFrom,
        formValues.voucherNoTo,
        formValues.voucherTypes,

      ).subscribe((result) => {
        debugger;

        this.voucherData = result.transactionsVouchersList;

        if (currentLang == "ar") {
          this.refresVoucherstransationsArabic(this.voucherData);
        }
        else {
          this.refreshVoucherstransationsEnglish(this.voucherData);
        }

        this.total = 0;
        for (const row of this.voucherData) {
          const Sum1 = parseFloat(row.amount);
          if (!isNaN(Sum1)) {
            this.total += Sum1;
          }
        }

        this.tot1Formatted += this.formatCurrency(this.total, 3);


        this.egretLoader.close();
      });
    });
  }

  PrintReport() {
    debugger
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.voucherstransactionsAddForm.value;
    if (formValues.branchId == 0) {
      formValues.branchId = -1;
    }
    if (formValues.costcenterId == 0) {
      formValues.costcenterId = -1;
    }
    if (formValues.voucherTypes == 0) {
      formValues.voucherTypes = -1;
    }
    if (formValues.accountId == 0) {
      formValues.accountId = -1;
    }

    const voucherNoFrom = formValues.voucherNoFrom ?? '';
    const voucherNoTo = formValues.voucherNoTo ?? '';
    if (this.Lang == "ar") {
      const reportUrl = `RptALLVouchersAR?CompanyId=${this.jwtAuth.getCompanyId()}&FromDate=${formValues.fromdate}&ToDate=${formValues.todate}&VoucherNoFrom=${voucherNoFrom}&VoucherNoTo=${voucherNoTo}&BranchId=${formValues.branchId}&CostCenterId=${formValues.costcenterId}&VoucherTypes=${formValues.voucherTypes}&AccountId=${formValues.accountId}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');

    }
    else {
      const reportUrl = `RptALLVouchersEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&CostCenterId=${formValues.costcenterId}&AccountId=${formValues.accountId}&VoucherStatus=${formValues.voucherStatus}&FromDate=${formValues.fromdate}&ToDate=${formValues.todate}&Note=${formValues.note}&BranchId=${formValues.branchId}&VoucherNoFrom=${formValues.voucherNoFrom}&VoucherNoTo=${formValues.voucherNoTo}&VoucherTypes=${formValues.voucherTypes}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');
    }

  }


  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('voucherstransactions');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.voucherstransactionsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetVouchersTransationsInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.voucherstransactionsAddForm.get('fromdate').setValue(this.FromDate);
    this.voucherstransactionsAddForm.get('todate').setValue(currentDate);
    this.voucherstransactionsAddForm.get('voucherTypes').setValue([0]);
    this.voucherstransactionsAddForm.get('periodId').setValue(0);
    this.voucherstransactionsAddForm.get('accountId').setValue(0);
    this.voucherstransactionsAddForm.get('branchId').setValue(0);
    this.voucherstransactionsAddForm.get('costcenterId').setValue(0);
    this.voucherstransactionsAddForm.get('voucherStatus').setValue(0);
    this.tot1Formatted = '0';
  }

  GetPeriods() {
    debugger
    if (this.voucherstransactionsAddForm.value.periodId > 0) {
      const formValues = this.voucherstransactionsAddForm.value;
      this.ReportsService.GetPeriods(formValues.periodId).subscribe((result) => {
        debugger
        this.voucherstransactionsAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.voucherstransactionsAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }

  onOptionSelect(event: any) {
    debugger
    this.voucherData = [];
    // this.trialBalanceAddForm.get('yearIds').setValue(this.selectedYears);
    // Update the selectedOptions array when an item is selected
    this.selectedvouchers = event.value;
    this.voucherstransactionsAddForm.get('voucherTypes').setValue(this.selectedvouchers);
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

  refresVoucherstransationsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'نوع السند': x.voucherTypeDesc,
        'رقم السند': x.voucherNo,
        'تاريخ السند': transDate,
        'الفرع': x.branchName,
        'العمله': x.currencyDesc,
        'سعر الصرف': x.currencyRate,
        'المجموع': x.amount,
        'ملاحظات': x.note,
        'حالة السند': x.voucherTypeStatusDesc,
      }
    });
  }

  refreshVoucherstransationsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const transDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        'Voucher Type': x.voucherTypeDesc,
        'Voucher Number': x.voucherNo,
        'Voucher Date': transDate,
        'Branch': x.branchName,
        'Currency': x.currencyDesc,
        'Exchange Rate': x.currencyRate,
        'Total': x.amount,
        'Notes': x.note,
        'Voucher Status': x.voucherTypeStatusDesc,
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
          'المجموع': totaleAmount,
        }
        : {
          'Total': totaleAmount,
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
     head = [['حالة السند', ' ملاحظات', 'المجموع', ' سعر الصرف', 'العمله', ' الفرع', ' تاريخ السند', ' رقم السند', ' نوع السند']]
  }
  else {
     head = [['Voucher Status', 'Notes', 'Total', 'Exchange Rate', 'Currency', 'Branch', ' Voucher Date', 'Voucher Number', 'Voucher Type']]
  }
    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalAmount = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {

      const date = new Date(part.transDate);
      const transDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherTypeDesc
      temp[1] = part.voucherNo
      temp[2] = transDate
      temp[3] = part.branchName
      temp[4] = part.currencyDesc
      temp[5] = part.currencyRate
      temp[6] = part.amount
      temp[7] = part.note
      temp[8] = part.voucherTypeStatusDesc

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
      footRow[5] = "المجموع";
      footRow[6] = totalAmount.toFixed(2);     // مدين
    } else {
      footRow[5] = "Total";
      footRow[6] = totalAmount.toFixed(2);     // مدين
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar"
      ? "كشف قيود جميع الحركات "
      : "Voucher Transactions Report ";

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

  openDetails(Id, Row: any) {
    debugger
    let title = this.translateService.instant('EntryVoucher');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralvoucherComponent, {
      width: '1000px',
      height: '900px',
      disableClose: true,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { id: Id, voucherName: Row.voucherTypeDesc, currencyName: Row.currencyDesc, curRate: Row.currencyRate, VoucherNo: Row.voucherNo, VoucherDate: Row.transDate, Notes: Row.note, BranchName: Row.branchName }
    });
    // dialogRef.afterClosed()
    //   .subscribe(res => {
    //     if (res !== null) {          
    //       return;
    //     }
    //   })
  }

  PrintEntryvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptAccountEntryVoucherAR?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptEntryVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}
