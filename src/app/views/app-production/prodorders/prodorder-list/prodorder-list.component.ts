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
import { ProdordersService } from '../prodorders.service';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import * as FileSaver from 'file-saver';
import { AmiriRegular } from '../../../../../assets/fonts/amiri';

@Component({
  selector: 'app-prodorder-list',
  templateUrl: './prodorder-list.component.html',
  styleUrls: ['./prodorder-list.component.scss']
})
export class ProdorderListComponent implements OnInit {
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
    private prodordersService: ProdordersService
  ) { }

  ngOnInit(): void {
    this.SetTitlePage();
    this.SetTitlePage();
    this.GetProdOrdersList();
  }

  SetTitlePage() {
    this.TitlePage = this.translateService.instant('ProdOrderList');
    this.title.setTitle(this.TitlePage);
  }

  GetProdOrdersList() {
    var currentLang = this.jwtAuth.getLang();
    const isArabic = currentLang === 'ar';
    setTimeout(() => {
      this.prodordersService.GetProdOrdersList().subscribe(result => {
        if (result.isSuccess === false || result.message === "msNoPermission") {
          this.alert.ShowAlert("msNoPermission", "error");
          return
        }
        this.tabelData = result;

        if (currentLang == "ar") {
          this.refresProdorderListArabic(this.tabelData);
        }
        else {
          this.refreshProdorderListEnglish(this.tabelData);
        }
      })
    });
  }

  AddNew(id: any) {
    this.routePartsService.GuidToEdit = id
    this.routePartsService.Guid2ToEdit = 'New';
    this.router.navigate(['ProdOrder/ProdOrderForm']);
  }

  EditProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Edit';
    this.router.navigate(['ProdOrder/ProdOrderForm']);
  }

  ShowProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Show';
    this.router.navigate(['ProdOrder/ProdOrderForm']);
  }

  CopyProdOrder(id: any) {
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Copy';
    this.router.navigate(['ProdOrder/ProdOrderForm']);
  }

  ApproveprodOrder(id: any) {
    debugger
    this.routePartsService.GuidToEdit = id;
    this.routePartsService.Guid2ToEdit = 'Approval';
    this.router.navigate(['ProdOrder/ProdOrderForm']);
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
        this.prodordersService.DeleteProdOrder(id).subscribe(result => {
          debugger
          if (result.isSuccess) {
            this.alert.DeleteSuccess();
            this.GetProdOrdersList();
          }
          else {
            this.alert.ShowAlert(result.message, 'error');
            // this.alert.DeleteFaild()
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

  refresProdorderListArabic(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('ar-EG');
      const deliveryDate = new Date(x.deliveryDate).toLocaleDateString('ar-EG');
      return {
        'رقم الامر': x.orderNo,
        ' العملاء': x.custNames,
        ' الدول': x.countries,
        'تاريخ الامر': orderDate,
        'تاريخ التسليم': deliveryDate,
        'حالة الامر': x.statusName,
      }
    });
  }

  refreshProdorderListEnglish(data) {
    debugger
    this.data = data;
    this.exportData = this.data.map(x => {
      const orderDate = new Date(x.orderDate).toLocaleDateString('en-GB');
      const deliveryDate = new Date(x.deliveryDate).toLocaleDateString('en-GB');
      return {
        'Order Number': x.orderNo,
        'Customers': x.custNames,
        'Countries': x.countries,
        'Order Date': orderDate,
        'Delivery Date': deliveryDate,
        'Ordr Status': x.statusName,
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
        this.refresProdorderListArabic(exportSource);
      } else {
        this.refreshProdorderListEnglish(exportSource);
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
       head = [[' حالة الامر', ' تاريخ التسليم', 'تاريخ الامر', ' الدول', 'العملاء', ' رقم الامر']]
    }
    else {
       head = [['Ordr Status', 'Delivery Date', 'Order Date', 'Countries', 'Customers', 'Order Number']]
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

    const Title = currentLang == "ar" ? "قائمة أوامر الإنتاج" : "Production Orders List " ;
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


  PrintProdactionOrder(Id: number) {
    debugger
    this.Lang = this.jwtAuth.getLang();
    if (this.Lang == "ar") {
      const reportUrl = `rptPrintProdactionOrderAR?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
    else {
      const reportUrl = `rptPrintProdactionOrderEN?Id=${Id}`;
      const url = this.router.serializeUrl(this.router.createUrlTree(['/report-viewer'], { queryParams: { reportUrl } }));
      window.open(url, '_blank');
    }
  }
}

