import { Component} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component'
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { ProdVoucherService } from '../productionVoucher.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-prodvoucherlist',
  templateUrl: './prodvoucherlist.component.html',
  styleUrl: './prodvoucherlist.component.scss'
})
export class ProdvoucherlistComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  showLoader: boolean;
  exportData: any[];
  exportColumns: any[];
  screenId: number = 224;
  custom: boolean;
  data: any[];
  Lang: string;
  constructor
    (
      private title: Title,
      private jwtAuth: JwtAuthService,
      private translateService: TranslateService,
      private alert: sweetalert,
      private dialog: MatDialog,
      private service: ProdVoucherService,
      private routePartsService: RoutePartsService,
      private router: Router,
    ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetProductionOrdersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProdVoucherList');
    this.title.setTitle(this.TitlePage);
  }

  GetProductionOrdersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';

    this.showLoader = true;
    setTimeout(() => {
      debugger
      this.service.GetProductionOrdersList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          this.showLoader = false;
          return;
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresPurchaserequestArabic(this.tabelData);
        }
        else {
          this.refreshPurchaserequestEnglish(this.tabelData);
        }

        this.showLoader = false;
      })
    });

  }

  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  DeleteVoucher(id: any) {
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
        this.service.DeleteProductionOrder(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.GetProductionOrdersList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenDetailsForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ProductionVoucher/ProdVoucherForm']);
  }

  AddProductionOrdersForm(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProductionVoucher/ProdVoucherForm']);
  }

  OpenProductionOrdersForm(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ProductionVoucher/ProdVoucherForm']);
  }

  AttachmentProductionvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      //height: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 53 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  formatAmount(amount: number, decimalPlaces: number = 3): string {
    return amount.toFixed(decimalPlaces);
  }

  updateFavourite(ScreenId: number) {
    this.service.UpdateFavourite(ScreenId).subscribe(result => {
      this.getFavouriteStatus(this.screenId);
    })
  }

  getFavouriteStatus(screenId) {
    this.service.GetFavouriteStatus(screenId).subscribe(result => {

      if (result) {
        this.custom = true;
      }
      else {
        this.custom = false;
      }
      debugger
    })
  }


  refresPurchaserequestArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      return {
        'رقم السند': x.orderNo,
        'تاريخ السند': orderDate,
        'المادة المنتجة': x.producedItem,
        'الوحدة': x.unitName,
        'الكمية': x.qty,
        'الحالة': x.statusName,
        'حالة الانتاج': x.prodStatusName,
      }
    });
  }

  refreshPurchaserequestEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      return {
        'Voucher No': x.orderNo,
        'Voucher Date': orderDate,
        'Producted Item': x.producedItem,
        'Unit': x.unitName,
        'Quantity': x.qty,
        'status': x.statusName,
        'Production Status': x.prodStatusName
      }
    });
  }

  exportExcel(dt: any) {
    import("xlsx").then(xlsx => {
      var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
      let exportSource: any[];

      if (dt.filteredValue && dt.filteredValue.length > 0) {
        exportSource = dt.filteredValue;
      }
      else {
        exportSource = this.data;
      }

      if (currentLang === 'ar') {
        this.refresPurchaserequestArabic(exportSource);
      } else {
        this.refreshPurchaserequestEnglish(exportSource);
      }


      const worksheet = xlsx.utils.json_to_sheet(this.exportData);
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
       head = [['حالة الانتاج', ' الحالة', 'الكمية', ' الوحدة', ' المادة المنتجة', ' تاريخ السند', ' رقم السند']]
    } else {
       head = [['Production Status', 'status','Quantity', 'Unit', 'Producted Item', ' Voucher Date', 'Voucher Number']]
    }
    const rows: (number | string)[][] = [];


    let exportSource: any[];
    if (dt.filteredValue && dt.filteredValue.length > 0) {
      exportSource = dt.filteredValue;
    }
    else {
      exportSource = this.data;
    }

    exportSource.forEach(function (part, index) {

      const date1 = new Date(part.orderDate);
      const orderDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.orderNo
      temp[1] = orderDate
      temp[2] = part.producedItem
      temp[3] = part.unitName
      temp[4] = part.qty
      temp[5] = part.statusName
      temp[6] = part.prodStatusName

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

    const Title = currentLang == "ar" ? "قائمة سندات الأنتاج" :"Production Vouchers List";
    const pageWidth = pdf.internal.pageSize.width;
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

  Printvoucher(voucherId: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptEntryVoucher?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptEntryVoucherEN?VId=${voucherId}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  ApproveProductionOrder(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('msgAreYouSureYouWantToApproveProductionOrder'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.service.ApproveProductionOrder(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.SaveSuccess();
            this.GetProductionOrdersList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", 'error');
            return;
          }
          else {
            this.alert.DeleteFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  OpenReceiptVoucherForm(voucher) {
    this.routePartsService.GuidToEdit = voucher;
    debugger
    // Construct the URL you want to navigate to
    const url = `/ProductionReceipt/ProdReceiptvoucherform?ProdId=${voucher}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  OpenOutputVoucherForm(voucher: number) {
    debugger
    this.routePartsService.GuidToEdit = voucher;

    // Construct the URL you want to navigate to
    const url = `/ProductionOutPutVoucher/Prodoutputvoucherform?ProdId=${voucher}`;

    // Open the URL in a new tab
    window.open(url, '_blank');
  }

  PrintProdvoucher(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptProdvoucherAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptProdvoucherEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }

  CloseProduction(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('AreYouSureYouWantToCloseProductionOrder'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      if (result.value) {
        this.service.CloseProductionOrder(id).subscribe((results) => {
          if (results.isSuccess == true) {
            this.alert.UpdateSuccess();
            this.GetProductionOrdersList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {
            this.alert.UpdateFaild()
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

}
