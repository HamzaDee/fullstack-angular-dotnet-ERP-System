import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, RequiredValidator, FormControl } from '@angular/forms';
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
import { ActivatedRoute } from '@angular/router';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { InventoryReportsService } from '../invreports.service';
import { ChangeDetectorRef } from '@angular/core';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-reserve-items',
  templateUrl: './reserve-items.component.html',
  styleUrls: ['./reserve-items.component.scss']
})
export class ReserveItemsComponent implements OnInit {
  ReservedItemsAddForm: FormGroup;
  showItemId: boolean = false;
  itemsList: any;
  groupsList: any;
  typesList: any;
  branchesList: any;
  storesList: any;
  customersList: any;
  DateNow: Date = new Date();
  showLoader = false;
  hasPerm: boolean;
  titlePage: string;
  voucherData: any;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 146;
  custom: boolean;
  collective: boolean;
  data: any[];
  loading: boolean;
  public TitlePage: string;

  constructor
            (    
              private title: Title,
              private formbulider: FormBuilder,
              private translateService: TranslateService ,
              private ReportsService: InventoryReportsService,
              private alert: sweetalert,
              public ValidatorsService:ValidatorsService,
              private jwtAuth: JwtAuthService,
              public routePartsService: RoutePartsService,
              private egretLoader: AppLoaderService,
              private route: ActivatedRoute,
              private serv: AppCommonserviceService,
              private cdr: ChangeDetectorRef
            ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetReservedItemsForm();
    this.GetReservedItemsInitialForm();
    this.getFavouriteStatus(this.screenId);
  }

  GetReservedItemsForm() {
    debugger
    this.ReservedItemsAddForm = this.formbulider.group({
      id: [0],
      companyId: [0],
      fromDate: [''],
      toDate: [''],
      itemId: [0],
      groupId: [0],
      catId: [0],
      branchId: [0],
      storeId: [0],
      customerId: [0],
      isDetalid: [0],
      // supplierId:[0,[Validators.required, Validators.min(1)]],
    });
  }

  GetReservedItemsInitialForm() {
    debugger
    this.ReportsService.GetReservedItemsForm().subscribe((result) => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }
      this.itemsList = result.itemsList;
      this.groupsList = result.groupsList;
      this.typesList = result.typesList;
      this.branchesList = result.branchesList;
      this.storesList = result.storesList;
      this.customersList = result.customersList;
      this.showItemId = false;
      this.ReservedItemsAddForm.patchValue(result);
      const source$ = of(1, 2);
      source$.pipe(delay(0)).subscribe(value => {
        debugger
        result.fromDate = formatDate(result.fromDate, "yyyy-MM-dd", "en-US")
        result.toDate = formatDate(result.toDate, "yyyy-MM-dd", "en-US")
        this.ReservedItemsAddForm.get("fromDate").setValue(formatDate(result.fromDate, "yyyy-MM-dd", "en-US"));
        this.ReservedItemsAddForm.get("toDate").setValue(formatDate(result.toDate, "yyyy-MM-dd", "en-US"));
        // this.ReservedItemsAddForm.get("branchId").setValue(result.defaultBranchId); edit by hamza 
        this.ReservedItemsAddForm.get("branchId").setValue(0);
      });
    });
  }


  GetReport() {
    setTimeout(() => {
      debugger
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

      const formValues = this.ReservedItemsAddForm.value;

      this.egretLoader.open(this.translateService.instant('PleaseWaitProc'));
      if (this.collective == true) {
        formValues.isDetalid = 1;
      }
      else {
        formValues.isDetalid = 0;
      }
      this.ReportsService.GetReservedItems(
        formValues.isDetalid,
        formValues.fromDate,
        formValues.toDate,
        formValues.groupId,
        formValues.catId,
        formValues.itemId,
        formValues.branchId,
        formValues.storeId,
        formValues.customerId,
      ).subscribe((result) => {
        debugger

        this.voucherData = result;

        if (currentLang == "ar") {
          this.refresReserveItemsArabic(this.voucherData);
        }
        else {
          this.refreshReserveItemsEnglish(this.voucherData);
        }

        this.egretLoader.close();
      });
    });
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ReserveItems');
    this.title.setTitle(this.TitlePage);
  }

  clearFormData() {
    this.ReservedItemsAddForm.reset(); 
    this.voucherData = []; 
    this.GetReservedItemsInitialForm();
    this.collective = false;
    this.ReservedItemsAddForm.get("branchId").setValue(0);
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

  OnChange()
  {
    this.voucherData = [];
  }

  OpenItemTransactionsForm(item: number) {
    debugger
    this.routePartsService.GuidToEdit = item;
    const url = `/ItemsReservationVoucher/ItemsReservationVoucherForm?GuidToEdit=${item}&Guid2ToEdit=Show&Guid3ToEdit=true`;
    window.open(url, '_blank');
  }

  refresReserveItemsArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم المادة': x.itemNo,
        'اسم المادة': x.itemName,
        'رقم السند': x.voucherNo,
        'نوع السند': x.voucherName,
        'تاريخ السند': voucherDate,
        'المستودع': x.storeName,
        'العميل': x.customerName,
        'الوحدة': x.unitName,
        'الكمية': x.qty,
        'مدة الحجز': x.reserveDays,
      }
    });
  }

  refreshReserveItemsEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const voucherDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Material Number': x.itemNo,
        'Material Name': x.itemName,
        'Voucher Number': x.voucherNo,
        'Voucher Type': x.voucherName,
        'Voucher Date': voucherDate,
        'Store': x.storeName,
        'Client': x.customerName,
        'Unit': x.unitName,
        'Quentity': x.qty,
        'Duration Of Reservation': x.reserveDays,
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
      var head = [['مدة الحجز', ' الكمية', 'الوحدة', ' العميل', 'المستودع', 'تاريخ السند', ' نوع السند', ' رقم السند', ' اسم المادة', ' رقم المادة']]
    }
    else {
      var head = [['Duration Of Reservation', 'Quentity', 'Unit', 'Client', 'Store', 'Voucher Date', 'Voucher Type', 'Voucher Number', 'Material Name', 'Material Number']]
    }
    var rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date = new Date(part.voucherDate);
      const voucherDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.itemNo
      temp[1] = part.itemName
      temp[2] = part.voucherNo
      temp[3] = part.voucherName
      temp[4] = voucherDate
      temp[5] = part.storeName
      temp[6] = part.customerName
      temp[7] = part.unitName
      temp[8] = part.qty
      temp[9] = part.reserveDays

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

    const Title = currentLang == "ar" ? "تقرير المواد المحجوزة" : " Reserve Items Report";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, {align: 'center'});
  
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
