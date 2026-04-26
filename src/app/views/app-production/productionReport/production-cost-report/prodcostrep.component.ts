import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ProductionReportService } from '../../productionReport/production-report.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-prodcostrep',
  templateUrl: './prodcostrep.component.html',
  styleUrl: './prodcostrep.component.scss'
})
export class ProdcostrepComponent implements OnInit {
  ProducedMaterialsAddForm: FormGroup;
  ProductionCostForm: FormGroup;
  reportData: any[];
  itemsList: any[];
  DateNow: Date = new Date();
  showLoader = false;
  TitlePage: string;
  totalCost: number = 0;
  exportData: any[];
  screenId: number = 276;
  custom: boolean;
  data: any[];
  voucherData: any[];
  loading: boolean;
  fromDate: string;
  rawMaterialCostTot: any;
  WorkCentersCostTot: any;
  OverheadCostTot: any;
  TotalCostTot: any;
  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private service: ProductionReportService,
    private alert: sweetalert,
    public ValidatorsService: ValidatorsService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private appCommonserviceService: AppCommonserviceService,
    private cdr: ChangeDetectorRef,
    private title: Title


  ) { }


  ngOnInit(): void {
    this.setTitlePage();
    this.initForm();
    this.loadInitialData();
  }

  initForm() {
    this.ProductionCostForm = this.formBuilder.group({
      Lang: [0],
      companyId: [0],
      itemId: [0],
      voucherId: [""],
      fromDate: [""],
      toDate: [""],
    });
  }

  loadInitialData() {
    this.service.GetProductionCostReportForm().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.ProductionCostForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
      this.ProductionCostForm.get("toDate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));
      this.itemsList = result.itemsList;
    });
  }

  setTitlePage() {
    this.TitlePage = this.translateService.instant('DetectionOfProductionCosts');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.ProductionCostForm.reset();

    this.ProductionCostForm.get("fromDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
    this.ProductionCostForm.get("toDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
    this.ProductionCostForm.get("itemId").setValue(0);
    this.voucherData = [];

    this.CalcTotals();
    this.loadInitialData();
  }


  getdata() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';



    const formValues = this.ProductionCostForm.value;
    if (formValues.voucherId == "" || formValues.voucherId == undefined || formValues.voucherId == null) {
      formValues.voucherId = 0;
    }
    this.service.ProductionCostDataModel(

      formValues.fromDate,
      formValues.toDate,
      formValues.itemId ?? 0,
      formValues.voucherId ?? 0,


    ).subscribe((result) => {
      debugger
      this.voucherData = result;
      this.CalcTotals();
      if (currentLang == "ar") {
        this.refresItemsTransArabic(this.voucherData);
      }
      else {
        this.refreshItemsTransEnglish(this.voucherData);
      }
    }

    );
  }

  CalcTotals() {
    debugger
    this.rawMaterialCostTot = 0;
    this.WorkCentersCostTot = 0;
    this.OverheadCostTot = 0;
    this.TotalCostTot = 0;
    for (const row of this.voucherData) {
      const input = parseFloat(row.rawMaterialCost);
      const input2 = parseFloat(row.workCentersCost);
      const input3 = parseFloat(row.overheadCost);
      const input4 = parseFloat(row.totalCost);

      if (!isNaN(input)) {
        this.rawMaterialCostTot += input;
      }
      if (!isNaN(input2)) {
        this.WorkCentersCostTot += input2;
      }
      if (!isNaN(input3)) {
        this.OverheadCostTot += input3;
      }
      if (!isNaN(input4)) {
        this.TotalCostTot += input4;
      }
    }
  }

  ShowProductionVoucher(VoucherId) {
    this.routePartsService.GuidToEdit = VoucherId
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    var url = `/ProductionVoucher/ProdVoucherForm?GuidToEdit=${VoucherId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
    window.open(url, '_blank');

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

  refresItemsTransArabic(voucherData) {
    debugger
    this.data = voucherData;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.orderNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': orderDate,
        ' رقم المادة': x.itemNo,
        'المادة المنتجة': x.itemNameA,
        'الكمية المنتجة الفعلية': x.producedQty,
        'التكلفة الموادالخام': x.rawMaterialCost,
        'تكاليف مراحل الانتاج': x.workCentersCost,
        'تكاليف اخرى': x.overheadCost,
        'الاجمالي': x.totalCost,
      }
    });
  }

  refreshItemsTransEnglish(voucherData) {
    debugger
    this.data = voucherData;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('en-GB');
      return {
        ' VoucherNo': x.orderNo,
        ' VoucherType': x.voucherName,
        'VoucherDate ': orderDate,
        ' materialNumber': x.itemNo,
        ' ProductedItem': x.itemNameA,
        ' ActualProducedQuantity ': x.producedQty,
        'CostOfRawMaterials ': x.rawMaterialCost,
        ' CostsOfproductionStages ': x.workCentersCost,
        ' OtherCosts': x.overheadCost,
        'Totals': x.totalCost,
      }
    });
  }


  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      const totalLabel = currentLang == "ar" ? "المجموع" : "Total";
      let totalRaw = 0;
      let totalStages = 0;
      let totalOther = 0;
      let totalFinal = 0;

      this.data.forEach(row => {

        totalRaw += parseFloat(row.rawMaterialCost) || 0;
        totalStages += parseFloat(row.workCentersCost) || 0;
        totalOther += parseFloat(row.overheadCost) || 0;
        totalFinal += parseFloat(row.totalCost) || 0;
      });


      const headers = Object.keys(this.exportData[0]);


      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;


      const values = [

        '', '', '', '', '',
        totalLabel,
        totalRaw,
        totalStages,
        totalOther,
        totalFinal
      ];

      values.forEach((val, i) => {
        const colLetter = getExcelColumnLetter(i);
        const cell = colLetter + lastRow;
        worksheet[cell] = { t: typeof val === 'number' ? 'n' : 's', v: val };
      });


      worksheet['!ref'] = xlsx.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: lastRow, c: headers.length - 1 }
      });

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "products");
    });

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
       head = [[' الاجمالي', 'تكاليف اخرى', ' تكاليف مراحل الانتاج', 'تكلفة المواد الخام', 'الكمية المنتجة الفعليه', '  المادة المنتجة', ' رقم المادة', ' تاريخ السند', 'نوع السند', ' رقم السند']]
    }
    else {
       head = [['Total', 'Other Costs', 'Production Stage Costs', 'Raw Material Cost', 'Actual Produced Quantity', 'Item Number', 'Voucher Date', 'Voucher Type', 'Voucher Number']]
    }

    const rows: (number | string)[][] = [];
    let totalAmount1 = 0;
    let totalAmount2 = 0;
    let totalAmount3 = 0;
    let totalAmount4 = 0;

    this.voucherData.forEach((part) => {

      const date = new Date(part.orderDate);
      const orderDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.orderNo
      temp[1] = part.voucherName
      temp[2] = orderDate
      temp[3] = part.itemNo
      temp[4] = part.itemNameA
      temp[5] = part.producedQty
      temp[6] = part.rawMaterialCost
      temp[7] = part.workCentersCost
      temp[8] = part.overheadCost
      temp[9] = part.totalCost

      totalAmount1 += part.rawMaterialCost
      totalAmount2 += part.workCentersCost
      totalAmount3 += part.overheadCost
      totalAmount4 += part.totalCost

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });


    const columnCount = head[0].length;
    let footRow: (string | number)[] = new Array(columnCount).fill(''); // assuming 10 columns
    let foot;

    if (currentLang == "ar") {
      footRow[6] = "المجموع";
      footRow[7] = totalAmount1;
      footRow[8] = totalAmount2;
      footRow[9] = totalAmount3;
      footRow[10] = totalAmount4;

      foot = [footRow.reverse()];

    }
    else {
      footRow[10] = "Total";
      footRow[7] = totalAmount1;
      footRow[8] = totalAmount2;
      footRow[9] = totalAmount3;
      footRow[10] = totalAmount4;
      foot = [footRow.reverse()];
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "كشف تكاليف الانتاج" : "Discovery of production costs ";
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

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appCommonserviceService.formatCurrency(value, decimalPlaces);
  }

  fillValue(event) {
    if (event.value > 0) {
      debugger
      const selectedItem = this.voucherData.find(r => r.id == event.value);
      const selectedText = selectedItem ? selectedItem.text : '';
      this.voucherData = selectedText;
    }
    else {
      this.voucherData;
    }
  }

  loadLazyOptions(event: any) {
    debugger
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.itemsList) {
      this.itemsList = [];
    }

    // Make sure the array is large enough
    while (this.itemsList.length < last) {
      this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
  }

}