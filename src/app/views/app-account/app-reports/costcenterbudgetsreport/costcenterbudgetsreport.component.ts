import { Component,OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-costcenterbudgetsreport',
  templateUrl: './costcenterbudgetsreport.component.html',
  styleUrls: ['./costcenterbudgetsreport.component.scss']
})
export class CostcenterbudgetsreportComponent implements OnInit {
  costcenterbudgetsAddForm: FormGroup;
  selectedcostId: any;
  selectedbranch: any;
  selectedCur: any;
  selectedyear: any;
  costcenterList: any;
  userbranchList: any;
  currancyList: any;
  periodsList: any;
  fiscalyearList: any;
  accVoucherList: any;
  selectedstatus: number = -1;
  data: any[];

  currentLang = this.jwtAuth.getLang();
  chooseText = this.currentLang === 'en' ? 'Select one' : 'اختر';
  statusList: any;
  selectedmonth: number = 0;

  monthsList: { id: number; text: string }[] = [
    { id: 0, text: this.chooseText },    // ID 0 for "Choose"
    { id: 1, text: 'شهر 1' },    // ID 1 for "Posted"
    { id: 2, text: 'شهر 2' },  // ID 2 for "Unposted"
    { id: 3, text: 'شهر 3' },
    { id: 4, text: 'شهر 4' },
    { id: 5, text: 'شهر 5' },
    { id: 6, text: 'شهر 6' },
    { id: 7, text: 'شهر 7' },
    { id: 8, text: 'شهر 8' },
    { id: 8, text: 'شهر 9' },
    { id: 10, text: 'شهر 10' },
    { id: 11, text: 'شهر 11' },
    { id: 12, text: 'شهر 12' },
  ];

  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  isDisabled: boolean = true;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  tot3: number = 0;
  tot4: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  tot4Formatted: string = '0';
  totalFormatted: string = '0';
  showTotals: boolean = false;
  showfatheracc: boolean = false;
  showchildacc: boolean = false;
  isZeroBalnce: boolean = false;
  selectedYears: any[] = [];
  maxSelectionLimit = 2;
  yearId1: number;
  yearId2: number;
  isSelected: boolean = false;
  screenId: number = 124;
  custom: boolean;
  public TitlePage: string;

  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: ReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      private routePartsService: RoutePartsService,
      private router: Router,
      private egretLoader: AppLoaderService,
      private readonly serv: AppCommonserviceService,
    
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetBudgetsForm();
    this.GetBudgetsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetBudgetsForm() {
    debugger
    this.costcenterbudgetsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      costcenterId: [0],
      yearId: [0, [Validators.required, Validators.min(1)]],
      monthId: [this.selectedmonth],
      branchId: [0],
      status: [this.selectedstatus],
    });
  }

  GetBudgetsInitialForm() {
    this.ReportsService.GetCostCenterBudgetsForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.costcenterList = result.costCenterList;
      this.userbranchList = result.companyBranchList;
      this.fiscalyearList = result.fiscalYearsList;
      this.statusList = result.statusList;

      debugger
      this.costcenterbudgetsAddForm.patchValue(result);
      this.selectedstatus = -1;
      this.selectedmonth = 0;
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.costcenterbudgetsAddForm.get('costcenterId').setValue(0);
        this.selectedcostId = result.costcenterId;
        this.selectedbranch = result.branchId;
        this.isDisabled = true;
        // this.costcenterbudgetsAddForm.get("branchId").setValue(result.defaultBranchId);
       // this.costcenterbudgetsAddForm.get("status").setValue(-1);
        this.costcenterbudgetsAddForm.get("monthId").setValue(0);
        this.isPost = 1;
           var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.costcenterbudgetsAddForm.get('status').setValue(defaultStatus);
        debugger
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
      const formValues = this.costcenterbudgetsAddForm.value;
      this.costcenterbudgetsAddForm.value.status 
      //= this.selectedstatus;
      this.costcenterbudgetsAddForm.value.monthId = this.selectedmonth;

      if (Number.isNaN(formValues.costcenterId)  || formValues.costcenterId == undefined) {
        formValues.costcenterId = 0;
    }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetCostCenterBudgets(
        formValues.costcenterId,
        formValues.status,
        formValues.branchId,
        formValues.yearId,
        formValues.monthId,


      ).subscribe((result) => {
        debugger
    
        this.voucherData = result;

        if(currentLang == "ar"){
          this.refresCostcenterbudgetsreportArabic(this.voucherData);
         }
         else{
          this.refreshCostcenterbudgetsreportEnglish(this.voucherData);
         }   

        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('costcenterbudgets');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.costcenterbudgetsAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    //this.GetBudgetsInitialForm();
    this.clearTotals();
    this.costcenterbudgetsAddForm.get('costcenterId').setValue(0);
    this.costcenterbudgetsAddForm.get('yearId').setValue(0);
    this.costcenterbudgetsAddForm.get('status').setValue(0);
    this.costcenterbudgetsAddForm.get('monthId').setValue(0);
    this.costcenterbudgetsAddForm.get('branchId').setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;

    for (const row of this.voucherData) {
      const Sum1 = parseFloat(row.estimateAmount);
      const Sum2 = parseFloat(row.balance);
      const Sum3 = parseFloat(row.differenceAmount);
      const Sum4 = parseFloat(row.percentageValue);


      if (!isNaN(Sum1)) {
        this.tot1 += Sum1;
      }

      if (!isNaN(Sum2)) {
        this.tot2 += Sum2;
      }
      if (!isNaN(Sum3)) {
        this.tot3 += Sum3;
      }
      if (!isNaN(Sum4)) {
        this.tot4 += Sum4;
      }
    }
    this.tot1Formatted = this.formatWithCommas(this.tot1);
    this.tot2Formatted = this.formatWithCommas(this.tot2);
    this.tot3Formatted = this.formatWithCommas(this.tot3);
    this.tot4Formatted = this.formatWithCommas(this.tot4);
  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;
    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
    this.tot3Formatted = '0';
    this.tot4Formatted = '0';
    this.totalFormatted = '0';
  }

  OpenAccountStatementForm(costcentertId: number) {
    this.routePartsService.GuidToEdit = costcentertId;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetCostTransactionsForm?CostCenterNo=${costcentertId}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  Cleardata() {
    debugger
    this.voucherData = [];
    this.clearTotals();
    // this.GetReport()
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

  refresCostcenterbudgetsreportArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم مركز الكلفة': x.costcentertId,
      'اسم مركز الكلفة': x.costCenterName,
      'الفرع ': x.branchName,
      'القيمة التقديرية': x.estimateAmount,
      'القيمة الفعلية': x.balance,
      ' الفرق': x.differenceAmount,
      'النسبة(%)': x.percentageValue,
    }));
  }

  refreshCostcenterbudgetsreportEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Cost Center Number': x.costcentertId,
      'Cost Center Name': x.costCenterName,
      'Branch': x.branchName,
      'Estimate Amount': x.estimateAmount,
      'Actual Value': x.balance,
      'Difference Amount': x.differenceAmount,
      'percentage Value': x.percentageValue,
    }));
  }

  exportExcel1() {
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      // حساب المجاميع
      const totalEstimateAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.estimateAmount || 0), 0);
      const totalActualValue = this.voucherData.reduce((sum, item) => sum + parseFloat(item.balance || 0), 0);
      const totalDifferenceAmount = this.voucherData.reduce((sum, item) => sum + parseFloat(item.differenceAmount || 0), 0);
      const totalpercentageValue = this.voucherData.reduce((sum, item) => sum + (item.percentageValue || 0), 0);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'القيمة التقديرية': totalEstimateAmount,
          'القيمة الفعلية': totalActualValue,
          'الفرق': totalDifferenceAmount,
          'النسبة(%)': totalpercentageValue,
        }
        : {
          'Estimate Amount': totalEstimateAmount,
          'Actual Value': totalActualValue,
          'Difference Amount': totalDifferenceAmount,
          'percentage Value': totalpercentageValue,
        };

      // دالة لتحويل رقم العمود إلى حرف إكسل
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

      // حساب الصف الأخير
      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      // إدخال المجاميع في الأعمدة المناسبة
      headers.forEach((header, index) => {
        const trimmedHeader = header.trim(); // إزالة الفراغات من الاسم
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      // وضع التسمية "Total" أو "المجموع" في أول عمود
      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      // تحديث نطاق الورقة
      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      // إنشاء ملف الإكسل وتصديره
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

  exportPdf1() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
    let head: string[][];

    if(currentLang == "ar"){
         head = [['النسبة(%)','الفرق','القيمة الفعلية','القيمة التقديرية','الفرع','اسم مركز الكلفة','رقم مركز الكلفة']]    }
      else{
         head = [['percentage Value','Difference Amount','Actual Value','Estimate Amount','Branch','Cost Center Name','Cost Center Number']]
      }
    const rows: (number | string)[][] = [];

    // متغيرات المجاميع
    let totalEstimateAmount = 0;
    let totalActualValue = 0;
    let totalDifferenceAmount = 0;
    let totalpercentageValue = 0;

    // إنشاء الصفوف وجمع القيم
    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0]= part.costcentertId
      temp[1]= part.costCenterName 
      temp[2]= part.branchName
      temp[3]= part.estimateAmount
      temp[4]= part.balance 
      temp[5]= part.differenceAmount
      temp[6]= part.percentageValue

      totalEstimateAmount += parseFloat(part.estimateAmount) || 0;
      totalActualValue += parseFloat(part.balance) || 0;
      totalDifferenceAmount += parseFloat(part.differenceAmount) || 0;
      totalpercentageValue += parseFloat(part.percentageValue || 0) || 0;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp); // لعكس الأعمدة حسب اللغة
    });

    // عدد الأعمدة
    const columnCount = head[0].length;

    // إنشاء صف التذييل (footer row)
    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
      footRow[2] = "المجموع";
      footRow[3] = totalEstimateAmount.toFixed(2);     // مدين
      footRow[4] = totalActualValue.toFixed(2);
      footRow[5] = totalDifferenceAmount.toFixed(2);
      footRow[6] = totalpercentageValue.toFixed(2);
    } else {
      footRow[2] = "Total";
      footRow[3] = totalEstimateAmount.toFixed(2);     // مدين
      footRow[4] = totalActualValue.toFixed(2);
      footRow[5] = totalDifferenceAmount.toFixed(2);
      footRow[6] = totalpercentageValue.toFixed(2);
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ?  "تقرير الموازنة التقديرية لمراكز الكلف"
      : "Cost Center Budgets Report";

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
