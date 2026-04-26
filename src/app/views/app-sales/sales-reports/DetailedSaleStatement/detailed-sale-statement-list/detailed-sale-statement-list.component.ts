import { formatDate } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import { SalesReportsService } from '../../salesreoprt.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-detailed-sale-statement-list',
  templateUrl: './detailed-sale-statement-list.component.html',
  styleUrls: ['./detailed-sale-statement-list.component.scss']
})
export class DetailedSaleStatementListComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 177;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  SuppliersList: any;
  categoryList: any;
  EmployeeList: any;
  AreaList: any;
  TypesList: any;
  StoreList: any;
  ItemsList: any;
  BranchList: any;
  itemsGroupList: any;
  curranciesList: any;
  public SelectedSuppliers: number = -1;
  public Selectedcategory: number = -1;
  public SelectedEmployee: number = -1;
  public SelectedArea: number = -1;
  public SelectedTypes: number = -1;
  public SelectedStore: number = -1;
  public SelectedItems: number = -1;
  public SelectedBranch: number = -1;
  public SaleReportForm: FormGroup;
  public Data: any;
  public currencyList: any;
  public decimalPlaces: number;
  public price: any;
  public Total: any;
  public TotalInvoices: boolean = false;
  public ExcludeReturnIvoice: boolean = false;
  public ExcludeSalesIvoice: boolean = false;
  voucherData: any;

  SalesTotal: number = 0;
  ReturnsTotal: number = 0;
  NetTotal: number = 0;
  SalesTotalFormatted: string = '0';
  ReturnsTotalFormatted: string = '0';
  NetTotalFormatted: string = '0';

  taxTotal: number = 0;
  totalAfterDiscount: number = 0;
  netTotal: number = 0;
  totalDisFormatted: string = '0';
  netTotalFormatted: string = '0';

  taxTotalFormatted: string = '0';
  groupTotals: any;
  totalFormattedMap: Map<string, number> = new Map<string, number>();
  totalDisFormattedMap: Map<string, number> = new Map<string, number>();
  netTotalFormattedMap: Map<string, number> = new Map<string, number>();
  lang: string;
  loading: boolean;
  netLocalTotal: number = 0;

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private salesReportServ: SalesReportsService,
    private appCommonserviceService: AppCommonserviceService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      customer: [0],
      customerType: [0],
      represntedId: [0],
      currancyId: [0],
      area: [0],
      category: [0],
      storeId: [0],
      itemId: [0],
      branchId: [0],
      collective: [0],
      itemGroupId: [0],
      invoiceType: [0],
    });

    this.GetDetailedSaleStatementInitialForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesDetailedReport');
    this.title.setTitle(this.TitlePage);
  }

  GetDetailedSaleStatementInitialForm() {

    this.salesReportServ.GetSalesDetailedModelForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.SuppliersList = result.suppliersList;
      this.categoryList = result.dealersCategoriesList;
      this.EmployeeList = result.employeeList;
      this.AreaList = result.areaList;
      this.TypesList = result.typesList;
      this.StoreList = result.storeList;
      this.ItemsList = result.itemsList;
      this.itemsGroupList = result.itemsGroupList;
      this.BranchList = result.userCompanyBranchList;
      this.curranciesList = result.currencyList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");

      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;

      this.SaleReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger

      });
    });
  }

  HandelCheckBox(event: any) {
    debugger
    this.clearFormData();
    if (event.target.checked) {
      this.TotalInvoices = true;
    }
    else {
      this.TotalInvoices = false;
    }
  }

  GetReport() {
    debugger
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
      if (formValues.customerType == null) {
        formValues.customerType = 0;
      }
      if (this.TotalInvoices == true) {
        this.SaleReportForm.get("collective").setValue(1);
      }
      else {
        this.SaleReportForm.get("collective").setValue(0);
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.salesReportServ.GetSalesDetailed(
        formValues.fromDate,
        formValues.toDate,
        formValues.customer,
        formValues.customerType,
        formValues.represntedId,
        formValues.area,
        formValues.category,
        formValues.storeId,
        formValues.itemId,
        formValues.branchId,
        formValues.collective,
        formValues.currancyId,
        formValues.itemGroupId,
        formValues.invoiceType
      ).subscribe((result) => {
        debugger

        this.voucherData = result;
        this.voucherData = this.voucherData.map(v => ({
          ...v,
          voucherCategoryGroup: `${v.id}_${v.categoryId}`
        }));
        if (currentLang == "ar") {
          this.refreshDetailedSaleReportArabic(this.voucherData);
        }
        else {
          this.refreshDetailedSaleReportEnglish(this.voucherData);
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

  clearFormData() {
    debugger
    const currentDate = new Date().toISOString().split('T')[0];
    this.SaleReportForm.get('fromDate').setValue(currentDate);
    this.SaleReportForm.get('toDate').setValue(currentDate);
    this.SaleReportForm.get('customer').setValue(0);
    this.SaleReportForm.get('customerType').setValue(0);
    this.SaleReportForm.get('represntedId').setValue(0);
    this.SaleReportForm.get('area').setValue(0);
    this.SaleReportForm.get('category').setValue(0);
    this.SaleReportForm.get('currancyId').setValue(0);
    this.SaleReportForm.get('storeId').setValue(0);
    this.SaleReportForm.get('itemId').setValue(0);
    this.SaleReportForm.get('branchId').setValue(0);
    this.SaleReportForm.get("collective").setValue(0);
    this.ExcludeReturnIvoice = false;
    this.ExcludeSalesIvoice = false;
    this.TotalInvoices = false;
    this.SaleReportForm.get("invoiceType").setValue(0)
    this.voucherData = [];
    this.clearTotals();
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
      debugger
    })
  }

  clearTotals() {
    this.SalesTotal = 0;
    this.ReturnsTotal = 0;
    this.NetTotal = 0;
    this.SalesTotalFormatted = "0.000";
    this.ReturnsTotalFormatted = "0.000";
    this.NetTotalFormatted = "0.000";
    this.taxTotal = 0;
    this.totalAfterDiscount = 0;
    this.netTotal = 0;
    this.netLocalTotal = 0;
    this.taxTotalFormatted = '0.000';
    this.totalDisFormatted = '0.000';
    this.netTotalFormatted = '0.000';
  }

  calcultevalues() {
    if (this.TotalInvoices === true) {

      this.totalFormattedMap.clear();
      this.totalDisFormattedMap.clear();
      this.netTotalFormattedMap.clear();

      for (const voucher of this.voucherData) {
        const groupKey = voucher.voucherCategoryGroup;

        const discount = Number(voucher.discountAmt) || 0;
        const tax = Number(voucher.taxAmt) || 0;
        const netLocal = Number(voucher.netLocalTotal) || 0;

        this.totalDisFormattedMap.set(
          groupKey,
          (this.totalDisFormattedMap.get(groupKey) ?? 0) + discount
        );

        this.totalFormattedMap.set(
          groupKey,
          (this.totalFormattedMap.get(groupKey) ?? 0) + tax
        );

        this.netTotalFormattedMap.set(
          groupKey,
          (this.netTotalFormattedMap.get(groupKey) ?? 0) + netLocal
        );
      }

    } else {
      this.SalesTotal = 0;
      this.ReturnsTotal = 0;
      this.NetTotal = 0;
      this.SalesTotalFormatted = "";
      this.ReturnsTotalFormatted = "";
      this.NetTotalFormatted = "";
      this.taxTotal = 0;

      for (const row of this.voucherData) {
        if (row.categoryId == 44) {
          this.SalesTotal += Number(row.netLocalTotal) || 0;
        }
        else {
          this.ReturnsTotal += Number(row.netLocalTotal) || 0;
        }

        this.taxTotal += Number(row.taxAmt) || 0;
      }

      this.SalesTotalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.SalesTotal);
      this.ReturnsTotalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.ReturnsTotal);
      this.NetTotalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.SalesTotal - this.ReturnsTotal);
      this.taxTotalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.taxTotal);
    }
  }

  OpenSalesInvoiceForm(id: number, CategoryId: number) {
    debugger
    if (CategoryId == 44) {
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      let url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
      window.open(url, '_blank');
    }
    else {
      this.routePartsService.GuidToEdit = id;
      this.routePartsService.Guid2ToEdit = 'Show';
      this.routePartsService.Guid3ToEdit = true;
      let url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
      window.open(url, '_blank');
    }

  }

  refreshDetailedSaleReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'نوع الفاتورة': x.voucherName,
        'رقم الفاتورة': x.voucherNo,
        'التاريخ': voucherDate,
        'العملة': x.currName,
        'العميل': x.dealerName,
        'المندوب': x.repName,
        'المنطقة': x.areaName,
        ' الصنف': x.categoryName,
        'المادة': x.itemName,
        'الوحدة': x.unitName,
        'الكمية': x.qty,
        'السعر': x.price,
        'الخصم': x.discountAmt.toFixed(3),
        'البونص': x.bouns,
        'الضريبة': x.taxAmt,
        'الاجمالي': x.netTotal.toFixed(3),
        'الاجمالي العمله الرئيسيه': x.netLocalTotal.toFixed(3),
      }
    });
  }

  refreshDetailedSaleReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Type': x.voucherName,
        'Invoice No': x.voucherNo,
        'Date': voucherDate,
        'Currency': x.currName,
        'Customer': x.dealerName,
        'Representative': x.repName,
        'AREA': x.areaName,
        'Category': x.categoryName,
        'Item': x.itemName,
        'Unit': x.unitName,
        'Quantity': x.qty,
        'Price': x.price,
        'Discount': x.discountAmt.toFixed(3),
        'Bouns': x.bouns,
        'Tax': x.taxAmt,
        'Net Total': x.netTotal.toFixed(3),
        'Net Local Total': x.netLocalTotal.toFixed(3),
      }
    });
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

      const totalTax = this.voucherData.reduce((sum, item) => sum + parseFloat(item.taxAmt?.toString().trim() || "0"), 0);
      const total = this.voucherData.reduce((sum, item) => sum + parseFloat(item.netLocalTotal?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          // 'الضريبة': totalTax,
          'الاجمالي العمله الرئيسيه': this.NetTotalFormatted,
        }
        : {
          // 'Tax': totalTax,
          'Net Local Total': this.NetTotalFormatted,
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


      // headers.forEach((header, index) => {
      //   const trimmedHeader = header.trim();
      //   const sumValue = fieldMap[trimmedHeader];
      //   if (sumValue !== undefined) {
      //     const colLetter = getExcelColumnLetter(index);
      //     const cellAddress = colLetter + lastRow;
      //     worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
      //   }
      // });
      let labelCellAddress = getExcelColumnLetter(15) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: this.NetTotalFormatted };
      labelCellAddress = getExcelColumnLetter(0) + lastRow;
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

  if (isArabic) {
    // تم عكس ترتيب العناصر هنا لتبدأ من اليمين (إجمالي العملة الرئيسية -> نوع الفاتورة)
    head = [[
      'الإجمالي العملة الرئيسية',
      'الإجمالي',
      'الضريبة',
      'البونص',
      'الخصم',
      'السعر',
      'الكمية',
      'الوحدة',
      'المادة',
      'الصنف',
      'المندوب',
      'العميل',
      'العملة',
      'التاريخ',
      'رقم الفاتورة',
      'نوع الفاتورة'
    ]];
  } else {
    head = [[
      'Voucher Type', 'Invoice No', 'Date', 'Currency', 'Customer', 'Representative',
      'Category', 'Item', 'Unit', 'Quantity', 'Price', 'Discount', 'Bouns', 'Tax',
      'Net Total', 'Net Local Total'
    ]];
  }

  const rows: (number | string)[][] = [];
  let totalTax = 0;
  let totalNet = 0;

  this.voucherData.forEach((part) => {
    const date = new Date(part.voucherDate);
    const voucherDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

    let row: (number | string)[] = [
      part.voucherName,
      part.voucherNo,
      voucherDate,
      part.currName,
      part.dealerName,
      part.repName || '',
      part.categoryName,
      part.itemName,
      part.unitName,
      part.qty,
      part.price,
      part.discountAmt.toFixed(3),
      part.bouns,
      parseFloat(part.taxAmt).toFixed(3),
      parseFloat(part.netTotal).toFixed(3),
      parseFloat(part.netLocalTotal).toFixed(3)
    ];

    // ✅ إذا كانت اللغة عربية، اعكس مصفوفة الصف
    if (isArabic) {
      row = row.reverse();
    }

    rows.push(row);

    totalTax += parseFloat(part.taxAmt) || 0;
    totalNet += parseFloat(part.netTotal) || 0;
  });

  // ✅ الفوتر (تعديل أماكن المجموع بناءً على العكس)
  const columnCount = head[0].length;
  let footRow: (string | number)[] = new Array(columnCount).fill('');

  if (isArabic) {
    // في حالة العكس، تصبح الأعمدة الأخيرة (13، 14، 12) هي الأولى (0، 1، 2) أو حسب الترتيب الجديد
    // هنا قمت بضبطها لتطابق ترتيب الرأس المعكوس:
    footRow[0] = totalNet.toFixed(2); // الإجمالي المحلي
    footRow[1] = totalNet.toFixed(2); // الإجمالي
    footRow[2] = totalTax.toFixed(2); // الضريبة
    footRow[3] = 'المجموع'; 
  } else {
    footRow[12] = 'Total';
    footRow[13] = totalTax.toFixed(2);
    footRow[14] = totalNet.toFixed(2);
  }

  const foot = [footRow];

  // ✅ إنشاء PDF
  const pdf = new jsPDF('l', 'pt', 'a4');
  pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
  pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  pdf.setFont('Amiri');
  pdf.setFontSize(14);

  const title = isArabic ? 'كشف المبيعات التفصيلي' : 'Detailed Sale Report';
  const pageWidth = pdf.internal.pageSize.width;
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });

  autoTable(pdf as any, {
    head: head,
    body: rows,
    foot: foot,
    showFoot: 'lastPage',
    styles: {
      font: 'Amiri',
      halign: isArabic ? 'right' : 'left', // محاذاة النص داخل الخلية
      fontSize: 8
    },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: 'black',
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: 'black',
      fontStyle: 'bold'
    },
    theme: 'grid'
  });

  pdf.output('dataurlnewwindow');
}
  exportExcel2() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Detailed Sale Report");
    });
  }

exportPdf2() {
  const currentLang = this.jwtAuth.getLang();
  const isArabic = currentLang === 'ar';
  let head: string[][];

  if (this.TotalInvoices == true) {
    if (isArabic) {
      // تم ترتيب الرأس هنا ليبدأ من اليمين إلى اليسار
      head = [[
        'إجمالي محلي', 'إجمالي', 'الضريبة', 'البونص', 'الخصم', 'السعر', 
        'الكمية', 'الوحدة', 'المادة', 'الصنف', 'المنطقة', 'المندوب', 
        'العميل', 'العملة', 'التاريخ', 'رقم الفاتورة', 'نوع الفاتورة'
      ]];
    } else {
      head = [[
        'Voucher Type', 'Invoice No', 'Date', 'Currency', 'Customer', 'Representative', 
        'Area', 'Category', 'Item', 'Unit', 'Quantity', 'Price', 
        'Discount', 'Bouns', 'Tax', 'Net Total', 'Net Local Total'
      ]];
    }

    const rows: (number | string)[][] = [];
    this.Data.forEach((part) => {
      const date = new Date(part.voucherDate);
      const voucherDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      // بناء المصفوفة بالترتيب الطبيعي أولاً (LTR)
      let temp: (number | string)[] = [
        part.voucherName,
        part.voucherNo,
        voucherDate,
        part.currName,
        part.dealerName,
        part.repName || '',
        part.areaName || '',
        part.categoryName,
        part.itemName,
        part.unitName,
        part.qty,
        part.price,
        part.discountAmt.toFixed(3),
        part.bouns,
        parseFloat(part.taxAmt).toFixed(3),
        parseFloat(part.netTotal).toFixed(3),
        parseFloat(part.netLocalTotal).toFixed(3)
      ];

      // ✅ عكس المصفوفة إذا كانت اللغة عربية لتطابق الـ Head المعكوس
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = isArabic ? "كشف المبيعات التفصيلي" : "Detailed Sale Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 20, { align: 'center' }); // رفعنا المسافة قليلاً لتفادي التداخل

    autoTable(pdf as any, {
      head: head,
      body: rows,
      showFoot: 'lastPage',
      styles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left', // محاذاة النص حسب اللغة
        fontSize: 8,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: "black",
        fontStyle: 'bold',
        lineWidth: 0.1
      },
      bodyStyles: {
        fontStyle: 'normal'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }
}
  PrintReport() {
    debugger
    const formValues = this.SaleReportForm.value;
    if (formValues.customer == null || formValues.customer == undefined) {
      formValues.customer = 0
    }
    if (formValues.customerType == null || formValues.customerType == undefined) {
      formValues.customerType = 0
    }
    if (formValues.represntedId == null || formValues.represntedId == undefined) {
      formValues.represntedId = 0
    }
    if (formValues.area == null || formValues.area == undefined) {
      formValues.area = 0
    }
    if (formValues.category == null || formValues.category == undefined) {
      formValues.category = 0
    }
    if (formValues.storeId == null || formValues.storeId == undefined) {
      formValues.storeId = 0
    }
    if (formValues.itemId == null || formValues.itemId == undefined) {
      formValues.itemId = 0
    }
    if (formValues.branchId == null || formValues.branchId == undefined) {
      formValues.branchId = 0
    }
    if (formValues.collective == null || formValues.collective == undefined) {
      formValues.branchId = 0
    }
    if (formValues.currancyId == null || formValues.currancyId == undefined) {
      formValues.currancyId = 0
    }
    this.lang = this.jwtAuth.getLang();
    if (this.lang == 'ar') {

      const reportUrl = `rptDetailedSaleStatementAR?FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&Customer=${formValues.customer}&
      CustomerType=${formValues.customerType}&RepresntedId=${formValues.represntedId}&Area =${formValues.area}&Category=${formValues.category}&
      StoreId=${formValues.storeId}&ItemId=${formValues.itemId}&BranchId =${formValues.branchId}&Collective=${formValues.collective}&
      CurrancyId=${formValues.currancyId}&CompanyId=${this.jwtAuth.getCompanyId()}&Lang =${this.jwtAuth.getLang()}`;
      debugger
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptDetailedSaleStatementEN?FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&Customer=${formValues.customer}&
      CustomerType=${formValues.customerType}&RepresntedId=${formValues.represntedId}&Area =${formValues.area}&Category=${formValues.category}&
      StoreId=${formValues.storeId}&ItemId=${formValues.itemId}&BranchId =${formValues.branchId}&Collective=${formValues.collective}&
      CurrancyId=${formValues.currancyId}&CompanyId=${this.jwtAuth.getCompanyId()}&Lang =${this.jwtAuth.getLang()}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      window.open(url, '_blank');
    }
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

  HandelReturnIvoice(event: any) {
    debugger
    this.clearFormData();
    if (event.target.checked) {
      this.ExcludeReturnIvoice = true;
      this.ExcludeSalesIvoice = false;
      this.SaleReportForm.get("invoiceType").setValue(1)
    }
    else {
      this.ExcludeReturnIvoice = false;
      this.SaleReportForm.get("invoiceType").setValue(0)
    }
  }

  HandelSalesIvoice(event: any) {
    debugger
    this.clearFormData();
    if (event.target.checked) {
      this.ExcludeSalesIvoice = true;
      this.ExcludeReturnIvoice = false;
      this.SaleReportForm.get("invoiceType").setValue(2)
    }
    else {
      this.ExcludeSalesIvoice = false;
      this.SaleReportForm.get("invoiceType").setValue(0)
    }
  }
}
