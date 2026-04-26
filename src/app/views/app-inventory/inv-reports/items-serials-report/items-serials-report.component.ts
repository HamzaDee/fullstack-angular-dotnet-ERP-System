import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { InventoryReportsService } from '../invreports.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-items-serials-report',
  templateUrl: './items-serials-report.component.html',
  styleUrls: ['./items-serials-report.component.scss']
})
export class ItemsSerialsReportComponent implements OnInit {
  ItemsSerialsReportForm: FormGroup;
  showItemId: boolean = false;
  itemsList: any;
  groupsList: any;
  typesList: any;
  storesList: any;
  statusList: any;
  branchesList: any;
  reportTypesList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 282;
  custom: boolean;
  data: any[];
  loading: boolean;
  serialNO : any[] ;
  public TitlePage: string;

  constructor
    ( 
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: InventoryReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private serv: AppCommonserviceService,
      private cdr: ChangeDetectorRef,
      private title: Title,
    ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.GetItemsSerialsReportForm();
    this.GetItemsSerialsInitialForm();
    this.loadInitialData();
    this.getFavouriteStatus(this.screenId);
  }

   loadInitialData() {
      this.ReportsService.GetItemsSerialsReportForm().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.ItemsSerialsReportForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
      this.ItemsSerialsReportForm.get("toDate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));
      this.itemsList = result.itemsList;
    });
  }

  GetItemsSerialsReportForm() {
    debugger
    const today = new Date();
    const from = new Date(today.getFullYear(), 0, 1);

    this.ItemsSerialsReportForm = this.formbulider.group({
      reportType: [1],
      fromDate: [from],
      toDate: [today],
      companyId: [0],
      groupId: [0],
      catId: [0],
      itemId: [0],
      branchId: [0],
      storeId: [0],
      statusId: [0],
      serialNo: [null],
    });
  }

  GetItemsSerialsInitialForm() {
    debugger
    this.ReportsService.GetItemsSerialsReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
     

   
      this.groupsList = result.groupsList;
      this.typesList = result.typesList;
      this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.statusList = result.statusList;
      this.branchesList = result.branchesList;
      this.reportTypesList = result.reportTypesList;
      this.showItemId = false;
    });
  }

  GetReport() {
    
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

      const formValues = this.ItemsSerialsReportForm.value;

      const fromDate = formValues.fromDate
        ? formatDate(formValues.fromDate, 'yyyy-MM-dd', 'en-US')
        : null;

      const toDate = formValues.toDate
        ? formatDate(formValues.toDate, 'yyyy-MM-dd', 'en-US')
        : null;

      const reportType =
  (formValues.reportType === 0 || formValues.reportType === '0' || formValues.reportType === null || formValues.reportType === undefined || formValues.reportType === '')
    ? 1
    : formValues.reportType;

const companyId =
  (formValues.companyId === 0 || formValues.companyId === '0' || formValues.companyId === null || formValues.companyId === undefined || formValues.companyId === '')
    ? this.jwtAuth.getCompanyId()
    : formValues.companyId;

const groupId =
  (formValues.groupId === 0 || formValues.groupId === '0' || formValues.groupId === null || formValues.groupId === undefined || formValues.groupId === '')
    ? '-1'
    : formValues.groupId;

const catId =
  (formValues.catId === 0 || formValues.catId === '0' || formValues.catId === null || formValues.catId === undefined || formValues.catId === '')
    ? '-1'
    : formValues.catId;

const itemId =
  (formValues.itemId === 0 || formValues.itemId === '0' || formValues.itemId === null || formValues.itemId === undefined || formValues.itemId === '')
    ? '-1'
    : formValues.itemId;

const branchId =
  (formValues.branchId === 0 || formValues.branchId === '0' || formValues.branchId === null || formValues.branchId === undefined || formValues.branchId === '')
    ? '-1'
    : formValues.branchId;

const storeId =
  (formValues.storeId === 0 || formValues.storeId === '0' || formValues.storeId === null || formValues.storeId === undefined || formValues.storeId === '')
    ? '-1'
    : formValues.storeId;

const statusId =
  (formValues.statusId === 0 || formValues.statusId === '0' || formValues.statusId === null || formValues.statusId === undefined || formValues.statusId === '')
    ? '-1'
    : formValues.statusId;

const serialNo =
  (formValues.serialNo === 0 || formValues.serialNo === '0' || formValues.serialNo === null || formValues.serialNo === undefined || formValues.serialNo === '' || formValues.serialNo === 'undefined')
    ? '-1'
    : formValues.serialNo;

this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
this.ReportsService.GetItemsSerialsReport(
  reportType,
  fromDate,
  toDate,
  companyId,
  groupId,
  catId,
  itemId,
  branchId,
  storeId,
  statusId,
  serialNo,
  currentLang



      ).subscribe((result) =>
    {
      debugger

      this.voucherData = result || [];
      this.data = this.voucherData;

      if (currentLang == "ar")
      {
        this.refreshItemsSerialsArabic(this.data);
      }
      else
      {
        this.refreshItemsSerialsEnglish(this.data);
      }

      if (this.voucherData.length > 0)
      {
        debugger
        this.egretLoader.close();
      }
      else
      {
        debugger
       
          this.alert.ShowAlert('ThereisNoData', 'Error');
          this.egretLoader.close();
        
      }
    }, (err) =>
    {
      debugger
      this.egretLoader.close();
      this.alert.ShowAlert('SomethingWentWrong', 'Error');
    });

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsSerialsReport');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    
  //  this.ItemsSerialsReportForm.reset();  
    this.ItemsSerialsReportForm.get('reportType').setValue(1);

    this.ItemsSerialsReportForm.get('itemId').setValue(0);
    this.ItemsSerialsReportForm.get('groupId').setValue(0);
    this.ItemsSerialsReportForm.get('catId').setValue(0);
    this.ItemsSerialsReportForm.get('branchId').setValue(0);
    this.ItemsSerialsReportForm.get('storeId').setValue(0);
    this.ItemsSerialsReportForm.get('statusId').setValue(0);
    this.ItemsSerialsReportForm.get('serialNo').setValue('');
    this.ItemsSerialsReportForm.get("fromDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
    this.ItemsSerialsReportForm.get("toDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));  
  
    
    
  }

  OpenItemTransactionsForm(item: number) {
    debugger
    this.routePartsService.GuidToEdit = item;
    const url = `/Items/ItemsList/ItemForm?item=${item}`;
    window.open(url, '_blank');
  }

  setTitlePage() {
    this.TitlePage = this.translateService.instant('DetectionOfProductionCosts');
    this.title.setTitle(this.TitlePage);
  }

  refreshItemsSerialsArabic(data) {
    debugger;
    this.data = data || [];
    this.exportData = this.data.map(x => ({
      'رقم المادة'   : x.itemNo      ?? x.ItemNo,
      'اسم المادة'   : x.itemName    ?? x.ItemName,
      'رقم السيريال' : x.serialNo    ?? x.SerialNo,
      'المستودع'     : x.storeName   ?? x.StoreName,
      'الحالة'       : x.statusName  ?? x.StatusName,
      'رقم السند'    : x.voucherNo   ?? x.VoucherNo,
      'تاريخ السند'  : (x.voucherDate ?? x.VoucherDate)? formatDate((x.voucherDate ?? x.VoucherDate), 'yyyy-MM-dd', 'en-US')  : '',
      'نوع السند'    : x.voucherName ?? x.VoucherName,
  
    }));
  }

  refreshItemsSerialsEnglish(data) {
    debugger;
    this.data = data || [];
    this.exportData = this.data.map(x => ({
      'Material Number': x.itemNo      ?? x.ItemNo,
      'Material Name'  : x.itemName    ?? x.ItemName,
      'Serial Number'  : x.serialNo    ?? x.SerialNo,
      'Store'          : x.storeName   ?? x.StoreName,
      'Status'         : x.statusName  ?? x.StatusName,
      'Voucher No'     : x.voucherNo   ?? x.VoucherNo,
      'Voucher Date'   : (x.voucherDate ?? x.VoucherDate)? formatDate((x.voucherDate ?? x.VoucherDate), 'yyyy-MM-dd', 'en-US'): '',
      'Voucher Type'   : x.voucherName ?? x.VoucherName,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData || []);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "ItemsSerialsReport");
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
      head = [[ 'نوع المستند', 'تاريخ المستند', 'رقم المستند', 'المستودع', 'حالة السيريال', 'رقم السيريال', 'اسم المادة', 'رقم المادة']];
    }
    else {
      head = [[ 'Voucher Type', 'Voucher Date', 'Voucher No', 'Store', 'Serial Status', 'Serial Number', 'Material Name', 'Material Number']];
    }

    const rows: (number | string)[][] = [];
    this.data = this.data || [];

    this.data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.itemNo;
      temp[1] = part.itemName;
      temp[2] = part.serialNo;
      temp[3] = part.statusName;
      temp[4] = part.storeName;
      temp[5] = part.voucherNo;
      temp[6] = (part.voucherDate ?? part.voucherDate)? formatDate((part.voucherDate ?? part.voucherDate), 'yyyy-MM-dd', 'en-US'): '',
      temp[7] = part.voucherName;
      

      if (currentLang == "ar") {
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp);
      } else {
        rows.push([ temp[7], temp[6], temp[5], temp[4], temp[3], temp[2], temp[1], temp[0]]);
      }
    }, this.data);

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "تقرير سيريالات المواد";
    }
    else {
      Title = "Items Serials Report";
    }

    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 18 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow')
  }

  loadLazyOptions(event: any) {
    const { first, last } = event;

    if (!this.itemsList) {
      this.itemsList = [];
    }

    while (this.itemsList.length < last) {
      this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
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
}
