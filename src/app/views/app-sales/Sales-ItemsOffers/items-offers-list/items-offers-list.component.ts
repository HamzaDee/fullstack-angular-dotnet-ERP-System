import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { sweetalert } from 'sweetalert';
import { ReturnSalesInvoicesService } from '../../app-ReturnSalesVoucher/returnsalesinvoice.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { ItemsOffersService } from '../items-offers.service';
import { AppCommonserviceService } from 'app/views/app-commonservice.service';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-items-offers-list',
  templateUrl: './items-offers-list.component.html',
  styleUrl: './items-offers-list.component.scss'
})
export class ItemsOffersListComponent {
  public TitlePage: string;
  companyId: number;
  tabelData: any[];
  public Data: any[];
  public showLoader: boolean;
  public screenId: number = 173;
  voucherTypeEnum: number = 45;
  exportData: any[];
  exportColumns: any[];
  custom: boolean;
  lang: string;
  data: any[];
  Lang: string;


  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private dialog: MatDialog,
    private returnService: ReturnSalesInvoicesService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private itemsOffersService: ItemsOffersService,
    private readonly serv: AppCommonserviceService,
  ) { }


  ngOnInit(): void {
    this.SetTitlePage();
    this.getItemsOffersList();
    this.getFavouriteStatus(this.screenId);
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ItemsOffersList');
    this.title.setTitle(this.TitlePage);
  }

  getItemsOffersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    this.itemsOffersService.getItemsOffersList().subscribe(result => {
      debugger
      if (result.isSuccess == false && result.message === "msNoPermission") {
        this.alert.ShowAlert("msNoPermission", 'error');
        return;
      }

      this.showLoader = false;
      this.tabelData = result;
      debugger

      if (currentLang == "ar") {
        this.refresItemsOffersArabic(this.tabelData);
      }
      else {
        this.refreshItemsOffersEnglish(this.tabelData);
      }
    });
  }

  ShowDetailsOnly(id) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.routePartsService.Guid3ToEdit = true;
    this.router.navigate(['ItemsOffers/ItemsOffersForm']);
  }

  AddNewItemsOffers(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'Add';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ItemsOffers/ItemsOffersForm']);
  }

  EditItemsOffers(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ItemsOffers/ItemsOffersForm']);
  }

  CopyItemsOffers(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.routePartsService.Guid3ToEdit = false;
    this.router.navigate(['ItemsOffers/ItemsOffersForm']);
  }

  DeleteItemsOffers(id: any) {
    Swal.fire({
      title: this.translateService.instant('AreYouSure?'),
      text: this.translateService.instant('YouWontBeAbleToRevertThis!'),
      icon: 'warning',
      confirmButtonColor: '#dc3741',
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Yes,deleteit!'),
      cancelButtonText: this.translateService.instant('Close'),
    }).then((result) => {
      debugger
      if (result.value) {
        this.itemsOffersService.DeleteItemsOffers(id).subscribe((results) => {
          debugger
          if (results.isSuccess == true) {
            this.alert.DeleteSuccess();
            this.getItemsOffersList();
          }
          else if (results.isSuccess == false && results.message === "msNoPermission") {
            {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
          }
          else {

            this.alert.DeleteFaild();
          }
        });
      }
      else if (result.dismiss === Swal.DismissReason.cancel) {
      }
    })
  }

  PrintItemsOffers(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptItemsOffersAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptItemsOffersEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
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

  refresItemsOffersArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const FromDate = new Date(x.fromDate).toLocaleDateString('en-EG');
      const ToDate = new Date(x.toDate).toLocaleDateString('en-EG');
      return {
        'رقم العرض': x.id,
        'اسم العرض': x.offerName,
        'الأولوية': x.priority,
        'من تاريخ': FromDate,
        ' الى تاريخ': ToDate,
        'الفرع': x.branchName,
        'ملاحظه': x.note,
        'نشط': x.active,
      }
    });
  }

  refreshItemsOffersEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const FromDate = new Date(x.fromDate).toLocaleDateString('en-EG');
      const ToDate = new Date(x.toDate).toLocaleDateString('en-EG');
      return {
        'Offer Number': x.id,
        'Offer Name': x.offerName,
        'Priority': x.priority,
        'From Date': FromDate,
        'To Date': ToDate,
        'Branch': x.branchName,
        'Note': x.note,
        'Active': x.active,
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
       head = [['نشط', 'ملاحظه', 'الفرع', ' الى  تاريخ', 'من تاريخ', 'الأولوية', ' اسم العرض', 'رقم العرض']]
    }
    else {
       head = [['Active', 'Note', 'Branch', 'To Date', 'From Date', 'Priority', 'Offer Name', 'Offer Number']]
    }

    const rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date2 = new Date(part.fromDate);
      const FromDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;


      const date3 = new Date(part.toDate);
      const ToDate = currentLang === 'ar'
        ? `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`
        : `${date3.getDate().toString().padStart(2, '0')}/${(date3.getMonth() + 1).toString().padStart(2, '0')}/${date3.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.id
      temp[1] = part.offerName
      temp[2] = part.priority
      temp[3] = FromDate
      temp[4] = ToDate
      temp[5] = part.branchName
      temp[6] = part.note
      temp[7] = part.active
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

    const Title = currentLang == "ar" ? "قائمة عروض المواد" : "Items Offers List" ;
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
}
