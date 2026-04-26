import { Component, OnInit } from '@angular/core';
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
import { ManordersService } from '../manorders.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-manorder-list',
  templateUrl: './manorder-list.component.html',
  styleUrls: ['./manorder-list.component.scss']
})
export class ManorderListComponent implements OnInit {
  tabelData: any[];
  ProdOrderstatusList: any[];
  public TitlePage: string;
  data: any[];
  exportData: any[];
  Lang: string;
  constructor(
    private title: Title,
    private jwtAuth: JwtAuthService,
    private translateService: TranslateService,
    private alert: sweetalert,
    private egretLoader: AppLoaderService,
    private routePartsService: RoutePartsService,
    private router: Router,
    private http: HttpClient,
    private manordersService: ManordersService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.GetManOrdersList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ManOrderList');
    this.title.setTitle(this.TitlePage);
  }

  GetManOrdersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.manordersService.GetManOrdersList().subscribe(result => {
        if (result.isSuccess === false || result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", "error");
          return
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresManorderListArabic(this.tabelData);
        }
        else {
          this.refreshManorderListEnglish(this.tabelData);
        }

      })
    });
  }

  AddNew(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'New';
    this.router.navigate(['ManOrder/ManOrderForm']);
  }

  EditProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['ManOrder/ManOrderForm']);
  }

  ShowprodOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['ManOrder/ManOrderForm']);
  }

  CopyProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['ManOrder/ManOrderForm']);
  }

  ApproveProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Approval';
    this.router.navigate(['ManOrder/ManOrderForm']);
  }

  DeleteProdOrder(id: any) {
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
        this.manordersService.DeleteManOrder(id).subscribe((results) => {
          if (results.isSuccess === false || results.message === "msNoPermission") {
            this.alert.ShowAlert("msNoPermission", "error");
            return
          }
          if (results) {
            this.alert.DeleteSuccess();
            this.GetManOrdersList();
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
    return this.http.post<any>(`${environment.apiURL_Main + '/api/ProdOrders/SaveAllProdItemQty/'
      + this.jwtAuth.getLang() + '/' + this.jwtAuth.getCompanyId() + '/' + this.jwtAuth.getUserId()} `, this.tabelData, httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  handleError(handleError: any): any {
    throw new Error('Method not implemented.');
  }

  refresManorderListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      const deliveryDate = new Date(x.deliveryDate).toLocaleDateString('ar-EG');
      return {
        'رقم الامر': x.orderNo,
        'العملاء': x.custNames,
        'الدول': x.countries,
        'تاريخ الامر': orderDate,
        'تاريخ التسليم': deliveryDate,
        'حالة الامر': x.statusName,
      }
    });
  }

  refreshManorderListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('en-GB');
      const deliveryDate = new Date(x.deliveryDate).toLocaleDateString('en-GB');
      return {
        'Order Number': x.orderNo,
        'Cutomers ': x.custNames,
        'Countries ': x.countries,
        'Order Date': orderDate,
        'Delivery Date ': deliveryDate,
        'Order Status': x.statusName,
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
        this.refresManorderListArabic(exportSource);
      } else {
        this.refreshManorderListEnglish(exportSource);
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
       head = [['حالة الامر ', 'تاريخ التسليم ', 'تاريخ الامر ', 'الدول', 'العملاء', 'رقم الامر']]
    }
    else {
       head = [['Order Status', 'Delivery Date', 'Order Date', 'Countries', 'Cutomers', 'Order Number']]
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

      const date2 = new Date(part.deliveryDate);
      const deliveryDate = currentLang === 'ar'
        ? `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`
        : `${date1.getDate().toString().padStart(2, '0')}/${(date1.getMonth() + 1).toString().padStart(2, '0')}/${date1.getFullYear()}`;


      let temp: (number | string)[] = [];
      temp[0] = part.orderNo
      temp[1] = part.custNames
      temp[2] = part.countries
      temp[3] = orderDate
      temp[4] = deliveryDate
      temp[5] = part.statusName

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

    const Title = currentLang == "ar" ? "قائمة أوامر التصنيع"  : "Manufacturing Orders List";   
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


  PrintProdOrder(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptProdOrderAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `RptProdOrderEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}


