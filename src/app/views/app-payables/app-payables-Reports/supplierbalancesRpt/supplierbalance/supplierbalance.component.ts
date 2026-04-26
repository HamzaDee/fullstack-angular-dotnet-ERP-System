import * as FileSaver from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of } from 'rxjs';
import { catchError, delay, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { SupplierReportsService } from '../../payablesreports.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from 'assets/fonts/amiri';


@Component({
  selector: 'app-supplierbalance',
  templateUrl: './supplierbalance.component.html',
  styleUrls: ['./supplierbalance.component.scss']
})
export class SupplierbalanceComponent implements OnInit {
  supplierbalanceAddForm: FormGroup;
  selectedsup: any;
  selectedbranch: any;
  selectedyear: any;
  selectedyear2: any;
  selectedMulti: string = "";
  suppliersList: any;
  userbranchList: any;
  userbranchlist2: any;
  dealerTypesList: any;
  selectedstatus: number;
/*   statusList: { id: number; text: string }[] = [
    { id: -1, text: 'اختر' },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ]; */
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
  screenId: number = 107;
  custom: boolean;
  data: any[] = [];
  branchTotals: { [key: string]: number } = {};
  public TitlePage: string;
  currenciesList: any;
  voucherDataOriginal: any[] = [];
  statusList: any;

  constructor(private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private supReportsService: SupplierReportsService,
    private alert: sweetalert,
    public ValidatorsService: ValidatorsService,
    private jwtAuth: JwtAuthService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private egretLoader: AppLoaderService,
    private appCommonserviceService: AppCommonserviceService
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
    this.supplierbalanceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      supplierId: [0, [Validators.required, Validators.min(1)]],
      yearId: [0],
      branchId: [0],
      status: [this.selectedstatus],
      toDate: [''],
      isFiscalYear: [0],
      isMonthlyBalance: [0],
      isBranched: [0],
      branchIds: [""],
      monthYearId: [0],
      dealerTypeId: [0],
      currencyId: [0],
      currRate: [0],
    });
  }

  GetaccountbalanceInitialForm() {
    this.supReportsService.GetSupplierBalanceForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.suppliersList = result.suppliersList;
      this.userbranchList = result.branchesList;
      this.userbranchlist2 = result.branchesList;
      this.fiscalYearsList = result.fiscalYearsList;
      this.dealerTypesList = result.dealerTypesList;
      this.currenciesList = result.currenciesList;
      this.statusList = result.statusList;
      this.supplierbalanceAddForm.patchValue(result);
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.supplierbalanceAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedsup = result.supplierId;
        this.selectedbranch = result.branchId;
        this.selectedyear = result.yearId;
        this.selectedyear2 = result.monthYearId;
        this.total = 0;
        //  this.selectedMulti= result.branchIds;
        this.supplierbalanceAddForm.get("branchIds").setValue(result.branchIds)
        this.supplierbalanceAddForm.get("dealerTypeId").setValue(0)
        this.supplierbalanceAddForm.get("currencyId").setValue(0)
        this.supplierbalanceAddForm.get("currRate").setValue(0)
        this.selectedstatus = -1;
        this.isPost = 1;
        this.supplierbalanceAddForm.value.post = this.isPost;
        this.disableGet = false;
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.supplierbalanceAddForm.get('status').setValue(defaultStatus);
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    debugger
    setTimeout(() => {
      this.supplierbalanceAddForm.value.status 
      //= this.selectedstatus;
      const formValues = this.supplierbalanceAddForm.value;
      debugger
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      if (this.showfiscalyear) {
        this.supReportsService.GetreportByYear(
          formValues.supplierId,
          formValues.status,
          formValues.branchId,
          formValues.yearId,
          formValues.dealerTypeId,
          formValues.currencyId,
          formValues.currRate
        ).subscribe((result) => {
          debugger

          this.voucherData = result;
          this.data = result;

          if (currentLang == "ar") {
            this.refreshshowfiscalyearArabic(this.voucherData);
          }
          else {
            this.refreshshowfiscalyearEnglish(this.voucherData);
          }

          this.calcultevalues();
          this.egretLoader.close();
        })

      }

      else if (this.showmonthlybalance) {
        this.supReportsService.GetreportByMonth(
          formValues.supplierId,
          formValues.status,
          formValues.branchId,
          formValues.monthYearId,
          formValues.dealerTypeId,
          formValues.currencyId,
          formValues.currRate
        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;
          this.data = result;

          if (currentLang == "ar") {
            this.refreshshowmonthlybalanceArabic(this.voucherData);
          }
          else {
            this.refreshshowmonthlybalanceEnglish(this.voucherData);
          }

          this.calcultevalues();
          this.egretLoader.close();
        })

      }

      else if (this.showbranched) {
        this.supReportsService.GetreportByBranch(
          formValues.supplierId,
          formValues.status,
          formValues.branchIds,
          formValues.toDate,
          formValues.dealerTypeId
          , formValues.currencyId,
          formValues.currRate
        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;
          this.data = result;

          if (result.length > 0) {
            const firstRow = result[0];
            this.dynamicHeaders = Object.keys(firstRow).filter(
              (col) => col !== 'DealerId' && col !== 'DealerName' && col !== 'DealerNo' && col !== 'OpeningBalance'
            );
          }
          else {
            this.egretLoader.close();
          }
          if (currentLang == "ar") {
            this.refreshshowbranchedArabic(this.voucherData);
          }
          else {
            this.refreshshowbranchedEnglish(this.voucherData);
          }

          this.branchTotals = this.calculateBranchTotals(result);
          this.egretLoader.close();
        })
      }

      else (
        this.supReportsService.Getreportstanderd(
          formValues.supplierId,
          formValues.toDate,
          formValues.branchId,
          formValues.status,
          formValues.dealerTypeId,
          formValues.currencyId,
          formValues.currRate
        ).pipe(
          finalize(() => this.egretLoader.close()), // Ensures loader closes even on error
          catchError((error) => {
            console.error('Error fetching report:', error);
            this.alert.ShowAlert('An unexpected error occurred', 'error');
            return of(null); // Return safe value to avoid breaking subscription
          })
        )
          .subscribe((result) => {
            debugger
            if (result.isSuccess == false && result.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            this.voucherDataOriginal = JSON.parse(JSON.stringify(result));
            this.voucherData = result;
            this.data = result;

            const currentRate = Number(this.supplierbalanceAddForm.get("currRate")?.value);
            if (currentRate > 0) {
              this.applyCurrencyRate(currentRate);
            } else {
              this.voucherData = [...this.voucherDataOriginal];
            }

            if (currentLang == "ar") {
              this.refreshSupplierbalancesArabic(this.voucherData);
            }
            else {
              this.refreshSupplierbalanceEnglish(this.voucherData);
            }

            this.calcultevalues();
          })
      );
    });
  }

  calculateBranchTotals(data: any[]): { [key: string]: number } {
    const totals: { [key: string]: number } = {};

    // Initialize totals for each branch
    this.dynamicHeaders.forEach((branch) => {
      totals[branch] = 0;
    });

    // Sum up each branch column for all rows
    data.forEach((dealer) => {
      this.dynamicHeaders.forEach((branch) => {
        totals[branch] += +dealer[branch] || 0; // Ensure numeric addition
      });
    });

    return totals;
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SupplierBalances');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.supplierbalanceAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    this.voucherDataOriginal = [];
    this.GetaccountbalanceInitialForm();
    this.clearTotals();
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
    if (this.showbranched) {
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
      this.supplierbalanceAddForm.get("branchIds").setValue('')
      this.disableGet = false;
    }
  }

  GetFiscalYear() {
    debugger
    this.supplierbalanceAddForm.value.status = this.selectedstatus;
    const formValues = this.supplierbalanceAddForm.value;
    if (formValues.branchId == null) {
      formValues.branchId = 0;
    }

    this.supReportsService.Getreportstanderd(
      formValues.supplierId,
      formValues.status,
      formValues.branchId,
      formValues.yearId,
      formValues.dealerTypeId,
      formValues.currencyId,
      formValues.currRate
    ).subscribe((result) => {
      debugger
      this.voucherData = result;

    });

  }

  GetPeriodFiscalYear() {
    const formValues = this.supplierbalanceAddForm.value;
    this.supReportsService.GetPeriodFiscalYear(formValues.yearId).subscribe((result) => {
      this.dynamicHeaders = result.map(header => header.periodNameA);
      debugger
      if (this.supplierbalanceAddForm.value.yearId != 0) {
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
    // this.tot1 = parseFloat(this.tot1.toFixed(3));
    // this.tot2 = parseFloat(this.tot2.toFixed(3));
    // this.tot3 = parseFloat(this.tot3.toFixed(3));
    // this.tot4 = parseFloat(this.tot4.toFixed(3));
    // this.tot5 = parseFloat(this.tot5.toFixed(3));
    // this.tot6 = parseFloat(this.tot6.toFixed(3));
    // this.tot7 = parseFloat(this.tot7.toFixed(3));
    // this.tot8 = parseFloat(this.tot8.toFixed(3));
    // this.tot9 = parseFloat(this.tot9.toFixed(3));
    // this.tot10 = parseFloat(this.tot10.toFixed(3));
    // this.tot11 = parseFloat(this.tot11.toFixed(3));
    // this.tot12 = parseFloat(this.tot12.toFixed(3));
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
    if (this.supplierbalanceAddForm.value.monthYearId != 0) {
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
    if (selectedValues != 0) {
      // setTimeout(() => {
      this.disableGet = false;
      // });
    }
    else {
      this.disableGet = true;
    }
  }

  OpenAccountStatementForm(dealerId: number) {
    debugger
    this.routePartsService.GuidToEdit = dealerId;

    // Construct the URL you want to navigate to
    const url = `/PayablesReport/GetSupplierAccountStatementForm?acc=${dealerId}`;

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

  refreshSupplierbalancesArabic(data) { // defult
    debugger
    this.exportData = data.map(x => ({
      'رقم المورد': x.dealerNo,
      'المورد': x.dealerName,
      'الرصيد': x.balance,
    }));
  }

  refreshSupplierbalanceEnglish(data) {// defult
    debugger
    this.exportData = data.map(x => ({
      'Supplier Number': x.dealerNo,
      'Supplier': x.dealerName,
      'Balance': x.balance,
    }));
  }

  refreshshowfiscalyearArabic(data) { // defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      ' رقم المورد': x.dealerNo,
      ' المورد': x.dealerName,
      'الرصيد الافتتاحي': x.openingBalance,
    }));
  }

  refreshshowfiscalyearEnglish(data) {// defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Supplier Number': x.dealerNo,
      'Supplier': x.dealerName,
      'Opening Balance': x.openingBalance,
    }));
  }

  refreshshowmonthlybalanceArabic(data) { // defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رقم المورد': x.dealerNo,
      'المورد': x.dealerName,
      'الرصيد الافتتاحي': x.openingBalance,
      'شهر 1': x.month1,
      'شهر 2': x.month2,
      'شهر 3': x.month3,
      'شهر 4': x.month4,
      'شهر 5': x.month5,
      'شهر 6': x.month6,
      'شهر 7': x.month7,
      'شهر 8': x.month8,
      'شهر 9': x.month9,
      'شهر 10': x.month10,
      'شهر 11': x.month11,
      'شهر 12': x.month12,
    }));
  }

  refreshshowmonthlybalanceEnglish(data) {// defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Supplier Number': x.dealerNo,
      'Supplier': x.dealerName,
      'Opening Balance': x.openingBalance,
      'Month 1': x.month1,
      'Month 2': x.month2,
      'Month 3': x.month3,
      'Month 4': x.month4,
      'Month 5': x.month5,
      'Month 6': x.month6,
      'Month 7': x.month7,
      'Month 8': x.month8,
      'Month 9': x.month9,
      'Month 10': x.month10,
      'Month 11': x.month11,
      'Month 12': x.month12,
    }));
  }

  refreshshowbranchedArabic(data) {
    debugger;
    this.voucherData = data;
    const dynamicHeaders = Object.keys(data[0]).filter(
      col => !['DealerId', 'DealerName', 'OpeningBalance', 'openingBalance'].includes(col)
    );
    this.exportData = this.voucherData.map(item => {
      const dynamicData = {};
      dynamicHeaders.forEach(header => {
        dynamicData[header] = item[header];
      });
      return {
        'رقم المورد': item.DealerId,
        'المورد': item.DealerName,
        ...dynamicData
      };
    });
  }

  refreshshowbranchedEnglish(data) {
    debugger;
    this.voucherData = data;

    const dynamicHeaders = Object.keys(data[0]).filter(
      col => !['DealerId', 'DealerName', 'OpeningBalance', 'openingBalance'].includes(col)
    );

    this.exportData = this.voucherData.map(item => {
      const dynamicData = {};
      dynamicHeaders.forEach(header => {
        dynamicData[header] = item[header];
      });

      return {
        'Supplier Number': item.DealerId,
        'Supplier': item.DealerName,
        ...dynamicData
      };
    });
  }

  exportExcel1(dt: any) {
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refreshSupplierbalancesArabic(exportSource);
      } else {
        this.refreshSupplierbalanceEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const totalBalance = exportSource.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'الرصيد': totalBalance,
        }
        : {
          'Balance': totalBalance,
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

      // حساب الصف الأخير
      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      headers.forEach((header, index) => {
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
  }

  exportPdf1(dt: any) {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];


    if (currentLang == "ar") {
       head = [['الرصيد', 'المورد', 'رقم المورد']]
    }
    else {
         head = [['Balance', 'Supplier', 'Supplier Number']]
    }
    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    let totalBalance = 0;
    exportSource.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.dealerId
      temp[1] = part.dealerName
      temp[2] = part.balance

      totalBalance += parseFloat(part.balance) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[2] = "المجموع";
      footRow[3] = totalBalance;
    } else {
      footRow[2] = "Total";
      footRow[3] = totalBalance;
    }

    foot = [footRow.reverse()];

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "أرصدة الموردين": "Supplier Balances ";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head, body: rows, foot: foot, showFoot: 'lastPage', headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      footStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', fillColor: [240, 240, 240], textColor: 'black' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow');
  }

  exportExcel2(dt: any) {
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refreshshowfiscalyearArabic(exportSource);
      } else {
        this.refreshshowfiscalyearEnglish(exportSource);
      }


      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const totalBalance = exportSource.reduce((sum, item) => sum + parseFloat(item.openingBalance || 0), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'الرصيد الافتتاحي': totalBalance,
        }
        : {
          'Opening Balance': totalBalance,
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
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
  }

  exportPdf2(dt: any) {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [['الرصيد الافتتاحي', 'المورد', 'رقم المورد']]
    }
    else {
      var head = [['Opening Balance', 'Supplier', 'Supplier Number']]
    }


    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    let totalBalance = 0;
    exportSource.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.dealerName
      temp[2] = part.openingBalance

      totalBalance += parseFloat(part.openingBalance) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[2] = "المجموع";
      footRow[3] = totalBalance.toFixed(2);
    } else {
      footRow[2] = "Total";
      footRow[3] = totalBalance.toFixed(2);
    }

    foot = [footRow.reverse()];

    const pdf = new jsPDF('p', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "أرصدة الموردين"
      : "Supplier Balances ";

    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head, body: rows, foot: foot, showFoot: 'lastPage', headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      footStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', fillColor: [240, 240, 240], textColor: 'black' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow');
  }

  exportExcel3(dt: any) {
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refreshshowmonthlybalanceArabic(exportSource);
      } else {
        this.refreshshowmonthlybalanceEnglish(exportSource);
      }
      
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const totalBalance = exportSource.reduce((sum, item) => sum + parseFloat(item.openingBalance || 0), 0);
      const totalmonth1 = exportSource.reduce((sum, item) => sum + parseFloat(item.month1 || 0), 0);
      const totalmonth2 = exportSource.reduce((sum, item) => sum + parseFloat(item.month2 || 0), 0);
      const totalmonth3 = exportSource.reduce((sum, item) => sum + parseFloat(item.month3 || 0), 0);
      const totalmonth4 = exportSource.reduce((sum, item) => sum + parseFloat(item.month4 || 0), 0);
      const totalmonth5 = exportSource.reduce((sum, item) => sum + parseFloat(item.month5 || 0), 0);
      const totalmonth6 = exportSource.reduce((sum, item) => sum + parseFloat(item.month6 || 0), 0);
      const totalmonth7 = exportSource.reduce((sum, item) => sum + parseFloat(item.month7 || 0), 0);
      const totalmonth8 = exportSource.reduce((sum, item) => sum + parseFloat(item.month8 || 0), 0);
      const totalmonth9 = exportSource.reduce((sum, item) => sum + parseFloat(item.month9 || 0), 0);
      const totalmonth10 = exportSource.reduce((sum, item) => sum + parseFloat(item.month10 || 0), 0);
      const totalmonth11 = exportSource.reduce((sum, item) => sum + parseFloat(item.month11 || 0), 0);
      const totalmonth12 = exportSource.reduce((sum, item) => sum + parseFloat(item.month12 || 0), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'الرصيد الافتتاحي': totalBalance,
          'شهر 1': totalmonth1,
          'شهر 2': totalmonth2,
          'شهر 3': totalmonth3,
          'شهر 4': totalmonth4,
          'شهر 5': totalmonth5,
          'شهر 6': totalmonth6,
          'شهر 7': totalmonth7,
          'شهر 8': totalmonth8,
          'شهر 9': totalmonth9,
          'شهر 10': totalmonth10,
          'شهر 11': totalmonth11,
          'شهر 12': totalmonth12,
        }
        : {
          'Opening Balance': totalBalance,
          'Month 1': totalmonth1,
          'Month 2': totalmonth2,
          'Month 3': totalmonth3,
          'Month 4': totalmonth4,
          'Month 5': totalmonth5,
          'Month 6': totalmonth6,
          'Month 7': totalmonth7,
          'Month 8': totalmonth8,
          'Month 9': totalmonth9,
          'Month 10': totalmonth10,
          'Month 11': totalmonth11,
          'Month 12': totalmonth12,
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
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
  }

  exportPdf3(dt: any) {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    if (currentLang == "ar") {
      var head = [['12 شهر', '11 شهر', '10 شهر', '9 شهر', '8 شهر', '7 شهر', '6 شهر', '5 شهر', '4 شهر', '3 شهر', '2 شهر', ' 1 شهر', 'الرصيد', 'المورد', 'رقم المورد']]
    }
    else {
      var head = [['Month 12', 'Month 11', 'Month 10', 'Month 9', 'Month 8', 'Month 7', 'Month 6', 'Month 5', 'Month 4', 'Month 3', 'Month 2', 'Month 1', 'Balance', 'Supplier', 'Supplier Number']]
    }

    const rows: (number | string)[][] = [];
    let totalBalance = 0;
    let totalmonth1 = 0;
    let totalmonth2 = 0;
    let totalmonth3 = 0;
    let totalmonth4 = 0;
    let totalmonth5 = 0
    let totalmonth6 = 0
    let totalmonth7 = 0
    let totalmonth8 = 0
    let totalmonth9 = 0
    let totalmonth10 = 0
    let totalmonth11 = 0
    let totalmonth12 = 0

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }


    exportSource.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.dealerId
      temp[1] = part.dealerName
      temp[2] = part.balance
      temp[3] = part.month1
      temp[4] = part.month2
      temp[5] = part.month3
      temp[6] = part.month4
      temp[7] = part.month5
      temp[8] = part.month6
      temp[9] = part.month7
      temp[10] = part.month8
      temp[11] = part.month9
      temp[12] = part.month10
      temp[13] = part.month11
      temp[14] = part.month12

      totalBalance = parseFloat(part.balance > 0 ? part.balance : 0) || 0;
      totalmonth1 = parseFloat(part.month1 > 0 ? part.month1 : 0) || 0;
      totalmonth2 = parseFloat(part.month2 > 0 ? part.month2 : 0) || 0;
      totalmonth3 = parseFloat(part.month3 > 0 ? part.month3 : 0) || 0;
      totalmonth4 = parseFloat(part.month4 > 0 ? part.month4 : 0) || 0;
      totalmonth5 = parseFloat(part.month5 > 0 ? part.month5 : 0) || 0;
      totalmonth6 = parseFloat(part.month6 > 0 ? part.month6 : 0) || 0;
      totalmonth7 = parseFloat(part.month7 > 0 ? part.month7 : 0) || 0;
      totalmonth8 = parseFloat(part.month8 > 0 ? part.month8 : 0) || 0;
      totalmonth9 = parseFloat(part.month9 > 0 ? part.month9 : 0) || 0;
      totalmonth10 = parseFloat(part.month10 > 0 ? part.month10 : 0) || 0;
      totalmonth11 = parseFloat(part.month11 > 0 ? part.month11 : 0) || 0;
      totalmonth12 = parseFloat(part.month12 > 0 ? part.month12 : 0) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[2] = "المجموع";
      footRow[3] = totalBalance.toFixed(2);
      footRow[4] = totalmonth1.toFixed(2);
      footRow[5] = totalmonth2.toFixed(2);
      footRow[6] = totalmonth1.toFixed(2);
      footRow[7] = totalmonth3.toFixed(2);
      footRow[8] = totalmonth4.toFixed(2);
      footRow[9] = totalmonth5.toFixed(2);
      footRow[10] = totalmonth6.toFixed(2);
      footRow[11] = totalmonth7.toFixed(2);
      footRow[12] = totalmonth8.toFixed(2);
      footRow[13] = totalmonth9.toFixed(2);
      footRow[14] = totalmonth10.toFixed(2);
      footRow[15] = totalmonth11.toFixed(2);
      footRow[16] = totalmonth12.toFixed(2);
    } else {
      footRow[2] = "Total";
      footRow[3] = totalBalance.toFixed(2);
      footRow[4] = totalmonth1.toFixed(2);
      footRow[5] = totalmonth2.toFixed(2);
      footRow[6] = totalmonth1.toFixed(2);
      footRow[7] = totalmonth3.toFixed(2);
      footRow[8] = totalmonth4.toFixed(2);
      footRow[9] = totalmonth5.toFixed(2);
      footRow[10] = totalmonth6.toFixed(2);
      footRow[11] = totalmonth7.toFixed(2);
      footRow[12] = totalmonth8.toFixed(2);
      footRow[13] = totalmonth9.toFixed(2);
      footRow[14] = totalmonth10.toFixed(2);
      footRow[15] = totalmonth11.toFixed(2);
      footRow[16] = totalmonth12.toFixed(2);
    }

    foot = [footRow.reverse()];

    const pdf = new jsPDF('landscape', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);


    const title = currentLang === "ar"
      ? "أرصدة الموردين"
      : "Supplier Balances ";

    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head, body: rows, foot: foot, showFoot: 'lastPage', headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      footStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', fillColor: [240, 240, 240], textColor: 'black' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow');
  }

  exportExcel4(dt: any) {
    import("xlsx").then(xlsx => {
      debugger;


      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refreshshowbranchedArabic(exportSource);
      } else {
        this.refreshshowbranchedEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const staticHeadersArabic = ['رقم المورد', 'المورد', 'الرصيد الافتتاحي'];
      const staticHeadersEnglish = ['Supplier Number', 'Supplier', 'Opening Balance'];
      const staticHeaders = isArabic ? staticHeadersArabic : staticHeadersEnglish;

      const totalHeader = isArabic ? 'الرصيد الافتتاحي' : 'Opening Balance';
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

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const dynamicHeaders = headers.filter(h => !staticHeaders.includes(h));

      dynamicHeaders.forEach(header => {
        const colIndex = headers.indexOf(header);
        const colLetter = getExcelColumnLetter(colIndex);
        const sum = this.voucherData.reduce((acc, row) => {
          const val = parseFloat(row[header]);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        const cellRef = colLetter + lastRow;
        worksheet[cellRef] = { t: 'n', v: parseFloat(sum.toFixed(2)) };
      });

      if (totalColIndex !== -1) {
        const totalAmount = this.voucherData.reduce((sum, item) =>
          sum + parseFloat(item.openingBalance ?? item.OpeningBalance ?? 0), 0);
        const totalValue = totalAmount;
        const totalColLetter = getExcelColumnLetter(totalColIndex);
        const valueCell = totalColLetter + lastRow;
        worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };
      }

      let labelColIndex = headers.findIndex(h => !dynamicHeaders.includes(h));
      if (labelColIndex === -1) labelColIndex = 0;
      const labelColLetter = getExcelColumnLetter(labelColIndex);
      const labelCell = labelColLetter + lastRow;
      worksheet[labelCell] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    });
  }

  exportPdf4(dt: any) {
    debugger;
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    const staticHeaders = isArabic
      ? ['رقم المورد', 'المورد']
      : ['Supplier Number', 'Supplier'];

    const excludedFields = ['dealerId', 'dealerName', 'DealerId', 'DealerName', 'OpeningBalance', 'openingBalance'];

    const dynamicHeaders = Object.keys(this.voucherData[0] || {}).filter(
      key => !excludedFields.includes(key)
    );

    const tableHeaders = isArabic
      ? [...dynamicHeaders.slice().reverse(), ...staticHeaders.slice().reverse()]
      : [...staticHeaders, ...dynamicHeaders];

    const rows: (number | string)[][] = [];
    const totals: { [key: string]: number } = {};

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    exportSource.forEach(item => {
      const row: (number | string)[] = [];

      if (isArabic) {

        dynamicHeaders.slice().reverse().forEach(header => {
          const val = parseFloat(item[header]) || 0;
          row.push(val);
          totals[header] = (totals[header] || 0) + val;
        });
        row.push(item.DealerName);
        row.push(item.DealerId);
      } else {

        row.push(item.DealerId);
        row.push(item.DealerName);
        dynamicHeaders.forEach(header => {
          const val = parseFloat(item[header]) || 0;
          row.push(val);
          totals[header] = (totals[header] || 0) + val;
        });
      }

      rows.push(row);
    });

    const columnCount = tableHeaders.length;
    const totalRow: (number | string)[] = new Array(columnCount).fill('');

    const totalLabel = isArabic ? 'المجموع' : 'Total';

    const totalLabelIndex = isArabic
      ? dynamicHeaders.length
      : staticHeaders.length - 1;

    totalRow[totalLabelIndex] = totalLabel;

    dynamicHeaders.forEach((header, i) => {
      const colIndex = isArabic
        ? dynamicHeaders.length - 1 - i
        : staticHeaders.length + i;
      totalRow[colIndex] = totals[header].toFixed(2);
    });

    const foot = [totalRow];

    const pdf = new jsPDF('p', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    const title = isArabic ? "أرصدة الموردين" : "Supplier Balances";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: [tableHeaders],
      body: rows,
      foot: foot,
      showFoot: 'lastPage',
      theme: "grid",
      styles: {
        font: "Amiri",
        fontSize: 8,
        fontStyle: 'bold',
        halign: isArabic ? 'right' : 'left'
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      margin: { top: 12 }
    });

    pdf.output('dataurlnewwindow');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);

      if (curr) {
        this.supplierbalanceAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.supplierbalanceAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.supplierbalanceAddForm.get("currRate").setValue(0);
      this.applyCurrencyRate(0);
      this.calcultevalues();
    }
  }

  applyCurrencyRate(rate: number) {
    if (rate > 0) {
      this.voucherData = this.voucherDataOriginal.map(row => {
        return {
          ...row,
          balance: rate > 0 ? (row.balance / rate) : row.balance
        };
      });
    }
    else {
      this.voucherData = [...this.voucherDataOriginal];
    }

  }
}

