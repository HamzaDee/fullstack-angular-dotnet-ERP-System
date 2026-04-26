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
import { ActivatedRoute, Params } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { CustomerReportsService } from '../receivablesreports.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-customeraging',
  templateUrl: './customeraging.component.html',
  styleUrls: ['./customeraging.component.scss']
})
export class CustomeragingComponent implements OnInit {
  cusAgingAddForm: FormGroup;
  selectedsup: any;
  selectedbranch: any;
  dynamicHeaders: string[] = [];
  voucherDataOriginal: any[] = [];
  vStatusList: any;
  customersList: any;
  userbranchList: any;
  categoriesList: any;
  classificationList: any;
  employeesList: any;
  OB: any;
  accVoucherList: any;
  selectedstatus: number;
  statusList: { id: number; text: string }[] = [
    { id: -1, text: 'اختر' },    // ID 0 for "Choose"
    { id: 1, text: 'مرحل' },    // ID 1 for "Posted"
    { id: 0, text: 'غير مرحل' },  // ID 2 for "Unposted"
  ];
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
  tot1: any;
  tot2: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  totalFormatted: string = '0';
  supplierNumber: number;
  screenId: number = 125;
  custom: boolean;
  data: any[] = [];
  public TitlePage: string;
  loading: boolean;
  dealerTypesList: any;
  currenciesList: any;
  AreaList: any;
  constructor
    (    
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
      private appCommonserviceService: AppCommonserviceService
    ) { }

  ngOnInit(): void {

    this.SetTitlePage();

    this.route.queryParams.subscribe((params: Params) => {
      this.supplierNumber = +params['acc'];
    });
    this.GetCustomerAgingForm();
    this.GetCustomerAgingInitialForm();
    this.getFavouriteStatus(this.screenId);
    this.generateHeaders();
    // this.SetTitlePage()
  }

  GetCustomerAgingForm() {

    this.cusAgingAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      customerId: [0],
      voucherStatus: [this.selectedstatus],
      branchId: [0],
      categoryId: [0],
      classId: [0],
      employeeId: [0],
      period: [30, [Validators.required, Validators.min(1)]],
      toDate: [''],
      currencyId: [0],
      dealerTypeId: [0],
      currRate: [0],
      areaId: [0],
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('CustomerAging');
    this.title.setTitle(this.TitlePage);
  }

  GetCustomerAgingInitialForm() {
    debugger
    this.ReportsService.GetCustomerAgingForm().subscribe((result) => {

      if (result.isSuccess == false && result.message == "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.customersList = result.customersList;
      this.vStatusList = result.statusList;
      this.userbranchList = result.branchesList;
      this.categoriesList = result.categorysList;
      this.classificationList = result.classficationsList;
      this.employeesList = result.employeesList;
      this.dealerTypesList = result.dealersTypesList;
      this.currenciesList = result.currenciesList;
      debugger
      this.AreaList = result.areaList;
      this.cusAgingAddForm.patchValue(result);
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.cusAgingAddForm.patchValue(result);


      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedsup = result.customerId;
        this.selectedbranch = result.branchId;
        this.isDisabled = true;
        this.cusAgingAddForm.get("categoryId").setValue(0);
        this.cusAgingAddForm.get("classId").setValue(0);
        this.cusAgingAddForm.get("employeeId").setValue(0);
        // this.cusAgingAddForm.get("branchId").setValue(result.defaultBranchId);
        this.cusAgingAddForm.get("period").setValue(30);

        if (!isNaN(Number(this.supplierNumber)) && Number(this.supplierNumber) !== 0) {
          this.selectedsup = this.supplierNumber;
        }
        this.selectedstatus = 0;
        this.isPost = 1;
        this.cusAgingAddForm.value.post = this.isPost;


      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();


    setTimeout(() => {
      this.voucherData = [];
      this.cusAgingAddForm.value.voucherStatus = this.selectedstatus;


      const formValues = this.cusAgingAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = -1;
      }
      if (formValues.note == null || formValues.note == "null") {
        formValues.note = '';
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetCustomerAging(
        formValues.customerId,
        formValues.voucherStatus,
        formValues.toDate,
        formValues.categoryId,
        formValues.classId,
        formValues.branchId,
        formValues.employeeId,
        formValues.period,
        formValues.dealerTypeId,
        formValues.currencyId,
        formValues.currRate,
        formValues.areaId
      ).subscribe((result) => {


        if (Array.isArray(result)) {
          this.voucherData = result;
          this.voucherDataOriginal = JSON.parse(JSON.stringify(result));
          this.data = result;
          const currentRate = Number(this.cusAgingAddForm.get("currRate")?.value);

          if (currentRate > 0) {
            this.applyCurrencyRate(currentRate);
          } else {
            this.voucherData = [...this.voucherDataOriginal];
          }

          if (currentLang == "ar") {
            this.refresCustomeragingArabic(this.voucherData);
          }
          else {
            this.refreshCustomeragingEnglish(this.voucherData);
          }

          if (this.voucherData.length > 0) {
            this.calcultevalues();
          }
        } else {
          console.error("API response is not an array:", result);
          // Handle the case when the API response is not an array
          // You may want to set an empty array or handle it differently based on your requirements.
          // this.voucherData = [];
        }

        this.egretLoader.close();
        // this.voucherData = result;
        // if (this.voucherData.length > 0)
        //   this.calcultevalues()
        // this.egretLoader.close();
      });
    });
  }

  clearFormData() {
    debugger
    this.voucherData = [];
    const currentDate = new Date().toISOString().split('T')[0];
    this.cusAgingAddForm.get('toDate').setValue(currentDate);
    this.cusAgingAddForm.get('customerId').setValue(0);
    this.cusAgingAddForm.get('voucherStatus').setValue(0);
    this.cusAgingAddForm.get('branchId').setValue(0);
    this.cusAgingAddForm.get('categoryId').setValue(0);
    this.cusAgingAddForm.get('classId').setValue(0);
    this.cusAgingAddForm.get('employeeId').setValue(0);
    this.cusAgingAddForm.get("period").setValue(30);
    this.cusAgingAddForm.get("currencyId").setValue(0);
    this.cusAgingAddForm.get("dealerTypeId").setValue(0);
    this.cusAgingAddForm.get("currRate").setValue(0);
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

    })
  }

  generateHeaders() {

    let days = this.cusAgingAddForm.get('period').value;

    days = days ? days : 30;

    this.dynamicHeaders = [];

    for (let i = 0; i < 5; i++) {
      const startRange = (i * days) + (i > 0 ? 1 : 0);
      const endRange = (i + 1) * days;
      const header = `${startRange} - ${endRange}`;
      this.dynamicHeaders.push(header);
    }

    const lastStartRange = (5 * days);
    const lastHeader = `> ${lastStartRange}`;
    this.dynamicHeaders.push(lastHeader);
  }

  getPeriodTotal(columnIndex: number): { value: number, formattedValue: string } {
    let total = 0;

    if (this.voucherData != undefined) {
      if (this.voucherData.length > 0) {

        for (const row of this.voucherData) {
          const value = row['period_' + columnIndex];
          if (!isNaN(value)) {
            total += value;
          }
        }

      }
    }
    const formattedTotal = total.toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });

    return { value: total, formattedValue: formattedTotal };
  }

  calcultevalues() {
    this.tot1 = 0;
    for (const row of this.voucherData) {
      const debit = parseFloat(row.total_Balance);

      if (!isNaN(debit)) {
        this.tot1 += debit;
      }


    }
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
  }

  OpenCustomerStatementForm(acc: number) {
    this.routePartsService.GuidToEdit = acc;
    const url = `/ReceivableReports/GetCustomersAccountStatementForm?acc=${acc}`;
    window.open(url, '_blank');
  }

  refresCustomeragingArabic(data) {
    debugger
    this.data = data;
    this.generateHeaders();
    this.exportData = this.data.map(x => {
      const row = {
        'الرقم': x.id,
        'العميل': x.dealerName,
        'الرصيد': x.total_Balance,
      };

      this.dynamicHeaders.forEach((header, index) => {
        const periodKey = `period_${index + 1}`;
        row[header] = x[periodKey] !== undefined ? x[periodKey] : '';
      });

      return row;
    });
  }

  refreshCustomeragingEnglish(data) {
    debugger
    this.data = data;
    this.generateHeaders();
    this.exportData = this.data.map(x => {
      const row = {
        'Customer': x.id,
        'Customer Number': x.dealerName,
        'Balance': x.total_Balance,
      };

      this.dynamicHeaders.forEach((header, index) => {
        const periodKey = `period_${index + 1}`;
        row[header] = x[periodKey] !== undefined ? x[periodKey] : '';
      });

      return row;
    });
  }

  exportExcel(dt: any) {
    debugger;
    import("xlsx").then(xlsx => {
      debugger;

      var currentLang = this.jwtAuth.getLang();
      let exportSource: any[];


      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
        exportSource = [];
      } else {
        exportSource = this.voucherData;
      }

      if (currentLang === 'ar') {
        this.refresCustomeragingArabic(exportSource);
      } else {
        this.refreshCustomeragingEnglish(exportSource);
      }


      const headers = Object.keys(this.exportData[0]);
      const totalRow: any = {};

      headers.forEach(header => {
        if (header.trim() === 'الرقم') {
          totalRow[header] = '';
          return;
        }

        const isNumeric = this.exportData.every(row => !isNaN(parseFloat(row[header])) || row[header] === '');

        if (isNumeric) {
          totalRow[header] = this.exportData.reduce((sum, row) => {
            const val = parseFloat(row[header]);
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
        } else if (header === 'العميل' || header === 'Dealer') {
          totalRow[header] = 'الإجمالي';
        } else {
          totalRow[header] = '';
        }
      });

      const exportWithTotal = [...this.exportData, totalRow];

      const worksheet = xlsx.utils.json_to_sheet(exportWithTotal);

      const workbook = {
        Sheets: { 'data': worksheet },
        SheetNames: ['data']
      };

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

    const baseHeaders = currentLang === "ar"
      ? ['الرقم', 'العميل', 'الرصيد']
      : ['Customer Number', 'Customer', 'Balance'];

    const fullHeaders = [...baseHeaders, ...this.dynamicHeaders];
    const head: string[][] = [fullHeaders];
    const rows: (number | string)[][] = [];

    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    } else if (dt.filteredValue && dt.filteredValue.length === 0 && dt.filters && Object.keys(dt.filters).length > 0) {
      exportSource = [];
    } else {
      exportSource = this.voucherData;
    }

    exportSource.forEach(item => {
      const row: (number | string)[] = [];

      row.push(item.id ?? '');           
      row.push(item.dealerName ?? '');   
      row.push(item.total_Balance ?? 0);   

      this.dynamicHeaders.forEach((_, index) => {
        const periodKey = `period_${index + 1}`;
        row.push(item[periodKey] ?? 0);
      });

      rows.push(row);
    });

    const totalRow: (number | string)[] = [];

    for (let colIndex = 0; colIndex < head[0].length; colIndex++) {
      const header = head[0][colIndex];
    for (let colIndex = 0; colIndex < head[0].length; colIndex++) {
      const header = head[0][colIndex];

      if (header === 'الرقم' || header === 'Customer Number') {
        totalRow[colIndex] = '';
        continue;
      }
      if (header === 'الرقم' || header === 'Customer Number') {
        totalRow[colIndex] = '';
        continue;
      }

      const isNumberColumn = rows.every(row =>
        typeof row[colIndex] === 'number' || !isNaN(parseFloat(row[colIndex] as string))
      );

      if (isNumberColumn) {
        const sum = rows.reduce((acc, row) =>
          acc + (parseFloat(row[colIndex] as string) || 0), 0);
        totalRow[colIndex] = sum.toFixed(2);
      } else if (header === 'العميل' || header === 'Customer') {
        totalRow[colIndex] = currentLang === 'ar' ? 'الإجمالي' : 'Total';
      } else {
        totalRow[colIndex] = '';
      }
    }

    rows.push(totalRow);
    

    if (currentLang === 'ar') {
      head[0].reverse();              
      rows.forEach(row => row.reverse()); 
    }

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar" ? "كشف أعمار ذمم العملاء": "Customers Receivables Aging";

    const pageWidth = pdf.internal.pageSize.width;

    if (currentLang === "ar") {
      pdf.text(title, pageWidth - 10, 10, { align: 'right' });
    } else {
      pdf.text(title, 10, 10, { align: 'left' });
    }

    autoTable(pdf as any, {
      head: head,
      body: rows,
      theme: "grid",
      headStyles: {
        font: "Amiri",
        halign: 'center',
        fontSize: 8,
        fontStyle: 'bold',
        textColor: "black",
        lineWidth: 0.2,
        minCellWidth: 20
      },
      bodyStyles: {
        font: "Amiri",
        halign: 'center',
        fontSize: 8,
        fontStyle: 'bold'
      },
      didParseCell(data) {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    pdf.output('dataurlnewwindow');
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
        this.cusAgingAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.cusAgingAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.cusAgingAddForm.get("currRate").setValue(0);
      this.applyCurrencyRate(0);
      this.calcultevalues();
    }
  }

  applyCurrencyRate(rate: number) {
    if (rate > 0) {
      this.voucherData = this.voucherDataOriginal.map(row => {
        return {
          ...row,
          total_Balance: rate > 0 ? (row.total_Balance / rate) : row.total_Balance
        };
      });
    }
    else {
      this.voucherData = [...this.voucherDataOriginal];
    }

  }

}
