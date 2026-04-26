import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuditChangesLogsService } from '../audit-changes-logs.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { sweetalert } from 'sweetalert';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-audit-changes-logs-list',
  templateUrl: './audit-changes-logs-list.component.html',
  styleUrls: ['./audit-changes-logs-list.component.scss']
})
export class AuditChangesLogsListComponent implements OnInit {
  public TitlePage: string;
  tabelData: any[];
  selectedTransType: any;
  selectedScreen: any;
  selectedUsers: any;
  usersLsit: any;
  screansLsit: any;
  fromDate: any = (new Date()).toISOString().substring(0, 10);
  toDate: any = (new Date()).toISOString().substring(0, 10);
  transNumber: any;
  filedName: any;
  SearchForm: FormGroup
  loading: boolean;
  screenId: number = 22;
  custom: boolean;
  exportData: any[];
  exportColumns: any[];

  constructor(
    private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private auditChangesLogsService: AuditChangesLogsService,
    public jwtAuth: JwtAuthService,
    private alert: sweetalert,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetUserAuditChanagesLogList();
    this.InitialAuditChanagesLogForm();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('AuditChangesLogsList');
    this.title.setTitle(this.TitlePage);
  }

  GetUserAuditChanagesLogList() {
    this.auditChangesLogsService.GetInitialAdvancedSearchForm().subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.usersLsit = result.usersLsit
      this.screansLsit = result.screansLsit
    })
  }

  CheckDateFromLessDateTo(fromDate, toDate) {
    debugger
    if (fromDate > toDate) {
      this.fromDate = toDate
    }
    if (toDate > (new Date()).toISOString().substring(0, 10)) {
      this.toDate = (new Date()).toISOString().substring(0, 10);
    }
  }

  ClearSearch(): void {
    this.fromDate = (new Date()).toISOString().substring(0, 10);
    this.toDate = (new Date()).toISOString().substring(0, 10);
    this.transNumber = null;
    this.selectedTransType = null;
    this.selectedScreen = null;
    this.selectedUsers = null;
    this.filedName = '';
    setTimeout(() => {
      this.tabelData = null;
      this.loading = false;
    });
  }

  InitialAuditChanagesLogForm() {
    this.SearchForm = this.formbulider.group({
      fromDate: [new Date()],
      toDate: [new Date()],
      filedName: [0],
      transNumber: [0],
      selectedScreen: [null],
      selectedUsers: [null],
    });
  }

  AdvancedSearchInAuditChanagesLogList(ToDate, FromDate) {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.loading = true;
    this.SearchForm.value.fromDate = FromDate.value;
    this.SearchForm.value.toDate = ToDate.value;
    this.SearchForm.value.transNumber = this.transNumber;
    this.SearchForm.value.filedName = this.filedName;
    this.SearchForm.value.selectedScreen = this.selectedScreen;
    this.SearchForm.value.selectedUsers = this.selectedUsers;
    setTimeout(() => {
      this.auditChangesLogsService.SearchForm(this.SearchForm.value).subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refreshAuditChangesLogsListReportTableArabic(this.tabelData);
        }
        else {
          this.refreshAuditChangesLogsListReportTableEnglish(this.tabelData);
        }
        this.loading = false;
      })
    }, 1000);
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

  refreshAuditChangesLogsListReportTableArabic(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      ' الرقم ': x.number,
      ' اسم المستخدم': x.userName,
      'اسم الشاشه': x.screenName,
      ' اسم الحقل': x.fieldName,
      ' رقم السجل': x.recordId,
      ' القيمة القديمة': x.originalValue,
      ' القيمة لجديدة': x.newValue,
      'تاريخ الحركه': x.changeTime,
      ' عنوان ال IP': x.userIpaddress,
      ' اسم الجهاز': x.userComputerName,
    }));
  }

  refreshAuditChangesLogsListReportTableEnglish(data) {
    debugger
    this.tabelData = data;
    this.exportData = this.tabelData.map(x => ({
      'Number': x.number,
      'User Name': x.userName,
      'Screen Name': x.screenName,
      'Field Name': x.fieldName,
      'Recored Number': x.recordId,
      'Old VALUE': x.originalValue,
      'New VALUE': x.newValue,
      'Trans Date': x.changeTime,
      'IP Address': x.userIpaddress,
      'Device Name': x.userComputerName,
    }));
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Audit Changes Logs List", ".xlsx");
    });
  }
  
  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = extension;
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
       head = [[' اسم الجهاز', 'عنوان ال IP', 'تاريخ الحركة', 'القيمة الجديدة', ' القيمة القديمة', 'رقم السجل ', ' اسم الحقل', ' اسم الشاشه', ' اسم المستخدم', 'الرقم ']]
    }
    else {
       head = [['Device Name', 'IP Address', 'Trans Date', 'New VALUE', 'Old VALUE', 'Recored Number ', 'Field Name', 'Screen Name', 'User Name', 'Number ']]
    }

    const rows: (number | string)[][] = [];
    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number;
      temp[1] = part.userName;
      temp[2] = part.screenName;
      temp[3] = part.fieldName;
      temp[4] = part.recordId;
      temp[5] = part.originalValue;
      temp[6] = part.newValue;
      temp[7] = part.changeTime;
      temp[8] = part.userIpaddress;
      temp[9] = part.userComputerName;

        if (isArabic) {
          temp.reverse();
        }
        rows.push(temp)
    }, this.tabelData)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title;
    if (currentLang == "ar") {
      Title = "كشف تعديلات المستخدمين";
    }
    else {
      Title = "Audit Changes Logs List";
    }

    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });
    pdf.output('dataurlnewwindow')
  }
}
