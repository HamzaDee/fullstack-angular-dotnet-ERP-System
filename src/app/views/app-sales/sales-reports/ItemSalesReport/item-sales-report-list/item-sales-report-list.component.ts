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
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-item-sales-report-list',
  templateUrl: './item-sales-report-list.component.html',
  styleUrls: ['./item-sales-report-list.component.scss']
})
export class ItemSalesReportListComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 178;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  branchesList: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  TypesList: any;
  SuppliersList: any;
  ItemsList: any;
  StoreList: any;
  EmployeeList: any;
  BrandList: any;
  CollectInvoices: boolean = false;
  TotalQty: any;
  withTax: boolean = false;
  maxUnit: boolean = false;
  noBouns: boolean = false;
  withRetruns: number = 0;
  voucherData: any;
  TotalInvoices: boolean = false;
  showhead: boolean = true;
  totalFormattedMap: Map<string, number> = new Map<string, number>();
  totalDisFormattedMap: Map<string, number> = new Map<string, number>();
  totalQty: number = 0;
  total: number = 0;
  totalFormatted: string = '0.000'
  totalQtyFormatted: string = '0.000'
  disableMxUnit: boolean = false;
  loading: boolean;
  currenciesList:any;
  currName : any;
 totalSalesCurr: number = 0;
 totalSalesCurrFormatted: string = '0.000';
totalSalesCurrMap: Map<string, number> = new Map<string, number>();


  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private salesRptService: SalesReportsService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      categoryId: [0],
      dealerId: [0],
      itemId: [0],
      brandId: [0],
      storeId: [0],
      represntedId: [0],
      collective: [0],
      withTax: [0],
      maxUnit: [0],
      excludeBouns: [0],
      withReturns: [0],
      branchId: [0],
      currencyId:[0],
      currRate:[0],
      currName:[''],
    });

    this.GetItemSalesReportInitialForm();
    this.SetTitlePage();

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesCategoriesReport');
    this.title.setTitle(this.TitlePage);
  }

  GetItemSalesReportInitialForm() {
    debugger
    this.salesRptService.GetCategoriesForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.TypesList = result.typesList;
      this.SuppliersList = result.suppliersList;
      this.ItemsList = result.itemsList;
      this.BrandList = result.brandList;
      this.StoreList = result.storeList;
      this.EmployeeList = result.employeeList;
      this.branchesList = result.branchesList;
      this.currenciesList = result.currencyList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.SaleReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.clearFormData();
      });
    });
  }

  canBeEditDate(event: any) {
    debugger
    this.voucherData = [];
    this.clearTotals();
    if (event.target.checked) {
      this.TotalInvoices = true;
      this.disableMxUnit = true;
      this.maxUnit = false;
      this.SaleReportForm.get("maxUnit").setValue(0);
      this.SaleReportForm.get("collective").setValue(1);
    }
    else {
      this.TotalInvoices = false;
      this.disableMxUnit = false;
      this.SaleReportForm.get("collective").setValue(0);
    }
  }

  HandelTaxCheckBox(event: any) {
    this.voucherData = [];
    this.clearTotals();
    if (event.target.checked) {
      this.withTax = true;
      this.SaleReportForm.get("withTax").setValue(1);
    }
    else {
      this.withTax = false;
      this.SaleReportForm.get("withTax").setValue(0);
    }
  }

  HandelMaxUnitCheckBox(event: any) {
    this.voucherData = [];
    this.clearTotals();
    if (event.target.checked) {
      this.maxUnit = true;
      this.SaleReportForm.get("maxUnit").setValue(1);
    }
    else {
      this.maxUnit = false;
      this.SaleReportForm.get("maxUnit").setValue(0);
    }
  }

  HandelNoBounsCheckBox(event: any) {
    this.voucherData = [];
    this.clearTotals();
    if (event.target.checked) {
      this.noBouns = true;
      this.SaleReportForm.get("excludeBouns").setValue(1);
    }
    else {
      this.noBouns = false;
      this.SaleReportForm.get("excludeBouns").setValue(0);
    }
  }

  GetReport() {
    debugger
    this.voucherData = [];
    this.clearTotals();
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger

      const formValues = this.SaleReportForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      if (formValues.storeId == null) {
        formValues.storeId = 0;
      }
      if (this.withRetruns == 1) {
        this.SaleReportForm.get("withReturns").setValue(1);
      } 
      else {
        this.SaleReportForm.get("withReturns").setValue(0);
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      if (this.TotalInvoices == true) {
        this.salesRptService.GetCollectiveCategoriesSalesRpt(
          formValues.fromDate,
          formValues.toDate,
          formValues.categoryId,
          formValues.dealerId,
          formValues.itemId,
          formValues.brandId,
          formValues.storeId,
          formValues.represntedId,
          formValues.collective,
          formValues.withTax,
          formValues.maxUnit,
          formValues.excludeBouns,
          formValues.withReturns,
          formValues.branchId,
          formValues.currencyId,
          formValues.currRate
        ).subscribe((result) => {
          debugger

          this.voucherData = result;
          this.voucherData.forEach(element => {
            element.totalQty = element.totalQty * -1;
            element.totalSales = element.totalSales * -1;
            element.totalQtyOnly = element.totalQtyOnly * -1;
            element.totalBonus = element.totalBonus * -1;
          });
          if (currentLang == "ar") {
            this.showhead = true;
            this.refreshTotalInvoicesArabic(this.voucherData);
          }
          else {
            this.showhead = false;
            this.refreshTotalInvoicesEnglish(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        });
      }
      else {
        this.salesRptService.GetCategoriesSalesRpt(
          formValues.fromDate,
          formValues.toDate,
          formValues.categoryId,
          formValues.dealerId,
          formValues.itemId,
          formValues.brandId,
          formValues.storeId,
          formValues.represntedId,
          formValues.collective,
          formValues.withTax,
          formValues.maxUnit,
          formValues.excludeBouns,
          formValues.withReturns,
          formValues.branchId,
          formValues.currencyId,
          formValues.currRate
        ).subscribe((result) => {
          debugger
          if (result.isSuccess == false && result.message == "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          this.voucherData = result;
          this.voucherData.forEach(element => {
            element.totalQty = element.totalQty * -1;
            element.totalSales = element.totalSales * -1;
            element.totalQtyOnly = element.totalQtyOnly * -1;
            element.totalBonus = element.totalBonus * -1;
          });
          if (currentLang == "ar") {
            this.showhead = true;
            this.refreshItemSaleReportArabic(this.voucherData);
          }
          else {
            this.showhead = false;
            this.refreshItemSaleReportEnglish(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues()
            this.egretLoader.close();
          }
          else {
            this.egretLoader.close();
          }
        });
      }

    });


  }

  clearFormData() {
    debugger
    this.SaleReportForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
    const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
    this.SaleReportForm.get('fromDate').setValue(dddate);
    this.SaleReportForm.get('toDate').setValue(currentDate);
    this.Data = []; // Clear the table data
    this.voucherData = [];
    this.SaleReportForm.get('categoryId').setValue(0);
    this.SaleReportForm.get('dealerId').setValue(0);
    this.SaleReportForm.get('itemId').setValue(0);
    this.SaleReportForm.get('brandId').setValue(0);
    this.SaleReportForm.get('storeId').setValue(0);
    this.SaleReportForm.get('represntedId').setValue(0);
    this.SaleReportForm.get('collective').setValue(0);
    this.SaleReportForm.get('withTax').setValue(0);
    this.SaleReportForm.get('maxUnit').setValue(0);
    this.SaleReportForm.get('excludeBouns').setValue(0);
    this.SaleReportForm.get('withReturns').setValue(0);
    this.SaleReportForm.get('branchId').setValue(0);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);
    this.TotalInvoices = false;
    this.withTax = false;
    this.maxUnit = false;
    this.noBouns = false;
    this.disableMxUnit = false;
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

  refreshItemSaleReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'الصنف': x.categoryName,
      'رمز المادة': x.itemId,
      'اسم المادة': x.itemName,
      'اجمالي الكمية': x.totalQty,
      'قيمة البيع': x.totalSales.toFixed(3),
    }));
  }

  refreshItemSaleReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'category': x.categoryName,
      'item Number': x.itemId,
      'item Name': x.itemName,
      'Total Qty': x.totalQty,
      'Sale Value': x.totalSales.toFixed(3),
    }));
  }

  refreshTotalInvoicesArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'الصنف': x.categoryName,
      'اجمالي الكمية': x.totalQty,
      'قيمة البيع': x.totalSales.toFixed(3),

    }));
  }

  refreshTotalInvoicesEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'category': x.categoryName,
      'Total Qty': x.totalQty,
      'Sale Value': x.totalSales.toFixed(3),
    }));
  }

  exportExcel1() {
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

      const totalQty = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalQty?.toString().trim() || "0"), 0);
      const total = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalSales?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'اجمالي الكمية': totalQty,
          'قيمة البيع': total,
        }
        : {
          'Total Qty': totalQty,
          'Sale Value': total,
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

  exportExcel2() {
    import("xlsx").then(xlsx => {
      debugger;
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const totalQty = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalQty?.toString().trim() || "0"), 0);
      const total = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalSales?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'اجمالي الكمية': totalQty,
          'قيمة البيع': total,
        }
        : {
          'Total Qty': totalQty,
          'Sale Value': total,
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
       head = [['قيمة البيع', ' اجمالي الكمية', ' اسم المادة', ' رمز المادة', 'الصنف']]
    }
    else {
       head = [['Sale Value', 'Total Qty', 'item Name', 'item Number', 'category']]
    }

    const rows: (number | string)[][] = [];
    let totalQty = 0;
    let totalNet = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.categoryName,
        temp[1] = part.itemId,
        temp[2] = part.itemName,
        temp[3] = part.totalQty,
        temp[4] = part.totalSales.toFixed(3),

        totalQty += parseFloat(part.totalQty) || 0;
      totalNet += parseFloat(part.totalSales) || 0;

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
      footRow[3] = totalQty.toFixed(2);
      footRow[4] = totalNet.toFixed(2);
    } else {
      footRow[2] = "Total";
      footRow[3] = totalQty.toFixed(2);
      footRow[4] = totalNet.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف مبيعات الاصناف" : "Item Sales Report";
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
       head = [['قيمة البيع', ' اجمالي الكمية', ' الصنف']]
    }
    else {
       head = [['Sale Value', 'Total Qty', 'category']]
    }
    const rows: (number | string)[][] = [];
    let totalQty = 0;
    let totalNet = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
         temp[0] = part.categoryName,
         temp[1] = part.totalQty,
         temp[2] = part.totalSales.toFixed(3),

        totalQty += parseFloat(part.totalQty) || 0;
      totalNet += parseFloat(part.totalSales) || 0;

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
      footRow[1] = totalQty.toFixed(2);
      footRow[2] = totalNet.toFixed(2);
    } else {
      footRow[0] = "Total";
      footRow[1] = totalQty.toFixed(2);
      footRow[2] = totalNet.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف مبيعات الاصناف" : "Item Sales Report";
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

  calcultevalues() {
    // debugger
    if (this.TotalInvoices == false) {
      this.totalFormattedMap.clear(); 
      this.totalDisFormattedMap.clear();
      this.totalSalesCurrMap.clear();  
      const rate = Number(this.SaleReportForm?.get('currRate')?.value) || 1; 

      //     // Iterate over voucherData to calculate totals for each group
      this.voucherData.forEach(voucher => {
        const groupKey = voucher.categoryName; // Change this to the property you're grouping by
        if (!this.totalFormattedMap.has(groupKey)) {
          this.totalFormattedMap.set(groupKey, 0);
          this.totalDisFormattedMap.set(groupKey, 0);

        }
        // Calculate totals for each group
        this.totalDisFormattedMap.set(groupKey, this.totalDisFormattedMap.get(groupKey)! + parseFloat(voucher.totalQty) || 0);
        this.totalFormattedMap.set(groupKey, this.totalFormattedMap.get(groupKey)! + parseFloat(voucher.totalSales) || 0);
        this.totalSalesCurrMap.set(groupKey,(this.totalFormattedMap.get(groupKey) || 0) / rate);
      });
    }

    else {
      this.total = 0;
      this.totalQty = 0;

      for (let r = 0; r < this.voucherData.length; r++) {
        this.total += Number(this.voucherData[r].totalSales);
        this.totalQty += Number(this.voucherData[r].totalQty)
      }
      this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
      this.totalQtyFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalQty);
      const rate = Number(this.SaleReportForm?.get('currRate')?.value) || 1;

this.totalSalesCurr = this.total / rate;
this.totalSalesCurrFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSalesCurr);

    }
  }

  clearTotals() {
    this.total = 0;
    this.totalQty = 0;
    this.totalFormatted = '0.000';
    this.totalQtyFormatted = '0.000';
    this.totalSalesCurr = 0;
    this.totalSalesCurrFormatted = '0.000';

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

  onCurrencyChange(value:any)
  {
    debugger;
    if(value > 0)
    {
      let curr = this.currenciesList.find(c => c.id == value);
      if(curr)
      {
        this.SaleReportForm.get("currRate").setValue(Number(curr.data1)) 
         this.SaleReportForm.get("currName")?.setValue(curr.text || '');
        this.currName = curr.text || '';
        this.GetReport();

      }
      else
      {
        this.SaleReportForm.get("currRate").setValue(0); 
         this.currName = curr.text || '';
      }
    }
    else
      {
        this.SaleReportForm.get("currRate").setValue(0);
        

         
      }
  }

  getSalesValueInCurrency(totalSales: any  ) : string {
  const sales = Number(totalSales) || 0;
  const rate = Number(this.SaleReportForm?.get('currRate')?.value) || 1;


  if (!rate) return sales.toFixed(3);
  return (sales / rate).toFixed(3);



  }

}
