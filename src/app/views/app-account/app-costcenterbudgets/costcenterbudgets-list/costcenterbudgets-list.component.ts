import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import { CostCenterBudgetsService } from '../costcenterbudgets.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-costcenterbudgets-list',
  templateUrl: './costcenterbudgets-list.component.html',
  styleUrls: ['./costcenterbudgets-list.component.scss']
})
export class CostcenterbudgetsListComponent implements OnInit {
  public TitlePage: string;
  companyId: number;
  data: any[];
  cols: any[];
  exportColumns: any[];
  HasPerm: boolean;
  showLoader: boolean;
  screenId: number = 123;
  custom: boolean;
  exportData: any[];

  constructor(
    private title: Title,
    private translateService: TranslateService,
    private alert: sweetalert,
    private router: Router,
    private CostCenterBudgetsService: CostCenterBudgetsService,
    private routePartsService: RoutePartsService,
    private jwtAuth: JwtAuthService,
    private readonly serv: AppCommonserviceService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetAccountsbudgetsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CostcenterbudgetsList');
    this.title.setTitle(this.TitlePage);
  }

  GetAccountsbudgetsList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      this.CostCenterBudgetsService.GetCostCenterBudgetsList().subscribe(result => {
        if (result.isSuccess == false && result.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.data = result;

        if (currentLang == "ar") {
          this.refreshCostcenterbudgetsArabic(this.data);
        }
        else {
          this.refreshCostcenterbudgetsEnglish(this.data);
        }

        this.showLoader = false;
      })
    });
  }

  NavigateBudgetForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.router.navigate(['CostCenterBudgets/CostcenterbudgetsForm']);
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

  refreshCostcenterbudgetsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.transDate).toLocaleDateString('ar-EG');
      return {
        ' رقم الحركه': x.transNo,
        ' تاريخ الحركه': formattedDate,
        '  السنة المالية ': x.yearId,
      }
    });
  }

  refreshCostcenterbudgetsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.transDate).toLocaleDateString('en-GB');
      return {
        'Transaction Number': x.transNo,
        'Transaction Date': formattedDate,
        'Fiscal Year': x.yearId,
      }
    });
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
       head = [[' السنة المالية', '  تاريخ الحركة', ' رقم الحركة']]
    }
    else {
       head = [['Fiscal Year', ' Transaction Date', 'Transaction Number']]
    }

    const rows: (number | string)[][] = [];

    this.data.forEach(function (part, index) {

      const date1 = new Date(part.transDate);
      const formattedDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.transNo
      temp[1] = formattedDate
      temp[2] = part.yearId


      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.data)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "الموازنات التقديرية لمراكز الكلفة ";
    }
    else {
      Title = "Cost Centers Budgets List  ";
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
