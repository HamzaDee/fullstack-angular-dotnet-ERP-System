import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { SalesReportsService } from '../../salesreoprt.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { ComparisonSalesOfCategoryService } from '../comparison-sales-of-category.service';
import { Chart } from 'chart.js';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from 'assets/fonts/amiri'; 

@Component({
  selector: 'app-comparison-sales-of-category-or-item-by-years',
  templateUrl: './comparison-sales-of-category-or-item-by-years.component.html',
  styleUrls: ['./comparison-sales-of-category-or-item-by-years.component.scss']
})
export class ComparisonSalesOfCategoryOrItemByYearsComponent implements OnInit {
  public data: any[];
  public salesForm: FormGroup;
  public TitlePage: string;
  public screenId: number = 181;
  public custom: boolean;
  public exportData: any[];
  public exportColumns: any[];
  ItemsList: any;
  TypesList: any;
  public myChart: Chart;
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  decimalPlaces: number;
  loading: boolean;


  constructor(
    private title: Title,
    private translateService: TranslateService,
    private formbulider: FormBuilder,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private comparisonSalesOfCategoryService: ComparisonSalesOfCategoryService,
    private appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.SetTitlePage();

    this.salesForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      itemId: [0],
      categoryId: [0],
      salesId: [0],
    });
    this.GetSalesOfCategoryInitialForm();
  }

  onRadioChange(event: any): void {
    this.data = [];
    if (this.myChart) {
      this.myChart.destroy();
    }

    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
      }
    });

    debugger
    if (event == 0) {
      this.salesForm.value.salesId;
      this.salesForm.patchValue({ salesId: 0, categoryId: null });
    }
    else if (event == 1) {
      this.salesForm.value.salesId;
      this.salesForm.patchValue({ salesId: 1, itemId: null });
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ComparisonSalesOfCategoryOrItemByYears');
    this.title.setTitle(this.TitlePage);
  }

  GetSalesOfCategoryInitialForm() {
    debugger
    this.comparisonSalesOfCategoryService.GetSalesOfCategorReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.TypesList = result.typesList;
      this.ItemsList = result.itemsList;
      this.decimalPlaces = result.defaultCurrency;
      this.salesForm.patchValue(result);
    });
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appCommonserviceService.formatCurrencyNumber(value, decimalPlaces);
  }

  GetReport() {
    debugger
    const itemId = this.salesForm.value.itemId ?? 0;
    const categoryId = this.salesForm.value.categoryId ?? 0;

    // Check if neither or both dropdown lists are selected
    if ((itemId <= 0 && categoryId <= 0) || (itemId > 0 && categoryId > 0)) {
      this.alert.ShowAlert("msgChoose", 'error');
      return;
    }


    this.data = [];
    if (this.myChart) {
      this.myChart.destroy();
    }

    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
      }
    });
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    const formValues = this.salesForm.value;
    this.comparisonSalesOfCategoryService.GetFiltercomparisonSalesOfCategory(itemId, categoryId).subscribe((result) => {
      debugger

      this.data = result;
      if (currentLang == "ar") {
        this.refreshSalesOfCategoryArabic(this.data);
      }
      else {
        this.refreshSalesOfCategoryEnglish(this.data);
      }

      this.GetChart();

    });
  }

  clearFormData() {
    this.data = [];
    this.salesForm.patchValue({ salesId: 0, itemId: null });
    this.salesForm.get('itemId').setValue(0);
    this.salesForm.get('categoryId').setValue(0);

    if (this.myChart) {
      this.myChart.destroy();
    }

    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
      }
    });
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

  refreshSalesOfCategoryArabic(data) {
    this.exportData = data;
    this.exportData = this.exportData.map(x => ({
      'السنة': x.year,
      '1': x.january,
      '2': x.february,
      '3': x.march,
      '4': x.april,
      '5': x.may,
      '6': x.june,
      '7': x.july,
      '8': x.august,
      '9': x.september,
      '10': x.october,
      '11': x.november,
      '12': x.december,
      'المجموع': x.totalYearlyAmount,
    }));
  }

  refreshSalesOfCategoryEnglish(data) {
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Period Fiscal Year': x.year,
      '1': x.january,
      '2': x.february,
      '3': x.march,
      '4': x.april,
      '5': x.may,
      '6': x.june,
      '7': x.july,
      '8': x.august,
      '9': x.september,
      '10': x.october,
      '11': x.november,
      '12': x.december,
      'Total': x.totalYearlyAmount,
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


      const totalmonth1 = this.data.reduce((sum, item) => sum + parseFloat(item.january?.toString().trim() || "0"), 0);
      const totalmonth2 = this.data.reduce((sum, item) => sum + parseFloat(item.february?.toString().trim() || "0"), 0);
      const totalmonth3 = this.data.reduce((sum, item) => sum + parseFloat(item.march?.toString().trim() || "0"), 0);
      const totalmonth4 = this.data.reduce((sum, item) => sum + parseFloat(item.april?.toString().trim() || "0"), 0);
      const totalmonth5 = this.data.reduce((sum, item) => sum + parseFloat(item.may?.toString().trim() || "0"), 0);
      const totalMonth6 = this.data.reduce((sum, item) => sum + parseFloat(item.june?.toString().trim() || "0"), 0);
      const totalmonth7 = this.data.reduce((sum, item) => sum + parseFloat(item.july?.toString().trim() || "0"), 0);
      const totalmonth8 = this.data.reduce((sum, item) => sum + parseFloat(item.august?.toString().trim() || "0"), 0);
      const totalmonth9 = this.data.reduce((sum, item) => sum + parseFloat(item.september?.toString().trim() || "0"), 0);
      const totalmonth10 = this.data.reduce((sum, item) => sum + parseFloat(item.october?.toString().trim() || "0"), 0);
      const totalmonth11 = this.data.reduce((sum, item) => sum + parseFloat(item.november?.toString().trim() || "0"), 0);
      const totalmonth12 = this.data.reduce((sum, item) => sum + parseFloat(item.december?.toString().trim() || "0"), 0);
      const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.totalYearlyAmount?.toString().trim() || "0"), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';
      const fieldMap = isArabic
        ? {
          '1': totalmonth1,
          '2': totalmonth2,
          '3': totalmonth3,
          '4': totalmonth4,
          '5': totalmonth5,
          '6': totalMonth6,
          '7': totalmonth7,
          '8': totalmonth8,
          '9': totalmonth9,
          '10': totalmonth10,
          '11': totalmonth11,
          '12': totalmonth12,
          'المجموع': totalAmount,
        }
        : {
          '1': totalmonth1,
          '2': totalmonth2,
          '3': totalmonth3,
          '4': totalmonth4,
          '5': totalmonth5,
          '6': totalMonth6,
          '7': totalmonth7,
          '8': totalmonth8,
          '9': totalmonth9,
          '10': totalmonth10,
          '11': totalmonth11,
          '12': totalmonth12,
          'Total': totalAmount,
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
       head = [['المجموع', ' 12', '11', '10', '9', ' 8', '7', '6', '5', '4', '3', '2', '1', 'السنة']]
    }
    else {
       head = [['Total', ' 12', '11', '10', '9', ' 8', '7', '6', '5', '4', '3', '2', '1', 'Period Fiscal Year']]
    }

    const rows: (number | string)[][] = [];
    let totalmonth1 = 0;
    let totalmonth2 = 0;
    let totalmonth3 = 0;
    let totalmonth4 = 0;
    let totalmonth5 = 0;
    let totalMonth6 = 0;
    let totalmonth7 = 0;
    let totalmonth8 = 0;
    let totalmonth9 = 0;
    let totalmonth10 = 0;
    let totalmonth11 = 0;
    let totalmonth12 = 0;
    let totalAmount = 0;

    this.data.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.year,
        temp[1] = part.january,
        temp[2] = part.february,
        temp[3] = part.march,
        temp[4] = part.april,
        temp[5] = part.may,
        temp[6] = part.june,
        temp[7] = part.july,
        temp[8] = part.august,
        temp[9] = part.september,
        temp[10] = part.october,
        temp[11] = part.november,
        temp[12] = part.december,
        temp[13] = part.totalYearlyAmount,


      totalmonth1 += parseFloat(part.january) || 0;
      totalmonth2 += parseFloat(part.february) || 0;
      totalmonth3 += parseFloat(part.march) || 0;
      totalmonth4 += parseFloat(part.april) || 0;
      totalmonth5 += parseFloat(part.may) || 0;
      totalMonth6 += parseFloat(part.june) || 0;
      totalmonth7 += parseFloat(part.july) || 0;
      totalmonth8 += parseFloat(part.august) || 0;
      totalmonth9 += parseFloat(part.september) || 0;
      totalmonth10 += parseFloat(part.october) || 0;
      totalmonth11 += parseFloat(part.november) || 0;
      totalmonth12 += parseFloat(part.december) || 0;
      totalAmount += parseFloat(part.totalYearlyAmount) || 0;
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
      footRow[1] = totalmonth1.toFixed(2);
      footRow[2] = totalmonth2.toFixed(2);
      footRow[3] = totalmonth3.toFixed(2);
      footRow[4] = totalmonth4.toFixed(2);
      footRow[5] = totalmonth5.toFixed(2);
      footRow[6] = totalMonth6.toFixed(2);
      footRow[7] = totalmonth7.toFixed(2);
      footRow[8] = totalmonth8.toFixed(2);
      footRow[9] = totalmonth9.toFixed(2);
      footRow[10] = totalmonth10.toFixed(2);
      footRow[11] = totalmonth11.toFixed(2);
      footRow[12] = totalmonth12.toFixed(2);
      footRow[13] = totalAmount.toFixed(2);

    } else {
      footRow[0] = "المجموع";
      footRow[1] = totalmonth1.toFixed(2);
      footRow[2] = totalmonth2.toFixed(2);
      footRow[3] = totalmonth3.toFixed(2);
      footRow[4] = totalmonth4.toFixed(2);
      footRow[5] = totalmonth5.toFixed(2);
      footRow[6] = totalMonth6.toFixed(2);
      footRow[7] = totalmonth7.toFixed(2);
      footRow[8] = totalmonth8.toFixed(2);
      footRow[9] = totalmonth9.toFixed(2);
      footRow[10] = totalmonth10.toFixed(2);
      footRow[11] = totalmonth11.toFixed(2);
      footRow[12] = totalmonth12.toFixed(2);
      footRow[13] = totalAmount.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);


    const title = currentLang === "ar" ? "كشف مقارنة مبيعات صنف او مادة حسب السنوات " : "Comparison Sales Of Category Or Item By Years"
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

  GetChart() {
    debugger;
    const xAxis = this.months;
    const datasets = [];
    const colors = ['#1a389f', '#808080', '#008000', '#ff0000', '#ffa500'];
    // Loop through each year's data
    for (let i = 0; i < this.data.length; i++) {
      const salesData = this.data[i];
      const yAxis = [
        salesData.january,
        salesData.february,
        salesData.march,
        salesData.april,
        salesData.may,
        salesData.june,
        salesData.july,
        salesData.august,
        salesData.september,
        salesData.october,
        salesData.november,
        salesData.december
      ];

      datasets.push({
        label: `Year ${salesData.year}`, // Assuming salesData contains a 'year' property
        data: yAxis,
        backgroundColor: colors[i % colors.length],
        borderWidth: 1,
      });
    }
    this.myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: xAxis,
        datasets: datasets
      },
      options: {
        scales: {
          y: {
            ticks: {
              font: {
                family: 'ArFont', // Font family
              }
            },
            title: { // Replaces 'scaleLabel'
              display: true,
              text: '', // Use 'text' instead of 'labelString'
              font: {
                family: 'ArFont', // Font family
                size: 20, // Font size
                weight: 'bold' // Font style
              },
              color: '#2B1B17' // Replaces 'fontColor'
            }
          },
          x: {
            beginAtZero: true,
            ticks: {
              display: true,
              font: {
                family: 'ArFont' // Font family for x axis ticks
              }
            },
            title: { // Replaces 'scaleLabel'
              display: true,
              text: 'الكميات المباعه', // Use 'text' instead of 'labelString'
              font: {
                family: 'ArFont', // Font family
                size: 20, // Font size
                weight: 'bold' // Font style
              },
              color: '#2B1B17' // Replaces 'fontColor'
            }
          }
        }
      }
    });
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
}
