import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
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
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';


@Component({
  selector: 'app-incomestatement',
  templateUrl: './incomestatement.component.html',
  styleUrls: ['./incomestatement.component.scss']
})
export class IncomestatementComponent implements OnInit {
  incomeStatementAddForm: FormGroup;
  selectedacc: any;
  selectedbranch: any;
  selectedper: any;
  selectedCur: any;
  selectedyear: any;
  accountsList: any;
  userbranchList: any;
  currancyList: any;
  periodsList: any;
  fiscalyearList: any;
  accVoucherList: any;
  currentLang = this.jwtAuth.getLang();
  chooseText = this.currentLang === 'en' ? 'Select one' : 'اختر';
  statusList: any;
  defaultStatus : number;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isPost: number = 1;
  voucherData: any;
  headerData: any;
  isDisabled: boolean = true;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  tot3: number = 0;
  tot4: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  tot4Formatted: string = '0';
  totalFormatted: string = '0';
  showTotals: boolean = false;
  showfatheracc: boolean = false;
  showchildacc: boolean = false;
  isZeroBalnce: boolean = false;
  selectedYears: any[] = [];
  maxSelectionLimit = 2;
  yearId1: number;
  yearId2: number;
  isSelected: boolean = false;
  screenId: number = 49;
  custom: boolean;
  public TitlePage: string;
  netSales: number;
  netExpenses: number;
  Math = Math;

  constructor
    (    
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
    this.SetTitlePage();
    this.GetIncomeStatementForm();
    this.GetIncomeStatementInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetIncomeStatementForm() {
    debugger
    this.incomeStatementAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      branchId: [0],
      level: [0, [Validators.required, Validators.min(1)]],
      status: [this.defaultStatus],
      accId: [0],
      fromdate: [''],
      todate: [''],
      periodId: [0],
      yearIds: [''],
      zerobalance: [0],
      branchedacc: [0],
      showtotals: [0],
      mainacc: [0],
      costCenterId: [0],
      currencyId: [0],
      exRate: [0],
      invValue: [0],
    });
  }

  GetIncomeStatementInitialForm() {
    this.ReportsService.GetincomestatementForm().subscribe((result) => {
      debugger
      if(result.isSuccess == false && result.message =="msNoPermission")
        {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
      this.accountsList = result.accountsList;
      this.userbranchList = result.companyBranchList;
      this.periodsList = result.periodsFiscalYearsList;
      this.fiscalyearList = result.fiscalYearsList;
      this.currancyList = result.currencyList;
      this.statusList = result.statusList;
      this.defaultStatus = this.statusList.find(c=> c.data4 == true).id;
      debugger
      this.incomeStatementAddForm.patchValue(result);
      result.todate = formatDate(result.todate, "yyyy-MM-dd", "en-US")
      this.incomeStatementAddForm.patchValue(result);
      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        if(result.currencyId == null || result.currencyId == undefined)
          {
            result.currencyId = 0;
          }
          this.incomeStatementAddForm.get("currencyId").setValue(0);

        this.selectedacc = result.accId;
        this.selectedbranch = result.branchId;
        this.selectedper = result.periodId;
        this.isDisabled = true;
        // this.incomeStatementAddForm.get("branchId").setValue(result.defaultBranchId);
        this.incomeStatementAddForm.get("status").setValue(this.defaultStatus);
        this.isPost = 1;
        this.selectedCur = result.currencyId;

        debugger
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      if (this.isSelected) {
        debugger
        this.voucherData = [];
        this.clearTotals();
        const formValues = this.incomeStatementAddForm.value;

        if (!this.showfatheracc) {
          formValues.mainacc = -1;
        }
        else {
          formValues.mainacc = 1;
        }

        if (!this.showchildacc) {
          formValues.branchedacc = -1;
        }
        else {
          formValues.branchedacc = 1;
        }
        if (!this.isZeroBalnce) {
          formValues.zerobalance = -1;
        }
        else {
          formValues.zerobalance = 1;
        }
        formValues.costCenterId = -1;
       // formValues.currencyId = 1;
       // formValues.exRate = 1;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.ReportsService.GetIncomeStatementByYears(
          formValues.status,
          formValues.branchId,
          formValues.todate,
          formValues.accId,
          formValues.currencyId,
          formValues.level,
          formValues.exRate,
          formValues.zerobalance,
          formValues.branchedacc,
          formValues.mainacc,
          this.yearId1,
          this.yearId2,
        ).subscribe((result) => {
          debugger
     
          this.voucherData = result;

          if(currentLang == "ar"){
            this.refreshCompareYearsArabic(this.voucherData);
           }
           else{
            this.refreshCompareYearsEnglish(this.voucherData);
           }

          this.calcultevalues()
          this.egretLoader.close();
        });
      }

      else {
        debugger
        this.voucherData = [];
        this.clearTotals();
        const formValues = this.incomeStatementAddForm.value;

        if (formValues.branchId == null) {
          formValues.branchId = 0;
        }

        if (!this.showfatheracc) {
          formValues.mainacc = -1;
        }
        else {
          formValues.mainacc = 1;
        }

        if (!this.showchildacc) {
          formValues.branchedacc = -1;
        }
        else {
          formValues.branchedacc = 1;
        }


        if (!this.isZeroBalnce) {
          formValues.zerobalance = -1;
        }
        else {
          formValues.zerobalance = 1;
        }

        formValues.costCenterId = -1;
        //formValues.currencyId = 1;
       // formValues.exRate = 1;
        this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
        this.ReportsService.GetIncomeStatement(
          formValues.status,
          formValues.branchId,
          formValues.todate,
          formValues.accId,
          formValues.currencyId,
          formValues.level,
          formValues.exRate,
          formValues.zerobalance,
          formValues.branchedacc,
          formValues.mainacc,

        ).subscribe((result) => {
          debugger
          this.voucherData = result;
          var invValue = this.incomeStatementAddForm.get('invValue').value;
          if(invValue > 0){
            this.voucherData.push({
              accountId: 99999,
              accountNo: "99999",
              accountName: "بضاعة آخر المدة",
              balanceTotal: invValue,
              accountType: 17,
              closingAccount: 0,
              accountLevel: 1,
              isMain: false
            });
          }
          this.netSales = 0;
          this.netExpenses = 0;
          this.voucherData.forEach(acc => {
            if (acc.accountType === 16 && acc.accountLevel == 1) { // Revenue
              this.netSales += acc.balanceTotal;
            } else if (acc.accountType === 17 && acc.accountLevel == 1) { // Expenses
              this.netExpenses += acc.balanceTotal;
            }
          });
          if(currentLang == "ar"){
            this.refreshIncomestatementArabic(this.voucherData);
           }
           else{
            this.refreshIncomestatementEnglish(this.voucherData);
           }

          this.calcultevalues()
          this.egretLoader.close();
        });

      }

    });
  }
  SetTitlePage() {
    this.TitlePage = this.translateService.instant('incomestatement');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.incomeStatementAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data
    // this.GetIncomeStatementInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.incomeStatementAddForm.get('fromdate').setValue(currentDate);
    this.incomeStatementAddForm.get('todate').setValue(currentDate);
    this.incomeStatementAddForm.get('branchId').setValue(0);
    this.incomeStatementAddForm.get('level').setValue(1);
    this.incomeStatementAddForm.get('status').setValue(this.defaultStatus);
    this.incomeStatementAddForm.get('invValue').setValue(0);
    this.incomeStatementAddForm.get('zerobalance').setValue(0);
    this.incomeStatementAddForm.get('branchedacc').setValue(0);
    this.incomeStatementAddForm.get('mainacc').setValue(0);
    this.incomeStatementAddForm.get('accId').setValue(0);
    this.incomeStatementAddForm.get('currencyId').setValue(1);
    this.incomeStatementAddForm.get('exRate').setValue(1);
    this.incomeStatementAddForm.get('currencyId').setValue(0);
    this.incomeStatementAddForm.get('exRate').setValue(0);
    this.isSelected = false;
    this.clearTotals();
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;

    if (this.isSelected) {
      for (const row of this.voucherData) {
        const Year1Balance = parseFloat(row.year1Balance);
        const Year2Balance = parseFloat(row.year2Balance);


        if (!isNaN(Year1Balance)) {
          this.tot1 += Year1Balance;
        }

        if (!isNaN(Year2Balance)) {
          this.tot2 += Year2Balance;
        }
      }
      this.tot1Formatted = this.formatWithCommas(this.tot1);
      this.tot2Formatted = this.formatWithCommas(this.tot2);


    }

    else if (this.showTotals) {
      for (const row of this.voucherData) {
        const openingbalance = parseFloat(row.openingBalance);
        const debitTot = parseFloat(row.debitTransactionTotal);
        const CreditTot = parseFloat(row.creditTransactionTotal);

        if (!isNaN(openingbalance)) {
          this.total += openingbalance;
        }
        if (!isNaN(debitTot)) {
          this.tot1 += debitTot;
        }
        if (!isNaN(CreditTot)) {
          this.tot2 += CreditTot;
        }
      }
      this.tot1Formatted = this.formatWithCommas(this.tot1);
      this.tot2Formatted = this.formatWithCommas(this.tot2);
      this.totalFormatted = this.formatWithCommas(this.total);
    }

    else {
      for (const row of this.voucherData) {
        // if(row.balanceTotal > 0)
        //   {
            this.tot1 += row.balanceTotal;
          // }
          // else
          // {
          //   this.tot2 += row.balanceTotal;
          // }
        // const openingbalance = parseFloat(row.openingBalance);
        // const debit = parseFloat(row.debitTransaction);
        // const credit = parseFloat(row.creditTransaction);
        // const debitTot = parseFloat(row.debitTransactionTotal);
        // const CreditTot = parseFloat(row.creditTransactionTotal);

        // if (!isNaN(openingbalance)) {
        //   this.total += openingbalance;
        // }

        // if (!isNaN(debit)) {
        //   this.tot1 += debit;
        // }

        // if (!isNaN(credit)) {
        //   this.tot2 += credit;
        // }

        // if (!isNaN(debitTot)) {
        //   this.tot3 += debitTot;
        // }
        // if (!isNaN(CreditTot)) {
        //   this.tot4 += CreditTot;
        // }
      }
      this.tot1Formatted = this.formatWithCommas(this.tot1);
      this.tot2Formatted = this.formatWithCommas(this.tot2);
      this.tot3Formatted = this.formatWithCommas(this.tot3);
      this.tot4Formatted = this.formatWithCommas(this.tot4);
      this.totalFormatted = this.formatWithCommas(this.total);
    }

  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot3 = 0;
    this.tot4 = 0;
    this.tot1Formatted = '0';
    this.tot2Formatted = '0';
    this.tot3Formatted = '0';
    this.tot4Formatted = '0';
    this.totalFormatted = '0';
  }

  getCurrencyRate(event: any) {
    debugger
    if (event > 0) {
      const selectedValue = event;
      var currRate = this.currancyList.find(option => option.id === selectedValue).data1;
      this.incomeStatementAddForm.get("exRate").setValue(currRate);
    }

  }

  GetPeriods() {
    debugger
    if (this.incomeStatementAddForm.value.periodId > 0) {
      const formValues = this.incomeStatementAddForm.value;
      this.ReportsService.GetPeriods(formValues.periodId).subscribe((result) => {
        debugger
        this.incomeStatementAddForm.get("fromdate").setValue(formatDate(result[0].startDate, "yyyy-MM-dd", "en-US"));
        this.incomeStatementAddForm.get("todate").setValue(formatDate(result[0].endDate, "yyyy-MM-dd", "en-US"));
      });
    }
  }


  refreshIncomestatementArabic(data) { // defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'اسم الحساب ': x.accountName,
      'جزئي': x.balanceTotal != null ? x.balanceTotal.toFixed(3) : '0.000',
      ' كلي':0,
    }));
  }

  refreshIncomestatementEnglish(data) {// defult
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Account Name': x.accountName,
      'Partition': x.balanceTotal != null ? x.balanceTotal.toFixed(3) : '0.000',
      'Fully': 0,
    }));
  }

  refreshCompareYearsArabic(data) { // CompareYears
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      ' اسم الحساب ': x.accountName,
      ' مجموع السنة 1': x.year1Balance != null ? x.year1Balance.toFixed(3) : '0.000', 
      ' مجموع السنة 2': x.year2Balance != null ? x.year2Balance.toFixed(3) : '0.000', 
    }));
  }

  refreshCompareYearsEnglish(data) {// CompareYears
    debugger
    this.voucherData = data;
    this.exportData = this.voucherData.map(x => ({
      'Account Name': x.accountName,
      'Year 1 Balance': x.year1Balance != null ? x.year1Balance.toFixed(3) : '0.000', 
      'Year 2 Balance': x.year2Balance != null ? x.year2Balance.toFixed(3) : '0.000',
    }));
  }

  exportExcel1() {
    if (this.isSelected) {
      /* this.voucherData = [];
      this.clearTotals();
      const formValues = this.incomeStatementAddForm.value;

      this.incomeStatementAddForm.value.status = this.selectedstatus;

      if (!this.showfatheracc) {
        formValues.mainacc = -1;
      }
      else {
        formValues.mainacc = 1;
      }

      if (!this.showchildacc) {
        formValues.branchedacc = -1;
      }
      else {
        formValues.branchedacc = 1;
      }
      if (!this.isZeroBalnce) {
        formValues.zerobalance = -1;
      }
      else {
        formValues.zerobalance = 1;
      }
      formValues.costCenterId = -1;
      formValues.currencyId = 1;
      formValues.exRate = 1;
      this.ReportsService.GetIncomeStatementByYears(
        formValues.status,
        formValues.branchId,
        formValues.todate,
        formValues.accId,
        formValues.currencyId,
        formValues.level,
        formValues.exRate,
        formValues.zerobalance,
        formValues.branchedacc,
        formValues.mainacc,
        this.yearId1,
        this.yearId2,
      ).subscribe((result) => {
        this.exportData = result;
        import('xlsx').then((xlsx) => {
          const worksheet = xlsx.utils.json_to_sheet(this.exportData);
          const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, 'Accounts');
        });
      }); */

      import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.exportData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "products");
      });


    }
    else {
    /*   this.voucherData = [];
      this.clearTotals();
      const formValues = this.incomeStatementAddForm.value;

      this.incomeStatementAddForm.value.status = this.selectedstatus;

      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }

      if (!this.showfatheracc) {
        formValues.mainacc = -1;
      }
      else {
        formValues.mainacc = 1;
      }

      if (!this.showchildacc) {
        formValues.branchedacc = -1;
      }
      else {
        formValues.branchedacc = 1;
      }


      if (!this.isZeroBalnce) {
        formValues.zerobalance = -1;
      }
      else {
        formValues.zerobalance = 1;
      }

      formValues.costCenterId = -1;
      formValues.currencyId = 1;
      formValues.exRate = 1;
      this.ReportsService.GetIncomeStatement(
        formValues.status,
        formValues.branchId,
        formValues.todate,
        formValues.accId,
        formValues.currencyId,
        formValues.level,
        formValues.exRate,
        formValues.zerobalance,
        formValues.branchedacc,
        formValues.mainacc,
      ).subscribe((result) => {
        this.exportData = result;
        import('xlsx').then((xlsx) => {
          const worksheet = xlsx.utils.json_to_sheet(this.exportData);
          const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, 'Accounts');
        });
      }); */

      import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.exportData);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "products");
      });

    }
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
    if (this.isSelected) {
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
      let head: string[][];
      if(currentLang == "ar"){
         head = [['مجموع السنة 2','مجموع السنة 1','اسم الحساب']]
      }
       else{
         head = [['Year 2 Balance','Year 1 Balance','Account Name']]
      }

      const rows :(number|string)[][]=[];

      this.voucherData.forEach(function(part, index) {
      let temp: (number|string)[] =[];
      temp[0]= part.accountName
      temp[1]= part.year1Balance 
      temp[2]= part.year2Balance
    
       if (isArabic) {
         temp.reverse();
       }
       rows.push(temp)
     },this.voucherData)
    
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);
    
     let Title = "";
     if(currentLang == "ar"){
      Title = "قائمة الدخل";
    }
     else{
       Title = "Income Statement";
     }

     let pageWidth = pdf.internal.pageSize.width;
     pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
    
     autoTable(pdf as any, {
      head  :head,
      body :rows,
      headStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold' ,textColor: "black", lineWidth: 0.2 ,minCellWidth:20},
      bodyStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold'},
      theme:"grid",
    });
     pdf.output('dataurlnewwindow')
    }
    else {    
      const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';   
      let head: string[][];

      if(currentLang == "ar"){
         head = [['كلي','جزئي','اسم الحساب']]
      }
       else{
         head = [['Fully','Partition','Account Name']]
      }
      var rows :(number|string)[][]=[];
      this.voucherData.forEach(function(part, index) {
      let temp: (number|string)[] =[];
      temp[0]= part.accountName
      temp[1]= part.balanceTotal!= null ? part.balanceTotal.toFixed(3) : '0.000' 
      temp[2]= 0
    //  temp[2]= part.balanceTotal!= null ? part.balanceTotal.toFixed(3) : '0.000'
    
       if (isArabic) {
         temp.reverse();
       }
       rows.push(temp)
     },this.voucherData)
    
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);
    
     let Title = "";
     if(currentLang == "ar"){
      Title = "قائمة الدخل";
    }
     else{
       Title = "Income Statement";
     }     let pageWidth = pdf.internal.pageSize.width;
     pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
    
     autoTable(pdf as any, {
      head  :head,
      body :rows,
      headStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold' ,textColor: "black", lineWidth: 0.2 ,minCellWidth:20},
      bodyStyles: {font: "Amiri" , halign: isArabic ? 'right' : 'left' ,fontSize: 8 ,fontStyle:'bold'},
      theme:"grid",
    });
     pdf.output('dataurlnewwindow')
    }
  }


  ontotalChange() {
    debugger
    this.voucherData = [];
    this.selectedYears = [];
    this.incomeStatementAddForm.get('yearIds').setValue(this.selectedYears);
    if (this.showTotals) {

      this.clearTotals();
      this.isSelected = false;
      this.voucherData = [];
    }
  }

  onchildChange() {
    this.voucherData = [];
    if (this.showchildacc) {
      // Fetch or set fiscal year table data when the checkbox is checked
      this.showfatheracc = false;
      this.clearTotals()
    }
  }

  onFatherChange() {
    this.voucherData = [];
    if (this.showfatheracc) {
      // Fetch or set fiscal year table data when the checkbox is checked
      this.showchildacc = false;
      this.clearTotals()
    }
  }

  onOptionSelect(event: any) {
    debugger
    this.voucherData = [];
    // this.incomeStatementAddForm.get('yearIds').setValue(this.selectedYears);
    // Update the selectedOptions array when an item is selected
    this.selectedYears = event.value;
    this.incomeStatementAddForm.get('yearIds').setValue(this.selectedYears);
    if (this.selectedYears.length > this.maxSelectionLimit) {
      // "Swipe" the last option by removing it
      this.selectedYears.shift();
      this.incomeStatementAddForm.get('yearIds').setValue(this.selectedYears);

    }
    const [year1, year2] = this.selectedYears;
    this.yearId1 = year1;
    this.yearId2 = year2;
    if (this.selectedYears.length == 2) {
      this.isSelected = true
    }
    else {
      this.isSelected = false
    }
    debugger
    this.showTotals = false
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

  exportExcel() {
    debugger
    const wsData: any[] = [];
  // 🟦 العناوين العامة (من الشاشة)
    const reportTitle = this.currentLang === 'ar' ? 'قائمة الدخل' : 'Income Statement';
    const formattedDate = formatDate(this.incomeStatementAddForm.value.todate, "yyyy-MM-dd", "en-US");
    const dateTitle = this.currentLang === 'ar'
    ? `لغاية تاريخ: ${formattedDate}`
    : `Until Date: ${formattedDate}`;
    const levelTitle = this.currentLang === 'ar'
      ? `المستوى: ${this.incomeStatementAddForm.value.level || ''}`
      : `Level: ${this.incomeStatementAddForm.value.level || ''}`;

    wsData.push([reportTitle]);
    wsData.push([dateTitle]);
    wsData.push([levelTitle]);
    wsData.push([]); // سطر فارغ للفصل بين العنوان والجدول

    // العناوين
    wsData.push([
      this.currentLang === 'ar' ? 'اسم الحساب' : 'Account Name',
      this.currentLang === 'ar' ? 'التقسيم' : 'Partition',
      this.currentLang === 'ar' ? 'الإجمالي' : 'Total',
    ]);

    // البيانات التفصيلية
    this.voucherData.forEach((row: any) => {
      const accountName = row.accountName || '';
      const balanceTotal = row.balanceTotal || 0;

      wsData.push([
        accountName,
        balanceTotal < 0 ? balanceTotal * -1 : balanceTotal,
        '' // عمود فارغ
      ]);
    });

    // --- مجموع المبيعات ---
    wsData.push([]);
    wsData.push([
      this.currentLang === 'ar' ? 'صافي المبيعات' : 'Net Sales',
      '',
      this.netSales < 0 ? this.netSales * -1 : this.netSales
    ]);

    // --- مجموع المصاريف ---
    wsData.push([
      this.currentLang === 'ar' ? 'إجمالي المصاريف' : 'Total Expenses',
      '',
      this.netExpenses < 0 ? this.netExpenses * -1 : this.netExpenses
    ]);

    // --- إجمالي الربح ---
    wsData.push([
      this.currentLang === 'ar' ? 'الربح الإجمالي' : 'Gross Profit',
      '',
      Math.abs(this.netSales) - Math.abs(this.netExpenses)
    ]);

    // إنشاء ورقة العمل
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // تنسيق الأعمدة
    worksheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];

    // إنشاء المصنف
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income Statement');

    // حفظ الملف
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'IncomeStatement.xlsx');
  }
}
