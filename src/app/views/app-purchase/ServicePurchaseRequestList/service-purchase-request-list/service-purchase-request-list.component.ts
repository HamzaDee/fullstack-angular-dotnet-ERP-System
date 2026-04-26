import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ServicePurchaseRequestListService } from '../service-purchase-request-list.service';
import Swal from 'sweetalert2';
import { AppEntryvouchersService } from 'app/views/app-account/app-entryvouchers/app-entryvouchers.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { ServicePurchaseSearchComponent } from 'app/views/general/app-searchs/service-purchase-search/service-purchase-search.component';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';

@Component({
  selector: 'app-service-purchase-request-list',
  templateUrl: './service-purchase-request-list.component.html',
  styleUrl: './service-purchase-request-list.component.scss'
})
export class ServicePurchaseRequestListComponent {
  @ViewChild(ServicePurchaseSearchComponent) childSearch: ServicePurchaseSearchComponent;
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 257;
  custom: boolean;
  data: any[];
  Lang: string;
  voucherTypeEnum = 232;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private routePartsService: RoutePartsService,
      private router: Router,
      private servicePurchaseRequestListService: ServicePurchaseRequestListService,
      private appEntryvouchersService: AppEntryvouchersService,
      private readonly serv: AppCommonserviceService,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetServicePurchaseRequestList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ServicePurchaseRequestList');
    this.title.setTitle(this.TitlePage);
  }

  GetServicePurchaseRequestList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.servicePurchaseRequestListService.GetServicePurchaseRequestList().subscribe(result => {
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refreshPurchaseInvoiceArabic(this.tabelData);
        }
        else {
          this.refreshPurchaseInvoiceEnglish(this.tabelData);
        }

        this.tabelData.forEach(element => {
          if (element.amount == null) {
            element.amount = 0;
          }

        });
        this.showLoader = false;
        debugger
        if (result.length > 0) {
          if (this.childSearch) {
            this.childSearch.vTypeList = result[0].searchCriteriaModel.voucherTypeList2;
            this.childSearch.vSuppliersList = result[0].searchCriteriaModel.suppliersList;
            this.childSearch.vBranchesList = result[0].searchCriteriaModel.companyBranchModels;
            this.childSearch.vStatusList = result[0].searchCriteriaModel.statusList;
            this.childSearch.ngOnInit();
          }
        }
      })
    });
    debugger
    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        this.tabelData = result;
      });
    }
  }

  ShowDetailsOnly(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestForm']);
  }

  AddNewServicePurchaseRequest(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestForm']);
  }

  EditServicePurchaseRequest(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ServicePurchaseRequestList/ServicePurchaseRequestForm']);
  }

  TransferToService(voucher: number) {
    this.routePartsService.GuidToEdit = voucher;
    debugger
    // Construct the URL you want to navigate to
    const url = `/ServicesInv/ServiceInvoiceForm?voucher=${voucher}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  DeleteServicePurchaseRequest(Id, voucherTypeId, voucherNo) {
    debugger
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
        this.servicePurchaseRequestListService.DeletePurchaseRequestList(Id, voucherTypeId, voucherNo).subscribe((results) => {
          debugger
          if (results.isSuccess === true) {
            this.alert.DeleteSuccess();
            this.GetServicePurchaseRequestList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.ShowAlert(results.message, 'error');
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  AttachmentServicePurchaseRequest(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 51 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  PrintServicePurchaseRequest(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptServicePurchaseRequestAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptServicePurchaseRequestEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
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

  refreshPurchaseInvoiceArabic(data) {
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('ar-EG');
      return {
        'رقم الطلب': x.voucherNo,
        'نوع الطلب': x.voucherName,
        'تاريخ الطلب': formattedDate,
        'المورد': x.dealerName,
        'الفرع': x.branchName,
        'طالب  الطلب': x.requestedBy,
        'الحالة': x.statusName,
      }
    });
  }

  refreshPurchaseInvoiceEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const formattedDate = new Date(x.voucherDate).toLocaleDateString('en-GB');
      return {
        'Order Number': x.voucherNo,
        'Order Type': x.voucherName,
        'Order Date': formattedDate,
        'Supplier': x.dealerName,
        'Branch': x.branchName,
        'Requestor': x.requestedBy,
        'Status': x.statusName,
      }
    });
  }

  exportExcel() {
    debugger
    import("xlsx").then(xlsx => {
      debugger;

      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
      const filteredData = this.data.filter(r => r.status != 67);
      const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      //const totalAmount = this.data.reduce((sum, item) => sum + parseFloat(item.amount) * item.currRate, 0);
      const totalValue = totalAmount.toFixed(2);

      const headers = Object.keys(this.exportData[0]);
      const isArabic = headers.some(h => [...h].some(ch => ch >= '\u0600' && ch <= '\u06FF'));

      const totalHeaderArabic = 'المجموع';
      const totalHeaderEnglish = 'Total';
      const totalHeader = isArabic ? totalHeaderArabic : totalHeaderEnglish;
      const totalLabel = isArabic ? 'المجموع' : 'Total';

      const totalColIndex = headers.indexOf(totalHeader);

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

      const totalColLetter = getExcelColumnLetter(totalColIndex);

      const lastRow = Object.keys(worksheet)
        .filter(key => /^[A-Z]+\d+$/.test(key))
        .map(key => parseInt(key.match(/\d+/)![0]))
        .reduce((a, b) => Math.max(a, b), 0) + 1;

      const valueCell = totalColLetter + lastRow;
      worksheet[valueCell] = { t: 'n', v: totalValue, z: '0.000' };

      if (totalColIndex > 0) {
        const labelColLetter = getExcelColumnLetter(totalColIndex - 1);
        const labelCell = labelColLetter + lastRow;
        worksheet[labelCell] = { t: 's', v: totalLabel };
      }

      const range = xlsx.utils.decode_range(worksheet['!ref']!);
      range.e.r = lastRow - 1;
      worksheet['!ref'] = xlsx.utils.encode_range(range);

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
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    if (currentLang == "ar") {
      var head = [['الحالة', 'طالب  الطلب', 'الفرع', 'المورد', 'تاريخ الطلب', 'نوع الطلب', 'رقم الطلب']]
    }
    else {
      var head = [['Status', 'Requestor', 'Branch', 'Supplier', ' Order Date', 'Order Type', 'Order Number']]
    }

    var rows: (number | string)[][] = [];
    this.data.forEach((part) => {

      const date = new Date(part.voucherDate);
      const formattedDate = currentLang === 'ar'
        ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
        : `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.voucherNo
      temp[1] = part.voucherName
      temp[2] = formattedDate
      temp[3] = part.dealerName
      temp[4] = part.branchName
      temp[5] = part.requestedBy
      temp[6] = part.statusName
      if (isArabic) {
        temp.reverse();
      }
      rows.push(temp);
    });

    const pdf = new jsPDF('l', null, 'a4', true);
    pdf.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    pdf.setFont("Amiri");
    pdf.setFontSize(14);

    let Title = currentLang == "ar" ? "قائمة طلبات شراء خدمات" : "Service Purchase Request List";
    let pageWidth = pdf.internal.pageSize.width;
    pdf.text(Title, pageWidth / 2, 8, { align: 'center' });

    autoTable(pdf as any, {
      head: head,
      body: rows,
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

  formatCurrency(value: number, decimalPlaces: number): string {
    return this.appEntryvouchersService.formatCurrency(value, decimalPlaces);
  }
}
