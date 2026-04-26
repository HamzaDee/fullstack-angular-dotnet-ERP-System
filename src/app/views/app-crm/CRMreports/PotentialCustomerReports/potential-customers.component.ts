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
import { CRMReportsService } from '../crm-reports.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-potential-customers',
  templateUrl: './potential-customers.component.html',
  styleUrl: './potential-customers.component.scss'
})
export class PotentialCustomersComponent implements OnInit {
  PotentialCustomersReportForm: FormGroup;
  showItemId: boolean = false;
  itemsList: any;
  groupsList: any;
  typesList: any;
  storesList: any;
  statusList: any;
  branchList: any;
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
      private readonly formbulider: FormBuilder,
      private readonly translateService: TranslateService,
      private readonly ReportsService: CRMReportsService,
      private readonly alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private readonly jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private readonly egretLoader: AppLoaderService,
      private readonly serv: AppCommonserviceService,
      private readonly cdr: ChangeDetectorRef,
      private readonly title: Title,
      private readonly router: Router
    ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();
    this.GetPotentialCustomersReportForm();
    this.GetPotentialCustomersInitialForm();
    this.loadInitialData();
    this.getFavouriteStatus(this.screenId);
  }

   loadInitialData() {
      this.ReportsService.GetPotentialCustomersReportForm().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.PotentialCustomersReportForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
      this.PotentialCustomersReportForm.get("toDate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));
      this.itemsList = result.itemsList;
    });
  }

  GetPotentialCustomersReportForm() {
    debugger
    const today = new Date();
    const from = new Date(today.getFullYear(), 0, 1);

    this.PotentialCustomersReportForm = this.formbulider.group({
      fromDate: [from],
      toDate: [today],
      sourceId: [0],
      status: [0],
      assignedTo: [0],
      branchId: [0],
    });
  }

  GetPotentialCustomersInitialForm() {
    debugger
    this.ReportsService.GetPotentialCustomersReportForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.typesList = result.sourceList;
      this.statusList = result.statusList;
      this.groupsList = result.employeesList;
      this.branchList = result.branchList;
      this.PotentialCustomersReportForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
      this.PotentialCustomersReportForm.get("toDate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));
      this.showItemId = false;
    });
  }

  GetReport() {
    
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

      const formValues = this.PotentialCustomersReportForm.value;

      const fromDate = formValues.fromDate
        ? formatDate(formValues.fromDate, 'yyyy-MM-dd', 'en-US')
        : null;

      const toDate = formValues.toDate
        ? formatDate(formValues.toDate, 'yyyy-MM-dd', 'en-US')
        : null;

  const sourceId =
    (formValues.sourceId === 0 || formValues.sourceId === '0' || formValues.sourceId === null || formValues.sourceId === undefined || formValues.sourceId === '')
      ? 0
      : formValues.sourceId;

  const status =
    (formValues.status === 0 || formValues.status === '0' || formValues.status === null || formValues.status === undefined || formValues.status === '')
      ? 0
      : formValues.status;

  const assignedTo =
    (formValues.assignedTo === 0 || formValues.assignedTo === '0' || formValues.assignedTo === null || formValues.assignedTo === undefined || formValues.assignedTo === '')
      ? 0
      : formValues.assignedTo;

    const branchId =
    (formValues.branchId === 0 || formValues.branchId === '0' || formValues.branchId === null || formValues.branchId === undefined || formValues.branchId === '')
      ? 0
      : formValues.branchId;


  this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
  this.ReportsService.GetPotentialCustomersReport({
    fromDate: fromDate,
    toDate: toDate,
    sourceId: sourceId,
    status: status,
    assignedTo: assignedTo,
    branchId:branchId 
  }).subscribe((result) =>
    {
      debugger

      this.voucherData = result || [];
      this.data = this.voucherData;

      if (currentLang == "ar")
      {
        this.refreshPotentialCustomersArabic(this.data);
      }
      else
      {
        this.refreshPotentialCustomersEnglish(this.data);
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
      this.TitlePage = this.translateService.instant('LeadsCustomersReport');
      this.title.setTitle(this.TitlePage);
    }
  
  clearFormData() {

    this.PotentialCustomersReportForm.get('sourceId').setValue(0);
    this.PotentialCustomersReportForm.get('status').setValue(0);
    this.PotentialCustomersReportForm.get('assignedTo').setValue(0);
    this.PotentialCustomersReportForm.get('branchId').setValue(0);
    this.PotentialCustomersReportForm.get("fromDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
    this.PotentialCustomersReportForm.get("toDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));  
      this.voucherData = [];
  this.data = [];
  this.exportData = [];
  }

  // OpenItemTransactionsForm(item: number) {
  //   debugger
  //   this.routePartsService.GuidToEdit = item;
  //   const url = `/Items/ItemsList/ItemForm?item=${item}`;
  //   window.open(url, '_blank');
  // }


  refreshPotentialCustomersArabic(data) {
    debugger;
    this.data = data || [];
    this.exportData = this.data.map(x => ({
      'رقم العميل المحتمل'          : x.leadId        ?? x.LeadId,
      'اسم العميل'                 : x.customerName  ?? x.CustomerName,
      'اسم جهة الاتصال الرئيسية'    : x.mainContactName ?? x.MainContactName,
      'رقم جهة الاتصال الرئيسية'    : x.mainContactPhone ?? x.MainContactPhone,
      'الموظف المحول له'            : x.employeeName  ?? x.EmployeeName,
      'القيمة المتوقعة'             : x.expectedValue ?? x.ExpectedValue,
      'التاريخ'                     : (x.createdAt ?? x.CreatedAt) ? formatDate((x.createdAt ?? x.CreatedAt), 'yyyy-MM-dd', 'en-US') : '',
      'المصدر'                      : x.sourceName    ?? x.SourceName,
      'الحالة'                      : x.statusName    ?? x.StatusName,
      'الفرع'                      : x.branchName    ?? x.branchName,
    }));
  }

  refreshPotentialCustomersEnglish(data) {
    debugger;
    this.data = data || [];
    this.exportData = this.data.map(x => ({
      'Lead No'         : x.leadId        ?? x.LeadId,
      'Customer Name'   : x.customerName  ?? x.CustomerName,
      'Main Contact'    : x.mainContactName ?? x.MainContactName,
      'Main Phone'      : x.mainContactPhone ?? x.MainContactPhone,
      'Sales Employee'     : x.employeeName  ?? x.EmployeeName,
      'Expected Value'  : x.expectedValue ?? x.ExpectedValue,
      'Date'            : (x.createdAt ?? x.CreatedAt) ? formatDate((x.createdAt ?? x.CreatedAt), 'yyyy-MM-dd', 'en-US') : '',
      'Source'          : x.sourceName    ?? x.SourceName,
      'Status'          : x.statusName    ?? x.StatusName,
      'branchName'          : x.branchName    ?? x.branchName,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData || []);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "LeadsCustomersList");
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
      head = [[ 'الحالة', 'المصدر', 'التاريخ', 'القيمة المتوقعة', 'الموظف المحول له', 'رقم جهة الاتصال الرئيسية', 'اسم جهة الاتصال الرئيسية', 'اسم العميل', 'رقم العميل المحتمل' ]];
    }
    else {
      head = [[ 'Status', 'Source', 'Date', 'Expected Value', 'Sales Employee', 'Main Phone', 'Main Contact', 'Customer Name', 'Lead No' ]];
    }

    const rows: (number | string)[][] = [];
    this.data = this.data || [];

    this.data.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.leadId ?? part.LeadId;
      temp[1] = part.customerName ?? part.CustomerName;
      temp[2] = part.mainContactName ?? part.MainContactName;
      temp[3] = part.mainContactPhone ?? part.MainContactPhone;
      temp[4] = part.employeeName ?? part.EmployeeName;
      temp[5] = part.expectedValue ?? part.ExpectedValue;
      temp[6] = (part.createdAt ?? part.CreatedAt) ? formatDate((part.createdAt ?? part.CreatedAt), 'yyyy-MM-dd', 'en-US') : '';
      temp[7] = part.sourceName ?? part.SourceName;
      temp[8] = part.statusName ?? part.StatusName;
      temp[8] = part.branchName ?? part.branchName;

      if (currentLang == "ar") {
        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp);
      } else {
        rows.push([ temp[9],temp[8], temp[7], temp[6], temp[5], temp[4], temp[3], temp[2], temp[1], temp[0] ]);
      }
    }, this.data);

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "تقرير العملاء المحتملين";
    }
    else {
      Title = "Potential Customers Report";
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
    this.serv.triggerFavouriteRefresh();
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
ShowDetailsOnly(id: number) {
  debugger
  const url = this.router.serializeUrl(
    this.router.createUrlTree(
      ['/LeadsCustomers/LeadsCustomersForm'],
      { queryParams: { GuidToEdit: id, opType: 'Show', showsave: 0 } }
    )
  );

  window.open(url, '_blank');
}
}