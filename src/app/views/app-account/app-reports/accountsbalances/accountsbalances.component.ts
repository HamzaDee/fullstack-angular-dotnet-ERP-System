import * as FileSaver from 'file-saver';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-accountsbalances',
  templateUrl: './accountsbalances.component.html',
  styleUrls: ['./accountsbalances.component.scss']
})
export class AccountsbalancesComponent implements OnInit {
  accountbalanceAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedyear: any;
  selectedyear2: any;
  currenciesList: any;
  selectedMulti: string = "";
  accountsList: any;
  userbranchList: any;
  userbranchlist2: any;
  statusList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  fiscalYearsList: any;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  isFiscalYear: number;
  isMonthlyBalance: number;
  isBranched: number;
  showfiscalyear: boolean = false;
  showmonthlybalance: boolean = false;
  showbranched: boolean = false;
  fiscalYearTableData: any[] = [];
  monthlyBalanceTableData: any[] = [];
  branchedTableData: any[] = [];
  total: any;
  dynamicHeaders: string[] = [];
  dynamicHeadersBranch: string[] = [];
  tot1: any;
  tot2: any;
  tot3: any;
  tot4: any;
  tot5: any;
  tot6: any;
  tot7: any;
  tot8: any;
  tot9: any;
  tot10: any;
  tot11: any;
  tot12: any;
  disableGet: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 37;
  custom: boolean;
  branchTotals: number[] = [];
  public TitlePage: string;
  isZeroBalnce: number;

  constructor(private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private ReportsService: ReportsService,
    private alert: sweetalert,
    public ValidatorsService: ValidatorsService,
    private jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private egretLoader: AppLoaderService,
    private appCommonserviceService: AppCommonserviceService,

  ) { }



  ngOnInit(): void {
    this.SetTitlePage();
    this.GetaccountbalanceForm();
    this.GetaccountbalanceInitialForm();
    this.GetPeriodFiscalYear();
    this.getFavouriteStatus(this.screenId);
  }

  GetaccountbalanceForm() {
    debugger
    this.accountbalanceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      parentAccId: [0, [Validators.required, Validators.min(1)]],
      yearId: [0],
      branchId: [0],
      voucherStatus: [-1],
      todate: [''],
      isFiscalYear: [0],
      isMonthlyBalance: [0],
      isBranched: [0],
      branchIds: [""],
      monthYearId: [0],
      currencyId: [0],
      currRate: [0],
      zerobalance: [0],
    });
  }

  GetaccountbalanceInitialForm() {
    this.ReportsService.GetaccountbalanceForm().subscribe((result) => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      debugger
      this.accountsList = result.accountsList;
      this.userbranchList = result.companyBranchList;
      this.userbranchlist2 = result.companyBranchList;
      this.fiscalYearsList = result.fiscalYearsList;
      this.statusList = result.statusList;
      this.currenciesList = result.currenciesList;
      this.accountbalanceAddForm.patchValue(result);
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US")
      this.accountbalanceAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedacc = result.parentAccId;
        this.selectedbranch = result.branchId;
        this.selectedyear = result.yearId;
        this.selectedyear2 = result.monthYearId;
        this.total = 0;
        //  this.selectedMulti= result.branchIds;
        this.accountbalanceAddForm.get("branchIds").setValue(result.branchIds)
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.accountbalanceAddForm.get('voucherStatus').setValue(defaultStatus);
        this.isPost = 1;
        this.accountbalanceAddForm.value.post = this.isPost;
        this.disableGet = false;
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';


    debugger
    setTimeout(() => {
      debugger
      const formValues = this.accountbalanceAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }

      if (formValues.currencyId == null) {
        formValues.currencyId = 0;
      }

      if (formValues.currRate == null) {
        formValues.currRate = 0;
      }

      if (!this.isZeroBalnce) {
        formValues.zerobalance = -1;
      }
      else {
        formValues.zerobalance = 1;
      }





      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      if (this.showfiscalyear) {
        this.ReportsService.GetreportByYear(
          formValues.parentAccId,
          formValues.voucherStatus,
          formValues.branchId,
          formValues.yearId,
          formValues.currencyId,
          formValues.currRate,
          formValues.zerobalance

        ).subscribe((result) => {
          debugger

          this.voucherData = result;

          if (this.isZeroBalnce > 0) {
            this.voucherData = this.voucherData.filter(x => Number(x.openingBalance) !== 0);
          }


          if (currentLang == "ar") {
            this.refreshOnFiscalYearArabic(this.voucherData);
          }
          else {
            this.refreshOnFiscalYearEnglish(this.voucherData);
          }

          this.calcultevalues();
          this.egretLoader.close();
        })

      }
      else if (this.showmonthlybalance) {

        this.ReportsService.GetreportByMonth(
          formValues.parentAccId,
          formValues.voucherStatus,
          formValues.branchId,
          formValues.monthYearId,
          formValues.currencyId,
          formValues.currRate,
          formValues.zerobalance
        ).subscribe((result) => {
          debugger
          this.voucherData = result;

          if (this.isZeroBalnce > 0) {
            this.voucherData = this.voucherData.filter(x => Number(x.openingBalance) !== 0);
          }


          if (currentLang == "ar") {
            this.refreshOnMonthlyBalanceArabic(this.voucherData);
          }
          else {
            this.refreshOnMonthlyBalanceEnglish(this.voucherData);
          }

          this.calcultevalues();
          this.egretLoader.close();
        })

      }
      else if (this.showbranched) {
        debugger
        this.ReportsService.GetreportByBranch(
          formValues.parentAccId,
          formValues.voucherStatus,
          formValues.branchIds,
          formValues.todate,
          formValues.currencyId,
          formValues.currRate,
          formValues.zerobalance
        ).subscribe((result) => {
          debugger
          this.voucherData = result;

/*           if (this.isZeroBalnce > 0) {
            this.voucherData = this.voucherData.filter(x => x.balance !== 0);
          } */


          if (result.length > 0) {
            const keys = Object.keys(result[0]);
            const openingBalanceIndex = keys.indexOf('OpeningBalance');

            if (openingBalanceIndex !== -1) {
              // Get all columns after "OpeningBalance"
              this.dynamicHeadersBranch = keys.slice(openingBalanceIndex + 1);
            }
          }
          console.log(this.dynamicHeadersBranch);
          console.log(this.voucherData);
          if (currentLang == "ar") {
            this.refreshOnBranchedArabic(this.voucherData);
          }
          else {
            this.refreshOnBranchedEnglish(this.voucherData);
          }

          this.calcultevalues();
          this.egretLoader.close();
        })
      }
      else {

        if (!this.isZeroBalnce) {
          formValues.zerobalance = -1;
        }
        else {
          formValues.zerobalance = 1;
        }


      if (formValues.currencyId == null) {
        formValues.currencyId = 0;
      }

        this.ReportsService.Getreportstanderd(
          formValues.parentAccId,
          formValues.todate,
          formValues.branchId,
          formValues.voucherStatus,
          formValues.currencyId,
          formValues.currRate,
          formValues.zerobalance
        ).subscribe((result) => {
          debugger
          setTimeout(() => {
            this.egretLoader.close()
          }, 1500);
          this.voucherData = result;

          if (this.isZeroBalnce > 0) {
            this.voucherData = this.voucherData.filter(x => x.balance !== 0);
          }

          if (currentLang == "ar") {
            this.refreshAccountsbalancesArabic(this.voucherData);
          }
          else {
            this.refreshAccountsbalancesEnglish(this.voucherData);
          }

          this.calcultevalues();
          this.egretLoader.close();
        })
      };
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('accountsbalances');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    debugger
    this.accountbalanceAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    this.GetaccountbalanceInitialForm();
    this.clearTotals();
    this.accountbalanceAddForm.value.currencyId = 0;
    this.accountbalanceAddForm.value.voucherStatus = 0;

  }

  onFiscalYearChange() {
    debugger

    this.voucherData = [];
    if (this.showfiscalyear) {
      // Fetch or set fiscal year table data when the checkbox is checked
      this.fiscalYearTableData = this.voucherData /* Fetch or set fiscal year table data */
      this.showmonthlybalance = false;
      this.showbranched = false;
      this.selectedyear2 = null;
      this.selectedMulti = null;
      this.clearTotals()
      setTimeout(() => {
        this.disableGet = true;
      });
    } else {
      // Clear the data when the checkbox is unchecked
      debugger
      this.fiscalYearTableData = [];
      this.selectedyear = null;
      this.disableGet = false;
    }
  }

  onMonthlyChange() {
    this.voucherData = [];
    if (this.showmonthlybalance) {
      // Fetch or set fiscal year table data when the checkbox is checked
      this.fiscalYearTableData = this.voucherData/* Fetch or set fiscal year table data */
      this.showfiscalyear = false;
      this.showbranched = false;
      this.selectedyear = null;
      this.selectedMulti = null;
      this.clearTotals()
      setTimeout(() => {
        this.disableGet = true;
      });
    } else {
      // Clear the data when the checkbox is unchecked
      this.fiscalYearTableData = [];
      this.selectedyear2 = null;
      this.disableGet = false;
    }
  }

  onbranchedChange() {
    this.voucherData = [];
    this.fiscalYearTableData = [];
    if (this.showbranched) {
      this.voucherData = [];
      // Fetch or set fiscal year table data when the checkbox is checked
      this.fiscalYearTableData = this.voucherData/* Fetch or set fiscal year table data */
      this.showfiscalyear = false;
      this.showmonthlybalance = false;
      this.selectedyear = null;
      this.selectedyear2 = null;
      this.clearTotals()
      setTimeout(() => {
        this.disableGet = true;
      });
    } else {
      // Clear the data when the checkbox is unchecked
      this.fiscalYearTableData = [];
      this.selectedMulti = null;
      this.accountbalanceAddForm.get("branchIds").setValue('')
      this.disableGet = false;
      this.dynamicHeadersBranch = [];
    }
  }

  GetFiscalYear() {
    debugger
    const formValues = this.accountbalanceAddForm.value;
    if (formValues.branchId == null) {
      formValues.branchId = 0;
    }

    this.ReportsService.Getreportstanderd(
      formValues.parentAccId,
      formValues.voucherStatus,
      formValues.branchId,
      formValues.yearId,
      formValues.currencyId,
      formValues.currRate,
      formValues.zerobalance
    ).subscribe((result) => {
      debugger
      this.voucherData = result;

    });

  }

  GetPeriodFiscalYear() {
    const formValues = this.accountbalanceAddForm.value;
    this.ReportsService.GetPeriodFiscalYear(formValues.yearId).subscribe((result) => {
      this.dynamicHeaders = result.map(header => header.periodNameA);
      debugger
      if (this.accountbalanceAddForm.value.yearId != 0) {
        // setTimeout(() => {
        this.disableGet = false;
        // });
      }
      else {
        this.disableGet = true;
      }
    });
  }

  calcultevalues() {
    debugger
    // Calculate the total
      const rate = Number(this.accountbalanceAddForm.get('currRate')?.value) || 1;

    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;
    this.tot5 = 0;
    this.tot6 = 0;
    this.tot7 = 0;
    this.tot8 = 0;
    this.tot9 = 0;
    this.tot10 = 0;
    this.tot11 = 0;
    this.tot12 = 0;

    if (this.showbranched) {
      for (let r = 0; r < this.voucherData.length; r++) {
        // Calculate the total based on your logic
        this.total += Number(this.voucherData[r].balance);
      }
    }

    
    else if (this.showfiscalyear) {
      for (let r = 0; r < this.voucherData.length; r++) {
        // Calculate the total based on your logic
        this.total += Number(this.voucherData[r].openingBalance);
        this.tot1 += Number(this.voucherData[r].c1);
        this.tot2 += Number(this.voucherData[r].c2);
        this.tot3 += Number(this.voucherData[r].c3);
        this.tot4 += Number(this.voucherData[r].c4);
        this.tot5 += Number(this.voucherData[r].c5);
        this.tot6 += Number(this.voucherData[r].c6);
        this.tot7 += Number(this.voucherData[r].c7);
        this.tot8 += Number(this.voucherData[r].c8);
        this.tot9 += Number(this.voucherData[r].c9);
        this.tot10 += Number(this.voucherData[r].c10);
        this.tot11 += Number(this.voucherData[r].c11);
        this.tot12 += Number(this.voucherData[r].c12);
      }
    }

    else if (this.showmonthlybalance) {
      for (let r = 0; r < this.voucherData.length; r++) {
        // Calculate the total based on your logic
        this.total += Number(this.voucherData[r].openingBalance);
        this.tot1 += Number(this.voucherData[r].month1);
        this.tot2 += Number(this.voucherData[r].month2);
        this.tot3 += Number(this.voucherData[r].month3);
        this.tot4 += Number(this.voucherData[r].month4);
        this.tot5 += Number(this.voucherData[r].month5);
        this.tot6 += Number(this.voucherData[r].month6);
        this.tot7 += Number(this.voucherData[r].month7);
        this.tot8 += Number(this.voucherData[r].month8);
        this.tot9 += Number(this.voucherData[r].month9);
        this.tot10 += Number(this.voucherData[r].month10);
        this.tot11 += Number(this.voucherData[r].month11);
        this.tot12 += Number(this.voucherData[r].month12);
      }
    }
    else {
      for (let r = 0; r < this.voucherData.length; r++) {
        // Calculate the total based on your logic
        this.total += Number(this.voucherData[r].balance);
      }
    }
      this.total  = this.total  / rate;
      this.tot1   = this.tot1   / rate;
      this.tot2   = this.tot2   / rate;
      this.tot3   = this.tot3   / rate;
      this.tot4   = this.tot4   / rate;
      this.tot5   = this.tot5  / rate;
      this.tot6   = this.tot6   / rate;
      this.tot7   = this.tot7   / rate;
      this.tot8   = this.tot8   / rate;
      this.tot9   = this.tot9   /rate;
      this.tot10  = this.tot10  / rate;
      this.tot11  = this.tot11  /rate;
      this.tot12  = this.tot12  / rate;
      
    //this.total = parseFloat(this.total.toFixed(3));
    this.total = this.appCommonserviceService.formatCurrencyNumber(this.total);
    this.tot1 = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    this.tot2 = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
    this.tot3 = this.appCommonserviceService.formatCurrencyNumber(this.tot3);
    this.tot4 = this.appCommonserviceService.formatCurrencyNumber(this.tot4);
    this.tot5 = this.appCommonserviceService.formatCurrencyNumber(this.tot5);
    this.tot6 = this.appCommonserviceService.formatCurrencyNumber(this.tot6);
    this.tot7 = this.appCommonserviceService.formatCurrencyNumber(this.tot7);
    this.tot8 = this.appCommonserviceService.formatCurrencyNumber(this.tot8);
    this.tot9 = this.appCommonserviceService.formatCurrencyNumber(this.tot9);
    this.tot10 = this.appCommonserviceService.formatCurrencyNumber(this.tot10);
    this.tot11 = this.appCommonserviceService.formatCurrencyNumber(this.tot11);
    this.tot12 = this.appCommonserviceService.formatCurrencyNumber(this.tot12);
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;
    this.tot5 = 0;
    this.tot6 = 0;
    this.tot7 = 0;
    this.tot8 = 0;
    this.tot9 = 0;
    this.tot10 = 0;
    this.tot11 = 0;
    this.tot12 = 0;

  }

  checkmonthlyValue() {
    debugger
    if (this.accountbalanceAddForm.value.monthYearId != 0) {
      // setTimeout(() => {
      this.disableGet = false;
      // });
    }
    else {
      this.disableGet = true;
    }
  }

  checkbranchValue(event: any) {
    const selectedValues = event.value;
    debugger
    if (event.itemValue == 0) {
      this.disableGet = true;
      this.accountbalanceAddForm.get("branchIds").setValue('')
      this.dynamicHeadersBranch = [];
      return
    }
    else {

    }
    if (selectedValues && selectedValues.length >= 2) {
      this.disableGet = false;
      const filteredData = this.voucherData.filter(item =>
        selectedValues.includes(item.branchId)
      );
      // Assuming this.userbranchlist2 contains the necessary data
      this.dynamicHeadersBranch = this.userbranchlist2
        .filter(branch => selectedValues.includes(branch.id))
        .map(branch => branch.text);
      this.branchTotals = Array(this.dynamicHeadersBranch.length).fill(0);
      this.updateTotals();
    } else {
      this.disableGet = true;
      this.dynamicHeadersBranch = [];
      this.resetTotals();
    }
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

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

  updateTotals() {
    // Initialize totals with zero values
    this.total = 0;
    for (let j = 1; j <= this.dynamicHeadersBranch.length; j++) {
      this['tot' + j] = 0;
    }
  }

  resetTotals() {
    this.total = 0;
    for (let j = 1; j <= this.dynamicHeadersBranch.length; j++) {
      this['tot' + j] = 0;
    }
  }

  calculateTotalsBranch(data: any[]) {
    // Implement your logic to calculate totals based on the filtered data
    // For example, assuming 'balance' is a property in your data
    this.total = data.reduce((sum, item) => sum +  this.convertBalanceNum(item.balance), 0);

    // Update other totals based on your data structure
    // For example, if you have 'c1', 'c2', etc., properties
    for (let j = 1; j <= this.dynamicHeadersBranch.length; j++) {
      const property = 'c' + j;
      this['tot' + j] = data.reduce((sum, item) => sum + this.convertBalanceNum(item[property]), 0);
    }
  }

  resetTotalsBranch() {
    // Reset totals when no branches are selected
    this.total = 0;
    for (let j = 1; j <= this.dynamicHeadersBranch.length; j++) {
      this['tot' + j] = 0;
    }
  }

  refreshAccountsbalancesArabic(data) { // defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رمز الحساب': x.accountNumber,
      'اسم الحساب ': x.accountName,
      'الرصيد':  this.convertBalanceNum(x.balance),
    }));
  }

  refreshAccountsbalancesEnglish(data) {// defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Account Number': x.accountNumber,
      'Account Name': x.accountName,
      'Balance': this.convertBalanceNum(x.balance),
    }));
  }

  refreshOnBranchedArabic(data) { // OnBranched
    debugger
    this.exportData = data;
    this.exportData = this.exportData.map(x => ({
      ' رمز الحساب': x.AccountNumber,
      ' اسم الحساب ': x.AccountName,
      ...x.dynamicHeadersBranch,
    }));
  }

  refreshOnBranchedEnglish(data) {// OnBranched
    debugger
    this.exportData = data;
    this.exportData = this.exportData.map(x => ({
      'Account Number': x.AccountNumber,
      'Account Name': x.AccountName,
      ...x.dynamicHeadersBranch,
    }));
  }

  mapDynamicHeaders(row: any) {
  const obj: any = {};
  this.dynamicHeaders.forEach((h, i) => {
    obj[h] = row['c' + (i + 1)];
    obj[h] = this.convertBalanceNum(obj[h]);
  });
  return obj;
  }

  refreshOnFiscalYearArabic(data) {
    debugger
    this.voucherData = data;

    this.exportData = this.voucherData.map(x => ({
      'رمز الحساب': x.accountNumber,
      'اسم الحساب': x.accountName,
      'الرصيد': this.convertBalanceNum(x.balance) ,
      ...this.mapDynamicHeaders(x)
    }));
  }

  refreshOnFiscalYearEnglish(data) {
    this.voucherData = data;

    this.exportData = this.voucherData.map(x => ({
      'Account Number': x.accountNumber,
      'Account Name': x.accountName,
      'Opening Balance': this.convertBalanceNum(x.openingBalance) ,
      ...this.mapDynamicHeaders(x)
    }));
  }

  refreshOnMonthlyBalanceArabic(data) { // OnMonthlyBalance
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      ' رمز الحساب': x.accountNumber,
      ' اسم الحساب ': x.accountName,
      ' الرصيد': this.convertBalanceNum(x.openingBalance),
      'شهر 1': this.convertBalanceNum(x.month1),
      'شهر 2 ': this.convertBalanceNum(x.month2),
      '3 شهر': this.convertBalanceNum(x.month3),
      'شهر 4': this.convertBalanceNum(x.month4),
      'شهر 5 ': this.convertBalanceNum(x.month5),
      '6 شهر': this.convertBalanceNum(x.month6),
      'شهر 7': this.convertBalanceNum(x.month7),
      'شهر 8': this.convertBalanceNum(x.month8),
      'شهر 9': this.convertBalanceNum(x.month9),
      'شهر 10': this.convertBalanceNum(x.month10),
      'شهر 11 ': this.convertBalanceNum(x.month11),
      '12 شهر': this.convertBalanceNum(x.month12),

    }));
  }

  refreshOnMonthlyBalanceEnglish(data) {// OnMonthlyBalance
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Account Number': x.accountNumber,
      'Account Name': x.accountName,
      'Balance': this.convertBalanceNum(x.openingBalance),
      'Month 1': this.convertBalanceNum(x.month1),
      'Month 2': this.convertBalanceNum(x.month2),
      'Month 3': this.convertBalanceNum(x.month3),
      'Month 4': this.convertBalanceNum(x.month4),
      'Month 5': this.convertBalanceNum(x.month5),
      'Month 6': this.convertBalanceNum(x.month6),
      'Month 7': this.convertBalanceNum(x.month7),
      'Month 8': this.convertBalanceNum(x.month8),
      'Month 9': this.convertBalanceNum(x.month9),
      'Month 10': this.convertBalanceNum(x.month10),
      'Month 11': this.convertBalanceNum(x.month11),
      'Month 12': this.convertBalanceNum(x.month12),

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
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.aoa_to_sheet([]);
      xlsx.utils.sheet_add_aoa(worksheet, [[this.translateService.instant(this.TitlePage)]], { origin: "A1" });
      xlsx.utils.sheet_add_json(worksheet, this.exportData, { origin: "A2", skipHeader: false });


      const headers1 = Object.keys(this.exportData?.[0] || {});
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(headers1.length - 1, 0) } }];

      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
    
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];


      const totalAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.balance), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'الرصيد';
      const totalHeaderEnglish = 'Balance';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

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

      const totalColLetter = getExcelColumnLetter(totalColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: parseFloat(this.convertBalance(totalValue)) };

      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
  }

  exportPdf1() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === "ar";

    const head = [isArabic
      ? ['الرصيد', 'اسم الحساب', 'رمز الحساب']
      : ['Balance', 'Account Name', 'Account Number']
    ];

    const rows: (number | string)[][] = [];
    let totalAmount = 0;


    this.voucherData.forEach((part: any) => {
      const b = this.convertBalanceNum(part.balance);
      totalAmount += b;

      rows.push([
        +b.toFixed(3),
        part.accountName ?? '',
        part.accountNumber ?? ''
      ]);
    });

  
    const footRow: (string | number)[] = [
      totalAmount.toFixed(3),
      isArabic ? 'المجموع' : 'Total',
      ''
    ];

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = isArabic ? "تقرير ارصدة الحسابات" : "Account Balances Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head,
      body: rows,
      foot: [footRow],
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

  exportExcel2() {
    import("xlsx").then(xlsx => {
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      if (!this.voucherData || this.voucherData.length === 0) return;

      // ===== helpers =====
      const toNumber = (v: any): number => {
        if (v == null) return 0;
        if (typeof v === "number") return v;
        const cleaned = String(v).replace(/,/g, "").trim();
        const n = Number(cleaned);
        return isNaN(n) ? 0 : n;
      };

      // استخراج الأعمدة الديناميكية (بعد OpeningBalance)
      const keys = Object.keys(this.voucherData[0]);
      const openingBalanceIndex = keys.indexOf("OpeningBalance");

      let dynamicHeadersBranch: string[] = [];
      if (openingBalanceIndex !== -1) {
        dynamicHeadersBranch = keys.slice(openingBalanceIndex + 1);
      }

      // Headers (عرض)
      let headers: string[] = [];
      if (currentLang === "ar") {
        headers = ["رمز الحساب", "اسم الحساب", ...dynamicHeadersBranch.map(c => c.trim())];
      } else {
        headers = ["Account Number", "Account Name", ...dynamicHeadersBranch.map(c => c.trim())];
      }

      // ===== rows (IMPORTANT: apply conversion here) =====
      const rows = this.voucherData.map(row => {
        const rowData: any = {};

        // ثابت
        rowData[headers[0]] = row["AccountNumber"];
        rowData[headers[1]] = row["AccountName"];

        // ديناميكي: أي عمود رقمي => تحويل عملة
        dynamicHeadersBranch.forEach((colKey, idx) => {
          const headerName = headers[idx + 2]; // لأن أول عمودين ثابتين
          const raw = toNumber(row[colKey]);
          rowData[headerName] = +this.convertBalanceNum(raw).toFixed(3);
        });

        return rowData;
      });

      // ===== Worksheet + Title (A1) + Data from A2 =====
      const title = this.translateService.instant(this.TitlePage);
      const worksheet = xlsx.utils.aoa_to_sheet([]);
      xlsx.utils.sheet_add_aoa(worksheet, [[title]], { origin: "A1" });

      worksheet["!merges"] = worksheet["!merges"] || [];
      worksheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

      xlsx.utils.sheet_add_json(worksheet, rows, {
        header: headers,
        skipHeader: false,
        origin: "A2"
      } as any);

      // ===== (اختياري) مجموع لكل عمود ديناميكي + Total Label =====
      const getExcelColumnLetter = (colIndex: number): string => {
        let dividend = colIndex + 1;
        let columnName = "";
        while (dividend > 0) {
          const modulo = (dividend - 1) % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return columnName;
      };

      const lastRow =
        Object.keys(worksheet)
          .filter(key => /^[A-Z]+\d+$/.test(key))
          .map(key => parseInt(key.match(/\d+/)![0], 10))
          .reduce((a, b) => Math.max(a, b), 0) + 1;

      const totalLabel = currentLang === "ar" ? "المجموع" : "Total";
      worksheet["A" + lastRow] = { t: "s", v: totalLabel };

      // مجموع الأعمدة الديناميكية (من rows المصدّرة نفسها)
      for (let i = 2; i < headers.length; i++) {
        const h = headers[i];
        const sum = rows.reduce((acc: number, r: any) => acc + toNumber(r[h]), 0);
        const colLetter = getExcelColumnLetter(i);
        worksheet[colLetter + lastRow] = { t: "n", v: +sum.toFixed(3) };
      }

      const range = xlsx.utils.decode_range(worksheet["!ref"] || "A1");
      range.e.r = Math.max(range.e.r, lastRow - 1);
      worksheet["!ref"] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: "xlsx", type: "array" });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
  }

  exportPdf2() {
    debugger;
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    if (!this.voucherData || this.voucherData.length === 0) return;

    const keys = Object.keys(this.voucherData[0]);
    const openingBalanceIndex = keys.indexOf('OpeningBalance');

    let dynamicHeadersBranch: string[] = [];
    if (openingBalanceIndex !== -1) {
      dynamicHeadersBranch = keys.slice(openingBalanceIndex + 1);
    }

    let head: string[][] = [];

    if (currentLang === 'ar') {
      head = [[
        ...dynamicHeadersBranch.map(col => col.trim()),
        'اسم الحساب',
        'رمز الحساب'
      ]];
    } else {
      head = [[
        ...dynamicHeadersBranch.map(col => col.trim()),
        'Account Name',
        'Account Number'
      ]];
    }

    const rows: (number | string)[][] = [];

    this.voucherData.forEach(row => {
    const rowData: (number | string)[] = [];
    dynamicHeadersBranch.forEach(col => {
    rowData.push(this.convertBalance(row[col]));
      });
      rowData.push(row.AccountName || '');
      rowData.push(row.AccountNumber || '');
      rows.push(rowData);
    });


    const pdf = new jsPDF('p', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "تقرير أرصدة الحسابات"
      : "Account Balances Report";

    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 10, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      startY: 15,
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
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  exportExcel3() {
    debugger
  import("xlsx").then(xlsx => {

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (!this.voucherData || this.voucherData.length === 0) return;

    // Headers
    let headers: string[] = [];
    if (currentLang === 'ar') {
      headers = [
        'رمز الحساب',
        'اسم الحساب',
        'الرصيد الافتتاحي',
        ...this.dynamicHeaders
      ];
    } else {
      headers = [
        'Account Number',
        'Account Name',
        'Opening Balance',
        ...this.dynamicHeaders
      ];
    }

    // Rows
    const rows = this.voucherData.map(row => {
      const r: any = {};
       r[headers[0]] = row.accountNumber;
       r[headers[1]] = row.accountName;
       r[headers[2]] = +this.convertBalanceNum(row.openingBalance).toFixed(3);
        this.dynamicHeaders.forEach((h, i) => {
          r[h] = +this.convertBalanceNum(row['c' + (i + 1)]).toFixed(3);
        });

      return r;
    });

    const worksheet = xlsx.utils.json_to_sheet(rows, { header: headers, origin: 'A2' } as any);
    const title = this.translateService.instant(this.TitlePage);
    worksheet['A1'] = { t: 's', v: title };
    worksheet['!merges'] = worksheet['!merges'] || [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

    // ===== Totals =====
    const totals: any = {};
    headers.forEach(h => totals[h] = 0);

    this.voucherData.forEach(row => {
    totals[headers[2]] += this.convertBalanceNum(row.openingBalance) || 0;
    this.dynamicHeaders.forEach((h, i) => {
      totals[h] += this.convertBalanceNum(row['c' + (i + 1)]) || 0;
    });
    });

    const range = xlsx.utils.decode_range(worksheet['!ref']!);
    range.s.r = 0; 

    const lastRow = range.e.r + 1;

    const getCol = (i: number) => {
      let s = '', n = i + 1;
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - m) / 26);
      }
      return s;
    };

    const totalLabel = currentLang === 'ar' ? 'المجموع' : 'Total';
    worksheet[getCol(0) + (lastRow + 1)] = { t: 's', v: totalLabel };

    headers.forEach((h, i) => {
      if (i === 0) return;
      worksheet[getCol(i) + (lastRow + 1)] = {
        t: 'n',
        v: parseFloat(totals[h].toFixed(2))
      };
    });

    range.e.r = lastRow + 1;
    worksheet['!ref'] = xlsx.utils.encode_range(range);

    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcelFile(
      excelBuffer,
      currentLang === 'ar'
        ? 'ميزان_المراجعة_الافتتاحي'
        : 'Opening_Balance_Report'
    );
  });
  }

  exportPdf3() {

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === "ar";

    const staticHeaders = isArabic
      ? ['رمز الحساب', 'اسم الحساب', 'الرصيد الافتتاحي']
      : ['Account Number', 'Account Name', 'Opening Balance'];

    const dynamicHeaders = this.dynamicHeaders || [];
    const allHeaders = [...staticHeaders, ...dynamicHeaders];
    const head = [isArabic ? allHeaders.slice().reverse() : allHeaders];

    const rows: (number | string)[][] = [];
    const totals: Record<string, number> = {};
    allHeaders.forEach(h => totals[h] = 0);

    this.voucherData.forEach(item => {
      const row: (number | string)[] = [];

      row.push(item.accountNumber || '');
      row.push(item.accountName || '');

      row.push(this.convertBalance(item.openingBalance || 0));
      totals[staticHeaders[2]] += this.convertBalanceNum(item.openingBalance || 0);

      dynamicHeaders.forEach((header, index) => {
        const key = 'c' + (index + 1);
        row.push(this.convertBalance(item[key] || 0));
        totals[header] += this.convertBalanceNum(item[key] || 0);
      });

      rows.push(isArabic ? row.reverse() : row);
    });

    const footRow: (string | number)[] = [];

    allHeaders.forEach((header, index) => {
      if (index === 0) {
        footRow.push(isArabic ? 'المجموع' : 'Total');
      } else {
        footRow.push(this.appCommonserviceService.formatCurrencyNumber(totals[header] || 0));
      }
    });

    const foot = [isArabic ? footRow.reverse() : footRow];

    const pdf = new jsPDF('p', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    const title = isArabic ? "تقرير أرصدة الحسابات" : "Account Balances Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head,
      body: rows,
      foot,
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

  exportExcel4() {
    import("xlsx").then(xlsx => {
      debugger;

      const headers = Object.keys(this.exportData[0]);  
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const title = this.translateService.instant(this.TitlePage);
      const worksheet = xlsx.utils.aoa_to_sheet([]);
      xlsx.utils.sheet_add_aoa(worksheet, [[title]], { origin: 'A1' });
      worksheet['!merges'] = worksheet['!merges'] || [];
      worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });
      xlsx.utils.sheet_add_json(worksheet, this.exportData, {
        header: headers,
        skipHeader: false,
        origin: 'A2'
      } as any);
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic ? {
        ' الرصيد': 'openingBalance',
        'شهر 1': 'month1',
        'شهر 2 ': 'month2',
        '3 شهر': 'month3',
        'شهر 4': 'month4',
        'شهر 5 ': 'month5',
        '6 شهر': 'month6',
        'شهر 7': 'month7',
        'شهر 8': 'month8',
        'شهر 9': 'month9',
        'شهر 10': 'month10',
        'شهر 11 ': 'month11',
        '12 شهر': 'month12',
      } : {
        'Balance': 'openingBalance',
        'Month 1': 'month1',
        'Month 2': 'month2',
        'Month 3': 'month3',
        'Month 4': 'month4',
        'Month 5': 'month5',
        'Month 6': 'month6',
        'Month 7': 'month7',
        'Month 8': 'month8',
        'Month 9': 'month9',
        'Month 10': 'month10',
        'Month 11': 'month11',
        'Month 12': 'month12',
      };

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

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      headers.forEach((header, index) => {
        const field = fieldMap[header];
        if (field) {
          const sum = this.voucherData.reduce((total, item) => total + (+item[field] || 0), 0);
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sum.toFixed(2) };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer,this.TitlePage);
    });
  }

  exportPdf4() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    const head = isArabic
      ? [[
          'شهر 12 ', 'شهر 11 ', 'شهر 10 ', 'شهر 9 ', 'شهر 8 ', 'شهر 7 ',
          'شهر 6 ', 'شهر 5 ', 'شهر 4 ', 'شهر 3 ', 'شهر 2 ', 'شهر 1 ',
          'الرصيد', 'اسم الحساب', 'رمز الحساب'
        ]]
      : [[
          'Month 12', 'Month 11', 'Month 10', 'Month 9', 'Month 8', 'Month 7',
          'Month 6', 'Month 5', 'Month 4', 'Month 3', 'Month 2', 'Month 1',
          'Balance', 'Account Name', 'Account Number'
        ]];

    const rows: (number | string)[][] = [];

    let totals = {
      openingBalance: 0,
      month1: 0, month2: 0, month3: 0, month4: 0, month5: 0, month6: 0,
      month7: 0, month8: 0, month9: 0, month10: 0, month11: 0, month12: 0,
    };

    this.voucherData.forEach(part => {
      totals.openingBalance += this.convertBalanceNum(part.openingBalance || 0);
      totals.month1 += this.convertBalanceNum(part.month1 || 0);
      totals.month2 += this.convertBalanceNum(part.month2 || 0);
      totals.month3 += this.convertBalanceNum(part.month3 || 0);
      totals.month4 += this.convertBalanceNum(part.month4 || 0);
      totals.month5 += this.convertBalanceNum(part.month5 || 0);
      totals.month6 += this.convertBalanceNum(part.month6 || 0);
      totals.month7 += this.convertBalanceNum(part.month7 || 0);
      totals.month8 += this.convertBalanceNum(part.month8 || 0);
      totals.month9 += this.convertBalanceNum(part.month9 || 0);
      totals.month10 += this.convertBalanceNum(part.month10 || 0);
      totals.month11 += this.convertBalanceNum(part.month11 || 0);
      totals.month12 += this.convertBalanceNum(part.month12 || 0);

      const temp: (number | string)[] = [
        part.accountNumber || '',
        part.accountName || '',
        this.convertBalance(part.openingBalance || 0),
        this.convertBalance(part.month1 || 0),
        this.convertBalance(part.month2 || 0),
        this.convertBalance(part.month3 || 0),
        this.convertBalance(part.month4 || 0),
        this.convertBalance(part.month5 || 0),
        this.convertBalance(part.month6 || 0),
        this.convertBalance(part.month7 || 0),
        this.convertBalance(part.month8 || 0),
        this.convertBalance(part.month9 || 0),
        this.convertBalance(part.month10 || 0),
        this.convertBalance(part.month11 || 0),
        this.convertBalance(part.month12 || 0),
      ];

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const footRow: (string | number)[] = [
      this.appCommonserviceService.formatCurrencyNumber(totals.month12),
      this.appCommonserviceService.formatCurrencyNumber(totals.month11),
      this.appCommonserviceService.formatCurrencyNumber(totals.month10),
      this.appCommonserviceService.formatCurrencyNumber(totals.month9),
      this.appCommonserviceService.formatCurrencyNumber(totals.month8),
      this.appCommonserviceService.formatCurrencyNumber(totals.month7),
      this.appCommonserviceService.formatCurrencyNumber(totals.month6),
      this.appCommonserviceService.formatCurrencyNumber(totals.month5),
      this.appCommonserviceService.formatCurrencyNumber(totals.month4),
      this.appCommonserviceService.formatCurrencyNumber(totals.month3),
      this.appCommonserviceService.formatCurrencyNumber(totals.month2),
      this.appCommonserviceService.formatCurrencyNumber(totals.month1),
      this.appCommonserviceService.formatCurrencyNumber(totals.openingBalance),
      isArabic ? 'المجموع' : 'Total',
      ''
    ];

    const pdf = new jsPDF('landscape', null, 'a4');
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    const title = isArabic ? "تقرير ارصدة الحسابات" : "Account Balances Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 10, { align: 'center' });

    autoTable(pdf as any, {
      head,
      body: rows,
      foot: [footRow],
      showFoot: 'lastPage',
      startY: 15,
      headStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 6,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 15
      },
      bodyStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 6,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 6,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  convertBalance(value: any): string {
    const rate = Number(this.accountbalanceAddForm.get('currRate')?.value) || 1;
    const num = Number(value) || 0;
    const converted = num / rate; 
    return this.appCommonserviceService.formatCurrencyNumber(converted);
  }

  private convertBalanceNum(value: any): number {
    const rate = Number(this.accountbalanceAddForm.get('currRate')?.value) || 1;
    const num = Number(value) || 0;
    return num / rate;   
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);
      if (curr) {
        this.accountbalanceAddForm.get("currRate").setValue(Number(curr.data1))
      }
      else {
        this.accountbalanceAddForm.get("currRate").setValue(0);
      }
    }
    else {
      this.accountbalanceAddForm.get("currRate").setValue(0);
    }

     if (this.voucherData?.length) {
     this.calcultevalues();
      }
      this.GetReport() ;
  }
}