import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { ReportsService } from '../reports.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-balancesheetrpt',
  templateUrl: './balancesheetrpt.component.html',
  styleUrls: ['./balancesheetrpt.component.scss']
})
export class BalancesheetrptComponent implements OnInit {
  balancesheetAddForm: FormGroup;
  textAlignmentClass = 'p-text-left';
  lang = 'ar';
  textColorClass = 'custom-font-color';
  userbranchList: any;
  statusList: any;
  DateNow: Date = new Date();
  showLoader = false;
  titlePage: string;
  isHidden: boolean = true;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  invBalance: boolean = false;
  currentProfitLoss: any;
  endInventoryAmt: any;
  selectedYears: any[] = [];
  maxSelectionLimit = 2;
  yearId1: number;
  yearId2: number;
  isSelected: boolean = false;
  screenId: number = 48;
  custom: boolean;
  public TitlePage: string;
  currancyList: any;
  selectedCur: any;

  constructor(
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
    debugger
    this.textAlignmentClass = this.jwtAuth.getLang() === 'ar' ? 'p-text-right' : 'p-text-left';
    this.lang = this.jwtAuth.getLang();
    this.GetBalanceSheetForm();
    this.GetBalanceSheetInitialForm();
    this.getFavouriteStatus(this.screenId);
    this.SetTitlePage();

    this.balancesheetAddForm.get('invValue').disable();
  }

  GetBalanceSheetForm() {
    debugger
    this.balancesheetAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      branchId: [0],
      level: [1, [Validators.required, Validators.min(1)]],
      status: [-1],
      todate: [''],
      zerobalance: [false],
      branchedacc: [false],
      mainacc: [false],
      costCenterId: [0],
      currencyId: [0],
      exRate: [0],
      invValue: [0, { disabled: true }],
    });
  }

  GetBalanceSheetInitialForm() {
    this.ReportsService.GetBalanceSheetForm().subscribe((result) => {
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.userbranchList = result.companyBranchList;
      this.currancyList = result.currencyList;
      this.statusList = result.statusList;
      debugger
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US")
      this.balancesheetAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if (result.currencyId == null || result.currencyId == undefined) {
          result.currencyId = 0;
        }
        this.selectedCur = result.currencyId;
        var defaultStatus = this.statusList.find(c=> c.data4 == true).id;
        this.balancesheetAddForm.get('status').setValue(defaultStatus);
        // this.balancesheetAddForm.get("branchId").setValue(result.defaultBranchId);
        this.balancesheetAddForm.get("level").setValue(1);
        debugger
      });
    });
  }

  getCurrencyRate(event: any) {
    debugger
    if (event > 0) {
      const selectedValue = event;
      var currRate = this.currancyList.find(option => option.id === selectedValue).data1;
      this.balancesheetAddForm.get("exRate").setValue(Number(currRate));
    }
    else {
      var Rate = 0;
      this.balancesheetAddForm.get("exRate").setValue(Rate);
    }


  }

  toggleControl() {
    const myControl = this.balancesheetAddForm.get('invValue');
    if (this.invBalance) {
      myControl.enable(); // Enable the control
    } else {
      myControl.disable(); // Disable the control
      myControl.setValue('');
    }
  }

  getTranslationKey(acctype: number): string {
    switch (acctype) {
      case 13:
        return 'AssetTotal';
      case 14:
        return 'LiabilityTotal';
      case 15:
        return 'EquityTotal';
      default:
        return 'LiabilitiesEquityTotal';
    }
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      debugger
      this.voucherData = [];
      const formValues = this.balancesheetAddForm.value;
      if (this.balancesheetAddForm.value.invValue == null) {
        this.balancesheetAddForm.value.invValue = 0
      }
      formValues.costCenterId = -1;
      //formValues.currencyId = 1;
      //formValues.exRate = 1;
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetBalanceSheet(
        formValues.status,
        formValues.branchId,
        formValues.todate,
        formValues.costCenterId,
        formValues.currencyId,
        formValues.level,
        formValues.exRate,
        formValues.zerobalance == false ? -1 : 1,
        formValues.branchedacc == false ? -1 : 1,
        formValues.mainacc == false ? -1 : 1,
        formValues.invValue,
      ).subscribe((result) => {
        debugger

        this.voucherData = result.balanceSheetRptModel;
        if (currentLang == "ar") {
          this.refreshCompanyListTableArabic(this.voucherData);
        }
        else {
          this.refreshCompanyListTableEnglish(this.voucherData);
        }
        this.currentProfitLoss = result.currentProfitLoss;
        this.egretLoader.close();
        if (this.invBalance) {
          this.endInventoryAmt = this.balancesheetAddForm.get("invValue").value;
        }
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('balancesheet');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.balancesheetAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    this.balancesheetAddForm.get("todate").setValue(formatDate(new Date(), "yyyy-MM-dd", "en-US"));
    this.balancesheetAddForm.get("mainacc").setValue(false);
    this.balancesheetAddForm.get("zerobalance").setValue(false);
    this.balancesheetAddForm.get("branchedacc").setValue(false);
    this.balancesheetAddForm.get("level").setValue(1);
    this.balancesheetAddForm.get('branchId').setValue(0);
    this.balancesheetAddForm.get('status').setValue(0);
    this.balancesheetAddForm.get('currencyId').setValue(0);
    this.balancesheetAddForm.get('exRate').setValue(0);

    this.invBalance = false;
    //this.GetBalanceSheetInitialForm();
  }

  calculateTotal_Eq_Cap(amtType) {
    let total = 0;

    if (this.voucherData) {
      if (this.balancesheetAddForm.get("branchedacc").value) {
        const filteredData = this.voucherData.filter((item) => [14, 15].includes(item.accountType));
        total = filteredData.reduce((sum, item) => sum + item.balanceTotal, 0);
        total = total + this.currentProfitLoss;
        if (amtType == 1 && total > 0) {
          total = total;
        }
        else if (amtType == 2 && total < 0) {
          total = total * -1;
        }
        else {
          total = 0;
        }
      }
      else {
        const filteredData = this.voucherData.filter((item) => item.accountLevel == 1 && [14, 15].includes(item.accountType));
        total = filteredData.reduce((sum, item) => sum + item.balanceTotal, 0);
        total = total + this.currentProfitLoss;
        if (amtType == 1 && total > 0) {
          total = total;
        }
        else if (amtType == 2 && total < 0) {
          total = total * -1;
        }
        else {
          total = 0;
        }
      }
    }
    return total;
  }

  calculateTotal(acctype, amtType) {
    let total = 0;
    if (this.voucherData) {
      if (this.balancesheetAddForm.get("branchedacc").value) {
        const filteredData = this.voucherData.filter((item) => item.accountType === acctype);
        total = filteredData.reduce((sum, item) => sum + item.balanceTotal, 0);
        if (acctype == 15) {
          total = total + this.currentProfitLoss;
        }
        if (acctype == 13) {
          total = total + (this.endInventoryAmt ?? 0);
        }
        if (amtType == 1 && total > 0) {
          return total;
        }
        else if (amtType == 2 && total < 0) {
          return total * -1;
        }
        else {
          return 0;
        }
      }
      else {
        const filteredData = this.voucherData.filter((item) => item.accountLevel == 1 && item.accountType === acctype);
        total = filteredData.reduce((sum, item) => sum + item.balanceTotal, 0);
        if (acctype == 15) {
          total = total + this.currentProfitLoss;
        }
        if (acctype == 13) {
          total = total + (this.endInventoryAmt ?? 0);
        }
        if (amtType == 1 && total > 0) {
          return total;
        }
        else if (amtType == 2 && total < 0) {
          return total * -1;
        }
        else {
          return 0;
        }
      }
    }
    else
      return 0;
  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  refreshCompanyListTableArabic(data) {
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      ' رمز الحساب': x.accountNo,
      ' اسم الحساب': x.accountName,
      ' الرصيد المدين': x.balanceTotal >= 0 ? x.balanceTotal : 0,
      ' الرصيد الدائن': x.balanceTotal < 0 ? x.balanceTotal * -1 : 0,
    }));
  }

  refreshCompanyListTableEnglish(data) {
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Account Number': x.accountNo,
      'Account Name': x.accountName,
      ' الرصيد المدين': x.balanceTotal >= 0 ? x.balanceTotal : 0,
      ' الرصيد الدائن': x.balanceTotal < 0 ? x.balanceTotal * -1 : 0,
    }));
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Balance sheet List");
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
       head = [['الرصيد الدائن ', ' الرصيد المدين', '  اسم الحساب', ' رمز الحساب']]
    }
    else {
       head = [[' Credit Total ', 'Debit Total ', 'Account Name', 'Account Number']]
    }

    const rows: (number | string)[][] = [];

    this.voucherData.forEach(function (part, index) {
      let temp: (number | string)[] = [];
      temp[0] = part.accountNo
      temp[1] = part.accountName
      temp[2] = part.balanceTotal >= 0 ? part.balanceTotal : 0
      temp[3] = part.balanceTotal < 0 ? part.balanceTotal * -1 : 0


      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp)
    }, this.voucherData)

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title = "";
    if (currentLang == "ar") {
      Title = "كشف قائمه الميزانية العمومية ";
    }
    else {
      Title = "Balance Sheet";
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

  onchildChange() {
    this.voucherData = [];
    if (this.balancesheetAddForm.get("branchedacc").value) {
      this.balancesheetAddForm.get("mainacc").setValue(false);
    }
  }

  onFatherChange() {
    this.voucherData = [];
    if (this.balancesheetAddForm.get("mainacc").value) {
      this.balancesheetAddForm.get("branchedacc").setValue(false);
    }
  }

  OpenAccountStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;

    // Construct the URL you want to navigate to
    const url = `/AccountingReports/GetAccountStatementForm?acc=${acc}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
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
}
