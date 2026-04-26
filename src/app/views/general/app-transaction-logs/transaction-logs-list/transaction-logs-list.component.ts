import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransactionLogsService } from '../transaction-logs.service';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-transaction-logs-list',
  templateUrl: './transaction-logs-list.component.html',
  styleUrls: ['./transaction-logs-list.component.scss']
})
export class TransactionLogsListComponent implements OnInit {
  public TitlePage: string;
  tabelData: any[];
  selectedTransType: any;
  selectedScreen: any;
  selectedUsers: any;
  usersLsit: any;
  screansLsit: any;
  tansTypeLsit: any;
  fromDate: any = (new Date()).toISOString().substring(0, 10);
  toDate: any = (new Date()).toISOString().substring(0, 10);
  transNumber: any;
  SearchForm: FormGroup
  loading: boolean;
  screenId: number = 13;
  custom: boolean;
  data: any[];
  exportData: any[];

  constructor(
    private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private transactionLogsService: TransactionLogsService,
    private alert: sweetalert,
    private jwtAuth: JwtAuthService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetUserTransactionReportList();
    this.InitialTransLogForm();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('TransactionLogsList');
    this.title.setTitle(this.TitlePage);
  }

  GetUserTransactionReportList() {
    this.transactionLogsService.GetInitialAdvancedSearchForm().subscribe(result => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.usersLsit = result.usersLsit
      this.screansLsit = result.screansLsit
      this.tansTypeLsit = result.transTypeLsit
    })
  }

  CheckDateFromLessDateTo(fromDate, toDate) {
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
    setTimeout(() => {
      this.tabelData = null;
      this.loading = false;
    });
  }

  InitialTransLogForm() {
    this.SearchForm = this.formbulider.group({
      fromDate: [new Date()],
      toDate: [new Date()],
      transNumber: [0],
      selectedTransType: [null],
      selectedScreen: [null],
      selectedUsers: [null],
    });
  }

  AdvancedSearchInTransLogList(ToDate, FromDate) {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.loading = true;
    this.SearchForm.value.fromDate = FromDate.value;
    this.SearchForm.value.toDate = ToDate.value;
    this.SearchForm.value.transNumber = this.transNumber;
    this.SearchForm.value.selectedTransType = this.selectedTransType;
    this.SearchForm.value.selectedScreen = this.selectedScreen;
    this.SearchForm.value.selectedUsers = this.selectedUsers;
    setTimeout(() => {
      this.transactionLogsService.SearchForm(this.SearchForm.value).subscribe(result => {
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresTransactionLogsArabic(this.tabelData);
        }
        else {
          this.refreshTransactionLogsEnglish(this.tabelData);
        }

        this.loading = false;
      })
    });
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

  refresTransactionLogsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'الرقم': x.number,
      'اسم المستخدم ': x.userName,
      'اسم الشاشة': x.screenName,
      'رقم السجل': x.recordId,
      'نوع الحركة ': x.actionTypeName,
      ' تاريخ و وقت الحركة': x.transDate,
      'عنوان ال IP': x.userIpaddress,
      'اسم الجهاز': x.userComputerName,
    }));
  }

  refreshTransactionLogsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'number': x.number,
      'User Name': x.userName,
      'Screen Name': x.screenName,
      'Recored Number': x.recordId,
      'Transaction Type': x.actionTypeName,
      'Transaction Date Time': x.transDate,
      'IP Address': x.userIpaddress,
      'Device Name': x.userComputerName,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [['اسم الجهاز ', '  عنوان ال IP ', ' تاريخ و وقت الحركة ', ' نوع الحركة ', 'رقم السجل ', ' اسم الشاشة ', 'اسم المستخدم ', 'الرقم']]
    }
    else {
       head = [['Device Name', 'IP Address', 'Transaction Date Time', 'Transaction Type', 'Recored Number', 'Screen Name', 'User Name', 'Number']]
    }

    const rows: (number | string)[][] = [];

    this.tabelData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.number
      temp[1] = part.userName
      temp[2] = part.screenName
      temp[3] = part.recordId
      temp[4] = part.actionTypeName
      temp[5] = part.transDate
      temp[6] = part.userIpaddress
      temp[7] = part.userComputerName

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

    let Title = "";
    if (currentLang == "ar") {
      Title = "تقرير حركات المستخدمين";
    }
    else {
      Title = "Transaction Logs List";
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
