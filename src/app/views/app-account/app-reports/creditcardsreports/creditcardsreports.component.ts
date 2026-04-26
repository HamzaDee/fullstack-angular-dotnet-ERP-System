import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReportsService } from '../reports.service';
import { formatDate } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-creditcardsreports',
  templateUrl: './creditcardsreports.component.html',
  styleUrl: './creditcardsreports.component.scss'
})
export class CreditcardsreportsComponent {
  public TitlePage: string;

  BranchList: any;
  VoucherTypeList: any;
  CreditCardsList: any;
  FromDate : any;
  CreditCardsStatusForm: FormGroup;
  totalFormatted: string = '0';
  Data: any[] = [];
  exportData: any[] = [];
  screenId: number = 284;
  custom: boolean;
  Lang: string;



  constructor(
    private readonly title: Title,
    private readonly translateService: TranslateService,
    private readonly routePartsService: RoutePartsService,
    private readonly router: Router,
    private readonly jwtAuth: JwtAuthService,
    private readonly dialog: MatDialog,
    private readonly alert: sweetalert,
    private readonly ReportsService: ReportsService,
    private readonly formbulider: FormBuilder,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();

    this.CreditCardsStatusForm = this.formbulider.group({
      companyId: [0],
      branchId: [0],
      voucherTypeId: [0],
      cardNo: [0],
      fromDate: [''],
      toDate: [''],
      isCollected: [-1],
    
      Outcome: [false],  
      NotOutcome: [false],  
    });

    this.GetCreditCardsStatusInitialForm();
    this.getFavouriteStatus(this.screenId);

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CreditCardsStatusReport'); 
    this.title.setTitle(this.TitlePage);
  }

  GetCreditCardsStatusInitialForm() {
    this.ReportsService.getCreditCardsStatusReportForm().subscribe((result) => {
  
      if (result?.isSuccess == false && result?.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

  
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US");
      this.FromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US");

      this.BranchList = result.branchList;
      this.VoucherTypeList = result.voucherTypeList;
      this.CreditCardsList = result.creditCardsList;

      this.CreditCardsStatusForm.patchValue(result);
      this.CreditCardsStatusForm.patchValue({
  cardNo: Number((result as any)?.cardNo ?? 0)
});

      this.CreditCardsStatusForm.patchValue({ isCollected: -1 });
   
      this.Data = [];
    });
  }

  GetReport() {
    const formValues = this.CreditCardsStatusForm.value;
      debugger
    const BranchId = formValues.branchId ?? 0;           
    const VoucherTypeId = formValues.voucherTypeId ?? 0; 
    const FromDate = formValues.fromDate ?? '';
    const ToDate = formValues.toDate ?? '';
    const CardNo = this.CreditCardsList.find(c=> c.id == formValues.cardNo)?.data1 ?? 0;
    //const CardNo = formValues.cardNo ?? 0;
    const IsCollected = Number(formValues.isCollected ?? -1);


    const currentLang = this.jwtAuth.getLang();

    this.ReportsService.GetCreditCardsStatusReport(
      BranchId,
      VoucherTypeId,
      FromDate,
      ToDate,
      CardNo,
      IsCollected
    ).subscribe((result) => {
     
      if (result?.isSuccess == false && result?.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

    
      this.Data = Array.isArray(result) ? result : (result?.data ?? []);
      this.calcTotalAmountJod();

      if (currentLang == "ar") {
        this.refreshCreditCardsArabic(this.Data);
      } else {
        this.refreshCreditCardsEnglish(this.Data);
      }

     
    });
  }

private calcTotalAmountJod(): void {
  const total = (this.Data ?? []).reduce((sum, x) => {
    const val = Number(x?.amountJod ?? 0);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  this.totalFormatted = total.toLocaleString(undefined, {
  });
}

  clearFormData() {
  this.totalFormatted = '0.000';

    this.Data = [];
    this.exportData = [];

    const currentDate = new Date().toISOString().split('T')[0];
    this.CreditCardsStatusForm.patchValue({
      branchId: 0,
      voucherTypeId: 0,
      cardNo: 0,
      fromDate: this.FromDate,
      toDate: currentDate,
      isCollected: -1

    });
  }

  refreshCreditCardsArabic(data: any[]) {
    this.exportData = (data ?? []).map(x => {
         const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
      'رقم السند': x.voucherNo,
      'نوع السند': x.voucherName,
      'تاريخ السند': voucherDate,
      'رقم البطاقة الائتمانية': x.creditCardNo,
      'نوع البطاقة': x.creditCardType,
      'حالة البطاقة': x.creditCardStatus,
      'القيمة': x.amount,
      'العملة': x.currencyName,
      'سعر الصرف': x.currRate,
      'قيمة بالدينار': x.amountJod,
      }
    });
  }

  refreshCreditCardsEnglish(data: any[]) {
    this.exportData = (data ?? []).map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
      'Voucher No': x.voucherNo,
      'Voucher Type': x.voucherName,
      'Voucher Date': voucherDate,
      'Credit Card No': x.creditCardNo,
      'Credit Card Type': x.creditCardType,
      'Credit Card Status': x.creditCardStatus,
      'Amount': x.amount,
      'Currency': x.currencyName,
      'Exchange Rate': x.currRate,
      'Amount (JOD)': x.amountJod,
      }
    });
  }

  exportExcel() {
  import("xlsx").then(xlsx => {

    const lang = this.jwtAuth.getLang();

    const totalRow: any = {};
    if (lang === 'ar') {
      totalRow['سعر الصرف'] = 'المجموع';
      totalRow['قيمة بالدينار'] = this.totalFormatted;
    } else {
      totalRow['Exchange Rate'] = 'Total';
      totalRow['Amount (JOD)'] = this.totalFormatted;
    }

    const dataToExport = [...(this.exportData ?? []), totalRow];

    const worksheet = xlsx.utils.json_to_sheet(dataToExport);
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, "CreditCardsStatus", ".xlsx");
  });
  }

  saveAsExcelFile(buffer: any, fileName: string, extension: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + extension);
  }

  exportPdf() {
  const currentLang = this.jwtAuth.getLang();
  const head =
    currentLang == "ar"
      ? [[
          'قيمة بالدينار', 'سعر الصرف', 'العملة', 'القيمة',
          'حالة البطاقة', 'نوع البطاقة', 'رقم البطاقة', 'تاريخ السند',
          'نوع السند', 'رقم السند'
        ]]
      : [[
          'Amount (JOD)', 'Rate', 'Currency', 'Amount',
          'Card Status', 'Card Type', 'Credit Card No', 'Voucher Date',
          'Voucher Type', 'Voucher No'
        ]];

  const rows: (string | number)[][] = [];
  (this.Data ?? []).forEach((x) => {
    
    rows.push([
      x.amountJod ?? 0,
      x.currRate ?? 0,
      x.currencyName ?? '',
      x.amount ?? 0,
      x.creditCardStatus ?? '',
      x.creditCardType ?? '',
      x.creditCardNo ?? '',
      this.formatVoucherDate(x.voucherDate, currentLang),
      x.voucherName ?? '',
      x.voucherNo ?? '',
    ]);
  });

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

  const title =
    currentLang == "ar"
      ? "كشف متابعة البطاقات الائتمانية"
      : "Credit Cards Status Report";

  const pageWidth = pdf.internal.pageSize.width;
  pdf.text(title, pageWidth / 2, 8, { align: 'center' });

  const totalLabel = currentLang === 'ar' ? 'المجموع' : 'Total';

    const foot = [[
      this.totalFormatted,  // Amount (JOD)
      '', totalLabel,'', '',
      '', '', '', '',
      ''
    ]];


 autoTable(pdf as any, {
  head,
  body: rows,

  foot,
  showFoot: 'lastPage',

  headStyles: { font: "Amiri", halign: 'center', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 18 },
  bodyStyles: { font: "Amiri", halign: 'center', fontSize: 8, fontStyle: 'bold' },
  footStyles: { font: "Amiri", halign: 'center', fontSize: 9, fontStyle: 'bold' },

  theme: "grid",
});


  pdf.output('dataurlnewwindow');
}

  formatVoucherDate(dateValue: any, currentLang: string): string {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
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
