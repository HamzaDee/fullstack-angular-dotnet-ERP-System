import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CustomerReportsService } from '../receivablesreports.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-customeraccountstatement',
  templateUrl: './customeraccountstatement.component.html',
  styleUrls: ['./customeraccountstatement.component.scss']
})
export class CustomeraccountstatementComponent implements OnInit {
  custaccountStatmentAddForm: FormGroup;
  selectedcus: any;
  selectedbranch: any = 0;
  customersList: any;
  userbranchList: any;
  OB: any;
  accVoucherList: any;
  dealerTypesList: any;
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
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  totalFormatted: string = '0';
  supplierNumber: number;
  screenId: number = 110;
  custom: boolean;
  data: any[];
  public TitlePage: string;
  lang: string;
  loading: boolean;
  currenciesList: any;
  Lang: string;
  voucherDataOriginal: any[] = [];
  AreaList: any;
  EmployeeList: any;
  FromDate : any;

  constructor(    
    private title: Title,
    private formbulider: FormBuilder,
    private translateService: TranslateService,
    private ReportsService: CustomerReportsService,
    private alert: sweetalert,
    public ValidatorsService: ValidatorsService,
    private jwtAuth: JwtAuthService,
    public routePartsService: RoutePartsService,
    private egretLoader: AppLoaderService,
    private route: ActivatedRoute,
    private appCommonserviceService: AppCommonserviceService,
    private router: Router,
  ) { }


  ngOnInit(): void {
    debugger
     const token = this.jwtAuth.getJwtToken();
    if (!token) {
      // تسجيل دخول تلقائي أول مرة
      var username = this.route.snapshot.paramMap.get('username')!;
      var password = this.route.snapshot.paramMap.get('password')!;
      // تسجيل دخول تلقائي أول مرة
      this.jwtAuth.signin(username, password, 1).subscribe({
        next: (res) => {
          // بعد نجاح تسجيل الدخول، نفّذ استدعاء الفاتورة
          console.log('Login Auto Success', res);
          window.location.reload();
        },
        error: (err) => console.error('Login Auto Failed', err)
      });
    } 
    else{
      this.SetTitlePage();
      this.route.queryParams.subscribe((params: Params) => {
        this.supplierNumber = +params['acc'];
      });
      this.GetSupplieraccountStatementForm();
      this.GetSupplieraccountStatementInitialForm();
      this.getFavouriteStatus(this.screenId);      
    }
  }

  GetSupplieraccountStatementForm() {
    debugger
    this.custaccountStatmentAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      customerId: [0, [Validators.required, Validators.min(1)]],
      branchId: [0],
      fromDate: [''],
      toDate: [''],
      dealerTypeId: [0],
      currencyId: [0],
      currRate: [0],
      empId: [0],
      areaId: [0],
      voucherStatus: [this.defaultStatus],
    });
  }

  GetSupplieraccountStatementInitialForm() {
    this.ReportsService.GetCustomeraccountStatmentForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.customersList = result.customersList;
      this.userbranchList = result.branchesList;
      this.statusList = result.statusList;
      this.defaultStatus = this.statusList.find(c=> c.data4 == true).id;
      this.dealerTypesList = result.dealersTypesList;
      this.currenciesList = result.currenciesList;
      this.AreaList = result.areaList;
      this.EmployeeList = result.employeeList;
      debugger
      this.custaccountStatmentAddForm.patchValue(result);
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.FromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      this.custaccountStatmentAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.isDisabled = true;
        this.custaccountStatmentAddForm.get("voucherStatus").setValue(this.defaultStatus);
        // this.custaccountStatmentAddForm.get("branchId").setValue(result.defaultBranchId);
        debugger
        if (!isNaN(Number(this.supplierNumber)) && Number(this.supplierNumber) !== 0) {
          this.custaccountStatmentAddForm.get("customerId").setValue(this.supplierNumber);
        }
        this.isPost = 1;
        this.custaccountStatmentAddForm.value.post = this.isPost;
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (this.custaccountStatmentAddForm.value.fromDate > this.custaccountStatmentAddForm.value.toDate) {
      this.alert.ShowAlert('ErrorDate', 'error');
      return;
    }
    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();

      const formValues = this.custaccountStatmentAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetCustomersAccountStatement(
        formValues.customerId,
        formValues.voucherStatus,
        formValues.branchId,
        formValues.fromDate,
        formValues.toDate,
        formValues.dealerTypeId,
        formValues.currencyId,
        formValues.currRate,
        formValues.areaId,
        formValues.empId
      ).subscribe((result) => {
        debugger

        this.voucherData = result;
        this.voucherDataOriginal = JSON.parse(JSON.stringify(result));
        this.data = result;

        const currentRate = Number(this.custaccountStatmentAddForm.get("currRate")?.value);
        if (currentRate > 0) {
          this.applyCurrencyRate(currentRate);
        } else {
          this.voucherData = [...this.voucherDataOriginal];
        }


        if (currentLang == "ar") {
          this.refresCustomeraccountstatementArabic(this.voucherData);
        }
        else {
          this.refreshCustomeraccountstatementEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0)
          this.OB = this.voucherData[0].balance;
        this.calcultevalues()
        this.egretLoader.close();
      });
    });
  }

  PrintReport() {
    debugger
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.custaccountStatmentAddForm.value;
    if (formValues.branchId == 0) {
      formValues.branchId = -1;
    }
    if (formValues.dealerTypeId == 0) {
      formValues.dealerTypeId = -1;
    }
    if (formValues.empId == 0) {
      formValues.empId = -1;
    }

    if (this.Lang == "ar") {
      const reportUrl = `rptCustomersAccountstatementAR?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&CustomerID=${formValues.customerId}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&CurrId=${formValues.currencyId}&CurrRate=${formValues.currRate}&Balance=${this.totalFormatted}&DealerTypeId=${formValues.dealerTypeId}&EmpId=${formValues.empId}&AreaId=${formValues.areaId}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');

    }
    else {
      const reportUrl = `rptCustomersAccountstatementEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&CustomerID=${formValues.customerId}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&CurrId=${formValues.currencyId}&CurrRate=${formValues.currRate}&Balance=${this.totalFormatted}&DealerTypeId=${formValues.dealerTypeId}&EmpId=${formValues.empId}&AreaId=${formValues.areaId}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');
    }      
  }

  PrintAllReport() {
    debugger
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.custaccountStatmentAddForm.value;
    if (formValues.branchId == 0) {
      formValues.branchId = -1;
    }
    if (formValues.dealerTypeId == 0) {
      formValues.dealerTypeId = -1;
    }
    if (formValues.empId == 0) {
      formValues.empId = -1;
    }
    var exitFunc = false;
    if (formValues.empId > 0) {
      this.ReportsService.GetCustomersByEmp(formValues.empId, formValues.areaId)
        .subscribe((result: number[]) => { 
          
          // تأكد أن النتيجة ليست فارغة
          if (result && result.length > 0) {
            exitFunc = true;
            
            result.forEach(element => {
              let reportUrl = `rptCustomersAccountstatementAR?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&CustomerID=${element}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&CurrId=${formValues.currencyId}&CurrRate=${formValues.currRate}&Balance=${this.totalFormatted}&DealerTypeId=${formValues.dealerTypeId}&EmpId=${formValues.empId}&AreaId=${formValues.areaId}`;
              if (this.Lang == "en") {
                reportUrl = `rptCustomersAccountstatementEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&CustomerID=${element}&Status=${formValues.voucherStatus}&BranchId=${formValues.branchId}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&CurrId=${formValues.currencyId}&CurrRate=${formValues.currRate}&Balance=${this.totalFormatted}&DealerTypeId=${formValues.dealerTypeId}&EmpId=${formValues.empId}&AreaId=${formValues.areaId}`;
              }
             
              const url = this.router.serializeUrl(
                this.router.createUrlTree(['/report-viewer'], {
                  queryParams: { reportUrl }
                })
              );              
              window.open(url, '_blank');   
              new Promise(resolve => setTimeout(resolve, 3000));
            });
          }
        });
    }   
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustomerAccountStatement');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.custaccountStatmentAddForm.reset(); // Reset the form
    this.voucherData = []; // Clear the table data    
    //this.GetSupplieraccountStatementInitialForm();
    const currentDate = new Date().toISOString().split('T')[0];
    this.custaccountStatmentAddForm.get('fromDate').setValue(this.FromDate);
    this.custaccountStatmentAddForm.get('toDate').setValue(currentDate);
    this.clearTotals();
    this.custaccountStatmentAddForm.get('customerId').setValue(0);
    this.custaccountStatmentAddForm.get('branchId').setValue(0);
    this.custaccountStatmentAddForm.get('voucherStatus').setValue(this.defaultStatus);
    this.custaccountStatmentAddForm.get('dealerTypeId').setValue(0);
    this.custaccountStatmentAddForm.get('currencyId').setValue(0);
    this.custaccountStatmentAddForm.get('currRate').setValue(0);
    this.custaccountStatmentAddForm.get('empId').setValue(0);
    this.custaccountStatmentAddForm.get('areaId').setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;


    for (const row of this.voucherData) {
      const debit = parseFloat(row.debit);
      const credit = parseFloat(row.credit);
      const tot = parseFloat(row.balance);
      if (!isNaN(debit)) {
        this.tot1 += debit;
      }

      if (!isNaN(credit)) {
        this.tot2 += credit;
      }
    }

    // this.tot1 = tot1;
    // this.tot2 = tot2;
    this.total = this.tot1 - this.tot2;
    debugger
    // Format the values with thousand commas
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    // this.formatWithCommas();
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
    // this.formatWithCommas();
    this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
    // this.formatWithCommas();

    debugger


  }

  formatWithCommas(value: number): string {
    return value.toLocaleString();
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.tot1Formatted = "0.000";
    this.tot2Formatted = "0.000";
    this.totalFormatted = "0.000";
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

  getFavouriteStatus(screenId)
  {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  refresCustomeraccountstatementArabic(data) {
    debugger
    this.exportData = data.map(x => ({
      'رقم السند': x.voucherNo,
      'نوع السند': x.voucherName,
      'تاريخ السند': x.voucherDate,
      'ملاحظات': x.voucherStatement,
      'مدين': x.debit.toFixed(3),
      'دائن': x.credit.toFixed(3),
      'الرصيد': x.balance.toFixed(3),
    }));
  }

  refreshCustomeraccountstatementEnglish(data) {
    debugger
    this.exportData = data.map(x => ({
      'Voucher Number': x.voucherNo,
      'Voucher Type': x.voucherName,
      'Voucher Date': x.voucherDate,
      'Notes': x.voucherStatement,
      'Debit': x.debit.toFixed(3),
      'Credit': x.credit.toFixed(3),
      'Balance': x.balance.toFixed(3),
    }));
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refresCustomeraccountstatementArabic(exportSource);
      } else {
        this.refreshCustomeraccountstatementEnglish(exportSource);
      }

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);

      let totalDebit = 0;
      let totalCredit = 0;

      for (const row of exportSource) {
        const debit = parseFloat(row.debit);
        const credit = parseFloat(row.credit);

        if (!isNaN(debit)) {
          totalDebit += parseFloat(debit.toFixed(3));
        }

        if (!isNaN(credit)) {
          totalCredit += parseFloat(credit.toFixed(3));
        }
      }

      const totalBalance = parseFloat((totalDebit - totalCredit).toFixed(3));

      const headers = Object.keys(this.exportData[0]);
      const isArabicFromHeaders = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const fieldMap = isArabic
        ? {
          'مدين': totalDebit,
          'دائن': totalCredit,
          'الرصيد': totalBalance,
        }
        : {
          'Debit': totalDebit,
          'Credit': totalCredit,
          'Balance': totalBalance,
        };

      function getExcelColumnLetter(colIndex: number): string {
        let dividend = colIndex + 1;
        let columnName = '';
        let modulo;
        while (dividend > 0) {
          modulo = (dividend - 1) % 26;
          columnName = String.fromCharCode(65 + modulo) + columnName;
          dividend = Math.floor((dividend - modulo) / 26);
        }
        return columnName;
      }

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      headers.forEach((header, index) => {
        const trimmedHeader = header.trim();
        const sumValue = fieldMap[trimmedHeader];
        if (sumValue !== undefined) {
          const colLetter = getExcelColumnLetter(index);
          const cellAddress = colLetter + lastRow;
          worksheet[cellAddress] = { t: 'n', v: +sumValue.toFixed(2) };
        }
      });

      const labelCellAddress = getExcelColumnLetter(0) + lastRow;
      worksheet[labelCellAddress] = { t: 's', v: totalLabel };

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
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
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
       head = [[' الرصيد', ' دائن ', 'مدين', ' ملاحظات', ' تاريخ السند', ' نوع السند', ' رقم السند']]
    }
    else {
       head = [['Balance', 'Credit', 'Debit', 'Notes', ' Voucher Date', 'Voucher Type', 'Voucher Number']]
    }

    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }



    // متغيرات المجاميع
    let totalDebit = 0;
    let totalCredit = 0;

    // إنشاء الصفوف وجمع القيم
   exportSource.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = part.voucherDate
      temp[3] = part.voucherStatement
      temp[4] = part.debit.toFixed(3)
      temp[5] = part.credit.toFixed(3)
      temp[6] = part.balance.toFixed(3)

      const debit = parseFloat(part.debit);
      const credit = parseFloat(part.credit);

      const debitRounded = isNaN(debit) ? 0 : parseFloat(debit.toFixed(3));
      const creditRounded = isNaN(credit) ? 0 : parseFloat(credit.toFixed(3));
     // const balanceRounded = debitRounded - creditRounded;
      totalDebit += debitRounded;
      totalCredit += creditRounded;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });
    let totalBalance = parseFloat((totalDebit - totalCredit).toFixed(3));

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];
    if (currentLang === "ar") {
      footRow[3] = "المجموع";
      footRow[4] = totalDebit.toFixed(2);     // مدين
      footRow[5] = totalCredit.toFixed(2);    // دائن
      footRow[6] = totalBalance.toFixed(2);   // الرصيد
    } else {
      footRow[3] = "Total";
      footRow[4] = totalDebit.toFixed(2);     // Debit
      footRow[5] = totalCredit.toFixed(2);    // Credit
      footRow[6] = totalBalance.toFixed(2);   // Balance
    }

    foot = [footRow.reverse()];

    // إعداد ملف PDF
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف حساب عميل": "Customer Account Statement ";

    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      foot: foot,
      showFoot: 'lastPage',
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
      footStyles: {
        font: "Amiri",
        halign: isArabic ? 'right' : 'left',
        fontSize: 8,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
        textColor: 'black'
      },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  OpenVoucher(id, categoryId) {
    debugger
    var url = '';
    var invId = 0;
    debugger;
    switch (categoryId) {
      case 18:   // Entry Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/EntryVouchers/EntryVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 55:   // Entry Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/EntryVouchers/EntryVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 19:   // Receipt Voucher        
        invId = id;
        this.routePartsService.GuidToEdit = invId;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReceiptVoucher/Receiptform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 20: // Payment Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/PaymentVoucher/Paymentform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 21:  //Transfer Voucher
        invId = id;
        this.routePartsService.GuidToEdit = invId
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/TransferVoucher/TransferVoucherform?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 22: //Bank Transfer Voucher
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/BankTransfer/BankTransferForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 23: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 24: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingOutcomingCheque/ProcoutcheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 26: //Processing Incoming Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 29: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 30: //Begining Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingIncomingCheque/ProcincheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 31: //Processing Outgoing Cheques
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ProcessingOutcomingCheque/ProcoutcheqForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 32: //Assets Depreciation
        this.routePartsService.GuidToEdit = id
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetDepreciation/DepreciationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 34: //Output Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/InventoryVouchers/OutputVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 33: //Items Input Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/EntryyVoucher/EntryyVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 35: //Items Damage Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/DamageStockVoucher/DamageStockVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 36: //Items Transfer Voucher
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/TransferStockVoucher/ItemsTransferVoucherForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 39: //Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/PurchaseInvoice/PurchaseInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 41: //Return Purchase Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnPurchaseInvoice/ReturnPurInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 43: //Sales Order
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          debugger
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/SalesRequest/SalesRequestForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 44: //Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/SalesInvoices/SalesInvoicesForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
        break;
      case 45: //Return Sales Invoice
        this.ReportsService.GetInvoiceId(id).subscribe(result => {
          var invId = result;
          this.routePartsService.GuidToEdit = invId;
          this.routePartsService.Guid2ToEdit = 'Show';
          this.routePartsService.Guid3ToEdit = true;
          url = `/ReturnSalesInvoice/ReturnSalesInvoiceForm?GuidToEdit=${invId}&Guid2ToEdit=Show&Guid3ToEdit=true`;
          window.open(url, '_blank');
        })
      case 48: //Service  Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesInv/ServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 58: //Opening Balance
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/OpeningBalance/OpeningbalanceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 99: //Assets Purchase Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/AssetPurchaseInvoice/AssetPurchaseInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 102: //Assets Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/AssetSalesInvoice/AssetSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 107: //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetOperation/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 108: //Assets Operations
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetOperation/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 110: // Disposal Assets
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/FixedAssetOperation/FixedAssetOperationForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 125: // Supplier Payment Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierPaymentVoucher/SupppaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 126: // Supplier Receipt Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierReceiptVoucher/SuppReceiptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 127: // Supplier Purchase Service Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesPurchaseInv/SupplierPurServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 128: // Supplier Debit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierDepitNoteVoucher/SuppDebitVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 129: // Supplier Credit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/SupplierCreditNoteVoucher/SuppCreditVoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 130: // Customer Payment Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomerPaymentVoucher/CustpaymentvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 131: // Customer Receipt Voucher
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomerReceiptVoucher/CustRecieptvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 132: // Customer Debit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersDebitNote/CustDebitvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 133: // Customer Credit Note
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/CustomersCreditNote/CustCreditvoucherForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 134: // Customer Service Sales Invoice
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ServicesSalesInv/CustServiceSalesInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      case 174: // مردود خدمات
        this.routePartsService.GuidToEdit = id;
        this.routePartsService.Guid2ToEdit = 'Show';
        this.routePartsService.Guid3ToEdit = true;
        url = `/ReturnServiceInvoice/ReturnServiceInvoiceForm?GuidToEdit=${id}&Guid2ToEdit=Show&Guid3ToEdit=true`;
        window.open(url, '_blank');
        break;
      default:
    }
  }

  PrintVouchers(id, categoryId, voucherTypeId, voucherNo, voucherDate) {
    debugger
    this.lang = this.jwtAuth.getLang();
    switch (categoryId) {
      case 130: // Customer Payment Voucher
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerpaymentvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerpaymentvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 131: // Customer Receipt Voucher
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerReciptvoucherAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerReciptvoucherEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 132: // Customer Debit Note
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerDebitNoteAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerDebitNoteEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 133: // Customer Credit Note
        if (this.lang == "ar") {
          const reportUrl = `RptCustomerCreditNoteAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerCreditNoteEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 134: // Customer Service Sales Invoice
        if (this.lang == "ar") {
          const reportUrl = `RptCustservicesalesinvAR?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustservicesalesinvEN?VId=${id}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;
      case 101:  //   الأرصدة الأفتتاحية للعملاء  
        voucherDate = formatDate(voucherDate, "dd-MM-yyyy", "en-US");

        if (this.lang == "ar") {
          const reportUrl = `RptCustomerOpeningBalanceAR?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        else {
          const reportUrl = `RptCustomerOpeningBalanceEN?VoucherTypeId=${voucherTypeId}&voucherNo=${voucherNo}&VoucherDate=${voucherDate}`;
          const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
          window.open(url, '_blank');
        }
        break;

    }
  }

  loadLazyCustomerOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.customersList) {
      this.customersList = [];
    }

    // Make sure the array is large enough
    while (this.customersList.length < last) {
      this.customersList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.customersList[i] = this.customersList[i];
    }

    this.loading = false;
  }

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);

      if (curr) {
        this.custaccountStatmentAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.custaccountStatmentAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.custaccountStatmentAddForm.get("currRate").setValue(0);
      this.applyCurrencyRate(0);
      this.calcultevalues();
    }
  }

  applyCurrencyRate(rate: number) {
    if (rate > 0) {
      this.voucherData = this.voucherDataOriginal.map(row => {
        return {
          ...row,
          balance: rate > 0 ? (row.balance / rate) : row.balance
        };
      });
    }
    else {
      this.voucherData = [...this.voucherDataOriginal];
    }

  }

}
