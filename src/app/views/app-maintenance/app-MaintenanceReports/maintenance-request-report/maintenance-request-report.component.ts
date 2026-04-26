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
import { delay, of } from 'rxjs';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import { AmiriRegular } from 'assets/fonts/amiri';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-maintenance-request-report',
  templateUrl: './maintenance-request-report.component.html',
  styleUrl: './maintenance-request-report.component.scss'
})
export class MaintenanceRequestReportComponent {
  public TitlePage: string;
  screenId: number = 304;
  custom: boolean;
  MaintenanceRequestReportForm: FormGroup;
  public Data: any[];
  exportData: any[];
  loading: boolean;
  RequestTypeList: any;
  PriorityList: any;
  ItemsList: any;
  DamageList: any;
  AreaList: any;
  SuppliersList: any;
  modelList: any;
  BranchList: any;
  TechnicianList: any;
  SerialsList: any;
  PlaceOfOrderList: { id: number; text: string }[] = [
    { id: -1, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Select' },
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? ' خارجي' : 'External' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'داخلي' : 'Internal' },
  ];


  underWarrantyList = [
    { id: -1, text: this.jwtAuth.getLang() === 'ar' ? 'اختر' : 'Select' },
    { id: 1, text: this.jwtAuth.getLang() === 'ar' ? 'مكفول' : 'Under Warranty' },
    { id: 0, text: this.jwtAuth.getLang() === 'ar' ? 'غير مكفول' : 'Out of Warranty' },
  ];

  constructor(private title: Title,
    private purchaseReportService: PurchaseReportService,
    private formbulider: FormBuilder,
    private egretLoader: AppLoaderService,
    private serv: AppCommonserviceService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private MaintReportsService: MaintReportsService) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.MaintenanceRequestReportForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      inRequest: [0],
      requestType: [0],
      priorityId: [0],
      branchId: [0],
      technicianId: [0],
      serialNo: [''],
      itemId: [0],
      underWarranty: [0],
      damageId: [0],
      areaId: [0],
      customerId: [0],
      model: [0],
    });

    this.GetMaintenanceRequestReportForm();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaintenanceRequestReport');
    this.title.setTitle(this.TitlePage);
  }

  GetMaintenanceRequestReportForm() {

    this.MaintReportsService.GetMaintenanceRequestReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.BranchList = result.branchList;
      this.AreaList = result.areaList;
      this.TechnicianList = result.technicianList;
      this.SuppliersList = result.suppliersList;
      this.ItemsList = result.itemsList;
      this.DamageList = result.damageList;
      this.PriorityList = result.priorityList;
      this.RequestTypeList = result.requestTypeList;
      this.modelList = result.modelList;
      this.SerialsList = result.serialsList;
      this.MaintenanceRequestReportForm.patchValue(result);

      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.MaintenanceRequestReportForm.get("inRequest").setValue(-1);
        this.MaintenanceRequestReportForm.get("underWarranty").setValue(-1);
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();

    this.Data = [];

    const formValues = this.MaintenanceRequestReportForm.value;

    this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));

    this.MaintReportsService.GetMaintenanceRequestReport(
      formValues.fromDate,
      formValues.toDate,
      formValues.inRequest,
      formValues.requestType,
      formValues.priorityId,
      formValues.branchId,
      formValues.technicianId,
      formValues.serialNo,
      formValues.itemId,
      formValues.underWarranty,
      formValues.damageId,
      formValues.areaId,
      formValues.customerId,
      formValues.model
    ).subscribe({
      next: (result) => {
        this.Data = result;

        if (currentLang == "ar") {
          this.refresMaintenanceRequestrabic(this.Data);
        }
        else {
          this.refreshMaintenanceRequestsEnglish(this.Data);
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

  clearFormData() {
    debugger
    this.Data = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.MaintenanceRequestReportForm.get('fromDate').setValue(currentDate);
    this.MaintenanceRequestReportForm.get('toDate').setValue(currentDate);
    this.MaintenanceRequestReportForm.get('inRequest').setValue(-1);
    this.MaintenanceRequestReportForm.get('requestType').setValue(0);
    this.MaintenanceRequestReportForm.get('priorityId').setValue(0);
    this.MaintenanceRequestReportForm.get('branchId').setValue(0);
    this.MaintenanceRequestReportForm.get('technicianId').setValue(0);
    this.MaintenanceRequestReportForm.get('serialNo').setValue("");
    this.MaintenanceRequestReportForm.get('itemId').setValue(0);
    this.MaintenanceRequestReportForm.get('underWarranty').setValue(-1);
    this.MaintenanceRequestReportForm.get('damageId').setValue(0);
    this.MaintenanceRequestReportForm.get('areaId').setValue(0);
    this.MaintenanceRequestReportForm.get('customerId').setValue(0);
    this.MaintenanceRequestReportForm.get('model').setValue(0);
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

  refresMaintenanceRequestrabic(data) {
    debugger
    this.exportData = data.map(x => {
      const requestDate = new Date(x.requestDate).toLocaleDateString('ar-EG');
      return {
        'رقم الطلب': x.requestNo,
        'تاريخ الطلب': requestDate,
        'نوع الطلب': x.requestTypeName,
        'مكان الطلب': x.requestSource,
        'الفني': x.technicianName,
        'العميل': x.customerName,
        'العنوان': x.address,
        'اسم المادة': x.itemName,
        'رقم السيريال': x.serialNo,
        'الموديل': x.modelName,
        'العطل': x.damageName,
        'وصف العطل': x.damageDecr,
        'مكفول': x.warrantyStatus,
        'الحالة': x.statusName,
      }
    });
  }

  refreshMaintenanceRequestsEnglish(data) {
    debugger
    this.exportData = data.map(x => {
      const requestDate = new Date(x.requestDate).toLocaleDateString('en-EG');
      return {
        'Order Number': x.requestNo,
        'Order Date': requestDate,
        'Order Type': x.requestTypeName,
        'Place Of Order': x.requestSource,
        'Technician': x.technicianName,
        'Client': x.customerName,
        'Address': x.address,
        'Material Name': x.itemName,
        'Serials': x.serialNo,
        'Model': x.modelName,
        'Damage': x.damageName,
        'Damage Decribtion': x.damageDecr,
        'Sponsors': x.warrantyStatus,
        'status': x.statusName,
      }
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {

      var currentLang = this.jwtAuth.getLang();
      const isArabic = currentLang === 'ar';

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      const headers = Object.keys(this.exportData[0]);
      const title = isArabic ? "كشف طلبات الصيانة" : "Maintenance Requests Report";

      // 👇 حول الشيت إلى array
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      // 👇 أضف العنوان + صف فاضي
      data.unshift([]);
      data.unshift([title]);

      // 👇 أنشئ شيت جديد
      const newWorksheet = xlsx.utils.aoa_to_sheet(data as any[][]);

      // 👇 دمج العنوان
      newWorksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
      ];

      // ⚠️ التنسيق هذا لن يعمل إلا بمكتبة xlsx-js-style
      if (newWorksheet['A1']) {
        newWorksheet['A1'].s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }

      // ✅ هنا كان الخطأ — لازم تستخدم newWorksheet
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

  exportPdf(dt: any) {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الحالة', 'مكفول', 'وصف العطل', 'العطل', 'الموديل', 'رقم السيريال', 'اسم المادة', 'العنوان', 'العميل', 'الفني', 'مكان الطلب', 'نوع الطلب', 'تاريخ الطلب', 'رقم الطلب']]
    }
    else {
      head = [['status', 'Sponsors', 'Damage Decribtion', 'Damage', 'Model', 'Serials', 'Material Name', 'Address', 'Client', 'Technician', 'Place Of Order', 'Order Type', 'Order Date', 'Order Number']]
    }
    var rows: (number | string)[][] = [];

    this.Data.forEach(function (part, index) {

      const date1 = new Date(part.requestDate);
      const requestDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.requestNo
      temp[1] = requestDate
      temp[2] = part.requestTypeName
      temp[3] = part.requestSource
      temp[4] = part.technicianName
      temp[5] = part.customerName
      temp[6] = part.address
      temp[7] = part.itemName
      temp[8] = part.serialNo
      temp[9] = part.modelName
      temp[10] = part.damageName
      temp[11] = part.damageDecr
      temp[12] = part.warrantyStatus
      temp[13] = part.statusName

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

    const Title = currentLang == "ar" ? "كشف طلبات الصيانة" : "Maintenance Requests Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 40, { align: 'center' });

    autoTable(pdf as any, {
      startY: 60, // 👈 يحدد بداية الجدول
      head: head,
      body: rows,
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
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }
}
