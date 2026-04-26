import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';
import { PriceOffersService } from '../PriceOffers.Service';
import { PriceOffersAdvancedSearchComponent } from '../price-offers-advanced-search/price-offers-advanced-search.component';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';

@Component({
  selector: 'app-price-offers-list',
  templateUrl: './price-offers-list.component.html',
  styleUrl: './price-offers-list.component.scss'
})
export class PriceOffersListComponent implements OnInit {

  @ViewChild(PriceOffersAdvancedSearchComponent) childSearch: PriceOffersAdvancedSearchComponent;

  public showLoader: boolean;
  public QuotationList: any[] = [];
  public exportData: any[] = [];

  screenId: number = 294;
  custom: boolean;
  hidden: boolean = false;

  public TitlePage: string;
  lang: string;

  vTypeList: any[] = [];
  vStatusList: any[] = [];
  vBranchList: any[] = [];
  vEmployeeList: any[] = [];
  vDealerList: any[] = [];
  vfromDate: Date = new Date();
  vtoDate: Date = new Date();

  constructor(
    private readonly title: Title,
    private readonly jwtAuth: JwtAuthService,
    private readonly translateService: TranslateService,
    private readonly dialog: MatDialog,
    private readonly alert: sweetalert,
    private readonly priceOffersService: PriceOffersService,
    private readonly router: Router,
    private readonly routePartsService: RoutePartsService,
    private readonly serv: AppCommonserviceService,
    private readonly appEntryvouchersService: AppEntryvouchersService,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetQuotationsList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ListOfPriceOffers');
    this.title.setTitle(this.TitlePage);
  }

  GetQuotationsList() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;

    setTimeout(() => {
      this.priceOffersService.GetQuotationsList().subscribe((result: any) => {
        if (result?.isSuccess == false && result?.message == "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }

        this.QuotationList = result || [];

        if (this.QuotationList.length > 0 && this.QuotationList[0]?.search) {
          const search = this.QuotationList[0].search;

          this.vTypeList = search.voucherTypeList || [];
          this.vBranchList = search.branchesList || [];
          this.vStatusList = search.statusList || [];
          this.vEmployeeList = search.salesMenList || [];
          this.vDealerList = search.dealersList || [];

          this.vfromDate = search.dateFrom ? new Date(search.dateFrom) : new Date();
          this.vtoDate = search.dateTo ? new Date(search.dateTo) : new Date();
        }

        if (currentLang == "ar") this.refreshQuotationListArabic(this.QuotationList);
        else this.refreshQuotationListEnglish(this.QuotationList);

        this.showLoader = false;

        if (this.childSearch) {
          this.childSearch.vTypeList = this.vTypeList;
          this.childSearch.vStatusList = this.vStatusList;
          this.childSearch.vBranchList = this.vBranchList;
          this.childSearch.vEmployeeList = this.vEmployeeList;
          this.childSearch.vDealerList = this.vDealerList;
          this.childSearch.vfromDate = this.vfromDate;
          this.childSearch.vtoDate = this.vtoDate;
          this.childSearch.GetSearchFormValues();
        }
      });
    });
  }

  handleSearchResult(result: any) {
    this.QuotationList = result || [];

    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") this.refreshQuotationListArabic(this.QuotationList);
    else this.refreshQuotationListEnglish(this.QuotationList);
  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['Quotations/PriceoffersForm']);
  }

  AddQuotationForm(id: any = 0) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Quotations/PriceoffersForm']);
  }

  EditQuotationForm(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Quotations/PriceoffersForm']);
  }

  CopyQuotation(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['Quotations/PriceoffersForm']);
  }

  DeleteQuotation(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.priceOffersService.DeleteQuotation(id).subscribe((res: any) => {
          if (res === true || res?.isSuccess === true) {
            this.alert.DeleteSuccess();
            this.GetQuotationsList();
          } else {
            if (res?.isSuccess == false && res?.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            this.alert.DeleteFaild();
          }
        });
      }
    });
  }

  updateFavourite(ScreenId: number) {
    this.serv.UpdateFavourite(ScreenId).subscribe(result => {
      if (result.isSuccess) {
        this.getFavouriteStatus(this.screenId);
        this.serv.triggerFavouriteRefresh();
      } else {
        this.alert.ShowAlert(result.message, 'error');
      }
    });
  }

  getFavouriteStatus(screenId) {
    this.serv.GetFavouriteStatus(screenId).subscribe(result => {
      this.custom = !!result.isSuccess;
    });
  }

  refreshQuotationListArabic(data: any[]) {
    this.QuotationList = data || [];
    this.exportData = this.QuotationList.map((x) => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'نوع السند': x.voucherTypeName,
        'رقم السند': x.voucherNo,
        'تاريخ السند': formattedDate,
        'العميل': x.dealerName,
        'المندوب': x.salesManName,
        'الفرع': x.branchName,
        'العملة': x.currencyName,
        'سعر الصرف': x.currRate,
        'المجموع': x.amount,
        'ملاحظات': x.note,
        'الحالة': x.statusName,
      }
    });
  }

  refreshQuotationListEnglish(data: any[]) {
    this.QuotationList = data || [];
    this.exportData = this.QuotationList.map((x) => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Voucher Type': x.voucherTypeName,
        'Voucher No': x.voucherNo,
        'Voucher Date': formattedDate,
        'Customer': x.dealerName,
        'Sales Employee': x.salesManName,
        'Branch': x.branchName,
        'Currency': x.currencyName,
        'Rate': x.currRate,
        'Amount': x.amount,
        'Note': x.note,
        'Status': x.statusName,
      }
    });
  }

  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "ListOfPriceOffers");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  exportPdf() {
    const currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    let head: string[][];

    if (currentLang == "ar") {
      head = [['الحالة', 'ملاحظات', 'المجموع', 'سعر الصرف', 'العملة', 'الفرع', 'المندوب', 'العميل', 'تاريخ السند', 'رقم السند', 'نوع السند']];
    } else {
      head = [['Status', 'Notes', 'Amount', 'Rate', 'Currency', 'Branch', 'Sales Employee', 'Customer', 'Voucher Date', 'Voucher No', 'Voucher Type']];
    }

    const rows: (number | string)[][] = [];

    this.QuotationList.forEach((x) => {
      const date = new Date(x.voucherDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = x.voucherTypeName;
      temp[1] = x.voucherNo;
      temp[2] = formattedDate;
      temp[3] = x.dealerName;
      temp[4] = x.salesManName;
      temp[5] = x.branchName;
      temp[6] = x.currencyName;
      temp[7] = x.currRate;
      temp[8] = x.amount;
      temp[9] = x.note;
      temp[10] = x.statusName;

      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const pdf = new jsPDF('l', 'pt', 'a4');
    pdf.addFileToVFS('Amiri-Regular.ttf', AmiriRegular);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.setFont('Amiri');
    pdf.setFontSize(14);

    const Title = currentLang == "ar" ? "قائمة عروض الأسعار" : "Sales Quotations List";
    const pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 18, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
      headStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold', textColor: "black", lineWidth: 0.2, minCellWidth: 20 },
      bodyStyles: { font: "Amiri", halign: isArabic ? 'right' : 'left', fontSize: 8, fontStyle: 'bold' },
      theme: "grid",
    });

    pdf.output('dataurlnewwindow');
  }

  PrintQuotation(id: number) {
    
    this.lang = this.jwtAuth.getLang();
    if (this.lang == "ar") {
      const reportUrl = `RptQuotationsAR?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptQuotationEn?Id=${id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  CalculateTotal() {
    
    if (this.QuotationList) {
      return this.formatCurrency(this.QuotationList.reduce((sum, item) => {
        return sum + item.amount;
      }, 0), 3);
    }
  }

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }

  ConvertToSaleInvoice(id: number) {
    debugger
    this.routePartsService.GuidToEdit = id;
    const url = `/SalesInvoices/SalesInvoicesForm?PriceOffersId=${id}`;
    window.open(url, '_blank');
  }

}