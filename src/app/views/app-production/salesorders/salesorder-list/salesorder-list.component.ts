import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { sweetalert } from 'sweetalert';
import { JwtAuthService } from 'app/shared/services/auth/jwt-auth.service';
import Swal from 'sweetalert2';
import { RoutePartsService } from 'app/shared/services/route-parts.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { SalesordersService } from '../salesorders.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { SalesorderSheetComponent } from '../salesorder-sheet/salesorder-sheet.component';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppGeneralAttachmentListComponent } from 'app/views/general/app-general-attachment-list/app-general-attachment-list.component';
import { SalesOrderSearchComponent } from 'app/views/general/app-searchs/SalesOrder-Search/sales-order-search/sales-order-search.component';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  providers: [DatePipe, SalesorderSheetComponent],
  selector: 'app-salesorder-list',
  templateUrl: './salesorder-list.component.html',
  styleUrls: ['./salesorder-list.component.scss']
})
export class SalesorderListComponent implements OnInit {
  tabelData: any[];
  SalesOrderstatusList: any[];
  public TitlePage: string;
  data: any[];
  exportData: any[];
  Lang: string;
  @ViewChild(SalesOrderSearchComponent) childSearch: SalesOrderSearchComponent;
  showLoader: boolean;

  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private egretLoader: AppLoaderService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private http: HttpClient,
    private salesordersService: SalesordersService,
    private salesorderSheetComponent: SalesorderSheetComponent,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetSalesOrdersList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('SalesOrderList');
    this.title.setTitle(this.TitlePage);
  }

  GetSalesOrdersList() {
    debugger
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    this.showLoader = true;
    setTimeout(() => {
      this.salesordersService.GetSalesOrdersList().subscribe(result => {
        debugger
        if (result.isSuccess == false && result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", 'error');
          return;
        }
        this.showLoader = false;
        this.tabelData = result;
        if (result.length > 0) {
          if (this.childSearch) {
            const currentDate = new Date();
            this.childSearch.VvorderTypeList = result[0].salesOrderAdvancedSearchModel.voucherTypeList;
            this.childSearch.vcustomersList = result[0].salesOrderAdvancedSearchModel.customersList;
            this.childSearch.vcountryList = result[0].salesOrderAdvancedSearchModel.countryList;
            this.childSearch.vfromDate = currentDate;
            this.childSearch.vtoDate = currentDate;
            this.childSearch.ngOnInit();
          }
        }

        if (currentLang == "ar") {
          this.refresSalesorderListArabic(this.tabelData);
        }
        else {
          this.refreshSalesorderListEnglish(this.tabelData);
        }
      });
    });

    if (this.childSearch) {
      this.childSearch.searchResultEvent.subscribe(result => {
        debugger
        this.tabelData = result;
      });
    }
  }


  handleSearchResult(result: any) {
    debugger
    this.tabelData = result;
  }

  AddNew(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'New';
    this.router.navigate(['SalesOrder/SalesOrderForm']);
  }

  EditSalesOrder(id: any, Status: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.routePartsService.Guid3ToEdit = Status;
    this.router.navigate(['SalesOrder/SalesOrderForm']);
  }

  ShowSalesOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['SalesOrder/SalesOrderForm']);
  }

  CopySalesOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['SalesOrder/SalesOrderForm']);
  }

  ApproveSalesOrder(id: any, Status: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Approval';
    this.routePartsService.Guid3ToEdit = Status;
    this.router.navigate(['SalesOrder/SalesOrderForm']);
  }

  DeleteSalesOrder(id: any) {
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
        this.salesordersService.DeleteSalesOrder(id).subscribe((results) => {
          if (results) {
            if (results.isSuccess == false && results.message == "msNoPermission") {
              this.alert.ShowAlert("msNoPermission", 'error');
              return;
            }
            this.alert.DeleteSuccess();
            this.GetSalesOrdersList();
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

  AttachmentEntryvoucher(id: any) {
    this.routePartsService.GuidToEdit = id;
    debugger
    let title = this.translateService.instant('VoucherAttachments');
    let dialogRef: MatDialogRef<any> = this.dialog.open(AppGeneralAttachmentListComponent, {
      width: '720px',
      disableClose: false,
      direction: (this.jwtAuth.getLang() == "ar") ? 'rtl' : 'ltr',
      data: { voucherId: id, typeId: 34 }
    });
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res !== null) {
          debugger
          return;
        }
      })
  }

  OnSaveAll() {
    setTimeout(() => {
      this.egretLoader.open(this.translateService.instant('PleaseWait'));
      this.SaveAll().subscribe(result => {
        if (result) {
          this.alert.SaveSuccess();
        };
        this.egretLoader.close()
      })
    });
  }

  SaveAll(): Observable<any> {
    debugger
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<any>(`${environment.apiURL_Main + '/api/SalesOrders/SaveAllProdItemQty/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, this.tabelData, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresSalesorderListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const sdate = new Date(x.sdate).toLocaleDateString('ar-EG');
      const deliveryDate = new Date(x.deliveryDate).toLocaleDateString('ar-EG');
      return {
        'رقم الطلب': x.sales_No,
        'تاريخ الطلب': sdate,
        'الوكيل': x.customerName,
        'الدولة': x.countryName,
        'مدير السوق': x.marketManagerName,
        'تاريخ التسليم': deliveryDate,
        'حالة الطلب': x.statusName,
        'نسبة الانجاز': x.percentage,
      }
    });
  }

  refreshSalesorderListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const sdate = new Date(x.sdate).toLocaleDateString('en-EG');
      const deliveryDate = new Date(x.deliveryDate).toLocaleDateString('en-EG');
      return {
        'Order Number': x.sales_No,
        'Order Date': sdate,
        'Agent': x.customerName,
        'Country': x.countryName,
        'Market Manager': x.marketManagerName,
        'Delivery Date': deliveryDate,
        'Order Status': x.statusName,
        'Completion percentage': x.percentage,
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
       head = [['نسبة الانجاز', ' حالة الطلب', 'تاريخ التسليم', ' مدير السوق', ' الدولة', ' الوكيل', ' تاريخ الطلب', ' رقم الطلب']]
    }
    else {
       head = [['Completion percentage', 'Order Status', 'Delivery Date', 'Market Manager', 'Country', 'Agent', 'Order Date', 'Order Number']]
    }
    var rows: (number | string)[][] = [];
    this.data.forEach(function (part, index) {

      const date1 = new Date(part.sdate);
      const sdate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;

      const date2 = new Date(part.deliveryDate);
      const deliveryDate = currentLang === 'ar'
        ? `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`
        : `${date2.getDate().toString().padStart(2, '0')}/${(date2.getMonth() + 1).toString().padStart(2, '0')}/${date2.getFullYear()}`;

      let temp: (number | string)[] = [];
      temp[0] = part.sales_No
      temp[1] = sdate
      temp[2] = part.customerName
      temp[3] = part.countryName
      temp[4] = part.marketManagerName
      temp[5] = deliveryDate
      temp[6] = part.statusName
      temp[7] = part.percentage

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

    const Title = currentLang == "ar" ?"قائمة طلبات البيع":"Sales Order List ";
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

  /*   Print(id){
      debugger
      this.salesorderSheetComponent.Print(id);
      } */

  Print(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `RptSalesOrderAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptSalesOrderEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}

