import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReportServiceService } from '../report-service.service';
import { formatDate } from '@angular/common';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-transaction-report',
  templateUrl: './transaction-report.component.html',
  styleUrls: ['./transaction-report.component.scss']
})
export class TransactionReportComponent implements OnInit {
  public TitlePage: string;
  screenId: number;
  custom: boolean;
  public AssestList: any;
  public SelectedAssest: number = -1;
  public FixedAssetTypeModelList: any;
  public SelectedFixedAssetType: number = -1;
  public LocationList: any;
  public SelectedLocation: number = -1;
  public VoucherTypeList: any;
  public SelectedVoucherType: number = -1;
  public VoucherStatusList: any;
  public SelectedVoucherStatus: number = -1;
  TransactionReportForm: FormGroup;
  voucherData: any;
  public Totaltr: any;
  exportData: any[];
  exportColumns: any[];
  fixedAssetId: any;
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

    this.TransactionReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fixedAssetsId: [0],
      fixedAssetsTypesId: [0],
      locationId: [0],
      voucherTypesId: [0],
      voucherStatus: [0],
      fromdate: [''],
      todate: [''],
      note: [''],
    });

    this.route.queryParams.subscribe((params: Params) => {

      this.fixedAssetId = +params['fixedAssetId'];

      if (this.fixedAssetId > 0 || this.fixedAssetId) {
        this.TransactionReportForm.controls['fixedAssetsId'].setValue(this.SelectedAssest);
      }
      this.GetTransactionReportInitialForm();
    });

    this.SetTitlePage();
  }

  GetTransactionReportInitialForm() {
    debugger
    this.reportServiceService.GetTransactionReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.AssestList = result.assestList;
      this.FixedAssetTypeModelList = result.fixedAssetTypeModelList;
      this.LocationList = result.locationList;
      this.VoucherTypeList = result.voucherTypeList;
      this.VoucherStatusList = result.voucherStatusList;
      result.fromdate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.todate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.TransactionReportForm.patchValue(result);

      this.currencyList = result.currencyList;
      this.decimalPlaces = result.currencyList.find(option => option.id === result.defaultCurrency).data2;

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        if (this.fixedAssetId > 0 || this.fixedAssetId) {
          this.SelectedAssest = this.fixedAssetId;
        }
        else {
          this.SelectedAssest = result.fixedAssetsId;
        }
        this.TransactionReportForm.get('voucherStatus').setValue(-1);
      });
    });
  }

  formatCurrency(value: number): string {
    return this.appCommonserviceService.formatCurrency(value, this.decimalPlaces);
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.clearTotals();
    /*     var fixedAssetId = this.SelectedAssest > 0 ? this.SelectedAssest : -1;
        var fixedAssetsTypeId = this.SelectedFixedAssetType > 0 ? this.SelectedFixedAssetType : -1;
        var locationId = this.SelectedLocation > 0 ? this.SelectedLocation : -1;
        var voucherTypeId = this.SelectedVoucherType > 0 ? this.SelectedVoucherType : -1;
        var voucherStatusId = this.SelectedVoucherStatus;
        var fromDate = this.TransactionReportForm.value.fromdate;
        var toDate =this.TransactionReportForm.value.todate;
        var note = this.TransactionReportForm.value.note ?? '';  */


    var fixedAssetId = this.TransactionReportForm.value.fixedAssetsId > 0 ? this.TransactionReportForm.value.fixedAssetsId : -1;
    var fixedAssetsTypeId = this.TransactionReportForm.value.fixedAssetsTypesId > 0 ? this.TransactionReportForm.value.fixedAssetsTypesId : -1;
    var locationId = this.TransactionReportForm.value.locationId > 0 ? this.TransactionReportForm.value.locationId : -1;
    var voucherTypeId = this.TransactionReportForm.value.voucherTypesId > 0 ? this.TransactionReportForm.value.voucherTypesId : -1;
    var voucherStatusId = this.SelectedVoucherStatus;
    var fromDate = this.TransactionReportForm.value.fromdate;
    var toDate = this.TransactionReportForm.value.todate;
    var note = this.TransactionReportForm.value.note ?? '';

    this.reportServiceService.GetTransactionSearch(
      fixedAssetId,
      fixedAssetsTypeId,
      locationId,
      voucherTypeId,
      voucherStatusId,
      fromDate,
      toDate,
      note)
      .subscribe((result) => {
        debugger
        this.voucherData = result;

        if (currentLang == "ar") {
          this.refreshTransactionReportArabic(this.voucherData);
        }
        else {
          this.refreshTransactionReportEnglish(this.voucherData);
        }

        for (let i = 0; i < this.voucherData.length; i++) {
          this.voucherData[i].total = this.formatCurrency(this.voucherData[i].total.toFixed(this.decimalPlaces));
        }


        /*   for (const row of this.voucherData) {
            this.Totaltr += Number(this.formatCurrency(parseFloat(row.total)));
  
          } */


        for (const row of this.voucherData) {
          // Ensure row.total is parsed as a float first
          const totalValue = parseFloat(row.total);
          // If the totalValue is NaN (not a number), skip the addition
          if (!isNaN(totalValue)) {
            this.Totaltr += totalValue; // Add the parsed total directly
          }
        }

      });
  }

  clearFormData() {
    this.voucherData = []; // Clear the table data
    this.clearTotals();
    const currentDate = new Date().toISOString().split('T')[0];
    this.TransactionReportForm.get('fromdate').setValue(currentDate);
    this.TransactionReportForm.get('todate').setValue(currentDate);
    this.TransactionReportForm.get('fixedAssetsId').setValue(0);
    this.TransactionReportForm.get('fixedAssetsTypesId').setValue(0);
    this.TransactionReportForm.get('locationId').setValue(0);
    this.TransactionReportForm.get('voucherTypesId').setValue(0);
    this.TransactionReportForm.get('voucherStatus').setValue(-1);
    this.TransactionReportForm.get('note').setValue('');
  }

  clearTotals() {
    this.Totaltr = 0;
  }

  detailsFixedAssetOperation(categoryId, voucherId, opType, showsave: boolean) {
    debugger
    opType = 'Show';
    showsave = true;

    if (categoryId === 99) {
      const url = `/AssetPurchaseInvoice/AssetPurchaseInvoiceForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    } else if (categoryId === 102) {
      const url = `/AssetSalesInvoice/AssetSalesInvoiceForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    } else if (categoryId === 107 || categoryId === 108 || categoryId === 109 || categoryId === 110) {
      const url = `/FixedAssetOperation/FixedAssetOperationForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    }
    else if (categoryId === 32) {
      const url = `/FixedAssetDepreciation/DepreciationForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    }



  }

  OpenDialogUpdate(categoryId, voucherId, opType, showsave: boolean) {
    debugger
    opType = 'Edit';
    showsave = false;

    if (categoryId === 99) {
      const url = `/AssetPurchaseInvoice/AssetPurchaseInvoiceForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    }
    else if (categoryId === 102) {
      const url = `/AssetSalesInvoice/AssetSalesInvoiceForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    }
    else if (categoryId === 107 || categoryId === 108 || categoryId === 109 || categoryId === 110) {
      const url = `/FixedAssetOperation/FixedAssetOperationForm?voucherId=${voucherId}&opType=${encodeURIComponent(opType)}&showsave=${showsave}`;
      window.open(url, '_blank');
    }
  }

  PrintDialog(categoryId, voucherId) {
    debugger
    if (categoryId === 99) {
      window.open("/AssetPurchaseInvoice/AssetPurchaseInvoiceSheet/" + voucherId, "PrintWindow",
        "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
    }
    else if (categoryId === 102) {
      window.open("/AssetSalesInvoice/AssetSalesInvoiceSheet/" + voucherId, "PrintWindow",
        "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
    }
    else if (categoryId === 107 || categoryId === 108 || categoryId === 109 || categoryId === 110) {
      window.open("/FixedAssetOperationList/FixedAssetOperationSheet/" + voucherId, "PrintWindow",
        "width=900,height=750,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=no");
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AssetTransactionReport');
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

  refreshTransactionReportArabic(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'الاصل': x.faName,
      'رقم السند': x.voucherNo,
      'نوع السند': x.voucherName,
      'التاريخ': x.voucherDate,
      'البيان': x.note,
      'العملة': x.currName,
      'سعر الصرف': x.currRate,
      'المبلغ': x.total.toFixed(3),
    }));
  }

  refreshTransactionReportEnglish(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Asest': x.faName,
      'Vocher Number': x.voucherNo,
      'Vocher Type': x.voucherName,
      'Date': x.voucherDate,
      'Statment': x.note,
      'Currency': x.currName,
      'Exchange Rate': x.currRate,
      'The Amount': x.total.toFixed(3),
    }));
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const totalAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.total), 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      // ابحث عن اسم عمود المجموع حسب اللغة
      const totalHeaderArabic = 'المبلغ';
      const totalHeaderEnglish = 'The Amount';
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
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];


    if (currentLang == "ar") {
       head = [['المبلغ', 'سعر الصرف', '  العملة', ' البيان', 'التاريخ ', 'نوع السند', ' رقم السند', ' الاصل']]
    }
    else {
       head = [['The Amount', 'Exchange Rate', 'Currency', 'Statment', 'Date', ' Vocher Type', 'Vocher Number', 'Asest']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount = 0;

    this.voucherData.forEach((part) => {
      let temp: (number | string)[] = [];
      temp[0] = part.faName
      temp[1] = part.voucherNo
      temp[2] = part.voucherName
      temp[3] = formatDate(part.voucherDate, 'yyyy-MM-dd', 'en_US')
      temp[4] = part.note
      temp[5] = part.currName
      temp[6] = part.currRate
      temp[7] = part.total

      totalAmount += parseFloat(part.total); // Accumulate total (make sure amount is a number)
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // reverse to match header order
    });

    // Prepare footer row (reverse the order like rows)
    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[6] = "المجموع";
      footRow[7] =this.formatCurrency(totalAmount);
      foot = [footRow.reverse()];
    }
    else {
      footRow[6] = "Total";
      footRow[7] = this.formatCurrency(totalAmount);
      foot = [footRow.reverse()];
    }


    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف عمليات الاصول " : "Transaction Report";
    const pageWidth = pdf.internal.pageSize.width;
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

}
