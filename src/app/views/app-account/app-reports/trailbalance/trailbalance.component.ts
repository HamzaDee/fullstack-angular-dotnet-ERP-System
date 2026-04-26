import { Component, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-trailbalance',
  templateUrl: './trailbalance.component.html',
  styleUrls: ['./trailbalance.component.scss']
})
export class TrailbalanceComponent implements OnInit {
  trialBalanceAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedper: any;
  selectedCur: any;
  selectedyear: any;
  accountsList: any;
  userbranchList: any;
  currancyList: any;
  periodsList: any;
  fiscalyearList: any;
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
  screenId: number = 41;
  custom: boolean;
  data: any[];
  public TitlePage: string;
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
      private routePartsService: RoutePartsService,
      private router: Router,
      private egretLoader: AppLoaderService,
      private readonly serv: AppCommonserviceService,
    ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetTrialBalanceForm();
    this.GetTrialbalanceInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetTrialBalanceForm() {
    debugger
    this.trialBalanceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      branchId: [0],
      level: [0, [Validators.required, Validators.min(1)]],
      status: [-1],
      accId: [0],
      fromdate: [''],
      todate: [''],
      periodId: [0],
      yearIds: [''],
      zerobalance: [0],
      branchedacc: [0],
      showtotals: [0],
      mainacc: [0],
      costCenterId: [0],
      currencyId: [0],
      exRate: [0],
    });
  }

  GetTrialbalanceInitialForm() {
    this.ReportsService.GetTrailBalanceForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.accountsList = result.accountsList;
      this.statusList = result.statusList;
      this.userbranchList = result.companyBranchList;
      this.periodsList = result.periodsFiscalYearsList;
      this.fiscalyearList = result.fiscalYearsList;
      this.currancyList = result.currencyList;

      debugger
      this.trialBalanceAddForm.patchValue(result);
      result.fromdate = formatDate(result.fromdate, "yyyy-MM-dd", "en-US")
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US")
      this.FromDate =formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      this.trialBalanceAddForm.patchValue(result);
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.trialBalanceAddForm.get('status').setValue(defaultStatus);
        this.selectedacc = result.accId;
        this.selectedbranch = result.branchId;
        this.selectedper = result.periodId;
        this.selectedCur = result.currencyId;
        this.trialBalanceAddForm.get('currencyId').setValue(0);

        // this.selectedyear= result.currencyId; 
        this.isDisabled = true;
        // var currRate = result.currencyList.find(option => option.id === result.defaultCurrency).data1;
        // this.trialBalanceAddForm.get("exRate").setValue(currRate);
        // this.trialBalanceAddForm.get("branchId").setValue(result.defaultBranchId);
        this.isPost = 1;
        // this.trialBalanceAddForm.value.post = this.isPost; 
        debugger
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    if (this.trialBalanceAddForm.value.fromdate > this.trialBalanceAddForm.value.todate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }

    debugger
    setTimeout(() => {
      debugger
      if (this.isSelected) {
        this.voucherData = [];
        this.clearTotals();
        const formValues = this.trialBalanceAddForm.value;

        if (!this.showfatheracc) {
          formValues.mainacc = -1;
        }
        else {
          formValues.mainacc = 1;
        }

        if (!this.showchildacc) {
          formValues.branchedacc = -1;
        }
        else {
          formValues.branchedacc = 1;
        }
        formValues.costCenterId = -1;
        //formValues.currencyId = 1;
        //formValues.exRate = 1;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.ReportsService.GetTrialBalanceByYears(
          formValues.accId,
          formValues.status,
          formValues.branchId,
          formValues.costCenterId,
          formValues.currencyId,
          formValues.level,
          formValues.exRate,
          formValues.branchedacc,
          formValues.mainacc,
          this.yearId1,
          this.yearId2,
        ).subscribe((result) => {
          debugger

          this.voucherData = result;

          if (currentLang == "ar") {
            this.refreshisSelectedArabic(this.voucherData);
          }
          else {
            this.refreshisSelectedEnglish(this.voucherData);
          }

          this.calcultevalues()
          this.egretLoader.close();
        });
      }

      else {
        this.voucherData = [];
        this.clearTotals();
        const formValues = this.trialBalanceAddForm.value;

        if (formValues.branchId == null) {
          formValues.branchId = 0;
        }

        if (!this.showfatheracc) {
          formValues.mainacc = -1;
        }
        else {
          formValues.mainacc = 1;
        }

        if (!this.showchildacc) {
          formValues.branchedacc = -1;
        }
        else {
          formValues.branchedacc = 1;
        }


        if (!this.isZeroBalnce) {
          formValues.zerobalance = -1;
        }
        else {
          formValues.zerobalance = 1;
        }

        formValues.costCenterId = -1;
        //formValues.currencyId = 1;
        //formValues.exRate = 1;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.ReportsService.GetTrialBalance(
          formValues.accId,
          formValues.status,
          formValues.branchId,
          formValues.fromdate,
          formValues.todate,
          formValues.costCenterId,
          formValues.currencyId,
          formValues.level,
          formValues.exRate,
          formValues.zerobalance,
          formValues.branchedacc,
          formValues.mainacc,

        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;

          if (this.showTotals == true) {
            if (currentLang == "ar") {
              this.refreshshowTotalsArabic(this.voucherData);
            }
            else {
              this.refreshshowTotalsEnglish(this.voucherData);
            }
          }
          else {
            if (currentLang == "ar") {
              this.refreshGetTrialBalanceArabic(this.voucherData);
            }
            else {
              this.refreshGetTrialBalanceEnglish(this.voucherData);
            }
          }

          this.calcultevalues()
          this.egretLoader.close();
        });

      }
    });

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('trailbalance');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.trialBalanceAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetTrialbalanceInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.trialBalanceAddForm.get('fromdate').setValue(this.FromDate);
    this.trialBalanceAddForm.get('todate').setValue(currentDate);
    this.trialBalanceAddForm.get('currencyId').setValue(0);
    this.trialBalanceAddForm.get('exRate').setValue(0);
    this.trialBalanceAddForm.get('branchId').setValue(0);
    this.trialBalanceAddForm.get('level').setValue(1);
    this.trialBalanceAddForm.get('status').setValue(0);
    this.trialBalanceAddForm.get('accId').setValue(0);
    this.trialBalanceAddForm.get('periodId').setValue(0);
    this.clearTotals();
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;
    if (!this.voucherData || this.voucherData.length === 0) return;
    const minLevel = Math.min(...this.voucherData.map(row => row.accountLevel));
    if (this.isSelected) {
      for (const row of this.voucherData) {
        const Year1Balance = parseFloat(row.year1Balance);
        const Year2Balance = parseFloat(row.year2Balance);
        if (!isNaN(Year1Balance)) {
          this.tot1 += Year1Balance;
        }
        if (!isNaN(Year2Balance)) {
          this.tot2 += Year2Balance;
        }
      }
      this.tot1Formatted = this.formatWithCommas(this.tot1);
      this.tot2Formatted = this.formatWithCommas(this.tot2);
    }

    else if (this.showTotals) {
      if (this.showchildacc) {
        this.tot1 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return balanceTotal > 0 ? sum + balanceTotal : sum;
        }, 0);
        this.tot2 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return balanceTotal < 0 ? sum + balanceTotal * -1 : sum;
        }, 0);
      }
      else {
        this.tot1 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return row.accountLevel === minLevel && balanceTotal > 0 ? sum + balanceTotal : sum;
        }, 0);
        this.tot2 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return row.accountLevel === minLevel && balanceTotal < 0 ? sum + balanceTotal * -1 : sum;
        }, 0);
      }

      this.tot1Formatted = this.formatWithCommas(this.tot1);
      this.tot2Formatted = this.formatWithCommas(this.tot2);
    }

    else {
      if (this.showchildacc) {
        this.total = this.voucherData.reduce((sum, row) => sum + (parseFloat(row.openingBalance) || 0), 0);
        this.tot1 = this.voucherData.reduce((sum, row) => sum + (parseFloat(row.debitTransaction) || 0), 0);
        this.tot2 = this.voucherData.reduce((sum, row) => sum + (parseFloat(row.creditTransaction) || 0), 0);
        this.tot3 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return balanceTotal > 0 ? sum + balanceTotal : sum;
        }, 0);
        this.tot4 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return balanceTotal < 0 ? sum + balanceTotal * -1 : sum;
        }, 0);
      }
      else {
        this.total = this.voucherData.reduce((sum, row) => {
          const openingBalance = parseFloat(row.openingBalance);
          return row.accountLevel === minLevel ? sum + openingBalance : sum;
        }, 0);
        this.tot1 = this.voucherData.reduce((sum, row) => {
          const debitTransaction = parseFloat(row.debitTransaction);
          return row.accountLevel === minLevel ? sum + debitTransaction : sum;
        }, 0);
        this.tot2 = this.voucherData.reduce((sum, row) => {
          const creditTransaction = parseFloat(row.creditTransaction);
          return row.accountLevel === minLevel ? sum + creditTransaction : sum;
        }, 0);
        this.tot3 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return row.accountLevel === minLevel && balanceTotal > 0 ? sum + balanceTotal : sum;
        }, 0);
        this.tot4 = this.voucherData.reduce((sum, row) => {
          const balanceTotal = parseFloat(row.balanceTotal);
          return row.accountLevel === minLevel && balanceTotal < 0 ? sum + balanceTotal * -1 : sum;
        }, 0);
      }


      this.tot1Formatted = this.formatWithCommas(this.tot1);
      this.tot2Formatted = this.formatWithCommas(this.tot2);
      this.tot3Formatted = this.formatWithCommas(this.tot3);
      this.tot4Formatted = this.formatWithCommas(this.tot4);
      this.totalFormatted = this.formatWithCommas(this.total);
    }
  }

  formatWithCommas(value: number): string {
    let threshold = 1e-10;
    value = Math.abs(value) < threshold ? 0 : value;
    //return value.toFixed(3).toLocaleString();
    return value.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
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

  getCurrencyRate(event: any) {
    debugger
    if (event > 0) {
      const selectedValue = event;
      var currRate = this.currancyList.find(option => option.id === selectedValue).data1;
      this.trialBalanceAddForm.get("exRate").setValue(currRate);
    }

  }

  GetPeriods() {
    debugger
    if (this.trialBalanceAddForm.value.periodId > 0) {
      const formValues = this.trialBalanceAddForm.value;
      this.ReportsService.GetPeriods(formValues.periodId).subscribe((result) => {
        debugger
        this.trialBalanceAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.trialBalanceAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }

  ontotalChange() {
    debugger
    this.voucherData = [];
    this.selectedYears = [];
    this.trialBalanceAddForm.get('yearIds').setValue(this.selectedYears);
    if (this.showTotals) {

      this.clearTotals();
      this.isSelected = false;
      this.voucherData = [];
    }
  }

  onchildChange() {
    this.voucherData = [];
    if (this.showchildacc) {
      // Fetch or set fiscal year table data when the checkbox is checked
      this.showfatheracc = false;
      this.clearTotals()
    }
  }

  onFatherChange() {
    this.voucherData = [];
    if (this.showfatheracc) {
      // Fetch or set fiscal year table data when the checkbox is checked
      this.showchildacc = false;
      this.clearTotals()
    }
  }

  onOptionSelect(event: any) {
    debugger
    this.voucherData = [];
    // this.trialBalanceAddForm.get('yearIds').setValue(this.selectedYears);
    // Update the selectedOptions array when an item is selected
    this.selectedYears = event.value;
    this.trialBalanceAddForm.get('yearIds').setValue(this.selectedYears);
    if (this.selectedYears.length > this.maxSelectionLimit) {
      // "Swipe" the last option by removing it
      this.selectedYears.shift();
      this.trialBalanceAddForm.get('yearIds').setValue(this.selectedYears);

    }
    const [year1, year2] = this.selectedYears;
    this.yearId1 = year1;
    this.yearId2 = year2;
    if (this.selectedYears.length == 2) {
      this.isSelected = true
    }
    else {
      this.isSelected = false
    }
    debugger
    this.showTotals = false
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

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
    const formValues = this.trialBalanceAddForm.value;
    const rptDetails = 'المستوى : ' + formValues.level + ' من تاريخ : ' + formValues.fromdate + ' الى تاريخ : ' + formValues.todate
    const reportUrl = `rptTrialBalance?Lang=ar&CompanyId=${this.jwtAuth.getCompanyId()}&AccountId=${formValues.accId}&Status=${formValues.status}&BranchId=${formValues.branchId}
        &FromDate=${formValues.fromdate}&ToDate=${formValues.todate}&ConversionPrice=${formValues.exRate}&CurrencyId=${formValues.currencyId}&rptDetails=${rptDetails}
        &Level=${formValues.level}&NotShowingAccountsWithZeroBalance=${formValues.zerobalance == true ? 0 : -1}&ShowOnlyNotBranchedAccounts=${formValues.branchedacc == true ? 0 : -1}&ShowOnlyMainAccounts=${formValues.mainacc == true ? 0 : -1}`;
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/report-viewer'], {
        queryParams: { reportUrl }
      })
    );
    window.open(url, '_blank');
  }

  refreshGetTrialBalanceArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رمز الحساب': x.accountNo,
      'اسم الحساب': x.accountName,
      'رصيد بداية المدة': x.openingBalance,
      'الحركات المدينة': x.debitTransaction,
      'الحركات الدائنة': x.creditTransaction,
      'الرصيد المدين': x.balanceTotal > 0 ? x.balanceTotal : 0,
      'الرصيد الدائن': x.balanceTotal < 0 ? x.balanceTotal * -1 : 0,
    }));
  }

  refreshGetTrialBalanceEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Account Number': x.accountNo,
      'Account Name': x.accountName,
      'Beginning Balance': x.openingBalance,
      'Debit Transaction': x.debitTransaction,
      'Credit Transaction': x.creditTransaction,
      'Debit Balance': x.balanceTotal > 0 ? x.balanceTotal : 0,
      'Credit Balance': x.balanceTotal < 0 ? x.balanceTotal * -1 : 0,
    }));
  }

  refreshshowTotalsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رمز الحساب': x.accountNo,
      'اسم الحساب': x.accountName,
      'الرصيد المدين': (x.balanceTotal > 0 ? x.balanceTotal : 0),
      'الرصيد الدائن': (x.balanceTotal < 0 ? x.balanceTotal * -1 : 0),
    }));
  }

  refreshshowTotalsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Account Number': x.accountNo,
      'Account Name': x.accountName,
      'Balance Depit': (x.balanceTotal > 0 ? x.balanceTotal : 0),
      'Balance Credit': (x.balanceTotal < 0 ? x.balanceTotal * -1 : 0),
    }));
  }

  refreshisSelectedArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رمز الحساب': x.accountNo,
      'اسم الحساب': x.accountName,
      'مجموع السنه 1': x.year1Balance,
      'مجموع السنه 2': x.year2Balance,
    }));
  }

  refreshisSelectedEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Account Number': x.accountNo,
      'Account Name': x.accountName,
      'Year 1 Balance': x.year1Balance,
      'Year 2 Balance': x.year2Balance,
    }));
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportExcel1() {
  import("xlsx").then(xlsx => {

    // تحويل البيانات إلى صفوف (AOA = Array of Arrays)
    const worksheet = xlsx.utils.json_to_sheet(this.exportData);
    const headers = Object.keys(this.exportData[0]);

    const title = this.translateService.instant('trailbalance'); // اسم التقرير
    const lastColLetter = getExcelColumnLetter(headers.length - 1);

    // 🟩 استخراج البيانات من الورقة وتحويلها إلى مصفوفة
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // 🟩 إدراج العنوان في الصف الأول + صف فارغ بعده
    data.unshift([]);       // صف فارغ
    data.unshift([title]);  // صف العنوان

    // 🟩 إنشاء ورقة جديدة بالبيانات الجديدة
    const newWorksheet = xlsx.utils.aoa_to_sheet(data as any[][]);

    // 🟩 دمج الخلايا من A1 حتى آخر عمود
    newWorksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
    ];

    // 🔹 تنسيق العنوان (اختياري)
    newWorksheet['A1'].s = {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    // 🔹 الآن نحسب المجاميع كما في كودك
    const totalBalance = parseFloat((this.totalFormatted || '0').replace(/,/g, ''))
    const DebitTransaction = parseFloat((this.tot1Formatted || '0').replace(/,/g, ''))
    const CreditTransaction = parseFloat((this.tot2Formatted || '0').replace(/,/g, ''))
    const totalDebit = parseFloat((this.tot3Formatted || '0').replace(/,/g, ''))
    const totalCredit = parseFloat((this.tot4Formatted || '0').replace(/,/g, ''))
    const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
    const totalLabel = isArabic ? 'المجموع' : 'Total';
    const fieldMap = isArabic
      ? {
          'رصيد بداية المدة': totalBalance,
          'الحركات المدينة': DebitTransaction,
          'الحركات الدائنة': CreditTransaction,
          'الرصيد المدين': totalDebit,
          'الرصيد الدائن': totalCredit,
        }
      : {
          'Beginning Balance': totalBalance,
          'Debit Transaction': DebitTransaction,
          'Credit Transaction': CreditTransaction,
          'Debit Total': totalDebit,
          'Credit Total': totalCredit,
        };

    // 🧮 دالة مساعدة لتحويل رقم العمود إلى حرف
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

    // 🧮 حساب الصف الأخير
    const lastRow = Object.keys(newWorksheet)
      .filter(key => /^[A-Z]+\d+$/.test(key))
      .map(key => parseInt(key.match(/\d+/)![0]))
      .reduce((a, b) => Math.max(a, b), 0) + 1;

    // 🧮 إدخال المجاميع
    headers.forEach((header, index) => {
      const sumValue = fieldMap[header.trim()];
      if (sumValue !== undefined) {
        const colLetter = getExcelColumnLetter(index);
        const cellAddress = colLetter + lastRow;
        newWorksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
      }
    });

    // 🟢 وضع التسمية "المجموع" في أول عمود
    const labelCellAddress = getExcelColumnLetter(0) + lastRow;
    newWorksheet[labelCellAddress] = { t: 's', v: totalLabel };

    // تحديث نطاق الورقة
    const range = xlsx.utils.decode_range(newWorksheet['!ref']!);
    range.e.r = lastRow - 1;
    newWorksheet['!ref'] = xlsx.utils.encode_range(range);

    // 🟢 إنشاء وتصدير الملف
    const workbook = { Sheets: { 'data': newWorksheet }, SheetNames: ['data'] };
    const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, title);
  });
}


  exportExcel2() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);



      // حساب المجاميع
      const totalBalanceYear1 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.year1Balance || 0), 0);
      const totalBalanceYear2 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.year2Balance || 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'مجموع السنه 1': totalBalanceYear1,
          'مجموع السنه 2': totalBalanceYear2,
        }
        : {
          'Year 1 Balance': totalBalanceYear1,
          'Year 2 Balance': totalBalanceYear2,
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

  exportExcel3() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totalBalanceYear1 = this.voucherData.reduce((sum, item) => sum + (item.balanceTotal > 0 ? item.balanceTotal : 0), 0);
      const totalBalanceYear2 = this.voucherData.reduce((sum, item) => sum + (item.balanceTotal < 0 ? item.balanceTotal * -1 : 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'الرصيد المدين': totalBalanceYear1,
          'الرصيد الدائن': totalBalanceYear2,
        }
        : {
          'Debit Total': totalBalanceYear1,
          'Credit Total': totalBalanceYear2,
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

  exportPdf1() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' الرصيد الدائن', ' الرصيد المدين', 'الحركات الدائنة', 'الحركات المدينة', 'رصيد بداية المدة', ' اسم الحساب', ' رمز الحساب']]
    }
    else {
       head = [['Balance Credit', 'Balance Depit ', 'Credit Transaction', 'Debit Transaction', 'Beginning Balance', ' Account Name', 'Account Number']]
    }

    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalBalance = 0;
    let totalDebitTransaction = 0;
    let totalCreditTransaction = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.accountNo
      temp[1] = part.accountName
      temp[2] = part.openingBalance
      temp[3] = part.debitTransaction
      temp[4] = part.creditTransaction
      temp[5] = part.balanceTotal > 0 ? part.balanceTotal : 0
      temp[6] = part.balanceTotal < 0 ? part.balanceTotal * -1 : 0

      totalBalance += parseFloat(part.openingBalance) || 0;
      totalDebitTransaction += parseFloat(part.debitTransaction) || 0;
      totalCreditTransaction += parseFloat(part.creditTransaction) || 0;
      totalDebit += parseFloat(part.balanceTotal > 0 ? part.balanceTotal : 0) || 0;
      totalCredit += part.balanceTotal < 0 ? part.balanceTotal * -1 : 0 || 0;

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
      footRow[1] = "المجموع";
      footRow[2] = totalBalance.toFixed(2);     // مدين
      footRow[3] = totalDebitTransaction.toFixed(2);
      footRow[4] = totalCreditTransaction.toFixed(2);
      footRow[5] = totalDebit.toFixed(2);
      footRow[6] = totalCredit.toFixed(2)

    } else {
      footRow[1] = "Total";
      footRow[2] = totalBalance.toFixed(2);
      footRow[3] = totalDebitTransaction.toFixed(2);
      footRow[4] = totalCreditTransaction.toFixed(2);
      footRow[5] = totalDebit.toFixed(2);
      footRow[6] = totalCredit.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "ميزان المراجعة"
      : "Trail Balance Reprot";

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
    let head: string[][];

    if (currentLang == "ar") {
       head = [['مجموع السسنة 2', 'مجموع السنة 1', 'اسم الحساب', 'رمز الحساب']]
    }
    else {
       head = [['Year 2 Balance', 'Year 1 Balance', 'Account Name', 'Account Number']]
    }

    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalBalanceYear1 = 0;
    let totalBalanceYear2 = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.accountNo
      temp[1] = part.accountName
      temp[2] = part.year1Balance
      temp[3] = part.year2Balance

      totalBalanceYear1 += parseFloat(part.year1Balance) || 0;
      totalBalanceYear2 += parseFloat(part.year2Balance) || 0;
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
      footRow[1] = "المجموع";
      footRow[2] = totalBalanceYear1.toFixed(2);
      footRow[3] = totalBalanceYear2.toFixed(2);
    } else {
      footRow[1] = "Total";
      footRow[2] = totalBalanceYear1.toFixed(2);
      footRow[3] = totalBalanceYear2.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar"
      ? "ميزان المراجعة"
      : "Trail Balance Reprot";

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

  exportPdf3() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];
    
    if (currentLang == "ar") {
       head = [['الرصيد الدائن ', 'الرصيد المدين', 'اسم الحساب', 'رمز الحساب']]
    }
    else {
       head = [['Credit Total', 'Debit Total', 'Account Name', 'Account Number']]
    }

    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalBalanceYear1 = 0;
    let totalBalanceYear2 = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.accountNo
      temp[1] = part.accountName
      temp[2] = part.balanceTotal > 0 ? part.balanceTotal : 0
      temp[3] = part.balanceTotal < 0 ? part.balanceTotal * -1 : 0

      totalBalanceYear1 += parseFloat(part.balanceTotal > 0 ? part.balanceTotal : 0) || 0;
      totalBalanceYear2 += part.balanceTotal < 0 ? part.balanceTotal * -1 : 0 || 0;
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
      footRow[1] = "المجموع";
      footRow[2] = totalBalanceYear1.toFixed(2);
      footRow[3] = totalBalanceYear2.toFixed(2);
    } else {
      footRow[1] = "Total";
      footRow[2] = totalBalanceYear1.toFixed(2);
      footRow[3] = totalBalanceYear2.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "ميزان المراجعة"
      : "Trail Balance Reprot";

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
