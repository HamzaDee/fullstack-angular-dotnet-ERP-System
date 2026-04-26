import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { PurchaseReportService } from '../purchase-report.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-material-purchase-report',
  templateUrl: './material-purchase-report.component.html',
  styleUrls: ['./material-purchase-report.component.scss']
})
export class MaterialPurchaseReportComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 200;
  custom: boolean;
  MaterialPurchaseReportForm: FormGroup;
  public Data: any[];
  public currencyList: any;
  decimalPlaces: number;
  public ItemsList: any;
  public SuppliersList: any;
  public TypesList: any;
  public StoreList: any;
  exportData: any[];
  public Collect: boolean = false;
  public Detailes: boolean = false;
  public CheckCollect: boolean = false;
  public CheckDetailes: boolean = false;
  TotalInvoices: boolean = false;
  DetailesInvoices: boolean = false;
  loading: boolean;
  public TotalAmount: number = 0;
  public TotalAmountCurrency: number = 0;
  currenciesList:any;
  currName : any;
  defaultCurrencyName: any ;
  totalCurrRate : any ;
  constructor(private title: Title,
    private purchaseReportService: PurchaseReportService,
    private formbulider: FormBuilder,
    private egretLoader: AppLoaderService,
    private serv: AppCommonserviceService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private alert: sweetalert) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.MaterialPurchaseReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      itemId: [0],
      supplierId: [0],
      categoryId: [0],
      storeId: [0],
      type: [1],
      invoiceType: [0],
      currencyId:[0],
      currRate:[0],
      currName:[''],
       defaultCurrencyName:[''],

    });
    // Set default values
    this.Collect = false;
    this.Detailes = true;
    this.CheckCollect = true;
    this.MaterialPurchaseReportForm.value.type = 1;

    this.TotalInvoices = true;

    this.GetMaterialPurchaseReportInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaterialPurchaseReport');
    this.title.setTitle(this.TitlePage);
  }

  canBeCumulative(event: any, Select: any) {
    debugger;
    this.Data = [];
    if (Select == 1) {
      this.TotalInvoices = true;
      this.DetailesInvoices = false;
      this.CheckCollect = true;
      this.CheckDetailes = false;
      this.MaterialPurchaseReportForm.get("type").setValue(1);
      this.MaterialPurchaseReportForm.get("invoiceType").setValue(0);
    } else {
      this.TotalInvoices = false;
      this.DetailesInvoices = true;
      this.CheckCollect = false;
      this.CheckDetailes = true;
      this.MaterialPurchaseReportForm.get("type").setValue(2);
      this.MaterialPurchaseReportForm.get("invoiceType").setValue(1);
    }
  }

  GetMaterialPurchaseReportInitialForm() {
    debugger
    this.purchaseReportService.GetMaterialPurchaseReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.ItemsList = result.itemsList;
      this.SuppliersList = result.suppliersList;
      this.TypesList = result.typesList;
      this.StoreList = result.storeList;

      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.MaterialPurchaseReportForm.get('fromDate').setValue(result.fromDate);
      this.MaterialPurchaseReportForm.get('toDate').setValue(result.toDate);
      this.MaterialPurchaseReportForm.patchValue(result);
      this.currenciesList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      debugger
      this.defaultCurrencyName = result.defaultCurrencyName;
    });
  }

  GetReport() {
    debugger
    this.TotalAmount = 0;
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    const formValues = this.MaterialPurchaseReportForm.value;
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.purchaseReportService.GetFilterMaterialPurchase(
      formValues.fromDate,
      formValues.toDate,
      formValues.itemId,
      formValues.supplierId,
      formValues.categoryId,
      formValues.storeId,
      formValues.type,
      formValues.invoiceType,
      formValues.currencyId,
      formValues.currRate
    ).subscribe((result:any) => {
        debugger
        
   const rows = Array.isArray(result) ? result : [result];
   const selectedRate =Number(this.MaterialPurchaseReportForm.get('currRate')?.value) || 1;
      for (const r of rows) { 
        r.totalCurrRate = (this.MaterialPurchaseReportForm.value.type == 1)
          ? ((Number(r?.totalPur ?? 0) - Number(r?.totalReturn ?? 0)) / selectedRate)
          : (((Number(r?.total ?? 0) - Number(r?.discountAmt ?? 0) + Number(r?.taxAmt ?? 0)) * (Number(r?.currRate ?? 1))) / selectedRate);}
      this.Data = rows;



        if (this.MaterialPurchaseReportForm.value.type == 1) {
          if (currentLang == "ar") {
            this.refreshMaterialPurchasecumulativeArabic(this.Data);
          }
          else {
            this.refreshMaterialPurchasecumulativeEnglish(this.Data);
          }
        }
        else { 
          if (currentLang == "ar") {
            this.refreshMaterialPurchaseDetaileArabic(this.Data);
          }
          else {
            this.refreshMaterialPurchaseDetaileEnglish(this.Data);
          }
        }
         this.egretLoader.close();
          debugger
          for (const row of this.Data) {
            const currRate = Number(this.MaterialPurchaseReportForm.get('currRate')?.value) || 1;
            const totalValue = parseFloat(row.total);
            if (!isNaN(totalValue)) {
              this.TotalAmount += row.totalCurrRate ; 
            }
          }
       
      });
  }

  clearFormData() {
    debugger
    this.Data = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.MaterialPurchaseReportForm.get('fromDate').setValue(currentDate);
    this.MaterialPurchaseReportForm.get('toDate').setValue(currentDate);
    this.CheckCollect = false;
    this.CheckDetailes = false;
    this.MaterialPurchaseReportForm.get('supplierId').setValue(0);
    this.MaterialPurchaseReportForm.get('itemId').setValue(0);
    this.MaterialPurchaseReportForm.get('categoryId').setValue(0);
    this.MaterialPurchaseReportForm.get('storeId').setValue(0);
    this.MaterialPurchaseReportForm.get('invoiceType').setValue(0);
    this.MaterialPurchaseReportForm.get('type').setValue(1);
    this.MaterialPurchaseReportForm.get('currencyId').setValue(0);
    this.MaterialPurchaseReportForm.get('currRate').setValue(0);
    this.Collect = false;
    this.Detailes = true;
    this.CheckCollect = true;
    this.TotalInvoices = true;
    this.canBeCumulative(0, 1);
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

  refreshMaterialPurchasecumulativeArabic(data) {
  this.Data = data || [];


  const rateRaw = Number(this.MaterialPurchaseReportForm.get('currRate')?.value);
  const rate = rateRaw > 0 ? rateRaw : 1;

  this.exportData = this.Data.map(x => {
    const totalPrice = (Number(x.totalPur || 0) - Number(x.totalReturn || 0));
    const totalInCurrency = totalPrice / rate;

    return {
      'رقم المادة': x.itemId,
      'اسم المادة': x.itemName,
      'اجمالي الكميات المشتراة': x.purQty,
      'اجمالي الكميات المرتجعة': x.returnQty,
      'اجمالي السعر': totalPrice,
      'الإجمالي بالعملة': totalInCurrency,
    };
  });
  }

  refreshMaterialPurchasecumulativeEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Material Number': x.itemId,
      'Material Name': x.itemName,
      'Total Quantities Purchased': x.purQty,
      'Total Quantities Returned': x.returnQty,
      'Total Price': x.totalPur - x.totalReturn,
    }));
  }

  refreshMaterialPurchaseDetaileArabic(data) {
  this.Data = data;
  this.exportData = this.Data.map(x => ({
  'نوع الفاتورة': x.voucherName,
  'رقم الفاتورة': x.voucherNo,
  'تاريخ الفاتورة': x.voucherDate,
  'المورد': x.dealerName,
  'العملة': x.currName,
  'رمز المادة': x.itemId,
  'اسم المادة': x.itemName,
  'الوحدة': x.unitName,
  'الكمية': x.qty,
  'سعر الوحدة': x.price,
  'المجموع': x.total,
  'الخصم': x.discountAmt,
  'الضريبة': x.taxAmt,
  'الإجمالي': (Number(x.totalPur || 0) - Number(x.discountAmt || 0) + Number(x.taxAmt || 0)),
  'الإجمالي بالعملة': x.totalCurrRate,
  }));
  }

  refreshMaterialPurchaseDetaileEnglish(data) {
  this.Data = data;
  this.exportData = this.Data.map(x => ({
    'Bill Type': x.voucherName,
    'Bill Number': x.voucherNo,
    'Bill Date': x.voucherDate,
    'Supplier': x.dealerName,
    'Currency': x.currName,
    'Item Number': x.itemId,
    'Item Name': x.itemName,
    'Unit': x.unitName,
    'Qty': x.qty,
    'Unit Price': x.price,
    'Subtotal': x.total,
    'Discount': x.discountAmt,
    'Tax': x.taxAmt,
    'Totals': (Number(x.totalPur || 0) - Number(x.discountAmt || 0) + Number(x.taxAmt || 0)),
    'Total in currency': x.totalCurrRate,
  }));
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      // const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const worksheet = (xlsx.utils.json_to_sheet as any)(this.exportData, { origin: 'A2' });

       const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
      const headers1 = Object.keys(this.exportData[0]);
      const lastColLetter = getExcelColumnLetter(headers1.length - 1);
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];

      
      const headers = Object.keys(this.exportData[0]);

      const totalHeaderArabic = 'الإجمالي بالعملة';
      const totalHeaderEnglish = 'Total in currency';

      let totalColIndex = headers.indexOf(totalHeaderArabic);
      if (totalColIndex < 0) totalColIndex = headers.indexOf(totalHeaderEnglish);
      if (totalColIndex < 0) totalColIndex = headers.length - 1;

      const totalColLetter = getExcelColumnLetter(totalColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0], 10))
        .reduce((a, b) => Math.max(a, b), 0) + 1;
      const totalAmount = this.exportData.reduce((sum, row) => {
        const v = Number(row[totalHeaderArabic] ?? row[totalHeaderEnglish] ?? 0);
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
      worksheet[totalColLetter + lastRow] = { t: 'n', v: Number(totalAmount.toFixed(3)) };
      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        worksheet[labelColLetter + lastRow] = { t: 's', v: (this.jwtAuth.getLang() === 'ar') ? 'المجموع' : 'Total' };
      }
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

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

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Inventory Report List", ".xlsx");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportExcel2() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

         // const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const worksheet = (xlsx.utils.json_to_sheet as any)(this.exportData, { origin: 'A2' });

       const title = this.translateService.instant(this.TitlePage);
      const titleCell = 'A1';
      worksheet[titleCell] = { t: 's', v: title };
      const headers1 = Object.keys(this.exportData[0]);
      const lastColLetter = getExcelColumnLetter1(headers1.length - 1);
      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers1.length - 1 } }];

       function getExcelColumnLetter1(colIndex: number): string {
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

      


      const totalAmount = this.Data.reduce((sum, x) => sum + (Number(x.totalCurrRate) || 0), 0);

      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'الإجمالي بالعملة';
      const totalHeaderEnglish = 'Total in currency';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

      // تحويل فهرس العمود إلى حرف إكسل
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

      // احسب رقم آخر صف
      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: parseFloat(totalValue) };

      // كلمة "المجموع" أو "Total" في العمود الذي قبل المبلغ
      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      // تحديث النطاق
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile2(excelBuffer,this.TitlePage);
    });
  }

  saveAsExcelFile2(buffer: any, fileName: string): void {
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
    
    if (this.MaterialPurchaseReportForm.value.type == 1) {
      if (currentLang == "ar") {
         head = [[  `الإجمالي بالعملة ${this.currName || ''}`,`اجمالي السعر ${this.defaultCurrencyName || ''}`,' اجمالي الكميات المرتجعة', 'اجمالي الكميات المشتراة', 'اسم المادة', 'رقم المادة']]
      }
      else {
         head = [[`Total in currency ${this.currName || ''}`,`Total Price ${this.defaultCurrencyName || ''}`,'Total Quantities Returned', 'Total Quantities Purchased', 'Material Name', 'Material Number']]
      }

     const rows: (number | string)[][] = [];
     const selectedRate = Number(this.MaterialPurchaseReportForm.get('currRate')?.value) || 1;

  this.Data.forEach(function (part, index) {
  let temp: (number | string)[] = [];
  temp[0] = part.itemId;
  temp[1] = part.itemName;
  temp[2] = part.purQty;
  temp[3] = part.returnQty;
  const totalPrice = (Number(part.totalPur || 0) - Number(part.totalReturn || 0));
  temp[4] = totalPrice;
  temp[5] = totalPrice / selectedRate;

  if (isArabic) {
    temp.reverse();
  }
  rows.push(temp);
  const colCount = head[0].length;
  let footRow: (string | number)[] = new Array(colCount).fill('');
  footRow[colCount - 2] = (currentLang === "ar") ? "المجموع" : "Total";
  footRow[colCount - 1] = Number((this.TotalAmount || 0).toFixed(3));

const foot = [footRow.reverse()];


}, this.Data);

      const pdf = new jsPDF('l', 'pt', 'a4');
      pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
      pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      pdf.setFont('Amiri');
      pdf.setFontSize(14);
     
      const Title = currentLang == "ar" ?" كشف مشتريات المواد":"Material Purchase Report ";
      const pageWidth = pdf.internal.pageSize.width;
      pdf.text(Title, pageWidth / 2, 8, { align: 'center' });
      const colCount = head[0].length;
      let footRow: (string | number)[] = new Array(colCount).fill('');
      footRow[colCount - 2] = (currentLang === "ar") ? "المجموع" : "Total";
      footRow[colCount - 1] = Number((this.TotalAmount || 0).toFixed(3));

      const foot = [footRow.reverse()];

      autoTable(pdf as any, {
        head: head,
        body: rows,
        foot: foot,
        headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
        bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
        footStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', fillColor: [240, 240, 240], textColor: 'black' },
        theme: "grid",
      });
      pdf.output('dataurlnewwindow')
    }
  }

  exportPdf2() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [[ `الإجمالي بالعملة ${this.currName || ''}` ,'الاجمالي', 'سعر الوحدة', 'الكمية', 'الوحدة', 'اسم المادة', 'رمز المادة', 'الصنف', 'المورد', 'تاريخ الفاتورة', 'رقم الفاتورة', 'نوع الفاتورة']]
    }
    else {
      var head = [[  `Total in currency ${this.currName || ''}`,'Totals', 'Unit Price', 'Qty', 'Unit', 'Item Name', 'Item Number', 'Category', 'Supplier', 'Bill Date', 'Bill Number', 'Bill Type']]
    }

   var rows: (number | string)[][] = [];
let totalAmount = 0; // رح نخليه يجمع الإجمالي بالعملة

this.Data.forEach((part) => {
  let temp: (number | string)[] = [];


  temp[0]  = part.voucherName;
  temp[1]  = part.voucherNo;
  temp[2]  = part.voucherDate;
  temp[3]  = part.dealerName;
  temp[4]  = part.currName;        
  temp[5]  = part.itemId;
  temp[6]  = part.itemName;
  temp[7]  = part.unitName;
  temp[8]  = part.qty;
  temp[9]  = part.price;
  temp[10] = Number(part.total || 0);
  temp[11] = Number(part.discountAmt || 0);
  temp[12] = Number(part.taxAmt || 0);
  temp[13] = Number((part.totalPur ?? part.total) || 0) - Number(part.discountAmt || 0) + Number(part.taxAmt || 0);
  temp[14] = Number(part.totalCurrRate || 0);
  totalAmount += Number(part.totalCurrRate || 0);

  if (isArabic) {
    temp.reverse();
  }
  rows.push(temp);
});


    // Prepare footer row (reverse the order like rows)
  const columnCount = head[0].length;
  let footRow: (string | number)[] = new Array(columnCount).fill('');
  let foot;

  // قبل الـ reverse: خليه آخر خانتين
  footRow[columnCount - 2] = (currentLang == "ar") ? "المجموع" : "Total";
  footRow[columnCount - 1] = Number(totalAmount.toFixed(3));

  foot = [footRow.reverse()];


    const pdf = new jsPDF('p', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    let Title = currentLang == "ar" ? "كشف مشتريات المواد" : "Material Purchase Report";
    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

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

  detailsMaterialPurchase(id: number, categoryId: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;

    if (categoryId == 39) {
      let url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
      window.open(url, '_blank');
    }

    else if (categoryId == 41) {
      let url = `/ReturnPurchaseInvoice/ReturnPurInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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

  onCurrencyChange(value:any)
  {
    debugger;
    if(value > 0)
    {
      let curr = this.currenciesList.find(c => c.id == value);
      if(curr)
      {
        this.MaterialPurchaseReportForm.get("currRate").setValue(Number(curr.data1)) 
        this.MaterialPurchaseReportForm.get("currName")?.setValue(curr.text || '');
        this.currName = curr.text || '';
        this.GetReport() ;
      }
      else
      {
        this.MaterialPurchaseReportForm.get("currRate").setValue(0); 
        this.currName =  '';
      }
    }
    else
      {
        this.MaterialPurchaseReportForm.get("currRate").setValue(0);
        this.currName =  '';
      }
  }
}
