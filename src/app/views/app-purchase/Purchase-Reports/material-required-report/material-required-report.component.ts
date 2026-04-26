import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PurchaseReportService } from '../purchase-report.service';
import { formatDate } from '@angular/common';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-material-required-report',
  templateUrl: './material-required-report.component.html',
  styleUrls: ['./material-required-report.component.scss']
})
export class MaterialRequiredReportComponent implements OnInit {
  public TitlePage: string;
  screenId: number = 198;
  custom: boolean;
  MaterialRequiredReportForm: FormGroup;
  public Data: any[];
  public currencyList: any;
  decimalPlaces: number;
  public ItemsList: any;
  public SuppliersList;
  exportData: any[];
  loading: boolean;
  public TotalAmount: number = 0;
  currenciesList:any;
  currName: string = '';
  defaultCurrencyName: string = '';
  reportTotalCost : any ;

  constructor(
    private title: Title,
    private purchaseReportService: PurchaseReportService,
    private formbulider: FormBuilder,
    private appCommonserviceService: AppCommonserviceService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private alert: sweetalert) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.MaterialRequiredReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromeDate: [''],
      toDate: [''],
      itemId: [0],
      suppliersId: [0],
      currencyId:[0],
      currRate:[0],
    });

    this.GetMaterialRequiredReportInitialForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaterialRequiredReport');
    this.title.setTitle(this.TitlePage);
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  GetMaterialRequiredReportInitialForm() {
    debugger
    this.purchaseReportService.publicGetMaterialRequiredReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.ItemsList = result.itemsList;
      this.SuppliersList = result.suppliersList;
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.MaterialRequiredReportForm.get('fromeDate').setValue(result.fromDate);
      this.MaterialRequiredReportForm.get('toDate').setValue(result.toDate);
      this.MaterialRequiredReportForm.patchValue(result);
      this.currenciesList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;
      this.defaultCurrencyName = result.defaultCurrencyName || '';

    });
  }

  GetReport() {
    debugger
    this.TotalAmount = 0;
    var currentLang = this.jwtAuth.getLang();

    let fromDate = this.MaterialRequiredReportForm.value.fromeDate;
    let toDate = this.MaterialRequiredReportForm.value.toDate;
    let itemId = this.MaterialRequiredReportForm.value.itemId > 0 ? this.MaterialRequiredReportForm.value.itemId : 0;
    let supplierId = this.MaterialRequiredReportForm.value.suppliersId > 0 ? this.MaterialRequiredReportForm.value.suppliersId : 0;
    let currencyId = this.MaterialRequiredReportForm.value.currencyId > 0 ? this.MaterialRequiredReportForm.value.currencyId : 0;
    let currRate = this.MaterialRequiredReportForm.value.currRate > 0 ? this.MaterialRequiredReportForm.value.currRate : 0;
    this.purchaseReportService.GetMaterialRequiredSearch(
      fromDate,
      toDate,
      itemId,
      supplierId,currencyId,currRate).subscribe((result) => {
        debugger
        this.Data = result;
this.TotalAmount = this.Data.reduce((sum, r) => sum + (Number(r.reportTotalCost) || 0), 0);

//  const selectedRate = Number(this.MaterialRequiredReportForm.get('currRate')?.value) || 1;

// for (const r of this.Data) {
//   const baseTotal = Number(r?.totalCost ?? 0);
//   r.totalCurrRate = baseTotal / selectedRate;   // الإجمالي بالعملة المختارة
// }

// // إجمالي الفوتر بالعملة المختارة
// this.TotalAmount = this.Data.reduce((sum, r) => sum + (Number(r.totalCurrRate) || 0), 0);


        if (currentLang == "ar") {
          this.refreshMaterialRequiredReportArabic(this.Data);
        }
        else {
          this.refreshMaterialRequiredReportEnglish(this.Data);
        }

        // for (const row of this.Data) {
        //   const totalValue = parseFloat(row.totalCost);
        //   if (!isNaN(totalValue)) {
        //     this.TotalAmount += totalValue;
        //   }
        // }
      });
  }

  clearFormData() {
    debugger
    const currentDate = new Date().toISOString().split('T')[0];
    this.MaterialRequiredReportForm.get('fromeDate').setValue(currentDate);
    this.MaterialRequiredReportForm.get('toDate').setValue(currentDate);
    this.MaterialRequiredReportForm.get('itemId').setValue(0);
    this.MaterialRequiredReportForm.get('suppliersId').setValue(0);
    this.Data = [];
    this.MaterialRequiredReportForm.get('itemId').setValue(0);
    this.MaterialRequiredReportForm.get('suppliersId').setValue(0);
    this.MaterialRequiredReportForm.get('currencyId').setValue(0);
    this.MaterialRequiredReportForm.get('currRate').setValue(0);
    this.TotalAmount = 0;

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

  refreshMaterialRequiredReportArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'نوع السند': x.voucherName,
      'رقم طلب الشراء': x.vocherNumber,
      'المورد': x.customerName,
      'رمز المادة': x.itemNo,
      'اسم المادة': x.itemName,
      'الوحدة': x.unitName,
      'الكمية': x.qty,
      'السعر': x.price,
      'العملة': x.currencyName,
      ' معامل التحويل': x.currRate,
      'الاجمالي': x.totalCost,
      ' الاجمالي بالعملة': x.reportTotalCost,

    }));
  }

  refreshMaterialRequiredReportEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Voucher Type': x.voucherName,
      'Purchae Order Number': x.vocherNumber,
      'Supplier': x.customerName,
      'Item Code': x.itemNo,
      'Item Name': x.itemName,
      'Unit': x.unitName,
      'QTY ': x.qty,
      'Price': x.price,
      'Currency': x.currencyName,
      ' currRate': x.currRate,
      'Total': x.totalCost,
      ' reportTotalCost': x.reportTotalCost,
    }));
  }

  exportExcel() {
    debugger
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

      const totalAmount = this.Data.reduce((sum, item) => sum + parseFloat(item.totalCost), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'الاجمالي';
      const totalHeaderEnglish = 'Total';
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
      this.saveAsExcelFile(excelBuffer,  this.TitlePage);
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    let head: string[][];

    if (currentLang == "ar") {
      head = [[  'نوع السند', 'رقم طلب الشراء', 'المورد', 'رمز المادة', 'اسم المادة', 'الوحدة',   'الكمية', 'السعر', 'العملة', 'سعر الصرف', 'الإجمالي', 'الإجمالي بالعملة'
      ]];
    } else {
      head = [[
        'Voucher Type', 'Purchase Order No', 'Supplier', 'Item Code', 'Item Name', 'Unit', 'QTY', 'Price', 'Currency', 'Exchange Ratio', 'Totals', 'Total in Currency'
      ]];
    }


      const rows: (number | string)[][] = [];
      let totalAmount = 0;

      this.Data.forEach((part) => {
        let temp: (number | string)[] = [];
        temp[0] = part.voucherName,
        temp[1] = part.vocherNumber,
        temp[2] = part.customerName,
        temp[3] = part.itemNo,
        temp[4] = part.itemName,
        temp[5] = part.unitName,
        temp[6] = part.qty,
        temp[7] = part.price,
        temp[8] = part.currencyName,
        temp[9] = part.currRate,
        temp[10] = Number(part.totalCost ?? 0).toFixed(3),
        temp[11] = Number(part.reportTotalCost ?? part.totalCurrRate ?? 0).toFixed(3),

        totalAmount += Number(part.totalCost ?? 0);
        rows.push(temp); 
      });

    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[7] = "المجموع";
      footRow[8] = this.formatCurrency(totalAmount);
      foot = [footRow.reverse()];
    }
    else {
      footRow[7] = "Total";
      footRow[8] = this.formatCurrency(totalAmount);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف المواد المطلوبة " : "Material Required Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: foot,
      showFoot: 'lastPage',
      headStyles: {
        font: "Amiri",
        halign: 'center',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: 'center',
        fontSize: 8,
        fontStyle: 'bold'
      },
      footStyles: {
        font: "Amiri",
        halign: 'center',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  detailsMaterialRequired(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    let url = `/PurchaseRequest/PurchaseRequestForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
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
    const curr = this.currenciesList.find(c => c.id == value);
    if (curr) {
      this.MaterialRequiredReportForm.get("currRate")?.setValue(Number(curr.data1));
      this.currName = curr.text || '';
      this.GetReport(); 
    } else {
      this.MaterialRequiredReportForm.get("currRate")?.setValue(0);
      this.currName = '';
    }
  } else {
    this.MaterialRequiredReportForm.get("currRate")?.setValue(0);
    this.currName = '';
  }
  }

}
