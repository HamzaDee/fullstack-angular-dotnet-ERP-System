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
  selector: 'app-items-tax-reportlist',
  templateUrl: './items-tax-reportlist.component.html',
  styleUrls: ['./items-tax-reportlist.component.scss']
})
export class ItemsTaxReportlistComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 181;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  currencyList: any;
  decimalPlaces: number;
  SaleReportForm: FormGroup;
  ItemsList: any;
  TypesList: any;
  TaxModelList: any;
  QuantityPurchased: number;
  SoldQty: number;
  SaleValue: number;
  SalesTax: number;
  ReturnValue: number;
  ReturnTax: number;
  voucherData:any;
  //totals
    totalSales:number = 0;
    totalSalesTax:number = 0;
    totalReturnSales:number = 0;
    totalReturnTax:number = 0;
    totalSalesFormatted:string = '0.000'
    totalSalesTaxFormatted:string = '0.000'
    totalReturnSalesFormatted:string = '0.000'
    totalReturnTaxFormatted:string = '0.000'
  //End
  loading: boolean;
  currenciesList:any;


  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private salesReprortServ: SalesReportsService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SaleReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      itemId:[0],
      categoryId:[0],
      taxId:[0],
      currencyId:[0],
      currRate:[0],
    });

    this.GetItemsTaxReportInitialForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsTaxReportlist');
    this.title.setTitle(this.TitlePage);
  }

  GetItemsTaxReportInitialForm() {
    debugger
    this.salesReprortServ.GetItemsTaxReportForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.TypesList = result.typesList;
      this.ItemsList = result.itemsList;
      this.TaxModelList = result.taxModelLists;
 

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

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger
      const formValues = this.SaleReportForm.value;        
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.salesReprortServ.GetItemsTaxReport(
        formValues.fromDate,
        formValues.toDate,
        formValues.itemId,
        formValues.categoryId,
        formValues.taxId,   
        formValues.currencyId,
        formValues.currRate     
      ).subscribe((result) => {
        debugger
  
        this.voucherData = result;

        if (currentLang == "ar") {
          this.refreshItemsTaxReportArabic(this.voucherData);
        }
        else {
          this.refreshItemsTaxReportEnglish(this.voucherData);
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

  clearTotals()
  {
    this.totalSales = 0;
    this.totalSalesTax = 0;
    this.totalReturnSales = 0;
    this.totalReturnTax = 0;
    this.totalSalesFormatted = '0.000'
    this.totalSalesTaxFormatted = '0.000'
    this.totalReturnSalesFormatted = '0.000'
    this.totalReturnTaxFormatted = '0.000'
  }

  calcultevalues()
  {
    debugger
    this.totalSales = 0;
    this.totalSalesTax = 0;
    this.totalReturnSales = 0;
    this.totalReturnTax = 0;
    this.totalSalesFormatted = '0.000'
    this.totalSalesTaxFormatted = '0.000'
    this.totalReturnSalesFormatted = '0.000'
    this.totalReturnTaxFormatted = '0.000'
  

      for (let r = 0; r < this.voucherData.length; r++) {
        const rate = Number(this.SaleReportForm.get('currRate')?.value) || 1;
        this.totalSales += Number(this.voucherData[r].totalSales) / rate ;
        this.totalSalesTax += Number(this.voucherData[r].salesTaxAmount)  / rate  
        this.totalReturnSales += Number(this.voucherData[r].totalReturn) / rate  
        this.totalReturnTax += Number(this.voucherData[r].retSalesTaxAmount)  / rate       
      }

      
      this.totalSalesFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSales);
      this.totalSalesTaxFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalSalesTax);
      this.totalReturnSalesFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalReturnSales);
      this.totalReturnTaxFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalReturnTax);
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
    this.SaleReportForm.get('taxId').setValue(0);
    this.SaleReportForm.get('currencyId').setValue(0);
    this.SaleReportForm.get('currRate').setValue(0);    
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

  refreshItemsTaxReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'رقم المادة': x.itemId,
      'اسم المادة': x.itemName,
      'الكمية المشتراة': x.totalPurchaseQty,
      'الكمية المباعة': x.totalSalesQty,
      'قيمة  البيع': x.totalSales.toFixed(3),
      'ضريبة المبيعات': x.salesTaxAmount.toFixed(3),
      'قيمة  المرتجع': x.totalReturn.toFixed(3),
      'ضريبة المرتجع': x.retSalesTaxAmount.toFixed(3),
    }));
  }

  refreshItemsTaxReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Material Number': x.itemId,
      'Material Name': x.itemName,
      'Quantity Purchased': x.totalPurchaseQty,
      'Sold Qty': x.totalSalesQty,
      'Sale Value': x.totalSales.toFixed(3),
      'Sales Tax': x.salesTaxAmount.toFixed(3),
      'Return Value': x.totalReturn.toFixed(3),
      'Return Tax': x.retSalesTaxAmount.toFixed(3),

    }));
  }

  exportExcel() {
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


      const totalSales = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalSales?.toString().trim() || "0"), 0);
      const totalsalesTaxAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.salesTaxAmount?.toString().trim() || "0"), 0);
      const totalReturn = this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalReturn?.toString().trim() || "0"), 0);
      const totalretSalesTaxAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.retSalesTaxAmount?.toString().trim() || "0"), 0);


      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'قيمة  البيع': totalSales,
          'ضريبة المبيعات': totalsalesTaxAmount,
          'قيمة  المرتجع': totalReturn,
          'ضريبة المرتجع': totalretSalesTaxAmount,
        }
        : {
          'Sale Value': totalSales,
          'Sales Tax': totalsalesTaxAmount,
          'Return Value': totalReturn,
          'Return Tax': totalretSalesTaxAmount,
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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['ضريبة المرتجع', 'قيمة المرتجع','ضريبة المبيعات','قيمة البيع','الكمية المباعة','الكمية المشتراة','اسم المادة','رقم المادة']]
    }
    else {
       head = [['Return Tax','Return Value','Sales Tax','Sale Value','Sold Qty','Quantity Purchased','Material Name','Material Number']]
    }
    const rows: (number | string)[][] = [];
    let totalSales = 0;
    let totalsalesTaxAmount = 0;
    let totalReturn = 0;
    let totalretSalesTaxAmount = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
        temp[0] = part.itemId,
        temp[1] = part.itemName,
        temp[2] = part.totalPurchaseQty,
        temp[3] = part.totalSalesQty,
        temp[4] = part.totalSales.toFixed(3),
        temp[5] = part.salesTaxAmount.toFixed(3),
        temp[6] = part.totalReturn.toFixed(3),
        temp[7] = part.retSalesTaxAmount.toFixed(3),

      totalSales += parseFloat(part.totalSales) || 0;
      totalsalesTaxAmount += parseFloat(part.salesTaxAmount) || 0;
      totalReturn += parseFloat(part.totalReturn) || 0;
      totalretSalesTaxAmount += parseFloat(part.retSalesTaxAmount) || 0;
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
      footRow[5] = totalsalesTaxAmount.toFixed(2);
      footRow[6] = totalReturn.toFixed(2);
      footRow[7] = totalretSalesTaxAmount.toFixed(2);
    } else {
      footRow[3] = "Total";
      footRow[4] = totalSales.toFixed(2);
      footRow[5] = totalsalesTaxAmount.toFixed(2);
      footRow[6] = totalReturn.toFixed(2);
      footRow[7] = totalretSalesTaxAmount.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف مبيعات الاصناف " :"Items Tax Report list";
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
        this.GetReport();
      }
      else
      {
        this.SaleReportForm.get("currRate").setValue(0); 
      }
    }
    else
      {
        this.SaleReportForm.get("currRate").setValue(0);
      }
  }

  convertWithRate(value: number): string {
  const rate = Number(this.SaleReportForm.get('currRate')?.value) || 1;
  const num = Number(value) || 0;
  const converted = num / rate;
  return this.appCommonserviceService.formatCurrencyNumber(converted);
  }


}
