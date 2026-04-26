import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReportServiceService } from '../report-service.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-yearly-depreciation-report',
  templateUrl: './yearly-depreciation-report.component.html',
  styleUrls: ['./yearly-depreciation-report.component.scss']
})
export class YearlyDepreciationReportComponent implements OnInit {
  public TitlePage: string;
  screenId: number;
  custom: boolean;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  public FiscalYearList: any;
  public SelectedFiscalYear: number = 0;
  public AssestList: any;
  public SelectedAssestList: number = -1;
  public FixedAssetTypeModelList: any;
  public SelectedFixedAssetType: number = -1;
  public LocationList: any;
  public SelectedLocation: number = -1;
  public BranchList: any;
  public SelectedBranchList: number = -1;
  public StatusList: any;
  public SelectedStatus: number = -1;
  public EmployeeList: any;
  public SelectedEmployee: number = -1;
  public IsDepreciablList: any;
  public selectedIsDepreciabl: number = -1;
  YearlyDepreciationForm: FormGroup;
  public AssetsAmmountTotal: number = 0;
  public RoundedDepreciationTotal: number = 0;
  public AdditionsTotal: number = 0;
  public DecreasionTotal: number = 0;
  public Month1Total: number = 0;
  public Month2Total: number = 0;
  public Month3Total: number = 0;
  public Month4Total: number = 0;
  public Month5Total: number = 0;
  public Month6Total: number = 0;
  public Month7Total: number = 0;
  public Month8Total: number = 0;
  public Month9Total: number = 0;
  public Month10Total: number = 0;
  public Month11Total: number = 0;
  public Month12Total: number = 0;
  public AnnualDepreciationTotal: number = 0;
  public BookValueTotal: number = 0;
  decimalPlaces: number;
  public currencyList: any;

  constructor(private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private reportServiceService: ReportServiceService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.YearlyDepreciationForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fixedAssetsId: [0],
      fixedAssetsTypesId: [0],
      locationId: [0],
      branchId: [0],
      status: [0],
      employeeId: [0],
      isDepreciable: [false],
      voucherTypesId: [0],
      voucherStatus: [0],
      fromPurchaseDate: [''],
      toPurchaseDate: [''],
      assetsWhoseValueHasBeenDepreciated: [false],
      addedAssets: [false],
      fiscalYear: [0, [Validators.required, Validators.pattern('^[1-9][0-9]*')]]
    });
    this.SetTitlePage();
    this.GetIYearlyDepreciationReportInitialForm();
  }

  GetIYearlyDepreciationReportInitialForm() {
    debugger
    this.reportServiceService.GetAssetYearlyDepreciationReport().subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.FiscalYearList = result.fiscalYearList;
      this.AssestList = result.assestList;
      this.FixedAssetTypeModelList = result.fixedAssetTypeModelList;
      this.LocationList = result.locationList;
      this.BranchList = result.userCompanyBranchList;
      this.StatusList = result.statusList;
      this.EmployeeList = result.employeeList;
      this.IsDepreciablList = result.isDepreciablList;
      result.fromPurchaseDate = formatDate(result.fromPurchaseDate, "yyyy-MM-dd", "en-US")
      result.toPurchaseDate = formatDate(result.toPurchaseDate, "yyyy-MM-dd", "en-US")
      this.YearlyDepreciationForm.patchValue(result);

      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.SelectedAssestList = 0;//result.fixedAssetsId; Edit By hamza
        this.SelectedFixedAssetType = 0;//result.fixedAssetsTypesId;
        this.SelectedLocation = 0; //result.locationId;
        this.SelectedBranchList = 0;//result.branchId;
        this.SelectedStatus = 0;//result.status;
        this.SelectedEmployee = 0;//result.employeeId;
        this.selectedIsDepreciabl = -2;//result.isDepreciable;
        this.SelectedFiscalYear = null;
      });

    });
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    var assetId = this.SelectedAssestList > 0 ? this.SelectedAssestList : -1;
    var branchId = this.SelectedBranchList > 0 ? this.SelectedBranchList : -1;
    var typeId = this.SelectedFixedAssetType > 0 ? this.SelectedFixedAssetType : -1;
    var employeeId = this.SelectedEmployee > 0 ? this.SelectedEmployee : -1;
    var locationId = this.SelectedLocation > 0 ? this.SelectedLocation : -1;
    var assetStatus = this.SelectedStatus > 0 ? this.SelectedStatus : -1;
    var isDepreciable = this.selectedIsDepreciabl > 0 ? this.selectedIsDepreciabl : -1;
    var assetsWhoseValueHasBeenDepreciated = this.YearlyDepreciationForm.value.assetsWhoseValueHasBeenDepreciated;
    var addedAssets = this.YearlyDepreciationForm.value.addedAssets;
    var fromPurchaseDate = this.YearlyDepreciationForm.value.fromPurchaseDate;
    var toPurchaseDate = this.YearlyDepreciationForm.value.toPurchaseDate;
    var fiscalYearId = this.SelectedFiscalYear;

    this.reportServiceService.GetYearlyDepreciationSearch(
      fiscalYearId,
      assetId,
      typeId,
      employeeId,
      locationId,
      assetStatus,
      isDepreciable,
      assetsWhoseValueHasBeenDepreciated,
      addedAssets,
      fromPurchaseDate,
      toPurchaseDate,
      branchId)
      .subscribe((result) => {

        this.voucherData = result;

        for (let i = 0; i < this.voucherData.length; i++) {
          this.voucherData[i].amount = this.formatCurrency(this.voucherData[i].amount.toFixed(this.decimalPlaces));
          this.voucherData[i].additions = this.formatCurrency(this.voucherData[i].additions.toFixed(this.decimalPlaces));
          this.voucherData[i].decreases = this.formatCurrency(this.voucherData[i].decreases.toFixed(this.decimalPlaces));
          this.voucherData[i].bookValue = this.formatCurrency(this.voucherData[i].bookValue.toFixed(this.decimalPlaces));
          this.voucherData[i].month1 = this.formatCurrency(this.voucherData[i].month1.toFixed(this.decimalPlaces));
          this.voucherData[i].month2 = this.formatCurrency(this.voucherData[i].month2.toFixed(this.decimalPlaces));
          this.voucherData[i].month3 = this.formatCurrency(this.voucherData[i].month3.toFixed(this.decimalPlaces));
          this.voucherData[i].month4 = this.formatCurrency(this.voucherData[i].month4.toFixed(this.decimalPlaces));
          this.voucherData[i].month5 = this.formatCurrency(this.voucherData[i].month5.toFixed(this.decimalPlaces));
          this.voucherData[i].month6 = this.formatCurrency(this.voucherData[i].month6.toFixed(this.decimalPlaces));
          this.voucherData[i].month7 = this.formatCurrency(this.voucherData[i].month7.toFixed(this.decimalPlaces));
          this.voucherData[i].month8 = this.formatCurrency(this.voucherData[i].month8.toFixed(this.decimalPlaces));
          this.voucherData[i].month9 = this.formatCurrency(this.voucherData[i].month9.toFixed(this.decimalPlaces));
          this.voucherData[i].month10 = this.formatCurrency(this.voucherData[i].month10.toFixed(this.decimalPlaces));
          this.voucherData[i].month11 = this.formatCurrency(this.voucherData[i].month11.toFixed(this.decimalPlaces));
          this.voucherData[i].month12 = this.formatCurrency(this.voucherData[i].month12.toFixed(this.decimalPlaces));
        }

        this.SetAmountformat();
        if (currentLang == "ar") {
          this.refreshYearlyDepreciationReportArabic(this.voucherData);
        }
        else {
          this.refreshYearlyDepreciationReportEnglish(this.voucherData);
        }
      });
  }

  SetAmountformat() {
    debugger
    this.AssetsAmmountTotal = 0;
    this.RoundedDepreciationTotal = 0;
    this.AdditionsTotal = 0;
    this.DecreasionTotal = 0;
    this.Month1Total = 0;
    this.Month2Total = 0;
    this.Month3Total = 0;
    this.Month4Total = 0;
    this.Month5Total = 0;
    this.Month6Total = 0;
    this.Month7Total = 0;
    this.Month8Total = 0;
    this.Month9Total = 0;
    this.Month10Total = 0;
    this.Month11Total = 0;
    this.Month12Total = 0;
    this.AnnualDepreciationTotal = 0;
    this.BookValueTotal = 0;

    for (const row of this.voucherData) {
      this.AssetsAmmountTotal = Number(this.AssetsAmmountTotal) + Number(row.amount);
      this.RoundedDepreciationTotal += Number(row.rounded_Depreciation);
      this.AdditionsTotal += Number(row.additions);
      this.DecreasionTotal += Number(row.decreases);
      this.Month1Total += Number(row.month1);
      this.Month2Total += Number(row.month2);
      this.Month3Total += Number(row.month3);
      this.Month4Total += Number(row.month4);
      this.Month5Total += Number(row.month5);
      this.Month6Total += Number(row.month6);
      this.Month7Total += Number(row.month7);
      this.Month8Total += Number(row.month8);
      this.Month9Total += Number(row.month9);
      this.Month10Total += Number(row.month10);
      this.Month11Total += Number(row.month11);
      this.Month12Total += Number(row.month12);
      this.AnnualDepreciationTotal += Number(row.annual_Depreciation);
      this.BookValueTotal += Number(row.bookValue);
    }
  }

  updateTotal(total, value) {
    return (total ?? 0) + (isNaN(value) ? 0 : Number(this.formatCurrency(value)));
  }

  clearFormData() {
    debugger
    const currentDate = new Date().toISOString().split('T')[0];
    this.YearlyDepreciationForm.get('fromPurchaseDate').setValue(currentDate);
    this.YearlyDepreciationForm.get('toPurchaseDate').setValue(currentDate);
    this.voucherData = []; // Clear the table data
    this.SelectedAssestList = 0;
    this.SelectedBranchList = 0;
    this.SelectedFixedAssetType = 0;
    this.SelectedEmployee = 0;
    this.SelectedLocation = 0;
    this.SelectedStatus = 0;
    this.selectedIsDepreciabl = -1;
    this.AssetsAmmountTotal = 0;
    this.RoundedDepreciationTotal = 0;
    this.AdditionsTotal = 0;
    this.DecreasionTotal = 0;
    this.Month1Total = 0;
    this.Month2Total = 0;
    this.Month3Total = 0;
    this.Month4Total = 0;
    this.Month5Total = 0;
    this.Month6Total = 0;
    this.Month7Total = 0;
    this.Month8Total = 0;
    this.Month9Total = 0;
    this.Month10Total = 0;
    this.Month11Total = 0;
    this.Month12Total = 0;
    this.AnnualDepreciationTotal = 0;
    this.BookValueTotal = 0;
    this.SelectedFiscalYear = 0;
    this.YearlyDepreciationForm.get('fiscalYear').setValue(0);
    this.YearlyDepreciationForm.get('isDepreciable').setValue(-2);
    this.YearlyDepreciationForm.get('assetsWhoseValueHasBeenDepreciated').setValue(false);
    this.YearlyDepreciationForm.get('addedAssets').setValue(false);
  }

  detailsYearlyDepreciationOperation(fixedAssetNo, opType) {
    debugger
    opType = 1;

    const url = `/FixedAssetsList/FixedAseetsListForm?fixedAssetNo=${fixedAssetNo}&opType=${encodeURIComponent(opType)}`;
    window.open(url, '_blank');

  }

  AssetYearlyDepreciationReport(fixedAssetId) {
    debugger

    const url = `/FixedAssetsReports/GetTransactionReport?fixedAssetId=${fixedAssetId}`;
    window.open(url, '_blank');

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReportYearlyConsumption');
    this.title.setTitle(this.TitlePage);
  }

  updateFavourite(ScreenId: number) {
    debugger
    this.reportServiceService.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    debugger
    this.reportServiceService.GetFavouriteStatus(screenId).subscribe(result => {
      debugger
      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }



  refreshYearlyDepreciationReportArabic(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => {
      const purchaseDate = new Date(x.purchaseDate).toLocaleDateString('ar-EG');
      return {
        'رقم الاصل': x.fixedAssetNo,
        'الاصل': x.faName,
        'فئة الاصل': x.faTypeName,
        'تاريخ الشراء': purchaseDate,
        'قيمة الاصل': x.amount,
        'الاستهلاك المدور': x.rounded_Depreciation,
        'الاضافات': x.additions,
        'الانقاصات': x.decreases,
        '1 شهر': x.month1,
        '2 شهر': x.month2,
        '3 شهر': x.month3,
        '4 شهر': x.month4,
        '5 شهر': x.month5,
        '6 شهر': x.month6,
        '7 شهر': x.month7,
        '8 شهر': x.month8,
        '9 شهر': x.month9,
        '10 شهر': x.month10,
        '11 شهر': x.month11,
        '12 شهر': x.month12,
        'الاستهلاك السنوي': x.annual_Depreciation,
        'القيمة الدفترية': x.bookValue,
      }
    });
  }

  refreshYearlyDepreciationReportEnglish(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => {
      const purchaseDate = new Date(x.purchaseDate).toLocaleDateString('en-GB');
      return {
        'Assest Number': x.fixedAssetNo,
        'Assest Name': x.faName,
        'Assest Class': x.faTypeName,
        'Purchase Date': purchaseDate,
        'Amount': x.amount,
        'Rounded Depreciation': x.rounded_Depreciation,
        'Additions': x.additions,
        'Decreases': x.decreases,
        '1 Month': x.month1,
        '2 Month': x.month2,
        '3 Month': x.month3,
        '4 Month': x.month4,
        '5 Month': x.month5,
        '6 Month': x.month6,
        '7 Month': x.month7,
        '8 Month': x.month8,
        '9 Month': x.month9,
        '10 Month': x.month10,
        '11 Month': x.month11,
        '12 Month': x.month12,
        'Annual Depreciation': x.annual_Depreciation,
        'Nominal Value': x.bookValue,
      }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const totalAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.amount?.toString().trim() || "0"), 0);
      const totalRoundedDepreciation = this.voucherData.reduce((sum, item) => sum + parseFloat(item.rounded_Depreciation?.toString().trim() || "0"), 0);
      const totalAdditions = this.voucherData.reduce((sum, item) => sum + parseFloat(item.additions?.toString().trim() || "0"), 0);
      const totalDecreases = this.voucherData.reduce((sum, item) => sum + parseFloat(item.decreases?.toString().trim() || "0"), 0);
      const totalMonth1 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month1?.toString().trim() || "0"), 0);
      const totalMonth2 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month2?.toString().trim() || "0"), 0);
      const totalMont3 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month3?.toString().trim() || "0"), 0);
      const totalMonth4 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month4?.toString().trim() || "0"), 0);
      const totalMonth5 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month5?.toString().trim() || "0"), 0);
      const totalMonth6 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month6?.toString().trim() || "0"), 0);
      const totalMonth7 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month7?.toString().trim() || "0"), 0);
      const totalMonth8 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month8?.toString().trim() || "0"), 0);
      const totalMonth9 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month9?.toString().trim() || "0"), 0);
      const totalMonth10 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month10?.toString().trim() || "0"), 0);
      const totalMonth11 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month11?.toString().trim() || "0"), 0);
      const totalMonth12 = this.voucherData.reduce((sum, item) => sum + parseFloat(item.month12?.toString().trim() || "0"), 0);
      const totalAnnualDepreciation = this.voucherData.reduce((sum, item) => sum + parseFloat(item.annual_Depreciation?.toString().trim() || "0"), 0);
      const totalNominalValue = this.voucherData.reduce((sum, item) => sum + parseFloat(item.bookValue?.toString().trim() || "0"), 0);
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'قيمة الاصل': totalAmount,
          'الاستهلاك المدور': totalRoundedDepreciation,
          'الاضافات': totalAdditions,
          'الانقاصات': totalDecreases,
          '1 شهر': totalMonth1,
          '2 شهر': totalMonth2,
          '3 شهر': totalMont3,
          '4 شهر': totalMonth4,
          '5 شهر': totalMonth5,
          '6 شهر': totalMonth6,
          '7 شهر': totalMonth7,
          '8 شهر': totalMonth8,
          '9 شهر': totalMonth9,
          '10 شهر': totalMonth10,
          '11 شهر': totalMonth11,
          '12 شهر': totalMonth12,
          'الاستهلاك السنوي': totalAnnualDepreciation,
          'القيمة الدفترية': totalNominalValue,
        }
        : {
          'Amount': totalAmount,
          'Rounded Depreciation': totalRoundedDepreciation,
          'Additions': totalAdditions,
          'Decreases': totalDecreases,
          '1 Month': totalMonth1,
          '2 Month': totalMonth2,
          '3 Month': totalMont3,
          '4 Month': totalMonth4,
          '5 Month': totalMonth5,
          '6 Month': totalMonth6,
          '7 Month': totalMonth7,
          '8 Month': totalMonth8,
          '9 Month': totalMonth9,
          '10 Month': totalMonth10,
          '11 Month': totalMonth11,
          '12 Month': totalMonth12,
          'Annual Depreciation': totalAnnualDepreciation,
          'Nominal Value': totalNominalValue,
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

      // إدخال المجاميع في الأعمدة المناسبة
      headers.forEach((header, index) => {
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      // وضع التسمية "المجموع" أو "Total" في أول عمود
      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      // تحديث النطاق
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      // تصدير الملف
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' القيمة الدفترية', 'الاستهلاك السنوي', 'شهر 12 ', ' شهر 11', ' شهر 10', 'شهر 9', 'شهر 8 ', ' شهر 7', ' شهر 6', 'شهر 5', 'شهر 4 ', ' شهر 3', ' شهر 2', 'شهر 1', 'الانقاصات ', ' الاضافات', ' الاستهلاك المدور ', 'قيمة الاصل ', ' تاريخ الشراء', ' فئة الاصل', ' الاصل', 'رقم الاصل']]
    }
    else {
       head = [['Nominal Value', 'Annual Depreciation', '12 Month', '11 Month', '10 Month', '9 Month', '8 Month', '7 Month', '6 Month', '5 Month', '4 Month', '3 Month', '2 Month', '1 Month', 'Decreases', 'Additions', 'Rounded Depreciation', 'Amount', 'Purchase Date', 'Assest Class', 'Assest Name', 'Assest Number']]
    }
    const rows: (number | string)[][] = [];
    let totalAmount = 0;
    let totalRoundedDepreciation = 0;
    let totalAdditions = 0;
    let totalDecreases = 0;
    let totalMonth1 = 0;
    let totalMonth2 = 0;
    let totalMont3 = 0;
    let totalMonth4 = 0;
    let totalMonth5 = 0;
    let totalMonth6 = 0;
    let totalMonth7 = 0;
    let totalMonth8 = 0;
    let totalMonth9 = 0;
    let totalMonth10 = 0;
    let totalMonth11 = 0;
    let totalMonth12 = 0;
    let totalAnnualDepreciation = 0;
    let totalNominalValue = 0;

    this.voucherData.forEach(function (part) {

      const date = new Date(part.purchaseDate);
      const purchaseDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[1] = part.fixedAssetNo,
        temp[2] = part.faName,
        temp[3] = part.faTypeName,
        temp[4] = purchaseDate,
        temp[5] = part.amount,
        temp[6] = part.rounded_Depreciation,
        temp[7] = part.additions,
        temp[8] = part.decreases,
        temp[9] = part.month1,
        temp[10] = part.month2,
        temp[11] = part.month3,
        temp[12] = part.month4,
        temp[13] = part.month5,
        temp[14] = part.month6,
        temp[15] = part.month7,
        temp[16] = part.month8,
        temp[17] = part.month9,
        temp[18] = part.month10,
        temp[19] = part.month11,
        temp[20] = part.month12,
        temp[21] = part.annual_Depreciation,
        temp[22] = part.bookValue,

        totalAmount += parseFloat(part.amount) || 0;
      totalRoundedDepreciation += parseFloat(part.rounded_Depreciation) || 0;
      totalAdditions += parseFloat(part.additions) || 0;
      totalDecreases += parseFloat(part.decreases) || 0;
      totalMonth1 += parseFloat(part.month1) || 0;
      totalMonth2 += parseFloat(part.month2) || 0;
      totalMont3 += parseFloat(part.month3) || 0;
      totalMonth4 += parseFloat(part.month4) || 0;
      totalMonth5 += parseFloat(part.month5) || 0;
      totalMonth6 += parseFloat(part.month6) || 0;
      totalMonth7 += parseFloat(part.month7) || 0;
      totalMonth8 += parseFloat(part.month8) || 0;
      totalMonth9 += parseFloat(part.month9) || 0;
      totalMonth10 += parseFloat(part.month10) || 0;
      totalMonth11 += parseFloat(part.month11) || 0;
      totalMonth12 += parseFloat(part.month12) || 0;
      totalAnnualDepreciation += parseFloat(part.annual_Depreciation) || 0;
      totalNominalValue += parseFloat(part.bookValue) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    // عدد الأعمدة
    const columnCount = head[0].length;

    // إنشاء صف التذييل (footer row)
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[3] = "المجموع";
      footRow[4] = totalAmount.toFixed(2);
      footRow[5] = totalRoundedDepreciation.toFixed(2);
      footRow[6] = totalAdditions.toFixed(2);
      footRow[7] = totalDecreases.toFixed(2);
      footRow[8] = totalMonth1.toFixed(2)
      footRow[9] = totalMonth2.toFixed(2)
      footRow[10] = totalMont3.toFixed(2);
      footRow[11] = totalMonth4.toFixed(2);
      footRow[12] = totalMonth5.toFixed(2);
      footRow[13] = totalMonth6.toFixed(2);
      footRow[14] = totalMonth7.toFixed(2)
      footRow[15] = totalMonth8.toFixed(2)
      footRow[16] = totalMonth9.toFixed(2);
      footRow[17] = totalMonth10.toFixed(2);
      footRow[18] = totalMonth11.toFixed(2);
      footRow[19] = totalMonth12.toFixed(2);
      footRow[20] = totalAnnualDepreciation.toFixed(2)
      footRow[21] = totalNominalValue.toFixed(2)

    } else {
      footRow[3] = "Total";
      footRow[4] = totalAmount.toFixed(2);
      footRow[5] = totalRoundedDepreciation.toFixed(2);
      footRow[6] = totalAdditions.toFixed(2);
      footRow[7] = totalDecreases.toFixed(2);
      footRow[8] = totalMonth1.toFixed(2)
      footRow[9] = totalMonth2.toFixed(2)
      footRow[10] = totalMont3.toFixed(2)
      footRow[11] = totalMonth4.toFixed(2);
      footRow[12] = totalMonth5.toFixed(2);
      footRow[13] = totalMonth6.toFixed(2);
      footRow[14] = totalMonth7.toFixed(2)
      footRow[15] = totalMonth8.toFixed(2)
      footRow[16] = totalMonth9.toFixed(2);
      footRow[17] = totalMonth10.toFixed(2);
      footRow[18] = totalMonth11.toFixed(2);
      footRow[19] = totalMonth12.toFixed(2);
      footRow[20] = totalAnnualDepreciation.toFixed(2)
      footRow[21] = totalNominalValue.toFixed(2)
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف الاستهلاك السنوي" : "Yearly Depreciation Report";
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
      columnStyles: {
        0: { cellWidth: 10 }, // Column for 'رقم الاصل'
        1: { cellWidth: 10 }, // Column for 'الاصل'
        2: { cellWidth: 10 }, // Column for 'فئة الاصل'
        3: { cellWidth: 10 }, // Column for 'تاريخ الشراء'
        4: { cellWidth: 10 }, // Column for 'قيمة الاصل'
        5: { cellWidth: 10 }, // Column for 'الاستهلاك المدور'
        6: { cellWidth: 10 }, // Column for 'الاضافات'
        7: { cellWidth: 10 }, // Column for 'الانقاصات'
        8: { cellWidth: 10 }, // Column for 'شهر 1'
        9: { cellWidth: 10 }, // Column for 'شهر 2'
        10: { cellWidth: 10 }, // Column for 'شهر 3'
        11: { cellWidth: 15 }, // Column for 'شهر 4'
        12: { cellWidth: 15 }, // Column for 'شهر 5'
        13: { cellWidth: 15 }, // Column for 'شهر 6'
        14: { cellWidth: 15 }, // Column for 'شهر 7'
        15: { cellWidth: 15 }, // Column for 'شهر 8'
        16: { cellWidth: 15 }, // Column for 'شهر 9'
        17: { cellWidth: 15 }, // Column for 'شهر 10'
        18: { cellWidth: 15 }, // Column for 'شهر 11'
        19: { cellWidth: 15 }, // Column for 'شهر 12'
        20: { cellWidth: 20 }, // Column for 'الاستهلاك السنوي'
        21: { cellWidth: 20 }, // Column for 'القيمة الدفترية'
      },
    });

    pdf.output('dataurlnewwindow');
  }
}
