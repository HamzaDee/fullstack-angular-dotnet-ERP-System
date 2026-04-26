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
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { InventoryReportsService } from '../invreports.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-items-balances',
  templateUrl: './items-balances.component.html',
  styleUrls: ['./items-balances.component.scss']
})
export class ItemsBalancesComponent implements OnInit {
  itemsBalanceAddForm: FormGroup;
  selectedbranch: any;
  itemsList: any;
  storesList: any;
  typesList: any;
  itemsGroupList: any;
  itemAddInfoList: any;
  branchesList: any;
  deliveredToList: any;
  authoritiesList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  //titlePage: string;
  isHidden: boolean = true;
  isUnit: number = -1;
  itemADdInfo: any;
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
  screenId: number = 141;
  custom: boolean;
  ShowDisburseEntity: boolean;
  showCost: boolean = false;
  clickCounter: { [key: number]: number } = { 0: 0, 1: 0 };
  data: any[];
  loading: boolean;
  CompanyName: string;
  public TitlePage: string;
  projectsList: any;
  Lang: string;

  constructor
    (private formbulider: FormBuilder,
      private translateService: TranslateService,
      private ReportsService: InventoryReportsService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService,
      private title: Title,
      private router: Router,

    ) { }

  ngOnInit(): void {
    debugger
    this.CompanyName = window.localStorage.getItem('companyName');
    this.SetTitlePage();
    this.GetItemBalanceForm();
    this.GetItemBalanceInitialForm();
    this.getFavouriteStatus(this.screenId);

  }

  GetItemBalanceForm() {
    debugger
    this.itemsBalanceAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      itemId: [0],
      storeId: [0],
      typeId: [0],
      itemGroupId: [0],
      branchId: [0],
      dontShowZeroBalance: false,
      onlyShowZeroBalance: false,
      showCost: false,
      fromDate: [''],
      toDate: [''],
      unitType: [0],
      itemAddInfo: [0],
      deliveredTo: [0],
      authorityId: [0],
      projectId: [0],
      byStore: [false],
      // supplierId:[0,[Validators.required, Validators.min(1)]],
    });
  }

  GetItemBalanceInitialForm() {
    debugger
    this.ReportsService.GetItemBalancesForm().subscribe((result) => {
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.itemsList = result.itemsList;
      this.storesList = result.storesList;
      this.typesList = result.typesList;
      this.itemsGroupList = result.itemsGroupList;
      this.branchesList = result.branchesList;
      this.itemAddInfoList = result.itemsAddInfoList;
      this.authoritiesList = result.authoritiesList;
      this.deliveredToList = result.deliveredToList;
      this.ShowDisburseEntity = result.showDisburseEntity;
      this.projectsList = result.projectsList;
      this.itemsBalanceAddForm.patchValue(result);
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.itemsBalanceAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        this.itemsBalanceAddForm.get("unitType").setValue(0);
        this.itemsBalanceAddForm.get("authorityId").setValue(0);
        this.itemsBalanceAddForm.get("deliveredTo").setValue(0);
        this.itemsBalanceAddForm.get("branchId").setValue(0);
        this.itemsBalanceAddForm.get("itemAddInfo").setValue(0);
        this.itemsBalanceAddForm.get("projectId").setValue(0);

        this.selectedbranch = result.branchId;
        this.isDisabled = false;
        // this.itemsBalanceAddForm.get("branchId").setValue(result.defaultBranchId);
      });
    });
  }

  GetReport() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    debugger
    setTimeout(() => {
      this.voucherData = [];
      this.clearTotals();
      debugger

      const formValues = this.itemsBalanceAddForm.value;
      if (formValues.branchId == null) {
        formValues.branchId = 0;
      }
      if (formValues.storeId == null) {
        formValues.storeId = 0;
      }

      if (formValues.dontShowZeroBalance == true) {
        formValues.onlyShowZeroBalance = 1;
      }

      else if (formValues.onlyShowZeroBalance == true) {
        formValues.onlyShowZeroBalance = 2;
      }
      else {
        formValues.onlyShowZeroBalance = 0;
      }

      if (formValues.byStore == true) {
        formValues.byStore = 1;
      }
      else {
        formValues.byStore = 0;
      }

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.ReportsService.GetItemBalances(
        formValues.fromDate,
        formValues.toDate,
        formValues.itemGroupId,
        formValues.itemId,
        formValues.typeId,
        formValues.storeId,
        formValues.onlyShowZeroBalance,
        formValues.branchId,
        formValues.unitType,
        this.itemADdInfo,
        formValues.deliveredTo,
        formValues.authorityId,
        formValues.projectId,
        formValues.byStore
      ).subscribe((result) => {
        debugger


        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresItemsBalancesArabic(this.voucherData);
        }
        else {
          this.refreshItemsBalancesEnglish(this.voucherData);
        }

        if (this.voucherData.length > 0) {
          this.calcultevalues()
          this.egretLoader.close();
        }
        else {
          this.egretLoader.close();
        }

      });
    });
  }



  PrintReport() {
    debugger
    this.Lang = this.jwtAuth.getLang();
    const formValues = this.itemsBalanceAddForm.value;
    formValues.fromDate = formatDate(new Date(formValues.fromDate), 'yyyy-MM-dd', 'en');
    formValues.toDate = formatDate(new Date(formValues.toDate), 'yyyy-MM-dd', 'en');

    if (formValues.ShowZeroBalance == true) {
      formValues.ShowZeroBalance = 1;
    }
    if(formValues.showCost ==0)
      formValues.showCost = false;

    if (this.Lang == "ar") {
      const reportUrl = `RptItemBalancesAR?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&GroupId=${formValues.itemGroupId}&catID=${formValues.typeId}&ItemId=${formValues.itemId}&BranchId=${formValues.branchId}&StoreId=${formValues.storeId}&ByStore=${formValues.byStore}
                       &ShowZeroBalance=${formValues.onlyShowZeroBalance}&UnitType=${formValues.unitType}&EntityId=${formValues.deliveredTo}&ProjectId=${formValues.projectId}&AuthorityId=${formValues.authorityId}&showCost=${formValues.showCost}`;

      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');

    }
    else {
      const reportUrl = `RptItemBalancesEN?Lang=${this.jwtAuth.getLang()}&CompanyId=${this.jwtAuth.getCompanyId()}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&GroupId=${formValues.itemGroupId}&catID=${formValues.typeId}&ItemId=${formValues.itemId}&BranchId=${formValues.branchId}&StoreId=${formValues.storeId}&ByStore=${formValues.byStore}
                       &ShowZeroBalance=${formValues.onlyShowZeroBalance}&UnitType=${formValues.unitType}&EntityId=${formValues.deliveredTo}&ProjectId=${formValues.projectId}&AuthorityId=${formValues.authorityId}&showCost=${formValues.showCost}`;
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/report-viewer'], {
          queryParams: { reportUrl }
        })
      );
      debugger
      window.open(url, '_blank');
    }

  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('MaterialBalance');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    debugger
    this.itemsBalanceAddForm.reset();
    this.voucherData = [];
    this.itemADdInfo = "";
    this.GetItemBalanceInitialForm();
    this.clearTotals();
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
      this.totalWithCost += Number(this.voucherData[r].cost);//Number(this.voucherData[r].totalInput - this.voucherData[r].totalOutput) * Number(this.voucherData[r].cost);
    }

    this.total = this.totbefore + this.tot1 - this.tot2;

    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot1);
    this.tot2Formatted = this.appCommonserviceService.formatCurrencyNumber(this.tot2);
    this.tot3Formatted = this.appCommonserviceService.formatCurrencyNumber(this.totbefore);
    this.totalFormatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
    this.totalwCostFormatted = this.appCommonserviceService.formatCurrencyNumber(this.totalWithCost);
  }

  RadioClick(value) {
    debugger;

    if (this.isUnit === value) {
      this.isUnit = -1;
      this.itemsBalanceAddForm.patchValue({ unitType: -1 });
    } else {
      this.isUnit = value;
      this.itemsBalanceAddForm.patchValue({ unitType: this.isUnit });
    }
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

  getFavouriteStatus(screenId) {
    debugger
    this.appCommonserviceService.GetFavouriteStatus(screenId).subscribe(result => {
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

  onCostChange() {
    debugger
    this.voucherData = [];
    this.tot1Formatted = '0.000';
    this.tot2Formatted = '0.000';
    this.tot3Formatted = '0.000';
    this.totalFormatted = '0.000';
    this.totalwCostFormatted = '0.000';
  }

  onDontShowZeroBalanceClick() {
    const dontShowZeroBalance = this.itemsBalanceAddForm.get('dontShowZeroBalance').value;
    this.itemsBalanceAddForm.get('dontShowZeroBalance').setValue(!dontShowZeroBalance);
    this.itemsBalanceAddForm.get('onlyShowZeroBalance').setValue(false);
    this.voucherData = [];
  }

  onOnlyShowZeroBalanceClick() {
    const onlyShowZeroBalance = this.itemsBalanceAddForm.get('onlyShowZeroBalance').value;
    this.itemsBalanceAddForm.get('onlyShowZeroBalance').setValue(!onlyShowZeroBalance);
    this.itemsBalanceAddForm.get('dontShowZeroBalance').setValue(false);
    this.voucherData = [];
  }

  onByStoreClick(event: any) {
    debugger
    if (event.currentTarget.checked) {
      this.itemsBalanceAddForm.get("storeId").setValue(0)
      this.itemsBalanceAddForm.get("storeId").disable();
    }
    else {
      this.itemsBalanceAddForm.get("storeId").enable();
    }
    this.voucherData = [];
  }

  OpenItemTransactionsForm(item: number) {
    debugger
    this.routePartsService.GuidToEdit = item;
    const url = `/InventoryReports/GetItemTransactionsForm?item=${item}`;
    window.open(url, '_blank');
  }

  FillValue(event) {
    debugger
    if (event.value > 0) {
      const selectedItem = this.itemAddInfoList.find(r => r.id == event.value);
      const selectedText = selectedItem ? selectedItem.text : '';
      this.itemADdInfo = selectedText;
    }
    else {
      this.itemADdInfo = "";
    }
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

  AuthloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.authoritiesList) {
      this.authoritiesList = [];
    }

    // Make sure the array is large enough
    while (this.authoritiesList.length < last) {
      this.authoritiesList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.authoritiesList[i] = this.authoritiesList[i];
    }

    this.loading = false;
  }

  ProjloadLazyOptions(event: any) {
    const { first, last } = event;

    // Don't replace the full list; copy and fill only the needed range
    if (!this.projectsList) {
      this.projectsList = [];
    }

    // Make sure the array is large enough
    while (this.projectsList.length < last) {
      this.projectsList.push(null);
    }

    for (let i = first; i < last; i++) {
      this.projectsList[i] = this.projectsList[i];
    }

    this.loading = false;
  }

  refresItemsBalancesArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'رقم المادة': x.itemNo,
      'اسم المادة': x.itemName,
      'اسم المستودع': x.storeName,
      'المجموعه': x.groupName,
      'الصنف': x.categoryName,
      'الوحدة': x.unitName,
      'رصيد ماقبله': x.beforeBalance,
      'مجموع الداخل': x.totalInput,
      'مجموع الخارج': x.totalOutput,
      'الرصيد': x.totalInput - x.totalOutput,
      'الكلفه': x.cost,
    }));
  }

  refreshItemsBalancesEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => ({
      'Material Number': x.itemNo,
      'Material Name': x.itemName,
      'Store Name': x.storeName,
      'Group': x.groupName,
      'Item': x.categoryName,
      'Unit': x.unitName,
      'Before Balance': x.beforeBalance,
      'Total Income': x.totalInput,
      'Total Outcome': x.totalOutput,
      'Balance': x.totalInput - x.totalOutput,
      'Cost': x.cost,
    }));
  }

exportExcel() {
  import("xlsx").then(xlsx => {

    // 🟢 إنشاء الشيت من البيانات
    const worksheet = xlsx.utils.json_to_sheet(this.exportData);

    const headers = Object.keys(this.exportData[0]);

    // 🟢 تحديد اللغة
    const isArabic = headers.some(h =>
      h.includes('رصيد ماقبله') || h.includes('مجموع الداخل'));

    const title = isArabic
      ? 'تقرير أرصدة المواد'
      : 'Items Balance Report';

    // 🟢 تحويل البيانات إلى array
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // 🟢 إضافة العنوان + سطر فارغ
    data.unshift([]);
    data.unshift([title]);

    // 🟢 حساب المجاميع
    const totalBeforeBalance = this.voucherData.reduce((sum, item) =>
      sum + parseFloat(item.beforeBalance?.toString().trim() || "0"), 0);

    const totalInput = this.voucherData.reduce((sum, item) =>
      sum + parseFloat(item.totalInput?.toString().trim() || "0"), 0);

    const totalOutput = this.voucherData.reduce((sum, item) =>
      sum + parseFloat(item.totalOutput?.toString().trim() || "0"), 0);

    const totalBalance = this.voucherData.reduce((sum, item) =>
      sum + (parseFloat(item.totalInput || "0") - parseFloat(item.totalOutput || "0")), 0);

/*     const totalLabel = isArabic ? 'المجموع' : 'Total';

    const fieldMap = isArabic
      ? {
        'رصيد ماقبله': totalBeforeBalance,
        'مجموع الداخل': totalInput,
        'مجموع الخارج': totalOutput,
        'الرصيد': totalBalance,
      }
      : {
        'Before Balance': totalBeforeBalance,
        'Total Income': totalInput,
        'Total Outcome': totalOutput,
        'Balance': totalBalance,
      }; */

    // 🟢 إنشاء صف المجموع كامل
    const totalRow: any = {};

    headers.forEach((header, index) => {
      const key = header.trim();

      if (index === 0) {
       // totalRow[key] = totalLabel;
      } //else if (fieldMap[key] !== undefined) {
      //  totalRow[key] = +fieldMap[key].toFixed(2);
      //} 
      else {
        totalRow[key] = '';
      }
    });

    // 🟢 إضافة صف المجموع
    data.push(headers.map(h => totalRow[h]));

    // 🟢 إنشاء شيت جديد
    const newWorksheet = xlsx.utils.aoa_to_sheet(data as any[][]);

    // 🟢 دمج العنوان عبر الأعمدة
    newWorksheet['!merges'] = [{
      s: { r: 0, c: 0 },
      e: { r: 0, c: headers.length - 1 }
    }];

    // 🟢 تحديث الرينج
    const range = xlsx.utils.decode_range(newWorksheet['!ref']!);
    range.e.r = data.length - 1;
    newWorksheet['!ref'] = xlsx.utils.encode_range(range);

    // 🟢 التصدير
    const workbook = {
      Sheets: { 'data': newWorksheet },
      SheetNames: ['data']
    };

    const excelBuffer: any = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

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

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الكلفه', 'الرصيد', 'مجموع الخارج', ' مجموع الداخل', ' رصيد ماقبله', 'الوحدة', ' الصنف', 'المجموعه', 'اسم المستودع', 'اسم المادة', 'رقم المادة']]
    }
    else {
      head = [['Cost', 'Balance', 'Total Outcome', 'Total Income', 'Before Balance', 'Unit', 'Item', ' Group', 'Store Name', 'Material Name', 'Material Number']]
    }
    const rows: (number | string)[][] = [];
    let totalBeforeBalance = 0;
    let totalInput = 0;
    let totalOutput = 0;
    let totalBalance = 0;

    this.voucherData.forEach(function (part) {
      let temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = part.storeName
      temp[3] = part.groupName
      temp[4] = part.categoryName
      temp[5] = part.unitName
      temp[6] = part.beforeBalance
      temp[7] = part.totalInput
      temp[8] = part.totalOutput
      temp[9] = part.totalInput - part.totalOutput
      temp[10] = part.cost

      totalBeforeBalance += parseFloat(part.beforeBalance) || 0;
      totalInput += parseFloat(part.totalInput) || 0;
      totalOutput += parseFloat(part.totalOutput) || 0;
      totalBalance += parseFloat(part.totalInput) - parseFloat(part.totalOutput) || 0;
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const columnCount = head[0].length;

    let footRow: (string | number)[] = new Array(columnCount).fill('');
    let foot: (string | number)[][];

    if (currentLang === "ar") {
 /*      footRow[5] = "المجموع";
      footRow[6] = totalBeforeBalance.toFixed(2);
      footRow[7] = totalInput.toFixed(2);
      footRow[8] = totalOutput.toFixed(2);
      footRow[9] = totalBalance.toFixed(2); */
    } else {
/*       footRow[5] = "Total";
      footRow[6] = totalBeforeBalance.toFixed(2);
      footRow[7] = totalInput.toFixed(2);
      footRow[8] = totalOutput.toFixed(2);
      footRow[9] = totalBalance.toFixed(2); */
    }

    foot = [footRow.reverse()];

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const title = currentLang === "ar"
      ? "تقرير ارصدة المواد"
      : "Items Balances";

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

}
