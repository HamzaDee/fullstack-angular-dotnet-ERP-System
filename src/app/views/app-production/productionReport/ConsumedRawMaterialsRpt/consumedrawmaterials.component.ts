import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorsService } from 'app/shared/services/validators.service';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ProductionReportService } from '../../productionReport/production-report.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-consumedrawmaterials',
  templateUrl: './consumedrawmaterials.component.html',
  styleUrl: './consumedrawmaterials.component.scss'
})
export class ConsumedrawmaterialsComponent implements OnInit {
  ConsumedRawMaterialsForm: FormGroup;
  showItemId: boolean = false;
  producedMaterialsList: any;
  productionVouchersList: any;
  storesList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  isHidden: boolean = true;
  voucherData: any[];
  headerData: any;
  isDisabled: boolean = true;
  total: number = 0;
  exportData: any[];
  exportColumns: any[];
  tot1Formatted: string = '0';
  screenId: number = 266;
  custom: boolean;
  data: any[];
  public TitlePage: string;
  Lang: any;

  constructor
    (
      private formbulider: FormBuilder,
      private translateService: TranslateService,
      private service: ProductionReportService,
      private alert: sweetalert,
      public ValidatorsService: ValidatorsService,
      private jwtAuth: JwtAuthService,
      public routePartsService: RoutePartsService,
      private egretLoader: AppLoaderService,
      private route: ActivatedRoute,
      private appCommonserviceService: AppCommonserviceService,
      private cdr: ChangeDetectorRef,
      private title: Title,
      private router: Router,

    ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProducedMaterialsForm();
    this.GetProducedMaterialsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetProducedMaterialsForm() {
    debugger
    this.ConsumedRawMaterialsForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      itemId: [0],
      prodId: [0],
      storeId: [0],
      fromDate: [""],
      toDate: [""],
    });
  }

  GetProducedMaterialsInitialForm() {
    debugger
    this.service.GetConsumedRawMaterialsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
      result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
      this.producedMaterialsList = result.producedMaterialsList;
      this.productionVouchersList = result.productionVouchersList;
      this.storesList = result.storesList;
      this.ConsumedRawMaterialsForm.get("fromDate").setValue(result.fromDate);
      this.ConsumedRawMaterialsForm.get("toDate").setValue(result.toDate);
      this.ConsumedRawMaterialsForm.get("itemId").setValue(0);
      this.ConsumedRawMaterialsForm.get("prodId").setValue(0);
      this.ConsumedRawMaterialsForm.get("storeId").setValue(0);
      this.ConsumedRawMaterialsForm.patchValue(result);
    });
  }

  GetReport() {
    debugger
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.clearTotals();
      debugger

      const formValues = this.ConsumedRawMaterialsForm.value;
      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      this.service.GetConsumedRawMaterials(formValues.fromDate, formValues.toDate, formValues.prodId, formValues.itemId, formValues.storeId).subscribe((result) => {
        debugger
        this.voucherData = result;
        if (currentLang == "ar") {
          this.refresReorderItemsArabic(this.voucherData);
        }
        else {
          this.refreshReorderItemsEnglish(this.voucherData);
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
    const formValues = this.ConsumedRawMaterialsForm.value;


    if (this.Lang == "ar") {
      const reportUrl = `RptConsumedrawMaterialsAR?CompanyId=${this.jwtAuth.getCompanyId()}&Lang=${this.Lang}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&ItemId=${formValues.itemId}&StoreId=${formValues.storeId}&ProdId=${formValues.prodId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptConsumedrawMaterialsEN?CompanyId=${this.jwtAuth.getCompanyId()}&Lang=${this.Lang}&FromDate=${formValues.fromDate}&ToDate=${formValues.toDate}&ItemId=${formValues.itemId}&StoreId=${formValues.storeId}&ProdId=${formValues.prodId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('Consumedrawmaterials');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.ConsumedRawMaterialsForm.reset();
    this.voucherData = [];
    this.GetProducedMaterialsInitialForm();
    this.clearTotals();
  }

  calcultevalues() {
    debugger

    for (const row of this.voucherData) {
      const input = parseFloat(row.totalCost);
      if (!isNaN(input)) {
        this.total += input;
      }
    }
    this.tot1Formatted = this.appCommonserviceService.formatCurrencyNumber(this.total);
  }

  clearTotals() {
    this.total = 0;
    this.tot1Formatted = '0.000';
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

  refresReorderItemsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': voucherDate,
        'اسم المادة': x.itemName,
        'الوحدة': x.unitName,
        'المستودع': x.storeName,
        'الكمية': x.qty,
        ' الكلفة': x.cost,
        ' الكمية الفعلية المستهلكة': x.actualQty,
        'مجموع الكلفة': x.totalCost,
        ' الفرق': x.diffQty,
      }
    });
  }

  refreshReorderItemsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Number': x.voucherNo,
        'Voucher Name': x.voucherName,
        'Voucher Date': voucherDate,
        'Material Name': x.itemName,
        'unit': x.unitName,
        'Store': x.storeName,
        'Quantity': x.qty,
        'Cost': x.cost,
        'Actual Qty Consumed': x.actualQty,
        'Total Cost': x.totalCost,
        'Difference': x.diffQty,
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
       head = [[' الفرق', 'مجموع الكلفة', ' الكمية الفعلية المستهلكة', 'الكلفة ', 'الكمية', 'المستودع', 'الوحدة', 'اسم المادة', 'تاريخ السند', 'نوع السند', ' رقم السند']]
    }
    else {
       head = [['Difference', 'Total Cost', 'Actual Qty Consumed', 'Store', 'unit', 'Material Name', 'Voucher Date', 'Voucher Name', 'Voucher Number']]
    }
    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = voucherDate
      temp[3] = part.itemName
      temp[4] = part.unitName
      temp[5] = part.storeName
      temp[6] = part.qty
      temp[7] = part.cost
      temp[8] = part.actualQty
      temp[9] = part.totalCost
      temp[10] = part.diffQty
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

    const Title = currentLang == "ar" ? "كشف المواد الخام المستهلكة" :"Consumed Raw Materials Report";
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

