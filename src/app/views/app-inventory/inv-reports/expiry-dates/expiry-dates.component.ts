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
import { InventoryReportsService } from '../invreports.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-expiry-dates',
  templateUrl: './expiry-dates.component.html',
  styleUrls: ['./expiry-dates.component.scss']
})
export class ExpiryDatesComponent implements OnInit {
  itemsBatchesAddForm: FormGroup;
  selectedbranch: any;
  itemsList: any;
  itemsGroupList: any;
  typesList: any;
  branchesList: any;
  storesList: any;
  data: any[];
  showStore: number;
  showEndItems: number;
  dontShowZeroBalance: number;
  toThisDate: number;
  forThisDate: number;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  isUnit: number = -1;
  voucherData: any;
  headerData: any;
  isDisabled: boolean = false;
  selectAll: boolean = false;
  isAnyRowChecked: boolean = false;
  total: number = 0;
  totalWithCost: number = 0;
  tot1: number = 0;
  tot2: number = 0;
  totbefore: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  tot2Formatted: string = '0';
  tot3Formatted: string = '0';
  totalFormatted: string = '0';
  totalwCostFormatted: string = '0';
  screenId: number = 144;
  custom: boolean;
  loading: boolean;

  public TitlePage: string;

  constructor
    (private title: Title,

      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: InventoryReportsService,
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
    this.GetItemBalanceForm();
    this.GetItemBalanceInitialForm();
    this.getFavouriteStatus(this.screenId);

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReportOfPatchBalancesAndExpirationDatesOfItems');
    this.title.setTitle(this.TitlePage);
  }

  GetItemBalanceForm() {
    debugger
    this.itemsBatchesAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      batchNo: [''],
      itemId: [0],
      groupId: [0],
      typeId: [0],
      branchId: [0],
      storeId: [0],
      thisDate: [0],
      thisToDate: [0]
      // supplierId:[0,[Validators.required, Validators.min(1)]],
    });
  }

  GetItemBalanceInitialForm() {
    debugger
    this.ReportsService.GetItemBatchForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.typesList = result.typesList;
      this.itemsGroupList = result.groupsList;
      this.branchesList = result.branchesList;
      this.itemsBatchesAddForm.patchValue(result);
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.itemsBatchesAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        // this.isUnit = 0;
        // this.itemsBatchesAddForm.get("unitType").setValue(-1);
        this.selectedbranch = result.branchId;
        this.isDisabled = false;
        this.itemsBatchesAddForm.get("branchId").setValue(0);
      });
    });
  }

  GetReport() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger

      const formValues = this.itemsBatchesAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      if (formValues.storeId == null) {
        formValues.storeId = 0;
      }

      if (this.dontShowZeroBalance == 1) {
        this.dontShowZeroBalance = 1;
      }
      else {
        this.dontShowZeroBalance = 0;
      }
      if (this.showStore == 1) {
        this.showStore = 1;
      }
      else {
        this.showStore = 0;
      }
      if (this.showEndItems == 1) {
        this.showEndItems = 1;
      }
      else {
        this.showEndItems = 0;
      }

      if (this.toThisDate == 1) {
        this.toThisDate = 1;
      }
      else {
        this.toThisDate = 0;
      }
      if (this.forThisDate == 1) {
        this.forThisDate = 1;
      }
      else {
        this.forThisDate = 0;
      }
      debugger
      // if(this.toThisDate == 1)
      // {
      if (formValues.fromDate == "" || formValues.fromDate == "0001-01-01T00:00:00") {
        formValues.fromDate = formatDate(this.DateNow, "yyyy-MM-dd", "en-US");//this.itemsBatchesAddForm.get("fromDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
      }

      // }
      //  if(this.forThisDate == 1)
      //  {
      if (formValues.toDate == "" || formValues.toDate == "0001-01-01T00:00:00") {
        formValues.toDate = formatDate(this.DateNow, "yyyy-MM-dd", "en-US");//this.itemsBatchesAddForm.get("toDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
      }

      //  }


      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetItemBatch(
        formValues.fromDate,
        formValues.toDate,
        formValues.groupId,
        formValues.typeId,
        formValues.itemId,
        formValues.branchId,
        formValues.storeId,
        formValues.batchNo,
        this.showStore,
        this.showEndItems,
        this.dontShowZeroBalance,
        this.toThisDate,
        this.forThisDate,
      ).subscribe((result) => {
        debugger

        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresExpiryDatesArabic(this.voucherData);
        }
        else {
          this.refreshExpiryDatesEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0) {
          // this.calcultevalues()
          this.egretLoader.close();
        }
        else {
          this.egretLoader.close();
        }

      });
    });
  }

  clearFormData() {
    this.itemsBatchesAddForm.reset();
    this.voucherData = [];
    this.toThisDate = 0;
    this.forThisDate = 0;
    this.GetItemBalanceInitialForm();
    this.clearTotals();
    this.showStore = 0;
    this.showEndItems = 0;
    this.dontShowZeroBalance = 0;
    this.itemsBatchesAddForm.get("itemId").setValue(0);
    this.itemsBatchesAddForm.get("branchId").setValue(0);
  }

  calcultevalues() {
    debugger
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.totbefore = 0;
    this.totalWithCost = 0;

    for (const row of this.voucherData) {
      const input = parseFloat(row.totalInput);
      const output = parseFloat(row.totalOutput);
      const begbalance = parseFloat(row.beforeBalance);
      if (!isNaN(input)) {
        this.tot1 += input;
      }

      if (!isNaN(output)) {
        this.tot2 += output;
      }

      if (!isNaN(begbalance)) {
        this.totbefore += begbalance;
      }
    }
    for (let r = 0; r < this.voucherData.length; r++) {
      this.totalWithCost += Number(this.voucherData[r].totalInput - this.voucherData[r].totalOutput) * Number(this.voucherData[r].cost);
    }

    this.total = this.tot1 - this.tot2;

    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
    this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
    this.tot3Formatted = this.appCommonserviceService.formatCurrencyNumber(this.totbefore);
    this.totalwCostFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalWithCost);
  }

  clearTotals() {
    this.total = 0;
    this.tot1 = 0;
    this.tot2 = 0;
    this.totbefore = 0;
    this.totalWithCost = 0;
    this.tot1Formatted = '0.000';
    this.tot2Formatted = '0.000';
    this.totalFormatted = '0.000';
    this.tot3Formatted = '0.000';
    this.totalwCostFormatted = '0.000';
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
 
  OpenItemTransactionsForm(item: number) {
    debugger
    this.routePartsService.GuidToEdit = item;
    const url = `/InventoryReports/GetItemTransactionsForm?item=${item}`;
    window.open(url, '_blank');
  }

  OnChange(value) {
    debugger
    if (value == true) {
      $('#fDate').prop('disabled', false);
      this.itemsBatchesAddForm.get("fromDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
      this.forThisDate = 0;
      $('#tDate').prop('disabled', true);
      this.itemsBatchesAddForm.get("toDate").setValue('');
    }
    else {
      $('#fDate').prop('disabled', true);
      this.itemsBatchesAddForm.get("fromDate").setValue('');
    }
  }

  OnChange2(value) {
    debugger
    if (value == true) {
      $('#tDate').prop('disabled', false);
      this.itemsBatchesAddForm.get("toDate").setValue(formatDate(this.DateNow, "yyyy-MM-dd", "en-US"));
      this.toThisDate = 0;
      $('#fDate').prop('disabled', true);
      this.itemsBatchesAddForm.get("fromDate").setValue('');

    }
    else {
      $('#tDate').prop('disabled', true);
      this.itemsBatchesAddForm.get("toDate").setValue('');
    }
  }

  refresExpiryDatesArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('ar-EG');
      return {
        'رقم المادة': x.itemNo,
        'اسم المادة': x.itemName,
        'تاريخ الصلاحية': expiryDate,
        'رقم الباتش': x.batchNo,
        'الكمية': x.balance,
      }
    });
  }

  refreshExpiryDatesEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const expiryDate = new Date(x.expiryDate).toLocaleDateString('en-GB');
      return {
        'Material Number': x.itemNo,
        'Material Name': x.itemName,
        'Expiry Date': expiryDate,
        'Patch Number': x.batchNo,
        'Quentity': x.balance,
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
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [[' الكمية', ' رقم الباتش', ' تاريخ الصلاحية', ' اسم المادة', ' رقم المادة']]
    }
    else {
      var head = [['Quentity', 'Patch Number', 'Expiry Date', 'Material Name', 'Material Number']]
    }
    var rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date = new Date(part.expiryDate);
      const expiryDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = expiryDate
      temp[3] = part.batchNo
      temp[4] = part.balance

     if (isArabic) {
       temp.reverse();
     }
     rows.push(temp)
   },this.data)
  
    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    let Title;
    if (currentLang == "ar") {
      Title = "تقرير ارصدةالباتش وتاريخ صلاحيةالمواد";
    }
    else {
      Title = "Items Batches And Expiry Date Report ";
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

  loadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.itemsList) {
      this.itemsList = [];
    }

    // Make sure the array is large enough
    while (this.itemsList.length < last) {
      this.itemsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.itemsList[i] = this.itemsList[i];
    }

    this.loading = false;
  }

}