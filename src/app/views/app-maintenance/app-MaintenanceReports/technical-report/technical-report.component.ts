import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { PurchaseReportService } from 'app/views/app-purchase/Purchase-Reports/purchase-report.service';
import { sweetalert } from 'sweetalert';
import { MaintReportsService } from '../maintenanceRep.service';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from 'assets/fonts/amiri';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { formatDate } from '@angular/common';
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-technical-report',
  templateUrl: './technical-report.component.html',
  styleUrl: './technical-report.component.scss'
})
export class TechnicalReportComponent {
  public TitlePage: string;
  screenId: number = 306;
  custom: boolean;
  TechnicalReportForm: FormGroup;
  public Data: any[];
  exportData: any[];
  loading: boolean;
  inorderList: any;
  requestOrderList: any;
  statusList: any;
  prioritiesList: any;
  FromDate : any;
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot1: number = 0;
  tot2: number = 0;
  total: number = 0;


  constructor(private title: Title,
    private purchaseReportService: PurchaseReportService,
    private formbulider: FormBuilder,
    private egretLoader: AppLoaderService,
    private serv: AppCommonserviceService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private MaintReportsService: MaintReportsService,
  private appCommonserviceService: AppCommonserviceService,) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.TechnicalReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      inorder: [null],
      reqOrderId: [null],
      status: [null],
      priorityId: [null],
    });

    this.GetMaintenanceTechnicalReportForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('TechnicalReport');
    this.title.setTitle(this.TitlePage);
  }

  GetMaintenanceTechnicalReportForm() {

    this.MaintReportsService.GetMaintenanceTechnicalReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.FromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      this.inorderList = result.inorderList;
      this.requestOrderList = result.requestOrderList;
      this.statusList = result.statusList;
      this.prioritiesList = result.prioritiesList;
      this.TechnicalReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.TechnicalReportForm.get("inorder")?.setValue(-1);
        this.TechnicalReportForm.get("reqOrderId")?.setValue(0);
        this.TechnicalReportForm.get("status")?.setValue(0);
        this.TechnicalReportForm.get("priorityId")?.setValue(0);
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    this.Data = [];
    const formValues = this.TechnicalReportForm.value;
    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
    this.MaintReportsService.GetMaintenanceOrderReport(
      formValues.fromDate,
      formValues.toDate,
      formValues.inorder,
      formValues.reqOrderId,
      formValues.priorityId,
      formValues.status,
    ).subscribe({
      next: (result) => {
        this.Data = result;
         this.calcultevalues();

        if (currentLang == "ar") {
          this.refresMaintenanceOrderArabic(this.Data);
        }
        else {
          this.refreshMaintenanceOrderEnglish(this.Data);
        }

      },
      error: (err) => {
        console.error(err);
        this.alert.ShowAlert("Error loading data", "error");
      },
      complete: () => {
        this.egretLoader.close();
      }
    });
  }

  calcultevalues() {
    debugger;
    this.tot1 = 0;
    this.tot2 = 0;
    this.total = 0;

    for (const row of this.Data) {
      const workHours = parseFloat(row.workHours);
      const workCost = parseFloat(row.workCost);

      if (!isNaN(workHours)) {
        this.tot1 += parseFloat(workHours.toFixed(3)); // Round to 3 decimals before adding
      }

      if (!isNaN(workCost)) {
        this.tot2 += parseFloat(workCost.toFixed(3)); // Round to 3 decimals before adding
      }
    }

    this.total = this.tot1 - this.tot2;

    // Round to 3 decimal digits
    const tot1Rounded = parseFloat(this.tot1.toFixed(3));
    const tot2Rounded = parseFloat(this.tot2.toFixed(3));
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(tot1Rounded);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(tot2Rounded);
  }


  clearFormData() {
    debugger
    this.Data = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.TechnicalReportForm.get('fromDate').setValue(this.FromDate);
    this.TechnicalReportForm.get('toDate').setValue(currentDate);
    this.TechnicalReportForm.get("inorder")?.setValue(-1);
    this.TechnicalReportForm.get("reqOrderId")?.setValue(0);
    this.TechnicalReportForm.get("status")?.setValue(0);
    this.TechnicalReportForm.get("priorityId")?.setValue(0);
    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
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

  getFavouriteStatus(screenId) {
    debugger
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
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

  refresMaintenanceOrderArabic(data) {
    debugger
    this.exportData = data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      const visitDate = new Date(x.visitDate).toLocaleDateString('ar-EG');
      return {
        'رقم الطلب': x.orderNo,
        'تاريخ الطلب': orderDate,
        'نوع الطلب': x.requestSource,
        'طلب صيانة': x.maintenanceOrderName,
        'الوصف': x.description,
        'عدد الفنيين': x.techniciansNo,
        'عدد الساعات': x.workHours,
        'كلفه الصيانة': x.workCost,
        'تاريخ الزيارة': visitDate,
        'ملاحظات': x.note,
        'الحالة':x.statusName,
      }
    });
  }

  refreshMaintenanceOrderEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('en-EG');
      const visitDate = new Date(x.visitDate).toLocaleDateString('ar-EG');
      return {
        'Order Number': x.orderNo,
        'Order Date': orderDate,
        'Order Type': x.requestSource,
        'Maintenance Order': x.maintenanceOrderName,
        'Description': x.description,
        'Technicians Number': x.techniciansNo,
        'Work Hours': x.workHours,
        'Work Cost': x.workCost,
        'Visit Date': visitDate,
        'Notes': x.note,
        'Status Name': x.statusName,
      }
    });
  }

exportExcel(dt: any) {
  import("xlsx").then(xlsx => {

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    // =========================
    // ✅ حساب المجاميع
    // =========================
    let totalWorkHours = 0;
    let totalWorkCost = 0;

    this.exportData.forEach(x => {
      totalWorkHours += Number(x['Work Hours'] || x['عدد الساعات']) || 0;
      totalWorkCost += Number(x['Work Cost'] || x['كلفه الصيانة']) || 0;
    });

    const worksheet = xlsx.utils.json_to_sheet(this.exportData);

    const headers = Object.keys(this.exportData[0]);
    const title = isArabic ? "كشف تقرير التقني" : "Maintenance Technical Report";

    // 👇 تحويل إلى array
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // =========================
    // ✅ صف المجموع
    // =========================
    const totalRow: any[] = new Array(headers.length).fill('');

    if (isArabic) {
      totalRow[0] = 'المجموع';
      totalRow[6] = totalWorkHours;   // عدد الساعات
      totalRow[7] = totalWorkCost;    // كلفة الصيانة
    } else {
      totalRow[0] = 'Total';
      totalRow[6] = totalWorkHours;
      totalRow[7] = totalWorkCost;
    }

    // 👇 إضافة البيانات + الصف النهائي
    data.unshift([]);
    data.unshift([title]);
    data.push(totalRow);

    // 👇 إنشاء شيت جديد
    const newWorksheet = xlsx.utils.aoa_to_sheet(data as any[][]);

    // 👇 دمج عنوان التقرير
    newWorksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
    ];

    // 👇 تنسيق العنوان
    if (newWorksheet['A1']) {
      newWorksheet['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    const workbook = {
      Sheets: { 'data': newWorksheet },
      SheetNames: ['data']
    };

    const excelBuffer: any = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

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

  if (isArabic) {
    head = [[
      'الحالة','ملاحظات','تاريخ الزيارة','كلفه الصيانة','عدد الساعات',
      'عدد الفنيين','الوصف','طلب صيانة','نوع الطلب','تاريخ الطلب','رقم الطلب'
    ]];
  } else {
    head = [[
      'Status Name','Notes','Visit Date','Work Cost','Work Hours',
      'Technicians Number','Description','Maintenance Order',
      'Order Type','Order Date','Order Number'
    ]];
  }

  let rows: (number | string)[][] = [];

  // ✅ المجاميع
  let totalTechnicians = 0;
  let totalWorkHours = 0;
  let totalWorkCost = 0;

  this.Data.forEach((part) => {

    const date1 = new Date(part.orderDate);
    const orderDate = `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1)
      .toString().padStart(2, '0')}/${date1.getFullYear()}`;

    const date2 = new Date(part.visitDate);
    const visitDate = `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1)
      .toString().padStart(2, '0')}/${date2.getFullYear()}`;

    // ✅ حساب المجاميع الصحيح
    totalTechnicians += Number(part.techniciansNo) || 0;
    totalWorkHours += Number(part.workHours) || 0;
    totalWorkCost += Number(part.workCost) || 0;

    let temp: (number | string)[] = [];

    temp[0] = part.orderNo;
    temp[1] = orderDate;
    temp[2] = part.requestSource;
    temp[3] = part.maintenanceOrderName;
    temp[4] = part.description;
    temp[5] = part.techniciansNo;
    temp[6] = part.workHours;
    temp[7] = part.workCost;
    temp[8] = visitDate;
    temp[9] = part.note;
    temp[10] = part.statusName;

    if (isArabic) {
      temp.reverse();
    }

    rows.push(temp);
  });

  // ✅ الفوتر (بنفس ترتيب البيانات قبل reverse)
  let footerRow: (string | number)[] = [];

  footerRow[0] = isArabic ? '' : 'Total';
  footerRow[1] = '';
  footerRow[2] = '';
  footerRow[3] = '';
  footerRow[4] = '';
  footerRow[5] = ''; // عدد الفنيين
  footerRow[6] = totalWorkHours;   // عدد الساعات
  footerRow[7] = totalWorkCost;    // كلفة الصيانة
  footerRow[8] = '';
  footerRow[9] = '';
  footerRow[10] = isArabic ? 'المجموع' : '';

  // ✅ نفس حركة الجدول (مهم جداً)
  if (isArabic) {
    footerRow.reverse();
  }

  const pdf = new jsPDF('l', 'pt', 'a4');

  pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
  pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  pdf.setFont('Amiri');
  pdf.setFontSize(14);

  const Title = isArabic ? "كشف تقرير التقني" : "Maintenance Technical Report";
  const pageWidth = pdf.internal.pageSize.width;

  pdf.text(Title, pageWidth / 2, 40, { align: 'center' });

  autoTable(pdf as any, {
    startY: 60,
    head: head,
    body: rows,
    foot: [footerRow],

    headStyles: {
      font: "Amiri",
      halign: isArabic ? 'right' : 'left',
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: {
      font: "Amiri",
      halign: isArabic ? 'right' : 'left',
      fontSize: 8
    },
    footStyles: {
      font: "Amiri",
      halign: isArabic ? 'right' : 'left',
      fontSize: 9,
      fontStyle: 'bold',
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0]
    },

    theme: "grid",
  });

  pdf.output('dataurlnewwindow');
}
}
