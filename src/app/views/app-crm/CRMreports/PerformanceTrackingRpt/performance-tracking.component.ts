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
import { AmiriRegular } from 'assets/fonts/amiri';
import { CRMReportsService } from '../crm-reports.service';

@Component({
  selector: 'app-performance-tracking',
  templateUrl: './performance-tracking.component.html',
  styleUrl: './performance-tracking.component.scss'
})
export class PerformanceTrackingComponent implements OnInit {
  public TitlePage: string;
  PerformanceTrackingForm: FormGroup;
  screenId: number = 300;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];
  Data: any;
  employeesList: any;
  branchesList: any;
  decimalPlaces: number;
  voucherData:any;
  loading: boolean;

  //#region Totals
    leadsTot:number = 0;
    opportunitiesTot:number = 0;
    wonDealsTot:number = 0;
    salesAmountTot:number = 0;

    strLeadsTot:string = '';
    strOpportunitiesTot:string = '';
    strWonDealsTot:string = '';
    stSalesAmountTot:string = '';
  //#endregion

  constructor(
    private readonly title: Title,
    private readonly translateService: TranslateService,
    private readonly formbulider: FormBuilder,
    private readonly alert: sweetalert,
    private readonly jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private readonly egretLoader: AppLoaderService,
    private readonly route: ActivatedRoute,
    private readonly serv: CRMReportsService,
    private readonly appCommonserviceService: AppCommonserviceService) { }

  ngOnInit(): void {
    this.PerformanceTrackingForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromdate: [''],
      todate: [''],
      employeeId:[0],
      branchId:[0],
    });

    this.GetPerformanceTrackingForm();
    this.SetTitlePage();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('PerformanceTrackingPerBranch');
    this.title.setTitle(this.TitlePage);
  }

  GetPerformanceTrackingForm() {
    debugger
    this.serv.GetPerformanceTrackingForm().subscribe((result) => {
      debugger
      if(!result.isSuccess  && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      result.fromdate = formatDate(result.fromdate, "yyyy-MM-dd", "en-US");
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US");
      this.employeesList = result.employeesList;
      this.branchesList = result.branchesList;
      this.decimalPlaces = 3;             
      this.PerformanceTrackingForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.PerformanceTrackingForm.get("employeeId").setValue(0);
        this.PerformanceTrackingForm.get("branchId").setValue(0);
        const currentYear = new Date().getFullYear();
        const januaryFirst = new Date(currentYear, 0, 1);
        const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
        const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
        this.PerformanceTrackingForm.get('fromdate').setValue(dddate);
        this.PerformanceTrackingForm.get("todate").setValue(result.todate);
        this.clearFormData();
      });
    });
  }

  GetReport() {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger
      const formValues = this.PerformanceTrackingForm.value;        
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.serv.GetPerformanceTrackingReport(
        formValues.branchId,
        formValues.employeeId,
        formValues.fromdate,
        formValues.todate,    
      ).subscribe((result) => {
        debugger
  
        this.voucherData = result;

        if (this.voucherData.length > 0) {
          this.calcultevalues(); // ✅ FIRST calculate totals
        }

       const isArabic = currentLang?.toLowerCase().startsWith('ar');
        if (isArabic) {
          this.refreshPerformanceTrackingArabic(this.voucherData);
        } else {
          this.refreshPerformanceTrackingEnglish(this.voucherData);
        }

        this.egretLoader.close();

      });
    });

  }

  calcultevalues()
  {

    this.leadsTot = 0 ;
    this.opportunitiesTot = 0 ;
    this.wonDealsTot = 0 ;
    this.salesAmountTot = 0 ;
    this.strLeadsTot = '' ;
    this.strOpportunitiesTot = '' ;
    this.strWonDealsTot = '' ;
    this.stSalesAmountTot = '' ;

    for (let r = 0; r < this.voucherData.length; r++) {
        debugger
        this.leadsTot += Number(this.voucherData[r].leadsCount);
        this.opportunitiesTot += Number(this.voucherData[r].opportunitiesCount);
        this.wonDealsTot += Number(this.voucherData[r].wonDeals);  
        this.salesAmountTot += Number(this.voucherData[r].salesAmount);       
      }

      debugger    
      this.strLeadsTot = this.leadsTot.toString();
      this.strOpportunitiesTot = this.opportunitiesTot.toString();
      this.strWonDealsTot = this.wonDealsTot.toString();
      this.stSalesAmountTot = this.appCommonserviceService.formatCurrencyNumber(this.salesAmountTot);
  }

  clearTotals()
  {
    this.leadsTot = 0 ;
    this.opportunitiesTot = 0 ;
    this.wonDealsTot = 0 ;
    this.salesAmountTot = 0 ;
    this.strLeadsTot = '0' ;
    this.strOpportunitiesTot = '0' ;
    this.strWonDealsTot = '0' ;
    this.stSalesAmountTot = '0' ;
  }
  
  clearFormData() {
    debugger
    this.PerformanceTrackingForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const januaryFirst = new Date(currentYear, 0, 1);
    const formattedDate = `${('0' + (januaryFirst.getMonth() + 1)).slice(-2)}/${('0' + januaryFirst.getDate()).slice(-2)}/${januaryFirst.getFullYear()}`;
    const dddate = formatDate(formattedDate, "yyyy-MM-dd", "en-US");
    this.PerformanceTrackingForm.get('fromdate').setValue(dddate);
    this.PerformanceTrackingForm.get('todate').setValue(currentDate);
    this.Data = []; // Clear the table data
    this.voucherData = [];
    this.PerformanceTrackingForm.get('employeeId').setValue(0);
    this.PerformanceTrackingForm.get('branchId').setValue(0); 
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

  refreshPerformanceTrackingArabic(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'الفرع': x.branchName,
      'عدد العملاء المحتملون': x.leadsCount,
      'عدد فرص البيع': x.opportunitiesCount,
      'الصفقات الرابحة': x.wonDeals,
      'قيمة  البيع': x.salesAmount.toFixed(3),
      'معدل النجاح': x.conversionRate,
    }));
  }

  refreshPerformanceTrackingEnglish(data) {
    this.Data = data;
    this.exportData = this.Data.map(x => ({
      'Branch': x.branchName,
      'Leads Count': x.leadsCount,
      'Opportunities Count': x.opportunitiesCount,
      'Won Deals': x.wonDeals,
      'Sales Amount': x.salesAmount,
      'Completion Rate': x.conversionRate,
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


      // const totalSales = this.leadsTot;//this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalSales?.toString().trim() || "0"), 0);
      // const totalsalesTaxAmount = this.opportunitiesTot;//this.voucherData.reduce((sum, item) => sum + parseFloat(item.salesTaxAmount?.toString().trim() || "0"), 0);
      // const totalReturn = this.wonDealsTot;//this.voucherData.reduce((sum, item) => sum + parseFloat(item.totalReturn?.toString().trim() || "0"), 0);
      // const totalretSalesTaxAmount =this.salesAmountTot; //this.voucherData.reduce((sum, item) => sum + parseFloat(item.retSalesTaxAmount?.toString().trim() || "0"), 0);


      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'عدد العملاء المحتملون': this.leadsTot,
          'عدد فرص البيع': this.opportunitiesTot,
          'الصفقات الرابحة': this.wonDealsTot,
          'قيمة البيع': this.salesAmountTot,
        }
        : {
          'Leads Count': this.leadsTot,
          'Opportunities Count': this.opportunitiesTot,
          'Won Deals': this.wonDealsTot,
          'Sales Amount': this.salesAmountTot,
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
       head = [['معدل النجاح','قيمة البيع','الصفقات الرابحة','عدد فرص البيع','عدد العملاء المحتملون','الفرع']]
    }
    else {
       head = [['Completion Rate','Sales Amount','Won Deals','Opportunities Count','Leads Count','Branch']]
    }
    const rows: (number | string)[][] = [];
    let totalSales = 0;
    let totalsalesTaxAmount = 0;
    let totalReturn = 0;
    let totalretSalesTaxAmount = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.branchName;
      temp[1] = part.leadsCount;
      temp[2] = part.opportunitiesCount;
      temp[3] = part.wonDeals;
      temp[4] = part.salesAmount.toFixed(3);
      temp[5] = part.conversionRate;

      // totalSales += parseFloat(part.totalSales) || 0;
      // totalsalesTaxAmount += parseFloat(part.salesTaxAmount) || 0;
      // totalReturn += parseFloat(part.totalReturn) || 0;
      // totalretSalesTaxAmount += parseFloat(part.retSalesTaxAmount) || 0;
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
      footRow[1] = this.leadsTot;
      footRow[2] = this.opportunitiesTot;
      footRow[3] = this.wonDealsTot;
      footRow[4] = this.salesAmountTot.toFixed(3);
    } else {
      footRow[0] = "Total";
      footRow[1] = this.leadsTot;
      footRow[2] = this.opportunitiesTot;
      footRow[3] = this.wonDealsTot;
      footRow[4] = this.salesAmountTot.toFixed(3);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "تقرير تتبع الأداء لكل فرع" :"Performance Tracking Report For Each Branch";
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

