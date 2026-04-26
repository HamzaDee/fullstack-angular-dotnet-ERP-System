import { Component, OnInit ,ViewChild,ChangeDetectorRef} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';
import { MaintReportsService } from '../maintenanceRep.service';
import { formatDate } from '@angular/common';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-maintenanceorderrpt',
  templateUrl: './maintenanceorderrpt.component.html',
  styleUrl: './maintenanceorderrpt.component.scss'
})
export class MaintenanceorderrptComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  MaintOrderAddForm: FormGroup = new FormGroup({});
  showItemId: boolean = false;
  inorderList: any;
  requestOrderList: any;
  statusList: any;
  prioritiesList: any;
  serialsList: any;
  itemsList: any;
  modelsList: any;
  datenow = new Date();
  DateNow: Date = new Date();
  showLoader = false;
  titlePage: string = '';
  voucherData: any[] = [];
  headerData: any;
  isDisabled: boolean = true;
  exportData: any[] = [];
  exportColumns: any[] = [];
  screenId: number = 305;
  custom: boolean = false;
  data: any[] = [];
  public TitlePage: string = '';
  pageNumber: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  searchText: string = '';
  searchTimeout: any;
  currentPage = 1;

  constructor
    (private readonly formbulider: FormBuilder,
      private readonly translateService: TranslateService,
      private readonly ReportsService: MaintReportsService,
      private readonly alert: sweetalert,
      public readonly ValidatorsService: ValidatorsService,
      private readonly jwtAuth: JwtAuthService,
      public readonly routePartsService: RoutePartsService,
      private readonly egretLoader: AppLoaderService,
      private readonly route: ActivatedRoute,
      private readonly appCommonserviceService: AppCommonserviceService,
      private readonly cdr: ChangeDetectorRef,
      private readonly title: Title,

    ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetMaintenanceOrderForm();
    this.GetMaintenanceOrderInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetMaintenanceOrderForm() {
    debugger
    this.MaintOrderAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromdate: [''],
      todate: [''],
      inorder: [null],
      reqOrderId: [null],
      status: [null],
      priorityId: [null],
      serialNo: [null],
      itemId: [null],
      modelId: [null],
      pageNumber: [1],
      pageSize: [10],
      searchText: [null],
      sortField: [null],
      sortOrder: [null]
    });
  }

  GetMaintenanceOrderInitialForm() {
    debugger
    this.ReportsService.GetMaintenanceOrdersForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.inorderList = result.inorderList;
      this.requestOrderList = result.requestOrderList;
      this.statusList = result.statusList;
      this.prioritiesList = result.prioritiesList;
      this.serialsList = result.serialsList;
      this.itemsList = result.itemsList;
      this.modelsList = result.modelsList;
      this.MaintOrderAddForm.patchValue(result);
      const fromDate = formatDate(this.DateNow, 'yyyy-MM-dd', 'en');
      this.MaintOrderAddForm.get("fromdate")?.setValue(fromDate);
      const toDate = formatDate(this.DateNow, 'yyyy-MM-dd', 'en');
      this.MaintOrderAddForm.get("todate")?.setValue(toDate);
      this.MaintOrderAddForm.get("inorder")?.setValue(-1);
      this.MaintOrderAddForm.get("reqOrderId")?.setValue(0);
      this.MaintOrderAddForm.get("status")?.setValue(0);
      this.MaintOrderAddForm.get("priorityId")?.setValue(0);
      this.MaintOrderAddForm.get("serialNo")?.setValue(0);
      this.MaintOrderAddForm.get("itemId")?.setValue(0);
      this.MaintOrderAddForm.get("modelId")?.setValue(0);
    });

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaintenanceOrderReport');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    debugger
    const fromDate = formatDate(this.DateNow, 'yyyy-MM-dd', 'en');
    this.MaintOrderAddForm.get("fromdate")?.setValue(fromDate);
    const toDate = formatDate(this.DateNow, 'yyyy-MM-dd', 'en');
    this.MaintOrderAddForm.get("todate")?.setValue(toDate);
    this.MaintOrderAddForm.get("inorder")?.setValue(-1);
    this.MaintOrderAddForm.get("reqOrderId")?.setValue(0);
    this.MaintOrderAddForm.get("status")?.setValue(0);
    this.MaintOrderAddForm.get("priorityId")?.setValue(0);
    this.MaintOrderAddForm.get("serialNo")?.setValue(0);
    this.MaintOrderAddForm.get("itemId")?.setValue(0);
    this.MaintOrderAddForm.get("modelId")?.setValue(0);
    this.MaintOrderAddForm.get("pageNumber")?.setValue(0);
    this.MaintOrderAddForm.get("pageSize")?.setValue(10);
    this.voucherData = [];
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

  getFavouriteStatus(screenId: any) {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refreshMaintenanceArabic(data: any[]) {
  this.exportData = data.map(x => ({
    'رقم الطلب': x.orderNo,
    'تاريخ الطلب': formatDate(x.orderDate, 'yyyy-MM-dd', 'en'),
    'نوع الطلب': x.orderType,
    'الطلب': x.reqNo,
    'الأولوية': x.priority,
    'السيريال': x.serialNo,
    'المادة': x.itemName,
    'الموديل': x.itemModel,
    'العطل': x.damageType,
    'وصف العطل': x.damage,
    'الكفالة': x.warranty,
    'عدد الفنيين': x.tecCount,
    'الحالة': x.statusName
  }));
}

  refreshMaintenanceEnglish(data: any[]) {
  this.exportData = data.map(x => ({
    'Order No': x.orderNo,
    'Order Date': formatDate(x.orderDate, 'yyyy-MM-dd', 'en'),
    'Order Type': x.orderType,
    'Request': x.reqNo,
    'Priority': x.priority,
    'Serial No': x.serialNo,
    'Item': x.itemName,
    'Model': x.itemModel,
    'Damage': x.damageType,
    'Damage Description': x.damage,
    'Warranty': x.warranty,
    'Technicians': x.tecCount,
    'Status': x.statusName
  }));
}

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Maintenance Orders Report");
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

  // ✅ MATCH EXACT ROW ORDER
  if (isArabic) {
    head = [[
      'رقم الطلب','تاريخ الطلب','نوع الطلب','الطلب','الأولوية','السيريال','المادة','الموديل','نوع العطل','وصف العطل','الكفالة','عدد الفنيين','الحالة']];
  } else {
    head = [[
      'Order No','Order Date','Order Type','Request','Priority','Serial No','Item','Model','Damage Type','Damage Description','Warranty','Technicians','Status']];
  }

    const rows: (number | string)[][] = [];
    this.voucherData.forEach((item) => {
      const row: (number | string)[] = [
         item.orderNo,
          new Date(item.orderDate).toLocaleDateString(),
          item.orderType,
          item.reqNo,
          item.priority,
          item.serialNo,
          item.itemName,
          item.itemModel,
          item.damageType,
          item.damage,
          item.warranty,
          item.tecCount,
          item.statusName
      ];
      rows.push(row);
    });

  const pdf = new jsPDF('l', 'pt', 'a4');

  pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
  pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  pdf.setFont('Amiri');
  pdf.setFontSize(14);

  const title = isArabic
    ? 'تقرير أوامر الصيانة'
    : 'Maintenance Orders Report';

  const pageWidth = pdf.internal.pageSize.width;
  pdf.text(title, pageWidth / 2, 10, { align: 'center' });

  autoTable(pdf as any, {
    head: head,
    body: rows,
    headStyles: {
      font: 'Amiri',
      halign: isArabic ? 'right' : 'left',
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: {
      font: 'Amiri',
      halign: isArabic ? 'right' : 'left',
      fontSize: 8
    },
    theme: 'grid'
  });

  pdf.output('dataurlnewwindow');
  }

  loadData(event: any) {
  this.showLoader = true;

  // 🔥 TRUE only when user clicks sort (not pagination)
  const isSorting = event.sortField != null && event.first === 0;

  if (isSorting) {
    this.currentPage = 1;
  }

  if (!isSorting && event.first !== undefined) {
    this.currentPage = (event.first / event.rows) + 1;
  }

  this.pageNumber = this.currentPage;
  this.pageSize = event.rows;

  this.MaintOrderAddForm.patchValue({
    pageNumber: this.pageNumber,
    pageSize: this.pageSize,
    searchText: this.searchText,
    sortField: event.sortField,
    sortOrder: event.sortOrder === 1 ? 'asc' : 'desc'
  });

  this.ReportsService.GetMaintenanceOrders(this.MaintOrderAddForm.value)
    .subscribe({
     next: (result) => {
      this.voucherData = result.data;
      this.totalRecords = result.totalCount;
      const lang = this.jwtAuth.getLang();
      if (lang === 'ar') {
        this.refreshMaintenanceArabic(this.voucherData);
      } else {
        this.refreshMaintenanceEnglish(this.voucherData);
      }

      this.showLoader = false;
    },
      error: () => this.showLoader = false
    });
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;

      if (this.dt) {
        this.currentPage = 1;
        this.dt.reset();
      }

    }, 400);
  }

}
