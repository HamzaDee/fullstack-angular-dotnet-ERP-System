import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReportServiceService } from '../report-service.service';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.scss']
})
export class InventoryReportComponent implements OnInit {
  public TitlePage: string;
  screenId: number;
  custom: boolean;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
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
  InventoryReportForm: FormGroup;
  public bookValueTotal: any;
  public accumDepreciationTotal: any;
  public expensesTotal: any;
  public fixedAssetAmountTotal: any;
  public additionsTotal: any;
  public decreasesTotal: any;
  public currencyList: any;
  decimalPlaces: number;


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
    this.InventoryReportForm = this.formbulider.group({
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
    });

    this.SetTitlePage();
    this.GetInventoryReportInitialForm();
  }

  GetInventoryReportInitialForm() {
    debugger
    this.reportServiceService.GetInventoryReportForm().subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      debugger
      this.AssestList = result.assestList;
      this.FixedAssetTypeModelList = result.fixedAssetTypeModelList;
      this.LocationList = result.locationList;
      this.BranchList = result.userCompanyBranchList;
      this.StatusList = result.statusList;
      this.EmployeeList = result.employeeList;
      this.IsDepreciablList = result.isDepreciablList;
      result.fromPurchaseDate = formatDate(result.fromPurchaseDate, "yyyy-MM-dd", "en-US")
      result.toPurchaseDate = formatDate(result.toPurchaseDate, "yyyy-MM-dd", "en-US")
      this.InventoryReportForm.patchValue(result);

      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.SelectedAssestList = 0;//result.fixedAssetsId;
        this.SelectedFixedAssetType = 0;//result.fixedAssetsTypesId;
        this.SelectedLocation = 0;//result.locationId;
        this.SelectedBranchList = 0;//result.branchId;
        this.SelectedStatus = 0;//result.status;
        this.SelectedEmployee = 0;//result.employeeId;
        this.selectedIsDepreciabl = -1;//result.isDepreciable; 
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

    if (this.InventoryReportForm.value.assetsWhoseValueHasBeenDepreciated == null || this.InventoryReportForm.value.assetsWhoseValueHasBeenDepreciated == undefined) {

      var assetsWhoseValueHasBeenDepreciated = false;
    }
    else {

      assetsWhoseValueHasBeenDepreciated = this.InventoryReportForm.value.assetsWhoseValueHasBeenDepreciated;
    }

    if (this.InventoryReportForm.value.addedAssets == null || this.InventoryReportForm.value.addedAssets == undefined) {

      var addedAssets = false;
    }
    else {

      addedAssets = this.InventoryReportForm.value.addedAssets;
    }

    var fromPurchaseDate = this.InventoryReportForm.value.fromPurchaseDate;
    var toPurchaseDate = this.InventoryReportForm.value.toPurchaseDate;

    this.reportServiceService.GetInventorySearch(
      assetId,
      branchId,
      typeId,
      employeeId,
      locationId,
      assetStatus,
      isDepreciable,
      assetsWhoseValueHasBeenDepreciated,
      addedAssets,
      fromPurchaseDate,
      toPurchaseDate)
      .subscribe((result) => {

        this.voucherData = result;

        for (let i = 0; i < this.voucherData.length; i++) {
          this.voucherData[i].fixedAssetAmount = this.formatCurrency(this.voucherData[i].fixedAssetAmount.toFixed(this.decimalPlaces));
          this.voucherData[i].additions = this.formatCurrency(this.voucherData[i].additions.toFixed(this.decimalPlaces));
          this.voucherData[i].decreases = this.formatCurrency(this.voucherData[i].decreases.toFixed(this.decimalPlaces));
          this.voucherData[i].expenses = this.formatCurrency(this.voucherData[i].expenses.toFixed(this.decimalPlaces));
          this.voucherData[i].accumDepreciation = this.formatCurrency(this.voucherData[i].accumDepreciation.toFixed(this.decimalPlaces));
          this.voucherData[i].bookValue = this.formatCurrency(this.voucherData[i].bookValue.toFixed(this.decimalPlaces));
        }
        this.SetAmountformat();
        debugger
        if (currentLang == "ar") {
          this.refreshInventoryReportArabic(this.voucherData);
        }
        else {
          this.refreshInventoryReportEnglih(this.voucherData);
        }
      });
  }

  SetAmountformat() {
    debugger
    var balanceTotal = 0;
    var accumDepreciationTotal = 0;
    var expensesTotal = 0;
    var fixedAssetAmountTotal = 0;
    var additionsTotal = 0;
    var decreasesTotal = 0;

    for (const row of this.voucherData) {
      balanceTotal = balanceTotal + parseFloat(row.bookValue);
      accumDepreciationTotal = accumDepreciationTotal + parseFloat(row.accumDepreciation);
      expensesTotal = expensesTotal + parseFloat(row.expenses);
      fixedAssetAmountTotal = fixedAssetAmountTotal + parseFloat(row.fixedAssetAmount);
      additionsTotal = additionsTotal + parseFloat(row.additions);
      decreasesTotal = decreasesTotal + parseFloat(row.decreases);
    }

    this.bookValueTotal = this.formatCurrency(balanceTotal);
    this.accumDepreciationTotal = this.formatCurrency(accumDepreciationTotal);
    this.expensesTotal = this.formatCurrency(expensesTotal);
    this.fixedAssetAmountTotal = this.formatCurrency(fixedAssetAmountTotal);
    this.additionsTotal = this.formatCurrency(additionsTotal);
    this.decreasesTotal = this.formatCurrency(decreasesTotal);
  }

  detailsTransactionOperation(fixedAssetNo, opType) {
    debugger
    opType = 1;
    const url = `/FixedAssetsList/FixedAseetsListForm?fixedAssetNo=${fixedAssetNo}&opType=${encodeURIComponent(opType)}`;
    window.open(url, '_blank');
  }

  AssetTransactionReport(fixedAssetId) {
    debugger
    const url = `/FixedAssetsReports/GetTransactionReport?fixedAssetId=${fixedAssetId}`;
    window.open(url, '_blank');
  }

  clearFormData() {
    debugger
    this.voucherData = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.InventoryReportForm.get('fromPurchaseDate').setValue(currentDate);
    this.InventoryReportForm.get('toPurchaseDate').setValue(currentDate);
    this.SelectedAssestList = 0;
    this.SelectedBranchList = 0;
    this.SelectedFixedAssetType = 0;
    this.SelectedEmployee = 0;
    this.SelectedLocation = 0;
    this.SelectedStatus = 0;
    this.selectedIsDepreciabl = -1;
    this.fixedAssetAmountTotal = 0.0;
    this.additionsTotal = 0.0;;
    this.decreasesTotal = 0.0;;
    this.expensesTotal = 0.0;;
    this.accumDepreciationTotal = 0.0;;
    this.bookValueTotal = 0.0;;
    this.InventoryReportForm.get('assetsWhoseValueHasBeenDepreciated').setValue(false);
    this.InventoryReportForm.get('addedAssets').setValue(false);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssetInventoryStatement');
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

  refreshInventoryReportArabic(data) {
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'رقم الاصل': x.fixedAssetNo,
      'الاصل': x.faName,
      'فئة الاصل': x.faTypeName,
      'الموقع': x.faLocation,
      'الموظف': x.employeeName,
      'نسبة الاستهلاك': x.depreciationPercentage,
      'تاريخ الشراء': x.purchaseDate,
      'قيمة الاصل': x.fixedAssetAmount,
      'الاضافات': x.additions,
      'الانقاصات': x.decreases,
      'المصاريف': x.expenses,
      'مجمع الاهلاك': x.accumDepreciation,
      'القيمة الدفترية': x.bookValue,
    }));
  }

  refreshInventoryReportEnglih(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Assest Number': x.fixedAssetNo,
      'Assest Name': x.faName,
      'Assest Class': x.faTypeName,
      'Location': x.faLocation,
      'Employee': x.employeeName,
      'Persent Consumption': x.depreciationPercentage,
      'Purchase Date': x.purchaseDate,
      'Parent Cost': x.fixedAssetAmount,
      'Additions': x.additions,
      'Deleteation': x.decreases,
      'Expenses': x.expenses,
      'Accumulated Depreciation': x.accumDepreciation,
      'Nominal Value': x.bookValu,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const totalfixedAssetAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.fixedAssetAmount?.toString().trim() || "0"), 0);
      const totalAdditions = this.voucherData.reduce((sum, item) => sum + parseFloat(item.additions?.toString().trim() || "0"), 0);
      const totalDeleteation = this.voucherData.reduce((sum, item) => sum + parseFloat(item.decreases?.toString().trim() || "0"), 0);
      const totalExpenses = this.voucherData.reduce((sum, item) => sum + parseFloat(item.expenses?.toString().trim() || "0"), 0);
      const totalAccumulatedDepreciation = this.voucherData.reduce((sum, item) => sum + parseFloat(item.accumDepreciation?.toString().trim() || "0"), 0);
      const totalNominalValue = this.voucherData.reduce((sum, item) => sum + parseFloat(item.bookValue?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'قيمة الاصل': totalfixedAssetAmount,
          'الاضافات': totalAdditions,
          'الانقاصات': totalDeleteation,
          'المصاريف': totalExpenses,
          'مجمع الاهلاك': totalAccumulatedDepreciation,
          'القيمة الدفترية': totalNominalValue,
        }
        : {
          'Parent Cost': totalfixedAssetAmount,
          'Additions': totalAdditions,
          'Deleteation': totalDeleteation,
          'Expenses': totalExpenses,
          'Accumulated Depreciation': totalAccumulatedDepreciation,
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
       head = [[' القيمة الدفترية', 'مجمع الاهلاك', ' المصاريف', ' الانقاصات', 'الاضافات', 'قيمة الاصل', 'تاريخ الشراء', ' نسبة الاستهلاك', 'الموظف ', ' الموقع', ' فئة الاصل', ' الاصل', 'رقم الاصل']]
    }
    else {
       head = [['Nominal Value', 'Accumulated Depreciation', 'Expenses', 'Deleteation', 'Additions', 'Parent Cost', 'Purchase Date', 'Persent Consumption', 'Employee', 'Location', 'Assest Class', 'Assest Name', 'Assest Number']]
    }

    const rows: (number | string)[][] = [];
    let totalfixedAssetAmount = 0;
    let totalAdditions = 0;
    let totalDeleteation = 0;
    let totalExpenses = 0;
    let totalAccumulatedDepreciation = 0;
    let totalNominalValue = 0;


    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
        temp[0] = part.fixedAssetNo,
        temp[1] = part.faName,
        temp[2] = part.faTypeName,
        temp[3] = part.faLocation,
        temp[4] = part.employeeName,
        temp[5] = part.depreciationPercentage,
        temp[6] = part.purchaseDate,
        temp[7] = part.fixedAssetAmount,
        temp[8] = part.additions,
        temp[9] = part.decreases,
        temp[10] = part.expenses,
        temp[11] = part.accumDepreciation,
        temp[12] = part.bookValue,

      totalfixedAssetAmount += parseFloat(part.fixedAssetAmount) || 0;
      totalAdditions += parseFloat(part.additions) || 0;
      totalDeleteation += parseFloat(part.decreases) || 0;
      totalExpenses += parseFloat(part.expenses) || 0;
      totalAccumulatedDepreciation += parseFloat(part.accumDepreciation) || 0;
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
      footRow[6] = "المجموع";
      footRow[7] = totalfixedAssetAmount.toFixed(2);     // مدين
      footRow[8] = totalAdditions.toFixed(2);
      footRow[9] = totalDeleteation.toFixed(2);
      footRow[10] = totalExpenses.toFixed(2);
      footRow[11] = totalAccumulatedDepreciation.toFixed(2)
      footRow[12] = totalNominalValue.toFixed(2)

    } else {
      footRow[6] = "Total";
      footRow[7] = totalfixedAssetAmount.toFixed(2);     // مدين
      footRow[8] = totalAdditions.toFixed(2);
      footRow[9] = totalDeleteation.toFixed(2);
      footRow[10] = totalExpenses.toFixed(2);
      footRow[11] = totalAccumulatedDepreciation.toFixed(2)
      footRow[12] = totalNominalValue.toFixed(2)
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ?  "كشف جرد الاصول" : "Inventory Report";
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
