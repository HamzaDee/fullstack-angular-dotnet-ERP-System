import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { sweetalert } from 'sweetalert';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SalesReportsService } from '../../salesreoprt.service';
import { ChangeDetectorRef } from '@angular/core';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-sales-representative-sales-report-list',
  templateUrl: './sales-representative-sales-report-list.component.html',
  styleUrls: ['./sales-representative-sales-report-list.component.scss']
})
export class SalesRepresentativeSalesReportListComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 183;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  EmployeeList: any;
  ItemsList: any;
  currenciesList: any;
  TypesList: any;
  SuppliersList: any;
  First: boolean = true;
  Second: boolean = false;
  Third: boolean = false;
  form2Active: boolean = true;
  voucherData: any;
  showhead: boolean;
  isHidden: boolean = false;
  disableDate: boolean = false;
  disableMonth: boolean = true;
  disableYear: boolean = true;
  withRetruns: number = 0;
  //totals 
  totalSales: number = 0;
  totalReturns: number = 0;
  totalTax: number = 0;
  netTotal: number = 0;
  totalMonth1: number = 0;
  totalMonth2: number = 0;
  totalMonth3: number = 0;
  totalMonth4: number = 0;
  totalMonth5: number = 0;
  totalMonth6: number = 0;
  totalMonth7: number = 0;
  totalMonth8: number = 0;
  totalMonth9: number = 0;
  totalMonth10: number = 0;
  totalMonth11: number = 0;
  totalMonth12: number = 0;
  totalAllMonths: number = 0;
  totalSalesFormatted: string = '0.000'
  totalReturnsForamatted: string = '0.000'
  totalTaxFormatted: string = '0.000'
  netTotalForamtted: string = '0.000'
  salesFormattedMap: Map<string, number> = new Map<string, number>();
  returnsFormattedMap: Map<string, number> = new Map<string, number>();
  taxFormattedMap: Map<string, number> = new Map<string, number>();
  netFormattedMap: Map<string, number> = new Map<string, number>();
  //end
  loading: boolean;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private SReportsService: SalesReportsService,
    private cdRef: ChangeDetectorRef,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      representId: [0],
      itemId: [0],
      categoryId: [0],
      customerId: [0],
      fromDate: [''],
      toDate: [''],
      month: [0],
      year: [0],
      currYear: [0],
      type: [0],
      withReturns: [0],
      currencyId: [0],
      currRate: [0],
    });

    this.GetRepresentativeReportForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesRepresentativeSalesReportList');
    this.title.setTitle(this.TitlePage);
  }

  GetRepresentativeReportForm() {

    this.SReportsService.GetSalesRepresentativeReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.EmployeeList = result.employeeList;
      this.ItemsList = result.itemsList;
      this.TypesList = result.typesList;
      this.SuppliersList = result.suppliersList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.currenciesList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.SaleReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.SaleReportForm.get("type").setValue(1);
        this.clearFormData();
        this.withRetruns = 1;
      });
    });
  }

  canBeEditDate(value) {
    debugger
    if (value == 'First') {
      this.First = true;
      this.Second = false;
      this.Third = false;
      this.voucherData = [];
      this.SaleReportForm.get("type").setValue(1);
      this.SaleReportForm.get("month").setValue(0);
      this.SaleReportForm.get("year").setValue(0);
      this.SaleReportForm.get("currYear").setValue(0);
      this.SaleReportForm.get('representId').setValue(0);
      this.SaleReportForm.get('itemId').setValue(0);
      this.SaleReportForm.get('currencyId').setValue(0);
      this.SaleReportForm.get('currRate').setValue(0);
      this.SaleReportForm.get('categoryId').setValue(0);
      this.SaleReportForm.get('customerId').setValue(0);
      this.SaleReportForm.get('month').setValue(0);
      this.SaleReportForm.get('year').setValue(0);
      this.SaleReportForm.get('currYear').setValue(0);
      this.disableDate = false;
      this.disableMonth = true;
      this.disableYear = true;
      // this.clearFormData();
    }
    else if (value == 'Second') {
      this.First = false;
      this.Second = true;
      this.Third = false;
      this.voucherData = [];
      this.SaleReportForm.get("type").setValue(2);
      this.SaleReportForm.get("currYear").setValue(0);
      this.SaleReportForm.get('representId').setValue(0);
      this.SaleReportForm.get('itemId').setValue(0);
      this.SaleReportForm.get('categoryId').setValue(0);
      this.SaleReportForm.get('customerId').setValue(0);
      this.SaleReportForm.get('month').setValue(0);
      this.SaleReportForm.get('year').setValue(0);
      this.SaleReportForm.get('currYear').setValue(0);
      this.disableDate = true;
      this.disableMonth = false;
      this.disableYear = true;
      // this.clearFormData();
    }
    else if (value == 'Third') {
      this.First = false;
      this.Second = false;
      this.Third = true;
      this.voucherData = [];
      this.SaleReportForm.get("type").setValue(3);
      this.SaleReportForm.get("month").setValue(0);
      this.SaleReportForm.get("year").setValue(0);
      this.SaleReportForm.get('representId').setValue(0);
      this.SaleReportForm.get('itemId').setValue(0);
      this.SaleReportForm.get('categoryId').setValue(0);
      this.SaleReportForm.get('customerId').setValue(0);
      this.SaleReportForm.get('month').setValue(0);
      this.SaleReportForm.get('year').setValue(0);
      this.SaleReportForm.get('currYear').setValue(0);
      this.disableDate = true;
      this.disableMonth = true;
      this.disableYear = false;
      // this.clearFormData();
    }
    this.cdRef.detectChanges();
  }

  EditValue(event: any) {
    debugger
    if (event.value > 0) {
      this.form2Active = false;
      this.voucherData = [];
    }
    else {
      this.form2Active = true;
      this.voucherData = [];
    }
  }

  GetReport() {
    debugger
    this.voucherData = [];
    this.clearTotals();
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (this.SaleReportForm.value.type == 1) {
      setTimeout(() => {
        this.voucherData = [];
        this.clearTotals();
        debugger
        const formValues = this.SaleReportForm.value;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.SReportsService.GetSalesRepresentative(
          formValues.representId,
          formValues.itemId,
          formValues.categoryId,
          formValues.customerId,
          formValues.fromDate,
          formValues.toDate,
          formValues.month,
          formValues.year,
          formValues.currYear,
          formValues.type,
          formValues.withReturns,
          formValues.currencyId,
          formValues.currRate


        ).subscribe((result) => {
          debugger

          this.voucherData = result;

          if (currentLang == "ar") {
            this.showhead = true;
            //this.showhead = true;
            this.refresRepresentativeReportArabicTable(this.voucherData);
          }
          else {
            this.showhead = false;
            // this.showhead = false;
            this.refresRepresentativeReportEnglishTable(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        }


        );


      });
    }
    else if (this.SaleReportForm.value.type == 2) {
      if (this.SaleReportForm.value.month == 0 || this.SaleReportForm.value.month == null || this.SaleReportForm.value.month == undefined) {
        this.alert.ShowAlert("msgPleaseEnterMonth", 'error');
        return;
      }
      if (this.SaleReportForm.value.year == 0 || this.SaleReportForm.value.year == null || this.SaleReportForm.value.year == undefined) {
        this.alert.ShowAlert("msgPleaseEnterYear", 'error');
        return;
      }
      setTimeout(() => {
        this.voucherData = [];
        this.clearTotals();
        debugger
        const formValues = this.SaleReportForm.value;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.SReportsService.GetSalesRepresentativeByMonth(
          formValues.representId,
          formValues.itemId,
          formValues.categoryId,
          formValues.customerId,
          formValues.fromDate,
          formValues.toDate,
          formValues.month,
          formValues.year,
          formValues.currYear,
          formValues.type,
          formValues.withReturns,
          formValues.currencyId,
          formValues.currRate

        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;

          if (currentLang == "ar") {
            this.showhead = true;
            //this.showhead = true;
            this.refresRepresentativeReportArabicTable1(this.voucherData);
          }
          else {
            this.showhead = false;
            // this.showhead = false;
            this.refresRepresentativeReportEnglishTable1(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        });


      });
    }
    else {
      if (this.SaleReportForm.value.currYear == 0 || this.SaleReportForm.value.currYear == null || this.SaleReportForm.value.currYear == undefined) {
        this.alert.ShowAlert("msgPleaseEnterYear", 'error');
        return;
      }
      setTimeout(() => {
        this.voucherData = [];
        this.clearTotals();
        debugger
        const formValues = this.SaleReportForm.value;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.SReportsService.GetSalesRepresentativeByYear(
          formValues.representId,
          formValues.itemId,
          formValues.categoryId,
          formValues.customerId,
          formValues.fromDate,
          formValues.toDate,
          formValues.month,
          formValues.year,
          formValues.currYear,
          formValues.type,
          formValues.withReturns,
          formValues.currencyId,
          formValues.currRate
        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;

          if (currentLang == "ar") {
            this.showhead = true;
            //this.showhead = true;
            this.refresRepresentativeReportArabicTable2(this.voucherData);
          }
          else {
            this.showhead = false;
            // this.showhead = false;
            this.refresRepresentativeReportEnglishTable2(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        });


      });
    }

  }

  clearFormData() {
    debugger
    // this.SaleReportForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const date = new Date();
    const currMonth = date.getMonth();
    const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
    const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
    this.SaleReportForm.get('fromDate').setValue(dddate);
    this.SaleReportForm.get('toDate').setValue(currentDate);
    this.Data = []; // Clear the table data
    this.voucherData = [];
    this.SaleReportForm.get('representId').setValue(0);
    this.SaleReportForm.get('itemId').setValue(0);
    this.SaleReportForm.get('categoryId').setValue(0);
    this.SaleReportForm.get('customerId').setValue(0);
    this.SaleReportForm.get('month').setValue(currMonth + 1);
    this.SaleReportForm.get('year').setValue(currentYear);
    this.SaleReportForm.get('currYear').setValue(currentYear);
    this.SaleReportForm.get('type').setValue(1);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);
    this.form2Active = true;
    this.clearTotals();
  }

  calcultevalues() {
    debugger;
    if (this.First === true) {
      if (this.form2Active === true) {
        this.salesFormattedMap.clear();
        this.returnsFormattedMap.clear();
        this.taxFormattedMap.clear();
        this.netFormattedMap.clear();
        this.totalSales = 0;
        this.totalReturns = 0;
        this.totalTax = 0;
        this.netTotal = 0;
        this.totalSalesFormatted = '0.000'
        this.totalReturnsForamatted = '0.000'
        this.totalTaxFormatted = '0.000'
        this.netTotalForamtted = '0.000'


        this.voucherData.forEach(voucher => {
          const groupKey = voucher.repName;
          if (!this.salesFormattedMap.has(groupKey)) {
            this.salesFormattedMap.set(groupKey, 0);
            this.returnsFormattedMap.set(groupKey, 0);
            this.taxFormattedMap.set(groupKey, 0);
            this.netFormattedMap.set(groupKey, 0);

          }
          this.salesFormattedMap.set(groupKey, this.salesFormattedMap.get(groupKey)! + parseFloat(voucher.salesTotal) || 0);
          this.returnsFormattedMap.set(groupKey, this.returnsFormattedMap.get(groupKey)! + parseFloat(voucher.returnTotal) || 0);
          this.taxFormattedMap.set(groupKey, this.taxFormattedMap.get(groupKey)! + (parseFloat(voucher.taxTotal)) || 0);
          this.netFormattedMap.set(groupKey, this.netFormattedMap.get(groupKey)! + (parseFloat(voucher.netTotal)) || 0);
        });

        for (let r = 0; r < this.voucherData.length; r++) {
          this.totalSales += Number(this.voucherData[r].salesTotal);
          this.totalReturns += Number(this.voucherData[r].returnTotal)
          this.totalTax += Number(this.voucherData[r].taxTotal)
          this.netTotal += Number(this.voucherData[r].netTotal)
        }
        this.totalSalesFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSales);
        this.totalReturnsForamatted = this.appCommonserviceService.formatCurrencyNumber(this.totalReturns);
        this.totalTaxFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalTax);
        this.netTotalForamtted = this.appCommonserviceService.formatCurrencyNumber(this.netTotal);
      }
      else {
        this.totalSales = 0;
        this.totalReturns = 0;
        this.totalTax = 0;
        this.netTotal = 0;
        this.totalSalesFormatted = '0.000'
        this.totalReturnsForamatted = '0.000'
        this.totalTaxFormatted = '0.000'
        this.netTotalForamtted = '0.000'
        for (let r = 0; r < this.voucherData.length; r++) {
          this.totalSales += Number(this.voucherData[r].salesTotal);
          this.totalReturns += Number(this.voucherData[r].returnTotal)
          this.totalTax += Number(this.voucherData[r].taxTotal)
          this.netTotal += Number(this.voucherData[r].netTotal)
        }
        this.totalSalesFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSales);
        this.totalReturnsForamatted = this.appCommonserviceService.formatCurrencyNumber(this.totalReturns);
        this.totalTaxFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalTax);
        this.netTotalForamtted = this.appCommonserviceService.formatCurrencyNumber(this.netTotal);
      }
    }
    else if (this.Second === true) {
      this.totalSales = 0;
      this.netTotal = 0;
      this.totalReturns = 0;
      this.totalSalesFormatted = '0.000'
      this.netTotalForamtted = '0.000'

      for (let r = 0; r < this.voucherData.length; r++) {
        this.totalSales += Number(this.voucherData[r].totalSales);
        this.netTotal += Number(this.voucherData[r].monthlyTarget)
      }
      this.totalSalesFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSales);
      this.netTotalForamtted = this.appCommonserviceService.formatCurrencyNumber(this.netTotal);
      this.totalReturnsForamatted = ((this.totalSales / this.netTotal) * 100).toFixed(0) + '%';
    }
    else {
      this.totalMonth1 = 0;
      this.totalMonth2 = 0;
      this.totalMonth3 = 0;
      this.totalMonth4 = 0;
      this.totalMonth5 = 0;
      this.totalMonth6 = 0;
      this.totalMonth7 = 0;
      this.totalMonth8 = 0;
      this.totalMonth9 = 0;
      this.totalMonth10 = 0;
      this.totalMonth11 = 0;
      this.totalMonth12 = 0;
      this.totalAllMonths = 0;

      for (let r = 0; r < this.voucherData.length; r++) {
        this.totalMonth1 += Number(this.voucherData[r].januarySales);
        this.totalMonth2 += Number(this.voucherData[r].februarySales);
        this.totalMonth3 += Number(this.voucherData[r].marchSales);
        this.totalMonth4 += Number(this.voucherData[r].aprilSales);
        this.totalMonth5 += Number(this.voucherData[r].maySales);
        this.totalMonth6 += Number(this.voucherData[r].juneSales);
        this.totalMonth7 += Number(this.voucherData[r].julySales);
        this.totalMonth8 += Number(this.voucherData[r].augustSales);
        this.totalMonth9 += Number(this.voucherData[r].septemberSales);
        this.totalMonth10 += Number(this.voucherData[r].octoberSales);
        this.totalMonth11 += Number(this.voucherData[r].novemberSales);
        this.totalMonth12 += Number(this.voucherData[r].decemberSales);
        this.totalAllMonths += Number(this.voucherData[r].total);
      }



    }
  }

  clearTotals() {
    this.salesFormattedMap.clear();
    this.returnsFormattedMap.clear();
    this.taxFormattedMap.clear();
    this.netFormattedMap.clear();
    this.totalSales = 0;
    this.totalReturns = 0;
    this.totalTax = 0;
    this.netTotal = 0;
    this.totalSalesFormatted = '0.000'
    this.totalReturnsForamatted = '0.000'
    this.totalTaxFormatted = '0.000'
    this.netTotalForamtted = '0.000'
    this.totalMonth1 = 0;
    this.totalMonth2 = 0;
    this.totalMonth3 = 0;
    this.totalMonth4 = 0;
    this.totalMonth5 = 0;
    this.totalMonth6 = 0;
    this.totalMonth7 = 0;
    this.totalMonth8 = 0;
    this.totalMonth9 = 0;
    this.totalMonth10 = 0;
    this.totalMonth11 = 0;
    this.totalMonth12 = 0;
    this.totalAllMonths = 0;
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
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

  OpenForm(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    let url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
    window.open(url, '_blank');
  }

  loadLazyOptions(event: any) {
    debugger
    const { first, last } = event;
    

    // Don't replace the full list; copy and fill only the needed range
    if (!this.ItemsList) {
      this.ItemsList = [];
    }

    // Make sure the array is large enough
    while (this.ItemsList.length < last) {
      this.ItemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.ItemsList[i] = this.ItemsList[i];
    }
    this.loading = false;
  }

  refresRepresentativeReportArabicTable(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'المندوب': x.repName,
        'رقم الفاتورة': x.voucherNo,
        'نوع السند': x.voucherName,
        'التاريخ': voucherDate,
        'مجموع مبيعات': x.salesTotal,
        'الضريبة': x.taxTotal,
        'مجموع المردودات': x.returnTotal,
        'الصافي': x.netTotal,
        'العميل': x.dealerName,
        'طريقة الدفع': x.payment,
      }
    });
  }

  refresRepresentativeReportEnglishTable(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Representive': x.repName,
        'Invoice Number ': x.voucherNo,
        'Voucher Type': x.voucherName,
        'Date ': voucherDate,
        'Total Sales': x.salesTotal,
        'Tax': x.taxTotal,
        'Total Returns': x.returnTotal,
        'The Net Amount': x.netTotal,
        'Customer': x.dealerName,
        'Payment Method': x.payment,
      }
    });
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };

      const totalSales = this.voucherData.reduce((sum, item) => sum + parseFloat(item.salesTotal?.toString().trim() || "0"), 0);
      const totalTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.taxTotal?.toString().trim() || "0"), 0);
      const totalReturn = this.voucherData.reduce((sum, item) => sum + parseFloat(item.returnTotal?.toString().trim() || "0"), 0);
      const netTotal = this.voucherData.reduce((sum, item) => sum + parseFloat(item.netTotal?.toString().trim() || "0"), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'مجموع مبيعات': totalSales,
          'الضريبة': totalTax,
          'مجموع المردودات': totalReturn,
          'الصافي': netTotal,
        }
        : {
          'Total Sales': totalSales,
          'Tax': totalTax,
          'Total Returns': totalReturn,
          'The Net Amount': netTotal,
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
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
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
       head = [['طريقة الدفع', 'العميل', ' الصافي', 'مجموع المردودات ', 'الضريبة ', ' مجموع المبيعات ', 'التاريخ ', 'نوع السند', 'رقم الفاتورة', ' المندوب']]
    }
    else {
       head = [['Payment Method', 'Customer ', 'The Net Amount', 'Total Returns', 'Tax', 'Total Sales', 'Date ', 'Voucher Type', ' Invoice Number', 'Representive']]
    }

    const rows: (number | string)[][] = [];
    let totalSales = 0;
    let totalTax = 0;
    let totalReturn = 0;
    let netTotal = 0;

    this.voucherData.forEach(function (part) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.repName,
        temp[1] = part.voucherNo,
        temp[2] = part.voucherName,
        temp[3] = voucherDate,
        temp[4] = part.salesTotal.toFixed(3),
        temp[5] = part.taxTotal.toFixed(3),
        temp[6] = part.returnTotal.toFixed(3),
        temp[7] = part.netTotal.toFixed(3),
        temp[8] = part.dealerName,
        temp[9] = part.payment,

        totalSales += parseFloat(part.salesTotal) || 0;
      totalTax += parseFloat(part.taxTotal) || 0;
      totalReturn += parseFloat(part.returnTotal) || 0;
      netTotal += parseFloat(part.netTotal) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[3] = "المجموع";
      footRow[4] = totalSales.toFixed(2);
      footRow[5] = totalTax.toFixed(2);
      footRow[6] = totalReturn.toFixed(2);
      footRow[7] = netTotal.toFixed(2);
    } else {
      footRow[3] = "Total";
      footRow[4] = totalSales.toFixed(2);
      footRow[5] = totalTax.toFixed(2);
      footRow[6] = totalReturn.toFixed(2);
      footRow[7] = netTotal.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar" ? " كشف مبيعات المندوبين " : "Sales Representative Sales Report"
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

  refresRepresentativeReportArabicTable1(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'المندوب': x.empName,
      'الكوتا الشهريه': x.monthlyTarget,
      'اجمالي المبيعات': x.totalSales,
      'نسبة الانجاز': x.completionRate,
    }));
  }

  refresRepresentativeReportEnglishTable1(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Man': x.empName,
      'Monthly Quota': x.monthlyTarge,
      'Total Sales': x.totalSales,
      'Completion Perc': x.completionRate,
    }));
  }

  exportExcel2() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };

      const totalmonthlyTarget = this.voucherData.reduce((sum, item) => sum + parseFloat(item.monthlyTarget?.toString().trim() || "0"), 0);
      const totaltotalSales = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalSales?.toString().trim() || "0"), 0);
      const totalcompletionRate = this.voucherData.reduce((sum, item) => sum + parseFloat(item.completionRate?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'الكوتا الشهريه': totalmonthlyTarget,
          'اجمالي المبيعات': totaltotalSales,
          'نسبة الانجاز': totalcompletionRate,
        }
        : {
          'Monthly Quota': totalmonthlyTarget,
          'Total Sales': totaltotalSales,
          'Completion Perc': totalcompletionRate,
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
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
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

  exportPdf2() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['نسبة الانجاز ', ' اجمالي المبيعات ', ' الكوتا الشهرية', ' المندوب']]
    }
    else {
       head = [['Completion Perc', 'Total Sales', 'Monthly Quota', 'Man']]
    }

    const rows: (number | string)[][] = [];
    let totalmonthlyTarget = 0;
    let totalTax = 0;
    let TotalcompletionRate = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.empName,
        temp[1] = part.monthlyTarget.toFixed(3),
        temp[2] = part.totalSales.toFixed(3),
        temp[3] = part.completionRate,

        totalmonthlyTarget += parseFloat(part.monthlyTarget) || 0;
      totalTax += parseFloat(part.totalSales) || 0;
      TotalcompletionRate += parseFloat(part.completionRate) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[0] = "المجموع";
      footRow[1] = totalmonthlyTarget.toFixed(2);
      footRow[2] = totalTax.toFixed(2);
      footRow[3] = TotalcompletionRate.toFixed(2);
    } else {
      footRow[0] = "Total";
      footRow[1] = totalmonthlyTarget.toFixed(2);
      footRow[2] = totalTax.toFixed(2);
      footRow[3] = TotalcompletionRate.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar" ? " كشف مبيعات المندوبين " : "Sales Representative Sales Report"
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

  refresRepresentativeReportArabicTable2(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'المندوب': x.empName,
      'شهر 1': x.januarySales,
      'شهر 2': x.februarySales,
      'شهر 3': x.marchSales,
      'شهر 4': x.aprilSales,
      'شهر 5': x.maySales,
      'شهر 6': x.juneSales,
      'شهر 7': x.julySales,
      'شهر8': x.augustSales,
      'شهر 9': x.septemberSales,
      'شهر 10': x.octoberSales,
      'شهر 11': x.novemberSales,
      'شهر 12': x.decemberSales,
      'المجموع': x.total,
    }));
  }

  refresRepresentativeReportEnglishTable2(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Man': x.empName,
      'Month 1': x.januarySales,
      'Month 2': x.februarySales,
      'Month 3': x.marchSales,
      'Month 4': x.aprilSales,
      'Month 5': x.maySales,
      'Month 6': x.juneSales,
      'Month 7': x.julySales,
      'Month 8': x.augustSales,
      'Month 9': x.septemberSales,
      'Month 10': x.octoberSales,
      'Month 11': x.novemberSales,
      'Month 12': x.decemberSales,
      'Total': x.total,
    }));
  }

  exportExcel3() {
    import("xlsx").then(xlsx => {
      debugger;
      // const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const worksheet = (xlsx.utils.json_to_sheet as any)(this.exportData, { origin: 'A2' });

      const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
      const headers1 = Object.keys(this.exportData[0]);
      const lastColLetter = getExcelColumnLetter(headers1.length - 1);
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];

      const totalmonth1 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.januarySales?.toString().trim() || "0"), 0);
      const totalmonth2 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.februarySales?.toString().trim() || "0"), 0);
      const totalmonth3 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.marchSales?.toString().trim() || "0"), 0);
      const totalmonth4 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.aprilSales?.toString().trim() || "0"), 0);
      const totalmonth5 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.maySales?.toString().trim() || "0"), 0);
      const totalMonth6 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.juneSales?.toString().trim() || "0"), 0);
      const totalmonth7 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.julySales?.toString().trim() || "0"), 0);
      const totalmonth8 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.augustSales?.toString().trim() || "0"), 0);
      const totalmonth9 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.septemberSales?.toString().trim() || "0"), 0);
      const totalmonth10 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.octoberSales?.toString().trim() || "0"), 0);
      const totalmonth11 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.novemberSales?.toString().trim() || "0"), 0);
      const totalmonth12 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.decemberSales?.toString().trim() || "0"), 0);
      const totalAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.total?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          'شهر 1': totalmonth1,
          'شهر 2': totalmonth2,
          'شهر 3': totalmonth3,
          'شهر 4': totalmonth4,
          'شهر 5': totalmonth5,
          'شهر 6': totalMonth6,
          'شهر 7': totalmonth7,
          'شهر8': totalmonth8,
          'شهر 9': totalmonth9,
          'شهر 10': totalmonth10,
          'شهر 11': totalmonth11,
          'شهر 12': totalmonth12,
          'المجموع': totalAmount,
        }
        : {
          'Month 1': totalmonth1,
          'Month 2': totalmonth2,
          'Month 3': totalmonth3,
          'Month 4': totalmonth4,
          'Month 5': totalmonth5,
          'Month 6': totalMonth6,
          'Month 7': totalmonth7,
          'Month 8': totalmonth8,
          'Month 9': totalmonth9,
          'Month 10': totalmonth10,
          'Month 11': totalmonth11,
          'Month 12': totalmonth12,
          'Total': totalAmount,
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
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
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

  exportPdf3() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['المجموع', 'شهر 12', 'شهر 11', 'شهر 10', 'شهر 9', ' شهر8 ', ' 7شهر', ' 6 شهر', ' 5شهر', ' 4شهر ', ' 3 شهر ', '2 شهر ', ' 1شهر ', ' المندوب']]
    }
    else {
       head = [['Total', 'Month 12', 'Month 11', 'Month 10', 'Month 9', 'Month 8', 'Month 7', 'Month 6', 'Month 5', 'Month 4', 'Month 3', 'Month 2', 'Month 1', 'Man']]
    }

    const rows: (number | string)[][] = [];
    let totalmonth1 = 0;
    let totalmonth2 = 0;
    let totalmonth3 = 0;
    let totalmonth4 = 0;
    let totalmonth5 = 0;
    let totalMonth6 = 0;
    let totalmonth7 = 0;
    let totalmonth8 = 0;
    let totalmonth9 = 0;
    let totalmonth10 = 0;
    let totalmonth11 = 0;
    let totalmonth12 = 0;
    let totalAmount = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.empName,
        temp[1] = part.januarySales.toFixed(3),
        temp[2] = part.februarySales.toFixed(3),
        temp[3] = part.marchSales.toFixed(3),
        temp[4] = part.aprilSales.toFixed(3),
        temp[5] = part.maySales.toFixed(3),
        temp[6] = part.juneSales.toFixed(3),
        temp[7] = part.julySales.toFixed(3),
        temp[8] = part.augustSales.toFixed(3),
        temp[9] = part.septemberSales.toFixed(3),
        temp[10] = part.octoberSales.toFixed(3),
        temp[11] = part.novemberSales.toFixed(3),
        temp[12] = part.decemberSales.toFixed(3),
        temp[13] = part.total.toFixed(3),

        totalmonth1 += parseFloat(part.januarySales) || 0;
      totalmonth2 += parseFloat(part.februarySales) || 0;
      totalmonth3 += parseFloat(part.marchSales) || 0;
      totalmonth4 += parseFloat(part.aprilSales) || 0;
      totalmonth5 += parseFloat(part.maySales) || 0;
      totalMonth6 += parseFloat(part.juneSales) || 0;
      totalmonth7 += parseFloat(part.julySales) || 0;
      totalmonth8 += parseFloat(part.augustSales) || 0;
      totalmonth9 += parseFloat(part.septemberSales) || 0;
      totalmonth10 += parseFloat(part.octoberSales) || 0;
      totalmonth11 += parseFloat(part.novemberSales) || 0;
      totalmonth12 += parseFloat(part.decemberSales) || 0;
      totalAmount += parseFloat(part.total) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[0] = "المجموع";
      footRow[1] = totalmonth1.toFixed(2);
      footRow[2] = totalmonth2.toFixed(2);
      footRow[3] = totalmonth3.toFixed(2);
      footRow[4] = totalmonth4.toFixed(2);
      footRow[5] = totalmonth5.toFixed(2);
      footRow[6] = totalMonth6.toFixed(2);
      footRow[7] = totalmonth7.toFixed(2);
      footRow[8] = totalmonth8.toFixed(2);
      footRow[9] = totalmonth9.toFixed(2);
      footRow[10] = totalmonth10.toFixed(2);
      footRow[11] = totalmonth11.toFixed(2);
      footRow[12] = totalmonth12.toFixed(2);
      footRow[13] = totalAmount.toFixed(2);

    } else {
      footRow[0] = "المجموع";
      footRow[1] = totalmonth1.toFixed(2);
      footRow[2] = totalmonth2.toFixed(2);
      footRow[3] = totalmonth3.toFixed(2);
      footRow[4] = totalmonth4.toFixed(2);
      footRow[5] = totalmonth5.toFixed(2);
      footRow[6] = totalMonth6.toFixed(2);
      footRow[7] = totalmonth7.toFixed(2);
      footRow[8] = totalmonth8.toFixed(2);
      footRow[9] = totalmonth9.toFixed(2);
      footRow[10] = totalmonth10.toFixed(2);
      footRow[11] = totalmonth11.toFixed(2);
      footRow[12] = totalmonth12.toFixed(2);
      footRow[13] = totalAmount.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar" ? " كشف مبيعات المندوبين " : "Sales Representative Sales Report"
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

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);
      if (curr) {
        this.SaleReportForm.get("currRate").setValue(Number(curr.data1))
      }
      else {
        this.SaleReportForm.get("currRate").setValue(0);
      }
    }
    else {
      this.SaleReportForm.get("currRate").setValue(0);
    }
  }
}
