import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { ReportsService } from '../reports.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-accountaging',
  templateUrl: './accountaging.component.html',
  styleUrl: './accountaging.component.scss'
})
export class AccountagingComponent implements OnInit {
  AccountAgingAddForm: FormGroup;
  selectedsup: any;
  selectedbranch: any;
  dynamicHeaders: string[] = [];
  voucherDataOriginal: any[] = [];
  statusList: any;
  accountsList: any;
  userbranchList: any;
  employeesList: any;
  currenciesList: any;


  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  isDisabled: boolean = true;

  tot1: number = 0;
  tot2: number = 0;
  tot3: number = 0;
  tot4: number = 0;
  tot5: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  tot4Formatted: string = '0';
  tot5Formatted: string = '0';

  screenId: number = 290;
  custom: boolean;
  data: any[] = [];
  public TitlePage: string;
  loading: boolean;

  constructor
    (
      private readonly title: Title,
      private readonly formbulider: FormBuilder,
      private readonly translateService: TranslateService,
      private readonly serv: ReportsService,
      private readonly alert: sweetalert,
      public readonly ValidatorsService: ValidatorsService,
      private readonly jwtAuth: JwtAuthService,
      public readonly routePartsService: RoutePartsService,
      private readonly egretLoader: AppLoaderService,
      private readonly route: ActivatedRoute,
      private readonly appCommonserviceService: AppCommonserviceService
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAgingForm();
    this.GetAgingInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetAgingForm() {

    this.AccountAgingAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      accountId: [0],
      status: [0],
      toDate: [''],
      branchId: [0],
      currencyId: [0],
      currRate: [0],
      representedId: [0],
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AccountsAging');
    this.title.setTitle(this.TitlePage);
  }

  GetAgingInitialForm() {
    this.serv.GetAccountAgingForm().subscribe((result) => {
      debugger
      if (!result.isSuccess && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.accountsList = result.accountsList;
      this.statusList = result.statusList;
      this.userbranchList = result.branchesList;
      this.employeesList = result.employeesList;
      this.currenciesList = result.currenciesList;
      this.AccountAgingAddForm.patchValue(result);
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.AccountAgingAddForm.patchValue(result);


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.isDisabled = true;
        this.AccountAgingAddForm.get("accountId").setValue(0);
        var defaultStatus = this.statusList.find(c => c.data4 == true).id;
        this.AccountAgingAddForm.get('status').setValue(defaultStatus);
        this.AccountAgingAddForm.get("currencyId").setValue(0);
        this.AccountAgingAddForm.get("representedId").setValue(0);
        this.AccountAgingAddForm.get("branchId").setValue(0);
      });
    });
  }

  GetReport() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.voucherData = [];

    const formValues = this.AccountAgingAddForm.value;
    if (formValues.branchId == null || formValues.branchId == 0) {
      formValues.branchId = -1;
    }
    if (formValues.accountId == null || formValues.accountId == 0) {
      formValues.accountId = -1;
    }
    if (formValues.status == null || formValues.status == 0) {
      formValues.status = -1;
    }
    if (formValues.representedId == null || formValues.representedId == 0) {
      formValues.representedId = -1;
    }
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.serv.GetAccountAging(
      formValues.accountId,
      formValues.status,
      formValues.toDate,
      formValues.branchId,
      formValues.representedId

    ).subscribe((result) => {


      if (Array.isArray(result)) {
        this.voucherData = result;
        this.voucherDataOriginal = structuredClone(result);
        this.data = result;
        const currentRate = Number(this.AccountAgingAddForm.get("currRate")?.value);

        if (currentRate > 0) {
          this.applyCurrencyRate(currentRate);
        } else {
          this.voucherData = [...this.voucherDataOriginal];
        }

        if (currentLang == "ar") {
          this.refreshAccountsAgingArabic(this.voucherData);
        }
        else {
          this.refreshAccountsAgingEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0) {
          this.calcultevalues();
        }
      } else {
        console.error("API response is not an array:", result);
        // Handle the case when the API response is not an array
        // You may want to set an empty array or handle it differently based on your requirements.
        // this.voucherData = [];
      }

      this.egretLoader.close();
      // this.voucherData = result;
      // if (this.voucherData.length > 0)
      //   this.calcultevalues()
      // this.egretLoader.close();
    });

  }

  clearFormData() {
    debugger
    this.voucherData = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.AccountAgingAddForm.get('toDate').setValue(currentDate);
    this.AccountAgingAddForm.get('accountId').setValue(0);
    this.AccountAgingAddForm.get('status').setValue(0);
    this.AccountAgingAddForm.get('branchId').setValue(0);
    this.AccountAgingAddForm.get('representedId').setValue(0);
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

  getFavouriteStatus(screenId) {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result.isSuccess) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }

    })
  }

  calcultevalues() {
    this.tot1 = 0;
    for (const row of this.voucherData) {
      const tot1 = Number.parseFloat(row.range_0_30);
      if (!Number.isNaN(tot1)) {
        this.tot1 += tot1;
      }

      const tot2 = Number.parseFloat(row.range_31_60);
      if (!Number.isNaN(tot2)) {
        this.tot2 += tot2;
      }

      const tot3 = Number.parseFloat(row.range_61_90);
      if (!Number.isNaN(tot3)) {
        this.tot3 += tot3;
      }

      const tot4 = Number.parseFloat(row.range_Over_90);
      if (!Number.isNaN(tot4)) {
        this.tot4 += tot4;
      }

      const tot5 = Number.parseFloat(row.totalBalance);
      if (!Number.isNaN(tot5)) {
        this.tot5 += tot5;
      }
    }
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
    this.tot3Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot3);
    this.tot4Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot4);
    this.tot5Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot5);

  }

  getExcelColumnLetter(colIndex: number): string {
    let dividend = colIndex + 1;
    let columnName = '';
    let modulo;
    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCodePoint(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }
    return columnName;
  }

  OpenStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;
    window.open(url, '_blank');
  }

  loadLazyCustomerOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.accountsList) {
      this.accountsList = [];
    }

    // Make sure the array is large enough
    while (this.accountsList.length < last) {
      this.accountsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.accountsList[i] = this.accountsList[i];
    }

    this.loading = false;
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);

      if (curr) {
        this.AccountAgingAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.AccountAgingAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.AccountAgingAddForm.get("currRate").setValue(0);
      this.applyCurrencyRate(0);
      this.calcultevalues();
    }
  }

  applyCurrencyRate(rate: number) {
    if (rate > 0) {
      this.voucherData = this.voucherDataOriginal.map(row => {
        return {
          ...row,
          total_Balance: rate > 0 ? (row.total_Balance / rate) : row.total_Balance
        };
      });
    }
    else {
      this.voucherData = [...this.voucherDataOriginal];
    }

  }

  refreshAccountsAgingArabic(data) {
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'الرقم': x.id,
      'الحساب': x.accNo + "-" + x.accNameA,
      '0-30': x.range_0_30,
      '31-60': x.range_31_60,
      '61-90': x.range_61_90,
      '> 90': x.range_Over_90,
      'الرصيد': x.totalBalance,
    }));
  }

  refreshAccountsAgingEnglish(data) {
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Account No': x.id,
      'Account': x.accNo + "-" + x.accNameA,
      '0-30': x.range_0_30,
      '31-60': x.range_31_60,
      '61-90': x.range_61_90,
      '> 90': x.range_Over_90,
      'Total Balance': x.totalBalance,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const A30 = this.voucherData.reduce((sum, item) => sum + Number.parseFloat(item.range_0_30 || 0), 0);
      const A60 = this.voucherData.reduce((sum, item) => sum + Number.parseFloat(item.range_31_60 || 0), 0);
      const A90 = this.voucherData.reduce((sum, item) => sum + Number.parseFloat(item.range_61_90 || 0), 0);
      const Above90 = this.voucherData.reduce((sum, item) => sum + Number.parseFloat(item.range_Over_90 || 0), 0);
      const TotALl = this.voucherData.reduce((sum, item) => sum + Number.parseFloat(item.totalBalance || 0), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      // التعرف على اللغة تلقائيًا
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      // ربط أسماء الأعمدة الظاهرة مع الحقول
      const fieldMap = {
        '0-30': A30,
        '31-60': A60,
        '61-90': A90,
        '> 90': Above90,
        'الرصيد': TotALl
      };

      // حساب الصف الأخير
      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => {
          const match = /\d+/.exec(key);
          return Number.parseInt(match?.[0] || '0');
        })
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // إدخال المجاميع في الأعمدة المناسبة
      headers.forEach((header, index) => {
        const trimmedHeader = header.trim(); // إزالة الفراغات من الاسم
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = this.getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      // وضع التسمية "Total" أو "المجموع" في أول عمود
      const labelCellAddress = this.getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      // تحديث نطاق الورقة
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      // إنشاء ملف الإكسل وتصديره
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "AccountAgingReport");
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    // رأس الجدول
    const head = currentLang === "ar"
      ? [['الرصيد', '> 90', '61-90', '31-60', '0-30', 'الحساب', 'الرقم']]
      : [['Balance', '> 90', '61-90', '	31-60', '0-30', 'Account', 'NO']];

    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let A30 = 0;
    let A60 = 0;
    let A90 = 0;
    let Above90 = 0;
    let TotAll = 0;
    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];

      temp[0] = part.id;
      temp[1] = part.accNo + "-" + part.accNameA;
      temp[2] = part.range_0_30;
      temp[3] = part.range_31_60;
      temp[4] = part.range_61_90;
      temp[5] = part.range_Over_90;
      temp[6] = part.totalBalance;

      A30 += Number.parseFloat(part.range_0_30) || 0;
      A60 += Number.parseFloat(part.range_31_60) || 0;
      A90 += Number.parseFloat(part.range_61_90) || 0;
      Above90 += Number.parseFloat(part.range_Over_90) || 0;
      TotAll += Number.parseFloat(part.totalBalance) || 0;

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
      footRow[3] = "المجموع";
      footRow[4] = A30.toFixed(2);
      footRow[5] = A60.toFixed(2);
      footRow[6] = A90.toFixed(2);
      footRow[7] = Above90.toFixed(2);
      footRow[8] = TotAll.toFixed(2);

    } else {
      footRow[3] = "Total";
      footRow[4] = A30.toFixed(2);
      footRow[5] = A60.toFixed(2);
      footRow[6] = A90.toFixed(2);
      footRow[7] = Above90.toFixed(2);
      footRow[8] = TotAll.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف إعمار الذمم" : "Account Aging Report";

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
