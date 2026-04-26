import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { SalesReportsService } from '../../salesreoprt.service';
import { AmiriRegular } from 'assets/fonts/amiri';

@Component({
  selector: 'app-hems-profit-report-list',
  templateUrl: './hems-profit-report-list.component.html',
  styleUrls: ['./hems-profit-report-list.component.scss']
})
export class HemsProfitReportListComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 182;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  ItemsList: any;
  TypesList: any;
  currenciesList: any;
  SuppliersList: any;
  StoreList: any;
  EmployeeList: any;
  Detailed: boolean = false;
  Purchase: number;
  InventoryAmmount: number;
  Sales: number;
  Returns: number;
  Netcostofsales: number;
  Profit: number;
  NetProfit: number;
  Cost: number;
  ProfitOrLoss: number;
  TotalInvoices: boolean = false;
  voucherData: any;
  showhead: boolean;
  showId: Boolean = false;
  //totals 
  totalSales: number = 0;
  totalReturns: number = 0;
  totalCost: number = 0;
  totalProfit: number = 0;
  loading: boolean;
  totalSalesFormatted: string = '0.000'
  totalReturnsForamatted: string = '0.000'
  totalCostFormatted: string = '0.000'
  totalProfitForamtted: string = '0.000'
  totalFormattedMap: Map<string, number> = new Map<string, number>();
  //end

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private saleReportService: SalesReportsService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      itemId: [0],
      categoryId: [0],
      customerId: [0],
      storeId: [0],
      representId: [0],
      detailed: [0],
      currencyId: [0],
      currRate: [0],
    });

    this.GetHemsProfitReportInitialForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('HemsProfitReportList');
    this.title.setTitle(this.TitlePage);
  }

  GetHemsProfitReportInitialForm() {

    this.saleReportService.GetHemsProfitReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.ItemsList = result.itemsList;
      this.TypesList = result.typesList;
      this.SuppliersList = result.suppliersList;
      this.StoreList = result.storeList;
      this.EmployeeList = result.employeeList;

      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");

      this.currenciesList = result.currencyList;
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
      this.SaleReportForm.get("detailed").setValue(1);
    }
    else {
      this.TotalInvoices = false;
      this.SaleReportForm.get("detailed").setValue(0);
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

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      if (this.TotalInvoices == true) {
        this.saleReportService.GetDetaliedMaterialProfitReport(
          formValues.fromDate,
          formValues.toDate,
          formValues.itemId,
          formValues.categoryId,
          formValues.customerId,
          formValues.storeId,
          formValues.representId,
          formValues.detailed,
          formValues.currencyId,
          formValues.currRate

        ).subscribe((result) => {
          debugger

          this.voucherData = result;
          this.voucherData.forEach(element => {
            element.totalQty = element.totalQty * -1;
            element.totalSales = element.totalSales * -1;
          });
          if (currentLang == "ar") {
            //this.showhead = true;
            //this.showhead = true;
            this.refreshHemsProfitReportArabic(this.voucherData);
          }
          else {
            //this.showhead = false;
            // this.showhead = false;
            this.refreshHemsProfitReportEnglish(this.voucherData);
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
        this.saleReportService.GetMaterialProfitReport(
          formValues.fromDate,
          formValues.toDate,
          formValues.itemId,
          formValues.categoryId,
          formValues.customerId,
          formValues.storeId,
          formValues.representId,
          formValues.detailed,
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
          });
          if (currentLang == "ar") {
            //this.showhead = true;
            this.refreshTotalInvoicesArabic(this.voucherData);
          }
          else {
            //this.showhead = false;
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
    this.SaleReportForm.get('itemId').setValue(0);
    this.SaleReportForm.get('categoryId').setValue(0);
    this.SaleReportForm.get('customerId').setValue(0);
    this.SaleReportForm.get('storeId').setValue(0);
    this.SaleReportForm.get('representId').setValue(0);
    this.SaleReportForm.get('detailed').setValue(0);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);
    this.TotalInvoices = false;
    this.clearTotals();
  }

  clearTotals() {
    this.totalSales = 0;
    this.totalReturns = 0;
    this.totalCost = 0;
    this.totalProfit = 0;
    this.totalSalesFormatted = '0.000'
    this.totalReturnsForamatted = '0.000'
    this.totalCostFormatted = '0.000'
    this.totalProfitForamtted = '0.000'
  }

  calcultevalues() {
    debugger
    if (this.TotalInvoices == false) {
      debugger
      this.totalSales = 0;
      this.totalReturns = 0;
      this.totalCost = 0;
      this.totalProfit = 0;
      this.totalSalesFormatted = '0.000'
      this.totalReturnsForamatted = '0.000'
      this.totalCostFormatted = '0.000'
      this.totalProfitForamtted = '0.000'

      for (let r = 0; r < this.voucherData.length; r++) {
         const rate = Number(this.SaleReportForm.get('currRate')?.value) || 1;
        this.totalSales += Number(this.voucherData[r].salesAmount) / rate ;
        this.totalReturns += Number(this.voucherData[r].returnAmount) / rate
        this.totalCost += Number(this.voucherData[r].salesCost) / rate
        this.totalProfit += Number(this.voucherData[r].profitValue) / rate
      }
     
      this.totalSalesFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSales) ;
      this.totalReturnsForamatted = this.appCommonserviceService.formatCurrencyNumber(this.totalReturns);
      this.totalCostFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalCost);
      this.totalProfitForamtted = this.appCommonserviceService.formatCurrencyNumber(this.totalProfit);
    }

    else {
      this.totalFormattedMap.clear();


      //     // Iterate over voucherData to calculate totals for each group
      this.voucherData.forEach(voucher => {
        const groupKey = voucher.voucherNo; // Change this to the property you're grouping by
        if (!this.totalFormattedMap.has(groupKey)) {
          this.totalFormattedMap.set(groupKey, 0);
        }
        // Calculate totals for each group        
        this.totalFormattedMap.set(groupKey, this.totalFormattedMap.get(groupKey)! + parseFloat(voucher.profitValue) || 0);

      });
      //   this.totalProfit = 0;
      //   this.totalProfitForamtted = '0.000'             
      //   for (let r = 0; r < this.voucherData.length; r++) {
      //           this.totalProfit += Number(this.voucherData[r].profitValue)       
      //         }
      //  this.totalProfitForamtted = this.appCommonserviceService.formatCurrencyNumber(this.totalProfit);
    }
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

  refreshTotalInvoicesArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'رقم المادة': x.itemName,
      'المبيعات': x.salesAmount,
      'المردودات': x.returnAmount,
      'صافي كلفه المبيعات': x.salesCost,
      'الربح': x.profitValue,
      'صافي الربح': x.profitPer,
    }));
  }

  refreshTotalInvoicesEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Material Number': x.itemName,
      'Sales': x.salesAmount,
      'Returns': x.returnAmount,
      'Net Cost Of Sales': x.salesCost,
      'Profit': x.profitValue,
      'Net Profit': x.profitPer,
    }));
  }

  exportExcel1() {
    debugger
    import("xlsx").then(xlsx => {
      console.log("Starting exportExcel1, exportData:", this.exportData);
      if (!this.exportData || this.exportData.length === 0) {
        console.error("exportData فارغة، لا يمكن التصدير");
        return;
      }
      debugger
       // const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const worksheet = (xlsx.utils.json_to_sheet as any)(this.exportData, { origin: 'A2' });
      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      console.log("Headers:", headers);
      console.log("isArabic:", isArabic);

      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalSales = this.exportData.reduce((sum, item) => {
        const val = (item['المبيعات'] || item['Sales'] || "0").toString().trim();
        const num = parseFloat(val) || 0;
        return sum + num;
      }, 0);

      const totalreturnAmount = this.exportData.reduce((sum, item) => {
        const val = (item['المردودات'] || item['Returns'] || "0").toString().trim();
        const num = parseFloat(val) || 0;
        return sum + num;
      }, 0);

      const totalsalesCost = this.exportData.reduce((sum, item) => {
        const val = (item['صافي كلفه المبيعات'] || item['Net Cost Of Sales'] || "0").toString().trim();
        const num = parseFloat(val) || 0;
        return sum + num;
      }, 0);

      const totalprofitValue = this.exportData.reduce((sum, item) => {
        const val = (item['الربح'] || item['Profit'] || "0").toString().trim();
        const num = parseFloat(val) || 0;
        return sum + num;
      }, 0);

      const totalNetProfit = this.exportData.reduce((sum, item) => {
        const val = (item['صافي الربح'] || item['Net Profit'] || "0").toString().trim();
        const num = parseFloat(val) || 0;
        return sum + num;
      }, 0);

      console.log("Totals:", {
        totalSales, totalreturnAmount, totalsalesCost, totalprofitValue, totalNetProfit
      });

      const fieldMap = isArabic
        ? {
          'المبيعات': totalSales,
          'المردودات': totalreturnAmount,
          'صافي كلفه المبيعات': totalsalesCost,
          'الربح': totalprofitValue,
          'صافي الربح': totalNetProfit
        }
        : {
          'Sales': totalSales,
          'Returns': totalreturnAmount,
          'Net Cost Of Sales': totalsalesCost,
          'Profit': totalprofitValue,
          'Net Profit': totalNetProfit
        };
      console.log("fieldMap:", fieldMap);
      debugger
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
      console.log("Last row to write totals:", lastRow);

      headers.forEach((header, index) => {
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
          console.log(`Writing ${trimmedHeader} total ${sumValue.toFixed(2)} at ${cellAddress}`);
        } else {
          console.log(`No sum for header ${trimmedHeader}`);
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };
      console.log(`Writing label ${totalLabel} at ${labelCellAddress}`);

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });

      this.saveAsExcelFile(excelBuffer, this.TitlePage);
    }).catch(err => {
      console.error("خطأ في استيراد xlsx أو التنفيذ:", err);
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
       head = [['صافي الربح', 'الربح', '  صافي كلفة البيع', 'المردودات', ' المبيعات', ' رقم المادة']]
    }
    else {
       head = [['Net Profit', 'Profit', 'Net cost of sales', 'Returns', 'Sales', 'Material Number']]
    }

    const rows: (number | string)[][] = [];
    let totalSales = 0;
    let totalreturnAmount = 0;
    let totalsalesCost = 0;
    let totalprofitValue = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.itemName,
        temp[1] = part.salesAmount,
        temp[2] = part.returnAmount,
        temp[3] = part.salesCost,
        temp[4] = part.profitValue,
        temp[5] = part.profitPer,

      totalSales += parseFloat(part.salesAmount) || 0;
      totalreturnAmount += parseFloat(part.returnAmount) || 0;
      totalsalesCost += parseFloat(part.salesCost) || 0;
      totalprofitValue += parseFloat(part.profitValue) || 0;
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
      footRow[1] = totalSales.toFixed(2);
      footRow[2] = totalreturnAmount.toFixed(2);
      footRow[3] = totalsalesCost.toFixed(2);
      footRow[4] = totalprofitValue.toFixed(2);
    } else {
      footRow[0] = "Total";
      footRow[1] = totalSales.toFixed(2);
      footRow[2] = totalreturnAmount.toFixed(2);
      footRow[3] = totalsalesCost.toFixed(2);
      footRow[4] = totalprofitValue.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف ارباح المواد " : " Items Profit Report";
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

  refreshHemsProfitReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
    'رقم الفاتورة': x.voucherNo,
    'تاريخ الفاتورة': x.voucherDate,
    'العميل': x.customerName,
    'المادة': x.itemName,
    'الكمية المباعة': x.salesQty != null ? x.salesQty.toFixed(3) : '0.000',
    'البونص': x.bouns,
    'سعر البيع': x.price != null ? x.price.toFixed(3) : '0.000',
    'الكلفة': x.cost != null ? x.cost.toFixed(3) : '0.000',
    'مجموع البيع': x.totalSales != null ? x.totalSales.toFixed(3) : '0.000',
    'الخصم': x.discountAmt != null ? x.discountAmt.toFixed(3) : '0.000',
    'مجموع الكلفة': x.totalCost != null ? x.totalCost.toFixed(3) : '0.000',
    'الربح او الخساره': x.profitValue != null ? x.profitValue.toFixed(3) : '0.000',
    'نسبة الربح':  x.profitPercent ,
    }));
  }

  refreshHemsProfitReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
    'Invoice Number': x.voucherNo,
    'Invoice Date': x.voucherDate,
    'Client': x.customerName,
    'Material': x.itemName,
    'Sold Qty': x.salesQty != null ? x.salesQty.toFixed(3) : '0.000',
    'Bonus': x.bouns,
    'Price': x.price != null ? x.price.toFixed(3) : '0.000',
    'Cost': x.cost != null ? x.cost.toFixed(3) : '0.000',
    'Total Sales': x.totalSales != null ? x.totalSales.toFixed(3) : '0.000',
    'Discount': x.discountAmt != null ? x.discountAmt.toFixed(3) : '0.000',
    'Total Cost': x.totalCost != null ? x.totalCost.toFixed(3) : '0.000',
    'Profit or loss': x.profitValue != null ? x.profitValue.toFixed(3) : '0.000',
    'Profit %': x.profitPercent ,
    }));
  }

  exportExcel2() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      
       
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Item Sale Report");
    });
  }

  exportPdf2() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['الربح او الخساره', 'تاريخ الفاتورة', 'العميل', 'رقم الفاتورة', 'الكلفة', 'السعر', 'البونص', ' الكمية المباعة', ' رقم المادة']]
    }
    else {
       head = [['Profit or loss', 'Invoice Date', 'Client', 'Invoice Number', 'cost', 'Price', 'Bonus', 'Sold Qty', 'Material Number']]
    }

    const rows: (number | string)[][] = [];
    this.Data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.itemName;
      temp[1] = part.salesQty != null ? part.salesQty.toFixed(3) : '0.000';
      temp[2] = part.bouns;
      temp[3] = part.price != null ? part.price.toFixed(3) : '0.000';
      temp[4] = part.cost != null ? part.cost.toFixed(3) : '0.000';
      temp[5] = part.voucherNo;
      temp[6] = part.customerName;
      temp[7] = part.voucherDate;
      temp[8] = part.profitValue != null ? part.profitValue.toFixed(3) : '0.000';
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp)
    }, this.Data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? " كشف ارباح المواد " : " Items Profit Report" ;
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 15 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
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

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);
      if (curr) {
        this.SaleReportForm.get("currRate").setValue(Number(curr.data1))
        this.GetReport();
      }
      else {
        this.SaleReportForm.get("currRate").setValue(0);
      }
    }
    else {
      this.SaleReportForm.get("currRate").setValue(0);
    }
  }

  convertWithRate(value: number): string {
  const rate = Number(this.SaleReportForm.get('currRate')?.value) || 1;
  const num = Number(value) || 0;
  const converted = num / rate;
  return this.appCommonserviceService.formatCurrencyNumber(converted);
  }

  getFixed(value: any): string {
  const num = Number(value);
  if (isNaN(num)) {
    return '0.000';
  }
  return num.toFixed(3);
  }

}
