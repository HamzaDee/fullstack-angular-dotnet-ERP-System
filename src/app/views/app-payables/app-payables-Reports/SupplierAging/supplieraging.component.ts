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
import { SupplierReportsService } from '../payablesreports.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-supplieraging',
  templateUrl: './supplieraging.component.html',
  styleUrls: ['./supplieraging.component.scss']
})
export class SupplieragingComponent implements OnInit {
  supAgingAddForm: FormGroup;
  selectedsup: any;
  selectedbranch: any;
  dynamicHeaders: string[] = [];
  data: any[] = [];
  vStatusList: any;
  suppliersList: any;
  userbranchList: any;
  categoriesList: any;
  dealerTypesList: any;
  classificationList: any;
  employeesList: any;
  OB: any;
  accVoucherList: any;
  selectedstatus: number;
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
  screenId: number = 126;
  custom: boolean;
  voucherDataOriginal: any[] = [];
  public TitlePage: string;
  currenciesList: any;
  defaultStatus : number;

  constructor
    (
      private title: Title,
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: SupplierReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService
    ) { }

  ngOnInit(): void {
    debugger
    this.SetTitlePage();

    this.route.queryParams.subscribe((params: Params) => {
      this.supplierNumber = +params['acc'];
    });
    this.GetSupplierAgingForm();
    this.GetSupplierAgingInitialForm();
    this.getFavouriteStatus(this.screenId);
    this.generateHeaders();
  }


  GetSupplierAgingForm() {
    debugger
    this.supAgingAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      supplierId: [0],
      voucherStatus: [this.defaultStatus],
      branchId: [0],
      categoryId: [0],
      classId: [0],
      employeeId: [0],
      period: [0, [Validators.required, Validators.min(1)]],
      dealerTypeId: [0],
      toDate: [''],
      currencyId: [0],
      currRate: [0],
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SupplierAging');
    this.title.setTitle(this.TitlePage);
  }
  GetSupplierAgingInitialForm() {
    this.ReportsService.GetSupplierAgingForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.suppliersList = result.suppliersList;
      this.vStatusList = result.statusList;
      this.userbranchList = result.branchesList;
      this.categoriesList = result.categorysList;
      this.classificationList = result.classficationsList;
      this.employeesList = result.employeesList;
      this.dealerTypesList = result.dealerTypesList;
      this.currenciesList = result.currenciesList;
      debugger
      this.supAgingAddForm.patchValue(result);
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.supAgingAddForm.patchValue(result);

      debugger
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        this.selectedsup = result.supplierId;
        this.selectedbranch = result.branchId;
        this.isDisabled = true;
        this.supAgingAddForm.get("categoryId").setValue(0);
        this.supAgingAddForm.get("classId").setValue(0);
        this.supAgingAddForm.get("employeeId").setValue(0);
        this.supAgingAddForm.get("period").setValue(30);
        // this.supAgingAddForm.get("branchId").setValue(result.defaultBranchId);
        debugger
        if (!isNaN(Number(this.supplierNumber)) && Number(this.supplierNumber) !== 0) {
          this.selectedsup = this.supplierNumber;
        }
        this.selectedstatus = 0;
        this.isPost = 1;
        this.supAgingAddForm.value.post = this.isPost;
        this.defaultStatus = this.vStatusList.find(c=> c.data4 == true).id;
        this.supAgingAddForm.get("voucherStatus").setValue(this.defaultStatus);


        debugger
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();

    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.supAgingAddForm.value.voucherStatus


      const formValues = this.supAgingAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = -1;
      }
      if (formValues.note == null || formValues.note == "null") {
        formValues.note = '';
      }
      debugger
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetSupplierAging(
        formValues.supplierId,
        formValues.voucherStatus,
        formValues.toDate,
        formValues.categoryId,
        formValues.classId,
        formValues.branchId,
        formValues.employeeId,
        formValues.period,
        formValues.dealerTypeId,
        formValues.currencyId,
        formValues.currRate
      ).subscribe((result) => {
        debugger

        if (Array.isArray(result)) {
          this.voucherDataOriginal = JSON.parse(JSON.stringify(result));
          this.voucherData = result;
          this.data = result;

          const currentRate = Number(this.supAgingAddForm.get("currRate")?.value);

          if (currentRate > 0) {
            this.applyCurrencyRate(currentRate);
          } else {
            this.voucherData = [...this.voucherDataOriginal];
          }


          if (currentLang == "ar") {
            this.refresSupplieragingArabic(this.voucherData);
          }
          else {
            this.refreshSupplieragingEnglish(this.voucherData);
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
    this.supAgingAddForm.reset();
    const currentDate = new Date().toISOString().split('T')[0];
    this.supAgingAddForm.get('toDate').setValue(currentDate);
    this.voucherData = [];
    this.supAgingAddForm.get('supplierId').setValue(0);
    this.supAgingAddForm.get('branchId').setValue(0);
    this.supAgingAddForm.get('categoryId').setValue(0);
    this.supAgingAddForm.get('classId').setValue(0);
    this.supAgingAddForm.get('voucherStatus').setValue(0);
    this.supAgingAddForm.get('employeeId').setValue(0);
    this.supAgingAddForm.get('dealerTypeId').setValue(0);
    this.supAgingAddForm.get('currencyId').setValue(0);
    this.supAgingAddForm.get('currRate').setValue(0);
    this.supAgingAddForm.get('period').setValue(30);

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

  generateHeaders() {
    debugger
    let days = this.supAgingAddForm.get('period').value;
    days = days ? days : 30;

    this.dynamicHeaders = [];
    debugger
    for (let i = 0; i < 5; i++) {
      const startRange = (i * days) + (i > 0 ? 1 : 0);
      const endRange = (i + 1) * days;
      const header = `${startRange} - ${endRange}`;
      this.dynamicHeaders.push(header);
    }
    debugger
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
    debugger
    this.tot1 = 0;
    for (const row of this.voucherData) {
      const debit = parseFloat(row.total_Balance);

      if (!isNaN(debit)) {
        this.tot1 += debit;
      }


    }
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
  }

  OpenSupplierStatementForm(acc: number) {
    debugger
    this.routePartsService.GuidToEdit = acc;
    const url = `/PayablesReport/GetSupplierAccountStatementForm?acc=${acc}`;
    window.open(url, '_blank');
  }

  refresSupplieragingArabic(data) {
    debugger
    this.data = data;
    this.generateHeaders();
    this.exportData = this.data.map(x => {
      const row = {
        'الرقم ': x.id,
        'المورد': x.dealerName,
        'الرصيد': x.total_Balance,
      };

      this.dynamicHeaders.forEach((header, index) => {
        const periodKey = `period_${index + 1}`;
        row[header] = x[periodKey] !== undefined ? x[periodKey] : '';
      });

      return row;
    });
  }

  refreshSupplieragingEnglish(data) {
    debugger
    this.data = data;
    this.generateHeaders();
    this.exportData = this.data.map(x => {
      const row = {
        'Number ': x.id,
        'Supplier': x.dealerName,
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
        this.refresSupplieragingArabic(exportSource);
      } else {
        this.refreshSupplieragingEnglish(exportSource);
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
        } else if (header === 'المورد' || header === 'Dealer') {
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
      ? ['الرقم', 'المورد', 'الرصيد']
      : ['Number', 'Supplier', 'Balance'];


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
      row.push(item.total_Balance.toFixed(3) ?? 0);

      this.dynamicHeaders.forEach((_, index) => {
        const periodKey = `period_${index + 1}`;
        row.push(item[periodKey] ?? 0);
      });

      rows.push(row);
    });

    const totalRow: (number | string)[] = [];

    for (let colIndex = 0; colIndex < head[0].length; colIndex++) {
      const header = head[0][colIndex];

      if (header === 'الرقم' || header === 'Number') {
        totalRow[colIndex] = '';
        continue;
      }

      const isNumberColumn = rows.every(row =>
        typeof row[colIndex] === 'number' || !isNaN(parseFloat(row[colIndex] as string))
      );

      if (isNumberColumn) {
        const sum = rows.reduce((acc, row) =>
          acc + (parseFloat(row[colIndex] as string) || 0), 0);
        totalRow[colIndex] = sum.toFixed(3);
      } else if (header === 'المورد' || header === 'Supplier') {
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


    const title = currentLang === "ar" ? "كشف أعمار الذمم الدائنة" : "Suppliers Payables Aging";
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

  onCurrencyChange(value: any) {
    debugger;
    if (value > 0) {
      let curr = this.currenciesList.find(c => c.id == value);

      if (curr) {
        this.supAgingAddForm.get("currRate").setValue(Number(curr.data1));
        this.applyCurrencyRate(curr.data1);
        this.calcultevalues();
      }
      else {
        this.supAgingAddForm.get("currRate").setValue(0);
        this.applyCurrencyRate(0);
        this.calcultevalues();
      }
    }
    else {
      this.supAgingAddForm.get("currRate").setValue(0);
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
